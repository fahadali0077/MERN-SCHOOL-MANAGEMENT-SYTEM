import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <StyledContainer>
            <StyledProfile>
                <ProfileAvatar>
                    {String(currentUser.name).charAt(0).toUpperCase()}
                </ProfileAvatar>
                <ProfileTitle>Profile</ProfileTitle>
                <StyledInfo>
                    <span>Name:</span> {currentUser.name}
                </StyledInfo>
                <StyledInfo>
                    <span>Email:</span> {currentUser.email}
                </StyledInfo>
                <StyledInfo>
                    <span>School:</span> {currentUser.schoolName}
                </StyledInfo>
            </StyledProfile>
        </StyledContainer>
    );
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const StyledProfile = styled.div`
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  color: #333;
  width: 420px;
  border: 1.5px solid #eee;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #68c19f;
    box-shadow: 0 8px 24px rgba(104, 193, 159, 0.12);
    transform: translateY(-2px);
  }
`;

const ProfileAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #68c19f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Raleway', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 auto 16px;
`;

const ProfileTitle = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 24px;
`;

const StyledInfo = styled.div`
  margin-bottom: 16px;
  font-size: 1rem;
  font-family: 'Open Sans', sans-serif;
  color: #555;
  text-align: left;
  padding: 10px 16px;
  background: #f9f9f9;
  border-radius: 8px;

  span {
    font-weight: 600;
    color: #333;
    font-family: 'Raleway', sans-serif;
  }
`;

export default AdminProfile;
