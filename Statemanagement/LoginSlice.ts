import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DataStatus } from "../repository/Repository";

/*
Redux explained:

An Action is an object that describes an event that had an effect on the application;

*/

interface LoginState {
    isSignedIn: boolean,
    status: DataStatus
}

const LoginStates = {
    LOGGED_OUT: 0,
    LOGGED_IN: 1,
    ERROR: 2
}

const initialState: LoginState = {
    isSignedIn: false,
    status: {
        status: LoginStates.LOGGED_OUT,
        message: ""
    }
}

export const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        loginStateChanged: (state, action: PayloadAction<LoginState>) => {
            state.isSignedIn = action.payload.isSignedIn;
            state.status = action.payload.status;
        },
    }
});

export const {loginStateChanged} = loginSlice.actions;
export {LoginStates}

export default loginSlice.reducer;