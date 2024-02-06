import { Helmet } from 'react-helmet-async';

import { FascicoloprodView } from "../sections/fascicoloprod/view";

// ----------------------------------------------------------------------

export default function FascicoloprodPage() {
  return (
    <>
      <Helmet>
        <title> Fascicolo - RadioMonitor </title>
      </Helmet>

      <FascicoloprodView />
    </>
  );
}
