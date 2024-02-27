import axios from "axios";
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
import { Tooltip } from 'react-tooltip'
import { useLocation } from 'react-router-dom';
import {useMemo, useState, useEffect} from 'react';
// import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

import Card from '@mui/material/Card';
import Button  from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TableHead, TableBody, TableCell,  TableContainer, TablePagination} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";
import AppWebsiteAudience from "../app-website-audience";


// ----------------------------------------------------------------------

export default function RisultatiView() {


    // Audience giornaliera: È la somma totale dei minuti guardati da tutti gli spettatori durante l'intera giornata. Utilizzando gli stessi numeri dell'esempio precedente, se i 2000 utenti hanno guardato la TV per 60.000 minuti in un giorno, l'audience giornaliera sarà di 60.000 minuti.
    // let audienceGiornaliera = 0;
    // Audience media al minuto: Si calcola dividendo il totale dei minuti visti da tutti gli spettatori per il numero totale di minuti nel periodo considerato. Ad esempio, se i 2000 utenti hanno guardato la TV per un totale di 60.000 minuti in un giorno, l'audience media al minuto sarà 60.000 / 2000 = 30 minuti.
    // const audienceMediaMinuto = 0; 
    // Share: Lo share indica la percentuale dell'audience totale che ha guardato un particolare programma rispetto all'audience totale al momento della messa in onda. Se si conosce l'audience totale al momento della trasmissione, basta dividere l'audience del programma per l'audience totale e moltiplicare per 100 per ottenere la percentuale.
    // const [groupedData] = useState([]);
 //   const populationNum = 52155073;
 //   const panelNum = 1249;
    const channels = [];
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const today = new Date(); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() ); // Set it to yesterday
  
    // Format the date to DD/MM/YYYY
    const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(
      yesterday.getMonth() + 1
    ).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
  
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(formattedYesterday);
    const [users, setUsers] = useState([]);
    const [idToEmailMap, setIdToEmailMap] = useState({});
    const [idToWeightMap, setIdToWeightMap] = useState({});

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    
    // Filter out rows with NULL acr_result and apply hour range filter
    
    // Aggregate filteredDetails by user_id only
    const aggregatedByUser = acrDetails.reduce((acc, row) => {
    const userId = row.user_id;

    if (!acc[userId]) {
        acc[userId] = 1; // Initialize with 1 record for the user
    } else {
        acc[userId] += 1; // Increment the record count for the user
    }

    return acc;
    }, {});

    // Convert the aggregated object into an array suitable for pagination
    
    const aggregatedArray = Object.entries(aggregatedByUser).map(([userId, count]) => ({
        user_id: userId,
        record_count: count
    }));

    console.log("AGGREGATED ARRAY",aggregatedArray);
    const paginatedAcrDetails = aggregatedArray
    // .filter(row => row.acr_result !== "NULL") // Filter out rows with null acr_result
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    /* const paginatedAcrDetails = acrDetails
      .slice()
      .reverse() // Reverse the order of the copied array
      .filter(row => row.acr_result !== "NULL") // Filter out rows with null acr_result
      .filter(filterByHourRange)
      .slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  
    */
  
    const handlePrint = () => {
      window.print();
    };
  
 
    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    };
    // Function to handle date change from date picker

    let tipoRadioTV = 'RADIOTV';
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('type');
    if (tipo === null) { tipoRadioTV = 'RADIOTV';}
    else { tipoRadioTV = 'TV';}

    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchACRDetailsByDate = async () => {
           
            try {
                setLoading(true);
                const formattedDate = selectedDate; // Encode the date for URL

                const response = (await axios.post(`${SERVER_URL}/getACRDetailsByDateRTV`, {date: formattedDate,type:tipoRadioTV,'notnull':'no' })).data; // Adjust the endpoint to match your server route
                setACRDetails(response.acrDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }finally {
                setLoading(false);
              }
        };
        /*
         const sendEmailReminder = async () => {
            try {
                const formattedDate = selectedDate; // Encode the date for URL
                const responserem = (await axios.post(`${SERVER_URL}/sendReminderEmailToInactiveUsers`, {date: formattedDate})).data; // Adjust the endpoint to match your server route
                console.log(responserem)
            } catch (error) {
                console.error('Error calling reminder:', error);
                // Handle error
            }
        };

        sendEmailReminder(); 
        */
        
        fetchACRDetailsByDate(); // Call the function to fetch ACR details by date
        fetchUsers();

    }, [selectedDate,tipoRadioTV]);

    const fetchUsers = async () => {
        const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
        setUsers(result.users);
    }
    
    
    
      // Create the mapping of _id to email
      useEffect(() => {
        const idToEmail = {};
        const idToWeight = {};
        users.forEach(user => {
          idToEmail[user._id] = user.email;
          idToWeight[user._id] = user.weight_s;
        });
        setIdToEmailMap(idToEmail);
        setIdToWeightMap(idToWeight)
      }, [users]);

      const minuteBasedData = useMemo(() => {
        const minuteData = {}; // Use an object to store data for each minute

        acrDetails
        .forEach(
            (item) => {
            //    if (item.acr_result !== "NULL") {
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
            let weight_s = 1
            weight_s = 1;

            if (!minuteData[minuteKeyX][item.acr_result]) {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] = 1*weight_s;
            } else {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] += 1*weight_s;
            }
            // }

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
    const uniquetimeSlots = {
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
        // if (item.acr_result !== 'NULL') {
      
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
         // audienceGiornaliera += 1 * pesoNum; 
         if (channels.indexOf(item.acr_result) === -1) {
            channels.push(item.acr_result);
         }
        if (slot !== '') {
            let weight_s = 1
            // weight_s = idToWeightMap[item.user_id];
            weight_s = 1;
        
            if (!timeSlots[slot][item.acr_result]) {
                timeSlots[slot][item.acr_result] = 1*weight_s;
            } else {
                timeSlots[slot][item.acr_result] += 1*weight_s;
            }
            if (!uniquetimeSlots[slot][item.user_id]) {
                uniquetimeSlots[slot][item.user_id]=1;
            }
        }
        // }
    });

    // console.log ("MINUTI TOTALI GIORNO: %s", audienceGiornaliera);
    // let audienceGiornalieraReale = audienceGiornaliera/pesoNum 
    // audienceGiornalieraReale = parseFloat(audienceGiornalieraReale).toFixed(0);
    const timeSlotLabels = Object.keys(timeSlots);
    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
    channelNames.sort();

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
            // if (item.acr_result !== 'NULL') {
      
            if (slot !== '') {
                if (!userListeningMap[item.acr_result]) {
                    userListeningMap[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                }

                if (!userListeningMap[item.acr_result][slot]) {
                    userListeningMap[item.acr_result][slot] = new Set(); // Initialize the set for the slot if it doesn't exist
                }

                userListeningMap[item.acr_result][slot].add(item.user_id); // Add user to the set for the corresponding time slot and channel

                

            }
            // }
        });
        // console.log("USER LISTENING MAP");
        // console.log(userListeningMap);

      // Now you can calculate the unique users listening to each channel
        /* 
        const calculateAudienceShare = (channel, slot) => {
        const totalUsers = panelNum; // Total number of users (replace this with your actual number)
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        // Calculate the share percentage for the channel in the given time slot
        const sharePercentage = `${((uniqueUsersListening / totalUsers) * 100).toFixed(2)}%`;
        return sharePercentage;
        };
        */
        // Calculate the total sum across all channels
        const totalSum = minuteBasedData.series.reduce((total, channel) => {
            const sum = channel.data.reduce((acc, value) => acc + value, 0);
            return total + sum;
        }, 0);

        // Display the total sum
        console.log("Total Sum across all channels:", totalSum);

        const calculateAudience = (channel, slot) => {
            // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const uniqueUsersListening = userListeningMap[channel]?.[slot]||'';
            let somma = 0;
            if (uniqueUsersListening){
            uniqueUsersListening.forEach(utente => {
                if (utente) {
                    console.log("Sommo singola audience utenet", idToWeightMap[utente]);     
                    somma +=  1
                }
            });
            }
            // Calculate the share percentage for the channel in the given time slot
            return parseInt(somma.toFixed(0),10);
        };


        const counts = {};
        acrDetails.forEach((detail) => {
            const key = `${detail.user_id}-${detail.email}`;
          
            counts[key] = (counts[key] || 0) + 1;
          });
          
          // Filter unique values
          const uniqueDetails = Object.keys(counts).map((key) => {
            const [user_id, email] = key.split('-');
            return { user_id: parseInt(user_id, 10), email, count: counts[key] };
          });

          const calculateAscoltoRadioAttivo = (slot) => {
            // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
            const dati = uniquetimeSlots[slot];
            let ar = 0;
            dati.forEach((item) => {
                // console.log("ar:item",item)
                ar += item
    
            });
            const perc_ar = ar;
            return perc_ar;
        }
        const calculateAscoltoRadioNonAttivo = (slot) => {
            // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
            const dati = uniquetimeSlots[slot];
            let ar = 0;
            dati.forEach((item) => {
                // console.log("ar:item",item)
                ar += item
    
            });
            const perc_ar = 1249 - ar;
            return perc_ar;
        }


          // console.log("Unique Details",uniqueDetails);
          if (loading) {
            return <p>Il Caricamento dei dati con i null raccolti in corso richiede più tempo ... </p>; // You can replace this with your loading indicator component
        }
    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                Dati {tipoRadioTV} 
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
                  <Button onClick={handlePrint}>STAMPA</Button>
                  </DemoContainer>
            </LocalizationProvider>
            <AppWebsiteAudience
                title="UTENTI PER MINUTO RADIO / TV"
                subheader="Grafico con tutti i canali RADIO e TV"
                chart={minuteBasedData}
            />
            
           
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                UTENTI UNICI GIORNALIERI TUTTI CANALI RADIO E TV
                <ExportExcel  exdata={channelNames} fileName="Excel-Export-Contatti" idelem="export-table-contatti"/>
                </Typography>
                
                {/* Remaining pagination logic */}
            
                <Card>
                    <CardContent>
                    <Scrollbar>
                        <TableContainer id="export-table-contatti" sx={{ overflow: 'unset' }}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Channel Name</TableCell>
                                        {timeSlotLabels.sort().map((timeSlotKey) => (
                                            <TableCell key={timeSlotKey}>{timeSlotKey}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                <TableRow >
                                                            <TableCell><strong>UNICI ATTIVI</strong> </TableCell>
                                                            {timeSlotLabels.map((timeSlotKey) => (
                                                             <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <strong><span data-tooltip-id="my-tooltip"  >{calculateAscoltoRadioAttivo(timeSlotKey)}</span></strong>
                                        
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                        <TableRow >
                                                            <TableCell><strong>UNICI NON ATTIVI</strong> </TableCell>
                                                            {timeSlotLabels.map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <strong><span data-tooltip-id="my-tooltip"     >{calculateAscoltoRadioNonAttivo(timeSlotKey)}</span></strong>
                                        
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>  
                                    {Object.keys(userListeningMap).sort().reverse().map((channel, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{channel}</TableCell>
                                            {timeSlotLabels.map((timeSlotKey) => (
                                                <TableCell style={{ textAlign: 'center' }} key={timeSlotKey}>
                                                    {/* Use calculateAudienceShare to retrieve data */}
                                                    {calculateAudience(channel, timeSlotKey)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                                        

                                    
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                </CardContent>
                </Card>                
            <Card>
                {/* Existing table components and logic */}

                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO RAW CON RICONOSCIMENTI AGGREGATI PER UTENTE
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio" idelem="export-table-dett"/>
                </Typography>
                <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                Dettaglio aggregato riconoscimenti per utente {selectedDate}
               <br /> </Typography>
                    <Typography variant="p" sx={{ml: 2, mt: 3,mb:2, display:'none'}}>
                    Utenti attivi {uniqueDetails.length}, utenti non attivi {(1249 - uniqueDetails.length)} su un totale di 1249 utenti. 
                     </Typography>
                <TableContainer id="export-table-dett" sx={{overflow: 'unset'}}>
                    <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                        <TableCell>UID</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Canale</TableCell>
                        <TableCell>PESO</TableCell>
                        <TableCell>MINUTI</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedAcrDetails.map((row) => (
                        <TableRow key={row.user_id}>
                            <TableCell>{row.user_id} </TableCell>
                            <TableCell>{idToEmailMap[row.user_id]}</TableCell>
                            <TableCell>{row.acr_result}</TableCell>
                            <TableCell>{idToWeightMap[row.user_id]}</TableCell>
                            <TableCell>{row.record_count}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                    <TablePagination
                    rowsPerPageOptions={[100, 500, 1000, 100000,500000]}
                    component="div"
                    count={paginatedAcrDetails.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </Scrollbar>
                {/* 
                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO RAW CON RICONOSCIMENTI
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio" idelem="export-table-dett"/>
                <FormControl sx={{ margin: 0, minWidth: 140 }}>
        <InputLabel id="hour-range-select-label">Range</InputLabel>
        <Select
          labelId="hour-range-select-label"
          id="hour-range-select"
          value={selectedHourRange}
          label="Range"
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
        </Select>
      </FormControl>
                </Typography>
                <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                Dati dei singoli record prodotti da ogni utente nel giorno preso in considerazione ovvero {selectedDate}
               <br /> </Typography>
                    <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                    Utenti attivi {uniqueDetails.length}, utenti non attivi {(users.length - uniqueDetails.length)} su un totale di {users.length} utenti. 
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
                        <TableCell>PESO</TableCell>
                        <TableCell>LatLon</TableCell>
                        <TableCell>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedAcrDetails.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell><a title="Visualizza dettagli del giorno dell&apos;utente" href={`risdettagli?date=${row.recorded_at.split(' ')[0].replace(/\//g, '-')}&userId=${row.user_id}`}>{row.user_id}</a></TableCell>
                            <TableCell>{idToEmailMap[row.user_id]}</TableCell>
                            <TableCell>{row.model}</TableCell>
                            <TableCell>{row.brand}</TableCell>
                            <TableCell>{row.acr_result}</TableCell>
                            <TableCell>{idToWeightMap[row.user_id]}</TableCell>
                            <TableCell>{row.latitude},{row.longitude}</TableCell>
                            <TableCell>{row.recorded_at}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                    <TablePagination
                    rowsPerPageOptions={[100, 500, 40000, 100000,500000]}
                    component="div"
                    count={acrDetails.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </Scrollbar>
                        */ }


                
                { /* <MapContainer
                        center={[44.4837486, 11.2789241]}
                        zoom={5}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                               

                        { acrDetails 
                            .filter(row => row.acr_result !== "NULL") // Filter out rows with null acr_result
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
                                        
                                    </Marker>
                                );

                            }
                            return null; // Skip rendering marker for invalid coordinates
                        })}
                    </MapContainer> */}
                {/* Remaining pagination logic */}
            </Card>
            <Tooltip id="my-tooltip" />
        </Container>
    );

}
