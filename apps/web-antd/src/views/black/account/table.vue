<script lang="ts" setup>
import { ref } from 'vue';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridListeners, VxeTableGridOptions } from '#/adapter/vxe-table';
import { confirm,VbenButton} from '@vben/common-ui';
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
import { queryPersonalRule,modifyPersonalRuleStatus,removePersonalRules } from '#/api/black/index';
import {
  MdiDelete,
  MdiMoreVert,
  MidAdd,
  MidEdit,
  MidLock,
  MidOpenLock,
} from '@vben/icons';



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
      fieldName: 'uk',
      label: 'UK',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: '解禁', value: 0 },
          { label: '禁用', value: 1 },
        ],
        placeholder: '请选择',
      },
      fieldName: 'status',
      label: '状态',
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
      field: 'accountType',
      title: '账号类型',
      width: 180,
      formatter: ({ cellValue }) => cellValue,
      exportMethod: ({ row }) => `${urlState.value.convertUrl}${row.vipKey}`,
    },
    {
      field: 'accountId',
      title: '账号标识',
      width: 250,
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: '状态',
      width: 200,
    },
    {
      field: 'reason',
      title: '封禁原因',
      width: 200,
    },
    {
      field: 'realName',
      title: '操作人',
      width: 200,
    },
    { field: 'updateTime', formatter: 'formatDateTime', title: '最后更新' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
  ],
  exportConfig: {},

  stripe: true,
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await queryPersonalRule({
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



// 统一处理模态框变更
function handleModalChange(isOpen: boolean) {
  if (!isOpen) {
    gridApi.query();
  }
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
function deleteCard(id: number) {
  confirm({
    content: `确定删除？`,
    icon: 'error',
    title: '删除操作',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        setLoadingState(true, '正在删除...');
        return await removePersonalRules(id);
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

/**
 * 修改状态
 * @param id 
 */
async function modifyBtn(id:number){
  await modifyPersonalRuleStatus(id).then(()=>{
    message.success('更新状态成功');
    gridApi.query();
  });
}





</script>

<template>
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

      <template #restUsedCount="{ row }">
        <div v-if="row.restUsedCount > -1">{{ row.restUsedCount }} 次</div>
        <div v-else>
          <Tag color="error">无限制</Tag>
        </div>
      </template>

      <template #status="{ row }">
        <Tag v-if="row.status === 0" color="processing">正常</Tag>
        <Tag v-else-if="row.status === 1" color="error">禁用</Tag>
      </template>

      <template #action="{ row }">
        <Space>
           <Button type="primary" size="small" @click="modifyBtn(row.id)">
            <span v-if="row.status === 0">禁用</span>
            <span v-else="row.status === 1">解禁</span>
          </Button>
          <Button size="small" @click="deleteCard(row.id)">
            删除
          </Button>
        </Space>
      </template>
      

      <template #toolbar-actions>
        <!-- <VbenButton class="mr-2" type="primary" @click="() => addRootModalApi.open()">
          <MidAdd class="menu-item-icon size-5" />
          新增CDK
        </VbenButton>
        <VbenButton class="mr-2" :disabled="batchDeleteState.isDisabled" @click="showBatchDeleteConfirm">
          <MdiDelete class="menu-item-icon size-4" />
          批量删除
        </VbenButton> -->
      </template>
    </Grid>
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
