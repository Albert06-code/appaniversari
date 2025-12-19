// Configuració: data d'inici de la relació (canvia si cal)
// Hem començat a sortir el 21/12/2024 — per defecte assumim inici a mitjanit (UTC local)
const startDate = new Date('2024-12-21T00:00:00');

// Helper per detectar quina pàgina estem mirant (body id)
const pageId = document.body && document.body.id ? document.body.id : '';

// -------- Countdown (només a la pàgina Home) --------
if(document.getElementById('countdown')){
  // Count-up: mostra anys, mesos, dies i hora (hh:mm:ss) des de startDate
  function daysInMonth(year, month){
    return new Date(year, month+1, 0).getDate();
  }

  function calcYMDHMS(from, to){
    // diffs per components amb normalització (prestada de lògica clàssica de dates)
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();
    let hours = to.getHours() - from.getHours();
    let minutes = to.getMinutes() - from.getMinutes();
    let seconds = to.getSeconds() - from.getSeconds();

    if(seconds < 0){ seconds += 60; minutes -= 1; }
    if(minutes < 0){ minutes += 60; hours -= 1; }
    if(hours < 0){ hours += 24; days -= 1; }
    if(days < 0){
      // borrow from previous month of 'to'
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0); // last day of previous month
      days += prevMonth.getDate();
      months -= 1;
    }
    if(months < 0){ months += 12; years -= 1; }

    return {years, months, days, hours, minutes, seconds};
  }

  function pad2(n){ return String(n).padStart(2,'0'); }

  function updateCountUp(){
    const now = new Date();
    const comp = calcYMDHMS(startDate, now);
  const yearsEl = document.getElementById('years');
  const monthsEl = document.getElementById('months');
  const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const elapsedText = document.getElementById('elapsedText');

    // Omplim cada component: anys, mesos, dies, hores, minuts, segons
    yearsEl.textContent = comp.years;
    monthsEl.textContent = comp.months;
    daysEl.textContent = comp.days;
    hoursEl.textContent = pad2(comp.hours);
    minutesEl.textContent = pad2(comp.minutes);
    secondsEl.textContent = pad2(comp.seconds);

    // Conservar una línia de text separada amb informació llegible (si existeix)
    if(elapsedText){
      const totalSeconds = Math.floor((now - startDate) / 1000);
      const tDays = Math.floor(totalSeconds / 86400);
      const totalHours = Math.floor(totalSeconds / 3600);
      const tMins = Math.floor((totalSeconds % 3600) / 60);
      const tSecs = totalSeconds % 60;
      elapsedText.textContent = `Temps transcorregut: ${tDays} dies · ${totalHours} hores · ${tMins} min · ${tSecs} sec`;
    }
  }

  updateCountUp();
  setInterval(updateCountUp, 1000);
}

