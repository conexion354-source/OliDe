(function () {
  const STORAGE_KEY = 'olide-tv-panel-state-v1';
  const CHANNEL_NAME = 'olide-tv-panel';
  const isOverlay = location.pathname.endsWith('overlay-tv.html');
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

  const defaultState = {
    programName: 'FM APOCALIPSIS 100.7',
    strap: 'EN VIVO',
    theme: 'red',
    city: 'Buenos Aires',
    weather: '18°C · Parcialmente nublado',
    showClock: true,
    showWeather: true,
    title1: 'Bienvenidos a la transmisión especial',
    title2: 'Último momento en desarrollo',
    title3: 'En minutos entrevista exclusiva',
    activeSlot: '1',
    slot1Enabled: true,
    slot2Enabled: false,
    slot3Enabled: false,
    slot1Visible: true,
    slot2Visible: false,
    slot3Visible: false,
    subtitle1: 'Cobertura en vivo desde nuestros estudios',
    subtitle2: 'Toda la información al instante',
    subtitle3: 'Preparando el próximo bloque al aire',
    overlayVisible: true
  };

  function mergeState(base, extra) {
    return Object.assign({}, base, extra || {});
  }

  function parseBool(v, fallback) {
    if (v === '1' || v === 'true') return true;
    if (v === '0' || v === 'false') return false;
    return fallback;
  }

  function loadState() {
    let state = { ...defaultState };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = mergeState(state, JSON.parse(raw));
    } catch {}

    const q = new URLSearchParams(location.search);
    if ([...q.keys()].length) {
      state = mergeState(state, {
        programName: q.get('programName') || state.programName,
        strap: q.get('strap') || state.strap,
        theme: q.get('theme') || state.theme,
        city: q.get('city') || state.city,
        weather: q.get('weather') || state.weather,
        showClock: parseBool(q.get('showClock'), state.showClock),
        showWeather: parseBool(q.get('showWeather'), state.showWeather),
        title1: q.get('title1') || state.title1,
        title2: q.get('title2') || state.title2,
        title3: q.get('title3') || state.title3,
        activeSlot: q.get('activeSlot') || state.activeSlot,
        slot1Enabled: parseBool(q.get('slot1Enabled'), state.slot1Enabled),
        slot2Enabled: parseBool(q.get('slot2Enabled'), state.slot2Enabled),
        slot3Enabled: parseBool(q.get('slot3Enabled'), state.slot3Enabled),
        slot1Visible: parseBool(q.get('slot1Visible'), state.slot1Visible),
        slot2Visible: parseBool(q.get('slot2Visible'), state.slot2Visible),
        slot3Visible: parseBool(q.get('slot3Visible'), state.slot3Visible),
        subtitle1: q.get('subtitle1') || state.subtitle1,
        subtitle2: q.get('subtitle2') || state.subtitle2,
        subtitle3: q.get('subtitle3') || state.subtitle3,
        overlayVisible: parseBool(q.get('overlayVisible'), state.overlayVisible)
      });
    }
    return state;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (bc) bc.postMessage(state);
  }

  function nowText() {
    const d = new Date();
    return {
      time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      date: d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })
    };
  }

  function activeTitle(state) {
    const enabled = state['slot' + state.activeSlot + 'Enabled'];
    const visible = state['slot' + state.activeSlot + 'Visible'];
    if (!enabled || !visible) return '';
    return state['title' + state.activeSlot] || '';
  }

  function activeSubtitle(state) {
    const enabled = state['slot' + state.activeSlot + 'Enabled'];
    const visible = state['slot' + state.activeSlot + 'Visible'];
    if (!enabled || !visible) return '';
    return state['subtitle' + state.activeSlot] || '';
  }

  function overlayLink(state) {
    const url = new URL('./overlay-tv.html', location.href);
    Object.entries(state).forEach(([k, v]) => url.searchParams.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v)));
    return url.toString();
  }

  function slotCard(index, state) {
    return `
      <div class="slot ${state.activeSlot === String(index) ? 'active' : ''}" data-slot="${index}">
        <div class="slot-head">
          <div class="slot-title">Titulo ${index}</div>
          <label class="toggle"><input type="radio" name="activeSlot" value="${index}" ${state.activeSlot === String(index) ? 'checked' : ''}> Aire</label>
        </div>
        <div class="field">
          <span>Texto principal</span>
          <textarea class="textarea" data-field="title${index}">${state['title' + index]}</textarea>
        </div>
        <div class="field">
          <span>Texto secundario</span>
          <input class="input" data-field="subtitle${index}" value="${state['subtitle' + index]}">
        </div>
        <div class="mini-actions">
          <button class="btn secondary" data-action="enable${index}">${state['slot' + index + 'Enabled'] ? 'Activo' : 'Inactivo'}</button>
          <button class="btn secondary" data-action="visible${index}">${state['slot' + index + 'Visible'] ? 'Mostrar' : 'Oculto'}</button>
          <button class="btn secondary" data-action="take${index}">Lanzar</button>
        </div>
      </div>`;
  }

  function renderControl() {
    let state = loadState();
    const app = document.getElementById('app');

    function paint() {
      const currentTitle = activeTitle(state) || 'Ningun titulo visible';
      const currentSub = activeSubtitle(state) || 'Activa y muestra uno de los zocalos para mandarlo al aire';
      app.innerHTML = `
        <div class="wrap theme-${state.theme}">
          <div class="top">
            <div>
              <div class="eyebrow">Panel TV</div>
              <div class="brand">${state.programName}</div>
            </div>
            <div class="status"><span class="led ${state.overlayVisible ? 'live' : ''}"></span>${state.overlayVisible ? 'Al aire' : 'Oculto'}</div>
          </div>
          <div class="tabs">
            <div class="tab active" id="tabOp">Operacion</div>
            <div class="tab" id="tabSetup">Setup</div>
          </div>
          <div class="panel-op">
            <div class="section stack">
              <div class="label">Titulos</div>
              ${slotCard(1, state)}
              ${slotCard(2, state)}
              ${slotCard(3, state)}
              <button class="btn live ${state.overlayVisible ? '' : 'off'}" id="masterToggle">${state.overlayVisible ? 'AL AIRE' : 'MOSTRAR ZOCALO'}</button>
              <div class="small">Cada titulo tiene activo/inactivo y mostrar/ocultar por separado. Solo sale el que esta seleccionado en aire.</div>
            </div>
            <div class="section">
              <div class="label">Vista rapida</div>
              <div class="preview theme-${state.theme}">
                <div class="preview-card">
                  <div class="tv-top">
                    <div class="tv-info ${state.showClock ? '' : 'overlay-hidden'}"><div class="tv-clock" id="previewClock"></div><div class="tv-weather">${nowText().date}</div></div>
                    <div class="tv-info ${state.showWeather ? '' : 'overlay-hidden'}"><div class="tv-weather">${state.city}<br>${state.weather}</div></div>
                  </div>
                  <div class="lower-third ${state.overlayVisible ? '' : 'overlay-hidden'} ${currentTitle ? '' : 'overlay-hidden'}">
                    <div class="lower-top">${state.strap}</div>
                    <div class="lower-main">
                      <div class="lower-title">${currentTitle}</div>
                      <div class="lower-sub">${currentSub}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="panel-setup">
            <div class="section stack">
              <div class="label">Identidad</div>
              <div class="field"><span>Nombre del programa</span><input class="input" id="programName" value="${state.programName}"></div>
              <div class="field"><span>Barra superior del zocalo</span><input class="input" id="strap" value="${state.strap}"></div>
              <div class="field"><span>Tema</span><select class="select" id="theme"><option value="red">Rojo TV</option><option value="blue">Azul noticias</option><option value="gold">Dorado programa</option><option value="dark">Oscuro premium</option><option value="light">Claro premium</option></select></div>
            </div>
            <div class="section stack">
              <div class="label">Hora y clima arriba</div>
              <div class="field"><span>Ciudad</span><input class="input" id="city" value="${state.city}"></div>
              <div class="field"><span>Clima</span><input class="input" id="weather" value="${state.weather}"></div>
              <div class="row">
                <button class="btn secondary" id="toggleClock">${state.showClock ? 'Hora visible' : 'Hora oculta'}</button>
                <button class="btn secondary" id="toggleWeather">${state.showWeather ? 'Clima visible' : 'Clima oculto'}</button>
              </div>
            </div>
            <div class="section stack">
              <div class="label">Link OBS</div>
              <div class="urlbox"><textarea class="textarea" id="overlayUrl" readonly>${overlayLink(state)}</textarea><button class="btn secondary" id="copyUrl">Copiar</button></div>
              <div class="row"><button class="btn secondary" id="openOverlay">Abrir overlay</button><button class="btn secondary" id="shareUrl">Actualizar URL</button></div>
              <div class="small">En la misma PC el overlay cambia en vivo por sincronizacion local. Para otra PC, copiá este link actualizado.</div>
            </div>
          </div>
        </div>`;

      const themeSel = app.querySelector('#theme');
      if (themeSel) themeSel.value = state.theme;
      const prevClock = app.querySelector('#previewClock');
      if (prevClock) prevClock.textContent = nowText().time;

      bindEvents();
    }

    function update(partial) {
      state = { ...state, ...partial };
      saveState(state);
      paint();
    }

    function bindEvents() {
      app.querySelector('#tabOp').addEventListener('click', () => document.body.classList.remove('show-setup'));
      app.querySelector('#tabSetup').addEventListener('click', () => document.body.classList.add('show-setup'));
      app.querySelector('#masterToggle').addEventListener('click', () => update({ overlayVisible: !state.overlayVisible }));

      app.querySelectorAll('input[name="activeSlot"]').forEach(el => el.addEventListener('change', (e) => update({ activeSlot: e.target.value })));
      app.querySelectorAll('[data-field]').forEach(el => el.addEventListener(el.tagName === 'TEXTAREA' ? 'input' : 'input', (e) => update({ [e.target.dataset.field]: e.target.value })));

      [1,2,3].forEach(i => {
        app.querySelector(`[data-action="enable${i}"]`).addEventListener('click', () => update({ ['slot' + i + 'Enabled']: !state['slot' + i + 'Enabled'] }));
        app.querySelector(`[data-action="visible${i}"]`).addEventListener('click', () => update({ ['slot' + i + 'Visible']: !state['slot' + i + 'Visible'] }));
        app.querySelector(`[data-action="take${i}"]`).addEventListener('click', () => update({ activeSlot: String(i), overlayVisible: true }));
      });

      const bindInput = (id, key) => {
        const el = app.querySelector('#' + id);
        if (el) el.addEventListener('input', (e) => update({ [key]: e.target.value }));
      };
      bindInput('programName', 'programName');
      bindInput('strap', 'strap');
      bindInput('city', 'city');
      bindInput('weather', 'weather');
      const theme = app.querySelector('#theme');
      if (theme) theme.addEventListener('change', (e) => update({ theme: e.target.value }));
      const tClock = app.querySelector('#toggleClock');
      if (tClock) tClock.addEventListener('click', () => update({ showClock: !state.showClock }));
      const tWeather = app.querySelector('#toggleWeather');
      if (tWeather) tWeather.addEventListener('click', () => update({ showWeather: !state.showWeather }));
      const copy = app.querySelector('#copyUrl');
      if (copy) copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(overlayLink(state)); } catch {} });
      const open = app.querySelector('#openOverlay');
      if (open) open.addEventListener('click', () => window.open(overlayLink(state), '_blank'));
      const share = app.querySelector('#shareUrl');
      if (share) share.addEventListener('click', () => update({}));
    }

    paint();
    setInterval(() => {
      const prevClock = app.querySelector('#previewClock');
      if (prevClock) prevClock.textContent = nowText().time;
    }, 1000);
  }

  function renderOverlay() {
    let state = loadState();
    const app = document.getElementById('app');

    function barClass(theme) {
      if (theme === 'blue') return 'blue';
      if (theme === 'gold') return 'gold';
      if (theme === 'dark') return 'dark';
      if (theme === 'light') return 'light';
      return 'red';
    }

    function paint() {
      const currentTitle = activeTitle(state);
      const currentSub = activeSubtitle(state);
      const t = nowText();
      app.innerHTML = `
        <div class="overlay-stage theme-${state.theme}">
          <div class="overlay-wrap">
            <div class="overlay-topbar">
              <div class="overlay-chip ${state.showClock ? '' : 'overlay-hidden'}"><div class="overlay-clock">${t.time}</div><div class="overlay-meta">${t.date}</div></div>
              <div class="overlay-chip ${state.showWeather ? '' : 'overlay-hidden'}"><div class="overlay-meta">${state.city} · ${state.weather}</div></div>
              <div class="overlay-logo">${state.programName}</div>
            </div>
            <div class="overlay-lower ${state.overlayVisible && currentTitle ? '' : 'overlay-hidden'}">
              <div class="bar ${barClass(state.theme)}">${state.strap}</div>
              <div class="overlay-main">
                <div class="overlay-title">${currentTitle}</div>
                <div class="overlay-sub">${currentSub}</div>
              </div>
            </div>
          </div>
        </div>`;
    }

    function applyState(next) {
      state = mergeState(defaultState, next);
      paint();
    }

    paint();
    setInterval(paint, 1000);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { applyState(JSON.parse(e.newValue)); } catch {}
      }
    });
    if (bc) bc.onmessage = (e) => applyState(e.data || {});
  }

  if (isOverlay) renderOverlay();
  else renderControl();
})();
