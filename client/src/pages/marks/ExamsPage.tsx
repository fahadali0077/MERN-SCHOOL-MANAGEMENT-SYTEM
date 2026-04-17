import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetExamsQuery, useCreateExamMutation, usePublishResultsMutation } from '../../store/api/endpoints';
import { useGetClassesQuery, useGetSubjectsQuery } from '../../store/api/endpoints';
import { useForm } from 'react-hook-form';
import { Plus, BookOpen, Calendar, Users, Send, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWindowTitle } from '../../hooks';

const ExamTypeColors: Record<string, string> = {
  unitTest: 'badge-accent',
  midterm: 'badge-warning',
  final: 'badge-danger',
  practical: 'badge-success',
  assignment: 'badge-neutral',
  quiz: 'badge-neutral',
};

export default function ExamsPage() {
  useWindowTitle('Exams & Marks');
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading, isError } = useGetExamsQuery({});
  const { data: classesData } = useGetClassesQuery();
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [publishResults] = usePublishResultsMutation();
  const exams = data?.data || [];
  const classes = classesData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createExam(data).unwrap();
      toast.success('Exam created successfully');
      reset();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create exam');
    }
  };

  const handlePublish = async (examId: string, name: string) => {
    if (!confirm(`Publish results for "${name}"? Students will be notified.`)) return;
    try {
      await publishResults(examId).unwrap();
      toast.success('Results published and students notified');
    } catch {
      toast.error('Failed to publish results');
    }
  };

  if (isError) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="card p-8 text-center max-w-sm">
        <p className="text-danger font-semibold">Failed to load data</p>
        <p className="text-text-secondary text-sm mt-2">Please refresh the page.</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm mt-4">Refresh</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Exams & Marks</h1>
          <p className="text-text-secondary text-sm">Manage examinations and enter marks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          <Plus size={15} /> Create Exam
        </button>
      </div>

      {/* Exam grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-card animate-fade-up" />)
        ) : exams.length === 0 ? (
          <div className="col-span-full card p-16 text-center animate-fade-up">
            <BookOpen size={48} className="mx-auto text-text-tertiary mb-4 opacity-20" />
            <p className="text-text-secondary">No exams scheduled yet</p>
          </div>
        ) : exams.map((exam: any, i: number) => (
          <div key={exam._id} className={`card p-5 space-y-4 animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-semibold text-text-primary">{exam.name}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{exam.classId?.name} {exam.classId?.section}</p>
              </div>
              <span className={`badge ${ExamTypeColors[exam.type] || 'badge-neutral'} text-xs`}>{exam.type}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(exam.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={12} />
                {exam.maxMarks} marks
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center gap-2">
              <Link to={`/dashboard/exams/${exam._id}/marks`}
                className="flex-1 text-center text-xs py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all font-medium">
                Enter Marks
              </Link>
              {!exam.isPublished ? (
                <button onClick={() => handlePublish(exam._id, exam.name)}
                  className="flex items-center gap-1 text-xs py-2 px-3 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all font-medium">
                  <Send size={11} /> Publish
                </button>
              ) : (
                <span className="badge badge-success text-xs">Published</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-xl text-text-primary">Create Exam</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Exam Name *</label>
                <input {...register('name', { required: true })} placeholder="e.g. Mid-Term Exam 2024" className="input mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Type *</label>
                  <select {...register('type', { required: true })} className="input mt-1.5">
                    {['unitTest','midterm','final','practical','assignment','quiz'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Class *</label>
                  <select {...register('classId', { required: true })} className="input mt-1.5">
                    <option value="">Select</option>
                    {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Start Date *</label>
                  <input {...register('startDate', { required: true })} type="date" className="input mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">End Date *</label>
                  <input {...register('endDate', { required: true })} type="date" className="input mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Max Marks</label>
                  <input {...register('maxMarks')} type="number" defaultValue={100} className="input mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Passing Marks</label>
                  <input {...register('passingMarks')} type="number" defaultValue={35} className="input mt-1.5" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Academic Year</label>
                <input {...register('academicYear')} placeholder="2024-25" className="input mt-1.5" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center">
                  {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {isCreating ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
