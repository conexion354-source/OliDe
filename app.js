const STORAGE_KEY = "panel-obs-pro-state";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const obs = new OBSWebSocket();

const SOURCE_NAMES = {
  title: "obs_titulo",
  weather: "obs_clima",
  clock: "obs_hora",
  logo: "obs_logo",
  alertBg: "obs_alerta_bg",
};

const GROUPS = {
  deportivo: "grupo_deportivo",
  noticiero: "grupo_noticiero",
  minimal: "grupo_minimal",
};

const state = {
  connected: false,
  urgent: false,
  autoClock: false,
  clockInterval: null,
  weatherText: "",
  currentSceneName: "",
};

const els = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".tab-panel"),
  obsLed: document.getElementById("obsLed"),
  obsStatus: document.getElementById("obsStatus"),
  obsHost: document.getElementById("obsHost"),
  obsPort: document.getElementById("obsPort"),
  obsPassword: document.getElementById("obsPassword"),
  connectBtn: document.getElementById("connectBtn"),
  disconnectBtn: document.getElementById("disconnectBtn"),
  themeSelect: document.getElementById("themeSelect"),
  logoToggle: document.getElementById("logoToggle"),
  panicBtn: document.getElementById("panicBtn"),
  titleInput: document.getElementById("titleInput"),
  sendTitleBtn: document.getElementById("sendTitleBtn"),
  titleLiveLed: document.getElementById("titleLiveLed"),
  titleLiveText: document.getElementById("titleLiveText"),
  weatherApiKey: document.getElementById("weatherApiKey"),
  cityInput: document.getElementById("cityInput"),
  searchWeatherBtn: document.getElementById("searchWeatherBtn"),
  sendWeatherBtn: document.getElementById("sendWeatherBtn"),
  weatherTemp: document.getElementById("weatherTemp"),
  weatherDesc: document.getElementById("weatherDesc"),
  weatherIconImg: document.getElementById("weatherIconImg"),
  weatherIconText: document.getElementById("weatherIconText"),
  clockText: document.getElementById("clockText"),
  clockDate: document.getElementById("clockDate"),
  autoClockToggle: document.getElementById("autoClockToggle"),
  sendClockBtn: document.getElementById("sendClockBtn"),
  logOutput: document.getElementById("logOutput"),
};

function log(message, type = "info") {
  const line = document.createElement("div");
  const stamp = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  line.className = "log-line";
  line.innerHTML = `<span class="log-time">${stamp}</span><span class="log-${type}">${message}</span>`;
  els.logOutput.prepend(line);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    host: els.obsHost.value.trim(),
    port: els.obsPort.value.trim(),
    password: els.obsPassword.value,
    title: els.titleInput.value,
    city: els.cityInput.value.trim(),
    apiKey: els.weatherApiKey.value.trim(),
    theme: els.themeSelect.value,
    logo: els.logoToggle.checked,
    autoClock: els.autoClockToggle.checked,
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    els.obsHost.value = "127.0.0.1";
    els.obsPort.value = "4455";
    return;
  }

  try {
    const data = JSON.parse(raw);
    els.obsHost.value = data.host || "127.0.0.1";
    els.obsPort.value = data.port || "4455";
    els.obsPassword.value = data.password || "";
    els.titleInput.value = data.title || "";
    els.cityInput.value = data.city || "";
    els.weatherApiKey.value = data.apiKey || "";
    els.themeSelect.value = data.theme || "deportivo";
    els.logoToggle.checked = !!data.logo;
    els.autoClockToggle.checked = !!data.autoClock;
    state.autoClock = !!data.autoClock;
  } catch {
    log("No se pudo leer localStorage.", "error");
  }
}

function setConnected(connected) {
  state.connected = connected;
  els.obsLed.className = `led ${connected ? "led-on" : "led-off"}`;
  els.obsStatus.textContent = connected ? "Conectado" : "Desconectado";
}

function setTitleLive(active) {
  els.titleLiveLed.className = `led ${active ? "led-live" : "led-off"}`;
  els.titleLiveText.textContent = active ? "En vivo" : "Standby";
  els.sendTitleBtn.classList.toggle("glow", active);
}

