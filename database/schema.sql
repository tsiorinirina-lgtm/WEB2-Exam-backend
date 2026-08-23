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

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement TEXT NOT NULL,
  exam_id UUID NOT NULL,
  CONSTRAINT fk_questions_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  question_id UUID NOT NULL,
  CONSTRAINT fk_choices_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMP NOT NULL DEFAULT now(),
  score INT NOT NULL,
  exam_id UUID NOT NULL,
  user_id UUID NOT NULL,
  UNIQUE (exam_id, user_id),
  CONSTRAINT fk_attempts_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);