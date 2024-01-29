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

// import GraphChart from "../graph-chart";
import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";
import AppWebsiteAudience from "../app-website-audience";

// ----------------------------------------------------------------------

export default function GiornalieroView() {


    // const [groupedData] = useState([]);
    const panelNum = 2000;
    const channels = [];
    // const location = useLocation();
    
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

 
    const parsedEvents = [];

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
                if (item.acr_result !== 'NULL') {
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
            parsedEvents.push({
                title: event.title,
                date: detail.day,
                hour: event.hour,
                timeInterval: event.time_interval,
                audience:audienceprog,
                individui:numeroindividui,
                duration: event.duration,
                durationInMinutes: event.duration_in_minutes,
                durationSmallFormat: event.duration_small_format,
            });
        });
    });

    console.log("Parsed Events", parsedEvents);
    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    };
    // Get the URL search parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);

    // Get the value of a specific parameter (e.g., 'channel_name')
    const channel_name = urlParams.get('channel_name');
    let canale_pal = channel_name
    if (channel_name === 'RAIRadio1') canale_pal = 'Rai Radio 1'
    if (channel_name === 'RAIRadio2') canale_pal = 'Rai Radio 2'
    if (channel_name === 'RAIIsoradio') canale_pal = 'Rai Isoradio'
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
            try {
                const formattedDate = selectedDate.replace(/\//g, '-');
        
                const response = (await axios.post(`${SERVER_URL}/getPalinsestoByDateAndChannel`, {'date': formattedDate,'channel_name':canale_pal})).data; // Adjust the endpoint to match your server route
                setPALDetails(response.palDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }
        };


        fetchResultsByDateAndChannel(); // Call the function to fetch ACR details by date
        fetchUsers();
        

    }, [selectedDate,channel_name,canale_pal]);

    console.log("palDetails",palDetails)
      
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
        { label: '1 minuto', value: 1 },
        { label: '5 minuti', value: 5 },
        { label: '15 minuti', value: 15 },
        { label: '30 minuti', value: 30 },
        { label: '1 ora', value: 60 },
        { label: '3 ore', value: 180 },
        { label: '6 ore', value: 360 },
        { label: '12 ore', value: 720 },
        { label: '24 ore', value: 1440 },
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
      console.log(timeSlots);

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
            let weight_s = 1
            weight_s = idToWeightMap[item.user_id];
            // console.log("PESO UTENTE item.user_id", weight_s)

            if (!minuteData[minuteKeyX]) {
                minuteData[minuteKeyX] = {};
            }
//      console.log(minuteKeyX)
            if (!minuteData[minuteKeyX][item.acr_result]) {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] = 1*weight_s;
            } else {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] += 1*weight_s;
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
            // console.log("LABELELSL");
            // console.log(formattedDate);
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


    }, [selectedDate, acrDetails,idToWeightMap]);

    // const timeSlotLabels = Object.keys(timeSlots);   
    

    
    

    acrDetails.forEach((item) => {
        const recordedDate = item.recorded_at;
        const [,time] = recordedDate.split(' ');
        const [hour,minute] = time.split(':');
        const minuteKey = parseInt(hour,10) * 60 + parseInt(minute,10);
        if (item.acr_result !== 'NULL') {
            if (channels.indexOf(item.acr_result) === -1) {
                channels.push(item.acr_result);
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
                        timeSlots[slotKey][item.acr_result] = 1*weight_s;
                    } else {
                        timeSlots[slotKey][item.acr_result] += 1*weight_s;
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
        /* const calculateAudienceByMinute = (channel, slot) => {
            // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const minutoMedio = timeSlots[slot][channel] || 0 ;
            console.log("MINUTO MEDIO:", minutoMedio);
            const audienceByMinute = minutoMedio*pesoNum/intervalValue;
            
            // console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
            // Calculate the share percentage for the channel in the given time slot
            return audienceByMinute.toFixed(1);
        }; */
     
       /*         
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
            return shareSlotCanale.toFixed(2);
    
        };
       const displayTitle = (channel,slot) => {
            const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const minutoMedio = timeSlots[slot][channel] || 0 ;
            // console.log("MINUTO MEDIO %s", minutoMedio);
            const audienceByMinute = minutoMedio/intervalValue;
            // console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
            // Calculate the share percentage for the channel in the given time slot
            return `#Canale: ${channel}, #Utenti reali per canale ${uniqueUsersListening}, n. Individui ${uniqueUsersListening*pesoNum} #Audience =  ${minutoMedio} Totale Minuti Canale  / ${intervalValue} intervallo =  ${audienceByMinute}`;
    
        } 
      
        const displayTitleShare = (channel,slot) =>  {
            let audienceSlotCanali = 0
            channels.forEach(canalealtro => {
                if ((canalealtro !== "NULL")) {
                    audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
                }
            });
            // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
            const minuto = timeSlots[slot][channel] || 0 ;
            const audienceByMinute = minuto;
            return `(SHARE = (#AMR = ${(audienceByMinute).toFixed(2)} minuti ) / #Audience canali :${audienceSlotCanali} minuti periodo considerato )`;
        } */
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
                    <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
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
                    {parsedEvents.map((event, index) => (
                    <div key={index}>
                        {event.audience > 0 && ( // Check if audience > 0
                                    <p>
                                        {event.timeInterval}: {event.title} ({event.individui}, {event.audience}min.)
                                    </p>
                                )}                    
                    </div>
                    ))}
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
            

             
            
               
            
        </Container>
    );

}
