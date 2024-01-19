import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import {useAuth, AuthProvider} from "./hooks/use-auth";

export const ProtectedRoute = ({ children }) => {
    const {state} = useAuth();
    if (state === undefined || !state.isAuthenticated) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return <AuthProvider>{children}</AuthProvider>;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node
}