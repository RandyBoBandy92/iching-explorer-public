const n="1.3",c=`iching-explorer-v${n}`,r="/iching-explorer-public",o=64,h=[`${r}/?v=${n}`,`${r}/index.html?v=${n}`,`${r}/manifest.json?v=${n}`,...Array.from({length:o},(e,s)=>`${r}/hexagramJSONS/hexagram${s+1}.json?v=${n}`)],l=!self.location.hostname.includes("localhost");self.addEventListener("install",e=>{l&&e.waitUntil(caches.open(c).then(s=>s.addAll(h)))});self.addEventListener("fetch",e=>{l&&(e.request.method!=="GET"||!e.request.url.startsWith("http")||e.respondWith(caches.match(e.request).then(s=>s||fetch(e.request).then(t=>{if(!t||t.status!==200||t.type!=="basic")return t;const i=t.clone();return caches.open(c).then(a=>{a.put(e.request,i)}),t}))))});self.addEventListener("activate",e=>{if(!l)return;const s=[c];e.waitUntil(caches.keys().then(t=>Promise.all(t.map(i=>{if(!s.includes(i))return console.log(`Deleting old cache: ${i}`),caches.delete(i)}))).then(()=>(console.log("Old caches cleared. Claiming clients."),self.clients.claim())))});self.addEventListener("message",e=>{e.data&&e.data.type==="SKIP_WAITING"&&self.skipWaiting()});l||self.addEventListener("activate",()=>{self.registration.unregister().then(()=>{console.log("Service worker unregistered in development mode.")})});