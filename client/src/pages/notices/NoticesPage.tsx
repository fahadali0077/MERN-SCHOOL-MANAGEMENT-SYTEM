import React, { useState } from 'react';
import { useGetNoticesQuery, useCreateNoticeMutation, useDeleteNoticeMutation } from '../../store/api/endpoints';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/slices/authSlice';
import { Bell, Plus, X, Loader2, Trash2, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useWindowTitle } from '../../hooks';

const typeColors: Record<string, string> = {
  general: 'badge-neutral', exam: 'badge-accent', holiday: 'badge-success',
  event: 'badge-warning', urgent: 'badge-danger', circular: 'badge-neutral'
};

const priorityDot: Record<string, string> = {
  low: 'bg-success', medium: 'bg-warning', high: 'bg-danger'
};

export default function NoticesPage() {
  useWindowTitle('Notices');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const role = useSelector(selectUserRole);
  const canCreate = ['superAdmin', 'schoolAdmin', 'teacher'].includes(role || '');

  const { data, isLoading, isError } = useGetNoticesQuery({ type: typeFilter || undefined });
  const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  const notices = data?.data || [];
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createNotice({ ...data, isPublished: true, targetAudience: ['all'] }).unwrap();
      toast.success('Notice published');
      reset();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id).unwrap();
      toast.success('Notice deleted');
      if (selected?._id === id) setSelected(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (isError) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="card p-8 text-center max-w-sm">
        <p className="text-danger font-semibold">Failed to load data</p>
        <p className="text-text-secondary text-sm mt-2">Please refresh the page.</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm mt-4">Refresh</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Notice Board</h1>
          <p className="text-text-secondary text-sm">{notices.length} notices published</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            <Plus size={15} /> New Notice
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap animate-fade-up animate-fade-up-delay-1">
        {['', 'general', 'exam', 'holiday', 'event', 'urgent', 'circular'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              typeFilter === t ? 'bg-accent text-white border-accent' : 'text-text-secondary border-white/10 hover:border-white/20'
            }`}>
            {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notices list */}
        <div className="lg:col-span-1 space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-card animate-fade-up" />)
          ) : notices.length === 0 ? (
            <div className="card p-10 text-center animate-fade-up">
              <Bell size={32} className="mx-auto text-text-tertiary opacity-30 mb-3" />
              <p className="text-text-secondary text-sm">No notices yet</p>
            </div>
          ) : notices.map((notice: any, i: number) => (
            <div key={notice._id}
              onClick={() => setSelected(notice)}
              className={`card p-4 cursor-pointer animate-fade-up transition-all ${
                selected?._id === notice._id ? 'border-accent/40 bg-accent/5' : ''
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[notice.priority] || 'bg-text-tertiary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{notice.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${typeColors[notice.type] || 'badge-neutral'} text-[10px] py-0`}>{notice.type}</span>
                    <span className="text-xs text-text-tertiary">
                      {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notice detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-6 animate-fade-up">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${typeColors[selected.type] || 'badge-neutral'}`}>{selected.type}</span>
                    <span className={`badge ${selected.priority === 'high' ? 'badge-danger' : selected.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                      {selected.priority}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-text-primary">{selected.title}</h2>
                  <p className="text-xs text-text-tertiary mt-1">
                    By {selected.author?.firstName} {selected.author?.lastName} •{' '}
                    {new Date(selected.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {canCreate && (
                  <button onClick={() => handleDelete(selected._id)}
                    className="p-2 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="h-px bg-white/5 mb-4" />
              <div className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
                {selected.content}
              </div>
              {selected.views > 0 && (
                <div className="flex items-center gap-1.5 mt-4 text-xs text-text-tertiary">
                  <Eye size={12} /> {selected.views} views
                </div>
              )}
            </div>
          ) : (
            <div className="card p-16 text-center animate-fade-up">
              <Bell size={40} className="mx-auto text-text-tertiary opacity-20 mb-3" />
              <p className="text-text-secondary text-sm">Select a notice to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Notice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-bg-secondary/90 backdrop-blur">
              <h2 className="font-display font-bold text-xl text-text-primary">Create Notice</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Title *</label>
                <input {...register('title', { required: true })} placeholder="Notice title" className="input mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</label>
                  <select {...register('type')} className="input mt-1.5">
                    {['general','exam','holiday','event','urgent','circular'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Priority</label>
                  <select {...register('priority')} className="input mt-1.5">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Content *</label>
                <textarea {...register('content', { required: true })}
                  placeholder="Notice content..." rows={6} className="input mt-1.5 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center">
                  {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                  {isCreating ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
