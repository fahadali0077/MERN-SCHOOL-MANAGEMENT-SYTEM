import { Grid } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import Students from '../../assets/img1.png';
import Classes from '../../assets/img2.png';
import Teachers from '../../assets/img3.png';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    // FIX F-6: null guard — do not access _id if currentUser is null
    const adminID = currentUser?._id;

    useEffect(() => {
        if (!adminID) return;
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, 'Sclass'));
        dispatch(getAllTeachers(adminID));
    }, [adminID, dispatch]);

    const stats = [
        { label: 'Total Students', count: studentsList?.length || 0, img: Students },
        { label: 'Total Classes',  count: sclassesList?.length || 0, img: Classes  },
        { label: 'Total Teachers', count: teachersList?.length || 0, img: Teachers },
    ];

    return (
        <Container>
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                {stats.map(({ label, count, img }) => (
                    <Grid item xs={12} sm={4} key={label}>
                        <StatCard>
                            <img src={img} alt={label} style={{ width: 56, marginBottom: 12 }} />
                            <StatLabel>{label}</StatLabel>
                            <StatCount>{count}</StatCount>
                        </StatCard>
                    </Grid>
                ))}
            </Grid>
            <SeeNotice />
        </Container>
    );
};

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  font-family: 'Open Sans', sans-serif;
`;
const StatCard = styled.div`
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 12px;
  padding: 28px 16px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    border-color: #68c19f;
    background: rgba(104, 193, 159, 0.04);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(104, 193, 159, 0.15);
  }
`;
const StatLabel = styled.h3`
  font-family: 'Raleway', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 8px;
`;
const StatCount = styled.div`
  font-family: 'Raleway', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #68c19f;
`;

export default AdminHomePage;
