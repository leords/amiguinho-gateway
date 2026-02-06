import express from "express";
import cors from "cors"
import { rotas } from "./src/rotas/rotas.js";

const PORTA = process.env.PORTA || 4000;


const app = express();

app.use(cors());
app.use(express.json());
app.use(rotas);

app.listen(PORTA, () => console.log("Server running on port 4000"))