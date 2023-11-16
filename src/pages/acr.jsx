import { Helmet } from 'react-helmet-async';

import {AcrView} from "../sections/acr/view";

// ----------------------------------------------------------------------

export default function AcrPage() {
  return (
    <>
      <Helmet>
        <title> ACR Result | ACR Admin </title>
      </Helmet>

      <AcrView />
    </>
  );
}
