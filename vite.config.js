import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  // Esta línea le dice a Vite que tu app vive en /OliDe/ y no en la raíz
  base: '/OliDe/', 
})
