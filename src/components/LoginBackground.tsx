import React from 'react';
import backgroundImage1 from '../assets/background1.jpg';
import backgroundImage2 from '../assets/background2.png';
import { Box } from '@mui/material';

type ContainerProps = {
    children: React.ReactNode; //👈 children prop type
};

const LoginBackground = (props: ContainerProps) => {
    const [backgroundCounter, setBackgroundCounter] = React.useState<number>(1);

    const getBackground = () => {
        // switch (backgroundCounter) {
        //     case 1:
        //         return backgroundImage1;
        //     case 2:
                return backgroundImage2;
            // default:
            //     return null
        // }
    }
    
    const cycleImages =  () => {
        // if (backgroundCounter < 2) {
        //     setBackgroundCounter(backgroundCounter+1);
        // } else {
        //     setBackgroundCounter(1);
        // }
    }

    return (
        <Box 
            onClick = {cycleImages}
            sx={{ 
                maxWidth: "100vw", 
                maxHeight: "100vh", 
                backgroundImage:`url(${getBackground()})`,
                backgroundSize: "cover",
                }}>
            {props.children}
            .
        </Box>
    )
}

export default LoginBackground;