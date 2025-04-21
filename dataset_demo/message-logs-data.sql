-- Insert data into message_logs table
INSERT INTO message_logs (recipient_id, message_type, subject, content, status, sent_at, created_at) VALUES
-- Appointment Confirmations
(21, 'email', 'Appointment Confirmation', 'Your appointment with Dr. John Smith has been confirmed for June 16, 2025 at 9:30 AM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'email', 'Appointment Confirmation', 'Your appointment with Dr. John Smith has been confirmed for June 18, 2025 at 10:15 AM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'email', 'Appointment Confirmation', 'Your appointment with Dr. James Wilson has been confirmed for June 19, 2025 at 3:00 PM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'email', 'Appointment Confirmation', 'Your appointment with Dr. Kimberly Novak has been confirmed for June 20, 2025 at 9:30 AM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 'email', 'Appointment Confirmation', 'Your appointment with Dr. Sarah Johnson has been confirmed for June 16, 2025 at 11:00 AM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'email', 'Appointment Confirmation', 'Your appointment with Dr. Brandon Lee has been confirmed for June 18, 2025 at 3:00 PM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Appointment Reminders
(21, 'sms', 'Appointment Reminder', 'Reminder: You have an appointment with Dr. John Smith tomorrow at 9:30 AM. Reply Y to confirm.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'sms', 'Appointment Reminder', 'Reminder: You have an appointment with Dr. John Smith tomorrow at 10:15 AM. Reply Y to confirm.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'sms', 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Emily Wong tomorrow at 10:30 AM. Reply Y to confirm.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'sms', 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Sophia Kumar tomorrow at 10:30 AM. Reply Y to confirm.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Pending Appointment Notifications
(23, 'email', 'Appointment Request', 'Your appointment request with Dr. Robert Chen for June 17, 2025 at 10:30 AM is pending confirmation. We will notify you once it is confirmed.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 'email', 'Appointment Request', 'Your appointment request with Dr. Abigail Wong for June 20, 2025 at 10:30 AM is pending confirmation. We will notify you once it is confirmed.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'email', 'Appointment Request', 'Your appointment request with Dr. Michael Ahmad for June 22, 2025 at 2:30 PM is pending confirmation. We will notify you once it is confirmed.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'email', 'Appointment Request', 'Your appointment request with Dr. Ethan Patel for June 19, 2025 at 4:00 PM is pending confirmation. We will notify you once it is confirmed.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 'email', 'Appointment Request', 'Your appointment request with Dr. Brandon Lee for June 20, 2025 at 11:00 AM is pending confirmation. We will notify you once it is confirmed.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Prescription Notifications
(21, 'email', 'Prescription Ready', 'Your prescription for Lisinopril 10mg is ready for pickup at the clinic pharmacy.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'email', 'Prescription Ready', 'Your prescription for Aspirin 81mg and Atorvastatin 20mg is ready for pickup at the clinic pharmacy.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'email', 'Prescription Ready', 'Your prescription for Tretinoin 0.025% cream is ready for pickup at the clinic pharmacy.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'email', 'Prescription Ready', 'Your prescription for Ketoconazole 2% shampoo is ready for pickup at the clinic pharmacy.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Follow-up Notifications
(21, 'sms', 'Appointment Follow-up', 'How are you feeling after your appointment? Please let us know if you have any questions or concerns.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'sms', 'Appointment Follow-up', 'How are you doing after your recent appointment? Please let us know if you have any questions or concerns.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'sms', 'Appointment Follow-up', 'How is your skin condition after starting the new treatment? Please let us know if you have any questions or concerns.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(25, 'sms', 'Appointment Follow-up', 'How is your treatment progressing? Please let us know if you have any questions or concerns.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);