import React, { useEffect } from "react";
import { BottomNavigation } from "react-native-paper";

import { User } from "../api/LoginApi";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";

import ExamScheduleScreen from "./ExamScheduleScreen";
import ScheduleChangesScreen from "./ScheduleChangesScreen";
import TimetableScreen from "./TimetableScreen";
import { FileLocalDataSource } from "../repository/LocalDataSource";
import { ServerDataSource } from "../api/NetworkApi";
import { FetchDataStatus, Repository } from "../repository/Repository";
import {coursesViewPropertiesChanged, resetState, timetableStateChanged } from "../Statemanagement/AppSlice";
import { loginStateChanged, LoginStates } from "../Statemanagement/LoginSlice";

export function logout(dispatch: any) {
    FileLocalDataSource.deleteLocalDataSource().then(() => {
        console.log("localdatasource deleted");
        dispatch(resetState());
        dispatch(loginStateChanged({isSignedIn: false, status: {status: LoginStates.LOGGED_OUT, message: ""}}));
    }, (error) => {
        dispatch(resetState());
        dispatch(loginStateChanged({isSignedIn: false, status: {status: LoginStates.LOGGED_OUT, message: ""}}));
        console.log(error.message);
    });
}

export default function MainScreen() {

    const user: User = useAppSelector((state) => state.appReducer.user);
    const dispatch = useAppDispatch();

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'timetable', title: 'Stundenplan', focusedIcon: 'calendar-month'},
        { key: 'scheduleChanges', title: 'Vertretungsplan', focusedIcon: 'clock-fast' },
        { key: 'examSchedule', title: 'Klausurplan', focusedIcon: 'calendar' },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        timetable: TimetableScreen,
        scheduleChanges: ScheduleChangesScreen,
        examSchedule: ExamScheduleScreen,
    });

    useEffect(() => {
        console.log("use Effect in start");
        let storedSchema = 1.0;

        Repository.initializeRepository(storedSchema).then(() => {
            return Repository.fetchOfflineFirstTimetableWithProps(user, FileLocalDataSource, ServerDataSource);
        }).then(({data, status}) => {
            const {timetable, coursesViewProperties} = data;

            if (status.status === FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED) {
                logout(dispatch);
                return;
            }

            dispatch(coursesViewPropertiesChanged(coursesViewProperties));
            dispatch(timetableStateChanged({timetable, status}));
        }, (error: Error) => {
            dispatch(timetableStateChanged({timetable: null,
                status: {
                    status: FetchDataStatus.FATAL_ERROR,
                    message: error.message
                }
            }));
        });
    }, []);

    return (
        <BottomNavigation
            activeColor="rgb(40, 130, 228)"
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
        />
    );
}