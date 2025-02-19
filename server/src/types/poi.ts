import type { PoiRealtimeInfo, CreatePoiRealtimeInfoDto, UpdatePoiRealtimeInfoDto } from './poi-realtime';
import type { PoiType } from '../constants/poi';

export interface Poi {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
    height: number;
    type: PoiType;
    description?: string;
    created_by?: number;
    created_at: string;
}

// 重新导出POI实时信息相关类型
export type {
    PoiRealtimeInfo,
    CreatePoiRealtimeInfoDto,
    UpdatePoiRealtimeInfoDto
}; 