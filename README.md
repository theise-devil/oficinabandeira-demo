# Oficina Bandeira — Sistema Completo

## Estrutura
```
oficina bandeira/
├── index.html          ← site principal
├── login.html          ← login / cadastro
├── dashboard.html      ← área do cliente
├── script.js
├── styles.css
└── backend/
    ├── server.js
    ├── db.js
    ├── .env
    ├── middleware/auth.js
    ├── routes/
    │   ├── auth.js
    │   ├── veiculos.js
    │   └── anuncios.js
    └── uploads/        ← fotos dos veículos (criado automaticamente)
```

## Como rodar

### 1. Instalar dependências do backend
```bash
cd "oficina bandeira/backend"
npm install
```

### 2. Iniciar o servidor
```bash
npm run dev       # com hot-reload (nodemon)
# ou
npm start         # produção
```
O servidor sobe em **http://localhost:3001**

### 3. Abrir o frontend
Abra o `index.html` diretamente no navegador ou use uma extensão como **Live Server** no VS Code.

---

## Rotas da API

| Método | Rota                  | Auth | Descrição                        |
|--------|-----------------------|------|----------------------------------|
| POST   | /api/auth/cadastro    | —    | Criar conta                      |
| POST   | /api/auth/login       | —    | Login, retorna JWT               |
| GET    | /api/auth/perfil      | ✅   | Dados do usuário logado          |
| GET    | /api/veiculos         | ✅   | Listar veículos do usuário       |
| POST   | /api/veiculos         | ✅   | Cadastrar veículo (com foto)     |
| DELETE | /api/veiculos/:id     | ✅   | Remover veículo                  |
| GET    | /api/anuncios         | —    | Listar anúncios públicos         |
| GET    | /api/anuncios/meus    | ✅   | Anúncios do usuário logado       |
| POST   | /api/anuncios         | ✅   | Criar anúncio                    |
| DELETE | /api/anuncios/:id     | ✅   | Desativar anúncio                |

## Segurança implementada
- Senhas com **bcrypt** (salt rounds: 12)
- Autenticação via **JWT** (expira em 7 dias)
- Validação e sanitização de todos os inputs
- Proteção contra timing attack no login
- Foreign keys e WAL no SQLite
- Upload restrito a imagens (jpg, png, webp) com limite de 5MB
