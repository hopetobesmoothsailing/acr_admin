import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import { Navigate } from "react-router-dom";


export const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector(state => state.authReducer.isAuthenticated);
    if (!isAuthenticated) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node
}