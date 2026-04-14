import React, { useState } from 'react';
import { useGetClassesQuery, useCreateClassMutation, useGetSubjectsQuery, useCreateSubjectMutation } from '../../store/api/endpoints';
import { Plus, BookOpen, Users, X, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday'];

export default function ClassesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubject, setShowSubject] = useState(false);

  const { data: classesData, isLoading } = useGetClassesQuery();
  const { data: subjectsData } = useGetSubjectsQuery();
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [createSubject, { isLoading: isCreatingSubj }] = useCreateSubjectMutation();

  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];

  const { register, handleSubmit, reset } = useForm();
  const { register: regS, handleSubmit: submitS, reset: resetS } = useForm();

  const onCreateClass = async (d: any) => {
    try {
      await createClass({ ...d, grade: Number(d.grade) }).unwrap();
      toast.success('Class created');
      reset();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create class');
    }
  };

  const onCreateSubject = async (d: any) => {
    try {
      await createSubject(d).unwrap();
      toast.success('Subject created');
      resetS();
      setShowSubject(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create subject');
    }
  };

  const gradeGroups = classes.reduce((acc: Record<number, any[]>, cls: any) => {
    if (!acc[cls.grade]) acc[cls.grade] = [];
    acc[cls.grade].push(cls);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Classes</h1>
          <p className="text-text-secondary text-sm">{classes.length} classes, {subjects.length} subjects</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSubject(true)} className="btn-secondary text-sm"><Plus size={14}/>Add Subject</button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm"><Plus size={15}/>Add Class</button>
        </div>
      </div>

      {/* Subjects quick view */}
      {subjects.length > 0 && (
        <div className="card p-4 animate-fade-up animate-fade-up-delay-1">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Subjects ({subjects.length})</h3>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subj: any) => (
              <span key={subj._id} className="badge badge-neutral text-xs">
                {subj.name} <span className="opacity-50 ml-1">({subj.code})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Classes grouped by grade */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-card animate-fade-up"/>)}
        </div>
      ) : classes.length === 0 ? (
        <div className="card p-16 text-center animate-fade-up">
          <BookOpen size={48} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
          <p className="text-text-secondary text-sm">No classes created yet</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up animate-fade-up-delay-2">
          {Object.entries(gradeGroups).sort(([a],[b]) => Number(a)-Number(b)).map(([grade, gradeClasses]) => (
            <div key={grade} className="card overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-bg-tertiary/50">
                <BookOpen size={16} className="text-accent"/>
                <h3 className="font-display font-semibold text-text-primary">Grade {grade}</h3>
                <span className="badge badge-accent text-xs">{(gradeClasses as any[]).length} section{(gradeClasses as any[]).length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-white/5">
                {(gradeClasses as any[]).map((cls: any) => (
                  <div key={cls._id}>
                    <button
                      onClick={() => setExpanded(expanded === cls._id ? null : cls._id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/2 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-display font-bold text-sm">
                          {cls.section || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{cls.name} — Section {cls.section}</p>
                          <p className="text-xs text-text-tertiary">
                            {cls.subjects?.length || 0} subjects • {cls.room ? `Room ${cls.room}` : 'No room assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {cls.classTeacher && (
                          <span className="text-xs text-text-tertiary hidden sm:block">
                            {cls.classTeacher.firstName} {cls.classTeacher.lastName}
                          </span>
                        )}
                        {expanded === cls._id ? <ChevronDown size={16} className="text-text-tertiary"/> : <ChevronRight size={16} className="text-text-tertiary"/>}
                      </div>
                    </button>

                    {/* Expanded: timetable */}
                    {expanded === cls._id && (
                      <div className="px-4 pb-4">
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                          {/* Subjects */}
                          {cls.subjects?.length > 0 ? (
                            <div>
                              <div className="p-3 bg-bg-tertiary border-b border-white/5">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Subjects & Teachers</p>
                              </div>
                              <div className="divide-y divide-white/5">
                                {cls.subjects.map((s: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between px-3 py-2.5">
                                    <span className="text-sm text-text-primary">{s.subjectId?.name || 'Unknown Subject'}</span>
                                    <span className="text-xs text-text-tertiary">
                                      {s.teacherId ? `${s.teacherId.firstName} ${s.teacherId.lastName}` : 'Unassigned'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center">
                              <p className="text-text-tertiary text-xs">No subjects assigned</p>
                            </div>
                          )}

                          {/* Timetable */}
                          {cls.timetable?.length > 0 && (
                            <div className="border-t border-white/5">
                              <div className="p-3 bg-bg-tertiary border-b border-white/5">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Timetable</p>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="text-xs w-full">
                                  <thead>
                                    <tr>
                                      <th className="p-2 text-left text-text-tertiary">Day</th>
                                      <th className="p-2 text-left text-text-tertiary">Period</th>
                                      <th className="p-2 text-left text-text-tertiary">Time</th>
                                      <th className="p-2 text-left text-text-tertiary">Subject</th>
                                      <th className="p-2 text-left text-text-tertiary">Room</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {cls.timetable.sort((a: any, b: any) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)).map((slot: any, i: number) => (
                                      <tr key={i} className="border-t border-white/5">
                                        <td className="p-2 text-text-secondary capitalize">{slot.day}</td>
                                        <td className="p-2 text-text-secondary">P{slot.period}</td>
                                        <td className="p-2 text-text-tertiary font-mono">{slot.startTime}–{slot.endTime}</td>
                                        <td className="p-2 text-text-primary">{slot.subjectId?.name || '—'}</td>
                                        <td className="p-2 text-text-tertiary">{slot.room || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-xl text-text-primary">Create Class</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onCreateClass)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Class Name *</label>
                  <input {...register('name', { required: true })} placeholder="e.g. Grade 10" className="input mt-1.5"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Section</label>
                  <input {...register('section')} placeholder="A" className="input mt-1.5"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade *</label>
                  <input {...register('grade', { required: true })} type="number" placeholder="10" min="1" max="12" className="input mt-1.5"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Room</label>
                  <input {...register('room')} placeholder="101" className="input mt-1.5"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Academic Year</label>
                <input {...register('academicYear')} placeholder="2024-25" className="input mt-1.5"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Capacity</label>
                <input {...register('capacity')} type="number" defaultValue={40} className="input mt-1.5"/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreating} className="btn-primary flex-1 justify-center">
                  {isCreating ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {showSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-display font-bold text-xl text-text-primary">Add Subject</h2>
              <button onClick={() => setShowSubject(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"><X size={18}/></button>
            </div>
            <form onSubmit={submitS(onCreateSubject)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Subject Name *</label>
                <input {...regS('name', { required: true })} placeholder="Mathematics" className="input mt-1.5"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Code *</label>
                  <input {...regS('code', { required: true })} placeholder="MATH" className="input mt-1.5 uppercase"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</label>
                  <select {...regS('type')} className="input mt-1.5">
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Credits</label>
                <input {...regS('credits')} type="number" defaultValue={1} className="input mt-1.5"/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSubject(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isCreatingSubj} className="btn-primary flex-1 justify-center">
                  {isCreatingSubj ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                  {isCreatingSubj ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
