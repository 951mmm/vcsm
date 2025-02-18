<template>
    <el-dialog v-model="visible" :title="`${poi?.name || ''} - 实时信息`" width="70%">
        <el-table :data="realtimeInfos" style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="value" label="值" />
            <el-table-column label="更新时间" width="180">
                <template #default="{ row }">
                    {{ new Date(row.updated_at).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column v-if="isAdmin" label="操作" width="200">
                <template #default="{ row }">
                    <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
            <el-button v-if="isAdmin" type="primary" @click="handleAdd">添加信息</el-button>
        </template>

        <!-- 添加/编辑表单弹窗 -->
        <el-dialog v-model="formVisible" :title="editingInfo ? '编辑实时信息' : '添加实时信息'" width="500px" append-to-body>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="值" prop="value">
                    <el-input v-model="form.value" placeholder="请输入值" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </template>
        </el-dialog>

        <!-- 删除确认弹窗 -->
        <el-dialog v-model="deleteVisible" title="确认删除" width="400px" append-to-body>
            <p>确定要删除这条实时信息吗？此操作不可恢复。</p>
            <template #footer>
                <el-button @click="deleteVisible = false">取消</el-button>
                <el-button type="danger" @click="handleConfirmDelete">删除</el-button>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '../../stores/user'
import type { Poi, PoiRealtimeInfo } from '../../types/poi'
import { usePoiRealtimeInfo } from '../../composables/usePoiRealtimeInfo'

const props = defineProps<{
    modelValue: boolean
    poi?: Poi
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const userStore = useUserStore()
const isAdmin = computed(() => userStore.user?.role === 'admin')

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
})

const {
    realtimeInfos,
    addRealtimeInfo,
    updateRealtimeInfo,
    deleteRealtimeInfo,
    fetchRealtimeInfos
} = usePoiRealtimeInfo()

// 表单相关
const formRef = ref<FormInstance>()
const formVisible = ref(false)
const editingInfo = ref<PoiRealtimeInfo | null>(null)
const form = ref({
    name: '',
    value: ''
})

const rules = {
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    value: [
        { required: true, message: '请输入值', trigger: 'blur' }
    ]
}

// 删除相关
const deleteVisible = ref(false)
const deletingInfo = ref<PoiRealtimeInfo | null>(null)

// 监听POI变化，重新获取实时信息
watch(() => props.poi, async (newPoi) => {
    if (newPoi) {
        try {
            await fetchRealtimeInfos(newPoi.id)
        } catch (error) {
            ElMessage.error('获取实时信息失败')
        }
    }
}, { immediate: true })

const handleAdd = () => {
    editingInfo.value = null
    form.value = {
        name: '',
        value: ''
    }
    formVisible.value = true
}

const handleEdit = (info: PoiRealtimeInfo) => {
    editingInfo.value = info
    form.value = {
        name: info.name,
        value: info.value
    }
    formVisible.value = true
}

const handleDelete = (info: PoiRealtimeInfo) => {
    deletingInfo.value = info
    deleteVisible.value = true
}

const handleSave = async () => {
    if (!formRef.value) return
    if (!props.poi) return

    try {
        await formRef.value.validate()

        if (editingInfo.value) {
            await updateRealtimeInfo(editingInfo.value.id, form.value)
            ElMessage.success('更新成功')
        } else {
            await addRealtimeInfo({
                poi_id: props.poi.id,
                ...form.value
            })
            ElMessage.success('添加成功')
        }

        formVisible.value = false
        await fetchRealtimeInfos(props.poi.id)
    } catch (error) {
        ElMessage.error(editingInfo.value ? '更新失败' : '添加失败')
    }
}

const handleConfirmDelete = async () => {
    if (!deletingInfo.value || !props.poi) return

    try {
        await deleteRealtimeInfo(deletingInfo.value.id)
        ElMessage.success('删除成功')
        deleteVisible.value = false
        await fetchRealtimeInfos(props.poi.id)
    } catch (error) {
        ElMessage.error('删除失败')
    }
}
</script>