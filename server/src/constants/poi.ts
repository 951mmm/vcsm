/**
 * POI类型枚举
 */
export type PoiType = 'sport' | 'education' | 'transportation';

/**
 * POI类型映射表
 */
export const poiTypeMap: Record<PoiType, string> = {
    sport: '体育设施',
    education: '教学设施',
    transportation: '交通设施'
};

/**
 * 获取POI类型对应的颜色
 */
export const getPoiColor = (type: PoiType): string => {
    switch (type) {
        case 'sport':
            return 'red';
        case 'education':
            return 'blue';
        case 'transportation':
            return 'green';
        default:
            return 'white';
    }
}; 