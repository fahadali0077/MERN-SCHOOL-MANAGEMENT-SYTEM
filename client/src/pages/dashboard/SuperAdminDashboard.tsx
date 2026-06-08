import React from 'react';
import { Link } from 'react-router-dom';
import { apiSlice } from '../../store/api/apiSlice';
import { School, Users, DollarSign, Server, Activity, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useWindowTitle } from '../../hooks';

// FIX: SuperAdmin dashboard now reads REAL data from /superadmin/overview + /superadmin/activity
// (previously rendered hardcoded mock numbers).
const superAdminDashApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getPlatformOverview: b.query<any, void>({
      query: () => '/superadmin/overview',
      providesTags: ['Dashboard'],
    }),
    getPlatformActivity: b.query<any, void>({
      query: () => '/superadmin/activity',
    }),
  }),
  overrideExisting: false,
});

const { useGetPlatformOverviewQuery, useGetPlatformActivityQuery } = superAdminDashApi;

const planBadge: Record<string, string> = {
  free: 'badge-neutral', basic: 'badge-accent', pro: 'badge-accent', enterprise: 'badge-danger',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass p-3 text-xs">
        <p className="text-text-secondary mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SuperAdminDashboard() {
  useWindowTitle('Platform Overview');
  const { data: overviewData, isLoading } = useGetPlatformOverviewQuery();
  const { data: activityData } = useGetPlatformActivityQuery();

  const overview = overviewData?.data;
  const recentSchools = overview?.recentSchools || [];
  const schoolsByPlanRaw = overview?.schoolsByPlan || [];

  // Map { _id: plan, count } → chart shape, with friendly labels
  const planLabels: Record<string, string> = { free: 'Free', basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise' };
  const schoolsByPlan = schoolsByPlanRaw.map((p: any) => ({
    plan: planLabels[p._id] || (p._id || 'Unknown'),
    count: p.count,
  }));

  const stats = {
    schools: overview?.schools || { total: 0, active: 0, inactive: 0 },
    students: overview?.students || { active: 0 },
    revenue: overview?.revenue || { total: 0, monthly: 0 },
    users: overview?.users || { total: 0 },
  };

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-32 rounded-card" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-danger text-xs">Super Admin</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Platform Overview</h1>
        <p className="text-text-secondary text-sm">Monitoring all schools and platform health</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-delay-1">
        {[
          { label: 'Total Schools', value: (stats.schools.total || 0).toLocaleString(), sub: `${stats.schools.active || 0} active`, icon: School, color: '#0066FF' },
          { label: 'Active Students', value: (stats.students.active || 0).toLocaleString(), sub: 'platform-wide', icon: Users, color: '#10B981' },
          { label: 'Monthly Revenue', value: `$${(stats.revenue.monthly || 0).toLocaleString()}`, sub: `$${(stats.revenue.total || 0).toLocaleString()} total`, icon: DollarSign, color: '#F59E0B' },
          { label: 'Total Users', value: (stats.users.total || 0).toLocaleString(), sub: 'all roles', icon: Server, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <Activity size={14} className="text-text-tertiary" />
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{s.value}</p>
            <p className="text-sm text-text-secondary mt-0.5">{s.label}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-2">
        {/* Revenue summary */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Revenue Summary</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[
              { label: 'This Month', revenue: stats.revenue.monthly || 0 },
              { label: 'Total Collected', revenue: stats.revenue.total || 0 },
            ]}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Schools by plan */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Schools by Plan</h2>
          {schoolsByPlan.length === 0 ? (
            <p className="text-text-tertiary text-sm py-8 text-center">No plan data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={schoolsByPlan} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="plan" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#0066FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {schoolsByPlan.map((p: any) => (
                  <div key={p.plan} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{p.plan}</span>
                    <span className="font-semibold text-text-primary">{p.count} schools</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent schools table */}
      <div className="card overflow-hidden animate-fade-up animate-fade-up-delay-3">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-text-primary">Recent Schools</h2>
          <Link to="/dashboard/schools" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        {recentSchools.length === 0 ? (
          <div className="p-12 text-center">
            <School size={36} className="mx-auto text-text-tertiary opacity-20 mb-3" />
            <p className="text-text-secondary text-sm">No schools registered yet</p>
            <Link to="/dashboard/schools" className="text-accent text-sm mt-1 inline-block hover:underline">Register a school →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>School</th><th>Plan</th><th>Admin</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSchools.map((school: any) => (
                <tr key={school._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-display font-bold">
                        {(school.code || school.name || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{school.name}</p>
                        <p className="text-xs text-text-tertiary font-mono">{school.code}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge text-xs ${planBadge[school.subscription?.plan] || 'badge-neutral'}`}>
                      {school.subscription?.plan || 'free'}
                    </span>
                  </td>
                  <td className="text-sm text-text-secondary">
                    {school.admin ? `${school.admin.firstName} ${school.admin.lastName}` : '—'}
                  </td>
                  <td className="text-sm text-text-secondary">
                    {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <Link to="/dashboard/schools" className="text-xs text-accent hover:underline">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
