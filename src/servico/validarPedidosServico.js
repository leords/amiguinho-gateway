import prismaCliente from "../database/prisma.js";
import {enviarParaGoogleScript} from "../integracao/googleScript.js";



// estrutura do pedido: { dados: [...], meta: { id: "uuid", status: "digitado" } } array de pedidos 

class ValidarPedidoServico {

  // função que extrai o ID do pedido
  extrairPedidoId(pedido) {
    // Tenta pegar do meta.id primeiro (mais confiável)
    if (pedido?.meta?.id) {
      return pedido.meta.id;
    }
    
    // Fallback: é um plano b que garante a ação, neste caso a coleta do ID.
    if (Array.isArray(pedido?.dados) && pedido.dados.length > 85) {
      const idDosdados = pedido.dados[85];
      if (idDosdados && typeof idDosdados === 'string') {
        return idDosdados;
      }
    }
    return null;
  }

// ------ ETAPA 1: EXTRAIR E VALIDAR IDs ------
  async executar(pedidos = []) {
    console.log(`📦 Recebidos ${pedidos.length} pedidos para validar`);

    //cria um novo array com pedido e id e filtro remove os pedidos sem ID válido
    const pedidosComId = pedidos
      .map(pedido => ({ // para cada pedido, ele cria um novo o objeto!
        original: pedido,
        pedidoId: this.extrairPedidoId(pedido)
      }))
      .filter(p => p.pedidoId !== null);

    // Pedidos que não tinham ID válido.
    const pedidosInvalidos = pedidos.length - pedidosComId.length; 
    if (pedidosInvalidos > 0) {
      console.warn(`⚠️ ${pedidosInvalidos} pedidos sem ID válido foram ignorados`);
    }

    // Se não há pedidos válidos, retorna arrays vazios.
    if (pedidosComId.length === 0) {
      return {
        salvo: [],
        duplicado: [],
        falhou: []
      };
    }

    // cria um array apenas com os IDs para consulta.
    const ids = pedidosComId.map(p => p.pedidoId);


// ------ ETAPA 2: IDENTIFICAR DUPLICADOS ------
    const pedidosExistentes = await prismaCliente.pedidoRecebido.findMany({
      where: { 
        pedidoId: { in: ids } // in = entre essas opções! 
      },
      select: { pedidoId: true }
    });
    
    // Set = estrutura que armazena valores unicos sem duplicatas e permite buscas super rapidas.
    const idsExistentes = new Set(
      pedidosExistentes.map(p => p.pedidoId)
    );

    // Separa novos e duplicados
    const pedidosNovos = pedidosComId.filter(
      p => !idsExistentes.has(p.pedidoId)
    );
    
    const pedidosDuplicados = pedidosComId
      .filter(p => idsExistentes.has(p.pedidoId))
      .map(p => p.pedidoId);

    console.log(`✅ ${pedidosNovos.length} novos | ⚠️ ${pedidosDuplicados.length} duplicados`);

    // Se todos são duplicados, retorna imediatamente
    if (pedidosNovos.length === 0) {
      return {
        salvo: [],
        duplicado: pedidosDuplicados,
        falhou: []
      };
    }

// ------ ETAPA 3: REGISTRAR NO BANCO ------
    try {
      // registra no banco.
      await prismaCliente.pedidoRecebido.createMany({
        data: pedidosNovos.map(p => ({ 
          pedidoId: p.pedidoId 
        }))
      });
      
      console.log(`💾 ${pedidosNovos.length} pedidos salvos no banco`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar pedidos no banco:', error);
      
      // Se falhar ao salvar, marca todos como falha
      return {
        salvo: [],
        duplicado: pedidosDuplicados,
        falhou: pedidosNovos.map(p => p.pedidoId)
      };
    }

// ------ ETAPA 4: ENVIAR PARA GOOGLE SHEETS ------
    try {
      // Envia os objetos completos (com dados e meta)
      await enviarParaGoogleScript(
        pedidosNovos.map(p => p.original)
      );
      
      console.log(`📊 ${pedidosNovos.length} pedidos enviados ao Google Sheets`);
      
      // ✅ SUCESSO COMPLETO
      return {
        salvo: pedidosNovos.map(p => p.pedidoId),
        duplicado: pedidosDuplicados,
        falhou: []
      };
      
    } catch (error) {
      console.error('❌ Erro ao enviar para Google Sheets:', error);
      
      // Salvou no banco mas falhou no Sheets
      return {
        salvo: [],
        duplicado: pedidosDuplicados,
        falhou: pedidosNovos.map(p => p.pedidoId)
      };
    }
  }
}

export { ValidarPedidoServico };