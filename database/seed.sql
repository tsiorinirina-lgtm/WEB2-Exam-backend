INSERT INTO users (mail, firstname, lastname, password, is_active, role)
VALUES (
  'admin@examhub.local',
  'Admin',
  'User',
  '$2b$10$.xXj/BfySqy8prqiYyUbr.psCaZpIuFHZGwoWeCxjRnymfwVWV9by',
  true,
  'admin'
);

INSERT INTO users (mail, firstname, lastname, password, is_active, role)
VALUES (
  'student@examhub.local',
  'Jane',
  'Doe',
  '$2b$10$r.kEQNv7XqfiewpOwYXj7uXuH5lCGaNu74A5RJcFEcKRIJxGcl7hO',
  true,
  'student'
);

INSERT INTO courses (code, name, description)
VALUES ('PROG2', 'Programmation 2', 'Introduction to object-oriented programming');

WITH course AS (
  SELECT id FROM courses WHERE code = 'PROG2'
)
INSERT INTO exams (title, description, date_hour_start, date_hour_end, course_id)
SELECT
  'Midterm Quiz',
  'Covers chapters 1 to 4',
  now() - INTERVAL '2 hour',
  now() + INTERVAL '4 hours',
  course.id
FROM course;

WITH exam AS (
  SELECT id FROM exams WHERE title = 'Midterm Quiz'
),
q1 AS (
  INSERT INTO questions (statement, exam_id)
  SELECT 'What does OOP stand for?', exam.id FROM exam
  RETURNING id
),
q2 AS (
  INSERT INTO questions (statement, exam_id)
  SELECT 'Which keyword is used to inherit a class in Java?', exam.id FROM exam
  RETURNING id
)
INSERT INTO choices (label, is_correct, question_id)
SELECT * FROM (
  VALUES
    ('Object-Oriented Programming', true,  (SELECT id FROM q1)),
    ('Order Of Precedence',         false, (SELECT id FROM q1)),
    ('Open Operation Protocol',     false, (SELECT id FROM q1)),
    ('extends',                     true,  (SELECT id FROM q2)),
    ('implements',                  false, (SELECT id FROM q2)),
    ('inherits',                    false, (SELECT id FROM q2))
) AS choices_data(label, is_correct, question_id);