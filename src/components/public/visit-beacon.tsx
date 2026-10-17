/**
 * Visit counting with no cookies or storage, as a tiny inline script (no extra JS download, no hydration).
 * - Counts a page view on load and on every client-side navigation (history.pushState / popstate).
 * - Counts official-link taps: `<a data-tap="slug">`.
 * - Fills the footer's public counter (visitor-count.tsx) from the edge-cached /api/wageni.
 * Prefetches never run page scripts; a page being prerendered waits until it is shown;
 * automated browsers (navigator.webdriver) are skipped. Bots are also filtered on the server.
 */
const SCRIPT = `(()=>{var n=navigator,d=document,l="";function s(b){b=JSON.stringify(b);n.sendBeacon&&n.sendBeacon("/api/hit",new Blob([b],{type:"text/plain"}))||fetch("/api/hit",{method:"POST",body:b,keepalive:!0}).catch(()=>{})}
function v(){var p=location.pathname;p!==l&&(l=p,s({p:p}))}
function c(){var b=d.querySelector("[data-wageni]");b&&fetch("/api/wageni").then(r=>r.ok?r.json():null).then(j=>{if(!j||typeof j.visitors!="number")return;var f=new Intl.NumberFormat(d.documentElement.lang=="sw"?"sw-TZ":"en-GB"),q=k=>b.querySelector(k);q('[data-n="visitors"]').textContent=f.format(j.visitors);q('[data-n="today"]').textContent=f.format(j.today||0);q("[data-today]").hidden=!j.today;b.style.opacity="1"}).catch(()=>{})}
function go(){c();if(n.webdriver)return;v();["pushState","replaceState"].forEach(m=>{var o=history[m];history[m]=function(){var r=o.apply(this,arguments);setTimeout(v,0);return r}});addEventListener("popstate",()=>setTimeout(v,0));d.addEventListener("click",e=>{var a=e.target&&e.target.closest&&e.target.closest("a[data-tap]");a&&s({t:a.getAttribute("data-tap")})},!0)}
d.prerendering?d.addEventListener("prerenderingchange",go,{once:!0}):d.readyState=="loading"?d.addEventListener("DOMContentLoaded",go):go()})()`;

export function VisitBeacon() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
