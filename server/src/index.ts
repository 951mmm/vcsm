import express from 'express'
import cors from 'cors'
import mapRouter from './routes/map'
import authRouter from './routes/auth'
import adminRouter from './routes/admin'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

// 添加路由
app.use('/api/map', mapRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
}) 