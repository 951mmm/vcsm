-- 1. 恢复备份表
DROP TABLE pois;
ALTER TABLE pois_backup RENAME TO pois;
CREATE INDEX idx_pois_created_by ON pois(created_by);

-- 2. 删除枚举类型
DROP TYPE poi_type;

-- 3. 删除备份表（可选，如果确认恢复成功）
-- DROP TABLE pois_backup; 