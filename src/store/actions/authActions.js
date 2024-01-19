export function signIn (info) {
    return {
        type: 'SIGN_IN',
        payload: {user: info}
    };
}

export function signOut () {
    return {
        type: 'SIGN_OUT'
    }
}