import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from "@mui/material/MenuItem";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------


export default function SignupView() {
  const theme = useTheme();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const ages = [
      { value: 'select', label: 'Select' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'not wish to answer', label: 'Not wish to answer' },
  ];

  const handleClick = () => {
    router.push('/login');
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField name="name" label="First name" />

        <TextField name="lastname" label="Last name" />

        <TextField name="email" label="Email address" />

        <TextField select value="select" size='large' >
            {ages.map((item) => (
                <MenuItem key={item.value} value={item.value} >
                    {item.label}
                </MenuItem>
            ))}
        </TextField>

        <TextField name="age" label="Age" />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        sx={{ my: 3 }}
        onClick={handleClick}
      >
        Signup
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography sx={{my: 3}} variant="h4">Sign up to Welcomeland</Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
