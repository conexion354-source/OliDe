export async function fetchWeatherByCity(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`
  const geoRes = await fetch(geoUrl)
  if (!geoRes.ok) {
    throw new Error('No se pudo buscar la ciudad.')
  }

  const geoData = await geoRes.json()
  const place = geoData?.results?.[0]
  if (!place) {
    throw new Error('Ciudad no encontrada.')
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`
  const weatherRes = await fetch(weatherUrl)
  if (!weatherRes.ok) {
    throw new Error('No se pudo obtener el clima.')
  }

  const weatherData = await weatherRes.json()
  const current = weatherData?.current

  return {
    city: `${place.name}${place.admin1 ? `, ${place.admin1}` : ''}`,
    temperature: Math.round(current?.temperature_2m ?? 0),
    description: codeToSpanish(current?.weather_code),
    fetchedAt: new Date().toISOString(),
  }
}

function codeToSpanish(code) {
  const map = {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla con escarcha',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna intensa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia intensa',
    71: 'Nieve ligera',
    73: 'Nieve moderada',
    75: 'Nieve intensa',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos intensos',
    95: 'Tormenta',
  }
  return map[code] || 'Condición actual'
}
