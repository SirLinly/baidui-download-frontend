<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { List, Button, Tag, Typography, Collapse } from 'ant-design-vue';
import { payActivity,payPromotion } from '#/api/svipCard/index';
import PayModal from './payModal.vue';

// 定义优惠券类型
interface Coupon {
  value?: number;
  price?: number | null;
  couponCode?: string;
  description?: string;
}

// 定义联合权益类型
interface UnionItem {
  id?: string;
  name?: string;
  description?: string;
}

// 修改 ProductItem 接口定义
interface ProductItem {
  id?: string; // 添加 id 属性，解决之前的问题
  productName: string;
  price: number;
  originalPrice?: number;
  duration: string;
  autoRenew: boolean;
  firstCharge: boolean;
  couponList?: Coupon[];
  unionList?: UnionItem[];
  appleId: string;
  productId: string;
  description: string;
  source?: 'activity' | 'promotion'; // 新增来源标识
}

// 定义分组类型
interface GroupItem {
  name: string;
  items: ProductItem[];
}

// 定义支付参数类型
interface PayParams {
  appleId: string;
  productId: string;
  productName: string;
  firstCharge: boolean;
  realPayPrice: number;
  couponCode: string;
}

const activitys = ref<ProductItem[] | undefined>(); 
const promotionActivitys = ref<ProductItem[] | undefined>();
const modalResult = ref();
const row = ref<ProductItem | undefined>();
const payParams = ref<PayParams>({
  appleId: '',
  productId: '',
  productName: '',
  firstCharge: false,
  realPayPrice: 0,
  couponCode: ''
});

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const rawData = drawerApi.getData<Record<string, any>>();
      row.value = rawData.row;
      activitys.value = rawData.activitys || [];
      promotionActivitys.value = rawData.promotion || [];
    }
  },
});

// 支付订单
const [PayRootModal, payRootModalApi] = useVbenModal({
  connectedComponent: PayModal,
  onOpenChange(isOpen: boolean) {
    // 关闭事件
    if (!isOpen) {
       modalResult.value = payRootModalApi.getData<Record<string, any>>();
       // 检查支付是否成功
      if (modalResult.value?.isPaid) {
        // 处理支付成功的逻辑
        // 关闭抽屉
        drawerApi.close();
        // 可以在这里刷新数据或执行其他操作
        // 例如重新加载活动数据
        // reloadActivityData();
      }
    }
  },
});

// 判断是否是SVIP产品
const isSvip = (item: ProductItem) => {
  return item.productName.startsWith('vip2_') || 
         item.productName.startsWith('svip10_') ||
         item.productName.includes('svip');
};

// 判断是否是VIP产品
const isVip = (item: ProductItem) => {
  return item.productName.startsWith('vipv2_');
};

// 判断是否是容量产品
const isVolume = (item: ProductItem) => {
  return item.productName.startsWith('volume_');
};

// 判断是否有优惠券
const hasCoupon = (item: ProductItem) => {
  return item.couponList && Array.isArray(item.couponList) && item.couponList.length > 0 && 
         item.couponList.some((coupon: Coupon) => coupon.value && coupon.value > 0);
};

// 获取优惠券列表
const getCouponList = (item: ProductItem) => {
  return hasCoupon(item) ? item.couponList || [] : [];
};

// 获取直接优惠券（price 为 null 的优惠券）
const getDirectCoupons = (item: ProductItem) => {
  if (!hasCoupon(item)) return [];
  return (item.couponList || []).filter((coupon: Coupon) => coupon.value && coupon.value > 0 && coupon.price === null);
};

// 获取券优惠券（price 不为 null 的优惠券）
const getCouponBasedCoupons = (item: ProductItem) => {
  if (!hasCoupon(item)) return [];
  return (item.couponList || []).filter((coupon: Coupon) => coupon.value && coupon.value > 0 && coupon.price !== null);
};

// 获取总的券优惠金额
const getTotalCouponBasedDiscount = (item: ProductItem) => {
  const couponBasedCoupons = getCouponBasedCoupons(item);
  return couponBasedCoupons.reduce((sum: number, coupon: Coupon) => sum + (coupon.value || 0), 0);
};

