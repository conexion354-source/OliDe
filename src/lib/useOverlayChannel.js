import { useEffect, useMemo, useRef, useState } from 'react'
import { defaultOverlayState } from './defaultState'
import { isFirebaseEnabled, saveChannelState, subscribeChannel } from './firebase'

function getStorageKey(channelId) {
  return `overlay-panel-pro:${channelId}`
}

function mergeState(base, partial) {
  return {
    ...base,
    ...(partial || {}),
    weather: {
      ...base.weather,
      ...(partial?.weather || {}),
    },
    titleSlots: Array.isArray(partial?.titleSlots) ? partial.titleSlots : base.titleSlots,
  }
}

export function useOverlayChannel(channelId) {
  const [state, setState] = useState(defaultOverlayState)
  const [transport, setTransport] = useState('local')
  const [status, setStatus] = useState('Cargando...')
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (!channelId) return undefined

    if (isFirebaseEnabled()) {
      setTransport('firebase')
      setStatus('Conectado en tiempo real')
      const unsubscribe = subscribeChannel(
        channelId,
        (remoteData) => {
          if (remoteData) {
            setState(mergeState(defaultOverlayState, remoteData))
          } else {
            setState(defaultOverlayState)
          }
          initialLoadDone.current = true
        },
        () => {
          setStatus('Firebase no disponible, usando modo local')
          setTransport('local')
        },
      )
      return unsubscribe
    }

    const saved = localStorage.getItem(getStorageKey(channelId))
    if (saved) {
      try {
        setState(mergeState(defaultOverlayState, JSON.parse(saved)))
      } catch {
        setState(defaultOverlayState)
      }
    } else {
      setState(defaultOverlayState)
    }

    setTransport('local')
    setStatus('Modo local')
    initialLoadDone.current = true

    const onStorage = (event) => {
      if (event.key === getStorageKey(channelId) && event.newValue) {
        try {
          setState(mergeState(defaultOverlayState, JSON.parse(event.newValue)))
        } catch {
          // ignore invalid payload
        }
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [channelId])

  const api = useMemo(() => {
    async function updateState(patch) {
      setState((current) => {
        const next = mergeState(current, typeof patch === 'function' ? patch(current) : patch)
        if (transport === 'local') {
          localStorage.setItem(getStorageKey(channelId), JSON.stringify(next))
        }
        return next
      })
    }

    return {
      state,
      transport,
      status,
      updateState,
      async syncNow() {
        if (!initialLoadDone.current) return
        if (transport === 'firebase') {
          await saveChannelState(channelId, state)
        } else {
          localStorage.setItem(getStorageKey(channelId), JSON.stringify(state))
          window.dispatchEvent(new StorageEvent('storage', { key: getStorageKey(channelId), newValue: JSON.stringify(state) }))
        }
      },
    }
  }, [channelId, state, status, transport])

  useEffect(() => {
    if (!initialLoadDone.current) return
    if (transport === 'firebase') {
      saveChannelState(channelId, state).catch(() => {
        // keep UI working even if remote save fails
      })
    }
  }, [channelId, state, transport])

  return api
}
