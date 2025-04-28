'use client';

import React, { useState, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core'; // Import EventClickArg

// --- Define Interfaces ---
interface Appointment {
  id: number;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  department: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
}

interface DepartmentOption {
    id: string;
    name: string;
}

interface StatusOption {
    id: string;
    name: string;
}

interface Doctor {
    id: string;
    name: string;
    department: string;
}

interface Patient {
    id: string;
    name: string;
}

// --- Component Start ---

// Temporary appointment data
const tempAppointments: Appointment[] = [
  // 牙科部门 (Dentistry) 预约
  {
    id: 1,
    patientName: 'John Smith',
    patientId: '21',
    doctorName: 'Dr. Adam Hall',
    doctorId: '1',
    department: 'Dentistry',
    date: '2025-06-16',
    time: '09:30',
    status: 'confirmed',
    notes: 'Regular checkup for dental condition'
  },
  {
    id: 2,
    patientName: 'Jessica Tan',
    patientId: '22',
    doctorName: 'Dr. Adam Hall',
    doctorId: '1',
    department: 'Dentistry',
    date: '2025-06-18',
    time: '10:15',
    status: 'confirmed',
    notes: 'Follow-up appointment after tooth extraction'
  },
  {
    id: 3,
    patientName: 'Alice Wang',
    patientId: '26',
    doctorName: 'Dr. Linda Chen',
    doctorId: '5',
    department: 'Dentistry',
    date: '2025-06-16',
    time: '09:30', // 同一时间与Dr. Adam Hall有预约
    status: 'confirmed',
    notes: 'Routine teeth cleaning'
  },
  {
    id: 4,
    patientName: 'Mark Johnson',
    patientId: '27',
    doctorName: 'Dr. Linda Chen', 
    doctorId: '5',
    department: 'Dentistry',
    date: '2025-06-16',
    time: '11:00',
    status: 'pending',
    notes: 'New patient consultation'
  },

  // 心脏科 (Cardiology) 预约
  {
    id: 5,
    patientName: 'David Wong',
    patientId: '23',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-17',
    time: '10:30',
    status: 'pending',
    notes: 'Initial consultation for chest pain'
  },
  {
    id: 6,
    patientName: 'Emily Lim',
    patientId: '24',
    doctorName: 'Dr. James Wilson',
    doctorId: '3',
    department: 'Cardiology',
    date: '2025-06-19',
    time: '15:00',
    status: 'confirmed',
    notes: 'Regular cardiology checkup'
  },
  {
    id: 7,
    patientName: 'Jason Ng',
    patientId: '25',
    doctorName: 'Dr. Kimberly Novak',
    doctorId: '4',
    department: 'Cardiology',
    date: '2025-06-20',
    time: '09:30',
    status: 'confirmed',
    notes: 'Heart monitoring appointment'
  },
  {
    id: 8,
    patientName: 'Sarah Li',
    patientId: '28',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-17',
    time: '11:30', // 与Dr. Robert Chen同一天的另一个预约
    status: 'confirmed',
    notes: 'ECG test appointment'
  },
  {
    id: 9,
    patientName: 'Thomas Brown',
    patientId: '29',
    doctorName: 'Dr. James Wilson',
    doctorId: '3',
    department: 'Cardiology',
    date: '2025-06-17',
    time: '10:30', // 与Dr. Robert Chen同一时间但不同医生
    status: 'confirmed',
    notes: 'Heart valve check'
  },

  // 皮肤科 (Dermatology) 预约
  {
    id: 10,
    patientName: 'Michelle Zhang',
    patientId: '30',
    doctorName: 'Dr. Sophia Lee',
    doctorId: '6',
    department: 'Dermatology',
    date: '2025-06-18',
    time: '09:00',
    status: 'confirmed',
    notes: 'Skin condition assessment'
  },
  {
    id: 11,
    patientName: 'Ryan Kim',
    patientId: '31',
    doctorName: 'Dr. Sophia Lee',
    doctorId: '6',
    department: 'Dermatology',
    date: '2025-06-18',
    time: '10:15', // 与Dr. Adam Hall牙科预约同时间
    status: 'confirmed',
    notes: 'Acne treatment follow-up'
  },
  {
    id: 12,
    patientName: 'Daniel Park',
    patientId: '32',
    doctorName: 'Dr. Michael Torres',
    doctorId: '7',
    department: 'Dermatology',
    date: '2025-06-18',
    time: '10:15', // 与Dr. Sophia Lee同时间的不同医生
    status: 'pending',
    notes: 'Eczema consultation'
  },

  // 儿科 (Pediatrics) 预约
  {
    id: 13,
    patientName: 'Emma Wilson',
    patientId: '33',
    doctorName: 'Dr. Jennifer Lopez',
    doctorId: '8',
    department: 'Pediatrics',
    date: '2025-06-19',
    time: '09:30',
    status: 'confirmed',
    notes: 'Regular child checkup'
  },
  {
    id: 14,
    patientName: 'Noah Garcia',
    patientId: '34',
    doctorName: 'Dr. Jennifer Lopez',
    doctorId: '8',
    department: 'Pediatrics',
    date: '2025-06-19',
    time: '10:30',
    status: 'confirmed',
    notes: 'Vaccination appointment'
  },
  {
    id: 15,
    patientName: 'Olivia Smith',
    patientId: '35',
    doctorName: 'Dr. David Rodriguez',
    doctorId: '9',
    department: 'Pediatrics',
    date: '2025-06-19',
    time: '15:00', // 与Dr. James Wilson心脏科预约同时间
    status: 'pending',
    notes: 'Growth development assessment'
  },

  // ===== 新增场景 =====
  
  // 场景1: 医生连续预约（背靠背）
  {
    id: 16,
    patientName: 'Lucas Cooper',
    patientId: '36',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-21',
    time: '09:00',
    status: 'confirmed',
    notes: 'Routine heart checkup'
  },
  {
    id: 17,
    patientName: 'Ava Murphy',
    patientId: '37',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-21',
    time: '09:30', // 紧接着上一个预约
    status: 'confirmed',
    notes: 'Blood pressure monitoring'
  },
  {
    id: 18,
    patientName: 'Ethan Phillips',
    patientId: '38',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-21',
    time: '10:00', // 紧接着上一个预约
    status: 'confirmed',
    notes: 'Discuss test results'
  },
  {
    id: 19,
    patientName: 'Isabella Adams',
    patientId: '39',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-21',
    time: '10:30', // 紧接着上一个预约
    status: 'confirmed',
    notes: 'Follow-up after medication change'
  },
  
  // 场景2: 医生休假时间 (使用取消状态表示)
  {
    id: 20,
    patientName: 'DOCTOR UNAVAILABLE',
    patientId: '00',
    doctorName: 'Dr. Kimberly Novak',
    doctorId: '4',
    department: 'Cardiology',
    date: '2025-06-22',
    time: '09:00',
    status: 'cancelled',
    notes: 'Doctor on vacation'
  },
  
  // 场景3: 不同部门的医生在同一时间预约
  {
    id: 21,
    patientName: 'Jacob Turner',
    patientId: '40',
    doctorName: 'Dr. Adam Hall',
    doctorId: '1',
    department: 'Dentistry',
    date: '2025-06-23',
    time: '14:00',
    status: 'confirmed',
    notes: 'Wisdom tooth consultation'
  },
  {
    id: 22,
    patientName: 'Sofia Martinez',
    patientId: '41',
    doctorName: 'Dr. Jennifer Lopez',
    doctorId: '8',
    department: 'Pediatrics',
    date: '2025-06-23',
    time: '14:00', // 同时间，不同医生，不同部门
    status: 'confirmed',
    notes: 'Annual pediatric checkup'
  },
  {
    id: 23,
    patientName: 'William Scott',
    patientId: '42',
    doctorName: 'Dr. Sophia Lee',
    doctorId: '6',
    department: 'Dermatology',
    date: '2025-06-23',
    time: '14:00', // 同时间，不同医生，不同部门
    status: 'confirmed',
    notes: 'Allergy test for skin rash'
  },
  
  // 场景4: 相同医生在不同部门的预约冲突
  {
    id: 24,
    patientName: 'Charlotte Evans',
    patientId: '43',
    doctorName: 'Dr. James Wilson',
    doctorId: '3',
    department: 'Cardiology',
    date: '2025-06-24',
    time: '11:00',
    status: 'confirmed',
    notes: 'Heart arrhythmia follow-up'
  },
  {
    id: 25,
    patientName: 'Benjamin Foster',
    patientId: '44',
    doctorName: 'Dr. James Wilson',
    doctorId: '3',
    department: 'Surgery', // 不同部门
    date: '2025-06-24',
    time: '11:30', // 可能造成冲突，因为前一个预约可能需要30分钟以上
    status: 'confirmed',
    notes: 'Pre-operative consultation'
  },
  
  // 场景5: 紧急预约
  {
    id: 26,
    patientName: 'Amelia Cooper',
    patientId: '45',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-25',
    time: '09:45',
    status: 'confirmed',
    notes: 'EMERGENCY: Severe chest pain, possible heart attack'
  },
  
  // 场景6: 超长预约（手术或特殊治疗）
  {
    id: 27,
    patientName: 'Henry Morgan',
    patientId: '46',
    doctorName: 'Dr. Kimberly Novak',
    doctorId: '4',
    department: 'Cardiology',
    date: '2025-06-26',
    time: '09:00',
    status: 'confirmed',
    notes: 'Cardiac catheterization procedure - 2 hours'
  },
  
  // 场景7: 医生在同一时间有预约冲突
  {
    id: 28,
    patientName: 'Leo Jenkins',
    patientId: '47',
    doctorName: 'Dr. Sophia Lee',
    doctorId: '6',
    department: 'Dermatology',
    date: '2025-06-27',
    time: '15:30',
    status: 'confirmed',
    notes: 'Skin biopsy'
  },
  {
    id: 29,
    patientName: 'Zoe Palmer',
    patientId: '48',
    doctorName: 'Dr. Sophia Lee',
    doctorId: '6',
    department: 'Dermatology',
    date: '2025-06-27',
    time: '15:30', // 同时间冲突
    status: 'confirmed',
    notes: 'Psoriasis treatment consultation'
  },
  
  // 场景8: 取消的预约
  {
    id: 30,
    patientName: 'Lily Sanders',
    patientId: '49',
    doctorName: 'Dr. Jennifer Lopez',
    doctorId: '8',
    department: 'Pediatrics',
    date: '2025-06-28',
    time: '10:00',
    status: 'cancelled',
    notes: 'Cancelled due to family emergency'
  },
  
  // 场景9: 同一患者在同一天有多个不同部门的预约
  {
    id: 31,
    patientName: 'Max Wagner',
    patientId: '50',
    doctorName: 'Dr. Adam Hall',
    doctorId: '1',
    department: 'Dentistry',
    date: '2025-06-29',
    time: '09:00',
    status: 'confirmed',
    notes: 'Dental cleaning'
  },
  {
    id: 32,
    patientName: 'Max Wagner', // 同一患者
    patientId: '50',
    doctorName: 'Dr. Robert Chen',
    doctorId: '2',
    department: 'Cardiology',
    date: '2025-06-29',
    time: '11:00', // 同一天不同时间
    status: 'confirmed',
    notes: 'Cardiac check before dental work'
  },
  
  // 场景10: 完成的预约（历史记录）
  {
    id: 33,
    patientName: 'Chloe Baker',
    patientId: '51',
    doctorName: 'Dr. Linda Chen',
    doctorId: '5',
    department: 'Dentistry',
    date: '2025-06-15', // 过去的日期
    time: '14:30',
    status: 'completed',
    notes: 'Filled cavity, upper right molar'
  }
];

// Department filter options
const departments: DepartmentOption[] = [
  { id: 'all', name: 'All Departments' },
  { id: '1', name: 'Cardiology' },
  { id: '2', name: 'Pediatrics' },
  { id: '3', name: 'Dermatology' },
  { id: '4', name: 'Surgery' },
  { id: '7', name: 'Dentistry' },
];

// Status filter options
const statusOptions: StatusOption[] = [
  { id: 'all', name: 'All Statuses' },
  { id: 'confirmed', name: 'Confirmed' },
  { id: 'pending', name: 'Pending' },
  { id: 'cancelled', name: 'Cancelled' },
  { id: 'completed', name: 'Completed' },
];

// Temporary Doctor Data (for New Appointment Form)
const tempDoctors: Doctor[] = [
    { id: '1', name: 'Dr. Adam Hall', department: 'Dentistry' },
    { id: '2', name: 'Dr. Robert Chen', department: 'Cardiology' },
    { id: '3', name: 'Dr. James Wilson', department: 'Cardiology' },
    { id: '4', name: 'Dr. Kimberly Novak', department: 'Cardiology' },
    { id: '5', name: 'Dr. Linda Chen', department: 'Dentistry' },
    { id: '6', name: 'Dr. Sophia Lee', department: 'Dermatology' },
    { id: '7', name: 'Dr. Michael Torres', department: 'Dermatology' },
    { id: '8', name: 'Dr. Jennifer Lopez', department: 'Pediatrics' },
    { id: '9', name: 'Dr. David Rodriguez', department: 'Pediatrics' },
    // Add other doctors as needed
];

// Temporary Patient Data (for New Appointment Form)
const tempPatients: Patient[] = [
    { id: '21', name: 'John Smith' },
    { id: '22', name: 'Jessica Tan' },
    { id: '23', name: 'David Wong' },
    { id: '24', name: 'Emily Lim' },
    { id: '25', name: 'Jason Ng' },
    { id: '26', name: 'Alice Wang' },
    { id: '27', name: 'Mark Johnson' },
    { id: '28', name: 'Sarah Li' },
    { id: '29', name: 'Thomas Brown' },
    { id: '30', name: 'Michelle Zhang' },
    { id: '31', name: 'Ryan Kim' },
    { id: '32', name: 'Daniel Park' },
    { id: '33', name: 'Emma Wilson' },
    { id: '34', name: 'Noah Garcia' },
    { id: '35', name: 'Olivia Smith' },
    // Add other patients as needed
];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>(tempAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarViewType, setCalendarViewType] = useState<'default' | 'byDepartment' | 'byDoctor'>('default');
  const [appointmentTooltip, setAppointmentTooltip] = useState({ visible: false, x: 0, y: 0, appointment: null as Appointment | null });
  const [showConflicts, setShowConflicts] = useState(true); // 是否显示预约冲突
  const [resourceView, setResourceView] = useState(false); // 是否使用资源视图
  const [newAppointmentData, setNewAppointmentData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  });

  // 部门颜色映射
  const departmentColors: Record<string, string> = {
    'Cardiology': '#4F46E5', // 蓝紫色
    'Pediatrics': '#06B6D4', // 青色
    'Dermatology': '#8B5CF6', // 紫色
    'Dentistry': '#F97316',  // 橙色
  };

  // 医生颜色映射
  const doctorColors: Record<string, string> = {};
  tempDoctors.forEach((doctor, index) => {
    // 生成不同色调的颜色，基于部门主色
    const baseColor = departmentColors[doctor.department] || '#6B7280';
    // 简单的颜色变化算法，为同一部门的不同医生使用不同色调
    const hue = parseInt(baseColor.slice(1, 3), 16);
    const saturation = parseInt(baseColor.slice(3, 5), 16);
    const lightness = parseInt(baseColor.slice(5, 7), 16);
    
    // 调整亮度，根据医生索引
    const adjustedLightness = Math.max(0, Math.min(255, lightness - index * 15));
    
    doctorColors[doctor.id] = `#${hue.toString(16).padStart(2, '0')}${saturation.toString(16).padStart(2, '0')}${adjustedLightness.toString(16).padStart(2, '0')}`;
  });

  // Filter appointments based on selected filters and search query
  const filteredAppointments = appointments.filter(appointment => {
    // Department filter
    const departmentMatch = filterDepartment === 'all' || appointment.department === departments.find(d => d.id === filterDepartment)?.name;
    if (!departmentMatch) return false;

    // Status filter
    const statusMatch = filterStatus === 'all' || appointment.status === filterStatus;
    if (!statusMatch) return false;

    // Doctor filter
    const doctorMatch = filterDoctor === 'all' || appointment.doctorId === filterDoctor;
    if (!doctorMatch) return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchMatch = (
        appointment.patientName.toLowerCase().includes(query) ||
        appointment.doctorName.toLowerCase().includes(query) ||
        appointment.date.includes(query)
      );
      if (!searchMatch) return false;
    }

    return true;
  });

  // Handle appointment status change
  const handleStatusChange = (appointmentId: number, newStatus: Appointment['status']) => {
    setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
            appointment.id === appointmentId
                ? { ...appointment, status: newStatus }
                : appointment
        )
    );

    // If the appointment is currently selected, update the selected appointment too
    if (selectedAppointment?.id === appointmentId) {
      setSelectedAppointment(prevSelected => prevSelected ? { ...prevSelected, status: newStatus } : null);
    }
  };

  // Handle appointment detail view
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Handle new appointment form change
  const handleNewAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  // Handle saving new appointment
  const handleSaveNewAppointment = () => {
    // Basic validation
    if (!newAppointmentData.patientId || !newAppointmentData.doctorId || !newAppointmentData.date || !newAppointmentData.time) {
      alert('Please fill in all required fields.');
      return;
    }

    const patient = tempPatients.find(p => p.id === newAppointmentData.patientId);
    const doctor = tempDoctors.find(d => d.id === newAppointmentData.doctorId);

    if (!patient || !doctor) {
      alert('Invalid patient or doctor selected.');
      return;
    }

    const newAppt: Appointment = {
      id: Date.now(), // Simple ID generation
      patientName: patient.name,
      patientId: newAppointmentData.patientId,
      doctorName: doctor.name,
      doctorId: newAppointmentData.doctorId,
      department: doctor.department,
      date: newAppointmentData.date,
      time: newAppointmentData.time,
      status: 'pending', // Default status
      notes: newAppointmentData.notes,
    };

    setAppointments(prevAppointments => [...prevAppointments, newAppt]);
    setShowNewAppointmentModal(false);
    setNewAppointmentData({ patientId: '', doctorId: '', date: '', time: '', notes: '' }); // Reset form
  };

  // Get status badge style
  const getStatusBadge = (status: Appointment['status']): string => {
    const statusStyles: Record<Appointment['status'], string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };

    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: Appointment['status']): string => {
      switch (status) {
          case 'confirmed': return '#4F46E5'; // Modern indigo
          case 'pending': return '#F59E0B';   // Amber
          case 'completed': return '#10B981'; // Emerald green
          case 'cancelled': return '#EF4444'; // Modern red
          default: return '#6B7280'; // Gray
      }
  };

  // Helper function to calculate end time (30 minutes after start by default)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let newMinutes = minutes + 30;
    let newHours = hours;
    
    if (newMinutes >= 60) {
      newHours = (newHours + 1) % 24;
      newMinutes = newMinutes % 60;
    }
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // 获取基于视图类型的预约事件颜色
  const getAppointmentColor = (appointment: Appointment): string => {
    if (calendarViewType === 'byDepartment') {
      return departmentColors[appointment.department] || '#6B7280'; // 默认灰色
    } else if (calendarViewType === 'byDoctor') {
      return doctorColors[appointment.doctorId] || '#6B7280'; // 默认灰色
    } else {
      // 默认视图使用状态颜色
      return getStatusColor(appointment.status);
    }
  };

  // 根据视图类型生成标题前缀
  const getTitlePrefix = (appointment: Appointment): string => {
    if (calendarViewType === 'byDepartment') {
      return `[${appointment.department}] `;
    } else if (calendarViewType === 'byDoctor') {
      return `[${appointment.doctorName}] `;
    }
    return '';
  };

  // 检测预约冲突
  const detectAppointmentConflicts = () => {
    const conflicts = new Set<number>();
    
    // 按日期和时间进行分组
    const appointmentsByTime: Record<string, number[]> = {};
    
    appointments.forEach(appointment => {
      const timeKey = `${appointment.date}-${appointment.time}`;
      if (!appointmentsByTime[timeKey]) {
        appointmentsByTime[timeKey] = [];
      }
      appointmentsByTime[timeKey].push(appointment.id);
    });
    
    // 检测同一医生在同一时间的预约
    const doctorAppointments: Record<string, Record<string, number[]>> = {};
    
    appointments.forEach(appointment => {
      const doctorId = appointment.doctorId;
      const timeKey = `${appointment.date}-${appointment.time}`;
      
      if (!doctorAppointments[doctorId]) {
        doctorAppointments[doctorId] = {};
      }
      
      if (!doctorAppointments[doctorId][timeKey]) {
        doctorAppointments[doctorId][timeKey] = [];
      }
      
      doctorAppointments[doctorId][timeKey].push(appointment.id);
      
      // 如果同一医生在同一时间有多个预约，标记为冲突
      if (doctorAppointments[doctorId][timeKey].length > 1) {
        doctorAppointments[doctorId][timeKey].forEach(id => conflicts.add(id));
      }
    });
    
    return conflicts;
  };
  
  const appointmentConflicts = useMemo(() => detectAppointmentConflicts(), [appointments]);

  // 检测是否为紧急预约
  const isEmergencyAppointment = (notes: string): boolean => {
    return notes.toLowerCase().includes('emergency') || notes.toLowerCase().includes('urgent');
  };

  // 检测是否为超长预约
  const isLongAppointment = (notes: string): boolean => {
    return notes.toLowerCase().includes('hour') || 
           notes.toLowerCase().includes('procedure') || 
           notes.toLowerCase().includes('surgery') ||
           notes.toLowerCase().includes('catheterization');
  };

  // 检测是否为医生休假
  const isDoctorUnavailable = (patientName: string, notes: string): boolean => {
    return patientName.toUpperCase().includes('DOCTOR UNAVAILABLE') || 
           notes.toLowerCase().includes('vacation') ||
           notes.toLowerCase().includes('unavailable') ||
           notes.toLowerCase().includes('off duty');
  };

  // 检测是否为同一患者多个预约
  const isSamePatientMultipleAppointments = (appointment: Appointment): boolean => {
    return appointments.filter(appt => 
      appt.patientId === appointment.patientId && 
      appt.date === appointment.date && 
      appt.id !== appointment.id
    ).length > 0;
  };

  // 检测是否为跨部门预约
  const isCrossDepartmentAppointment = (appointment: Appointment): boolean => {
    // 检查此医生是否在同一天有不同部门的预约
    return appointments.some(appt => 
      appt.doctorId === appointment.doctorId && 
      appt.date === appointment.date && 
      appt.department !== appointment.department &&
      appt.id !== appointment.id
    );
  };

  // Format appointments for FullCalendar
  const calendarEvents = filteredAppointments.map(appt => {
    // 检查这个预约是否有冲突
    const hasConflict = appointmentConflicts.has(appt.id);
    
    // 检查特殊情况
    const isEmergency = isEmergencyAppointment(appt.notes);
    const isLong = isLongAppointment(appt.notes);
    const isDoctorOff = isDoctorUnavailable(appt.patientName, appt.notes);
    const isSamePatient = isSamePatientMultipleAppointments(appt);
    const isCrossDepartment = isCrossDepartmentAppointment(appt);
    
    // 转换为小写并移除空格，用于CSS类
    const departmentClass = `department-${appt.department.toLowerCase().replace(/\s+/g, '')}`;
    
    // 如果是超长预约，调整结束时间
    let endTime = calculateEndTime(appt.time);
    if (isLong) {
      // 假设长预约至少2小时
      const [hours, minutes] = appt.time.split(':').map(Number);
      let newHours = hours + 2;
      if (newHours >= 24) newHours = 23;
      endTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // 构建标题，为紧急预约添加标记
    let title = `${getTitlePrefix(appt)}${appt.patientName}`;
    if (isEmergency) {
      title = `⚠️ ${title}`;
    }
    
    return {
      id: appt.id.toString(),
      title: title,
      start: `${appt.date}T${appt.time}`,
      end: `${appt.date}T${endTime}`,
      extendedProps: {
        patientName: appt.patientName,
        doctorName: appt.doctorName,
        department: appt.department,
        status: appt.status,
        notes: appt.notes,
        conflict: hasConflict,
        isEmergency: isEmergency,
        isLong: isLong,
        isDoctorOff: isDoctorOff,
        isSamePatient: isSamePatient,
        isCrossDepartment: isCrossDepartment
      },
      backgroundColor: isDoctorOff ? '#F3F4F6' : getAppointmentColor(appt),
      borderColor: isDoctorOff ? '#D1D5DB' : getAppointmentColor(appt),
      textColor: isDoctorOff ? '#9CA3AF' : '#FFFFFF',
      description: `Patient: ${appt.patientName}\nDoctor: ${appt.doctorName}\nDepartment: ${appt.department}\nStatus: ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}\nNotes: ${appt.notes}`,
      classNames: [
        departmentClass,
        hasConflict && showConflicts ? 'conflict' : '',
        isEmergency ? 'emergency' : '',
        isLong ? 'long-appointment' : '',
        isDoctorOff ? 'doctor-unavailable' : '',
        isSamePatient ? 'same-patient' : '',
        isCrossDepartment ? 'cross-department' : ''
      ].filter(Boolean)
    };
  });

  // 医生资源数据
  const doctorResources = useMemo(() => 
    tempDoctors.map(doctor => ({
      id: doctor.id,
      title: doctor.name,
      businessHours: {
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5] // 周一至周五
      },
      eventColor: doctorColors[doctor.id] || departmentColors[doctor.department] || '#6B7280'
    })),
    [tempDoctors]
  );

  // 部门资源数据
  const departmentResources = useMemo(() => 
    Object.keys(departmentColors).map(dept => ({
      id: dept,
      title: dept,
      eventColor: departmentColors[dept]
    })),
    [departmentColors]
  );

  // Handle calendar event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const appointmentId = parseInt(clickInfo.event.id);
    const appointment = appointments.find(appt => appt.id === appointmentId);
    
    if (appointment) {
      // 检查同一日期和时间是否有多个预约
      const appointmentsAtSameTime = appointments.filter(
        appt => appt.date === appointment.date && appt.time === appointment.time
      );
      
      // 如果同一时间有多个预约，展开时间段预约列表
      if (appointmentsAtSameTime.length > 1) {
        setExpandedTimeSlot({ 
          date: appointment.date, 
          time: appointment.time 
        });
        setExpandedCell(null); // 重置日期展开
      } else {
        // 否则直接显示预约详情
        handleViewAppointment(appointment);
      }
    }
  };

  // 处理事件悬停
  const handleEventMouseEnter = (info: any) => {
    const appointment = appointments.find(a => a.id.toString() === info.event.id);
    if (appointment) {
      const rect = info.el.getBoundingClientRect();
      setAppointmentTooltip({
        visible: true,
        x: rect.left,
        y: rect.bottom + 5,
        appointment
      });
    }
  };

  const handleEventMouseLeave = () => {
    setAppointmentTooltip({
      ...appointmentTooltip,
      visible: false
    });
  };

  // 保留expandedCell状态，但删除与鼠标悬停相关的变量和函数
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  // 添加新的状态用于时间段展开
  const [expandedTimeSlot, setExpandedTimeSlot] = useState<{date: string, time: string} | null>(null);
  
  // 新增：处理日期单元格点击
  const handleDateClick = (info: any) => {
    // 获取日期字符串
    const dateStr = info.dateStr;
    
    // 获取该日期的所有预约
    const appointmentsForDay = appointments.filter(a => a.date === dateStr);
    
    // 如果只有一个预约，直接打开预约详情
    if (appointmentsForDay.length === 1) {
      handleViewAppointment(appointmentsForDay[0]);
    }
    // 如果有多个预约，展开预约列表
    else if (appointmentsForDay.length > 1) {
      setExpandedCell(dateStr);
      setExpandedTimeSlot(null); // 重置时间段展开
    }
    // 如果没有预约，直接打开新增预约表单
    else {
      setNewAppointmentData({
        ...newAppointmentData,
        date: dateStr,
        time: '09:00'
      });
      setShowNewAppointmentModal(true);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Appointment Management</h1>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-md transition-colors ${currentView === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrentView('list')}
          >
            List View
          </button>
          <button
            className={`px-3 py-1.5 rounded-md transition-colors ${currentView === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors ml-2"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            New Appointment
          </button>
        </div>
      </div>

      {/* Filters - Common for both views */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search patients or doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {tempDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List View */}
      {currentView === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                      <div className="text-sm text-gray-500">ID: {appointment.doctorId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.date}</div>
                      <div className="text-sm text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <button
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                          >
                              Cancel
                          </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAppointments.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No appointments found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color By:</label>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${calendarViewType === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    onClick={() => setCalendarViewType('default')}
                  >
                    Status
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${calendarViewType === 'byDepartment' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    onClick={() => setCalendarViewType('byDepartment')}
                  >
                    Department
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${calendarViewType === 'byDoctor' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    onClick={() => setCalendarViewType('byDoctor')}
                  >
                    Doctor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View Options:</label>
                <div className="flex gap-2">
                  <div className="flex items-center">
                    <input
                      id="show-conflicts"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={showConflicts}
                      onChange={(e) => setShowConflicts(e.target.checked)}
                    />
                    <label htmlFor="show-conflicts" className="ml-2 block text-sm text-gray-700">
                      Show Conflicts
                    </label>
                  </div>
                </div>
              </div>
              
              {/* 显示颜色图例 */}
              <div className="ml-auto">
                <div className="text-sm font-medium text-gray-700 mb-1">Legend:</div>
                <div className="flex flex-wrap gap-2">
                  {calendarViewType === 'default' && (
                    <>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#4F46E5] mr-1"></div>
                        <span className="text-xs">Confirmed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#F59E0B] mr-1"></div>
                        <span className="text-xs">Pending</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#10B981] mr-1"></div>
                        <span className="text-xs">Completed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#EF4444] mr-1"></div>
                        <span className="text-xs">Cancelled</span>
                      </div>
                    </>
                  )}
                  
                  {calendarViewType === 'byDepartment' && (
                    <>
                      {Object.entries(departmentColors).map(([dept, color]) => (
                        <div key={dept} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></div>
                          <span className="text-xs">{dept}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {calendarViewType === 'byDoctor' && (
                    <span className="text-xs text-gray-500">Each doctor has a unique color based on their department</span>
                  )}
                </div>
                
                {/* 特殊预约类型图例 */}
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Special Types:</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-3 mr-1 relative">
                        <div className="absolute inset-0 border-l-4 border-l-red-500"></div>
                      </div>
                      <span className="text-xs">Emergency</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-3 mr-1 relative">
                        <div className="absolute inset-0 bg-purple-100 bg-opacity-50" style={{ 
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139, 92, 246, 0.3) 2px, rgba(139, 92, 246, 0.3) 4px)' 
                        }}></div>
                      </div>
                      <span className="text-xs">Long Appointment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-3 mr-1 relative">
                        <div className="absolute inset-0 bg-gray-100 border border-dashed border-gray-300"></div>
                      </div>
                      <span className="text-xs">Doctor Unavailable</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-3 mr-1 relative">
                        <div className="absolute inset-0 border-r-4 border-r-green-500"></div>
                      </div>
                      <span className="text-xs">Same Patient Multiple Visits</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-3 mr-1 relative">
                        <div className="absolute inset-0 border-t-3 border-b-3 border-t-amber-500 border-b-amber-500"></div>
                      </div>
                      <span className="text-xs">Cross-Department</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-3 mr-1 relative">
                        <div className="absolute inset-0 border-l-3 border-l-red-500"></div>
                      </div>
                      <span className="text-xs">Scheduling Conflict</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              eventTextColor="#FFFFFF"
              dayMaxEvents={expandedCell ? 999 : 3} // 保持不变
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
              eventDisplay="block"
              eventBackgroundColor="#4F46E5"
              eventBorderColor="#4338CA"
              eventClassNames="rounded-md shadow-sm hover:shadow-md transition-shadow"
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '09:00',
                endTime: '17:00',
              }}
              dayCellClassNames={(arg) => {
                const dateStr = arg.date.toISOString().split('T')[0];
                return expandedCell === dateStr ? 'expanded-cell' : 'hover:bg-gray-50';
              }}
              themeSystem="standard"
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day'
              }}
              buttonIcons={{
                prev: 'chevron-left',
                next: 'chevron-right'
              }}
              eventDidMount={(info) => {
                // Add tooltip using DOM title attribute
                if (info.event.extendedProps.description) {
                  info.el.setAttribute('title', info.event.extendedProps.description);
                }
                
                // 添加冲突标记
                if (info.event.extendedProps.conflict && showConflicts) {
                  info.el.classList.add('conflict');
                }
                
                // 为特殊预约添加额外信息
                if (info.event.extendedProps.isEmergency) {
                  const emergencyIndicator = document.createElement('span');
                  emergencyIndicator.innerHTML = ' ⚠️';
                  emergencyIndicator.style.marginLeft = '4px';
                  info.el.querySelector('.fc-event-title')?.appendChild(emergencyIndicator);
                }
                
                if (info.event.extendedProps.isLong) {
                  const timeIndicator = document.createElement('span');
                  timeIndicator.innerHTML = ' (长时间)';
                  timeIndicator.style.fontSize = '0.7em';
                  timeIndicator.style.opacity = '0.8';
                  info.el.querySelector('.fc-event-title')?.appendChild(timeIndicator);
                }
              }}
              slotMinTime="08:00"
              slotMaxTime="18:00"
              eventMouseEnter={handleEventMouseEnter}
              eventMouseLeave={handleEventMouseLeave}
              // 处理日期单元格点击
              dateClick={handleDateClick}
            />
          </div>

          {/* 自定义悬停提示 */}
          {appointmentTooltip.visible && appointmentTooltip.appointment && (
            <div 
              className={`appointment-tooltip visible`}
              style={{
                top: appointmentTooltip.y + 'px',
                left: appointmentTooltip.x + 'px',
                borderLeftColor: getAppointmentColor(appointmentTooltip.appointment)
              }}
            >
              <div className="appointment-tooltip-patient">
                {appointmentTooltip.appointment.patientName}
              </div>
              <div className="appointment-tooltip-doctor">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {appointmentTooltip.appointment.doctorName}
              </div>
              <div className="appointment-tooltip-department">
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {appointmentTooltip.appointment.department}
              </div>
              <div className="appointment-tooltip-time">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {appointmentTooltip.appointment.date} at {appointmentTooltip.appointment.time}
              </div>
              <div className="appointment-tooltip-status">
                <svg className="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={getStatusBadge(appointmentTooltip.appointment.status)}>
                  {appointmentTooltip.appointment.status.charAt(0).toUpperCase() + appointmentTooltip.appointment.status.slice(1)}
                </span>
              </div>
              {appointmentConflicts.has(appointmentTooltip.appointment.id) && (
                <div className="appointment-tooltip-conflict mt-2">
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Scheduling conflict detected
                </div>
              )}
              {isEmergencyAppointment(appointmentTooltip.appointment.notes) && (
                <div className="appointment-tooltip-emergency mt-2 bg-red-50 text-red-700 p-1 rounded-md text-xs font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  EMERGENCY APPOINTMENT
                </div>
              )}
              {isLongAppointment(appointmentTooltip.appointment.notes) && (
                <div className="appointment-tooltip-long mt-2 bg-purple-50 text-purple-700 p-1 rounded-md text-xs font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  EXTENDED APPOINTMENT (2+ HOURS)
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 italic">
                {appointmentTooltip.appointment.notes}
              </div>
            </div>
          )}
          
          {/* 展开的预约列表 */}
          {expandedCell && (
            <div className="expanded-appointments-container">
              <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl z-50 p-4 min-w-[350px] max-w-md border border-gray-200">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="text-lg font-semibold">
                    Appointments on {new Date(expandedCell).toLocaleDateString()}
                  </h3>
                  <button 
                    onClick={() => setExpandedCell(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {appointments.filter(appt => appt.date === expandedCell).length > 0 ? (
                    appointments
                      .filter(appt => appt.date === expandedCell)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(appt => (
                        <div 
                          key={appt.id} 
                          className="mb-2 p-3 rounded-md hover:bg-gray-50 border-l-4 cursor-pointer"
                          style={{ borderLeftColor: getAppointmentColor(appt) }}
                          onClick={() => {
                            handleViewAppointment(appt);
                            setExpandedCell(null); // 点击后关闭展开列表
                          }}
                        >
                          <div className="font-medium">
                            {appt.time} - {appt.patientName}
                          </div>
                          <div className="text-sm text-gray-500 flex justify-between">
                            <span>
                              Dr. {appt.doctorName.replace('Dr. ', '')}
                            </span>
                            <span className={getStatusBadge(appt.status)}>
                              {appt.status}
                            </span>
                          </div>
                          {appt.notes && (
                            <div className="text-xs text-gray-500 mt-1 italic truncate">
                              {appt.notes}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="py-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No appointments scheduled for this date.
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <button 
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors"
                    onClick={() => {
                      setNewAppointmentData({
                        ...newAppointmentData,
                        date: expandedCell,
                        time: '09:00'
                      });
                      setShowNewAppointmentModal(true);
                      setExpandedCell(null);
                    }}
                  >
                    Add New Appointment
                  </button>
                </div>
              </div>
              
              {/* 添加背景遮罩，点击关闭展开列表 */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-10 z-40"
                onClick={() => setExpandedCell(null)}
              ></div>
            </div>
          )}
          
          {/* 同一时间段的预约列表 */}
          {expandedTimeSlot && (
            <div className="expanded-timeslot-container">
              <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl z-50 p-4 min-w-[350px] max-w-md border border-gray-200">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="text-lg font-semibold">
                    Appointments at {expandedTimeSlot.time} on {new Date(expandedTimeSlot.date).toLocaleDateString()}
                  </h3>
                  <button 
                    onClick={() => setExpandedTimeSlot(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {appointments.filter(
                    appt => appt.date === expandedTimeSlot.date && appt.time === expandedTimeSlot.time
                  ).length > 0 ? (
                    appointments
                      .filter(appt => appt.date === expandedTimeSlot.date && appt.time === expandedTimeSlot.time)
                      .map(appt => (
                        <div 
                          key={appt.id} 
                          className="mb-2 p-3 rounded-md hover:bg-gray-50 border-l-4 cursor-pointer"
                          style={{ borderLeftColor: getAppointmentColor(appt) }}
                          onClick={() => {
                            handleViewAppointment(appt);
                            setExpandedTimeSlot(null); // 点击后关闭展开列表
                          }}
                        >
                          <div className="font-medium">
                            {appt.patientName}
                          </div>
                          <div className="text-sm text-gray-500 flex justify-between">
                            <span>
                              Dr. {appt.doctorName.replace('Dr. ', '')}
                            </span>
                            <span className={getStatusBadge(appt.status)}>
                              {appt.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {appt.department}
                          </div>
                          {appt.notes && (
                            <div className="text-xs text-gray-500 mt-1 italic truncate">
                              {appt.notes}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="py-8 text-center">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No appointments found for this time slot.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 添加背景遮罩，点击关闭展开列表 */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-10 z-40"
                onClick={() => setExpandedTimeSlot(null)}
              ></div>
            </div>
          )}
        </>
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-40">
           <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Appointment Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Patient Information</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedAppointment.patientName}</p>
                <p className="text-sm text-gray-500">ID: {selectedAppointment.patientId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Doctor Information</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedAppointment.doctorName}</p>
                <p className="text-sm text-gray-500">ID: {selectedAppointment.doctorId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Appointment Details</h3>
                <p className="mt-1 text-sm text-gray-900">Date: {selectedAppointment.date}</p>
                <p className="text-sm text-gray-900">Time: {selectedAppointment.time}</p>
                <p className="text-sm text-gray-900">Department: {selectedAppointment.department}</p>
                <p className="text-sm text-gray-900">Status: <span className={getStatusBadge(selectedAppointment.status)}>{selectedAppointment.status}</span></p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                 <button
                   onClick={() => { handleStatusChange(selectedAppointment.id, 'completed'); setShowDetailModal(false); }}
                   className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                 >
                  Mark as Completed
                </button>
              )}
               {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                 <button
                   onClick={() => { handleStatusChange(selectedAppointment.id, 'cancelled'); setShowDetailModal(false); }}
                   className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                 >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">New Appointment</h2>
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient*</label>
                <select
                  id="patientId"
                  name="patientId"
                  value={newAppointmentData.patientId}
                  onChange={handleNewAppointmentChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Patient</option>
                  {tempPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">Doctor*</label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={newAppointmentData.doctorId}
                  onChange={handleNewAppointmentChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                   {tempDoctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>
               <div>
                 <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date*</label>
                 <input
                   type="date"
                   id="date"
                   name="date"
                   value={newAppointmentData.date}
                   onChange={handleNewAppointmentChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>
               <div>
                 <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time*</label>
                 <input
                   type="time"
                   id="time"
                   name="time"
                   value={newAppointmentData.time}
                   onChange={handleNewAppointmentChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                   required
                 />
               </div>
               <div>
                 <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                 <textarea
                   id="notes"
                   name="notes"
                   rows={3}
                   value={newAppointmentData.notes}
                   onChange={handleNewAppointmentChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Optional notes about the appointment..."
                 />
               </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

