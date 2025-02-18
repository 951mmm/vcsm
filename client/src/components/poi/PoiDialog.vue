<template>
    <el-dialog v-model="visible" title="POI列表" width="70%">
        <el-table :data="pois" style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="type" label="类型">
                <template #default="{ row }">
                    {{ poiTypeMap[row.type] }}
                </template>
            </el-table-column>
            <el-table-column prop="longitude" label="经度" />
            <el-table-column prop="latitude" label="纬度" />
            <el-table-column prop="height" label="高度" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="200" v-if="isAdmin">
                <template #default="{ row }">
                    <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="handleAdd" v-if="isAdmin">添加POI</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { poiTypeMap } from '../../constants/poi'

const props = defineProps({
    modelValue: Boolean,
    pois: Array,
    isAdmin: Boolean
})

const emit = defineEmits(['update:modelValue', 'edit', 'delete', 'add'])

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const handleEdit = (poi) => emit('edit', poi)
const handleDelete = (poi) => emit('delete', poi)
const handleAdd = () => emit('add')
</script>