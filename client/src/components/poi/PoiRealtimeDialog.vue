<template>
    <el-dialog v-model="visible" :title="`${poi?.name} - 实时信息`" width="80%" :close-on-click-modal="false"
        class="poi-realtime-dialog">
        <div class="realtime-content">
            <!-- 实时信息图表 -->
            <PoiRealtimeChart :poi="poi" :realtime-infos="realtimeInfos" :loading="loading" />

            <!-- 实时信息表格 -->
            <div class="realtime-table">
                <div class="table-header">
                    <h3>实时数据列表</h3>
                    <el-button v-if="isAdmin" type="primary" size="small" @click="handleAddInfo">
                        添加实时信息
                    </el-button>
                </div>
                <el-table :data="realtimeInfos" style="width: 100%" v-loading="loading">
                    <el-table-column prop="name" label="名称" min-width="120" />
                    <el-table-column prop="value" label="数值" min-width="120" />
                    <el-table-column label="更新时间" min-width="180">
                        <template #default="{ row }">
                            {{ new Date(row.updated_at).toLocaleString() }}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="isAdmin" label="操作" width="150" fixed="right">
                        <template #default="{ row }">
                            <el-button size="small" @click="handleEditInfo(row)">
                                编辑
                            </el-button>
                            <el-button size="small" type="danger" @click="handleDeleteInfo(row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </el-dialog>

    <!-- 添加/编辑实时信息表单 -->
    <el-dialog v-model="showForm" :title="editingInfo ? '编辑实时信息' : '添加实时信息'" width="500px" append-to-body>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" @submit.prevent>
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="数值" prop="value">
                <el-input v-model="form.value" placeholder="请输入数值" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showForm = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
                确定
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { Poi, PoiRealtimeInfo } from '../../types/poi';
import { useUserStore } from '../../stores/user';
import { usePoiRealtimeInfo } from '../../composables/usePoiRealtimeInfo';
import PoiRealtimeChart from './PoiRealtimeChart.vue';

const props = defineProps<{
    modelValue: boolean;
    poi?: Poi;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const {
    realtimeInfos,
    fetchRealtimeInfos,
    addRealtimeInfo,
    updateRealtimeInfo,
    deleteRealtimeInfo,
} = usePoiRealtimeInfo();

const loading = ref(false);
const showForm = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const editingInfo = ref<PoiRealtimeInfo | null>(null);

const form = ref({
    name: '',
    value: '',
});

const rules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    value: [{ required: true, message: '请输入数值', trigger: 'blur' }],
};

// 加载实时信息数据
const loadData = async () => {
    if (!props.poi) return;
    loading.value = true;
    try {
        await fetchRealtimeInfos(props.poi.id);
    } catch (error) {
        ElMessage.error('获取实时信息失败');
    } finally {
        loading.value = false;
    }
};

// 监听对话框显示状态
watch(visible, (newValue) => {
    if (newValue && props.poi) {
        loadData();
    }
});

// 添加实时信息
const handleAddInfo = () => {
    editingInfo.value = null;
    form.value = {
        name: '',
        value: '',
    };
    showForm.value = true;
};

// 编辑实时信息
const handleEditInfo = (info: PoiRealtimeInfo) => {
    editingInfo.value = info;
    form.value = {
        name: info.name,
        value: info.value,
    };
    showForm.value = true;
};

// 删除实时信息
const handleDeleteInfo = async (info: PoiRealtimeInfo) => {
    try {
        await deleteRealtimeInfo(info.id);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        ElMessage.error('删除失败');
    }
};

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid && props.poi) {
            submitting.value = true;
            try {
                if (editingInfo.value) {
                    await updateRealtimeInfo(editingInfo.value.id, form.value);
                    ElMessage.success('更新成功');
                } else {
                    await addRealtimeInfo({
                        poi_id: props.poi.id,
                        ...form.value,
                    });
                    ElMessage.success('添加成功');
                }
                showForm.value = false;
                loadData();
            } catch (error) {
                ElMessage.error(
                    editingInfo.value ? '更新失败' : '添加失败'
                );
            } finally {
                submitting.value = false;
            }
        }
    });
};
</script>

<style scoped>
.poi-realtime-dialog :deep(.el-dialog__body) {
    padding: 20px;
}

.realtime-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.realtime-table {
    background: #fff;
    border-radius: 4px;
    padding: 16px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.table-header h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
}
</style>