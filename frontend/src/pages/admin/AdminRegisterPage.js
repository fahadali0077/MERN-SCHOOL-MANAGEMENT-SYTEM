import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes, css } from 'styled-components';
import { registerUser } from '../../redux/userRelated/userHandle';

/* ─────────────────────────────────────────────────────────────
   Animations
───────────────────────────────────────────────────────────── */
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`;

const gentlePulse = keyframes`
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50%       { opacity: 1;    transform: scale(1.012); }
`;

/* ─────────────────────────────────────────────────────────────
   Illustration (admin-themed SVG — school building)
───────────────────────────────────────────────────────────── */
const Illustration = () => (
  <svg
    viewBox="0 0 380 460"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="School registration illustration"
    style={{ width: '100%', maxWidth: 340, height: 'auto', display: 'block' }}
  >
    {/* Ambient */}
    <circle cx="190" cy="240" r="180" fill="white" fillOpacity="0.03"/>
    <circle cx="190" cy="240" r="115" fill="white" fillOpacity="0.03"/>
    <circle cx="190" cy="240" r="148" stroke="white" strokeOpacity="0.06"
      strokeWidth="1" strokeDasharray="5 8"/>

    {/* School building */}
    <rect x="100" y="220" width="180" height="140" rx="4"
      fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>

    {/* Roof / triangle */}
    <path d="M88 222 L190 148 L292 222 Z"
      fill="white" fillOpacity="0.16" stroke="white" strokeOpacity="0.25" strokeWidth="1.5"/>

    {/* Flag pole */}
    <line x1="190" y1="148" x2="190" y2="118"
      stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round"/>
    <path d="M190 118 L210 126 L190 134 Z"
      fill="white" fillOpacity="0.5"/>

    {/* Windows */}
    <rect x="120" y="240" width="28" height="24" rx="3" fill="white" fillOpacity="0.18"/>
    <rect x="162" y="240" width="28" height="24" rx="3" fill="white" fillOpacity="0.18"/>
    <rect x="232" y="240" width="28" height="24" rx="3" fill="white" fillOpacity="0.18"/>
    {/* Window cross */}
    <line x1="134" y1="240" x2="134" y2="264" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
    <line x1="120" y1="252" x2="148" y2="252" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
    <line x1="176" y1="240" x2="176" y2="264" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
    <line x1="162" y1="252" x2="190" y2="252" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
    <line x1="246" y1="240" x2="246" y2="264" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
    <line x1="232" y1="252" x2="260" y2="252" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>

    {/* Door */}
    <rect x="168" y="300" width="44" height="60" rx="4"
      fill="white" fillOpacity="0.22" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
    {/* Door knob */}
    <circle cx="206" cy="333" r="3" fill="white" fillOpacity="0.5"/>
    {/* Door arch */}
    <path d="M168 300 Q190 284 212 300"
      stroke="white" strokeOpacity="0.35" strokeWidth="1.5" fill="none"/>

    {/* Ground line */}
    <rect x="80" y="360" width="220" height="2" rx="1" fill="white" fillOpacity="0.14"/>

    {/* Trees */}
    <ellipse cx="80" cy="330" rx="22" ry="28" fill="white" fillOpacity="0.12"/>
    <rect x="77" y="354" width="6" height="16" rx="2" fill="white" fillOpacity="0.12"/>
    <ellipse cx="300" cy="330" rx="22" ry="28" fill="white" fillOpacity="0.12"/>
    <rect x="297" y="354" width="6" height="16" rx="2" fill="white" fillOpacity="0.12"/>

    {/* Floating sparkle dots */}
    <circle cx="75"  cy="160" r="4" fill="white" fillOpacity="0.4"/>
    <circle cx="310" cy="145" r="3" fill="white" fillOpacity="0.35"/>
    <circle cx="55"  cy="300" r="3" fill="white" fillOpacity="0.3"/>
    <circle cx="328" cy="295" r="4" fill="white" fillOpacity="0.3"/>
    <circle cx="155" cy="408" r="2" fill="white" fillOpacity="0.25"/>
    <circle cx="235" cy="415" r="2" fill="white" fillOpacity="0.2"/>

    {/* Bottom rule */}
    <rect x="80" y="420" width="220" height="1.5" rx="1" fill="white" fillOpacity="0.07"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   SVG icons
───────────────────────────────────────────────────────────── */
const SvgIcon = ({ children, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">{children}</svg>
);

const MailIcon    = () => <SvgIcon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></SvgIcon>;
const LockIcon    = () => <SvgIcon><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></SvgIcon>;
const UserIcon    = () => <SvgIcon><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></SvgIcon>;
const SchoolIcon  = () => <SvgIcon><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></SvgIcon>;
const AlertIcon   = () => <SvgIcon size={14}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></SvgIcon>;
const EduIcon     = () => <SvgIcon size={18}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></SvgIcon>;
const BackArrow   = () => <SvgIcon size={14}><polyline points="15 18 9 12 15 6"/></SvgIcon>;
const CheckIcon   = () => <SvgIcon size={14}><polyline points="20 6 9 17 4 12"/></SvgIcon>;

const EyeIcon = ({ open }) => (
  <SvgIcon size={16}>
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    )}
  </SvgIcon>
);

/* ─────────────────────────────────────────────────────────────
   Styled components
───────────────────────────────────────────────────────────── */
const PageRoot = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: var(--font-display);
`;

