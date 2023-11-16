import axios from "axios";
import {useState, useEffect} from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import AcrTableRow from '../acr-table-row';
import AcrTableHead from '../acr-table-head';
import {SERVER_URL} from "../../../utils/consts";
import TableEmptyRows from '../table-empty-rows';
import AcrTableToolbar from '../acr-table-toolbar';
import {emptyRows, applyFilter, getComparator} from '../utils';

// ----------------------------------------------------------------------

export default function AcrView() {
    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('asc');

    const [selected, setSelected] = useState([]);

    const [orderBy, setOrderBy] = useState('name');

    const [filterName, setFilterName] = useState('');

    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [acrResults, setACRResults] = useState([]);

    useEffect(() => {
        fetchACRResults();
    }, []);

    const fetchACRResults = async () => {
        const result = (await axios.post(`${SERVER_URL}/getACRResults`)).data;
        console.log(result.acrResults);
        setACRResults(result.acrResults);
    };

    const handleSort = (event, id) => {
        const isAsc = orderBy === id && order === 'asc';
        if (id !== '') {
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(id);
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = acrResults.map((n) => n.title);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    const handleFilterByName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };

    const dataFiltered = applyFilter({
        inputData: acrResults,
        comparator: getComparator(order, orderBy),
        filterName,
    });

    const notFound = !dataFiltered.length && !!filterName;

    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                ACR Results
            </Typography>

            <Card>
                <AcrTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                />

                <Scrollbar>
                    <TableContainer sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            <AcrTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={acrResults.length}
                                numSelected={selected.length}
                                onRequestSort={handleSort}
                                onSelectAllClick={handleSelectAllClick}
                                headLabel={[
                                    {id: 'title', label: 'Title'},
                                    {id: 'total_count', label: 'Total count'},
                                    {id: 'user_count', label: 'User count',},
                                    {id: 'phone_count', label: 'Phone count'},
                                    {id: '', label: 'Status'}
                                ]}
                            />
                            <TableBody>
                                {dataFiltered
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <AcrTableRow
                                            key={row._id}
                                            title={row.title}
                                            total_count={row.total_count}
                                            status='success'
                                            user_count={row.user_count}
                                            phone_count={row.phone_count}
                                            selected={selected.indexOf(row.title) !== -1}
                                            handleClick={(event) => handleClick(event, row.title)}
                                        />
                                    ))}

                                <TableEmptyRows
                                    height={77}
                                    emptyRows={emptyRows(page, rowsPerPage, acrResults.length)}
                                />

                                {notFound && <TableNoData query={filterName}/>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    page={page}
                    component="div"
                    count={acrResults.length}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        </Container>
    );
}
