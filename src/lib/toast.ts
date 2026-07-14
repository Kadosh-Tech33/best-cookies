/* ============================================================================
   BESTIES — Toast notifications (vanilla, ~1kb, sem dependências)
   - Cria o próprio container e injeta o CSS na 1ª chamada.
   - Auto-dismiss com fade após `duration` (padrão 3s).
   - Dedupe por mensagem: cliques repetidos resetam o timer e mostram ×N
     (não poluem a tela). Pilha limitada a 3 toasts distintos.
   - Ação opcional (ex.: "Ver carrinho").
   - Respeita prefers-reduced-motion.
   ============================================================================ */

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  variant?: 'grape' | 'butter';
  action?: ToastAction;
}

const DEFAULT_DURATION = 3000;
const MAX_STACK = 3;

interface ActiveToast {
  el: HTMLElement;
  timer: number;
  count: number;
  countEl: HTMLElement;
}

const active = new Map<string, ActiveToast>();
let container: HTMLElement | null = null;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function injectStyles(): void {
  if (document.getElementById('besties-toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'besties-toast-styles';
  style.textContent = `
    .toast-container {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: var(--z-toast, 1000);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 0.9rem 0.7rem 1.1rem;
      border-radius: var(--radius-pill, 999px);
      font-family: var(--font-body, sans-serif);
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: var(--shadow-lg, 0 20px 48px -12px rgba(45,3,53,.26));
      pointer-events: auto;
      opacity: 0;
      transform: translateY(14px) scale(0.96);
      transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .toast.is-in { opacity: 1; transform: none; }
    .toast.is-out { opacity: 0; transform: translateY(8px) scale(0.98); }
    .toast--grape {
      background: rgb(var(--besties-grape-500-rgb, 126 0 144));
      color: rgb(var(--besties-cream-50-rgb, 255 247 236));
      border: 2px solid rgb(var(--besties-butter-400-rgb, 250 193 0));
    }
    .toast--butter {
      background: rgb(var(--besties-butter-400-rgb, 250 193 0));
      color: rgb(var(--besties-grape-900-rgb, 45 3 53));
      border: 2px solid rgb(var(--besties-caramel-500-rgb, 255 106 0));
    }
    .toast__count { font-size: 0.8em; opacity: 0.75; min-width: 0; }
    .toast__action {
      pointer-events: auto;
      border: none;
      background: rgb(255 255 255 / 0.16);
      color: inherit;
      font: inherit;
      font-size: 0.82em;
      font-weight: 700;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.25s ease;
    }
    .toast--butter .toast__action { background: rgb(45 3 53 / 0.12); }
    .toast__action:hover { background: rgb(255 255 255 / 0.3); }
    .toast--butter .toast__action:hover { background: rgb(45 3 53 / 0.2); }
    .toast.is-pulse { animation: toast-pulse 0.32s ease; }
    @keyframes toast-pulse {
      0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }
    }
    @media (max-width: 520px) {
      .toast-container { left: 1rem; right: 1rem; bottom: 1rem; }
      .toast { justify-content: space-between; }
    }
    @media (prefers-reduced-motion: reduce) {
      .toast, .toast.is-in, .toast.is-out { transition: opacity 0.3s ease; transform: none; }
      .toast.is-pulse { animation: none; }
    }
  `;
  document.head.appendChild(style);
}

function ensureContainer(): HTMLElement {
  if (container && document.body.contains(container)) return container;
  injectStyles();
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

function dismiss(key: string): void {
  const item = active.get(key);
  if (!item) return;
  clearTimeout(item.timer);
  item.el.classList.remove('is-in');
  item.el.classList.add('is-out');
  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    item.el.remove();
    active.delete(key);
  };
  item.el.addEventListener('transitionend', remove, { once: true });
  window.setTimeout(remove, 450); // fallback
}

export function showToast(message: string, opts: ToastOptions = {}): void {
  const duration = opts.duration ?? DEFAULT_DURATION;
  const variant = opts.variant ?? 'grape';
  const key = `${variant}:${message}`;

  // Já existe um toast igual? Reseta o timer e incrementa o contador.
  const existing = active.get(key);
  if (existing) {
    existing.count += 1;
    existing.countEl.textContent = `×${existing.count}`;
    clearTimeout(existing.timer);
    existing.timer = window.setTimeout(() => dismiss(key), duration);
    existing.el.classList.remove('is-pulse');
    void existing.el.offsetWidth; // reflow → reinicia a animação
    existing.el.classList.add('is-pulse');
    return;
  }

  const root = ensureContainer();

  const el = document.createElement('div');
  el.className = `toast toast--${variant}`;
  el.innerHTML =
    `<span class="toast__msg">${esc(message)}</span>` +
    `<span class="toast__count"></span>` +
    (opts.action ? `<button type="button" class="toast__action">${esc(opts.action.label)}</button>` : '');

  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));

  if (opts.action) {
    el.querySelector<HTMLButtonElement>('.toast__action')?.addEventListener('click', () => {
      opts.action!.onClick();
      dismiss(key);
    });
  }

  const timer = window.setTimeout(() => dismiss(key), duration);
  const countEl = el.querySelector<HTMLElement>('.toast__count')!;
  active.set(key, { el, timer, count: 1, countEl });

  // Limita a pilha: remove o mais antigo.
  if (active.size > MAX_STACK) {
    const oldest = active.keys().next().value as string;
    dismiss(oldest);
  }
}