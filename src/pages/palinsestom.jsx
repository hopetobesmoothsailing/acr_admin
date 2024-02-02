import { Helmet } from 'react-helmet-async';

import { PalinsestomView } from "../sections/palinsestom/view";

// ----------------------------------------------------------------------

export default function PalinsestomPage() {
  return (
    <>
      <Helmet>
        <title> Download Page | ACR Admin </title>
      </Helmet>

      <PalinsestomView />
    </>
  );
}
