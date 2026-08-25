<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { Space,Typography,Button } from 'ant-design-vue';
const [Modal,modalApi] = useVbenModal({
  confirmText: '我已阅读',
  showCancelButton: false,
  onConfirm(){
    modalApi.close();// 关闭弹窗
  }
});
const { Text, Title} = Typography;
</script>
<template>
  <Modal title="首次-使用说明">
    <Space direction="vertical">
    <Title :level=5><span style="color: red;">非第一次使用,请忽略</span></Title>
    <Title :level=5><span style="color: red;">使用教程 必看！！ 必看！！！ 必看！！！！</span></Title>
    <Title :level=5>功能: 仅支持极速下下载</Title>
    <Title :level=5 style="color: red;">不支持:在线解压、在线观看视频、空间存储等其他SVIP功能。</Title>
    <Title :level=5 style="color: green;">温馨提示: 如果一个一个转换费劲，打包在一个目录进行转换</Title>
    <Title :level=5>使用方法: </Title>
    <Text>1. 使用<span style="color: red;"> 百度网盘APP </span> 扫码授权</Text>
    <Text>2. 分享复制链接，到转换窗口进行转换</Text>
    <Text>3. 完成后,打开转换后的分享链接，下载即可加速</Text>
    <Title :level=5>亲,有（1分钟）视频教程，耐心看完，包教会❤️</Title>
    <Button danger href="https://www.yuque.com/used/yr9num/doc" target="_blank">>>> 视频教程 <<<</Button>
    </Space>
  </Modal>
</template>
