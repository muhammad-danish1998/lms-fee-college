import { formatCurrency, formatDate } from './feeCalculator';

export function printFeeSlip({ student, latestPayment = null }) {
  if (!student) return;

  const collegeName = import.meta.env.COLLEGE_NAME || "JMT Public Higher Secondary School and College";
  const collegePhone = import.meta.env.COLLEGE_PHONE || "+92 3424049132";
  const collegeAddress = import.meta.env.COLLEGE_ADDRESS || "Plot#381, street 9 Qazzafi town Bin Qasim Malir karachi";

  const totalFee = Number(student.total_fee) || 0;
  const totalPaid = Number(student.total_paid) || 0;
  const remainingDues = Number(student.dues) || 0;
  const isPaidInFull = remainingDues === 0;

  const paidToday = latestPayment ? Number(latestPayment.amount) : 0;
  const previousPaid = Math.max(0, totalPaid - paidToday);
  const receiptNo = latestPayment?.receipt_no || `RCP-${student.id.slice(0, 6).toUpperCase()}`;
  const slipDate = latestPayment?.payment_date || new Date().toISOString().split('T')[0];

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fee Slip - ${student.student_name}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      padding: 0;
      display: flex;
      justify-content: center;
    }
    .slip-card {
      position: relative;
      width: 100%;
      max-width: 190mm;
      border: 2px solid #0d9488;
      border-radius: 12px;
      padding: 20px 24px;
      background: #ffffff;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 320px;
      height: 320px;
      opacity: 0.05;
      pointer-events: none;
      z-index: 1;
    }
    .content-layer {
      position: relative;
      z-index: 2;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo {
      width: 65px;
      height: 65px;
      object-fit: contain;
    }
    .college-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .college-meta {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
    }
    .header-badge {
      background: #f0fdfa;
      color: #0f766e;
      border: 1.5px solid #0d9488;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: right;
      letter-spacing: 0.5px;
    }
    .meta-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      font-size: 11.5px;
    }
    .meta-item span.label {
      color: #64748b;
      display: block;
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .meta-item span.val {
      color: #0f172a;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      font-size: 11.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #f1f5f9;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .info-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .info-row span.k {
      color: #64748b;
    }
    .info-row span.v {
      font-weight: 600;
      color: #0f172a;
    }
    .table-container {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 7px 12px;
      border-bottom: 1px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 10px;
    }
    td {
      padding: 6.5px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .font-bold {
      font-weight: 700;
    }
    .status-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 11.5px;
    }
    .status-paid {
      background: #ecfdf5;
      border: 1.5px solid #10b981;
      color: #065f46;
    }
    .status-due {
      background: #fffbeb;
      border: 1.5px solid #f59e0b;
      color: #92400e;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
      padding-top: 10px;
    }
    .sign-line {
      border-top: 1px solid #94a3b8;
      text-align: center;
      padding-top: 6px;
      font-size: 10.5px;
      color: #334155;
      font-weight: 600;
    }
    .footer-note {
      text-align: center;
      margin-top: 14px;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="slip-card">
    <img src="/src/assets/logo.svg" class="watermark" alt="Watermark" />

    <div class="content-layer">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <img src="/src/assets/logo.svg" class="logo" alt="Logo" />
          <div>
            <div class="college-title">${collegeName}</div>
            <div class="college-meta">${collegeAddress}</div>
            <div class="college-meta" style="color: #0d9488; font-weight: 600;">Phone: ${collegePhone}</div>
          </div>
        </div>
        <div>
          <div class="header-badge">Fee Payment Slip</div>
          <div style="font-size: 9px; color: #64748b; text-align: right; margin-top: 3px;">Student &amp; Office Copy</div>
        </div>
      </div>

      <!-- Metadata Bar -->
      <div class="meta-bar">
        <div class="meta-item">
          <span class="label">Receipt Number</span>
          <span class="val" style="color: #0d9488; font-family: monospace;">${receiptNo}</span>
        </div>
        <div class="meta-item">
          <span class="label">Payment Date</span>
          <span class="val">${formatDate(slipDate)}</span>
        </div>
        <div class="meta-item" style="text-align: right;">
          <span class="label">Payment Method</span>
          <span class="val">${latestPayment?.payment_method || 'Cash'}</span>
        </div>
      </div>

      <!-- Student Info Grid -->
      <div class="info-grid">
        <div>
          <div class="info-row">
            <span class="k">Student Name:</span>
            <span class="v">${student.student_name}</span>
          </div>
          <div class="info-row">
            <span class="k">Father Name:</span>
            <span class="v">${student.father_name}</span>
          </div>
          <div class="info-row">
            <span class="k">Student CNIC:</span>
            <span class="v" style="font-family: monospace;">${student.student_cnic || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="k">Contact Number:</span>
            <span class="v">${student.contact_number || 'N/A'}</span>
          </div>
        </div>

        <div>
          <div class="info-row">
            <span class="k">Admission Session:</span>
            <span class="v">${student.admission_session}</span>
          </div>
          <div class="info-row">
            <span class="k">Admission Type:</span>
            <span class="v" style="color: #0f766e;">${student.admission_type}</span>
          </div>
          <div class="info-row">
            <span class="k">Program / Group:</span>
            <span class="v">${student.program_group}</span>
          </div>
          <div class="info-row">
            <span class="k">Academic Class:</span>
            <span class="v" style="color: #0d9488; font-weight: 700;">${student.academic_class}</span>
          </div>
        </div>
      </div>

      <!-- Fee Ledger Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Fee Particulars Description</th>
              <th class="text-right">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Agreed Course / Admission Fee</td>
              <td class="text-right font-bold">${formatCurrency(totalFee)}</td>
            </tr>
            ${paidToday > 0 ? `
            <tr style="color: #64748b;">
              <td>Previous Payments Received</td>
              <td class="text-right">${formatCurrency(previousPaid)}</td>
            </tr>
            <tr style="background: #f0fdfa; font-weight: 600; color: #0d9488;">
              <td>Amount Paid Today (${formatDate(slipDate)})</td>
              <td class="text-right font-bold">${formatCurrency(paidToday)}</td>
            </tr>
            ` : ''}
            <tr style="background: #f8fafc; font-weight: 700;">
              <td>Cumulative Total Amount Paid</td>
              <td class="text-right font-bold" style="color: #059669;">${formatCurrency(totalPaid)}</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 800; font-size: 12.5px;">
              <td>Remaining Outstanding Fee Dues</td>
              <td class="text-right font-bold" style="color: ${remainingDues > 0 ? '#b45309' : '#059669'};">
                ${formatCurrency(remainingDues)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Status Banner -->
      ${isPaidInFull ? `
      <div class="status-card status-paid">
        <div>
          <strong style="font-size: 13px;">STATUS: PAID IN FULL</strong>
          <div style="font-size: 10px; margin-top: 2px;">All tuition and course fees are settled. Thank you!</div>
        </div>
        <div style="font-weight: 800; font-size: 13px;">Rs. 0 DUES</div>
      </div>
      ` : `
      <div class="status-card status-due">
        <div>
          <strong style="font-size: 13px;">STATUS: PAYMENT DUE</strong>
          <div style="font-size: 10px; margin-top: 2px;">
            Next Due Date: <strong>${formatDate(student.next_payment_due_date)}</strong>
            ${student.promised_amount ? ` (Promised: ${formatCurrency(student.promised_amount)})` : ''}
          </div>
        </div>
        <div style="font-weight: 800; font-size: 13px; color: #b91c1c;">
          ${formatCurrency(remainingDues)}
        </div>
      </div>
      `}

      <!-- Signatures -->
      <div class="signatures">
        <div class="sign-line">
          Student / Depositor Signature
        </div>
        <div class="sign-line">
          Accounts Officer / Authorized Signatory
          <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">${collegeName}</div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="footer-note">
        This is an official computer-generated fee receipt. Valid without stamp when signed by authorized staff.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Create an isolated hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Trigger print once iframe resources are loaded
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}
