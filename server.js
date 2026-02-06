import express from "express";
import cors from "cors";
import { rotas } from "./src/rotas/rotas.js";

const app = express();

// ⚠️ Render injeta PORT automaticamente
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(rotas);

// rota simples pra teste
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