// 获取总的直接优惠金额
const getTotalDirectDiscount = (item: ProductItem) => {
  const directCoupons = getDirectCoupons(item);
  return directCoupons.reduce((sum: number, coupon: Coupon) => sum + (coupon.value || 0), 0);
};

// 计算使用优惠券后的最终价格
const getFinalPrice = (item: ProductItem) => {
  // 如果有券优惠券（price 不为 null），使用 item.price - 优惠券总价值
  const couponBasedCoupons = getCouponBasedCoupons(item);
  if (couponBasedCoupons.length > 0) {
    const totalCouponValue = couponBasedCoupons.reduce((sum: number, coupon: Coupon) => sum + (coupon.value || 0), 0);
    // 确保最终价格不低于0
    return Math.max(item.price - totalCouponValue, 0);
  }
  
  // 如果只有直接优惠券（price 为 null），价格已经包含了优惠，直接返回 item.price
  const directCoupons = getDirectCoupons(item);
  if (directCoupons.length > 0) {
    return item.price;
  }
  
  // 如果没有优惠券，直接返回价格
  return item.price;
};

// 获取原始价格（应用优惠券前的价格）
const getOriginalPrice = (item: ProductItem) => {
  // 如果有券优惠券，原始价格是 item.price + 优惠券总价值
  const couponBasedCoupons = getCouponBasedCoupons(item);
  if (couponBasedCoupons.length > 0) {
    const totalCouponValue = couponBasedCoupons.reduce((sum: number, coupon: Coupon) => sum + (coupon.value || 0), 0);
    return item.price + totalCouponValue;
  }
  
  // 如果有直接优惠券，原始价格是 item.price + 直接优惠金额
  const directCoupons = getDirectCoupons(item);
  if (directCoupons.length > 0) {
    const totalDirectDiscount = getTotalDirectDiscount(item);
    return item.price + totalDirectDiscount;
  }
  
  // 如果没有优惠券，返回 item.price
  return item.price;
};

// 获取总的优惠金额
const getTotalDiscountValue = (item: ProductItem) => {
  // 总优惠金额 = 券优惠金额 + 直接优惠金额
  const couponBasedDiscount = getTotalCouponBasedDiscount(item);
  const directDiscount = getTotalDirectDiscount(item);
  return couponBasedDiscount + directDiscount;
};

// 判断是否有联名权益
const hasUnionList = (item: ProductItem) => {
  return item.unionList && Array.isArray(item.unionList) && item.unionList.length > 0;
};

// 获取联名权益数量
const getUnionCount = (item: ProductItem) => {
  return hasUnionList(item) ? item?.unionList?.length : 0;
};

// 修改 groupedActivityData 计算属性
const groupedActivityData = computed(() => {
  if (!activitys.value) return [];
  
  const groups: Record<string, GroupItem> = {};
  
  activitys.value.forEach((item: ProductItem) => {
    let category = 'other';
    
    // 根据产品名称确定类别
    if (item.productName.startsWith('vip2_') || item.productName.startsWith('svip10_')) {
      category = 'svip';
    } else if (item.productName.startsWith('vipv2_')) {
      category = 'vip';
    } else if (item.productName.startsWith('volume_')) {
      category = 'volume';
    } else if (hasUnionList(item)) {
      category = 'union';
    } else {
      category = 'special';
    }
    
    if (!groups[category]) {
      groups[category] = {
        name: getCategoryName(category),
        items: []
      };
    }
    
    // 创建带有来源标识的商品对象
    const itemWithSource = { ...item, source: 'activity' } as ProductItem;
    
    // 使用类型断言确保类型安全
    const group = groups[category];
    if (group && group.items) {
      group.items.push(itemWithSource);
    }
  });
  
  // 对每个分组内的项目按最终价格升序排序
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    if (group && group.items) {
      group.items.sort((a: ProductItem, b: ProductItem) => getFinalPrice(a) - getFinalPrice(b));
    }
  });
  
  return Object.values(groups);
});

