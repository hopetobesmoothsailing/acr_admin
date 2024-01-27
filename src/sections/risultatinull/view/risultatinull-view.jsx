
import axios from "axios";
import dayjs from "dayjs";
import 'leaflet/dist/leaflet.css';
// import { Tooltip } from 'react-tooltip'
import {useState, useEffect} from 'react';

import Button  from '@mui/material/Button';
// import {Popup,  Marker,TileLayer, MapContainer  } from 'react-leaflet';

// import Card from '@mui/material/Card';
// import Button  from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// import CardContent from '@mui/material/CardContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import { Select,MenuItem, InputLabel,FormControl} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import {Table, Select,MenuItem,TableRow, TableHead, TableBody, TableCell, InputLabel,FormControl, TableContainer, TablePagination} from '@mui/material';

// import ExportExcel from "../export-to-excel"; 
import {SERVER_URL} from "../../../utils/consts";
// import AppWebsiteAudience from "../app-website-audience";


export default function RisultatinullView() {

  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'day')); // Start with yesterday's date
  const [acrDetailsMessage, setAcrDetailsMessage] = useState('');

  const handleDateChange = (date) => {
    // const formattedDate = date.format('DD/MM/YYYY');
    setSelectedDate(date);
  };

  useEffect(() => {
      const fetchACRDetailsByDate = async () => {
          try {
              const formattedDate = selectedDate.format('DD/MM/YYYY');
              const response = await axios.post(`${SERVER_URL}/getExportACRDetailsByDateRTV`, { date: formattedDate, type: 'RADIO' });
              if (response.data.status === 'success') {
                  console.log(response.data);
                  setAcrDetailsMessage('');
              } else {
                  console.log(response.data.message);
                  setAcrDetailsMessage(response.data.message);
              }
          } catch (error) {
              console.error('Error fetching ACR details:', error);
          }
      };

      fetchACRDetailsByDate();
  }, [selectedDate]);

  const handleDownloadCSV = async () => {
      // Check if there are ACR details available for download
      if (acrDetailsMessage === 'No ACR details found for the given date and type.') {
          alert('No ACR details found for the selected date and type.');
          return;
      }

      try {
          const formattedDate = selectedDate.format('YYYY-MM-DD');
          const response = await axios.post(`${SERVER_URL}/getExportACRDetailsByDateRTV`, { date: formattedDate, type: 'RADIO' }, { responseType: 'blob' });

          // Create a blob from the response data
          const blob = new Blob([response.data], { type: 'text/csv' });

          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);

          // Create a link element and click it to trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = `ACR_Details_${formattedDate}.csv`;
          a.click();
      } catch (error) {
          console.error('Error downloading CSV:', error);
      }
  };

  return (
      <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
              Download dei dati prodotti per data
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
              <DemoContainer components={['DatePicker']}>
                  <DatePicker
                      onChange={handleDateChange}
                      value={selectedDate}
                  />
              </DemoContainer>
          </LocalizationProvider>

          {acrDetailsMessage && <Typography variant="body1" color="error">{acrDetailsMessage}</Typography>}
          <Button onClick={handleDownloadCSV}>Download CSV</Button>
      </Container>
  );
}