import { validarPedidosControlador } from "../controlador/validarPedidosControlador.js";
import { Router } from "express";

const rotas = Router();

rotas.get('/', (req, res) => {
    res.send('API OK')
})

rotas.post("/validar-envio", new validarPedidosControlador().tratar)

export { rotas }