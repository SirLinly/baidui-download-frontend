<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type {
  VxeGridListeners,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import { ref, onMounted } from 'vue';
import {
  Page,
  confirm,
  Loading,
  useVbenModal,
  VbenButton,
} from '@vben/common-ui';
import {
  Space,
  Button,
  Tag,
  Dropdown,
  Menu,
  message,
  Avatar,
  Tooltip,
} from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  queryCard,
  delCardKey,
  delBatchCardKeys,
  isDisableCard,
  unbindUser,
  addBlack,
} from '#/api/card/index';
import AddModal from './addModal.vue';
import EditModal from './editModal.vue';
import {
  MdiDelete,
  MdiMoreVert,
  MidAdd,
  MidEdit,
  MidLock,
  MidOpenLock,
  MidClear,
} from '@vben/icons';
import { clearQuota } from '#/api/convert';
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
      fieldName: 'cardKey',
      label: '卡密',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '1小时', value: 1 },
          { label: '3小时', value: 3 },
          { label: '24小时（天卡）', value: 24 },
          { label: '72小时（3天卡）', value: 72 },
          { label: '周卡（7天）', value: 168 },
          { label: '15天卡', value: 336 },
          { label: '月卡（30天）', value: 720 },
          { label: '季卡（90天）', value: 2160 },
          { label: '半年卡（180天）', value: 4320 },
          { label: '年卡（365天）', value: 8760 },
          { label: '永久', value: -1 },
        ],
      },
      fieldName: 'expireHours',
      label: '卡密时长',
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
            label: '已启用',
            value: 1,
          },
          {
            label: '已使用',
            value: 2,
          },
          {
            label: '已过期',
            value: 3,
          },
          {
            label: '已禁用',
            value: 4,
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'status',
      label: '使用状态',
    },
    {
      component: 'Input',
      fieldName: 'enterpriseName',
      label: '所属企业',
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
const gridOptions: VxeTableGridOptions<any> = {
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', type: 'checkbox', width: 30 },
    { field: 'enterpriseName', title: '所属企业', width: 100 },
    {
      field: 'cardKey',
      title: '卡密',
      width: 160,
      formatter: ({ cellValue }) => {
        // 不做任何处理，直接返回原始值
        return cellValue;
      },
      // 导出时自定义内容
      exportMethod: ({ row }) => {
        // 导出时添加前缀
        return convertUrl.value + row.cardKey;
      },
    },
    {
      field: 'expireHours',
      title: '卡种',
      width: 130,
    },
    {
      field: 'personalUser',
      slots: { default: 'personalUser' },
      title: '绑定账号',
      width: 150,
    },
    { field: 'shareLink', title: '企盘分享链接', width: 100 },
    {
      field: 'dirSize',
      slots: { default: 'dirSize' },
      title: '占用空间',
      width: 70,
    },
    { field: 'status', slots: { default: 'status' }, title: '状态', width: 80 },
    // { field: 'cardBindUserId', slots: { default : 'cardBindUserId' }, title: '是否绑定账号', width: 150 },
    {
      field: 'restUsedCount',
      slots: { default: 'restUsedCount' },
      title: '限制次数',
      width: 70,
    },
    {
      field: 'usedCount',
      slots: { default: 'usedCount' },
      title: '使用次数',
      width: 70,
    },
    {
      field: 'usedTime',
      formatter: 'formatDateTime',
      title: '使用时间',
      width: 150,
    },
    {
      field: 'expireTime',
      formatter: 'formatDateTime',
      title: '过期时间',
      width: 150,
    },
    { field: 'ip', title: '访问IP', width: 130 },
    { field: 'ipLocation', title: '归属地', width: 130 },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      title: '创建时间',
      width: 150,
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 180,
    },
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
        return await queryCard({
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
const gridEvents: VxeGridListeners<any> = {
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
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});
const showConfirm = function () {
  confirm({
    content: '数据无价，请谨慎操作,是否继续删除？',
    icon: 'error',
    title: '重要',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        loading.value = true;
        loadingText.value = '正在删除...';
        // 获取选中的行数据 筛选Id
        const selectedIds = gridApi.grid
          .getCheckboxRecords()
          .map((item) => item.id)
          .filter((id): id is number => id !== undefined);
        if (!selectedIds.length) {
          message.info('请先选择要删除的行');
          return false;
        }
        // 调用删除方法
        console.log('selectedIds', selectedIds);
        return await delBatchCardKeys(selectedIds);
      }
    },
  })
    .then(() => {
      // 重载表格
      gridApi.query();
      message.success('删除成功');
      removeButn.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
};
// 新增卡密
const [AddRootModal, addRootModalApi] = useVbenModal({
  connectedComponent: AddModal,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      // 重载表格
      gridApi.query();
    }
  },
});

