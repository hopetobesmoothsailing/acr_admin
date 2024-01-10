import { Helmet } from 'react-helmet-async';

import { GiornalieroView } from "../sections/giornaliero/view";

// ----------------------------------------------------------------------

export default function GiornalieroPage() {
  return (
    <>
      <Helmet>
        <title> Giornaliero  </title>
      </Helmet>

      <GiornalieroView />
    </>
  );
}
