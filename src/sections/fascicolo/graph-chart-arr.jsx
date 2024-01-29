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

  

  
  // Generate lines for each radio station
  const lines = Object.keys(data[Object.keys(data)[0]]).map((radioStation, index) => (
    <Line key={radioStation} type="monotone" dataKey={radioStation} stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
  ));

  return (
    <ResponsiveContainer  width="90%" height={800}>
      <LineChart  data={chartData}>
        <CartesianGrid  strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 33000000]} />
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