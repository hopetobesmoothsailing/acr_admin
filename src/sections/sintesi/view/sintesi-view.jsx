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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import ExportExcel from "../export-to-excel"; 
import GraphChartArr from "../graph-chart-arr";
import {SERVER_URL} from "../../../utils/consts";
import GraphChartArrBars from "../graph-chart-arr-bars";
import GraphChartArrBarsCh from "../graph-chart-arr-bars-ch";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian

// ----------------------------------------------------------------------

export default function SintesiView() {

    const channels = [];
    const pesoNum = 1
    
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
   
    
    const shareVisibility = () => {
        setIsVisible(false); // Toggle the visibility state
    };
    
    // const importantChannels = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RAIIsoradio','RDS','RTL','Radio24','RadioM2O','RADIOSUBASIO','RADIOBELLAEMONELLA','RADIOITALIAANNI60','RADIOKISSKISS','RADIOKISSKISSNAPOLI','RADIOKISSKISSITALIA','RadioFRECCIA','RadioIBIZA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioZETA','RadioBRUNO','RadioItaliaSMI'];

    const importantChannels = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RAIIsoradio','RDS','RTL','Radio24','RadioM2O','RADIOSUBASIO','RADIOBELLAEMONELLA','RADIOITALIAANNI60','RADIOKISSKISS','RADIOKISSKISSNAPOLI','RADIOKISSKISSITALIA','RadioFRECCIA','RadioIBIZA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioZETA','RadioBRUNO','RadioItaliaSMI'];

    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const today = new Date(); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 4); // Set it to yesterday  
    // Format the date to DD/MM/YYYY
    const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;  
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(dayjs(yesterday).format('DD/MM/YYYY'));
    const [startDate,setStartDate] = useState(dayjs().subtract(7, 'day').format('DD/MM/YYYY'));
    const [stopDate, setStopDate ] = useState(dayjs().add(0, 'day').format('DD/MM/YYYY'));
    const [users, setUsers] = useState([]);
    console.log("SEL_DATE",selectedDate);
    console.log("START_DATE",startDate);
    console.log("STOP_DATE",stopDate);
    // Function to calculate the difference

    // Convert date from DD/MM/YYYY to YYYY-MM-DD for backend
    const formatDateForBackend = (date) => dayjs(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
    
    let tipoRadioTV = 'RADIO';
    let ascoltatoriRadioLabel = '';
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('type');
    if (tipo === null) {
         ascoltatoriRadioLabel="ASCOLTATORI RADIO";
         tipoRadioTV = 'RADIO';}
    else { 
        tipoRadioTV = 'TV';
        ascoltatoriRadioLabel="SPETTATORI TV";
    }

    const calculateDifferenceInDays = () => {
        const start = dayjs(startDate, 'DD/MM/YYYY');
        const stop = dayjs(stopDate, 'DD/MM/YYYY');
      
        // Calculate the difference in days
        const difference = stop.diff(start, 'day');
        return difference;
      };
      
      // Example usage
    const differenceInDays = calculateDifferenceInDays(); // This will calculate and log the difference
    console.log("DIFFINDAYS",differenceInDays);
    // Funcation to submit dates to backend
    const handleSubmitDates = async () => {
        setSelectedDate(startDate);
        const formattedStartDate = formatDateForBackend(startDate);
        const formattedStopDate = formatDateForBackend(stopDate);
        
        try {
            setLoading(true);
            const response = await axios.post(`${SERVER_URL}/getACRDetailsByRangeRTV`, {
                startDate: formattedStartDate,
                stopDate: formattedStopDate,
                type: tipoRadioTV,
                notnull: 'yes'
            });
            setACRDetails(response.data.acrDetails);
        } catch (error) {
            console.error('Error fetching ACR details:', error);
        } finally {
            setLoading(false);
        }
    };
     

    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchACRDetailsByRange = async () => {
           
            try {
                setLoading(true);
                // const formattedDate = selectedDate; // Encode the date for URL
                const formattedStartDate = formatDateForBackend(startDate);
                const formattedStopDate = formatDateForBackend(stopDate);
             
                const response = (await axios.post(`${SERVER_URL}/getACRDetailsByRangeRTV`, {'startDate': formattedStartDate,'stopDate':formattedStopDate,'type':tipoRadioTV,'notnull':'yes'})).data; // Adjust the endpoint to match your server route
                setACRDetails(response.acrDetails);
            } catch (error) {
                console.error('Error fetching ACR details:', error);
                // Handle error
            }finally {
                setLoading(false);
              }
        };
        
        fetchACRDetailsByRange(); // Call the function to fetch ACR details by date
        fetchUsers();
    

    }, [selectedDate,tipoRadioTV,formattedYesterday,stopDate,startDate]);

    const fetchUsers = async () => {
        const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
        setUsers(result.users);
    }
        const [idToWeightMap, setIdToWeightMap] = useState({});

        // Create the mapping of _id to email
        useEffect(() => {
        const idToWeight = {};
        users.forEach(user => {
            idToWeight[user._id] = user.weight_s;
        });
        setIdToWeightMap(idToWeight);
        }, [users]);

    
    const generateTimeSlots = (intervalValue) => {
        const slots = {
            "00:00:00 - 23:59:59": [],
            "06:00:00 - 23:59:59": [] // Add your custom slot as the first entry
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
        window.history.replaceState({}, '', `?interval=${selectedValue}`);
      };
      
      
      const timeSlots = generateTimeSlots(intervalValue);
      const uniquetimeSlots = generateTimeSlots(intervalValue);
      console.log(timeSlots);

      // Filter out less important channels and group them under "ALTRERADIO"
       
      // Filter out less important channels and group them under "ALTRERADIO"
      const groupedACRDetails = acrDetails.map(item => {
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
                    let weight_s = 0
                    weight_s = idToWeightMap[item.user_id];
                    // console.log("PESO UTENTE item.user_id", weight_s)
                    if (!timeSlots[slotKey][item.acr_result]) {
                        timeSlots[slotKey][item.acr_result] = 1*weight_s;
                    } else {
                        timeSlots[slotKey][item.acr_result] += 1*weight_s;
                    }
                    if (!uniquetimeSlots[slotKey][item.user_id]) {
                        uniquetimeSlots[slotKey][item.user_id] = 1*weight_s;
                    }
                }
            });
        }
    });
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
    
    console.log("TIMESLOTS",timeSlots)
  
    const audienceSizes24 = Object.keys(timeSlots['00:00:00 - 23:59:59'] || {}).reduce((acc, channel) => {
        acc[channel] = timeSlots['00:00:00 - 23:59:59'][channel];
        return acc;
    }, {});

    // Sort channelNames based on audience size

    const sortedChannelNames = channelNames.sort((a, b) => (audienceSizes24[b] || 0) - (audienceSizes24[a] || 0));
   
    // Initialize userListeningMap
        const userListeningMap = {};

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
   
   
    const calculateAudienceByMinute = (channel, slot) => {
        // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        const minutoMedio = timeSlots[slot][channel] || 0 ;
        // console.log("MINUTO MEDIO:", minutoMedio);
        let audienceByMinute = 0;
        if (slot === '00:00:00 - 23:59:59') {
            const day_interval = 1440;
            audienceByMinute = minutoMedio*pesoNum/(day_interval);
        }
        else if (slot === '06:00:00 - 23:59:00') {
                const day_interval = 1440 - 360;
                audienceByMinute = minutoMedio*pesoNum/(day_interval);
        }
        else
            audienceByMinute = minutoMedio*pesoNum/intervalValue;
            return audienceByMinute.toFixed(0)
    };
 
            
    const calculateShareSlotCanale = (channel, slot) => {
        let audienceSlotCanali = 0
        channels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                 audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
            }
        });
        const minuto = timeSlots[slot][channel] || 0 ;
        let audienceByMinute = 0;
        let day_interval = intervalValue;
        if (slot === '00:00:00 - 23:59:59') {
            day_interval = 1440;
            audienceByMinute = minuto*pesoNum;
        }
        else if (slot === '06:00:00 - 23:59:00') {
                day_interval = 1440 - 360;
                audienceByMinute = minuto*pesoNum;
        }
        else
            audienceByMinute = minuto*pesoNum;
        const shareSlotCanale = (((audienceByMinute/day_interval) || 0)/ (audienceSlotCanali/day_interval))*100 || 0 ;
        return shareSlotCanale.toFixed(1);

    };
    const calculateShareRadio = (slot) => {
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
    /* const calculateAscoltoRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        const dati = uniquetimeSlots[slot];
        let ar = 0;
        dati.forEach((item) => {
            // console.log("ar:item",item)
            ar += item

        });
        const perc_ar = ar.toFixed(0);
        return perc_ar;
    } */
    const displayShareRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        const dati = uniquetimeSlots[slot];
        let ar = 0;
        dati.forEach((item) => {
            // console.log("ar:item",item)
            ar += item

        });
        const perc_ar = ((ar/52231073)*100).toFixed(1);
           return `( ${perc_ar}% (popolazione italiana) )`;

    }
    /* const displayAscoltiRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        const dati = uniquetimeSlots[slot];
        let ar = 0;
        dati.forEach((item) => {
            // console.log("ar:item",item)
            ar += item

        });
           return `( ${ar.toFixed(0)}% (popolazione italiana) )`;

    } */
    
       

    if (loading) {
        return <p>Caricamento dati raccolti in corso... </p>; // You can replace this with your loading indicator component
        }

            return (
                <Container>
                    <Scrollbar style={{ width: '100%'}}>              
                    <Typography variant="h4" sx={{mb: 5}}>
                       Sintesi degli ascolti per le date selezionate
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
                         <DatePicker
                        label="Start Date"
                        value={dayjs(startDate, 'DD/MM/YYYY')}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                        label="Stop Date"
                        value={dayjs(stopDate, 'DD/MM/YYYY')}
                        onChange={(newValue) => setStopDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        />
                         <Button onClick={handleSubmitDates}>Invia</Button>
                    </LocalizationProvider>
                        <DemoContainer components={['DatePicker']}>                             
                            <Button onClick={shareVisibility}>SHARE</Button>
                            <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </DemoContainer>
             
                    <Card style={{ display: isVisible ? 'none' : 'block' }}>
                        <CardContent  sx={{ pl: 0  }} >
                        <h5>Sintesi Share Canali per fasce orarie nel periodo considerato</h5>
                        <GraphChartArr   data={timeSlots}  intervalValue={intervalValue} importantChannels={channels} tipoRadioTV={tipoRadioTV} /> {/* Render the GraphChart component */}
                        </CardContent>
                    </Card>
                   
                    <Card style={{ display: isVisible ? 'block' : 'none' }}>
                        <CardContent>
                        <Typography variant="h5" sx={{ml: 2, mt: 3}}>
                                AUDIENCE 
                                <ExportExcel  exdata={channelNames} fileName="Excel-Export-Ascolti" idelem="export-table"/>
                        </Typography>
                            <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                                AUDIENCE AGGIORNATA: (somma minuti tot di ascolto di ogni canale / {intervalValue} minuti di intervallo considerato
                            </Typography>           
                            <TableContainer id="export-table"  sx={{overflow: 'unset'}}>
                                <Table sx={{minWidth: 800}}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Channel Name</TableCell>
                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                <TableCell key={timeSlotKey}>{timeSlotKey} </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {sortedChannelNames.map((channel, index) => (
                                            <TableRow key={index}>

                                                <TableCell>{channel}</TableCell>
                                                {Object.keys(timeSlots).map((timeSlotKey) => (
                                                    <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                        <span data-tooltip-id="my-tooltip" data-tooltip-content="Audience" >{calculateAudienceByMinute(channel, timeSlotKey)}</span>

                                                    
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
                    <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                (Rapporto tra Ascolto Medio (AMR) e il totale ascoltatori nell’intervallo di riferimento)
                    </Typography>
                                    <ExportExcel  exdata={channelNames} fileName={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('DD-MM-YYYY')}-${dayjs(stopDate).format('MM-DD-YYYY')}`} idelem={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('DD-MM-YYYY')}-${dayjs(stopDate).format('MM-DD-YYYY')}`}/>
                                <br />
                    <TableContainer id={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('DD-MM-YYYY')}-${dayjs(stopDate).format('MM-DD-YYYY')}`}  sx={{maxHeight: '500px',overflow: 'auto'}}>
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
                                                <span data-tooltip-id="my-tooltip" data-tooltip-content={calculateShareSlotCanale(channel, timeSlotKey)} >{calculateShareSlotCanale(channel, timeSlotKey)}</span>
                    
                                            </TableCell>

                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
                </Card>
                <Card style={{ display: 'block', overflow:'auto' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>{ascoltatoriRadioLabel}</Typography>
                                <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                (Percentuale di {ascoltatoriRadioLabel} sul totale popolazione 14+ nell’intervallo di riferimento | pop 52.231.073)
                                </Typography>
                                <ExportExcel fileName={`Export-SHARE-Globale-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  idelem={`Export-SHARE-Globale-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>

                                <br />
                                <TableContainer id={`Export-SHARE-Globale-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{overflow: 'unset'}}>
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

                                                            <TableCell>{ascoltatoriRadioLabel}</TableCell>
                                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content={displayShareRadio(timeSlotKey)} >{calculateShareRadio(timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                            </CardContent>
                            </Card>
                            <Card style={{ display: isVisible ? 'none' : 'block' }}>
                    <Typography variant="h4" sx={{ ml: 2, mt: 3, mb: 2 }}>Sintesi 00:00 - 23:59</Typography>
                      <CardContent  sx={{ pl: 0 }} style={{width:'25%',float:'left'}}>
                      <Typography variant="p" sx={{ ml: 2, mt: 3, mb: 2 }}>Sintesi Gruppo 00:00 - 23:59</Typography>
                        <GraphChartArrBars data={timeSlots} channels={channels} importantChannels={importantChannels} tipoRadioTV={tipoRadioTV} timeSlots={timeSlots} slotSel="00:00:00 - 23:59:59" intervalValue="1440" /> {/* Render the GraphChart component */}
                        </CardContent>
                    <CardContent  sx={{ pl: 0 }}  style={{width:'75%',float:'right'}}>
                    <Typography variant="p" sx={{ ml: 2, mt: 3, mb: 2 }}>Sintesi Canali 00:00 - 23:59</Typography>
                        <GraphChartArrBarsCh data={timeSlots} channels={channels} importantChannels={importantChannels} tipoRadioTV={tipoRadioTV} timeSlots={timeSlots}  slotSel="00:00:00 - 23:59:59" intervalValue="1440" /> {/* Render the GraphChart component */}
                        </CardContent>
                    </Card>
                    <Card style={{ display: isVisible ? 'none' : 'block' }}>
                    <Typography variant="h4" sx={{ ml: 2, mt: 3, mb: 2 }}>Sintesi 06:00 - 23:59</Typography>
                        <CardContent  sx={{ pl: 0 }} style={{width:'25%',float:'left'}}>
                        <Typography variant="p" sx={{ ml: 2, mt: 3, mb: 2 }}>Sintesi Gruppo 06:00 - 23:59</Typography>
                        <GraphChartArrBars data={timeSlots} channels={channels} importantChannels={importantChannels} tipoRadioTV={tipoRadioTV} timeSlots={timeSlots} slotSel="06:00:00 - 23:59:59" intervalValue="1080" /> {/* Render the GraphChart component */}
                        </CardContent>
                        <CardContent  sx={{ pl: 0 }}  style={{width:'75%',float:'right'}}>
                        <Typography variant="p" sx={{ ml: 2, mt: 3, mb: 2 }}>Sintesi Canali 06:00 - 23:59</Typography>
                        <GraphChartArrBarsCh data={timeSlots} channels={channels} importantChannels={importantChannels} tipoRadioTV={tipoRadioTV} timeSlots={timeSlots}  slotSel="06:00:00 - 23:59:59" intervalValue="1080" /> {/* Render the GraphChart component */}
                        </CardContent>
                    </Card> 
            </Scrollbar>
            <Tooltip id="my-tooltip" />
        </Container>
        
    );

}
