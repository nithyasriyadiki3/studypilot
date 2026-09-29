-- =========================================================
-- Optional starter curriculum catalog.
-- This is reference content (like a course catalog), not fake
-- user/test data — every user's own progress, quizzes, plans,
-- and AI sessions are created fresh through the real app APIs.
-- Safe to edit/extend/replace with your own subjects.
-- =========================================================
USE studypilot_ai;

INSERT INTO subjects (name, description, icon, color) VALUES
('Data Structures & Algorithms', 'Core CS fundamentals for problem solving and interviews', 'Binary', '#6366F1'),
('System Design', 'Designing scalable, reliable distributed systems', 'Network', '#22D3EE'),
('Web Development', 'Modern full-stack web engineering', 'Code2', '#F59E0B'),
('Database Management', 'Relational and NoSQL database concepts', 'Database', '#34D399'),
('Machine Learning', 'Statistical learning and applied ML', 'BrainCircuit', '#FB7185');

INSERT INTO topics (subject_id, name, description, difficulty, estimated_minutes, order_index) VALUES
(1, 'Arrays & Strings', 'Manipulating linear data structures, two-pointer and sliding window techniques', 'beginner', 45, 1),
(1, 'Linked Lists', 'Singly/doubly linked lists, cycle detection, reversal patterns', 'beginner', 40, 2),
(1, 'Stacks & Queues', 'LIFO/FIFO structures and monotonic stack patterns', 'beginner', 35, 3),
(1, 'Trees & Binary Search Trees', 'Traversals, balancing, BST operations', 'intermediate', 60, 4),
(1, 'Graphs', 'BFS/DFS, topological sort, shortest paths', 'intermediate', 70, 5),
(1, 'Dynamic Programming', 'Memoization, tabulation, classic DP patterns', 'advanced', 90, 6),
(1, 'Sorting & Searching', 'Comparison sorts, binary search variants', 'beginner', 40, 7),
(1, 'Heaps & Priority Queues', 'Heap operations and top-k problems', 'intermediate', 45, 8),

(2, 'Scalability Fundamentals', 'Horizontal vs vertical scaling, load balancing', 'beginner', 40, 1),
(2, 'Caching Strategies', 'Cache-aside, write-through, CDN, Redis patterns', 'intermediate', 45, 2),
(2, 'Database Sharding', 'Partitioning strategies for large-scale data', 'advanced', 60, 3),
(2, 'Message Queues', 'Async processing with Kafka/RabbitMQ', 'intermediate', 50, 4),
(2, 'Designing a URL Shortener', 'End-to-end case study of a classic system design problem', 'intermediate', 60, 5),

(3, 'React Fundamentals', 'Components, hooks, state management', 'beginner', 50, 1),
(3, 'REST API Design', 'Resource modeling, status codes, versioning', 'beginner', 40, 2),
(3, 'Authentication & Security', 'JWT, OAuth, sessions, common vulnerabilities', 'intermediate', 55, 3),
(3, 'State Management at Scale', 'Context, Redux, and server-state caching', 'intermediate', 45, 4),

(4, 'SQL Fundamentals', 'Joins, aggregation, subqueries', 'beginner', 40, 1),
(4, 'Database Normalization', '1NF–3NF, denormalization tradeoffs', 'intermediate', 45, 2),
(4, 'Indexing & Query Optimization', 'B-trees, query plans, performance tuning', 'advanced', 55, 3),
(4, 'NoSQL Concepts', 'Document, key-value, and wide-column stores', 'intermediate', 45, 4),

(5, 'Linear & Logistic Regression', 'Foundational supervised learning models', 'beginner', 50, 1),
(5, 'Decision Trees & Ensembles', 'Random forests, boosting', 'intermediate', 55, 2),
(5, 'Neural Network Basics', 'Perceptrons, backpropagation, activation functions', 'intermediate', 60, 3),
(5, 'Model Evaluation', 'Precision, recall, cross-validation, overfitting', 'beginner', 40, 4);
