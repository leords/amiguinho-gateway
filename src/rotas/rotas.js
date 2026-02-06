import { validarPedidosControlador } from "../controlador/validarPedidosControlador.js";
import { Router } from "express";

const rotas = Router();

rotas.post("/validar-envio", new validarPedidosControlador().tratar)

export { rotas }