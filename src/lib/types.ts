export interface ListingSummary {
  id: string;
  currentPrice: number;
  listPrice: number | null;
  url: string;
  store: { slug: string; name: string };
}

export interface ProductSummary {
  id: string;
  title: string;
  brand: string | null;
  imageUrl: string | null;
  category: { slug: string; name: string };
  listings: ListingSummary[];
}
