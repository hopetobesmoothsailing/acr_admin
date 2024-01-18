import axios from "axios";
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
import { Tooltip } from 'react-tooltip'
import { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

import Card from '@mui/material/Card';
import Button  from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, Select,MenuItem,TableRow, TableHead, TableBody, TableCell, InputLabel,FormControl, TableContainer, TablePagination} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";


// ----------------------------------------------------------------------

export default function RisdettagliView() {

    const channels = [];

    const location = useLocation();
    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const searchParams = new URLSearchParams(location.search);
    const ndate = searchParams.get('date');
    const [day,month,year] = ndate.split('-');
    const newDate =  `${month}/${day}/${year}`;
    const nuserId = searchParams.get('userId');
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(newDate);
    const [users, setUsers] = useState([]);
    const [idToEmailMap, setIdToEmailMap] = useState({});

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [selectedHourRange, setSelectedHourRange] = useState(null);

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    const handleChangeHourRange = (event) => {
        setSelectedHourRange(event.target.value);
        setPage(0); // Reset to the first page when changing the hour range
      };

    const filterByHourRange = (row) => {
        if (!selectedHourRange) {
          return true; // No filter applied
        }
    
        const hour = new Date(row.f_recorded_at).getHours();
        switch (selectedHourRange) {
          case '0-3':
            return hour >= 0 && hour < 3;
          case '3-6':
            return hour >= 3 && hour < 6;
          case '6-9':
            return hour >= 6 && hour < 9;
          case '9-12':
            return hour >= 9 && hour < 12;
          case '12-15':
            return hour >= 12 && hour < 15;
          case '15-18':
            return hour >= 15 && hour < 18;
          case '18-21':
            return hour >= 18 && hour < 21;
          case '21-23':
            return hour >= 21 && hour <= 23;
          // Add more cases for other hour ranges
          default:
            return true;
        }
      };
    const paginatedAcrDetails = acrDetails
      .slice()
      .reverse() // Reverse the order of the copied array
      // .filter(row => row.acr_result !== "NULL") // Filter out rows with null acr_result
      .filter(filterByHourRange)
      .slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  
    
  
    const handlePrint = () => {
      window.print();
    };
  
 
    const handleDateChange = (date) => {
        
        setSelectedDate(date.format('DD/MM/YYYY'));
        const formattedDate = date.format('DD-MM-YYYY'); // Format the date as needed
        const userId = searchParams.get('userId');

        // Assuming you want to keep the same user (replace 'yourUserId' with the actual user ID)
    
        // Construct the new URL with the updated date and the same user ID
        const newUrl = `/risdettagli?date=${formattedDate}&userId=${userId}`;
    
        // Update the location and reload the page
     
        window.location.href = newUrl;
    };
    // Function to handle date change from date picker

    useEffect(() => {

        // Function to fetch ACR details by date
        const fetchACRDetailsByDateAndUser = async () => {
            try {
              // Parse the parameters from the URL
              const searchParams2 = new URLSearchParams(location.search);
              let date = searchParams2.get('date');
              const userId = searchParams2.get('userId');
              if (date === '') {
                date=selectedDate
              }
              const response = await axios.post(`${SERVER_URL}/getACRDetailsByDateAndUser`,{
                'date': date,
                'userId': userId,
              });
              setACRDetails(response.data.acrDetails);
            } catch (error) {
              console.error('Error fetching ACR details by date and user:', error);
              // Handle error
            }
        
        }
        fetchACRDetailsByDateAndUser(); // Call the function to fetch ACR details by date
        fetchUsers();

    }, [location.search, selectedDate]);

    const fetchUsers = async () => {
        const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
        setUsers(result.users);
    }
    
    
    
      // Create the mapping of _id to email
      useEffect(() => {
        const idToEmail = {};
        users.forEach(user => {
          idToEmail[user._id] = user.email;
        });
        setIdToEmailMap(idToEmail);
      }, [users]);


    const timeSlots = {
        '00:00 - 02:59': [],
        '03:00 - 05:59': [],
        '06:00 - 08:59': [],
        '09:00 - 11:59': [],
        '12:00 - 14:59': [],
        '15:00 - 17:59': [],
        '18:00 - 20:59': [],
        '21:00 - 23:59': [],
    };

    acrDetails.forEach((item) => {
        const recordedDate = item.recorded_at;
        const [, time] = recordedDate.split(' ');
        const [hours] = time.split(':');
        const minuteKey = `${hours.padStart(2, '0')}`;
        // console.log(minuteKey);
        if (item.acr_result !== 'NULL') {
      
        const slot = (() => {
            const hour = parseInt(minuteKey, 10);
            if (hour >= 0 && hour <= 2) return '00:00 - 02:59';
            if (hour >= 3 && hour <= 5) return '03:00 - 05:59';
            if (hour >= 6 && hour <= 8) return '06:00 - 08:59';
            if (hour >= 9 && hour <= 11) return '09:00 - 11:59';
            if (hour >= 12 && hour <= 14) return '12:00 - 14:59';
            if (hour >= 15 && hour <= 17) return '15:00 - 17:59';
            if (hour >= 18 && hour <= 20) return '18:00 - 20:59';
            if (hour >= 21 && hour <= 23) return '21:00 - 23:59';
            return '';
        })();
         // console.log("SLOT");
         // console.log(slot);
         if (channels.indexOf(item.acr_result) === -1) {
            channels.push(item.acr_result);
         }
        if (slot !== '') {
            if (!timeSlots[slot][item.acr_result]) {
                timeSlots[slot][item.acr_result] = 1;
            } else {
                timeSlots[slot][item.acr_result] += 1;
            }
        }
        }
    });

    // console.log ("MINUTI TOTALI GIORNO: %s", audienceGiornaliera);
    // let audienceGiornalieraReale = audienceGiornaliera/pesoNum 
    // audienceGiornalieraReale = parseFloat(audienceGiornalieraReale).toFixed(0);
    
    // Initialize userListeningMap
        const userListeningMap = {};

        acrDetails.forEach((item) => {
            const recordedDate = item.recorded_at;
            const [,time] = recordedDate.split(' ');
            const [hours] = time.split(':');
            const minuteKey = `${hours.padStart(2, '0')}`;
        
            const slot = (() => {
                const hour = parseInt(minuteKey, 10);
                if (hour >= 0 && hour <= 2) return '00:00 - 02:59';
                if (hour >= 3 && hour <= 5) return '03:00 - 05:59';
                if (hour >= 6 && hour <= 8) return '06:00 - 08:59';
                if (hour >= 9 && hour <= 11) return '09:00 - 11:59';
                if (hour >= 12 && hour <= 14) return '12:00 - 14:59';
                if (hour >= 15 && hour <= 17) return '15:00 - 17:59';
                if (hour >= 18 && hour <= 20) return '18:00 - 20:59';
                if (hour >= 21 && hour <= 23) return '21:00 - 23:59';
                return '';
            })();
            // console.log(date);
            if (item.acr_result !== 'NULL') {
      
            if (slot !== '') {
                if (!userListeningMap[item.acr_result]) {
                    userListeningMap[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                }

                if (!userListeningMap[item.acr_result][slot]) {
                    userListeningMap[item.acr_result][slot] = new Set(); // Initialize the set for the slot if it doesn't exist
                }

                userListeningMap[item.acr_result][slot].add(item.user_id); // Add user to the set for the corresponding time slot and channel
            }
            }
        });
      
            
    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                Dati relativi all&apos;utente {idToEmailMap[nuserId]} e data {ndate}
            </Typography>
            
            {/* ... (existing code) */}
            {/* Material-UI DatePicker component */}

            {/* Display graph for a single day with x-axis corresponding to every minute */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        onChange={handleDateChange}
                        value={dayjs(ndate, 'DD/MM/YYYY')}
                    />
                  <Button onClick={handlePrint}>STAMPA</Button>
                  </DemoContainer>
            </LocalizationProvider>
            <Card sx={{ mt: 3 }}>

             <CardContent>

                {/* Existing table components and logic */}
                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO UTENTE CON RICONOSCIMENTI
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio" idelem="export-table-dett"/>
               
                <FormControl sx={{ margin: 0, padding:0, minWidth: 180 }}>
                    <InputLabel id="hour-range-select-label">Range</InputLabel>
                    <Select
                    labelId="hour-range-select-label"
                    id="hour-range-select"
                    value={selectedHourRange}
                    label="Hour Range"
                    onChange={handleChangeHourRange}
                    >
                    <MenuItem value={null}>All</MenuItem>
                    <MenuItem value="0-3">00-03</MenuItem>
                    <MenuItem value="3-6">03-06</MenuItem>
                    <MenuItem value="6-9">06-09</MenuItem>
                    <MenuItem value="9-12">09-12</MenuItem>
                    <MenuItem value="12-15">12-15</MenuItem>
                    <MenuItem value="15-18">15-18</MenuItem>
                    <MenuItem value="18-21">18-21</MenuItem>
                    <MenuItem value="21-23">21-23</MenuItem>
                    {/* Add more MenuItem components for other hour ranges */}
                    </Select>
                </FormControl>
                </Typography>
                <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                Dati relativi all&apos;utente con id {nuserId} e data {ndate} 
                </Typography>
                <TableContainer id="export-table-dett" sx={{overflow: 'unset'}}>
                    <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                        <TableCell>UID</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Canale</TableCell>
                        <TableCell>Durata</TableCell>
                        <TableCell>LatLon</TableCell>
                        <TableCell>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedAcrDetails.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{row.user_id}</TableCell>
                            <TableCell>{idToEmailMap[row.user_id]}</TableCell>
                            <TableCell>{row.model}</TableCell>
                            <TableCell>{row.brand}</TableCell>
                            <TableCell>{row.acr_result}</TableCell>
                            <TableCell>{row.duration * 6}</TableCell>
                            <TableCell>{row.latitude},{row.longitude}</TableCell>
                            <TableCell>{row.recorded_at}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                    <TablePagination
                    rowsPerPageOptions={[500, 3000, 10000]}
                    component="div"
                    count={acrDetails.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </Scrollbar>

                <MapContainer
                        center={[44.4837486, 11.2789241]}
                        zoom={5}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                               

                        {acrDetails 
                            .map((row) => {
                            const latitude = parseFloat(row.latitude);
                            const longitude = parseFloat(row.longitude);

                            if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
                                return (
                                    <Marker
                                        key={row._id}
                                        position={[latitude, longitude]}
                                    >
                                <Popup>
                                    {`${row.brand} ${row.model}`} <br />
                                    {`Channel: ${row.acr_result}`} <br />
                                    {`Recorded At: ${row.recorded_at}`} <br />
                                    {`Location: ${row.location_address}`}
                                </Popup>
                                        {/* ... */}
                                    </Marker>
                                );
                            }
                            return null; // Skip rendering marker for invalid coordinates
                        })}
                    </MapContainer>
                {/* Remaining pagination logic */}
                </CardContent>
            </Card>
            <Tooltip id="my-tooltip" />
        </Container>
    );

}
