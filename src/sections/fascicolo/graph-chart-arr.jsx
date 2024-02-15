import PropTypes from 'prop-types';
import React, { useMemo,useState } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import {RADIOSTATIONCOLORS} from "../../utils/consts";

const GraphChartArr = ({ data,intervalValue,importantChannels,tipoRadioTV,activeButton }) => {
    let initiallyVisibleChannels = ['RAIRadio1', 'RAIRadio2', 'RAIRadio3'];
    if (tipoRadioTV === "TV") {
      initiallyVisibleChannels = ['RAI1', 'RAI2', 'RAI3','CANALE5','ITALIA1','RETE4','LA7'];
    }
    const [visibleLines, setVisibleLines] = useState(() => {
      const initialVisibility = {};
      Object.keys(data[Object.keys(data)[0]] || {}).forEach(channel => {
          // Set the channel to visible only if it's in the initiallyVisibleChannels list
          initialVisibility[channel] = initiallyVisibleChannels.includes(channel);
      });
      return initialVisibility;
    });

  // Function to toggle visibility of lines
    const toggleLineVisibility = (radioStation) => {
        setVisibleLines(prevVisibleLines => ({
            ...prevVisibleLines,
            [radioStation]: !prevVisibleLines[radioStation],
        }));
    };
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') {
      console.log('Invalid data for CustomGraphChart');
      return [];
    }
  
        // State to manage which lines are visible


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
      const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
      return shareSlotCanale.toFixed(2);

    };
    
    const formattedData = [];

    // Iterate through each time slot
    Object.keys(data).forEach(timeSlot => {
      // Create a data object for the current time slot
      const timeSlotData = { name: timeSlot };
      if ((timeSlot !== "06:00 - 23:59")&&(timeSlot !== "00:00 - 23:59")) {
      // Iterate through each radio station within the time slot
      Object.entries(data[timeSlot]).forEach(([radioStation]) => {
        // Convert the value to a number
        // const numericValue = parseInt(value, 10);
        // Add the radio station and its numeric value to the data object
        const shareslotcanale = calculateShareSlotCanale(radioStation,timeSlot);
        timeSlotData[radioStation] = parseFloat(shareslotcanale).toFixed(0);
      });

      // Push the data object to the formattedData array
      formattedData.push(timeSlotData);
      }
    });
    formattedData.sort((a, b) => {
      // Extract start times
      const startTimeA = a.name.split(' - ')[0];
      const startTimeB = b.name.split(' - ')[0];
    
      // Convert start times to minutes since start of the day
      const minutesA = parseInt(startTimeA.split(':')[0], 10) * 60 + parseInt(startTimeA.split(':')[1], 10);
      const minutesB = parseInt(startTimeB.split(':')[0], 10) * 60 + parseInt(startTimeB.split(':')[1], 10);
    
      // Compare the minutes to sort
      return minutesA - minutesB;
    });
    return formattedData;
  }, [data,importantChannels,intervalValue]);

  
  // Generate lines for each radio station with toggle functionality
// Correctly render lines based on visibility
const lines = Object.keys(data[Object.keys(data)[0]] || {}).map(radioStation => (
    <Line
        key={radioStation}
        type="monotone"
        dataKey={radioStation}
        stroke={RADIOSTATIONCOLORS[radioStation]}
        hide={!visibleLines[radioStation]} // Use hide prop to control visibility
    />
));

  return (
    <ResponsiveContainer key={activeButton} width="100%" height={400}>
    <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} orientation="right" />
        <Tooltip />
        <Legend onClick={(e) => toggleLineVisibility(e.value)} />
        {lines}
    </LineChart>
    </ResponsiveContainer>
  );
};
  // PropTypes validation
GraphChartArr.propTypes = {
    data: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
    intervalValue: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    importantChannels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    tipoRadioTV: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    activeButton: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  };
  export default GraphChartArr;