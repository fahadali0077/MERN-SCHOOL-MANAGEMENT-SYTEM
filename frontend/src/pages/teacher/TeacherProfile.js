import React from 'react'
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const TeacherProfile = () => {
  const { currentUser, response, error } = useSelector((state) => state.user);

  if (response) { console.log(response) }
  else if (error) { console.log(error) }

  const teachSclass = currentUser.teachSclass
  const teachSubject = currentUser.teachSubject
  const teachSchool = currentUser.school

  return (
    <StyledContainer>
      <ProfileCard>
        <ProfileAvatar>
          {String(currentUser.name).charAt(0).toUpperCase()}
        </ProfileAvatar>
        <ProfileTitle>Profile</ProfileTitle>
        <InfoRow>
          <InfoLabel>Name</InfoLabel>
          <InfoValue>{currentUser.name}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Email</InfoLabel>
          <InfoValue>{currentUser.email}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Class</InfoLabel>
          <InfoValue>{teachSclass.sclassName}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Subject</InfoLabel>
          <InfoValue>{teachSubject.subName}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>School</InfoLabel>
          <InfoValue>{teachSchool.schoolName}</InfoValue>
        </InfoRow>
      </ProfileCard>
    </StyledContainer>
  )
}

export default TeacherProfile

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const ProfileCard = styled.div`
  background: #fff;
  padding: 32px;
  border-radius: 12px;
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

const InfoRow = styled.div`
  margin-bottom: 12px;
  text-align: left;
  padding: 10px 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const InfoLabel = styled.span`
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #999;
  display: block;
  margin-bottom: 2px;
`;

const InfoValue = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.95rem;
  color: #333;
`;