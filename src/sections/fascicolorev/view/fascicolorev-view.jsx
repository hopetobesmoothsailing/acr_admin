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
// import GraphChartArrBars from "../graph-chart-arr-bars";
import GraphChartContatti from "../graph-chart-contatti";
// import GraphChartArrBarsCh from "../graph-chart-arr-bars-ch";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian

// ----------------------------------------------------------------------

export default function FascicolorevView() {

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
    const handleContattiClick = () => {
        setActiveButton('contatti');
    };
    const handleMinutiClick = () => {
        setActiveButton('minuti');
    };

    let importantChannels = [];
    const userListeningMap = {};
    const userListeningMapWeight = {};
    const userListening5minMapWeight={};


    const [acrDetails, setACRDetails] = useState([]);
    const today = new Date(); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
    const [selectedDate, setSelectedDate] = useState(dayjs(yesterday).format('DD/MM/YYYY'));

    const [users, setUsers] = useState([]);
   
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
        
        importantChannels = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RDS','RTL','Radio24','RadioM2O','RADIOKISSKISS','RadioFRECCIA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioItaliaSMI'];
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
            if (user.weight_s > 0) {
            idToWeight[user._id] = user.weight_s;
            }
             
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
        { label: '1 ora', value: 60 },
        { label: '3 ore', value: 180 },
        { label: '24 ore', value: 1440 },
      ];
    const intervalStepOptions = [
        { label: 'Almeno 1 minuto', value: 1 },
        { label: 'Almeno 5 minuti', value: 5 },
        { label: 'Almeno 15 minuti', value: 15 },
    ];
    const defaultInterval = 180; // Default interval value
    const defaultStepInterval = 1; // Default interval value
    const [intervalValue, setIntervalValue] = useState(getIntervalFromURL() || defaultInterval); // Initialize with default interval or from URL
    const [intervalStepValue, setIntervalStepValue] = useState(getIntervalStepFromURL() || defaultStepInterval); // Initialize with default interval or from URL

      // Function to get the interval value from the URL query parameter
    function getIntervalFromURL() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('interval'), 10);
    }
    function getIntervalStepFromURL() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('intervalStep'), 10);
    }
    
      // Function to handle interval change
    const handleChangeInterval = (event) => {
        const selectedValue = parseInt(event.target.value,10);
        setIntervalValue(selectedValue);
        // Update the URL with the new interval value as a query parameter
    };
    const handleChangeStepInterval = (event) => {
        const selectedValue = parseInt(event.target.value,10);
        setIntervalStepValue(selectedValue);
      //  window.location.reload();            
        // Update the URL with the new interval value as a query parameter
    };    
      // Function to handle interval change
    const handleSubmit = async () => {
         // Update the URL with the new interval value as a query parameter
        window.history.replaceState({}, '', `?interval=${intervalValue}&intervalStep=${intervalStepValue}`);
    };
    
    const timeSlots = generateTimeSlots(intervalValue);
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
  
      // PROBLEMA SE PASSO DI RAGGRUPPAMENTO SUPERIORE AL MINUTO PERCHE' ALTRERADIO DIVENTA IL CANALE
      // QUESTO SIGNIFICA CHE 5 FALSI POSITIVI COSTITUISCONO UN ASCOLTO ALTRERADIO => ERRORE NEI CALCOLI DEI TOTALI
      // Filter out less important channels and group them under "ALTRERADIO"
    
 
    const groupedACRDetails = filteredACRDetails;

        // Assuming groupedACRDetails is already populated as per your snippet
    // const orderedACRDetails = groupedACRDetails.sort((a, b) => (Number(a.user_id) - Number(b.user_id)));
    const orderedACRDetailsXmin = groupedACRDetails.sort((a, b) => (Number(a.user_id) - Number(b.user_id)));
    
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
                    let weight_s = 0;
                    weight_s = idToWeightMap[item.user_id];
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

    
    // console.log("TSGENDER",timeSlotsGender);
    // const timeSlotLabels = Object.keys(timeSlots);   
    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
   
    console.log(channelNames);
    channelNames.sort();
    
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
                            // let weight_s = 0
                            // weight_s = idToWeightMap[item.user_id];
                            if (!userListeningMap[item.acr_result]) {
                                userListeningMap[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                                userListeningMapWeight[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                            }

                            if (!userListeningMap[item.acr_result][slotKey]) {
                                userListeningMap[item.acr_result][slotKey] = new Set(); // Initialize the set for the slot if it doesn't exist
                                userListeningMapWeight[item.acr_result][slotKey] = new Set(); // Initialize the set for the slot if it doesn't exist
                            }

                            userListeningMap[item.acr_result][slotKey].add(item.weight_s); // Add user to the set for the corresponding time slot and channel
                            userListeningMapWeight[item.acr_result][slotKey].add(item.user_id); // Add user to the set for the corresponding time slot and channel
                        }
                    }
                });
                 // New logic to populate userListening5minMapWeight based on 5-minute recognition criterion
            
            
            }
    });
    // console.log("ORDERED",orderedACRDetails);
    const userRecognitionCounts = {}; // Format: { [slotKey]: { [userId]: count } }

    orderedACRDetailsXmin.forEach(item => {
        const recordedAt = item.recorded_at;
        const [, time] = recordedAt.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const minuteOfDay = hours * 60 + minutes;
    
        Object.entries(timeSlots).forEach(([slotKey, slotRange]) => {
            const [start, end] = slotKey.split(' - ').map(timex => {
                const [hour, minute] = timex.split(':').map(Number);
                return hour * 60 + minute;
            });
    
            if (minuteOfDay >= start && minuteOfDay <= end) {
                // Initialize the slot if not already done
                if (!userRecognitionCounts[slotKey]) {
                    userRecognitionCounts[slotKey] = {};
                }
                // Initialize the channel within the slot if not already done
                if (!userRecognitionCounts[slotKey][item.acr_result]) {
                    userRecognitionCounts[slotKey][item.acr_result] = {};
                }
                // Initialize the user within the channel of a slot if not already done, then increment
                if (!userRecognitionCounts[slotKey][item.acr_result][item.user_id]) {
                    userRecognitionCounts[slotKey][item.acr_result][item.user_id] = 1;
                } else {
                    userRecognitionCounts[slotKey][item.acr_result][item.user_id] += 1;
                }
            }
        });
    });
    // const displayChannels = [...importantChannels, "ALTRERADIO"]; // Add "ALTRERADIO" for display
  
    // console.log("userRecog:",userRecognitionCounts);
    const userListening1minMapWeight = {};
    const userListening15minMapWeight = {};
    // Iterate through each time slot
    Object.entries(userRecognitionCounts).forEach(([slotKey]) => {
        // Iterate through each channel within the slot
        Object.entries(userRecognitionCounts[slotKey]).forEach(([channel, userIds]) => {
            // Iterate through each user within the channel
            Object.entries(userIds).forEach(([userId, count]) => {
                // Check if the user has 5 or more recognitions
                if (count >= 1) {
                    // Initialize the channel if not already done
                    if (!userListening1minMapWeight[channel]) {
                        userListening1minMapWeight[channel] = {};
                    }
                    // Initialize the slot within the channel if not already done
                    if (!userListening1minMapWeight[channel][slotKey]) {
                        userListening1minMapWeight[channel][slotKey] = new Set();
                    }
                    // Add the user to the set for this channel and time slot
                    userListening1minMapWeight[channel][slotKey].add(userId);
                }
                if (count >= 5) {
                    // Initialize the channel if not already done
                    if (!userListening5minMapWeight[channel]) {
                        userListening5minMapWeight[channel] = {};
                    }
                    // Initialize the slot within the channel if not already done
                    if (!userListening5minMapWeight[channel][slotKey]) {
                        userListening5minMapWeight[channel][slotKey] = new Set();
                    }
                    // Add the user to the set for this channel and time slot
                    userListening5minMapWeight[channel][slotKey].add(userId);
                }
                if (count >= 15) {
                    // Initialize the channel if not already done
                    if (!userListening15minMapWeight[channel]) {
                        userListening15minMapWeight[channel] = {};
                    }
                    // Initialize the slot within the channel if not already done
                    if (!userListening15minMapWeight[channel][slotKey]) {
                        userListening15minMapWeight[channel][slotKey] = new Set();
                    }
                    // Add the user to the set for this channel and time slot
                    userListening15minMapWeight[channel][slotKey].add(userId);
                }
            });
        });
    });
        

            
            
 
    // console.log("USER LISTENING MAP WEIGHT",userListeningMapWeight);
    // console.log("USER LISTENING MAP WEIGHT 15 min",userListening15minMapWeight);
    // console.log("USER LISTENING MAP ",userListeningMap);
    // console.log("USER WEIGHT ",idToWeightMap);

    
   
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
        let audienceByMinutestr = "*";
        if (audienceByMinute > 0) {
            audienceByMinutestr = audienceByMinute.toFixed(0).toString().replace(".", ",");
        }
        
        return audienceByMinutestr;
    };
    const calculateAudienceByMinuteAltre = (slot) => {
        let minutoMedio = 0 ;
       
       
        nonImportantChannels.forEach(canalealtre => {
            if ((canalealtre !== "NULL")) {
                   minutoMedio += parseFloat(timeSlots[slot][canalealtre] || 0)
            }
        });
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
        let audienceByMinutestr = "*";
        if (audienceByMinute > 0) {
            audienceByMinutestr = audienceByMinute.toFixed(0).toString().replace(".", ",");
        }
        
        return audienceByMinutestr;
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
        const audienceByMinute = minuto;
 
        const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
        let retSh = "*";
        if (shareSlotCanale > 0) retSh = shareSlotCanale.toFixed(1).toString()
        return retSh;

    };
    const calculateShareSlotCanaleAltre = (slot) => {
        let audienceSlotCanali = 0;

        channels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
                // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
                audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
            }
        });
        let minuto = 0;
        nonImportantChannels.forEach(canalealtre => {
            if ((canalealtre !== "NULL")) {
                // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
                // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
                minuto += parseFloat(timeSlots[slot][canalealtre] || 0)
            }
        });
        const audienceByMinute = minuto;
        const shareSlotCanale = (((audienceByMinute/intervalValue) || 0)/ (audienceSlotCanali/intervalValue))*100 || 0 ;
        let retSh = "*";
        if (shareSlotCanale > 0) retSh = shareSlotCanale.toFixed(1).toString()
        return retSh;
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
    } */
    const calculateAscoltoRadio = (slot) => {
        // console.log("uniquetimeSlots",uniquetimeSlots[slot]);
        const dati = uniquetimeSlots[slot];
        let ar = 0;
        dati.forEach((item) => {
            // console.log("ar:item",item)
            ar += item

        });
        const perc_ar = ar.toFixed(0);
        return perc_ar;
    }


    const calculateAscoltoRadioCanale = (channel, slot,intstep) => {
        if (!intstep) intstep = 1;

        // console.log("idToWM", idToWeightMap);
        let ar = 0;
        let dati = [];
        dati = userListeningMapWeight[channel]?.[slot];
        if (intstep === 5)
        dati = userListening5minMapWeight[channel]?.[slot];
        if (intstep === 15)
        dati = userListening15minMapWeight[channel]?.[slot];

        if (dati) {
            dati.forEach((item) => {
                const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                
                ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
            });
        }
        let perc_ar = 0;
        if (ar > 0)
            perc_ar = ar.toFixed(0);
        else 
            perc_ar = "*";
        return perc_ar;
    };
    const calculateAscoltoRadioCanale5min = (channel, slot) => {
        // console.log("idToWM", idToWeightMap);
        let ar = 0;
        
        const dati = userListening5minMapWeight[channel]?.[slot];
        // console.log("DATIARC5m",dati);
        if (dati) {
            dati.forEach((item) => {
                const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                
                ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
            });
        }
        let perc_ar = 0;
        if (ar > 0)
            perc_ar = ar.toFixed(0);
        else 
            perc_ar = "*";
        return perc_ar;
    };
    
    const calculateAscoltoRadioCanale15min = (channel, slot) => {
        // console.log("idToWM", idToWeightMap);
        let ar = 0;
        
        const dati = userListening15minMapWeight[channel]?.[slot];
        if ((channel === "ALTRERADIO")&&(slot === '00:00 - 02:59')) {
           //  console.log("DATIARC15m",dati);
        }
        if (dati) {
            dati.forEach((item) => {
                const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                /* if ((channel === "ALTRERADIO")&&(slot === '00:00 - 02:59')) {
                    console.log("ar15:ch", channel);
                    console.log("ar15:slot", slot);
                    console.log("ar15:item", item);
                    console.log("ar15:item_weight", pesoitem);
                } */
                ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
            });
        }
        let perc_ar = 0;
        if (ar > 0)
            perc_ar = ar.toFixed(0);
        else 
            perc_ar = "*";
        return perc_ar;
    };
   
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

    const calculateDurataMediaCanale = (channel,slot,intstep) => {
        const minuto = timeSlots[slot][channel] || 0 ;
        if (!intstep) intstep=1;
        const audienceChannel = calculateAscoltoRadioCanale(channel,slot,intstep);
        const audienceByMinute = minuto;
        // console.log("AMR",audienceByMinute);
        // console.log("AMR-CANALE",audienceChannel);
        const durmedia = ((audienceByMinute/audienceChannel) || 0) ;
        
        return convertMinutesToTimeString(durmedia);
    }
    const calculateDurataMediaCanaleAltre = (slot,intstep) => {
        let minuto = 0;
        if (!intstep) intstep=1;
        nonImportantChannels.forEach(canalealtre => {
            if ((canalealtre !== "NULL")) {
                // const uniqueUsersListeningch = userListeningMap[channel]?.[slot]?.size || 0;
                // audienceSlotCanali += uniqueUsersListeningch*parseFloat(timeSlots[slot][canalealtro] || 0)
                minuto += parseFloat(timeSlots[slot][canalealtre] || 0)
            }
        });
        let audienceChannel=0;
        if (intstep === 1)
            audienceChannel = calculateAscoltoRadioCanale1minAltre(slot);
        if (intstep === 5)
            audienceChannel = calculateAscoltoRadioCanale5minAltre(slot);
        if (intstep === 15)
            audienceChannel = calculateAscoltoRadioCanale15minAltre(slot);

        const audienceByMinute = minuto;
        // console.log("DURMEDIA",audienceByMinute);
        // console.log("DURMEDIA-CANALE",audienceChannel);
        const durmedia = ((audienceByMinute/audienceChannel) || 0) ;
        
        return convertMinutesToTimeString(durmedia);
    }
    const audienceSizes24 = Object.keys(timeSlots['00:00 - 23:59'] || {}).reduce((acc, channel) => {
        acc[channel] = timeSlots['00:00 - 23:59'][channel];
        return acc;
    }, {});
     

    // Sort channelNames based on audience size
    // const sortedChannelNames = channelNames.sort((a, b) => (audienceSizes24[b] || 0) - (audienceSizes24[a] || 0));
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

      function aggregateChannels(data) {
        const aggregatedData = {};
    
        Object.keys(data).forEach(timeslot => {
            const xchannels = data[timeslot];
            let altreradioSum = 0; // Initialize ALTRERADIO sum for each timeslot
            const newChannels = {};
    
            Object.entries(xchannels).forEach(([channel, value]) => {
                if (importantChannels.includes(channel)) {
                    // Keep important channels as they are
                    newChannels[channel] = value;
                } else {
                    // Sum values of non-important channels into ALTRERADIO
                    altreradioSum += value;
                }
            });
    
            // Add "ALTRERADIO" entry with summed values
            newChannels.ALTRERADIO = (newChannels.ALTRERADIO || 0) + altreradioSum;
    
            aggregatedData[timeslot] = newChannels;
        });
    
        return aggregatedData;
    }
    
    const aggregatedTimeSlots = aggregateChannels(timeSlots);
    // console.log("AGGREGATEDXMIN",aggregatedTimeSlots);
    // Filter channelNames to include only those present in importantChannels
    const filteredChannelNames = channelNames.filter(channel => importantChannels.includes(channel));
    // Now sort these filtered channels if needed, for example, based on some criteria like audience size (if audienceSizes24 is your audience size map)
    const sortedFilteredChannelNames = filteredChannelNames.sort((a, b) => (audienceSizes24[b] || 0) - (audienceSizes24[a] || 0));
    const allChannels = Object.keys(userListeningMapWeight); // Get all channels from your data
    const nonImportantChannels = allChannels.filter(channel => !importantChannels.includes(channel));


    const calculateAscoltoRadioCanale1minAltre = (slot) => {
        // console.log("idToWM", idToWeightMap);
        let ar = 0;
        nonImportantChannels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                // console.log("1MinAltre:",canalealtro);
                const dati = userListening1minMapWeight[canalealtro]?.[slot];
                if (dati) {
                    dati.forEach((item) => {
                        const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                        
                        ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
                        // console.log("ARALTRE1MIN:",ar);
                    });
                }
            }
        });
        let perc_ar = 0;
        if (ar > 0)
            perc_ar = ar.toFixed(0);
        else 
            perc_ar = "*";
        return perc_ar;
    };
    const calculateAscoltoRadioCanale5minAltre = (slot) => {
        // console.log("idToWM", idToWeightMap);
        let ar = 0;
        nonImportantChannels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                const dati = userListening5minMapWeight[canalealtro]?.[slot];
                if (dati) {
                    dati.forEach((item) => {
                        const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                        
                        ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
                    });
                }
            }
        });
        let perc_ar = 0;
        if (ar > 0)
            perc_ar = ar.toFixed(0);
        else 
            perc_ar = "*";
        return perc_ar;
    };
    const calculateAscoltoRadioCanale15minAltre = (slot) => {
        // console.log("idToWM", idToWeightMap);
        let ar = 0;
        nonImportantChannels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                const dati = userListening15minMapWeight[canalealtro]?.[slot];
                if (dati) {
                    dati.forEach((item) => {
                        const pesoitem = idToWeightMap[item]; // Corrected access to idToWeightMap
                        
                        ar += pesoitem || 0; // Added a fallback to 0 if pesoitem is undefined
                    });
                }
            }
        });
        let perc_ar = 0;
        if (ar > 0)
            perc_ar = ar.toFixed(0);
        else 
            perc_ar = "*";
        return perc_ar;
    };
    
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
                            <Button
                            disabled= {tipo === 'TV' ? 'disabled': ''}
                            variant={activeButton === 'minuti' ? 'contained' : 'outlined'}
                            onClick={handleMinutiClick}
                            >
                            MINUTI
                            </Button>
                            <Button
                            disabled= {tipo === 'TV' ? 'disabled': ''}
                            variant={activeButton === 'contatti' ? 'contained' : 'outlined'}
                            onClick={handleContattiClick}
                            >
                            CONTATTI
                            </Button>
                            {activeButton !== 'minuti'   && (
                            <select id="intervalSelect" value={intervalValue} onChange={handleChangeInterval}  >
                                {intervalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            )}
                            {activeButton === 'contatti'   && (
                                <select id="intervalStepSelect"  onChange={handleChangeStepInterval} value={intervalStepValue} >
                                {intervalStepOptions.map((option) => (
                                <option key={`s_${option.value}`} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            )}
                            <Button onClick={handleSubmit}>APPLICA FILTRI</Button>
            
                        </DemoContainer>
                    </LocalizationProvider>
                     
                                {activeButton === 'share'  && (
                                <Card style={{ display: 'block' }}>
                                    <Typography variant="h6" sx={{ml: 2, pt: 5}}>
                                    GRAFICO SHARE
                                    </Typography>
                                    <CardContent  sx={{ pl: 0 }}>
                                    <GraphChartArr activeButton={activeButton} data={aggregatedTimeSlots}  intervalValue={intervalValue} channels={channels} nonImportantChannels={nonImportantChannels} importantChannels={importantChannels} timeSlots={timeSlots} tipoRadioTV={tipoRadioTV} /> {/* Render the GraphChart component */}
                                    </CardContent>
                                </Card>
                                )}

                                {activeButton === 'ascolti'   && (
                                <Card style={{ display: 'block' }}>
                                    <Typography variant="h6" sx={{ml: 2, pt: 5}}>
                                    GRAFICO AMR
                                    </Typography>
                                        <CardContent  sx={{ pl: 0 }}>
                                        <GraphChart activeButton={activeButton} userListeningMap={userListeningMap} userListeningMapWeight={userListeningMapWeight} importantChannels={importantChannels} tipoRadioTV={tipoRadioTV} idToWeightMap={idToWeightMap} intervalValue={intervalValue} nonImportantChannels={nonImportantChannels} timeSlots={timeSlots}  /> {/* Render the GraphChart component */}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeButton === 'contatti'   && (
                                    <Card style={{ display:intervalStepValue === 1 ? 'block':'none'}}>
                                    <Typography variant="h6" sx={{ml: 2, pt: 5}}>
                                    GRAFICO CONTATTI
                                    </Typography>
                                        <CardContent  sx={{ pl: 0 }}>
                                        <GraphChartContatti activeButton={activeButton} userListeningMapWeight={userListeningMapWeight}  tipoRadioTV={tipoRadioTV} idToWeightMap={idToWeightMap} channels={channels} importantChannels={importantChannels} /> {/* Render the GraphChart component */}
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
                                    (Rapporto tra Ascolto Medio (AMR) e il totale {ascoltatoriRadioLabel} nell’intervallo di riferimento | almeno 1 minuto di ascolto)
                                    </Typography>
                                    <ExportExcel   fileName={`Export-Ascolti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`} idelem={`Export-Ascolti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>
                            
                                        <TableContainer id={`Export-Ascolti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{maxHeight: '500px',overflow: 'auto'}}>
                                            <Table sx={{minWidth: 800}}>
                                                
                                                <TableHead>
                                                <TableRow>
                                                    <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>
                                                    EMITTENTE
                                                    </TableCell>
                                                    {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                    <TableCell key={timeSlotKey} style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>
                                                    <strong> {timeSlotKey} </strong> 
                                                    </TableCell>
                                                    ))}
                                                </TableRow>

                                                </TableHead>

                                                <TableBody>
                                                    {sortedFilteredChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content={calculateAudienceByMinute(channel, timeSlotKey)} >{calculateAudienceByMinute(channel, timeSlotKey)}</span>


                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                        
                                                    ))}
                                                         <TableRow>
                                                            <TableCell>ALTRERADIO</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateAudienceByMinuteAltre(timeSlotKey)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>                                                    
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>
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
                                    <ExportExcel  fileName={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`} idelem={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>
                                <br />
                                <TableContainer id={`Export-SHARE-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{maxHeight: '500px',overflow: 'auto'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>EMITTENTE</TableCell>
                                                        {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey} style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>{timeSlotKey} </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {sortedFilteredChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel}%</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content={calculateShareSlotCanale(channel, timeSlotKey)} >{calculateShareSlotCanale(channel, timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                        <TableRow>
                                                            <TableCell>ALTRERADIO</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateShareSlotCanaleAltre(timeSlotKey)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>

                            </CardContent>
                            </Card>
                            )}
                            {activeButton === 'share' && (tipo !== 'TV') && (
                                <Card style={{ display: 'block', overflow:'auto' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>{ascoltatoriRadioLabel}</Typography>
                                <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                (Percentuale di individui che hanno ascoltato almeno 1 minuto la radio nell&apos;intervallo di riferimento | pop 52.231.0733)
                                </Typography>
                                <ExportExcel fileName={`Export-SHARE-Globale-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  idelem={`Export-SHARE-Globale-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>

                                <br />
                                <TableContainer id={`Export-SHARE-Globale-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{overflow: 'unset'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell> </TableCell>
                                                        {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey}>{timeSlotKey} </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>

                                                        <TableRow >

                                                            <TableCell>{ascoltatoriRadioLabel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content={displayShareRadio(timeSlotKey)} >{calculateShareRadio(timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>

                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>

                            </CardContent>
                            </Card>
                            )}
                            {activeButton === 'minuti'  && (
                                <Card style={{ display: 'block' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>DURATA MEDIA </Typography>
                                <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                Durata media intervallo di riferimento
                                </Typography>
                                    <ExportExcel  fileName={`Export-minuti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`} idelem={`Export-minuti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}/>
                                <br />
                                <TableContainer id={`Export-minuti-${tipoRadioTV}-${dayjs(selectedDate).format('MM-DD-YYYY')}`}  sx={{maxHeight: '500px',overflow: 'auto'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>EMITTENTE</TableCell>
                                                        {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey} style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 }}>{timeSlotKey} </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                
                                                <TableBody style={{ display:intervalStepValue === 1 ? 'block':'none'}}>
                                                    {sortedFilteredChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel} (1min)</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content="HH:MM:SS" >{calculateDurataMediaCanale(channel, timeSlotKey,intervalStepValue)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                        <TableRow>
                                                            <TableCell>ALTRERADIO</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateDurataMediaCanaleAltre(timeSlotKey,intervalStepValue)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>                                                    
                                         
                                                </TableBody>
                                                <TableBody style={{ display:intervalStepValue === 5 ? 'block':'none'}}>
                                                    {sortedFilteredChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel} (5min)</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content="HH:MM:SS" >{calculateDurataMediaCanale(channel, timeSlotKey,intervalStepValue)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                        <TableRow>
                                                            <TableCell>ALTRERADIO (5min)</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateDurataMediaCanaleAltre(timeSlotKey,intervalStepValue)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>                                                    
                                         
                                                </TableBody>
                                                <TableBody style={{ display:intervalStepValue === 15 ? 'block':'none'}}>
                                                    {sortedFilteredChannelNames.map((channel, index) => (
                                                        <TableRow key={index}>

                                                            <TableCell>{channel} (15min)</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content="HH:MM:SS" >{calculateDurataMediaCanale(channel, timeSlotKey,intervalStepValue)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                        <TableRow>
                                                            <TableCell>ALTRERADIO (15min) </TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateDurataMediaCanaleAltre(timeSlotKey,intervalStepValue)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>                                                    
                                         
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>

                            </CardContent>
                            </Card>
                            )}
                            {activeButton === 'contatti' && (
                            <Card style={{ display: 'block', overflow:'auto' }}>
                            
                            <CardContent style={{ display:intervalStepValue === 1 ? 'block':'none'}}>
                                <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>CONTATTI NETTI</Typography>
                                <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                (Numero di ASCOLTATORI che hanno ascoltato almeno 1 minuto della specifica emittente nell’intervallo di riferimento | pop 52.231.073)
                                </Typography>


                                <ExportExcel fileName="Excel-Export-Contatti-Global" idelem={`export-table-contatti-global_${tipoRadioTV}`}/>
                                
                                <TableContainer id={`export-table-contatti-global_${tipoRadioTV}`}  sx={{overflow: 'unset'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell> EMITTENTE </TableCell>
                                                        {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey}><strong>{timeSlotKey}</strong></TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {   sortedFilteredChannelNames.map((channel, index) => (
                                                         <TableRow key={index}>

                                                            <TableCell>{channel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip"  >{calculateAscoltoRadioCanale(channel, timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow> 
                                                    ))   }
                                                        <TableRow>
                                                            <TableCell>ALTRERADIO</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateAscoltoRadioCanale1minAltre(timeSlotKey)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>                                                        

                                                        <TableRow >

                                                            <TableCell>{ascoltatoriRadioLabel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <strong><span data-tooltip-id="my-tooltip" data-tooltip-content={displayAscoltiRadio(timeSlotKey)} >{calculateAscoltoRadio(timeSlotKey)}</span></strong>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                    
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>
                                    </CardContent>



                                    <CardContent style={{ display:intervalStepValue === 5 ? 'block':'none'}}>
                                        
                                        <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>IPOTESI {ascoltatoriRadioLabel} - almeno 5 minuti </Typography>
                                        <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                        (Numero di {ascoltatoriRadioLabel} sul totale popolazione 14+ nell’intervallo di riferimento passo 5min | pop 52.231.073)
                                        </Typography>
                                        

                                <ExportExcel fileName="Excel-Export-Contatti5-Global" idelem={`export-table-contatti5-global_${tipoRadioTV}`}/>
                                
                                <TableContainer id={`export-table-contatti5-global_${tipoRadioTV}`}  sx={{overflow: 'unset'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell> EMITTENTE </TableCell>
                                                        {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey}><strong>{timeSlotKey}</strong></TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {   sortedFilteredChannelNames.map((channel, index) => (
                                                         <TableRow key={index}>

                                                            <TableCell>{channel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip"  >{calculateAscoltoRadioCanale5min(channel, timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow> 
                                                        
                                                    ))   }
                                                         <TableRow>
                                                            <TableCell>ALTRERADIO</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateAscoltoRadioCanale5minAltre(timeSlotKey)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                        <TableRow >

                                                            <TableCell>{ascoltatoriRadioLabel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <strong><span data-tooltip-id="my-tooltip" data-tooltip-content={displayAscoltiRadio(timeSlotKey)} >{calculateAscoltoRadio(timeSlotKey)}</span></strong>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>                                                        
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>
                                        </CardContent>
                                        <CardContent style={{ display:intervalStepValue === 15 ? 'block':'none'}}>

                                        
                                        <Typography variant="h5" sx={{ ml: 2, mt: 3, mb: 2 }}>IPOTESI {ascoltatoriRadioLabel} - almeno 15 minuti </Typography>
                                        <Typography variant="p" sx={{ml: 2, mt: 2}}>
                                        (Numero di {ascoltatoriRadioLabel} sul totale popolazione 14+ nell’intervallo di riferimento passo 15min | pop 52.231.073)
                                        </Typography>
                                        

                                <ExportExcel fileName="Excel-Export-Contatti5-Global" idelem={`export-table-contatti5-global_${tipoRadioTV}`}/>
                                
                                <TableContainer id={`export-table-contatti5-global_${tipoRadioTV}`}  sx={{overflow: 'unset'}}>
                                            <Table sx={{minWidth: 800}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell> EMITTENTE </TableCell>
                                                        {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                            <TableCell key={timeSlotKey}><strong>{timeSlotKey}</strong></TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    {   sortedFilteredChannelNames.map((channel, index) => (
                                                         <TableRow key={index}>

                                                            <TableCell>{channel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span data-tooltip-id="my-tooltip"  >{calculateAscoltoRadioCanale15min(channel, timeSlotKey)}</span>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow> 
                                                    ))   }
                                                         <TableRow>
                                                            <TableCell>ALTRERADIO</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <span>{calculateAscoltoRadioCanale15minAltre(timeSlotKey)}</span>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>                                                        
                                                        <TableRow >

                                                            <TableCell>{ascoltatoriRadioLabel}</TableCell>
                                                            {Object.keys(aggregatedTimeSlots).map((timeSlotKey) => (
                                                                <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                                    <strong><span data-tooltip-id="my-tooltip" data-tooltip-content={displayAscoltiRadio(timeSlotKey)} >{calculateAscoltoRadio(timeSlotKey)}</span></strong>
                                        
                                                                </TableCell>

                                                            ))}
                                                        </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <Typography variant="small" sx={{ml:2, mt:8, mb:10, color:"#999"}}>
                                        (*) Il dato non è statisticamente significativo per la bassa numerosità dei casi
                                        </Typography>
                            </CardContent>
                            </Card>
                            
                            )}               

            </Scrollbar>


            <Tooltip id="my-tooltip" />
            </Container>
        
    );

}
