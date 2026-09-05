/**
 * Financial Calculation Utilities
 * Strictly adhering to Section 13, 14, 17, 33, 35 of AGENTS.md
 */

/**
 * Calculates total paid from an array of payment objects
 * Total Paid = Sum of all successful payments
 */
export function calculateTotalPaid(payments = []) {
  if (!Array.isArray(payments) || payments.length === 0) return 0;
  return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

/**
 * Calculates remaining dues
 * Dues = Total Fee - Total Paid
 */
export function calculateDues(totalFee = 0, totalPaid = 0) {
  const fee = Number(totalFee) || 0;
  const paid = Number(totalPaid) || 0;
  return Math.max(0, fee - paid);
}

/**
 * Calculates fee status based on:
 * - Unpaid: totalPaid = 0 and dues > 0
 * - Partial / Due: totalPaid > 0 and dues > 0
 * - Paid in Full: dues <= 0
 * - Overdue: dues > 0 and dueDate passed
 */
export function calculateFeeStatus(totalFee = 0, totalPaid = 0, dueDate = null) {
  const fee = Number(totalFee) || 0;
  const paid = Number(totalPaid) || 0;
  const dues = calculateDues(fee, paid);

  if (dues <= 0 && fee > 0) {
    return 'PAID IN FULL';
  }

  if (dueDate) {
    const dueTime = new Date(dueDate).setHours(23, 59, 59, 999);
    const now = new Date().getTime();
    if (dueTime < now && dues > 0) {
      return 'OVERDUE';
    }
  }

  if (paid === 0 && dues > 0) {
    return 'UNPAID';
  }

  if (paid > 0 && dues > 0) {
    return 'DUE';
  }

  return 'PAID IN FULL';
}

/**
 * Format currency with PKR format
 */
export function formatCurrency(amount = 0) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString('en-PK')}`;
}

/**
 * Format standard date
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
