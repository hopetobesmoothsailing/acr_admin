import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

const GraphChart = ({ userListeningMap }) => {
  const chartData = useMemo(() => {
    if (!userListeningMap || typeof userListeningMap !== 'object') {
      console.log('Invalid userListeningMap data');
      return [];
    }

    const data = [];

    // Create a map to store data grouped by intervals
    const intervalDataMap = new Map();

    // Iterate through each radio station
    Object.keys(userListeningMap).forEach(radioStation => {
      const timeSlots = userListeningMap[radioStation];
      // Iterate through each time slot for the current radio station
      Object.keys(timeSlots).forEach(interval => {
        const timeSlot = interval.split(' - ')[0]; // Extracting the start time from the interval
        const intervalLength = timeSlots[interval].size;

        // Check if the interval exists in the intervalDataMap
        if (!intervalDataMap.has(timeSlot)) {
          // If not, create a new entry
          intervalDataMap.set(timeSlot, {});
        }

        // Add or update data for the current radio station within the interval
        intervalDataMap.get(timeSlot)[radioStation] = intervalLength;
      });
    });

    // Convert the intervalDataMap into an array for chart rendering
    intervalDataMap.forEach((intervalData, interval) => {
      const rowData = { name: interval, ...intervalData };
      data.push(rowData);
    });

    console.log("data", data);

    return data;
  }, [userListeningMap]);

  // Generate lines for each radio station
  const lines = Object.keys(userListeningMap).map((radioStation, index) => (
    <Line key={radioStation} type="monotone" dataKey={radioStation} stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
  ));

  return (
    <ResponsiveContainer width="100%" height={800}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
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
