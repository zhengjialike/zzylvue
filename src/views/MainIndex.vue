<template>
  <el-container class="app-wrapper">
    <el-header class="el-header">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:18px;font-weight:600;color:#333">智慧养老服务平台</span>
        <div>
          欢迎：<span style="color:chocolate;font-size:16px">{{ realName }}</span> 登录系统
          <el-button size="small" style="margin-left:15px" @click="handleLogout">退出</el-button>
        </div>
      </div>
    </el-header>
    <el-container class="body-wrapper">
      <el-aside class="el-aside">
        <el-menu active-text-color="#ffd04b" background-color="#545c64" text-color="#fff" router>
          <template v-for="m in menuList" :key="m.id">
            <el-menu-item v-if="!m.subItems || m.subItems.length === 0" :index="m.path || '/Workbench'">{{ m.mname }}</el-menu-item>
            <el-sub-menu v-else :index="m.id">
              <template #title><span>{{ m.mname }}</span></template>
              <template v-for="sub in m.subItems" :key="sub.id">
                <el-menu-item v-if="!sub.subItems || sub.subItems.length === 0" :index="sub.path">{{ sub.mname }}</el-menu-item>
                <el-sub-menu v-else :index="sub.id">
                  <template #title><span>{{ sub.mname }}</span></template>
                  <el-menu-item v-for="subChild in sub.subItems" :index="subChild.path" :key="subChild.id">{{ subChild.mname }}</el-menu-item>
                </el-sub-menu>
              </template>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>
      <el-main class="el-main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const menuList = ref([]);
const realName = ref(null);

onMounted(() => {
  axios.get("/sysMenus").then((response) => {
    if (response.data.code === 200) {
      menuList.value = response.data.data || [];
    }
  }).catch(error => console.error(error));
  axios.get('/loadInfo').then(response => {
    if (response.data.code === 200) {
      realName.value = response.data.data?.uname;
    }
  }).catch(error => console.error('加载用户信息失败:', error));
});

function handleLogout() {
  axios.get('/logout').then(() => { router.push('/'); }).catch(() => { router.push('/'); });
}
</script>

<style scoped>
.app-wrapper { height: 100vh; }
.body-wrapper { height: calc(100vh - 60px); }
.el-header { background-color: #ecf5ff; line-height: 60px; padding: 0 20px; }
.el-aside { background-color: #545c64; width: 220px; overflow-y: auto; }
.el-aside .el-menu { border-right: none; }
.el-main { background-color: #f5f7fa; padding: 16px; overflow-y: auto; }
</style>
