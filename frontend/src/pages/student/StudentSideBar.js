import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';

const StudentSideBar = () => {
    const location = useLocation();

    const linkStyle = {
        color: '#fff',
        '&:hover': { backgroundColor: 'rgba(104, 193, 159, 0.1)', color: '#fff' },
    };
    const activeLinkStyle = {
        ...linkStyle,
        backgroundColor: 'rgba(104, 193, 159, 0.15)',
        color: '#68c19f',
        borderRight: '3px solid #68c19f',
    };
    const iconColor = (active) => active ? '#68c19f' : '#fff';

    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/"
                    sx={location.pathname === '/' || location.pathname === '/Student/dashboard' ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <HomeIcon sx={{ color: iconColor(location.pathname === '/' || location.pathname === '/Student/dashboard') }} />
                    </ListItemIcon>
                    <ListItemText primary="Home" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/subjects"
                    sx={location.pathname.startsWith('/Student/subjects') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <AssignmentIcon sx={{ color: iconColor(location.pathname.startsWith('/Student/subjects')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/attendance"
                    sx={location.pathname.startsWith('/Student/attendance') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <ClassOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Student/attendance')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Attendance" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/complain"
                    sx={location.pathname.startsWith('/Student/complain') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Student/complain')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Complain" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <React.Fragment>
                <ListSubheader component="div" inset sx={{ backgroundColor: 'transparent', color: '#fff', fontFamily: "'Raleway', sans-serif", fontWeight: 600, fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Student/profile"
                    sx={location.pathname.startsWith('/Student/profile') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Student/profile')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout"
                    sx={location.pathname.startsWith('/logout') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <ExitToAppIcon sx={{ color: iconColor(location.pathname.startsWith('/logout')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default StudentSideBar