import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetStudentsQuery, useDeleteStudentMutation } from '../../store/api/endpoints';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Users, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'badge-success', inactive: 'badge-neutral',
    transferred: 'badge-warning', graduated: 'badge-accent'
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
};

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteStudent] = useDeleteStudentMutation();

  const { data, isLoading } = useGetStudentsQuery({ page, limit: 25, search: debouncedSearch });
  const students = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      await deleteStudent(id).unwrap();
      toast.success('Student deactivated');
    } catch {
      toast.error('Failed to deactivate student');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Students</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {pagination?.total ? `${pagination.total} students enrolled` : 'Manage student records'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={15} /> Export
          </button>
          <Link to="/dashboard/students/add" className="btn-primary text-sm">
            <Plus size={15} /> Add Student
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up animate-fade-up-delay-1">
        {[
          { label: 'Total', value: pagination?.total || 0, color: '#0066FF' },
          { label: 'Active', value: students.filter((s: any) => s.status === 'active').length, color: '#10B981' },
          { label: 'This Month', value: students.filter((s: any) => {
            const d = new Date(s.admissionDate);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, color: '#F59E0B' },
          { label: 'Classes', value: new Set(students.map((s: any) => s.classId?._id)).size, color: '#8B5CF6' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="text-2xl font-display font-bold text-text-primary">{stat.value.toLocaleString()}</p>
            <p className="text-text-secondary text-sm mt-1">{stat.label}</p>
            <div className="h-0.5 rounded-full mt-3" style={{ background: stat.color, opacity: 0.3 }} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up animate-fade-up-delay-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, roll number..."
            className="input pl-9 text-sm"
          />
        </div>
        <button className="btn-secondary text-sm flex items-center gap-2 flex-shrink-0">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="table-container animate-fade-up animate-fade-up-delay-3">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No.</th>
              <th>Class</th>
              <th>Admission No.</th>
              <th>Status</th>
              <th>Admission Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j}><div className="skeleton h-5 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <Users size={40} className="mx-auto text-text-tertiary mb-3 opacity-50" />
                  <p className="text-text-secondary text-sm">No students found</p>
                  <Link to="/dashboard/students/add" className="text-accent text-sm hover:underline mt-1 inline-block">Add your first student</Link>
                </td>
              </tr>
            ) : students.map((student: any) => {
              const user = student.userId;
              const cls = student.classId;
              const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
              return (
                <tr key={student._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-text-primary">{name}</p>
                        <p className="text-xs text-text-tertiary">{user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-text-secondary">{student.rollNumber}</td>
                  <td>
                    {cls ? (
                      <span className="badge badge-neutral text-xs">{cls.name} {cls.section}</span>
                    ) : <span className="text-text-tertiary text-xs">—</span>}
                  </td>
                  <td className="font-mono text-xs text-text-tertiary">{student.admissionNumber}</td>
                  <td><StatusBadge status={student.status} /></td>
                  <td className="text-sm text-text-secondary">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/dashboard/students/${student._id}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 transition-all">
                        <Eye size={14} />
                      </Link>
                      <Link to={`/dashboard/students/${student._id}/edit`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-warning hover:bg-warning/10 transition-all">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(student._id, name)}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between animate-fade-up">
          <p className="text-sm text-text-secondary">
            Page {pagination.page} of {pagination.pages} — {pagination.total} total
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Previous</button>
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-accent text-white' : 'text-text-secondary hover:bg-white/5'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
