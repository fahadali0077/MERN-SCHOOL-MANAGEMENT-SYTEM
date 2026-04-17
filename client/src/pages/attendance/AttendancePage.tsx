import React, { useState, useEffect } from 'react';
import { useGetClassesQuery, useMarkAttendanceMutation, useGetAttendanceQuery, useGenerateQRMutation } from '../../store/api/endpoints';
import { QrCode, CheckCircle, XCircle, Clock, RefreshCw, Save, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWindowTitle } from '../../hooks';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: 'P', color: 'bg-success text-white', icon: <CheckCircle size={12} /> },
  absent: { label: 'A', color: 'bg-danger text-white', icon: <XCircle size={12} /> },
  late: { label: 'L', color: 'bg-warning text-white', icon: <Clock size={12} /> },
  excused: { label: 'E', color: 'bg-accent text-white', icon: <CheckCircle size={12} /> },
};

export default function AttendancePage() {
  useWindowTitle('Attendance');
  const today = new Date().toISOString().split('T')[0];
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<{ qrImage: string; expiresAt: string } | null>(null);

  const { data: classesData, isError } = useGetClassesQuery();
  const classes = classesData?.data || [];

  const { data: attendanceData, refetch } = useGetAttendanceQuery(
    { classId: selectedClass, date: selectedDate },
    { skip: !selectedClass }
  );

  const [markAttendance, { isLoading: isSaving }] = useMarkAttendanceMutation();
  const [generateQR, { isLoading: isGeneratingQR }] = useGenerateQRMutation();

  // Load existing attendance records into state
  useEffect(() => {
    if (attendanceData?.data?.records) {
      const rec: Record<string, string> = {};
      attendanceData.data.records.forEach((r: any) => {
        rec[r.studentId?._id || r.studentId] = r.status;
      });
      setRecords(rec);
    }
  }, [attendanceData]);

  // Load class students when class changes
  const selectedClassData = classes.find((c: any) => c._id === selectedClass);

  const handleStatusToggle = (studentId: string) => {
    const statuses = ['present', 'absent', 'late', 'excused'];
    const current = records[studentId] || 'absent';
    const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
    setRecords(prev => ({ ...prev, [studentId]: next }));
  };

  const markAll = (status: string) => {
    if (!selectedClassData) return;
    const newRec: Record<string, string> = {};
    // We'd normally have the student list from the class — mark all present
    Object.keys(records).forEach(id => { newRec[id] = status; });
    setRecords(newRec);
  };

  const handleSave = async () => {
    if (!selectedClass) return toast.error('Select a class first');
    const recordsArray = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
    if (recordsArray.length === 0) return toast.error('No attendance records to save');

    try {
      await markAttendance({
        classId: selectedClass,
        date: selectedDate,
        records: recordsArray,
        type: 'daily'
      }).unwrap();
      toast.success('Attendance saved successfully');
      refetch();
    } catch {
      toast.error('Failed to save attendance');
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedClass) return toast.error('Select a class first');
    try {
      const res = await generateQR({
        classId: selectedClass,
        date: selectedDate,
        expiresInMinutes: 15
      }).unwrap();
      setQrData(res.data);
      setShowQR(true);
    } catch {
      toast.error('Failed to generate QR');
    }
  };

  const present = Object.values(records).filter(s => s === 'present').length;
  const absent = Object.values(records).filter(s => s === 'absent').length;
  const late = Object.values(records).filter(s => s === 'late').length;
  const total = Object.keys(records).length;

  if (isError) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="card p-8 text-center max-w-sm">
        <p className="text-danger font-semibold">Failed to load attendance data</p>
        <p className="text-text-secondary text-sm mt-2">Please refresh the page.</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-sm mt-4">Refresh</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Attendance</h1>
          <p className="text-text-secondary text-sm">Mark and track student attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleGenerateQR} disabled={!selectedClass || isGeneratingQR}
            className="btn-secondary text-sm flex items-center gap-2">
            {isGeneratingQR ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
            QR Code
          </button>
          <button onClick={handleSave} disabled={!selectedClass || isSaving}
            className="btn-primary text-sm flex items-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up animate-fade-up-delay-1">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input max-w-xs text-sm">
          <option value="">Select Class</option>
          {classes.map((cls: any) => (
            <option key={cls._id} value={cls._id}>{cls.name} {cls.section}</option>
          ))}
        </select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="input max-w-[180px] text-sm" max={today} />
        <button onClick={() => refetch()} className="p-2.5 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all">
          <RefreshCw size={15} />
        </button>
      </div>

      {selectedClass ? (
        <>
          {/* Summary bar */}
          {total > 0 && (
            <div className="grid grid-cols-4 gap-3 animate-fade-up animate-fade-up-delay-2">
              {[
                { label: 'Total', value: total, color: 'bg-white/5 text-text-primary' },
                { label: 'Present', value: present, color: 'bg-success/10 text-success border border-success/20' },
                { label: 'Absent', value: absent, color: 'bg-danger/10 text-danger border border-danger/20' },
                { label: 'Late', value: late, color: 'bg-warning/10 text-warning border border-warning/20' },
              ].map(s => (
                <div key={s.label} className={`p-3 rounded-xl text-center ${s.color}`}>
                  <p className="text-xl font-display font-bold">{s.value}</p>
                  <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2 animate-fade-up">
            <button onClick={() => markAll('present')} className="text-xs px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all">
              Mark All Present
            </button>
            <button onClick={() => markAll('absent')} className="text-xs px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all">
              Mark All Absent
            </button>
          </div>

          {/* Student list */}
          {attendanceData?.data?.records?.length > 0 ? (
            <div className="card overflow-hidden animate-fade-up animate-fade-up-delay-3">
              <div className="p-4 border-b border-white/5">
                <p className="text-sm font-medium text-text-secondary">
                  Click status badge to cycle: Present → Absent → Late → Excused
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {attendanceData.data.records.map((record: any) => {
                  const student = record.studentId;
                  const user = student?.userId;
                  const sid = student?._id || record.studentId;
                  const status = records[sid] || record.status || 'absent';
                  const cfg = statusConfig[status] || statusConfig.absent;

                  return (
                    <div key={sid} className="flex items-center gap-4 px-4 py-3 hover:bg-white/2 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/50 to-purple-500/50 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-text-tertiary">Roll: {student?.rollNumber || '—'}</p>
                      </div>
                      <button onClick={() => handleStatusToggle(sid)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${cfg.color}`}>
                        {cfg.icon}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center animate-fade-up">
              <Users size={48} className="mx-auto text-text-tertiary mb-3 opacity-30" />
              <p className="text-text-secondary text-sm">No attendance records yet for this class on this date.</p>
              <p className="text-text-tertiary text-xs mt-1">Use QR code or manually mark attendance.</p>
            </div>
          )}
        </>
      ) : (
        <div className="card p-16 text-center animate-fade-up animate-fade-up-delay-2">
          <CheckCircle size={48} className="mx-auto text-text-tertiary mb-4 opacity-20" />
          <p className="text-text-secondary">Select a class to start marking attendance</p>
        </div>
      )}

      {/* QR Modal */}
      {showQR && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowQR(false)}>
          <div className="glass p-8 max-w-sm w-full mx-4 animate-fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl text-text-primary text-center mb-2">QR Attendance</h3>
            <p className="text-text-secondary text-sm text-center mb-6">
              Students scan this to mark themselves present
            </p>
            <img src={qrData.qrImage} alt="QR Code" className="w-full rounded-xl" />
            <div className="mt-4 text-center">
              <p className="text-xs text-text-tertiary">
                Expires: {new Date(qrData.expiresAt).toLocaleTimeString()}
              </p>
            </div>
            <button onClick={() => setShowQR(false)} className="btn-secondary w-full mt-4 justify-center">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
