import axios from 'axios';
import dayjs from "dayjs";
import React, {useState, useEffect} from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@mui/material';

import { SERVER_URL } from "../../../utils/consts";

export default function PalinsestomView() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const maxDates = dayjs('26/02/2024', 'DD/MM/YYYY');
    const today = new Date(maxDates); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 1); // Set it to yesterday
    // Format the date to DD/MM/YYYY
    const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(formattedYesterday);
    const [acrDetails, setACRDetails] = useState([]);
    const [palDetails, setPALDetails] = useState([]);
    const [users, setUsers] = useState([]);
    const [idToWeightMap, setIdToWeightMap] = useState({});
    const channels = [];
    const tipoRadioTV = "RADIO";
    const channel_name = "RAIRadio1";
    
    const [canale_pal, setChannelValue] = useState(getChannelFromURL() || channel_name); // Initialize with default interval or from URL
    
    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };
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
    const handleUpload = async () => {
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }
    


      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await axios.post(`${SERVER_URL}/uploadPalinsestom`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        });
        console.log(response.data);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file.');
      }
    };
    const channelOptions = [
      { label: 'RAI Radio 1', value: 'RAIRadio1' },
      { label: 'RAI Radio 2', value: 'RAIRadio2' },
      { label: 'RAI Radio 3', value: 'RAIRadio3' },
    ];
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
        return <p>Caricamento palinsesto consolidato in corso... </p>; // You can replace this with your loading indicator component
      }
    return (
      <Container>
        <Card>
        <Typography variant="h4" sx={{ mb: 5, pl:2,pt:2}}>
          Caricamento file Palinsesto Consolidato 
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
                    </DemoContainer>
                    
            </LocalizationProvider>
        <p>Cerca il palinsesto relativo ad una data a partire dal 30 Gennaio 2024.</p>
        <input   type="file" onChange={handleFileChange} />
        <Button variant="contained"  onClick={handleUpload}>CARICA FILE CONSOLIDATO</Button>
        </Card>
        <Card>
        <TableContainer  >
            <Table aria-label="events table">
                <TableHead>
                <TableRow>
                    <TableCell>Time Interval</TableCell>
                    <TableCell>Title</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {parsedEvents.map((event, index) => (
                    event.audience > 0 && (
                    <TableRow key={index}>
                        <TableCell>{event.timeInterval}</TableCell>
                        <TableCell>{event.title}</TableCell>
                      
                    </TableRow>
                    )
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        </Card>
      </Container>
    );
}
