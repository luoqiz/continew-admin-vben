<script setup lang="ts">
import type { ModeItem } from './type';

import { computed, ref } from 'vue';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useVbenModal,
  VbenIcon,
} from '@vben/common-ui';
import {
  SvgCheckCircleFillIcon,
  SvgEmailColorIcon,
  SvgExclamationCircleFillIcon,
  SvgPasswordColorIcon,
  SvgPhoneColorIcon,
} from '@vben/icons';
import { useUserStore } from '@vben/stores';

import { ElButton } from 'element-plus';

import VerifyModel from '../components/VerifyModel.vue';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo!);
const modeList = ref<ModeItem[]>([]);
modeList.value = [
  {
    title: '安全手机',
    icon: SvgPhoneColorIcon,
    value: userInfo.value.phone,
    subtitle: `${userInfo.value.phone ? '' : '手机号'}可用于登录、身份验证、密码找回、通知接收`,
    type: 'phone',
    jumpMode: 'modal',
    status: !!userInfo.value.phone,
    statusString: userInfo.value.phone ? '已绑定' : '未绑定',
  },
  {
    title: '安全邮箱',
    icon: SvgEmailColorIcon,
    value: userInfo.value.email,
    subtitle: `${userInfo.value.email ? '' : '邮箱'}可用于登录、身份验证、密码找回、通知接收`,
    type: 'email',
    jumpMode: 'modal',
    status: !!userInfo.value.email,
    statusString: userInfo.value.email ? '已绑定' : '未绑定',
  },
  {
    title: '登录密码',
    icon: SvgPasswordColorIcon,
    subtitle: userInfo.value.pwdResetTime
      ? `为了您的账号安全，建议定期修改密码`
      : '请设置密码，可通过账号+密码登录',
    type: 'password',
    jumpMode: 'modal',
    status: !!userInfo.value.pwdResetTime,
    statusString: userInfo.value.pwdResetTime ? '已设置' : '未设置',
  },
];

const [VerifyModelCmpt, verifyModelApi] = useVbenModal({
  connectedComponent: VerifyModel,
  destroyOnClose: true,
});

// 修改
const onUpdate = (modal: ModeItem) => {
  verifyModelApi.setData(modal).open();
};
</script>
<template>
  <Card bordered class="gradient-card">
    <CardHeader class="card-header">
      <CardTitle>安全设置</CardTitle>
    </CardHeader>
    <CardContent class="h-500px flex flex-col">
      <div v-for="item in modeList" :key="item.title">
        <div class="item">
          <div class="icon-wrapper">
            <VbenIcon :icon="item.icon" class="size-6" />
          </div>
          <div class="info">
            <div class="info-top">
              <span class="label">{{ item.title }}</span>
              <span class="bind">
                <VbenIcon
                  v-if="item.status"
                  :icon="SvgCheckCircleFillIcon"
                  class="size-4 text-green-500"
                />
                <!-- <span v-if="item.status && item.icon" :class="cn('size-5 text-green-500', item.icon)"></span> -->
                <SvgExclamationCircleFillIcon
                  v-else
                  :size="14"
                  class="warning"
                />
                <span
                  style="font-size: 12px"
                  :class="item.status ? 'success' : 'warning'"
                >
                  {{ item.statusString }}
                </span>
              </span>
            </div>
            <div class="info-desc">
              <span class="value">{{ item.value }}</span>
              {{ item.subtitle }}
            </div>
          </div>
          <div class="btn-wrapper">
            <ElButton
              v-if="item.jumpMode === 'modal'"
              class="btn"
              :type="item.status ? 'default' : 'primary'"
              @click="onUpdate(item)"
            >
              {{
                ['password'].includes(item.type) || item.status
                  ? '修改'
                  : '绑定'
              }}
            </ElButton>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  <VerifyModelCmpt />
</template>
<style lang="scss" scoped></style>
