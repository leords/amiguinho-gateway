import express from "express";
import cors from "cors"
import { rotas } from "./src/rotas/rotas.js";

const PORT = process.env.PORT || 4000;


const app = express();

app.use(cors());
app.use(express.json());
//app.use(rotas);

rotas.get('/', (req, res) => {
    res.send('API OK')
})

app.listen(PORT, () => console.log("Server running on port 4000"))