import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {RefreshControl, ScrollView, useWindowDimensions, View} from "react-native";
import React, { ReactElement, ReactNode, useState } from "react";

import ScreenHeader from "../Components/ScreenHeaderComponent";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import ErrorView from "../Components/ErrorViewComponent";
import TimetableView from "../Components/TimetableView";
import {coursesViewPropertiesChanged, timetableStateChanged } from "../Statemanagement/AppSlice";
import { DataStatus, FetchDataStatus, Repository } from "../repository/Repository";
import { FileLocalDataSource, LocalDataSource } from "../repository/LocalDataSource";
import { NetworkDataSource, ServerDataSource } from "../api/NetworkApi";
import { mapFromCoursesViewProperties } from "../Statemanagement/Businesslogic";
import { Timetable } from "../api/ApiModel";
import { CourseViewProperties } from "../Statemanagement/AppModel";
import { User } from "../api/LoginApi";

function fetchTimetableWithPropsFromNetwork(
    user: User, 
    networkDataSource: NetworkDataSource,
    localDataSource: LocalDataSource,
    cachedTimetable: Timetable | null,
    cachedCoursesViewProps: CourseViewProperties[],
    dispatch: any,
    setRefreshing: (isRefreshing: boolean) => void) {

    Repository.fetchTimetableWithPropsFromNetwork(user, localDataSource, networkDataSource, cachedTimetable, cachedCoursesViewProps).then((result) => {
        const {data, status} = result;

        dispatch(coursesViewPropertiesChanged(data.coursesViewProperties));
        dispatch(timetableStateChanged({timetable: data.timetable, status}));

    }, (error: Error) => {
        console.log("timetableScreen@fetchTimetableWithPropsFromNetwork: " + error.message);

        dispatch(timetableStateChanged(
            {
                timetable: null, 
                status: {
                    status: FetchDataStatus.FATAL_ERROR,
                    message: error.message
                }
            }
        ));
    }).finally(() => {
        setRefreshing(false);
    });
}

function renderOnError(timetableState: DataStatus, refreshControl: ReactElement) {
    const mainContent = (
        <ScrollView
            contentContainerStyle={{flex: 1}}
            refreshControl={refreshControl}>
            <View style={{flex: 1}}>
                <ErrorView
                headline="Leider ist etwas schiefgegangen :/"
                subHeader={"Wir konnten weder aus dem Internet noch deinen gespeicherten Stundenplan laden. \nFehlernachricht: " + timetableState.message}
                /> 
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <ScreenHeader text="Stundenplan" status="normal" />
            {mainContent}
        </SafeAreaView>
    );
}
 
function renderOnException(width: number, 
                           height: number,
                           coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                           timetableModel: Timetable,
                           timetableState: DataStatus,
                           refreshControl: ReactElement) {

    const mainContent = renderSuccessBody(width, 
                            height, 
                            coursesViewPropertiesMap, 
                            timetableModel,
                            refreshControl);

    const exceptionText = "Es gab einen Fehler beim Laden deines Stundensplans. Die angezeigten Daten sind evtl. veraltet. \nFehlernachricht: " + timetableState.message;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <ScreenHeader text="Stundenplan" status="error" errorText={exceptionText} />
            {mainContent}
        </SafeAreaView>
    ); 
}

function renderOnOffline(width: number, 
                         height: number,
                         coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                         timetableModel: Timetable,
                         refreshControl: ReactElement) {

    const mainContent = renderSuccessBody(width, 
                                          height, 
                                          coursesViewPropertiesMap, 
                                          timetableModel,
                                          refreshControl);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <ScreenHeader text="Stundenplan" status="offline" />
            {mainContent}
        </SafeAreaView>
    ); 
}

function renderOnLoading() {
    const mainContent = (<View style={{ flex: 1 }} />);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <ScreenHeader text="Stundenplan" status="normal" />
            {mainContent}
        </SafeAreaView>
    );
}

function renderOnSuccess(width: number, 
                        height: number,
                        coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                        timetableModel: Timetable,
                        refreshControl: ReactElement) {

    const mainContent = renderSuccessBody(width, height,
                                          coursesViewPropertiesMap,
                                          timetableModel,
                                          refreshControl);

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Stundenplan" status="normal"/>
            {mainContent}
        </SafeAreaView>
    );
}

function renderSuccessBody(width: number, 
                           height: number,
                           coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                           timetableModel: Timetable,
                           refreshControl: ReactElement) {
    const day = new Date().getDay();

    const content = (
        <TimetableView 
            screenWidth={width} 
            screenHeight={height} 
            coursesViewPropertiesMap={coursesViewPropertiesMap}
            timetableModel={timetableModel}
            day={day} />
    );

    return (
        <ScrollView
            contentContainerStyle={{flex: 1}}
            refreshControl={refreshControl}>
            {content}
        </ScrollView>
    );
}

export default function TimetableScreen() {
    const {height, width} = useWindowDimensions();

    const dispatch = useAppDispatch();
    const timetableState = useAppSelector((state) => state.appReducer.timetableState);
    const timetableModel = useAppSelector((state) => state.appReducer.timetable);

    const user = useAppSelector((state) => state.appReducer.user);
    const coursesViewProperties = useAppSelector((state) => state.appReducer.coursesViewProperties);
    
    const coursesViewPropertiesMap = mapFromCoursesViewProperties(coursesViewProperties);

    const [refreshing, setRefreshing] = useState(false);

    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={
                () => {
                    setRefreshing(true);
                    fetchTimetableWithPropsFromNetwork(user, 
                                                       ServerDataSource, 
                                                       FileLocalDataSource, 
                                                       timetableModel,
                                                       coursesViewProperties, 
                                                       dispatch, 
                                                       setRefreshing);
                }
            }
        />
    );

    if (timetableModel === null) {
        if (timetableState.status === FetchDataStatus.LOADING) {
            return renderOnLoading();
        }else {
            return renderOnError(timetableState, refreshControl);
        }
    }else {
        if (timetableState.status === FetchDataStatus.SUCCESS_DATACHANGE || 
            timetableState.status === FetchDataStatus.SUCCESS_NO_CHANGE ||
            timetableState.status === FetchDataStatus.STORAGE_ERROR_NETWORK_DATA) {
            return renderOnSuccess(width, height, coursesViewPropertiesMap, timetableModel, refreshControl);
        }else if (timetableState.status === FetchDataStatus.NETWORK_ERROR_OFFLINE){
            return renderOnOffline(width, height, coursesViewPropertiesMap, timetableModel, refreshControl);
        }else {
            return renderOnException(width, height, coursesViewPropertiesMap, timetableModel, timetableState, refreshControl);
        }
    }
}