// -------- Galeria (només si existeix #photoGrid) --------
const photoGrid = document.getElementById('photoGrid');
if(photoGrid){
  // Si la pàgina conté figures (.photo), inicialitzem captions editables
  const figures = photoGrid.querySelectorAll('.photo');
  if(figures && figures.length){
    // Load captions map from localStorage
    const CAP_KEY = 'gallery_captions';
    function loadCaptionsMap(){
      try{ return JSON.parse(localStorage.getItem(CAP_KEY)) || {} }catch(e){ return {} }
    }
    function saveCaptionsMap(map){ localStorage.setItem(CAP_KEY, JSON.stringify(map)) }

    const captions = loadCaptionsMap();

    figures.forEach(fig => {
      const filename = fig.getAttribute('data-filename') || '';
      const captionEl = fig.querySelector('.caption .text');
      const editBtn = fig.querySelector('.caption .edit');

      // Set initial caption from storage if exists; otherwise keep whatever is in the HTML
      if(captionEl){
        if(captions[filename]){
          captionEl.textContent = captions[filename];
        } else if(!captionEl.textContent || !captionEl.textContent.trim()){
          captionEl.textContent = 'Afegeix un comentari...';
        }
      }

      // Edit handler: replace caption text with input + save/cancel
      if(editBtn){
        const capWrapper = fig.querySelector('.caption');
        const openEditor = ()=>{
          const current = captions[filename] || '';
          capWrapper.innerHTML = '';
          const input = document.createElement('input');
          input.type = 'text'; input.value = current; input.placeholder = 'Escriu un comentari';
          const save = document.createElement('button'); save.textContent = 'Desa'; save.className='edit';
          const cancel = document.createElement('button'); cancel.textContent = 'Cancela'; cancel.className='edit';
          // styles: save primary, cancel secondary via inline tweak
          save.style.marginLeft = '8px';
          cancel.style.marginLeft = '6px'; cancel.style.background = '#eee'; cancel.style.color='#333';
          capWrapper.appendChild(input);
          capWrapper.appendChild(save);
          capWrapper.appendChild(cancel);

          input.focus();

          function finishSave(){
            const v = input.value.trim();
            if(v) captions[filename] = v; else delete captions[filename];
            saveCaptionsMap(captions);
            capWrapper.innerHTML = `<span class="text">${v || 'Afegeix un comentari...'}</span><button class="edit">Edita</button>`;
            // rebind the new edit button so edits are possible again
            const newEdit = capWrapper.querySelector('.edit');
            if(newEdit) newEdit.addEventListener('click', openEditor);
          }

          save.addEventListener('click', finishSave);
          cancel.addEventListener('click', ()=>{
            capWrapper.innerHTML = `<span class="text">${captions[filename] || 'Afegeix un comentari...'}</span><button class="edit">Edita</button>`;
            const newEdit = capWrapper.querySelector('.edit');
            if(newEdit) newEdit.addEventListener('click', openEditor);
          });
        };

        // initial binding
        editBtn.addEventListener('click', openEditor);
      }
    });
  }
}

// -------- Lightbox for gallery images --------
(function galleryLightbox(){
  try{
    const grid = document.getElementById('photoGrid');
    if(!grid) return;

    function ensureLightbox(){
      let lb = document.getElementById('lightboxOverlay');
      if(lb) return lb;
      lb = document.createElement('div'); lb.id = 'lightboxOverlay'; lb.className = 'lightbox-overlay';
      lb.innerHTML = `<button class="lb-close" aria-label="Tancar">✕</button><img alt="Zoomed image" src="" />`;
      document.body.appendChild(lb);
      const img = lb.querySelector('img');
      const closeBtn = lb.querySelector('.lb-close');
      function close(){ lb.classList.remove('visible'); document.body.style.overflow = ''; }
      closeBtn.addEventListener('click', close);
      lb.addEventListener('click', (e)=>{ if(e.target === lb) close(); });
      document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
      return lb;
    }

    grid.addEventListener('click', (e)=>{
      const imgEl = e.target.closest('img');
      if(!imgEl || !grid.contains(imgEl)) return;
      const src = imgEl.getAttribute('src');
      const alt = imgEl.getAttribute('alt') || '';
      const lb = ensureLightbox();
      const lbImg = lb.querySelector('img');
      lbImg.src = src;
      lbImg.alt = alt;
      lb.classList.add('visible');
      // prevent body scroll while open
      document.body.style.overflow = 'hidden';
    });
  }catch(e){ console.error('Lightbox init error', e); }
})();

// -------- Missatges (només si existeix el formulari) --------
const form = document.getElementById('msgForm');
const msgList = document.getElementById('msgList');
const clearBtn = document.getElementById('clearBtn');

function loadMessages(){
  if(!msgList) return;
  const raw = localStorage.getItem('anniv_messages');
  let arr = [];
  try{ arr = raw?JSON.parse(raw):[] }catch(e){ arr = [] }
  msgList.innerHTML = '';
  arr.slice().reverse().forEach(m => {
    const li = document.createElement('li');
    const meta = document.createElement('div'); meta.className='meta'; meta.textContent = `${m.name} · ${new Date(m.when).toLocaleString()}`;
    const msg = document.createElement('div'); msg.textContent = m.text;
    li.appendChild(meta); li.appendChild(msg);
    msgList.appendChild(li);
  });
}

