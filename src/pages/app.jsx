import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> ACR Monitor | Admin UI </title>
      </Helmet>

      <AppView />
    </>
  );
}
