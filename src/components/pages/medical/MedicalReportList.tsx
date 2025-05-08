'use client';

import React, { useState, useEffect } from 'react';
import { patientClient } from '@/lib/api';

interface MedicalReport {
  id: string;
  title: string;
  content: string;
  date: string;
  doctor: {
    name: string;
    specialty: string;
  };
}

export default function MedicalReportList() {
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);

  useEffect(() => {
    const fetchMedicalReports = async () => {
      try {
        // 使用新的patientClient获取医疗记录
        const data = await patientClient.getMedicalRecords();
        
        // 转换数据格式以匹配组件需要的结构
        const formattedReports = data.map(record => ({
          id: record.id.toString(),
          title: `Medical Record #${record.id}`,
          content: record.diagnosis || record.notes,
          date: record.createdAt,
          doctor: {
            name: record.doctor?.user?.firstName + ' ' + record.doctor?.user?.lastName || 'Unknown',
            specialty: 'Specialist'
          }
        }));
        
        setMedicalReports(formattedReports);
      } catch (error) {
        console.error('Failed to fetch medical reports:', error);
      }
    };

    fetchMedicalReports();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Reports</h2>
      {medicalReports.length > 0 ? (
        <div className="space-y-4">
          {medicalReports.map((report) => (
            <div key={report.id} className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900">{report.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{report.content}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>Dr. {report.doctor.name}</span>
                <span>{new Date(report.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No medical reports</p>
      )}
    </div>
  );
} 