import React, { useState } from 'react';
import { apiSlice } from '../../store/api/apiSlice';
import { Plus, Search, School, Users, GraduationCap, ToggleLeft, ToggleRight, X, Loader2, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useWindowTitle } from '../../hooks';

// ─── Inject endpoints inline (superAdmin-only) ────────────────────────────────
const schoolsApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getSchools: b.query<any, { page?: number; search?: string }>({
      query: (params) => ({ url: '/superadmin/schools', params }),
      providesTags: ['Schools'],
    }),
    createSchool: b.mutation<any, any>({
      query: (data) => ({ url: '/schools', method: 'POST', body: data }),
      invalidatesTags: ['Schools'],
    }),
    toggleSchool: b.mutation<any, string>({
      query: (id) => ({ url: `/superadmin/schools/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Schools'],
    }),
    getOverview: b.query<any, void>({
      query: () => '/superadmin/overview',
      providesTags: ['Dashboard'],
    }),
  }),
  overrideExisting: false,
});

const { useGetSchoolsQuery, useCreateSchoolMutation, useToggleSchoolMutation, useGetOverviewQuery } = schoolsApi;

const planBadge: Record<string, string> = {
  free: 'badge-neutral',
  basic: 'badge-accent',
  pro: 'badge-success',
  enterprise: 'badge-warning',
};

export default function SchoolsPage() {
  useWindowTitle('Schools');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useGetSchoolsQuery({ page, search });
  const { data: overviewData } = useGetOverviewQuery();
  const [createSchool, { isLoading: isCreating }] = useCreateSchoolMutation();
  const [toggleSchool] = useToggleSchoolMutation();

  const schools = data?.data || [];
  const pagination = data?.pagination;
  const overview = overviewData?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (d: any) => {
    try {
      await createSchool(d).unwrap();
      toast.success('School created successfully');
      reset();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create school');
    }
  };

  const handleToggle = async (id: string, name: string, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} "${name}"?`)) return;
    try {
      await toggleSchool(id).unwrap();
      toast.success(`School ${isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update school status');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Schools</h1>
          <p className="text-text-secondary text-sm">
            {overview?.schools?.total || 0} registered • {overview?.schools?.active || 0} active
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          <Plus size={15} /> Add School
        </button>
      </div>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-delay-1">
          {[
            { label: 'Total Schools', value: overview.schools?.total || 0, icon: School, color: '#0066FF' },
            { label: 'Active', value: overview.schools?.active || 0, icon: Globe, color: '#10B981' },
            { label: 'Total Students', value: overview.students?.active || 0, icon: Users, color: '#F59E0B' },
            { label: 'Total Revenue', value: `$${(overview.revenue?.total || 0).toLocaleString()}`, icon: GraduationCap, color: '#8B5CF6' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-tertiary">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm animate-fade-up animate-fade-up-delay-2">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search schools..."
          className="input pl-9 text-sm"
        />
      </div>

      {/* Table */}
      <div className="table-container animate-fade-up animate-fade-up-delay-3">
        <table>
          <thead>
            <tr>
              <th>School</th>
              <th>Code</th>
              <th>Plan</th>
              <th>Admin</th>
              <th>Students Cap</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j}><div className="skeleton h-5 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <School size={40} className="mx-auto text-text-tertiary mb-3 opacity-40" />
                  <p className="text-text-secondary text-sm">No schools registered yet</p>
                  <button onClick={() => setShowCreate(true)} className="text-accent text-sm mt-1 hover:underline">
                    Register your first school →
                  </button>
                </td>
              </tr>
            ) : schools.map((school: any) => (
              <tr key={school._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                      <School size={15} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text-primary">{school.name}</p>
                      <p className="text-xs text-text-tertiary">{school.email}</p>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-sm text-text-secondary">{school.code}</td>
                <td>
                  <span className={`badge ${planBadge[school.subscription?.plan] || 'badge-neutral'} text-xs capitalize`}>
                    {school.subscription?.plan || 'free'}
                  </span>
                </td>
                <td className="text-sm text-text-secondary">
                  {school.admin ? `${school.admin.firstName} ${school.admin.lastName}` : '—'}
                </td>
                <td className="text-sm text-text-secondary">{school.subscription?.maxStudents || '—'}</td>
                <td>
                  <span className={`badge ${school.isActive ? 'badge-success' : 'badge-neutral'} text-xs`}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-sm text-text-secondary">
                  {new Date(school.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    onClick={() => handleToggle(school._id, school.name, school.isActive)}
                    className={`p-1.5 rounded-lg transition-all ${
                      school.isActive
                        ? 'text-success hover:text-danger hover:bg-danger/10'
                        : 'text-text-tertiary hover:text-success hover:bg-success/10'
                    }`}
                    title={school.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {school.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 animate-fade-up">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Prev</button>
          <span className="flex items-center text-sm text-text-secondary px-3">{page} / {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Create School Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-xl text-text-primary">Register School</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">School Name *</label>
                <input {...register('name', { required: 'Name is required' })} placeholder="Oakwood Academy" className="input mt-1.5" />
                {errors.name && <p className="text-danger text-xs mt-1">{String(errors.name.message)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">School Code *</label>
                  <input {...register('code', { required: 'Code is required' })} placeholder="OAK" className="input mt-1.5" />
                  {errors.code && <p className="text-danger text-xs mt-1">{String(errors.code.message)}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Plan</label>
                  <select {...register('subscription.plan')} className="input mt-1.5">
                    {['free', 'basic', 'pro', 'enterprise'].map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email *</label>
                <input {...register('email', { required: 'Email is required' })} type="email" placeholder="admin@school.edu" className="input mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</label>
                <input {...register('phone')} placeholder="+1-555-0100" className="input mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">City</label>
                <input {...register('address.city')} placeholder="San Francisco" className="input mt-1.5" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center">
                  {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {isCreating ? 'Creating...' : 'Register School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
