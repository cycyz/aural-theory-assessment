import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 相对路径 base：让构建产物在任意子路径下（如 Gitee Pages 的 /<仓库名>/）都能正确加载
  base: './',
  plugins: [react()],
})
