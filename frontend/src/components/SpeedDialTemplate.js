import React from 'react'
import { SpeedDial, SpeedDialAction, styled } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';

const SpeedDialTemplate = ({ actions }) => {
    return (
        <CustomSpeedDial
            ariaLabel="SpeedDial playground example"
            icon={<TuneIcon />}
            direction="left"
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                />
            ))}
        </CustomSpeedDial>
    )
}

export default SpeedDialTemplate

const CustomSpeedDial = styled(SpeedDial)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;

  .MuiSpeedDial-fab {
    background-color: #68c19f;
    color: #fff;
    
    &:hover {
      background-color: #4a9b7e;
    }
  }
`;