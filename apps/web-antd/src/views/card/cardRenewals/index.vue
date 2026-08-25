<script lang="ts" setup>
import {ref,onMounted} from 'vue'
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeTableGridOptions } from '#/adapter/vxe-table';
import { Page,confirm,Loading, useVbenModal,VbenButton } from '@vben/common-ui';
import { Space,Button, Tag, Dropdown, Menu, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryCardRenewal,delCardRenewal,updateCardRenewal,delBatchRenewals } from '#/api/cardRenewal/index';
import { MdiDelete, MdiMoreVert,MidAdd,MidEdit,MidLock,MidOpenLock } from '@vben/icons';
import AddModal from './addModal.vue';
import EditModal from './editModal.vue';
interface RowType {
  id?: number; // 添加该行，表示每条记录可能包含一个可选的 id
  platform: number;
  status: number;
  school: string;
  account: string;
  courseName: string;
}

const loading = ref(false);
const loadingText = ref('正在加载中...');
const removeButn = ref(true);
const convertUrl = ref();

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      fieldName: 'renewalKey',
      label: '续费CDK',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '1小时', value: 1 },
          { label: '3小时', value: 3 },
          { label: '24小时（1天）', value: 24 },
          { label: '72小时（3天）', value: 72 },
          { label: '168小时（7天）', value: 168 },
          { label: '336小时（15天）', value: 336 },
          { label: '30天（1个月）', value: 720 },
          { label: '90天（3个月）', value: 2160 },
          { label: '180天（6个月）', value: 4320 },
          { label: '365天（1年）', value: 8760 },
          { label: '永久', value: -1 },
        ],
      },
      fieldName: 'durationHours',
      label: '续费时长',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '未使用',
            value: 0,
          },
          {
            label: '已使用',
            value: 1,
          }
        ],
        placeholder: '请选择',
      },
      fieldName: 'status',
      label: '使用状态',
    },
    {
      component: 'Input',
      fieldName: 'usedCardKey',
      label: '被续费卡密',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 是否在字段值改变时提交表单
  submitOnChange: true,
  // 按下回车时是否提交表单
  submitOnEnter: true,
};
// 表格表配置
const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', type: 'checkbox', width: 30 },
    { field: 'renewalKey', title: '续费CDK', width: 250 },
    { field: 'usedCardKey', slots: { default : 'usedCardKey' }, title: '被续费卡密', width: 200 },
    { field: 'durationHours', slots: { default : 'durationHours' }, title: '续费时长', width: 100 },
    { field: 'restUsedCount', slots: { default : 'restUsedCount' }, title: '续费次数', width: 100 },
    { field: 'status', slots: { default : 'status' }, title: '状态', width: 200 },
    { field: 'updateTime', formatter: 'formatDateTime', title: '最后更新' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
    { field: 'action',fixed: 'right',slots: { default: 'action' },title: '操作',width: 200},
  ],
  exportConfig: {},
  height: 'auto',
  stripe: true,
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        // message.success(`Query params: ${JSON.stringify(formValues)}`);
        return await queryCardRenewal({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    resizable: true,
    zoom: true,
  },
};
// grid组件的触发的事件
const gridEvents: VxeGridListeners<RowType> = {
  // 单击行触发
  // cellClick: ({ row }) => {
  //   message.info(`cell-click: ${row.name}`);
  // },
  // 勾选触发
  checkboxChange: () => {
    // eslint-disable-next-line no-use-before-define
    const records = gridApi.grid.getCheckboxRecords();
    removeButn.value = records.length > 0 ? false : true;
  },
  // 全选触发
  checkboxAll: ({ checked }) => {
    // 手动更新选中状态（如果需要）
    removeButn.value = checked ? false : true;
    // message.info(`全选状态: ${checked ? '已全选' : '取消全选'}`);
  },
};
const [Grid,gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});
const showConfirm = function (){
  confirm({
    content: '数据无价，请谨慎操作,是否继续删除？',
    icon: 'error',
    title: '重要',
    async beforeClose({ isConfirm }) {
      if(isConfirm){
        loading.value = true;
        loadingText.value = '正在删除...';
        // 获取选中的行数据 筛选Id
        const selectedIds = gridApi.grid.getCheckboxRecords()
          .map(item => item.id)
          .filter((id): id is number => id !== undefined);
        if (!selectedIds.length) {
          message.info('请先选择要删除的行');
          return false;
        }
        // 调用删除方法
        return await delBatchRenewals(selectedIds);
      }
    }
  }).then(() => {
    // 重载表格
    gridApi.query();
    message.success('删除成功');
    removeButn.value = true;
  }).finally(() => {
    loading.value = false;
  });
}
// 新增卡密
const [AddRootModal, addRootModalApi] = useVbenModal({
  connectedComponent: AddModal,
  onOpenChange(isOpen:boolean){
    if (!isOpen) {
      // 重载表格
      gridApi.query();
    }
  }
});

