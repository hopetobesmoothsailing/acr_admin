import 'dayjs/locale/it'; // Import the Italian locale
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat'; // For parsing custom formats
import 'leaflet/dist/leaflet.css';
import { Tooltip } from 'react-tooltip'
import {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
// import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

import Card from '@mui/material/Card';
import Button  from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TextField, TableHead, TableBody, TableCell, TableContainer} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import GraphChart from "../graph-chart";
import ExportExcel from "../export-to-excel"; 
import GraphChartArr from "../graph-chart-arr";
import {SERVER_URL} from "../../../utils/consts";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian

// ----------------------------------------------------------------------

export default function FascicoloprodView() {

    const channels = [];
    const pesoNum = 1
    
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    
    const toggleVisibility = () => {
        setIsVisible(!isVisible); // Toggle the visibility state
    };
    const shareVisibility = () => {
        setIsVisible(false); // Toggle the visibility state
    };

    let importantChannels = [];


    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const today = new Date(); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
  
    // Format the date to DD/MM/YYYY
    /* const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(
      yesterday.getMonth() + 1
    ).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    */
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(dayjs(yesterday).format('DD/MM/YYYY'));

    const [users, setUsers] = useState([]);
    
    
    // Function to handle button click to change the displayed table
    
    const handlePrint = () => {
      window.print();
    };

    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    };
    // Function to handle date change from date picker


    let tipoRadioTV = 'RADIO';
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('type');
    if ((tipo === null)||(tipo === 'RADIO')) { 
        tipoRadioTV = 'RADIO';
        importantChannels = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RDS','RTL','Radio24','RadioM2O','RADIOSUBASIO','RADIOKISSKISS','RadioFRECCIA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioZETA','RadioItaliaSMI','RadioNORBA'];

    }
    else { 
        tipoRadioTV = 'TV';
        importantChannels = ['RAI1', 'RAI2','RAI3','RETE4','CANALE5','ITALIA1','LA7'];
    }

    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchACRDetailsByDate = async () => {
           
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
        };
       
        fetchACRDetailsByDate(); // Call the function to fetch ACR details by date
        fetchUsers();
    

    }, [selectedDate,tipoRadioTV]);
    const fetchUsers = async () => {
        const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
        setUsers(result.users);
    }
        const [idToWeightMap, setIdToWeightMap] = useState({});

        // Create the mapping of _id to email
        useEffect(() => {
        const idToWeight = {};
        users.forEach(user => {
            if (user.weight_s > 0)
            idToWeight[user._id] = user.weight_s;
        });
        setIdToWeightMap(idToWeight);
        }, [users]);

    
    const generateTimeSlots = (intervalValue) => {
        const slots = {
            "06:00 - 23:59": [] // Add your custom slot as the first entry
        };
        const minutesInDay = 24 * 60;
        let currentMinute = 360;
      
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
        { label: '15 minuti', value: 15 },
        { label: '30 minuti', value: 30 },
        { label: '1 ora', value: 60 },
        { label: '3 ore', value: 180 },
        { label: '6 ore', value: 360 },
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
        window.history.replaceState({}, '', `?interval=${selectedValue}`);
      };
      
      const timeSlots = generateTimeSlots(intervalValue);
      const uniquetimeSlots = generateTimeSlots(intervalValue);

      const filteredACRDetails = acrDetails.filter(item => {
        const recordedAt = item.recorded_at;
        // Parse the date and time from the recorded_at field
        const [, timePart] = recordedAt.split(' ');
         const [hours,] = timePart.split(':').map(Number);
        // Define the time range
        const startHour = 6; // 06:00 AM
        const endHour = 23; // 23:59 PM
    
        // Check if the time is within the desired range
        return hours >= startHour && hours <= endHour;
    });
      
      // Filter out less important channels and group them under "ALTRERADIO"
        const groupedACRDetails = filteredACRDetails.map(item => {
            const channel = item.acr_result;
            if (!importantChannels.includes(channel) && (item.acr_result !== 'NULL')) {
                item.acr_result = 'ALTRERADIO';
            }
            return item;
        });
      
    
        groupedACRDetails.forEach((item) => {
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
                    if (weight_s > 0) {
                    if (!timeSlots[slotKey][item.acr_result]) {
                        timeSlots[slotKey][item.acr_result] = 1*weight_s.toFixed(0);
                    } else {
                        timeSlots[slotKey][item.acr_result] += 1*weight_s.toFixed(0);
                    }
                    if (!uniquetimeSlots[slotKey][item.user_id]) {
                        uniquetimeSlots[slotKey][item.user_id]=weight_s;
                    }

                    }
                }
            });
        }
    });

    console.log("TIMESLOTS",timeSlots)
    
    // const timeSlotLabels = Object.keys(timeSlots);   
    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
    channelNames.sort();

    // Initialize userListeningMap
        const userListeningMap = {};

        groupedACRDetails.forEach((item) => {
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
                            }

                            if (!userListeningMap[item.acr_result][slotKey]) {
                                userListeningMap[item.acr_result][slotKey] = new Set(); // Initialize the set for the slot if it doesn't exist
                            }

                            userListeningMap[item.acr_result][slotKey].add(weight_s); // Add user to the set for the corresponding time slot and channel
                        }
                    }
                });
            }
        });
    // console.log("USER LISTENING MAP",userListeningMap);
    // console.log(userListeningMapAudience);

    const calculateAscoltoRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        const dati = uniquetimeSlots[slot];
        let ar = 0;
        dati.forEach((item) => {
            // console.log("ar:item",item)
            ar += item

        });
        const perc_ar = ((ar/52231073)*100).toFixed(1);
        return perc_ar;
    }
    const calculateAudienceByMinute = (channel, slot) => {
        const minutoMedio = timeSlots[slot][channel] || 0 ;
        let audienceByMinute = 0;
        if (slot === '06:00 - 23:59') {
        const day_interval = 1440 - 360;
        audienceByMinute = minutoMedio*pesoNum/(day_interval);
        }
        else
        audienceByMinute = minutoMedio*pesoNum/intervalValue;
        return audienceByMinute.toFixed(0).toString().replace(".", ",");
    };
 
            
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
        /* if (channel === "RDS") {
            console.log("F_CH:",channel);
            console.log("F_SLOT:",slot);
            console.log("F_ABM:",audienceByMinute);
            console.log("F_ASC:",audienceSlotCanali);
        } */
        const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
        return shareSlotCanale.toFixed(1).toString();

    };
    const displayTitle = (channel,slot) => {
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        const minutoMedio = timeSlots[slot][channel] || 0 ;
        // console.log("MINUTO MEDIO %s", minutoMedio);
        let audienceByMinute = 0;
        let ret = "";
        if (slot === '06:00 - 23:59') {
            const day_interval = 1440 - 360;
            audienceByMinute = minutoMedio*pesoNum/(day_interval);
            ret =  `#Canale: ${channel}, #Utenti reali per canale ${uniqueUsersListening}, n. Individui ${uniqueUsersListening*pesoNum} #Audience =  ${minutoMedio} Totale Minuti Canale  / ${day_interval} intervallo =  ${audienceByMinute}`;
        }
        else{
            audienceByMinute = minutoMedio*pesoNum/intervalValue;
            ret = `#Canale: ${channel}, #Utenti reali per canale ${uniqueUsersListening}, n. Individui ${uniqueUsersListening*pesoNum} #Audience =  ${minutoMedio} Totale Minuti Canale  / ${intervalValue} intervallo =  ${audienceByMinute}`;
        }
        return ret;
             // console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
        // Calculate the share percentage for the channel in the given time slot

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
        return `(SHARE = (#AMR = ${(audienceByMinute).toFixed(2).toString().replace(".", ",")} minuti ) / #Audience canali :${audienceSlotCanali} minuti periodo considerato )`;
    }
    const audienceSizes = Object.keys(timeSlots['06:00 - 23:59'] || {}).reduce((acc, channel) => {
        acc[channel] = timeSlots['06:00 - 23:59'][channel];
        return acc;
    }, {});
    
    // Sort channelNames based on audience size
    const sortedChannelNames = channelNames.sort((a, b) => (audienceSizes[b] || 0) - (audienceSizes[a] || 0));
    
    
    
    if (loading) {
        return <p>Caricamento dati raccolti in corso... </p>; // You can replace this with your loading indicator component
        }
    
            return (
                <Container>
                    <Scrollbar style={{ width: '100%'}}>
                
                    <Typography variant="h4" sx={{mb: 5}}>
                        FASCICOLO (interno) degli ascolti  {tipoRadioTV} per la data {selectedDate}
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
                            />
                            <Button onClick={shareVisibility}>SHARE</Button>
                            <Button onClick={toggleVisibility}>ASCOLTI</Button>
                            <Button disabled onClick={handlePrint}>STAMPA</Button>
                            <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>

                        </DemoContainer>
                    </LocalizationProvider>
                    <Card style={{ display: isVisible ? 'none' : 'block' }}>
                        <CardContent  sx={{ pl: 0 }}>
                        <GraphChartArr data={timeSlots}  intervalValue={intervalValue} importantChannels={channels} /> {/* Render the GraphChart component */}
                        </CardContent>
                    </Card>
                    <Card style={{ display: isVisible ? 'block' : 'none' }}>
                            <CardContent  sx={{ pl: 0 }}>
                            <GraphChart userListeningMap={userListeningMap}   /> {/* Render the GraphChart component */}
                            </CardContent>
                        </Card>
                    <Card style={{ display: isVisible ? 'block' : 'none' }}>
                        <CardContent>

        
                        <Typography variant="h5" sx={{ml: 2, mt: 3}}>
                                ASCOLTO MEDIO
                                <ExportExcel  exdata={channelNames} fileName="Excel-Export-Ascolti" idelem="export-table"/>
                        </Typography>
                                 
                            <TableContainer id="export-table"   sx={{maxHeight: '500px',overflow: 'auto'}}>
                                <Table sx={{minWidth: 800}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>EMITTENTE</TableCell>
                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                <TableCell key={timeSlotKey} style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>{timeSlotKey} </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {sortedChannelNames.map((channel, index) => (
                                            <TableRow key={index}>

                                                <TableCell>{channel}</TableCell>
                                                {Object.keys(timeSlots).map((timeSlotKey) => (
                                                    <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                        <span data-tooltip-id="my-tooltip" data-tooltip-content={displayTitle(channel, timeSlotKey)} >{calculateAudienceByMinute(channel, timeSlotKey)}</span>


                                                    </TableCell>

                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                        </CardContent>
                    </Card>
    
                <Card style={{ display: isVisible ? 'none' : 'block' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>SHARE</Typography>
                    <Typography variant="p" sx={{ ml: 2, mt: 3, mb: 2 }}>Data da rapporto tra AMR e AUDIENCE nell&apos;intervallo considerato di {intervalValue} minuti.</Typography>
                    <ExportExcel  exdata={channelNames} fileName="Excel-Export-Share" idelem="export-table-share"/>
                    <br />
                    <TableContainer id="export-table-share"  sx={{maxHeight: '500px',overflow: 'auto'}}>
                                <Table sx={{minWidth: 800}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>EMITTENTE</TableCell>
                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                <TableCell key={timeSlotKey} style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>{timeSlotKey} </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {sortedChannelNames.map((channel, index) => (
                                            <TableRow key={index}>

                                                <TableCell>{channel} %</TableCell>
                                                {Object.keys(timeSlots).map((timeSlotKey) => (
                                                    <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                        <span data-tooltip-id="my-tooltip" data-tooltip-content={displayTitleShare(channel, timeSlotKey)} >{calculateShareSlotCanale(channel, timeSlotKey)}</span>
                            
                                                    </TableCell>

                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                </CardContent>
                </Card>
                
           

                    <Card style={{ display: isVisible ? 'none' : 'block' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>ASCOLTATORI RADIO</Typography>
                    <br />
                    <TableContainer id="export-table-share"  sx={{overflow: 'unset'}}>
                                <Table sx={{minWidth: 800}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell> </TableCell>
                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                <TableCell key={timeSlotKey}>{timeSlotKey} </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>

                                            <TableRow >

                                                <TableCell>ASCOLTATORI RADIO</TableCell>
                                                {Object.keys(timeSlots).map((timeSlotKey) => (
                                                    <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                        <span data-tooltip-id="my-tooltip" data-tooltip-content={calculateAscoltoRadio(timeSlotKey)} >{calculateAscoltoRadio(timeSlotKey)}</span>
                            
                                                    </TableCell>

                                                ))}
                                            </TableRow>
                                        
                                    </TableBody>
                                </Table>
                            </TableContainer>

                </CardContent>
                </Card>
                
            </Scrollbar>


                                        
            
                     
               
                
            <Tooltip id="my-tooltip" />
            </Container>
        
    );

}
