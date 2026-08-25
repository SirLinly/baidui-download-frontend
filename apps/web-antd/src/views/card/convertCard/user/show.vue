<script setup lang="ts">
import { Card, Avatar } from 'ant-design-vue';

</script>

<template>
  <div class="steps-wrapper">
    <div class="steps-container">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <div class="step-item">
          <Card.Meta title="教程" description="必看教程">
            <template #avatar>
              <Avatar style="background-color: #F56A00;">1</Avatar>
            </template>
          </Card.Meta>
        </div>
        <div class="step-item">
          <Card.Meta title="粘贴" description="粘贴分享链接和提取码">
            <template #avatar>
              <Avatar style="background-color: #F56A00;">2</Avatar>
            </template>
          </Card.Meta>
        </div>
        <div class="step-item">
          <Card.Meta title="转换" description="点击按钮开始转换">
            <template #avatar>
              <Avatar style="background-color: #F56A00;">3</Avatar>
            </template>
          </Card.Meta>
        </div>
        <div class="step-item">
          <Card.Meta title="完成" description="转换实现高速下载">
            <template #avatar>
              <Avatar style="background-color: #F56A00;">4</Avatar>
            </template>
          </Card.Meta>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.steps-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.steps-container {
  width: 100%;
  max-width: 900px; /* 合适的最大宽度 */
  padding: 0 1rem;
}

.step-item {
  display: flex;
  justify-content: center;
}

.step-item :deep(.ant-card-meta) {
  width: 100%;
  text-align: left;
}

.step-item :deep(.ant-card-meta-avatar) {
  flex-shrink: 0;
}

/* 在小屏幕上保持原有样式 */
@media (max-width: 767px) {
  .step-item {
    justify-content: flex-start;
  }
  
  .step-item :deep(.ant-card-meta) {
    text-align: left;
  }
}

/* 在大屏幕上增加间距 */
@media (min-width: 1024px) {
  .steps-container {
    max-width: 1000px;
    padding: 0 2rem;
  }
}
</style>
