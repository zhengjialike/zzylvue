<template>
  <div>
    <el-button size="small" @click="$router.back()" style="margin-bottom:12px">← 返回</el-button>
    <el-card shadow="never"><template #header><strong>账单信息</strong></template>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="账单编号">{{ bill.billNo||'--' }}</el-descriptions-item>
        <el-descriptions-item label="账单金额(元)">{{ bill.billAmount||'--' }}</el-descriptions-item>
        <el-descriptions-item label="账单月份">{{ bill.billMonth||'--' }}</el-descriptions-item>
        <el-descriptions-item label="应付金额(元)">{{ bill.payableAmount||'--' }}</el-descriptions-item>
        <el-descriptions-item label="交易状态"><el-tag :type="bill.status===2?'success':bill.status===3?'info':'warning'" size="small">{{ bill.status===1?'待支付':bill.status===2?'已支付':'已关闭' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="支付截止">{{ bill.payDeadline||'--' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card shadow="never" style="margin-top:12px"><template #header><strong>账单明细</strong></template>
      <el-table style="width:100%" :data="detailItems" size="small" border stripe>
        <el-table-column prop="itemName" label="费用项目" />
        <el-table-column prop="description" label="服务内容" />
        <el-table-column prop="amount" label="金额(元)" />
      </el-table>
    </el-card>
    <el-card shadow="never" style="margin-top:12px"><template #header><strong>支付记录</strong></template>
      <el-descriptions :column="1" size="small" border v-if="bill.paymentMethod">
        <el-descriptions-item label="支付方式">{{ bill.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ bill.paymentRemark }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无支付记录" />
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const bill=ref({})
const detailItems=ref([{itemName:'护理费用',description:'特级护理等级',amount:2000},{itemName:'床位费用',description:'特护房',amount:1700}])
</script>
