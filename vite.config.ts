import { defineConfig } from 'vite'

// GitHub Pages serves project sites at /<repo>/
const base = process.env.VITE_BASE ?? '/screenplay-editor/'

export default defineConfig({
  base,
})
