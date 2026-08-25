<script lang="ts" setup>
import { Card, Typography, List, Table } from 'ant-design-vue';
import { JsonViewer } from '@vben/common-ui';
import { json3 } from './data';
const { Title, Text } = Typography;
</script>
<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <Card title="课程信息">
      <List bordered itemLayout="vertical">
        <List.Item>
          <List.Item.Meta>
            <template #title>
              <Title :level="5">URL</Title>
              <Text>http://123.56.194.160:9988/key/queryOrder</Text>
            </template>
          </List.Item.Meta>
        </List.Item>
        <List.Item>
          <List.Item.Meta>
            <template #title>
              <Title :level="5">请求类型</Title>
              <Text>POST</Text>
            </template>
          </List.Item.Meta>
        </List.Item>
        <List.Item>
          <List.Item.Meta>
            <template #title>
              <Title :level="5">请求格式</Title>
              <Text>x-www-form-urlencoded</Text>
            </template>
          </List.Item.Meta>
        </List.Item>
        <List.Item>
          <List.Item.Meta>
            <template #title>
              <Title :level="5">返回类型</Title>
              <Text>JSON</Text>
            </template>
          </List.Item.Meta>
        </List.Item>
      </List>
    </Card>
    <Card title="请求参数及实例-">
      <Table :dataSource="[
        { key: '1', name: 'uid', description: '6***68', type: '用户ID' },
        { key: '2', name: 'token', description: '1*****', type: '个人中心Token' },
        { key: '4', name: 'account', description: '173*****507', type: '下单账号' },
        { key: '5', name: 'startTime', description: '2024-10-1', type: '起始时间' },
        { key: '6', name: 'endTime', description: '2024-10-30', type: '结束时间' }
      ]" :pagination=false>
        <Table.Column title="参数名" dataIndex="name" key="name" />
        <Table.Column title="参数值" dataIndex="description" key="description" />
        <Table.Column title="说明" dataIndex="type" key="type" />
      </Table>
    </Card>
    <Card title="返回成功结果">
        <JsonViewer
        :value="json3"
        copyable
        preview-mode
        :show-array-index="false"
      />
    </Card>
  </div>
</template>
