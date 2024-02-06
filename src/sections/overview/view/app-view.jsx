import axios from "axios";
// import { faker } from '@faker-js/faker';
import { Link } from 'react-router-dom';
import {useState, useEffect} from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

// import Iconify from 'src/components/iconify';

// import AppTasks from '../app-tasks';
// import AppNewsUpdate from '../app-news-update';
import {SERVER_URL} from "../../../utils/consts";
// import AppOrderTimeline from '../app-order-timeline';
// import AppCurrentVisits from '../app-current-visits';
// import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
// import AppTrafficBySite from '../app-traffic-by-site';
// import AppCurrentSubject from '../app-current-subject';
// import AppConversionRates from '../app-conversion-rates';
import {useSessionStorage} from "../../../routes/hooks/use-sessionstorage";


// ----------------------------------------------------------------------

export default function AppView() {
  const [users, setUsers] = useState([]);
  const [user] = useSessionStorage('user', null);
  const clist = [
    {
    title:'RAIRadio1',
    role:1
    },
    {
      title:'RAIRadio2',
      role:1
    },
    {
      title:'RAIRadio3',
      role:1
    }
  ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const result = (await axios.post(`${SERVER_URL}/getUsers`)).data;
        setUsers(result.users);

    }
     console.log(users.length);
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Dashboard Panel 👋
      </Typography>

      <Grid container spacing={3}>


        <Grid xs={12} sm={6} md={6}>
          <AppWidgetSummary
            title="Panel"
            total={2000}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

  

       
        
        <Grid xs={12} sm={3} md={3}>
        <Card>
          <Typography variant="h4" sx={{ ml: 1, mt:2}}>
            Fascicolo Ascolti
          </Typography>
          <List>
           
             <ListItem> <Link to="/fascicoloprod">Visualizza Fascicolo RADIO </Link></ListItem>
             <ListItem> <Link to="/fascicoloprod?type=TV">Visualizza Fascicolo TV </Link></ListItem>
            
          </List>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
        <Card>
          <Typography variant="h4" sx={{ ml: 1, mt:2}}>
            Giornaliero Canali
          </Typography>
          <List>
          {clist.filter(item => item.role >= user.role).map((item) => (
             <ListItem> <Link to={`/giornaliero?channel_name=${item.title}`}>{item.title}</Link></ListItem>
            ))}
          </List>
          </Card>
        </Grid>
        
      </Grid>
    </Container>
  );
}
