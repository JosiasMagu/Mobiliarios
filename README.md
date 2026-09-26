# Mobiliário — Loja online de mobiliário

Aplicação web full-stack para catálogo e gestão de uma loja de mobiliário
(casa e escritório), com loja pública e painel de administração.

- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4 (porta 5173)
- **Backend:** Node + Express + Prisma (porta 8080)
- **Base de dados:** PostgreSQL

---

## Pré-requisitos

- **Node.js 20+** (recomendado 20 ou superior) e npm
- **PostgreSQL 16** a correr localmente, ou **Docker** para o arrancar num contentor

---

## 1. Base de dados (PostgreSQL)

Escolha **uma** das opções.

### Opção A — Docker (rápido, isolado)

```bash
docker run -d --name mobiliario-pg \
  -e POSTGRES_USER=mobiliario \
  -e POSTGRES_PASSWORD=mobiliario123 \
  -e POSTGRES_DB=mobiliario \
  -p 5432:5432 postgres:16-alpine
```

### Opção B — PostgreSQL já instalado

Crie a base de dados e o utilizador (ajuste a palavra-passe):

```sql
CREATE ROLE mobiliario LOGIN PASSWORD 'mobiliario123';
CREATE DATABASE mobiliario OWNER mobiliario;
```

---

## 2. Backend (pasta `api/`)

```bash
cd api
npm install

# Configurar variáveis de ambiente
cp .env.example .env        # no Windows: copie o ficheiro manualmente
# edite api/.env e confirme a DATABASE_URL e o JWT_SECRET

# Preparar a base de dados
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Arrancar a API
npm run dev
```

A API fica em `http://localhost:8080` (verificação: `http://localhost:8080/health`).

---

## 3. Frontend (raiz do projeto)

Noutro terminal, na raiz do projeto:

```bash
npm install
npm run dev
```

A loja fica em `http://localhost:5173`.

O ficheiro `.env` da raiz já aponta para a API local
(`VITE_API_URL=http://localhost:8080`).

---

## Acesso ao painel de administração

- URL: `http://localhost:5173/admin/login`
- Email: `admin@demo.tld`
- Palavra-passe: `admin123`

(Criado pelo seed. Altere em produção.)

---

## Scripts úteis

**Frontend (raiz):**

| Comando | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualizar o build |

**Backend (`api/`):**

| Comando | Ação |
|---|---|
| `npm run dev` | API em modo desenvolvimento |
| `npm run build` | Compilar TypeScript |
| `npm start` | Correr o build compilado |
| `npx prisma migrate deploy` | Aplicar migrações |
| `npx prisma db seed` | Popular dados iniciais |

---

## Estrutura

```
.
├── src/            Frontend (React): View, Components, Controllers, Services, States…
├── public/         Estáticos do frontend (logo, hero, imagens)
├── api/
│   ├── src/        Backend (Express): routes, middlewares, lib
│   ├── prisma/     schema.prisma, migrações e seed
│   └── .env        Configuração local do backend (NÃO versionar)
└── .env            Configuração do frontend (VITE_API_URL)
```

---

## Notas

- O `api/.env` contém credenciais locais e **não** é versionado. Use o
  `api/.env.example` como base.
- As imagens de demonstração dos produtos são carregadas de um serviço externo,
  pelo que podem demorar a aparecer na primeira vez.
