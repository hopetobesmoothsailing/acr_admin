import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList as List } from 'react-window';

import {Paper, Table, TableRow,TableHead,  TableCell, TableContainer  } from '@mui/material';

// A custom row renderer for react-window
const RenderRow = ({ index, style, data }) => {
  const row = data[index];
  return (
    <TableRow style={style} component="div">
      {/* Adjust these cells according to your data structure */}
      <TableCell component="div">{row.id}</TableCell>
      <TableCell component="div">{row.name}</TableCell>
      {/* Add more cells as needed */}
    </TableRow>
  );
};

// The virtualized table component
const VirtualizedTable = ({ rows }) => {
  // Define row height and table height
  const rowHeight = 50;
  const tableHeight = 400;

  return (
    <TableContainer component={Paper} style={{ maxHeight: tableHeight }}>
      <Table stickyHeader aria-label="sticky table" component="div">
        <TableHead component="div">
          <TableRow component="div">
            {/* Adjust these headers according to your table's columns */}
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            {/* Add more headers as needed */}
          </TableRow>
        </TableHead>
        <List
          height={tableHeight}
          itemCount={rows.length}
          itemSize={rowHeight}
          width="100%"
          itemData={rows} // Pass the rows as item data
        >
          {RenderRow}
        </List>
      </Table>
    </TableContainer>
  );
};

RenderRow.propTypes = {
    index: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    style: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    data: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    
  };
  VirtualizedTable.propTypes = {
    rows: PropTypes.any.isRequired, // Validate userListeningMap as an object and is required
    
  };

 export default VirtualizedTable
