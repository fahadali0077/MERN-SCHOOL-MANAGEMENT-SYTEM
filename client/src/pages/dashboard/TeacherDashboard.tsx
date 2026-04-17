// TeacherDashboard.tsx
import React from 'react';
import { useGetTeacherDashboardQuery } from '../../store/api/endpoints';
import { BookOpen, ClipboardList, BarChart3, Bell } from 'lucide-react';
import { useWindowTitle } from '../../hooks';

export default function TeacherDashboard() {
  useWindowTitle('Dashboard');
  const { data, isLoading } = useGetTeacherDashboardQuery();
  const dashboard = data?.data;

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">Teacher Dashboard</h1>
        <p className="text-text-secondary text-sm">Your classes and tasks at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-delay-1">
        {[
          { label: 'My Classes', value: dashboard?.myClasses?.length || 0, icon: BookOpen, color: '#0066FF' },
          { label: 'Attendance Today', value: dashboard?.todayAttendance || 0, icon: ClipboardList, color: '#10B981' },
          { label: 'Pending Marks', value: dashboard?.pendingMarks || 0, icon: BarChart3, color: '#F59E0B' },
          { label: 'Notices', value: dashboard?.recentNotices?.length || 0, icon: Bell, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}20` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{isLoading ? '—' : s.value}</p>
            <p className="text-text-secondary text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up animate-fade-up-delay-2">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">My Classes</h2>
          {dashboard?.myClasses?.length > 0 ? (
            <div className="space-y-2">
              {dashboard.myClasses.map((cls: any) => (
                <div key={cls._id} className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary">
                  <span className="text-sm font-medium text-text-primary">{cls.name} {cls.section}</span>
                  <span className="badge badge-accent text-xs">Grade {cls.grade}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-text-tertiary text-sm">No classes assigned</p>}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Recent Notices</h2>
          {dashboard?.recentNotices?.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recentNotices.map((n: any) => (
                <div key={n._id} className="p-3 rounded-xl bg-bg-tertiary">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{n.type}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-text-tertiary text-sm">No recent notices</p>}
        </div>
      </div>
    </div>
  );
}
