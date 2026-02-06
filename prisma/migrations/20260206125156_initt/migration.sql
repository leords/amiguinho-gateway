-- CreateTable
CREATE TABLE "PedidoRecebido" (
    "pedidoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoRecebido_pkey" PRIMARY KEY ("pedidoId")
);
