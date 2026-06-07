# Gerenciador de Gastos Familiar

Aplicação full-stack para controle de finanças familiares. Permite registrar receitas e despesas, acompanhar orçamentos por categoria, visualizar resumos mensais com gráficos e gerenciar múltiplos membros em uma mesma família.

## Tecnologias

**Backend**

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=flat&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-CC0200?style=flat&logo=flyway&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=jsonwebtokens&logoColor=white)

**Frontend**

![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI_v6-007FFF?style=flat&logo=mui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat)

---

## Funcionalidades

- **Autenticação JWT** — registro, login e sessões stateless
- **Controle por família** — dados isolados por grupo familiar; roles `ADMIN` e `MEMBER`
- **Contas bancárias** — corrente, poupança, cartão de crédito e outros tipos
- **Transações** — receitas e despesas com categoria, conta e data
- **Transações recorrentes** — lançamentos automáticos por dia do mês
- **Orçamentos mensais** — limite por categoria com acompanhamento de progresso
- **Categorias personalizadas** — além das categorias padrão do sistema
- **Dashboard** — resumo mensal, gráficos de gastos por categoria e evolução ao longo do tempo

---

## Estrutura do projeto

```
expense-tracker/
├── expense-tracker-backend/       # API REST — Spring Boot
│   ├── src/main/java/com/family/expenses/
│   │   ├── controller/            # Endpoints REST
│   │   ├── service/               # Regras de negócio
│   │   ├── repository/            # Spring Data JPA
│   │   ├── entity/                # Entidades JPA
│   │   ├── dto/                   # Request / Response objects
│   │   ├── enums/                 # AccountType, TransactionType, Role...
│   │   ├── security/              # JWT filter, UserDetailsService
│   │   ├── config/                # SecurityConfig
│   │   └── exception/             # GlobalExceptionHandler
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/          # Flyway (V1__init.sql)
│
└── expense-tracker-frontend/      # SPA — React + Vite
    └── src/
        ├── api/client.js          # Axios com interceptor JWT
        ├── contexts/AuthContext   # Estado global de autenticação
        ├── components/            # Layout, PrivateRoute
        └── pages/                 # Dashboard, Transactions, Accounts...
```

---

## Pré-requisitos

- Java 21+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 15+

---

## Configuração

### Banco de dados

Crie o banco antes de rodar o backend:

```sql
CREATE DATABASE expenses_db;
```

### Variáveis do backend

Edite `expense-tracker-backend/src/main/resources/application.yml` com suas credenciais:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/expenses_db
    username: seu_usuario
    password: sua_senha

application:
  security:
    jwt:
      secret-key: sua_chave_secreta_base64
      expiration: 86400000  # 24h em ms
```

> O Flyway aplica as migrações automaticamente na primeira execução.

---

## Como rodar

### Backend

```bash
cd expense-tracker-backend
./mvnw spring-boot:run
```

API disponível em `http://localhost:8080`.

### Frontend

```bash
cd expense-tracker-frontend
npm install
npm run dev
```

App disponível em `http://localhost:5173`.

---

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Criar conta e família |
| `POST` | `/api/auth/login` | Autenticar e obter JWT |
| `GET` | `/api/dashboard` | Resumo mensal |
| `GET/POST` | `/api/transactions` | Listar / criar transações |
| `GET/POST` | `/api/accounts` | Listar / criar contas |
| `GET/POST` | `/api/categories` | Listar / criar categorias |
| `GET/POST` | `/api/budgets` | Listar / criar orçamentos |
| `GET/POST` | `/api/recurring-transactions` | Transações recorrentes |

Todas as rotas (exceto `/api/auth/**`) exigem o header:

```
Authorization: Bearer <token>
```

---

## Modelo de dados

```
Family
 └── User (ADMIN | MEMBER)
      └── Transaction → Account, Category
           
Family
 ├── Account (CHECKING, SAVINGS, CREDIT_CARD, INVESTMENT, CASH)
 ├── Category (padrão do sistema + personalizadas por família)
 ├── Budget (limite mensal por categoria)
 └── RecurringTransaction (dia do mês de referência)
```

**Categorias padrão incluídas:**

| Tipo | Categorias |
|------|-----------|
| Despesa | Alimentação, Transporte, Saúde, Moradia, Educação, Lazer, Roupas, Outros |
| Receita | Salário, Freelance, Outras rendas |

---

## Build de produção

```bash
# Backend — gera o JAR em target/
cd expense-tracker-backend
./mvnw package -DskipTests

# Frontend — gera os estáticos em dist/
cd expense-tracker-frontend
npm run build
```
