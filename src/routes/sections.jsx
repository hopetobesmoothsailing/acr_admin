import {lazy, Suspense} from 'react';
import {Outlet, Navigate, useRoutes} from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import {ProtectedRoute} from "./protected-route";

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const SignupPage = lazy(() => import('src/pages/signup'));
export const AcrPage = lazy(() => import('src/pages/acr'));
export const RisultatiPage = lazy(() => import('src/pages/risultati'));
export const RisdettagliPage = lazy(() => import('src/pages/risdettagli'));
export const RisultatinullPage = lazy(() => import('src/pages/risultatinull'));
export const SintesiPage = lazy(() => import('src/pages/sintesi'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const GiornalieroPage = lazy(() => import('src/pages/giornaliero'));
export const FascicoloPage = lazy(() => import('src/pages/fascicolo'));
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
                {element: <IndexPage/>, index: true},
                {path: 'user', element: <UserPage/>},
                {path: 'acr', element: <RisultatiPage/>},
                {path: 'risultati', element: <RisultatiPage/>},
                {path: 'risultatinull', element: <RisultatinullPage/>},
                {path: 'risdettagli', element: <RisdettagliPage/>},
                {path: 'giornaliero', element: <GiornalieroPage/>},
                {path: 'fascicolo', element: <FascicoloPage/>},
                {path: 'sintesi', element: <SintesiPage/>},
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
