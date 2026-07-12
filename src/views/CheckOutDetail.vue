<template>
  <div class="check-out-detail">
    <!-- 顶部步骤条 -->
    <el-card class="steps-card" shadow="never">
      <el-steps :active="currentStep - 1" finish-status="success" align-center>
        <el-step title="申请退住" />
        <el-step title="申请审批" />
        <el-step title="解除合同" />
        <el-step title="调整账单" />
        <el-step title="账单审批" />
        <el-step title="费用清算" />
      </el-steps>
    </el-card>

    <!-- 操作记录 -->
    <el-card class="logs-card" shadow="never" v-if="logs.length">
      <template #header><span class="card-title">操作记录</span></template>
      <el-timeline>
        <el-timeline-item
          v-for="log in logs"
          :key="log.id"
          :timestamp="log.createTime"
          :type="log.type || 'primary'"
        >
          <h4>{{ log.stepName }}</h4>
          <p>{{ log.operator }} - {{ log.content }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-row :gutter="16">
      <!-- 左侧：申请信息+基本信息 -->
      <el-col :span="10">
        <el-card shadow="never" class="info-card">
          <template #header><span class="card-title">申请信息</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="老人姓名">{{ form.elderName }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ form.idCard }}</el-descriptions-item>
            <el-descriptions-item label="退住日期">{{ form.checkOutDate }}</el-descriptions-item>
            <el-descriptions-item label="退住原因">{{ form.reason }}</el-descriptions-item>
            <el-descriptions-item label="退住备注">{{ form.remark }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ form.applicant }}</el-descriptions-item>
          </el-descriptions>
          <template v-if="currentStep > 1">
            <el-divider />
            <div class="card-title" style="margin-bottom:8px">基本信息</div>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ form.billNo }}</el-descriptions-item>
              <el-descriptions-item label="审批人">{{ form.approver }}</el-descriptions-item>
              <el-descriptions-item label="解除日期">{{ form.terminateDate }}</el-descriptions-item>
              <el-descriptions-item label="合同编号">{{ form.contractNo }}</el-descriptions-item>
              <el-descriptions-item label="退款方式">{{ form.refundWay }}</el-descriptions-item>
              <el-descriptions-item label="退款金额">{{ form.refundAmount }}</el-descriptions-item>
              <el-descriptions-item label="流程状态">{{ form.flowStatus }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-card>
      </el-col>

      <!-- 右侧：每步操作区 -->
      <el-col :span="14">
        <el-card shadow="never" class="op-card">
          <template #header><span class="card-title">{{ stepTitle }}</span></template>

          <!-- 步骤1 申请退住 -->
          <el-form v-if="currentStep === 1" :model="form" label-width="100px">
            <el-form-item label="老人姓名">
              <el-input v-model="form.elderName" readonly placeholder="请选择在住老人" @click="openElderDialog">
                <template #append><el-button @click="openElderDialog">选择</el-button></template>
              </el-input>
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input v-model="form.idCard" readonly placeholder="选择老人后自动带出" />
            </el-form-item>
            <el-form-item label="退住日期">
              <el-date-picker v-model="form.checkOutDate" type="date" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="退住原因">
              <el-select v-model="form.reason" placeholder="请选择退住原因">
                <el-option label="老人个人原因" value="老人个人原因" />
                <el-option label="护理质量不高" value="护理质量不高" />
                <el-option label="服务不周" value="服务不周" />
                <el-option label="管理混乱" value="管理混乱" />
                <el-option label="费用高昂" value="费用高昂" />
                <el-option label="违规退住" value="违规退住" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" maxlength="100" show-word-limit />
            </el-form-item>
          </el-form>

          <!-- 步骤2 申请审批 -->
          <div v-else-if="currentStep === 2">
            <el-form :model="form" label-width="100px">
              <el-form-item label="审批结果">
                <el-radio-group v-model="form.approveResult">
                  <el-radio label="通过">通过</el-radio>
                  <el-radio label="驳回">驳回</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="审批意见">
                <el-input v-model="form.approveRemark" type="textarea" maxlength="200" show-word-limit />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3 解除合同 -->
          <div v-else-if="currentStep === 3">
            <el-form :model="form" label-width="100px">
              <el-form-item label="合同编号">
                <el-input v-model="form.contractNo" readonly placeholder="请选择需要解除的合同" @click="openContractDialog">
                  <template #append><el-button @click="openContractDialog">选择</el-button></template>
                </el-input>
              </el-form-item>
              <el-form-item label="解除日期">
                <el-date-picker v-model="form.terminateDate" type="date" value-format="YYYY-MM-DD" />
              </el-form-item>
              <el-form-item label="解除协议">
                <el-upload
                  action="http://localhost:8080/upload"
                  name="mf"
                  accept="application/pdf,.pdf"
                  :show-file-list="false"
                  :before-upload="beforeAgreementUpload"
                  :on-success="onAgreementUploadSuccess"
                  :on-error="onAgreementUploadError"
                >
                  <el-button type="primary">上传PDF</el-button>
                  <template #tip>
                    <div class="upload-tip">请上传pdf文件，大小在60M以内</div>
                  </template>
                </el-upload>
                <span v-if="form.terminateAgreement" class="file-name">{{ form.terminateAgreement }}</span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤4 调整账单 -->
          <div v-else-if="currentStep === 4">
            <el-form :model="form" label-width="100px">
              <!-- 应退卡片 -->
              <el-card shadow="never" class="bill-card">
                <template #header><span class="card-title">应退</span></template>
                <div class="bill-section">
                  <div class="section-title">月度账单</div>
                  <div v-for="(b, i) in form.bills.shouldRefund" :key="'sr-'+i" class="bill-row">
                    <div class="bill-line">
                      <span>账单编号: {{ b.billNo }}</span>
                      <span>账单月份: {{ b.billMonth }}</span>
                      <span>应付金额: {{ b.payableAmount }}</span>
                      <span>可退金额: {{ b.refundableAmount }}</span>
                    </div>
                    <el-form-item label="实退金额" label-width="90px">
                      <el-input-number v-model="b.actualRefund" :min="0" :max="b.refundableAmount" />
                    </el-form-item>
                    <el-form-item label="调整备注" label-width="90px">
                      <el-input v-model="b.adjustRemark" />
                    </el-form-item>
                  </div>
                </div>
                <div class="bill-section">
                  <div class="section-title">费用账单</div>
                  <div v-for="(b, i) in form.bills.shouldRefundFee" :key="'srf-'+i" class="bill-row">
                    <div class="bill-line">
                      <span>账单编号: {{ b.billNo }}</span>
                      <span>护理项目名称: {{ b.nursingItemName }}</span>
                      <span>应付金额: {{ b.payableAmount }}</span>
                      <span>可退金额: {{ b.refundableAmount }}</span>
                    </div>
                    <el-form-item label="实退金额" label-width="90px">
                      <el-input-number v-model="b.actualRefund" :min="0" :max="b.refundableAmount" />
                    </el-form-item>
                    <el-form-item label="调整备注" label-width="90px">
                      <el-input v-model="b.adjustRemark" />
                    </el-form-item>
                  </div>
                </div>
              </el-card>

              <!-- 欠费卡片 -->
              <el-card shadow="never" class="bill-card">
                <template #header><span class="card-title">欠费</span></template>
                <div v-for="(b, i) in form.bills.arrears" :key="'ar-'+i" class="bill-row">
                  <div class="bill-line">
                    <span>账单编号: {{ b.billNo }}</span>
                    <span>账单月份: {{ b.billMonth }}</span>
                    <span>应付金额: {{ b.payableAmount }}</span>
                  </div>
                </div>
              </el-card>

              <!-- 余额卡片 -->
              <el-card shadow="never" class="bill-card">
                <template #header><span class="card-title">余额</span></template>
                <div class="bill-row">
                  <el-form-item label="可退押金" label-width="90px">
                    <el-input-number v-model="form.bills.refundableDeposit" :min="0" :max="depositMax" />
                  </el-form-item>
                  <el-form-item label="预缴款" label-width="90px">
                    <el-input-number v-model="form.bills.prepaidAmount" :min="0" />
                  </el-form-item>
                  <el-form-item label="调整备注" label-width="90px">
                    <el-input v-model="form.bills.balanceRemark" />
                  </el-form-item>
                </div>
              </el-card>

              <!-- 未缴卡片 -->
              <el-card shadow="never" class="bill-card">
                <template #header><span class="card-title">未缴</span></template>
                <div v-for="(b, i) in form.bills.unpaid" :key="'up-'+i" class="bill-row">
                  <div class="bill-line">
                    <span>账单编号: {{ b.billNo }}</span>
                    <span>护理项目名称: {{ b.nursingItemName }}</span>
                    <span>应付金额: {{ b.payableAmount }}</span>
                  </div>
                </div>
              </el-card>

              <el-divider />
              <div class="total-line">最终退款金额: <b>{{ finalRefundAmount }}</b></div>
              <el-alert
                title="确认提交账单审批通过后，应退金额不可再次修改。完成退款操作后，退款金额将退到预缴款余额中"
                type="warning"
                :closable="false"
              />
            </el-form>
          </div>

          <!-- 步骤5 账单审批 -->
          <div v-else-if="currentStep === 5">
            <el-form :model="form" label-width="100px">
              <el-form-item label="审批结果">
                <el-radio-group v-model="form.approveResult">
                  <el-radio label="通过">通过</el-radio>
                  <el-radio label="驳回">驳回</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="审批意见">
                <el-input v-model="form.approveRemark" type="textarea" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤6 费用清算 -->
          <div v-else-if="currentStep === 6">
            <el-descriptions :column="1" border size="small" title="账单明细">
              <el-descriptions-item label="应退小计">{{ form.shouldRefundTotal }}</el-descriptions-item>
              <el-descriptions-item label="欠费小计">{{ form.arrearsTotal }}</el-descriptions-item>
              <el-descriptions-item label="余额小计">{{ form.balanceTotal }}</el-descriptions-item>
              <el-descriptions-item label="最终退款金额">{{ finalRefundAmount }}</el-descriptions-item>
            </el-descriptions>
            <el-divider />
            <el-form :model="form" label-width="100px">
              <el-form-item label="退款方式">
                <el-select v-model="form.refundWay">
                  <el-option label="现金" value="现金" />
                  <el-option label="银行卡" value="银行卡" />
                  <el-option label="微信" value="微信" />
                  <el-option label="支付宝" value="支付宝" />
                </el-select>
              </el-form-item>
              <el-form-item label="退款备注">
                <el-input v-model="form.refundRemark" maxlength="50" show-word-limit />
              </el-form-item>
              <el-form-item v-if="Number(actualRefundDue) > 0" label="退款凭证">
                <el-upload
                  action="http://localhost:8080/upload"
                  name="mf"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  :show-file-list="false"
                  :before-upload="beforeRefundVoucherUpload"
                  :on-success="onRefundVoucherUploadSuccess"
                  :on-error="onRefundVoucherUploadError"
                  :disabled="hasArrears"
                >
                  <el-button type="primary" :disabled="hasArrears">上传凭证</el-button>
                </el-upload>
                <span v-if="form.refundVoucher" class="file-name">{{ form.refundVoucher }}</span>
              </el-form-item>
              <el-form-item label="实退金额">
                <el-input-number v-model="form.actualRefundAmount" :min="0" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 完成/只读详情 -->
          <div v-else>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="单据编号">{{ form.billNo }}</el-descriptions-item>
              <el-descriptions-item label="老人姓名">{{ form.elderName }}</el-descriptions-item>
              <el-descriptions-item label="退住日期">{{ form.checkOutDate }}</el-descriptions-item>
              <el-descriptions-item label="退住原因">{{ form.reason }}</el-descriptions-item>
              <el-descriptions-item label="审批人">{{ form.approver }}</el-descriptions-item>
              <el-descriptions-item label="解除日期">{{ form.terminateDate }}</el-descriptions-item>
              <el-descriptions-item label="退款方式">{{ form.refundWay }}</el-descriptions-item>
              <el-descriptions-item label="退款金额">{{ form.refundAmount }}</el-descriptions-item>
              <el-descriptions-item label="退款备注">{{ form.refundRemark }}</el-descriptions-item>
              <el-descriptions-item label="清算状态">{{ form.settleStatus }}</el-descriptions-item>
              <el-descriptions-item label="流程状态">{{ form.flowStatus }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="contractDialogVisible" title="选择需要解除的合同" width="720px">
      <el-table :data="activeContracts" v-loading="contractLoading" max-height="360px">
        <el-table-column prop="contractNo" label="合同编号" min-width="190" />
        <el-table-column prop="contractName" label="合同名称" min-width="160" />
        <el-table-column label="合同期限" min-width="210">
          <template #default="scope">{{ scope.row.startDate }} ~ {{ scope.row.endDate }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" />
        <el-table-column label="操作" width="90">
          <template #default="scope">
            <el-button type="primary" link @click="selectContract(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!contractLoading && activeContracts.length === 0" description="当前老人没有可解除的合同" />
    </el-dialog>

    <el-dialog v-model="elderDialogVisible" title="选择在住老人" width="620px">
      <div style="display:flex; gap:10px; margin-bottom:12px">
        <el-input v-model="elderKeyword" clearable placeholder="输入姓名或身份证号" @keyup.enter="loadEligibleElders" />
        <el-button type="primary" @click="loadEligibleElders">查询</el-button>
      </div>
      <el-table :data="eligibleElders" v-loading="elderLoading" max-height="360px">
        <el-table-column prop="name" label="老人姓名" width="120" />
        <el-table-column prop="idCard" label="身份证号" min-width="190" />
        <el-table-column prop="phone" label="联系方式" width="130" />
        <el-table-column label="操作" width="90">
          <template #default="scope">
            <el-button type="primary" link @click="selectElder(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 底部按钮区 -->
    <div class="footer-bar" v-if="currentStep <= 6 && !['已关闭', '已完成'].includes(form.flowStatus)">
      <el-button @click="onBack">返回</el-button>
      <el-popconfirm
        v-if="currentStep === 2 && id"
        title="确认撤销该退住申请？"
        @confirm="onRevoke"
      >
        <template #reference>
          <el-button type="danger">撤销</el-button>
        </template>
      </el-popconfirm>
      <el-button type="primary" :loading="submitting" @click="onSubmit">{{ submitBtnText }}</el-button>
    </div>
    <div class="footer-bar" v-else>
      <el-button @click="onBack">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const id = route.query.id

const currentStep = ref(1)
const stepTitle = ref('申请退住')
const depositMax = ref(0)
const logs = ref([])
const submitting = ref(false)
const elderDialogVisible = ref(false)
const elderLoading = ref(false)
const elderKeyword = ref('')
const eligibleElders = ref([])
const contractDialogVisible = ref(false)
const contractLoading = ref(false)
const activeContracts = ref([])

const form = reactive({
  id: id || null,
  elderId: null,
  elderName: '',
  idCard: '',
  checkOutDate: new Date().toISOString().slice(0, 10),
  reason: '',
  remark: '',
  applicant: '',
  billNo: '',
  approver: '',
  contractId: null,
  contractNo: '',
  terminateDate: new Date().toISOString().slice(0, 10),
  terminateAgreement: '',
  approveResult: '',
  approveRemark: '',
  refundWay: '',
  refundRemark: '',
  refundVoucher: '',
  refundAmount: 0,
  actualRefundAmount: 0,
  shouldRefundTotal: 0,
  arrearsTotal: 0,
  balanceTotal: 0,
  settleStatus: '',
  flowStatus: '',
  bills: {
    shouldRefund: [],
    shouldRefundFee: [],
    arrears: [],
    balance: [],
    unpaid: [],
    all: [],
    refundableDeposit: 0,
    prepaidAmount: 0,
    balanceRemark: ''
  }
})

const stepTitles = {
  1: '申请退住',
  2: '申请审批',
  3: '解除合同',
  4: '调整账单',
  5: '账单审批',
  6: '费用清算'
}

const submitBtnText = computed(() => {
  if (currentStep.value === 1) return '提交申请'
  if (currentStep.value === 6) return '确认清算'
  return '提交'
})

const hasArrears = computed(() => {
  return form.bills.arrears && form.bills.arrears.length > 0
})

const finalRefundAmount = computed(() => {
  const sr = (form.bills.shouldRefund || []).reduce((s, b) => s + (b.actualRefund || 0), 0)
  const srf = (form.bills.shouldRefundFee || []).reduce((s, b) => s + (b.actualRefund || 0), 0)
  const should = sr + srf
  const arrears = (form.bills.arrears || []).reduce((s, b) => s + (b.payableAmount || 0), 0)
  const balance = (form.bills.refundableDeposit || 0) + (form.bills.prepaidAmount || 0)
  return +(should - arrears + balance).toFixed(2)
})

const actualRefundDue = computed(() => Number(form.actualRefundAmount || finalRefundAmount.value || 0))

function requireFields(fields) {
  const missing = fields.find(({ value }) => value === '' || value == null)
  if (!missing) return true
  ElMessage.warning(`请填写${missing.label}`)
  return false
}

function validateCurrentStep() {
  if (currentStep.value === 1) return requireFields([{ label: '老人姓名', value: form.elderName }, { label: '身份证号', value: form.idCard }, { label: '退住日期', value: form.checkOutDate }, { label: '退住原因', value: form.reason }])
  if (currentStep.value === 2 || currentStep.value === 5) return requireFields([{ label: '审批结果', value: form.approveResult }])
  if (currentStep.value === 3) return requireFields([{ label: '合同编号', value: form.contractId }, { label: '解除日期', value: form.terminateDate }, { label: '解除协议', value: form.terminateAgreement }])
  if (currentStep.value === 6) {
    if (Number(form.refundAmount) < 0) { ElMessage.warning('退款金额不能小于 0'); return false }
    if (actualRefundDue.value > 0 && !form.refundWay) { ElMessage.warning('请选择退款方式'); return false }
    if (actualRefundDue.value > 0 && !form.refundVoucher) { ElMessage.warning('请上传退款凭证'); return false }
  }
  return true
}

const loadEligibleElders = async () => {
  elderLoading.value = true
  try {
    const { data } = await axios.post('/checkOutEligibleElders', { keyword: elderKeyword.value })
    eligibleElders.value = Array.isArray(data) ? data : []
  } catch (e) {
    ElMessage.error('加载可退住老人失败')
  } finally {
    elderLoading.value = false
  }
}

const openElderDialog = () => {
  elderDialogVisible.value = true
  loadEligibleElders()
}

const selectElder = (elder) => {
  form.elderId = elder.id
  form.elderName = elder.name
  form.idCard = elder.idCard
  elderDialogVisible.value = false
}

const loadActiveContracts = async () => {
  if (!id) return
  contractLoading.value = true
  try {
    const { data } = await axios.post('/checkOutContracts', { id: Number(id) })
    activeContracts.value = Array.isArray(data) ? data : []
  } catch (e) {
    ElMessage.error('加载合同列表失败')
  } finally {
    contractLoading.value = false
  }
}

const openContractDialog = () => {
  contractDialogVisible.value = true
  loadActiveContracts()
}

const selectContract = (contract) => {
  form.contractId = contract.id
  form.contractNo = contract.contractNo
  contractDialogVisible.value = false
}

const beforeAgreementUpload = (file) => {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    ElMessage.error('解除协议仅支持 PDF 文件')
    return false
  }
  if (file.size / 1024 / 1024 > 60) {
    ElMessage.error('PDF 文件大小不能超过 60MB')
    return false
  }
  return true
}

const onAgreementUploadSuccess = (res) => {
  const fileUrl = typeof res === 'string' ? res : (res && (res.data || res.url))
  if (!fileUrl || String(fileUrl).startsWith('error:')) {
    ElMessage.error(fileUrl || '上传失败')
    return
  }
  form.terminateAgreement = fileUrl
  ElMessage.success('PDF 上传成功')
}

const onAgreementUploadError = () => ElMessage.error('PDF 上传失败，请检查后端服务和文件大小')

const beforeRefundVoucherUpload = (file) => {
  const isImage = ['image/png', 'image/jpeg'].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name)
  if (!isImage) {
    ElMessage.error('退款凭证仅支持 PNG、JPG、JPEG 图片')
    return false
  }
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('退款凭证图片不能超过 5MB')
    return false
  }
  return true
}

