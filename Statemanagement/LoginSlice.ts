import { createSlice, PayloadAction } from "@reduxjs/toolkit"

/*
Redux explained:

An Action is an object that describes an event that had an effect on the application;

*/

interface LoginState {
    isSignedIn: boolean,
    message: string
}

const initialState: LoginState = {
    isSignedIn: false,
    message: "" /*Is a message about the LoginStatus*/,
}

export const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        loginStateChanged: (state, action: PayloadAction<LoginState>) => {
            state.isSignedIn = action.payload.isSignedIn;
            state.message = action.payload.message;
        },
    }
});

export const {loginStateChanged} = loginSlice.actions;
export default loginSlice.reducer;