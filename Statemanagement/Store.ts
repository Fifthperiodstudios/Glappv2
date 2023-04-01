import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./LoginSlice";
import appReducer from "./AppSlice";

const store = configureStore({
    reducer: {
        loginReducer,
        appReducer
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
