<script lang="ts" setup>
import { Tabs, Card} from  'ant-design-vue';
import QueryCourseDoc from './query-course-doc.vue';
import AddOrderDoc from './add-order-doc.vue';
import QueryOrderDoc from './query-order-doc.vue';
const TabPane = Tabs.TabPane; // 或直接导入: import { Tabs: { TabPane } } from 'ant-design-vue'

</script>
<template>
  <div class="p-5">
      <Tabs defaultActiveKey="1">
          <TabPane tab="课程文档" key="1">
            <Card>
               <Tabs defaultActiveKey="1">
                  <TabPane tab="查询课程" key="1">
                    <QueryCourseDoc/>
                  </TabPane>  
                  <TabPane tab="下 单" key="2">
                    <AddOrderDoc/>
                  </TabPane>  
                  <TabPane tab="查询订单" key="3">
                    <QueryOrderDoc/>
                  </TabPane>  
               </Tabs>
            </Card>
          </TabPane>  
      </Tabs>
  </div>
</template>
