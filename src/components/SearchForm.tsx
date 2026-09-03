interface SearchFormProps {
  defaultValue?: string;
  category?: string;
  store?: string;
  sort?: string;
}

export default function SearchForm({ defaultValue, category, store, sort }: SearchFormProps) {
  return (
    <form action="/" method="GET" className="flex gap-2">
      {category && <input type="hidden" name="category" value={category} />}
      {store && <input type="hidden" name="store" value={store} />}
      {sort && <input type="hidden" name="sort" value={sort} />}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Busca un producto: smartphone, portátil, tarjeta gráfica..."
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none"
      />
      <button
        type="submit"
        className="btn-tactile rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Buscar
      </button>
    </form>
  );
}
