<h1 align="center"> Cuidar TEA - Backend</h1>

<p align="center">
  <img alt="Status do Projeto" src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow">
  <img alt="Licença" src="https://img.shields.io/badge/licen%C3%A7a-MIT License-red">
</p>

<p align="center">
  API RESTful para a plataforma Cuidar TEA, que conecta famílias e pessoas com TEA a profissionais de saúde especializados.
</p>

---

## 📖 Sobre o Projeto

Este repositório contém o código-fonte do backend para a aplicação **Cuidar TEA**.  
A API é responsável por toda a lógica de negócio, gerenciamento de dados e autenticação da plataforma, que tem como objetivo **facilitar o acesso a profissionais qualificados para a comunidade autista**, simplificando o processo de busca e agendamento de consultas.

---

## 🚀 Ambiente de Desenvolvimento com Docker

Este projeto utiliza Docker e Docker Compose para garantir um ambiente de desenvolvimento padronizado e de fácil configuração, rodando a API e um banco de dados MySQL localmente em contêineres.

### Pré-requisitos
- Git
- Docker Desktop

### Passos para a Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/limajpp/cuidar-tea.git
    cd cuidar-tea/cuidar-tea-backend
    ```

2.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto. Você pode criar um arquivo `env.example` no seu repositório para servir de modelo. Preencha com as suas chaves e segredos.

    **Exemplo de `.env` para o banco de dados Docker local:**
    ```env
    # URL de conexão para o banco de dados
    DATABASE_URL="mysql://root:rootpassword@db:3306/mydb"

    # API Secrets
    JWT_SECRET="seu_jwt_secret_aqui"
    JWT_EXPIRES_IN="1d"

    # Configuração do Cloudinary
    CLOUDINARY_CLOUD_NAME="seu_cloud_name"
    CLOUDINARY_API_KEY="sua_api_key"
    CLOUDINARY_API_SECRET="seu_api_secret"

    # Porta da aplicação
    PORT=3000
    ```

3.  **Suba os Contêineres:**
    Com o Docker Desktop em execução, rode o seguinte comando na raiz do projeto backend:
    ```bash
    docker-compose up --build
    ```
    O Docker irá construir a imagem da API, baixar a imagem do MySQL e iniciar os dois contêineres.

4.  **Execute as Migrations do Banco (Apenas na primeira vez):**
    Com os contêineres rodando, abra um **novo terminal** e execute o seguinte comando para criar as tabelas no banco de dados:
    ```bash
    docker exec -it cuidar-tea-api npx prisma migrate dev
    ```

5.  **Pronto!**
    Sua API estará rodando e acessível em `http://localhost:3000`.

### Comandos Úteis do Docker
- **Para parar os contêineres:**
  ```bash
  docker-compose down
  ```
- **Para acessar o terminal dentro do contêiner da API:**
  ```bash
  docker exec -it cuidar-tea-api /bin/sh
  ```

---

## 🛠️ Tecnologias Utilizadas

O backend foi construído com as seguintes tecnologias e padrões:

- **Linguagem e Ambiente:** Node.js com TypeScript  
- **Framework:** Express.js  
- **Banco de Dados:** MySQL  
- **ORM:** Prisma  
- **Autenticação:** JWT (JSON Web Token)  
- **Validação de Dados:** Zod  
- **Upload de Arquivos:** Multer e Cloudinary  
- **Documentação da API:** Swagger (OpenAPI)  

---

## 📚 Documentação da API

A documentação completa e interativa da API, gerada com Swagger, está disponível no endpoint `/api-docs` enquanto a aplicação estiver rodando.

**URL:** `http://localhost:3000/api-docs`

Lá você poderá visualizar todos os endpoints, seus parâmetros, schemas e testá-los diretamente no navegador.
