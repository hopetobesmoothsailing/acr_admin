import {lazy, Suspense} from 'react';
import {Outlet, Navigate, useRoutes} from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import {ROLES} from "../utils/consts";
import {ProtectedRoute} from "./protected-route";


export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const SignupPage = lazy(() => import('src/pages/signup'));
export const AcrPage = lazy(() => import('src/pages/acr'));
export const RisultatiPage = lazy(() => import('src/pages/risultati'));
export const RisdettagliPage = lazy(() => import('src/pages/risdettagli'));
export const RisultatinullPage = lazy(() => import('src/pages/risultatinull'));
export const PalinsestomPage = lazy(() => import('src/pages/palinsestom'));
export const MonitoringPage = lazy(() => import('src/pages/monitoring'));
export const SintesiPage = lazy(() => import('src/pages/sintesi'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const GiornalieroPage = lazy(() => import('src/pages/giornaliero'));
export const FascicoloPage = lazy(() => import('src/pages/fascicolo'));
export const FascicolorevPage = lazy(() => import('src/pages/fascicolorev'));
export const FascicoloprodPage = lazy(() => import('src/pages/fascicoloprod'));
// ----------------------------------------------------------------------

export default function Router() {
    const routes = useRoutes([
        {
            element: (
                <ProtectedRoute>
                    <DashboardLayout>
                        <Suspense>
                            <Outlet/>
                        </Suspense>
                    </DashboardLayout>
                </ProtectedRoute>
            ),
            children: [
                {element: <ProtectedRoute roles={ROLES} children={<IndexPage/>}/>, index: true},
                {path: 'user', element: <ProtectedRoute roles={['admin', 'operator']} children={<UserPage/>}/> },
                {path: 'acr', element: <ProtectedRoute roles={['admin', 'operator']} children={<RisultatiPage/>}/>},
                {path: 'risultati', element: <ProtectedRoute roles={['admin', 'operator']} children={<RisultatiPage/>}/>},
                {path: 'risultatinull', element: <ProtectedRoute roles={['admin', 'operator']} children={<RisultatinullPage/>}/>},
                {path: 'palinsestom', element: <ProtectedRoute roles={['admin', 'operator']} children={<PalinsestomPage/>}/>},
                {path: 'monitoring', element: <ProtectedRoute roles={['admin', 'operator']} children={<MonitoringPage/>}/>},
                {path: 'risdettagli', element: <ProtectedRoute roles={['admin', 'operator', 'customer']} children={<RisdettagliPage/>}/>},
                {path: 'giornaliero', element: <ProtectedRoute roles={['admin', 'operator','customer']} children={<GiornalieroPage/>}/>},
                {path: 'fascicolo', element: <ProtectedRoute roles={['admin', 'operator']} children={<FascicoloPage/>}/>},
                {path: 'fascicolorev', element: <ProtectedRoute roles={['admin', 'operator']} children={<FascicolorevPage/>}/>},
                {path: 'fascicoloprod', element: <ProtectedRoute roles={['admin', 'operator', 'customer']} children={<FascicoloprodPage/>}/>},
                {path: 'sintesi', element: <ProtectedRoute roles={['admin', 'operator', 'customer']} children={<SintesiPage/>}/>},
            ],
        },
        {
            path: 'login',
            element: <LoginPage/>,
            index: true
        },
        {
            path: 'signup',
            element: <SignupPage/>,
        },
        {
            path: '404',
            element: <Page404/>,
        },
        {
            path: '*',
            element: <Navigate to="/404" replace/>,
        },
    ]);
    return routes;
}
