/* ============================================================================
   BESTIES — Catálogo (mock)
   Preços em CENTAVOS (int) para não ter erro de ponto flutuante em dinheiro.
   Imagens são placeholders (Unsplash) — trocar pelas fotos reais do cliente.
   ============================================================================ */

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
  tags: string[];      // slugs de categoria (ver `categorias`)
  badge?: string;      // selo opcional ("Mais vendido", "Novo"…)
}

export interface Categoria {
  slug: string;
  label: string;
}

export const categorias: Categoria[] = [
  { slug: 'recheados', label: 'Mega recheados' },
  { slug: 'classicos', label: 'Clássicos' },
  { slug: 'brownie', label: 'Brownies' },
  { slug: 'kids', label: 'Kids' },
];

/* Imagens LOCAIS (pasta public/). Coloque os .jpg em public/img/produtos/
   com os mesmos nomes usados abaixo. Enquanto o arquivo não existir, o
   onerror dos componentes cai no placeholder da marca (sem rede externa). */

/* Fallback à prova de bala: placeholder SVG da própria marca (embutido,
   nenhuma requisição externa). Usado no onerror do card e da gaveta. */
const FALLBACK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">` +
  `<rect width="100%" height="100%" fill="#7E0090"/>` +
  `<circle cx="300" cy="205" r="78" fill="#E0A75B" stroke="#B77B33" stroke-width="9"/>` +
  `<circle cx="278" cy="188" r="10" fill="#3B2314"/>` +
  `<circle cx="322" cy="212" r="10" fill="#3B2314"/>` +
  `<circle cx="300" cy="232" r="8" fill="#3B2314"/>` +
  `<circle cx="268" cy="222" r="7" fill="#3B2314"/>` +
  `<text x="300" y="350" font-family="sans-serif" font-size="34" font-weight="bold" fill="#FAC100" text-anchor="middle">Besties</text>` +
  `</svg>`;
export const IMG_FALLBACK = `data:image/svg+xml,${encodeURIComponent(FALLBACK_SVG)}`;

export const produtos: Product[] = [
  {
    id: 'brookie-nutella',
    slug: 'brookie-nutella',
    name: 'Brookie Nutella',
    description: 'A união perfeita de metade brownie denso e metade cookie de baunilha, recheado com muita Nutella.',
    priceCents: 1990,
    image: '/img/produtos/brookie-nutella.png',
    tags: ['recheados'],
    badge: 'Mais vendido',
  },
  {
    id: 'cookie-kit-kat',
    slug: 'cookie-kit-kat',
    name: 'Cookie Kit Kat',
    description: 'Massa tradicional super macia com pedaços e uma barra inteira de Kit Kat por cima.',
    priceCents: 1790,
    image: '/img/produtos/cookie-kit-kat.png',
    tags: ['recheados', 'classicos'],
  },
  {
    id: 'cookie-pistache',
    slug: 'cookie-pistache',
    name: 'Cookie Pistache',
    description: 'Creme de pistache artesanal com lascas crocantes. Sofisticado e perfeito.',
    priceCents: 2290,
    image: '/img/produtos/cookie-pistache.png',
    tags: ['recheados'],
    badge: 'Novo',
  },
  {
    id: 'cookie-chocolate',
    slug: 'cookie-chocolate',
    name: 'Cookie Chocolate',
    description: 'Massa intensa de chocolate com muitas gotas de chocolate nobre meio amargo.',
    priceCents: 1590,
    image: '/img/produtos/cookie-chocolate.png',
    tags: ['classicos'],
  },
  {
    id: 'cookie-red-velvet',
    slug: 'cookie-red-velvet',
    name: 'Cookie Red Velvet',
    description: 'Massa vermelha aveludada, gotas de chocolate branco e recheio cremoso irresistível.',
    priceCents: 1990,
    image: '/img/produtos/cookie-red-velvet.png',
    tags: ['recheados'],
  },
  {
    id: 'cookie-recheado',
    slug: 'cookie-recheado',
    name: 'Cookie Recheado',
    description: 'Nossa massa secreta amanteigada com uma explosão de recheio cremoso que escorre.',
    priceCents: 1890,
    image: '/img/produtos/cookie-recheado.png',
    tags: ['recheados'],
  },
  {
    id: 'cookie-oreo',
    slug: 'cookie-oreo',
    name: 'Cookie Oreo',
    description: 'Combinação perfeita de massa de cacau com pedaços crocantes do biscoito Oreo original.',
    priceCents: 1690,
    image: '/img/produtos/cookie-oreo.png',
    tags: ['recheados'],
  },
  {
    id: 'cookie-tradicional',
    slug: 'cookie-tradicional',
    name: 'Cookie Tradicional',
    description: 'O clássico americano de baunilha, super macio por dentro e cheio de gotas de chocolate.',
    priceCents: 1490,
    image: '/img/produtos/cookie-tradicional.png',
    tags: ['classicos'],
  },
];

export function getByTag(tag: string): Product[] {
  if (tag === 'all') return produtos;
  return produtos.filter((p) => p.tags.includes(tag));
}

/* --- Dinheiro -------------------------------------------------------------- */
export const FREE_SHIPPING_CENTS = 9000; // frete grátis acima de R$ 90

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}