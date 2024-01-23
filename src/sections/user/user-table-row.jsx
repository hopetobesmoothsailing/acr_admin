import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  name,
  avatarUrl,
  appVersion,
  gender,
  role,
  age,
  status,
  handleClick,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const today = new Date(); // Get today's date
  const yesterday = new Date(today); // Create a new date object with today's date
  yesterday.setDate(today.getDate() - 1); // Set it to yesterday

  // Format the date to DD/MM/YYYY
  const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}-${(
    yesterday.getMonth() + 1
  ).toString().padStart(2, '0')}-${yesterday.getFullYear()}`;

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
            <a title="visualizza dettaglio risultati utente" href={`risdettagli?date=${formattedYesterday}&userId=${role}`}>{name}</a>
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{gender}</TableCell>

        <TableCell>
          <Label color={(age === 'non attivata' && 'error') || 'primary'}>{age}</Label>
        </TableCell>
        <TableCell>{appVersion} </TableCell>

        <TableCell>{role} </TableCell>

        <TableCell>
          <Label color={(status === 'no' && 'error') || 'success'}>{status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        
        <MenuItem onClick={handleCloseMenu}>
          <a href={`risdettagli?date=${formattedYesterday}&userId=${role}`}>        <Iconify icon="eva:list-fill" sx={{ mr: 2 }} />Risultati</a>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  gender: PropTypes.any,
  handleClick: PropTypes.func,
  age: PropTypes.any,
  name: PropTypes.any,
  appVersion: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
};
