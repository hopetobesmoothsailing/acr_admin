import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import {useSessionStorage} from "./hooks/use-sessionstorage";


export const ProtectedRoute = ({ children }) => {
    const [user] = useSessionStorage('user', null)
    if (!user) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node
}