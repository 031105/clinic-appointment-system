'use client';

import React, { useState, useEffect } from 'react';

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
        const response = await fetch('/api/medical-reports');
        const data = await response.json();
        setMedicalReports(data);
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