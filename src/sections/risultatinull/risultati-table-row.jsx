import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function RisultatiTableRow({
    selected,
    title,
    date,
    total_count,
    user_count,
    phone_count,
    status,
    handleClick,
}) {

    return (
        <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox disableRipple checked={selected} onChange={handleClick}/>
            </TableCell>

            <TableCell component="th" scope="row" padding="none">
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle2" noWrap>
                        {title}
                    </Typography>
                </Stack>
            </TableCell>

            <TableCell>{date}</TableCell>

            <TableCell>{total_count}</TableCell>

            <TableCell>{user_count}</TableCell>

            <TableCell>{phone_count}</TableCell>

            <TableCell>
                <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
            </TableCell>
        </TableRow>
    );
}

RisultatiTableRow.propTypes = {
    title: PropTypes.any,
    date: PropTypes.any,
    total_count: PropTypes.any,
    handleClick: PropTypes.func,
    user_count: PropTypes.any,
    phone_count: PropTypes.any,
    selected: PropTypes.any,
    status: PropTypes.string,
};
