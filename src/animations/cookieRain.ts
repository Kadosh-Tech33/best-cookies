/* ============================================================================
   BESTIES — Splash "chuva de cookies" (Canvas 2D puro, sem libs)
   - Roda 1x por sessão (sessionStorage) — ?splash na URL força de novo
   - Pulável (clique/tecla/scroll/toque) COM período de graça anti-skip acidental
   - Respeita prefers-reduced-motion (revela sem flash)
   - Overlay começa oculto (display:none) e só é ativado se for animar
   - Emite 'splash:done' e marca <html class="splash-done"> em TODOS os caminhos
   ============================================================================ */

const SESSION_KEY = 'besties_splash_seen';
const IMPACT_MS = 3000;   // ~3s de impacto (chuva de cookies) antes de revelar
const FADE_MS = 750;      // fallback caso 'transitionend' não dispare (CSS = 0.6s)
const SKIP_GRACE_MS = 350; // ignora "pular" nos primeiros ms (anti evento residual)

const COOKIE_BODY = '#E0A75B';
const COOKIE_EDGE = '#B77B33';
const CHIP = '#3B2314';
const BRAND_CONFETTI = ['#FAC100', '#FF6A00', '#7E0090', '#FBD13B'];

type Kind = 'cookie' | 'chunk' | 'confetti';

interface Particle {
  x: number; y: number; size: number;
  vx: number; vy: number; rot: number; vr: number;
  kind: Kind; color: string;
  chips: Array<{ dx: number; dy: number; r: number }>;
  wobble: number; wobbleSpeed: number;
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const vw = () => Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 1);
const vh = () => Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, 1);

function makeParticle(w: number, h: number, scale: number): Particle {
  const roll = Math.random();
  const kind: Kind = roll < 0.55 ? 'cookie' : roll < 0.8 ? 'chunk' : 'confetti';
  const size =
    kind === 'cookie' ? rand(26, 52) * scale
    : kind === 'chunk' ? rand(12, 22) * scale
    : rand(6, 11) * scale;

  const chips: Array<{ dx: number; dy: number; r: number }> = [];
  if (kind === 'cookie') {
    const n = Math.round(rand(4, 7));
    for (let i = 0; i < n; i++) chips.push({ dx: rand(-0.55, 0.55), dy: rand(-0.55, 0.55), r: rand(0.08, 0.16) });
  }

  return {
    x: rand(0, w), y: rand(-h * 1.1, -size), size,
    vx: rand(-0.6, 0.6) * scale, vy: rand(5.5, 11) * scale,
    rot: rand(0, Math.PI * 2), vr: rand(-0.12, 0.12), kind,
    color: kind === 'confetti' ? BRAND_CONFETTI[Math.floor(rand(0, BRAND_CONFETTI.length))] : COOKIE_BODY,
    chips, wobble: rand(0, Math.PI * 2), wobbleSpeed: rand(0.02, 0.06),
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);

  if (p.kind === 'cookie') {
    const r = p.size / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = COOKIE_BODY;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, r * 0.12);
    ctx.strokeStyle = COOKIE_EDGE;
    ctx.stroke();
    ctx.fillStyle = CHIP;
    for (const c of p.chips) {
      ctx.beginPath();
      ctx.arc(c.dx * r, c.dy * r, c.r * r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
  } else if (p.kind === 'chunk') {
    const s = p.size, rr = s * 0.22;
    ctx.fillStyle = CHIP;
    roundRect(ctx, -s / 2, -s / 2, s, s, rr);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, -s / 2, -s / 2, s, s * 0.4, rr);
    ctx.fill();
  } else {
    const s = p.size;
    ctx.fillStyle = p.color;
    roundRect(ctx, -s / 2, -s / 4, s, s / 2, s / 4);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Inicializa o splash. Sempre marca <html class="splash-done"> e dispara
 * 'splash:done' — mesmo quando pula a animação — para o scroll engatar.
 */
export function initSplash(root: Document = document): void {
  let done = false;
  const finishAll = () => {
    if (done) return;
    done = true;
    document.documentElement.classList.remove('is-splashing');
    document.documentElement.classList.add('splash-done');
    document.dispatchEvent(new CustomEvent('splash:done'));
  };

  const overlay = root.querySelector<HTMLElement>('[data-splash]');
  if (!overlay) { finishAll(); return; }

  const params = new URLSearchParams(window.location.search);
  const force = params.has('splash') || window.location.hash === '#splash';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // TRAVA DE SESSÃO DESATIVADA TEMPORARIAMENTE (splash roda em TODO load).
  // Para religar 1x/sessão: troque a linha abaixo por
  //   const seen = sessionStorage.getItem(SESSION_KEY) === '1';
  const seen = false;

  // Caminho instantâneo: sem flash, pois o overlay está display:none por CSS.
  if (!force && (seen || reduce)) {
    if (reduce) console.info('[Besties] prefers-reduced-motion ativo → splash pulado.');
    overlay.remove();
    finishAll();
    return;
  }

  const canvas = overlay.querySelector<HTMLCanvasElement>('[data-splash-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) { overlay.remove(); finishAll(); return; }

  // (trava desativada) — não gravamos o flag de sessão por enquanto:
  // sessionStorage.setItem(SESSION_KEY, '1');
  overlay.classList.add('is-active');            // <- torna visível (display:grid)
  document.documentElement.classList.add('is-splashing');

  let w = vw(), h = vh(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  let scale = Math.max(0.7, Math.min(1.4, w / 1200));

  const resize = () => {
    w = vw(); h = vh(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.max(0.7, Math.min(1.4, w / 1200));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const count = Math.max(28, Math.min(80, Math.round(w / 14)));
  const particles: Particle[] = Array.from({ length: count }, () => makeParticle(w, h, scale));

  const startTime = performance.now();
  let raf = 0;
  let finishing = false;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    overlay.removeEventListener('pointerdown', skip);
    window.removeEventListener('keydown', skip);
    window.removeEventListener('wheel', skip);
    overlay.removeEventListener('touchstart', skip);
  };

  const reveal = () => {
    if (finishing) return;
    finishing = true;
    overlay.classList.add('is-done'); // dispara o fade-out CSS (0.6s)

    // Remove o overlay só QUANDO o fade termina (não corta no meio).
    let ended = false;
    const onEnd = () => {
      if (ended) return;
      ended = true;
      cleanup();
      overlay.remove();
      finishAll();
    };
    overlay.addEventListener('transitionend', onEnd, { once: true });
    window.setTimeout(onEnd, FADE_MS); // fallback de segurança
  };

  // "Pular" só vale depois do período de graça (evita skip por evento residual)
  const skip = () => {
    if (performance.now() - startTime < SKIP_GRACE_MS) return;
    reveal();
  };

  window.addEventListener('resize', resize);
  overlay.addEventListener('pointerdown', skip);
  window.addEventListener('keydown', skip);
  window.addEventListener('wheel', skip, { passive: true });
  overlay.addEventListener('touchstart', skip, { passive: true });

  const loop = (now: number) => {
    const elapsed = now - startTime;
    if (w <= 1 || h <= 1) resize(); // safety p/ dimensão 0 no primeiro frame

    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.vy += 0.14 * scale;
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y - p.size > h && elapsed < IMPACT_MS - 120) {
        p.y = -p.size; p.x = rand(0, w); p.vy = rand(5.5, 11) * scale;
      }
      drawParticle(ctx, p);
    }

    if (elapsed >= IMPACT_MS) { reveal(); return; }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}