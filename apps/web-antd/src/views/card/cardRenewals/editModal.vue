<script lang="ts" setup>
import { updateCardRenewal } from '#/api/cardRenewal';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm, z } from '#/adapter/form';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { message } from 'ant-design-vue';

dayjs.extend(utc);
dayjs.extend(timezone);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelClass: 'w-1/6',
  },
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'id',
      label: 'id',
      rules: 'required',
      disabled: true,
      dependencies: {
        triggerFields: ['id'],
        show() {
          // 返回 false 表示用CSS隐藏（仍存在于DOM中）
          return false;
        }
      }
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'renewalKey',
      label: '续费卡密',
      disabled: true,
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '未使用', value: 0 },
          { label: '已使用', value: 1 },
          { label: '已失效', value: 2 },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'durationHours',
      label: '续费时长',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '不填写,默认为无限制',
      },
      fieldName: 'restUsedCount',
      label: '使用次数',
      help: '不填写,默认为无限制',
    }
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { fromData } = modalApi.getData<Record<string, any>>();
      formApi.setValues(fromData);
    }
  },
});

function onSubmit(values: Record<string, any>) {
  message.loading({ content: '正在提交中...', duration: 0, key: 'is-form-submitting' });
  modalApi.lock();
  updateCardRenewal(values)
    .then(() => {
      modalApi.close();
      message.success({
        content: `更新续费卡密信息成功`,
        duration: 2,
        key: 'is-form-submitting',
      });
    })
    .catch(() => {
      message.error({
        content: `提交失败：`,
        duration: 2,
        key: 'is-form-submitting',
      });
    })
    .finally(() => {
      modalApi.unlock();
    });
}
</script>

<template>
  <Modal title="编辑续费卡密">
    <Form />
  </Modal>
</template>
