# Consolidação de Configurações e SEO SSR

Consolidar a busca de `site_settings` no loader do root para garantir que os dados estejam disponíveis durante a renderização no servidor (SSR), permitindo a geração correta de JSON-LD e a exibição de informações factuais (CNPJ, Endereços) sem placeholders ou omissões indevidas.

## Ações Técnicas

### 1. Root Loader e Contexto
- Modificar `src/routes/__root.tsx`:
    - O `loader` já chama `fetchSettings()`. Garantir que ele retorne o payload completo.
    - Exportar um hook `useSiteSettings()` que consome os dados do loader via `Route.useLoaderData()`.
    - Injetar os scripts JSON-LD no `head()` usando os dados reais do loader.

### 2. Refatoração de SEO (JSON-LD)
- Atualizar `src/lib/seo.ts`:
    - Refatorar `localBusinessJsonLd` para aceitar `settings`.
    - Iterar sobre `settings.lojas` para criar múltiplos objetos `HomeGoodsStore`.
    - Formatar telefones em E.164.
    - Omitir `postalCode`.
    - Usar `settings.site.cnpj` para `vatID`.
    - Garantir que `@id` use o slug do nome da loja.

### 3. Componentes e Rotas
- Substituir `useQuery(['settings'])` por `useSiteSettings()` nos seguintes arquivos:
    - `src/components/SiteHeader.tsx`
    - `src/components/ProductView.tsx`
    - `src/routes/index.tsx`
    - `src/routes/categoria.$slug.tsx`
    - `src/routes/checkout.tsx`
- Remover buscas redundantes de `site_settings` nos loaders das rotas individuais (se houver).

### 4. Rodapé e Conformidade
- Atualizar o rodapé em `src/routes/index.tsx`:
    - Renderizar a lista de lojas a partir de `settings.lojas`.
    - Exibir o bloco legal (Razão Social e CNPJ) usando `settings.site`.
    - Remover strings de fallbacks inventados.

### 5. Remoção do Botão Flutuante
- Localizar e remover o componente do botão flutuante de WhatsApp em:
    - `src/routes/index.tsx`
    - `src/routes/categoria.$slug.tsx`
    - `src/components/ProductView.tsx` (se presente)
- Deletar o arquivo do componente órfão, se houver um dedicado.

## Validação
- Verificar HTML fonte no servidor para presença do JSON-LD correto.
- Validar visualmente o rodapé com os dados reais.
- Confirmar ausência do botão flutuante.
- Garantir que nenhuma alteração de escrita foi feita no banco.
