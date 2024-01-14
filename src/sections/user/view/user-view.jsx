import axios from "axios";
import {useState, useEffect} from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import ExportExcel from "../export-to-excel"; 
import UserTableHead from '../user-table-head';
import {SERVER_URL} from "../../../utils/consts";
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import {emptyRows, applyFilter, getComparator} from '../utils';


// ----------------------------------------------------------------------

export default function UserPage() {
    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('asc');

    const [selected, setSelected] = useState([]);

    const [orderBy, setOrderBy] = useState('name');

    const [filterName, setFilterName] = useState('');

    const [rowsPerPage, setRowsPerPage] = useState(500);

    const [users, setUsers] = useState([]);
    
    const [detailsUser, setDetailsUser] = useState([]);
    const [details24User, setDetails24User] = useState([]);
    const [idToEmailMap, setIdToEmailMap] = useState({});

    const today = new Date(); // Get today's date
    console.log ("TODAY:",today);
    const startday = new Date("2024-01-09T00:00:00.000Z"); // Create a new date object with today's date
    console.log ("STARTDAY:",startday);
    startday.setDate(startday.getDate()); // Set it to yesterday
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
  
    // Format the date to DD/MM/YYYY
    const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(
      yesterday.getMonth() + 1
    ).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    const formattedStartday = `${startday.getDate().toString().padStart(2, '0')}/${(
        startday.getMonth() + 1
      ).toString().padStart(2, '0')}/${startday.getFullYear()}`;
    
    useEffect(() => {
        const fetchUsers = async () => {
            const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
            setUsers(result.users);
        }
        const fetchDetailUsers = async () => {
            const response = (await axios.post(`${SERVER_URL}/getAppActivatedUsers`, {date: formattedStartday})).data; // Adjust the endpoint to match your server route
            setDetailsUser(response.activeUsers);
        }
        const fetchDetailLast24hoursUsers = async () => {
            const response = (await axios.post(`${SERVER_URL}/getAppActivatedUsers`, {date: formattedYesterday})).data; // Adjust the endpoint to match your server route
            setDetails24User(response.activeUsers);
        }
        fetchUsers();
        fetchDetailUsers();
        fetchDetailLast24hoursUsers();
    }, [formattedYesterday,formattedStartday]);

  

    console.log(detailsUser);
      // Create the mapping of _id to email
    useEffect(() => {
        const idToEmail = {};
        users.forEach(user => {
          idToEmail[user._id] = user.email;
        });
        setIdToEmailMap(idToEmail);
      }, [users]);

      
    const handleSort = (event, id) => {
        const isAsc = orderBy === id && order === 'asc';
        if (id !== '') {
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(id);
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = users.map((n) => n.name);
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
        inputData: users,
        comparator: getComparator(order, orderBy),
        filterName,
    });

    const notFound = !dataFiltered.length && !!filterName;

    function getUserStatus(userId, activeUsers) {
        console.log(activeUsers);
        let ret = "no";
        if (activeUsers.some(user => user._id === userId)) {
          ret = "si";
        } 
        return ret;
         
      }
      function getUserActivated(userId, activeUsers) {
        console.log(activeUsers);
        let ret = "non attivata";
        if (activeUsers.some(user => user._id === userId)) {
          ret = "attivata";
        } 
        return ret;
         
      }
    
    return (
        <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Users</Typography>
                <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill"/>}>
                    New User
                </Button>
            </Stack>
            <Typography variant="p">
                    I dati delle ultime 24/48 ore corrispondono alle 00:00:01 del giorno {formattedYesterday} a quello attuale. <br /> APP-ATTIVATA indica se dal giorno {formattedStartday} ad ora utente ha mai inviato risultati.
                    </Typography>

            <Card>
                <UserTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                />

                <Scrollbar>
                <ExportExcel    exdata={dataFiltered} fileName="Dettaglio-Risultati-Utente" idelem="export-table-dettaglio"/>
        
                    <TableContainer id="export-table-dettaglio" sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            <UserTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={users.length}
                                numSelected={selected.length}
                                onRequestSort={handleSort}
                                onSelectAllClick={handleSelectAllClick}
                                headLabel={[
                                    {id: 'name', label: 'Name'},
                                    {id: 'email', label: 'Email'},
                                    {id: 'age', label: 'Ultime 24/48h', align: 'center'},
                                    {id: 'role', label: 'ID'},
                                    {id: 'status', label: 'APP-ATTIVATA'},
                                    {id: ''},
                                ]}
                            />
                            <TableBody>
                                {dataFiltered
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <UserTableRow
                                            key={row._id}
                                            name={`${row.name} `}
                                            role={row._id}
                                            status={getUserStatus(row._id, detailsUser)}
                                            gender={idToEmailMap[row._id]}
                                            avatarUrl={row.avatarUrl}
                                            age={getUserActivated(row._id, details24User)}
                                            selected={selected.indexOf(row.name) !== -1}
                                            handleClick={(event) => handleClick(event, row.name)}
                                        />
                                    ))}

                                <TableEmptyRows
                                    height={77}
                                    emptyRows={emptyRows(page, rowsPerPage, users.length)}
                                />

                                {notFound && <TableNoData query={filterName}/>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    page={page}
                    component="div"
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[500, 2000]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        </Container>
    );
}
 
