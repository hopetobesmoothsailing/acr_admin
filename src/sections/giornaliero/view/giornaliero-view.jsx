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
import {Table, TableRow, TextField,TableHead, TableBody, TableCell, TableContainer } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ResultsTable from "../results-table";
import ExportExcel from "../export-to-excel"; 
import GraphChartArr from "../graph-chart-arr";
import {SERVER_URL} from "../../../utils/consts";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian


// ----------------------------------------------------------------------

export default function GiornalieroView() {


    // const [groupedData] = useState([]);
    // const panelNum = 2000;
    const channels = [];
    // const location = useLocation();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
   
    const [acrDetails, setACRDetails] = useState([]);
    const [palDetails, setPALDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const maxDates = dayjs('26/02/2024', 'DD/MM/YYYY');
    const today = new Date(maxDates); // Get today's date
    const yesterday = new Date(maxDates); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
    const [selectedDate, setSelectedDate] = useState(dayjs(yesterday).format('DD/MM/YYYY'));
    
    const formattedDateExp = selectedDate.replace(/\//g, '-');
   
    // const [selectedDate, setSelectedDate] = useState('04/12/2023');
      
    const [idToWeightMap, setIdToWeightMap] = useState({});
    const [users, setUsers] = useState([]);
    const handleDateChange = (date) => {
        setLoading(true);
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
                const weight_s = idToWeightMap[item.user_id] || 0;
                totaleContattiSlot += weight_s;
                
            }
          }
        });
        
        return totaleContattiSlot.toFixed(0);
      };


    const parsedEvents = [];
    let totalAudienceAllChannels = 0;
    acrDetails.forEach((item) => {
      const recordedDate = item.recorded_at;
      const [, time] = recordedDate.split(' ');
      const [hour, minute] = time.split(':');
      const minuteKey = parseInt(hour, 10) * 60 + parseInt(minute, 10);
      // dovrei calcolare nell'intervallo coperto dal programma la share complessiva
      // if (item.acr_result === channel_name) {
      palDetails.forEach((detail) => {
        detail.events.forEach((event) => {
          const [start, end] = event.time_interval.split(' - ');
          const [startHour, startMinute] = start.split(':').map(Number);
          const [endHour, endMinute] = end.split(':').map(Number);
          const startMinuteKey = startHour * 60 + startMinute;
          const endMinuteKey = endHour * 60 + endMinute;
    
          if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey) {
            const weight_s = idToWeightMap[item.user_id] || 0;
            totalAudienceAllChannels += 1 * weight_s.toFixed(0);
          }
        });
      });
    // }
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
                        weight_s = idToWeightMap[item.user_id] || 0;
                        // console.log("PESO UTENTE item.user_id", weight_s)
                        audienceprog += 1*weight_s;
                        if (utenti.indexOf(item.user_id) === -1) {
                            utenti.push(item.user_id);
                            numeroindividui += weight_s.toFixed(0);
                        }
                    }
                   
                }
            });
            
            const shareprog = ((audienceprog / totalAudienceAllChannels) * 100).toFixed(1);
            const durationstr =event.duration_in_minutes.split(" ");
            const durata = durationstr[0];
            const contatti = calculateContacts(channel_name,event.time_interval);
            const hourPart = parseInt(event.hour.split(":")[0], 10); // Convert the hour part to an integer

            if ((audienceprog > 0) && (hourPart >= 6) && (hourPart <= 23))
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
    // parsedEvents.sort((a, b) => b.contacts - a.contacts);
    // const top10ParsedEvents = parsedEvents.slice(0, 15);
    // console.log("TOP 10 EVENTS", top10ParsedEvents);
   
   
    // const [channelm, setChannelm] = useState('');
    const [recordsm, setRecordsm] = useState([]);

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
                // Rearrange the parts
                const response = (await axios.post(`${SERVER_URL}/getPalinsestomByDateAndChannel`, {'date': formattedDate,'channel_name':canale_pal})).data; // Adjust the endpoint to match your server route
                setPALDetails(response.palDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }
        };
        const fetchBmonitorByDateAndChannel = async () => {
        
            try {
                const canali_bmon = ['RTCH_RAI1','RTCH_RAI2','RTCH_RAI3','RTCH_DEEJ','RTCH_CAPITAL','RTCH_M2O','RTCH_RTL','RTCH_FRECCIA','RTCH_R101','RTCH_105','RTCH_VIRGIN','RTCH_MCARLO','RDCH_RDS','RDCH_KISS','RDCH_24','RDCH_ITALIA'];
                const canali = ['RAIRadio1','RAIRadio2','RAIRadio3','RadioDeejay','RadioCapital','RadioM2O','RadioRTL','RADIOFRECCIA','R101','Radio105','VIRGINRadio','RADIOMONTECARLO','RADIOKISSKISS','Radio24','RDCH_24','RadioItaliaSMI'];
                  
                const formattedDate = selectedDate.replace(/\//g, '-');
                const parts = formattedDate.split("-"); // Splits the date into [31, 01, 2024]
                const reFormattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                // Create a mapping from canali to canali_bmon
                const canaliMapping = canali.reduce((acc, val, index) => {
                    acc[val] = canali_bmon[index];
                    return acc;
                }, {});
                
                // Function to replace canali names with canali_bmon names
                const replaceCanaliWithBmon = (channel) => canaliMapping[channel] || channel;
                
                // Example usage:
                const originalChannel = channel_name; // This would be dynamically based on your application's logic
                const backendChannel = replaceCanaliWithBmon(originalChannel);
                const response = (await axios.post(`${SERVER_URL}/getBmonitorByDateAndChannel`, {'date': reFormattedDate,'channel_name':backendChannel})).data; // Adjust the endpoint to match your server route
                setRecordsm(response.parsedRecords);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }
        };


        fetchResultsByDateAndChannel(); // Call the function to fetch ACR details by date
        fetchBmonitorByDateAndChannel();
        fetchUsers(); 
        

    }, [selectedDate,channel_name,canale_pal,tipoRadioTV]);

    // console.log("palDetails",palDetails)
 
    
    const generateTimeSlots = (intervalValue) => {
        const slots = {
            "00:00 - 23:59": [],
            "06:00 - 23:59": [] // Add your custom slot as the first entry
        };
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
    const generateTimeSlotsNoDaily = (intervalValue) => {
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
        { label: '30 minuti', value: 30 }, */
        { label: '1 ora', value: 60 }, 
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
      const timeSlotsgfx = generateTimeSlotsNoDaily(intervalValue);
      
    
    

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
                        timeSlots[slotKey][item.acr_result] = 1*weight_s || 0;
                        
                    } else {
                        timeSlots[slotKey][item.acr_result] += 1*weight_s || 0;
                      

                    }
                }
            });
            Object.keys(timeSlotsgfx).forEach(slotKey => {
                const [start, end] = slotKey.split(' - ');
                const [startHour, startMinute] = start.split(':').map(Number);
                const [endHour, endMinute] = end.split(':').map(Number);
                const startMinuteKey = startHour * 60 + startMinute;
                const endMinuteKey = endHour * 60 + endMinute;
                if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey) {
                    let weight_s = 1
                    weight_s = idToWeightMap[item.user_id];
                    // console.log("PESO UTENTE item.user_id", weight_s)
                    if (!timeSlotsgfx[slotKey][item.acr_result]) {
                        timeSlotsgfx[slotKey][item.acr_result] = 1*weight_s || 0;
                        
                    } else {
                        timeSlotsgfx[slotKey][item.acr_result] += 1*weight_s || 0;
                        
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
        const userListeningMapWeight = {};

        acrDetails.forEach((item) => {
            const recordedDate = item.recorded_at;
            const [,time] = recordedDate.split(' ');
            const [hour,minute] = time.split(':');
            const minuteKey = parseInt(hour,10) * 60 + parseInt(minute,10);
            if (item.acr_result !== 'NULL') {
                Object.keys(timeSlots).forEach(slotKey => {
                    const [start, end] = slotKey.split(' - ');
                    const [startHour, startMinute] = start.split(':').map(Number);
                    const [endHour, endMinute] = end.split(':').map(Number);
                    const startMinuteKey = startHour * 60 + startMinute;
                    const endMinuteKey = endHour * 60 + endMinute;
                    if (minuteKey >= startMinuteKey && minuteKey <= endMinuteKey) {
                        if (slotKey !== '') {
                            let weight_s = 1
                            weight_s = idToWeightMap[item.user_id];
                            if (!userListeningMap[item.acr_result]) {
                                userListeningMap[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                                userListeningMapWeight[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                            }

                            if (!userListeningMap[item.acr_result][slotKey]) {
                                userListeningMap[item.acr_result][slotKey] = new Set(); // Initialize the set for the slot if it doesn't exist
                                userListeningMapWeight[item.acr_result][slotKey] = new Set(); // Initialize the set for the slot if it doesn't exist
                            }

                            userListeningMap[item.acr_result][slotKey].add(weight_s); // Add user to the set for the corresponding time slot and channel
                            userListeningMapWeight[item.acr_result][slotKey].add(item.user_id); // Add user to the set for the corresponding time slot and channel
                        }
                    }
                });
            }
        });

      // Now you can calculate the unique users listening to each channel
        
        const calculateShareSlotCanale = (channel, slot) => {
            let audienceSlotCanali = 0
            channels.forEach(canalealtro => {
                if ((canalealtro !== "NULL")) {
                    // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
                    // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
                    audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
                }
            });
            const minuto = timeSlots[slot][channel] || 0 ;
            // come indicato da cristiano corrisponde ai minuti totali di ascolto nel periodo e non minuti * utenti
            // const audienceByMinute = minuto*(uniqueUsersListening*pesoNum);
            const audienceByMinute = minuto;
            const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
            let retSh = "*";
            if (shareSlotCanale > 0) retSh = shareSlotCanale.toFixed(1).toString();
            return retSh;
    
        };
        function convertMinutesToTimeString(minutesDecimal) {
            let str = "*";
            if (minutesDecimal > 0) {
            const totalMinutes = Math.floor(minutesDecimal); // Total minutes
            const hours = Math.floor(totalMinutes / 60); // Calculate hours
            const minutes = totalMinutes % 60; // Remaining minutes after converting to hours
            const seconds = Math.round((minutesDecimal - minutes) * 60); // Calculate the seconds from the remainder
            
            // Format the time string
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = seconds.toString().padStart(2, '0');
            
            str = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
            }
            return str;
        }
        const calculateDurataMediaCanale = (channel,slot) => {
            const minuto = timeSlots[slot][channel] || 0 ;
            const audienceChannel = calculateAudience(channel,slot);
            const audienceByMinute = minuto;
            // console.log("AMR",audienceByMinute);
            // console.log("AMR-CANALE",audienceChannel);
            const durmedia = ((audienceByMinute/audienceChannel) || 0) ;
            
            return convertMinutesToTimeString(durmedia);
        }
        const calculateAudience = (channel, slot) => {
            // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            let ar = 0;
            const dati = userListeningMapWeight[channel]?.[slot];
            if (dati) {
                dati.forEach((item) => {
                    const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                    /* if ((channel === "RTL")&&(slot === '06:00 - 08:59')) {
                        console.log("ar:item", item);
                        console.log("ar:item_weight", pesoitem);
                    } */
                    ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
                });
            }

            let perc_ar = "*";
            if (ar > 0)
                perc_ar = ar.toFixed(0);
            
            return perc_ar;
    
        };

       
    console.log(recordsm);
    const disableDates = (date) => {
        // Define the minimum date that can be selected (29/01/2024)
        const minDate = dayjs('29/01/2024', 'DD/MM/YYYY');
        const maxDate = dayjs('25/02/2024', 'DD/MM/YYYY');
        // Get the current date and time
        // const now = dayjs();
        // Check if the date is before the minimum date
        if (date.isBefore(minDate, 'day')) {
          // Disable dates before 29/01/2024
          return true;
        }
        if (date.isAfter(maxDate, 'day')) {
            // Disable dates before 29/01/2024
            return true;
          }
      
        // Check if the date is today and the current time is before 11:59 AM
        /* if (date.isSame(now, 'day') && now.hour() < 12) {
          // Disable today's date selection until 11:59 AM
          return true;
        } 
        */
      
        // Don't disable the date
        return false;
      };

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
                                label="Seleziona Data"
                                value={selectedDate ? dayjs(selectedDate, 'DD/MM/YYYY') : null}
                                onChange={handleDateChange}
                                inputFormat="DD/MM/YYYY" // Explicitly specify the input format here
                                renderInput={(params) => <TextField {...params} />}
                                shouldDisableDate={disableDates}
                            />
                    <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                    </DemoContainer>
                    
            </LocalizationProvider>
            <GraphChartArr data={timeSlotsgfx}  intervalValue={intervalValue} channels={channels} channel_name={channel_name} userListeningMap={userListeningMap} idToWeightMap={idToWeightMap} /> {/* Render the GraphChart component */}
           
            
           
             
            <Grid container spacing={3}>


                <Grid xs={12} sm={12} md={5}>
               
                {/* Remaining pagination logic */}
            
                <Card>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                Palinsesto Giornaliero
                    
                <ExportExcel   fileName={`Export-Palinsesto-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`} idelem={`Export-Palinsesto-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`}/>
                   </Typography>
                    <CardContent>
                    <Scrollbar>
                    <TableContainer id={`Export-Palinsesto-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`}>
                    <Table sx={{ minWidth: 400,maxHeight: 700,overflow: 'auto' }}>
                        <TableHead>
                            <TableRow >
                                <TableCell style={{backgroundColor:"#fff",color:"#333"}}>Ora-Inizio-Fine</TableCell>
                                <TableCell style={{backgroundColor:"#fff",color:"#333"}}>Titolo </TableCell>
                                <TableCell style={{backgroundColor:"#fff",color:"#333"}}>Contatti</TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                        {parsedEvents.map((event, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{event.timeInterval}</TableCell>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>{event.contacts}</TableCell>
                                    </TableRow>
                                              
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>

                    </Scrollbar>
                    </CardContent>
                </Card>

                </Grid>
                <Grid xs={12} sm={12} md={7}>
                <Card>
                <Scrollbar >
                    <Typography variant="h5" sx={{ml: 2, mt: 3,mb:3}}>
                    Dati del giorno {selectedDate} 
                    <ExportExcel  exdata={channelNames} fileName={`Export-Giornaliero-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`} idelem={`Export-Giornaliero-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`} />
                    </Typography>
                    <Typography variant="p" sx={{ml: 2, mt: 3}}>
                    (Almeno 1 minuto di ascolto)
                    </Typography>

                    <TableContainer id={`Export-Giornaliero-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`}>
                    <Table sx={{ minWidth: 400,maxHeight: '700px',overflow: 'auto' }}>
                        <TableHead>
                            <TableRow >
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Fasce Orarie</TableCell>
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>CL (Contatti Netti)</TableCell>
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>SH (Share)</TableCell>
                                <TableCell style={{backgroundColor:"#006097",color:"#FFF"}}>Durata Media (hh:mm:ss)</TableCell>
                                
                                
                                
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(timeSlots).map((timeSlotKey) => (
                             <TableRow key={timeSlotKey}>
                                    <TableCell><strong>{timeSlotKey}</strong></TableCell>
                                    <TableCell style={{textAlign:"center"}}>{calculateAudience(channel_name, timeSlotKey)}</TableCell>
                                    <TableCell style={{textAlign:"center"}}>{calculateShareSlotCanale(channel_name, timeSlotKey)}%</TableCell>
                                    <TableCell style={{textAlign:"center"}}>{calculateDurataMediaCanale(channel_name, timeSlotKey)}</TableCell>
           
                             
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                    <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per bassa numerosità dei casi
                                        </Typography>
                  </Scrollbar>

                </Card>
                <Card style={{ display: 'none' }}>
    
                    <ResultsTable fileName={`Export-monitoraggio-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`} parsedRecords={recordsm} />;
                    <ExportExcel    idelem={`Export-monitoraggio-${channel_name}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`}/>

                </Card>

                </Grid>
            </Grid>
             
             
            
               
            
        </Container>
    );

}
