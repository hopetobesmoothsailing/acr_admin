import axios from "axios";
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
import { Tooltip } from 'react-tooltip'
import {useState, useEffect} from 'react';
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

export default function FascicoloView() {

    // Audience giornaliera: È la somma totale dei minuti guardati da tutti gli spettatori durante l'intera giornata. Utilizzando gli stessi numeri dell'esempio precedente, se i 2000 utenti hanno guardato la TV per 60.000 minuti in un giorno, l'audience giornaliera sarà di 60.000 minuti.
    let audienceGiornaliera = 0;
    // Audience media al minuto: Si calcola dividendo il totale dei minuti visti da tutti gli spettatori per il numero totale di minuti nel periodo considerato. Ad esempio, se i 2000 utenti hanno guardato la TV per un totale di 60.000 minuti in un giorno, l'audience media al minuto sarà 60.000 / 2000 = 30 minuti.
    // const audienceMediaMinuto = 0; 
    // Share: Lo share indica la percentuale dell'audience totale che ha guardato un particolare programma rispetto all'audience totale al momento della messa in onda. Se si conosce l'audience totale al momento della trasmissione, basta dividere l'audience del programma per l'audience totale e moltiplicare per 100 per ottenere la percentuale.
    // const [groupedData] = useState([]);
    const populationNum = 52155073;
    const panelNum = 2000;
    const channels = [];
    const pesoNum = parseFloat(populationNum / panelNum).toFixed(0)

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
  
    
    // Function to handle button click to change the displayed table
    
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


        fetchACRDetailsByDate(); // Call the function to fetch ACR details by date


    }, [selectedDate]);

    
      



    
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
         audienceGiornaliera += 1 * pesoNum;
         /* check channels if there is a channel already in the array */
         if (channels.indexOf(item.acr_result) === -1) {
            channels.push(item.acr_result);
         }

         if (slot !== '') {
            if (!timeSlots[slot][item.acr_result]) {
                timeSlots[slot][item.acr_result] = parseFloat(pesoNum)*1;
            } else {
                timeSlots[slot][item.acr_result] += parseFloat(pesoNum)*1;
            }

        }
        }

    });
    console.log("CHANNELS")
    console.log(channels);
    /* get size acrDetails */
    console.log("MINUTI TOTALI GIORNO: %s", audienceGiornaliera);
    // let audienceGiornalieraReale = audienceGiornaliera/pesoNum 
    // audienceGiornalieraReale = parseFloat(audienceGiornalieraReale).toFixed(0);
    const timeSlotLabels = Object.keys(timeSlots);

    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );
    // Initialize userListeningMap
    const userListeningMap = {};
    const userListeningMapAudience = {};

    acrDetails.forEach((item) => {
        const recordedDate = item.recorded_at;
        const [,time] = recordedDate.split(' ');
        const [hours] = time.split(':');
        const minuteKey = `${hours.padStart(2, '0')}`;
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
        // console.log(date);
        if (slot !== '') {
            if (!userListeningMap[item.acr_result]) {
                userListeningMap[item.acr_result] = {}; // Initialize the channel object if it doesn't exist
                userListeningMapAudience[item.acr_result] = 1*pesoNum; // Initialize the channel object if it doesn't exist
            }

            if (!userListeningMap[item.acr_result][slot]) {
                userListeningMap[item.acr_result][slot] = new Set(); // Initialize the set for the slot if it doesn't exist
            }
            userListeningMapAudience[item.acr_result] += 1*pesoNum; // Add 1 to the audience for the channel
            userListeningMap[item.acr_result][slot].add(item.user_id); // Add user to the set for the corresponding time slot and channel
        }
    }
    });
    // console.log("USER LISTENING MAP");
    // console.log(userListeningMapAudience);

    // Now you can calculate the unique users listening to each channel
    /* const calculateAudienceShare = (channel, slot) => {
    const totalUsers = panelNum; // Total number of users (replace this with your actual number)
    const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
    // Calculate the share percentage for the channel in the given time slot
    const sharePercentage = `${((uniqueUsersListening / totalUsers) * 100).toFixed(2)}%`;
    return sharePercentage;
    };
    */
    const calculateAudience = (channel, slot) => {
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        // Calculate the share percentage for the channel in the given time slot
        return uniqueUsersListening*pesoNum;
    };
    const calculateShareSlotCanale = (channel, slot) => {
        let audienceSlotCanali = 0;
        channels.forEach(canalealtro => {
            if ((canalealtro !== "NULL")) {
                audienceSlotCanali += parseFloat(timeSlots[slot][canalealtro] || 0)
            }
        });

        console.log("AUDIENCE CANALE %s FASCIA ORARIA %s %s %s", channel, slot, audienceSlotCanali,timeSlots[slot][channel]);
        const shareSlotCanale = parseFloat((((timeSlots[slot][channel])/audienceSlotCanali)*100).toFixed(1)) || 0 ;
        return shareSlotCanale;
    };

    const displayTitleAscolti = (channel,slot) => {
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
        const minutoMedio = parseFloat((timeSlots[slot][channel]/(uniqueUsersListening*pesoNum)).toFixed(1)) || 0 ;
//        console.log("MINUTO MEDIO %s", minutoMedio);
        const audienceByMinute = minutoMedio*(uniqueUsersListening*pesoNum);
//        console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
        return `#Canale: ${channel}, #Utenti reali per canale ${uniqueUsersListening}, n. Individui ${uniqueUsersListening*pesoNum} #Minuti Totali ${timeSlots[slot][channel]/pesoNum} #Minuto medio ${minutoMedio}, #Audience pesata ${audienceByMinute}`;

    }
    const displayTitleAudience = (channel,slot) => {
        const uniqueUsersListening = userListeningMap[channel]?.[slot]?.size || 0;    
//        const minutoMedio = parseFloat((timeSlots[slot][channel]/(uniqueUsersListening*pesoNum)).toFixed(1)) || 0 ;
//        console.log("MINUTO MEDIO %s", minutoMedio);
//        const audienceByMinute = minutoMedio*(uniqueUsersListening*pesoNum);
//        console.log("AUDIENCE BY MINUTE canale %s slot %s audiencexmin %s", channel,slot, audienceByMinute);
        return `#Canale: ${channel}, #Utenti reali per canale ${uniqueUsersListening}, n. Individui ${uniqueUsersListening*pesoNum} `;

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
    
    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                FASCICOLO degli ascolti per la data {selectedDate}
            </Typography>
            <Typography variant="p" sx={{mb: 5}}>
                Dati applicati al campione di popolazione pari a {populationNum} individui che distribuito su {panelNum} panelisti corrispondono a {pesoNum} persone per utente.
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
                    <Button onClick={shareVisibility}>SHARE</Button>
                    <Button onClick={toggleVisibility}>ASCOLTI</Button>
                    <Button onClick={handlePrint}>STAMPA</Button>
                    <Button onClick={dettVisibility}>DETTAGLIO</Button>
                  </DemoContainer>
            </LocalizationProvider>


 

                                        
            
                <Card style={{ display: isVisible ? 'none' : 'block' }}>
                    <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                    SHARE 
                    <ExportExcel  exdata={channelNames} fileName="Excel-Export-Share" idelem="export-table-share"/>
                    </Typography>
                    <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                    Data da rapporto tra min. di ascolto per canale nell&apos;intervallo considerato e la somma dei minuti di tutti i canali nello stesso intervallo. 
                    </Typography>
                    <br/>
                    <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>
                    I minuti di ascolto per canale sono dati dalla somma dei minuti ascoltati dagli utenti moltiplicato per il peso id ogni utente {pesoNum} 
                    </Typography>
                    {/* Remaining pagination logic */}
                        <Scrollbar>
                            <TableContainer id="export-table-share" sx={{ overflow: 'unset' }}>
                                <Table sx={{ minWidth: 800 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Channel Name</TableCell>
                                            {timeSlotLabels.map((timeSlotKey) => (
                                                <TableCell key={timeSlotKey}>{timeSlotKey}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.keys(userListeningMap).map((channel, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{channel}</TableCell>
                                                {timeSlotLabels.map((timeSlotKey) => (
                                                    <TableCell style={{ textAlign: 'center' }} key={timeSlotKey}>
                                                        {/* Use calculateAudienceShare to retrieve data */}
                                                        <span data-tooltip-id="my-tooltip" data-tooltip-content={displayTitleShare(channel,timeSlotKey)} >{calculateShareSlotCanale(channel, timeSlotKey)}%</span>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Scrollbar>
                    </Card>
                      {/* Remaining pagination logic */}
            
                <Card style={{ display: isVisible ? 'block' : 'none' }}>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2}}>
                    AUDIENCE 
                    <ExportExcel  exdata={channelNames} fileName="Excel-Export-Share" idelem="export-table-audience"/>
                </Typography>
                
                <br/>
                <Typography variant="p" sx={{ml: 2, mt: 3,mb:2}}>

                Peso = Pop/Panel = {populationNum}/{panelNum} = {pesoNum} individui
                </Typography>
                     <Scrollbar>
                        <TableContainer id="export-table-audience" sx={{ overflow: 'unset' }}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Channel Name</TableCell>
                                        {timeSlotLabels.map((timeSlotKey) => (
                                            <TableCell key={timeSlotKey}>{timeSlotKey}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(userListeningMap).map((channel, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{channel}</TableCell>
                                            {timeSlotLabels.map((timeSlotKey) => (
                                                <TableCell style={{ textAlign: 'center' }} key={timeSlotKey}>
                                                    {/* Use calculateAudienceShare to retrieve data */}
                                                    <span data-tooltip-id="my-tooltip" data-tooltip-content={displayTitleAudience(channel,timeSlotKey)} >{calculateAudience(channel, timeSlotKey)}</span>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                </Card>                
                <Card style={{ display: isVisible ? 'block' : 'none' }}>
                    <Scrollbar>
                    <Typography variant="h5" sx={{ml: 2, mt: 3}}>
                        AUDIENCE (durata in minuti totali di ascolto) 
                        <ExportExcel  exdata={channelNames} fileName="Excel-Export-Ascolti" idelem="export-table"/>
                </Typography>
                <TableContainer id="export-table"  sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Channel Name</TableCell>
                                    {Object.keys(timeSlots).map((timeSlotKey) => (
                                        <TableCell key={timeSlotKey}>{timeSlotKey}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {channelNames.map((channel, index) => (
                                    <TableRow key={index}>

                                        <TableCell>{channel}</TableCell>
                                        {Object.keys(timeSlots).map((timeSlotKey) => (
                                            <TableCell style={{textAlign: 'center'}} key={timeSlotKey}>
                                                <span data-tooltip-id="my-tooltip" data-tooltip-content={displayTitleAscolti(channel,timeSlotKey)} >{timeSlots[timeSlotKey][channel] || '0'}</span>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Scrollbar>
                </Card>
                <Card style={{ display: isVisibleDett ? 'block' : 'none' }}>
                {/* Existing table components and logic */}
                <Scrollbar>
                <Typography variant="h5" sx={{ml: 2, mt: 3,mb:2, mr:4, pr:3}}>
                DETTAGLIO
                <ExportExcel    exdata={acrDetails} fileName="Excel-Export-Dettaglio" idelem="export-table-dett"/>
            </Typography>
             <TableContainer id="export-table-dett" sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            {/* Your table head component goes here */}
                            <TableHead>
                                <TableRow>
                                    <TableCell>UID</TableCell>
                                    <TableCell>Model</TableCell>
                                    <TableCell>Brand</TableCell>
                                    <TableCell>Canale</TableCell>
                                    <TableCell>Durata</TableCell>
                                    <TableCell>LatLon</TableCell>
                                    <TableCell>Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {acrDetails.map((row) => (
                                    <TableRow key={row._id}>
                                        {/* Customize this based on your data structure */}
                                        <TableCell>{row.user_id}</TableCell>
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
