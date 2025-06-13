'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorMedicalRecords } from '@/hooks/doctor/useDoctorMedicalRecords';
import { DoctorMedicalRecord } from '@/lib/api/doctor-medical-records-client';
import { Printer, Download, Calendar, Search, RefreshCcw, Users, FileText, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DoctorReportsPage() {
  const router = useRouter();
  const { 
    medicalRecords, 
    stats, 
    loading, 
    error, 
    searchMedicalRecords, 
    filterByPatient, 
    filterByDateRange,
    changePage,
    refresh,
    pagination,
    statsLoading
  } = useDoctorMedicalRecords();

  const [selectedRecord, setSelectedRecord] = useState<DoctorMedicalRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  
  // Handle retry button click
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refresh();
    } catch (e) {
      console.error('Retry failed:', e);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchMedicalRecords(query);
  };
  
  // Filter medical records based on search query (client-side backup)
  const filteredRecords = React.useMemo(() => {
    if (!searchQuery.trim()) return medicalRecords;
    
    const query = searchQuery.toLowerCase();
    return medicalRecords.filter(record => {
      return (
        (record.diagnosis && record.diagnosis.toLowerCase().includes(query)) ||
        (record.notes && record.notes.toLowerCase().includes(query)) ||
        (record.patient?.firstName && record.patient.firstName.toLowerCase().includes(query)) ||
        (record.patient?.lastName && record.patient.lastName.toLowerCase().includes(query))
      );
    });
  }, [medicalRecords, searchQuery]);

  // Handle print functionality
  const handlePrint = () => {
    if (!selectedRecord) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const patientName = selectedRecord.patient 
      ? `${selectedRecord.patient.firstName} ${selectedRecord.patient.lastName}`
      : 'Unknown Patient';
      
    const createdDate = new Date(selectedRecord.createdAt).toLocaleDateString();
    const diagnosis = selectedRecord.diagnosis || 'No diagnosis provided';
    const notes = selectedRecord.notes || 'No notes';
    
    // Create prescription list if available
    let prescriptionHtml = '<p>No prescription</p>';
    if (selectedRecord.prescription && selectedRecord.prescription.length > 0) {
      prescriptionHtml = '<ul>';
      selectedRecord.prescription.forEach((med: any) => {
        if (typeof med === 'string') {
          prescriptionHtml += `<li>${med}</li>`;
        } else if (typeof med === 'object' && med !== null) {
          prescriptionHtml += `<li>${med.medicationName}: ${med.dosage} - ${med.frequency}`;
          if (med.duration) prescriptionHtml += ` for ${med.duration}`;
          if (med.instructions) prescriptionHtml += ` (${med.instructions})`;
          prescriptionHtml += '</li>';
        }
      });
      prescriptionHtml += '</ul>';
    }
    
    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Report #${selectedRecord.id}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin-bottom: 5px; }
            .section { margin-bottom: 20px; }
            .section h3 { border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Report</h1>
            <p>Report ID: ${selectedRecord.id}</p>
            <p>Created: ${createdDate}</p>
          </div>
          
          <div class="section">
            <h3>Patient Information</h3>
            <p><span class="label">Patient:</span> ${patientName}</p>
          </div>
          
          <div class="section">
            <h3>Diagnosis</h3>
            <p>${diagnosis}</p>
          </div>
          
          <div class="section">
            <h3>Prescription</h3>
            ${prescriptionHtml}
          </div>
          
          <div class="section">
            <h3>Notes</h3>
            <p>${notes}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !selectedRecord) return;
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`medical_report_${selectedRecord.id}.pdf`);
  };

  // Loading state
  if (loading && medicalRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical reports...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && medicalRecords.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Could not load medical reports</h2>
          <p className="text-gray-600 mb-6">
            There was an error connecting to the server. This might be due to network issues or the server being unavailable.
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full flex items-center justify-center"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCcw className="animate-spin h-4 w-4 mr-2" /> 
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" /> 
                  Retry
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/doctor-dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Medical Reports</h1>
        
        {/* Statistics Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recordsThisMonth}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recordsThisWeek}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Unique Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniquePatients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">Rx</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">With Prescription</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recordsWithPrescription}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar - Reports List */}
        <div className="w-96 bg-white border-r border-gray-200 p-5 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Reports list */}
            <div className="space-y-2">
              {filteredRecords.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No medical reports found</p>
                </div>
              ) : (
                filteredRecords.map(record => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedRecord?.id === record.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {record.patient ? `${record.patient.firstName} ${record.patient.lastName}` : 'Unknown Patient'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {record.diagnosis || 'No diagnosis provided'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Report Details */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedRecord ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6" ref={reportRef}>
                {/* Report Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold">
                      Medical Report #{selectedRecord.id}
                    </h1>
                    <p className="text-gray-500">
                      Created on {new Date(selectedRecord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePrint}
                      className="flex items-center"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportPDF}
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Patient Info */}
                {selectedRecord.patient && (
                  <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">
                        {selectedRecord.patient.firstName} {selectedRecord.patient.lastName}
                      </h2>
                      <p className="text-gray-600">{selectedRecord.patient.email}</p>
                      <p className="text-gray-600">{selectedRecord.patient.phone}</p>
                    </div>
                  </div>
                )}

                {/* Report Sections */}
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Diagnosis</h3>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-gray-800">
                        {selectedRecord.diagnosis || 'No diagnosis provided'}
                      </p>
                    </div>
                  </div>

                  {/* Prescription */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Prescription</h3>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      {selectedRecord.prescription && selectedRecord.prescription.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedRecord.prescription.map((med: any, index: number) => (
                            <li key={index} className="px-3 py-2 bg-gray-50 rounded">
                              {typeof med === 'string' ? med : 
                                typeof med === 'object' && med !== null ? (
                                  <div>
                                    <span className="font-medium">{med.medicationName}:</span> {med.dosage} - {med.frequency} 
                                    {med.duration ? ` for ${med.duration}` : ''}
                                    {med.instructions ? 
                                      <div className="mt-1 text-sm text-gray-600">
                                        Instructions: {med.instructions}
                                      </div> : null
                                    }
                                  </div>
                                ) : JSON.stringify(med)
                              }
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No prescription</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selectedRecord.notes || 'No notes available'}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  {selectedRecord.appointment && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Related Appointment</h3>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <p className="text-gray-800">
                          <span className="font-medium">Date:</span> {new Date(selectedRecord.appointment.dateTime).toLocaleDateString()}
                        </p>
                        <p className="text-gray-800">
                          <span className="font-medium">Type:</span> {selectedRecord.appointment.type}
                        </p>
                        <p className="text-gray-800">
                          <span className="font-medium">Status:</span> {selectedRecord.appointment.status}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a Medical Report</h2>
              <p className="text-gray-600 max-w-md">
                Please select a medical report from the list to view its details. 
                {filteredRecords.length === 0 && " You don't have any medical reports yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 