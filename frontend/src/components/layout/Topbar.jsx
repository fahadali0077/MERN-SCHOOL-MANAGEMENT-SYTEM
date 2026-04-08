import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled, { keyframes, css } from 'styled-components';
import Avatar from '../ui/Avatar';

/* ── Icon helper ── */
const Icon = ({ d, size = 18, strokeWidth = 1.75 }) => (
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

const ICONS = {
  menu:         ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  bell:         ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  search:       ['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0'],
  chevronRight: 'M9 18l6-6-6-6',
  user:         ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 3a4 4 0 100 8 4 4 0 000-8z'],
  settings:     ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'],
  logout:       ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  x:            ['M18 6L6 18', 'M6 6l12 12'],
};

/* ── Breadcrumb config ── */
const BREADCRUMB_MAP = {
  '/Admin/dashboard':  ['Admin', 'Dashboard'],
  '/Admin/classes':    ['Admin', 'Academic', 'Classes'],
  '/Admin/subjects':   ['Admin', 'Academic', 'Subjects'],
  '/Admin/teachers':   ['Admin', 'People', 'Teachers'],
  '/Admin/students':   ['Admin', 'People', 'Students'],
  '/Admin/notices':    ['Admin', 'Communication', 'Notices'],
  '/Admin/addnotice':  ['Admin', 'Communication', 'Add Notice'],
  '/Admin/complains':  ['Admin', 'Communication', 'Complaints'],
  '/Admin/profile':    ['Admin', 'Account', 'Profile'],
  '/Admin/addstudents':['Admin', 'People', 'Add Student'],
  '/Admin/addclass':   ['Admin', 'Academic', 'Add Class'],

  '/Teacher/dashboard':['Teacher', 'Dashboard'],
  '/Teacher/class':    ['Teacher', 'My Class'],
  '/Teacher/complain': ['Teacher', 'Complaints'],
  '/Teacher/profile':  ['Teacher', 'Profile'],

  '/Student/dashboard':['Student', 'Dashboard'],
  '/Student/subjects': ['Student', 'Subjects'],
  '/Student/attendance':['Student', 'Attendance'],
  '/Student/complain': ['Student', 'Complaints'],
  '/Student/profile':  ['Student', 'Profile'],
};

const getBreadcrumbs = (pathname) => {
  const exact = BREADCRUMB_MAP[pathname];
  if (exact) return exact;
  // fuzzy match on prefix
  const match = Object.keys(BREADCRUMB_MAP)
    .filter((k) => pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0];
  return match ? [...BREADCRUMB_MAP[match], '...'] : ['Dashboard'];
};

/* ──────────────────────────────────────────────────
   Styled components
────────────────────────────────────────────────── */
const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  height: var(--topbar-height);
  padding: 0 20px 0 0;
  background: var(--bg-card);
  border-bottom: 1px solid var(--color-neutral-100);
  transition: box-shadow var(--transition-base);

  ${({ $scrolled }) =>
    $scrolled &&
    css`
      box-shadow: var(--shadow-sm);
    `}
`;

const MenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: var(--topbar-height);
  height: var(--topbar-height);
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: color var(--transition-base);

  &:hover { color: var(--color-neutral-800); }

  @media (max-width: 640px) { display: flex; }
`;

const BreadcrumbArea = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding-left: 24px;
  overflow: hidden;
  min-width: 0;

  @media (max-width: 640px) { padding-left: 4px; }
`;

const BreadCrumbItem = styled.span`
  font-size: var(--text-sm);
  color: ${({ $last }) => ($last ? 'var(--color-neutral-800)' : 'var(--color-neutral-400)')};
  font-weight: ${({ $last }) => ($last ? '600' : '400')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BreadSep = styled.span`
  color: var(--color-neutral-300);
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconBtn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base), border-color var(--transition-base);

  &:hover {
    background: var(--color-neutral-100);
    color: var(--color-neutral-700);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const SearchHint = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background: var(--color-neutral-50);
  color: var(--color-neutral-400);
  font-size: var(--text-xs);
  font-family: var(--font-display);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  margin-right: 4px;

  &:hover {
    background: var(--bg-card);
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-600);
  }

  @media (max-width: 768px) { display: none; }
`;

const KbdTag = styled.kbd`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 5px;
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-neutral-500);
`;

const NotifDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-danger);
  border: 1.5px solid var(--bg-card);
`;

/* ── User menu dropdown ── */
const AvatarBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-left: 4px;

  &:hover {
    background: var(--color-neutral-100);
    border-color: var(--color-neutral-200);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const AvatarName = styled.span`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-neutral-700);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) { display: none; }
