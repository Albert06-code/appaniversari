El nostre aniversari — web estàtica (multi-pàgina)

Instruccions ràpides (Català)

Què fa aquesta web?
- Pàgina estàtica (HTML/CSS/JS) per celebrar l'aniversari amb varis apartats:
  - `index.html` — pàgina d'inici amb el comptador regressiu.
  - `gallery.html` — galeria d'imatges (càrrega automàtica de `assets/images/photo1..photo12.jpg`).
  - `wishes.html` — formulari per deixar missatges; s'emmagatzemen a `localStorage`.
  - `memories.html` — pàgina per afegir records o timeline (placeholder actualment).
  - `about.html` — informació sobre vosaltres (placeholder).

Com provar-la localment
1. Obre l'arxiu `d:\appaniversari\index.html` amb el teu navegador (doble clic o arrossegar a la finestra del navegador).
   - En PowerShell: `start d:\appaniversari\index.html`

Personalització ràpida
- Canviar la data de l'aniversari: obre `script.js` i modifica la variable `anniversaryDate` amb una ISO (ex: `new Date('2025-11-02T20:00:00')`).
- Canviar els noms: edita el títol i el subtítol a `index.html` (element `.couple` i `.sub`).
- Afegir fotos: desa imatges a `d:\appaniversari\assets\images` amb noms `photo1.jpg`, `photo2.jpg`, ... `photo12.jpg`.

Missatges i galeria
- Els missatges s'emmagatzemen a `localStorage` al navegador i es mostren a `wishes.html`.
- La galeria mostra placeholders si no troba les imatges. Posa les teves imatges a `assets/images` amb els noms suggerits.

Desplegament
- És una web completament client-side (sense servidor). Si vols compartir-la a Internet, puc ajudar-te a desplegar-la (GitHub Pages, Netlify, Vercel, etc.).

Personalització i següents passos
- Vols que personalitzi ara amb noms, data exacta i colors? O vols que faci el desplegament a GitHub Pages perquè la compartiu amb familiars?