// 编辑卡密 - 修改这部分
const [EditRootModal, editRootModalApi] = useVbenModal({
  connectedComponent: EditModal,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      // 重载表格
      gridApi.query();
    }
  },
});

/**
 * 按钮删除订单方法
 * @param row
 */
function delCardKeyBtn(row: any) {
  confirm({
    content: '是否要删除 卡密:' + row.cardKey + ' ？',
    icon: 'error',
    title: '删除操作',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        loading.value = true;
        loadingText.value = '正在删除...';
        // 调用删除方法
        return await delCardKey(row.id);
      }
    },
  })
    .then(() => {
      // 重载表格
      gridApi.query();
      message.success('删除成功');
    })
    .finally(() => {
      loading.value = false;
    });
}
async function coryCardKeyBtn(row: any) {
  const baseUrl = convertUrl.value + row.cardKey;

  try {
    // 使用 Clipboard API 复制文本到剪切板
    await navigator.clipboard.writeText(baseUrl);
    message.success('卡密已复制到剪切板');
  } catch (err) {
    // 如果 Clipboard API 不可用，使用备选方案
    const textArea = document.createElement('textarea');
    textArea.value = baseUrl;
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
function disableCardBtn(row: any) {
  isDisableCard(row.id).then(() => {
    // 重载表格
    gridApi.query();
    message.success('操作成功');
  });
}

function unbindUserBtn(row: any) {
  unbindUser(row.id).then(() => {
    // 重载表格
    gridApi.query();
    message.success('解绑成功');
  });
}

function addBlackBtn(row: any) {
  addBlack(row.id).then(() => {
    // 重载表格
    gridApi.query();
    message.success('加入黑名单成功');
  });
}

function visitExternalWebsite(row: any) {
  // 方式1: 访问固定的外部网站
  // window.open('https://example.com', '_blank');
  const url = convertUrl.value + row.cardKey;
  window.open(url, '_blank');
}
function clearQuotaBtn(row: any) {
  confirm({
    content: '是否删除卡密:' + row.cardKey + '下生成的转换的文件？',
    icon: 'error',
    title: '清理文件',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        // 调用删除方法
        gridApi.setLoading(true);
        clearQuota({ key: row.cardKey, type: 'user' })
          .then(() => {
            message.success('清理成功');
          })
          .finally(() => {
            gridApi.setLoading(false);
          });
        return true;
      }
    },
  });
}

onMounted(() => {
  // 获取表格数据
  convertUrl.value = window.location.origin + '/convert?key=';
});
</script>

