# Oficina Bandeira

Sistema web completo para a Oficina Bandeira — site institucional com marketplace de veículos usados.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Vue 3 + Vite + Bootstrap 5 |
| Backend | .NET 10 + ASP.NET Core + Dapper |
| Banco | PostgreSQL |
| Auth | JWT (BCrypt salt 12) |

---

## Estrutura do Projeto

```
oficinabandeira-demo/
├── frontend/                  ← Vue 3 + Vite
│   └── src/
│       ├── views/             ← HomeView, LoginView, DashboardView
│       ├── components/dashboard/
│       ├── composables/       ← useAuth, useApi
│       ├── assets/            ← CSS global, imagens
│       └── router/
├── backend-dotnet/            ← API .NET 10
│   ├── Controllers/           ← Auth, Veiculos, Anuncios
│   ├── Models/                ← Usuario, Veiculo, Anuncio
│   ├── Dtos/                  ← Requests tipados
│   ├── Services/              ← TokenService (JWT)
│   ├── Database/              ← DbConnectionFactory, Migration
│   ├── Migrations/            ← SQL versionado (001, 002...)
│   ├── scripts/               ← SQL utilitários para pgAdmin
│   └── uploads/               ← Fotos dos veículos (gerado em runtime)
└── iniciar projeto para amadores/
    ├── INICIAR PROJETO.bat
    └── ME LEIA CARALHO!.txt
```

---

## Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 15+](https://www.postgresql.org/download) + pgAdmin 4

---

## Configuração inicial (apenas uma vez)

### 1. Criar o banco de dados

No pgAdmin 4 ou psql:

```sql
CREATE DATABASE oficinabandeira;
```

### 2. Configurar a connection string

Edite `backend-dotnet/appsettings.json` se necessário:

```json
"Postgres": "Host=localhost;Port=5432;Database=oficinabandeira;Username=postgres;Password=postgres"
```

As tabelas são criadas automaticamente na primeira execução via migrations.

### 3. Instalar dependências do frontend

```bash
cd frontend
npm install
```

### 4. Criar o usuário administrador

Com a API rodando, execute `backend-dotnet/scripts/criar_admin.sql` no pgAdmin 4.

```
E-mail: admin@oficinabandeira.com
Senha:  Admin@123
```

---

## Rodando o projeto

### Backend

```bash
cd backend-dotnet
dotnet run
# http://localhost:3001
```

### Frontend

```bash
cd frontend
npm run dev
# http://localhost:5173
```

O Vite faz proxy automático de `/api` e `/uploads` para `localhost:3001` — sem configuração adicional de CORS.

> Para usuários não técnicos: use o `INICIAR PROJETO.bat` na pasta `iniciar projeto para amadores/`.

---

## Rotas da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /api/auth/cadastro | — | Criar conta |
| POST | /api/auth/login | — | Login, retorna JWT |
| GET | /api/auth/perfil | ✅ | Dados do usuário logado |
| GET | /api/veiculos/marcas | — | Lista marcas e modelos |
| GET | /api/veiculos | ✅ | Veículos do usuário |
| POST | /api/veiculos | ✅ | Cadastrar veículo (multipart/form-data) |
| DELETE | /api/veiculos/:id | ✅ | Remover veículo |
| GET | /api/anuncios | — | Anúncios públicos ativos |
| GET | /api/anuncios/meus | ✅ | Anúncios do usuário logado |
| POST | /api/anuncios | ✅ | Criar anúncio |
| DELETE | /api/anuncios/:id | ✅ | Desativar anúncio |
| GET | /api/ping | — | Health check |

---

## Banco de Dados

### Schema

```sql
usuarios  → id, nome, email, senha_hash, role, status, criado_em
veiculos  → id, usuario_id, marca, modelo, ano, cor, quilometragem, descricao, fotos (JSON), criado_em
anuncios  → id, usuario_id, veiculo_id, preco, descricao, ativo, criado_em
```

### Migrations

Versionadas em `backend-dotnet/Migrations/` e executadas automaticamente na inicialização, em ordem alfabética.

| Arquivo | O que faz |
|---|---|
| `001_initial.sql` | Cria as 3 tabelas principais |
| `002_add_user_role_status.sql` | Adiciona `role` e `status` em `usuarios` |

### Scripts utilitários (pgAdmin)

| Arquivo | Uso |
|---|---|
| `scripts/criar_admin.sql` | Cria usuário administrador |
| `scripts/alterar_status_usuario.sql` | Altera role/status de qualquer usuário |

---

## Segurança

- Senhas com **BCrypt** (salt rounds: 12)
- Autenticação via **JWT** (expira em 7 dias)
- Proteção contra timing attack no login
- Validação de inputs via DataAnnotations
- Upload restrito a imagens (jpg, png, webp) com limite de 5MB por arquivo, máx. 10 por veículo
- Foreign keys com `ON DELETE CASCADE`

---

## Uploads de Imagens

As fotos dos veículos são salvas localmente em `backend-dotnet/uploads/` e servidas como arquivos estáticos em `/uploads/*`.

> **Atenção em produção:** o disco local é efêmero em ambientes cloud (Railway, Render, etc.). Para produção, migre para AWS S3, Cloudinary ou Supabase Storage.
