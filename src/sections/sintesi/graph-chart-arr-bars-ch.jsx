import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Bar, XAxis, YAxis, Legend,   BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import {RADIOSTATIONCOLORS} from "../../utils/consts";

const GraphChartArrBarCh = ({ data,importantChannels,tipoRadioTV,intervalValue,slotSel }) => {
  
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') {
      console.log('Invalid data for CustomGraphChart');
      return [];
    }
    const calculateShareSlotCanale = (channel, slot) => {
      let audienceSlotCanali = 0
      importantChannels.forEach(canalealtro => {
          if ((canalealtro !== "NULL")) {
              // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
              // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
              audienceSlotCanali += parseFloat(data[slot][canalealtro] || 0)
          }
      });
      const minuto = data[slot][channel] || 0 ;
      // come indicato da cristiano corrisponde ai minuti totali di ascolto nel periodo e non minuti * utenti
      // const audienceByMinute = minuto*(uniqueUsersListening*pesoNum);
      const audienceByMinute = minuto;
      /* if (channel === "RDS") {
      console.log("GRAPH_CH:",channel);
      console.log("GRAPH_SLOT:",slot);
      console.log("GRAPH_ABM:",audienceByMinute);
      console.log("GRAPH_ASC:",audienceSlotCanali);
      } */
      const shareSlotCanale = (((((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100) || 0 ) ;
      return shareSlotCanale || 0;

    };

    const formattedData = [];

    // Iterate through each time slot
    Object.keys(data).forEach(timeSlot => {
      // Create a data object for the current time slot
      const timeSlotData = { name: timeSlot };
       if ((timeSlot === slotSel)) {
       
      // Iterate through each radio station within the time slot
      Object.entries(data[timeSlot]).forEach(([radioStation ]) => {
          // Convert the value to a number
         const shareslotcanale = calculateShareSlotCanale(radioStation,timeSlot);
        // Add the radio station and its numeric value to the data object
        timeSlotData[radioStation] = shareslotcanale.toFixed(1);
        
      });
      formattedData.push(timeSlotData);
      }
      // Push the data object to the formattedData array
    });

    return formattedData;
  }, [data,importantChannels,intervalValue,slotSel]);

  


  // Generate bars for each radio station
  const bars = Object.keys(chartData[0])
  .filter(key => key !== 'name') // Assuming 'name' is your XAxis key, remove it from bar generation
  .map((radioStation, index) => (
    <Bar key={radioStation} dataKey={radioStation} fill={RADIOSTATIONCOLORS[radioStation]} label={{ position: 'top' }} />
  ));

  return (
    <ResponsiveContainer width="100%" height={400}>
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis   domain={[0, 'dataMax + 10']} orientation="right" />
      <Legend />
      {bars}
    </BarChart>
  </ResponsiveContainer>
  );
};
  // PropTypes validation
GraphChartArrBarCh.propTypes = {
    data: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
    intervalValue: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    importantChannels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    tipoRadioTV: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    slotSel: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    };
  export default GraphChartArrBarCh;