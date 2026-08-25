<script lang="ts" setup>
import { watch } from 'vue';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { Page, useVbenModal, VbenButton, confirm,useVbenDrawer } from '@vben/common-ui';
import {
  Button,
  Tag,
  Dropdown,
  Menu,
  message,
  Switch,
} from 'ant-design-vue';
import { MdiMoreVert, MdiPasswordReset } from '@vben/icons';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getEnterprises,
  refreshInfo,
  clearFile,
  delAccount,
  isShowLogin,
  isAutoDel,
  isFileLimit
} from '#/api/enterprise/index';
import { useEnterpriseStore } from '#/store/enterprise';
import { storeToRefs } from 'pinia';
import { MidAdd } from '@vben/icons';
import AddMerge from './add-member.vue';
import EnterpriseMembers from './enterprise-members-manage.vue';


const enterpriseStore = useEnterpriseStore();
const { shouldRefreshGrid } = storeToRefs(enterpriseStore);


const [accountModal, accountModalApi] = useVbenModal({
  connectedComponent: AddMerge,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) gridApi.query();
  },
});

interface RowType {
  id?: number;
  realName: string;
  username: string;
  balance: number;
  rate: number;
  orderNumber: number;
  totalRecharge: number;
  status: number;
  createTime: string;
  lastLoginTime: string;
  enterpriseMembers: any[];
}

/* ========== 搜索表单 ========== */
const formOptions: VbenFormProps = {
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    { component: 'Input', fieldName: 'username', label: '账号' },
    { component: 'Input', fieldName: 'realName', label: '昵称' },
  ],
  showCollapseButton: false,
  submitOnChange: true,
  submitOnEnter: true,
};

/* ========== 主表格配置 ========== */
const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: { highlight: true },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'adminName', title: '企业创建者' },
    { field: 'name', title: '企业', slots:{ default: 'name' }, width: 120},
    { field: 'status', slots: { default: 'status' }, title: '状态',width: 80},
    { field: 'quota', title: '空间容量', slots: { default: 'quota' }, width: 230},
    { field: 'speedUp', title: '加速卷', slots: { default: 'speedUp' }, width: 200 },
    { field: 'bindMers', title: '账号数',width: 80 },
    { field: 'bindCards', title: '卡密数', width: 80 },
    { field: 'isAutoDel', title: '启用删除', slots: { default: 'isAutoDel' }, width: 80 },
    { field: 'isFileLimit', title: '文件限制', slots: { default: 'isFileLimit' } , width: 80},
    { field: 'isShowLogin', title: '开启登录', slots: { default: 'isShowLogin' } , width: 80},
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
    { field: 'action', fixed: 'right', slots: { default: 'action' }, title: '操作', width: 250 },
  ],
  height: 'auto',
  stripe: true,
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    response: { result: 'rows', total: 'total', list: 'items' },
    ajax: {
      query: async ({ page }, formValues) => {
        return await getEnterprises({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: { custom: true, refresh: true, resizable: true, zoom: true },


};

const [Grid, gridApi] = useVbenVxeGrid({ 
  formOptions, 
  gridOptions
});
/* ========== 抽屉配置 ========== */
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: EnterpriseMembers,
});


/* ========== 操作函数 ========== */
function updateBtn(id: number) {
  refreshInfo(id).then(() => {
    message.success('刷新数据成功');
    gridApi.query();
  });
}

function delBtn(row: any) {
  confirm({
    content: `注意:该账号「${row.name}」关联的卡密将一并删除`,
    icon: 'error',
    title: '删除账号',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        gridApi.setLoading(true);
        await delAccount(row.id);
        message.success('删除成功');
        gridApi.query();
        gridApi.setLoading(false);
        return true;
      }
    },
  });
}

function clearFileBtn(id: number) {
  clearFile(id).then(() => message.success('清理空间,执行时间较长 请耐心等待'));
}

/* ========== Switch 处理 ========== */
function handleShowLoginChange(checked: boolean, row: any) {
  const v = checked ? 1 : 0;
  row.isShowLogin = v;
  isShowLogin(row.id).then(() => {
    message.success(v ? '开启登录成功' : '关闭登录成功');
    gridApi.query();
  });
}

