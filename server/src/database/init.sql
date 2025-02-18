-- 创建用户角色枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- 创建用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 POI 表
CREATE TABLE pois (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  longitude NUMERIC(10,6) NOT NULL,
  latitude NUMERIC(10,6) NOT NULL,
  height NUMERIC(10,2) DEFAULT 0,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建多边形区域表
CREATE TABLE polygons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coordinates JSONB NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_pois_created_by ON pois(created_by);
CREATE INDEX idx_polygons_created_by ON polygons(created_by);
CREATE INDEX idx_users_username ON users(username); 