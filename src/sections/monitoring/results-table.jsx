import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

const ResultsTable = ({ parsedRecords, fileName }) => {
  const deduplicateRecords = (records) => {
    const deduplicated = [];
    const uniqueKeys = new Set();

    records.forEach((record) => {
      record.data.forEach((entry) => {
        const processEntry = (item, type) => {
          // For music, use artist names as part of the key, otherwise, use an empty string
          // const artistNames = type === 'music' ? item.artists.map(artist => artist.name).join(',') : '';
          const key = `${entry.metadata.timestamp_utc}`;

          if (!uniqueKeys.has(key)) {
            uniqueKeys.add(key);
            deduplicated.push({
              ...entry,
              metadata: {
                ...entry.metadata,
                custom_files: type === 'custom' ? [item] : [],
                music: type === 'music' ? [item] : [],
              },
              channel: record.channel,
            });
          }
        };

        (entry.metadata.custom_files || []).forEach(customFile => processEntry(customFile, 'custom'));
        (entry.metadata.music || []).forEach(music => processEntry(music, 'music'));
      });
    });

    return deduplicated;
  };

  const flattenedAndDeduplicatedRecords = deduplicateRecords(parsedRecords);

  const convertMillisecondsToTime = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    seconds %= 60;
    minutes %= 60;

    // Padding with zero if necessary
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  };

  // Define background colors for custom and music rows
  const customFileRowColor = '#f7fa207a'; // Light grey for custom files
  const musicFileRowColor = '#f3f3f3'; // Light blue for music files

  
  if (flattenedAndDeduplicatedRecords.length > 0) {
    return (
      <Card>
        <TableContainer id={fileName} component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="parsed records table">
            <TableHead>
              <TableRow>
                <TableCell style={{ backgroundColor: "#006097", color: "#FFF" }}>Data e Ora</TableCell>
                <TableCell style={{ backgroundColor: "#006097", color: "#FFF" }}>Canale</TableCell>
                <TableCell style={{ backgroundColor: "#006097", color: "#FFF" }}>Elemento riconoscimento</TableCell>
                <TableCell style={{ backgroundColor: "#006097", color: "#FFF" }}>Artists/Source</TableCell>
                <TableCell style={{ backgroundColor: "#006097", color: "#FFF" }}>Durata (ms)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flattenedAndDeduplicatedRecords.map((entry, index) => (
                <TableRow style={{
                  backgroundColor: entry.metadata.custom_files[0] ? customFileRowColor : musicFileRowColor,
                }}  key={`${entry.metadata.timestamp_utc}-${index}`}>
                  <TableCell>
                    {new Intl.DateTimeFormat('it-IT', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                      hour12: false,
                      timeZone: 'Europe/Rome'
                    }).format(new Date(entry.metadata.timestamp_utc))}
                  </TableCell>
                  <TableCell>{entry.channel}</TableCell>
                  <TableCell>{(entry.metadata.custom_files[0] || entry.metadata.music[0]).title}</TableCell>
                  <TableCell>
                    {entry.metadata.music[0] ? entry.metadata.music[0].artists.map(artist => artist.name).join(', ') : 'Personalizzato'}
                  </TableCell>
                  <TableCell>{convertMillisecondsToTime((entry.metadata.custom_files[0] || entry.metadata.music[0]).duration_ms)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  }

  return null;
};

// PropTypes validation
ResultsTable.propTypes = {
  parsedRecords: PropTypes.array.isRequired,
  fileName: PropTypes.string.isRequired,
};

export default ResultsTable;
