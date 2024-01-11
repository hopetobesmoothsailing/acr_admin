import { Helmet } from 'react-helmet-async';

import { RisultatinullView } from "../sections/risultatinull/view";

// ----------------------------------------------------------------------

export default function RisultatinullPage() {
  return (
    <>
      <Helmet>
        <title> My Result NULL | ACR Admin </title>
      </Helmet>

      <RisultatinullView />
    </>
  );
}
