<template>
    <el-dialog v-model="dialogVisible" title="用户管理" width="600px">
        <div class="user-dialog">
            <div class="toolbar">
                <el-button type="primary" @click="handleAdd">
                    <el-icon>
                        <Plus />
                    </el-icon>添加用户
                </el-button>
            </div>

            <template v-if="usersLoaded">
                <el-table :data="users" style="width: 100%">
                    <el-table-column prop="username" label="用户名" />
                    <el-table-column prop="role" label="角色">
                        <template #default="{ row }">
                            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                        <template #default="{ row }">
                            <el-button type="primary" link @click="handleEdit(row)">
                                <el-icon>
                                    <Edit />
                                </el-icon>编辑
                            </el-button>
                            <el-button type="danger" link @click="handleDelete(row)">
                                <el-icon>
                                    <Delete />
                                </el-icon>删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
            <div v-else-if="loadError" class="error-container">
                <el-empty description="加载失败">
                    <el-button type="primary" @click="loadUsers">重试</el-button>
                </el-empty>
            </div>
            <div v-else class="loading-container">
                <el-empty description="加载中...">
                    <el-skeleton animated :rows="3" />
                </el-empty>
            </div>
        </div>

        <!-- 用户表单对话框 -->
        <el-dialog v-model="formVisible" :title="editingUser ? '编辑用户' : '新增用户'" width="400px" append-to-body>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" style="max-width: 460px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" />
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!editingUser">
                    <el-input v-model="form.password" type="password" />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="form.role" placeholder="请选择角色">
                        <el-option value="user" label="普通用户" />
                        <el-option value="admin" label="管理员" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="formVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUsers } from '../../composables/useUsers'

interface Props {
    modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const {
    users,
    usersLoaded,
    loadError,
    loadUsers,
    createUser,
    updateUser,
    deleteUser
} = useUsers()

const formVisible = ref(false)
const editingUser = ref(null)
const formRef = ref(null)

const form = ref({
    username: '',
    password: '',
    role: 'user',
})

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    role: [
        { required: true, message: '请选择角色', trigger: 'change' }
    ]
}

onMounted(() => {
    loadUsers()
})

const handleAdd = () => {
    editingUser.value = null
    form.value = {
        username: '',
        password: '',
        role: 'user',
    }
    formVisible.value = true
}

const handleEdit = (user) => {
    editingUser.value = user
    form.value = {
        username: user.username,
        role: user.role,
    }
    formVisible.value = true
}

const handleDelete = (user) => {
    ElMessageBox.confirm(
        `确定要删除用户 "${user.username}" 吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            await deleteUser(user.id)
            ElMessage.success('删除成功')
        } catch (error) {
            ElMessage.error(error.message)
        }
    })
}

const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid: any) => {
        if (valid) {
            try {
                if (editingUser.value) {
                    await updateUser(editingUser.value.id, form.value)
                    ElMessage.success('编辑成功')
                } else {
                    await createUser(form.value)
                    ElMessage.success('添加成功')
                }
                formVisible.value = false
            } catch (error) {
                ElMessage.error(error.message)
            }
        }
    })
}
</script>

<style scoped>
.user-dialog {
    padding: 0 20px;
}

.toolbar {
    margin-bottom: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}
</style>