if(form){
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim() || 'Anònim';
    const text = document.getElementById('message').value.trim();
    if(!text) return;
    const raw = localStorage.getItem('anniv_messages');
    let arr = [];
    try{ arr = raw?JSON.parse(raw):[] }catch(e){ arr = [] }
    arr.push({name,text,when:new Date().toISOString()});
    localStorage.setItem('anniv_messages', JSON.stringify(arr));
    form.reset();
    loadMessages();
  });
}

if(clearBtn){
  clearBtn.addEventListener('click', ()=>{
    if(confirm('Esborrar tots els missatges?')){
      localStorage.removeItem('anniv_messages');
      loadMessages();
    }
  });
}

// Inicialitza missatges si toca
loadMessages();

// -------- Navegació: afegir classe active al link corresponent --------
(function highlightNav(){
  try{
    const links = document.querySelectorAll('.topnav .links a');
    links.forEach(a=>{
      const href = a.getAttribute('href');
      if(href && href.indexOf(pageId) !== -1) a.classList.add('active');
      if(pageId === 'home' && href === 'index.html') a.classList.add('active');
      if(pageId && pageId !== 'home' && href === `${pageId}.html`) a.classList.add('active');
    });
  }catch(e){}
})();

// Pot afegir més helpers específics per pàgina aquí

/* Background music that continues across pages */
(function backgroundMusic(){
  try{
    const MUSIC_KEY = 'anniv_music_playing';
    const MUSIC_TIME_KEY = 'anniv_music_time';
    const MUSIC_URL = 'assets/sparks.mp3';
    
    // Create or get audio element
    if(!window.anniversaryAudio){
      window.anniversaryAudio = new Audio(MUSIC_URL);
      window.anniversaryAudio.volume = 0.5;
      window.anniversaryAudio.loop = true; // La cançó es repeteix
    }
    
    const audio = window.anniversaryAudio;
    
    // If music should be playing, start it
    if(sessionStorage.getItem(MUSIC_KEY) === '1'){
      const savedTime = parseFloat(sessionStorage.getItem(MUSIC_TIME_KEY)) || 0;
      audio.currentTime = savedTime;
      audio.play().catch(e => console.log('Error reproduint àudio:', e));
      
      // Update time periodically
      setInterval(() => {
        if(!audio.paused){
          sessionStorage.setItem(MUSIC_TIME_KEY, audio.currentTime.toString());
        }
      }, 1000);
    }
    
    // Expose function to start music
    window.startAnniversaryMusic = function(){
      sessionStorage.setItem(MUSIC_KEY, '1');
      sessionStorage.setItem(MUSIC_TIME_KEY, '0');
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Error reproduint àudio:', e));
      
      // Update time periodically
      setInterval(() => {
        if(!audio.paused){
          sessionStorage.setItem(MUSIC_TIME_KEY, audio.currentTime.toString());
        }
      }, 1000);
    };
    
  }catch(e){ console.error('Background music error', e); }
})();

