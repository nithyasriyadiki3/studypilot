-- =========================================================
-- StudyPilot AI — MySQL Schema
-- Run: mysql -u root -p < schema.sql
-- =========================================================

CREATE DATABASE IF NOT EXISTS studypilot_ai
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE studypilot_ai;

-- ---------------------------------------------------------
-- USERS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  avatar_url      VARCHAR(500) DEFAULT NULL,
  theme           ENUM('light','dark','system') DEFAULT 'system',
  role            ENUM('student','admin') DEFAULT 'student',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- REFRESH TOKENS (rotation / logout-all support)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,
  expires_at    DATETIME NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- LEARNING PROFILE (per user, drives adaptive engine)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_profiles (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL UNIQUE,
  education_level       VARCHAR(80) DEFAULT NULL,
  primary_goal          VARCHAR(255) DEFAULT NULL,
  target_role           VARCHAR(150) DEFAULT NULL,
  daily_study_minutes   INT DEFAULT 30,
  preferred_subjects    JSON DEFAULT NULL,
  learning_style        ENUM('visual','reading','practice','mixed') DEFAULT 'mixed',
  timezone              VARCHAR(60) DEFAULT 'UTC',
  streak_count          INT DEFAULT 0,
  longest_streak        INT DEFAULT 0,
  last_active_date      DATE DEFAULT NULL,
  xp_points             INT DEFAULT 0,
  level                 INT DEFAULT 1,
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- SUBJECTS & TOPICS (curriculum catalog)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  description   VARCHAR(500) DEFAULT NULL,
  icon          VARCHAR(60) DEFAULT 'BookOpen',
  color         VARCHAR(30) DEFAULT '#6366F1',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topics (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  subject_id        INT NOT NULL,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  difficulty        ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  estimated_minutes INT DEFAULT 30,
  prerequisites     JSON DEFAULT NULL,
  order_index       INT DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- USER PROGRESS PER TOPIC (drives weak/strong + roadmap)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_topic_progress (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  topic_id          INT NOT NULL,
  status            ENUM('not_started','in_progress','completed','needs_revision') DEFAULT 'not_started',
  mastery_score     DECIMAL(5,2) DEFAULT 0.00,
  attempts_count    INT DEFAULT 0,
  strength          ENUM('weak','average','strong') DEFAULT 'average',
  last_practiced_at DATETIME DEFAULT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_topic (user_id, topic_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- AI-GENERATED LEARNING PATHS / ROADMAPS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_paths (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  ai_summary    TEXT,
  roadmap_json  JSON NOT NULL,
  status        ENUM('active','archived') DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- DEEP LEARNING MODE SESSIONS (Learn/Practice/Problem/Interview/CaseStudy)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_sessions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  topic_id        INT DEFAULT NULL,
  mode            ENUM('learn','practice','problem_solving','interview','case_study') NOT NULL,
  prompt          TEXT NOT NULL,
  ai_response     LONGTEXT,
  duration_seconds INT DEFAULT 0,
  rating          TINYINT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- QUIZZES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  topic_id        INT DEFAULT NULL,
  title           VARCHAR(255) NOT NULL,
  difficulty      ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  total_questions INT DEFAULT 0,
  source          ENUM('ai_generated','manual') DEFAULT 'ai_generated',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id         INT NOT NULL,
  question_text   TEXT NOT NULL,
  options         JSON NOT NULL,
  correct_answer  VARCHAR(500) NOT NULL,
  explanation     TEXT,
  order_index     INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id           INT NOT NULL,
  user_id           INT NOT NULL,
  score             INT DEFAULT 0,
  total             INT DEFAULT 0,
  time_taken_seconds INT DEFAULT 0,
  answers           JSON,
  completed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- STUDY PLANNER
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  goal        VARCHAR(500),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS study_tasks (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  plan_id           INT DEFAULT NULL,
  user_id           INT NOT NULL,
  topic_id          INT DEFAULT NULL,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  scheduled_date    DATE NOT NULL,
  duration_minutes  INT DEFAULT 30,
  status            ENUM('pending','in_progress','completed','skipped') DEFAULT 'pending',
  priority          ENUM('low','medium','high') DEFAULT 'medium',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- REVISION PLANNER (spaced repetition)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS revision_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  topic_id          INT DEFAULT NULL,
  title             VARCHAR(255) NOT NULL,
  notes             TEXT,
  next_review_date  DATE NOT NULL,
  interval_days     INT DEFAULT 1,
  ease_factor       DECIMAL(4,2) DEFAULT 2.50,
  repetitions       INT DEFAULT 0,
  last_reviewed_at  DATETIME DEFAULT NULL,
  status            ENUM('active','archived') DEFAULT 'active',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        ENUM('streak','reminder','achievement','revision','system','quiz') DEFAULT 'system',
  title       VARCHAR(255) NOT NULL,
  message     VARCHAR(500) NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  action_url  VARCHAR(300) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ACTIVITY LOG (powers analytics: time spent, xp over time)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  activity_type ENUM('learn','practice','problem_solving','interview','case_study','quiz','revision','task') NOT NULL,
  minutes_spent INT DEFAULT 0,
  xp_earned     INT DEFAULT 0,
  reference_id  INT DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for analytics/query performance
CREATE INDEX idx_activity_user_date ON activity_logs(user_id, created_at);
CREATE INDEX idx_progress_user ON user_topic_progress(user_id, strength);
CREATE INDEX idx_tasks_user_date ON study_tasks(user_id, scheduled_date);
CREATE INDEX idx_revision_user_date ON revision_items(user_id, next_review_date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