const onRefundVoucherUploadSuccess = (res) => {
  const fileUrl = typeof res === 'string' ? res : (res && (res.data || res.url))
  if (!fileUrl || String(fileUrl).startsWith('error:')) {
    ElMessage.error(fileUrl || '退款凭证上传失败')
    return
  }
  form.refundVoucher = fileUrl
  ElMessage.success('退款凭证上传成功')
}

const onRefundVoucherUploadError = () => ElMessage.error('退款凭证上传失败，请检查后端服务')

const loadDetail = async () => {
  if (!id) return
  try {
    const { data } = await axios.post('http://localhost:8080/checkOutDetail', { id })
    const detailData = data && data.data ? data.data : data
    if (detailData && detailData.id) {
      Object.assign(form, detailData)
      currentStep.value = detailData.currentStep || detailData.step || 1
      stepTitle.value = stepTitles[currentStep.value] || '详情'
      if (currentStep.value >= 4) {
        loadBills()
      }
    }
  } catch (e) {
    ElMessage.error('加载详情失败')
  }
}

const loadBills = async () => {
  if (!id) return
  try {
    const { data } = await axios.post('http://localhost:8080/checkOutBills', { id })
    const billData = data && data.data ? data.data : data
    if (billData) {
      const d = billData
      form.bills.shouldRefund = d.shouldRefund || []
      form.bills.shouldRefundFee = d.shouldRefundFee || []
      form.bills.arrears = d.arrears || []
      form.bills.balance = d.balance || []
      form.bills.unpaid = d.unpaid || []
      form.bills.all = d.all || []
      depositMax.value = (d.balance && d.balance[0] && d.balance[0].refundableDeposit) || 0
    }
  } catch (e) {
    ElMessage.error('加载账单失败')
  }
}