/* ── Left panel ── */
const LeftPanel = styled.aside`
  width: 44%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 48px;
  background: linear-gradient(150deg, #1e1b4b 0%, #2e1065 55%, #1e1b4b 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -80px;
    left: -80px;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -60px;
    right: -60px;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(0,0,0,0.14) 0%, transparent 65%);
    pointer-events: none;
  }

  @media (max-width: 900px) { display: none; }
`;

const BrandRow = styled.div`
  position: absolute;
  top: 24px;
  left: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
`;

const LogoBadge = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.9);
`;

const LogoName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  letter-spacing: -0.02em;
`;

const IlluWrap = styled.div`
  width: 100%;
  max-width: 300px;
  margin-bottom: 36px;
  animation: ${gentlePulse} 5s ease-in-out infinite;
  position: relative;
  z-index: 1;
`;

const PanelHeadline = styled.h2`
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 700;
  color: #fff;
  text-align: center;
  line-height: 1.25;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
`;

const PanelTagline = styled.p`
  font-size: 13.5px;
  color: rgba(255,255,255,0.5);
  text-align: center;
  line-height: 1.65;
  max-width: 260px;
  position: relative;
  z-index: 1;
`;

const FeatureList = styled.ul`
  list-style: none;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 240px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.65);
`;

const FeatureIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(129,140,248,0.25);
  border: 1px solid rgba(129,140,248,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  flex-shrink: 0;
`;

/* ── Right panel ── */
const RightPanel = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: var(--bg-page);
  overflow-y: auto;
  @media (max-width: 480px) { padding: 32px 20px; }
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
`;

const stagger = (i) => css`
  animation: ${fadeSlideUp} 350ms ease-out both;
  animation-delay: ${60 + i * 60}ms;
`;
const AnimRow = styled.div`${({ $i }) => stagger($i)}`;

const BadgeWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 10px;
  border-radius: 20px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  margin-bottom: 20px;
`;

const BadgeText = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4338ca;
`;

const FormTitle = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: var(--color-neutral-900);
  letter-spacing: -0.025em;
  margin-bottom: 5px;
`;

const FormSub = styled.p`
  font-size: 14px;
  color: var(--color-neutral-500);
  line-height: 1.5;
  margin-bottom: 28px;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-neutral-500);
  text-decoration: none;
  margin-bottom: 24px;
  &:hover { color: var(--color-neutral-700); text-decoration: none; }
`;

const Field = styled.div`
  margin-bottom: 14px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-neutral-700);
  margin-bottom: 6px;
`;

const InputRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FieldInput = styled.input`
  width: 100%;
  height: 44px;
  padding-left: ${({ $left }) => ($left ? '42px' : '14px')};
  padding-right: ${({ $right }) => ($right ? '44px' : '14px')};
  background: var(--bg-card);
  border: 1.5px solid ${({ $err }) => $err ? 'var(--color-danger)' : 'var(--color-neutral-200)'};
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-neutral-800);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  outline: none;
  box-sizing: border-box;
  &::placeholder { color: var(--color-neutral-400); }
  &:focus {
    border-color: ${({ $err }) => $err ? 'var(--color-danger)' : '#6366f1'};
    box-shadow: 0 0 0 3px ${({ $err }) => $err ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.14)'};
  }
