import axios from "axios"; 
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
import {useMemo, useState, useEffect} from 'react';
import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

import Card from '@mui/material/Card';
// import Button  from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";
import AppWebsiteAudience from "../app-website-audience";

// ----------------------------------------------------------------------

export default function GiornalieroView() {


    // const [groupedData] = useState([]);
    const panelNum = 2000;
    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const today = new Date(); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
  
    // Format the date to DD/MM/YYYY
    const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(
      yesterday.getMonth() + 1
    ).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
  
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(formattedYesterday);
  
    // const [selectedDate, setSelectedDate] = useState('04/12/2023');
      
    
 
    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    };
    // Get the URL search parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of a specific parameter (e.g., 'channel_name')
    const channel_name = urlParams.get('channel_name');

    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchResultsByDateAndChannel = async () => {
            try {
                const formattedDate = selectedDate; // Encode the date for URL

                const response = (await axios.post(`${SERVER_URL}/getResultsByDateAndChannel`, {date: formattedDate,acr_result:channel_name})).data; // Adjust the endpoint to match your server route
                setACRDetails(response.acrDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }
        };


        fetchResultsByDateAndChannel(); // Call the function to fetch ACR details by date


    }, [selectedDate,channel_name]);

    
      
    const minuteBasedData = useMemo(() => {
        const minuteData = {}; // Use an object to store data for each minute

        acrDetails.forEach((item) => {
            const recordedDate = item.recorded_at;
            // Extracting minuteKey from the recorded_at string
            const [date, time] = recordedDate.split(' ');
            const [day, month, year] = date.split('/');
            const [hours, minutes] = time.split(':');
            const minuteKey = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
            const minuteKeyX = minuteKey;
            if (!minuteData[minuteKeyX]) {
                minuteData[minuteKeyX] = {};
            }
//      console.log(minuteKeyX)
            if (!minuteData[minuteKeyX][item.acr_result]) {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] = 1;
            } else {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] += 1;
            }
            // console.log(item.acr_result);
            // console.log(minuteData[minuteKeyX][item.acr_result]);
        });

        // Convert minuteData into series data for the chart
        const labels = Array.from({length: 24 * 60}, (_, index) => {
            const minutes = index % 60;
            const hours = Math.floor(index / 60);
            const parts = selectedDate.split('/'); // Split by '/' delimiter
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            // Create a valid date string in 'MM/dd/yyyy' format that JavaScript can parse
            const formattedDateCorretta = `${month}/${day}/${year}`;


            const date = new Date(formattedDateCorretta);
            date.setHours(hours);
            date.setMinutes(minutes);
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            console.log("LABELELSL");
            console.log(formattedDate);
            return formattedDate; // Change to your desired date format
        });


        const uniqueChannels = [...new Set(acrDetails.map((item) => item.acr_result))];

        const series = uniqueChannels.map((channel) => ({
            name: channel,
            type: 'line',
            fill: 'solid',
            yAxis:2,
            data: labels.map((label) => (minuteData[label]?.[channel] || 0)),
        }));
        /* const series2 = uniqueChannels.map((channel) => ({
            name: channel,
            type: 'line',
            fill: 'solid',
            yAxis:0,
            data: labels.map((label) => (minuteData[label]?.[channel] || 0)),
        })); */

        // const series = series1.concat(series2);
        
        // console.log(series);
        return {
            labels,
            series,
        };


    }, [selectedDate, acrDetails]);

    

    
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
        console.log(minuteKey);
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
//         console.log("SLOT");
//         console.log(slot);
        if (slot !== '') {
            if (!timeSlots[slot][item.acr_result]) {
                timeSlots[slot][item.acr_result] = 1;
            } else {
                timeSlots[slot][item.acr_result] += 1;
            }

        }
    });


    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
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
            if (slot !== '') {
                if (!userListeningMap[item.acr_result]) {
                    userListeningMap[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                }

                if (!userListeningMap[item.acr_result][slot]) {
                    userListeningMap[item.acr_result][slot] = new Set(); // Initialize the set for the slot if it doesn't exist
                }

                userListeningMap[item.acr_result][slot].add(item.user_id); // Add user to the set for the corresponding time slot and channel
            }
        });
        console.log(userListeningMap);

      // Now you can calculate the unique users listening to each channel
        const calculateAudienceShare = (channel, slot) => {
        const totalUsers = panelNum; // Total number of users (replace this with your actual number)
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        // Calculate the share percentage for the channel in the given time slot
        const sharePercentage = `${((uniqueUsersListening / totalUsers) * 100).toFixed(2)}%`;
        return sharePercentage;
        };
        const calculateAudience = (channel, slot) => {
            const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            // Calculate the share percentage for the channel in the given time slot
            return uniqueUsersListening;
        };

