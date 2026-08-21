# Plan for Site Settings Hydration and SSR Integrity

Consolidate site settings into a single source of truth at the root route to ensure data integrity during SSR and avoid redundant client-side queries.

## User Review Required
> [!IMPORTANT]
> This plan modifies how global settings are fetched and distributed across the application. It will replace redundant `useQuery` calls with a shared `useSiteSettings` hook powered by root loader data.

- **Integrity**: I will NOT drop, truncate, or modify any database tables. This is a read-only frontend task.
- **Factual Data**: I will strictly use `site_settings` from the database. No fake CEPs or phone numbers will be invented.
- **Floating Buttons**: The hardcoded WhatsApp floating buttons will be removed as requested.

## Proposed Changes

### 1. Global Data Source in `src/routes/__root.tsx`
- Implement `loader` in the root route to fetch `site_settings` using the existing `fetchSettings` server function.
- Add `settings` to the route context.
- Create a `useSiteSettings()` hook (using `Route.useRouteContext()` or `useLoaderData`) for easy consumption in components.

### 2. SSR-Ready JSON-LD
- Update `src/routes/__root.tsx` head to consume `settings` from the loader data for `localBusinessJsonLd`.
- Ensure `localBusinessJsonLd` in `src/lib/seo.ts` correctly renders one `HomeGoodsStore` per store in `settings.lojas` with correct formatting (E.164 phone, no postalCode).

### 3. Footer and Legal Info
- Refactor the footer in `src/routes/index.tsx` (and other pages if applicable) to use stores from `settings.lojas` and legal info from `settings.site`.
- Ensure store addresses (350, 284, 306) and CNPJ are rendered correctly from the database.

### 4. Code Cleanup and Refactoring
- **Remove `useQuery(['settings'])`** from:
  - `src/routes/index.tsx`
  - `src/routes/categoria.$slug.tsx`
  - `src/routes/$.tsx` (if present)
  - `src/components/SiteHeader.tsx`
  - `src/components/ProductView.tsx`
  - `src/routes/checkout.tsx`
- **Remove redundant loaders** in leaf routes that were fetching settings.
- **Remove Floating WhatsApp buttons**:
  - `src/routes/index.tsx`
  - `src/routes/categoria.$slug.tsx`
  - `src/components/ProductView.tsx`

### 5. Announcements Resiliency
- In `SiteHeader.tsx`, ensure the announcements query failure is handled gracefully, rendering the header without the bar if the table is empty or the query fails.

## Technical Details

### Hook Implementation
```typescript
// Proposed implementation pattern
export function useSiteSettings() {
  const { settings } = Route.useRouteContext({ from: '__root__' });
  return settings;
}
```

### Affected Files
- `src/routes/__root.tsx`: Add loader and context logic.
- `src/lib/seo.ts`: Refine JSON-LD generator.
- `src/components/SiteHeader.tsx`: Replace `useQuery` with `useSiteSettings`.
- `src/components/ProductView.tsx`: Replace `useQuery` with `useSiteSettings`, remove floating button.
- `src/routes/index.tsx`: Replace `useQuery`, update footer, remove floating button, remove redundant loader logic.
- `src/routes/categoria.$slug.tsx`: Replace `useQuery`, remove floating button, remove redundant loader logic.
- `src/routes/checkout.tsx`: Replace `useQuery`.
