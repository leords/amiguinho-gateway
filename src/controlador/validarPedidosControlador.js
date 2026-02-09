import { ValidarPedidoServico } from "../../src/servico/validarPedidosServico.js"

class validarPedidosControlador {
    async tratar(req, res) {
        const { pedidos } = req.body;

        console.log('pedidos', pedidos);


        if (!Array.isArray(pedidos)) {
            return res.status(400).json({
                error: 'pedidos deve ser um array'
            })
        }

        console.log(`📥 Recebida requisição com ${pedidos.length} pedidos`);

        try {
            const servico = new ValidarPedidoServico();
            const resultado = await servico.executar(pedidos);
            return res.json({
                sucesso: true,
                resultado: {
                    salvo: resultado.salvo,
                    duplicado: resultado.duplicado,
                    falhou: resultado.falhou
                },
                resumo: {
                    total: pedidos.length,
                    salvos: resultado.salvo.length,
                    duplicados: resultado.duplicado.length,
                    falharam: resultado.falhou.length
                }
            })

        } catch (error) {
            console.error('❌ Erro no controller:', error);
        
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao processar pedidos',
                detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}


export { validarPedidosControlador }