import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, ClipboardList, BarChart3, DollarSign,
  FileText, Phone, Mail, Calendar, MapPin, Edit2, Upload
} from 'lucide-react';
import { useGetStudentQuery, useGetStudentAttendanceQuery, useGetStudentFeesQuery } from '../../store/api/endpoints';
import { apiSlice } from '../../store/api/apiSlice';
import { useWindowTitle } from '../../hooks';

// Inject upload endpoint inline
const studentDocApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    uploadStudentDocument: b.mutation<any, { studentId: string; formData: FormData }>({
      query: ({ studentId, formData }) => ({
        url: `/students/${studentId}/documents`,
        method: 'POST',
        body: formData,
        // Don't set Content-Type — browser sets it with boundary for multipart
        formData: true,
      }),
      invalidatesTags: (r, e, { studentId }) => [{ type: 'Students', id: studentId }],
    }),
  }),
  overrideExisting: false,
});

const { useUploadStudentDocumentMutation } = studentDocApi;

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'attendance', label: 'Attendance', icon: ClipboardList },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'fees', label: 'Fees', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
    {Icon && <Icon size={14} className="text-text-tertiary mt-0.5 flex-shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-sm text-text-primary mt-0.5 font-medium">{value || '—'}</p>
    </div>
  </div>
);

