import { Helmet } from 'react-helmet-async';

import { FascicolorevView } from "../sections/fascicolorev/view";

// ----------------------------------------------------------------------

export default function FascicolorevPage() {
  return (
    <>
      <Helmet>
      <title> Fascicolo REV - RadioMonitor </title>
      </Helmet>

      <FascicolorevView />
    </>
  );
}
