<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeTableGridOptions } from '#/adapter/vxe-table';
import {
  confirm,
  Loading,
  useVbenModal,
  VbenButton,
  useVbenDrawer,
} from '@vben/common-ui';
import {
  Space,
  Button,
  Tag,
  Dropdown,
  Menu,
  message,
  Avatar,
} from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { query, del, delBatch, activitys,activityPromotion } from '#/api/svipCard/index';
import {
  MdiDelete,
  MdiMoreVert,
  MidAdd,
  MidEdit,
  MidLock,
  MidOpenLock,
} from '@vben/icons';

import AddModal from './addModal.vue';
import EditModal from './editModal.vue';
import ActivityDrawer from './activityDrawer.vue';

// 类型定义
interface RowType {
  id?: number;
  platform: number;
  status: number;
  school: string;
  account: string;
  courseName: string;
  vipKey: string;
  personalUser: {
    username: string;
    photoUrl: string;
  };
  restUsedCount: number;
  updateTime: string;
  createTime: string;
}

// 状态管理
const loadingState = ref({
  isLoading: false,
  text: '正在加载中...'
});

const batchDeleteState = ref({
  isDisabled: true
});

const urlState = ref({
  convertUrl: ''
});

// 表单配置
const formOptions: VbenFormProps = {
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    {
      component: 'Input',
      fieldName: 'vipKey',
      label: 'SVIP卡密',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '未使用', value: 0 },
          { label: '已绑定', value: 1 },
          { label: '待充值', value: 2 },
          { label: '不符合', value: 3 },
          { label: '已使用', value: 4 },
        ],
        placeholder: '请选择',
      },
      fieldName: 'status',
      label: '使用状态',
    },
  ],
  showCollapseButton: true,
  submitOnChange: true,
  submitOnEnter: true,
};

// 表格配置
const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', type: 'checkbox', width: 30 },
    {
      field: 'vipKey',
      title: 'Vip卡密',
      width: 180,
      formatter: ({ cellValue }) => cellValue,
      exportMethod: ({ row }) => `${urlState.value.convertUrl}${row.vipKey}`,
    },
    {
      field: 'personalUser',
      slots: { default: 'personalUser' },
      title: '绑定用户',
      width: 230,
    },
    {
      field: 'type',
      slots: { default: 'type' },
      title: '卡密类型',
      width: 150,
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: '状态',
      width: 150,
    },
   
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
    {
      field: 'alipayTradeNo',
      title: '订单号',
      width: 150,
    },
    {
      field: 'payTime',
      title: '支付时间',
      width: 150,
    },
    {
      field: 'paidAmount',
      title: '支付金额',
      width: 150,
    },
     { field: 'updateTime', formatter: 'formatDateTime', title: '最后更新' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
  ],
  exportConfig: {},

  stripe: true,
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await query({
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

// 表格事件
const gridEvents: VxeGridListeners<RowType> = {
  checkboxChange: () => {
    const records = gridApi.grid.getCheckboxRecords();
    batchDeleteState.value.isDisabled = records.length === 0;
  },
  checkboxAll: ({ checked }) => {
    batchDeleteState.value.isDisabled = !checked;
  },
};

// Grid API
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

// Modal Components
const [AddRootModal, addRootModalApi] = useVbenModal({
  connectedComponent: AddModal,
  onOpenChange: handleModalChange,
});

const [EditRootModal, editRootModalApi] = useVbenModal({
  connectedComponent: EditModal,
  onOpenChange: handleModalChange,
});

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: ActivityDrawer,
  // 关闭事件
  onOpenChange(isOpen: boolean){
    if(!isOpen){
      // 刷新表格数据
      gridApi.reload();
    }
  }
});

// 统一处理模态框变更
function handleModalChange(isOpen: boolean) {
  if (!isOpen) {
    gridApi.query();
  }
}

// 批量删除确认
function showBatchDeleteConfirm() {
  confirm({
    content: '数据无价，请谨慎操作,是否继续删除？',
    icon: 'error',
    title: '重要',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        setLoadingState(true, '正在删除...');
        
        const selectedIds = getSelectedIds();
        if (!selectedIds.length) {
          message.info('请先选择要删除的行');
          return false;
        }
        
        return await delBatch(selectedIds);
      }
    },
  })
  .then(() => {
    gridApi.query();
    message.success('删除成功');
    batchDeleteState.value.isDisabled = true;
  })
  .finally(() => {
    setLoadingState(false);
  });
}

// 获取选中ID
function getSelectedIds(): number[] {
  return gridApi.grid
    .getCheckboxRecords()
    .map((item) => item.id)
    .filter((id): id is number => id !== undefined);
}

// 设置加载状态
function setLoadingState(isLoading: boolean, text: string = '') {
  loadingState.value.isLoading = isLoading;
  if (text) {
    loadingState.value.text = text;
  }
}

// 删除单个卡密
function deleteCard(row: RowType) {
  confirm({
    content: `是否要删除 卡密:${row.vipKey} ？`,
    icon: 'error',
    title: '删除操作',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        setLoadingState(true, '正在删除...');
        return await del(row.id!);
      }
    },
  })
  .then(() => {
    gridApi.query();
    message.success('删除成功');
  })
  .finally(() => {
    setLoadingState(false);
  });
}

