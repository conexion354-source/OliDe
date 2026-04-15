import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { THEMES } from '../lib/defaultState'
import { useOverlayChannel } from '../lib/useOverlayChannel'
import { fetchWeatherByCity } from '../lib/weather'

export function ControlPage() {
  const { channelId = 'demo' } = useParams()
  const { state, updateState, status, transport } = useOverlayChannel(channelId)
  const [weatherInput, setWeatherInput] = useState(state.city || 'Buenos Aires')
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  const overlayUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.pathname = `/overlay/${channelId}`
    return url.toString()
  }, [channelId])

  async function handleCopy() {
    await navigator.clipboard.writeText(overlayUrl)
    setCopyMessage('URL copiada')
    setTimeout(() => setCopyMessage(''), 2000)
  }

  async function handleWeatherFetch() {
    try {
      setWeatherLoading(true)
      const weather = await fetchWeatherByCity(weatherInput)
      await updateState({
        city: weatherInput,
        weather,
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setWeatherLoading(false)
    }
  }

  return (
    <div className="control-shell">
      <aside className="control-panel">
        <header className="panel-card panel-header">
          <div className="logo-badge">{state.logoText || 'TP'}</div>
          <div>
            <label className="field-label">Programa</label>
            <input
              className="text-input"
              value={state.programName}
              onChange={(e) => updateState({ programName: e.target.value })}
            />
          </div>
        </header>

        <section className="panel-card">
          <div className="section-title">Canal</div>
          <div className="mono-box">{channelId}</div>
          <div className="mini-status">
            <span className={`status-dot ${transport}`} />
            {status}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-title">Theme</div>
          <div className="theme-grid">
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                className={`theme-chip ${state.theme === key ? 'active' : ''}`}
                onClick={() => updateState({ theme: key })}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-title">Zócalo de títulos</div>
          {[0, 1, 2].map((index) => (
            <div className="slot-row" key={index}>
              <button
                className={`slot-button ${state.activeTitleIndex === index ? 'selected' : ''}`}
                onClick={() => updateState({ activeTitleIndex: index })}
              >
                T{index + 1}
              </button>
              <input
                className="text-input"
                value={state.titleSlots[index] || ''}
                onChange={(e) => {
                  const next = [...state.titleSlots]
                  next[index] = e.target.value
                  updateState({ titleSlots: next })
                }}
                placeholder={`Título ${index + 1}`}
              />
            </div>
          ))}
          <div className="action-row">
            <button
              className={`primary-button ${state.showTitle ? 'is-live' : ''}`}
              onClick={() => updateState({ showTitle: !state.showTitle })}
            >
              {state.showTitle ? 'Ocultar título' : 'Mostrar título'}
            </button>
            <button className="secondary-button" onClick={() => updateState({ showTitle: false })}>
              Limpiar
            </button>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-title">Hora</div>
          <div className="action-row compact-row">
            <button
              className={`primary-button ${state.showClock ? 'is-live' : ''}`}
              onClick={() => updateState({ showClock: !state.showClock })}
            >
              {state.showClock ? 'Ocultar hora' : 'Mostrar hora'}
            </button>
            <select
              className="select-input"
              value={state.clockFormat}
              onChange={(e) => updateState({ clockFormat: e.target.value })}
            >
              <option value="24h">24h</option>
              <option value="12h">12h</option>
            </select>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-title">Clima</div>
          <div className="slot-row weather-row">
            <input
              className="text-input"
              value={weatherInput}
              onChange={(e) => setWeatherInput(e.target.value)}
              placeholder="Buscar ciudad"
            />
            <button className="secondary-button" onClick={handleWeatherFetch} disabled={weatherLoading}>
              {weatherLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          <div className="weather-preview">
            <strong>{state.weather.city}</strong>
            <span>{state.weather.temperature}°C · {state.weather.description}</span>
          </div>
          <div className="action-row">
            <button
              className={`primary-button ${state.showWeather ? 'is-live' : ''}`}
              onClick={() => updateState({ showWeather: !state.showWeather })}
            >
              {state.showWeather ? 'Ocultar clima' : 'Mostrar clima'}
            </button>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-title">Logo / Identidad</div>
          <div className="slot-row">
            <input
              className="text-input"
              maxLength={4}
              value={state.logoText}
              onChange={(e) => updateState({ logoText: e.target.value.toUpperCase() })}
              placeholder="Logo"
            />
          </div>
        </section>

        <section className="panel-card obs-card">
          <div className="section-title">OBS Browser Source</div>
          <textarea className="url-box" value={overlayUrl} readOnly />
          <div className="action-row">
            <button className="primary-button" onClick={handleCopy}>Copiar URL</button>
            <a className="secondary-button as-link" href={overlayUrl} target="_blank" rel="noreferrer">
              Abrir overlay
            </a>
          </div>
          {copyMessage ? <div className="copy-ok">{copyMessage}</div> : null}
        </section>
      </aside>
    </div>
  )
}
