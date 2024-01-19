import PropTypes from "prop-types";
import {useRef, useMemo, useEffect, useContext, useReducer, createContext} from "react";

const initialState = {
    isAuthenticated: false,
    user: null
};

const HANDLERS = {
    INITIALIZE: 'INITIALIZE',
    SIGN_IN: 'SIGN_IN',
    SIGN_OUT: 'SIGN_OUT'
};

const handlers = {
    [HANDLERS.INITIALIZE]: (state, action) => {
        const user = action.payload;

        return {
            ...state,
            ...(
                // if payload (user) is provided, then is authenticated
                user
                    ? ({
                        isAuthenticated: true,
                        isLoading: false,
                        user
                    })
                    : ({
                        isLoading: false
                    })
            )
        };
    },
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
    const initialized = useRef(false);

    const initialize = async () => {
        // Prevent from calling twice in development mode with React.StrictMode enabled
        if (initialized.current) {
            return;
        }

        initialized.current = true;

        let isAuthenticated = false;

        try {
            isAuthenticated = window.sessionStorage.getItem('authenticated') === 'true';
        } catch (err) {
            console.error(err);
        }

        if (isAuthenticated) {
            const user = {
                id: '5e86809283e28b96d2d38537',
                avatar: '/assets/avatars/avatar-anika-visser.png',
                name: 'Anika Visser',
                email: 'anika.visser@devias.io'
            };

            dispatch({
                type: HANDLERS.INITIALIZE,
                payload: user
            });
        } else {
            dispatch({
                type: HANDLERS.INITIALIZE
            });
        }
    };

    useEffect(
        () => {
            initialize();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

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

export const AuthConsumer = AuthContext.Consumer;
export const useAuth = () => useContext(AuthContext);