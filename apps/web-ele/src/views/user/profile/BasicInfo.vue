<script setup lang="ts">
import type { UploadProps, UploadUserFile } from 'element-plus';

import { ref } from 'vue';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  useVbenModal,
  VbenAvatar,
} from '@vben/common-ui';
import {
  SvgCameraIcon,
  SvgEditIcon,
  SvgManIcon,
  SvgWomanIcon,
} from '@vben/icons';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { ElMessage } from 'element-plus';

import { uploadAvatar } from '#/api';
import { SvgIdIcon } from '#/components/Icons';
import getAvatar from '#/utils/avatar';

import BaseInfoModify from '../components/BaseInfoModify.vue';
import UploadAvatarModal from '../components/UploadAvatar.vue';

const userStore = useUserStore();

const [BaseInfoModal, modalApi] = useVbenModal({
  closable: true,
  draggable: true,
  connectedComponent: BaseInfoModify,
  destroyOnClose: true,
});
const changeAvatar = () => {};
const onUpdate = () => {
  modalApi.setData(userStore.userInfo ?? null);
  modalApi.open();
};

const [AvatarUploadModel, avatarModalApi] = useVbenModal({
  closable: true,
  draggable: true,
  connectedComponent: UploadAvatarModal,
  destroyOnClose: true,
});

// 定义已存在默认头像
const avatar = {
  uid: -2,
  name: 'avatar.png',
  url: userStore.userInfo?.avatar,
};
const avatarList = ref<UploadUserFile[]>([avatar]);

const onBeforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('请上传图片文件！');
    return false;
  }
  const isLt2M = rawFile.size / 1024 / 1024 < 20;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  avatarModalApi.setData(rawFile);
  avatarModalApi.open();
  return false;
};

// 上传头像
const handleUpload = async (data: any) => {
  const formData = new FormData();
  formData.append('avatarFile', data, 'avatar.png');
  uploadAvatar(formData).then((res) => {
    userStore.userInfo!.avatar = res.avatar;
    avatarList.value[0]!.url = getAvatar(res.avatar, undefined);
    ElMessage.success('更新成功');
    avatarModalApi.close();
  });
};
</script>
<template>
  <Card bordered class="gradient-card">
    <CardHeader class="card-header">
      <CardTitle>{{ $t('system.user.profile.basicInfo') }}</CardTitle>
    </CardHeader>
    <CardContent class="h-500px flex flex-col" style="height: 500px">
      <div class="flex flex-1 flex-col items-center justify-center gap-2">
        <div class="flex flex-row items-end justify-center">
          <VbenAvatar
            :size="120"
            :src="userStore.userInfo?.avatar ?? ''"
            :alt="`${userStore.userInfo?.nickname}`"
          />
          <div class="text-red relative right-10 top-0">
            <el-upload
              class="avatar-uploader"
              v-model:file-list="avatarList"
              :show-file-list="false"
              :before-upload="onBeforeUpload"
              action="#"
              :auto-upload="true"
              accept="image/*"
            >
              <SvgCameraIcon
                @click="changeAvatar"
                class="size-6 cursor-pointer text-blue-500"
              />
            </el-upload>
          </div>
        </div>
        <div class="flex flex-row items-center justify-center">
          <span>{{ userStore.userInfo?.nickname }}</span>
          <SvgManIcon
            v-if="userStore.userInfo?.gender === 1"
            class="size-6 text-[#19bbf1]"
          />
          <SvgWomanIcon
            v-else-if="userStore.userInfo?.gender === 2"
            class="size-6 text-[#fa7fa9]"
          />
          &nbsp;
          <SvgEditIcon
            class="size-6 cursor-pointer text-blue-500"
            @click="onUpdate"
          />
        </div>
        <div class="flex flex-row items-center justify-center">
          <SvgIdIcon />
          <span>{{ userStore.userInfo?.id }}</span>
        </div>
      </div>
      <div class="h-360px items-center justify-center">
        <el-descriptions column="1" label-width="80">
          <el-descriptions-item :label="$t('system.user.username')">
            {{ userStore.userInfo?.username }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.user.phone')">
            {{ userStore.userInfo?.phone || $t('pages.common.notAvailable') }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.user.email')">
            {{ userStore.userInfo?.email || $t('pages.common.notAvailable') }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.user.deptId')">
            {{ userStore.userInfo?.deptName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.user.roleIds')">
            {{ userStore.userInfo?.roleNames.join(' · ') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </CardContent>
    <CardFooter class="justify-center border-t-2 p-4">
      {{ $t('system.user.profile.registeredAt') }}
      {{ userStore.userInfo?.registrationDate }}
    </CardFooter>
  </Card>
  <BaseInfoModal />
  <AvatarUploadModel @crop-success="handleUpload" />
</template>
<style lang="scss" scoped></style>
