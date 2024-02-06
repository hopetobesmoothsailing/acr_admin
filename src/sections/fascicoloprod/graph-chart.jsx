import PropTypes from 'prop-types';
import React, { useMemo,useState } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

const GraphChart = ({ userListeningMap }) => {
  const initiallyVisibleChannels = ['RAIRadio1', 'RAIRadio2', 'RAIRadio3'];

  // Initialize visibleLines based on the initiallyVisibleChannels
  const [visibleLines, setVisibleLines] = useState(() => {
    const initialVisibility = {};
    // Assuming userListeningMap keys directly correspond to the channels
    Object.keys(userListeningMap).forEach(channel => {
        // Channels in initiallyVisibleChannels are set to true, others to false
        initialVisibility[channel] = initiallyVisibleChannels.includes(channel);
    });
    return initialVisibility;
  });

  // Function to toggle the visibility of lines based on legend clicks
  const toggleLineVisibility = (radioStation) => {
      setVisibleLines(prevVisibleLines => ({
          ...prevVisibleLines,
          [radioStation]: !prevVisibleLines[radioStation],
      }));
  };

  const radioStationColors = {
    'RadioDeejay': '#E53935',
    'RAIRadio1': '#D81B60',
    'RAIRadio2': '#8E24AA',
    'RAIRadio3': '#50b235',
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
  const chartData = useMemo(() => {
    if (!userListeningMap || typeof userListeningMap !== 'object') {
      console.log('Invalid userListeningMap data');
      return [];
    }

    const data = [];

    // Create a map to store data grouped by intervals
    const intervalDataMap = new Map();

    Object.keys(userListeningMap).forEach(radioStation => {
      const timeSlots = userListeningMap[radioStation];
      // Iterate through each time slot for the current radio station
      Object.keys(timeSlots).forEach(interval => {
        const timeSlot = interval.split(' - ')[0]; // Extracting the start time from the interval
        const intervalSet = timeSlots[interval]; // Get the set for the current time slot

        // Check if the interval exists in the intervalDataMap
        if (!intervalDataMap.has(timeSlot)) {
          // If not, create a new entry
          intervalDataMap.set(timeSlot, {});
        }

        // Calculate the sum of values in the set for the current time slot
        const intervalSum = Array.from(intervalSet).reduce((sum, value) => sum + value, 0);

        // Add or update data for the current radio station within the interval
        intervalDataMap.get(timeSlot)[radioStation] = intervalSum.toFixed(2);
      });
    });

    // Convert the intervalDataMap into an array for chart rendering
    intervalDataMap.forEach((intervalData, interval) => {
      const rowData = { name: interval, ...intervalData };
      data.push(rowData);
    });

    // console.log("data", data);
    
    return data;
  }, [userListeningMap]);

  // Generate lines for each radio station
  const lines = Object.keys(userListeningMap).map((radioStation, index) => (
    <Line key={radioStation} type="monotone" dataKey={radioStation}        hide={!visibleLines[radioStation]} stroke={radioStationColors[radioStation]}/>
  ));
  
  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend onClick={(e) => toggleLineVisibility(e.value)} />
        {lines}
      </LineChart>
    </ResponsiveContainer>
  );
};

// PropTypes validation
GraphChart.propTypes = {
  userListeningMap: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
};

export default GraphChart;
