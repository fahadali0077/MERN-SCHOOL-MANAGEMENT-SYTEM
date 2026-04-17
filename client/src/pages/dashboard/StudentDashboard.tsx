// StudentDashboard.tsx
import React from 'react';
import { useGetStudentDashboardQuery } from '../../store/api/endpoints';
import { ClipboardList, BarChart3, DollarSign, Bell } from 'lucide-react';
import { useWindowTitle } from '../../hooks';

export default function StudentDashboard() {
  useWindowTitle('My Dashboard');
  const { data, isLoading } = useGetStudentDashboardQuery();
  const d = data?.data;

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-display font-bold text-text-primary">My Dashboard</h1>
        <p className="text-text-secondary text-sm">{d?.student?.classId?.name} {d?.student?.classId?.section}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-delay-1">
        {[
          { label: 'Attendance', value: `${d?.attendance?.rate || 0}%`, icon: ClipboardList, color: '#10B981' },
          { label: 'Days Present', value: d?.attendance?.present || 0, icon: ClipboardList, color: '#0066FF' },
          { label: 'Fee Due', value: `$${d?.pendingFees?.reduce((a: number, f: any) => a + f.balanceDue, 0) || 0}`, icon: DollarSign, color: d?.pendingFees?.length > 0 ? '#EF4444' : '#10B981' },
          { label: 'Notices', value: d?.notices?.length || 0, icon: Bell, color: '#8B5CF6' },
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
          <h2 className="font-display font-semibold text-text-primary mb-4">Recent Results</h2>
          {d?.recentMarks?.length > 0 ? (
            <div className="space-y-2">
              {d.recentMarks.map((m: any) => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{m.subjectId?.name}</p>
                    <p className="text-xs text-text-tertiary">{m.examId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: m.percentage >= 60 ? '#10B981' : '#EF4444' }}>{m.grade}</p>
                    <p className="text-xs text-text-tertiary">{m.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-text-tertiary text-sm">No results available</p>}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Notices</h2>
          {d?.notices?.length > 0 ? (
            <div className="space-y-2">
              {d.notices.map((n: any) => (
                <div key={n._id} className="p-3 rounded-xl bg-bg-tertiary">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-text-tertiary text-sm">No recent notices</p>}
        </div>
      </div>
    </div>
  );
}