/* Smooth navigation without page reload to keep music playing */
(function smoothNavigation(){
  try{
    // Intercept all navigation links
    document.addEventListener('click', function(e){
      const link = e.target.closest('a[href$=".html"]');
      if(!link) return;
      
      const href = link.getAttribute('href');
      if(!href || href.startsWith('http')) return;
      
      e.preventDefault();
      
      // Load page content via fetch
      fetch(href)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Get new body content and id
          const newBodyId = doc.body.id;
          const newMain = doc.querySelector('main') || doc.querySelector('body > *:not(nav):not(footer)');
          const currentMain = document.querySelector('main') || document.querySelector('body > *:not(nav):not(footer)');
          
          // Update body id
          if(newBodyId) document.body.id = newBodyId;
          
          // Update main content
          if(newMain && currentMain){
            currentMain.innerHTML = newMain.innerHTML;
            
            // Re-execute scripts for the new page
            const scripts = currentMain.querySelectorAll('script');
            scripts.forEach(oldScript => {
              const newScript = document.createElement('script');
              Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
              });
              newScript.textContent = oldScript.textContent;
              oldScript.parentNode.replaceChild(newScript, oldScript);
            });
            
            // Trigger page-specific initialization
            if(window.initPageContent) window.initPageContent();
          }
          
          // Update active nav link
          document.querySelectorAll('.topnav a').forEach(a => {
            a.classList.remove('active');
            if(a.getAttribute('href') === href) a.classList.add('active');
          });
          
          // Update URL without reload
          window.history.pushState({page: href}, '', href);
          
          // Scroll to top
          window.scrollTo(0, 0);
        })
        .catch(err => {
          console.error('Error loading page:', err);
          // Fallback to normal navigation
          window.location.href = href;
        });
    });
    
    // Handle back/forward buttons
    window.addEventListener('popstate', function(e){
      if(e.state && e.state.page){
        window.location.reload();
      }
    });
    
  }catch(e){ console.error('Smooth navigation error', e); }
})();

/* Entrance gate: modal asking for a secret word before showing content */
(function entranceGate(){
  try{
    const SECRET = 'mixeta'; // change this to your desired secret word (lowercase)
    const STORAGE_KEY = 'anniv_unlocked';

    // If already unlocked in this session, skip
    if(sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)) return;

    // Create overlay
    const overlay = document.createElement('div'); overlay.id = 'entranceGate';
    overlay.innerHTML = `
      <div class="eg-modal" role="dialog" aria-modal="true" aria-labelledby="eg-title">
        <h2 id="eg-title">Paraula secreta</h2>
        <p class="eg-desc">Introdueix la paraula secreta per entrar.</p>
        <input id="eg-input" type="password" placeholder="Paraula secreta" autocomplete="off" />
        <div class="eg-actions"><button id="eg-submit" class="btn">Entrar</button><button id="eg-clear" class="btn secondary">Esborra</button></div>
        <div class="eg-error" aria-live="polite"></div>
      </div>`;

    document.documentElement.appendChild(overlay);

    const input = overlay.querySelector('#eg-input');
    const submit = overlay.querySelector('#eg-submit');
    const clear = overlay.querySelector('#eg-clear');
    const err = overlay.querySelector('.eg-error');

    // Focus input
    setTimeout(()=> input.focus(), 80);

    function showWelcome(){
      const hero = document.querySelector('.hero-inner');
      if(!hero) return;
      const w = document.createElement('div'); w.className = 'welcome-msg';
      w.textContent = 'Hola carinyo ja estàs dins de la meva sorpresa, espero que t\'agradi! 💖';
      hero.insertBefore(w, hero.firstChild);
      setTimeout(()=> w.classList.add('visible'), 50);
    }

    function unlock(){
      sessionStorage.setItem(STORAGE_KEY, '1');
      overlay.classList.add('eg-hidden');
      setTimeout(()=> overlay.remove(), 450);
      showWelcome();
      
      // Inicia la música de fons
      if(window.startAnniversaryMusic){
        window.startAnniversaryMusic();
      }
    }

    submit.addEventListener('click', ()=>{
      const val = (input.value || '').trim().toLowerCase();
      if(!val){ err.textContent = 'Introdueix la paraula.'; input.focus(); return; }
      if(val === SECRET){ unlock(); }
      else{ err.textContent = 'Paraula incorrecta. Torna-ho a provar.'; overlay.classList.add('eg-shake'); setTimeout(()=> overlay.classList.remove('eg-shake'),500); input.focus(); }
    });

    input.addEventListener('keyup', e=>{ if(e.key === 'Enter') submit.click(); });
    clear.addEventListener('click', ()=>{ input.value = ''; input.focus(); err.textContent = ''; });

    // prevent tabbing to page content while modal is open
    document.addEventListener('focus', function trapFocus(e){
      if(!overlay.contains(e.target)){
        e.stopPropagation(); overlay.querySelector('#eg-input').focus();
      }
    }, true);

  }catch(e){ console.error('Entrance gate init error', e); }
})();
