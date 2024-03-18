import PropTypes from 'prop-types';
import React, { useMemo,useState,useEffect } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import CustomTooltip from './custom-tooltip';
import {RADIOSTATIONCOLORS} from "../../utils/consts";
// import Button  from '@mui/material/Button';

const GraphChartContatti = ({ userListeningMapWeight,tipoRadioTV,activeButton,idToWeightMap,importantChannels}) => {
  let initiallyVisibleChannels = ['RAIRadio1', 'RAIRadio2', 'RAIRadio3'];
  if (tipoRadioTV === "TV") {
    initiallyVisibleChannels = ['RAI1', 'RAI2', 'RAI3'];
  }
  // Initialize visibleLines based on the initiallyVisibleChannels
  const [visibleLines, setVisibleLines] = useState(() => {
    const initialVisibility = {};
    // Assuming userListeningMap keys directly correspond to the channels
    Object.keys(userListeningMapWeight).forEach(channel => {
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


  const chartData = useMemo(() => {
    const data = [];
    const slotData = {};
    Object.keys(userListeningMapWeight).forEach(channel => {
      Object.keys(userListeningMapWeight[channel]).forEach(slot => {
        if (!['00:00 - 23:59', '06:00 - 23:59'].includes(slot)) {
          // const isImportantChannel = importantChannels.includes(channel);
          // const channelKey = isImportantChannel ? channel : 'ALTRERADIO';
          
          // Initialize slot in slotData if not already done
          slotData[slot] = slotData[slot] || { name: slot };

          // Initialize channel data in the slot if not already done
          slotData[slot][channel] = slotData[slot][channel] || 0;

          const dati = userListeningMapWeight[channel][slot];
          // let ar = 0;
          if (dati) {
            dati.forEach((item) => {
                const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                /* if ((channel === "RTL")&&(slot === '06:00 - 08:59')) {
                    console.log("ar:item", item);
                    console.log("ar:item_weight", pesoitem);
                } */
                // ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
                slotData[slot][channel] += pesoitem;
            });
          }
          data.push({
            name: slot,
            [channel]: slotData[slot][channel],
          });
        }
      });
    });

    // Sort data based on the start time of each slot
    data.sort((a, b) => {
      const getMinutes = time => parseInt(time.split(':')[0], 10) * 60 + parseInt(time.split(':')[1], 10);
      const minutesA = getMinutes(a.name.split(' - ')[0]);
      const minutesB = getMinutes(b.name.split(' - ')[0]);
      return minutesA - minutesB;
    });

    // Deduplicate entries by combining data with the same time slot
    const deduplicatedData = [];
    data.forEach(item => {
      const existingEntry = deduplicatedData.find(entry => entry.name === item.name);
      if (existingEntry) {
        Object.keys(item).forEach(key => {
          if (key !== 'name') {
            existingEntry[key] = ((existingEntry[key] || 0) + item[key]);
          }
        });
      } else {
        deduplicatedData.push({ ...item });
      }
    });

    return deduplicatedData;
  }, [userListeningMapWeight,idToWeightMap]);


  const importantLines = importantChannels.map(radioStation => {
    if (userListeningMapWeight[radioStation]) { // Check if data exists for the station
      return (
        <Line
          key={radioStation}
          type="monotone"
          dataKey={radioStation}
          hide={!visibleLines[radioStation]}
          stroke={RADIOSTATIONCOLORS[radioStation]}
        />
      );
    }
    return null; // Return null for channels without data (these will be filtered out)
  }).filter(line => line !== null); // Remove null entries (no data channels)

  const altreradioLine = (
    <Line
      key="ALTRERADIO"
      type="monotone"
      dataKey="ALTRERADIO"
      hide={!visibleLines.ALTRERADIO}
      stroke={RADIOSTATIONCOLORS.ALTRERADIO || "#333"} // Fallback color if not defined
    />
  );

  // Generate lines for each radio station
  const lines = [...importantLines, altreradioLine];

  useEffect(() => {
    const resizeEvent = window.document.createEvent('UIEvents'); 
    resizeEvent.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(resizeEvent);
  }, [activeButton]); // Dependency on the state that toggles visibility

  // Assuming 'chartData' is your dataset array and you want to calculate for 'audience'
  /* const maxAudience = chartData.reduce((max,dati) => {
    const maxma = Math.max(max, dati.amr);
    // console.log("MAXC",maxma);
    // Assuming 'audience' values are stored under the key 'audience' in your data objects
    return maxma;
  }, 0);
  */

  // Add a buffer to the max value, adjust the buffer size based on your needs
  // const buffer = 50; // Or any other logic to determine an appropriate buffer
  // const maxDomainValue = maxAudience + buffer;
  // console.log(maxDomainValue);
  return (
      <ResponsiveContainer key={activeButton} width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name"   />
        <YAxis   label={{ value: 'Contatti Netti', angle: -90, position: 'outsideLeft' }}  domain={[0, 'dataMax + 2000000']} orientation="right" />
        <Tooltip content={CustomTooltip} />
       
        <Legend onClick={(e) => toggleLineVisibility(e.value)} />
        {lines}
      </LineChart>
    </ResponsiveContainer>
  );
};

// PropTypes validation
GraphChartContatti.propTypes = {
  userListeningMapWeight: PropTypes.object.isRequired, // Validate userListeningMap as an object and is required
  tipoRadioTV: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  activeButton: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  idToWeightMap: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  importantChannels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
};

export default GraphChartContatti;
