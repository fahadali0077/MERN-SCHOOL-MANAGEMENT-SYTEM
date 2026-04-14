import React from 'react';
import { useGetAdminDashboardQuery } from '../../store/api/endpoints';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ label, value, sub, icon: Icon, color, trend }: any) => (
  <div className="stat-card animate-fade-up">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center`} style={{ background: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-3xl font-display font-bold text-text-primary">{value}</p>
    <p className="text-sm font-medium text-text-primary mt-1">{label}</p>
    {sub && <p className="text-xs text-text-tertiary mt-0.5">{sub}</p>}
  </div>
);

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#0066FF'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass p-3 text-sm">
        <p className="text-text-secondary mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const dashboard = data?.data;

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-card" />
        ))}
      </div>
    );
  }

  const stats = dashboard?.stats;
  const attendanceTrend = dashboard?.attendanceTrend || [];

  // Process attendance trend for chart
  const trendData = attendanceTrend.reduce((acc: any[], item: any) => {
    const date = item._id.date;
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing[item._id.status] = item.count;
    } else {
      acc.push({ date, [item._id.status]: item.count });
    }
    return acc;
  }, []);

  const feeData = dashboard?.feeStats?.map((s: any) => ({
    name: s._id,
    value: s.count
  })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats?.students?.total?.toLocaleString() || '0'}
          sub={`${stats?.students?.active || 0} active`}
          icon={Users}
          color="#0066FF"
        />
        <StatCard
          label="Teachers"
          value={stats?.teachers?.total?.toLocaleString() || '0'}
          sub={`${stats?.teachers?.active || 0} active`}
          icon={GraduationCap}
          color="#10B981"
        />
        <StatCard
          label="Attendance Today"
          value={`${stats?.attendance?.rate || 0}%`}
          sub={`${stats?.attendance?.present || 0} present`}
          icon={CheckCircle}
          color="#10B981"
          trend={stats?.attendance?.rate > 75 ? 0 : -1}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${(stats?.revenue?.current || 0).toLocaleString()}`}
          sub="vs last month"
          icon={DollarSign}
          color="#F59E0B"
          trend={stats?.revenue?.growth}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance trend chart */}
        <div className="lg:col-span-2 card p-6 animate-fade-up animate-fade-up-delay-1">
          <h2 className="text-base font-display font-semibold text-text-primary mb-4">Attendance Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={2} fill="url(#presentGrad)" />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2} fill="url(#absentGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fee status donut */}
        <div className="card p-6 animate-fade-up animate-fade-up-delay-2">
          <h2 className="text-base font-display font-semibold text-text-primary mb-4">Fee Status</h2>
          {feeData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                    {feeData.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {feeData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-text-secondary capitalize">{item.name}</span>
                    </div>
                    <span className="text-text-primary font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-text-tertiary text-sm">No fee data</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Exams */}
        <div className="card p-6 animate-fade-up animate-fade-up-delay-3">
          <h2 className="text-base font-display font-semibold text-text-primary mb-4">Upcoming Exams</h2>
          {dashboard?.upcomingExams?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.upcomingExams.map((exam: any) => (
                <div key={exam._id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{exam.name}</p>
                    <p className="text-xs text-text-tertiary">{exam.classId?.name} • {new Date(exam.startDate).toLocaleDateString()}</p>
                  </div>
                  <span className="badge badge-accent text-xs">{exam.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm text-center py-8">No upcoming exams</p>
          )}
        </div>

        {/* Recent Notices */}
        <div className="card p-6 animate-fade-up animate-fade-up-delay-4">
          <h2 className="text-base font-display font-semibold text-text-primary mb-4">Recent Notices</h2>
          {dashboard?.recentNotices?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentNotices.map((notice: any) => (
                <div key={notice._id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-tertiary border border-white/5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notice.priority === 'high' ? 'bg-danger' :
                    notice.priority === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{notice.title}</p>
                    <p className="text-xs text-text-tertiary">{new Date(notice.createdAt).toLocaleDateString()} • {notice.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm text-center py-8">No recent notices</p>
          )}
        </div>
      </div>
    </div>
  );
}
