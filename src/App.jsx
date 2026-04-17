import React, { useState, useEffect } from 'react';
import { 
  MonitorPlay, Clock, CloudSun, User, 
  Type, Radio, Settings, Search, Cloud, Sun, CloudRain, 
  Snowflake, Zap, AlignLeft, AlignCenter, AlignRight, Play, Square,
  Globe, Send, AlertCircle, EyeOff, Link, Check
} from 'lucide-react';

// --- COMPONENTES DEL OVERLAY ---
const OverlayTitle = ({ title }) => {
  const isActive = title.active;
  const transitionClasses = `absolute bottom-24 left-10 flex flex-col items-start z-20 transition-all duration-500 ease-out transform ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`;

  if (title.design === 'news') {
    return (
      <div className={transitionClasses}>
        <div className="bg-red-600 text-white px-4 py-1 text-sm font-bold tracking-wider uppercase shadow-lg z-30 relative">
          ALERTA
        </div>
        {title.subtext && (
          <div className="bg-gray-900/95 text-white px-6 py-1 text-lg max-w-2xl shadow-xl border-l-8 border-gray-900 z-10 relative">
            {title.subtext}
          </div>
        )}
        <div className="bg-white text-black px-6 py-2 text-3xl font-extrabold shadow-xl uppercase max-w-2xl border-l-8 border-red-600 z-20 relative">
          {title.text}
        </div>
      </div>
    );
  }

  if (title.design === 'modern') {
    return (
      <div className={transitionClasses}>
        {title.subtext && (
          <div className="backdrop-blur-md bg-white/95 text-blue-950 px-8 py-2 rounded-t-xl text-lg font-medium shadow-2xl max-w-2xl border-b border-gray-200">
            {title.subtext}
          </div>
        )}
        <div className={`backdrop-blur-md bg-blue-900/90 text-white px-8 py-3 text-3xl font-bold shadow-2xl border border-blue-400/30 ${title.subtext ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl'}`}>
          {title.text}
        </div>
      </div>
    );
  }

  if (title.design === 'elegant') {
    return (
      <div className={transitionClasses}>
        <div className="bg-gradient-to-r from-black/90 via-black/70 to-transparent p-6 border-l-4 border-yellow-500 max-w-3xl">
          {title.subtext && (
            <p className="text-gray-300 text-xl font-light mb-1 shadow-black drop-shadow-md">
              {title.subtext}
            </p>
          )}
          <h1 className="text-4xl text-yellow-500 font-serif font-bold tracking-wide shadow-black drop-shadow-md">
            {title.text}
          </h1>
        </div>
      </div>
    );
  }

  return null;
};

