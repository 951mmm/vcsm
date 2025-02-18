export type PoiType = 'sport' | 'education' | 'transportation'

export const poiTypeMap: Record<PoiType, string> = {
    sport: '体育设施',
    education: '教学设施',
    transportation: '交通设施'
}

export const poiFormRules = {
    name: [
        { required: true, message: '请输入POI名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择POI类型', trigger: 'change' }
    ],
    longitude: [
        { required: true, message: '请输入经度', trigger: 'blur' },
        { type: 'number', message: '经度必须为数字', trigger: 'blur' }
    ],
    latitude: [
        { required: true, message: '请输入纬度', trigger: 'blur' },
        { type: 'number', message: '纬度必须为数字', trigger: 'blur' }
    ],
    height: [
        { required: true, message: '请输入高度', trigger: 'blur' },
        { type: 'number', message: '高度必须为数字', trigger: 'blur' }
    ]
}

export const getPoiColor = (type: PoiType): string => {
    switch (type) {
        case 'sport':
            return 'red'
        case 'education':
            return 'blue'
        case 'transportation':
            return 'green'
        default:
            return 'white'
    }
} 