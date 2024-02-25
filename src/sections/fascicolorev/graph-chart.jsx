import PropTypes from 'prop-types';
import React, { useMemo,useState,useEffect } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import {RADIOSTATIONCOLORS} from "../../utils/consts";

// import Button  from '@mui/material/Button';

const GraphChart = ({ userListeningMap,tipoRadioTV,activeButton,importantChannels,userListeningMapWeight,intervalValue,nonImportantChannels,timeSlots}) => {
   
  let initiallyVisibleChannels = ['RAIRadio1', 'RAIRadio2', 'RAIRadio3'];
  if (tipoRadioTV === "TV") {
    initiallyVisibleChannels = ['RAI1', 'RAI2', 'RAI3'];
  }
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


  const chartData = useMemo(() => {
    // const data = [];
    const slotData = {};

    const calculateAudienceByMinuteAltre = (slot) => {
        let minutoMedio = 0 ;
        nonImportantChannels.forEach(canalealtre => {
            if ((canalealtre !== "NULL")) {
                  minutoMedio += parseFloat(timeSlots[slot][canalealtre] || 0);
            }
        });
        let audienceByMinute = 0;
        audienceByMinute = minutoMedio/intervalValue;
        let audienceByMinutestr = "*";
        if (audienceByMinute > 0) {
            audienceByMinutestr = audienceByMinute.toFixed(0).toString().replace(".", ",");
        }
        return audienceByMinutestr;
    };   
    Object.keys(userListeningMap).forEach(channel => {
      Object.keys(userListeningMap[channel]).forEach(slot => {
        if (!['00:00 - 23:59', '06:00 - 23:59'].includes(slot)) {
          const isImportantChannel = importantChannels.includes(channel);
          const channelKey = isImportantChannel ? channel : 'ALTRERADIO';
          if (isImportantChannel) {
          // Initialize slot in slotData if not already done
          slotData[slot] = slotData[slot] || { name: slot };

          // Initialize channel data in the slot if not already done
          slotData[slot][channelKey] = slotData[slot][channelKey] || 0;        
          const slotSum = Array.from(userListeningMap[channel][slot]).reduce((sum, value) => sum + value || 0, 0);
          slotData[slot][channelKey] += slotSum;
          }
     
        }
      });
      Object.keys(userListeningMap[channel]).forEach(slot => {
        if (!['00:00 - 23:59', '06:00 - 23:59'].includes(slot)) {
          const isImportantChannel = importantChannels.includes(channel);
          const channelKey = isImportantChannel ? channel : 'ALTRERADIO';
          if (!isImportantChannel) {
            // Initialize slot in slotData if not already done
            slotData[slot] = slotData[slot] || { name: slot };
  
            // Initialize channel data in the slot if not already done
            slotData[slot][channelKey] = slotData[slot][channelKey] || 0;        
            const slotSum = calculateAudienceByMinuteAltre(slot); 
            slotData[slot][channelKey] = slotSum;
          }
        }
      });
    });
    // Convert slotData object to array format expected by the chart
    const aggregatedData = Object.values(slotData).map(slot => {
      // Ensure all data values are integers
      Object.keys(slot).forEach(key => {
        if (key !== 'name') {
          slot[key] = Math.round(slot[key]);
        }
      });
      return slot;
    });
    // Sort data based on the start time of each slot
    aggregatedData.sort((a, b) => {
      const getMinutes = time => parseInt(time.split(':')[0], 10) * 60 + parseInt(time.split(':')[1], 10);
      const minutesA = getMinutes(a.name.split(' - ')[0]);
      const minutesB = getMinutes(b.name.split(' - ')[0]);
      return minutesA - minutesB;
    });

    // Deduplicate entries by combining data with the same time slot
    const deduplicatedData = [];
    aggregatedData.forEach(item => {
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
  }, [userListeningMap,importantChannels,nonImportantChannels,intervalValue,timeSlots]);
  
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

  return (
      <ResponsiveContainer key={activeButton} width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name"   />
        <YAxis domain={[0, 'dataMax + 2000000']} orientation="right" />
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
  tipoRadioTV: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  activeButton: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  importantChannels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  nonImportantChannels: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
  userListeningMapWeight: PropTypes.any.isRequired,
  timeSlots: PropTypes.any.isRequired,
  intervalValue: PropTypes.any.isRequired,
};

export default GraphChart;
