import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, CircularProgress, Backdrop } from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { guestLoginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import Navbar from './homepage/components/Navbar';
import Footer from './homepage/components/Footer';
import '../pages/homepage/homepage.css';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, currentRole } = useSelector((state) => state.user);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const navigateHandler = (user) => {
    if (visitor === 'guest') {
      dispatch(guestLoginUser(user));
      setLoader(true);
    } else {
      if (user === 'Admin') navigate('/Adminlogin');
      else if (user === 'Student') navigate('/Studentlogin');
      else if (user === 'Teacher') navigate('/Teacherlogin');
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'error') {
      setLoader(false);
      setMessage('Network Error');
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  const roles = [
    { name: 'Admin', icon: <AccountCircle sx={{ fontSize: 56, color: '#68c19f' }} />, desc: 'Manage school data, classes, teachers & students.' },
    { name: 'Student', icon: <School sx={{ fontSize: 56, color: '#68c19f' }} />, desc: 'View subjects, attendance & exam results.' },
    { name: 'Teacher', icon: <Group sx={{ fontSize: 56, color: '#68c19f' }} />, desc: 'Manage classes, take attendance & mark grades.' },
  ];

  return (
    <div className="hp-page">
      <Navbar />
      <PageWrapper>
        <ContentWrapper>
          <Title>Welcome to School Management</Title>
          <Subtitle>Choose your role to continue</Subtitle>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 1 }}>
            {roles.map(({ name, icon, desc }) => (
              <Grid item xs={12} sm={4} key={name}>
                <RoleCard onClick={() => navigateHandler(name)}>
                  <IconBox>{icon}</IconBox>
                  <RoleName>{name}</RoleName>
                  <RoleDesc>{desc}</RoleDesc>
                </RoleCard>
              </Grid>
            ))}
          </Grid>
          {visitor !== 'guest' && (
            <RegisterSection>
              <p style={{ color: '#777', marginBottom: '12px' }}>Don't have an account?</p>
              <RegisterButton onClick={() => navigate('/AdminRegister')}>
                Register as Admin
              </RegisterButton>
            </RegisterSection>
          )}
        </ContentWrapper>
      </PageWrapper>
      <Footer />
      <Backdrop sx={{ color: '#fff', zIndex: 9999 }} open={loader}>
        <CircularProgress sx={{ color: '#68c19f' }} />
        <span style={{ marginLeft: 10 }}>Please Wait</span>
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default ChooseUser;

/* ---------- Styled Components ---------- */

const PageWrapper = styled.div`
  min-height: 70vh;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  font-family: 'Open Sans', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  font-family: 'Raleway', sans-serif;
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #777;
  font-size: 1rem;
  margin-bottom: 24px;
`;

const RoleCard = styled.div`
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    border-color: #68c19f;
    background: rgba(104, 193, 159, 0.04);
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(104, 193, 159, 0.18);
  }
`;

const IconBox = styled.div`
  margin-bottom: 12px;
`;

const RoleName = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const RoleDesc = styled.p`
  font-size: 0.9rem;
  color: #777;
  line-height: 1.6;
`;

const RegisterSection = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const RegisterButton = styled.button`
  padding: 10px 28px;
  background: transparent;
  color: #68c19f;
  border: 2px solid #68c19f;
  border-radius: 8px;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #68c19f;
    color: #fff;
    box-shadow: 0 4px 12px rgba(104, 193, 159, 0.3);
  }
`;
