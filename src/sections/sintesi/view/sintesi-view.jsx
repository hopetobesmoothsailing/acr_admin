import dayjs from "dayjs";
import {useState} from 'react';

import Card from '@mui/material/Card';
import {Tab, Tabs} from "@mui/material";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";

// ----------------------------------------------------------------------

export default function SintesiView() {
    const [selectedDate, setSelectedDate] = useState();

    const [value, setValue] = useState('one');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date.format('DD/MM/YYYY'));
    }

    return (
        <Container>
            <Typography variant="h4">
                Sintesi di Lunedi {selectedDate}
            </Typography>

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

            <Card sx={{mt: 3}}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="wrapped label tabs example"
                    sx={{mt: 2, mb: 2}}
                >
                    <Tab
                        value="one"
                        label="Programmi"
                    />
                    <Tab value="two" label="Share Medrio Prime Time" />
                    <Tab value="three" label="Share Medio Intera Giomata" />
                </Tabs>
            </Card>
        </Container>
    );
}
