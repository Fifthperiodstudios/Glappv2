import React, { useEffect } from "react";
import { BottomNavigation } from "react-native-paper";

import { User } from "../api/LoginApi";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";

import ExamScheduleScreen from "./ExamScheduleScreen";
import ScheduleChangesScreen from "./ScheduleChangesScreen";
import TimetableScreen from "./TimetableScreen";
import { ActionStatus, FileLocalDataSource } from "../repository/LocalDataSource";
import { ServerDataSource } from "../api/NetworkApi";
import { FetchDataStatus, Repository } from "../repository/Repository";
import {coursesViewPropertiesChanged, preferencesChanged, timetableStateChanged } from "../Statemanagement/AppSlice";
import { logout } from "./SettingsScreen";
import { initalSettingsState, SettingsManager } from "../repository/Settings";


export default function MainScreen() {

    const user: User = useAppSelector((state) => state.appReducer.settings.user);
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

        SettingsManager.getPreferences().then((prefs) => {
            console.log("prefs " + prefs.showEmptyCourse);
            dispatch(preferencesChanged(prefs));
        });

        SettingsManager.getStoredSchemaVersion()
            .then((storedSchema) => Repository.initializeRepository(FileLocalDataSource, storedSchema))
            .then((status) => {
                if (status === ActionStatus.CREATED_AND_SCHEMA_CHANGED || status === ActionStatus.SUCCESS) {
                    SettingsManager.setStoredSchemaVersion(FileLocalDataSource.schemaVersion);
                }

                return Repository.fetchOfflineFirstTimetableWithProps(user, FileLocalDataSource, ServerDataSource)
            })
            .then(({data, status}) => {
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