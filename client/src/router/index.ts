import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUserStore } from '../stores/user'
import Login from '../views/Login.vue'
import Map from '../views/Map.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { requiresAuth: false }
        },
        {
            path: '/',
            name: 'Map',
            component: Map,
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore = useUserStore()

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next('/login')
    } else if (to.path === '/login' && userStore.isLoggedIn) {
        next('/')
    } else {
        next()
    }
})

export default router 