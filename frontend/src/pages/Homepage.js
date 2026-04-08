import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

/* ─── Global Font ─── */
const GlobalFont = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
`;

/* ─── Animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;
const slowPan = keyframes`
  0% { transform: scale(1.05) translate(0, 0); }
  50% { transform: scale(1.08) translate(-1%, -1%); }
  100% { transform: scale(1.05) translate(0, 0); }
`;
const countUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

/* ─── Wrapper ─── */
const PageWrapper = styled.div`
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
  overflow-x: hidden;
  @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important; transition: none !important; } }
`;

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
const Nav = styled.nav`
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid ${p => p.$scrolled ? 'transparent' : '#e2e8f0'};
  box-shadow: ${p => p.$scrolled ? '0 4px 24px rgba(15,23,42,0.08)' : 'none'};
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
`;
const NavInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
const NavLogo = styled(Link)`
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
  font-size: 18px; font-weight: 700; color: #0f172a;
  letter-spacing: -0.02em;
`;
const NavLinks = styled.div`
  display: flex; align-items: center; gap: 32px;
  @media (max-width: 768px) { display: none; }
`;
const NavLink = styled(Link)`
  font-size: 15px; font-weight: 500; color: #475569;
  text-decoration: none;
  position: relative; padding-bottom: 4px;
  transition: color 0.2s;
  &:hover { color: #0ea5e9; }
  &::after {
    content: '';
    position: absolute; bottom: -2px; left: 0; right: 100%;
    height: 2px; background: #0ea5e9;
    transition: right 0.25s ease;
  }
  &:hover::after { right: 0; }
`;
const NavActions = styled.div`
  display: flex; align-items: center; gap: 12px;
`;
const LoginBtn = styled(Link)`
  display: inline-flex; align-items: center; justify-content: center;
  height: 36px; padding: 0 20px;
  background: #0ea5e9; color: #fff;
  border-radius: 999px; font-size: 14px; font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
  &:hover { background: #0284c7; transform: scale(1.03); }
`;
const Hamburger = styled.button`
  display: none;
  background: none; border: none; cursor: pointer;
  flex-direction: column; gap: 5px; padding: 4px;
  @media (max-width: 768px) { display: flex; }
  span {
    display: block; width: 22px; height: 2px;
    background: #0f172a; border-radius: 2px;
    transition: all 0.3s;
  }
`;
const MobileMenu = styled.div`
  position: fixed; top: 72px; left: 0; right: 0;
  background: #fff; border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px 24px;
  display: flex; flex-direction: column; gap: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  animation: ${fadeIn} 0.2s ease;
  z-index: 999;
  @media (min-width: 769px) { display: none; }
`;
const MobileLink = styled(Link)`
  display: block; padding: 12px 0;
  font-size: 16px; font-weight: 500; color: #475569;
  text-decoration: none; border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  &:hover { color: #0ea5e9; }
`;

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
const HeroSection = styled.section`
  position: relative; overflow: hidden;
  height: 600px;
  display: flex; align-items: center;
  margin-top: 72px;
  @media (max-width: 640px) { height: 400px; }
`;
const HeroBg = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #0369a1 60%, #0ea5e9 100%);
  animation: ${slowPan} 20s ease-in-out infinite;
  &::after {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 32px 32px;
  }
`;
const HeroContent = styled.div`
  position: relative; z-index: 2;
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  width: 100%;
`;
const HeroEyebrow = styled.div`
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px; padding: 6px 16px;
  font-size: 13px; font-weight: 500; color: #bae6fd;
  margin-bottom: 24px;
  animation: ${fadeUp} 0.6s ease both;
`;
const HeroHeadline = styled.h1`
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 700; color: #fff;
  line-height: 1.1; letter-spacing: -0.02em;
  max-width: 680px; margin-bottom: 20px;
  animation: ${fadeUp} 0.6s 0.1s ease both;
  @media (max-width: 640px) { font-size: 32px; }
`;
const HeroSub = styled.p`
  font-size: 18px; color: #94a3b8;
  max-width: 500px; line-height: 1.65;
  margin-bottom: 36px;
  animation: ${fadeUp} 0.6s 0.2s ease both;
  @media (max-width: 640px) { font-size: 15px; }
`;
const HeroButtons = styled.div`
  display: flex; gap: 14px; flex-wrap: wrap;
  animation: ${fadeUp} 0.6s 0.3s ease both;
`;
const HeroCTA = styled(Link)`
  display: inline-flex; align-items: center; gap: 8px;
  height: 48px; padding: 0 28px;
  background: #0ea5e9; color: #fff;
  border-radius: 999px; font-size: 15px; font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
  &:hover { background: #0284c7; transform: translateY(-2px); }
`;
const HeroCTAOutline = styled(Link)`
  display: inline-flex; align-items: center; gap: 8px;
  height: 48px; padding: 0 28px;
  background: transparent; color: #fff;
  border: 1.5px solid rgba(255,255,255,0.4);
  border-radius: 999px; font-size: 15px; font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  &:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.7); transform: translateY(-2px); }
`;
const FloatingBadges = styled.div`
  position: absolute; right: 80px; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 12px;
  @media (max-width: 900px) { display: none; }
`;
const FloatingBadge = styled.div`
  background: #fff; border-radius: 16px;
  padding: 14px 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex; align-items: center; gap: 12px;
  animation: ${float} ${p => p.$delay || '3s'} ease-in-out infinite;
  animation-delay: ${p => p.$animDelay || '0s'};
`;
const BadgeIcon = styled.div`
  width: 36px; height: 36px; border-radius: 10px;
  background: ${p => p.$bg || '#eff6ff'};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
`;
const BadgeText = styled.div`
  div:first-child { font-size: 16px; font-weight: 700; color: #0f172a; }
  div:last-child { font-size: 12px; color: #64748b; }
`;
const HeroDots = styled.div`
  position: absolute; bottom: 28px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 2;
`;
const Dot = styled.button`
  width: ${p => p.$active ? '24px' : '8px'};
  height: 8px; border-radius: 999px;
  background: ${p => p.$active ? '#0ea5e9' : 'rgba(255,255,255,0.4)'};
  border: none; cursor: pointer; padding: 0;
  transition: all 0.3s;
`;

/* ══════════════════════════════════════════
   STATS BANNER
══════════════════════════════════════════ */
const StatsSection = styled.section`
  background: #fff;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 40px 24px;
`;
const StatsGrid = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr);
  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); gap: 24px; }
