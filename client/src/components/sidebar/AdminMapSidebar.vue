<template>
    <el-aside width="200px" class="sidebar">
        <el-menu default-active="1" class="menu">
            <el-menu-item index="1" @click="emit('openPoiDialog')">
                <el-icon>
                    <Location />
                </el-icon>
                <span>修改POI</span>
            </el-menu-item>
            <el-menu-item index="2" @click="emit('openUserDialog')">
                <el-icon>
                    <User />
                </el-icon>
                <span>用户管理</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>

<script setup>
import { Location, User } from '@element-plus/icons-vue'

const emit = defineEmits(['openPoiDialog', 'openUserDialog'])
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