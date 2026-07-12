import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MainIndex from '../views/MainIndex.vue'
import UserInfo from '../views/UserInfo.vue'
import ModifyPwd from '../views/ModifyPwd.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/MainIndex',
    name: 'MainIndex',
    component: MainIndex,
    children:[
      {
        path: '/UserInfo',
        name: 'UserInfo',
        component: UserInfo
      },
      {
        path: '/ModifyPwd',
        name: 'ModifyPwd',
        component: ModifyPwd
      },
      {path:'/NursingItem',component:()=>import('@/views/NursingItem.vue')},
      {path:'/CheckIn',component:()=>import('@/views/CheckIn.vue')},
      {path:'/CheckInDetail',component:()=>import('@/views/CheckInDetail.vue')},
      {path:'/CheckOut',component:()=>import('@/views/CheckOut.vue')},
      {path:'/CheckOutDetail',component:()=>import('@/views/CheckOutDetail.vue')},
      {path:'/Contract',component:()=>import('@/views/Contract.vue')},
      {path:'/MyApply',component:()=>import('@/views/MyApply.vue')}
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
