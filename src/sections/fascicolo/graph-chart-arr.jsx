import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

const GraphChartArr = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') {
      console.log('Invalid data for CustomGraphChart');
      return [];
    }
  

    const formattedData = [];

    // Iterate through each time slot
    Object.keys(data).forEach(timeSlot => {
      // Create a data object for the current time slot
      const timeSlotData = { name: timeSlot };

      // Iterate through each radio station within the time slot
      Object.entries(data[timeSlot]).forEach(([radioStation, value]) => {
        // Convert the value to a number
        const numericValue = parseInt(value, 10);
        // Add the radio station and its numeric value to the data object
        timeSlotData[radioStation] = numericValue;
      });

      // Push the data object to the formattedData array
      formattedData.push(timeSlotData);
    });

    return formattedData;
  }, [data]);

  
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
    'ALTRERADIO': '#AAAAAA'
  };
  
  
  // Generate lines for each radio station
  const lines = Object.keys(data[Object.keys(data)[0]]).map((radioStation, index) => (
    <Line key={radioStation} type="monotone" dataKey={radioStation} stroke={`${radioStationColors[radioStation]}`} />
  ));

  return (
    <ResponsiveContainer  width="90%" height={400}>
      <LineChart  data={chartData}>
        <CartesianGrid  strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis   domain={[0, 'dataMax + 10']} orientation="right" />
        <Tooltip />
        <Legend />
        {lines}
      </LineChart>
    </ResponsiveContainer>
  );
};
  // PropTypes validation
GraphChartArr.propTypes = {
    data: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
  };
  export default GraphChartArr;