function paintClock() {
  const now = new Date();
  els.clockText.textContent = now.toLocaleTimeString("es-AR");
  els.clockDate.textContent = now.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function clockPayload() {
  return new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

async function refreshCurrentScene() {
  const res = await obs.call("GetCurrentProgramScene");
  state.currentSceneName = res.currentProgramSceneName;
  return state.currentSceneName;
}

async function getSceneItemIdBySource(sourceName) {
  const sceneName = state.currentSceneName || await refreshCurrentScene();
  const res = await obs.call("GetSceneItemId", {
    sceneName,
    sourceName
  });
  return { sceneName, sceneItemId: res.sceneItemId };
}

async function obsSetText(inputName, text) {
  if (!state.connected) throw new Error("OBS no conectado");
  await obs.call("SetInputSettings", {
    inputName,
    inputSettings: { text },
    overlay: true
  });
}

async function obsSetVisible(sourceName, enabled) {
  if (!state.connected) throw new Error("OBS no conectado");
  const { sceneName, sceneItemId } = await getSceneItemIdBySource(sourceName);
  await obs.call("SetSceneItemEnabled", {
    sceneName,
    sceneItemId,
    sceneItemEnabled: enabled
  });
}

async function obsSetTitleColor(isUrgent) {
  if (!state.connected) throw new Error("OBS no conectado");

  await obs.call("SetInputSettings", {
    inputName: SOURCE_NAMES.title,
    inputSettings: {
      color: isUrgent ? 255 : 16777215
    },
    overlay: true
  });
}

async function connectOBS() {
  const host = els.obsHost.value.trim() || "127.0.0.1";
  const port = els.obsPort.value.trim() || "4455";
  const pass = els.obsPassword.value;

  saveState();

  try {
    await obs.connect(`ws://${host}:${port}`, pass);
    await refreshCurrentScene();
    setConnected(true);
    log(`Conectado a ws://${host}:${port}`);
    await activateTheme(els.themeSelect.value);
    await syncLogo();
    if (state.autoClock) startAutoClock();
  } catch (err) {
    setConnected(false);
    log(`Error de conexion: ${err.message}`, "error");
  }
}

function disconnectOBS() {
  try { obs.disconnect(); } catch {}
  stopAutoClock(false);
  setConnected(false);
  log("Desconectado de OBS");
}

async function activateTheme(theme) {
  for (const [key, groupName] of Object.entries(GROUPS)) {
    try {
      await obsSetVisible(groupName, key === theme);
    } catch (err) {
      log(`No se pudo cambiar grupo ${groupName}`, "error");
    }
  }
  log(`Tema activo: ${theme}`);
}

async function syncLogo() {
  try {
    await obsSetVisible(SOURCE_NAMES.logo, els.logoToggle.checked);
    log(`Logo ${els.logoToggle.checked ? "encendido" : "apagado"}`);
  } catch (err) {
    log(`No se pudo cambiar logo: ${err.message}`, "error");
  }
}

async function toggleUrgent() {
  state.urgent = !state.urgent;
  els.panicBtn.classList.toggle("glow", state.urgent);

  try {
    await obsSetVisible(SOURCE_NAMES.alertBg, state.urgent);
    await obsSetTitleColor(state.urgent);
    log(`Modo URGENTE ${state.urgent ? "activo" : "apagado"}`);
  } catch (err) {
    log(`No se pudo activar urgente: ${err.message}`, "error");
  }
}

async function sendTitle() {
  const text = els.titleInput.value.trim();
  if (!text) return log("Escribi un titulo.", "error");

  saveState();

  try {
    await obsSetText(SOURCE_NAMES.title, text);
    if (state.urgent) await obsSetTitleColor(true);
    setTitleLive(true);
    log("Titulo enviado a obs_titulo");
  } catch (err) {
    log(`No se pudo enviar titulo: ${err.message}`, "error");
  }
}

async function searchWeather() {
  const apiKey = els.weatherApiKey.value.trim();
  const city = els.cityInput.value.trim();

  if (!apiKey) return log("Falta API Key de OpenWeather.", "error");
  if (!city) return log("Falta ciudad.", "error");

  saveState();

  try {
    const url = new URL(WEATHER_URL);
    url.searchParams.set("q", city);
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "es");

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error OpenWeather");

    const temp = Math.round(data.main.temp);
    const desc = data.weather?.[0]?.description || "Sin datos";
    const icon = data.weather?.[0]?.icon || "";
    const cityName = data.name || city;
    const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : "";

    els.weatherTemp.textContent = `${temp}°C`;
    els.weatherDesc.textContent = desc;
    els.weatherIconText.textContent = icon || "--";

    if (iconUrl) {
      els.weatherIconImg.src = iconUrl;
      els.weatherIconImg.style.display = "inline-block";
    } else {
      els.weatherIconImg.removeAttribute("src");
      els.weatherIconImg.style.display = "none";
    }

    state.weatherText = `${cityName}: ${temp}°C - ${desc} ${icon}`.trim();
    log(`Clima cargado para ${cityName}`);
  } catch (err) {
    log(`No se pudo buscar clima: ${err.message}`, "error");
  }
}

async function sendWeather() {
  if (!state.weatherText) return log("Primero busca el clima.", "error");

  try {
    await obsSetText(SOURCE_NAMES.weather, state.weatherText);
    log("Clima enviado a obs_clima");
  } catch (err) {
    log(`No se pudo enviar clima: ${err.message}`, "error");
  }
}

async function sendClock() {
  try {
    await obsSetText(SOURCE_NAMES.clock, clockPayload());
  } catch (err) {
    log(`No se pudo enviar hora: ${err.message}`, "error");
  }
}

function startAutoClock() {
  stopAutoClock(false);
  state.autoClock = true;
  saveState();

  if (!state.connected) return;

  sendClock();
  state.clockInterval = setInterval(sendClock, 1000);
  log("Sync Auto de hora activado");
}

function stopAutoClock(updateCheckbox = true) {
  if (state.clockInterval) clearInterval(state.clockInterval);
  state.clockInterval = null;
  state.autoClock = false;
  if (updateCheckbox) els.autoClockToggle.checked = false;
}

function bindTabs() {
  els.tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      els.tabs.forEach((t) => t.classList.remove("active"));
      els.panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function bindEvents() {
  bindTabs();

  els.connectBtn.addEventListener("click", connectOBS);
  els.disconnectBtn.addEventListener("click", disconnectOBS);

  els.themeSelect.addEventListener("change", async () => {
    saveState();
    try {
      await activateTheme(els.themeSelect.value);
    } catch (err) {
      log(err.message, "error");
    }
  });

  els.logoToggle.addEventListener("change", async () => {
    saveState();
    await syncLogo();
  });

  els.panicBtn.addEventListener("click", toggleUrgent);
  els.sendTitleBtn.addEventListener("click", sendTitle);
  els.searchWeatherBtn.addEventListener("click", searchWeather);
  els.sendWeatherBtn.addEventListener("click", sendWeather);
  els.sendClockBtn.addEventListener("click", sendClock);

  els.autoClockToggle.addEventListener("change", () => {
    if (els.autoClockToggle.checked) {
      startAutoClock();
    } else {
      stopAutoClock(false);
      saveState();
      log("Sync Auto desactivado");
    }
  });

  [els.obsHost, els.obsPort, els.obsPassword, els.titleInput, els.cityInput, els.weatherApiKey].forEach((el) => {
    el.addEventListener("change", saveState);
  });

  els.cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchWeather();
    }
  });

  obs.on("CurrentProgramSceneChanged", (event) => {
    state.currentSceneName = event.sceneName;
  });

  obs.on("ConnectionClosed", () => {
    setConnected(false);
    stopAutoClock(false);
    log("OBS cerro la conexion", "error");
  });
}

loadState();
bindEvents();
paintClock();
setInterval(paintClock, 1000);
setConnected(false);
setTitleLive(false);
log("Panel listo");
