/* ============================================================================
   BESTIES — Smooth scroll (Lenis) integrado ao GSAP/ScrollTrigger
   Retorna a instância Lenis (ou null se reduced-motion).
   ============================================================================ */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenisInstance: Lenis | null = null;

export function initSmoothScroll(): Lenis | null {
  if (lenisInstance) return lenisInstance;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return null;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.1,          // suavidade (menor = mais "escorregadio")
    wheelMultiplier: 1,
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  // Sincroniza Lenis <-> ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}