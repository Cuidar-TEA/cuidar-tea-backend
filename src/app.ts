import express from "express";
import cors from "cors";
import "./config/dbConnection";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./config/swagger";
import usuarioRoutes from "./routes/usuariosRoutes";
import profissionaisRoutes from "./routes/profissionaisRoutes";
import agendamentosRoutes from "./routes/agendamentosRoutes";
import estatisticasRoutes from "./routes/estatisticasRoutes";

const app = express();
app.use(cors(), express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get("/", (req, res) => {
  res.status(200).send("Cuidar TEA - API");
});

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/profissionais", profissionaisRoutes);
app.use("/api/agendamentos", agendamentosRoutes);
app.use("/api/estatisticas", estatisticasRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.originalUrl} não encontrada...` });
});

export default app;
