import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { THEMES } from '../lib/defaultState'
import { useOverlayChannel } from '../lib/useOverlayChannel'

function useClock(format) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: format === '12h',
  }).format(now)
}

export function OverlayPage() {
  const { channelId = 'demo' } = useParams()
  const { state } = useOverlayChannel(channelId)
  const timeText = useClock(state.clockFormat)
  const themeClass = THEMES[state.theme]?.overlayClass || THEMES.noticias.overlayClass
  const activeTitle = state.titleSlots[state.activeTitleIndex] || ''

  return (
    <div className={`overlay-root ${themeClass}`}>
      <div className="overlay-stack">
        {state.showTitle && activeTitle ? (
          <div className="overlay-lower-third">
            <div className="overlay-logo">{state.logoText}</div>
            <div className="overlay-copy">
              <div className="overlay-program">{state.programName}</div>
              <div className="overlay-title">{activeTitle}</div>
            </div>
          </div>
        ) : null}

        {state.showClock ? (
          <div className="overlay-pill clock-pill">
            <span className="pill-label">Hora</span>
            <span className="pill-value">{timeText}</span>
          </div>
        ) : null}

        {state.showWeather ? (
          <div className="overlay-pill weather-pill">
            <span className="pill-label">Clima</span>
            <span className="pill-value">
              {state.weather.city} · {state.weather.temperature}°C · {state.weather.description}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
