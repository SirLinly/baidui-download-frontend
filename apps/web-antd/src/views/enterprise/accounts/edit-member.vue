<script lang="ts" setup>

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { modifyMember } from '#/api/enterprise';

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        disabled: true,
      },
       dependencies: {
        show: false,
        // 随意一个字段改变时，都会触发
        triggerFields: ['id'],
      },
      fieldName: 'id',
      label: 'id',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入'
      },
      fieldName: 'name',
      label: '成员名称',
    },
    {
      component: 'Textarea',
      componentProps: { 
        rows: 5, 
        placeholder: '请输入Ck' 
      },
      formItemClass: 'cols-span-12 items-start',
      fieldName: 'cookies',
      label: 'Ck',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入'
      },
      fieldName: 'remark',
      label: '备注（可空）',
    }
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
    // modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { record } = modalApi.getData<Record<string, any>>();
      if (record) {
        // 表单回填
        console.log('record', record);
        formApi.setValues(record);
      }
    }
  },
  title: '更新成员信息',
});

function onSubmit(values: Record<string, any>) {
  message.loading({
    content: '正在提交中...',
    duration: 0,
    key: 'is-form-submitting',
  });
  modalApi.lock();
  modifyMember(values).then(() => {
    message.success({
      content: '成员信息修改成功',
      duration: 2,
      key: 'is-form-submitting',
    });
  }).finally(() => {
    modalApi.unlock();
  });
}
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
