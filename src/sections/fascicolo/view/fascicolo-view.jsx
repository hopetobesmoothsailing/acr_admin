import 'dayjs/locale/it'; // Import the Italian locale
import axios from "axios";
import dayjs from "dayjs";
// import {enqueueSnackbar} from "notistack";
import customParseFormat from 'dayjs/plugin/customParseFormat'; // For parsing custom formats
import 'leaflet/dist/leaflet.css';
import { Tooltip } from 'react-tooltip'
import {useState, useEffect} from 'react';
import { /* useNavigate, */useLocation } from 'react-router-dom';
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
    // const navigate = useNavigate();
  
    const location = useLocation();
    const [loading, setLoading] = useState(true);
     
    
     // State to track the active button ("share" or "ascolti")
     const [activeButton, setActiveButton] = useState('share'); // Default to showing "share"

     // Modify your button click handlers to simply update the activeButton state
     const handleShareClick = () => {
       setActiveButton('share');
     };
     
     const handleAscoltiClick = () => {
       setActiveButton('ascolti');
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
    let ascoltatoriRadioLabel = '';
    if ((tipo === null)||(tipo === 'RADIO')) { 
        tipoRadioTV = 'RADIO';
        
        importantChannels = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RDS','RTL','Radio24','RadioM2O','RADIOSUBASIO','RADIOKISSKISS','RadioFRECCIA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioZETA','RadioItaliaSMI','RadioNORBA'];
        ascoltatoriRadioLabel = 'ASCOLTATORI RADIO';

    }
    else { 
        tipoRadioTV = 'TV';
        importantChannels = ['RAI1', 'RAI2','RAI3','RETE4','CANALE5','ITALIA1','LA7'];
        ascoltatoriRadioLabel = 'SPETTATORI TV';
    }

    useEffect(() => {
        // Function to fetch ACR details by date
        const fetchACRDetailsByDate = async () => {
           
            try {
                setLoading(true);
                const formattedDate = selectedDate; // Encode the date for URL

                const response = (await axios.post(`${SERVER_URL}/getACRDetailsByDateRTV`, {'date': formattedDate,'type':tipoRadioTV,'notnull':'yes'})).data; // Adjust the endpoint to match your server route
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
      
      const formatMinute = (minute) => {
        const hours = Math.floor(minute / 60).toString().padStart(2, '0');
        const minutes = (minute % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      
      // Usage example:
      const intervalOptions = [
        { label: '15 min', value: 15 },
        { label: '30 min', value: 30 },
        { label: '1 ora', value: 60 },
        { label: '3 ore', value: 180 },
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
      // console.log(timeSlots);
      const uniquetimeSlots = generateTimeSlots(intervalValue);

      const filteredACRDetails = acrDetails.filter(item => {
        const recordedAt = item.recorded_at;
        // Parse the date and time from the recorded_at field
        const [, timePart] = recordedAt.split(' ');
         const [hours,] = timePart.split(':').map(Number);
        // Define the time range
        const startHour = 0; // 06:00 AM
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
                    weight_s = parseInt(idToWeightMap[item.user_id],10);
                    // console.log("PESO UTENTE item.user_id", weight_s)
                    if (weight_s > 0 ){  
                    if (!timeSlots[slotKey][item.acr_result]) {
                        timeSlots[slotKey][item.acr_result] = 1*weight_s;
                    } else {
                        timeSlots[slotKey][item.acr_result] += 1*weight_s;
                    }
                    if (!uniquetimeSlots[slotKey][item.user_id]) {
                        uniquetimeSlots[slotKey][item.user_id]=weight_s;
                    }
                    }
                }
            });
        }
    });

    // const timeSlotLabels = Object.keys(timeSlots);   
    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
    channelNames.sort();

    // Initialize userListeningMap
        const userListeningMap = {};
        const userListeningMapWeight = {};

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
    // console.log("USER LISTENING MAP WEIGHT",userListeningMapWeight);
    // console.log(userListeningMapAudience);

   
    const calculateAudienceByMinute = (channel, slot) => {
        const minutoMedio = timeSlots[slot][channel] || 0 ;
        let audienceByMinute = 0;
        if (slot === '00:00 - 23:59') {
        const day_interval = 1440;
        audienceByMinute = minutoMedio*pesoNum/(day_interval);
        }
        else if (slot === '06:00 - 23:59') {
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
    const calculateAscoltoRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        // const dati = uniquetimeSlots[slot];
        let ar = 0;
        channels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                const dati = userListeningMap[canalealtro]?.[slot];
                if (dati) {
                dati.forEach((item) => {
                    // console.log("ar:item",item)
                    ar += item

                });
                }
                // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
                // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
                // ar += parseFloat(timeSlots[slot][canalealtro] || 0)
            }
        });
        console.log("AR Tot userlistmap dati",ar);

        const perc_ar = ar.toFixed(0);
        return perc_ar;
    }
    const calculateAscoltoRadioCanale = (channel, slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        let ar = 0;
        const dati = userListeningMap[channel]?.[slot];
        // console.log("userlistmap dati",dati);
        if (dati) {
        dati.forEach((item) => {
            // console.log("ar:item",item)
            ar += item

        });
        }
        const perc_ar = ar.toFixed(0);
        return perc_ar; 
    }
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
    const displayAscoltiRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        // const dati = uniquetimeSlots[slot];
        let ar = 0;
        channels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                const dati = userListeningMap[canalealtro]?.[slot];
                if (dati) {
                dati.forEach((item) => {
                    // console.log("ar:item",item)
                    ar += item

                });
                }
                // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
                // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
                // ar += parseFloat(timeSlots[slot][canalealtro] || 0)
            }
        });
        ar = (ar/52231073)*100;
           return `( ${ar.toFixed(0)}% (popolazione italiana) )`;

    }
    
    /* const calculateContattidup = (slot) => {
        let contattiCanaliFasciaOraria= 0
        channels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                const uniqueUsersListeningch = userListeningMap[canalealtro]?.[slot]?.size || 0;
                contattiCanaliFasciaOraria += uniqueUsersListeningch; 
               // audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
            }
        });

        // come indicato da cristiano corrisponde ai minuti totali di ascolto nel periodo e non minuti * utenti
        // const audienceByMinute = minuto*(uniqueUsersListening*pesoNum);
        
        const contattidup_perc = contattiCanaliFasciaOraria ;
        return contattidup_perc;

    };
    */

    /* const audienceSizes = Object.keys(timeSlots['06:00 - 23:59'] || {}).reduce((acc, channel) => {
        acc[channel] = timeSlots['06:00 - 23:59'][channel];
        return acc;
    }, {});
    */
    const audienceSizes24 = Object.keys(timeSlots['00:00 - 23:59'] || {}).reduce((acc, channel) => {
        acc[channel] = timeSlots['00:00 - 23:59'][channel];
        return acc;
    }, {});

    // Sort channelNames based on audience size
    const sortedChannelNames = channelNames.sort((a, b) => (audienceSizes24[b] || 0) - (audienceSizes24[a] || 0));
      
    const disableDates = (date) => {
        // Define the minimum date that can be selected (29/01/2024)
        const minDate = dayjs('29/01/2024', 'DD/MM/YYYY');
        // Get the current date and time
        // const now = dayjs();
      
        // Check if the date is before the minimum date
        if (date.isBefore(minDate, 'day')) {
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
  
    // Function to determine if the selected date should disable content
    /* const checkContentVisibility = (date) => {
        const minDate = dayjs('29/01/2024', 'DD/MM/YYYY');
        const now = dayjs();
        const dayjsDate = dayjs(date, 'DD/MM/YYYY');
        
        // Ensure dayjsDate is valid
        if (!dayjsDate.isValid()) {
          console.log('Selected date is invalid.');
          return false;
        }
      
        return dayjsDate.isBefore(minDate, 'day')  || (dayjsDate.isSame(now, 'day') && now.hour() < 23);
      };
    */
    // Update content visibility based on selected date
    /* useEffect(() => {
        const dateIsValid = checkContentVisibility(selectedDate);
        console.log("INVALID",selectedDate);
        console.log("INVALID",dateIsValid);
        if (dateIsValid) {
            enqueueSnackbar(`Non hai accesso a questa pagina!`, {variant: 'error'});
            navigate('/'); // Assuming '/404' is your path to the 404 page
        }
    }, [selectedDate, navigate]);
    */

    
        if (loading) {
        return <p>Caricamento dati raccolti in corso... </p>; // You can replace this with your loading indicator component
        }
 
            return (
                <Container>
                    <Scrollbar style={{ width: '100%'}}>
                
                    <Typography variant="h4" sx={{mb: 5}}>
                        FASCICOLO degli ascolti  {tipoRadioTV} per la data {selectedDate}
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
                            <Button
                            variant={activeButton === 'share' ? 'contained' : 'outlined'}
                            onClick={handleShareClick}
                            >
                            SHARE
                            </Button>
                            <Button
                            disabled= {tipo === 'TV' ? 'disabled': ''}
                            variant={activeButton === 'ascolti' ? 'contained' : 'outlined'}
                            onClick={handleAscoltiClick}
                            >
                            ASCOLTI
                            </Button>
                            <Button disabled onClick={handlePrint}>STAMPA</Button>
                            <select id="intervalSelect" value={intervalValue} onChange={handleIntervalChange}>
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>

                        </DemoContainer>
                    </LocalizationProvider>
                     
                                {activeButton === 'share'  && (
                                <Card style={{ display: 'block' }}>
                                    <CardContent  sx={{ pl: 0 }}>
                                    <GraphChartArr activeButton={activeButton} data={timeSlots}  intervalValue={intervalValue} importantChannels={channels} tipoRadioTV={tipoRadioTV} /> {/* Render the GraphChart component */}
                                    </CardContent>
                                </Card>
                                )}

                                {activeButton === 'ascolti'   && (
                                <Card style={{ display: 'none' }}>
                                        <CardContent  sx={{ pl: 0 }}>
                                        <GraphChart activeButton={activeButton} userListeningMap={userListeningMap}  tipoRadioTV={tipoRadioTV}  /> {/* Render the GraphChart component */}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeButton === 'ascolti'  && (
                                <Card style={{ display: 'block' }}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ml: 2, mt: 3}}>
                                                ASCOLTO MEDIO (AMR)
                                        </Typography>
                                            
                                    <Typography variant="p" sx={{ml: 2, mt: 3}}>
                                    (Rapporto tra la somma degli {ascoltatoriRadioLabel} per minuto e la durata in minuti dell’intervallo di riferimento)
                                    </Typography>
                                    <ExportExcel  exdata={channelNames} fileName={`Export-Ascolti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`} idelem={`Export-Ascolti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>
                            
                                        <TableContainer id={`Export-Ascolti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{maxHeight: '500px',overflow: 'auto'}}>
                                            <Table sx={{minWidth: 800}}>
                                                
                                                <TableHead>
                                                <TableRow>
                                                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>
                                                    EMITTENTE
                                                    </TableCell>
                                                    {Object.keys(timeSlots).map((timeSlotKey) => (
                                                    <TableCell key={timeSlotKey} style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>
                                                    <strong> {timeSlotKey} </strong> 
                                                    </TableCell>
                                                    ))}
                                                </TableRow>

                                                </TableHead>

                                                <TableBody>
                                                    {sortedChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel}</TableCell>
                                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content={calculateAudienceByMinute(channel, timeSlotKey)} >{calculateAudienceByMinute(channel, timeSlotKey)}</span>


                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        
                                    </CardContent>
                                </Card>
                                )}
                            {activeButton === 'share'  && (
                                <Card style={{ display: 'block' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>SHARE (SH)</Typography>
                                <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                (Rapporto tra Ascolto Medio (AMR) e il totale ascoltatori nell’intervallo di riferimento)
                                </Typography>
                                    <ExportExcel  exdata={channelNames} fileName={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`} idelem={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>
                                <br />
                                <TableContainer id={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{maxHeight: '500px',overflow: 'auto'}}>
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

                                                            <TableCell>{channel}%</TableCell>
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
                            )}
                            {activeButton === 'share' && (tipo !== 'TV') && (
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
                            )}
                            {activeButton === 'ascolti'  && (
                            <Card style={{ display: 'block', overflow:'auto' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>{ascoltatoriRadioLabel}</Typography>
                                <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                (Percentuale di {ascoltatoriRadioLabel} sul totale popolazione 14+ nell’intervallo di riferimento | pop 52.231.073)
                                </Typography>


                                <ExportExcel fileName="Excel-Export-Share-Global" idelem={`export-table-share-global_${tipoRadioTV}`}/>
                                
                                <TableContainer id={`export-table-share-global_${tipoRadioTV}`}  sx={{overflow: 'unset'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell> </TableCell>
                                                        {Object.keys(timeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey}><strong>{timeSlotKey}</strong></TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {sortedChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel}</TableCell>
                                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip"  >{calculateAscoltoRadioCanale(channel, timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                        <TableRow >

                                                            <TableCell><strong>{ascoltatoriRadioLabel}</strong></TableCell>
                                                            {Object.keys(timeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                   <strong> <span data-tooltip-id="my-tooltip" data-tooltip-content={displayAscoltiRadio(timeSlotKey)} >{calculateAscoltoRadio(timeSlotKey)}</span></strong>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                            </CardContent>
                            </Card>
                            )}               
                       

            </Scrollbar>


                                        
            
                     
               
                
            <Tooltip id="my-tooltip" />
            </Container>
        
    );

}
