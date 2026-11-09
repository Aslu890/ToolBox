/* ToolBox service worker: makes the app work offline. Bump VERSION when you change any file. */
const VERSION='toolbox-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./lib/pdf-lib.min.js','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];
const QR='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
const FONT_CSS='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap';

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(VERSION);
    await c.addAll(CORE);
    // Best effort: QR library and web fonts, so they also work offline.
    try{await c.add(new Request(QR,{mode:'no-cors'}))}catch(_){}
    try{
      const r=await fetch(FONT_CSS);
      if(r.ok){
        const css=await r.clone().text();
        await c.put(FONT_CSS,r);
        const urls=[...new Set((css.match(/https:\/\/fonts\.gstatic\.com[^)'"\s]+/g)||[]))];
        await Promise.allSettled(urls.map(u=>c.add(u)));
      }
    }catch(_){}
    self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.protocol!=='http:'&&url.protocol!=='https:') return;

  // Pages: network first (so updates arrive), fall back to the cached app.
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const r=await fetch(req);
        if(r&&r.ok){const c=await caches.open(VERSION);c.put('./index.html',r.clone())}
        return r;
      }catch(_){
        return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error();
      }
    })());
    return;
  }

  // Same-origin files: serve from cache, refresh in the background.
  if(url.origin===location.origin){
    e.respondWith((async()=>{
      const c=await caches.open(VERSION),hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);
      return hit||(await net)||Response.error();
    })());
    return;
  }

  // The only third-party files are the QR library and Google Fonts: cache first.
  if(['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)){
    e.respondWith((async()=>{
      const c=await caches.open(VERSION),hit=await c.match(req);
      if(hit) return hit;
      try{const r=await fetch(req);if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}
      catch(_){return Response.error()}
    })());
  }
});
