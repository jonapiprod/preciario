# ChollosTech

Comparador de precios de tecnología con detector de errores de precio
(caídas > 60%) para las principales tiendas online de España.

- Búsqueda y filtro por categoría, tienda, precio y descuento.
- Comparativa de precios del mismo producto entre tiendas (por EAN).
- Página de "Errores de precio" con las caídas de precio detectadas.
- Arquitectura por adaptadores (`src/lib/adapters/`) para conectar fuentes
  de precio reales (Amazon PA-API, feeds de afiliados) sin tocar el resto
  de la app.

Ahora mismo funciona con datos de ejemplo. Para conectarlo a precios reales
lee **[SETUP.md](./SETUP.md)**.

## Arrancar en local

```bash
npm install
npx prisma dev -d
npx prisma db push
npm run db:seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Comandos útiles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y arranque en producción |
| `npm test` | Tests del motor de detección de errores de precio |
| `npm run db:seed` | Repuebla la base de datos con datos de ejemplo |
| `npm run db:studio` | Abre Prisma Studio para inspeccionar los datos |
| `npx prisma dev ls` | Muestra el estado del Postgres local de desarrollo |

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Prisma 7 (driver adapter
`@prisma/adapter-pg`) + PostgreSQL.