`;
const StatItem = styled.div`
  text-align: center; padding: 0 20px;
  border-right: 1px solid #e2e8f0;
  &:last-child { border-right: none; }
  @media (max-width: 640px) { 
    border-right: none; 
    &:nth-child(1), &:nth-child(3) { border-right: 1px solid #e2e8f0; }
  }
  animation: ${p => p.$visible ? countUp : 'none'} 0.6s ease both;
  animation-delay: ${p => p.$delay || '0s'};
`;
const StatNumber = styled.div`
  font-size: 40px; font-weight: 700; color: #0ea5e9;
  line-height: 1; margin-bottom: 6px; letter-spacing: -0.02em;
`;
const StatLabel = styled.div`
  font-size: 14px; color: #64748b; font-weight: 500;
`;

/* ══════════════════════════════════════════
   ABOUT SECTION
══════════════════════════════════════════ */
const AboutSection = styled.section`
  padding: 96px 24px;
  background: #f8fafc;
`;
const AboutInner = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 48px; }
`;
const AboutLeft = styled.div``;
const Eyebrow = styled.div`
  font-size: 12px; font-weight: 600; color: #0ea5e9;
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 14px;
`;
const SectionHeading = styled.h2`
  font-size: clamp(26px, 3vw, 36px); font-weight: 700;
  color: #0f172a; line-height: 1.2; letter-spacing: -0.02em;
  margin-bottom: 20px;
`;
const BodyText = styled.p`
  font-size: 15px; color: #64748b; line-height: 1.8; margin-bottom: 28px;
`;
const FeatureList = styled.div`
  display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px;
`;
const FeatureItem = styled.div`
  display: flex; align-items: flex-start; gap: 12px;
`;
const CheckIcon = styled.div`
  width: 22px; height: 22px; border-radius: 6px;
  background: #d1fae5; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  svg { color: #10b981; }
`;
const FeatureText = styled.span`
  font-size: 14px; font-weight: 500; color: #475569; line-height: 1.5;
`;
const GhostBtn = styled(Link)`
  display: inline-flex; align-items: center; gap: 8px;
  height: 42px; padding: 0 24px;
  border: 1.5px solid #0ea5e9; color: #0ea5e9;
  border-radius: 999px; font-size: 14px; font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  &:hover { background: #0ea5e9; color: #fff; }
`;
const AboutRight = styled.div`
  position: relative;
`;
const AboutImage = styled.div`
  width: 100%; aspect-ratio: 4/3;
  border-radius: 24px; overflow: hidden;
  background: linear-gradient(135deg, #0369a1, #0ea5e9);
  display: flex; align-items: center; justify-content: center;
`;
const AccentCard = styled.div`
  position: absolute; bottom: -20px; left: -20px;
  background: #0ea5e9; color: #fff;
  border-radius: 16px; padding: 18px 24px;
  box-shadow: 0 12px 32px rgba(14,165,233,0.35);
  @media (max-width: 640px) { left: 0; bottom: -10px; }
`;
const AccentCardTitle = styled.div`
  font-size: 22px; font-weight: 700; line-height: 1;
`;
const AccentCardSub = styled.div`
  font-size: 13px; opacity: 0.85; margin-top: 4px;
`;

/* ══════════════════════════════════════════
   COURSES SECTION
══════════════════════════════════════════ */
const CoursesSection = styled.section`
  padding: 96px 24px;
  background: #fff;
`;
const SectionHeader = styled.div`
  text-align: center; max-width: 540px; margin: 0 auto 56px;
`;
const SectionSub = styled.p`
  font-size: 15px; color: #64748b; margin-top: 12px; line-height: 1.7;
`;
const CoursesGrid = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const CourseCard = styled.div`
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 20px; padding: 28px 24px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: default;
  &:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.08); }
`;
const CourseIconBox = styled.div`
  width: 48px; height: 48px; border-radius: 14px;
  background: ${p => p.$bg || '#eff6ff'};
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 18px;
`;
const CourseName = styled.h3`
  font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;
`;
const CourseDesc = styled.p`
  font-size: 13px; color: #64748b; line-height: 1.65;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  margin-bottom: 18px;
`;
const CourseLink = styled(Link)`
  font-size: 13px; font-weight: 600; color: #0ea5e9;
  text-decoration: none;
  display: inline-flex; align-items: center; gap: 4px;
  transition: gap 0.2s;
  &:hover { gap: 8px; }
`;

/* ══════════════════════════════════════════
   TEACHERS SECTION
══════════════════════════════════════════ */
const TeachersSection = styled.section`
  padding: 96px 24px; background: #f8fafc;
`;
const TeachersGrid = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const TeacherCard = styled.div`
  background: #fff; border-radius: 24px;
  overflow: hidden; border: 1px solid #e2e8f0;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.08); }
`;
const TeacherImageBox = styled.div`
  aspect-ratio: 1; background: ${p => p.$bg || 'linear-gradient(135deg, #dbeafe, #bfdbfe)'};
  display: flex; align-items: center; justify-content: center;
  font-size: 48px;
`;
const TeacherInfo = styled.div`
  padding: 18px 20px;
`;
const TeacherName = styled.h3`
  font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;
`;
const SubjectPill = styled.span`
  display: inline-block; padding: 4px 12px;
  background: #d1fae5; color: #065f46;
  border-radius: 999px; font-size: 12px; font-weight: 600;
  margin-bottom: 14px;
`;
const SocialRow = styled.div`
  display: flex; gap: 8px;
`;
const SocialBtn = styled.a`
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; text-decoration: none; font-size: 14px;
  transition: background 0.2s, border-color 0.2s;
  &:hover { background: #e0f2fe; border-color: #0ea5e9; }
`;

/* ══════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════ */
const TestimonialsSection = styled.section`
  padding: 96px 24px; background: #f8fafc;
`;
const TestimonialWrapper = styled.div`
  max-width: 680px; margin: 0 auto; position: relative;
`;
const TestimonialCard = styled.div`
  background: #fff; border-radius: 24px;
  padding: 48px 48px 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  text-align: center; position: relative;
  animation: ${slideIn} 0.4s ease both;
  key: ${p => p.$key};
  @media (max-width: 640px) { padding: 32px 24px; }
`;
const QuoteMark = styled.div`
  font-size: 80px; color: #0ea5e9; line-height: 0.8;
  font-family: Georgia, serif; margin-bottom: 24px;
  opacity: 0.6;
`;
const QuoteText = styled.p`
  font-size: 17px; font-style: italic; color: #475569;
  line-height: 1.9; margin-bottom: 32px;
`;
const TestimonialAvatar = styled.div`
  width: 52px; height: 52px; border-radius: 50%;
  background: ${p => p.$bg || 'linear-gradient(135deg, #0ea5e9, #10b981)'};
  margin: 0 auto 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
`;
const TestimonialName = styled.div`
  font-size: 15px; font-weight: 600; color: #0f172a;
`;
const TestimonialRole = styled.div`
  font-size: 13px; color: #64748b; margin-top: 2px;
`;
const TestiNav = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin-top: 32px;
`;
const ArrowBtn = styled.button`
  width: 40px; height: 40px; border-radius: 50%;
  border: 1.5px solid #e2e8f0; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 16px;
  transition: border-color 0.2s, background 0.2s;
  &:hover { border-color: #0ea5e9; background: #e0f2fe; }
`;
const TestiDots = styled.div`
  display: flex; gap: 6px;
`;
const TestiDot = styled.button`
  width: ${p => p.$active ? '20px' : '6px'};
  height: 6px; border-radius: 999px;
  background: ${p => p.$active ? '#0ea5e9' : '#cbd5e1'};
  border: none; cursor: pointer; padding: 0;
  transition: all 0.3s;
`;

/* ══════════════════════════════════════════
   WHY CHOOSE US
══════════════════════════════════════════ */
const WhySection = styled.section`
  padding: 96px 24px;
  background: #0f172a;
`;
const WhyGrid = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px; overflow: hidden;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const WhyItem = styled.div`
  padding: 36px 32px;
  border-right: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  &:nth-child(3n) { border-right: none; }
  &:nth-last-child(-n+3) { border-bottom: none; }
  @media (max-width: 900px) {
    &:nth-child(3n) { border-right: 1px solid rgba(255,255,255,0.06); }
    &:nth-child(2n) { border-right: none; }
    &:nth-last-child(-n+2) { border-bottom: none; }
  }
  @media (max-width: 640px) {
    border-right: none !important;
    &:last-child { border-bottom: none; }
    &:nth-last-child(n) { border-bottom: 1px solid rgba(255,255,255,0.06); }
  }
`;
const WhyIconCircle = styled.div`
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(16, 185, 129, 0.18);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
`;
const WhyTitle = styled.h4`
  font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px;
`;
const WhyDesc = styled.p`
  font-size: 13px; color: #94a3b8; line-height: 1.65;
`;
const WhySectionHeader = styled.div`
  text-align: center; margin-bottom: 48px;
`;

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
const FooterSection = styled.footer`
  background: #0f172a;
  border-top: 1px solid rgba(255,255,255,0.06);
`;
const FooterMain = styled.div`
  max-width: 1200px; margin: 0 auto;
  padding: 64px 24px 48px;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 48px;
  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const FooterLogo = styled(Link)`
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; margin-bottom: 14px;
  font-size: 17px; font-weight: 700; color: #fff;
`;
const FooterTagline = styled.p`
  font-size: 13px; color: #64748b; line-height: 1.7; max-width: 240px;
  margin-bottom: 24px;
`;
const SocialRow2 = styled.div`
  display: flex; gap: 8px;
`;
const SocialPill = styled.a`
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; text-decoration: none; font-size: 16px;
  transition: background 0.2s;
  &:hover { background: #0ea5e9; }
`;
const FooterColTitle = styled.h4`
  font-size: 13px; font-weight: 600; color: #fff;
  text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 18px;
`;
const FooterLink = styled(Link)`
  display: block; font-size: 14px; color: #94a3b8;
  text-decoration: none; margin-bottom: 10px;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;
const FooterALink = styled.a`
  display: block; font-size: 14px; color: #94a3b8;
  text-decoration: none; margin-bottom: 10px;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;
const ContactRow = styled.div`
  display: flex; align-items: flex-start; gap: 10px;
  margin-bottom: 12px;
`;
const ContactIcon = styled.span`font-size: 16px; margin-top: 1px; flex-shrink: 0;`;
const ContactText = styled.span`font-size: 13px; color: #94a3b8; line-height: 1.5;`;
const FooterBottom = styled.div`
  border-top: 1px solid rgba(255,255,255,0.06);
  background: #020617;
  padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between;
  @media (max-width: 640px) { flex-direction: column; gap: 8px; text-align: center; }
`;
const FooterCopy = styled.span`font-size: 13px; color: #475569;`;
const BackToTop = styled.a`
  font-size: 13px; font-weight: 500; color: #0ea5e9;
  text-decoration: none; cursor: pointer;
  &:hover { color: #38bdf8; }
`;

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
const HERO_SLIDES = [
  { headline: "Shaping Tomorrow's Leaders Today", sub: "A world-class institution committed to academic excellence, character development, and lifelong learning." },
  { headline: "Excellence in Education Since 2008", sub: "Join thousands of students who have found their potential within our vibrant learning community." },
  { headline: "Learn. Grow. Lead the Future.", sub: "Discover inspiring teachers, cutting-edge curriculum, and a supportive environment built for success." },
];

const COURSES = [
  { icon: '📚', bg: '#ede9fe', color: '#7c3aed', name: 'English Language', desc: 'Master communication through literature, grammar, and expressive writing across all forms.' },
  { icon: '📐', bg: '#dbeafe', color: '#1d4ed8', name: 'Mathematics', desc: 'Build analytical thinking through algebra, geometry, calculus, and real-world problem solving.' },
  { icon: '⚗️', bg: '#fef3c7', color: '#d97706', name: 'Chemistry', desc: 'Explore matter, reactions, and the molecular world through hands-on laboratory experiments.' },
  { icon: '⚡', bg: '#d1fae5', color: '#059669', name: 'Physics', desc: 'Understand the fundamental laws of the universe from mechanics to quantum phenomena.' },
];

const TEACHERS = [
  { emoji: '👩‍🏫', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', name: 'Sarah Johnson', subject: 'English' },
  { emoji: '👨‍🔬', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', name: 'Dr. Ali Hassan', subject: 'Physics' },
  { emoji: '👩‍💼', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', name: 'Ms. Ayesha Khan', subject: 'Math' },
  { emoji: '👨‍🏫', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', name: 'Mr. James Wright', subject: 'Chemistry' },
];

const TESTIMONIALS = [
  { text: "The teachers here genuinely care about every student's success. The personalized attention and rigorous curriculum prepared me for university in ways I never expected.", name: 'Fatima Malik', role: 'Alumni — Class of 2023', emoji: '🎓', bg: 'linear-gradient(135deg, #0ea5e9, #10b981)' },
  { text: "School of Excellence gave me the confidence to pursue my dreams. The supportive community and exceptional faculty made my years here truly memorable.", name: 'Ahmed Raza', role: 'Alumni — Class of 2022', emoji: '⭐', bg: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' },
  { text: "The blend of academics, extracurriculars, and mentorship is unmatched. I gained skills here that no textbook alone could have taught me.", name: 'Zainab Siddiqui', role: 'Alumni — Class of 2024', emoji: '🌟', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
];

const WHY_ITEMS = [
  { icon: '✓', title: 'Expert Faculty', desc: 'Highly qualified teachers with decades of combined experience in their disciplines.' },
  { icon: '✓', title: 'Modern Curriculum', desc: 'Continuously updated syllabus aligned with national and international standards.' },
  { icon: '✓', title: 'Safe Environment', desc: 'A secure, inclusive campus where every student feels respected and valued.' },
  { icon: '✓', title: 'Holistic Development', desc: 'Sports, arts, and co-curricular programs to nurture well-rounded individuals.' },
  { icon: '✓', title: 'Digital Learning', desc: 'State-of-the-art labs and e-learning tools for 21st-century education.' },
  { icon: '✓', title: 'Proven Results', desc: 'Consistently outstanding board exam results and university admission rates.' },
];

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
const STATS = [
  { value: 500, label: 'Students Enrolled', suffix: '+' },
  { value: 50, label: 'Expert Teachers', suffix: '+' },
  { value: 20, label: 'Subjects Offered', suffix: '+' },
  { value: 15, label: 'Years of Excellence', suffix: '+' },
];
const Homepage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [testiSlide, setTestiSlide] = useState(0);
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);



  /* Navbar scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Hero auto-advance */
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* Stats counter */
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsVisible(true);
        STATS.forEach((stat, i) => {
          const duration = 1500;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setStatCounts(prev => {
              const next = [...prev];
              next[i] = Math.round(eased * stat.value);
              return next;
            });
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const prevTesti = () => setTestiSlide(s => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const nextTesti = () => setTestiSlide(s => (s + 1) % TESTIMONIALS.length);

  return (
    <>
      <GlobalFont />
      <PageWrapper>
        {/* ─── NAVBAR ─── */}
        <Nav $scrolled={scrolled}>
          <NavInner>
            <NavLogo to="/">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
                <path d="M16 7L6 12v2h20v-2L16 7z" fill="white"/>
                <rect x="8" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                <rect x="14.5" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                <rect x="21" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                <rect x="6" y="23" width="20" height="2" rx="1" fill="white"/>
              </svg>
              School of Excellence
            </NavLogo>
            <NavLinks>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/teachers">Teachers</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </NavLinks>
            <NavActions>
              <LoginBtn to="/choose">Login</LoginBtn>
              <Hamburger onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                <span/><span/><span/>
              </Hamburger>
            </NavActions>
          </NavInner>
        </Nav>
        {mobileOpen && (
          <MobileMenu>
            <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
            <MobileLink to="/courses" onClick={() => setMobileOpen(false)}>Courses</MobileLink>
            <MobileLink to="/teachers" onClick={() => setMobileOpen(false)}>Teachers</MobileLink>
            <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
            <MobileLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
            <MobileLink to="/choose" onClick={() => setMobileOpen(false)}>Login →</MobileLink>
          </MobileMenu>
        )}

        {/* ─── HERO ─── */}
        <HeroSection>
          <HeroBg />
          <HeroContent>
            <HeroEyebrow>
              <span>🎓</span> Welcome to School of Excellence
            </HeroEyebrow>
            <HeroHeadline key={heroSlide}>{HERO_SLIDES[heroSlide].headline}</HeroHeadline>
            <HeroSub key={`sub-${heroSlide}`}>{HERO_SLIDES[heroSlide].sub}</HeroSub>
            <HeroButtons>
              <HeroCTA to="/choose">Get Started →</HeroCTA>
              <HeroCTAOutline to="/about">Learn More</HeroCTAOutline>
            </HeroButtons>
          </HeroContent>
          <FloatingBadges>
            <FloatingBadge $animDelay="0s">
              <BadgeIcon $bg="#eff6ff">👩‍🎓</BadgeIcon>
              <BadgeText><div>500+</div><div>Students</div></BadgeText>
            </FloatingBadge>
            <FloatingBadge $animDelay="0.8s">
              <BadgeIcon $bg="#f0fdf4">👨‍🏫</BadgeIcon>
              <BadgeText><div>50+</div><div>Teachers</div></BadgeText>
            </FloatingBadge>
            <FloatingBadge $animDelay="1.5s">
              <BadgeIcon $bg="#fefce8">📘</BadgeIcon>
              <BadgeText><div>20+</div><div>Subjects</div></BadgeText>
            </FloatingBadge>
          </FloatingBadges>
          <HeroDots>
            {HERO_SLIDES.map((_, i) => (
              <Dot key={i} $active={i === heroSlide} onClick={() => setHeroSlide(i)} aria-label={`Slide ${i+1}`}/>
            ))}
          </HeroDots>
        </HeroSection>

        {/* ─── STATS ─── */}
        <StatsSection ref={statsRef}>
          <StatsGrid>
            {STATS.map((s, i) => (
              <StatItem key={i} $visible={statsVisible} $delay={`${i * 0.1}s`}>
                <StatNumber>{statCounts[i]}{s.suffix}</StatNumber>
                <StatLabel>{s.label}</StatLabel>
              </StatItem>
            ))}
          </StatsGrid>
        </StatsSection>

        {/* ─── ABOUT ─── */}
        <AboutSection>
          <AboutInner>
            <AboutLeft>
              <Eyebrow>About Us</Eyebrow>
              <SectionHeading>Quality Education for Every Student</SectionHeading>
              <BodyText>
                Founded in 2008, School of Excellence has been a beacon of academic achievement in the region. 
                We combine traditional values with modern pedagogy to create graduates who excel in every arena of life.
              </BodyText>
              <FeatureList>
                {['Nationally accredited curriculum with international benchmarks', 'Experienced faculty averaging 12+ years of teaching excellence', 'State-of-the-art labs, library, and digital learning infrastructure'].map((f, i) => (
                  <FeatureItem key={i}>
                    <CheckIcon>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </CheckIcon>
                    <FeatureText>{f}</FeatureText>
                  </FeatureItem>
                ))}
              </FeatureList>
              <GhostBtn to="/about">Read More →</GhostBtn>
            </AboutLeft>
            <AboutRight>
              <AboutImage>
                <svg viewBox="0 0 320 240" fill="none" width="100%" style={{maxWidth: 320}}>
                  <rect x="80" y="120" width="160" height="100" rx="4" fill="white" fillOpacity="0.15"/>
                  <path d="M64 122L160 60L256 122Z" fill="white" fillOpacity="0.18"/>
                  <rect x="100" y="140" width="22" height="18" rx="2" fill="white" fillOpacity="0.25"/>
                  <rect x="140" y="140" width="22" height="18" rx="2" fill="white" fillOpacity="0.25"/>
                  <rect x="198" y="140" width="22" height="18" rx="2" fill="white" fillOpacity="0.25"/>
                  <rect x="142" y="175" width="36" height="45" rx="3" fill="white" fillOpacity="0.3"/>
                  <circle cx="160" cy="60" r="8" fill="white" fillOpacity="0.4"/>
                  <circle cx="68" cy="180" r="16" fill="white" fillOpacity="0.1"/>
                  <circle cx="255" cy="185" r="16" fill="white" fillOpacity="0.1"/>
                </svg>
              </AboutImage>
              <AccentCard>
                <AccentCardTitle>15+ Years</AccentCardTitle>
                <AccentCardSub>of Excellence in Education</AccentCardSub>
              </AccentCard>
            </AboutRight>
          </AboutInner>
        </AboutSection>

        {/* ─── COURSES ─── */}
        <CoursesSection>
          <SectionHeader>
            <Eyebrow style={{textAlign:'center'}}>Our Curriculum</Eyebrow>
            <SectionHeading>Our Featured Courses</SectionHeading>
            <SectionSub>Explore our comprehensive range of subjects designed to challenge and inspire every learner.</SectionSub>
          </SectionHeader>
          <CoursesGrid>
            {COURSES.map((c, i) => (
              <CourseCard key={i}>
                <CourseIconBox $bg={c.bg}>{c.icon}</CourseIconBox>
                <CourseName>{c.name}</CourseName>
                <CourseDesc>{c.desc}</CourseDesc>
                <CourseLink to="/courses">Learn More →</CourseLink>
              </CourseCard>
            ))}
          </CoursesGrid>
        </CoursesSection>

        {/* ─── TEACHERS ─── */}
        <TeachersSection>
          <SectionHeader>
            <Eyebrow style={{textAlign:'center'}}>Faculty</Eyebrow>
            <SectionHeading>Meet Our Expert Teachers</SectionHeading>
            <SectionSub>Our dedicated educators bring passion, expertise, and care to every classroom.</SectionSub>
          </SectionHeader>
          <TeachersGrid>
            {TEACHERS.map((t, i) => (
              <TeacherCard key={i}>
                <TeacherImageBox $bg={t.bg}>{t.emoji}</TeacherImageBox>
                <TeacherInfo>
                  <TeacherName>{t.name}</TeacherName>
                  <SubjectPill>{t.subject}</SubjectPill>
                  <SocialRow>
                    <SocialBtn href="#" title="LinkedIn">in</SocialBtn>
                    <SocialBtn href="#" title="Email">✉</SocialBtn>
                    <SocialBtn href="#" title="Twitter">𝕏</SocialBtn>
                  </SocialRow>
                </TeacherInfo>
              </TeacherCard>
            ))}
          </TeachersGrid>
        </TeachersSection>

        {/* ─── TESTIMONIALS ─── */}
        <TestimonialsSection>
          <SectionHeader>
            <Eyebrow style={{textAlign:'center'}}>Testimonials</Eyebrow>
            <SectionHeading>What Our Alumni Say</SectionHeading>
          </SectionHeader>
          <TestimonialWrapper>
            <TestimonialCard key={testiSlide}>
              <QuoteMark>"</QuoteMark>
              <QuoteText>{TESTIMONIALS[testiSlide].text}</QuoteText>
              <TestimonialAvatar $bg={TESTIMONIALS[testiSlide].bg}>
                {TESTIMONIALS[testiSlide].emoji}
              </TestimonialAvatar>
              <TestimonialName>{TESTIMONIALS[testiSlide].name}</TestimonialName>
              <TestimonialRole>{TESTIMONIALS[testiSlide].role}</TestimonialRole>
            </TestimonialCard>
            <TestiNav>
              <ArrowBtn onClick={prevTesti} aria-label="Previous">←</ArrowBtn>
              <TestiDots>
                {TESTIMONIALS.map((_, i) => (
                  <TestiDot key={i} $active={i === testiSlide} onClick={() => setTestiSlide(i)}/>
                ))}
              </TestiDots>
              <ArrowBtn onClick={nextTesti} aria-label="Next">→</ArrowBtn>
            </TestiNav>
          </TestimonialWrapper>
        </TestimonialsSection>

        {/* ─── WHY CHOOSE US ─── */}
        <WhySection>
          <WhySectionHeader>
            <Eyebrow style={{color:'#10b981', textAlign:'center'}}>Why Us</Eyebrow>
            <SectionHeading style={{color:'#fff', textAlign:'center'}}>Why Choose School of Excellence?</SectionHeading>
          </WhySectionHeader>
          <WhyGrid>
            {WHY_ITEMS.map((item, i) => (
              <WhyItem key={i}>
                <WhyIconCircle>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9l4.5 4.5 7.5-9" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </WhyIconCircle>
                <WhyTitle>{item.title}</WhyTitle>
                <WhyDesc>{item.desc}</WhyDesc>
              </WhyItem>
            ))}
          </WhyGrid>
        </WhySection>

        {/* ─── FOOTER ─── */}
        <FooterSection>
          <FooterMain>
            <div>
              <FooterLogo to="/">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
                  <path d="M16 7L6 12v2h20v-2L16 7z" fill="white"/>
                  <rect x="8" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                  <rect x="14.5" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                  <rect x="21" y="15" width="3" height="8" fill="white" opacity="0.9"/>
                  <rect x="6" y="23" width="20" height="2" rx="1" fill="white"/>
                </svg>
                School of Excellence
              </FooterLogo>
              <FooterTagline>Shaping tomorrow's leaders through quality education, strong values, and a commitment to lifelong learning.</FooterTagline>
              <SocialRow2>
                <SocialPill href="#" title="Facebook">📘</SocialPill>
                <SocialPill href="#" title="Twitter">🐦</SocialPill>
                <SocialPill href="#" title="Instagram">📸</SocialPill>
                <SocialPill href="#" title="YouTube">▶️</SocialPill>
              </SocialRow2>
            </div>
            <div>
              <FooterColTitle>Quick Links</FooterColTitle>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/courses">Courses</FooterLink>
              <FooterLink to="/teachers">Teachers</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </div>
            <div>
              <FooterColTitle>Courses</FooterColTitle>
              <FooterALink href="#">English Language</FooterALink>
              <FooterALink href="#">Mathematics</FooterALink>
              <FooterALink href="#">Chemistry</FooterALink>
              <FooterALink href="#">Physics</FooterALink>
              <FooterALink href="#">Biology</FooterALink>
            </div>
            <div>
              <FooterColTitle>Contact</FooterColTitle>
              <ContactRow>
                <ContactIcon>📍</ContactIcon>
                <ContactText>123 Education Avenue, Lahore, Punjab, Pakistan</ContactText>
              </ContactRow>
              <ContactRow>
                <ContactIcon>✉️</ContactIcon>
                <ContactText>info@schoolofexcellence.edu.pk</ContactText>
              </ContactRow>
              <ContactRow>
                <ContactIcon>📞</ContactIcon>
                <ContactText>+92 42 1234 5678</ContactText>
              </ContactRow>
            </div>
          </FooterMain>
          <FooterBottom>
            <FooterCopy>© {new Date().getFullYear()} School of Excellence. All rights reserved.</FooterCopy>
            <BackToTop href="#" onClick={e => { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); }}>
              ↑ Back to Top
            </BackToTop>
          </FooterBottom>
        </FooterSection>
      </PageWrapper>
    </>
  );
};

export default Homepage;
