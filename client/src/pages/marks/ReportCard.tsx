import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetReportCardQuery } from '../../store/api/endpoints';
import { ArrowLeft, Printer, School, Award, CheckCircle, XCircle } from 'lucide-react';

const gradeColor: Record<string, string> = {
  'A+': '#10B981', 'A': '#10B981', 'B+': '#3B82F6', 'B': '#3B82F6',
  'C+': '#F59E0B', 'C': '#F59E0B', 'D': '#F97316', 'F': '#EF4444'
};

export default function ReportCard() {
  const { studentId, examId } = useParams<{ studentId: string; examId: string }>();
  const printRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetReportCardQuery({ studentId: studentId!, examId: examId! });
  const rc = data?.data;

  const handlePrint = () => window.print();

  if (isLoading) {
    return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-card"/>)}</div>;
  }

  if (!rc) {
    return (
      <div className="p-6">
        <div className="card p-16 text-center">
          <p className="text-text-secondary">Report card not found</p>
          <Link to="/dashboard/exams" className="text-accent text-sm mt-2 inline-block">← Back to Exams</Link>
        </div>
      </div>
    );
  }

  const { student, exam, subjects, summary } = rc;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between animate-fade-up print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/exams" className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5"><ArrowLeft size={18}/></Link>
          <h1 className="text-xl font-display font-bold text-text-primary">Report Card</h1>
        </div>
        <button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-2">
          <Printer size={14}/> Print Report Card
        </button>
      </div>

      {/* Report Card */}
      <div ref={printRef} className="card overflow-hidden animate-fade-up animate-fade-up-delay-1 print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-bg-tertiary to-bg-secondary p-8 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-glow">
                <School size={24} className="text-white"/>
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl text-text-primary">School Report Card</h2>
                <p className="text-text-secondary text-sm">Academic Year {exam?.academicYear || '2024-25'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-tertiary">Exam</p>
              <p className="font-display font-semibold text-text-primary">{exam?.name}</p>
              <p className="text-xs text-text-tertiary mt-1 capitalize">{exam?.type}</p>
            </div>
          </div>
        </div>

        {/* Student info bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-white/5">
          {[
            { label: 'Student Name', value: `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}` },
            { label: 'Class', value: `${student.classId?.name} ${student.classId?.section}` },
            { label: 'Roll Number', value: student.rollNumber },
            { label: 'Admission No.', value: student.admissionNumber },
          ].map((info, i) => (
            <div key={i} className={`p-4 ${i < 3 ? 'border-r border-white/5' : ''}`}>
              <p className="text-xs text-text-tertiary">{info.label}</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{info.value || '—'}</p>
            </div>
          ))}
        </div>

        {/* Marks table */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Subject</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Theory</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Practical</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">%</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Grade</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">GPA</th>
                <th className="text-center py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-all">
                  <td className="py-3">
                    <p className="text-sm font-medium text-text-primary">{s.subject?.name || 'Unknown'}</p>
                    <p className="text-xs text-text-tertiary">{s.subject?.code}</p>
                  </td>
                  <td className="py-3 text-center text-sm text-text-secondary">
                    {s.theory ? `${s.theory.obtained}/${s.theory.max}` : '—'}
                  </td>
                  <td className="py-3 text-center text-sm text-text-secondary">
                    {s.practical ? `${s.practical.obtained}/${s.practical.max}` : '—'}
                  </td>
                  <td className="py-3 text-center text-sm font-semibold text-text-primary">
                    {s.isAbsent ? 'ABS' : `${s.totalObtained}/${s.totalMax}`}
                  </td>
                  <td className="py-3 text-center text-sm">
                    <span style={{ color: s.percentage >= 60 ? '#10B981' : '#EF4444' }}>
                      {s.isAbsent ? '—' : `${s.percentage}%`}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-base font-display font-bold" style={{ color: gradeColor[s.grade] || '#888' }}>
                      {s.isAbsent ? '—' : s.grade}
                    </span>
                  </td>
                  <td className="py-3 text-center text-sm text-text-secondary">
                    {s.isAbsent ? '—' : s.gradePoint?.toFixed(1)}
                  </td>
                  <td className="py-3 text-center">
                    {s.isAbsent ? (
                      <span className="badge badge-neutral text-[10px]">Absent</span>
                    ) : s.percentage >= (exam?.passingMarks || 35) ? (
                      <CheckCircle size={16} className="text-success mx-auto"/>
                    ) : (
                      <XCircle size={16} className="text-danger mx-auto"/>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t border-white/5 bg-bg-tertiary/30 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Overall Percentage</p>
              <p className="text-3xl font-display font-bold mt-1" style={{ color: summary.overallPercentage >= 60 ? '#10B981' : '#EF4444' }}>
                {summary.overallPercentage}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">CGPA</p>
              <p className="text-3xl font-display font-bold text-text-primary mt-1">{summary.gpa.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Overall Grade</p>
              <p className="text-3xl font-display font-bold mt-1" style={{ color: gradeColor[summary.overallGrade] || '#888' }}>
                {summary.overallGrade}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Result</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                {summary.overallPercentage >= 35 ? (
                  <>
                    <CheckCircle size={20} className="text-success"/>
                    <span className="text-success font-display font-bold">PASS</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-danger"/>
                    <span className="text-danger font-display font-bold">FAIL</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grade scale reference */}
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-text-tertiary mb-2 font-semibold uppercase tracking-wider">Grade Scale</p>
          <div className="flex flex-wrap gap-3">
            {[
              { g: 'A+', r: '≥90%', gp: '10' }, { g: 'A', r: '80–89%', gp: '9' }, { g: 'B+', r: '70–79%', gp: '8' },
              { g: 'B', r: '60–69%', gp: '7' }, { g: 'C+', r: '50–59%', gp: '6' }, { g: 'C', r: '40–49%', gp: '5' },
              { g: 'D', r: '35–39%', gp: '4' }, { g: 'F', r: '<35%', gp: '0' },
            ].map(s => (
              <div key={s.g} className="flex items-center gap-1.5 text-xs">
                <span className="font-bold" style={{ color: gradeColor[s.g] || '#888' }}>{s.g}</span>
                <span className="text-text-tertiary">{s.r} (GP: {s.gp})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 p-6 border-t border-white/5">
          {['Class Teacher', 'Principal', 'Parent/Guardian'].map(sig => (
            <div key={sig} className="text-center">
              <div className="h-12 border-b border-white/10 mb-2"/>
              <p className="text-xs text-text-tertiary">{sig}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
