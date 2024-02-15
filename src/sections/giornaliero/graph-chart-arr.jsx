/* eslint-disable dot-notation */
import PropTypes from 'prop-types';
import React, { useMemo,useState } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import CustomTooltip from './custom-tooltip';

const GraphChartArr = ({ data,intervalValue,channels,channel_name,userListeningMap,idToWeightMap}) => {
  // Initially set "share" to true and others to false
  const [visibleLines, setVisibleLines] = useState({
    share: true,
    contatti: false,
    amr: false,
  });

  // Function to toggle visibility of lines
  const toggleLineVisibility = (dataKey) => {
    setVisibleLines((prevVisibleLines) => ({
      ...prevVisibleLines,
      [dataKey]: !prevVisibleLines[dataKey],
    }));
  };
  const chartData = useMemo(() => {
   
    if (!data || typeof data !== 'object') {
      console.log('Invalid data for CustomGraphChart');
      return [];
    }
  
    
  const calculateContatti= (channel, slot) => {
      // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
      const uniqueUsersListening = userListeningMap[channel]?.[slot]||'';
      let somma = 0;
      // console.log("UNIQUE:",uniqueUsersListening);
      if (uniqueUsersListening){
      uniqueUsersListening.forEach(utente => {
          if (utente) {
              // console.log("Sommo singola audience utente", idToWeightMap[utente]);     
              somma +=  utente || 0
          }
      });
      }
      somma /= 1000;
      // Calculate the share percentage for the channel in the given time slot
      return somma.toFixed(0);
  };

    const calculateAudience = (channel, slot) => {
      // Placeholder for audience calculation
      const minutoMedio = data[slot][channel] || 0 ;
      // console.log("MINUTO:", minutoMedio);
      const audienceByMinute = (minutoMedio/intervalValue)/1000;
      return audienceByMinute.toFixed(1);  
    };

    /* const calculateContacts = (channel,slot) => {
      let totalWeightedContacts = 0;
    
      // Check if there's data for the given channel
      if (userListeningMap[channel]) {
        const timeSlots = userListeningMap[channel];
       // console.log("CONTATTITIMESLOTs",timeSlots);
      // Iterate through each time slot for the current radio station
        Object.keys(timeSlots).forEach(interval => {
          userListeningMap[channel][slot]?.forEach(weight => {
              totalWeightedContacts += weight;
             
          });
          // Add or update data for the current radio station within the interval

        });
        // Iterate over each time slot in the channel

      }
    
      return (totalWeightedContacts/1000).toFixed(1);
    };
    
    */
    

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
      return shareSlotCanale.toFixed(1);

    };
    // Iterate through each time slot
    const formattedData = Object.keys(data).map(timeSlot => {
      const share = calculateShareSlotCanale(channel_name, timeSlot);
      const amr = calculateAudience(channel_name, timeSlot);
      const contatti = calculateContatti(channel_name, timeSlot);

      return {
        name: timeSlot,
        share: parseFloat(share),
        amr,
        contatti
      };
    });

    return formattedData;
  }, [data,intervalValue,channels,channel_name,userListeningMap]);

  // Assuming 'chartData' is your dataset array and you want to calculate for 'audience'
  const maxAudience = chartData.reduce((max,dati) => {
    const maxma = Math.max(max, dati.amr);
    console.log("MAXMA",maxma);
    // Assuming 'audience' values are stored under the key 'audience' in your data objects
    return maxma;
  }, 0);

  // Add a buffer to the max value, adjust the buffer size based on your needs
  const buffer = 50; // Or any other logic to determine an appropriate buffer
  const maxDomainValue = maxAudience + buffer;
  
  

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <Legend onClick={(e) => toggleLineVisibility(e.value)} />
    
        <Tooltip content={CustomTooltip} />
        <XAxis dataKey="name" />
        
    {/* YAxis for Share */}
    <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="green"
          label={{ value: 'Share (%)', angle: -90, position: 'insideLeft' }}
          domain={[0, 100]} // Assuming Share values are percentages
        /> 

        {/* YAxis for Contacts */}
        <YAxis 
          yAxisId="middle" 
          orientation="right" 
          stroke="orange"
          label={{ value: 'Contatti (M)', angle: -90, position: 'insideRight' }}
          domain={[0, 'dataMax + 1000']}
          scale="linear"
          tickFormatter={(tick) => `${tick / 1000}M`}
        />

        {/* YAxis for Audience */}
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#ff0000"
          label={{ value: 'AMR (K)', angle: -90, position: 'insideRight', offset: 10 }}
          domain={[0, maxDomainValue]}
          scale="linear"
          
          tickFormatter={(tick) => `${tick}K`}
          axisLine={{ stroke: '#ff0000' }}
          tickLine={{ stroke: '#ff0000' }}
        />

        {/* Lines for each data type */}
        <Line type="monotone" dataKey="share" hide={!visibleLines['share']} stroke="green" yAxisId="left" />
        <Line type="monotone" dataKey="contatti" hide={!visibleLines['contatti']} stroke="orange" yAxisId="middle" />
        <Line type="monotone" dataKey="amr" hide={!visibleLines['amr']} stroke="#ff0000" yAxisId="right" />      
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