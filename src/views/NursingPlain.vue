<template>
  <!--  添加对话框组件，实现护理项目的新增  -->
  <el-dialog
      v-model="nursingPlainDialogVisible"
      title="护理计划信息"
      width="60%">

    <el-form  label-width="auto"
              style="margin-left:5%;margin-right:5%;max-width: 90%">
      <el-form-item label="护理计划名称">
        <el-input  v-model="nursingPlainForm.plainname"/>
      </el-form-item>
      <el-form-item label="护理项目">
        <el-table
            :data="associatedItemList"
            style="width: 100%" :fit="true">

          <el-table-column label="护理项目名称" width="200">
             <template #default="scope">
               <el-select
                 v-model="nursingPlainForm.plainItemList.itemid[scope.$index]"
                 placeholder="请选择"
                 style="width: 100%"
                 @change="handleItemSelect(scope.$index)">
                 <el-option
                   v-for="item in getAvailableItems(scope.$index)"
                   :key="item.id"
                   :label="item.itemname"
                   :value="item.id">
                 </el-option>
               </el-select>
             </template>
          </el-table-column>

          <el-table-column label="期望服务时间" width="200">
            <template #default="scope">
              <el-time-picker
                style="width: 100%"
                v-model="nursingPlainForm.plainItemList.hlsj[scope.$index]"
                :picker-options="{
                   selectableRange: '00:00:00 - 23:59:59'
                  }"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间">
              </el-time-picker>
            </template>
          </el-table-column>

          <el-table-column label="执行周期" width="150">
            <template #default="scope">
              <el-select
                placeholder="选择"
                style="width: 100%"
                v-model="nursingPlainForm.plainItemList.hlzq[scope.$index]">
                <el-option label="每日" value="天"/>
                <el-option label="每周" value="周" />
                <el-option label="每月" value="月" />
                <el-option label="每季" value="季" />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="执行频次(次)" width="150">
            <template #default="scope">
              <el-input size="small"
                v-model="nursingPlainForm.plainItemList.hlpc[scope.$index]"
                type="number"
                min="1"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150">
            <template #default="scope">
              <!-- 只有当还有可用选项时才显示+按钮 -->
              <el-button
                v-if="hasAvailableItems()"
                type="primary"
                size="small"
                @click="addItem(scope)">+</el-button>
              <el-button
                type="danger"
                size="small"
                @click="subItem(scope)">-</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item style="margin-left: 40%">
        <template #default="scope">
          <el-button type="primary" round @click="saveNursingPlain">确认</el-button>
          <el-button type="warning" round @click="closeNursingPlain">取消</el-button>
        </template>
      </el-form-item>
    </el-form>

  </el-dialog>

  <!--  table列表组件  -->
  护理项名称&nbsp;:&nbsp;
  <el-input style="width:20%;margin-right: 20px" v-model="plainCondForm.plainname"/>
  状态&nbsp;:&nbsp;
  <el-select style="width:20%;margin-right: 20px"
             placeholder="请选择" v-model="plainCondForm.islock">
    <el-option value="启用">启用</el-option>
    <el-option value="禁用">禁用</el-option>
  </el-select>
  <el-button type="primary" @click="loadNursingPlainPageList(1)">搜索</el-button>
  <hr/>

  <div style="text-align: left">
    <el-button type="primary"
               @click="openNursingPlainDialog">新增护理计划</el-button>
  </div>

    <!-- 护理计划列表 -->
  <el-table
      :data="nursingPlainList"
      style="width: 100%" :fit="true">
    <el-table-column type="index" width="50" />
    <el-table-column prop="plainname" label="计划名称"/>
    <el-table-column prop="createuser" label="创建人" width="180"/>
    <el-table-column prop="createtime" label="创建时间"/>
    <el-table-column prop="islock" label="状态" width="180"/>

    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="warning" size="small"
                   @click="delNursingPlain(scope.row.id)"
                   :disabled="scope.row.flag==1?true:false">删除</el-button>
        <el-button type="primary" size="small"
                   @click="showNursingPlainInfo(scope.row)"
                   :disabled="scope.row.flag==1?true:false">编辑</el-button>
        <el-button type="success" size="small"
                   @click="updateIsLock(scope.row)"
                   :disabled="scope.row.flag==1?true:false">
          {{scope.row.islock=="启用"?"禁用":"启用"}}
        </el-button>
        <el-button @click="showNursingPlain(scope.row)">
          查看
        </el-button>
      </template>
    </el-table-column>



  </el-table>
  <!--   分页组件 -->
  <el-pagination
      size="small"
      background
      layout="prev, pager, next"
      :total="total" @change="loadNursingPlainPageList"/>

