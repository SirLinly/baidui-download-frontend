<script lang="ts" setup>
import { ref } from 'vue';
import { updateCardKey } from '#/api/card';
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
      fieldName: 'cardKey',
      label: '卡密',
      disabled: true,
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '未使用', value: 0 },
          { label: '已使用', value: 2 },
          { label: '已过期', value: 3 },
          { label: '禁用', value: 4 },
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
      fieldName: 'expireHours',
      label: '时长(小时)',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入数值，不限制使用次数 填写-1',
      },
      fieldName: 'restUsedCount',
      label: '剩余次数',
      defaultValue: '',
      rules: z.number({
        invalid_type_error: '请输入数值,不限制使用次数 填写-1',
      }).refine(
        (val) => val !== undefined && val !== null && val >= -1,
        { message: '最小值不能为-1' }
      ),
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm', // 显示格式
      },
      fieldName: 'expireTime',
      label: '过期时间',
      dependencies: {
        triggerFields: ['status'],
        disabled(values) {
          return !values.expireTime || values.status === 4;
        },
      },
    },
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
      if (fromData.expireTime) {
        // 解析后端返回的日期，固定为 GMT+8
        const parsedDate = dayjs.tz(fromData.expireTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
        fromData.expireTime = parsedDate.isValid() ? parsedDate : null;
      } else {
        fromData.expireTime = null;
      }
      formApi.setValues(fromData);
    }
  },
});

function onSubmit(values: Record<string, any>) {
  // 格式化 expireTime 为后端需要的格式
  if (values.expireTime) {
    const formattedDate = dayjs(values.expireTime).isValid()
      ? dayjs.tz(values.expireTime, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
      : null;
    if (!formattedDate || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(formattedDate)) {
      message.error('日期格式错误，请重新选择');
      modalApi.unlock();
      return;
    }
    values.expireTime = formattedDate;
  } else {
    values.expireTime = null;
  }

  message.loading({ content: '正在提交中...', duration: 0, key: 'is-form-submitting' });
  modalApi.lock();
  updateCardKey(values)
    .then(() => {
      modalApi.close();
      message.success({
        content: `用户修改成功`,
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
  <Modal title="编辑">
    <Form />
  </Modal>
</template>
