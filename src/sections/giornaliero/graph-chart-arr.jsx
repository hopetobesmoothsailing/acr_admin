import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

const GraphChartArr = ({ data,intervalValue,channels,channel_name,userListeningMap,idToWeightMap}) => {
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') {
      console.log('Invalid data for CustomGraphChart');
      return [];
    }
  
    
   
    const calculateAudience = (channel, slot) => {
      // Placeholder for audience calculation
      const minutoMedio = data[slot][channel] || 0 ;
      console.log("MINUTO:", minutoMedio);
      const audienceByMinute = (minutoMedio/intervalValue);
      return audienceByMinute.toFixed(1);  
    };

    const calculateContacts = (channel,slot) => {
      let totalWeightedContacts = 0;
    
      // Check if there's data for the given channel
      if (userListeningMap[channel]) {
        const timeSlots = userListeningMap[channel];
      // Iterate through each time slot for the current radio station
        Object.keys(timeSlots).forEach(interval => {
          // console.log("ULMAP",userListeningMap[channel][interval]);
          userListeningMap[channel][interval].forEach(userId => {
            if (interval.toString() === slot.toString()) {
            // Iterate over each user ID in the time slot
              const weight = idToWeightMap[userId] || 1; // Get the weight for the user, default to 1 if not found
              totalWeightedContacts += weight;
            }
          
          });
          // Add or update data for the current radio station within the interval

        });
        // Iterate over each time slot in the channel

      }
    
      return totalWeightedContacts;
    };
    
    
    

    const calculateShareSlotCanale = (channel, slot) => {
      let audienceSlotCanali = 0
      // console.log("channels",channels)
      // console.log("data",data)
      // console.log("slot",slot)
      channels.forEach(canalealtro => {
          if ((canalealtro !== "NULL")) {
            // console.log("canalealtro",data[slot][canalealtro]);
              audienceSlotCanali += parseFloat(data[slot][canalealtro] || 0)
          }
      });
      const minuto =data[slot][channel] || 0 ;
      // come indicato da cristiano corrisponde ai minuti totali di ascolto nel periodo e non minuti * utenti
      // const audienceByMinute = minuto*(uniqueUsersListening*pesoNum);
      const audienceByMinute = minuto;
      console.log("MINUTO",minuto)
      const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
      return shareSlotCanale.toFixed(2);

    };
    // Iterate through each time slot
    const formattedData = Object.keys(data).map(timeSlot => {
      const share = calculateShareSlotCanale(channel_name, timeSlot);
      const audience = calculateAudience(channel_name, timeSlot);
      const contacts = calculateContacts(channel_name, timeSlot);

      return {
        name: timeSlot,
        share: parseFloat(share),
        audience,
        contacts
      };
    });

    return formattedData;
  }, [data,intervalValue,channels,channel_name,userListeningMap,idToWeightMap]);

  

  
  

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        
        <YAxis 
          yAxisId="left"
          domain={[0, 'dataMax + 10']}
          allowDataOverflow
          orientation="left"
          stroke="green"
        />
        <YAxis 
          yAxisId="right"
          domain={[0, 'dataMax + 10']}
          allowDataOverflow
          orientation="right"
          stroke="red"
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="audience" stroke="red" yAxisId="right"/>
        <Line type="monotone" dataKey="share" stroke="green" yAxisId="left" />
        <Line type="monotone" dataKey="contacts" stroke="orange" yAxisId="right" />
      </LineChart>
    </ResponsiveContainer>
  );
};
  // PropTypes validation
GraphChartArr.propTypes = {
    data: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
    intervalValue: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    channels:PropTypes.array.isRequired,
    idToWeightMap:PropTypes.any.isRequired,
    userListeningMap:PropTypes.any.isRequired,
    channel_name: PropTypes.any.isRequired
  };
  export default GraphChartArr;