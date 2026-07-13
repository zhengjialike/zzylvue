<template>
  <div class="workbench">
    <div class="welcome-bar">
      <div>
        <h2 style="margin:0">您好，{{ realName }}，今天也是元气满满的一天！</h2>
        <p style="color:#999;margin:4px 0 0">数据更新：{{ updateTime }}</p>
      </div>
    </div>
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="6"><div class="stat-card blue"><div class="stat-icon">👴</div><div class="stat-num">{{ data.elderlyCount }}</div><div class="stat-label">老人数量</div></div></el-col>
      <el-col :span="6"><div class="stat-card green"><div class="stat-icon">📋</div><div class="stat-num">{{ formatNum(data.orderCount) }}笔</div><div class="stat-label">服务单数量</div></div></el-col>
      <el-col :span="6"><div class="stat-card orange"><div class="stat-icon">👥</div><div class="stat-num">{{ data.staffCount }}</div><div class="stat-label">员工数量</div></div></el-col>
      <el-col :span="6"><div class="stat-card red"><div class="stat-icon">💰</div><div class="stat-num">{{ data.revenue }}元</div><div class="stat-label">收入金额</div></div></el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header><span style="font-weight:600">入退情况（近7日）</span><span style="float:right;color:#999;font-size:12px">在住：{{ data.checkedInCount }}人 | 外出：{{ data.outCount }}人</span></template>
          <div class="chart-area" v-if="data.checkInOutTrend && data.checkInOutTrend.length">
            <div class="bar-chart">
              <div class="chart-legend"><span style="color:#409EFF">■ 入住</span><span style="color:#F56C6C;margin-left:16px">■ 退住</span></div>
              <div style="display:flex;align-items:flex-end;height:200px;gap:20px;padding:10px 0">
                <div v-for="(item,i) in data.checkInOutTrend" :key="i" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                  <div style="display:flex;gap:4px;align-items:flex-end;height:160px">
                    <div :style="{height:Math.max(item.checkIn*20,4)+'px',width:'20px',background:'#409EFF',borderRadius:'3px 3px 0 0'}" />
                    <div :style="{height:Math.max(item.checkOut*20,4)+'px',width:'20px',background:'#F56C6C',borderRadius:'3px 3px 0 0'}" />
                  </div>
                  <span style="font-size:11px;color:#999">{{ item.date.slice(5) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else style="text-align:center;color:#999;padding:60px 0">暂无数据</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" style="margin-bottom:16px">
          <template #header><span style="font-weight:600">待办事项</span><el-badge :value="data.todos ? data.todos.length : 0" style="float:right;margin-top:2px" /></template>
          <div v-if="data.todos && data.todos.length"><div v-for="(todo,i) in data.todos" :key="i" class="todo-item"><el-tag :type="todo.type==='入住申请'?'success':todo.type==='退住申请'?'warning':todo.type==='请假申请'?'info':'primary'" size="small" style="margin-right:8px">{{ todo.type }}</el-tag><span style="font-size:13px">{{ todo.name }}</span><span style="float:right;color:#999;font-size:11px" v-if="todo.billNo">{{ todo.billNo }}</span></div></div>
          <div v-else style="text-align:center;color:#999;padding:20px 0">暂无待办</div>
        </el-card>
        <el-card shadow="never">
          <template #header><span style="font-weight:600">预约总览</span></template>
          <div v-if="data.todayAppointments && data.todayAppointments.length"><div v-for="(apt,i) in data.todayAppointments" :key="i" class="todo-item"><el-tag :type="apt.status==='已完成'?'success':'warning'" size="small" style="margin-right:8px">{{ apt.type }}</el-tag><span style="font-size:13px">{{ apt.visitorName }}→{{ apt.elderName }}</span><span style="float:right;color:#999;font-size:11px">{{ apt.status }}</span></div></div>
          <div v-else style="text-align:center;color:#999;padding:20px 0">暂无预约</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
const realName = ref("admin");
const updateTime = ref(new Date().toLocaleString());
const data = ref({});
function formatNum(n) { if (!n) return "0"; if (n >= 10000) return (n / 10000).toFixed(1) + "W"; return n.toString(); }
onMounted(() => {
  axios.get("/loadInfo").then(res => { if (res.data.code === 200 && res.data.data?.uname) realName.value = res.data.data.uname; });
  axios.get("/workbench").then(res => { data.value = res.data; updateTime.value = new Date().toLocaleString(); });
});
</script>

<style scoped>
.workbench { padding: 0; }
.welcome-bar { display:flex; justify-content:space-between; align-items:center; }
.stat-card { border-radius:8px; padding:20px; color:#fff; display:flex; flex-direction:column; gap:6px; }
.stat-card.blue { background: linear-gradient(135deg,#409EFF,#337ECC); }
.stat-card.green { background: linear-gradient(135deg,#67C23A,#529B2E); }
.stat-card.orange { background: linear-gradient(135deg,#E6A23C,#CF9236); }
.stat-card.red { background: linear-gradient(135deg,#F56C6C,#DA4A4A); }
.stat-icon { font-size:24px; }
.stat-num { font-size:28px; font-weight:700; }
.stat-label { font-size:13px; opacity:.85; }
.chart-area { padding: 8px 0; }
.chart-legend { margin-bottom:8px; font-size:12px; }
.todo-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; display:flex; align-items:center; }
.todo-item:last-child { border-bottom:none; }
</style>