`;

const DropdownOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 70;
  min-width: 200px;
  background: var(--bg-card);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: ${slideDown} 150ms ease-out;
`;

const DropdownHeader = styled.div`
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--color-neutral-100);
`;

const DropdownName = styled.p`
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-neutral-800);
`;

const DropdownRole = styled.p`
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  margin-top: 2px;
`;

const DropdownBody = styled.div`
  padding: 6px;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover {
    background: var(--color-neutral-100);
    color: var(--color-neutral-800);
    text-decoration: none;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: var(--color-neutral-100);
  margin: 4px 0;
`;

const LogoutItem = styled(DropdownItem)`
  color: var(--color-danger);
  &:hover { background: var(--color-danger-50); color: var(--color-danger-700); }
`;

/* ──────────────────────────────────────────────────
   Topbar component
────────────────────────────────────────────────── */
const Topbar = ({ onMobileMenuOpen }) => {
  const location    = useLocation();
  const { currentUser, currentRole } = useSelector((state) => state.user);

  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const avatarRef = useRef(null);

  /* scroll listener */
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const handler = () => setScrolled(main.scrollTop > 4);
    main.addEventListener('scroll', handler, { passive: true });
    return () => main.removeEventListener('scroll', handler);
  }, []);

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const userName    = currentUser?.name || 'User';
  const profilePath = `/${currentRole}/profile`;

  return (
    <Bar $scrolled={scrolled}>
      {/* Mobile hamburger */}
      <MenuButton onClick={onMobileMenuOpen} aria-label="Open navigation menu">
        <Icon d={ICONS.menu} size={20} />
      </MenuButton>

      {/* Breadcrumbs */}
      <BreadcrumbArea aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <BreadSep aria-hidden="true">
                <Icon d={ICONS.chevronRight} size={12} />
              </BreadSep>
            )}
            <BreadCrumbItem $last={i === breadcrumbs.length - 1}>
              {crumb}
            </BreadCrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbArea>

      {/* Right actions */}
      <Actions>
        {/* Search hint */}
        <SearchHint aria-label="Search (Ctrl+K)">
          <Icon d={ICONS.search} size={13} />
          <span>Search</span>
          <KbdTag>⌘K</KbdTag>
        </SearchHint>

        {/* Notifications */}
        <IconBtn aria-label="Notifications">
          <Icon d={ICONS.bell} size={18} />
          <NotifDot aria-hidden="true" />
        </IconBtn>

        {/* User menu */}
        <div style={{ position: 'relative' }} ref={avatarRef}>
          <AvatarBtn
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Open user menu"
          >
            <Avatar name={userName} size="sm" />
            <AvatarName>{userName}</AvatarName>
          </AvatarBtn>

          {menuOpen && (
            <>
              <DropdownOverlay onClick={() => setMenuOpen(false)} />
              <Dropdown role="menu">
                <DropdownHeader>
                  <DropdownName>{userName}</DropdownName>
                  <DropdownRole>{currentRole}</DropdownRole>
                </DropdownHeader>
                <DropdownBody>
                  <DropdownItem to={profilePath} role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Icon d={ICONS.user} size={15} />
                    View Profile
                  </DropdownItem>
                  <DropdownDivider />
                  <LogoutItem to="/logout" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Icon d={ICONS.logout} size={15} />
                    Sign Out
                  </LogoutItem>
                </DropdownBody>
              </Dropdown>
            </>
          )}
        </div>
      </Actions>
    </Bar>
  );
};

export default Topbar;
