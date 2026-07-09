<template>
  <!-- 页面布局：大处着手实现窗口的分割 -->
  <el-container>
    <el-header class="el-header">
      <div style="text-align: right">
        欢迎：
        <span style="color: chocolate; size: 20px">
          {{ realName }}
        </span>登录系统
        &nbsp;&nbsp;&nbsp;
        <el-button @click="handleLogout">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside class="el-aside">
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          text-color="#fff"
          router
        >
          <!-- 一级菜单循环 -->
          <el-sub-menu v-for="m in menuList" :index="m.id" :key="m.id">
            <template #title>
              <span>{{ m.mname }}</span>
            </template>

            <!-- 遍历二级菜单节点 -->
            <template v-for="sub in m.subItems" :key="sub.id">
              <!-- 情况1：二级节点没有三级节点，本身是叶子 -->
              <el-menu-item
                v-if="sub.subItems.length === 0"
                :index="sub.path"
              >
                {{ sub.mname }}
              </el-menu-item>

              <!-- 情况2：二级节点有三级节点 -->
              <el-sub-menu v-else :index="sub.id">
                <template #title>
                  <span>{{ sub.mname }}</span>
                </template>
                <el-menu-item
                  v-for="subChild in sub.subItems"
                  :index="subChild.path"
                  :key="subChild.id"
                >
                  {{ subChild.mname }}
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main class="el-main">
        <!-- 路由视图将在此处渲染 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

// 声明系统菜单节点集合
const menuList = ref([]);

// 页面挂载发送请求
onMounted(() => {
  // 发送异步请求加载系统菜单
  axios
    .get("/sysMenus")
    .then((response) => {
      console.log(response.data);
      // 将响应的菜单集合数据赋值给 menuList
      menuList.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
    loadLoginUserInfo();
});
// 声明用户登录信息
const realName = ref(null);

// 定义函数发送请求加载当前登录用户信息
function loadLoginUserInfo() {
  axios.get('/loadInfo')
    .then(response => {
      realName.value = response.data.uname; // 根据实际返回字段调整
    })
    .catch(error => {
      console.error('加载用户信息失败:', error);
    });
}
</script>

<style scoped>
.el-header {
  background-color: azure;
  padding-top: 15px;
}

.el-aside {
  background-color: #fff7e8;
  width: 260px;
  height: 705px;
}

.el-main {
  background-color: #fff7e8;
}
</style>