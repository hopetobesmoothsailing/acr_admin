import 'dayjs/locale/it'; // Import the Italian locale
import axios from "axios";
import dayjs from "dayjs";
import React, {useState, useEffect} from 'react';
import customParseFormat from 'dayjs/plugin/customParseFormat'; // For parsing custom formats

import Card from '@mui/material/Card';
// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@mui/material';

import ResultsTable from '../results-table';
import ExportExcel from "../export-to-excel"; 
import { SERVER_URL } from "../../../utils/consts";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian

export default function MonitoringView() {
    const [loading, setLoading] = useState(true);
    const maxDates = dayjs('26/02/2024', 'DD/MM/YYYY');
    const today = new Date(maxDates); // Get today's date
    const yesterday = new Date(maxDates); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
    const [selectedDate, setSelectedDate] = useState(dayjs(yesterday).format('DD/MM/YYYY'));
    
    const formattedDateExp = selectedDate.replace(/\//g, '-');
    const [acrDetails, setACRDetails] = useState([]);
    const [palDetails, setPALDetails] = useState([]);
    const [recordsm, setRecordsm] = useState([]);
    const [users, setUsers] = useState([]);
    const [idToWeightMap, setIdToWeightMap] = useState({});
    const channels = [];
    const tipoRadioTV = "RADIO";
    const channel_name = "RAIRadio1";
    
    const [canale_pal, setChannelValue] = useState(getChannelFromURL() || channel_name); // Initialize with default interval or from URL
    
     
    // Function to handle interval change
    const handleChannelChange = (event) => {
      const selectedValue =  event.target.value;
      console.log("selectedValue",selectedValue);
      setChannelValue(selectedValue);
      // Update the URL with the new interval value as a query parameter
      window.history.replaceState({}, '', `?channel_name=${selectedValue}`);
    };
    function getChannelFromURL() {
      const params = new URLSearchParams(window.location.search);
      return params.get('channel_name');
    }
    const channelOptions = [
      { label: 'RAI Radio 1', value: 'RAIRadio1' },
      { label: 'RAI Radio 2', value: 'RAIRadio2' },
      { label: 'RAI Radio 3', value: 'RAIRadio3' },
      { label: 'Radio Deejay', value: 'RadioDeejay'},
      { label: 'Radio Capital', value: 'RadioCapital'},
      { label: 'Radio M2O', value: 'RadioM2O'},
      { label: 'Radio Freccia', value: 'RADIOFRECCIA'},
      { label: 'R101', value: 'R101'},
      { label: 'Radio 105', value: 'Radio105'},
      { label: 'Virgin Radio', value: 'VIRGINRadio'},
      { label: 'Radio Montecarlo', value: 'RADIOMONTECARLO'},
      { label: 'Radio KissKiss', value: 'RADIOKISSKISS'},
      { label: 'Radio 24', value: 'Radio24'},
      { label: 'Radio RTL', value: 'RTL'},
      { label: 'Radio Gamma', value: 'RadioGamma'},
      { label: 'Radio RDS', value: 'RDS'},
      { label: 'Radio Italia SMI', value: 'RadioItaliaSMI'},
    ];
         
    useEffect(() => {
        // Function to fetch ACR details by date
      const fetchBmonitorByDateAndChannel = async () => {
        
          try {
              setLoading(true);
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
              const originalChannel = canale_pal; // This would be dynamically based on your application's logic
              const backendChannel = replaceCanaliWithBmon(originalChannel);
              const response = (await axios.post(`${SERVER_URL}/getBmonitorByDateAndChannel`, {'date': reFormattedDate,'channel_name':backendChannel,'all':1})).data; // Adjust the endpoint to match your server route
              setRecordsm(response.parsedRecords);
          } catch (error) {
              console.error('Error fetching ACR details:', error);
              // Handle error
          }
      };

      const fetchResultsByDateAndChannel = async () => {
            try {
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


        fetchBmonitorByDateAndChannel();
        fetchResultsByDateAndChannel(); // Call the function to fetch ACR details by date
        fetchUsers(); 
        

    }, [selectedDate,channel_name,canale_pal,tipoRadioTV]);
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
    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
      };

    console.log("palDetails",palDetails)
    const parsedEvents = [];
    let totalAudienceAllChannels = 0;
    acrDetails.forEach((item) => {
      const recordedDate = item.recorded_at;
      const [, time] = recordedDate.split(' ');
      const [hour, minute] = time.split(':');
      const minuteKey = parseInt(hour, 10) * 60 + parseInt(minute, 10);
      if (channels.indexOf(item.acr_result) === -1) {
        channels.push(item.acr_result);
      }
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
            const contatti = 0;
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

    console.log("Parsed Events", parsedEvents);
    if (loading) {
        return <p>Caricamento dati di monitoraggio broadcasting in corso... </p>; // You can replace this with your loading indicator component
      }
    return (
      <Container>
        <Card>
        <Typography variant="h4" sx={{ mb: 5, pl:2,pt:2}}>
          Monitoraggio Broadcasting Musica e Custom Files 
          
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        onChange={handleDateChange}
                        value={dayjs(selectedDate, 'DD/MM/YYYY')}
                    />
                    <select id="channelSelect" value={canale_pal} onChange={handleChannelChange}>
                                {channelOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                    </select>
                    <ExportExcel   fileName={`Export-Monitoraggio-${canale_pal}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`} idelem={`Export-Monitoraggio-${canale_pal}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`}/>
              
                    </DemoContainer>
                    
            </LocalizationProvider>
        <p>Cerca i dati di monitoraggio relativo ad una data a partire dal 30 Gennaio 2024.</p>
        </Card>
        <Card>
                    <ResultsTable fileName={`Export-Monitoraggio-${canale_pal}-${dayjs(formattedDateExp,'DD-MM-YYYY').format('DD-MM-YYYY')}`} parsedRecords={recordsm} />;
             
        </Card>
      </Container>
    );
}
