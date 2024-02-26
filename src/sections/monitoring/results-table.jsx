import React from 'react';
import PropTypes from 'prop-types';
// import React, { useState,useEffect  } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

const ResultsTable = ({ parsedRecords,fileName }) =>{ 
/* const [processedData,setProcessedData]= useState();
 const deduplicateRecords = (records) => {
  const seen = new Set();
  return records.flatMap(record =>
    record.data.flatMap(entry => {
      const { customFiles, music } = entry.metadata;
      return [...customFiles, ...music].filter(item => {
        const key = `${entry.metadata.timestamp_utc}_${item.title}`;
        let flag = false;
        if (seen.has(key)) {
          flag = false;
        } else {
          seen.add(key);
          flag = true;
        }
        return flag
      }).map(item => ({
        ...entry,
        metadata: {
          ...entry.metadata,
          custom_files: customFiles.includes(item) ? [item] : [],
          music: music.includes(item) ? [item] : [],
        }
      }));
    })
  );
};

useEffect(() => {
  if (parsedRecords) {
    const deduplicatedRecords = deduplicateRecords(parsedRecords);
    setProcessedData(deduplicatedRecords);
  }
}, [parsedRecords]);
*/
function convertMillisecondsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds %=  60;
  minutes %= 60;

  // Padding with zero if necessary
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

// Example usage

if (parsedRecords) { 
  return (
    <Card>
  
                
    <TableContainer id={fileName} component={Paper}>
      
      <Table sx={{ minWidth: 650 }} aria-label="parsed records table">
        <TableHead>
          <TableRow>
            <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Data e Ora</TableCell>  
            <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Canale</TableCell>  
            <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Elemento riconoscimento</TableCell>
            <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Artists/Source</TableCell> 
            <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Durata (ms)</TableCell>
            { /* <TableCell>Score</TableCell> */ }
            { /* <TableCell>Type</TableCell> */ }
          </TableRow>
        </TableHead>
        <TableBody>
          {parsedRecords.map((record) => (
            record.data.map((entry, index) => (
              <React.Fragment key={`${record._id}-${index}`}>
                {(entry.metadata.custom_files || []).map((customFile, cfIndex) => (
                  <TableRow key={`cf-${record._id}-${cfIndex}`}>
                    <TableCell>
                      {new Intl.DateTimeFormat('it-IT', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false,
                        timeZone: 'Europe/Rome'
                      }).format(new Date(entry.metadata.timestamp_utc))}
                    </TableCell>
                    <TableCell>{record.channel}</TableCell>
                    { /* <TableCell>{entry.metadata.timestamp_utc}</TableCell> */}
                    <TableCell>{customFile.title}</TableCell>
                    <TableCell>Personalizzato</TableCell>  
                    <TableCell>{convertMillisecondsToTime(customFile.duration_ms)}</TableCell>
                    { /* <TableCell>{customFile.score}</TableCell> */ }
                    { /* <TableCell>{entry.metadata.type}</TableCell> */ }
                  </TableRow>
                ))}
                { (entry.metadata.music || []).map((music, musicIndex) => (
                  <TableRow key={`music-${record._id}-${musicIndex}`}>
                    <TableCell>
                      {new Intl.DateTimeFormat('it-IT', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false,
                        timeZone: 'Europe/Rome'
                      }).format(new Date(entry.metadata.timestamp_utc))}
                    </TableCell>
                    <TableCell>{record.channel}</TableCell>
                    <TableCell>{music.title}</TableCell>
                    <TableCell>{music.artists.map((artist) => artist.name).join(', ')}</TableCell>
                    <TableCell>{convertMillisecondsToTime(music.duration_ms)}</TableCell>
                    { /* <TableCell>{entry.metadata.type}</TableCell> */} 
                  </TableRow>
                )) }
              </React.Fragment>
            ))
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Card>
  );
    }
    return [];
                            };
// PropTypes validation
ResultsTable.propTypes = {
  parsedRecords: PropTypes.any, // Validate userListeningMap as an object and is required
  fileName: PropTypes.any, // Validate userListeningMap as an object and is required
};

export default ResultsTable;