/**
 * POI实时信息的基本接口定义
 */
export interface PoiRealtimeInfo {
    /** 唯一标识符 */
    id: number;

    /** 关联的POI ID */
    poi_id: number;

    /** 实时信息名称 */
    name: string;

    /** 实时信息值 */
    value: string;

    /** 创建时间 */
    created_at: Date;

    /** 更新时间 */
    updated_at: Date;
}

/**
 * 创建POI实时信息的数据传输对象
 */
export interface CreatePoiRealtimeInfoDto {
    /** 关联的POI ID */
    poi_id: number;

    /** 实时信息名称 */
    name: string;

    /** 实时信息值 */
    value: string;
}

/**
 * 更新POI实时信息的数据传输对象
 */
export interface UpdatePoiRealtimeInfoDto {
    /** 实时信息名称（可选） */
    name?: string;

    /** 实时信息值（可选） */
    value?: string;
}

/**
 * POI实时信息的查询参数
 */
export interface PoiRealtimeInfoQueryParams {
    /** POI ID */
    poi_id?: number;

    /** 名称模糊搜索 */
    name?: string;

    /** 按创建时间排序方式 */
    sort_by_created?: 'asc' | 'desc';

    /** 按更新时间排序方式 */
    sort_by_updated?: 'asc' | 'desc';

    /** 分页大小 */
    limit?: number;

    /** 分页偏移 */
    offset?: number;
}

/**
 * POI实时信息的响应结果
 */
export interface PoiRealtimeInfoResponse {
    /** 实时信息列表 */
    data: PoiRealtimeInfo[];

    /** 总记录数 */
    total: number;

    /** 分页大小 */
    limit: number;

    /** 分页偏移 */
    offset: number;
} 