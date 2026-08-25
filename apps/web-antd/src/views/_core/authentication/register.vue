<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { AuthenticationRegister, SliderCaptcha, z } from '@vben/common-ui';
import { computed, markRaw, ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { registerApi } from '#/api/core/auth';
import { message } from 'ant-design-vue';


defineOptions({ name: 'Register' });

const router = useRouter(); // 添加这行获取router实例

const inviteCodeFromURL = ref((router.currentRoute.value.query?.invite as string) || '');


const loading = ref(false);

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.realNameTip'),
      },
      fieldName: 'realName',
      label: $t('authentication.realName'),
      rules: z
        .string({
          invalid_type_error: '请输入有效的昵称',
        })
        .refine((val) => !/^\d+$/.test(val), {
          message: '昵称不能全为数字',
        }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入用户名(QQ)',
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z
        .string({
          invalid_type_error: '请输入有效的账号',
        })
        .min(8, { message: '账号必须大于或等于8位' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      renderComponentContent() {
        return {
          strengthText: () => $t('authentication.passwordStrength'),
        };
      },
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.confirmPassword'),
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: $t('authentication.passwordTip') })
            .min(1, { message: $t('authentication.passwordTip') })
            .refine((value) => value === password, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('authentication.confirmPassword'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.inviteCodeTip'),
      },
      defaultValue: inviteCodeFromURL.value,
      fieldName: 'inviteCode',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.inviteCodeTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});
function handleSubmit(value: Recordable<any>) {
  // eslint-disable-next-line no-console
  registerApi(value).then(() => {
    message.success('注册成功,即将跳转登录页面');
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
  });
}
</script>

<template>
  <AuthenticationRegister 
  :form-schema="formSchema" 
  :loading="loading" 
  subTitle="课由,从创建一个账号开始吧"
  @submit="handleSubmit" />
</template>
