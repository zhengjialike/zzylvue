<template>
  <div style="padding: 20px">
    <!-- 顶部步骤条 -->
    <el-steps :active="activeStep - 1" finish-status="success" align-center style="margin-bottom: 30px">
      <el-step title="申请入住" description="基本信息" />
      <el-step title="入住评估" description="健康/能力" />
      <el-step title="入住审批" description="审批" />
      <el-step title="入住配置" description="床位/等级" />
      <el-step title="签约办理" description="合同" />
    </el-steps>

    <!-- 操作记录 -->
    <el-card v-if="logs.length > 0" style="margin-bottom: 20px" shadow="never">
      <template #header><span>操作记录</span></template>
      <el-timeline>
        <el-timeline-item v-for="log in logs" :key="log.id" :timestamp="log.createTime" placement="top">
          <strong>{{ log.stepName }}</strong> —— {{ log.operator }}（{{ log.role }}）{{ log.operation }}
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 步骤1: 申请入住 -->
    <el-card v-if="activeStep === 1" shadow="never">
      <template #header><span>申请入住</span></template>
      <el-tabs v-model="step1Tab">
        <!-- Tab1 基本信息 -->
        <el-tab-pane label="基本信息" name="base">
          <el-form label-width="120px" style="max-width: 680px">
            <el-form-item label="老人姓名"><el-input v-model="form.elderName" /></el-form-item>
            <el-form-item label="老人身份证号">
              <el-input v-model="form.idCard" maxlength="18" @blur="parseIdCard" />
            </el-form-item>
            <el-form-item label="性别">
              <el-input v-model="form.gender" readonly placeholder="根据身份证自动识别" />
            </el-form-item>
            <el-form-item label="出生日期">
              <el-input v-model="form.birthday" readonly placeholder="根据身份证自动识别" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="form.age" readonly placeholder="根据身份证自动识别" />
            </el-form-item>
            <el-form-item label="家庭住址"><el-input v-model="form.address" /></el-form-item>
            <el-form-item label="联系方式">
              <el-input v-model="form.phone" maxlength="11" />
            </el-form-item>
            <el-form-item label="民族">
              <el-select v-model="form.nation" placeholder="请选择">
                <el-option v-for="n in nationOptions" :key="n" :label="n" :value="n" />
              </el-select>
            </el-form-item>
            <el-form-item label="政治面貌">
              <el-select v-model="form.politicalStatus" placeholder="请选择">
                <el-option v-for="p in politicalOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
            <el-form-item label="宗教信仰">
              <el-select v-model="form.religion" placeholder="请选择">
                <el-option v-for="r in religionOptions" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
            <el-form-item label="婚姻状况">
              <el-select v-model="form.maritalStatus" placeholder="请选择">
                <el-option v-for="m in maritalOptions" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
            <el-form-item label="文化程度">
              <el-select v-model="form.education" placeholder="请选择">
                <el-option v-for="e in educationOptions" :key="e" :label="e" :value="e" />
              </el-select>
            </el-form-item>
            <el-form-item label="经济来源">
              <el-select v-model="form.incomeSource" placeholder="请选择">
                <el-option v-for="i in incomeOptions" :key="i" :label="i" :value="i" />
              </el-select>
            </el-form-item>
            <el-form-item label="医疗保障">
              <el-select v-model="form.medicalSecurity" placeholder="请选择">
                <el-option v-for="m in medicalOptions" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
            <el-form-item label="医保卡号"><el-input v-model="form.medicareCard" /></el-form-item>
            <el-form-item label="特长爱好"><el-input v-model="form.hobbies" /></el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab2 家属信息 -->
        <el-tab-pane label="家属信息" name="family">
          <div style="margin-bottom: 10px; color: #909399">添加老人的家属联系人信息</div>
          <div v-for="(m, idx) in form.familyMembers" :key="idx" style="display: flex; align-items: center; margin-bottom: 12px; gap: 10px">
            <el-input v-model="m.name" placeholder="家属姓名" style="width: 180px" />
            <el-input v-model="m.phone" placeholder="联系方式" maxlength="11" style="width: 180px" />
            <el-select v-model="m.relation" placeholder="与老人关系" style="width: 150px">
              <el-option v-for="r in relationOptions" :key="r" :label="r" :value="r" />
            </el-select>
            <el-button type="primary" :icon="Plus" circle size="small" @click="addFamily" />
            <el-button v-if="form.familyMembers.length > 1" type="danger" :icon="Minus" circle size="small" @click="removeFamily(idx)" />
          </div>
        </el-tab-pane>

        <!-- Tab3 资料上传 -->
        <el-tab-pane label="资料上传" name="upload">
          <el-alert title="图片大小不超过2M，仅支持PNG JPG JPEG" type="info" style="margin-bottom: 15px" />
          <div style="display: flex; gap: 30px">
            <div>
              <div style="margin-bottom: 8px">一寸照片</div>
              <el-upload action="http://localhost:8080/upload" name="mf" :show-file-list="false"
                accept=".png,.jpg,.jpeg" :on-success="(r) => uploadSuccess(r, 'photo')"
                :before-upload="(f) => beforeImg(f)">
                <img v-if="form.photo" :src="form.photo" style="width: 100px; height: 130px; object-fit: cover" />
                <el-icon v-else style="width: 100px; height: 130px; font-size: 30px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center"><Plus /></el-icon>
              </el-upload>
            </div>
            <div>
              <div style="margin-bottom: 8px">身份证人像面</div>
              <el-upload action="http://localhost:8080/upload" name="mf" :show-file-list="false"
                accept=".png,.jpg,.jpeg" :on-success="(r) => uploadSuccess(r, 'idCardFront')"
                :before-upload="(f) => beforeImg(f)">
                <img v-if="form.idCardFront" :src="form.idCardFront" style="width: 160px; height: 100px; object-fit: cover" />
                <el-icon v-else style="width: 160px; height: 100px; font-size: 30px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center"><Plus /></el-icon>
              </el-upload>
            </div>
            <div>
              <div style="margin-bottom: 8px">身份证国徽面</div>
              <el-upload action="http://localhost:8080/upload" name="mf" :show-file-list="false"
                accept=".png,.jpg,.jpeg" :on-success="(r) => uploadSuccess(r, 'idCardBack')"
                :before-upload="(f) => beforeImg(f)">
                <img v-if="form.idCardBack" :src="form.idCardBack" style="width: 160px; height: 100px; object-fit: cover" />
                <el-icon v-else style="width: 160px; height: 100px; font-size: 30px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center"><Plus /></el-icon>
              </el-upload>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 步骤2: 入住评估 -->
    <el-card v-if="activeStep === 2" shadow="never">
      <template #header><span>入住评估</span></template>
      <el-tabs v-model="step2Tab">
        <!-- Tab1 健康评估 -->
        <el-tab-pane label="健康评估" name="health">
          <el-form label-width="140px">
            <el-form-item label="疾病诊断">
              <el-checkbox-group v-model="form.diseases">
                <el-checkbox v-for="d in DISEASES" :key="d" :label="d" :value="d" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="用药情况">
              <el-table :data="form.medications" border style="width: 700px; margin-bottom: 8px">
                <el-table-column label="药物名称" min-width="160">
                  <template #default="{ row }"><el-input v-model="row.name" /></template>
                </el-table-column>
                <el-table-column label="服药方法" min-width="160">
                  <template #default="{ row }"><el-input v-model="row.method" /></template>
                </el-table-column>
                <el-table-column label="用药剂量" min-width="140">
                  <template #default="{ row }"><el-input v-model="row.dose" /></template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ $index }">
                    <el-button type="primary" size="small" @click="addMedication">增加</el-button>
                    <el-button v-if="form.medications.length > 1" type="danger" size="small" @click="removeMedication($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="近30天风险事件">
              <div v-for="r in riskItems" :key="r.key" style="margin-bottom: 8px">
                <span style="width: 90px; display: inline-block">{{ r.label }}</span>
                <el-radio-group v-model="form[r.key]">
                  <el-radio v-for="o in riskOptions" :key="o" :value="o">{{ o }}</el-radio>
                </el-radio-group>
              </div>
            </el-form-item>
            <el-form-item label="身体健康情况">
              <el-checkbox-group v-model="form.bodyConditions">
                <el-checkbox v-for="b in bodyConditionOptions" :key="b" :label="b" :value="b" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="特殊医疗照护">
              <el-checkbox-group v-model="form.specialMedical">
                <el-checkbox v-for="s in specialMedicalOptions" :key="s" :label="s" :value="s" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="自理能力">
              <el-radio-group v-model="form.selfCare">
                <el-radio v-for="s in selfCareOptions" :key="s" :value="s">{{ s }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="行为异常">
              <el-checkbox-group v-model="form.behaviorAbnormal">
                <el-checkbox v-for="b in behaviorOptions" :key="b" :label="b" :value="b" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="近期体检报告">
              <el-upload action="http://localhost:8080/upload" name="mf" :show-file-list="true"
                accept=".pdf" :on-success="(r) => uploadSuccess(r, 'medicalReport')"
                :before-upload="(f) => beforePdf(f)">
                <el-button type="primary" plain>上传PDF体检报告</el-button>
              </el-upload>
              <span v-if="form.medicalReport" style="margin-left: 10px; color: #67c23a">已上传</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab2 能力评估 -->
        <el-tab-pane label="能力评估" name="ability">
          <div v-for="q in EVAL_QUESTIONS" :key="q.id" style="margin-bottom: 18px">
            <div style="font-weight: bold; margin-bottom: 6px">{{ q.id }}. [{{ q.category }}] {{ q.title }}</div>
            <el-radio-group v-model="form.evalAnswers[q.id]" @change="calcEvalScore">
              <div v-for="(o, i) in q.options" :key="i" style="margin-bottom: 4px">
                <el-radio :value="i">{{ o.label }}</el-radio>
                <span v-if="form.evalAnswers[q.id] === i" style="color: #409eff; margin-left: 8px">（{{ o.score }}分）</span>
              </div>
            </el-radio-group>
          </div>
          <el-divider />
          <div style="font-size: 16px">
            <div>自理能力得分（题1、2、3、9）：{{ selfScore }}</div>
            <div>精神状态得分（题6）：{{ mentalScore }}</div>
            <div>感知觉与社会参与得分（题4、5、7、8、10）：{{ socialScore }}</div>
            <div style="font-weight: bold; margin-top: 8px">评估总分：{{ totalScore }} 分</div>
          </div>
        </el-tab-pane>

        <!-- Tab3 评估报告 -->
        <el-tab-pane label="评估报告" name="report">
          <el-form label-width="140px" style="max-width: 700px">
            <el-form-item label="评估总分">
              <el-input :model-value="totalScore + ' 分'" readonly />
            </el-form-item>
            <el-form-item label="自理能力得分"><el-input :model-value="selfScore + ' 分'" readonly /></el-form-item>
            <el-form-item label="精神状态得分"><el-input :model-value="mentalScore + ' 分'" readonly /></el-form-item>
            <el-form-item label="感知觉与社会参与得分"><el-input :model-value="socialScore + ' 分'" readonly /></el-form-item>
            <el-form-item label="能力初步等级">
              <el-input :model-value="judgeLevel(totalScore)" readonly />
            </el-form-item>
            <el-form-item label="护理等级结果">
              <el-checkbox-group v-model="form.nursingLevelResult">
                <el-checkbox v-for="n in nursingResultOptions" :key="n" :label="n" :value="n" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="能力等级变更依据">
              <el-checkbox-group v-model="form.levelChangeBasis">
                <el-checkbox v-for="b in levelChangeOptions" :key="b" :label="b" :value="b" />
              </el-checkbox-group>
              <el-input v-model="form.levelChangeOther" placeholder="其他（请说明）" style="width: 300px; margin-top: 8px" />
            </el-form-item>
            <el-form-item label="能力最终等级">
              <el-radio-group v-model="form.finalLevel">
                <el-radio v-for="f in finalLevelOptions" :key="f" :value="f">{{ f }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 步骤3: 入住审批 -->
    <el-card v-if="activeStep === 3" shadow="never">
      <template #header><span>入住审批</span></template>
      <el-form label-width="120px" style="max-width: 600px">
        <el-form-item label="审批结果">
          <el-radio-group v-model="form.approveResult">
            <el-radio value="通过">通过</el-radio>
            <el-radio value="驳回">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="form.approveOpinion" type="textarea" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <el-alert v-if="form.approveResult === '驳回'" title="驳回后流程状态将变为已关闭" type="warning" style="margin-top: 10px" />
    </el-card>

    <!-- 步骤4: 入住配置 -->
    <el-card v-if="activeStep === 4" shadow="never">
      <template #header><span>入住配置</span></template>
      <el-form label-width="120px" style="max-width: 700px">
        <el-divider content-position="left">入住设置</el-divider>
        <el-form-item label="入住期限">
          <el-date-picker v-model="form.checkInTerm" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 360px" />
        </el-form-item>
        <el-form-item label="入住床位">
          <el-input v-model="form.bedNo" placeholder="选择入住床位" />
        </el-form-item>
        <el-form-item label="护理等级">
          <el-select v-model="form.nursingLevel" placeholder="请选择">
            <el-option label="A特级" value="A特级" />
            <el-option label="A级" value="A级" />
            <el-option label="B级" value="B级" />
            <el-option label="C级" value="C级" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">费用设置</el-divider>
        <el-form-item label="费用期限">
          <el-date-picker v-model="form.feeTerm" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 360px" />
        </el-form-item>
        <el-form-item label="押金（元）">
          <el-input-number v-model="form.deposit" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="护理费用（元/月）">
          <el-input-number v-model="form.nursingFee" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="床位费用（元/月）">
          <el-input-number v-model="form.bedFee" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="其他费用（元/月）">
          <el-input-number v-model="form.otherFee" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="医保支付（元/月）">
          <el-input-number v-model="form.medicalPay" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="政府补贴（元/月）">
          <el-input-number v-model="form.govSubsidy" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="billPreviewVisible = true">账单预览</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 步骤4 账单预览弹窗 -->
    <el-dialog v-model="billPreviewVisible" title="账单预览" width="600px">
      <el-table :data="billPreviewData" border>
        <el-table-column prop="item" label="费用项目" />
        <el-table-column prop="amount" label="金额（元/月）" />
      </el-table>
      <div style="text-align: right; margin-top: 10px; font-weight: bold">
        合计应缴：{{ billTotal }} 元/月
      </div>
    </el-dialog>

    <!-- 步骤5: 签约办理 -->
    <el-card v-if="activeStep === 5" shadow="never">
      <template #header><span>签约办理</span></template>
      <el-form label-width="120px" style="max-width: 600px">
        <el-form-item label="合同编号">
          <el-input v-model="form.contractNo" readonly placeholder="提交后自动生成" />
        </el-form-item>
        <el-form-item label="合同名称"><el-input v-model="form.contractName" /></el-form-item>
        <el-form-item label="合同期限">
          <el-input v-model="contractTermText" readonly placeholder="根据入住期限自动显示" />
        </el-form-item>
        <el-form-item label="签约日期">
          <el-date-picker v-model="form.signDate" type="date" value-format="YYYY-MM-DD" style="width: 200px" />
        </el-form-item>
        <el-form-item label="丙方姓名"><el-input v-model="form.thirdPartyName" /></el-form-item>
        <el-form-item label="丙方联系方式"><el-input v-model="form.thirdPartyPhone" maxlength="11" /></el-form-item>
        <el-form-item label="上传合同">
          <el-upload action="http://localhost:8080/upload" name="mf" :show-file-list="true"
            accept=".pdf" :on-success="(r) => uploadSuccess(r, 'contractFile')"
            :before-upload="(f) => beforePdf(f)">
            <el-button type="primary" plain>上传合同PDF</el-button>
          </el-upload>
          <span v-if="form.contractFile" style="margin-left: 10px; color: #67c23a">已上传</span>
        </el-form-item>
      </el-form>
      <el-alert title="完成合同签约后将生成首期账单和合同" type="info" style="margin-top: 15px" />
    </el-card>

    <!-- 只读详情（步骤>5或已完成） -->
    <el-card v-if="activeStep > 5 || detail.flowStatus === '已完成' || detail.flowStatus === '已关闭'" shadow="never">
      <template #header><span>入住办理详情（{{ detail.flowStatus }}）</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="单据编号">{{ detail.billNo }}</el-descriptions-item>
        <el-descriptions-item label="老人姓名">{{ detail.elderName }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.idCard }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ detail.gender }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ detail.birthday }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ detail.age }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="家庭住址">{{ detail.address }}</el-descriptions-item>
        <el-descriptions-item label="民族">{{ detail.nation }}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{ detail.politicalStatus }}</el-descriptions-item>
        <el-descriptions-item label="宗教信仰">{{ detail.religion }}</el-descriptions-item>
        <el-descriptions-item label="婚姻状况">{{ detail.maritalStatus }}</el-descriptions-item>
        <el-descriptions-item label="文化程度">{{ detail.education }}</el-descriptions-item>
        <el-descriptions-item label="经济来源">{{ detail.incomeSource }}</el-descriptions-item>
        <el-descriptions-item label="医疗保障">{{ detail.medicalSecurity }}</el-descriptions-item>
        <el-descriptions-item label="医保卡号">{{ detail.medicareCard }}</el-descriptions-item>
        <el-descriptions-item label="特长爱好">{{ detail.hobbies }}</el-descriptions-item>
        <el-descriptions-item label="入住床位">{{ detail.bedNo }}</el-descriptions-item>
        <el-descriptions-item label="护理等级">{{ detail.nursingLevel }}</el-descriptions-item>
        <el-descriptions-item label="入住期限">{{ detail.checkInTermStart }} ~ {{ detail.checkInTermEnd }}</el-descriptions-item>
        <el-descriptions-item label="审批结果">{{ detail.approveResult }}</el-descriptions-item>
        <el-descriptions-item label="审批意见">{{ detail.approveOpinion }}</el-descriptions-item>
        <el-descriptions-item label="能力最终等级">{{ detail.finalLevel }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{ detail.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="合同名称">{{ detail.contractName }}</el-descriptions-item>
        <el-descriptions-item label="签约日期">{{ detail.signDate }}</el-descriptions-item>
        <el-descriptions-item label="丙方姓名">{{ detail.thirdPartyName }}</el-descriptions-item>
        <el-descriptions-item label="流程状态">{{ detail.flowStatus }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 底部按钮 -->
    <div style="text-align: center; margin-top: 20px" v-if="detail.flowStatus !== '已完成' && detail.flowStatus !== '已关闭' && activeStep <= 5">
      <el-button @click="goBack">返回</el-button>
      <el-button type="primary" :loading="submitting" @click="submitStep">{{ submitBtnText }}</el-button>
      <el-button v-if="activeStep === 1" type="warning" @click="revoke">撤销</el-button>
    </div>
    <div style="text-align: center; margin-top: 20px" v-else>
      <el-button @click="goBack">返回列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { EVAL_QUESTIONS, judgeLevel, DISEASES } from './evalQuestions'

// JSON字符串→数组,已经是数组直接返回,空返回默认值
function parseArr(v, def) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim()) {
    try { return JSON.parse(v) } catch (_) { return def || [] }
  }
  return def || []
}

const route = useRoute()
const router = useRouter()

const id = ref(route.query.id ? Number(route.query.id) : null)
const activeStep = ref(1)
const detail = ref({})
const logs = ref([])
const step1Tab = ref('base')
const step2Tab = ref('health')
const billPreviewVisible = ref(false)
const submitting = ref(false)

// 静态选项
const nationOptions = ['汉族', '回族', '满族', '其他']
const politicalOptions = ['群众', '中共党员', '中共预备党员', '其他民主党派', '无党派人士']
const religionOptions = ['佛教', '道教', '基督教', '天主教', '伊斯兰教', '其他']
const maritalOptions = ['已婚', '丧偶', '未婚', '离婚', '再婚']
const educationOptions = ['文盲', '小学', '初中', '高中', '中专', '大专', '本科', '硕士', '博士']
const incomeOptions = ['退休金', '子女补贴', '亲友资助', '政府补助', '其他']
const medicalOptions = ['城镇职工基本医疗保险', '城乡居民基本医疗保险']
const relationOptions = ['子女', '配偶', '亲属', '朋友', '社工', '其他']
const riskItems = [
  { key: 'riskFall', label: '跌倒' },
  { key: 'riskLost', label: '走失' },
  { key: 'riskChoke', label: '噎食' },
  { key: 'riskComa', label: '昏迷' },
  { key: 'riskSuicide', label: '自杀' }
]
const riskOptions = ['0次', '1次', '2次', '3次+']
const bodyConditionOptions = ['擦伤', '烧烫伤', '术后伤口', '糖尿病足溃疡', '胃管', '尿管', '气管切开', '胃/肠/膀胱造痿', '血管性溃疡', '其他伤口']
const specialMedicalOptions = ['无创呼吸机', '透析', '其他']
const selfCareOptions = ['不能自理', '轻度依赖', '中度依赖', '可自理']
const behaviorOptions = ['记忆障碍', '痴呆前兆', '日常生活能力减退', '呆坐']
const nursingResultOptions = ['已诊断疾病超过3项', '风险事件超过3次', '长期处于昏迷状态', '认知障碍', '痴呆', '精神类疾病']
const levelChangeOptions = ['已诊断疾病超过3项', '风险事件超过3次', '长期处于昏迷状态', '认知障碍', '痴呆', '精神类疾病', '其他']
const finalLevelOptions = ['能力完好', '轻度失能', '中度失能', '中重度失能', '重度失能']

const form = reactive({
  // 步骤1 基本信息
  elderName: '', idCard: '', gender: '', birthday: '', age: '', address: '', phone: '',
  nation: '', politicalStatus: '', religion: '', maritalStatus: '', education: '',
  incomeSource: '', medicalSecurity: '', medicareCard: '', hobbies: '',
  // 家属信息
  familyMembers: [{ name: '', phone: '', relation: '' }],
  // 资料上传
  photo: '', idCardFront: '', idCardBack: '',
  // 步骤2 健康评估
  diseases: [], medications: [{ name: '', method: '', dose: '' }],
  riskFall: '', riskLost: '', riskChoke: '', riskComa: '', riskSuicide: '',
  bodyConditions: [], specialMedical: [], selfCare: '', behaviorAbnormal: '', medicalReport: '',
  // 能力评估
  evalAnswers: reactive({}),
  // 评估报告
  nursingLevelResult: [], levelChangeBasis: [], levelChangeOther: '', finalLevel: '',
  // 步骤3 审批
  approveResult: '', approveOpinion: '',
  // 步骤4 入住配置
  checkInTerm: [], bedNo: '', nursingLevel: '',
  feeTerm: [], deposit: 3000.0, nursingFee: 0, bedFee: 0, otherFee: 0, medicalPay: 0, govSubsidy: 0,
  // 步骤5 签约
  contractNo: '', contractName: '', signDate: new Date().toISOString().slice(0, 10),
  thirdPartyName: '', thirdPartyPhone: '', contractFile: ''
})

// 计算评估得分
const totalScore = computed(() => {
  let total = 0
  EVAL_QUESTIONS.forEach(q => {
    const idx = form.evalAnswers[q.id]
    if (idx !== undefined && idx !== null && idx !== '') {
      total += q.options[idx].score
    }
  })
  return total
})
const selfScore = computed(() => {
  let s = 0; [1, 2, 3, 9].forEach(qid => {
    const idx = form.evalAnswers[qid]
    if (idx !== undefined && idx !== null && idx !== '') s += EVAL_QUESTIONS.find(q => q.id === qid).options[idx].score
  })
  return s
})
const mentalScore = computed(() => {
  const idx = form.evalAnswers[6]
  return idx !== undefined && idx !== null && idx !== '' ? EVAL_QUESTIONS.find(q => q.id === 6).options[idx].score : 0
})
const socialScore = computed(() => {
  let s = 0; [4, 5, 7, 8, 10].forEach(qid => {
    const idx = form.evalAnswers[qid]
    if (idx !== undefined && idx !== null && idx !== '') s += EVAL_QUESTIONS.find(q => q.id === qid).options[idx].score
  })
  return s
})

const contractTermText = computed(() => {
  if (form.checkInTerm && form.checkInTerm.length === 2) return form.checkInTerm[0] + ' ~ ' + form.checkInTerm[1]
  return detail.value.checkInTermStart ? (detail.value.checkInTermStart + ' ~ ' + detail.value.checkInTermEnd) : ''
})

const billPreviewData = computed(() => [
  { item: '护理费用', amount: form.nursingFee },
  { item: '床位费用', amount: form.bedFee },
  { item: '其他费用', amount: form.otherFee },
  { item: '医保支付', amount: form.medicalPay },
  { item: '政府补贴', amount: form.govSubsidy }
])
const billTotal = computed(() => {
  const gross = form.nursingFee + form.bedFee + form.otherFee
  return (gross - form.medicalPay - form.govSubsidy).toFixed(2)
})

const submitBtnText = computed(() => {
  if (activeStep.value === 1) return '提交申请'
  if (activeStep.value === 5) return '确认签约'
  return '提交'
})

function parseIdCard() {
  const v = form.idCard
  if (!v || v.length !== 18) return
  const genderCode = parseInt(v.charAt(16), 10)
  form.gender = genderCode % 2 === 1 ? '男' : '女'
  const year = v.substring(6, 10)
  const month = v.substring(10, 12)
  const day = v.substring(12, 14)
  form.birthday = `${year}-${month}-${day}`
  const birth = new Date(`${year}-${month}-${day}`)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  form.age = age
}

const mobilePattern = /^1[3-9]\d{9}$/
const idCardPattern = /^\d{17}[\dXx]$/

function requireFields(fields) {
  const missing = fields.find(({ value }) => value === '' || value == null || (Array.isArray(value) && value.length === 0))
  if (!missing) return true
  ElMessage.warning(`请填写${missing.label}`)
  return false
}

function validateCurrentStep() {
  if (activeStep.value === 1) {
    if (!requireFields([{ label: '老人姓名', value: form.elderName }, { label: '老人身份证号', value: form.idCard }, { label: '家庭住址', value: form.address }, { label: '联系方式', value: form.phone }])) { step1Tab.value = 'base'; return false }
    if (!idCardPattern.test(form.idCard)) { step1Tab.value = 'base'; ElMessage.warning('身份证号格式错误，请重新输入'); return false }
    if (!mobilePattern.test(form.phone)) { step1Tab.value = 'base'; ElMessage.warning('手机号格式错误，请重新输入'); return false }
    const familyValid = form.familyMembers.length > 0 && form.familyMembers.every(member => member.name && member.relation && mobilePattern.test(member.phone))
    if (!familyValid) { step1Tab.value = 'family'; ElMessage.warning('家属信息不完整，请输入正确的姓名、手机号和关系'); return false }
    if (!form.photo || !form.idCardFront || !form.idCardBack) { step1Tab.value = 'upload'; ElMessage.warning('请上传一寸照片和身份证正反面'); return false }
  }
  if (activeStep.value === 2 && !form.finalLevel) { step2Tab.value = 'report'; ElMessage.warning('请完成能力评估并确认最终等级'); return false }
  if (activeStep.value === 3 && !form.approveResult) return requireFields([{ label: '审批结果', value: form.approveResult }])
  if (activeStep.value === 4) return requireFields([{ label: '床位号', value: form.bedNo }, { label: '护理等级', value: form.nursingLevel }])
  if (activeStep.value === 5) {
    if (!requireFields([{ label: '入住期限', value: form.checkInTerm }, { label: '合同名称', value: form.contractName }, { label: '签约日期', value: form.signDate }, { label: '合同文件', value: form.contractFile }])) return false
    if (form.thirdPartyPhone && !mobilePattern.test(form.thirdPartyPhone)) { ElMessage.warning('丙方联系方式格式错误，请重新输入'); return false }
  }
  return true
}

function addFamily() { form.familyMembers.push({ name: '', phone: '', relation: '' }) }
function removeFamily(idx) { form.familyMembers.splice(idx, 1) }
function addMedication() { form.medications.push({ name: '', method: '', dose: '' }) }
function removeMedication(idx) { form.medications.splice(idx, 1) }

function calcEvalScore() { /* 触发computed重新计算，空函数即可 */ }

function beforeImg(file) {
  const isImg = ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 <= 2
  if (!isImg) { ElMessage.error('仅支持 PNG/JPG/JPEG 格式'); return false }
  if (!isLt2M) { ElMessage.error('图片大小不超过2M'); return false }
  return true
}
function beforePdf(file) {
  if (file.type !== 'application/pdf') { ElMessage.error('仅支持PDF格式'); return false }
  return true
}
function uploadSuccess(res, field) {
  const path = (res && (res.data || res)) || ''
  form[field] = typeof path === 'string' ? path : (path.url || '')
  ElMessage.success('上传成功')
}

function loadDetail() {
  if (!id.value) { activeStep.value = 1; detail.value = {}; return }
  axios.post('/checkInDetail', { id: id.value }).then(res => {
    detail.value = res.data || {}
    activeStep.value = detail.value.currentStep || 1
    fillForm()
  })
  axios.post('/checkInFamily', { id: id.value }).then(res => {
    form.familyMembers = (res.data && res.data.length) ? res.data : [{ name: '', phone: '', relation: '' }]
  })
  axios.post('/checkInLogs', { id: id.value }).then(res => {
    logs.value = res.data || []
  })
}

function fillForm() {
  const d = detail.value
  Object.assign(form, {
    elderName: d.elderName || '', idCard: d.idCard || '', gender: d.sex || d.gender || '',
    birthday: d.birthday || '', age: d.age || '', address: d.address || '', phone: d.phone || '',
    nation: d.nation || '', politicalStatus: d.politicsStatus || d.politicalStatus || '', religion: d.religion || '',
    maritalStatus: d.marriage || d.maritalStatus || '', education: d.education || '', incomeSource: d.incomeSource || '',
    medicalSecurity: d.medicalInsurance || d.medicalSecurity || '', medicareCard: d.medicareCard || '', hobbies: d.hobbies || '',
    photo: d.photo || '', idCardFront: d.idCardFront || '', idCardBack: d.idCardBack || '',
    diseases: parseArr(d.diseases), bodyConditions: parseArr(d.bodyHealth), specialMedical: parseArr(d.medicalCare),
    riskFall: d.riskFalls || '', riskLost: d.riskLost || '', riskChoke: d.riskChoking || '',
    riskComa: d.riskComa || '', riskSuicide: d.riskSuicide || '',
    selfCare: d.abilitySelf || '', behaviorAbnormal: parseArr(d.behaviorIssues), medicalReport: d.medicalReport || '',
    nursingLevelResult: parseArr(d.nursingLevelResult), levelChangeBasis: parseArr(d.levelChangeReason),
    levelChangeOther: '', finalLevel: d.evalLevel || '',
    approveResult: d.approveResult || '', approveOpinion: d.approveOpinion || '',
    bedNo: d.bedNo || '', nursingLevel: d.nursingLevel || '',
    deposit: d.deposit != null ? d.deposit : 3000.0, nursingFee: d.nursingFee || 0,
    bedFee: d.bedFee || 0, otherFee: d.otherFee || 0, medicalPay: d.insurancePay || 0, govSubsidy: d.govSubsidy || 0,
    contractNo: d.contractNo || '', contractName: d.contractName || '',
    signDate: d.signDate || new Date().toISOString().slice(0, 10),
    thirdPartyName: d.partyCName || '', thirdPartyPhone: d.partyCPhone || '', contractFile: d.contractFile || ''
  })

  form.medications = parseArr(d.medications, [{ name: '', method: '', dose: '' }])
  if (d.startDate && d.endDate) form.checkInTerm = [d.startDate, d.endDate]
  if (d.feeStartDate && d.feeEndDate) form.feeTerm = [d.feeStartDate, d.feeEndDate]

  const evalScores = parseArr(d.evalScores, null)
  if (evalScores && evalScores.length) {
    evalScores.forEach((s, i) => { form.evalAnswers[i + 1] = s - 1 })
  }
}

function submitStep() {
  if (submitting.value || !validateCurrentStep()) return
  if (activeStep.value === 1 && !id.value) {
    const payload = { ...form, familyMembers: form.familyMembers }
    submitting.value = true
    axios.post('/startCheckIn', payload).then(res => {
      if (res.data.code === 200) {
        ElMessage.success(res.data.msg)
        id.value = res.data.id
        activeStep.value = 2
        loadDetail()
      } else ElMessage.error(res.data.msg || '提交失败')
    }).catch(() => ElMessage.error('提交失败，请稍后重试')).finally(() => { submitting.value = false })
    return
  }
  if (activeStep.value === 3 && form.approveResult === '驳回') {
    ElMessageBox.confirm('驳回后流程将关闭，是否继续？', '确认驳回', { type: 'warning' })
      .then(() => doSubmit()).catch(() => {})
    return
  }
  doSubmit()
}

function doSubmit() {
  const payload = { ...form, id: id.value, step: activeStep.value }
  payload.riskFalls = form.riskFall
  payload.riskChoking = form.riskChoke
  payload.bodyHealth = form.bodyConditions
  payload.medicalCare = form.specialMedical
  payload.abilitySelf = form.selfCare
  payload.behaviorIssues = form.behaviorAbnormal
  payload.evalLevel = form.finalLevel
  payload.levelChangeReason = form.levelChangeOther
    ? [...form.levelChangeBasis, form.levelChangeOther]
    : form.levelChangeBasis
  payload.insurancePay = form.medicalPay
  payload.partyCName = form.thirdPartyName
  payload.partyCPhone = form.thirdPartyPhone
  if (form.checkInTerm && form.checkInTerm.length === 2) {
    payload.startDate = form.checkInTerm[0]
    payload.endDate = form.checkInTerm[1]
  }
  if (form.feeTerm && form.feeTerm.length === 2) {
    payload.feeStartDate = form.feeTerm[0]
    payload.feeEndDate = form.feeTerm[1]
  }
  payload.evalScores = { total: totalScore.value, self: selfScore.value, mental: mentalScore.value, social: socialScore.value }
  payload.evalTotalScore = totalScore.value
  payload.evalSelfScore = selfScore.value
  payload.evalMentalScore = mentalScore.value
  payload.evalPerceptionScore = socialScore.value
  submitting.value = true
  axios.post('/submitCheckInStep', payload).then(res => {
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      loadDetail()
    } else ElMessage.error(res.data.msg || '提交失败')
  }).catch(() => ElMessage.error('提交失败，请稍后重试')).finally(() => { submitting.value = false })
}

function revoke() {
  ElMessageBox.confirm('此操作将撤销已提交信息，是否继续？', '确认撤销', { type: 'warning' })
    .then(() => {
      axios.post('/revokeCheckIn', { id: id.value }).then(res => {
        if (res.data.code === 200) { ElMessage.success(res.data.msg); goBack() }
      })
    }).catch(() => {})
}

function goBack() { router.push('/CheckIn') }

onMounted(() => { form.signDate = new Date().toISOString().slice(0, 10); loadDetail() })
</script>
