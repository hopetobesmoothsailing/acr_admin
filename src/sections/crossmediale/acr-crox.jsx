import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import { Typography } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

// Define TV and radio channels
const TV_CHANNELS = ["RAI1", "RAI2", "RAI3", "CANALE5", "RETE4", "ITALIA1", "LA7"];
const RADIO_CHANNELS = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RAIIsoradio','RDS','RTL','Radio24','RadioM2O', 'RADIOBELLAEMONELLA','RADIOITALIAANNI60','RADIOKISSKISS','RADIOKISSKISSNAPOLI','RADIOKISSKISSITALIA','RadioFRECCIA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioBRUNO','RadioItaliaSMI'];


const DataProcessor = ({ acrDetails }) => {
 // const [transitionsData, setTransitionsData] = useState([]);
  const [transitionMatrix, setTransitionMatrix] = useState({});
  console.log("MTX ACRDET",acrDetails)
  useEffect(() => {
    processTransitions(acrDetails);
    // Debugging: Log processed data after processing
     
}, [acrDetails]); 

const processTransitions = (details) => {
  const morningActivities = {};
  const eveningActivities = {};
  const transitionsCount = {};
  const totalTransitionsByRadio = {};

  details.forEach(detail => {
    const [, time] = detail.recorded_at.split(' ');
    const hour = parseInt(time.split(':')[0], 10);
    const userId = detail.user_id;
    const channel = detail.acr_result;
    const isRadio = RADIO_CHANNELS.includes(channel);
    const isTV = TV_CHANNELS.includes(channel);

    if (hour >= 6 && hour < 12 && isRadio) {
      if (!morningActivities[userId]) morningActivities[userId] = [];
      morningActivities[userId].push(channel);
    } else if (hour >= 18 && hour <= 24 && isTV) {
      if (!eveningActivities[userId]) eveningActivities[userId] = [];
      eveningActivities[userId].push(channel);
    }
  });

  // Match morning radio with evening TV and count transitions
  Object.keys(morningActivities).forEach(userId => {
    const morningRadios = morningActivities[userId];
    const eveningTVs = eveningActivities[userId] || [];

    morningRadios.forEach(radio => {
      if (!totalTransitionsByRadio[radio]) totalTransitionsByRadio[radio] = 0;

      eveningTVs.forEach(tv => {
        if (!transitionsCount[radio]) transitionsCount[radio] = {};
        if (!transitionsCount[radio][tv]) transitionsCount[radio][tv] = 0;

        transitionsCount[radio][tv] += 1;
        totalTransitionsByRadio[radio] += 1;
      });
    });
  });

  // Calculate percentages
  Object.keys(transitionsCount).forEach(radio => {
    Object.keys(transitionsCount[radio]).forEach(tv => {
      const count = transitionsCount[radio][tv];
      const total = totalTransitionsByRadio[radio];
      const percentage = ((count / total) * 100).toFixed(2);
      transitionsCount[radio][tv] = percentage;
    });
  });

  setTransitionMatrix(transitionsCount);
};

/* const processTransitions = (details) => {
    const morningActivities = {};
    const eveningActivities = {};
    const transitionsCount = {};

    details.forEach(detail => {
      // console.log("MTX DETAIL",detail.acr_result);
      const [, time] = detail.recorded_at.split(' ');
      const hour = parseInt(time.split(':')[0], 10);
      const userId = detail.user_id;
      const channel = detail.acr_result;
      const isRadio = RADIO_CHANNELS.includes(channel);
      const isTV = TV_CHANNELS.includes(channel);
      if (hour >= 6 && hour < 12 && isRadio) {
        if (!morningActivities[userId]) morningActivities[userId] = [];
        morningActivities[userId].push(channel);
      } else if (hour >= 18 && isTV) {
        if (!eveningActivities[userId]) eveningActivities[userId] = [];
        eveningActivities[userId].push(channel);
      }
    });
    console.log("MTX MORNACT",morningActivities);
    console.log("MTX NIGHTACT",eveningActivities);
    // Match morning radio with evening TV and count transitions
    Object.keys(morningActivities).forEach(userId => {
      const morningRadios = morningActivities[userId];
      const eveningTVs = eveningActivities[userId] || [];

      morningRadios.forEach(radio => {
        eveningTVs.forEach(tv => {
          if (!transitionsCount[radio]) transitionsCount[radio] = {};
          if (!transitionsCount[radio][tv]) transitionsCount[radio][tv] = 0;
          transitionsCount[radio][tv] += 1;
        });
      });
    });
    // console.log("MATRIX",transitionsCount);
    setTransitionMatrix(transitionsCount);
  };
  */
  /* useEffect(() => {
    const groupByUserAndDay = (data) => {
      const groupedData = {};
      data.forEach((item) => {
        const { user_id, recorded_at } = item;
        const day = recorded_at.split(' ')[0];
        const userDayKey = `${user_id}_${day}`;
        if (!groupedData[userDayKey]) {
          groupedData[userDayKey] = [];
        }
        groupedData[userDayKey].push(item);
      });
      return groupedData;
    };
  
    const analyzeTransitions = (groupedData) => {
      const transitions = [];
      Object.keys(groupedData).forEach((key) => {
        const userDayData = groupedData[key];
        const morningData = userDayData.filter(({ recorded_at }) => isMorning(recorded_at));
        const nightData = userDayData.filter(({ recorded_at }) => isNight(recorded_at));
  
        // Simplified example to detect any transition. Adapt as needed.
        const hasMorningData = morningData.length > 0;
        const hasNightData = nightData.length > 0;
  
        transitions.push({
          userDayKey: key,
          hasMorningData,
          hasNightData,
          // Add any specific transition logic you need
        });
      });
      return transitions;
    };
    const groupedData = groupByUserAndDay(acrDetails);
    const transitions = analyzeTransitions(groupedData);
    setTransitionsData(transitions);
  }, [acrDetails]);

  // Helper Functions
  const isMorning = (recordedAt) => {
    const hour = parseInt(recordedAt.split(' ')[1].split(':')[0], 10);
    return hour >= 6 && hour < 12;
  };

  const isNight = (recordedAt) => {
    const hour = parseInt(recordedAt.split(' ')[1].split(':')[0], 10);
    return hour >= 21 || hour < 6;
  };
*/
  

  return (
    <Paper sx={{ overflow: 'hidden', pl:2, mt:2,mb:2 }} >
      <Typography sx={{mb:2}}>
        <strong>Percentuale calcolata sulla base delle &quot;interazioni&quot; tra radio ascoltate dagli utenti dalle 6 alle 17 e le TV dagli stessi viste dalle 18 in poi.</strong><br />
      </Typography>
      { /* <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>User Day Key</TableCell>
              <TableCell>Morning Data Available</TableCell>
              <TableCell>Night Data Available</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transitionsData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.userDayKey}</TableCell>
                <TableCell>{row.hasMorningData ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.hasNightData ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
            </TableContainer> 
      <TableContainer component={Paper}>
        <Table aria-label="transition matrix">
          <TableHead>
            <TableRow>
              <TableCell>Radio \ TV</TableCell>
              {TV_CHANNELS.map(tv => (
                <TableCell key={tv}>{tv}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(transitionMatrix).map(radio => (
              <TableRow key={radio}>
                <TableCell component="th" scope="row">
                  {radio}
                </TableCell>
                {TV_CHANNELS.map(tv => (
                  <TableCell key={tv}>
                    {transitionMatrix[radio][tv] || 0}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
                </TableContainer> */ }

<TableContainer component={Paper}>
  <Table aria-label="transition matrix">
    <TableHead>
      <TableRow>
        <TableCell>Radio \ TV</TableCell>
        {TV_CHANNELS.map(tv => (
          <TableCell key={tv}>{tv}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {Object.keys(transitionMatrix).map(radio => (
        <TableRow key={radio}>
          <TableCell component="th" scope="row">
            {radio}
          </TableCell>
          {TV_CHANNELS.map(tv => (
            <TableCell key={tv}>
              {transitionMatrix[radio][tv] ? `${transitionMatrix[radio][tv]}%` : '0%'}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
       </Paper>
  
  );
};

DataProcessor.propTypes = {
  acrDetails: PropTypes.array.isRequired,
};

export default DataProcessor;