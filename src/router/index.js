import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MainIndex from '../views/MainIndex.vue'
import UserInfo from '../views/UserInfo.vue'
import ModifyPwd from '../views/ModifyPwd.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  {
    path: '/MainIndex', name: 'MainIndex', component: MainIndex,
    children: [
      { path: '/UserInfo', name: 'UserInfo', component: UserInfo },
      { path: '/ModifyPwd', name: 'ModifyPwd', component: ModifyPwd },

      // 服务管理
      { path: '/NursingItem', component: () => import('@/views/NursingItem.vue') },
      { path: '/NursingPlain', component: () => import('@/views/NursingPlain.vue') },
      { path: '/NursingLevel', component: () => import('@/views/NursingLevel.vue') },

      // 入退管理
      { path: '/CheckIn', component: () => import('@/views/CheckIn.vue') },
      { path: '/CheckInDetail', component: () => import('@/views/CheckInDetail.vue') },
      { path: '/CheckOut', component: () => import('@/views/CheckOut.vue') },
      { path: '/CheckOutDetail', component: () => import('@/views/CheckOutDetail.vue') },
      { path: '/Contract', component: () => import('@/views/Contract.vue') },

      // 协同工作
      { path: '/MyApply', component: () => import('@/views/MyApply.vue') },

      // 来访管理
      { path: '/Appointment', component: () => import('@/views/Appointment.vue') },
      { path: '/VisitRecord', component: () => import('@/views/VisitRecord.vue') },

      // 客户管理
      { path: '/Customer', component: () => import('@/views/Customer.vue') },

      // 床房管理
      { path: '/RoomType', component: () => import('@/views/RoomType.vue') },
      { path: '/FloorBed', component: () => import('@/views/FloorBed.vue') },

      // 智能监测
      { path: '/DeviceManagement', component: () => import('@/views/DeviceManagement.vue') },
      { path: '/deviceDetail', name: 'DeviceDetail', component: () => import('@/views/DeviceDetail.vue'), meta: { title: '设备详情' } },
      { path: '/AlertRule', component: () => import('@/views/AlertRule.vue') },
      { path: '/AlertRecord', component: () => import('@/views/AlertRecord.vue') },
      { path: '/SmartBedMonitor', component: () => import('@/views/SmartBedMonitor.vue') },

      // 订单管理
      { path: '/OrderManagement', component: () => import('@/views/OrderManagement.vue') },
      { path: '/OrderDetail', component: () => import('@/views/OrderDetail.vue') },
      { path: '/RefundManagement', component: () => import('@/views/RefundManagement.vue') },

      // ===== 权限管理 =====
      { path: '/userManagement', component: () => import('@/views/permission/UserManagement.vue') },
      { path: '/roleManagement', component: () => import('@/views/permission/RoleManagement.vue') },
      { path: '/menuManagement', component: () => import('@/views/permission/MenuManagement.vue') },
      { path: '/deptManagement', component: () => import('@/views/permission/DeptManagement.vue') },
      { path: '/positionManagement', component: () => import('@/views/permission/PositionManagement.vue') },

      // ===== 消息中心 =====
      { path: '/messageCenter', component: () => import('@/views/message/MessageCenter.vue') },

      // ===== 请假管理 =====
      { path: '/leaveManagement', component: () => import('@/views/leave/LeaveManagement.vue') },
      { path: '/leaveDetail', component: () => import('@/views/leave/LeaveDetail.vue') },

      // ===== 财务管理 =====
      { path: '/billList', component: () => import('@/views/finance/BillList.vue') },
      { path: '/billDetail', component: () => import('@/views/finance/BillDetail.vue') },
      { path: '/overdueElders', component: () => import('@/views/finance/OverdueElders.vue') },
      { path: '/prepaidRecharge', component: () => import('@/views/finance/PrepaidRecharge.vue') },
      { path: '/balanceQuery', component: () => import('@/views/finance/BalanceQuery.vue') }
    ]
  }
]

const router = createRouter({ history: createWebHashHistory(), routes })
export default router
