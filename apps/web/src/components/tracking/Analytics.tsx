import Script from "next/script";
import { GTM_ID, META_PIXEL_ID } from "@/content/site";

// GTM e Pixel só são carregados se os IDs estiverem preenchidos em
// content/site.ts. Sem eles (o caso agora), este componente não renderiza
// nada. O formato é validado antes de virar script.

const GTM_RE = /^GTM-[A-Z0-9]{4,12}$/;
const PIXEL_RE = /^\d{5,20}$/;

export function Analytics() {
  const gtm = GTM_ID.trim();
  const pixel = META_PIXEL_ID.trim();
  return (
    <>
      {gtm && GTM_RE.test(gtm) ? (
        <Script
          id="gtm"
          strategy="afterInteractive"
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
