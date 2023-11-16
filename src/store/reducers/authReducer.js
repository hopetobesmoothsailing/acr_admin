const initialState = {
    userInfo: {}
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USERINFO':
            return {
                ...state,
                userInfo: action.payload.userInfo
            }
        default:
            return state;
    }
}

export default authReducer