import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueCesium from 'vue-cesium'
import 'vue-cesium/dist/index.css'
import { createPinia } from 'pinia'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 初始化用户认证状态
const userStore = useUserStore()
userStore.initializeAuth()

app.use(ElementPlus)
app.use(VueCesium)
app.use(router)
app.mount('#app')
