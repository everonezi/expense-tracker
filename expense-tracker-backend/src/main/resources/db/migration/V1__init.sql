CREATE TABLE families (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    family_id BIGINT REFERENCES families(id)
);

CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    family_id BIGINT NOT NULL REFERENCES families(id)
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    family_id BIGINT REFERENCES families(id)
);

CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    family_id BIGINT NOT NULL REFERENCES families(id),
    limit_amount DECIMAL(15,2) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    UNIQUE (family_id, category_id, month, year)
);

CREATE TABLE recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    account_id BIGINT NOT NULL REFERENCES accounts(id),
    family_id BIGINT NOT NULL REFERENCES families(id),
    day_of_month INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(500),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    account_id BIGINT NOT NULL REFERENCES accounts(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    family_id BIGINT NOT NULL REFERENCES families(id),
    recurring_transaction_id BIGINT REFERENCES recurring_transactions(id)
);

INSERT INTO categories (name, icon, type, is_default) VALUES
('Alimentação',  'restaurant',     'EXPENSE', TRUE),
('Transporte',   'directions_car', 'EXPENSE', TRUE),
('Saúde',        'local_hospital', 'EXPENSE', TRUE),
('Moradia',      'home',           'EXPENSE', TRUE),
('Educação',     'school',         'EXPENSE', TRUE),
('Lazer',        'sports_esports', 'EXPENSE', TRUE),
('Roupas',       'checkroom',      'EXPENSE', TRUE),
('Outros',       'more_horiz',     'EXPENSE', TRUE),
('Salário',      'payments',       'INCOME',  TRUE),
('Freelance',    'work',           'INCOME',  TRUE),
('Outras rendas','add_circle',     'INCOME',  TRUE);
