import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/slices/authSlice';
import { useGetAdminDashboardQuery } from '../../store/api/endpoints';
import { School, Users, DollarSign, TrendingUp, Server, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

// Mock data for super admin — would be fetched from /api/v1/superadmin/overview
const platformStats = {
  schools: { total: 47, active: 44, new: 3 },
  students: { active: 84213 },
  revenue: { total: 2840000, monthly: 284000, growth: 12.4 },
  uptime: 99.97,
};

const revenueData = [
  { month: 'Jul', revenue: 210000 }, { month: 'Aug', revenue: 225000 },
  { month: 'Sep', revenue: 248000 }, { month: 'Oct', revenue: 261000 },
  { month: 'Nov', revenue: 271000 }, { month: 'Dec', revenue: 284000 },
];

const schoolsByPlan = [
  { plan: 'Free', count: 8 }, { plan: 'Basic', count: 14 },
  { plan: 'Pro', count: 19 }, { plan: 'Enterprise', count: 6 },
];

export default function SuperAdminDashboard() {
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
          { label: 'Total Schools', value: platformStats.schools.total, sub: `${platformStats.schools.active} active`, icon: School, color: '#0066FF' },
          { label: 'Students', value: platformStats.students.active.toLocaleString(), sub: 'platform-wide', icon: Users, color: '#10B981' },
          { label: 'Monthly Revenue', value: `$${(platformStats.revenue.monthly / 1000).toFixed(0)}K`, sub: `+${platformStats.revenue.growth}% MoM`, icon: DollarSign, color: '#F59E0B' },
          { label: 'Platform Uptime', value: `${platformStats.uptime}%`, sub: 'last 30 days', icon: Server, color: '#8B5CF6' },
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
        {/* Revenue trend */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Platform Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} formatter={(v: any) => [`$${(v / 1000).toFixed(0)}K`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Schools by plan */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Schools by Plan</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={schoolsByPlan} layout="vertical">
              <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="plan" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#0066FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {schoolsByPlan.map(p => (
              <div key={p.plan} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">{p.plan}</span>
                <span className="font-semibold text-text-primary">{p.count} schools</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schools table */}
      <div className="card overflow-hidden animate-fade-up animate-fade-up-delay-3">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-text-primary">Recent Schools</h2>
          <button className="text-xs text-accent hover:underline">View all →</button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th>School</th>
              <th>Plan</th>
              <th>Students</th>
              <th>Admin</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Oakwood International Academy', code: 'OIA', plan: 'pro', students: 1247, admin: 'Sarah Mitchell', active: true },
              { name: 'Lagos Unity School', code: 'LUS', plan: 'enterprise', students: 3820, admin: 'James Okafor', active: true },
              { name: 'Sunrise Public School', code: 'SPS', plan: 'basic', students: 450, admin: 'Priya Sharma', active: true },
              { name: 'Metro District High', code: 'MDH', plan: 'enterprise', students: 5100, admin: 'Carlos Mendez', active: true },
              { name: 'Greenfield Academy', code: 'GFA', plan: 'pro', students: 890, admin: 'Lisa Chen', active: false },
            ].map(school => (
              <tr key={school.code}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-display font-bold">
                      {school.code[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{school.name}</p>
                      <p className="text-xs text-text-tertiary font-mono">{school.code}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge text-xs ${
                    school.plan === 'enterprise' ? 'badge-danger' :
                    school.plan === 'pro' ? 'badge-accent' : 'badge-neutral'
                  }`}>{school.plan}</span>
                </td>
                <td className="text-sm font-medium text-text-primary">{school.students.toLocaleString()}</td>
                <td className="text-sm text-text-secondary">{school.admin}</td>
                <td>
                  <span className={`badge text-xs ${school.active ? 'badge-success' : 'badge-neutral'}`}>
                    {school.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="text-xs text-accent hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
