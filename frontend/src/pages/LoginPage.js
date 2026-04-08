import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';

const GlobalFont = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
`;

/* ─── Animations ─── */
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const gentlePulse = keyframes`
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.04); }
`;
const floatAnim = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
`;

/* ─── Layout ─── */
const Page = styled.div`
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important; } }
`;

/* ── Left decorative panel ── */
const LeftPanel = styled.div`
  flex: 1;
  background: ${p => ROLE_THEMES[p.$role]?.gradient || ROLE_THEMES.Admin.gradient};
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 48px;
  position: relative; overflow: hidden;
  @media (max-width: 900px) { display: none; }

  &::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 28px 28px;
  }
`;
const PanelOrb = styled.div`
  position: absolute;
  width: ${p => p.$size || '300px'}; height: ${p => p.$size || '300px'};
  border-radius: 50%;
  background: ${p => p.$color || 'rgba(14,165,233,0.1)'};
  top: ${p => p.$top || 'auto'}; left: ${p => p.$left || 'auto'};
  right: ${p => p.$right || 'auto'}; bottom: ${p => p.$bottom || 'auto'};
  filter: blur(60px);
  animation: ${gentlePulse} ${p => p.$dur || '6s'} ease-in-out infinite;
  animation-delay: ${p => p.$delay || '0s'};
`;
const IlluWrap = styled.div`
  position: relative; z-index: 2;
  animation: ${floatAnim} 6s ease-in-out infinite;
  margin-bottom: 36px;
`;
const PanelContent = styled.div`
  position: relative; z-index: 2; text-align: center;
`;
const PanelBadge = styled.div`
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px; padding: 6px 16px;
  font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.9);
  margin-bottom: 20px;
`;
const PanelTitle = styled.h2`
  font-size: 28px; font-weight: 700; color: #fff;
  letter-spacing: -0.02em; margin-bottom: 12px; line-height: 1.2;
`;
const PanelSub = styled.p`
  font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.7; max-width: 300px;
`;
const FeatureList = styled.div`
  display: flex; flex-direction: column; gap: 10px;
  margin-top: 28px; text-align: left;
`;
const FeatureItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: rgba(255,255,255,0.8);
`;
const FeatureDot = styled.div`
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 10px;
`;

/* ── Right panel ── */
const RightPanel = styled.div`
  width: 560px; min-height: 100vh;
  background: #f8fafc;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 48px;
  @media (max-width: 900px) { width: 100%; padding: 40px 24px; }
