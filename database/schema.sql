CREATE TYPE user_role AS ENUM ('admin', 'student');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY DEFAULT,
  mail VARCHAR(255) NOT NULL UNIQUE,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  role user_role NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY DEFAULT,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY DEFAULT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_hour_start TIMESTAMP NOT NULL,
  date_hour_end TIMESTAMP NOT NULL,
  course_id INT NOT NULL,
  CHECK (date_hour_end > date_hour_start),
  CONSTRAINT fk_exams_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY DEFAULT,
  statement TEXT NOT NULL,
  exam_id INT NOT NULL,
  UNIQUE (id, exam_id),
  CONSTRAINT fk_questions_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS choices (
  id SERIAL PRIMARY KEY DEFAULT,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  question_id INT NOT NULL,
  UNIQUE (id, question_id),
  CONSTRAINT fk_choices_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY DEFAULT,
  submitted_at TIMESTAMP NOT NULL DEFAULT now(),
  score INT NOT NULL,
  exam_id INT NOT NULL,
  user_id INT NOT NULL,
  UNIQUE (exam_id, user_id),
  UNIQUE (id, exam_id),
  CONSTRAINT fk_attempts_exam
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE RESTRICT,
  CONSTRAINT fk_attempts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY DEFAULT,
  attempt_id INT NOT NULL,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  choice_id INT,
  UNIQUE (attempt_id, question_id),
  CONSTRAINT fk_answers_attempt
    FOREIGN KEY (attempt_id, exam_id) REFERENCES attempts(id, exam_id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id, exam_id) REFERENCES questions(id, exam_id) ON DELETE RESTRICT,
  CONSTRAINT fk_answers_choice
    FOREIGN KEY (choice_id, question_id) REFERENCES choices(id, question_id) ON DELETE RESTRICT
);

CREATE TABLE refresh_tokens (
    id            BIGSERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id     UUID NOT NULL,
    token_hash    CHAR(64) NOT NULL UNIQUE,
    issued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at    TIMESTAMPTZ NOT NULL,
    revoked_at    TIMESTAMPTZ,
    revoked_reason TEXT,
    replaced_by   BIGINT REFERENCES refresh_tokens(id),
    user_agent    TEXT,
    ip_address    INET
);

CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_choices_one_correct_per_question
  ON choices(question_id) WHERE is_correct = true;
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_choices_question_id ON choices(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);