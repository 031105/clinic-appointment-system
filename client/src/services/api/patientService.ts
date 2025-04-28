import { api } from './httpClient';
import { Address } from './userService';

// 患者信息类型
export interface Patient {
  id: number;
  userId: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  height?: number; // 身高(cm)
  weight?: number; // 体重(kg)
  allergies?: Allergy[]; 
  emergencyContacts?: EmergencyContact[];
  insuranceInfo?: InsuranceInfo;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

// 过敏信息类型
export interface Allergy {
  id?: number;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  notes?: string;
}

// 紧急联系人类型
export interface EmergencyContact {
  id?: number;
  name: string;
  relationship: string;
  phone: string;
  address?: Address;
  isDefault?: boolean;
}

// 保险信息类型
export interface InsuranceInfo {
  id?: number;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  validFrom?: string;
  validUntil?: string;
}

// 患者服务
export const patientService = {
  /**
   * 获取患者个人资料
   * @returns 患者资料
   */
  getProfile: async (): Promise<Patient> => {
    return await api.get<Patient>('/patients/profile');
  },
  
  /**
   * 更新患者资料
   * @param profileData 要更新的资料
   * @returns 更新后的患者资料
   */
  updateProfile: async (profileData: Partial<Patient>): Promise<Patient> => {
    return await api.patch<Patient>('/patients/profile', profileData);
  },
  
  /**
   * 获取患者的过敏信息
   * @returns 过敏信息列表
   */
  getAllergies: async (): Promise<Allergy[]> => {
    return await api.get<Allergy[]>('/patients/allergies');
  },
  
  /**
   * 添加新的过敏信息
   * @param allergy 过敏信息
   * @returns 添加后的过敏信息
   */
  addAllergy: async (allergy: Allergy): Promise<Allergy> => {
    return await api.post<Allergy>('/patients/allergies', allergy);
  },
  
  /**
   * 更新过敏信息
   * @param id 过敏信息ID
   * @param allergy 要更新的过敏信息
   * @returns 更新后的过敏信息
   */
  updateAllergy: async (id: number, allergy: Partial<Allergy>): Promise<Allergy> => {
    return await api.patch<Allergy>(`/patients/allergies/${id}`, allergy);
  },
  
  /**
   * 删除过敏信息
   * @param id 过敏信息ID
   */
  deleteAllergy: async (id: number): Promise<void> => {
    await api.delete(`/patients/allergies/${id}`);
  },
  
  /**
   * 获取紧急联系人列表
   * @returns 紧急联系人列表
   */
  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    return await api.get<EmergencyContact[]>('/patients/emergency-contacts');
  },
  
  /**
   * 添加紧急联系人
   * @param contact 联系人信息
   * @returns 添加后的联系人
   */
  addEmergencyContact: async (contact: EmergencyContact): Promise<EmergencyContact> => {
    return await api.post<EmergencyContact>('/patients/emergency-contacts', contact);
  },
  
  /**
   * 更新紧急联系人
   * @param id 联系人ID
   * @param contact 要更新的联系人信息
   * @returns 更新后的联系人
   */
  updateEmergencyContact: async (id: number, contact: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    return await api.patch<EmergencyContact>(`/patients/emergency-contacts/${id}`, contact);
  },
  
  /**
   * 删除紧急联系人
   * @param id 联系人ID
   */
  deleteEmergencyContact: async (id: number): Promise<void> => {
    await api.delete(`/patients/emergency-contacts/${id}`);
  },
  
  /**
   * 获取保险信息
   * @returns 保险信息
   */
  getInsuranceInfo: async (): Promise<InsuranceInfo> => {
    return await api.get<InsuranceInfo>('/patients/insurance');
  },
  
  /**
   * 添加或更新保险信息
   * @param insuranceInfo 保险信息
   * @returns 保存后的保险信息
   */
  saveInsuranceInfo: async (insuranceInfo: InsuranceInfo): Promise<InsuranceInfo> => {
    return await api.put<InsuranceInfo>('/patients/insurance', insuranceInfo);
  }
}; 