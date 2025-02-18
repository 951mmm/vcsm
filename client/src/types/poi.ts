import type { PoiType } from '../constants/poi'

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

export interface PoiRealtimeInfo {
    id: number;
    poi_id: number;
    name: string;
    value: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreatePoiRealtimeInfoDto {
    poi_id: number;
    name: string;
    value: string;
}

export interface UpdatePoiRealtimeInfoDto {
    name?: string;
    value?: string;
} 