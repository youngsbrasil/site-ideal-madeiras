const AGENCY_URL =
  "https://www.youngsbrasil.com.br?utm_source=SITE-PRINCIPAL&utm_medium=LINK-RODAPE&utm_campaign=IDEALMADEIRAS&utm_id=CLIENTES";

/**
 * Assinatura da agência, exibida no rodapé de todas as páginas do site público.
 * Sempre mantenha ao menos 64px (mt-16) de distância do último elemento acima.
 */
export function SiteFooterSignature() {
  return (
    <div className="mt-16 py-4 text-center text-[11px] text-neutral-400 bg-neutral-950">
      Desenvolvido para gerar negócios 🎯 por{" "}
      <a
        href={AGENCY_URL}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-neutral-300 hover:text-white transition-colors"
      >
        Y&amp;Br PP&amp;M
      </a>
    </div>
  );
}