<template>
  <Loading :spinning="loading" :text="loadingText">
    <Page auto-content-height>
      <Grid>
        <!-- 账户列 -->
        <template #personalUser="{ row }">
          <div v-if="row.personalUser">
            <Tooltip placement="topLeft" :title="`uk:`+row.personalUser.uk">
              <Space>
                <Avatar size="small" :src="row.personalUser.photoUrl" />
                <div>
                  <div>
                    <span style="color: red">{{
                      row.personalUser.username
                    }}</span>
                  </div>
                </div>
              </Space>
            </Tooltip>
          </div>
        </template>
       
        <template #dirSize="{ row }">
          <span v-if="row.dirSize == 0" color="processing">0GB</span>
          <span v-else-if="row.dirSize < 1024" color="warning"
            >{{ row.dirSize }} B</span
          >
          <span v-else-if="row.dirSize < 1048576" color="warning"
            >{{ (row.dirSize / 1024).toFixed(2) }} KB</span
          >
          <span
            v-else-if="row.dirSize < 1073741824"
            color="success"
            style="color: red"
            >{{ (row.dirSize / 1048576).toFixed(2) }} MB</span
          >
          <span
            v-else-if="row.dirSize < 1099511627776"
            color="blue"
            style="color: red"
            >{{ (row.dirSize / 1073741824).toFixed(2) }} GB</span
          >
          <span v-else style="color: red"
            >{{ (row.dirSize / 1099511627776).toFixed(2) }} TB</span
          >
        </template>
        <!-- 状态列 -->
        <template #status="{ row }">
          <Tag v-if="row.status == 0" color="processing">未使用</Tag>
          <Tag v-else-if="row.status == 1" color="warning">已启用</Tag>
          <Tag v-else-if="row.status == 2" color="success">已使用</Tag>
          <Tag v-else-if="row.status == 3" color="error">已过期</Tag>
          <Tag v-else color="error">禁 用</Tag>
        </template>
        <template #restUsedCount="{ row }">
          <span v-if="row.restUsedCount >= 0">
            {{ row.restUsedCount }} 次
          </span>
          <span v-else>
            <Tag color="red">无限制</Tag>
          </span>
        </template>
        <template #usedCount="{ row }"> {{ row.usedCount }} 次 </template>
        <!-- 固定列 -->
        <template #action="{ row }">
          <space>
            <Button
              type="primary"
              size="small"
              @click="editRootModalApi.setData({ fromData: row }).open()"
              >编辑</Button
            >
            <Button danger size="small" @click="delCardKeyBtn(row)"
              >删除</Button
            >
            <Dropdown>
              <Button type="link" size="small">
                <MdiMoreVert class="size-4" />
              </Button>
              <template #overlay>
                <Menu class="w-[150px]">
                  <Menu.Item key="1" @click="coryCardKeyBtn(row)">
                    <span class="menu-item-content">
                      <MidEdit class="menu-item-icon size-4" />
                      <span>复制</span>
                    </span>
                  </Menu.Item>
                  <Menu.Item key="2" @click="visitExternalWebsite(row)">
                    <span class="menu-item-content">
                      <MidEdit class="menu-item-icon size-4" />
                      <span>访问卡密</span>
                    </span>
                  </Menu.Item>
                  <Menu.Item key="3" @click="clearQuotaBtn(row)">
                    <span class="menu-item-content">
                      <MidClear class="menu-item-icon size-4" />
                      <span>清理文件</span>
                    </span>
                  </Menu.Item>
                  <Menu.Item
                    v-if="row.status !== 4"
                    key="4"
                    @click="disableCardBtn(row)"
                  >
                    <div v-if="row.status !== 2" class="menu-item-content">
                      <MidLock class="menu-item-icon size-4" />禁用卡密
                    </div>
                    <div v-else class="menu-item-content">
                      <MidOpenLock class="menu-item-icon size-4" />启用卡密
                    </div>
                  </Menu.Item>
                  <Menu.Item key="5" @click="unbindUserBtn(row)">
                    <span class="menu-item-content">
                      <MidClear class="menu-item-icon size-4" />
                      <span>账号解绑</span>
                    </span>
                  </Menu.Item>
                  <Menu.Item key="6" @click="addBlackBtn(row)">
                    <span class="menu-item-content">
                      <MidClear class="menu-item-icon size-4" />
                      <span>加入黑名单</span>
                    </span>
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </space>
        </template>
        <template #toolbar-actions>
          <VbenButton
            class="mr-2"
            type="primary"
            @click="() => addRootModalApi.open()"
          >
            <MidAdd class="menu-item-icon size-5" />
            新增卡密
          </VbenButton>
          <VbenButton class="mr-2" :disabled="removeButn" @click="showConfirm">
            <MdiDelete class="menu-item-icon size-4" />
            批量删除
          </VbenButton>
        </template>
      </Grid>
      <AddRootModal />
      <EditRootModal />
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
