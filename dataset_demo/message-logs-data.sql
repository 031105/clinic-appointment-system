-- Insert data into message_logs table
INSERT INTO message_logs (recipient_id, message_type, subject, content, status, sent_at, created_at) VALUES
(5, 'email', 'Appointment Confirmation', 'Your appointment with Dr. John Smith has been confirmed for June 16, 2025 at 9:30 AM. Please arrive 15 minutes early to complete any necessary paperwork.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'email', 'Appointment Confirmation', 'Your appointment with Dr. John Smith has been confirmed for June 18, 2025 at 10:15 AM. Please arrive 15 minutes early.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'email', 'Appointment Request', 'Your appointment request with Dr. Sarah Johnson for June 17, 2025 at 11:00 AM is pending confirmation. We will notify you once it is confirmed.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'sms', 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Brandon Lee tomorrow at 9:45 AM. Reply Y to confirm.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'email', 'Appointment Confirmation', 'Your appointment with Dr. Sarah Johnson has been confirmed for June 19, 2025 at 10:30 AM.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'sms', 'Appointment Request', 'Your appointment request with Dr. Brandon Lee for June 18, 2025 at 3:00 PM is pending confirmation.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'email', 'Appointment Cancellation', 'Your appointment with Dr. Sarah Johnson for June 19, 2025 at 4:00 PM has been cancelled as requested.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'email', 'Appointment Confirmation', 'Your appointment with Dr. John Smith has been confirmed for June 20, 2025 at 3:45 PM.', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'email', 'Prescription Ready', 'Your prescription for Lisinopril 10mg is ready for pickup at the clinic pharmacy.', 'pending', NULL, CURRENT_TIMESTAMP),
(8, 'sms', 'Appointment Follow-up', 'How are you feeling after your dental procedure? Please let us know if you have any concerns.', 'failed', NULL, CURRENT_TIMESTAMP);
