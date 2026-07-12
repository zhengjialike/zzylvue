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
      {path:'/NursingPlain',component:()=>import('@/views/NursingPlain.vue')},
      {path:'/NursingLevel',component:()=>import('@/views/NursingLevel.vue')},
      {path:'/Appointment',component:()=>import('@/views/Appointment.vue')},
      {path:'/VisitRecord',component:()=>import('@/views/VisitRecord.vue')},
      {path:'/Customer',component:()=>import('@/views/Customer.vue')},
      {path:'/RoomType',component:()=>import('@/views/RoomType.vue')},
      {path:'/FloorBed',component:()=>import('@/views/FloorBed.vue')},
      {path:'/DeviceManagement',component:()=>import('@/views/DeviceManagement.vue')},
      {path:'/AlertRule',component:()=>import('@/views/AlertRule.vue')},
      {path:'/AlertRecord',component:()=>import('@/views/AlertRecord.vue')}
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
