// ========================================
// IMPORTAÇÕES
// ========================================
import express from 'express'
import cors from 'cors'
import 'dotenv/config' // Carrega variáveis de ambiente do arquivo .env
import { rotas } from './src/rotas/rotas.js'
import prisma from './src/database/prisma.js' // Cliente do Prisma para conexão com PostgreSQL

// ========================================
// CONFIGURAÇÃO DO SERVIDOR
// ========================================
const app = express()

// PORT: Railway injeta automaticamente a porta via variável de ambiente
// Se não existir (ambiente local), usa porta 8080 como fallback
const PORT = process.env.PORT || 8080

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================
// CORS: Permite que frontend de outras origens acesse a API
app.use(cors())

// JSON Parser: Converte o body das requisições em objetos JavaScript
app.use(express.json())

// ========================================
// ROTAS DE MONITORAMENTO (HEALTH CHECKS)
// ========================================

/**
 * GET /
 * Rota raiz - Railway acessa essa rota para verificar se o container está vivo
 * Responde rapidamente sem acessar o banco de dados
 */
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    message: 'API Controlador rodando'
  })
})

/**
 * GET /health
 * Health check profundo - Testa a conexão com o banco de dados
 * Útil para monitoramento e debugging
 */
app.get('/health', async (req, res) => {
  try {
    // Executa query simples para verificar se o banco está acessível
    await prisma.$queryRaw`SELECT 1`
    
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected'
    })
  } catch (error) {
    // Status 503 = Service Unavailable (banco inacessível)
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message
    })
  }
})

// ========================================
// ROTAS DA APLICAÇÃO
// ========================================
// Todas as rotas definidas em ./src/rotas/rotas.js
// Exemplo: POST /validar-envio
app.use(rotas)

// ========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================================
/**
 * Error Handler Global
 * Captura qualquer erro não tratado nas rotas
 * IMPORTANTE: Deve ser o último middleware registrado
 */
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err)
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  })
})

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================
/**
 * Inicia o servidor HTTP
 * - PORT: Porta definida pelo Railway (ou 8080 local)
 * - '0.0.0.0': Aceita conexões de qualquer interface de rede
 *   (necessário para containers Docker/Railway)
 */
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`)
})

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
/**
 * Função de desligamento gracioso
 * Garante que todas as conexões sejam fechadas corretamente
 * antes do processo terminar
 * 
 * @param {string} signal - Nome do sinal recebido (SIGTERM ou SIGINT)
 */
const shutdown = async (signal) => {
  console.log(`\n📡 ${signal} received, shutting down gracefully...`)
  
  // Passo 1: Para de aceitar novas conexões HTTP
  server.close(() => {
    console.log('🛑 HTTP server closed')
  })
  
  // Passo 2: Desconecta do banco de dados (Prisma)
  await prisma.$disconnect()
  console.log('🔌 Database disconnected')
  
  // Passo 3: Encerra o processo com sucesso
  process.exit(0)
}

// ========================================
// LISTENERS DE SINAIS DO SISTEMA
// ========================================
/**
 * SIGTERM: Sinal enviado pelo Railway/Docker para encerrar o processo
 * Usado quando há redeploy ou quando o container é parado
 */
process.on('SIGTERM', () => shutdown('SIGTERM'))

/**
 * SIGINT: Sinal enviado quando você aperta Ctrl+C no terminal
 * Útil durante desenvolvimento local
 */
process.on('SIGINT', () => shutdown('SIGINT'))