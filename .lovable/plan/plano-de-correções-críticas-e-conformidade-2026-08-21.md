# Plano de Correções Críticas e Conformidade

Este plano visa corrigir dados de contato fixos (hardcoded), ajustar o idioma do site, remover provas sociais estáticas e implementar a barra de anúncios dinâmica, conforme solicitado.

## 1. Ajustes Globais e Estruturais
- Alterar `lang="en"` para `lang="pt-BR"` no arquivo raiz para correta indexação e acessibilidade.
- Corrigir o Schema `LocalBusiness` para incluir o CNPJ da empresa (conforme padrão de conformidade brasileiro).

## 2. Implementação de Dados Dinâmicos (Preços e Contato)
- Substituir o telefone `(11) 4200-0000` e WhatsApp `5511942000000` fixos nos componentes pelas variáveis provenientes das configurações do banco de dados (Supabase).
- Implementar a lógica de "Sob Consulta" para produtos com preço zerado ou marcados explicitamente, garantindo que o botão leve ao fluxo de orçamento.
- Atualizar as referências de frete grátis fixas (`R$ 150`) para serem baseadas nas configurações do admin.

## 3. Barra de Anúncios Dinâmica
- Substituir a barra de topo estática no `SiteHeader` por um sistema que consome a tabela `announcements`.
- Adicionar suporte a múltiplos anúncios com transição (se configurado).

## 4. Remoção de Prova Social Estática
- Remover os depoimentos fixos da `Home` e da página de produto que utilizam dados de exemplo.
- Garantir que apenas avaliações reais vindas do banco de dados ou Trustindex sejam exibidas.

## Detalhes Técnicos
- **Arquivos afetados:** `src/routes/__root.tsx`, `src/components/SiteHeader.tsx`, `src/routes/index.tsx`, `src/components/ProductView.tsx`, `src/routes/checkout.tsx`, `src/lib/seo.ts`.
- **Backend:** Uso das tabelas `site_settings` e `announcements` já existentes/mapeadas.
- **Segurança:** Manutenção da integridade das colunas `price` e `old_price` conforme restrição.
