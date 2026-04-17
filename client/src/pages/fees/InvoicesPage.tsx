import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useGetStudentFeesQuery, useGetInvoicesQuery } from '../../store/api/endpoints';
import { DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useWindowTitle } from '../../hooks';

export default function InvoicesPage() {
  useWindowTitle('Invoices');
  const user = useSelector(selectCurrentUser);
  const isAdmin = ['superAdmin', 'schoolAdmin'].includes(user?.role || '');

  const { data: adminData, isLoading: adminLoading, isError: adminError } = useGetInvoicesQuery({}, { skip: !isAdmin });
  const { data: studentData, isLoading: studentLoading } = useGetStudentFeesQuery(
    user?._id || '',
    { skip: isAdmin || !user?._id }
  );

  const isLoading = isAdmin ? adminLoading : studentLoading;
  const isError = isAdmin ? adminError : false;

  if (isError) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="card p-8 text-center max-w-sm">
        <p className="text-danger font-semibold">Failed to load invoices</p>
        <p className="text-text-secondary text-sm mt-2">Please refresh the page.</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm mt-4">Refresh</button>
      </div>
    </div>
  );

  if (isAdmin) {
    const invoices = adminData?.data?.invoices || [];
    return (
      <div className="p-6 space-y-6">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-display font-bold text-text-primary">All Invoices</h1>
          <p className="text-text-secondary text-sm">{invoices.length} invoices</p>
        </div>
        <div className="table-container animate-fade-up animate-fade-up-delay-1">
          <table>
            <thead><tr><th>Invoice</th><th>Student</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-5 rounded w-full"/></td></tr>)
                : invoices.length === 0
                ? <tr><td colSpan={7} className="text-center py-16 text-text-secondary text-sm">No invoices found. Go to Fee Management to generate invoices for a class.</td></tr>
                : invoices.map((inv: any) => (
                <tr key={inv._id}>
                  <td className="font-mono text-xs text-text-tertiary">{inv.invoiceNumber}</td>
                  <td className="text-sm text-text-primary">{inv.studentId?.userId?.firstName} {inv.studentId?.userId?.lastName}</td>
                  <td className="text-sm font-semibold">${inv.totalAmount?.toLocaleString()}</td>
                  <td className="text-sm text-success">${inv.paidAmount?.toLocaleString()}</td>
                  <td className={`text-sm font-semibold ${inv.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>${inv.balanceDue?.toLocaleString()}</td>
                  <td className="text-sm text-text-secondary">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge text-xs ${inv.status==='paid'?'badge-success':inv.status==='overdue'?'badge-danger':'badge-warning'}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Student view
  const fees = studentData?.data;
  const invoices = fees?.invoices || [];

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">My Fees</h1>
        <p className="text-text-secondary text-sm">Your fee invoices and payment history</p>
      </div>

      {/* Summary */}
      {fees?.summary && (
        <div className="grid grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-1">
          {[
            { label: 'Total Fees', value: fees.summary.total, icon: DollarSign, color: '#888' },
            { label: 'Paid', value: fees.summary.paid, icon: CheckCircle, color: '#10B981' },
            { label: 'Due', value: fees.summary.pending, icon: AlertCircle, color: fees.summary.pending > 0 ? '#EF4444' : '#10B981' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-text-secondary text-sm">{s.label}</p>
                <s.icon size={16} style={{ color: s.color }}/>
              </div>
              <p className="text-2xl font-display font-bold" style={{ color: s.color }}>${(s.value||0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Invoice list */}
      <div className="space-y-3 animate-fade-up animate-fade-up-delay-2">
        {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-card"/>)
        : invoices.length === 0 ? (
          <div className="card p-16 text-center"><DollarSign size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/><p className="text-text-secondary text-sm">No invoices found</p></div>
        ) : invoices.map((inv: any) => (
          <div key={inv._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-text-tertiary">{inv.invoiceNumber}</p>
                <p className="font-display font-semibold text-text-primary mt-0.5">
                  {inv.month ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][inv.month-1]} ${inv.year}` : inv.year}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                  <Clock size={11}/>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="text-right">
                <span className={`badge text-xs ${inv.status==='paid'?'badge-success':inv.status==='overdue'?'badge-danger':inv.status==='partial'?'badge-warning':'badge-neutral'}`}>{inv.status}</span>
                <p className="text-xl font-display font-bold text-text-primary mt-2">${inv.totalAmount?.toLocaleString()}</p>
                {inv.balanceDue > 0 && <p className="text-xs text-danger mt-0.5">Due: ${inv.balanceDue?.toLocaleString()}</p>}
              </div>
            </div>

            {inv.items?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                {inv.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-text-secondary">
                    <span>{item.name}</span>
                    <span>${item.finalAmount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {inv.status !== 'paid' && (
              <button className="mt-4 w-full py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all">
                Pay Now — ${inv.balanceDue?.toLocaleString()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
