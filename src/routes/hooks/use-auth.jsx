import PropTypes from "prop-types";
import {useMemo, useContext, useReducer, createContext} from "react";

const initialState = {
    isAuthenticated: false,
    user: null
};

const HANDLERS = {
    SIGN_IN: 'SIGN_IN',
    SIGN_OUT: 'SIGN_OUT'
};

const handlers = {
    [HANDLERS.SIGN_IN]: (state, action) => {
        const user = action.payload;

        return {
            ...state,
            isAuthenticated: true,
            user
        };
    },
    [HANDLERS.SIGN_OUT]: (state) => ({
            ...state,
            isAuthenticated: false,
            user: null
        })
};

const reducer = (state, action) => (
    handlers[action.type] ? handlers[action.type](state, action) : state
);

const AuthContext = createContext({undefined});

export const AuthProvider = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const signIn = async (user) => {
        try {
            window.sessionStorage.setItem('authenticated', 'true');
        } catch (err) {
            console.error(err);
        }

        dispatch({
            type: HANDLERS.SIGN_IN,
            payload: user
        });
    };

    const signOut = () => {
        dispatch({
            type: HANDLERS.SIGN_OUT
        });
    };

    const value = useMemo(
        () => ({
            state,
            signIn,
            signOut
        }),
        [state]
    );

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node
};

export const useAuth = () => useContext(AuthContext);