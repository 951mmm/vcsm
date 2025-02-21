// POI类型
export type PoiType = 'sport' | 'education' | 'transportation';

// POI基本信息接口
export interface Poi {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
    height: number;
    type: PoiType;
    description?: string;
    created_by?: number;
    created_at: Date;
}

// 创建POI的数据传输对象
export interface CreatePoiDto {
    name: string;
    longitude: number;
    latitude: number;
    height: number;
    type: PoiType;
    description?: string;
}

// 更新POI的数据传输对象
export interface UpdatePoiDto {
    name?: string;
    longitude?: number;
    latitude?: number;
    height?: number;
    type?: PoiType;
    description?: string;
}

// 重新导出POI实时信息相关类型
export type {
    PoiRealtimeInfo,
    CreatePoiRealtimeInfoDto,
    UpdatePoiRealtimeInfoDto
}; 