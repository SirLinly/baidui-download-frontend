
<script lang="ts" setup>
import { computed } from 'vue';
import { Card,Typography, Space,Avatar } from 'ant-design-vue';
import { useUserStore } from '@vben/stores';
const userStore = useUserStore();
const { userInfo } = userStore;
const inviteLink = computed(() => {
  return `${location.origin}/auth/register?invite=${ userInfo?.inviteInfo?.inviteCode}`;
});
</script>
<template>
  <Card>
    <div style="text-align: center; margin-bottom: 20px;">
      <Avatar 
        :src="userInfo?.avatar || 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/avatar-v1.webp'" 
        :size="120"
        style="margin-bottom: 12px;"
      />
      <Typography.Title :level="4" style="margin-bottom: 8px;">
        {{ userInfo?.realName || userInfo?.username }}
      </Typography.Title>
      <Typography.Text>
        幸福往往不是拥有的多，而是计较的少。
      </Typography.Text>
    </div>
    
    <Card.Meta style="margin-top: 35px; margin-left: 20px;">
      <template #description>
        <Space direction="vertical" style="width: 100%;">
          <Typography.Text copyable>
            账户ID： {{ userInfo?.uid }}
          </Typography.Text>
          <Typography.Text copyable>
            用户名： {{ userInfo?.username }}
          </Typography.Text>
          <Typography.Text copyable>
            Email: {{ userInfo?.email }}
          </Typography.Text>
          <Typography.Text>
            最后登录时间: {{ userInfo?.lastLoginTime }}
          </Typography.Text>
        </Space>
      </template>
    </Card.Meta>
  </Card>
</template>
