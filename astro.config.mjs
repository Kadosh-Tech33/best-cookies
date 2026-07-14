// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

/**
 * Besties Cookie'n Brownie — Astro config
 *
 * output: 'static' → tudo pré-renderizado. Deploy trivial na Vercel
 * (detecção automática, zero config, sem servidor Node).
 *
 * Quando entrarem rotas reais de servidor (/api/frete do Melhor Envio,
 * /api/pagamento do Mercado Pago), instalar `@astrojs/vercel`, mudar para
 * output:'server'/'hybrid' com esse adapter, e marcar as rotas dinâmicas
 * com `export const prerender = false`.
 */
export default defineConfig({
  site: 'https://besties.com.br', // ajustar no deploy

  integrations: [
    // applyBaseStyles:false — nós controlamos o reset via global.css
    tailwind({ applyBaseStyles: false }),
  ],

  // Prefetch de links no viewport = navegação instantânea (feel premium)
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  vite: {
    ssr: {
      // GSAP é ESM; evita problemas de bundling na pré-renderização
      noExternal: ['gsap'],
    },
  },

  devToolbar: { enabled: false },
});
