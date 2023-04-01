import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {RefreshControl, ScrollView, useWindowDimensions, View} from "react-native";
import { ReactNode, useState } from "react";
import ScreenHeader from "../Components/ScreenHeaderComponent";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import ErrorView from "../Components/ErrorViewComponent";
import TimetableView from "../Components/TimetableView";
import {coursesViewPropertiesChanged, slotsViewPropertiesChanged, timetableStateChanged } from "../Statemanagement/AppSlice";
import { FetchDataStatus, Repository } from "../repository/Repository";
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

    let content: ReactNode = null;

    if (timetableModel === null) {
        if (timetableState.status === FetchDataStatus.LOADING) {
            content = <View style={{flex: 1}} />
        }else {
            content = (
                <View style={{flex: 1}}>
                    <ErrorView
                    headline="Leider ist etwas schiefgegangen :/"
                    subHeader={"Wir konnten weder aus dem Internet noch deinen gespeicherten Stundenplan laden..."}
                    /> 
                </View>
            );
        }
    }else {
        const day = new Date().getDay();

        content = (
                <TimetableView 
                    screenWidth={width} 
                    screenHeight={height} 
                    coursesViewPropertiesMap={coursesViewPropertiesMap}
                    timetableModel={timetableModel}
                    day={day} />
        );

    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Stundenplan" isOffline={timetableState.status === FetchDataStatus.NETWORK_ERROR_OFFLINE_DATA}/>
            <ScrollView
                    contentContainerStyle={{flex: 1}}
                    refreshControl={refreshControl}
            >
                {content}
            </ScrollView>
        </SafeAreaView>
    );
}
