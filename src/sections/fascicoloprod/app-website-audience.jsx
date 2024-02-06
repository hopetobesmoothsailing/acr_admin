import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import LineChart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function AppWebsiteAudience({ title, subheader, chart, ...other }) {
  const { labels, colors, series, options } = chart;
  // console.log(labels);

  const chartOptions = useChart({
    colors,
    plotOptions: {
      bar: {
        columnWidth: '16%',
      },
    },
    fill: {
        type: series.map((i) => (i.fill ? i.fill : 'solid')), // Check if fill property exists
      },
    labels,
    xaxis: {
      type: 'datetime',
    },
    /* yaxis: [
    {
      show: true,
 
      title: {
        text: 'Share',
        
      },
      // Add other configurations for the primary y-axis
    },
    {
      opposite: true,
      show: true,
      title: {
        text: 'Audience',
        
      },
      // Add other configurations for the secondary y-axis
    },
    
  ],
  */
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => {
          if (typeof value !== 'undefined') {
            return `${value.toFixed(0)} visits`;
          }
          return value;
        },
      },
    },
    ...options,
  });
  const continuousSeries = series.map((item) => ({
    ...item,
    type: 'line', // Set type to 'line' for each series
  }));

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }}>
        <LineChart
          dir="ltr"
          type="line"
          series={continuousSeries}
          options={chartOptions}
          width="100%"
          height={364}
        />

       </Box>
    </Card>
  );
}

AppWebsiteAudience.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
