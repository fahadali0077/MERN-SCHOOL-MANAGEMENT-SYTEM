import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole, selectCurrentUser } from '../../store/slices/authSlice';
import { useGetClassesQuery, useGetSubjectsQuery } from '../../store/api/endpoints';
import {
  BookOpen, Plus, Clock, CheckCircle, AlertCircle,
  X, Loader2, Calendar, Users, Upload
} from 'lucide-react';
import { apiSlice } from '../../store/api/apiSlice';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// ─── Inject endpoints ─────────────────────────────────────────────────────────
const assignmentApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getAssignments: b.query<any, any>({
      query: (p) => ({ url: '/assignments', params: p }),
      providesTags: ['Assignments'],
    }),
    createAssignment: b.mutation<any, any>({
      query: (d) => ({ url: '/assignments', method: 'POST', body: d }),
      invalidatesTags: ['Assignments'],
    }),
    // FIX: Student submission endpoint — was missing entirely
    submitAssignment: b.mutation<any, { assignmentId: string; content: string }>({
      query: ({ assignmentId, ...data }) => ({
        url: `/assignments/${assignmentId}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assignments'],
    }),
  }),
  overrideExisting: false,
});

const {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSubmitAssignmentMutation,
} = assignmentApi;

const typeColors: Record<string, string> = {
  homework: 'badge-neutral', project: 'badge-accent',
  quiz: 'badge-warning', classwork: 'badge-success', lab: 'badge-accent'
};

// ─── Student submission modal ─────────────────────────────────────────────────
function SubmitModal({
  assignment,
  onClose,
}: {
  assignment: any;
  onClose: () => void;
}) {
  const [submitAssignment, { isLoading }] = useSubmitAssignmentMutation();
  const { register, handleSubmit } = useForm<{ content: string }>();

  const onSubmit = async (data: { content: string }) => {
    try {
      await submitAssignment({ assignmentId: assignment._id, content: data.content }).unwrap();
      toast.success('Assignment submitted!');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-xl text-text-primary">Submit Assignment</h2>
            <p className="text-xs text-text-tertiary mt-0.5">{assignment.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Your Answer / Notes
            </label>
            <textarea
              {...register('content', { required: true })}
              placeholder="Write your answer or describe what you've submitted..."
              rows={5}
              className="input mt-1.5 resize-none w-full"
            />
          </div>
          <p className="text-xs text-text-tertiary">
            Due: {new Date(assignment.dueDate).toLocaleString()} •
            Max marks: {assignment.maxMarks || 10}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {isLoading ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AssignmentsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<any | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const role = useSelector(selectUserRole);
  const canCreate = ['teacher', 'schoolAdmin', 'superAdmin'].includes(role || '');

  const { data, isLoading } = useGetAssignmentsQuery({ classId: selectedClass });
  const { data: classesData } = useGetClassesQuery();
  const { data: subjectsData } = useGetSubjectsQuery();
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();

  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];
  const assignments = data?.data || [];

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (d: any) => {
    try {
      await createAssignment(d).unwrap();
      toast.success('Assignment created and students notified');
      reset();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create assignment');
    }
  };

  const overdueCount = assignments.filter(
    (a: any) => new Date(a.dueDate) < new Date() && a.status !== 'closed'
  ).length;
  const pendingSubmissions = assignments.reduce(
    (acc: number, a: any) => acc + (a.pendingCount || 0), 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Assignments</h1>
          <p className="text-text-secondary text-sm">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
            {overdueCount > 0 && <span className="text-danger"> • {overdueCount} overdue</span>}
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            <Plus size={15} /> New Assignment
          </button>
        )}
      </div>

      {/* Stats (teacher/admin only) */}
      {canCreate && (
        <div className="grid grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-1">
          {[
            { label: 'Total', value: assignments.length, icon: BookOpen, color: '#0066FF' },
            { label: 'Pending Submissions', value: pendingSubmissions, icon: Clock, color: '#F59E0B' },
            { label: 'Overdue', value: overdueCount, icon: AlertCircle, color: overdueCount > 0 ? '#EF4444' : '#10B981' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-tertiary">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 animate-fade-up animate-fade-up-delay-2">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="input max-w-xs text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
          ))}
        </select>
      </div>

      {/* Assignment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-card animate-fade-up" />
          ))
        ) : assignments.length === 0 ? (
          <div className="col-span-full card p-16 text-center animate-fade-up">
            <BookOpen size={48} className="mx-auto text-text-tertiary opacity-20 mb-3" />
            <p className="text-text-secondary text-sm">No assignments yet</p>
            {canCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="text-accent text-sm mt-2 hover:underline"
              >
                Create your first assignment →
              </button>
            )}
          </div>
        ) : assignments.map((a: any, i: number) => {
          const isOverdue = new Date(a.dueDate) < new Date() && a.status !== 'closed';
          const dueText = formatDistanceToNow(new Date(a.dueDate), { addSuffix: true });
          const alreadySubmitted = a.mySubmission != null;

          return (
            <div
              key={a._id}
              className={`card p-5 space-y-3 animate-fade-up ${isOverdue ? 'border-danger/20' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <span className={`badge ${typeColors[a.type] || 'badge-neutral'} text-xs`}>{a.type}</span>
                {isOverdue ? (
                  <span className="flex items-center gap-1 text-xs text-danger">
                    <AlertCircle size={11} />Overdue
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Clock size={11} />{dueText}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-display font-semibold text-text-primary">{a.title}</h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {a.subjectId?.name} • {a.classId?.name} {a.classId?.section}
                </p>
              </div>

              {a.description && (
                <p className="text-xs text-text-secondary line-clamp-2">{a.description}</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                  <Calendar size={11} />Due {new Date(a.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Users size={11} />{a.submissionCount || 0} submitted
                </div>
              </div>

              {canCreate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                    <span className="text-text-tertiary">{a.pendingCount || 0} pending grading</span>
                  </div>
                </div>
              )}

              {/* FIX: Student submit button now opens SubmitModal which calls the API */}
              {!canCreate && (
                alreadySubmitted ? (
                  <div className="flex items-center gap-2 text-xs text-success pt-1">
                    <CheckCircle size={13} />
                    <span>Submitted</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSubmitTarget(a)}
                    disabled={isOverdue && a.status === 'closed'}
                    className="btn-primary w-full text-xs py-2 justify-center disabled:opacity-40"
                  >
                    <Upload size={13} /> Submit Assignment
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-xl text-text-primary">Create Assignment</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Title *</label>
                <input {...register('title', { required: true })} placeholder="Assignment title" className="input mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Class *</label>
                  <select {...register('classId', { required: true })} className="input mt-1.5">
                    <option value="">Select class</option>
                    {classes.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Subject *</label>
                  <select {...register('subjectId', { required: true })} className="input mt-1.5">
                    <option value="">Select subject</option>
                    {subjects.map((s: any) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</label>
                  <select {...register('type')} className="input mt-1.5">
                    {['homework', 'project', 'quiz', 'classwork', 'lab'].map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Max Marks</label>
                  <input {...register('maxMarks')} type="number" defaultValue={10} className="input mt-1.5" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Due Date *</label>
                <input {...register('dueDate', { required: true })} type="datetime-local" className="input mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</label>
                <textarea {...register('description')} placeholder="Instructions for students..." rows={3} className="input mt-1.5 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center">
                  {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {isCreating ? 'Creating…' : 'Create & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit modal */}
      {submitTarget && (
        <SubmitModal
          assignment={submitTarget}
          onClose={() => setSubmitTarget(null)}
        />
      )}
    </div>
  );
}
