-- 1. 创建备份表
CREATE TABLE pois_backup AS SELECT * FROM pois;

-- 2. 创建POI类型枚举
CREATE TYPE poi_type AS ENUM ('sport', 'education', 'transportation');

-- 3. 创建新表结构
CREATE TABLE pois_new (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    longitude NUMERIC(10,6) NOT NULL,
    latitude NUMERIC(10,6) NOT NULL,
    height NUMERIC(10,2) DEFAULT 0,
    type poi_type NOT NULL DEFAULT 'education',
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 复制数据到新表，根据名称推断类型
INSERT INTO pois_new (id, name, longitude, latitude, height, type, description, created_by, created_at)
SELECT 
    id,
    name,
    longitude,
    latitude,
    height,
    (CASE 
        WHEN name LIKE '%体育%' OR name LIKE '%球场%' OR name LIKE '%馆%' THEN 'sport'::poi_type
        WHEN name LIKE '%教%' OR name LIKE '%楼%' OR name LIKE '%系%' THEN 'education'::poi_type
        WHEN name LIKE '%站%' OR name LIKE '%门%' OR name LIKE '%路%' THEN 'transportation'::poi_type
        ELSE 'education'::poi_type
    END),
    description,
    created_by,
    created_at
FROM pois;

-- 5. 删除旧表
DROP TABLE pois;

-- 6. 重命名新表
ALTER TABLE pois_new RENAME TO pois;

-- 7. 重新创建索引
CREATE INDEX idx_pois_created_by ON pois(created_by); 