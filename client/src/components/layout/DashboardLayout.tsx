import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  BarChart3, DollarSign, Bell, Settings, LogOut, Menu, X,
  ChevronLeft, ChevronRight, FileText, School, Search, User,
  MessageCircle, BookMarked, Globe, TrendingUp
} from 'lucide-react';
import { selectCurrentUser, selectUserRole } from '../../store/slices/authSlice';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { useLogoutMutation } from '../../store/api/endpoints';
import NotificationPanel from '../dashboard/NotificationPanel';

type NavItem = { label: string; icon: any; path: string; badge?: number };

const navConfig: Record<string, NavItem[]> = {
  superAdmin: [
    { label: 'Platform', icon: Globe, path: '/dashboard/superadmin' },
    { label: 'Schools', icon: School, path: '/dashboard/schools' },
    { label: 'Students', icon: Users, path: '/dashboard/students' },
    { label: 'Teachers', icon: GraduationCap, path: '/dashboard/teachers' },
    { label: 'Classes', icon: BookOpen, path: '/dashboard/classes' },
    { label: 'Attendance', icon: ClipboardList, path: '/dashboard/attendance' },
    { label: 'Exams & Marks', icon: BarChart3, path: '/dashboard/exams' },
    { label: 'Assignments', icon: BookMarked, path: '/dashboard/assignments' },
    { label: 'Fees', icon: DollarSign, path: '/dashboard/fees' },
    { label: 'Invoices', icon: FileText, path: '/dashboard/invoices' },
    { label: 'Notices', icon: Bell, path: '/dashboard/notices' },
    { label: 'Messages', icon: MessageCircle, path: '/dashboard/messages' },
  ],
  schoolAdmin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
    { label: 'Students', icon: Users, path: '/dashboard/students' },
    { label: 'Teachers', icon: GraduationCap, path: '/dashboard/teachers' },
    { label: 'Classes', icon: BookOpen, path: '/dashboard/classes' },
    { label: 'Attendance', icon: ClipboardList, path: '/dashboard/attendance' },
    { label: 'Exams & Marks', icon: BarChart3, path: '/dashboard/exams' },
    { label: 'Assignments', icon: BookMarked, path: '/dashboard/assignments' },
    { label: 'Fees', icon: DollarSign, path: '/dashboard/fees' },
    { label: 'Invoices', icon: FileText, path: '/dashboard/invoices' },
    { label: 'Notices', icon: Bell, path: '/dashboard/notices' },
    { label: 'Messages', icon: MessageCircle, path: '/dashboard/messages' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/teacher' },
    { label: 'My Classes', icon: BookOpen, path: '/dashboard/classes' },
    { label: 'Attendance', icon: ClipboardList, path: '/dashboard/attendance' },
    { label: 'Marks Entry', icon: BarChart3, path: '/dashboard/exams' },
    { label: 'Assignments', icon: BookMarked, path: '/dashboard/assignments' },
    { label: 'Notices', icon: Bell, path: '/dashboard/notices' },
    { label: 'Messages', icon: MessageCircle, path: '/dashboard/messages' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { label: 'Attendance', icon: ClipboardList, path: '/dashboard/attendance' },
    { label: 'Results', icon: BarChart3, path: '/dashboard/exams' },
    { label: 'Assignments', icon: BookMarked, path: '/dashboard/assignments' },
    { label: 'My Fees', icon: DollarSign, path: '/dashboard/invoices' },
    { label: 'Notices', icon: Bell, path: '/dashboard/notices' },
    { label: 'Messages', icon: MessageCircle, path: '/dashboard/messages' },
  ],
  parent: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { label: 'Attendance', icon: ClipboardList, path: '/dashboard/attendance' },
    { label: 'Results', icon: BarChart3, path: '/dashboard/exams' },
    { label: 'Fees', icon: DollarSign, path: '/dashboard/invoices' },
    { label: 'Notices', icon: Bell, path: '/dashboard/notices' },
    { label: 'Messages', icon: MessageCircle, path: '/dashboard/messages' },
  ],
};

const roleLabels: Record<string, string> = {
  superAdmin: 'Super Admin', schoolAdmin: 'School Admin',
  teacher: 'Teacher', student: 'Student', parent: 'Parent'
};

interface SidebarProps { collapsed?: boolean; onToggleCollapse?: () => void; mobile?: boolean; onClose?: () => void; }

function Sidebar({ collapsed = false, onToggleCollapse, mobile = false, onClose }: SidebarProps) {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const items = navConfig[role as keyof typeof navConfig] || navConfig.student;

  const handleLogout = async () => {
    try { await logoutMutation().unwrap(); } catch {}
    dispatch(logout());
    navigate('/auth/login');
  };

  const isCollapsed = collapsed && !mobile;

  return (
    <aside className={`
      flex flex-col h-full bg-bg-secondary
      border-r border-[rgba(255,255,255,0.05)]
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-[72px]' : mobile ? 'w-72' : 'w-64'}
    `}>
      {/* Logo row */}
      <div className={`flex items-center gap-3 border-b border-[rgba(255,255,255,0.05)] flex-shrink-0 ${isCollapsed ? 'justify-center px-0 py-4' : 'px-5 py-4'}`}>
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <School size={18} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="font-display font-bold text-lg leading-none">
            <span className="text-text-primary">School</span>
            <span className="text-accent">MS</span>
          </span>
        )}
        {!mobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-all flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
        {mobile && onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-text-tertiary hover:text-text-primary">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Role label */}
      {!isCollapsed && (
        <div className="px-5 py-2.5 border-b border-[rgba(255,255,255,0.05)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
            {roleLabels[role || ''] || 'Portal'}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => `
              sidebar-link
              ${isActive ? 'active' : ''}
              ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}
            `}
          >
            <item.icon size={17} className="flex-shrink-0" />
            {!isCollapsed && <span className="leading-none">{item.label}</span>}
            {!isCollapsed && item.badge && item.badge > 0 && (
              <span className="ml-auto bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className={`border-t border-[rgba(255,255,255,0.05)] p-3 space-y-0.5 flex-shrink-0`}>
        <NavLink to="/dashboard/profile" title={isCollapsed ? 'Profile' : undefined}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}>
          <User size={17} className="flex-shrink-0" />
          {!isCollapsed && <span>Profile</span>}
        </NavLink>
        <NavLink to="/dashboard/settings" title={isCollapsed ? 'Settings' : undefined}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}>
          <Settings size={17} className="flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
        <button onClick={handleLogout}
          className={`sidebar-link w-full text-danger hover:bg-danger/8 hover:text-danger ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
          title={isCollapsed ? 'Logout' : undefined}>
          <LogOut size={17} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* User pill */}
        {!isCollapsed && user && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-text-tertiary truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 animate-slide-in">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center gap-3 px-4 md:px-6 bg-bg-secondary border-b border-[rgba(255,255,255,0.05)] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
            <Menu size={18} />
          </button>

          {/* Search bar */}
          <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary border border-white/6 text-text-tertiary text-sm hover:border-accent/30 transition-all flex-1 max-w-sm">
            <Search size={13} />
            <span>Quick search...</span>
            <kbd className="ml-auto text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <NavLink to="/dashboard/profile" className="flex items-center gap-2.5 pl-3 border-l border-white/8 ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-xs font-display font-bold shadow-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-text-primary leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-text-tertiary capitalize mt-0.5">{user?.role?.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Notification panel */}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
    </div>
  );
}