const OverlayHost = ({ position, data }) => {
  let posClass = "";
  let transformValue = `translateX(${data.xOffset}px)`;
  
  if (position === 'left') posClass = "left-10";
  if (position === 'center') {
    posClass = "left-1/2";
    transformValue = `translateX(calc(-50% + ${data.xOffset}px))`;
  }
  if (position === 'right') posClass = "right-10";

  return (
    <div className={`absolute bottom-10 ${posClass} z-20 transition-all duration-500 ease-out transform ${data.active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <div style={{ transform: transformValue, transition: 'transform 0.1s ease-out' }}>
        <div className="flex items-center bg-gray-900/90 rounded-full pr-6 pl-2 py-1.5 shadow-xl border border-gray-700/50 backdrop-blur-sm">
          {data.avatar ? (
            <img src={data.avatar} alt={data.name} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-600 shadow-md bg-gray-800" />
          ) : (
            <div className="bg-blue-600 rounded-full p-2 mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">{data.name}</span>
            <span className="text-gray-400 text-xs font-medium leading-tight">{data.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('titles');
  const [linkCopied, setLinkCopied] = useState(false);

  // ESTADO GLOBAL DEL OVERLAY
  const [isLive, setIsLive] = useState(false);
  const [clockActive, setClockActive] = useState(true);
  
  // ZÓCALOS
  const [titleDraft, setTitleDraft] = useState({
    text: 'TÍTULO PRINCIPAL',
    subtext: 'SUBTÍTULO O VOLANTA AQUÍ',
    design: 'news'
  });
  const [titleLive, setTitleLive] = useState({
    active: false,
    text: 'TÍTULO PRINCIPAL',
    subtext: 'SUBTÍTULO O VOLANTA AQUÍ',
    design: 'news'
  });

  // TICKER
  const [tickerDraft, setTickerDraft] = useState('ÚLTIMO MOMENTO: Sintoniza nuestra nueva programación a las 10 AM. | WhatsApp: +54 9 11 1234-5678 | ');
  const [tickerLive, setTickerLive] = useState({
    active: false,
    text: 'ÚLTIMO MOMENTO: Sintoniza nuestra nueva programación a las 10 AM. | WhatsApp: +54 9 11 1234-5678 | '
  });

  // LOCUTORES
  const [hosts, setHosts] = useState({
    left: { active: false, name: 'Juan Pérez', role: 'Conductor', avatar: '', xOffset: 0 },
    center: { active: false, name: 'Ana Gómez', role: 'Co-conductora', avatar: '', xOffset: 0 },
    right: { active: false, name: 'Carlos Ruiz', role: 'Deportes', avatar: '', xOffset: 0 }
  });

  const hideAllHosts = () => {
    setHosts(prev => ({
      left: { ...prev.left, active: false },
      center: { ...prev.center, active: false },
      right: { ...prev.right, active: false }
    }));
  };

  // CLIMA
  const [weather, setWeather] = useState({
    active: true,
    query: '',
    results: [],
    selectedCity: { name: 'Buenos Aires', country: 'Argentina', latitude: -34.61315, longitude: -58.37723 },
    current: { temp: 22, code: 0 },
    isLoading: false,
    error: ''
  });

  const [previewBg, setPreviewBg] = useState('image');

  const handleCopyLink = () => {
    const textArea = document.createElement("textarea");
    textArea.value = window.location.href; 
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000); 
    } catch (err) {
      console.error('Error al copiar el enlace', err);
    }
    document.body.removeChild(textArea);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (weather.selectedCity.latitude) {
      fetchWeather(weather.selectedCity.latitude, weather.selectedCity.longitude);
    }
  }, [weather.selectedCity]);

  const searchCity = async (e) => {
    e.preventDefault();
    if (!weather.query.trim()) return;
    
    setWeather(prev => ({ ...prev, isLoading: true, results: [], error: '' }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(weather.query)}&addressdetails=1&limit=5`, {
        headers: { 'Accept-Language': 'es' }
      });
      const data = await res.json();
      
      if (data && data.length > 0) {
        const formattedResults = data.map(d => ({
            name: d.name || d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || d.display_name.split(',')[0],
            admin1: d.address?.state || d.address?.region || d.address?.county,
            country: d.address?.country,
            latitude: parseFloat(d.lat),
            longitude: parseFloat(d.lon),
            displayName: d.display_name
        }));
        setWeather(prev => ({ ...prev, results: formattedResults, isLoading: false }));
      } else {
        setWeather(prev => ({ ...prev, isLoading: false, error: 'No se encontró la ciudad.' }));
      }
    } catch (error) {
      console.error("Error buscando ciudad", error);
      setWeather(prev => ({ ...prev, isLoading: false, error: 'Error de conexión.' }));
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data.current_weather) {
         setWeather(prev => ({ ...prev, current: { temp: data.current_weather.temperature, code: data.current_weather.weathercode } }));
      }
    } catch (error) {
      console.error("Error obteniendo clima", error);
    }
  };

  const selectCity = (city) => {
    setWeather(prev => ({ 
      ...prev, selectedCity: city, results: [], query: '', error: ''
    }));
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-5 h-5 text-yellow-400" />;
    if (code > 0 && code < 4) return <CloudSun className="w-5 h-5 text-gray-200" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-300" />;
    if (code >= 71 && code <= 77) return <Snowflake className="w-5 h-5 text-white" />;
    if (code >= 95) return <Zap className="w-5 h-5 text-yellow-500" />;
    return <Cloud className="w-5 h-5 text-gray-300" />;
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* PANEL DE CONTROL */}
      <div className="w-[400px] bg-gray-900 border-r border-gray-800 flex flex-col z-10 shadow-2xl">
        <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold">RadioPanel Pro</h1>
          </div>
          <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors border border-gray-700" title="Copiar enlace web actual">
            {linkCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link className="w-3.5 h-3.5" />}
            {linkCopied ? <span className="text-green-500 font-medium">¡Copiado!</span> : 'Copiar Link'}
          </button>
        </div>

        <div className="flex border-b border-gray-800 bg-gray-900/50">
          <button onClick={() => setActiveTab('titles')} className={`flex-1 p-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'titles' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <Type className="w-4 h-4" /> Títulos
          </button>
          <button onClick={() => setActiveTab('hosts')} className={`flex-1 p-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'hosts' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <User className="w-4 h-4" /> Locutores
          </button>
          <button onClick={() => setActiveTab('widgets')} className={`flex-1 p-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'widgets' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <Settings className="w-4 h-4" /> Widgets
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* TAB TÍTULOS */}
          {activeTab === 'titles' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold flex items-center gap-2"><Type className="w-4 h-4 text-blue-400"/> Zócalo Principal</h3>
                   {titleLive.active && <span className="flex items-center gap-1 text-[10px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded uppercase font-bold border border-red-500/30 animate-pulse"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> AL AIRE</span>}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Diseño (Borrador)</label>
                    <div className="flex gap-2">
                      {['news', 'modern', 'elegant'].map(d => (
                        <button key={d} onClick={() => setTitleDraft({...titleDraft, design: d})} className={`flex-1 py-1.5 text-xs rounded capitalize border transition-colors ${titleDraft.design === d ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                          {d === 'news' ? 'Noticias' : d === 'modern' ? 'Moderno' : 'Elegante'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Subtítulo (Volanta - Arriba)</label>
                    <textarea value={titleDraft.subtext} onChange={(e) => setTitleDraft({...titleDraft, subtext: e.target.value})} rows={2} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none resize-none" placeholder="Opcional..." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Título Principal (Abajo)</label>
                    <input type="text" value={titleDraft.text} onChange={(e) => setTitleDraft({...titleDraft, text: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none font-bold" placeholder="Escribe aquí..." />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <button onClick={() => setTitleLive({...titleDraft, active: true})} className={`flex-1 py-2.5 rounded font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${titleLive.active ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                      {titleLive.active ? <><Send className="w-4 h-4"/> Actualizar Textos</> : <><Play className="w-4 h-4 fill-current"/> Enviar al Aire</>}
                    </button>
                    <button onClick={() => setTitleLive(prev => ({...prev, active: false}))} disabled={!titleLive.active} className={`px-4 py-2.5 rounded font-bold flex justify-center items-center transition-all ${titleLive.active ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg' : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'}`} title="Quitar de pantalla">
                      <Square className="w-4 h-4 fill-current"/>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold flex items-center gap-2"><AlignLeft className="w-4 h-4 text-blue-400"/> Cinta Inferior (Ticker)</h3>
                   {tickerLive.active && <span className="flex items-center gap-1 text-[10px] bg-red-600/20 text-red-500 px-2 py-0.5 rounded uppercase font-bold border border-red-500/30 animate-pulse"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> AL AIRE</span>}
                </div>
                <textarea value={tickerDraft} onChange={(e) => setTickerDraft(e.target.value)} rows={3} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none mb-3 resize-none" placeholder="Texto desplazable (Borrador)..." />
                <div className="flex gap-2">
                  <button onClick={() => setTickerLive({ text: tickerDraft, active: true })} className={`flex-1 py-2 rounded font-bold flex justify-center items-center gap-2 transition-all ${tickerLive.active ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                    {tickerLive.active ? <><Send className="w-4 h-4"/> Actualizar Cinta</> : <><Play className="w-4 h-4 fill-current"/> Enviar Cinta</>}
                  </button>
                  <button onClick={() => setTickerLive(prev => ({...prev, active: false}))} disabled={!tickerLive.active} className={`px-4 py-2 rounded font-bold flex justify-center items-center transition-all ${tickerLive.active ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'}`}>
                    <Square className="w-4 h-4 fill-current"/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB LOCUTORES */}
          {activeTab === 'hosts' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                 <h3 className="font-semibold text-gray-300">Gestión de Locutores</h3>
                 <button onClick={hideAllHosts} className="text-xs bg-red-600/20 text-red-500 px-3 py-1.5 rounded hover:bg-red-600/40 transition-colors border border-red-500/30 flex items-center gap-1 font-bold">
                   <EyeOff className="w-3 h-3"/> Ocultar Todos
                 </button>
              </div>

              {['left', 'center', 'right'].map((pos) => (
                <div key={pos} className={`p-4 rounded-lg border transition-colors ${hosts[pos].active ? 'bg-gray-800 border-gray-600' : 'bg-gray-800/60 border-gray-700'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold capitalize flex items-center gap-2">
                      {pos === 'left' ? <AlignLeft className="w-4 h-4 text-blue-400"/> : pos === 'center' ? <AlignCenter className="w-4 h-4 text-blue-400"/> : <AlignRight className="w-4 h-4 text-blue-400"/>}
                      {pos === 'left' ? 'Izquierda' : pos === 'center' ? 'Centro' : 'Derecha'}
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={hosts[pos].active} onChange={() => setHosts({...hosts, [pos]: {...hosts[pos], active: !hosts[pos].active}})} />
                      <div className="w-9 h-5 bg-gray-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white border border-gray-700"></div>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <input type="text" placeholder="Nombre" value={hosts[pos].name} onChange={(e) => setHosts({...hosts, [pos]: {...hosts[pos], name: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none" />
                    <input type="text" placeholder="Rol / Función" value={hosts[pos].role} onChange={(e) => setHosts({...hosts, [pos]: {...hosts[pos], role: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none" />
                    <input type="text" placeholder="URL de la Foto (Opcional)" value={hosts[pos].avatar} onChange={(e) => setHosts({...hosts, [pos]: {...hosts[pos], avatar: e.target.value}})} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none" />
                    
                    <div className="pt-2 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                       <label className="text-xs text-gray-400 flex justify-between">
                          <span>Ajuste Horizontal</span>
                          <span className="font-mono text-blue-400">{hosts[pos].xOffset}px</span>
                       </label>
                       <input type="range" min="-400" max="400" value={hosts[pos].xOffset} onChange={(e) => setHosts({...hosts, [pos]: {...hosts[pos], xOffset: parseInt(e.target.value)}})} className="w-full h-1.5 mt-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold flex items-center gap-2"><CloudSun className="w-4 h-4 text-blue-400"/> Widget de Clima</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={weather.active} onChange={() => setWeather({...weather, active: !weather.active})} />
                    <div className="w-9 h-5 bg-gray-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white border border-gray-700"></div>
                  </label>
                </div>
                
                <form onSubmit={searchCity} className="relative mb-3 flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Ej: Santa Sylvina, Chaco" value={weather.query} onChange={(e) => setWeather({...weather, query: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded py-2 pl-8 pr-2 text-sm focus:border-blue-500 outline-none" />
                    <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" />
                  </div>
                  <button type="submit" disabled={weather.isLoading} className="bg-blue-600 px-3 rounded text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors">
                    {weather.isLoading ? '...' : 'Buscar'}
                  </button>
                </form>

                {weather.isLoading && <p className="text-xs text-blue-400 mb-2 animate-pulse">Buscando geolocalización...</p>}
                {weather.error && <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{weather.error}</p>}

                {weather.results.length > 0 && (
                  <div className="bg-gray-950 rounded border border-gray-700 max-h-40 overflow-y-auto mb-3 shadow-inner">
                    {weather.results.map((city, idx) => (
                      <button key={idx} onClick={() => selectCity(city)} title={city.displayName} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 border-b border-gray-800 last:border-0 transition-colors">
                        <div className="truncate font-medium">{city.name}</div>
                        <div className="text-gray-500 text-xs truncate">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-gray-900 p-3 rounded flex items-center justify-between mt-2 border border-gray-700/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Ubicación conectada</span>
                    <span className="font-semibold text-sm truncate w-40 text-blue-100">{weather.selectedCity.name}</span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-400">{weather.current.temp}°C</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400"/> Reloj en Pantalla</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={clockActive} onChange={() => setClockActive(!clockActive)} />
                    <div className="w-9 h-5 bg-gray-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white border border-gray-700"></div>
                  </label>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                  <h3 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-red-500"/> Indicador "VIVO"</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isLive} onChange={() => setIsLive(!isLive)} />
                    <div className="w-9 h-5 bg-gray-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white border border-gray-700"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE PREVIEW */}
      <div className="flex-1 flex flex-col bg-gray-950 relative">
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center z-10 w-full shadow-md">
          <div className="flex items-center gap-2 text-gray-400">
            <MonitorPlay className="w-5 h-5" />
            <span className="font-semibold text-sm">Salida de Programa <span className="opacity-50 font-normal">(OBS Capture Area)</span></span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <span className="text-xs text-gray-400 px-2 hidden md:block">Fondo OBS:</span>
            <button onClick={() => setPreviewBg('image')} className={`px-3 py-1 text-xs rounded transition-colors ${previewBg === 'image' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Estudio</button>
            <button onClick={() => setPreviewBg('green')} className={`px-3 py-1 text-xs rounded transition-colors ${previewBg === 'green' ? 'bg-[#00FF00] text-black font-bold' : 'text-gray-400 hover:bg-gray-700'}`}>Chroma Verde</button>
            <button onClick={() => setPreviewBg('black')} className={`px-3 py-1 text-xs rounded transition-colors ${previewBg === 'black' ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Negro</button>
          </div>
          <div className="text-xs text-gray-500 bg-gray-950 px-3 py-1 rounded-full border border-gray-800 hidden lg:block font-mono">
            1920x1080 (16:9)
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-950">
          <div 
            className={`w-full max-w-6xl aspect-video rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden bg-cover bg-center border border-gray-700 transition-colors duration-300 ${previewBg === 'green' ? 'bg-[#00FF00]' : previewBg === 'black' ? 'bg-black' : ''}`}
            style={previewBg === 'image' ? {backgroundImage: `url('https://images.unsplash.com/photo-1598555541604-b9c1d0f5e1ad?q=80&w=1920&auto=format&fit=crop')`} : {}}
          >
            {previewBg === 'image' && <div className="absolute inset-0 bg-black/30"></div>}

            <div className={`absolute top-8 left-8 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded font-bold tracking-widest text-sm shadow-lg z-20 transition-all duration-500 ease-out transform ${isLive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              VIVO
            </div>

            <div className={`absolute top-8 right-8 flex flex-col items-end gap-2 z-20 transition-all duration-500 ease-out transform ${(clockActive || weather.active) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
              
              <div className={`transition-all duration-500 overflow-hidden ${clockActive ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                <div className="flex items-center bg-gray-900/90 rounded-full px-5 py-1.5 shadow-xl border border-gray-700/50 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-white font-bold text-xl tracking-wider">
                    {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
              </div>
              
              <div className={`bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center gap-3 border border-white/10 shadow-lg transition-all duration-500 overflow-hidden ${weather.active ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 py-0 border-transparent shadow-none mt-0'}`}>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-300 font-medium">{weather.selectedCity.name}</span>
                  <span className="font-bold text-lg leading-tight">{weather.current.temp}°C</span>
                </div>
                <div className="bg-gray-800/80 p-2 rounded-full shadow-inner">
                  {getWeatherIcon(weather.current.code)}
                </div>
              </div>
            </div>

            <OverlayTitle title={titleLive} />

            <OverlayHost position="left" data={hosts.left} />
            <OverlayHost position="center" data={hosts.center} />
            <OverlayHost position="right" data={hosts.right} />

            <div className={`absolute bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-md border-t border-gray-800/50 flex items-center text-white overflow-hidden z-30 shadow-2xl transition-all duration-500 ease-in-out ${tickerLive.active ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <div className="bg-blue-600 h-full px-6 flex items-center font-bold text-sm whitespace-nowrap z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)] tracking-wide">
                ÚLTIMA HORA
              </div>
              <div className="whitespace-nowrap flex-1 overflow-hidden relative">
                 <div className="inline-block animate-marquee pl-4 text-sm font-medium tracking-wide opacity-90">
                   {tickerLive.text} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; {tickerLive.text} &nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp; {tickerLive.text}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(50%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
      `}} />
    </div>
  );
}
