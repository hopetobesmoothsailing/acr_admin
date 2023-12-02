import React from 'react';

import { Table, TableRow, TableBody, TableCell,TableHead, TableContainer } from '@mui/material';

const columns = [
  {
    id: 'Network',
    label: 'Network',
  },
  {
    id: '0200',
    label: '02:00 - 02:59',
  },
  {
    id: '0700',
    label: '07:00 - 09:00',
  },
  {
    id: '0900',
    label: '09:00 - 12:00',
  },
  {
    id: '1200',
    label: '12:00 - 15:00',
  },
  {
    id: '1500',
    label: '15:00 - 18:00',
  },
  {
    id: '1800',
    label: '18:00 - 20:30',
  },
  {
    id: '2030',
    label: '20:30 - 22:30',
  },
  {
    id: '2230',
    label: '22:30 - 25:59',
  },
  {
    id: 'Share',
    label: 'Share',
  },
];

const data = [
  {
    Network: 'Rai 1',
    '02-00': 22.23,
    '07-00': 7.53,
    '09-00': 14.11,
    '12-00': 21.39,
    '15-00': 17.58,
    '18-00': 18.81,
    '20-30': 24.04,
    '22-30': 35.68,
    Share: 15.33,
  },
  {
    Network: 'Rai 2',
    '02-00': 22.23,
    '07-00': 7.53,
    '09-00': 14.11,
    '12-00': 21.39,
    '15-00': 17.58,
    '18-00': 18.81,
    '20-30': 24.04,
    '22-30': 35.68,
    Share: 5.05,
  },
  // ... other rows
];

const ShareTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.Network}>
              {columns.map((column) => (
                <TableCell key={column.id}>{row[column.id]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  
  export default ShareTable;