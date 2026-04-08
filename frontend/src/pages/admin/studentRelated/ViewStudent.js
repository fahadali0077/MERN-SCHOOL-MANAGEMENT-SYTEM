import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, getUserDetails } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import {
    Box, Button, Collapse, IconButton, Table, TableBody, TableHead,
    Typography, Tab, Paper, BottomNavigation, BottomNavigationAction,
    Container, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon } from '@mui/icons-material';
import { removeStuff, updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import {
    calculateOverallAttendancePercentage,
    calculateSubjectAttendancePercentage,
    groupAttendanceBySubject,
} from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart';
import CustomPieChart from '../../../components/CustomPieChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Popup from '../../../components/Popup';

const ViewStudent = () => {


    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading } = useSelector((state) => state.user);

    const studentID = params.id;
    const address = 'Student';

    // FIX F-7: include address in the dependency array
    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID, address]);

    useEffect(() => {
        if (userDetails && userDetails.sclassName && userDetails.sclassName._id !== undefined) {
            dispatch(getSubjectList(userDetails.sclassName._id, 'ClassSubjects'));
        }
    }, [dispatch, userDetails]);


    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    // FIX F-7: subjectMarks initial state is [] not ''
    const [subjectMarks, setSubjectMarks] = useState([]);
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [message] = useState('');
    // FIX F-7: delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({ ...prevState, [subId]: !prevState[subId] }));
    };

    const [value, setValue] = useState('1');
    const handleChange = (event, newValue) => { setValue(newValue); };

    const [selectedSection, setSelectedSection] = useState('table');
    const handleSectionChange = (event, newSection) => { setSelectedSection(newSection); };


    useEffect(() => {
        if (userDetails) {

            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            // FIX F-7: use [] fallback, not ''
            setSubjectMarks(userDetails.examResult || []);
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);



    // FIX F-7: proper delete with MUI Dialog confirmation
    const deleteHandler = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        setDeleteDialogOpen(false);
        dispatch(deleteUser(studentID, address)).then(() => {
            navigate(-1);
        });
    };

    const removeHandler = (id, deladdress) => {
        dispatch(removeStuff(id, deladdress)).then(() => {
            dispatch(getUserDetails(studentID, address));
        });
    };

    const removeSubAttendance = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, 'RemoveStudentSubAtten')).then(() => {
            dispatch(getUserDetails(studentID, address));
        });
    };

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent',  value: overallAbsentPercentage },
    ];

    const subjectData = Object.entries(groupAttendanceBySubject(subjectAttendance)).map(
        ([subName, { subCode, present, sessions }]) => ({
            subject: subName,
            attendancePercentage: calculateSubjectAttendancePercentage(present, sessions),
            totalClasses: sessions,
            attendedClasses: present,
        })
    );

    const StudentAttendanceSection = () => {
        const renderTableSection = () => (
            <>
                <h3>Attendance:</h3>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject</StyledTableCell>
                            <StyledTableCell>Present</StyledTableCell>
                            <StyledTableCell>Total Sessions</StyledTableCell>
                            <StyledTableCell>Attendance Percentage</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(
                        ([subName, { present, allData, subId, sessions }], index) => {
                            const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                            return (
                                <TableBody key={index}>
                                    <StyledTableRow>
                                        <StyledTableCell>{subName}</StyledTableCell>
                                        <StyledTableCell>{present}</StyledTableCell>
                                        <StyledTableCell>{sessions}</StyledTableCell>
                                        <StyledTableCell>{subjectAttendancePercentage}%</StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Button variant="contained" onClick={() => handleOpen(subId)}>
                                                {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}Details
                                            </Button>
                                            <IconButton onClick={() => removeSubAttendance(subId)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                            <Button
                                                variant="contained"
                                                sx={styles.attendanceButton}
                                                onClick={() => navigate(`/Admin/subject/student/attendance/${studentID}/${subId}`)}
                                            >
                                                Change
                                            </Button>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 1 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Attendance Details
                                                    </Typography>
                                                    <Table size="small" aria-label="attendance details">
                                                        <TableHead>
                                                            <StyledTableRow>
                                                                <StyledTableCell>Date</StyledTableCell>
                                                                <StyledTableCell align="right">Status</StyledTableCell>
                                                            </StyledTableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {allData.map((data, index) => {
                                                                const date = new Date(data.date);
                                                                const dateString = date.toString() !== 'Invalid Date'
                                                                    ? date.toISOString().substring(0, 10)
                                                                    : 'Invalid Date';
                                                                return (
                                                                    <StyledTableRow key={index}>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {dateString}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                    </StyledTableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                </TableBody>
                            );
                        }
                    )}
                </Table>
                <div>Overall Attendance Percentage: {overallAttendancePercentage.toFixed(2)}%</div>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeHandler(studentID, 'RemoveStudentAtten')}
                >
                    Delete All
                </Button>
                <Button
                    variant="contained"
                    sx={styles.styledButton}
                    onClick={() => navigate('/Admin/students/student/attendance/' + studentID)}
                >
                    Add Attendance
                </Button>
            </>
        );

        const renderChartSection = () => (
            <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
        );

        return (
            <>
                {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                    <>
                        {selectedSection === 'table' && renderTableSection()}
                        {selectedSection === 'chart' && renderChartSection()}
                        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                <BottomNavigationAction
                                    label="Table" value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                                <BottomNavigationAction
                                    label="Chart" value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            </BottomNavigation>
                        </Paper>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        sx={styles.styledButton}
                        onClick={() => navigate('/Admin/students/student/attendance/' + studentID)}
                    >
                        Add Attendance
                    </Button>
                )}
            </>
        );
    };

    const StudentMarksSection = () => {
        const renderTableSection = () => (
            <>
                <h3>Subject Marks:</h3>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject</StyledTableCell>
                            <StyledTableCell>Marks</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {subjectMarks.map((result, index) => {
                            if (!result.subName || !result.marksObtained) return null;
                            return (
                                <StyledTableRow key={index}>
                                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                    <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <Button
                    variant="contained"
                    sx={styles.styledButton}
                    onClick={() => navigate('/Admin/students/student/marks/' + studentID)}
                >
                    Add Marks
                </Button>
            </>
        );

        const renderChartSection = () => (
            <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
        );

        return (
            <>
                {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 ? (
                    <>
                        {selectedSection === 'table' && renderTableSection()}
                        {selectedSection === 'chart' && renderChartSection()}
                        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                <BottomNavigationAction
                                    label="Table" value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                                <BottomNavigationAction
                                    label="Chart" value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            </BottomNavigation>
                        </Paper>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        sx={styles.styledButton}
                        onClick={() => navigate('/Admin/students/student/marks/' + studentID)}
                    >
                        Add Marks
                    </Button>
                )}
            </>
        );
    };

    const StudentDetailsSection = () => (
        <div>
            Name: {userDetails.name}
            <br />
            Roll Number: {userDetails.rollNum}
            <br />
            Class: {sclassName.sclassName}
            <br />
            School: {studentSchool.schoolName}
            {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
                <CustomPieChart data={chartData} />
            )}
            {/* FIX F-7: proper delete with confirmation dialog */}
            <Button variant="contained" sx={styles.styledButton} onClick={deleteHandler}>
                Delete
            </Button>
        </div>
    );

    return (
        <>
            {/* FIX F-7: Replace <div>Loading...</div> with centered CircularProgress */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList
                                onChange={handleChange}
                                sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}
                            >
                                <Tab label="Details"    value="1" />
                                <Tab label="Attendance" value="2" />
                                <Tab label="Marks"      value="3" />
                            </TabList>
                        </Box>
                        <Container sx={{ marginTop: '3rem', marginBottom: '4rem' }}>
                            <TabPanel value="1"><StudentDetailsSection /></TabPanel>
                            <TabPanel value="2"><StudentAttendanceSection /></TabPanel>
                            <TabPanel value="3"><StudentMarksSection /></TabPanel>
                        </Container>
                    </TabContext>
                </Box>
            )}

            {/* FIX F-7: Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this student? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ViewStudent;

const styles = {
    attendanceButton: {
        marginLeft: '20px',
        backgroundColor: '#270843',
        '&:hover': { backgroundColor: '#3f1068' },
    },
    styledButton: {
        margin: '20px',
        backgroundColor: '#02250b',
        '&:hover': { backgroundColor: '#106312' },
    },
};
