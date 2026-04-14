import React, { useState } from 'react';
import { useGetTeachersQuery, useCreateTeacherMutation, useUpdateTeacherMutation } from '../../store/api/endpoints';
import { Plus, Search, X, Loader2, GraduationCap, Mail, Phone, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useGetTeachersQuery({ page, limit: 20, search });
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const teachers = data?.data || [];
  const pagination = data?.pagination;

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (d: any) => {
    try {
      await createTeacher(d).unwrap();
      toast.success('Teacher added. Welcome email sent.');
      reset();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add teacher');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Teachers</h1>
          <p className="text-text-secondary text-sm">{pagination?.total || 0} teachers registered</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm"><Plus size={15}/>Add Teacher</button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm animate-fade-up animate-fade-up-delay-1">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"/>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search teachers..." className="input pl-9 text-sm"/>
      </div>

      {/* Teacher grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(8)].map((_, i) => <div key={i} className="skeleton h-40 rounded-card animate-fade-up"/>)
        ) : teachers.length === 0 ? (
          <div className="col-span-full card p-16 text-center animate-fade-up">
            <GraduationCap size={48} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
            <p className="text-text-secondary text-sm">No teachers found</p>
          </div>
        ) : teachers.map((teacher: any, i: number) => (
          <div key={teacher._id} className="card p-5 space-y-3 animate-fade-up group" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-accent/30 flex items-center justify-center text-white font-display font-bold">
                {teacher.firstName?.[0]}{teacher.lastName?.[0]}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`badge text-xs ${teacher.isActive ? 'badge-success' : 'badge-neutral'}`}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <p className="font-display font-semibold text-text-primary">{teacher.firstName} {teacher.lastName}</p>
              {teacher.email && (
                <p className="text-xs text-text-tertiary flex items-center gap-1.5 mt-1">
                  <Mail size={11}/>{teacher.email}
                </p>
              )}
              {teacher.phone && (
                <p className="text-xs text-text-tertiary flex items-center gap-1.5 mt-0.5">
                  <Phone size={11}/>{teacher.phone}
                </p>
              )}
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                Joined {new Date(teacher.createdAt).toLocaleDateString()}
              </span>
              <button className="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 transition-all">
                <Edit2 size={13}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 animate-fade-up">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Prev</button>
          <span className="flex items-center text-sm text-text-secondary px-3">
            {page} / {pagination.pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-xl text-text-primary">Add Teacher</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">First Name *</label>
                  <input {...register('firstName', { required: true })} placeholder="John" className="input mt-1.5"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Name *</label>
                  <input {...register('lastName', { required: true })} placeholder="Doe" className="input mt-1.5"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email *</label>
                <input {...register('email', { required: true })} type="email" placeholder="teacher@school.edu" className="input mt-1.5"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</label>
                <input {...register('phone')} placeholder="+1 234 567 890" className="input mt-1.5"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center">
                  {isCreating ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                  {isCreating ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