function handleIsFileLimitChange(checked: boolean, row: any) {
  const v = checked ? 1 : 0;
  row.isFileLimit = v;
  isFileLimit(row.id).then(() => {
    message.success(v ? '开启文件限制成功' : '关闭文件限制成功');
    gridApi.query();
  });
}

function handleIsAutoDelChange(checked: boolean, row: any) {
  const v = checked ? 1 : 0;
  row.isAutoDel = v;
  isAutoDel(row.id).then(() => {
    message.success(v ? '开启自动删除成功' : '关闭自动删除成功');
    gridApi.query();
  });
}

/* ========== 刷新监听 ========== */
watch(
  () => shouldRefreshGrid.value,
  async (newVal) => {
    if (newVal) {
      await gridApi.query();
      enterpriseStore.triggerGridRefresh();
    }
  },
  { immediate: true },
);
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #name="{ row }">
        <span style="color: red;">{{ row.name }}</span> 
      </template>
      <!-- 其它插槽 -->
      <template #status="{ row }">
        <Tag v-if="row.status == 0" color="processing">正常</Tag>
        <Tag v-else color="error">异常</Tag>
      </template>

      <template #quota="{ row }">
        <template v-if="row.quotaTotal >= 1024 * 1024 * 1024 * 1024">
          已用: {{ (row.quotaUsed / (1024 * 1024 * 1024 * 1024)).toFixed(2) }} TB /
          {{ (row.companyQuotaUsed / (1024 * 1024 * 1024 * 1024)).toFixed(2) }} TB
        </template>
        <template v-else>
          已用: {{ (row.companyQuotaUsed / (1024 * 1024 * 1024)).toFixed(2) }} GB /
          {{ (row.companyQuota / (1024 * 1024 * 1024)).toFixed(2) }} GB
        </template>
      </template>

      <template #speedUp="{ row }">
        <Tag color="green">
          已用:{{ row.speedUpUsedCount }} / 总张:{{ row.speedUpTotalCount }}
        </Tag>
      </template>

      <template #bindCardKeyCount="{ row }">
        {{ row.bindCardKeyCount }} 张
      </template>

      <template #isShowLogin="{ row }">
        <Switch
          size="small"
          :checked="row.isShowLogin === 1"
          @change="(c) => handleShowLoginChange(Boolean(c), row)"
        />
      </template>

      <template #isAutoDel="{ row }">
        <Switch
          size="small"
          :checked="row.isAutoDel === 1"
          @change="(c) => handleIsAutoDelChange(Boolean(c), row)"
        />
      </template>

      <template #isFileLimit="{ row }">
        <Switch
          size="small"
          :checked="row.isFileLimit === 1"
          @change="(c) => handleIsFileLimitChange(Boolean(c), row)"
        />
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <Button type="link" size="small" @click="updateBtn(row.id)">刷新</Button>
          <Button type="link" size="small" @click="clearFileBtn(row.id)">清理空间</Button>
          <Button type="link" size="small" @click="()=>{ drawerApi.setData({record: row}).open()}">成员管理</Button>
          <Dropdown>
            <Button type="link" size="small">
              <MdiMoreVert class="size-4" />
            </Button>
            <template #overlay>
              <Menu mode="horizontal" class="w-[150px]">
                <Menu.Item key="2" @click="delBtn(row)">
                  <span class="menu-item-content">
                    <MdiPasswordReset class="menu-item-icon size-4" />
                    <span style="color: red">删除</span>
                  </span>
                </Menu.Item>
              </Menu>
            </template>
          </Dropdown>
      </template>

      <!-- 工具栏按钮 -->
      <template #toolbar-actions>
        <VbenButton class="mr-2" type="primary" @click="accountModalApi.open()">
          <MidAdd class="menu-item-icon size-5" />新增账户
        </VbenButton>
      </template>
    </Grid>
    <Drawer/>
    <accountModal />
  </Page>
</template>

<style scoped>
.menu-item-content {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.menu-item-icon {
  margin-right: 4px;
  vertical-align: -0.125em;
}
</style>