// 复制卡密
async function copyCardKey(row: RowType) {
  const fullUrl = `${urlState.value.convertUrl}${row.vipKey}`;
  try {
    await navigator.clipboard.writeText(fullUrl);
    message.success('卡密已复制到剪切板');
  } catch (err) {
    fallbackCopyTextToClipboard(fullUrl);
  }
}

// 备用复制方法
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    message.success('卡密已复制到剪切板');
  } catch (err) {
    message.error('复制失败');
  } finally {
    document.body.removeChild(textArea);
  }
}

// 更新状态
function updateStatus(row: RowType) {
  const newStatus = row.status === 0 ? 2 : 0;
  // updateCardRenewal({id: row.id, status: newStatus}).then(() => {
  //   gridApi.query();
  //   message.success('操作成功');
  // });
}
function visitExternalWebsite(row: any) {
  // 方式1: 访问固定的外部网站
  // window.open('https://example.com', '_blank');
  const fullUrl = `${urlState.value.convertUrl}${row.vipKey}`;
  window.open(fullUrl, '_blank');
}
// 获取活动信息
async function getActivityInfo(row: RowType) {
  gridApi.setLoading(true);
  
  try {
    const activitysResult = await activitys(row.id!);
    const promotionResult = await activityPromotion(row.id!);
    drawerApi
      .setState({ title: `账户:${row.personalUser?.username}活动详情` })
      .setData({
        row: row,
        activitys: activitysResult,
        promotion: promotionResult,
      })
      .open();
  } finally {
    gridApi.setLoading(false);
  }
}

// 生命周期钩子
onMounted(() => {
  urlState.value.convertUrl = `${window.location.origin}/redemption?key=`;
});
</script>

<template>
  <Loading :spinning="loadingState.isLoading" :text="loadingState.text">
    <Grid>
      <template #personalUser="{ row }">
        <div v-if="row.personalUser">
          <Space>
            <Avatar size="small" :src="row.personalUser.photoUrl" />
            <div>
              <div>
                <span style="color: red">{{ row.personalUser.username }}</span>
              </div>
            </div>
          </Space>
        </div>
      </template>

      <template #type="{ row }">
          <Tag>{{ row.type }}</Tag>
     
      </template>

      <template #restUsedCount="{ row }">
        <div v-if="row.restUsedCount > -1">{{ row.restUsedCount }} 次</div>
        <div v-else>
          <Tag color="error">无限制</Tag>
        </div>
      </template>

      <template #status="{ row }">
        <Tag v-if="row.status === 0" color="">未使用</Tag>
        <Tag v-else-if="row.status === 1" color="processing">已绑定</Tag>
        <Tag v-else-if="row.status === 2" color="gold">待充值</Tag>
        <Tag v-else-if="row.status === 3" color="error">不符合</Tag>
        <Tag v-else-if="row.status === 4"  color="success">不符合</Tag>
        <Tag v-else color="error">充值过期</Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <Button type="primary" size="small" @click="getActivityInfo(row)">
            开通服务
          </Button>
          <Button size="small" @click="() => editRootModalApi.setData({ fromData: row }).open()">
            编辑
          </Button>
          <Dropdown>
            <Button type="link" size="small">
              <MdiMoreVert class="size-4" />
            </Button>
            <template #overlay>
              <Menu class="w-[150px]">
                <Menu.Item key="1" @click="() => copyCardKey(row)">
                  <span class="menu-item-content">
                    <MidEdit class="menu-item-icon size-4" />
                    <span>复制</span>
                  </span>
                </Menu.Item>
                <Menu.Item key="2" @click="() => visitExternalWebsite(row)">
                  <span class="menu-item-content">
                    <MidEdit class="menu-item-icon size-4" />
                    <span>访问卡密</span>
                  </span>
                </Menu.Item>
                <Menu.Item key="3" @click="() => updateStatus(row)">
                  <div v-if="row.status === 0" class="menu-item-content">
                    <MidLock class="menu-item-icon size-4" />禁用
                  </div>
                  <div v-else class="menu-item-content">
                    <MidOpenLock class="menu-item-icon size-4" />启用
                  </div>
                </Menu.Item>
                <Menu.Item key="4" @click="() => deleteCard(row)">
                  <div class="menu-item-content">
                    <MidLock class="menu-item-icon size-4" />删除
                  </div>
                </Menu.Item>
              </Menu>
            </template>
          </Dropdown>
        </Space>
      </template>

      <template #toolbar-actions>
        <VbenButton
          class="mr-2"
          type="primary"
          @click="() => addRootModalApi.open()"
        >
          <MidAdd class="menu-item-icon size-5" />
          新增
        </VbenButton>
        <VbenButton 
          class="mr-2" 
          :disabled="batchDeleteState.isDisabled" 
          @click="showBatchDeleteConfirm"
        >
          <MdiDelete class="menu-item-icon size-4" />
          批量删除
        </VbenButton>
      </template>
    </Grid>
    
    <AddRootModal />
    <EditRootModal />
    <Drawer />
  </Loading>
</template>

<style scoped>
.menu-item-content {
  display: flex;
  align-items: center;
}

.menu-item-icon {
  margin-right: 8px;
}
</style>
