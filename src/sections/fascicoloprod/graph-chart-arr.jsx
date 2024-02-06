import PropTypes from 'prop-types';
import React, { useMemo,useState } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

const GraphChartArr = ({ data,intervalValue,importantChannels }) => {
    const initiallyVisibleChannels = ['RAIRadio1', 'RAIRadio2', 'RAIRadio3'];
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
      if (channel === "RDS") {
      console.log("GRAPH_CH:",channel);
      console.log("GRAPH_SLOT:",slot);
      console.log("GRAPH_ABM:",audienceByMinute);
      console.log("GRAPH_ASC:",audienceSlotCanali);
      }
      const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
      return shareSlotCanale.toFixed(2);

    };
    
    const formattedData = [];

    // Iterate through each time slot
    Object.keys(data).forEach(timeSlot => {
      // Create a data object for the current time slot
      const timeSlotData = { name: timeSlot };
      if (timeSlot !== "06:00 - 23:59") {
      // Iterate through each radio station within the time slot
      Object.entries(data[timeSlot]).forEach(([radioStation]) => {
        // Convert the value to a number
        // const numericValue = parseInt(value, 10);
        // Add the radio station and its numeric value to the data object
        const shareslotcanale = calculateShareSlotCanale(radioStation,timeSlot);
        timeSlotData[radioStation] = shareslotcanale;
      });

      // Push the data object to the formattedData array
      formattedData.push(timeSlotData);
      }
    });

    return formattedData;
  }, [data,importantChannels,intervalValue]);

  
  const radioStationColors = {
    'RadioDeejay': '#E53935',
    'RAIRadio1': '#D81B60',
    'RAIRadio2': '#8E24AA',
    'RAIRadio3': '#5E35B1',
    'RAIIsoradio': '#3949AB',
    'RDS': '#1E88E5',
    'RTL': '#039BE5',
    'Radio24': '#00ACC1',
    'RadioM2O': '#00897B',
    'RADIOSUBASIO': '#43A047',
    'RADIOBELLAEMONELLA': '#C0CA33',
    'RADIOITALIAANNI60': '#FDD835',
    'RADIOKISSKISS': '#FFB300',
    'RADIOKISSKISSNAPOLI': '#FB8C00',
    'RADIOKISSKISSITALIA': '#F4511E',
    'RadioFRECCIA': '#6D4C41',
    'RadioIBIZA': '#757575',
    'RadioCapital': '#546E7A',
    'R101': '#26A69A',
    'VIRGINRadio': '#EC407A',
    'RADIOMONTECARLO': '#AB47BC',
    'Radio105': '#7E57C2',
    'RadioZETA': '#5C6BC0',
    'RadioBRUNO': '#42A5F5',
    'RadioItaliaSMI': '#29B6F6',
    'RAI1': '#5C6BC0',
    'RAI2': '#D81B60',
    'RAI3': 'green',
    'RETE4': '#3949AB',
    'CANALE5': 'orange',
    'ITALIA1': '#42A5F5',
    'LA7': '#C0CA33',

    'ALTRERADIO': '#AAAAAA'
  };
 
  
  // Generate lines for each radio station with toggle functionality
// Correctly render lines based on visibility
const lines = Object.keys(data[Object.keys(data)[0]] || {}).map(radioStation => (
    <Line
        key={radioStation}
        type="monotone"
        dataKey={radioStation}
        stroke={radioStationColors[radioStation]}
        hide={!visibleLines[radioStation]} // Use hide prop to control visibility
    />
));

  return (
    <ResponsiveContainer width="100%" height={400}>
    <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 'dataMax + 10']} orientation="right" />
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
  };
  export default GraphChartArr;