<!-- //////////////////////查看护理计划和护理项对话框/////////////////////// -->
  <!--  添加对话框组件，实现护理项目的新增  -->
  <el-dialog
      v-model="showPlainDialogVisible"
      title="护理计划信息"
      width="60%">

        <div style="text-align: left;font-size: 18px">
          护理计划名称:
          {{showPlainForm.plainname}}
        </div>

        <el-table
            :data="showPlainForm.itemList"
            style="width: 100%" :fit="true">
          <el-table-column prop="itemname"  label="护理项名称"/>
          <el-table-column prop="hlsj" label="服务时间"/>
          <el-table-column prop="hlzq" label="执行周期"/>
          <el-table-column prop="hlpc" label="执行频次"/>

        </el-table>


  </el-dialog>
</template>

<script setup>

import {onMounted, reactive, ref} from "vue";
 import axios from "axios";
 import { ElMessage, ElMessageBox } from 'element-plus';
 //声明新增护理计划对话框状态
 const nursingPlainDialogVisible=ref(false);
 //声明变量保存处理新增和更新护理计划接口地址
 var url=null;
 //声明函数打开新增护理计划对话框
 function openNursingPlainDialog(){
   nursingPlainDialogVisible.value=true;
   url="saveNursingPlain";

   // 初始化空数组
   associatedItemList.value = [];
   nursingPlainForm.plainItemList = {
     itemid: [],
     hlmc: [],
     hlsj: [],
     hlpc: [],
     hlzq: []
   };
   plainItemList.length = 0; // 清空 plainItemList

   // 添加一个默认空行
   addNewRow();

   //调用函数加载护理项
   laodNursingItemPageList(1);

 }
 //声明护理项目列表集合数据
 const nursingItemList=ref([]);
 // 声明已关联的护理项列表（用于编辑时显示）
 const associatedItemList=ref([]);
 //定义函数分页加载护理项目列表
 function laodNursingItemPageList(pageNum){
   var condForm={
     pageNum:pageNum
   }
   return axios.post("/nursingItemPage",condForm)
       .then(response=>{
         nursingItemList.value=response.data.nursingItems || [];
         total.value=response.data.total || 0;
         console.log('加载护理项列表成功，数量:', nursingItemList.value ? nursingItemList.value.length : 0);
         return response; // 返回 response 以便链式调用
       })
       .catch(error=>{
         console.error('加载护理项列表失败:', error);
         nursingItemList.value = []; // 确保即使失败也初始化为空数组
         throw error; // 抛出错误
       })
 }
 //声明添加护理计划表单对象
 const nursingPlainForm=reactive({
   id:'',
   plainname:'',
   plainItemList:{
     itemid:[],
     hlmc:[],
     hlsj:[],
     hlpc:[],
     hlzq:[]
   }
 });
 //声明集合对象保存需要添加为某个护理计划的护理项目数据
 const plainItemList=[];

 // 获取当前行可用的护理项目（排除已选择的）
 function getAvailableItems(currentIndex) {
   // 确保 nursingItemList.value 存在
   if (!nursingItemList.value || !Array.isArray(nursingItemList.value)) {
     return [];
   }

   // 确保 nursingPlainForm.plainItemList.itemid 存在
   if (!nursingPlainForm.plainItemList || !nursingPlainForm.plainItemList.itemid) {
     return nursingItemList.value;
   }

   // 获取当前已选择的所有项目ID
   const selectedIds = nursingPlainForm.plainItemList.itemid.filter((id, idx) =>
     idx !== currentIndex && id != null
   );

   // 过滤掉已选择的项目
   return nursingItemList.value.filter(item => !selectedIds.includes(item.id));
 }

 // 检查是否还有可用项目
 function hasAvailableItems() {
   // 确保数组存在
   if (!nursingPlainForm.plainItemList || !nursingPlainForm.plainItemList.itemid) {
     return true;
   }

   if (!nursingItemList.value || !Array.isArray(nursingItemList.value)) {
     return false;
   }

   const selectedCount = nursingPlainForm.plainItemList.itemid.filter(id => id != null).length;
   return selectedCount < nursingItemList.value.length;
 }

 // 处理项目选择变化
 function handleItemSelect(index) {
   // 更新 associatedItemList 中的显示名称
   const selectedId = nursingPlainForm.plainItemList.itemid[index];
   const selectedItem = nursingItemList.value.find(item => item.id === selectedId);
   if (selectedItem) {
     associatedItemList.value[index].itemname = selectedItem.itemname;
     associatedItemList.value[index].itemId = selectedId;
   }
 }

 //定义函数实现护理计划中添加某个护理项
 function addItem(scope){
    console.log('addItem 被调用');
    console.log('scope:', scope);

    var index=scope.$index;

    // 检查当前行的数据是否完整
    if(!nursingPlainForm.plainItemList.itemid[index]){
      console.log('当前行没有选择护理项目，无法添加');
      return;
    }

    // 获取当前行的数据
    var currentItem = {
      hlmc: nursingPlainForm.plainItemList.hlmc[index] || '',
      itemid: nursingPlainForm.plainItemList.itemid[index],
      hlsj: nursingPlainForm.plainItemList.hlsj[index] || '',
      hlpc: nursingPlainForm.plainItemList.hlpc[index] || 1,
      hlzq: nursingPlainForm.plainItemList.hlzq[index] || '天'
    };

    console.log('要添加的项目:', currentItem);

    // 添加到 plainItemList
    plainItemList.push(currentItem);

    // 添加一个新行
    addNewRow();

    console.log('plainItemList:', plainItemList);
 }

 //定义函删除某个护理计划下的某个护理项
  function subItem(scope){
    var index=scope.$index;
    //nursingPlainForm.plainItemList.下所有数组清空
    nursingPlainForm.plainItemList.hlsj.splice(index, 1);
    nursingPlainForm.plainItemList.hlpc.splice(index, 1);
    nursingPlainForm.plainItemList.hlzq.splice(index, 1);
    nursingPlainForm.plainItemList.itemid.splice(index, 1);
    nursingPlainForm.plainItemList.hlmc.splice(index, 1);

    //从 associatedItemList 中删除
    associatedItemList.value.splice(index, 1);

    console.log('删除后:', associatedItemList.value);
  }

  // 定义函数添加新行
  function addNewRow(){
    var newIndex = nursingPlainForm.plainItemList.itemid.length;
    nursingPlainForm.plainItemList.itemid[newIndex] = null;
    nursingPlainForm.plainItemList.hlmc[newIndex] = '';
    nursingPlainForm.plainItemList.hlsj[newIndex] = '';
    nursingPlainForm.plainItemList.hlpc[newIndex] = 1;
    nursingPlainForm.plainItemList.hlzq[newIndex] = '天';

    // 添加到 associatedItemList 用于显示
    associatedItemList.value.push({
      itemname: '',
      itemId: null,
      hlsj: '',
      hlpc: 1,
      hlzq: '天'
    });
  }
  //定义函数发生请求，保存护理计划
  function saveNursingPlain(){
    // 将表单中的数组数据转换为后端期望的格式
    var plainItemListData = [];
    for(var i = 0; i < nursingPlainForm.plainItemList.itemid.length; i++){
      if(nursingPlainForm.plainItemList.itemid[i]){
        plainItemListData.push({
          itemid: nursingPlainForm.plainItemList.itemid[i],
          hlmc: nursingPlainForm.plainItemList.hlmc[i],
          hlsj: nursingPlainForm.plainItemList.hlsj[i],
          hlpc: nursingPlainForm.plainItemList.hlpc[i],
          hlzq: nursingPlainForm.plainItemList.hlzq[i]
        });
      }
    }

    // 构建提交的数据对象
    var submitData = {
      id: nursingPlainForm.id,
      plainname: nursingPlainForm.plainname,
      plainItemList: plainItemListData
    };

    console.log('提交的数据:', submitData);

    axios.post(url, submitData)
    .then(response=>{
      if(response.data.code==200){
        //刷新列表
        loadNursingPlainPageList(1);
        //关闭对话框
        nursingPlainDialogVisible.value=false;
        //清空表单
        cleanNursingPlainForm();
      } else {
        console.error('保存失败:', response.data.msg);
      }
    })
    .catch(error=>{
      console.error('保存异常:', error);
    })

  }
  //声明护理计划列表和总记录数
  const nursingPlainList=ref([]);
  const total=ref(0);
  //声明分页查询提交查询参数的表单对象数据
  const plainCondForm=reactive({
    plainname:'',
    islock:'',
    pageNum:1,
    pageSize:10
  });
  //定义函数加载护理计划分页数据
  function loadNursingPlainPageList(pageNum){
    plainCondForm.pageNum=pageNum;
    axios.post("pageList",plainCondForm)
    .then(response=>{
      nursingPlainList.value=response.data.nursingPlains;
      total.value=response.data.total;
    })
    .catch(error=>{
      console.log(error);
    })
  }
  onMounted(function(){
    loadNursingPlainPageList(1);
  })
  //定义函数清空表单
  function cleanNursingPlainForm(){
    nursingPlainForm.id='';
    nursingPlainForm.plainItemList='';
    // nursingPlainForm.plainItemList.hlmc=[];
    // nursingPlainForm.plainItemList.hlsj=[];
    // nursingPlainForm.plainItemList.hlpc=[];
    // nursingPlainForm.plainItemList.hlzq=[];
    nursingItemList.value=[];

  }
  //声明showPlainDialogVisible表示查看护理计划对回框
  const showPlainDialogVisible=ref(false);
  //声明对象保存需要查看的护理计划和护理项信息
  const showPlainForm=reactive({
    plainname:'',
    itemList:[]
  });
  //定义函数打开查看护理计划对话框
  function showNursingPlain(row){
    showPlainDialogVisible.value=true;
    var plainid=row.id;
    var plainname=row.plainname;
    showPlainForm.plainname=plainname;
    axios.get("/queryPlainItem?plainid="+plainid)
    .then(response=>{
      showPlainForm.itemList=response.data;
    })
    .catch(error=>{
      console.log(error);
    })
  }
  ///////////////定义函数打开护理计划回显对话框//////////////////
  function showNursingPlainInfo(row){
    console.log('========== showNursingPlainInfo 被调用 ==========');
    console.log('row:', row);

    nursingPlainForm.id=row.id;
    nursingPlainForm.plainname=row.plainname;
    url="updateNursingPlain";

    // 先初始化空数组，避免 undefined 错误
    associatedItemList.value = [];
    nursingPlainForm.plainItemList = {
      itemid: [],
      hlmc: [],
      hlsj: [],
      hlpc: [],
      hlzq: []
    };

    // 先加载所有护理项列表
    laodNursingItemPageList(1)
    .then(() => {
      console.log('护理项列表加载完成，总数:', nursingItemList.value.length);

      // 然后查询该护理计划下的所有护理项并回显
      return axios.get("/queryPlainItem?plainid="+row.id);
    })
    .then(response=>{
      console.log('后端返回的数据:', response.data);
      var plainItemListData = response.data;
      console.log('护理项数量:', plainItemListData ? plainItemListData.length : 0);

      if(plainItemListData && plainItemListData.length > 0){
        // 填充已关联的护理项列表（用于表格显示）
        associatedItemList.value = plainItemListData.map(item => {
          console.log('处理单个护理项:', item);
          return {
            itemname: item.itemname,
            itemId: item.itemId,
            hlsj: item.hlsj,
            hlpc: item.hlpc,
            hlzq: item.hlzq
          };
        });

        console.log('associatedItemList:', associatedItemList.value);

        // 填充表单数组（用于提交）
        plainItemListData.forEach((item, index)=>{
          nursingPlainForm.plainItemList.itemid[index] = item.itemId;
          nursingPlainForm.plainItemList.hlmc[index] = item.itemname;
          nursingPlainForm.plainItemList.hlsj[index] = item.hlsj;
          nursingPlainForm.plainItemList.hlpc[index] = item.hlpc;
          nursingPlainForm.plainItemList.hlzq[index] = item.hlzq;
        });
      } else {
        console.log('该护理计划下没有护理项');
        associatedItemList.value = [];
      }
    })
    .catch(error=>{
      console.error('查询护理项失败:', error);
      associatedItemList.value = [];
    })
    .finally(() => {
      //修改对话框状态
      nursingPlainDialogVisible.value=true;
      console.log('对话框已打开，associatedItemList长度:', associatedItemList.value.length);
    });
  }

  // 定义函数关闭对话框时清空关联列表
  function closeNursingPlain(){
    //修改对话框状态
    nursingPlainDialogVisible.value=false;
    cleanNursingPlainForm();
    associatedItemList.value = [];
  }

  // 定义函数删除护理计划
  function delNursingPlain(id){
    console.log('删除护理计划ID:', id);

    // 二次确认
    ElMessageBox.confirm(
      '确定要删除该护理计划吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      axios.get("/delNursingPlain?id=" + id)
      .then(response => {
        if(response.data.code == 200){
          ElMessage.success('删除成功');
          loadNursingPlainPageList(1);
        } else {
          ElMessage.error(response.data.msg || '删除失败');
        }
      })
      .catch(error => {
        console.error('删除异常:', error);
        ElMessage.error('网络错误');
      });
    }).catch(() => {
      // 用户取消
    });
  }

  // 定义函数更新锁定状态
  function updateIsLock(row){
    console.log('更新状态:', row);
    // TODO: 实现状态切换逻辑
  }
</script>
