'use client';

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { GenerateReportRequest } from '@/lib/api/admin-dashboard-client';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GenerateReportRequest) => Promise<any>;
  isLoading: boolean;
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
  isLoading
}: GenerateReportModalProps) {
  const [formData, setFormData] = useState<GenerateReportRequest>({
    report_type: 'appointments',
    date_from: '',
    date_to: '',
    department_id: '',
    format: 'json'
  });

  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const report = await onGenerate(formData);
    if (report) {
      setGeneratedReport(report);
    }
  };

  const handleInputChange = (field: keyof GenerateReportRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDownload = () => {
    if (!generatedReport) return;

    const dataStr = JSON.stringify(generatedReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.report_type}_report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setGeneratedReport(null);
    setFormData({
      report_type: 'appointments',
      date_from: '',
      date_to: '',
      department_id: '',
      format: 'json'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Generate Report</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!generatedReport ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={formData.report_type}
                  onChange={(e) => handleInputChange('report_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="appointments">Appointments Report</option>
                  <option value="patients">Patients Report</option>
                  <option value="doctors">Doctors Report</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={formData.date_from}
                    onChange={(e) => handleInputChange('date_from', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={formData.date_to}
                    onChange={(e) => handleInputChange('date_to', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department (Optional)
                </label>
                <input
                  type="text"
                  value={formData.department_id}
                  onChange={(e) => handleInputChange('department_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department ID (optional)"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Report Generated Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Your {formData.report_type} report has been generated and is ready for download.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-800 mb-2">Report Summary:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Type:</span> {formData.report_type}</p>
                  <p><span className="font-medium">Generated:</span> {generatedReport.generated_at}</p>
                  {formData.date_from && (
                    <p><span className="font-medium">Date Range:</span> {formData.date_from} to {formData.date_to}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 