`;

const IconLeft = styled.span`
  position: absolute;
  left: 13px;
  display: flex;
  align-items: center;
  color: var(--color-neutral-400);
  pointer-events: none;
  z-index: 1;
`;

const ToggleEye = styled.button`
  position: absolute;
  right: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  color: var(--color-neutral-400);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-base), background var(--transition-base);
  z-index: 1;
  &:hover { color: var(--color-neutral-600); background: var(--color-neutral-100); }
  &:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }
`;

const ErrMsg = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 5px;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 46px;
  margin-top: 6px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 150ms ease, transform 100ms ease, box-shadow 150ms ease;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: 0 4px 20px rgba(79,70,229,0.45);
  }
  &:active:not(:disabled) { transform: scale(0.985); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }
`;

const Spin = styled.span`
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spinAnim} 0.65s linear infinite;
  flex-shrink: 0;
`;

const ErrBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 14px;
  padding: 12px 14px;
  background: var(--color-danger-50);
  border: 1px solid var(--color-danger-100);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-danger-600);
  line-height: 1.45;
`;

const SepLine = styled.div`
  height: 1px;
  background: var(--color-neutral-100);
  margin: 22px 0;
`;

const FootNote = styled.div`
  text-align: center;
  font-size: 13px;
  color: var(--color-neutral-500);
  a {
    color: #4f46e5;
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   AdminRegisterPage component
───────────────────────────────────────────────────────────── */
const AdminRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate  = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector((s) => s.user);

  const [showPw,  setShowPw]  = useState(false);
  const [loader,  setLoader]  = useState(false);
  const [errMsg,  setErrMsg]  = useState('');

  const [nameErr,   setNameErr]   = useState(false);
  const [schoolErr, setSchoolErr] = useState(false);
  const [emailErr,  setEmailErr]  = useState(false);
  const [pwErr,     setPwErr]     = useState(false);

  useEffect(() => {
    if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
      navigate('/Admin/dashboard');
    } else if (status === 'failed') {
      setErrMsg(response || 'Registration failed. Please try again.');
      setLoader(false);
    } else if (status === 'error') {
      setErrMsg('Network error. Please check your connection.');
      console.error(error);
      setLoader(false);
    }
  }, [status, currentUser, currentRole, navigate, error, response]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrMsg('');
    let bad = false;

    const name       = e.target.adminName.value.trim();
    const schoolName = e.target.schoolName.value.trim();
    const email      = e.target.email.value.trim();
    const password   = e.target.password.value;

    if (!name)       { setNameErr(true);   bad = true; }
    if (!schoolName) { setSchoolErr(true);  bad = true; }
    if (!email)      { setEmailErr(true);  bad = true; }
    if (!password)   { setPwErr(true);     bad = true; }
    if (bad) return;

    setLoader(true);
    dispatch(registerUser({ name, email, password, role: 'Admin', schoolName }, 'Admin'));
  };

  const clear = (field) => {
    setErrMsg('');
    if (field === 'adminName')  setNameErr(false);
    if (field === 'schoolName') setSchoolErr(false);
    if (field === 'email')      setEmailErr(false);
    if (field === 'password')   setPwErr(false);
  };

  return (
    <PageRoot>

      {/* ──────── LEFT PANEL ──────── */}
      <LeftPanel aria-hidden="true">
        <BrandRow>
          <LogoBadge><EduIcon /></LogoBadge>
          <LogoName>EduCore</LogoName>
        </BrandRow>

        <IlluWrap>
          <Illustration />
        </IlluWrap>

        <PanelHeadline>
          Build Your School<br />From Scratch
        </PanelHeadline>
        <PanelTagline>
          Register as an admin and get full control over your institution in minutes.
        </PanelTagline>

        <FeatureList>
          {[
            'Manage students and teachers',
            'Organise classes and subjects',
            'Broadcast notices instantly',
            'Track attendance and marks',
          ].map((f) => (
            <FeatureItem key={f}>
              <FeatureIcon><CheckIcon /></FeatureIcon>
              {f}
            </FeatureItem>
          ))}
        </FeatureList>
      </LeftPanel>

      {/* ──────── RIGHT FORM PANEL ──────── */}
      <RightPanel>
        <FormCard>

          {/* Back */}
          <AnimRow $i={0}>
            <BackBtn to="/Adminlogin">
              <BackArrow /> Back to sign in
            </BackBtn>
          </AnimRow>

          {/* Badge */}
          <AnimRow $i={1}>
            <BadgeWrap>
              <span aria-hidden="true" style={{ fontSize: 18 }}>🛡️</span>
              <BadgeText>Admin Registration</BadgeText>
            </BadgeWrap>
          </AnimRow>

          {/* Title */}
          <AnimRow $i={2}>
            <FormTitle>Create your school</FormTitle>
            <FormSub>Set up your admin account and your school will be ready in seconds.</FormSub>
          </AnimRow>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Admin name */}
            <AnimRow $i={3}>
              <Field>
                <FieldLabel htmlFor="adminName">Your full name</FieldLabel>
                <InputRow>
                  <IconLeft><UserIcon /></IconLeft>
                  <FieldInput
                    id="adminName"
                    name="adminName"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    autoFocus
                    $left
                    $err={nameErr}
                    onChange={() => clear('adminName')}
                  />
                </InputRow>
                {nameErr && <ErrMsg><AlertIcon /> Name is required</ErrMsg>}
              </Field>
            </AnimRow>

            {/* School name */}
            <AnimRow $i={4}>
              <Field>
                <FieldLabel htmlFor="schoolName">School name</FieldLabel>
                <InputRow>
                  <IconLeft><SchoolIcon /></IconLeft>
                  <FieldInput
                    id="schoolName"
                    name="schoolName"
                    placeholder="Westbrook Academy"
                    autoComplete="organization"
                    $left
                    $err={schoolErr}
                    onChange={() => clear('schoolName')}
                  />
                </InputRow>
                {schoolErr && <ErrMsg><AlertIcon /> School name is required</ErrMsg>}
              </Field>
            </AnimRow>

            {/* Email */}
            <AnimRow $i={5}>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <InputRow>
                  <IconLeft><MailIcon /></IconLeft>
                  <FieldInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@school.edu"
                    autoComplete="email"
                    $left
                    $err={emailErr}
                    onChange={() => clear('email')}
                  />
                </InputRow>
                {emailErr && <ErrMsg><AlertIcon /> Email is required</ErrMsg>}
              </Field>
            </AnimRow>

            {/* Password */}
            <AnimRow $i={6}>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputRow>
                  <IconLeft><LockIcon /></IconLeft>
                  <FieldInput
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Choose a strong password"
                    autoComplete="new-password"
                    $left
                    $right
                    $err={pwErr}
                    onChange={() => clear('password')}
                  />
                  <ToggleEye
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPw} />
                  </ToggleEye>
                </InputRow>
                {pwErr && <ErrMsg><AlertIcon /> Password is required</ErrMsg>}
              </Field>
            </AnimRow>

            {/* CTA */}
            <AnimRow $i={7}>
              <SubmitButton type="submit" disabled={loader} aria-busy={loader}>
                {loader
                  ? <><Spin aria-hidden="true" />Creating your school…</>
                  : 'Create admin account'}
              </SubmitButton>

              {errMsg && (
                <ErrBanner role="alert" aria-live="assertive">
                  <span style={{ marginTop: 1, flexShrink: 0 }}><AlertIcon /></span>
                  {errMsg}
                </ErrBanner>
              )}
            </AnimRow>

            {/* Login link */}
            <AnimRow $i={8}>
              <SepLine />
              <FootNote>
                Already have an account?{' '}
                <Link to="/Adminlogin">Sign in instead →</Link>
              </FootNote>
            </AnimRow>

          </form>
        </FormCard>
      </RightPanel>

    </PageRoot>
  );
};

export default AdminRegisterPage;
