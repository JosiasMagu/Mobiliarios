import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@comp': path.resolve(__dirname, 'src/Components'),
      '@controller': path.resolve(__dirname, 'src/Controllers'),
      '@data': path.resolve(__dirname, 'src/Data'),
      '@hooks': path.resolve(__dirname, 'src/Ganchos'),
      '@model': path.resolve(__dirname, 'src/Model'),
      '@repo': path.resolve(__dirname, 'src/Repository'),
      '@resources': path.resolve(__dirname, 'src/Resources'),
      '@routes': path.resolve(__dirname, 'src/Routes'),
      '@service': path.resolve(__dirname, 'src/Services'),
      '@state': path.resolve(__dirname, 'src/States'),
      '@utils': path.resolve(__dirname, 'src/Utils'),
      '@view': path.resolve(__dirname, 'src/View'),
      '@styles': path.resolve(__dirname, 'src/Resources/styles')
    }
  }
})
