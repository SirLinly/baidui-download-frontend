<script lang="ts" setup>
import { Card, Typography, List, Table } from 'ant-design-vue';
import { JsonViewer } from '@vben/common-ui';
import { json1 } from './data';
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
              <Text>http://123.56.194.160:9988/key/addOrder</Text>
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
        { key: '1', name: 'school', description: '清华大学', type: '学校名称' },
        { key: '2', name: 'username', description: '173*****507', type: '学生账号' },
        { key: '3', name: 'password', description: 'qwe@11333', type: '学生密码' },
        { key: '4', name: 'platform', description: '1', type: '平台编号' },
        { key: '4', name: 'courseId', description: '248551263', type: '没有课程id取课程名称' },
        { key: '4', name: 'courseName', description: '思想道德与法治', type: '课程ID(优先取)' },
        { key: '3', name: 'uid', description: '6***68', type: '用户ID' },
        { key: '3', name: 'token', description: '1*****', type: '个人中心Token' }
      ]" :pagination=false>
        <Table.Column title="参数名" dataIndex="name" key="name" />
        <Table.Column title="参数值" dataIndex="description" key="description" />
        <Table.Column title="说明" dataIndex="type" key="type" />
      </Table>
    </Card>
    <Card title="返回成功结果">
        <JsonViewer
        :value="json1"
        copyable
        preview-mode
        :show-array-index="false"
      />
    </Card>
  </div>
</template>
