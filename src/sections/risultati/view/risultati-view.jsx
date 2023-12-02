import axios from "axios";
import {useState, useEffect} from 'react';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Table, TableRow,TableHead, TableBody, TableCell, TableContainer } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import {SERVER_URL} from "../../../utils/consts";

  
// ----------------------------------------------------------------------

export default function RisultatiView() {




    const [acrDetails, setACRDetails] = useState([]);

    useEffect(() => {
        fetchACRDetails();
    }, []);

    const fetchACRDetails = async () => {
        const dettagli = (await axios.post(`${SERVER_URL}/getACRDetails`)).data;
        setACRDetails(dettagli.acrDetails);
    };

    
    



    return (
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            ACR Risultati
          </Typography>
          <Card>
            {/* Existing table components and logic */}
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
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