// 修改 groupedPromotionData 计算属性
const groupedPromotionData = computed(() => {
  if (!promotionActivitys.value) return [];
  
  const groups: Record<string, GroupItem> = {};
  
  promotionActivitys.value.forEach((item: ProductItem) => {
    let category = 'other';
    
    // 根据产品名称确定类别
    if (item.productName.startsWith('vip2_') || item.productName.startsWith('svip10_')) {
      category = 'svip';
    } else if (item.productName.startsWith('vipv2_')) {
      category = 'vip';
    } else if (item.productName.startsWith('volume_')) {
      category = 'volume';
    } else if (hasUnionList(item)) {
      category = 'union';
    } else {
      category = 'special';
    }
    
    if (!groups[category]) {
      groups[category] = {
        name: getCategoryName(category),
        items: []
      };
    }
    
    // 创建带有来源标识的商品对象
    const itemWithSource = { ...item, source: 'promotion' } as ProductItem;
    
    // 使用类型断言确保类型安全
    const group = groups[category];
    if (group && group.items) {
      group.items.push(itemWithSource);
    }
  });
  
  // 对每个分组内的项目按最终价格升序排序
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    if (group && group.items) {
      group.items.sort((a: ProductItem, b: ProductItem) => getFinalPrice(a) - getFinalPrice(b));
    }
  });
  
  return Object.values(groups);
});

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'svip': '超级会员 SVIP',
    'vip': '普通会员 VIP',
    'volume': '空间扩容',
    'special': '特殊套餐',
    'union': '联名套餐',
    'other': '其他'
  };
  return categoryMap[category] || category;
};

// 计算实际支付金额（将分转换为元）
const getActualPrice = (price: number) => {
  return (price / 100).toFixed(2);
};

