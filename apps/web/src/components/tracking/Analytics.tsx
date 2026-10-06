import Script from "next/script";
import { GTM_ID, META_PIXEL_ID } from "@/content/site";

// GTM e Pixel só são carregados se os IDs estiverem preenchidos em
// content/site.ts. O formato é validado antes de virar script.
//
// GTM: snippet oficial do Google, que o Google manda pôr no <head>. Por isso
// `beforeInteractive` (só vale no layout raiz, que é onde este componente
// está): o Next o escreve no <head> do HTML servido, então ele já existe antes
// de qualquer código da página e aparece para ferramentas que leem o HTML
// cru (Tag Assistant, verificadores). O snippet só injeta um <script async>,
// então não bloqueia a página. Com `afterInteractive` o script nem estaria no
// HTML (seria injetado depois da hidratação) e o page_view de quem sai rápido
// se perderia. Eventos empurrados no `dataLayer` antes de o gtm.js baixar
// ficam na fila e são processados quando ele sobe. O `<noscript>` oficial
// (iframe) vem em `GtmNoScript`, que o layout põe logo depois de abrir o <body>.
//
// Pixel do Meta e GA4 NÃO entram aqui: ficam DENTRO do GTM (docs/gtm-eventos.md).
// Deixe META_PIXEL_ID vazio, senão o Pixel carrega duas vezes.

const GTM_RE = /^GTM-[A-Z0-9]{4,12}$/;
const PIXEL_RE = /^\d{5,20}$/;

function validGtmId(): string | null {
  const id = GTM_ID.trim();
  return id && GTM_RE.test(id) ? id : null;
}

export function Analytics() {
  const gtm = validGtmId();
  const pixel = META_PIXEL_ID.trim();
  return (
    <>
      {gtm ? (
        // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- regra de Pages Router; no App Router a doc do Next manda pôr no layout raiz (script.md, "beforeInteractive")
        <Script
          id="gtm"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
          }}
        />
      ) : null}
      {pixel && PIXEL_RE.test(pixel) ? (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`,
          }}
        />
      ) : null}
    </>
  );
}

/** `<noscript>` oficial do GTM: vai logo depois de abrir o <body>. */
export function GtmNoScript() {
  const gtm = validGtmId();
  if (!gtm) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
