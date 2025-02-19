import express from 'express'
import cors from 'cors'
import path from 'path'
import mapRouter from './routes/map'
import authRouter from './routes/auth'
import adminRouter from './routes/admin'
import poiRealtimeRouter from './routes/poi-realtime'
import usersRouter from './routes/users'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

// 静态资源服务
app.use('/static', express.static(path.join(__dirname, '../public')))

// 添加路由
app.use('/api/map', mapRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/poi-realtime', poiRealtimeRouter)
app.use('/api/users', usersRouter)

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
}) 