const loadLogs = async () => {
  if (!id) return
  try {
    const { data } = await axios.post('http://localhost:8080/checkOutLogs', { id })
    logs.value = Array.isArray(data) ? data : ((data && data.data) || [])
  } catch (e) {
    console.error('加载日志失败', e)
  }
}

const onSubmit = async () => {
  if (submitting.value || !validateCurrentStep()) return
  submitting.value = true
  try {
    if (currentStep.value === 2 && form.approveResult === '驳回') {
      form.flowStatus = '已关闭'
    }
    if (currentStep.value === 5 && form.approveResult === '驳回') {
      form.flowStatus = '已关闭'
    }

    if (currentStep.value === 1) {
      const startPayload = {
        elderId: form.elderId || null,
        elderName: form.elderName,
        idCard: form.idCard,
        checkOutDate: form.checkOutDate,
        checkoutReason: form.reason,
        remark: form.remark
      }
      const { data } = await axios.post('http://localhost:8080/startCheckOut', startPayload)
      if (data && data.code === 200) {
        ElMessage.success('申请提交成功')
        router.push('/CheckOut')
      } else {
        ElMessage.error((data && data.msg) || '提交失败')
      }
      return
    }

    const payload = {
      id,
      step: currentStep.value,
      ...form,
      refundMethod: form.refundWay,
      refundAmount: currentStep.value === 6 ? Number(form.actualRefundAmount || finalRefundAmount.value || 0) : form.refundAmount,
      bills: currentStep.value === 4 ? form.bills.all : undefined
    }

    const { data } = await axios.post('http://localhost:8080/submitCheckOutStep', payload)
    if (data && data.code === 200) {
      if (currentStep.value === 6) {
        await ElMessageBox.alert(
          `退款方式: ${form.refundWay}<br/>退款金额: ${form.refundAmount}<br/>退款备注: ${form.refundRemark}`,
          '退款信息',
          { dangerouslyUseHTMLString: true }
        )
        router.push('/CheckOut')
      } else {
        ElMessage.success('提交成功')
        currentStep.value = data.currentStep || currentStep.value
        form.approveResult = ''
        form.approveRemark = ''
        stepTitle.value = stepTitles[currentStep.value] || stepTitle.value
        if (currentStep.value >= 4) loadBills()
        loadLogs()
      }
    } else {
      ElMessage.error((data && data.msg) || '提交失败')
    }
  } catch (e) {
    ElMessage.error((e.response && e.response.data && e.response.data.msg) || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const onRevoke = async () => {
  try {
    const { data } = await axios.post('http://localhost:8080/revokeCheckOut', { id })
    if (data && data.code === 200) {
      ElMessage.success('已撤销')
      router.push('/CheckOut')
    } else {
      ElMessage.error((data && data.msg) || '撤销失败')
    }
  } catch (e) {
    ElMessage.error('撤销失败')
  }
}

const onBack = () => {
  router.push('/CheckOut')
}

onMounted(() => {
  loadDetail()
  loadLogs()
})
</script>

<style scoped>
.check-out-detail {
  padding: 16px;
}
.steps-card,
.logs-card,
.info-card,
.op-card {
  margin-bottom: 16px;
}
.card-title {
  font-weight: 600;
}
.bill-card {
  margin-bottom: 12px;
}
.bill-section {
  margin-bottom: 12px;
}
.section-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #409eff;
}
.bill-row {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}
.bill-line {
  margin-bottom: 8px;
}
.bill-line span {
  margin-right: 16px;
  color: #666;
}
.upload-tip {
  font-size: 12px;
  color: #909399;
}
.file-name {
  margin-left: 12px;
  color: #67c23a;
}
.total-line {
  font-size: 15px;
  margin: 12px 0;
  color: #f56c6c;
}
.footer-bar {
  margin-top: 16px;
  text-align: center;
}
</style>
