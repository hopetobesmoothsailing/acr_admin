import axios from "axios";
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
import {useMemo, useState, useEffect} from 'react';
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
import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";
import AppWebsiteAudience from "../app-website-audience";

// ----------------------------------------------------------------------

export default function RisultatiView() {


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
    const  setDisplayTable = useState('ASCOLTI');
      
    // Function to handle button click to change the displayed table
    const handleDisplayTable = (table) => {
      setDisplayTable(table);
    };
  
    const handlePrint = () => {
      window.print();
    };
  
    const handleDownload = () => {
      // Logic to download data
      // For example: axios.get('YOUR_DOWNLOAD_ENDPOINT');
    };
    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    };
    // Function to handle date change from date picker


    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchACRDetailsByDate = async () => {
            try {
                const formattedDate = selectedDate; // Encode the date for URL

                const response = (await axios.post(`${SERVER_URL}/getACRDetailsByDate`, {date: formattedDate})).data; // Adjust the endpoint to match your server route
                setACRDetails(response.acrDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }
        };


        fetchACRDetailsByDate(); // Call the function to fetch ACR details by date


    }, [selectedDate]);

    
      
    const minuteBasedData = useMemo(() => {
        const minuteData = {}; // Use an object to store data for each minute

        acrDetails.forEach((item) => {
            const recordedDate = item.recorded_at;

            // Extracting minuteKey from the recorded_at string
            const [date, time] = recordedDate.split(' ');
            const [day, month, year] = date.split('/');
            const [hours, minutes] = time.split(':');
            const minuteKey = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
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

        // console.log(minuteData);
        // Convert minuteData into series data for the chart
        const labels = Array.from({length: 24 * 60}, (_, index) => {
            const minutes = index % 60;
            const hours = Math.floor(index / 60);
            const date = new Date(selectedDate);
            date.setHours(hours);
            date.setMinutes(minutes);
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            return formattedDate; // Change to your desired date format
        });


        const uniqueChannels = [...new Set(acrDetails.map((item) => item.acr_result))];

        const series = uniqueChannels.map((channel) => ({
            name: channel,
            type: 'area',
            fill: 'solid',
            data: labels.map((label) => (minuteData[label]?.[channel] || 0)),
        }));
        // console.log(series);
        return {
            labels,
            series,
        };


    }, [selectedDate, acrDetails]);

    const fiveMinuteBasedData = useMemo(() => {
            const generateTimeSlots = (num) => {
            const interval = num; // 5 minutes interval
            const totalMinutes = 24 * 60; // Total minutes in a day
          
            return Array.from({ length: totalMinutes / interval }, (_, index) => {
              const start = new Date(selectedDate);
              start.setHours(Math.floor((index * interval) / 60));
              start.setMinutes((index * interval) % 60);
          
              const end = new Date(start);
              end.setMinutes(end.getMinutes() + interval);
          
              return { start, end };
            });
          };

          const findTimeSlot = (dateTime, timeSlotsX) =>
          timeSlotsX.find((slot) => dateTime >= slot.start && dateTime < slot.end);
          
           
        const minuteData = {}; // Use an object to store data for each minute

        acrDetails.forEach((item) => {
            // Extracting minuteKey from the recorded_at string
            const date = new Date(item.recorded_at);
            const minuteKey = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            const minuteKeyX = minuteKey;
            if (!minuteData[minuteKeyX]) {
                minuteData[minuteKeyX] = {};
            }
//      console.log(minuteKeyX)
            const timeSlotsX = generateTimeSlots(5);
            const dateToCheck = date; // Example date to check
            const result = findTimeSlot(dateToCheck, timeSlotsX);

            if (result) {
                const newdate = new Date(result.start);
                const newminuteKey = `${(newdate.getMonth() + 1).toString().padStart(2, '0')}/${newdate.getDate().toString().padStart(2, '0')}/${newdate.getFullYear()} ${newdate.getHours().toString().padStart(2, '0')}:${newdate.getMinutes().toString().padStart(2, '0')}`;
               
            console.log("newmkey");
            console.log(newminuteKey);
            console.log(`${dateToCheck} belongs to the interval between ${result.start.toLocaleString()} and ${result.end.toLocaleString()}`);
                if (!minuteData[newminuteKey]) {
                    minuteData[newminuteKey] = {};
                }
                if (!minuteData[newminuteKey][item.acr_result]) {
                    // console.log(minuteData[minuteKeyX][item.acr_result]);
                    minuteData[newminuteKey][item.acr_result] = 1;
                } else {
                    // console.log(minuteData[minuteKeyX][item.acr_result]);
                    minuteData[newminuteKey][item.acr_result] += 1;
                }
            } else {
            console.log(`${dateToCheck} does not fall within any time slot`);
            }

            // console.log(item.acr_result);
            // console.log(minuteData[minuteKeyX][item.acr_result]);
        });

        // console.log(minuteData);
        // Convert minuteData into series data for the chart
        const labels = Array.from({length: 24 * 60}, (_, index) => {
            const minutes = index % 60;
            const hours = Math.floor(index / 60);
            const date = new Date(selectedDate);
            date.setHours(hours);
            date.setMinutes(minutes);
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            return formattedDate; // Change to your desired date format
        });


        const uniqueChannels = [...new Set(acrDetails.map((item) => item.acr_result))];

        const series = uniqueChannels.map((channel) => ({
            name: channel,
            dir:"ltr",
            type:"line",
            fill: 'solid',
            zoom: 'true',
            data: labels.map((label) => (minuteData[label]?.[channel] || 0)),
        }));
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
         console.log("SLOT");
         console.log(slot);
        if (slot !== '') {
            if (!timeSlots[slot][item.acr_result]) {
                timeSlots[slot][item.acr_result] = 1;
            } else {
                timeSlots[slot][item.acr_result] += 1;
            }

        }
    });

    const timeSlotLabels = Object.keys(timeSlots);

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

    console.log(fiveMinuteBasedData);
    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                FASCICOLO degli ascolti per la data {selectedDate}
            </Typography>
            {/* ... (existing code) */}
            {/* Material-UI DatePicker component */}

            {/* Display graph for a single day with x-axis corresponding to every minute */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        onChange={handleDateChange}
                        value={dayjs(selectedDate, 'DD/MM/YYYY')}
                    />
                    <Button onClick={() => handleDisplayTable('ASCOLTI')}>ASCOLTI</Button>
                    <Button onClick={() => handleDisplayTable('SHARE')}>SHARE</Button>
                    <Button onClick={handlePrint}>STAMPA</Button>
                    <Button onClick={handleDownload}>DOWNLOAD</Button>                    
                </DemoContainer>
            </LocalizationProvider>
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        User Location Map
                    </Typography>
                    <MapContainer
                        center={[44.4837486, 11.2789241]}
                        zoom={12}
                        style={{ height: '400px', width: '100%' }}
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
            <AppWebsiteAudience
                title="Audience by Minute"
                subheader="Audience calculated based on the minute of listening"
                chart={minuteBasedData}
            />
            <AppWebsiteAudience
                title="Audience by 5 Minute"
                subheader="Audience calculated based on the minute of listening"
                chart={fiveMinuteBasedData}
            />
 
            <Typography variant="h5" sx={{ml: 2, mt: 3}}>
                ASCOLTI (durata in minuti totali di ascolto) 
                <ExportExcel  exdata={channelNames} fileName="Excel-Export-Ascolti" idelem="export-table"/>
           </Typography>
           <TableContainer id="export-table"  sx={{overflow: 'unset'}}>
                <Table sx={{minWidth: 800}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Channel Name</TableCell>
                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                <TableCell key={timeSlotKey}>{timeSlotKey}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {channelNames.map((channel, index) => (
                            <TableRow key={index}>

                                <TableCell>{channel}</TableCell>
                                {Object.keys(timeSlots).map((timeSlotKey) => (
                                    <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                        {timeSlots[timeSlotKey][channel] || '0'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
             
            <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                SHARE (su un totale di {panelNum})
                <ExportExcel  exdata={channelNames} fileName="Excel-Export-Share" idelem="export-table-share"/>
            </Typography>
                {/* Remaining pagination logic */}
            
                <Card>
                    <Scrollbar>
                        <TableContainer id="export-table-share" sx={{ overflow: 'unset' }}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Channel Name</TableCell>
                                        {timeSlotLabels.map((timeSlotKey) => (
                                            <TableCell key={timeSlotKey}>{timeSlotKey}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(userListeningMap).map((channel, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{channel}</TableCell>
                                            {timeSlotLabels.map((timeSlotKey) => (
                                                <TableCell style={{ textAlign: 'center' }} key={timeSlotKey}>
                                                    {/* Use calculateAudienceShare to retrieve data */}
                                                    {calculateAudienceShare(channel, timeSlotKey)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                </Card>
            <Card>
                {/* Existing table components and logic */}
                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio" idelem="export-table-dett"/>
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
