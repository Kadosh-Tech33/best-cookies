import type { Config } from 'tailwindcss';

/**
 * Tailwind lê as CSS variables de src/styles/tokens.css.
 * Regra: NUNCA hardcode hex aqui. Sempre rgb(var(--...) / <alpha-value>)
 * para preservar o suporte a opacidade (ex.: bg-grape/40).
 */
const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx,vue}'],
  theme: {
    extend: {
      colors: {
        // paleta crua
        grape: {
          900: 'rgb(var(--besties-grape-900-rgb) / <alpha-value>)',
          700: 'rgb(var(--besties-grape-700-rgb) / <alpha-value>)',
          500: 'rgb(var(--besties-grape-500-rgb) / <alpha-value>)',
          300: 'rgb(var(--besties-grape-300-rgb) / <alpha-value>)',
          100: 'rgb(var(--besties-grape-100-rgb) / <alpha-value>)',
        },
        caramel: {
          600: 'rgb(var(--besties-caramel-600-rgb) / <alpha-value>)',
          500: 'rgb(var(--besties-caramel-500-rgb) / <alpha-value>)',
          300: 'rgb(var(--besties-caramel-300-rgb) / <alpha-value>)',
        },
        butter: {
          400: 'rgb(var(--besties-butter-400-rgb) / <alpha-value>)',
          200: 'rgb(var(--besties-butter-200-rgb) / <alpha-value>)',
        },
        cream: {
          50: 'rgb(var(--besties-cream-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--besties-cream-100-rgb) / <alpha-value>)',
        },
        cocoa: {
          800: 'rgb(var(--besties-cocoa-800-rgb) / <alpha-value>)',
          500: 'rgb(var(--besties-cocoa-500-rgb) / <alpha-value>)',
        },
        // aliases semânticos
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'rgb(var(--besties-grape-900-rgb) / <alpha-value>)',
        primary: 'rgb(var(--besties-caramel-500-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--besties-grape-700-rgb) / <alpha-value>)',
        accent: 'rgb(var(--besties-butter-400-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      fontSize: {
        'step--1': 'var(--step--1)',
        'step-0': 'var(--step-0)',
        'step-1': 'var(--step-1)',
        'step-2': 'var(--step-2)',
        'step-3': 'var(--step-3)',
        'step-4': 'var(--step-4)',
        'step-5': 'var(--step-5)',
        'step-6': 'var(--step-6)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        primary: 'var(--shadow-primary)',
      },
      spacing: {
        '2xs': 'var(--space-2xs)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
        '4xl': 'var(--space-4xl)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        squish: 'var(--ease-squish)',
      },
      maxWidth: {
        container: 'var(--container-max)',
        narrow: 'var(--container-narrow)',
      },
      zIndex: {
        header: '100',
        drawer: '200',
        modal: '300',
        splash: '900',
        toast: '1000',
      },
    },
  },
  plugins: [],
};

export default config;