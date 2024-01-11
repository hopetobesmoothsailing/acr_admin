import axios from "axios";
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
import { Tooltip } from 'react-tooltip'
import {useMemo, useState, useEffect} from 'react';
// import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

import Card from '@mui/material/Card';
import Button  from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";
// import AppWebsiteAudience from "../app-website-audience";


// ----------------------------------------------------------------------

export default function RisultatinullView() {


    // Audience giornaliera: È la somma totale dei minuti guardati da tutti gli spettatori durante l'intera giornata. Utilizzando gli stessi numeri dell'esempio precedente, se i 2000 utenti hanno guardato la TV per 60.000 minuti in un giorno, l'audience giornaliera sarà di 60.000 minuti.
    let audienceGiornaliera = 0;
    // Audience media al minuto: Si calcola dividendo il totale dei minuti visti da tutti gli spettatori per il numero totale di minuti nel periodo considerato. Ad esempio, se i 2000 utenti hanno guardato la TV per un totale di 60.000 minuti in un giorno, l'audience media al minuto sarà 60.000 / 2000 = 30 minuti.
    // const audienceMediaMinuto = 0; 
    // Share: Lo share indica la percentuale dell'audience totale che ha guardato un particolare programma rispetto all'audience totale al momento della messa in onda. Se si conosce l'audience totale al momento della trasmissione, basta dividere l'audience del programma per l'audience totale e moltiplicare per 100 per ottenere la percentuale.
    // const [groupedData] = useState([]);
    const populationNum = 52155073;
    const panelNum = 2000;
    let pesoNum = parseFloat(populationNum / panelNum).toFixed(0)
    pesoNum = 1;
    const channels = [];

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
    const [users, setUsers] = useState([]);
    const [idToEmailMap, setIdToEmailMap] = useState({});

    // const [selectedDate, setSelectedDate] = useState('04/12/2023');
  
  
    const handlePrint = () => {
      window.print();
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

    }, [selectedDate]);

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

      const minuteBasedData = useMemo(() => {
        const minuteData = {}; // Use an object to store data for each minute

        acrDetails
        .forEach(
            (item) => {
                if (item.acr_result !== "NULL") {
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
                minuteData[minuteKeyX][item.acr_result] = 1 ;
            } else {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] += 1;
            }
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
         audienceGiornaliera += 1 * pesoNum; 
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

    console.log ("MINUTI TOTALI GIORNO: %s", audienceGiornaliera);
    // let audienceGiornalieraReale = audienceGiornaliera/pesoNum 
    // audienceGiornalieraReale = parseFloat(audienceGiornalieraReale).toFixed(0);
    // const timeSlotLabels = Object.keys(timeSlots);
   
    // const channelNames = Object.keys(timeSlotSeries);
    /* const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    ); */
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
        console.log("USER LISTENING MAP");
        console.log(userListeningMap);

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
        /* 
        const calculateAudience = (channel, slot) => {
            const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            // Calculate the share percentage for the channel in the given time slot
            return uniqueUsersListening*pesoNum;
        };
        const calculateAudienceByMinute = (channel, slot) => {
            const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const minutoMedio = parseFloat((timeSlots[slot][channel]/uniqueUsersListening).toFixed(1)) || 0 ;
            // console.log("MINUTO MEDIO %s", minutoMedio);
            const audienceByMinute = minutoMedio*(uniqueUsersListening*pesoNum);
            // console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
            // Calculate the share percentage for the channel in the given time slot
            return audienceByMinute.toFixed(1);
        };
        const calculateShareSlotCanale = (channel, slot) => {
            let audienceSlotCanali = 0;
            channels.forEach(canalealtro => {
                if ((canalealtro !== "NULL")) {
                    audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
                }
            });
    
            // console.log("AUDIENCE CANALE %s FASCIA ORARIA %s %s %s", channel, slot, audienceSlotCanali,timeSlots[slot][channel]);
            const shareSlotCanale = parseFloat((((timeSlots[slot][channel])/audienceSlotCanali)*100).toFixed(1)) || 0 ;
            return shareSlotCanale;
        };
    
        const displayTitle = (channel,slot) => {
            const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const minutoMedio = parseFloat((timeSlots[slot][channel]/uniqueUsersListening).toFixed(0)) || 0 ;
            // console.log("MINUTO MEDIO %s", minutoMedio);
            const audienceByMinute = minutoMedio*(uniqueUsersListening*pesoNum);
            // console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
            return `#Canale: ${channel}, #Utenti reali per canale ${uniqueUsersListening}, n. Individui ${uniqueUsersListening*pesoNum} #Minuti Totali ${timeSlots[slot][channel]/pesoNum} #Minuto medio ${minutoMedio}, #Audience pesata ${audienceByMinute}`;

        }
        
        const displayTitleShare = (channel,slot) =>  {
            let audienceSlotCanali = 0;
            channels.forEach(canalealtro => {
                if ((canalealtro !== "NULL")) {
                    audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
                }
            });
    
            return `(#Audience pesata fascia oraria canale ${timeSlots[slot][channel] || 0} minuti / #Audience canali complessiva  ${audienceSlotCanali} minuti) * 100`;
        }
        */
    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
               Solo dati invio con e senza riconoscimenti
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
                  <Button onClick={handlePrint}>STAMPA</Button>
                  </DemoContainer>
            </LocalizationProvider>
 
 
            <Card>
                {/* Existing table components and logic */}
                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO RAW CON E SENZA RICONOSCIMENTI
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio" idelem="export-table-dett"/>
                </Typography>
                <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                Dati dei singoli record prodotti da ogni utente nel giorno preso in considerazione ovvero {selectedDate}
                Ordinati dall&apos;ultimo record registato al primo del giorno.
                </Typography>
             <TableContainer id="export-table-dett" sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            {/* Your table head component goes here */}
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
                                {acrDetails 
                                .slice() // Create a copy of the array to avoid mutating the original
                                .reverse() // Reverse the order of the copied array
                                
//                                    .filter(row => row.acr_result !== "NULL") // Filter out rows with null acr_result
                                    .map((row) => ( 
   
                                    
                                    <TableRow key={row._id}>
                                        {/* Customize this based on your data structure */}
                                        <TableCell>{row.user_id}</TableCell>
                                        <TableCell>{idToEmailMap[row.user_id]}</TableCell>
                                        <TableCell>{row.model}</TableCell>
                                        <TableCell>{row.brand}</TableCell>
                                        <TableCell>{row.acr_result}</TableCell>
                                        <TableCell>{row.duration*6}</TableCell>
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
            <Tooltip id="my-tooltip" />
        </Container>
    );

}
