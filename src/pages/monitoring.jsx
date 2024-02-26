import { Helmet } from 'react-helmet-async';

import { MonitoringView } from "../sections/monitoring/view";

// ----------------------------------------------------------------------

export default function MonitoringPage() {
  return (
    <>
      <Helmet>
        <title> Monitoraggio Canali </title>
      </Helmet>

      <MonitoringView />
    </>
  );
}
