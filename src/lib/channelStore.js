import { db, hasFirebaseConfig } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export const defaultState = {
  programName: 'Mi Programa',
  logoText: 'ON AIR',
  activeModule: 'title',
  currentTitleIndex: 0,
  titles: ['Bienvenidos', 'Último momento', 'Entrevista en minutos'],
  visible: false,
  theme: 'azul',
  cityQuery: 'Buenos Aires',
  weather: {
    city: 'Buenos Aires',
    temperature: '--',
    description: 'Sin datos',
    time: null,
  },
  updatedAt: null,
};

const localKey = (channelId) => `overlay-panel-pro:${channelId}`;

export function buildOverlayUrl(channelId) {
  const url = new URL(window.location.href);
  url.pathname = '/overlay';
  url.search = `?channel=${encodeURIComponent(channelId)}`;
  return url.toString();
}

export function subscribeToChannel(channelId, callback) {
  if (hasFirebaseConfig && db) {
    const ref = doc(db, 'overlayChannels', channelId);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        callback(defaultState);
        return;
      }
      callback({ ...defaultState, ...snap.data() });
    });
  }

  const emit = () => {
    const raw = localStorage.getItem(localKey(channelId));
    callback(raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState);
  };

  emit();
  const handler = (event) => {
    if (event.key === localKey(channelId)) emit();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export async function saveChannelState(channelId, patch) {
  const nextState = {
    ...defaultState,
    ...(await getCurrentChannelState(channelId)),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  if (hasFirebaseConfig && db) {
    const ref = doc(db, 'overlayChannels', channelId);
    await setDoc(ref, { ...nextState, serverUpdatedAt: serverTimestamp() }, { merge: true });
    return nextState;
  }

  localStorage.setItem(localKey(channelId), JSON.stringify(nextState));
  window.dispatchEvent(new StorageEvent('storage', { key: localKey(channelId) }));
  return nextState;
}

export async function getCurrentChannelState(channelId) {
  const raw = localStorage.getItem(localKey(channelId));
  return raw ? JSON.parse(raw) : defaultState;
}
