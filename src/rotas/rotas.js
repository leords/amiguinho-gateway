import { validarPedidosControlador } from "../controlador/validarPedidosControlador.js";
import { Router } from "express";
import concorrencia from "../infra/concorrencia.js";
import { ValidarPedidoServico } from "../servico/validarPedidosServico.js";

const rotas = Router();

rotas.post("/validar-envio", new validarPedidosControlador().tratar)


export { rotas }