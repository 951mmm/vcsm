<template>
    <el-aside width="200px" class="sidebar">
        <el-menu default-active="1" class="menu">
            <el-menu-item index="1" @click="emit('openPoiDialog')">
                <el-icon>
                    <Location />
                </el-icon>
                <span>修改POI</span>
            </el-menu-item>
            <el-menu-item index="2" @click="userDialogVisible = true">
                <el-icon>
                    <User />
                </el-icon>
                <span>用户管理</span>
            </el-menu-item>
        </el-menu>
    </el-aside>

    <!-- 用户管理对话框 -->
    <UserDialog v-model="userDialogVisible" @add="handleAddUser" @edit="handleEditUser" @delete="handleDeleteUser" />
</template>

<script setup>
import { ref } from 'vue'
import { Location, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import UserDialog from '../user/UserDialog.vue'

const emit = defineEmits(['openPoiDialog'])
const userDialogVisible = ref(false)

// 用户管理相关处理函数
const handleAddUser = (userData) => {
    console.log('添加用户:', userData)
    // TODO: 调用后端API添加用户
}

const handleEditUser = (userData) => {
    console.log('编辑用户:', userData)
    // TODO: 调用后端API编辑用户
}

const handleDeleteUser = (userData) => {
    console.log('删除用户:', userData)
    // TODO: 调用后端API删除用户
}
</script>

<style scoped>
.sidebar {
    background-color: #fff;
    border-right: 1px solid #dcdfe6;
}

.menu {
    height: 100%;
}
</style>