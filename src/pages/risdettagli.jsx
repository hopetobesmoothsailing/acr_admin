import { Helmet } from 'react-helmet-async';

import { RisdettagliView } from "../sections/risdettagli/view";

// ----------------------------------------------------------------------

export default function RisdettagliPage() {
  return (
    <>
      <Helmet>
        <title> My Result Details | ACR Admin </title>
      </Helmet>

      <RisdettagliView />
    </>
  );
}
