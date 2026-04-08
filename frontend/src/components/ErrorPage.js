import React from 'react';
import styled from 'styled-components';

const ErrorPage = () => {
    return (
        <Container>
            <Content>
                <ErrorIcon>⚠️</ErrorIcon>
                <Heading>Oops, something went wrong</Heading>
                <Text>
                    We apologize for the inconvenience. Our website is currently experiencing technical difficulties. Please check back later.
                </Text>
            </Content>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Open Sans', sans-serif;
  background: #f9f9f9;
`;

const Content = styled.div`
  max-width: 500px;
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #eee;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const Heading = styled.h1`
  margin-bottom: 16px;
  font-family: 'Raleway', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
`;

const Text = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: #777;
`;

export default ErrorPage;
