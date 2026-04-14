import React, { useState } from 'react';
import { useGetInvoicesQuery, useRecordPaymentMutation, useSendRemindersMutation } from '../../store/api/endpoints';
import { DollarSign, Clock, CheckCircle, AlertCircle, Send, CreditCard, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<string, string> = {
  paid: 'badge-success', partial: 'badge-warning',
  pending: 'badge-neutral', overdue: 'badge-danger', cancelled: 'badge-neutral'
};

export default function FeesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [payModal, setPayModal] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');

  const { data, isLoading } = useGetInvoicesQuery({ status: statusFilter });
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();
  const [sendReminders, { isLoading: isSending }] = useSendRemindersMutation();

  const invoices = data?.data?.invoices || [];
  const feeStats = data?.data?.stats;

  const handlePayment = async () => {
    if (!payAmount || isNaN(Number(payAmount))) return toast.error('Enter a valid amount');
    try {
      await recordPayment({ id: payModal._id, data: { amount: Number(payAmount), method: payMethod } }).unwrap();
      toast.success('Payment recorded');
      setPayModal(null);
      setPayAmount('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Payment failed');
    }
  };

  const handleSendReminders = async () => {
    try {
      const res = await sendReminders().unwrap();
      toast.success(`${res.data.sent} reminders sent`);
    } catch {
      toast.error('Failed to send reminders');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Fee Management</h1>
          <p className="text-text-secondary text-sm">Track invoices, payments and outstanding dues</p>
        </div>
        <button onClick={handleSendReminders} disabled={isSending}
          className="btn-secondary text-sm flex items-center gap-2">
          {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send Reminders
        </button>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-1">
        {[
          { label: 'Total Invoiced', value: feeStats?.totalInvoiced, icon: DollarSign, color: '#0066FF' },
          { label: 'Collected', value: feeStats?.totalCollected, icon: CheckCircle, color: '#10B981' },
          { label: 'Pending', value: feeStats?.totalPending, icon: AlertCircle, color: '#EF4444' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-secondary text-sm">{s.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">
              ${(s.value || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap animate-fade-up animate-fade-up-delay-2">
        {['', 'pending', 'partial', 'paid', 'overdue'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              statusFilter === s
                ? 'bg-accent text-white border-accent'
                : 'text-text-secondary border-white/10 hover:border-white/20'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Invoices table */}
      <div className="table-container animate-fade-up animate-fade-up-delay-3">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Student</th>
              <th>Period</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>{[...Array(9)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded w-16" /></td>)}</tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <DollarSign size={40} className="mx-auto text-text-tertiary mb-3 opacity-30" />
                  <p className="text-text-secondary text-sm">No invoices found</p>
                </td>
              </tr>
            ) : invoices.map((inv: any) => {
              const student = inv.studentId;
              const user = student?.userId;
              return (
                <tr key={inv._id}>
                  <td className="font-mono text-xs text-text-tertiary">{inv.invoiceNumber}</td>
                  <td>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {user ? `${user.firstName} ${user.lastName}` : '—'}
                      </p>
                    </div>
                  </td>
                  <td className="text-sm text-text-secondary">
                    {inv.month ? `${inv.month}/${inv.year}` : inv.year || '—'}
                  </td>
                  <td className="text-sm font-semibold text-text-primary">${inv.totalAmount?.toLocaleString()}</td>
                  <td className="text-sm text-success">${inv.paidAmount?.toLocaleString()}</td>
                  <td className={`text-sm font-semibold ${inv.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>
                    ${inv.balanceDue?.toLocaleString()}
                  </td>
                  <td className="text-sm text-text-secondary">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td><span className={`badge ${statusConfig[inv.status] || 'badge-neutral'}`}>{inv.status}</span></td>
                  <td>
                    {inv.status !== 'paid' && (
                      <button onClick={() => { setPayModal(inv); setPayAmount(String(inv.balanceDue)); }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all font-medium">
                        <CreditCard size={12} /> Pay
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-text-primary">Record Payment</h3>
              <button onClick={() => setPayModal(null)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-bg-tertiary border border-white/5">
                <p className="text-xs text-text-tertiary">Invoice #{payModal.invoiceNumber}</p>
                <p className="text-sm text-text-secondary mt-1">Balance Due: <span className="text-danger font-semibold">${payModal.balanceDue?.toLocaleString()}</span></p>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="input mt-1.5" placeholder="0.00" max={payModal.balanceDue} />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Payment Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input mt-1.5">
                  {['cash','online','cheque','card','upi'].map(m => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPayModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePayment} disabled={isPaying} className="btn-primary flex-1 justify-center">
                  {isPaying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {isPaying ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
