<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message} from 'ant-design-vue';
import { useVbenForm,z } from '#/adapter/form';
import { add } from '#/api/svipCard/index';

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
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: 'VIP7天卡', value: 1 },
          { label: 'SVIP7天卡', value: 2 },
          { label: 'SVIP月卡', value: 3 },
          { label: 'SVIP季卡', value: 4 },
          { label: 'SVIP年卡', value: 5 }
        ],
      },
      defaultValue: 1,
      fieldName: 'type',
      label: '卡密类型',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'count',
      label: '数量',
      defaultValue: 10,
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
    add(values).then(()=>{
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
