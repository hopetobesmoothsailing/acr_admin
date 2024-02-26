import { Helmet } from 'react-helmet-async';

import {CrossmedialeView} from "../sections/crossmediale/view";

// ----------------------------------------------------------------------

export default function CrossmedialePage() {
    return (
        <>
            <Helmet>
                <title> Analisi Crossmediale | Audiomonitor </title>
            </Helmet>

            <CrossmedialeView />
        </>
    );
}
