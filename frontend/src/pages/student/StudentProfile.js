import React from 'react'
import styled from 'styled-components';
import { Grid, Box, Avatar, Container } from '@mui/material';
import { useSelector } from 'react-redux';

const StudentProfile = () => {
  const { currentUser, response, error } = useSelector((state) => state.user);

  if (response) { console.log(response) }
  else if (error) { console.log(error) }

  const sclassName = currentUser.sclassName
  const studentSchool = currentUser.school

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <ProfileCard>
        <Box display="flex" justifyContent="center" mb={2}>
          <ProfileAvatar>
            {String(currentUser.name).charAt(0)}
          </ProfileAvatar>
        </Box>
        <ProfileName>{currentUser.name}</ProfileName>
        <ProfileSubtitle>Student Roll No: {currentUser.rollNum}</ProfileSubtitle>
        
        <InfoGrid>
          <InfoRow>
            <InfoLabel>Class</InfoLabel>
            <InfoValue>{sclassName.sclassName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>School</InfoLabel>
            <InfoValue>{studentSchool.schoolName}</InfoValue>
          </InfoRow>
        </InfoGrid>
      </ProfileCard>

      <ProfileCard>
        <SectionTitle>Personal Information</SectionTitle>
        <Grid container spacing={2}>
          {[
            { label: 'Date of Birth', value: 'January 1, 2000' },
            { label: 'Gender', value: 'Male' },
            { label: 'Email', value: 'john.doe@example.com' },
            { label: 'Phone', value: '(123) 456-7890' },
            { label: 'Address', value: '123 Main Street, City, Country' },
            { label: 'Emergency Contact', value: '(987) 654-3210' },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} key={label}>
              <InfoRow>
                <InfoLabel>{label}</InfoLabel>
                <InfoValue>{value}</InfoValue>
              </InfoRow>
            </Grid>
          ))}
        </Grid>
      </ProfileCard>
    </Container>
  )
}

export default StudentProfile

const ProfileCard = styled.div`
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #68c19f;
    box-shadow: 0 8px 24px rgba(104, 193, 159, 0.12);
  }
`;

const ProfileAvatar = styled(Avatar)`
  && {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
    font-family: 'Raleway', sans-serif;
    font-weight: 700;
    background-color: #68c19f;
  }
`;

const ProfileName = styled.h2`
  font-family: 'Raleway', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 8px 0 4px;
`;

const ProfileSubtitle = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.95rem;
  color: #777;
  margin: 0 0 20px;
`;

const SectionTitle = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px;
  text-align: left;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px 16px;
  text-align: left;
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