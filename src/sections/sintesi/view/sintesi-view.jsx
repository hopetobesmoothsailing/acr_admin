import axios from "axios";
import dayjs from "dayjs";
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

// ----------------------------------------------------------------------

export default function SintesiView() {

    const channels = [];
    const pesoNum = 1
    
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleDett, setIsVisibleDett] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible); // Toggle the visibility state
    };
    const shareVisibility = () => {
        setIsVisible(false); // Toggle the visibility state
    };
    const dettVisibility = () => {
        setIsVisibleDett(!isVisibleDett); // Toggle the visibility state
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
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('DD/MM/YYYY'));
    const [stopDate, setStopDate] = useState(dayjs().add(0, 'day').format('DD/MM/YYYY'));
    const [users, setUsers] = useState([]);
    console.log("SEL_DATE",selectedDate);
    console.log("START_DATE",startDate);
    console.log("STOP_DATE",stopDate);
    // Convert date from DD/MM/YYYY to YYYY-MM-DD for backend
    const formatDateForBackend = (date) => dayjs(date, 'DD/MM/YYYY').format('YYYY-MM-DD');


    // Function to submit dates to backend
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
    
    
    // Function to handle button click to change the displayed table
    
    const handlePrint = () => {
      window.print();
    };

    let tipoRadioTV = 'RADIO';
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('type');
    if (tipo === null) { tipoRadioTV = 'RADIO';}
    else { tipoRadioTV = 'TV';}

    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchACRDetailsByRange = async () => {
           
            try {
                setLoading(true);
                // const formattedDate = selectedDate; // Encode the date for URL

                const response = (await axios.post(`${SERVER_URL}/getACRDetailsByRangeRTV`, {'startDate': startDate,'stopDate':stopDate,'type':tipoRadioTV,'notnull':'yes'})).data; // Adjust the endpoint to match your server route
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

    console.log(acrDetails);
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
        window.history.replaceState({}, '', `?interval=${selectedValue}`);
      };
      
      const timeSlots = generateTimeSlots(intervalValue);
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

    console.log("TIMESLOTS",timeSlots)
    
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

   
    const calculateAudienceByMinute = (channel, slot) => {
        // const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        const minutoMedio = timeSlots[slot][channel] || 0 ;
        // console.log("MINUTO MEDIO:", minutoMedio);
        const audienceByMinute = minutoMedio*pesoNum/intervalValue;
        
        // console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
        // Calculate the share percentage for the channel in the given time slot
        return audienceByMinute.toFixed(1);
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
        const audienceByMinute = minuto*pesoNum;
        const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
        return shareSlotCanale.toFixed(2);

    };

    if (loading) {
        return <p>Caricamento dati raccolti in corso... </p>; // You can replace this with your loading indicator component
        }

            return (
                <Container>
                    <Scrollbar style={{ width: '100%'}}>              
                    <Typography variant="h4" sx={{mb: 5}}>
                       Sintesi degli ascolti per le date selezionate
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                        label="Start Date"
                        value={dayjs(startDate, 'DD/MM/YYYY')}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                        label="Stop Date (optional)"
                        value={dayjs(stopDate, 'DD/MM/YYYY')}
                        onChange={(newValue) => setStopDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        />
                         <Button onClick={handleSubmitDates}>Submit</Button>
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                        <DemoContainer components={['DatePicker']}>                             
                            <Button onClick={shareVisibility}>SHARE</Button>
                            <Button onClick={toggleVisibility}>ASCOLTI</Button>
                            <Button onClick={handlePrint}>STAMPA</Button>
                            <Button onClick={dettVisibility}>DETTAGLIO</Button>
                            <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </DemoContainer>
                    </LocalizationProvider>
                    <Card style={{ display: isVisible ? 'none' : 'block' }}>
                        <CardContent  sx={{ pl: 0 }}>
                        <GraphChartArr data={timeSlots}  intervalValue={intervalValue} /> {/* Render the GraphChart component */}
                        </CardContent>
                    </Card>
                    <Card style={{ display: isVisible ? 'none' : 'block' }}>
                        <CardContent  sx={{ pl: 0 }}>
                        <GraphChartArrBars data={timeSlots} channels={channels} timeSlots={timeSlots} intervalValue={intervalValue} /> {/* Render the GraphChart component */}
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
                                        {channelNames.sort().reverse().map((channel, index) => (
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
                    <Typography variant="p" sx={{ ml: 2, mt: 3, mb: 2 }}>Data da rapporto tra AMR e AUDIENCE nell&apos;intervallo considerato di ${intervalValue} minuti.</Typography>
                    <br />
                    <TableContainer id="export-table-share">
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                            <TableCell>IntervalloTemporale</TableCell>
                            {Object.keys(userListeningMap).map((channel) => (
                                <TableCell key={channel}>{channel}</TableCell>
                            ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {timeSlotLabels.map((timeSlotKey, index) => (
                            <TableRow key={index}>
                                <TableCell><strong>{timeSlotKey}</strong></TableCell>
                                {Object.keys(userListeningMap).map((channel) => (
                                <TableCell style={{ textAlign: 'center' }} key={channel}>
                                    {/* Use calculateAudienceShare to retrieve data */}
                                    <span data-tooltip-id="my-tooltip" data-tooltip-content="Share Canale">{calculateShareSlotCanale(channel, timeSlotKey)}%</span>
                                </TableCell>
                                ))}
                            </TableRow>
                            ))}
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
