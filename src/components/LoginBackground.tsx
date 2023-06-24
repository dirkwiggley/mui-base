import React from 'react';
import backgroundImage from '../assets/background1.jpg';
import { Box } from '@mui/material';

type ContainerProps = {
    children: React.ReactNode; //👈 children prop type
};

const LoginBackground = (props: ContainerProps) => {
    return (
        <Box sx={{ 
            maxWidth: "100vw", 
            maxHeight: "100vh", 
            backgroundImage:`url(${backgroundImage})`,
            backgroundSize: "cover",
            }}>
            {props.children}
        </Box>
    )
}

export default LoginBackground;