import PropTypes from "prop-types";
import {enqueueSnackbar} from "notistack";
import {Navigate, useLocation} from "react-router-dom";

import {ROLES} from "../utils/consts";
import {useSessionStorage} from "./hooks/use-sessionstorage";


export const ProtectedRoute = ({ children, roles }) => {
    const [user] = useSessionStorage('user', null)
    const location = useLocation();
    if (!user) {
        // user is not authenticated
        return <Navigate to="/login" state={{from: location}} />;
    }
    if (roles instanceof Array && roles.indexOf(ROLES[user.role - 1]) === -1) {
        enqueueSnackbar(`Non hai accesso a questa pagina!`, {variant: 'error'});
        return <Navigate to='/'/>
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node,
    roles: PropTypes.array
}