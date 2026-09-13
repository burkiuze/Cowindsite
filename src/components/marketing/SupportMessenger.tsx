"use client";

import Script from "next/script";

/**
 * The support messenger, on the public site only.
 *
 * A visitor with a question should be able to ask it on the page rather than
 * hunting for an address. The workspace id is the messenger's public
 * identifier — it ships in the browser on every site that runs one — so it can
 * sit here; nothing secret is involved, and no credential of ours is.
 *
 * Two rules keep this honest. It is mounted on the marketing layout only, so it
 * never appears over a workspace where someone's company data is on screen. And
 * if no workspace id is configured, nothing loads at all: no widget, no
 * placeholder, no "we'll get back to you" that nobody receives.
 */
const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID ?? "yob9wnxb";

export function SupportMessenger() {
  if (!APP_ID) return null;

  return (
    <Script id="support-messenger" strategy="lazyOnload">
      {`
        window.intercomSettings = { api_base: "https://api-iam.intercom.io", app_id: "${APP_ID}" };
        (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${APP_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(d.readyState==='complete'){l();}else{w.addEventListener('load',l,false);}}})();
      `}
    </Script>
  );
}
