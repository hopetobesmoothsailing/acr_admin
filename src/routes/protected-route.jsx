import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import {useLocalStorage} from "./hooks/use-localstorage";


export const ProtectedRoute = ({ children }) => {
    const [user] = useLocalStorage('user', null)
    if (!user) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node
}