<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message} from 'ant-design-vue';
import { useVbenForm,z } from '#/adapter/form';
import { addCardKey } from '#/api/card/index';
import { getEnterprises } from '#/api/enterprise'
// 在文件顶部添加类型定义
interface EnterprisesItem {
  id: number;
  name: string;
  adminName: string;
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-1/6',
  },
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择企业（可多选）',
        afterFetch: (data: { rows: EnterprisesItem[] }) => {
          return data.rows.map(item => ({
            label: `${item.name}` + '（企业）-'+ `${item.adminName}`,
            value: item.id,
          }));
        },
        api: getEnterprises,
        // autoSelect: 'first',
        mode: 'multiple', // 启用多选模式
      },
      fieldName: 'enterpriseId',
      label: '选择企业',
      rules: 'selectRequired',
      help: '支持企业多选，生成卡密',
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
      defaultValue: 3,
      fieldName: 'expireHours',
      label: '时长',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入 数值如:1，不限制留空',
      },
      fieldName: 'restUsedCount',
      label: '使用次数',
      defaultValue: '',
      help: '如:仅限使用1次，填写1。不限制使用请留空',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'count',
      label: '数量',
      defaultValue: 20,
      rules: z.number({
        "invalid_type_error": "请输入数值"
      }).refine((val) => {
        if (val === undefined || val === null) return false;
        // 确保值大于等于0
        if (val > 0) return true;
        // 获取小数部分的字符串
      }, {
        "message": "最小生成数量为1"
      })
    },
    {
      component: 'RadioGroup',
      fieldName: 'model',
      label: '分卡模式',
      componentProps: {
        optionType: 'button', // 设置为按钮模式
        buttonStyle: 'solid',
        options: [
          {
            label: '交替分卡',
            value: 1,
          },
          {
            label: '随机分卡',
            value: 2,
          },
        ],
        
      },
      defaultValue: 1,
      help: '交替分卡：选中企业依次交替生成卡密。随机分卡：随机为选中企业生成卡密',
      rules: 'selectRequired',
    }
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
    message.info('取消新增操作');
  },
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
    // modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }
    }
  },
  title: '新增卡密',
});

function onSubmit(values: Record<string, any>) {
  message.loading({
    content: '正在提交中...',
    duration: 3,
    key: 'is-form-submitting',
  });
  modalApi.lock();
  setTimeout(() => {
    addCardKey(values).then(()=>{
        message.success('添加成功')
        modalApi.close();
    }).catch(()=>{
      modalApi.unlock();
    }).finally(()=>{
    });
  }, 1000);
}
</script>
<template>
  <Modal>
    <Form/>
  </Modal>
</template>
