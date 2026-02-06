import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check importante!
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// Suas rotas aqui...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})