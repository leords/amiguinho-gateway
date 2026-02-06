import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const app = express()
const prisma = new PrismaClient()

// IMPORTANTE: Railway define a PORT dinamicamente
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API running' })
})

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// Suas outras rotas aqui...

// CRÍTICO: Escutar em 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...')
  await prisma.$disconnect()
  process.exit(0)
})