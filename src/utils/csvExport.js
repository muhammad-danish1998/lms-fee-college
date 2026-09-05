import { formatDate } from './feeCalculator';

export function exportStudentsToCSV(students = [], filename = 'students_fee_report.csv') {
  if (!students || students.length === 0) {
    alert('No student records available to export.');
    return;
  }

  const headers = [
    'Student Name',
    'Father Name',
    'Contact Number',
    'Student CNIC',
    'Session',
    'Admission Type',
    'Program / Group',
    'Class',
    'Total Fee (PKR)',
    'Total Paid (PKR)',
    'Remaining Dues (PKR)',
    'Fee Status',
    'Next Due Date',
    'Promised Amount (PKR)',
    'Commitment Status',
    'Progress Stage',
    'Enrolled Date'
  ];

  const rows = students.map(s => [
    `"${(s.student_name || '').replace(/"/g, '""')}"`,
    `"${(s.father_name || '').replace(/"/g, '""')}"`,
    `"${(s.contact_number || '').replace(/"/g, '""')}"`,
    `"${(s.student_cnic || '').replace(/"/g, '""')}"`,
    `"${s.admission_session || ''}"`,
    `"${s.admission_type || ''}"`,
    `"${(s.program_group || '').replace(/"/g, '""')}"`,
    `"${s.academic_class || ''}"`,
    Number(s.total_fee) || 0,
    Number(s.total_paid) || 0,
    Number(s.dues) || 0,
    `"${s.fee_status || ''}"`,
    `"${formatDate(s.next_payment_due_date)}"`,
    Number(s.promised_amount) || 0,
    `"${s.commitment_status || 'None'}"`,
    `"${s.current_progress || ''}"`,
    `"${formatDate(s.created_at)}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
