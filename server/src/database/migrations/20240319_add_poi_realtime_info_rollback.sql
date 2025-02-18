-- 删除触发器
DROP TRIGGER IF EXISTS update_poi_realtime_info_updated_at ON poi_realtime_info;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 删除索引
DROP INDEX IF EXISTS idx_poi_realtime_info_poi_id;

-- 删除表
DROP TABLE IF EXISTS poi_realtime_info; 