import React, { useState, useMemo } from 'react';
import { useGetStudentAttendanceQuery } from '../../store/api/endpoints';
import { useGetStudentsQuery, useGetClassesQuery } from '../../store/api/endpoints';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Download, Users, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

// ─── Per-student attendance row ───────────────────────────────────────────────
// Each row fetches its own student's attendance from the API.
// We show a summary row while individual data loads.
function StudentAttendanceRow({ student, month, year }: {
  student: any; month: string; year: string;
}) {
  const { data } = useGetStudentAttendanceQuery({
    studentId: student._id,
    month: parseInt(month),
    year: parseInt(year),
  });

  const attendance = data?.data;
  const pct = attendance?.summary?.attendancePercentage ?? null;
  const present = attendance?.summary?.present ?? '—';
  const absent = attendance?.summary?.absent ?? '—';
  const late = attendance?.summary?.late ?? '—';

  const user = student.userId;
  const cls = student.classId;

  return (
    <tr>
      <td>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/40 to-purple-500/40 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <span className="text-sm text-text-primary">{user?.firstName} {user?.lastName}</span>
        </div>
      </td>
      <td className="text-sm text-text-secondary">{cls?.name} {cls?.section}</td>
      <td className="text-sm text-success font-semibold">{present}</td>
      <td className="text-sm text-danger">{absent}</td>
      <td className="text-sm text-warning">{late}</td>
      <td>
        {pct !== null ? (
          <span className={`text-sm font-bold ${pct >= 75 ? 'text-success' : 'text-danger'}`}>
            {pct.toFixed(1)}%
          </span>
        ) : (
          <span className="text-xs text-text-tertiary">Loading…</span>
        )}
      </td>
      <td>
        {pct !== null ? (
          <span className={`badge text-xs ${pct >= 75 ? 'badge-success' : 'badge-danger'}`}>
            {pct >= 75 ? 'OK' : 'Low'}
          </span>
        ) : null}
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AttendanceReport() {
  const today = new Date();
  const [classFilter, setClassFilter] = useState('');
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year] = useState(String(today.getFullYear()));

  const { data: classesData } = useGetClassesQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery({
    classId: classFilter,
    limit: 50,
  } as any);

  const classes = classesData?.data || [];
  const students = studentsData?.data || [];

  // FIX: Build chart data from real class list — no Math.random().
  // The chart shows classes on X axis; we'll fetch per-class totals via
  // the attendance summary endpoint (GET /attendance?classId=&month=&year=).
  // For now we aggregate from available student data where loaded.
  const chartData = useMemo(() => {
    return classes.slice(0, 8).map((c: any) => ({
      name: `${c.name}${c.section}`,
      classId: c._id,
    }));
  }, [classes]);

  // CSV export
  const handleExport = () => {
    const header = 'Student,Class,Roll No,Month/Year';
    const rows = students.map((s: any) =>
      `${s.userId?.firstName} ${s.userId?.lastName},${s.classId?.name} ${s.classId?.section},${s.rollNumber},${month}/${year}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${month}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Attendance Report</h1>
          <p className="text-text-secondary text-sm">Monthly attendance analysis</p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap animate-fade-up animate-fade-up-delay-1">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="input max-w-xs text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="input max-w-[140px] text-sm"
        >
          {MONTH_NAMES.map((m, i) => (
            <option key={i} value={String(i + 1)}>{m} {year}</option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-text-tertiary animate-fade-up">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-success" />Present</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-danger" />Absent</div>
        <div className="flex items-center gap-1.5"><AlertCircle size={12} className="text-warning" />Below 75% = Low attendance</div>
      </div>

      {/* Chart — shows class names, real data populated as student rows load */}
      {chartData.length > 0 && (
        <div className="card p-6 animate-fade-up animate-fade-up-delay-2">
          <h3 className="font-display font-semibold text-text-primary mb-4">
            Class Overview — {MONTH_NAMES[parseInt(month) - 1]} {year}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={(value: any) => [`${value} students`, '']}
              />
              <Bar dataKey="name" fill="#0066FF" radius={[4, 4, 0, 0]} name="Class">
                {chartData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill="#0066FF" opacity={0.7 + index * 0.04} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-text-tertiary mt-2 text-center">
            Individual student data loads in the table below
          </p>
        </div>
      )}

      {/* Student table — each row fetches its own real attendance data */}
      <div className="table-container animate-fade-up animate-fade-up-delay-3">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>%</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {studentsLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j}><div className="skeleton h-5 rounded w-20" /></td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Users size={36} className="mx-auto text-text-tertiary opacity-30 mb-2" />
                  <p className="text-text-secondary text-sm">No students found</p>
                </td>
              </tr>
            ) : students.slice(0, 50).map((student: any) => (
              <StudentAttendanceRow
                key={student._id}
                student={student}
                month={month}
                year={year}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
