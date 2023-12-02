import React from 'react';
import PropTypes from 'prop-types';

import { Table, TableRow, TableBody, TableCell,TableHead, TableContainer } from '@mui/material';



const FascicoloTable = ({ data }) => {
  // Filter data based on the recorded_at time slot
  const filteredData = data.filter(
    (item) =>
      new Date(item.recorded_at).getHours() >= 2 &&
      new Date(item.recorded_at).getHours() < 7
  ); // Adjust the time slot filter logic as needed

  // Group data by acr_result field
  const groupedData = filteredData.reduce((acc, currentValue) => {
    const key = currentValue.acr_result;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(currentValue);
    return acc;
  }, {});

  // Convert groupedData to an array of objects
  const tableData = Object.keys(groupedData).map((key) => ({
    acr_result: key,
    data: groupedData[key],
  }));
  console.log(data)
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ACR RISULTATI</TableCell>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.acr_result}</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

FascicoloTable.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        user_id: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        imei: PropTypes.string.isRequired,
        model: PropTypes.string.isRequired,
        brand: PropTypes.string.isRequired,
        acr_result: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        longitude: PropTypes.string.isRequired,
        latitude: PropTypes.string.isRequired,
        location_address: PropTypes.string.isRequired,
        recorded_at: PropTypes.string.isRequired,
        registered_at: PropTypes.string.isRequired,
        __v: PropTypes.number,
        // Define other fields and their types based on your data structure
      })
    ).isRequired,
  };
export default FascicoloTable;