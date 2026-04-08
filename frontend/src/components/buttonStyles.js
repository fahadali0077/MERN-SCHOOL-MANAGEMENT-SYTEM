import styled from 'styled-components';
import { Button } from '@mui/material';

export const RedButton = styled(Button)`
  && {
    background-color: #e74c3c;
    color: white;
    margin-left: 4px;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #c0392b;
      box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: #2c2c2c;
    color: white;
    margin-left: 4px;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #3a3a3a;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
`;

export const DarkRedButton = styled(Button)`
  && {
    background-color: #a93226;
    color: white;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #c0392b;
      box-shadow: 0 2px 8px rgba(169, 50, 38, 0.3);
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background-color: #2c2c2c;
    color: #fff;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #3a3a3a;
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: #4a9b7e;
    color: #fff;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #3d8269;
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background-color: #68c19f;
    color: #fff;
    font-family: 'Raleway', sans-serif;
    font-weight: 700;
    border-radius: 6px;
    text-transform: none;
    letter-spacing: 0.5px;
    &:hover {
      background-color: #4a9b7e;
      box-shadow: 0 2px 8px rgba(104, 193, 159, 0.4);
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: #68c19f;
    color: #fff;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #4a9b7e;
      box-shadow: 0 2px 8px rgba(104, 193, 159, 0.4);
    }
  }
`;

export const BrownButton = styled(Button)`
  && {
    background-color: #5d4037;
    color: white;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #6d4c41;
      box-shadow: none;
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: #2c2c2c;
    color: white;
    font-family: 'Raleway', sans-serif;
    font-weight: 600;
    border-radius: 6px;
    text-transform: none;
    &:hover {
      background-color: #3a3a3a;
      box-shadow: none;
    }
  }
`;
