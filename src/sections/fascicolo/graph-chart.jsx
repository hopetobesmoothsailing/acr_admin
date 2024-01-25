import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Line,XAxis, YAxis,Legend, Tooltip, LineChart,  CartesianGrid,  ResponsiveContainer } from 'recharts';

const GraphChart = ({ userListeningMap, intervalValue }) => {
    const chartData = useMemo(() => {
      // Check if userListeningMap exists and has length before mapping
      if (!userListeningMap || userListeningMap.length === 0) {
        return []; // Return empty array if userListeningMap is undefined or empty
      }
      return userListeningMap.map(data => ({
        name: data.channel,
        value: data.value
      }));
    }, [userListeningMap]);
  
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    );
  };
// PropTypes validation
GraphChart.propTypes = {
    userListeningMap: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
    intervalValue: PropTypes.number.isRequired, // Validate intervalValue as a number and is required
  };
export default GraphChart;
