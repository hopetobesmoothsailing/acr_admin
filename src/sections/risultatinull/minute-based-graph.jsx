import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { Typography, Unstable_Grid2 as Grid  } from '@mui/material';

import AppWebsiteVisits from '../overview/app-website-visits';

const MinuteBasedGraph = ({ data }) => {
    const [minuteData] = useState([]);
  
    useEffect(() => {
      processAcrDetails(data);
    });
  
  
  const processAcrDetails = (details) => {
    const minuteData2 = Array.from({ length: 1440 }, () => 0);

    details.forEach((detail) => {
      const recordedTime = new Date(detail.recorded_at);
      const totalMinutes = recordedTime.getHours() * 60 + recordedTime.getMinutes();
      minuteData2[totalMinutes] += 1;
    });
    return minuteData2;
  };

  const labels = Array.from({ length: 1440 }, (_, i) => {
    const hour = Math.floor(i / 60);
    const minute = i % 60;
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  });

  const renderMinuteData = () =>
  minuteData.map((count, index) => (
    <Grid key={index} item xs={1} sm={1} md={1} lg={1}>
      <Typography>TEST {labels[index]}</Typography>
      <Typography>{count}</Typography>
      <AppWebsiteVisits
              title="Website Visits"
              subheader="(+43%) than last year"
              chart={{
                labels: [{labels}
                ],
                series: [
                  {
                    name: 'Team A',
                    type: 'column',
                    fill: 'solid',
                    data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                  },
                  {
                    name: 'Team B',
                    type: 'area',
                    fill: 'gradient',
                    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                  },
                  {
                    name: 'Team C',
                    type: 'line',
                    fill: 'solid',
                    data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                  },
                ],
              }}
            />
    </Grid>
  ));


  return (
    <Grid container spacing={1}>
      {renderMinuteData()}
    </Grid>
  );
};
MinuteBasedGraph.propTypes = {
  data: PropTypes.array.isRequired,
};
export default MinuteBasedGraph;
