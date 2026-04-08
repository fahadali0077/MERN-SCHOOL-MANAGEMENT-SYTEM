import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';

const SideBar = () => {
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
                    sx={location.pathname === '/' || location.pathname === '/Admin/dashboard' ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <HomeIcon sx={{ color: iconColor(location.pathname === '/' || location.pathname === '/Admin/dashboard') }} />
                    </ListItemIcon>
                    <ListItemText primary="Home" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/classes"
                    sx={location.pathname.startsWith('/Admin/classes') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <ClassOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/classes')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Classes" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/subjects"
                    sx={location.pathname.startsWith('/Admin/subjects') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <AssignmentIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/subjects')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers"
                    sx={location.pathname.startsWith('/Admin/teachers') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <SupervisorAccountOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/teachers')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Teachers" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/students"
                    sx={location.pathname.startsWith('/Admin/students') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <PersonOutlineIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/students')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Students" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/notices"
                    sx={location.pathname.startsWith('/Admin/notices') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/notices')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Notices" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/complains"
                    sx={location.pathname.startsWith('/Admin/complains') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <ReportIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/complains')) }} />
                    </ListItemIcon>
                    <ListItemText primary="Complains" sx={{ '& .MuiListItemText-primary': { fontFamily: "'Raleway', sans-serif", fontWeight: 500 } }} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <React.Fragment>
                <ListSubheader component="div" inset sx={{ backgroundColor: 'transparent', color: '#fff', fontFamily: "'Raleway', sans-serif", fontWeight: 600, fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Admin/profile"
                    sx={location.pathname.startsWith('/Admin/profile') ? activeLinkStyle : linkStyle}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon sx={{ color: iconColor(location.pathname.startsWith('/Admin/profile')) }} />
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

export default SideBar
