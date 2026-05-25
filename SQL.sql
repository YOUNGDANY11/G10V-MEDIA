CREATE TABLE roles(
    id_role SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL
);

CREATE TABLE users(
    id_user BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    document VARCHAR(10) NOT NULL,
    id_role INT NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE weeks(
    id_week SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    delivery_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT weeks_valid_window CHECK (end_time > start_time)
);

CREATE TABLE media(
    id_media BIGSERIAL PRIMARY KEY,
    id_user BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE ON UPDATE CASCADE,
    id_week INT NOT NULL REFERENCES weeks(id_week) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(100),
    document text NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trainings(
    id_training BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendances(
    id_attendance BIGSERIAL PRIMARY KEY,
    id_user BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE ON UPDATE CASCADE,
    id_training BIGINT NOT NULL REFERENCES trainings(id_training) ON DELETE CASCADE ON UPDATE CASCADE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_resets (
    id_reset SERIAL PRIMARY KEY,
    id_user BIGINT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE ON UPDATE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INSERCIONES --
INSERT INTO roles (id_role, name, code) VALUES 
(1, 'Admin', 'ADM'),
(2, 'Deportista', 'DEP');

ALTER DATABASE railway SET timezone TO 'America/Bogota';