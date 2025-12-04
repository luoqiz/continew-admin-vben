<script setup lang="ts">
import type { ModeItem } from './type';

import { onMounted, ref } from 'vue';

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
  SvgExclamationCircleFillIcon,
  SvgGiteeIcon,
  SvgGithubIcon,
  SvgWeChatIcon,
} from '@vben/icons';

import { ElButton, ElMessage } from 'element-plus';

import { listUserSocial, socialAuth, unbindSocialAccount } from '#/api';

import VerifyModel from '../components/VerifyModel.vue';

const socialList = ref<any>([]);
const modeList = ref<ModeItem[]>([]);

// 初始化数据
const initData = () => {
  listUserSocial().then((res) => {
    socialList.value = res.map((el) => el.source);
    modeList.value = [
      {
        title: '绑定 Gitee',
        icon: SvgGiteeIcon,
        subtitle: `${socialList.value.includes('GITEE') ? '' : '绑定后，'}可通过 Gitee 进行登录`,
        jumpMode: 'link',
        type: 'gitee',
        status: socialList.value.includes('GITEE'),
      },
      {
        title: '绑定 GitHub',
        icon: SvgGithubIcon,
        subtitle: `${socialList.value.includes('GITHUB') ? '' : '绑定后，'}可通过 GitHub 进行登录`,
        type: 'github',
        jumpMode: 'link',
        status: socialList.value.includes('GITHUB'),
      },
      {
        title: '绑定微信',
        icon: SvgWeChatIcon,
        subtitle: `${socialList.value.includes('WECHAT_OPEN') ? '' : '绑定后，'}可通过微信进行登录`,
        type: 'wechat_open',
        jumpMode: 'link',
        status: socialList.value.includes('WECHAT_OPEN'),
      },
    ];
  });
};

// 绑定
const onBinding = (type: string, status: boolean) => {
  if (status) {
    unbindSocialAccount(type).then(() => {
      initData();
      ElMessage.success('解绑成功');
    });
  } else {
    socialAuth(type).then((res) => {
      window.open(res.authorizeUrl, '_self');
    });
  }
};

const [VerifyModelCmpt, verifyModelApi] = useVbenModal({
  connectedComponent: VerifyModel,
  destroyOnClose: true,
});

// 修改
const onUpdate = (modal: ModeItem) => {
  verifyModelApi.setData(modal).open();
};

onMounted(() => {
  initData();
});
</script>
<template>
  <Card bordered class="gradient-card">
    <CardHeader class="card-header">
      <CardTitle>第三方账号</CardTitle>
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
                  class="size-4 text-red-500"
                />
                <SvgExclamationCircleFillIcon
                  v-else
                  :size="14"
                  class="warning"
                />
                <span
                  style="font-size: 12px"
                  :class="item.status ? 'success' : 'warning'"
                >
                  {{ item.status ? '已绑定' : '未绑定' }}
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
              {{ item.status ? '修改' : '绑定' }}
            </ElButton>
            <ElButton
              v-if="item.jumpMode === 'link'"
              class="btn"
              :type="item.status ? 'default' : 'primary'"
              @click="onBinding(item.type, item.status)"
            >
              {{ item.status ? '解绑' : '绑定' }}
            </ElButton>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  <VerifyModelCmpt />
</template>
<style lang="scss" scoped></style>
