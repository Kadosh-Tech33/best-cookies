/* ============================================================================
   BESTIES — Cenas de scroll (GSAP + ScrollTrigger)
   - [data-reveal]      -> fade + subida ao entrar na viewport
   - [data-float]       -> parallax por scroll (velocidade via data-speed)
                           + "bob" ambiente contínuo
   Respeita prefers-reduced-motion (mostra tudo, sem movimento).
   ============================================================================ */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initScrollScenes(root: ParentNode = document): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  // --- Reveals ------------------------------------------------------------
  const reveals = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-reveal]'));
  reveals.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay ?? '0');

    if (reduce) {
      // Acessível: só opacidade, sem movimento.
      gsap.to(el, {
        opacity: 1,
        duration: 0.5,
        delay,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
      });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 42 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      }
    );
  });

  // Garante refresh após montar os reveals (posições corretas).
  ScrollTrigger.refresh();

  if (reduce) return;

  // --- Cookies flutuantes: parallax + bob --------------------------------
  const floats = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-float]'));
  floats.forEach((el, i) => {
    const speed = parseFloat(el.dataset.speed ?? '0.15');
    const scope = (el.closest('[data-float-scope]') as HTMLElement) ?? document.body;

    // parallax vinculado ao scroll da seção-escopo
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: scope,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // bob ambiente (respira mesmo parado)
    gsap.to(el, {
      y: '+=14',
      rotation: (i % 2 === 0 ? 6 : -6),
      duration: gsap.utils.random(2.4, 3.8),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: gsap.utils.random(0, 1.2),
    });
  });

  // Recalcula posições após fontes/imagens carregarem
  ScrollTrigger.refresh();
}