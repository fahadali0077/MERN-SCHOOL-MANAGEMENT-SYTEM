import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, Backdrop } from '@mui/material';
import styled from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import Navbar from './homepage/components/Navbar';
import Footer from './homepage/components/Footer';
import '../pages/homepage/homepage.css';

const LoginPage = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector((state) => state.user);

  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rollNumberError, setRollNumberError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (role === "Student") {
      const rollNum = event.target.rollNumber.value;
      const studentName = event.target.studentName.value;
      const password = event.target.password.value;

      if (!rollNum || !studentName || !password) {
        if (!rollNum) setRollNumberError(true);
        if (!studentName) setStudentNameError(true);
        if (!password) setPasswordError(true);
        return;
      }
      const fields = { rollNum, studentName, password };
      setLoader(true);
      dispatch(loginUser(fields, role));
    } else {
      const email = event.target.email.value;
      const password = event.target.password.value;

      if (!email || !password) {
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }

      const fields = { email, password };
      setLoader(true);
      dispatch(loginUser(fields, role));
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
    if (name === 'rollNumber') setRollNumberError(false);
    if (name === 'studentName') setStudentNameError(false);
    setErrorMessage('');
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      } else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      }
    } else if (status === 'failed') {
      setErrorMessage(response || 'Invalid credentials. Please try again.');
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setErrorMessage('Network error. Please check your connection.');
      setMessage("Network Error");
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, currentRole, navigate, error, response, currentUser]);

  return (
    <div className="hp-page">
      <Navbar />
      <PageWrapper>
        <LoginCard>
          <LoginIconCircle>
            {role === 'Admin' ? '🛡️' : role === 'Student' ? '🎓' : '👨‍🏫'}
          </LoginIconCircle>
          <LoginTitle>{role} Login</LoginTitle>
          <LoginSubtitle>Welcome back! Please log in to continue.</LoginSubtitle>
          <form onSubmit={handleSubmit}>
            {role === "Student" ? (
              <>
                <InputGroup>
                  <StyledInput
                    id="rollNumber"
                    name="rollNumber"
                    placeholder="Roll Number"
                    type="number"
                    $hasError={rollNumberError}
                    onChange={handleInputChange}
                  />
                  {rollNumberError && <ErrorText>Roll Number is required</ErrorText>}
                </InputGroup>
                <InputGroup>
                  <StyledInput
                    id="studentName"
                    name="studentName"
                    placeholder="Name"
                    $hasError={studentNameError}
                    onChange={handleInputChange}
                  />
                  {studentNameError && <ErrorText>Name is required</ErrorText>}
                </InputGroup>
              </>
            ) : (
              <InputGroup>
                <StyledInput
                  id="email"
                  name="email"
                  placeholder="Email"
                  $hasError={emailError}
                  onChange={handleInputChange}
                />
                {emailError && <ErrorText>Email is required</ErrorText>}
              </InputGroup>
            )}

            <InputGroup>
              <PasswordWrapper>
                <StyledInput
                  id="password"
                  name="password"
                  type={toggle ? 'text' : 'password'}
                  placeholder="Password"
                  $hasError={passwordError}
                  onChange={handleInputChange}
                />
                <VisibilityToggle
                  type="button"
                  onClick={() => setToggle(!toggle)}
                >
                  {toggle ? 'Hide' : 'Show'}
                </VisibilityToggle>
              </PasswordWrapper>
              {passwordError && <ErrorText>Password is required</ErrorText>}
            </InputGroup>

            <SubmitButton type="submit" disabled={loader}>
              {loader ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : "Login"}
            </SubmitButton>
            {errorMessage && <InlineError>{errorMessage}</InlineError>}
          </form>
        </LoginCard>
      </PageWrapper>
      <Footer />
      <Backdrop open={loader} sx={{ color: '#fff', zIndex: 9999 }}>
        <CircularProgress sx={{ color: '#68c19f' }} />
        <span style={{ marginLeft: '10px' }}>Please Wait</span>
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default LoginPage;

/* ---------- Styled Components ---------- */

const PageWrapper = styled.div`
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f9f9f9;
  font-family: 'Open Sans', sans-serif;
`;

const LoginCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  text-align: center;
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const LoginIconCircle = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(104, 193, 159, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 16px;
`;

const LoginTitle = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
`;

const LoginSubtitle = styled.p`
  color: #777;
  font-size: 0.95rem;
  margin: 0 0 28px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  text-align: left;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #f9f9f9;
  border: 1.5px solid ${props => props.$hasError ? '#e74c3c' : '#eee'};
  border-radius: 8px;
  color: #333;
  font-size: 0.95rem;
  font-family: 'Open Sans', sans-serif;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #68c19f;
    box-shadow: 0 0 0 3px rgba(104, 193, 159, 0.15);
    background: #fff;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const VisibilityToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #68c19f;
  cursor: pointer;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  transition: color 0.3s ease;

  &:hover {
    color: #4a9b7e;
  }
`;

const ErrorText = styled.p`
  color: #e74c3c;
  margin: 4px 0 0;
  font-size: 0.8rem;
`;

const InlineError = styled.p`
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(231, 76, 60, 0.08);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: #e74c3c;
  font-size: 0.875rem;
  text-align: center;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 13px;
  margin-top: 8px;
  background: #68c19f;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Raleway', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;

  &:hover {
    background: #4a9b7e;
    box-shadow: 0 4px 12px rgba(104, 193, 159, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
