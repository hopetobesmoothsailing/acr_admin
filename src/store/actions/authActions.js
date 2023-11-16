export function setUserInfo (info) {
    return {
        type: 'SET_USERINFO',
        payload: {userInfo: info}
    };
}