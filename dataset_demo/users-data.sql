-- Insert data into users table
INSERT INTO users (username, password_hash, email, phone, role, status, created_at, updated_at) VALUES
('admin123', '$2a$10$vCXQJBMNIRgxSF9YYl2NVO3A4hNXoOYJa2Q5RNw8QiGBNn0RmI5Fa', 'admin@clinic.com', '+6012345678', 'admin', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('drjohnsmith', '$2a$10$NPzMZSUJ3LG8K1WVeiIb.ODvUKM.MFUwp6X5U1.x5Z1CHvbQCjrAK', 'john.smith@clinic.com', '+6012345679', 'doctor', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('drsarahjohnson', '$2a$10$JpZWBP7k6mA9G3HRqI.Dg.ZGc8.m1kO7uEP4ZJnO9YWQQyB2Q5iCG', 'sarah.johnson@clinic.com', '+6012345680', 'doctor', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('drbrandon', '$2a$10$lKjPEfXJ2Z7ZvJ6Z8VjP3eMAO4vZ6JE1QGQ3eJG81YGQ4eJtv4Bfm', 'brandon@clinic.com', '+6012345681', 'doctor', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('patient001', '$2a$10$8bF6Y7kZ5jZJ5L3YXQEfV.MtL6L4tZB.FyD.GK1vVIl2QZ2TRLw0C', 'patient1@email.com', '+6012345682', 'patient', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('patient002', '$2a$10$H9JF4ZvZdSvF.T4PqZlZIemcXa4JKFGgvX05MLEQZNVHvfP3cVg5a', 'patient2@email.com', '+6012345683', 'patient', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('patient003', '$2a$10$u8wZGLFj.7HH.KcE4JiKhe6ZfVHjEhbPn8OLm5YQJnELxYfJJKU3m', 'patient3@email.com', '+6012345684', 'patient', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('patient004', '$2a$10$4kIYj4Y8Rl.R4KHEZzXWE.Ht5jUAxcYvq.5RmDLjSqnQ3MZKfuZP2', 'patient4@email.com', '+6012345685', 'patient', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('patient005', '$2a$10$wLDUaJDM.T4kHdqZd.GNI.XqeYzs5v1nNGV.Y5P.8LfbYvhwxRRc6', 'patient5@email.com', '+6012345686', 'patient', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
