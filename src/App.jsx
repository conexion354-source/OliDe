import { Navigate, Route, Routes } from 'react-router-dom'
import { ControlPage } from './components/ControlPage'
import { OverlayPage } from './components/OverlayPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/control/demo" replace />} />
      <Route path="/control/:channelId" element={<ControlPage />} />
      <Route path="/overlay/:channelId" element={<OverlayPage />} />
    </Routes>
  )
}
