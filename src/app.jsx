/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
import 'react-tooltip/dist/react-tooltip.css';

import {useScrollToTop} from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';
import {Provider} from 'react-redux'
import {createStore} from "redux";
import {SnackbarProvider} from "notistack";
import reducer from './store/reducers/index'

// ----------------------------------------------------------------------

const store = createStore(reducer);
export default function App() {
    useScrollToTop();

    return (
        <ThemeProvider>
            <Provider store={store} >
                <SnackbarProvider
                    anchorOrigin={{horizontal: 'center', vertical: 'top'}}
                    autoHideDuration={3500}
                >
                    <Router/>
                </SnackbarProvider>
            </Provider>
        </ThemeProvider>
    );
}
