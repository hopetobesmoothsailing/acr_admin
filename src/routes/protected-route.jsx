import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import {useAuth} from "./hooks/use-auth";

export const ProtectedRoute = ({ children }) => {
    const {state} = useAuth();
    if (state === undefined || !state.isAuthenticated) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node
}