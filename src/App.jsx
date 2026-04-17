import React, { useState, useEffect } from 'react';

/**
 * RadioPanel Pro - Sistema de Control y Overlay para OBS
 * * INSTRUCCIONES:
 * 1. Pega este código en tu archivo src/App.jsx
 * 2. En OBS, crea una fuente de "Navegador" (Browser Source).
 * 3. Usa el link: https://conexion354-source.github.io/OliDe/?overlay=true
 * 4. Configura el tamaño en OBS como 1920x1080.
 */

export default function App() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [isOverlay, setIsOverlay] = useState(false);
  const [activeTab, setActiveTab] = useState('titulos');
  
  // Datos del Zócalo Principal
  const [zocaloLive, setZocaloLive] = useState(false);
  const [zocaloData, setZocaloData] = useState({
    titulo: 'TÍTULO PRINCIPAL',
    subtitulo: 'SUBTÍTULO O VOLANTA AQUÍ',
    diseno: 'Noticias'
  });

  // Datos de la Cinta (Ticker)
  const [cintaLive, setCintaLive] = useState(false);
  const [cintaTexto, setCintaTexto] = useState('Sigue nuestra programación en vivo por la 94.5 — Noticias, música y mucho más.');

  // Reloj
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2d-digit', minute: '2d-digit' }));

  // --- SINCRONIZACIÓN (LocalStorage) ---
  // Guardar datos cuando cambian (solo en el panel)
  useEffect(() => {
    if (!isOverlay) {
      const state = { zocaloLive, zocaloData, cintaLive, cintaTexto };
      localStorage.setItem('radiopanel_state', JSON.stringify(state));
    }
  }, [zocaloLive, zocaloData, cintaLive, cintaTexto, isOverlay]);

  // Escuchar cambios (solo en el OBS/Overlay)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const overlayMode = params.get('overlay') === 'true';
    setIsOverlay(overlayMode);

    if (overlayMode) {
      const handleStorageChange = () => {
        const saved = localStorage.getItem('radiopanel_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          setZocaloLive(parsed.zocaloLive);
          setZocaloData(parsed.zocaloData);
          setCintaLive(parsed.cintaLive);
          setCintaTexto(parsed.cintaTexto);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      handleStorageChange(); // Carga inicial
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Reloj universal
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2d-digit', minute: '2d-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- VISTA PARA OBS (SOLO GRÁFICOS) ---
  if (isOverlay) {
    return (
      <div className="relative w-full h-screen bg-transparent overflow-hidden font-sans">
        {/* Widget Hora y Clima (Arriba Derecha) */}
        <div className="absolute top-8 right-8 flex flex-col items-end animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-2 rounded-t-2xl flex items-center gap-4 border-b border-white/10 shadow-2xl">
             <span className="text-3xl font-black">{time}</span>
             <div className="w-px h-6 bg-white/20"></div>
             <span className="text-sm font-bold tracking-tighter uppercase">Buenos Aires</span>
          </div>
          <div className="bg-blue-600/95 backdrop-blur-md text-white px-5 py-1 rounded-b-2xl flex items-center gap-2 shadow-xl border-t border-white/10">
             <span className="text-lg font-bold">24.5°C</span>
             <span className="text-xl">☀️</span>
          </div>
        </div>

        {/* Zócalo Principal (Abajo Izquierda) */}
        {zocaloLive && (
          <div className="absolute bottom-28 left-12 animate-slide-up">
            <div className="flex flex-col drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
              <div className="bg-blue-700 text-white text-[11px] font-black px-4 py-1.5 w-fit rounded-t-lg uppercase tracking-[0.2em] shadow-lg border-b border-white/10">
                {zocaloData.subtitulo}
              </div>
              <div className="bg-white text-slate-900 text-4xl font-black px-8 py-4 rounded-r-2xl rounded-bl-2xl border-l-[12px] border-blue-700 flex items-center shadow-2xl">
                {zocaloData.titulo}
              </div>
            </div>
          </div>
        )}

        {/* Cinta Inferior (Ticker) */}
        {cintaLive && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-lg text-white py-3 border-t-4 border-blue-600 shadow-2xl overflow-hidden">
            <div className="flex items-center">
              <div className="bg-blue-600 px-6 py-1 font-black italic z-10 shadow-[10px_0_15px_rgba(0,0,0,0.3)] skew-x-[-15deg] -ml-2">
                <span className="block skew-x-[15deg] text-lg">VIVO</span>
              </div>
              <div className="whitespace-nowrap flex animate-marquee text-xl font-bold tracking-wide pl-6">
                <span className="mx-8">{cintaTexto}</span>
                <span className="mx-8 text-blue-500">•</span>
                <span className="mx-8">{cintaTexto}</span>
                <span className="mx-8 text-blue-500">•</span>
              </div>
            </div>
          </div>
        )}

        {/* Estilos CSS para animaciones y Transparencia */}
        <style>{`
          body { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }
          @keyframes slideUp { 
            from { opacity: 0; transform: translateY(40px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.17, 0.84, 0.44, 1) forwards; }
          .animate-fade-in { animation: fadeIn 1s ease-out; }
          .animate-marquee { animation: marquee 25s linear infinite; }
        `}</style>
      </div>
    );
  }

  // --- VISTA PANEL DE CONTROL (PARA TI) ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-80 bg-[#0f172a] border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">🎙️</div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">RadioPanel</h1>
              <span className="text-blue-500 font-bold text-xs tracking-widest uppercase">PRO EDITION</span>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-3 flex-1">
          <button 
            onClick={() => setActiveTab('titulos')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'titulos' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-800'}`}
          >
            <span className="text-xl">📺</span> Zócalos
          </button>
          <button 
            onClick={() => setActiveTab('cinta')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'cinta' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-800'}`}
          >
            <span className="text-xl">🎞️</span> Cinta de Texto
          </button>
        </nav>

        {/* Acceso Directo OBS */}
        <div className="p-6 bg-slate-900/50 m-6 rounded-3xl border border-slate-800">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Link para Fuente OBS</label>
          <div className="bg-black/50 p-3 rounded-xl text-[10px] font-mono break-all text-blue-400 mb-3 border border-white/5">
            {window.location.origin}/OliDe/?overlay=true
          </div>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/OliDe/?overlay=true`;
              navigator.clipboard.writeText(url);
              alert("Link copiado! Pégalo en OBS como fuente de navegador.");
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-[10px] font-black uppercase transition-colors"
          >
            Copiar URL Overlay
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-10">
          
          <header className="flex justify-between items-end">
            <div>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-widest mb-1">Control de Emisión</p>
              <h2 className="text-4xl font-black text-white">Consola de Mando</h2>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
              <span className="text-green-500 font-bold text-sm">SISTEMA OK</span>
            </div>
          </header>

          {/* Formulario Zócalo */}
          {activeTab === 'titulos' && (
            <div className="bg-[#0f172a] rounded-[40px] p-10 border border-slate-800 shadow-3xl space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  Configuración del Zócalo
                </h3>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${zocaloLive ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                  {zocaloLive ? '● En el Aire' : 'Fuera de Línea'}
                </div>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-2 block">Volanta / Categoría</label>
                  <input 
                    type="text" 
                    value={zocaloData.subtitulo}
                    onChange={(e) => setZocaloData({...zocaloData, subtitulo: e.target.value})}
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-2 block">Título de la Noticia</label>
                  <textarea 
                    value={zocaloData.titulo}
                    onChange={(e) => setZocaloData({...zocaloData, titulo: e.target.value})}
                    rows="2"
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-2xl font-black text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => setZocaloLive(!zocaloLive)}
                className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-all ${zocaloLive ? 'bg-red-600 hover:bg-red-700 text-white shadow-2xl' : 'bg-green-600 hover:bg-green-700 text-white shadow-xl'}`}
              >
                {zocaloLive ? 'Quitar del Aire ⏹' : 'Lanzar al Aire ▶'}
              </button>
            </div>
          )}

          {/* Formulario Cinta */}
          {activeTab === 'cinta' && (
            <div className="bg-[#0f172a] rounded-[40px] p-10 border border-slate-800 shadow-3xl space-y-8 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-400 rounded-full"></span>
                Cinta de Texto Deslizante
              </h3>
              
              <div>
                <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-2 block">Mensaje de la Cinta</label>
                <textarea 
                  value={cintaTexto}
                  onChange={(e) => setCintaTexto(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium"
                  rows="4"
                />
              </div>

              <button 
                onClick={() => setCintaLive(!cintaLive)}
                className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-all ${cintaLive ? 'bg-red-600 hover:bg-red-700 text-white shadow-2xl' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl'}`}
              >
                {cintaLive ? 'Detener Cinta' : 'Activar Cinta'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Monitor de Previa (Derecha) */}
      <aside className="w-[480px] bg-black p-10 border-l border-slate-800 flex flex-col gap-6">
        <h4 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
           Program Monitor (Preview)
        </h4>
        <div className="aspect-video bg-[#020617] rounded-[32px] border-4 border-slate-800 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
           {/* Miniatura del Overlay */}
           <div className="absolute top-4 right-4 scale-[0.35] origin-top-right flex flex-col items-end">
              <div className="bg-slate-900/90 text-white px-4 py-2 rounded-t-xl font-bold text-4xl">{time}</div>
              <div className="bg-blue-600 text-white px-4 py-1 rounded-b-xl text-2xl font-bold">24.5°C</div>
           </div>
           
           {zocaloLive && (
             <div className="absolute bottom-6 left-4 scale-[0.4] origin-bottom-left">
                <div className="bg-blue-700 text-white px-3 py-1 text-sm font-bold w-fit rounded-t-md">{zocaloData.subtitulo}</div>
                <div className="bg-white text-black px-6 py-3 font-black text-3xl rounded-r-xl rounded-bl-xl shadow-2xl">{zocaloData.titulo}</div>
             </div>
           )}

           {cintaLive && (
             <div className="absolute bottom-0 w-full h-3 bg-blue-600 border-t border-white/20"></div>
           )}

           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-6xl font-black rotate-[-15deg]">LIVE STREAM</span>
           </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
           <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Encóder</p>
              <p className="text-white font-black text-xl leading-none">60 FPS</p>
              <p className="text-[10px] text-green-500 font-bold mt-1">ESTABLE</p>
           </div>
           <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Carga CPU</p>
              <p className="text-white font-black text-xl leading-none">14.2 %</p>
              <p className="text-[10px] text-blue-500 font-bold mt-1">OPTIMIZADO</p>
           </div>
        </div>
      </aside>

    </div>
  );
}
