import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetExamQuery, useGetExamMarksQuery, useEnterMarksMutation, useGetSubjectsQuery } from '../../store/api/endpoints';
import { ArrowLeft, Save, Loader2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWindowTitle } from '../../hooks';

export default function MarksEntry() {
  useWindowTitle('Marks Entry');
  const { examId } = useParams<{ examId: string }>();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marksData, setMarksData] = useState<Record<string, number>>({});

  const { data: examData, isLoading: examLoading } = useGetExamQuery(examId!);
  const exam = examData?.data;

  const { data: marksResult, isLoading: marksLoading } = useGetExamMarksQuery(
    { examId: examId!, classId: exam?.classId?._id, subjectId: selectedSubject },
    { skip: !exam?.classId?._id || !selectedSubject }
  );

  const [enterMarks, { isLoading: isSaving }] = useEnterMarksMutation();
  const results = marksResult?.data || [];

  const handleMarkChange = (studentId: string, val: string) => {
    const num = Math.min(Number(val), exam?.maxMarks || 100);
    setMarksData(prev => ({ ...prev, [studentId]: isNaN(num) ? 0 : num }));
  };

  const handleSave = async () => {
    if (!selectedSubject) return toast.error('Select a subject first');
    const payload = results.map((r: any) => ({
      studentId: r.student._id,
      theory: {
        obtained: marksData[r.student._id] ?? r.marks?.[0]?.theory?.obtained ?? 0,
        max: exam?.maxMarks || 100
      },
      totalObtained: marksData[r.student._id] ?? 0,
      totalMax: exam?.maxMarks || 100
    }));

    try {
      await enterMarks({ examId, subjectId: selectedSubject, marksData: payload }).unwrap();
      toast.success('Marks saved successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save marks');
    }
  };

  if (examLoading) {
    return <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-card"/>)}</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 animate-fade-up">
        <Link to="/dashboard/exams" className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5"><ArrowLeft size={18}/></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-text-primary">{exam?.name || 'Marks Entry'}</h1>
          <p className="text-text-secondary text-sm">
            {exam?.classId?.name} {exam?.classId?.section} • Max: {exam?.maxMarks} • Pass: {exam?.passingMarks}
          </p>
        </div>
        <button onClick={handleSave} disabled={isSaving || !selectedSubject} className="btn-primary text-sm">
          {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
          {isSaving ? 'Saving...' : 'Save Marks'}
        </button>
      </div>

      {/* Subject selector */}
      <div className="card p-4 animate-fade-up animate-fade-up-delay-1">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-text-secondary whitespace-nowrap">Select Subject:</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="input max-w-xs text-sm">
            <option value="">Choose subject...</option>
            {exam?.subjects?.map((s: any) => (
              <option key={s._id || s} value={s._id || s}>{s.name || 'Subject'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks grid */}
      {selectedSubject ? (
        marksLoading ? (
          <div className="card p-8 text-center"><Loader2 size={24} className="animate-spin text-accent mx-auto"/></div>
        ) : results.length === 0 ? (
          <div className="card p-16 text-center">
            <BarChart3 size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
            <p className="text-text-secondary text-sm">No students found for this class</p>
          </div>
        ) : (
          <div className="card overflow-hidden animate-fade-up animate-fade-up-delay-2">
            <div className="p-4 border-b border-white/5 bg-bg-tertiary/50 flex items-center justify-between">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{results.length} Students</p>
              <div className="flex gap-4 text-xs text-text-tertiary">
                <span>Max Marks: <strong className="text-text-primary">{exam?.maxMarks}</strong></span>
                <span>Passing: <strong className="text-warning">{exam?.passingMarks}</strong></span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {results.map((r: any, i: number) => {
                const existing = r.marks?.[0]?.totalObtained;
                const val = marksData[r.student._id] !== undefined ? marksData[r.student._id] : (existing ?? '');
                const numVal = Number(val);
                const percentage = exam?.maxMarks ? (numVal / exam.maxMarks) * 100 : 0;
                const isPassing = numVal >= (exam?.passingMarks || 35);

                return (
                  <div key={r.student._id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/2 transition-all">
                    <span className="text-xs text-text-tertiary w-6 text-right flex-shrink-0">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-purple-500/40 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.student.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{r.student.name}</p>
                      <p className="text-xs text-text-tertiary">Roll: {r.student.rollNumber}</p>
                    </div>

                    {/* Marks input */}
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={exam?.maxMarks || 100}
                        value={val}
                        onChange={e => handleMarkChange(r.student._id, e.target.value)}
                        placeholder="—"
                        className="w-20 px-3 py-2 text-center text-sm font-mono rounded-lg bg-bg-tertiary border border-white/10 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                      />
                      <span className="text-xs text-text-tertiary">/ {exam?.maxMarks}</span>
                    </div>

                    {/* Grade indicator */}
                    {val !== '' && (
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%`, background: isPassing ? '#10B981' : '#EF4444' }}/>
                        </div>
                        <span className={`text-xs font-semibold ${isPassing ? 'text-success' : 'text-danger'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    )}

                    {r.marks?.[0]?.isPublished && (
                      <span className="badge badge-success text-[10px]">Published</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary footer */}
            <div className="p-4 border-t border-white/5 bg-bg-tertiary/30 flex items-center justify-between text-xs text-text-secondary">
              <span>
                {Object.keys(marksData).length} marks entered
              </span>
              <span>
                Class avg: <strong className="text-text-primary">
                  {Object.values(marksData).length > 0
                    ? (Object.values(marksData).reduce((a, b) => a + b, 0) / Object.values(marksData).length).toFixed(1)
                    : '—'}
                </strong>
              </span>
            </div>
          </div>
        )
      ) : (
        <div className="card p-16 text-center animate-fade-up">
          <BarChart3 size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
          <p className="text-text-secondary text-sm">Select a subject above to enter marks</p>
        </div>
      )}
    </div>
  );
}
