const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081, // 前端访问端口
    proxy: {
      '/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false
      }
    }
  }
})