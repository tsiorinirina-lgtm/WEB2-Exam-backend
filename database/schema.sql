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

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_hour_start TIMESTAMP NOT NULL,
  date_hour_end TIMESTAMP NOT NULL,
  course_id UUID NOT NULL,
  CHECK (date_hour_end > date_hour_start),
  CONSTRAINT fk_exams_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);