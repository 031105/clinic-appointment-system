-- Insert data into notifications table
INSERT INTO notifications (user_id, title, message, type, data, is_read, created_at) VALUES
-- Patient notifications
(15, 'Appointment Confirmation', 'Your appointment with Dr. John Smith has been confirmed for June 16, 2023 at 9:30 AM. Please arrive 15 minutes early.', 'appointment', '{"appointment_id": 1, "doctor_name": "John Smith"}', FALSE, CURRENT_TIMESTAMP),
(16, 'Appointment Confirmation', 'Your appointment with Dr. Sarah Johnson has been confirmed for June 18, 2023 at 10:15 AM. Please arrive 15 minutes early.', 'appointment', '{"appointment_id": 3, "doctor_name": "Sarah Johnson"}', TRUE, CURRENT_TIMESTAMP),
(17, 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Michael Chen tomorrow at 1:00 PM.', 'reminder', '{"appointment_id": 5, "doctor_name": "Michael Chen"}', FALSE, CURRENT_TIMESTAMP),
(18, 'Prescription Ready', 'Your prescription for Hydrocortisone cream 1% is ready for pickup at the clinic pharmacy.', 'system', '{"prescription_id": 4}', FALSE, CURRENT_TIMESTAMP),
(19, 'Medical Results Available', 'Your lab results from your recent appointment are now available. Please check your health portal.', 'system', '{"record_id": 5}', TRUE, CURRENT_TIMESTAMP),
(20, 'Appointment Rescheduled', 'Your appointment with Dr. John Smith has been rescheduled to June 20, 2023 at 10:30 AM.', 'appointment', '{"appointment_id": 10, "doctor_name": "John Smith"}', FALSE, CURRENT_TIMESTAMP),
(21, 'New Message from Doctor', 'You have a new message from Dr. James Carter regarding your recent appointment.', 'message', '{"sender_id": 11, "sender_name": "Dr. James Carter"}', FALSE, CURRENT_TIMESTAMP),
(22, 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Emily Rodriguez tomorrow at 10:30 AM.', 'reminder', '{"appointment_id": 12, "doctor_name": "Emily Rodriguez"}', TRUE, CURRENT_TIMESTAMP),
(23, 'Prescription Renewal', 'Your prescription for Triamcinolone cream 0.1% needs renewal. Please contact your doctor.', 'system', '{"prescription_id": 10}', FALSE, CURRENT_TIMESTAMP),
(24, 'Appointment Canceled', 'Your appointment with Dr. Lisa Cohen on June 5, 2023 has been canceled. Please call to reschedule.', 'appointment', '{"appointment_id": 16, "doctor_name": "Lisa Cohen"}', TRUE, CURRENT_TIMESTAMP),

-- Doctor notifications
(3, 'New Appointment', 'New appointment scheduled with Emma Wilson on June 15, 2023 at 9:00 AM.', 'appointment', '{"appointment_id": 1, "patient_name": "Emma Wilson"}', TRUE, CURRENT_TIMESTAMP),
(4, 'New Appointment', 'New appointment scheduled with Noah Martinez on June 18, 2023 at 10:15 AM.', 'appointment', '{"appointment_id": 3, "patient_name": "Noah Martinez"}', FALSE, CURRENT_TIMESTAMP),
(5, 'Patient Message', 'New message from patient Sophia Lee regarding recent prescription.', 'message', '{"sender_id": 17, "sender_name": "Sophia Lee"}', FALSE, CURRENT_TIMESTAMP),
(6, 'Appointment Canceled', 'Appointment with Liam Taylor on June 25, 2023 has been canceled by the patient.', 'appointment', '{"appointment_id": 6, "patient_name": "Liam Taylor"}', TRUE, CURRENT_TIMESTAMP),
(7, 'Lab Results', 'Lab results available for patient Olivia Anderson from recent blood work.', 'system', '{"patient_id": 19, "record_id": 5}', FALSE, CURRENT_TIMESTAMP),
(8, 'Appointment Reminder', 'You have 5 appointments scheduled for tomorrow.', 'reminder', '{"date": "2023-06-15", "count": 5}', TRUE, CURRENT_TIMESTAMP),
(9, 'System Update', 'The clinic system will be undergoing maintenance tonight from 2 AM to 4 AM.', 'system', '{"maintenance_id": 1}', FALSE, CURRENT_TIMESTAMP),
(10, 'Meeting Reminder', 'Department meeting scheduled for tomorrow at 8:00 AM in Conference Room A.', 'reminder', '{"meeting_id": 3}', TRUE, CURRENT_TIMESTAMP),
(11, 'New Patient Referral', 'You have received a new patient referral from Dr. Lisa Cohen.', 'system', '{"referral_id": 7, "referrer_name": "Dr. Lisa Cohen"}', FALSE, CURRENT_TIMESTAMP),
(12, 'Prescription Request', 'Patient William Thomas has requested a prescription renewal.', 'system', '{"patient_id": 20, "prescription_id": 12}', TRUE, CURRENT_TIMESTAMP);

-- Insert data into notification_preferences table
INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, reminder_timing, preferences) VALUES
(15, TRUE, TRUE, TRUE, 24, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": true}'),
(16, TRUE, FALSE, TRUE, 48, '{"appointment_reminders": true, "lab_results": false, "prescription_updates": true}'),
(17, TRUE, TRUE, FALSE, 24, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": false}'),
(18, FALSE, TRUE, TRUE, 12, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": true}'),
(19, TRUE, TRUE, TRUE, 24, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": true}'),
(20, TRUE, FALSE, FALSE, 48, '{"appointment_reminders": true, "lab_results": false, "prescription_updates": false}'),
(21, FALSE, TRUE, TRUE, 24, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": true}'),
(22, TRUE, TRUE, FALSE, 24, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": false}'),
(23, TRUE, FALSE, TRUE, 48, '{"appointment_reminders": true, "lab_results": false, "prescription_updates": true}'),
(24, FALSE, TRUE, TRUE, 12, '{"appointment_reminders": true, "lab_results": true, "prescription_updates": true}'),
(3, TRUE, TRUE, TRUE, 24, '{"appointment_reminders": true, "patient_messages": true, "system_updates": true}'),
(4, TRUE, TRUE, FALSE, 12, '{"appointment_reminders": true, "patient_messages": true, "system_updates": false}'),
(5, TRUE, FALSE, TRUE, 24, '{"appointment_reminders": true, "patient_messages": false, "system_updates": true}'),
(6, FALSE, TRUE, TRUE, 48, '{"appointment_reminders": true, "patient_messages": true, "system_updates": true}'),
(7, TRUE, TRUE, TRUE, 24, '{"appointment_reminders": true, "patient_messages": true, "system_updates": true}'),
(8, TRUE, FALSE, FALSE, 12, '{"appointment_reminders": true, "patient_messages": false, "system_updates": false}'),
(9, FALSE, TRUE, TRUE, 24, '{"appointment_reminders": true, "patient_messages": true, "system_updates": true}'),
(10, TRUE, TRUE, FALSE, 24, '{"appointment_reminders": true, "patient_messages": true, "system_updates": false}'),
(11, TRUE, FALSE, TRUE, 12, '{"appointment_reminders": true, "patient_messages": false, "system_updates": true}'),
(12, FALSE, TRUE, TRUE, 48, '{"appointment_reminders": true, "patient_messages": true, "system_updates": true}'); 