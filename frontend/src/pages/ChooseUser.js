import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

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
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
`;
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ─── Layout ─── */
const Page = styled.div`
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important; } }
`;

/* Left panel — decorative */
const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(145deg, #0f172a 0%, #0c2340 40%, #0369a1 100%);
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

const SchoolIllustration = styled.div`
  position: relative; z-index: 2;
  animation: ${float} 6s ease-in-out infinite;
  margin-bottom: 40px;
`;

const PanelText = styled.div`
  position: relative; z-index: 2;
  text-align: center;
`;
const PanelTitle = styled.h2`
  font-size: 28px; font-weight: 700; color: #fff;
  letter-spacing: -0.02em; margin-bottom: 12px;
`;
const PanelSub = styled.p`
  font-size: 15px; color: #94a3b8; line-height: 1.7; max-width: 300px;
`;
const PanelStats = styled.div`
  display: flex; gap: 28px; margin-top: 36px; position: relative; z-index: 2;
`;
const PanelStat = styled.div`
  text-align: center;
  div:first-child { font-size: 24px; font-weight: 700; color: #0ea5e9; }
  div:last-child  { font-size: 12px; color: #64748b; margin-top: 2px; }
`;

/* Right panel — form area */
const RightPanel = styled.div`
  width: 560px; min-height: 100vh;
  background: #f8fafc;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 48px 48px;
  @media (max-width: 900px) { width: 100%; padding: 40px 24px; }
`;

const TopBar = styled.div`
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 48px;
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
  width: 100%; max-width: 440px;
  animation: ${fadeSlideUp} 0.5s ease both;
`;

const Heading = styled.h1`
  font-size: 28px; font-weight: 700; color: #0f172a;
  letter-spacing: -0.02em; margin-bottom: 8px;
`;
const SubHeading = styled.p`
  font-size: 14px; color: #64748b; margin-bottom: 36px; line-height: 1.6;
`;

/* Role cards */
const RoleGrid = styled.div`
  display: flex; flex-direction: column; gap: 14px;
  margin-bottom: 32px;
`;

const RoleCard = styled.button`
  display: flex; align-items: center; gap: 18px;
  padding: 20px 24px;
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 16px; cursor: pointer; text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  width: 100%;
  animation: ${fadeSlideUp} 0.5s ease both;
  animation-delay: ${p => p.$delay || '0s'};

  &:hover {
    border-color: #0ea5e9;
    box-shadow: 0 8px 24px rgba(14,165,233,0.12);
    transform: translateY(-2px);
  }
  &:active { transform: scale(0.99); }
`;

const RoleIconWrap = styled.div`
  width: 52px; height: 52px; border-radius: 14px;
  background: ${p => p.$bg};
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
  transition: transform 0.2s;
  ${RoleCard}:hover & { transform: scale(1.08); }
`;

const RoleInfo = styled.div`
  flex: 1;
`;
const RoleName = styled.div`
  font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 3px;
`;
const RoleDesc = styled.div`
  font-size: 13px; color: #64748b; line-height: 1.4;
`;
const RoleArrow = styled.div`
  color: #94a3b8; font-size: 18px;
  transition: transform 0.2s, color 0.2s;
  ${RoleCard}:hover & { transform: translateX(4px); color: #0ea5e9; }
`;

/* Guest strip */
const GuestStrip = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  text-align: center;
`;
const GuestText = styled.p`
  font-size: 14px; color: #64748b; margin-bottom: 12px;
`;
const GuestBtn = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 20px;
  border: 1.5px solid #0ea5e9; color: #0ea5e9;
  border-radius: 999px; font-size: 14px; font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  &:hover { background: #0ea5e9; color: #fff; }
`;

const FootNote = styled.p`
  text-align: center; font-size: 13px; color: #94a3b8; margin-top: 32px;
  a { color: #0ea5e9; text-decoration: none; font-weight: 500;
    &:hover { text-decoration: underline; } }
`;

/* ─── Illustration SVG ─── */
const SchoolSVG = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 260, height: 'auto', display: 'block' }}>
    <circle cx="160" cy="140" r="110" fill="white" fillOpacity="0.03"/>
    <circle cx="160" cy="140" r="80"  fill="white" fillOpacity="0.04"/>
    {/* Building */}
    <rect x="80" y="140" width="160" height="110" rx="4" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>
    {/* Roof */}
    <path d="M68 142L160 84L252 142Z" fill="white" fillOpacity="0.16" stroke="white" strokeOpacity="0.25" strokeWidth="1.5"/>
    {/* Flagpole */}
    <line x1="160" y1="84" x2="160" y2="60" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
    <path d="M160 60L178 68L160 76Z" fill="white" fillOpacity="0.6"/>
    {/* Windows */}
    {[[95,158],[132,158],[188,158],[225,158]].map(([x,y],i) => (
      <g key={i}>
        <rect x={x} y={y} width="22" height="18" rx="2" fill="white" fillOpacity="0.18"/>
        <line x1={x+11} y1={y} x2={x+11} y2={y+18} stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
        <line x1={x}    y1={y+9} x2={x+22} y2={y+9} stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      </g>
    ))}
    {/* Door */}
    <rect x="144" y="192" width="32" height="58" rx="3" fill="white" fillOpacity="0.22" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
    <circle cx="171" cy="222" r="2.5" fill="white" fillOpacity="0.5"/>
    <path d="M144 192 Q160 178 176 192" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" fill="none"/>
    {/* Ground */}
    <rect x="60" y="250" width="200" height="2" rx="1" fill="white" fillOpacity="0.12"/>
    {/* Trees */}
    <ellipse cx="58" cy="228" rx="18" ry="22" fill="white" fillOpacity="0.1"/>
    <rect x="55" y="248" width="6" height="12" rx="2" fill="white" fillOpacity="0.1"/>
    <ellipse cx="262" cy="228" rx="18" ry="22" fill="white" fillOpacity="0.1"/>
    <rect x="259" y="248" width="6" height="12" rx="2" fill="white" fillOpacity="0.1"/>
    {/* Stars */}
    {[[55,100,4],[300,90,3],[42,200,3],[285,210,4],[130,265,2],[200,270,2]].map(([x,y,r],i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="white" fillOpacity="0.4"/>
    ))}
  </svg>
);

/* ─── COMPONENT ─── */
const ChooseUser = ({ visitor }) => {
  const navigate = useNavigate();

  const roles = [
    {
      label: 'Admin',
      emoji: '🛡️',
      bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      desc: 'Manage school data, classes, teachers & students',
      path: visitor === 'guest' ? '/Adminlogin?guest=true' : '/Adminlogin',
    },
    {
      label: 'Teacher',
      emoji: '📚',
      bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      desc: 'Manage classes, take attendance & mark grades',
      path: visitor === 'guest' ? '/Teacherlogin?guest=true' : '/Teacherlogin',
    },
    {
      label: 'Student',
      emoji: '🎓',
      bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      desc: 'View subjects, attendance & exam results',
      path: visitor === 'guest' ? '/Studentlogin?guest=true' : '/Studentlogin',
    },
  ];

  return (
    <>
      <GlobalFont />
      <Page>
        {/* Left decorative panel */}
        <LeftPanel>
          <PanelOrb $size="350px" $color="rgba(14,165,233,0.12)" $top="-100px" $left="-100px" $dur="8s"/>
          <PanelOrb $size="280px" $color="rgba(16,185,129,0.1)"  $bottom="-80px" $right="-80px" $dur="10s" $delay="2s"/>
          <SchoolIllustration><SchoolSVG /></SchoolIllustration>
          <PanelText>
            <PanelTitle>School of Excellence</PanelTitle>
            <PanelSub>A world-class management system built for modern education.</PanelSub>
            <PanelStats>
              <PanelStat><div>500+</div><div>Students</div></PanelStat>
              <PanelStat><div>50+</div><div>Teachers</div></PanelStat>
              <PanelStat><div>15+</div><div>Years</div></PanelStat>
            </PanelStats>
          </PanelText>
        </LeftPanel>

        {/* Right panel */}
        <RightPanel>
          <TopBar>
            <LogoLink to="/">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
                <path d="M16 7L6 12v2h20v-2L16 7z" fill="white"/>
                <rect x="8"  y="15" width="3" height="8" fill="white" opacity="0.9"/>
                <rect x="14.5" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                <rect x="21" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                <rect x="6"  y="23" width="20" height="2" rx="1" fill="white"/>
              </svg>
              Excellence
            </LogoLink>
            <BackLink to="/">← Back to Home</BackLink>
          </TopBar>

          <FormCard>
            <Heading>Welcome Back 👋</Heading>
            <SubHeading>
              {visitor === 'guest'
                ? 'Continue as a guest to explore the system.'
                : 'Choose your role to sign in to your dashboard.'}
            </SubHeading>

            <RoleGrid>
              {roles.map((role, i) => (
                <RoleCard
                  key={role.label}
                  $delay={`${i * 0.08}s`}
                  onClick={() => navigate(role.path)}
                >
                  <RoleIconWrap $bg={role.bg}>{role.emoji}</RoleIconWrap>
                  <RoleInfo>
                    <RoleName>{role.label}</RoleName>
                    <RoleDesc>{role.desc}</RoleDesc>
                  </RoleInfo>
                  <RoleArrow>→</RoleArrow>
                </RoleCard>
              ))}
            </RoleGrid>

            {visitor !== 'guest' && (
              <GuestStrip>
                <GuestText>Don't have an account?</GuestText>
                <GuestBtn to="/chooseasguest">Continue as Guest →</GuestBtn>
              </GuestStrip>
            )}

            <FootNote>
              New school? <a href="/AdminRegister">Register your institution →</a>
            </FootNote>
          </FormCard>
        </RightPanel>
      </Page>
    </>
  );
};

export default ChooseUser;
