(function () {
  const isOverlay = location.pathname.endsWith('overlay-remoto.html');

  function nowParts() {
    const d = new Date();
    return {
      time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      date: d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })
    };
  }

  function getQueryState() {
    const p = new URLSearchParams(location.search);
    return {
      title1: p.get('title1') || 'Bienvenidos',
      title2: p.get('title2') || 'Último momento',
      title3: p.get('title3') || 'En minutos',
      active: p.get('active') || '1',
      visible: p.get('visible') === '0' ? '0' : '1',
      subtitle: p.get('subtitle') || 'Panel compacto para aire',
      city: p.get('city') || 'Buenos Aires',
      weather: p.get('weather') || '18°C · Parcialmente nublado',
      theme: p.get('theme') || 'red',
      showClock: p.get('showClock') === '0' ? '0' : '1',
      showWeather: p.get('showWeather') === '0' ? '0' : '1'
    };
  }

  function activeText(state) {
    return state['title' + state.active] || '';
  }

  function buildOverlayUrl(state) {
    const url = new URL('./overlay-remoto.html', location.href);
    Object.entries(state).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  }

  function renderControl() {
    const root = document.getElementById('app');
    const state = getQueryState();
    root.innerHTML = `
      <div class="shell">
        <div class="topbar">
          <div>
            <div class="kicker">PRODUCCION</div>
            <div class="title-main">Panel OBS Pro</div>
          </div>
          <div class="status"><span class="dot ${state.visible === '1' ? 'live' : ''}" id="stateDot"></span><span id="stateText">${state.visible === '1' ? 'Al aire' : 'Standby'}</span></div>
        </div>
        <div class="tabs">
          <div class="tab active" id="tabOperation">Operacion</div>
          <div class="tab" id="tabSetup">Setup</div>
        </div>
        <div class="operation">
          <div class="section">
            <div class="label">Zocalo</div>
            <div class="title-grid">
              <button class="pill ${state.active === '1' ? 'active' : ''}" data-choose="1">Titulo 1</button>
              <button class="pill ${state.active === '2' ? 'active' : ''}" data-choose="2">Titulo 2</button>
              <button class="pill ${state.active === '3' ? 'active' : ''}" data-choose="3">Titulo 3</button>
            </div>
            <label class="field-label">Titulo 1</label>
            <textarea class="textarea" id="title1">${state.title1}</textarea>
            <label class="field-label">Titulo 2</label>
            <textarea class="textarea" id="title2">${state.title2}</textarea>
            <label class="field-label">Titulo 3</label>
            <textarea class="textarea" id="title3">${state.title3}</textarea>
            <label class="field-label">Subtitulo</label>
            <input class="input" id="subtitle" value="${state.subtitle}">
            <div style="margin-top:16px;"><button class="big-btn ${state.visible === '1' ? '' : 'off'}" id="toggleLive">${state.visible === '1' ? 'MANDAR AL VIVO' : 'MOSTRAR'}</button></div>
            <div class="inline"><input class="checkbox" type="checkbox" id="visibleCheck" ${state.visible === '1' ? 'checked' : ''}> <span>Visible en overlay</span></div>
          </div>
          <div class="section">
            <div class="label">CLIMA Y HORA</div>
            <label class="field-label">Ciudad</label>
            <input class="input" id="city" value="${state.city}">
            <label class="field-label">Clima</label>
            <input class="input" id="weather" value="${state.weather}">
            <div class="inline"><input class="checkbox" type="checkbox" id="showClock" ${state.showClock === '1' ? 'checked' : ''}> <span>Mostrar hora</span></div>
            <div class="inline"><input class="checkbox" type="checkbox" id="showWeather" ${state.showWeather === '1' ? 'checked' : ''}> <span>Mostrar clima</span></div>
          </div>
        </div>
        <div class="setup">
          <div class="section">
            <div class="label">Tema</div>
            <select class="select" id="theme">
              <option value="red">Rojo urgente</option>
              <option value="blue">Azul noticias</option>
              <option value="gold">Dorado programa</option>
              <option value="dark">Oscuro estudio</option>
              <option value="light">Claro limpio</option>
            </select>
          </div>
          <div class="section">
            <div class="label">Link para OBS</div>
            <div class="copybox">
              <textarea class="textarea" id="overlayUrl" readonly></textarea>
              <button class="copybtn" id="copyUrl">Copiar</button>
            </div>
            <div class="muted">Pegá este link en Browser Source de OBS. Sirve desde otra PC porque el estado viaja en la URL.</div>
            <div style="margin-top:12px"><button class="smallbtn" id="openOverlay">Abrir overlay</button></div>
          </div>
        </div>
      </div>`;

    const theme = root.querySelector('#theme');
    theme.value = state.theme;

    function collect() {
      return {
        title1: root.querySelector('#title1').value,
        title2: root.querySelector('#title2').value,
        title3: root.querySelector('#title3').value,
        active: state.active,
        visible: root.querySelector('#visibleCheck').checked ? '1' : '0',
        subtitle: root.querySelector('#subtitle').value,
        city: root.querySelector('#city').value,
        weather: root.querySelector('#weather').value,
        theme: root.querySelector('#theme').value,
        showClock: root.querySelector('#showClock').checked ? '1' : '0',
        showWeather: root.querySelector('#showWeather').checked ? '1' : '0'
      };
    }

    function syncUrl() {
      const next = collect();
      next.active = state.active;
      const url = new URL(location.href);
      Object.entries(next).forEach(([k, v]) => url.searchParams.set(k, v));
      history.replaceState(null, '', url);
      root.querySelector('#overlayUrl').value = buildOverlayUrl(next);
      root.querySelector('#stateDot').classList.toggle('live', next.visible === '1');
      root.querySelector('#stateText').textContent = next.visible === '1' ? 'Al aire' : 'Standby';
      root.querySelector('#toggleLive').classList.toggle('off', next.visible !== '1');
      root.querySelector('#toggleLive').textContent = next.visible === '1' ? 'MANDAR AL VIVO' : 'MOSTRAR';
    }

    root.querySelectorAll('[data-choose]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.active = btn.dataset.choose;
        root.querySelectorAll('[data-choose]').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        syncUrl();
      });
    });

    ['title1','title2','title3','subtitle','city','weather','theme','showClock','showWeather','visibleCheck'].forEach(id => {
      const el = root.querySelector('#' + id);
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', syncUrl);
    });

    root.querySelector('#toggleLive').addEventListener('click', () => {
      const chk = root.querySelector('#visibleCheck');
      chk.checked = !chk.checked;
      syncUrl();
    });

    root.querySelector('#tabOperation').addEventListener('click', () => {
      document.body.classList.remove('show-setup');
      root.querySelector('#tabOperation').classList.add('active');
      root.querySelector('#tabSetup').classList.remove('active');
    });
    root.querySelector('#tabSetup').addEventListener('click', () => {
      document.body.classList.add('show-setup');
      root.querySelector('#tabSetup').classList.add('active');
      root.querySelector('#tabOperation').classList.remove('active');
    });

    root.querySelector('#copyUrl').addEventListener('click', async () => {
      const text = root.querySelector('#overlayUrl').value;
      try { await navigator.clipboard.writeText(text); } catch {}
    });
    root.querySelector('#openOverlay').addEventListener('click', () => window.open(root.querySelector('#overlayUrl').value, '_blank'));

    syncUrl();
  }

  function renderOverlay() {
    const root = document.getElementById('overlay-app');
    const state = getQueryState();
    const title = activeText(state);
    root.innerHTML = `
      <div class="overlay-stage theme-${state.theme}">
        <div class="overlay-wrap ${state.visible === '1' ? '' : 'hidden'}" id="wrap">
          <div class="overlay-card">
            <div class="accent">${state.city || 'Programa'}</div>
            <div class="content">
              <div class="headline">${title}</div>
              <div class="support">${state.subtitle}</div>
              <div class="meta">
                <span class="clockbox ${state.showClock === '1' ? '' : 'hidden'}" id="clockMeta"></span>
                <span class="weatherbox ${state.showWeather === '1' ? '' : 'hidden'}">${state.weather}</span>
              </div>
            </div>
          </div>
          <div class="sidebox ${(state.showClock === '1' || state.showWeather === '1') ? '' : 'hidden'}">
            <div class="side-title">En vivo</div>
            <div class="clock ${state.showClock === '1' ? '' : 'hidden'}" id="clockMain"></div>
            <div class="weather ${state.showWeather === '1' ? '' : 'hidden'}">${state.city}<br>${state.weather}</div>
          </div>
        </div>
      </div>`;

    function tick() {
      const t = nowParts();
      const main = root.querySelector('#clockMain');
      const meta = root.querySelector('#clockMeta');
      if (main) main.textContent = t.time;
      if (meta) meta.textContent = t.time + ' · ' + t.date;
    }
    tick();
    setInterval(tick, 1000);
  }

  if (isOverlay) renderOverlay();
  else renderControl();
})();
