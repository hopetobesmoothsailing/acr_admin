import { Helmet } from 'react-helmet-async';

import { RisultatinullView } from "../sections/risultatinull/view";

// ----------------------------------------------------------------------

export default function RisultatinullPage() {
  return (
    <>
      <Helmet>
        <title> Download Page | ACR Admin </title>
      </Helmet>

      <RisultatinullView />
    </>
  );
}
