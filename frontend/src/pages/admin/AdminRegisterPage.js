import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, Backdrop } from '@mui/material';
import { registerUser } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import Popup from '../../components/Popup';
import Navbar from '../homepage/components/Navbar';
import Footer from '../homepage/components/Footer';
import '../../pages/homepage/homepage.css';

const AdminRegisterPage = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

    const [toggle, setToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [adminNameError, setAdminNameError] = useState(false);
    const [schoolNameError, setSchoolNameError] = useState(false);
    const role = "Admin"

    const handleSubmit = (event) => {
        event.preventDefault();

        const name = event.target.adminName.value;
        const schoolName = event.target.schoolName.value;
        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!name || !schoolName || !email || !password) {
            if (!name) setAdminNameError(true);
            if (!schoolName) setSchoolNameError(true);
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return;
        }

        const fields = { name, email, password, role, schoolName }
        setLoader(true)
        dispatch(registerUser(fields, role))
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'adminName') setAdminNameError(false);
        if (name === 'schoolName') setSchoolNameError(false);
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            console.log(error)
        }
    }, [status, currentUser, currentRole, navigate, error, response]);

    return (
        <div className="hp-page">
            <Navbar />
            <PageWrapper>
                <RegisterCard>
                    <RegisterIconCircle>🛡️</RegisterIconCircle>
                    <RegisterTitle>Admin Register</RegisterTitle>
                    <RegisterSubtitle>
                        Create your own school by registering as an admin.
                        You will be able to add students and faculty and manage the system.
                    </RegisterSubtitle>
                    <form onSubmit={handleSubmit} noValidate>
                        <InputGroup>
                            <StyledInput
                                id="adminName"
                                name="adminName"
                                placeholder="Enter your name"
                                autoComplete="name"
                                autoFocus
                                $hasError={adminNameError}
                                onChange={handleInputChange}
                            />
                            {adminNameError && <ErrorText>Name is required</ErrorText>}
                        </InputGroup>
                        <InputGroup>
                            <StyledInput
                                id="schoolName"
                                name="schoolName"
                                placeholder="Create your school name"
                                autoComplete="off"
                                $hasError={schoolNameError}
                                onChange={handleInputChange}
                            />
                            {schoolNameError && <ErrorText>School name is required</ErrorText>}
                        </InputGroup>
                        <InputGroup>
                            <StyledInput
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                $hasError={emailError}
                                onChange={handleInputChange}
                            />
                            {emailError && <ErrorText>Email is required</ErrorText>}
                        </InputGroup>
                        <InputGroup>
                            <PasswordWrapper>
                                <StyledInput
                                    id="password"
                                    name="password"
                                    type={toggle ? 'text' : 'password'}
                                    placeholder="Password"
                                    autoComplete="current-password"
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
                            {loader ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : "Register"}
                        </SubmitButton>

                        <LoginPrompt>
                            <span>Already have an account?</span>
                            <StyledLink to="/Adminlogin">Log in</StyledLink>
                        </LoginPrompt>
                    </form>
                </RegisterCard>
            </PageWrapper>
            <Footer />
            <Backdrop sx={{ color: '#fff', zIndex: 9999 }} open={loader}>
                <CircularProgress sx={{ color: '#68c19f' }} />
                <span style={{ marginLeft: 10 }}>Please Wait</span>
            </Backdrop>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
}

export default AdminRegisterPage

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

const RegisterCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  text-align: center;
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const RegisterIconCircle = styled.div`
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

const RegisterTitle = styled.h1`
  font-family: 'Raleway', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
`;

const RegisterSubtitle = styled.p`
  color: #777;
  font-size: 0.9rem;
  line-height: 1.6;
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

const LoginPrompt = styled.div`
  margin-top: 20px;
  font-size: 0.9rem;
  color: #777;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #68c19f;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: #4a9b7e;
  }
`;
