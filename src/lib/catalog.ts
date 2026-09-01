// Catálogo de ejemplo compartido entre tiendas simuladas (MockAdapter).
// El mismo EAN en varias tiendas es lo que permite comparar precios del
// "mismo producto" entre tiendas distintas.

export interface CatalogItem {
  ean: string;
  title: string;
  brand: string;
  model: string;
  categorySlug: string;
  imageUrl: string;
  basePrice: number;
}

export const CATEGORIES = [
  { slug: "smartphones", name: "Móviles y smartphones" },
  { slug: "portatiles", name: "Portátiles" },
  { slug: "componentes", name: "Componentes de PC" },
  { slug: "tv", name: "Televisores" },
  { slug: "audio", name: "Audio" },
  { slug: "gaming", name: "Gaming" },
  { slug: "tablets", name: "Tablets" },
  { slug: "electrodomesticos", name: "Electrodomésticos" },
] as const;

export const CATALOG: CatalogItem[] = [
  {
    ean: "0000000000011",
    title: "Smartphone Aurora X200 128GB",
    brand: "Aurora",
    model: "X200",
    categorySlug: "smartphones",
    imageUrl: "https://picsum.photos/seed/x200/400/400",
    basePrice: 599,
  },
  {
    ean: "0000000000012",
    title: "Smartphone Nébula S10 256GB",
    brand: "Nébula",
    model: "S10",
    categorySlug: "smartphones",
    imageUrl: "https://picsum.photos/seed/s10/400/400",
    basePrice: 849,
  },
  {
    ean: "0000000000021",
    title: "Portátil UltraBook Pro 14\" i7 16GB",
    brand: "UltraBook",
    model: "Pro14",
    categorySlug: "portatiles",
    imageUrl: "https://picsum.photos/seed/pro14/400/400",
    basePrice: 1199,
  },
  {
    ean: "0000000000022",
    title: "Portátil GamerLine 15\" RTX 4060",
    brand: "GamerLine",
    model: "GL15",
    categorySlug: "portatiles",
    imageUrl: "https://picsum.photos/seed/gl15/400/400",
    basePrice: 1399,
  },
  {
    ean: "0000000000031",
    title: "Tarjeta gráfica ForgeTech RTX 4070 12GB",
    brand: "ForgeTech",
    model: "RTX4070",
    categorySlug: "componentes",
    imageUrl: "https://picsum.photos/seed/rtx4070/400/400",
    basePrice: 649,
  },
  {
    ean: "0000000000032",
    title: "SSD NVMe SpeedCore 2TB",
    brand: "SpeedCore",
    model: "NVMe2TB",
    categorySlug: "componentes",
    imageUrl: "https://picsum.photos/seed/nvme2tb/400/400",
    basePrice: 149,
  },
  {
    ean: "0000000000041",
    title: "Televisor VisionPlus 55\" 4K OLED",
    brand: "VisionPlus",
    model: "OLED55",
    categorySlug: "tv",
    imageUrl: "https://picsum.photos/seed/oled55/400/400",
    basePrice: 999,
  },
  {
    ean: "0000000000042",
    title: "Televisor VisionPlus 65\" 4K QLED",
    brand: "VisionPlus",
    model: "QLED65",
    categorySlug: "tv",
    imageUrl: "https://picsum.photos/seed/qled65/400/400",
    basePrice: 1299,
  },
  {
    ean: "0000000000051",
    title: "Auriculares SonicWave Pro ANC",
    brand: "SonicWave",
    model: "ProANC",
    categorySlug: "audio",
    imageUrl: "https://picsum.photos/seed/sonicwave/400/400",
    basePrice: 249,
  },
  {
    ean: "0000000000052",
    title: "Barra de sonido AmpliTone 300W",
    brand: "AmpliTone",
    model: "AT300",
    categorySlug: "audio",
    imageUrl: "https://picsum.photos/seed/amplitone/400/400",
    basePrice: 179,
  },
  {
    ean: "0000000000061",
    title: "Consola PlayVerse Series X",
    brand: "PlayVerse",
    model: "SeriesX",
    categorySlug: "gaming",
    imageUrl: "https://picsum.photos/seed/playverse/400/400",
    basePrice: 499,
  },
  {
    ean: "0000000000062",
    title: "Mando inalámbrico PlayVerse Elite",
    brand: "PlayVerse",
    model: "Elite",
    categorySlug: "gaming",
    imageUrl: "https://picsum.photos/seed/elite/400/400",
    basePrice: 69,
  },
  {
    ean: "0000000000071",
    title: "Tablet AeroPad 11\" 256GB",
    brand: "AeroPad",
    model: "11-256",
    categorySlug: "tablets",
    imageUrl: "https://picsum.photos/seed/aeropad/400/400",
    basePrice: 549,
  },
  {
    ean: "0000000000081",
    title: "Robot aspirador CleanBot Max",
    brand: "CleanBot",
    model: "Max",
    categorySlug: "electrodomesticos",
    imageUrl: "https://picsum.photos/seed/cleanbot/400/400",
    basePrice: 399,
  },
  {
    ean: "0000000000082",
    title: "Freidora de aire AirFry Chef 6L",
    brand: "AirFry",
    model: "Chef6L",
    categorySlug: "electrodomesticos",
    imageUrl: "https://picsum.photos/seed/airfry/400/400",
    basePrice: 89,
  },
];
