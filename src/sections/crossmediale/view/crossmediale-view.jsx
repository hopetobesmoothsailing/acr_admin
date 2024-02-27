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
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import {Table, TableRow, TableHead, TableBody, TableCell, TableContainer} from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import DataProcessor from '../acr-crox';
// import ExportExcel from "../export-to-excel"; 
// import GraphChartArr from "../graph-chart-arr";
import {SERVER_URL} from "../../../utils/consts";
// import GraphChartArrBars from "../graph-chart-arr-bars";
// import GraphChartArrBarsCh from "../graph-chart-arr-bars-ch";

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('it'); // Set the locale to Italian

// ----------------------------------------------------------------------

export default function CrossmedialeView() {

    
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    // const [isVisible, setIsVisible] = useState(false);
    // const importantChannels = ['RadioDeejay', 'RAIRadio1','RAIRadio2','RAIRadio3','RAIIsoradio','RDS','RTL','Radio24','RadioM2O', 'RADIOBELLAEMONELLA','RADIOITALIAANNI60','RADIOKISSKISS','RADIOKISSKISSNAPOLI','RADIOKISSKISSITALIA','RadioFRECCIA','RadioCapital','R101','VIRGINRadio','RADIOMONTECARLO','Radio105','RadioBRUNO','RadioItaliaSMI'];

    const [acrDetails, setACRDetails] = useState([]);
    // const [acrDetailsTimeslot, setACRDetailsTimeslot] = useState([])
    const today = new Date(); // Get today's date
    const yesterday = new Date(today); // Create a new date object with today's date
    yesterday.setDate(today.getDate() - 4); // Set it to yesterday  
    // Format the date to DD/MM/YYYY
    const formattedYesterday = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;  
    // Set yesterday's date as selectedDate
    const [selectedDate, setSelectedDate] = useState(dayjs(yesterday).format('DD/MM/YYYY'));
    const [startDate,setStartDate] = useState(dayjs().subtract(5, 'day').format('DD/MM/YYYY'));
    const [stopDate, setStopDate ] = useState(dayjs().add(0, 'day').format('DD/MM/YYYY'));
    console.log("SEL_DATE",selectedDate);
    console.log("START_DATE",startDate);
    console.log("STOP_DATE",stopDate);
    // Function to calculate the difference

    // Convert date from DD/MM/YYYY to YYYY-MM-DD for backend
    const formatDateForBackend = (date) => dayjs(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
    
    let tipoRadioTV = 'RADIOTV';
    // let ascoltatoriRadioLabel = '';
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('type');
    if (tipo === null) {
         tipoRadioTV = 'RADIOTV';}
    else if (tipo === 'TV') {
        tipoRadioTV = 'TV';
     }
    else {
        tipoRadioTV = 'RADIO';
  
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
         

    }, [selectedDate,tipoRadioTV,formattedYesterday,stopDate,startDate]);

    
  

    if (loading) {
        return <p>Caricamento e calcolo dati crossmediali in corso... </p>; // You can replace this with your loading indicator component
        }

            return (
                <Container>
                    <Scrollbar style={{ width: '100%'}}>              
                    <Typography variant="h4" sx={{mb: 5}}>
                       Analisi crossmediale RADIO / TV per un periodo personalizzabile.
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
 
                        <Card style={{ display: 'block' }}>
                            <CardContent>
                                 <DataProcessor  acrDetails={acrDetails} />
                             </CardContent>
                        </Card>
                   
               
            </Scrollbar>
            <Tooltip id="my-tooltip" />
        </Container>
        
    );

}
