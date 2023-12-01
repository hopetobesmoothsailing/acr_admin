import { Helmet } from 'react-helmet-async';

import { RisultatiView } from "../sections/risultati/view";

// ----------------------------------------------------------------------

export default function RisultatiPage() {
  return (
    <>
      <Helmet>
        <title> My Result | ACR Admin </title>
      </Helmet>

      <RisultatiView />
    </>
  );
}