// 处理购买按钮点击事件
const handlePurchase = (item: ProductItem) => {
  // 使用最终价格作为实际支付价格
  const finalPrice = getFinalPrice(item);
  payParams.value.appleId = item.appleId;
  payParams.value.productId = item.productId;
  payParams.value.productName = item.productName;
  payParams.value.firstCharge = item.firstCharge;
  payParams.value.realPayPrice = finalPrice;
  payParams.value.couponCode = getCouponList(item)[0]?.couponCode || '';
  // 修复：将 id 转换为数字类型
  const id = row.value?.id ? Number(row.value.id) : 0;
  
  if(item.source === 'activity'){
    // 调用支付确认接口
    payActivity(id, payParams.value).then((res) => {
        payRootModalApi.setData({ row: row.value, payInfo: res }).open();
    })
    .catch(() => {
      console.log('支付失败');
    });
  }else{
    // 调用支付接口
    payPromotion(id, payParams.value).then((res) => {
      payRootModalApi.setData({ row: row.value, payInfo: res }).open();
    })
    .catch(() => {
      console.log('支付失败');
    });
  }
};
</script>
<template>
  <Drawer class="w-[35%]" title="优惠活动">
    <!-- 普通活动 -->
    <Collapse v-if="groupedActivityData.length > 0" ghost :bordered="false">
      <Collapse.Panel key="activity" header="活动商品">
        <Collapse v-if="groupedActivityData.length > 0" ghost>
          <Collapse.Panel 
            v-for="(group, groupIndex) in groupedActivityData" 
            :key="'activity-' + groupIndex" 
            :header="group.name"
          >
            <List
              :data-source="group.items"
              :pagination="false"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <List.Item>
                  <List.Item.Meta>
                    <template #title>
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span>{{ item.description }}</span>
                        <div>
                          <Tag v-if="item.firstCharge" color="red">首充专享</Tag>
                          <Tag v-if="hasCoupon(item)" color="orange">有优惠券</Tag>
                          <Tag v-if="hasUnionList(item)" color="purple">联名套餐</Tag>
                          <Tag v-if="!item.autoRenew" color="blue">非自动续费</Tag>
                          <Tag v-if="item.autoRenew" color="green">自动续费</Tag>
                        </div>
                      </div>
                    </template>
                    <template #description>
                      <div class="product-details">
                        <div class="price-section">
                          <!-- 显示最终实际价格 -->
                          <Typography.Text strong style="color: #ff4d4f; font-size: 16px;">
                            ¥{{ getActualPrice(getFinalPrice(item)) }}
                          </Typography.Text>
                          
                          <!-- 显示原价和优惠信息 -->
                          <div v-if="hasCoupon(item)" style="margin-left: 8px; display: inline-block;">
                            <Typography.Text 
                              delete 
                              type="secondary" 
                              style="font-size: 14px;"
                            >
                              ¥{{ getActualPrice(getOriginalPrice(item)) }}
                            </Typography.Text>
                            <Typography.Text 
                              type="success" 
                              style="margin-left: 8px; font-size: 14px;"
                            >
                              已优惠¥{{ getActualPrice(getTotalDiscountValue(item)) }}
                            </Typography.Text>
                          </div>
                          
                          <!-- 如果没有优惠券但原价和现价不同，显示原价 -->
                          <Typography.Text 
                            v-else-if="item.originalPrice && item.originalPrice !== getFinalPrice(item) && item.originalPrice > getFinalPrice(item)" 
                            delete 
                            type="secondary" 
                            style="margin-left: 8px;"
                          >
                            ¥{{ getActualPrice(item.originalPrice) }}
                          </Typography.Text>
                        </div>
                        
                        <div class="other-info">
                          <div style="display: flex; justify-content: space-between;">
                            <Typography.Paragraph style="margin-bottom: 4px;">
                              <Typography.Text strong>有效期：</Typography.Text>
                              {{ item.duration }}
                            </Typography.Paragraph>
                            
                            <Typography.Paragraph style="margin-bottom: 4px;">
                              <Typography.Text strong>类型：</Typography.Text>
                              <Tag v-if="isSvip(item)" color="blue">SVIP</Tag>
                              <Tag v-if="isVip(item)" color="gold">VIP</Tag>
                              <Tag v-if="isVolume(item)" color="cyan">空间扩容</Tag>
                              <Tag v-if="!isSvip(item) && !isVip(item) && !isVolume(item)" color="default">其他</Tag>
                            </Typography.Paragraph>
                          </div>
                          
                          <div v-if="hasCoupon(item)" style="margin-top: 4px;">
                            <Typography.Text strong>优惠券：</Typography.Text>
                            <span v-for="(coupon, index) in getCouponList(item)" :key="index">
                              <Tag color="orange" style="margin-left: 4px;" v-if="coupon.value && coupon.value > 0">
                                {{ coupon.description || `${getActualPrice(coupon.value)}元优惠券` }} (-¥{{ getActualPrice(coupon.value) }})
                              </Tag>
                            </span>
                          </div>
                          
                          <div v-if="hasUnionList(item)" style="margin-top: 4px;">
                            <Typography.Text strong>联名权益：</Typography.Text>
                            <Tag color="purple">{{ getUnionCount(item) }}个权益</Tag>
                          </div>
                        </div>
                      </div>
                    </template>
                  </List.Item.Meta>
                  
                  <template #actions>
                    <Button 
                      type="primary" 
                      size="small" 
                      @click="handlePurchase(item)"
                    >
                      购买
                    </Button>
                  </template>
                </List.Item>
              </template>
            </List>
          </Collapse.Panel>
        </Collapse>
      </Collapse.Panel>
    </Collapse>

    <!-- 推广活动 -->
    <Collapse v-if="groupedPromotionData.length > 0" ghost :bordered="false" style="margin-top: 16px;">
      <Collapse.Panel key="promotion" header="推广活动商品">
        <Collapse v-if="groupedPromotionData.length > 0" ghost>
          <Collapse.Panel 
            v-for="(group, groupIndex) in groupedPromotionData" 
            :key="'promotion-' + groupIndex" 
            :header="group.name"
          >
            <List
              :data-source="group.items"
              :pagination="false"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <List.Item>
                  <List.Item.Meta>
                    <template #title>
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span>{{ item.description }}</span>
                        <div>
                          <Tag v-if="item.firstCharge" color="red">首充专享</Tag>
                          <Tag v-if="hasCoupon(item)" color="orange">有优惠券</Tag>
                          <Tag v-if="hasUnionList(item)" color="purple">联名套餐</Tag>
                          <Tag v-if="!item.autoRenew" color="blue">非自动续费</Tag>
                          <Tag v-if="item.autoRenew" color="green">自动续费</Tag>
                        </div>
                      </div>
                    </template>
                    <template #description>
                      <div class="product-details">
                        <div class="price-section">
                          <!-- 显示最终实际价格 -->
                          <Typography.Text strong style="color: #ff4d4f; font-size: 16px;">
                            ¥{{ getActualPrice(getFinalPrice(item)) }}
                          </Typography.Text>
                          
                          <!-- 显示原价和优惠信息 -->
                          <div v-if="hasCoupon(item)" style="margin-left: 8px; display: inline-block;">
                            <Typography.Text 
                              delete 
                              type="secondary" 
                              style="font-size: 14px;"
                            >
                              ¥{{ getActualPrice(getOriginalPrice(item)) }}
                            </Typography.Text>
                            <Typography.Text 
                              type="success" 
                              style="margin-left: 8px; font-size: 14px;"
                            >
                              已优惠¥{{ getActualPrice(getTotalDiscountValue(item)) }}
                            </Typography.Text>
                          </div>
                          
                          <!-- 如果没有优惠券但原价和现价不同，显示原价 -->
                          <Typography.Text 
                            v-else-if="item.originalPrice && item.originalPrice !== getFinalPrice(item) && item.originalPrice > getFinalPrice(item)" 
                            delete 
                            type="secondary" 
                            style="margin-left: 8px;"
                          >
                            ¥{{ getActualPrice(item.originalPrice) }}
                          </Typography.Text>
                        </div>
                        
                        <div class="other-info">
                          <div style="display: flex; justify-content: space-between;">
                            <Typography.Paragraph style="margin-bottom: 4px;">
                              <Typography.Text strong>有效期：</Typography.Text>
                              {{ item.duration }}
                            </Typography.Paragraph>
                            
                            <Typography.Paragraph style="margin-bottom: 4px;">
                              <Typography.Text strong>类型：</Typography.Text>
                              <Tag v-if="isSvip(item)" color="blue">SVIP</Tag>
                              <Tag v-if="isVip(item)" color="gold">VIP</Tag>
                              <Tag v-if="isVolume(item)" color="cyan">空间扩容</Tag>
                              <Tag v-if="!isSvip(item) && !isVip(item) && !isVolume(item)" color="default">其他</Tag>
                            </Typography.Paragraph>
                          </div>
                          
                          <div v-if="hasCoupon(item)" style="margin-top: 4px;">
                            <Typography.Text strong>优惠券：</Typography.Text>
                            <span v-for="(coupon, index) in getCouponList(item)" :key="index">
                              <Tag color="orange" style="margin-left: 4px;" v-if="coupon.value && coupon.value > 0">
                                {{ coupon.description || `${getActualPrice(coupon.value)}元优惠券` }} (-¥{{ getActualPrice(coupon.value) }})
                              </Tag>
                            </span>
                          </div>
                          
                          <div v-if="hasUnionList(item)" style="margin-top: 4px;">
                            <Typography.Text strong>联名权益：</Typography.Text>
                            <Tag color="purple">{{ getUnionCount(item) }}个权益</Tag>
                          </div>
                        </div>
                      </div>
                    </template>
                  </List.Item.Meta>
                  
                  <template #actions>
                    <Button 
                      type="primary" 
                      size="small" 
                      @click="handlePurchase(item)"
                    >
                      购买
                    </Button>
                  </template>
                </List.Item>
              </template>
            </List>
          </Collapse.Panel>
        </Collapse>
      </Collapse.Panel>
    </Collapse>
  </Drawer>
  <PayRootModal/>
</template>



<style scoped>
.product-details {
  width: 100%;
}

.price-section {
  margin: 8px 0;
}

.other-info :deep(.ant-typography) {
  margin-bottom: 0;
}

:deep(.ant-list-item) {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-list-item-meta-title) {
  margin-bottom: 8px;
}

:deep(.ant-collapse-content-box) {
  padding: 0 8px;
}
</style>
