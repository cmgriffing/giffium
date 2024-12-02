import { defineConfig } from '@solidjs/start/config'

export default defineConfig({
  ssr: false,
  vite: {
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
  },
})
