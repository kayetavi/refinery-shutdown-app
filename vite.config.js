import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/refinery-shutdown-app/',
  plugins: [react()],
})
