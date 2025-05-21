import { useState, useEffect } from 'react';
import patientClient, { 
  Department, 
  Doctor, 
  Appointment 
} from '@/lib/api/patient-client';
import { useFetch } from '../common';

// 扩展Doctor类型以添加UI所需属性
export interface ExtendedDoctor extends Doctor {
  name?: string;
  profileImage?: string;
}

// 扩展Appointment类型以添加UI所需属性
export interface ExtendedAppointment extends Omit<Appointment, 'doctor'> {
  doctorName?: string;
  specialty?: string;
  date?: string;
  time?: string;
  doctor?: {
    id: number;
    userId: number;
    department?: {
      id: number;
      name: string;
    };
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      profile_image_blob?: string;
    };
    profileImage?: string;
  };
}

// Dashboard统计数据类型
export interface DashboardStats {
  departments: Department[];
  doctors: ExtendedDoctor[];
  upcomingAppointments: ExtendedAppointment[];
  selectedDepartment: Department | null;
}

export function useDashboardStats() {
  // 状态管理
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [doctors, setDoctors] = useState<ExtendedDoctor[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ExtendedAppointment[]>([]);
  
  // 使用通用fetch获取所有数据
  const { loading, error, refetch } = useFetch(async () => {
    // 获取部门数据
    try {
      console.log('Fetching departments...');
      const departmentsData = await patientClient.getDepartments();
      console.log('Departments loaded:', departmentsData.length);
      
      setDepartments(departmentsData);
      if (departmentsData.length > 0) {
        setSelectedDepartment(departmentsData[0]);
      }
    } catch (deptError) {
      console.error('Department error:', deptError);
      throw new Error('Error loading departments. Please try again later.');
    }
    
    // 获取医生数据
    try {
      console.log('Fetching doctors...');
      const doctorsData = await patientClient.getDoctors();
      console.log('Doctors loaded:', doctorsData.length);
      
      // 处理医生数据以确保格式一致
      const processedDoctors = doctorsData.map(doctor => ({
        ...doctor,
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        profileImage: (doctor.user as any).profile_image_blob
      }));
      
      setDoctors(processedDoctors);
    } catch (doctorError) {
      console.error('Doctor error:', doctorError);
      throw new Error('Error loading doctors.');
    }
    
    // 获取预约数据
    try {
      console.log('Fetching appointments...');
      const appointmentsData = await patientClient.getAppointments();
      console.log('Appointments loaded:', appointmentsData.length);
      
      // 处理预约数据以提取日期和时间
      const processedAppointments = appointmentsData.map(appointment => {
        // 从appointmentDateTime中提取日期和时间
        let date = '';
        let time = '';
        
        if (appointment.appointmentDateTime) {
          const dateObj = new Date(appointment.appointmentDateTime);
          date = dateObj.toLocaleDateString();
          time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // 确保doctor数据类型安全
        const doctor = appointment.doctor ? {
          ...appointment.doctor,
          profileImage: (appointment.doctor.user as any).profile_image_blob
        } : undefined;
        
        return {
          ...appointment,
          doctor,
          doctorName: appointment.doctor ? 
            `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` : 
            'Unknown Doctor',
          specialty: appointment.doctor?.department?.name || '',
          date,
          time
        };
      });
      
      // 过滤出即将到来的预约
      const upcomingAppointments = processedAppointments.filter(appointment => {
        const status = appointment.status.toLowerCase();
        // 过滤出非完成、非取消和非缺席的预约
        return !['completed', 'cancelled', 'no_show'].includes(status);
      });
      
      setUpcomingAppointments(upcomingAppointments);
    } catch (appointmentError) {
      console.warn('Appointment error:', appointmentError);
      // 约会获取失败不是致命错误，可以继续
    }
    
    // 返回所有统计数据
    return {
      departments,
      doctors,
      upcomingAppointments,
      selectedDepartment
    };
  }, []);

  // 当选择的部门改变时，更新医生列表
  useEffect(() => {
    if (selectedDepartment) {
      const departmentDoctors = doctors.filter(
        doctor => doctor.departmentId === selectedDepartment.id
      );
      console.log(`Filtered doctors for department ${selectedDepartment.name}:`, departmentDoctors.length);
    }
  }, [selectedDepartment, doctors]);

  // 切换选中的部门
  const selectDepartment = (department: Department) => {
    setSelectedDepartment(department);
  };

  return {
    departments,
    doctors,
    upcomingAppointments,
    selectedDepartment,
    loading,
    error,
    selectDepartment,
    refreshDashboard: refetch
  };
} 