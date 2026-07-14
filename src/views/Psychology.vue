<template>
  <el-card shadow="never">
    <h5 style="margin:0 0 20px 0">AI 心理咨询助手</h5>
    <el-form label-width="auto" style="width:60%;margin:0 auto">
      <el-form-item label="老人姓名">
        <el-select placeholder="请选择老人信息..." v-model="psyForm.oldid" style="width:100%">
          <el-option v-for="item in inRecordList" :key="item.id" :label="item.oldname" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="心理描述">
        <el-input type="textarea" v-model="psyForm.inputmsg" placeholder="请输入老人当前的心理状态描述..." :rows="5" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getPsychologyResult" style="width:100%">获取帮助</el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-dialog v-model="psyDialogVisible" title="心理助手返回结果" width="60%">
    <div style="white-space:pre-wrap;line-height:1.8;padding:10px 0">{{ psyResult }}</div>
    <template #footer>
      <el-button type="primary" @click="savePsyResult">保存</el-button>
      <el-button @click="closePsyDialog">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const inRecordList = ref([])
const psyForm = reactive({ oldid: '', inputmsg: '' })
const psyResult = ref('')
const psyDialogVisible = ref(false)

function loadInOldManList() {
  axios.get('/queryInList').then(res => {
    inRecordList.value = res.data
  }).catch(err => console.log(err))
}

const getPsychologyResult = async () => {
  if (!psyForm.inputmsg) {
    ElMessage.warning('请输入老人当前心理状态的详细描述')
    return
  }
  try {
    const res = await axios.post('/getPsychology', psyForm, { timeout: 20000 })
    psyResult.value = res.data
    psyDialogVisible.value = true
  } catch (err) {
    ElMessage.error('请求超时或失败，请稍后重试')
  }
}

function savePsyResult() {
  axios.post('/savePsy', { ...psyForm, airesult: psyResult.value }).then(res => {
    if (res.data.code === 200) {
      psyDialogVisible.value = false
      psyForm.oldid = ''
      psyForm.inputmsg = ''
      psyResult.value = ''
    }
    ElMessage(res.data.msg)
  }).catch(err => console.log(err))
}

function closePsyDialog() {
  psyDialogVisible.value = false
}

onMounted(loadInOldManList)
</script>
