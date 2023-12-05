import axios from "axios";
import {format} from 'date-fns'; // Import the format function from date-fns
import dayjs from "dayjs";
import {useMemo, useState, useEffect} from 'react';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import {SERVER_URL} from "../../../utils/consts";
import AppWebsiteAudience from "../app-website-audience";

// ----------------------------------------------------------------------

export default function RisultatiView() {


    const [groupedData] = useState([]);
    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const [selectedDate, setSelectedDate] = useState(format(new Date('04/12/2023'), 'dd/MM/yyyy'));

    const handleDateChange = (date) => {
        setSelectedDate(date);
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


    const minuteBasedData = useMemo(() => {
        const minuteData = {}; // Use an object to store data for each minute

        acrDetails.forEach((item) => {
            const recordedDate = item.recorded_at;

            // Extracting minuteKey from the recorded_at string
            const [date, time] = recordedDate.split(' ');
            const [day, month, year] = date.split('/');
            const [hours, minutes] = time.split(':');
            const minuteKey = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
            const minuteKeyX = minuteKey;
            if (!minuteData[minuteKeyX]) {
                minuteData[minuteKeyX] = {};
            }
//      console.log(minuteKeyX)
            if (!minuteData[minuteKeyX][item.acr_result]) {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] = 1;
            } else {
                // console.log(minuteData[minuteKeyX][item.acr_result]);
                minuteData[minuteKeyX][item.acr_result] += 1;
            }
            // console.log(item.acr_result);
            // console.log(minuteData[minuteKeyX][item.acr_result]);
        });

        // console.log(minuteData);
        // Convert minuteData into series data for the chart
        const labels = Array.from({length: 24 * 60}, (_, index) => {
            const minutes = index % 60;
            const hours = Math.floor(index / 60);
            const date = new Date(selectedDate);
            date.setHours(hours);
            date.setMinutes(minutes);
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            console.log(formattedDate)
            return formattedDate; // Change to your desired date format
        });


        const uniqueChannels = [...new Set(acrDetails.map((item) => item.acr_result))];

        const series = uniqueChannels.map((channel) => ({
            name: channel,
            type: 'area',
            fill: 'solid',
            data: labels.map((label) => (minuteData[label]?.[channel] || 0)),
        }));
        // console.log(series);
        return {
            labels,
            series,
        };


    }, [selectedDate, acrDetails]);

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
        const [date, time] = recordedDate.split(' ');
        const [hours] = time.split(':');
        const minuteKey = `${hours.padStart(2, '0')}`;


        // console.log("hours");
        console.log(minuteKey);
        // console.log("date");
        console.log(date);
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
        // console.log("SLOT");
        // console.log(slot);
        if (slot !== '') {
            if (!timeSlots[slot][item.acr_result]) {
                timeSlots[slot][item.acr_result] = 1;
            } else {
                timeSlots[slot][item.acr_result] += 1;
            }

        }
    });

    console.log(timeSlots);

    const timeSlotLabels = Object.keys(timeSlots);

    const timeSlotSeries = Object.keys(timeSlots[timeSlotLabels[0]]).map((channel) => ({
        name: channel,
        type: 'area',
        fill: 'solid',
        data: timeSlotLabels.map((label) => timeSlots[label][channel] || 0),
    }));
    const timeSlotKeys = Object.keys(timeSlots);
    // const channelNames = Object.keys(timeSlotSeries);
    const channelNames = Array.from(
        new Set(Object.values(timeSlots).flatMap((data) => Object.keys(data)))
    );


    console.log("TSSERIES");
    console.log(timeSlotSeries);
    console.log(timeSlotKeys);

    return (
        <Container>
            <Typography variant="h4" sx={{mb: 5}}>
                FASCICOLO degli ascolti per la data {selectedDate}
            </Typography>
            {/* ... (existing code) */}
            {/* Material-UI DatePicker component */}

            {/* Display graph for a single day with x-axis corresponding to every minute */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        onChange={handleDateChange}
                        value={dayjs(selectedDate)}
                        defaultValue={dayjs('04/12/2023')}
                        format="DD/MM/YYYY"
                    />
                </DemoContainer>
            </LocalizationProvider>
            <AppWebsiteAudience
                title="Audience by Minute"
                subheader="Audience calcolata sulla base del minuto di ascolto"
                chart={minuteBasedData}
            />
            <TableContainer sx={{overflow: 'unset'}}>
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
                                        {timeSlots[timeSlotKey][channel] || '0'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Card>
                <Scrollbar>
                    <TableContainer sx={{overflow: 'unset'}}>
                        <Table sx={{minWidth: 800}}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ACR Result</TableCell>
                                    <TableCell>Recorded At</TableCell>
                                    <TableCell>Audience</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupedData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.acr_result}</TableCell>
                                        <TableCell>{item.recorded_at}</TableCell>
                                        <TableCell>{item.audience}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
                {/* Remaining pagination logic */}
            </Card>
            <Card>
                {/* Existing table components and logic */}
                <Scrollbar>
                    <TableContainer sx={{overflow: 'unset'}}>
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
                                        <TableCell>{row.duration}</TableCell>
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
        </Container>
    );

}
