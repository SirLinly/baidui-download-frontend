<script lang="ts" setup>
import { ref } from 'vue';
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table'; // 添加 VxeGridListeners
import { useVbenDrawer,useVbenModal,confirm } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { queryEpMember,delEpMember,isBindCard,isShareLink,buySpeedRoll } from '#/api/enterprise';
import { Tag, Button,message,Switch} from 'ant-design-vue';
import EditMember from './edit-member.vue';
import PayModal from './pay-modal.vue';

interface RowType {
  id: number;
  name: string;
  cookies: string;
  role: number;
  remark: string;
  enterpriseId: number;
  creatorId: number;
  createTime: Date;
  updateTime: Date;
}
const record = ref();
// 表单配置
const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入账号名称',
      },
      fieldName: 'name',
      label: '成员名称',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: '成员名称' },
    { field: 'enterpriseMember.role', title: '权限', slots: { default: 'role' } },
    { field: 'enterpriseMember.remark', title: '备注' },
    { field: 'updateTime', formatter: 'formatDateTime', title: '更新时间' },
    { field: 'createTime', formatter: 'formatDateTime', title: '创建时间' },
    { field: 'enterpriseMember.isBindCard', title: '参与绑卡', slots: { default: 'isBindCard' } , width: 80},
    { field: 'enterpriseMember.isShareLink', title: '分配下载卷', slots: { default: 'isShareLink' } , width: 80},
    { field: 'action', fixed: 'right', slots: { default: 'action' }, title: '操作', width: 250 },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await queryEpMember({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
          id: record.value.id,
        });
      },
    },
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: false,
    custom: true, 
    refresh: true, 
    resizable: true, 
    zoom: true
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions
});
const [Drawer,DrawerApi] = useVbenDrawer({
  footer: false,
  destroyOnClose: true,
   onOpenChange(isOpen) {
    record.value = isOpen ? DrawerApi.getData()?.record : {};
  },
});
const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: EditMember,
});
// 支付订单
const [PayRootModal, payRootModalApi] = useVbenModal({
  connectedComponent: PayModal,
});
async function delBtn(id: number) {
  confirm({
    content: `注意:是否删除该成员？成员绑定卡密一并删除`,
    icon: 'error',
    title: '删除账号',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        gridApi.setLoading(true);
        delEpMember(id).then(() => {
          message.success('删除成功');
        });
        gridApi.query();
        gridApi.setLoading(false);
        return true;
      }
    },
  });
}
function handleBindCardChange(checked: boolean, row: any){
 const v = checked ? 1 : 0;
  row.isFileLimit = v;
  isBindCard(row.id).then(() => {
    message.success(v ? '开启卡密创建成功' : '关闭卡密创建成功');
    gridApi.query();
  });
}
function handleShareLinkChange(checked: boolean, row: any) {
const v = checked ? 1 : 0;
  row.isFileLimit = v;
  isShareLink(row.id).then(() => {
    message.success(v ? '开启分配下载卷成功' : '关闭分配下载卷成功');
    gridApi.query();
  });
}
// 购买加速卷
function buySpeedDownload(row: any) {
  buySpeedRoll({epId:record.value.id,memberId:row.id}).then((res) => {
    payRootModalApi.setData({record:record,row:row,payInfo:res.purchase}).open();
  });
}
</script>
<template>
  <Drawer 
    class="w-[60%]"
    title="企业成员管理">
    <Grid>
      <template #role="{ row }">
        <Tag v-if ="row.enterpriseMember.role == 1" color="#f50"> 超级管理员 </Tag>
        <Tag v-else-if ="row.enterpriseMember.role == 2" color="#108ee9"> 管理员 </Tag>
        <Tag v-else color="cyan"> 普通成员 </Tag>
      </template>
      <template #isBindCard="{ row }">
        <Switch
          size="small"
          :checked="row.enterpriseMember.isBindCard === 1"
          @change="(c) => handleBindCardChange(Boolean(c), row)"
        />
      </template>
      <template #isShareLink="{ row }">
        <Switch
          size="small"
          :checked="row.enterpriseMember.isShareLink === 1"
          @change="(c) => handleShareLinkChange(Boolean(c), row)"
        />
      </template>
      <!-- 操作列 -->
      <template #action="{ row }">
        <Button type="link" size="small" @click="modalApi.setData({record:row}).open()">更新</Button>
        <Button type="link" size="small" @click="delBtn(row.id)">移除成员</Button>
        <Button type="link" size="small" @click="buySpeedDownload(row)">购买加速卷</Button>
      </template>
      <!-- 工具栏按钮 -->
      <template #toolbar-actions>
        <span style="font-size: 15px; font-weight: 800;">当前操作企业：{{ record.name }}</span>
      </template>
    </Grid>
  </Drawer>
  <Modal/>
  <PayRootModal/>

</template>
