export const THEMES = {
  noticias: {
    name: 'Noticias Azul',
    overlayClass: 'theme-noticias',
  },
  breaking: {
    name: 'Breaking Rojo',
    overlayClass: 'theme-breaking',
  },
  dorado: {
    name: 'Cristiano Dorado',
    overlayClass: 'theme-dorado',
  },
  oscuro: {
    name: 'Moderno Oscuro',
    overlayClass: 'theme-oscuro',
  },
  claro: {
    name: 'Minimal Blanco',
    overlayClass: 'theme-claro',
  },
}

export const defaultOverlayState = {
  programName: 'Tu Programa',
  logoText: 'TP',
  city: 'Buenos Aires',
  theme: 'noticias',
  titleSlots: ['Bienvenidos', 'Título 2', 'Título 3'],
  activeTitleIndex: 0,
  showTitle: true,
  showClock: false,
  showWeather: false,
  clockFormat: '24h',
  weather: {
    city: 'Buenos Aires',
    temperature: '--',
    description: 'Sin datos',
    fetchedAt: null,
  },
}
