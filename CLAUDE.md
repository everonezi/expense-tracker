# Gerenciador de Gastos Familiar

Aplicação full-stack para controle de gastos familiares, com backend Spring Boot e frontend React.

## Estrutura do projeto

```
E:\Claude\
├── expense-tracker-backend/   # API REST em Spring Boot
└── expense-tracker-frontend/  # SPA em React + MUI
```

## Backend (`expense-tracker-backend`)

**Stack:** Java 21, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, PostgreSQL, Flyway, Lombok

**Rodar:**
```powershell
cd expense-tracker-backend
./mvnw spring-boot:run
# Ou via Maven instalado: mvn spring-boot:run
```
API disponível em `http://localhost:8080`.

**Banco de dados:** PostgreSQL local. Migrações gerenciadas pelo Flyway em `src/main/resources/db/migration/`.

**Pacote base:** `com.family.expenses`

**Convenções:**
- Controllers em `/controller`, Services em `/service`, Repositories em `/repository`
- DTOs em `/dto` (separados das entidades JPA em `/entity`)
- Enums em `/enums`
- Toda autenticação é JWT stateless; rotas públicas apenas em `/api/auth/**`
- Cada recurso pertence a uma `Family` — sempre filtrar por `family_id` do usuário autenticado

**Domínio principal:**
- `Family` → `User` (roles: ADMIN, MEMBER)
- `Account` (tipos: CHECKING, SAVINGS, CREDIT_CARD, etc.)
- `Category` (tipos: INCOME, EXPENSE; pode ser padrão do sistema ou da família)
- `Transaction` → pertence a User, Account, Category, Family
- `RecurringTransaction` → transações recorrentes por dia do mês
- `Budget` → limite mensal por categoria/família

## Frontend (`expense-tracker-frontend`)

**Stack:** React 18, Vite, MUI v6, React Router v6, Axios, Recharts

**Rodar:**
```powershell
cd expense-tracker-frontend
npm run dev
```
App disponível em `http://localhost:5173`.

**Páginas:**
- `/login`, `/register` — públicas
- `/dashboard` — resumo mensal e gráficos
- `/transactions` — listagem e criação de transações
- `/accounts` — contas bancárias
- `/categories` — categorias personalizadas
- `/budgets` — orçamentos mensais

**Convenções:**
- Cliente HTTP centralizado em `src/api/client.js` (Axios com interceptor de token JWT)
- Contexto de autenticação em `src/contexts/AuthContext.jsx`
- Rotas protegidas via `src/components/PrivateRoute.jsx`
- CORS configurado no backend para `http://localhost:5173`

## Comandos úteis

```powershell
# Backend — compilar sem rodar
cd expense-tracker-backend && mvn package -DskipTests

# Frontend — build de produção
cd expense-tracker-frontend && npm run build

# Frontend — instalar dependências
cd expense-tracker-frontend && npm install
```
## Boas práticas
Think Before Coding: State assumptions, ask to clarify, and push back on unnecessary work;Simplicity First: Write minimal code; avoid speculation;
Surgical Changes: Modify only necessary code; avoid unrequested refactoring;
Goal-Driven Execution: Define success criteria and iterate until verified;
Model Judgment: Use the AI for reasoning, not deterministic calculations;
Token Budgets: Adhere strictly to limits (4k per task, 30k per session);
Surface Conflicts: Explicitly handle, rather than ignore, contradictions in coding patterns;Read Before Writing: Analyze existing file context (exports, callers) first;
Intent-Based Testing: Write tests that document the "why" of the behavior;
Checkpoints: Summarize progress in long-running tasks;
Match Conventions: Follow existing project style guides;
Fail Loud: Stop and request input if unsure.