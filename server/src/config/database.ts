import { Pool } from 'pg'

export const pool = new Pool({
    host: 'localhost',
    user: 'ww',
    password: '1234',
    database: 'cesium',
    port: 5432,
    max: 10
}) 