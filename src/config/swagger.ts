import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cuidar TEA API",
      version: "1.0.0",
      description:
        "Documentação da API para a plataforma Cuidar TEA, que conecta famílias e profissionais especializados no cuidado ao autismo.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsdoc(options);

export default specs;
