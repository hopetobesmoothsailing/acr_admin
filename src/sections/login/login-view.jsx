import axios from "axios";
import * as Yup from "yup";
import {useState} from 'react';
import {useFormik} from "formik";
import {useDispatch} from "react-redux";

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import {alpha, useTheme} from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import {useRouter} from 'src/routes/hooks';

import {bgGradient} from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

import {SERVER_URL} from "../../utils/consts";
import {signIn} from "../../store/actions/authActions";

// ----------------------------------------------------------------------

export default function LoginView() {
    const theme = useTheme();

    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            submit: null
        },
        validationSchema: Yup.object({
            email: Yup
                .string()
                .email('Must be a valid email')
                .max(255)
                .required('Email is required'),
            password: Yup
                .string()
                .max(255)
                .required('Password is required')
        }),
        onSubmit: async (values, helpers) => {
            try {
                const result = (await axios.post(`${SERVER_URL}/login`, {
                    email: values.email,
                    password: values.password
                })).data;
                if (result.status === 'success') {
                    dispatch(signIn(result.user));
                    window.localStorage.setItem('isAuthenticated', 'true');
                    router.replace('/');
                }
            } catch (err) {
                console.log(err)
            }
        }
    });

    const renderForm = (
        <form
            onSubmit={formik.handleSubmit}
        >
            <Stack spacing={3}>
                <TextField
                    error={!!(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label="Email Address"
                    name="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="email"
                    value={formik.values.email}
                />
                <TextField
                    error={!!(formik.touched.password
                        && formik.errors.password)}
                    fullWidth
                    helperText={formik.touched.password
                        && formik.errors.password}
                    label="Password"
                    name="password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="password"
                    value={formik.values.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}/>
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>
            {formik.errors.submit && (
                <Typography
                    color="error"
                    sx={{ mt: 3 }}
                    variant="body2"
                >
                    {formik.errors.submit}
                </Typography>
            )}
            <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{my: 3}}>
                <Link variant="subtitle2" underline="hover">
                    Forgot password?
                </Link>
            </Stack>
            <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="inherit"
            >
                Login
            </LoadingButton>
        </form>
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
                    top: {xs: 16, md: 24},
                    left: {xs: 16, md: 24},
                }}
            />

            <Stack alignItems="center" justifyContent="center" sx={{height: 1}}>
                <Card
                    sx={{
                        p: 5,
                        width: 1,
                        maxWidth: 420,
                    }}
                >
                    <Typography variant="h4">Sign in to Welcomeland</Typography>

                    <Typography variant="body2" sx={{mt: 2, mb: 5}}>
                        Don’t have an account?
                        <Link href='/signup' variant="subtitle2" sx={{ml: 0.5}}>
                            Sign Up
                        </Link>
                    </Typography>

                    {renderForm}
                </Card>
            </Stack>
        </Box>
    );
}