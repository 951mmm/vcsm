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