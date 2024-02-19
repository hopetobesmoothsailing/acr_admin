import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Bar, XAxis, YAxis, Legend,   BarChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import {RADIOSTATIONCOLORS} from "../../utils/consts";

const GraphChartArrBarCh = ({ data,channels,importantChannels,tipoRadioTV,intervalValue,slotSel }) => {
  
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') {
      console.log('Invalid data for CustomGraphChart');
      return [];
    }
    const calculateShareSlotCanale = (channel, slot) => {
      let audienceSlotCanali = 0
      channels.forEach(canalealtro => {
          if ((canalealtro !== "NULL")) {
               audienceSlotCanali += parseFloat(data[slot][canalealtro] || 0)
          }
      });
      const minuto = data[slot][channel] || 0 ;
      let audienceByMinute = 0;
      let day_interval = intervalValue;
      if (slot === '00:00:00 - 23:59:59') {
          day_interval = 1440;
          audienceByMinute = minuto;
      }
      else if (slot === '06:00:00 - 23:59:00') {
              day_interval = 1440 - 360;
              audienceByMinute = minuto;
      }
      else
          audienceByMinute = minuto;
      const shareSlotCanale = (((audienceByMinute/day_interval) || 0)/ (audienceSlotCanali/day_interval))*100 || 0 ;
      return shareSlotCanale.toFixed(1);

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
        timeSlotData[radioStation] = parseFloat(shareslotcanale).toFixed(1);
        
      });
      formattedData.push(timeSlotData);
      }
      // Push the data object to the formattedData array
    });

    return formattedData;
  }, [data,intervalValue,slotSel,channels]);

  


  // Generate bars for each radio station
  const bars = Object.keys(data[Object.keys(chartData)[0]] || {}).map(radioStation => (
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
    channels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    importantChannels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    tipoRadioTV: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    slotSel: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    };
  export default GraphChartArrBarCh;