const [EditRootModal, editRootModalApi] = useVbenModal({
  connectedComponent: EditModal,
  onOpenChange(isOpen:boolean){
    if (!isOpen) {
      // 重载表格
      gridApi.query();
    }
  }
});

/**
 * 按钮删除订单方法
 * @param row 
 */
function delCardRenewalBtn(row: any) {
  confirm({
    content: '是否要删除 卡密:' + row.cardKey + ' ？' ,
    icon: 'error',
    title: '删除操作',
    async beforeClose({ isConfirm }) {
      if(isConfirm){
        loading.value = true;
        loadingText.value = '正在删除...';
        // 调用删除方法
        return await delCardRenewal(row.id);
      }
    }
  }).then(() => {
    // 重载表格
    gridApi.query();
    message.success('删除成功');
  }).finally(() => {
    loading.value = false;
  });
}
async function coryCardKeyBtn(row: any) {
 
  try {
    // 使用 Clipboard API 复制文本到剪切板
    await navigator.clipboard.writeText(row.renewalKey);
    message.success('卡密已复制到剪切板');
  } catch (err) {
    // 如果 Clipboard API 不可用，使用备选方案
    const textArea = document.createElement('textarea');
    textArea.value = row.renewalKey;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      message.success('卡密已复制到剪切板');
    } catch (err) {
      message.error('复制失败');
    }
    document.body.removeChild(textArea);
  }
}
function upStatusBtn(row: any) {
  let status = 0;
  if (row.status == 0) {
    status = 2;
  }
  updateCardRenewal({id:row.id,status:status}).then(() => {
    // 重载表格
    gridApi.query();
    message.success('操作成功');
  });
}
onMounted(() => {
  // 获取表格数据
  convertUrl.value = window.location.origin + '/convert?key=';
});
</script>

<template>
     <Loading
    :spinning="loading"
    :text= loadingText
  >
  <Page auto-content-height>
 
    <Grid>
      <template #usedCardKey="{ row }"> 
        <span style="color: red;">{{ row.usedCardKey }}</span>
      </template>
      <!-- 账户列 -->
      <template #durationHours="{ row }">
        {{ row.durationHours }} 小时
      </template>
      <template #restUsedCount="{ row }">
        <div v-if ="row.restUsedCount > -1">
          {{ row.restUsedCount}} 次
        </div>
        <div v-else>
          <Tag color="error">无限制</Tag>
        </div>
      </template>
      <!-- 状态列 -->
      <template #status="{ row }">
        <Tag v-if="row.status === 0" color="processing">未使用</Tag>
        <Tag v-else-if="row.status === 1" color="success">已使用</Tag>
        <Tag v-else-if="row.status == 2" color="error">禁 用</Tag>
        <Tag v-else color="error">已失效</Tag>
      </template>
      <!-- 固定列 -->
      <template #action="{ row }"> 
       <space>
          <Button
          type="primary"
          size="small" @click="()=>{ editRootModalApi.setData({fromData:row}).open() }">编辑</Button>
          <Button
          danger
          size="small" @click="delCardRenewalBtn(row)">删除</Button>
          <Dropdown>
            <Button type="link" size="small">
              <MdiMoreVert class="size-4" />
            </Button>
            <template #overlay>
              <Menu class="w-[150px]">
                <Menu.Item key="1" @click="coryCardKeyBtn(row)">
                  <span class="menu-item-content">
                    <MidEdit class="menu-item-icon size-4"/>
                    <span>复制</span>
                  </span>
                </Menu.Item>
                <Menu.Item key="2" @click="upStatusBtn(row)">
                  <div v-if="row.status == 0" class="menu-item-content">
                    <MidLock class="menu-item-icon size-4"/>禁用
                  </div>
                  <div v-else class="menu-item-content">
                    <MidOpenLock class="menu-item-icon size-4"/>启用
                  </div>
                </Menu.Item>
              </Menu>
            </template>
          </Dropdown>
       </space>
      </template>
      <template #toolbar-actions>
        <VbenButton class="mr-2" type="primary" @click="()=>addRootModalApi.open()">
        <MidAdd class="menu-item-icon size-5"/>
          新增CDK
        </VbenButton>
        <VbenButton class="mr-2"  :disabled=removeButn @click="showConfirm">
          <MdiDelete class="menu-item-icon size-4"/> 
          批量删除
        </VbenButton>
      </template>
    </Grid>
    <AddRootModal />
    <EditRootModal/>
  </Page>
   </Loading>
</template>
<style scoped>
.menu-item-content {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.menu-item-icon {
  margin-right: 4px;
  vertical-align: -0.125em; /* 微调图标垂直位置 */
}
</style>
