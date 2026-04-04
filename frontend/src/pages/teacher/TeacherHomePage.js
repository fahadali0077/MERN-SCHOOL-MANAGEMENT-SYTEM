import { Container, Grid, Paper } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import styled from 'styled-components';
import Students from '../../assets/img1.png';
import Lessons from '../../assets/subjects.svg';
import Tests from '../../assets/assignment.svg';
import Time from '../../assets/time.svg';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const TeacherHomePage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

  const classID = currentUser.teachSclass?._id;
  const subjectID = currentUser.teachSubject?._id;

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, 'Subject'));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  const stats = [
    { label: 'Class Students', value: sclassStudents?.length || 0,       img: Students },
    { label: 'Total Lessons',  value: subjectDetails?.sessions || 0,      img: Lessons  },
    { label: 'Tests Taken',    value: 24,                                  img: Tests    },
    { label: 'Total Hours',    value: '30 hrs',                            img: Time     },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {stats.map(({ label, value, img }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <StyledPaper>
              <img src={img} alt={label} style={{ width: 50 }} />
              <StatLabel>{label}</StatLabel>
              <StatValue>{value}</StatValue>
            </StyledPaper>
          </Grid>
        ))}
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

export default TeacherHomePage;