`;
const TopBar = styled.div`
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 40px;
`;
const LogoLink = styled(Link)`
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; font-size: 16px; font-weight: 700; color: #0f172a;
`;
const BackLink = styled(Link)`
  font-size: 14px; font-weight: 500; color: #64748b;
  text-decoration: none; display: flex; align-items: center; gap: 4px;
  transition: color 0.2s;
  &:hover { color: #0ea5e9; }
`;

const FormCard = styled.div`
  width: 100%; max-width: 420px;
`;

/* Role badge at top of form */
const RoleBadge = styled.div`
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: ${p => p.$bg || '#eff6ff'};
  border-radius: 999px;
  font-size: 13px; font-weight: 600; color: ${p => p.$color || '#0369a1'};
  margin-bottom: 20px;
  animation: ${fadeSlideUp} 0.4s ease both;
`;

const FormTitle = styled.h1`
  font-size: 26px; font-weight: 700; color: #0f172a;
  letter-spacing: -0.02em; margin-bottom: 6px;
  animation: ${fadeSlideUp} 0.4s 0.05s ease both;
`;
const FormSub = styled.p`
  font-size: 14px; color: #64748b; margin-bottom: 32px; line-height: 1.6;
  animation: ${fadeSlideUp} 0.4s 0.1s ease both;
`;

/* Form fields */
const Field = styled.div`
  margin-bottom: 18px;
  animation: ${fadeSlideUp} 0.4s ${p => p.$delay || '0.15s'} ease both;
`;
const FieldLabel = styled.label`
  display: block; font-size: 13px; font-weight: 600; color: #374151;
  margin-bottom: 6px;
`;
const InputRow = styled.div`
  position: relative; display: flex; align-items: center;
`;
const IconLeft = styled.span`
  position: absolute; left: 14px;
  display: flex; align-items: center;
  color: #94a3b8; pointer-events: none; font-size: 16px;
`;
const FieldInput = styled.input`
  width: 100%; height: 44px;
  padding: 0 44px 0 ${p => p.$left ? '42px' : '14px'};
  padding-right: ${p => p.$right ? '44px' : '14px'};
  background: #fff;
  border: 1.5px solid ${p => p.$err ? '#ef4444' : '#e2e8f0'};
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;

  &::placeholder { color: #94a3b8; }
  &:focus {
    border-color: ${p => p.$err ? '#ef4444' : '#0ea5e9'};
    box-shadow: 0 0 0 3px ${p => p.$err ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.12)'};
  }
  ${p => p.$err && `animation: ${shake} 0.4s ease;`}
`;
const ToggleEye = styled.button`
  position: absolute; right: 14px;
  background: none; border: none; cursor: pointer;
  color: #94a3b8; font-size: 16px; padding: 0;
  display: flex; align-items: center;
  transition: color 0.2s;
  &:hover { color: #475569; }
`;
const ErrMsg = styled.p`
  font-size: 12px; color: #ef4444; margin-top: 5px;
  display: flex; align-items: center; gap: 4px;
`;

/* Guest toggle */
const GuestToggle = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px;
  background: #f1f5f9; border-radius: 12px;
  margin-bottom: 24px;
  animation: ${fadeSlideUp} 0.4s 0.25s ease both;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #e2e8f0; }
`;
const Toggle = styled.div`
  width: 36px; height: 20px; border-radius: 999px;
  background: ${p => p.$on ? '#0ea5e9' : '#cbd5e1'};
  position: relative; flex-shrink: 0;
  transition: background 0.2s;
  &::after {
    content: '';
    position: absolute; top: 2px; left: ${p => p.$on ? '18px' : '2px'};
    width: 16px; height: 16px; border-radius: 50%; background: #fff;
    transition: left 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
`;
const GuestLabel = styled.span`
  font-size: 13px; font-weight: 500; color: #475569;
`;

/* Submit */
const SubmitBtn = styled.button`
  width: 100%; height: 46px;
  background: ${p => p.$bg || '#0ea5e9'};
  color: #fff; border: none; border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px; font-weight: 600;
  cursor: ${p => p.$loading ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.$loading ? 0.8 : 1};
  transition: background 0.2s, transform 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 8px;
  animation: ${fadeSlideUp} 0.4s 0.3s ease both;

  &:hover:not(:disabled) {
    background: ${p => p.$hoverBg || '#0284c7'};
    transform: translateY(-1px);
  }
  &:active:not(:disabled) { transform: scale(0.99); }
`;
const Spinner = styled.div`
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  animation: ${spin} 0.7s linear infinite;
`;

const GlobalErrBanner = styled.div`
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 10px; padding: 12px 14px;
  font-size: 13px; color: #dc2626;
  margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
  animation: ${fadeSlideUp} 0.3s ease both;
`;

const Divider = styled.div`
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0;
  span { font-size: 12px; color: #94a3b8; white-space: nowrap; }
  &::before, &::after {
    content: ''; flex: 1; height: 1px; background: #e2e8f0;
  }
`;
const RegisterLink = styled.p`
  text-align: center; font-size: 13px; color: #64748b;
  animation: ${fadeSlideUp} 0.4s 0.35s ease both;
  a {
    color: #0ea5e9; text-decoration: none; font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

/* ─── Role theme configs ─── */
const ROLE_THEMES = {
  Admin: {
    gradient: 'linear-gradient(145deg, #0f172a 0%, #0c2340 40%, #0369a1 100%)',
    badgeBg: '#dbeafe', badgeColor: '#1d4ed8',
    btnBg: '#0ea5e9', btnHover: '#0284c7',
    emoji: '🛡️',
    panelTitle: 'Admin Portal',
    panelSub: 'Full control over your institution — students, teachers, classes, and more.',
    features: ['Manage all student & teacher data', 'Configure classes and subjects', 'Broadcast notices school-wide', 'Track attendance and results'],
  },
  Teacher: {
    gradient: 'linear-gradient(145deg, #064e3b 0%, #065f46 40%, #059669 100%)',
    badgeBg: '#d1fae5', badgeColor: '#065f46',
    btnBg: '#10b981', btnHover: '#059669',
    emoji: '📚',
    panelTitle: 'Teacher Portal',
    panelSub: 'Manage your classes, take attendance, and track student progress seamlessly.',
    features: ['Take daily attendance', 'Record and manage marks', 'View student performance', 'Communicate with admin'],
  },
  Student: {
    gradient: 'linear-gradient(145deg, #3b0764 0%, #4c1d95 40%, #7c3aed 100%)',
    badgeBg: '#ede9fe', badgeColor: '#5b21b6',
    btnBg: '#7c3aed', btnHover: '#6d28d9',
    emoji: '🎓',
    panelTitle: 'Student Portal',
    panelSub: 'Check your subjects, attendance records, and exam results all in one place.',
    features: ['View your timetable', 'Check attendance records', 'See exam results & marks', 'Read school notices'],
  },
};

/* ─── Role SVG Illustrations ─── */
const AdminIllustration = () => (
  <svg viewBox="0 0 280 260" fill="none" width="220" style={{ display: 'block' }}>
    <circle cx="140" cy="130" r="100" fill="white" fillOpacity="0.04"/>
    <rect x="70" y="110" width="140" height="110" rx="6" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>
    <path d="M58 112L140 62L222 112Z" fill="white" fillOpacity="0.16" stroke="white" strokeOpacity="0.25" strokeWidth="1.5"/>
    <line x1="140" y1="62" x2="140" y2="44" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
    <path d="M140 44L154 50L140 56Z" fill="white" fillOpacity="0.6"/>
    {[[85,128,20,16],[118,128,20,16],[162,128,20,16],[195,128,20,16]].map(([x,y,w,h],i)=>(
      <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="white" fillOpacity="0.2"/>
    ))}
    <rect x="118" y="170" width="44" height="50" rx="3" fill="white" fillOpacity="0.25"/>
    <circle cx="157" cy="197" r="2.5" fill="white" fillOpacity="0.5"/>
    <rect x="58" y="220" width="164" height="2" rx="1" fill="white" fillOpacity="0.12"/>
    {[[55,210,14,18],[216,210,14,18]].map(([cx,cy,rx,ry],i)=>(
      <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="white" fillOpacity="0.08"/>
    ))}
    {[[42,80,3.5],[240,75,3],[36,170,2.5],[250,175,3.5],[105,240,2],[180,245,2]].map(([x,y,r],i)=>(
      <circle key={i} cx={x} cy={y} r={r} fill="white" fillOpacity="0.4"/>
    ))}
  </svg>
);

const TeacherIllustration = () => (
  <svg viewBox="0 0 280 260" fill="none" width="220" style={{ display: 'block' }}>
    <rect x="40" y="60" width="200" height="140" rx="8" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>
    <rect x="40" y="60" width="200" height="32" rx="8" fill="white" fillOpacity="0.08"/>
    <rect x="56" y="74" width="60" height="6" rx="3" fill="white" fillOpacity="0.5"/>
    <rect x="56" y="108" width="168" height="4" rx="2" fill="white" fillOpacity="0.25"/>
    <rect x="56" y="120" width="140" height="4" rx="2" fill="white" fillOpacity="0.18"/>
    <rect x="56" y="132" width="155" height="4" rx="2" fill="white" fillOpacity="0.18"/>
    <rect x="56" y="144" width="120" height="4" rx="2" fill="white" fillOpacity="0.14"/>
    <rect x="56" y="162" width="80" height="24" rx="6" fill="white" fillOpacity="0.25"/>
    <rect x="144" y="162" width="80" height="24" rx="6" fill="white" fillOpacity="0.12"/>
    <circle cx="210" cy="76" r="10" fill="white" fillOpacity="0.3"/>
    <rect x="50" y="215" width="60" height="30" rx="6" fill="white" fillOpacity="0.12"/>
    <rect x="120" y="215" width="60" height="30" rx="6" fill="white" fillOpacity="0.12"/>
    <rect x="190" y="215" width="50" height="30" rx="6" fill="white" fillOpacity="0.12"/>
    {[[32,50,3],[250,48,2.5],[28,200,2],[258,195,3],[130,252,2],[170,255,2]].map(([x,y,r],i)=>(
      <circle key={i} cx={x} cy={y} r={r} fill="white" fillOpacity="0.4"/>
    ))}
  </svg>
);

const StudentIllustration = () => (
  <svg viewBox="0 0 280 260" fill="none" width="220" style={{ display: 'block' }}>
    <circle cx="140" cy="90" r="38" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>
    <circle cx="140" cy="78" r="20" fill="white" fillOpacity="0.2"/>
    <path d="M90 140 Q90 118 140 118 Q190 118 190 140 L195 175 H85Z" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>
    <path d="M110 58 L140 46 L170 58" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
    <rect x="60" y="185" width="160" height="50" rx="8" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
    <rect x="72" y="196" width="50" height="4" rx="2" fill="white" fillOpacity="0.35"/>
    <rect x="72" y="207" width="36" height="4" rx="2" fill="white" fillOpacity="0.22"/>
    <rect x="72" y="218" width="44" height="4" rx="2" fill="white" fillOpacity="0.22"/>
    <rect x="140" y="193" width="68" height="20" rx="5" fill="white" fillOpacity="0.2"/>
    <rect x="148" y="199" width="40" height="4" rx="2" fill="white" fillOpacity="0.4"/>
    <rect x="148" y="207" width="28" height="3" rx="2" fill="white" fillOpacity="0.3"/>
    {[[35,80,3],[248,72,2.5],[30,190,2],[255,185,3],[115,248,2],[175,252,2]].map(([x,y,r],i)=>(
      <circle key={i} cx={x} cy={y} r={r} fill="white" fillOpacity="0.4"/>
    ))}
  </svg>
);

const ILLUSTRATIONS = { Admin: AdminIllustration, Teacher: TeacherIllustration, Student: StudentIllustration };

/* ════════════════════════════════════════
   COMPONENT
════════════════════════════════════════ */
const LoginPage = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, currentUser, response, currentRole } = useSelector(s => s.user);

  const [showPw, setShowPw]   = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [loader, setLoader]   = useState(false);
  const [errMsg, setErrMsg]   = useState('');
  const [emailErr, setEmailErr] = useState(false);
  const [pwErr, setPwErr]       = useState(false);

  const theme = ROLE_THEMES[role] || ROLE_THEMES.Admin;
  const Illustration = ILLUSTRATIONS[role] || ILLUSTRATIONS.Admin;

  /* Navigation after login */
  useEffect(() => {
    if (status === 'success' || (currentUser !== null && currentRole !== null)) {
      navigate(`/${currentRole}/dashboard`);
    } else if (status === 'failed') {
      setErrMsg(response || 'Invalid credentials. Please try again.');
      setLoader(false);
    } else if (status === 'error') {
      setErrMsg('Network error. Please check your connection.');
      setLoader(false);
    }
  }, [status, currentUser, currentRole, navigate, response]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrMsg('');
    const email    = e.target.email?.value?.trim();
    const password = e.target.password?.value;

    let valid = true;
    if (!email)    { setEmailErr(true); valid = false; }
    if (!password) { setPwErr(true);    valid = false; }
    if (!valid) return;

    setLoader(true);
    const fields = isGuest
      ? { email: 'yogendra@12', password: 'zxc', rollNum: '1' }
      : { email, password };

    dispatch(loginUser(fields, role));
  };

  return (
    <>
      <GlobalFont />
      <Page>
        {/* ── Left panel ── */}
        <LeftPanel $role={role}>
          <PanelOrb $size="350px" $color="rgba(255,255,255,0.06)" $top="-100px" $left="-100px" $dur="8s"/>
          <PanelOrb $size="260px" $color="rgba(255,255,255,0.04)" $bottom="-80px" $right="-80px" $dur="10s" $delay="2s"/>

          <IlluWrap><Illustration /></IlluWrap>

          <PanelContent>
            <PanelBadge>{theme.emoji} {role} Access</PanelBadge>
            <PanelTitle>{theme.panelTitle}</PanelTitle>
            <PanelSub>{theme.panelSub}</PanelSub>
            <FeatureList>
              {theme.features.map(f => (
                <FeatureItem key={f}>
                  <FeatureDot>✓</FeatureDot>
                  {f}
                </FeatureItem>
              ))}
            </FeatureList>
          </PanelContent>
        </LeftPanel>

        {/* ── Right panel ── */}
        <RightPanel>
          <TopBar>
            <LogoLink to="/">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
                <path d="M16 7L6 12v2h20v-2L16 7z" fill="white"/>
                <rect x="8"    y="15" width="3"  height="8" fill="white" opacity="0.9"/>
                <rect x="14.5" y="15" width="3"  height="8" fill="white" opacity="0.9"/>
                <rect x="21"   y="15" width="3"  height="8" fill="white" opacity="0.9"/>
                <rect x="6"    y="23" width="20" height="2" rx="1" fill="white"/>
              </svg>
              Excellence
            </LogoLink>
            <BackLink to="/choose">← Switch Role</BackLink>
          </TopBar>

          <FormCard>
            <RoleBadge $bg={theme.badgeBg} $color={theme.badgeColor}>
              {theme.emoji}&nbsp; {role} Login
            </RoleBadge>
            <FormTitle>Welcome back</FormTitle>
            <FormSub>Sign in to your {role.toLowerCase()} dashboard to continue.</FormSub>

            {errMsg && (
              <GlobalErrBanner>
                <span>⚠️</span> {errMsg}
              </GlobalErrBanner>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <Field $delay="0.12s">
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <InputRow>
                  <IconLeft>✉</IconLeft>
                  <FieldInput
                    id="email" name="email" type="email"
                    placeholder={`${role.toLowerCase()}@school.edu`}
                    autoComplete="email" autoFocus
                    $left $err={emailErr}
                    onChange={() => { setEmailErr(false); setErrMsg(''); }}
                  />
                </InputRow>
                {emailErr && <ErrMsg>⚠ Email is required</ErrMsg>}
              </Field>

              {/* Password */}
              <Field $delay="0.18s">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputRow>
                  <IconLeft>🔒</IconLeft>
                  <FieldInput
                    id="password" name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    $left $right $err={pwErr}
                    onChange={() => { setPwErr(false); setErrMsg(''); }}
                  />
                  <ToggleEye type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                    {showPw ? '🙈' : '👁'}
                  </ToggleEye>
                </InputRow>
                {pwErr && <ErrMsg>⚠ Password is required</ErrMsg>}
              </Field>

              {/* Guest toggle */}
              <GuestToggle onClick={() => setIsGuest(v => !v)}>
                <Toggle $on={isGuest}/>
                <GuestLabel>
                  {isGuest ? '✅ Guest mode — demo credentials will be used' : 'Continue as guest (demo credentials)'}
                </GuestLabel>
              </GuestToggle>

              <SubmitBtn
                type="submit"
                $loading={loader}
                disabled={loader}
                $bg={theme.btnBg}
                $hoverBg={theme.btnHover}
              >
                {loader ? <><Spinner /> Signing in…</> : `Sign in as ${role}`}
              </SubmitBtn>
            </form>

            {role === 'Admin' && (
              <>
                <Divider><span>or</span></Divider>
                <RegisterLink>
                  New school? <a href="/AdminRegister">Create an admin account →</a>
                </RegisterLink>
              </>
            )}

            <RegisterLink style={{ marginTop: role === 'Admin' ? '0' : '20px' }}>
              <a href="/choose">← Back to role selection</a>
            </RegisterLink>
          </FormCard>
        </RightPanel>
      </Page>
    </>
  );
};

export default LoginPage;