export default function StudentDetail() {
  useWindowTitle('Student Profile');
  const { id } = useParams<{ id: string }>();
  const [uploadingDoc, setUploadingDoc] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadDocument] = useUploadStudentDocumentMutation();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: studentData, isLoading } = useGetStudentQuery(id!);
  const { data: attendanceData } = useGetStudentAttendanceQuery({ studentId: id! }, { skip: activeTab !== 'attendance' });
  const { data: feesData } = useGetStudentFeesQuery(id!, { skip: activeTab !== 'fees' });

  const student = studentData?.data;
  const user = student?.userId;
  const cls = student?.classId;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-card" />)}
      </div>
    );
  }

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('name', file.name);
      formData.append('type', file.type.includes('pdf') ? 'pdf' : 'other');
      await uploadDocument({ studentId: student._id, formData }).unwrap();
      toast.success('Document uploaded');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Upload failed');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!student) {
    return (
      <div className="p-6">
        <div className="card p-16 text-center">
          <p className="text-text-secondary">Student not found</p>
          <Link to="/dashboard/students" className="text-accent text-sm mt-2 inline-block">← Back to Students</Link>
        </div>
      </div>
    );
  }

  const attendance = attendanceData?.data;
  const fees = feesData?.data;
  const statusColor: Record<string, string> = {
    active: 'badge-success', inactive: 'badge-neutral', transferred: 'badge-warning', graduated: 'badge-accent'
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-up">
        <Link to="/dashboard/students" className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-display font-bold text-text-primary">Student Profile</h1>
      </div>

      {/* Profile card */}
      <div className="card p-6 animate-fade-up animate-fade-up-delay-1">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-2xl font-display font-bold shadow-glow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className={`badge ${statusColor[student.status] || 'badge-neutral'} absolute -bottom-2 -right-2 text-[10px]`}>{student.status}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-display font-bold text-text-primary">{user?.firstName} {user?.lastName}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge badge-accent text-xs">{cls?.name} {cls?.section}</span>
              <span className="badge badge-neutral text-xs">Roll: {student.rollNumber}</span>
              <span className="badge badge-neutral text-xs font-mono text-[10px]">{student.admissionNumber}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-secondary">
              {user?.email && <span className="flex items-center gap-1.5"><Mail size={13}/>{user.email}</span>}
              {user?.phone && <span className="flex items-center gap-1.5"><Phone size={13}/>{user.phone}</span>}
              {student.admissionDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13}/>Admitted {new Date(student.admissionDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <button className="btn-secondary text-sm flex items-center gap-2 flex-shrink-0">
            <Edit2 size={13}/>Edit
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/5">
          {[
            { label: 'Attendance', value: `${attendance?.stats?.percentage || '—'}%`, color: '#10B981' },
            { label: 'Documents', value: student.documents?.length || 0, color: '#0066FF' },
            { label: 'Fee Category', value: student.feeCategory || 'Regular', color: '#F59E0B' },
            { label: 'Blood Group', value: student.bloodGroup || 'N/A', color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-bg-tertiary">
              <p className="text-lg font-display font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary border border-white/5 p-1 rounded-xl overflow-x-auto animate-fade-up animate-fade-up-delay-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id ? 'bg-accent text-white shadow-glow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}>
            <tab.icon size={14}/>{tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="animate-fade-up">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-text-primary mb-4">Personal Information</h3>
              <InfoRow label="Full Name" value={`${user?.firstName} ${user?.lastName}`} icon={User}/>
              <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : undefined} icon={Calendar}/>
              <InfoRow label="Gender" value={student.gender}/>
              <InfoRow label="Blood Group" value={student.bloodGroup}/>
              <InfoRow label="Nationality" value={student.nationality}/>
              <InfoRow label="Email" value={user?.email} icon={Mail}/>
              <InfoRow label="Phone" value={user?.phone} icon={Phone}/>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-semibold text-text-primary mb-4">Academic Details</h3>
              <InfoRow label="Class" value={cls ? `${cls.name} ${cls.section}` : undefined}/>
              <InfoRow label="Grade" value={cls?.grade?.toString()}/>
              <InfoRow label="Roll Number" value={student.rollNumber}/>
              <InfoRow label="Admission Number" value={student.admissionNumber}/>
              <InfoRow label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : undefined} icon={Calendar}/>
              <InfoRow label="Fee Category" value={student.feeCategory}/>
              <InfoRow label="Status" value={student.status}/>
            </div>
            {student.guardian?.name && (
              <div className="card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">Guardian Information</h3>
                <InfoRow label="Name" value={student.guardian.name} icon={User}/>
                <InfoRow label="Relation" value={student.guardian.relation}/>
                <InfoRow label="Phone" value={student.guardian.phone} icon={Phone}/>
                <InfoRow label="Email" value={student.guardian.email} icon={Mail}/>
              </div>
            )}
            {student.address?.current?.city && (
              <div className="card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">Address</h3>
                <InfoRow label="Street" value={student.address.current.street} icon={MapPin}/>
                <InfoRow label="City" value={student.address.current.city}/>
                <InfoRow label="State" value={student.address.current.state}/>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {attendance ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Total', value: attendance.stats.total, c: '#888' },
                    { label: 'Present', value: attendance.stats.present, c: '#10B981' },
                    { label: 'Absent', value: attendance.stats.absent, c: '#EF4444' },
                    { label: 'Late', value: attendance.stats.late, c: '#F59E0B' },
                    { label: 'Rate', value: `${attendance.stats.percentage}%`, c: attendance.stats.percentage >= 75 ? '#10B981' : '#EF4444' },
                  ].map(s => (
                    <div key={s.label} className="stat-card text-center">
                      <p className="text-2xl font-display font-bold" style={{ color: s.c }}>{s.value}</p>
                      <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="card p-6">
                  <div className="flex justify-between mb-3">
                    <h3 className="font-display font-semibold text-text-primary">Attendance Rate</h3>
                    <span className={`font-display font-bold ${attendance.stats.percentage >= 75 ? 'text-success' : 'text-danger'}`}>{attendance.stats.percentage}%</span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${attendance.stats.percentage}%`, background: attendance.stats.percentage >= 75 ? '#10B981' : '#EF4444' }}/>
                  </div>
                  <div className="flex justify-between text-xs text-text-tertiary mt-2">
                    <span>0%</span><span className="text-warning">75% min</span><span>100%</span>
                  </div>
                </div>
                {attendance.records?.length > 0 && (
                  <div className="card overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                      <h3 className="font-display font-semibold text-text-primary text-sm">Recent Records</h3>
                    </div>
                    <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                      {attendance.records.slice(0, 30).map((rec: any, i: number) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm text-text-secondary">
                            {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`badge text-xs ${
                            rec.records?.[0]?.status === 'present' ? 'badge-success' :
                            rec.records?.[0]?.status === 'absent' ? 'badge-danger' :
                            rec.records?.[0]?.status === 'late' ? 'badge-warning' : 'badge-neutral'
                          }`}>{rec.records?.[0]?.status || 'unknown'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-16 text-center">
                <ClipboardList size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
                <p className="text-text-secondary text-sm">No attendance records</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="card p-16 text-center">
            <BarChart3 size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
            <p className="text-text-secondary text-sm">Select an exam to view results</p>
            <Link to="/dashboard/exams" className="text-accent text-sm mt-2 inline-block hover:underline">Browse Exams →</Link>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-4">
            {fees ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Invoiced', value: fees.summary?.total, c: '#888' },
                    { label: 'Total Paid', value: fees.summary?.paid, c: '#10B981' },
                    { label: 'Balance Due', value: fees.summary?.pending, c: fees.summary?.pending > 0 ? '#EF4444' : '#10B981' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <p className="text-2xl font-display font-bold" style={{ color: s.c }}>${(s.value || 0).toLocaleString()}</p>
                      <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Invoice</th><th>Period</th><th>Total</th><th>Paid</th><th>Balance</th><th>Due</th><th>Status</th></tr></thead>
                    <tbody>
                      {fees.invoices?.map((inv: any) => (
                        <tr key={inv._id}>
                          <td className="font-mono text-xs text-text-tertiary">{inv.invoiceNumber}</td>
                          <td className="text-sm text-text-secondary">{inv.month}/{inv.year}</td>
                          <td className="text-sm font-medium">${inv.totalAmount?.toLocaleString()}</td>
                          <td className="text-sm text-success">${inv.paidAmount?.toLocaleString()}</td>
                          <td className={`text-sm font-semibold ${inv.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>${inv.balanceDue?.toLocaleString()}</td>
                          <td className="text-sm text-text-secondary">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                          <td><span className={`badge text-xs ${inv.status === 'paid' ? 'badge-success' : inv.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="card p-16 text-center">
                <DollarSign size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
                <p className="text-text-secondary text-sm">No fee records found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={handleUploadClick}
                  disabled={uploadingDoc}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {uploadingDoc
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/><span>Uploading...</span></>
                    : <><Upload size={14}/><span>Upload Document</span></>
                  }
                </button>
              </>
            </div>
            {student.documents?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {student.documents.map((doc: any, i: number) => (
                  <div key={i} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-accent"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                      <p className="text-xs text-text-tertiary capitalize">{doc.type}</p>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">View</a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-16 text-center">
                <FileText size={40} className="mx-auto text-text-tertiary opacity-20 mb-3"/>
                <p className="text-text-secondary text-sm">No documents uploaded</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
