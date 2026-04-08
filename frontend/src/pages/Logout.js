import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../redux/userRelated/userSlice';
import styled from 'styled-components';

const Logout = () => {
    const currentUser = useSelector(state => state.user.currentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(authLogout());
        navigate('/');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <StyledContainer>
            <StyledCard>
                <IconWrapper>
                    <span role="img" aria-label="logout">🚪</span>
                </IconWrapper>
        <StyledTypography>{currentUser?.name || 'User'}</StyledTypography>
                <Description>Are you sure you want to log out?</Description>
                <StyledButtonsContainer>
                    <LogoutButtonLogout onClick={handleLogout}>Log Out</LogoutButtonLogout>
                    <LogoutButtonCancel onClick={handleCancel}>Cancel</LogoutButtonCancel>
                </StyledButtonsContainer>
            </StyledCard>
        </StyledContainer>
    );
};

export default Logout;

const StyledContainer = styled.div`
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Open Sans', sans-serif;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const StyledCard = styled.div`
  padding: 36px 32px;
  text-align: center;
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 12px;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  max-width: 400px;
  width: 100%;

  &:hover {
    border-color: #68c19f;
    box-shadow: 0 8px 24px rgba(104, 193, 159, 0.12);
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
`;

const StyledTypography = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 700;
  color: #333;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #777;
`;

const StyledButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 24px;
`;

const LogoutButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  width: 120px;
  border: none;
  transition: all 0.3s ease;
`;

const LogoutButtonLogout = styled(LogoutButton)`
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  }
`;

const LogoutButtonCancel = styled(LogoutButton)`
  background-color: #2c2c2c;

  &:hover {
    background-color: #3a3a3a;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;
