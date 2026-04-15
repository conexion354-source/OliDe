import { initializeApp } from 'firebase/app'
import { doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

let db = null
if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

export function isFirebaseEnabled() {
  return Boolean(db)
}

export function subscribeChannel(channelId, onData, onError) {
  if (!db) return () => {}
  const ref = doc(db, 'overlayChannels', channelId)
  return onSnapshot(
    ref,
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null)
    },
    onError,
  )
}

export async function saveChannelState(channelId, data) {
  if (!db) return false
  const ref = doc(db, 'overlayChannels', channelId)
  await setDoc(ref, data, { merge: true })
  return true
}
