<script setup lang="ts">
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  VbenAvatar,
} from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { ElButton } from 'element-plus';

const userStore = useUserStore();

const changeAvatar = () => {};
</script>
<template>
  <Card>
    <CardHeader>
      <CardTitle>基本信息</CardTitle>
    </CardHeader>
    <CardContent class="h-500px flex flex-col" style="height: 500px">
      <div class="flex flex-1 flex-col items-center justify-center gap-2">
        <div>
          <VbenAvatar
            :size="120"
            :src="userStore.userInfo?.avatar ?? ''"
            :alt="`${userStore.userInfo?.nickname}`"
          />
          <ElButton @click="changeAvatar">avatar</ElButton>
        </div>
        <span>
          {{ userStore.userInfo?.nickname }}
          <icon-man
            v-if="userStore.userInfo?.gender === 1"
            style="color: #19bbf1"
          />
          <icon-woman
            v-else-if="userStore.userInfo?.gender === 2"
            style="color: #fa7fa9"
          />
          <Edit style="width: 1em; height: 1em; margin-right: 8px" />
        </span>
        <div>
          <span class="bg-gray-200 p-1">ID</span>
          <span>{{ userStore.userInfo?.id }}</span>
        </div>
      </div>
      <div class="h-360px items-center justify-center">
        <el-descriptions column="1" label-width="80">
          <el-descriptions-item label="用户名">
            {{ userStore.userInfo?.username }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ userStore.userInfo?.phone || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userStore.userInfo?.email || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="部门">
            {{ userStore.userInfo?.deptName }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            {{ userStore.userInfo?.roleNames.join(' · ') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </CardContent>
    <CardFooter class="justify-center border-t-2 p-4">
      注册于 {{ userStore.userInfo?.registrationDate }}
    </CardFooter>
  </Card>
</template>
<style lang="scss" scoped></style>
