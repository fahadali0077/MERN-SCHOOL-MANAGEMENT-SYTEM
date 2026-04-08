import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import Subject from '../../assets/subjects.svg';
import Assignment from '../../assets/assignment.svg';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

const StudentHomePage = () => {
  const dispatch = useDispatch();
  const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
  const { subjectsList } = useSelector((state) => state.sclass);
  const [subjectAttendance, setSubjectAttendance] = useState([]);

  const classID = currentUser.sclassName._id;

  useEffect(() => {
    dispatch(getUserDetails(currentUser._id, 'Student'));
    dispatch(getSubjectList(classID, 'ClassSubjects'));
  }, [dispatch, currentUser._id, classID]);

  useEffect(() => {
    if (userDetails) setSubjectAttendance(userDetails.attendance || []);
  }, [userDetails]);

  const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
  const overallAbsentPercentage = 100 - overallAttendancePercentage;
  const chartData = [
    { name: 'Present', value: overallAttendancePercentage },
    { name: 'Absent',  value: overallAbsentPercentage     },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <img src={Subject} alt="Subjects" style={{ width: 50 }} />
            <StatLabel>Total Subjects</StatLabel>
            <StatValue>{subjectsList?.length || 0}</StatValue>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <img src={Assignment} alt="Assignments" style={{ width: 50 }} />
            <StatLabel>Total Assignments</StatLabel>
            <StatValue>15</StatValue>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartContainer>
            {response ? (
              <Typography variant="h6" sx={{ fontFamily: "'Raleway', sans-serif", color: '#777' }}>No Attendance Found</Typography>
            ) : loading ? (
              <Typography variant="h6" sx={{ fontFamily: "'Raleway', sans-serif", color: '#777' }}>Loading...</Typography>
            ) : subjectAttendance?.length > 0 ? (
              <CustomPieChart data={chartData} />
            ) : (
              <Typography variant="h6" sx={{ fontFamily: "'Raleway', sans-serif", color: '#777' }}>No Attendance Found</Typography>
            )}
          </ChartContainer>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SeeNotice />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const StyledPaper = styled(Paper)`
  && {
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 200px;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    border-radius: 12px;
    border: 1.5px solid #eee;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
      border-color: #68c19f;
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(104, 193, 159, 0.15);
    }
  }
`;
const ChartContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-direction: column;
  height: 240px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;
const StatLabel = styled.p`
  font-family: 'Raleway', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`;
const StatValue = styled.span`
  font-family: 'Raleway', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #68c19f;
`;

export default StudentHomePage;
