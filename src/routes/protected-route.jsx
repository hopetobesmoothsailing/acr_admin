import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";


export const ProtectedRoute = ({ children }) => {
    const isAuthenticated = window.localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node
}