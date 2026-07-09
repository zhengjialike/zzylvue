import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import axios from 'axios';
axios.defaults.withCredentials=true;
axios.defaults.baseURL='http://localhost:8080'
axios.defaults.timeout=5000

createApp(App).use(ElementPlus).use(router).mount('#app')
