import React, { useState } from 'react';
import {
  useGetInvoicesQuery, useRecordPaymentMutation, useSendRemindersMutation,
  useGetFeeStructuresQuery, useCreateFeeStructureMutation, useGenerateInvoicesMutation,
  useGetClassesQuery,
} from '../../store/api/endpoints';
import {
  DollarSign, CheckCircle, AlertCircle, Send, Loader2, X,
  Plus, Settings, FileText, ChevronDown, ChevronRight, Trash2, Download
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useWindowTitle } from '../../hooks';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const statusBadge: Record<string, string> = {
  paid: 'badge-success', partial: 'badge-warning',
  pending: 'badge-neutral', overdue: 'badge-danger', cancelled: 'badge-neutral',
};

function StructureCard({ structure }: { structure: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/2 transition-all text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText size={15} className="text-accent" />
          </div>
          <div>
            <p className="font-display font-semibold text-text-primary text-sm">{structure.name}</p>
            <p className="text-xs text-text-tertiary">
              {structure.classId ? `${structure.classId.name} ${structure.classId.section}` : 'All Classes'} · {structure.category} · {structure.academicYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-display font-bold text-text-primary">
            ${structure.components?.reduce((a: number, c: any) => a + c.amount, 0).toLocaleString()}/mo
          </span>
          {expanded ? <ChevronDown size={15} className="text-text-tertiary" /> : <ChevronRight size={15} className="text-text-tertiary" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {structure.components?.map((c: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-text-primary">{c.name}</p>
                <p className="text-xs text-text-tertiary capitalize">{c.frequency} · {c.isMandatory ? 'Mandatory' : 'Optional'}</p>
              </div>
              <span className="text-sm font-semibold text-text-primary">${c.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateStructureModal({ onClose }: { onClose: () => void }) {
  const { data: classesData } = useGetClassesQuery();
  const [createStructure, { isLoading }] = useCreateFeeStructureMutation();
  const classes = classesData?.data || [];
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: '', category: 'regular',
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      classId: '',
      components: [{ name: 'Tuition Fee', amount: 500, frequency: 'monthly', isMandatory: true }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'components' });

  const onSubmit = async (data: any) => {
    try {
      await createStructure({
        ...data, classId: data.classId || undefined,
        components: data.components.map((c: any) => ({ ...c, amount: Number(c.amount) })),
        totalAnnual: data.components.reduce((a: number, c: any) => a + Number(c.amount) * 12, 0),
      }).unwrap();
      toast.success('Fee structure created');
      onClose();
    } catch (err: any) { toast.error(err?.data?.message || 'Failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#111827]">
          <h2 className="font-display font-bold text-xl text-text-primary">Create Fee Structure</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Name *</label>
              <input {...register('name', { required: true })} placeholder="e.g. Regular Monthly" className="input mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
              <select {...register('category')} className="input mt-1.5">
                {['regular','scholarship','staff','sibling','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Academic Year</label>
              <input {...register('academicYear')} placeholder="2024-2025" className="input mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Class (optional)</label>
              <select {...register('classId')} className="input mt-1.5">
                <option value="">All Classes</option>
                {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Fee Components</label>
              <button type="button" onClick={() => append({ name: '', amount: 0, frequency: 'monthly', isMandatory: true })}
                className="text-xs text-accent hover:underline flex items-center gap-1">
                <Plus size={12} /> Add Component
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="card p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register(`components.${i}.name`, { required: true })} placeholder="Component name" className="input text-sm" />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">$</span>
                        <input {...register(`components.${i}.amount`)} type="number" placeholder="0" className="input text-sm pl-7" />
                      </div>
                      <button type="button" onClick={() => fields.length > 1 && remove(i)} disabled={fields.length === 1}
                        className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-30">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select {...register(`components.${i}.frequency`)} className="input text-xs flex-1">
                      {['monthly','quarterly','annual','once'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input type="checkbox" {...register(`components.${i}.isMandatory`)} defaultChecked className="w-3.5 h-3.5 rounded" />
                      Mandatory
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isLoading ? 'Creating...' : 'Create Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenerateInvoicesModal({ onClose }: { onClose: () => void }) {
  const { data: classesData } = useGetClassesQuery();
  const { data: structuresData } = useGetFeeStructuresQuery();
  const [generateInvoices, { isLoading }] = useGenerateInvoicesMutation();
  const classes = classesData?.data || [];
  const structures = structuresData?.data || [];
  const today = new Date();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      classId: '', feeStructureId: '',
      month: today.getMonth() + 1, year: today.getFullYear(),
      dueDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await generateInvoices({ ...data, month: Number(data.month), year: Number(data.year) }).unwrap();
      toast.success(res.data?.count ? `${res.data.count} invoices generated` : 'Invoices already exist for this period');
      onClose();
    } catch (err: any) { toast.error(err?.data?.message || 'Failed to generate invoices'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-xl text-text-primary">Generate Invoices</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Create fee invoices for an entire class</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Class *</label>
            <select {...register('classId', { required: 'Select a class' })} className="input mt-1.5">
              <option value="">Select class...</option>
              {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name} — Section {c.section}</option>)}
            </select>
            {errors.classId && <p className="text-danger text-xs mt-1">{String(errors.classId.message)}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Fee Structure *</label>
            <select {...register('feeStructureId', { required: 'Select a fee structure' })} className="input mt-1.5">
              <option value="">Select structure...</option>
              {structures.length === 0
                ? <option disabled>No structures — create one first</option>
                : structures.map((s: any) => <option key={s._id} value={s._id}>{s.name} — {s.category}</option>)}
            </select>
            {errors.feeStructureId && <p className="text-danger text-xs mt-1">{String(errors.feeStructureId.message)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Month *</label>
              <select {...register('month')} className="input mt-1.5">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Year *</label>
              <input {...register('year')} type="number" className="input mt-1.5" min={2020} max={2035} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Due Date *</label>
            <input {...register('dueDate', { required: true })} type="date" className="input mt-1.5" />
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-xs text-text-secondary">
            Invoices will be generated for every <strong>active</strong> student in the selected class. Students who already have an invoice for this month/year are skipped.
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {isLoading ? 'Generating...' : 'Generate Invoices'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FeesPage() {
  useWindowTitle('Fee Management');
  const [tab, setTab] = useState<'invoices' | 'structures'>('invoices');
  const [statusFilter, setStatusFilter] = useState('');
  const [payModal, setPayModal] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [showCreateStructure, setShowCreateStructure] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  const { data, isLoading, isError } = useGetInvoicesQuery({ status: statusFilter });
  const { data: structuresData, isLoading: structuresLoading } = useGetFeeStructuresQuery();
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();
  const [sendReminders, { isLoading: isSending }] = useSendRemindersMutation();

  const invoices = data?.data?.invoices || [];
  const feeStats = data?.data?.stats;
  const structures = structuresData?.data || [];

  if (isError) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="card p-8 text-center max-w-sm">
        <p className="text-danger font-semibold">Failed to load fee data</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm mt-4">Refresh</button>
      </div>
    </div>
  );

  const handlePayment = async () => {
    if (!payAmount || isNaN(Number(payAmount))) return toast.error('Enter a valid amount');
    try {
      await recordPayment({ id: payModal._id, data: { amount: Number(payAmount), method: payMethod } }).unwrap();
      toast.success('Payment recorded');
      setPayModal(null); setPayAmount('');
    } catch (err: any) { toast.error(err?.data?.message || 'Payment failed'); }
  };

  const handleExport = () => {
    const rows = invoices.map((inv: any) => {
      const name = `${inv.studentId?.userId?.firstName || ''} ${inv.studentId?.userId?.lastName || ''}`.trim();
      return [inv.invoiceNumber, name, inv.totalAmount, inv.paidAmount, inv.balanceDue,
              inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '', inv.status]
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = ['"Invoice","Student","Total","Paid","Balance","Due Date","Status"', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Fee Management</h1>
          <p className="text-text-secondary text-sm">Manage fee structures, generate invoices and track payments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => sendReminders().unwrap().then(r => toast.success(`${r.data?.sent ?? 0} reminders sent`)).catch(() => toast.error('Failed to send reminders'))} disabled={isSending} className="btn-secondary text-sm flex items-center gap-2">
            {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Reminders
          </button>
          <button onClick={() => setShowCreateStructure(true)} className="btn-secondary text-sm flex items-center gap-2">
            <Settings size={14} /> Fee Structure
          </button>
          <button onClick={() => setShowGenerate(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={14} /> Generate Invoices
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-1">
        {[
          { label: 'Total Invoiced', value: feeStats?.totalInvoiced, icon: DollarSign, color: '#0066FF' },
          { label: 'Collected', value: feeStats?.totalCollected, icon: CheckCircle, color: '#10B981' },
          { label: 'Pending', value: feeStats?.totalPending, icon: AlertCircle, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-secondary text-sm">{s.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">${(s.value || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl border border-white/5 w-fit animate-fade-up">
        {(['invoices', 'structures'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            {t === 'invoices' ? `Invoices (${invoices.length})` : `Structures (${structures.length})`}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {['', 'pending', 'partial', 'paid', 'overdue'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-white/5'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Student</th><th>Period</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {isLoading ? [...Array(5)].map((_, i) => <tr key={i}>{[...Array(9)].map((_, j) => <td key={j}><div className="skeleton h-5 rounded w-20"/></td>)}</tr>)
                : invoices.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16">
                    <DollarSign size={36} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
                    <p className="text-text-secondary text-sm font-medium">No invoices found</p>
                    <p className="text-text-tertiary text-xs mt-1">Click <strong>Generate Invoices</strong> to create invoices for a class</p>
                    <button onClick={() => setShowGenerate(true)} className="btn-primary text-sm mt-4 inline-flex"><Plus size={14}/> Generate Invoices</button>
                  </td></tr>
                ) : invoices.map((inv: any) => (
                  <tr key={inv._id}>
                    <td className="font-mono text-xs text-text-tertiary">{inv.invoiceNumber}</td>
                    <td className="text-sm text-text-primary font-medium">{inv.studentId?.userId?.firstName} {inv.studentId?.userId?.lastName}</td>
                    <td className="text-sm text-text-secondary">{inv.month ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][inv.month-1]} ${inv.year}` : inv.year}</td>
                    <td className="text-sm font-semibold">${inv.totalAmount?.toLocaleString()}</td>
                    <td className="text-sm text-success">${inv.paidAmount?.toLocaleString()}</td>
                    <td className={`text-sm font-semibold ${inv.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>${inv.balanceDue?.toLocaleString()}</td>
                    <td className="text-sm text-text-secondary">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge text-xs ${statusBadge[inv.status]||'badge-neutral'}`}>{inv.status}</span></td>
                    <td>{inv.status !== 'paid' && <button onClick={() => { setPayModal(inv); setPayAmount(String(inv.balanceDue)); }} className="text-xs text-accent hover:underline font-medium whitespace-nowrap">Record Payment</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'structures' && (
        <div className="space-y-3 animate-fade-up">
          {structuresLoading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-card"/>)
          : structures.length === 0 ? (
            <div className="card p-16 text-center">
              <Settings size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
              <p className="text-text-secondary text-sm font-medium">No fee structures yet</p>
              <p className="text-text-tertiary text-xs mt-1">Create a fee structure first, then generate invoices for your classes</p>
              <button onClick={() => setShowCreateStructure(true)} className="btn-primary text-sm mt-4 inline-flex"><Plus size={14}/> Create Fee Structure</button>
            </div>
          ) : structures.map((s: any) => <StructureCard key={s._id} structure={s}/>)}
        </div>
      )}

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="font-display font-bold text-xl text-text-primary">Record Payment</h2>
                <p className="text-xs text-text-tertiary mt-0.5">Invoice #{payModal.invoiceNumber}</p>
              </div>
              <button onClick={() => setPayModal(null)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Balance Due</span>
                <span className="font-bold text-danger">${payModal.balanceDue?.toLocaleString()}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount *</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">$</span>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} max={payModal.balanceDue} className="input pl-7"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Payment Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input mt-1.5">
                  {['cash','online','cheque','card','upi'].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setPayModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePayment} disabled={isPaying} className="btn-primary flex-1 justify-center">
                  {isPaying ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
                  {isPaying ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateStructure && <CreateStructureModal onClose={() => setShowCreateStructure(false)}/>}
      {showGenerate && <GenerateInvoicesModal onClose={() => setShowGenerate(false)}/>}
    </div>
  );
}
