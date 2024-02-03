import 'dayjs/locale/it'; // Import the Italian locale
import axios from "axios"; 
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat'; // For parsing custom formats
import 'leaflet/dist/leaflet.css';
import {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
// import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

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
import GraphChartArr from "../graph-chart-arr";
import {SERVER_URL} from "../../../utils/consts";
// import AppWebsiteAudience from "../app-website-audience";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian


// ----------------------------------------------------------------------

export default function GiornalieroView() {


    // const [groupedData] = useState([]);
    const panelNum = 2000;
    const channels = [];
    // const location = useLocation();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const [acrDetails, setACRDetails] = useState([]);
    const [palDetails, setPALDetails] = useState([]);
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
      
    const [idToWeightMap, setIdToWeightMap] = useState({});
    const [users, setUsers] = useState([]);
    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    };
    // Get the URL search parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);
    let tipoRadioTV = 'RADIO';
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('type');
    if (tipo === null) { tipoRadioTV = 'RADIO';}
    else { tipoRadioTV = 'TV';}

    // Get the value of a specific parameter (e.g., 'channel_name')
    const channel_name = urlParams.get('channel_name');
    const canale_pal = channel_name
    // if (channel_name === 'RAIRadio1') canale_pal = 'Rai Radio 1'
    // if (channel_name === 'RAIRadio2') canale_pal = 'Rai Radio 2'
    // if (channel_name === 'RAIRadio3') canale_pal = 'Rai Isoradio'
   
    const fetchUsers = async () => {
        const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
        setUsers(result.users);
    }
    useEffect(() => {
        const idToWeight = {};
        users.forEach(user => {
            idToWeight[user._id] = user.weight_s;
        });
        setIdToWeightMap(idToWeight);
    }, [users]);

    // calcolo total audience

    const calculateContacts = (channel, slot) => {
        const usersInTimeSlot = [];
        let totaleContattiSlot = 0;
        acrDetails.forEach(item => {
          const recordedDate = item.recorded_at;
          const [, time] = recordedDate.split(' ');
          const [hour, minute] = time.split(':');
          const minuteKey = parseInt(hour, 10) * 60 + parseInt(minute, 10);
      
          const [start, end] = slot.split(' - ');
          const [startHour, startMinute] = start.split(':').map(Number);
          const [endHour, endMinute] = end.split(':').map(Number);
          const startMinuteKey = startHour * 60 + startMinute;
          const endMinuteKey = endHour * 60 + endMinute;
      
          if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey && item.acr_result === channel) {
            if (usersInTimeSlot.indexOf(item.user_id) === -1) {
                usersInTimeSlot.push(item.user_id);
                const weight_s = idToWeightMap[item.user_id] || 1;
                totaleContattiSlot += weight_s;
                
            }
          }
        });
        
        return totaleContattiSlot;
      };


    const parsedEvents = [];
    let totalAudienceAllChannels = 0;
    acrDetails.forEach((item) => {
      const recordedDate = item.recorded_at;
      const [, time] = recordedDate.split(' ');
      const [hour, minute] = time.split(':');
      const minuteKey = parseInt(hour, 10) * 60 + parseInt(minute, 10);
    
      palDetails.forEach((detail) => {
        detail.events.forEach((event) => {
          const [start, end] = event.time_interval.split(' - ');
          const [startHour, startMinute] = start.split(':').map(Number);
          const [endHour, endMinute] = end.split(':').map(Number);
          const startMinuteKey = startHour * 60 + startMinute;
          const endMinuteKey = endHour * 60 + endMinute;
    
          if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey) {
            const weight_s = idToWeightMap[item.user_id] || 1;
            totalAudienceAllChannels += 1 * weight_s;
          }
        });
      });
    });
    
    // Iterate over each palDetails object
    palDetails.forEach((detail) => {
        // Iterate over the events array within each palDetails object
        detail.events.forEach((event) => {
            let audienceprog = 0
            let numeroindividui = 0
            const utenti = []
            // Extract necessary information for each event and push it to parsedEvents array
            acrDetails.forEach((item) => {
                const recordedDate = item.recorded_at;
                const [,time] = recordedDate.split(' ');
                const [hour,minute] = time.split(':');
                const minuteKey = parseInt(hour,10) * 60 + parseInt(minute,10);
                if ((item.acr_result !== 'NULL')&&(item.acr_result === channel_name)) {
                    if (channels.indexOf(item.acr_result) === -1) {
                        channels.push(item.acr_result);
                     }
                
                    const [start, end] = event.time_interval.split(' - ');
                    const [startHour, startMinute] = start.split(':').map(Number);
                    const [endHour, endMinute] = end.split(':').map(Number);
                    const startMinuteKey = startHour * 60 + startMinute;
                    const endMinuteKey = endHour * 60 + endMinute;
                    
                    if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey) {
                        let weight_s = 1
                        weight_s = idToWeightMap[item.user_id] || 1;
                        // console.log("PESO UTENTE item.user_id", weight_s)
                        audienceprog += 1*weight_s;
                        if (utenti.indexOf(item.user_id) === -1) {
                            utenti.push(item.user_id);
                            numeroindividui += weight_s;
                        }
                    }
                   
                }
            });
            const shareprog = ((audienceprog / totalAudienceAllChannels) * 100).toFixed(3);
            const durationstr =event.duration_in_minutes.split(" ");
            const durata = durationstr[0];
            const contatti = calculateContacts(channel_name,event.time_interval);
            parsedEvents.push({
                title: event.title,
                date: detail.day,
                hour: event.hour,
                duration:durata,
                timeInterval: event.time_interval,
                audience:audienceprog,
                share:shareprog,
                contacts:contatti,
                individui:numeroindividui,
                durationInMinutes: event.duration_in_minutes,
                durationSmallFormat: event.duration_small_format,
            });
        });
    });

    // console.log("Parsed Events", parsedEvents);
    parsedEvents.sort((a, b) => b.contacts - a.contacts);
    const top10ParsedEvents = parsedEvents.slice(0, 15);
    // console.log("TOP 10 EVENTS", top10ParsedEvents);
   

     useEffect(() => {
        // Function to fetch ACR details by date
        const fetchResultsByDateAndChannel = async () => {
            try {
                setLoading(true);
                const formattedDate = selectedDate; // Encode the date for URL
      
                const response = (await axios.post(`${SERVER_URL}/getACRDetailsByDateRTV`, {date: formattedDate,type:tipoRadioTV,notnull:'yes'})).data; // Adjust the endpoint to match your server route
                setACRDetails(response.acrDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }finally {
                setLoading(false);
              }
            try {
                const formattedDate = selectedDate.replace(/\//g, '-');
        
                const response = (await axios.post(`${SERVER_URL}/getPalinsestomByDateAndChannel`, {'date': formattedDate,'channel_name':canale_pal})).data; // Adjust the endpoint to match your server route
                setPALDetails(response.palDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }
        };


        fetchResultsByDateAndChannel(); // Call the function to fetch ACR details by date
        fetchUsers(); 
        

    }, [selectedDate,channel_name,canale_pal,tipoRadioTV]);

    // console.log("palDetails",palDetails)
      
    const generateTimeSlots = (intervalValue) => {
        const slots = {};
        const minutesInDay = 24 * 60;
        let currentMinute = 0;
      
        while (currentMinute < minutesInDay) {
            const startMinute = currentMinute;
            const endMinute = Math.min(currentMinute + intervalValue - 1, minutesInDay - 1);
            const slot = `${formatMinute(startMinute)} - ${formatMinute(endMinute)}`;
            slots[slot] = [];
            currentMinute += intervalValue;
        }
      
        return slots;
    };
      
      const formatMinute = (minute) => {
        const hours = Math.floor(minute / 60).toString().padStart(2, '0');
        const minutes = (minute % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      
      // Usage example:
      const intervalOptions = [
        /* { label: '1 minuto', value: 1 },
        { label: '5 minuti', value: 5 },
        { label: '15 minuti', value: 15 },
        { label: '30 minuti', value: 30 },
        { label: '1 ora', value: 60 }, */
        { label: '3 ore', value: 180 },
/*        { label: '6 ore', value: 360 },
        { label: '12 ore', value: 720 },
        { label: '24 ore', value: 1440 },
        */
      ];
      const defaultInterval = 180; // Default interval value
      const [intervalValue, setIntervalValue] = useState(getIntervalFromURL() || defaultInterval); // Initialize with default interval or from URL
    
      // Function to get the interval value from the URL query parameter
      function getIntervalFromURL() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('interval'), 10);
      }
    
      // Function to handle interval change
      const handleIntervalChange = (event) => {
        const selectedValue = parseInt(event.target.value,10);
        setIntervalValue(selectedValue);
        // Update the URL with the new interval value as a query parameter
        window.history.replaceState({}, '', `?interval=${selectedValue}&channel_name=${channel_name}`);
      };
      
      const timeSlots = generateTimeSlots(intervalValue);
      // console.log(timeSlots);

    
    

    acrDetails.forEach((item) => {
        const recordedDate = item.recorded_at;
        const [,time] = recordedDate.split(' ');
        const [hour,minute] = time.split(':');
        const minuteKey = parseInt(hour,10) * 60 + parseInt(minute,10);
        if ((item.acr_result !== 'NULL')) {
            if (item.acr_result === channel_name) {
            if (channels.indexOf(item.acr_result) === -1) {
                channels.push(item.acr_result);
             }
            }
            else {
                item.acr_result = "ALTRERADIO";
                if (channels.indexOf(item.acr_result) === -1) {
                    channels.push(item.acr_result);
                 }
            }
            Object.keys(timeSlots).forEach(slotKey => {
                const [start, end] = slotKey.split(' - ');
                const [startHour, startMinute] = start.split(':').map(Number);
                const [endHour, endMinute] = end.split(':').map(Number);
                const startMinuteKey = startHour * 60 + startMinute;
                const endMinuteKey = endHour * 60 + endMinute;
                if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey) {
                    let weight_s = 1
                    weight_s = idToWeightMap[item.user_id];
                    // console.log("PESO UTENTE item.user_id", weight_s)
                    if (!timeSlots[slotKey][item.acr_result]) {
                        timeSlots[slotKey][item.acr_result] = 1*weight_s || 1;
                    } else {
                        timeSlots[slotKey][item.acr_result] += 1*weight_s || 1;
                    }
                }
            });
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
        // console.log(userListeningMap);

      // Now you can calculate the unique users listening to each channel
        const calculateAudienceShare = (channel, slot) => {
        const totalUsers = panelNum; // Total number of users (replace this with your actual number)
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        // Calculate the share percentage for the channel in the given time slot
        const sharePercentage = `${((uniqueUsersListening / totalUsers) * 100).toFixed(2)}%`;
        return sharePercentage;
        };
        
        const calculateAudience = (channel, slot) => {
            // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const uniqueUsersListening = userListeningMap[channel]?.[slot]||'';
            let somma = 0;
            // console.log("UNIQUE:",uniqueUsersListening);
            if (uniqueUsersListening){
            uniqueUsersListening.forEach(utente => {
                if (utente) {
                    // console.log("Sommo singola audience utente", idToWeightMap[utente]);     
                    somma +=  idToWeightMap[utente]
                }
            });
            }
            // Calculate the share percentage for the channel in the given time slot
            return somma;
        };



        //    console.log(fiveMinuteBasedData);
if (loading) {
    return <p>Caricamento dati raccolti in corso... </p>; // You can replace this with your loading indicator component
  }
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
                    <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                    </DemoContainer>
                    
            </LocalizationProvider>
            <GraphChartArr data={timeSlots}  intervalValue={intervalValue} channels={channels} channel_name={channel_name} userListeningMap={userListeningMap} idToWeightMap={idToWeightMap} /> {/* Render the GraphChart component */}
           
            
           
             
            <Grid container spacing={3}>


                <Grid xs={12} sm={6} md={6}>
               
                {/* Remaining pagination logic */}
            
                <Card>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                Le 15 Trasmissioni con maggior ascolto
                    
                </Typography>
                    <CardContent>
                    <Scrollbar>
                    <Typography variant="p" gutterBottom>
                    <p>Ora: Titolo Programma (min. Ascolto, Share, Contatti) </p>
                    {top10ParsedEvents.map((event, index) => (
                    <div key={index}>
                        {event.audience > 0 && ( // Check if audience > 0
                                    <p>
                                        {event.timeInterval}: {event.title} (<strong>{(event.audience)} min.,  {event.share}%,  {event.contacts}</strong>)
                                    </p>
                                )}                    
                    </div>
                    ))}
                    </Typography>

                    </Scrollbar>
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
            

             
            
               
            
        </Container>
    );

}
