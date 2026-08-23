CREATE TYPE user_role AS ENUM ('admin', 'student');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mail VARCHAR(255) NOT NULL UNIQUE,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  role user_role NOT NULL
);