//    console.log(fiveMinuteBasedData);
    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                Giornaliero canale {channel_name} per la data {selectedDate}
            </Typography>
            {/* ... (existing code) */}
            {/* Material-UI DatePicker component */}

            {/* Display graph for a single day with x-axis corresponding to every minute */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        onChange={handleDateChange}
                        value={dayjs(selectedDate, 'DD/MM/YYYY')}
                    />
                    </DemoContainer>
            </LocalizationProvider>

            <AppWebsiteAudience
                title="Ascolti"
                subheader="Audience (n.ascoltatori) per canale calcolata sulla base del minuto di ascolto"
                chart={minuteBasedData}
            />
            <Grid container spacing={3}>


                <Grid xs={12} sm={6} md={6}>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                Trasmissioni con maggior ascolto
                 
            </Typography>
                {/* Remaining pagination logic */}
            
                <Card>
                    <CardContent>
                    <Scrollbar>
                    <Typography variant="p" gutterBottom>
                    <ul>
                    <li>12.50 TG (???, ???%, ???)</li>    
                    <li>12.56 PROGRAMMA 1 (???, ???%, ???)</li>    
                    <li>13.50 PROGRAMMA 3 (???, ???%, ???)</li>    
                    </ul>
                    
                    </Typography>

                    </Scrollbar>
                    </CardContent>
                </Card>
                <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Mappa Utenti Panel
                    </Typography>
                    <MapContainer
                        center={[44.4837486, 11.2789241]}
                        zoom={5}
                        style={{ height: '280px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {acrDetails.map((row) => {
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
                </CardContent>
            </Card>
                </Grid>
                <Grid xs={12} sm={6} md={6}>
                <Card>
                <Scrollbar>
                    <Typography variant="h5" sx={{ml: 2, mt: 3,mb:3}}>
                    Dati del giorno {selectedDate} 
                    <ExportExcel  exdata={channelNames} fileName="Excel-Export-Datigiornalieri_{channel_name}" idelem="export-table-daily_{channel_name}"/>
                    </Typography>
                    <TableContainer id="export-table-daily_{channel_name}"  sx={{overflow: 'unset'}}>
                    <Table sx={{minWidth: 500}}>
                        <TableHead>
                            <TableRow >
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Risultati Fasce Auditel</TableCell>
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Ascolto Individui</TableCell>
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Share Individui</TableCell>
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Durata</TableCell>
                                
                                
                            </TableRow>
                        </TableHead>

                        <TableBody>
                                {Object.keys(timeSlots).map((timeSlotKey) => (
                                    <TableRow key={timeSlotKey}>
                                        <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>{timeSlotKey}</TableCell>
                                        <TableCell style={{textAlign:"center"}}>{calculateAudience(channel_name, timeSlotKey)}</TableCell>
                                        <TableCell style={{textAlign:"center"}}>{calculateAudienceShare(channel_name, timeSlotKey)}</TableCell>
                                        <TableCell style={{textAlign:"center"}}>{timeSlots[timeSlotKey][channel_name] || '0'}</TableCell>

                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </TableContainer>
                  </Scrollbar>

                </Card>

                </Grid>
            </Grid>
            

             
            
               
            <Card>
                {/* Existing table components and logic */}
                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio_Daily_{channel_name}" idelem="export-table-dett"/>
            </Typography>
             <TableContainer id="export-table-dett" sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            {/* Your table head component goes here */}
                            <TableHead>
                                <TableRow>
                                    <TableCell>UID</TableCell>
                                    <TableCell>Model</TableCell>
                                    <TableCell>Brand</TableCell>
                                    <TableCell>Canale</TableCell>
                                    <TableCell>Durata</TableCell>
                                    <TableCell>LatLon</TableCell>
                                    <TableCell>Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {acrDetails.map((row) => (
                                    <TableRow key={row._id}>
                                        {/* Customize this based on your data structure */}
                                        <TableCell>{row.user_id}</TableCell>
                                        <TableCell>{row.model}</TableCell>
                                        <TableCell>{row.brand}</TableCell>
                                        <TableCell>{row.acr_result}</TableCell>
                                        <TableCell>{row.duration}</TableCell>
                                        <TableCell>{row.latitude},{row.longitude}</TableCell>
                                        <TableCell>{row.recorded_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                {/* Remaining pagination logic */}
            </Card>

        </Container>
    );

}
