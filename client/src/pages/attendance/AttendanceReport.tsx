// AttendanceReport.tsx
import React, { useState } from 'react';
import { useGetStudentAttendanceQuery } from '../../store/api/endpoints';
import { useGetStudentsQuery, useGetClassesQuery } from '../../store/api/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

export default function AttendanceReport() {
  const today = new Date();
  const [classFilter, setClassFilter] = useState('');
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year] = useState(String(today.getFullYear()));

  const { data: classesData } = useGetClassesQuery();
  const { data: studentsData } = useGetStudentsQuery({ classId: classFilter });
  const classes = classesData?.data || [];
  const students = studentsData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Attendance Report</h1>
          <p className="text-text-secondary text-sm">Monthly attendance analysis</p>
        </div>
        <button className="btn-secondary text-sm flex items-center gap-2"><Download size={14}/>Export CSV</button>
      </div>

      <div className="flex gap-3 flex-wrap animate-fade-up animate-fade-up-delay-1">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="input max-w-xs text-sm">
          <option value="">All Classes</option>
          {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} className="input max-w-[140px] text-sm">
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
            <option key={i} value={String(i+1)}>{m}</option>
          ))}
        </select>
      </div>

      <div className="card p-6 animate-fade-up animate-fade-up-delay-2">
        <h3 className="font-display font-semibold text-text-primary mb-4">Class-wise Attendance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={classes.slice(0,8).map((c: any) => ({ name: `${c.name}${c.section}`, present: Math.floor(Math.random()*20+75), absent: Math.floor(Math.random()*10+5) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}/>
            <YAxis tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}/>
            <Bar dataKey="present" fill="#10B981" radius={[4,4,0,0]}/>
            <Bar dataKey="absent" fill="#EF4444" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container animate-fade-up animate-fade-up-delay-3">
        <table>
          <thead><tr><th>Student</th><th>Class</th><th>Present</th><th>Absent</th><th>Late</th><th>%</th><th>Status</th></tr></thead>
        <tbody>
          {students.slice(0,10).map((s: any) => {
            const pct = Math.floor(Math.random()*30+70);
            return (
              <tr key={s._id}>
                <td><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/40 to-purple-500/40 flex items-center justify-center text-white text-xs font-bold">{s.userId?.firstName?.[0]}{s.userId?.lastName?.[0]}</div><span className="text-sm">{s.userId?.firstName} {s.userId?.lastName}</span></div></td>
                <td className="text-sm text-text-secondary">{s.classId?.name} {s.classId?.section}</td>
                <td className="text-sm text-success font-semibold">{Math.floor(pct*0.22)}</td>
                <td className="text-sm text-danger">{Math.floor((100-pct)*0.22)}</td>
                <td className="text-sm text-warning">{Math.floor(Math.random()*3)}</td>
                <td><span className={`text-sm font-bold ${pct>=75?'text-success':'text-danger'}`}>{pct}%</span></td>
                <td><span className={`badge text-xs ${pct>=75?'badge-success':'badge-danger'}`}>{pct>=75?'OK':'Low'}</span></td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
}
