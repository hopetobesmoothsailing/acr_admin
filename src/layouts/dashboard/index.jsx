import {useState} from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Nav from './nav';
import Main from './main';
import Header from './header';

// ----------------------------------------------------------------------

export default function DashboardLayout({userInfo, children}) {
    const [openNav, setOpenNav] = useState(false);

    return (
        <>
            <Header onOpenNav={() => setOpenNav(true)}/>

            <Box
                sx={{
                    minHeight: 1,
                    display: 'flex',
                    flexDirection: {xs: 'column', lg: 'row'},
                }}
            >
                <Nav userInfo={userInfo} openNav={openNav} onCloseNav={() => setOpenNav(false)}/>

                <Main>{children}</Main>
            </Box>
        </>
    );
}

DashboardLayout.propTypes = {
    userInfo: PropTypes.object,
    children: PropTypes.node,
};
