import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled, { css, keyframes } from 'styled-components';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

/* ─────────────────────────────────────────
   Lucide-style inline SVG icons
   (no dependency — zero-bundle-cost icons)
───────────────────────────────────────── */
const Icon = ({ d, size = 16, strokeWidth = 1.75 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {Array.isArray(d)
      ? d.map((path, i) => <path key={i} d={path} />)
      : <path d={d} />}
  </svg>
);

/* icon paths */
const ICONS = {
  home:         'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  classes:      ['M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z','M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z'],
  subjects:     ['M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2','M9 5a2 2 0 002 2h2a2 2 0 002-2','M9 5a2 2 0 012-2h2a2 2 0 012 2','M9 12h6M9 16h4'],
  teachers:     ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 7a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  students:     ['M22 10v6M2 10l10-5 10 5-10 5z','M6 12v5c3 3 9 3 12 0v-5'],
  notices:      ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 01-3.46 0'],
  complaints:   ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z','M12 9v4M12 17h.01'],
  profile:      ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2','M12 3a4 4 0 100 8 4 4 0 000-8z'],
  logout:       ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  attendance:   ['M9 11l3 3L22 4','M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11'],
  chevronLeft:  'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  menu:         ['M3 12h18','M3 6h18','M3 18h18'],
  educore:      ['M12 2L2 7l10 5 10-5-10-5z','M2 17l10 5 10-5','M2 12l10 5 10-5'],
};

/* ──────────────────────────────────────────────────
   Styled components
────────────────────────────────────────────────── */
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`;

const SidebarRoot = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  width: ${({ $collapsed }) => ($collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)')};
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.06);

  @media (max-width: 1024px) {
    width: ${({ $collapsed }) => ($collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)')};
  }

  @media (max-width: 640px) {
    width: var(--sidebar-width);
    transform: ${({ $mobileOpen }) => ($mobileOpen ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-xl);
  }
`;

const MobileBackdrop = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: ${({ $visible }) => ($visible ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    z-index: 99;
    background: var(--bg-overlay);
    backdrop-filter: blur(4px);
    animation: fadeIn 200ms ease;
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  }
`;

/* ── Brand header ── */
const BrandArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 ${({ $collapsed }) => ($collapsed ? '14px' : '16px')};
  height: var(--topbar-height);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  overflow: hidden;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'space-between')};
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  white-space: nowrap;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity 150ms ease;
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'none' : 'auto')};
`;

const CollapseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all var(--transition-base);
  flex-shrink: 0;

  &:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  @media (max-width: 640px) { display: none; }
`;

/* ── Nav scroll area ── */
const NavScroll = styled.nav`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;

  &::-webkit-scrollbar { width: 0; }
`;

/* ── Nav group ── */
const NavGroup = styled.div`
  margin-bottom: 4px;
`;

const GroupLabel = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  padding: 12px 10px 6px;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  height: ${({ $collapsed }) => ($collapsed ? '4px' : 'auto')};
  transition: opacity 150ms ease, height 150ms ease;
`;

/* ── Nav item ── */
const NavItem = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 ${({ $collapsed }) => ($collapsed ? '0' : '10px')};
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  border-radius: var(--radius-md);
  text-decoration: none;
  color: rgba(255,255,255,0.55);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: background var(--transition-base), color var(--transition-base);
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 2px;

  /* active left accent bar */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 2px;
    border-radius: 0 2px 2px 0;
    background: var(--color-primary-500);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity var(--transition-base);
  }

  /* active state */
  ${({ $active }) =>
    $active
      ? css`
          background: rgba(14, 165, 233, 0.12);
          color: var(--color-primary-300);
        `
      : css`
          &:hover {
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.9);
            text-decoration: none;
          }
        `}

  /* icon scale on hover */
  &:hover svg {
    transform: scale(1.05);
  }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  transition: transform var(--transition-base);

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      width: 40px;
      margin: 0 -10px;
    `}
`;

const NavLabel = styled.span`
  flex: 1;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity 120ms ease;
  pointer-events: none;
`;

/* tooltip on collapsed */
const NavTooltip = styled.span`
  position: absolute;
  left: calc(100% + 8px);
  background: var(--color-neutral-800);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 5px 10px;
  border-radius: var(--radius-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 150ms ease, transform 150ms ease;
  box-shadow: var(--shadow-md);
  z-index: 200;

  ${NavItem}:hover & {
    opacity: ${({ $show }) => ($show ? 1 : 0)};
    transform: ${({ $show }) => ($show ? 'translateX(0)' : 'translateX(-4px)')};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 8px 0;
`;

/* ── User footer ── */
const UserFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: ${({ $collapsed }) => ($collapsed ? '12px 12px' : '12px 14px')};
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  overflow: hidden;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity 150ms ease;
  pointer-events: ${({ $collapsed }) => ($collapsed ? 'none' : 'auto')};
`;

const UserName = styled.p`
  font-size: var(--text-sm);
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

const UserRole = styled.p`
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
`;

/* ──────────────────────────────────────────────────
   Nav config per role
────────────────────────────────────────────────── */
const NAV_CONFIG = {
  Admin: [
    {
      group: 'Overview',
      items: [
        { label: 'Home',       to: '/Admin/dashboard',  icon: 'home',      match: ['/Admin/dashboard', '/'] },
      ],
    },
    {
      group: 'Academic',
      items: [
        { label: 'Classes',    to: '/Admin/classes',    icon: 'classes',   match: ['/Admin/classes'] },
        { label: 'Subjects',   to: '/Admin/subjects',   icon: 'subjects',  match: ['/Admin/subjects'] },
      ],
    },
    {
      group: 'People',
      items: [
        { label: 'Teachers',   to: '/Admin/teachers',   icon: 'teachers',  match: ['/Admin/teachers'] },
        { label: 'Students',   to: '/Admin/students',   icon: 'students',  match: ['/Admin/students'] },
      ],
    },
    {
      group: 'Communication',
      items: [
        { label: 'Notices',    to: '/Admin/notices',    icon: 'notices',   match: ['/Admin/notices', '/Admin/addnotice'] },
        { label: 'Complaints', to: '/Admin/complains',  icon: 'complaints',match: ['/Admin/complains'] },
      ],
    },
    {
      group: 'Account',
      divider: true,
      items: [
        { label: 'Profile',    to: '/Admin/profile',    icon: 'profile',   match: ['/Admin/profile'] },
        { label: 'Logout',     to: '/logout',           icon: 'logout',    match: ['/logout'] },
      ],
    },
  ],

  Teacher: [
    {
      group: 'Overview',
      items: [
        { label: 'Home',       to: '/Teacher/dashboard', icon: 'home',      match: ['/Teacher/dashboard', '/'] },
        { label: 'My Class',   to: '/Teacher/class',     icon: 'classes',   match: ['/Teacher/class'] },
        { label: 'Complaints', to: '/Teacher/complain',  icon: 'complaints',match: ['/Teacher/complain'] },
      ],
    },
    {
      group: 'Account',
      divider: true,
      items: [
        { label: 'Profile',    to: '/Teacher/profile',   icon: 'profile',   match: ['/Teacher/profile'] },
        { label: 'Logout',     to: '/logout',            icon: 'logout',    match: ['/logout'] },
      ],
    },
  ],

  Student: [
    {
      group: 'Overview',
      items: [
        { label: 'Home',       to: '/Student/dashboard', icon: 'home',       match: ['/Student/dashboard', '/'] },
        { label: 'Subjects',   to: '/Student/subjects',  icon: 'subjects',   match: ['/Student/subjects'] },
        { label: 'Attendance', to: '/Student/attendance',icon: 'attendance', match: ['/Student/attendance'] },
        { label: 'Complaints', to: '/Student/complain',  icon: 'complaints', match: ['/Student/complain'] },
      ],
    },
    {
      group: 'Account',
      divider: true,
      items: [
        { label: 'Profile',    to: '/Student/profile',   icon: 'profile',    match: ['/Student/profile'] },
        { label: 'Logout',     to: '/logout',            icon: 'logout',     match: ['/logout'] },
      ],
    },
  ],
};

const ROLE_BADGE_VARIANT = { Admin: 'admin', Teacher: 'teacher', Student: 'student' };

/* ──────────────────────────────────────────────────
   Sidebar component
────────────────────────────────────────────────── */
const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const { currentUser, currentRole } = useSelector((state) => state.user);

  /* collapsed: auto-collapsed on tablet (640–1024px), expanded on desktop */
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024 && window.innerWidth > 640);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024 && window.innerWidth > 640) setCollapsed(true);
      else if (window.innerWidth >= 1024) setCollapsed(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* close mobile drawer on route change */
  useEffect(() => {
    if (mobileOpen && onMobileClose) onMobileClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = useCallback(
    (matchPaths) => matchPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/')),
    [location.pathname]
  );

  const navGroups = NAV_CONFIG[currentRole] || [];
  const userName   = currentUser?.name       || 'User';
  const schoolName = currentUser?.schoolName || 'EduCore';

  return (
    <>
      <MobileBackdrop $visible={mobileOpen} onClick={onMobileClose} />

      <SidebarRoot $collapsed={collapsed} $mobileOpen={mobileOpen} role="navigation" aria-label="Main navigation">

        {/* ── Brand ── */}
        <BrandArea $collapsed={collapsed}>
          <LogoIcon aria-hidden="true">
            <Icon d={ICONS.educore} size={18} strokeWidth={2} />
          </LogoIcon>
          <BrandName $collapsed={collapsed}>{schoolName}</BrandName>
          {!collapsed && (
            <CollapseBtn
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Icon d={ICONS.chevronLeft} size={14} />
            </CollapseBtn>
          )}
          {collapsed && (
            <CollapseBtn
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              style={{ position: 'absolute', right: 8, display: 'flex' }}
            >
              <Icon d={ICONS.chevronRight} size={14} />
            </CollapseBtn>
          )}
        </BrandArea>

        {/* ── Nav ── */}
        <NavScroll>
          {navGroups.map((group, gi) => (
            <NavGroup key={gi}>
              {group.divider && <Divider />}
              <GroupLabel $collapsed={collapsed}>{group.group}</GroupLabel>

              {group.items.map((item) => {
                const active = isActive(item.match);
                return (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    $active={active}
                    $collapsed={collapsed}
                    aria-current={active ? 'page' : undefined}
                  >
                    <NavIcon $collapsed={collapsed}>
                      <Icon d={ICONS[item.icon]} size={16} />
                    </NavIcon>
                    <NavLabel $collapsed={collapsed}>{item.label}</NavLabel>
                    {collapsed && (
                      <NavTooltip $show={collapsed}>{item.label}</NavTooltip>
                    )}
                  </NavItem>
                );
              })}
            </NavGroup>
          ))}
        </NavScroll>

        {/* ── User footer ── */}
        <UserFooter $collapsed={collapsed}>
          <Avatar name={userName} size="sm" />
          <UserInfo $collapsed={collapsed}>
            <UserName>{userName}</UserName>
            <UserRole>
              <Badge variant={ROLE_BADGE_VARIANT[currentRole] || 'neutral'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                {currentRole}
              </Badge>
            </UserRole>
          </UserInfo>
        </UserFooter>

      </SidebarRoot>
    </>
  );
};

export default Sidebar;
