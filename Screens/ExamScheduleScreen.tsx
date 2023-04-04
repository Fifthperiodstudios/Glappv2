import { StatusBar } from "expo-status-bar";
import { Text } from 'react-native-paper'
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, RefreshControl, ScrollView} from "react-native";

import ListComponent from "../Components/ListComponent";
import ScreenHeader from "../Components/ScreenHeaderComponent";
import { ExamSchedule } from "../api/ApiModel";
import { DataHolder, DataStatus, FetchDataStatus, Repository } from "../repository/Repository";
import { FileLocalDataSource, LocalDataSource } from "../repository/LocalDataSource";
import { User } from "../api/LoginApi";
import { NetworkDataSource, ServerDataSource } from "../api/NetworkApi";
import { examScheduleStateChanged } from "../Statemanagement/AppSlice";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import ErrorView from "../Components/ErrorViewComponent";
import { getCourseViewProperties, mapFromCoursesViewProperties } from "../Statemanagement/Businesslogic";
import SuccessPositiveView from "../Components/SuccessPositiveView";
import { CourseViewProperties } from "../Statemanagement/AppModel";

function fetchOfflineFirstExams(
    user: User, 
    localDataSource: LocalDataSource, 
    networkDataSource: NetworkDataSource,
    dispatch: any) {

    Repository.fetchOfflineFirstExams(user, localDataSource, networkDataSource).then((result: DataHolder<ExamSchedule>) => {
        const {data, status} = result;

        dispatch(examScheduleStateChanged({examSchedule: data, status}));

    }, (error: Error) => {

        dispatch(examScheduleStateChanged(
            {
                examSchedule: null, 
                status: {
                    status: FetchDataStatus.FATAL_ERROR,
                    message: error.message
                }
            }
        ));

    });
}

function fetchExamsFromNetwork(
    user: User, 
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource,
    examSchedule: ExamSchedule | null,
    dispatch: any,
    setRefreshing: (isRefreshing: boolean) => void) {

    Repository.fetchExamsFromNetwork(user, localDataSource, networkDataSource, examSchedule).then((result: DataHolder<ExamSchedule | null>) => {
        const {data, status} = result;
        console.log(data);
        dispatch(examScheduleStateChanged({examSchedule: data, status}));
    }, (error: Error) => {
        dispatch(examScheduleStateChanged(
            {
                examSchedule: null, 
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

function renderOnError(refreshControl: ReactElement) {
    const content = (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            refreshControl={refreshControl}>
        
            <ErrorView
                headline="Leider ist etwas schiefgegangen :/"
                subHeader={"Netzwerkfehler"}
            />
        </ScrollView>
    );

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Klausurplan" status="error"/>
            <Text style={examStyles.infoText}>Wir können nicht garantieren, dass der Klausurplan korrekt oder vollständig angezeigt wird</Text>

            {content}
        </SafeAreaView>
    );
}

function renderOnException(examScheduleModel: ExamSchedule,
                           examScheduleState: DataStatus,
                           coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                           refreshControl: ReactElement) {

    const content = renderSuccessBody(examScheduleModel,
                                      coursesViewPropertiesMap,
                                      refreshControl);

    const exceptionText = "Es gab einen Fehler beim Laden deines Klausurplans. Die angezeigten Daten sind evtl. veraltet. \nFehlernachricht: " + examScheduleState.message;

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Klausurplan" status="error" errorText={exceptionText}/>
            <Text style={examStyles.infoText}>Wir können nicht garantieren, dass der Klausurplan korrekt oder vollständig angezeigt wird</Text>
            {content}
        </SafeAreaView>
    );
}

function renderOnOffline(examScheduleModel: ExamSchedule,
                         coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                         refreshControl: ReactElement) {
    const content = renderSuccessBody(examScheduleModel,
                                      coursesViewPropertiesMap,
                                      refreshControl);

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Klausurplan" status="offline"/>
            <Text style={examStyles.infoText}>Wir können nicht garantieren, dass der Klausurplan korrekt oder vollständig angezeigt wird</Text>

            {content}
        </SafeAreaView>
    );
}

function renderOnLoading() {
    const content = (<View key={0} style={{ flex: 1 }} />);

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Klausurplan" status="normal"/>
            <Text style={examStyles.infoText}>Wir können nicht garantieren, dass der Klausurplan korrekt oder vollständig angezeigt wird</Text>
            {content}
        </SafeAreaView>
    );
}

function renderOnSuccess(examScheduleModel: ExamSchedule,
                         coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                         refreshControl: ReactElement) {
    const content = renderSuccessBody(examScheduleModel,
                                      coursesViewPropertiesMap,
                                      refreshControl);

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Klausurplan" status="normal"/>
            <Text style={examStyles.infoText}>Wir können nicht garantieren, dass der Klausurplan korrekt oder vollständig angezeigt wird</Text>
            {content}
        </SafeAreaView>
    );
}

function renderSuccessBody(examScheduleModel: ExamSchedule,
                           coursesViewPropertiesMap: Map<string, CourseViewProperties>,
                           refreshControl: ReactElement) {
    let content: ReactNode;

    if (examScheduleModel.exams.length > 0) {
        content = (
            <FlatList
                    style={{flex: 1}}
                    contentContainerStyle={examStyles.listContainer} 
                    data={examScheduleModel.exams} 
                    refreshControl={refreshControl}
                    renderItem={
                        ({item}) => {
                            let courseViewProperties = getCourseViewProperties(coursesViewPropertiesMap, item.course);

                            return <ListComponent 
                                        circleColor={courseViewProperties.style.backgroundColor} 
                                        circleText={courseViewProperties.label} 
                                        headlineText={
                                            new Date(item.date)
                                            .toLocaleDateString('de-DE', {weekday: 'long', month: 'short', day: 'numeric'})
                                            .toString() + ", von " + item.time.beginPeriod + ". bis " + item.time.endPeriod + ". "
                                        } 
                                        subHeadlineText={"Klausur bei " + item.course.teacher.abbrev + " in " + item.place.room}
                                        additionalInfo={item.info === "" ? undefined : item.info} 
                                    />
                        }
                    } 
            />
        );
    } else {
        content = (
            <ScrollView
                contentContainerStyle={{ flex:1, flexDirection: "column", justifyContent: "center"}}
                refreshControl={refreshControl}>
                <SuccessPositiveView headline="Du hast aktuell keine eingetragenen bevorstehenden Klausuren." subheader=""/>
            </ScrollView>
        );
    }

    return content;
}

export default function ExamScheduleScreen() {

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.appReducer.user);
    const examScheduleModel = useAppSelector((state) => state.appReducer.examSchedule);
    const examScheduleState = useAppSelector((state) => state.appReducer.examScheduleState);
    const coursesViewPropertiesMap = mapFromCoursesViewProperties(useAppSelector((state) => state.appReducer.coursesViewProperties));

    const [refreshing, setRefreshing] = useState(false);


    useEffect(() => {
        fetchOfflineFirstExams(user, FileLocalDataSource, ServerDataSource, dispatch);
    }, []);

    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={
                () => {
                    fetchExamsFromNetwork(user, 
                        FileLocalDataSource,
                        ServerDataSource,
                        examScheduleModel,
                        dispatch,
                        setRefreshing);
                }
            }
        />
    );

    if (examScheduleModel === null) {
        if (examScheduleState.status === FetchDataStatus.LOADING) {
            return renderOnLoading();
        } else {
            return renderOnError(refreshControl);
        }
    } else {
        if (examScheduleState.status === FetchDataStatus.SUCCESS_DATACHANGE ||
            examScheduleState.status === FetchDataStatus.SUCCESS_NO_CHANGE || 
            examScheduleState.status === FetchDataStatus.STORAGE_ERROR_NETWORK_DATA) {
            return renderOnSuccess(examScheduleModel, coursesViewPropertiesMap, refreshControl);
        }else if (examScheduleState.status === FetchDataStatus.NETWORK_ERROR_OFFLINE) {
            return renderOnOffline(examScheduleModel, coursesViewPropertiesMap, refreshControl);
        }else {
            return renderOnException(examScheduleModel, examScheduleState, coursesViewPropertiesMap, refreshControl);
        }
    }
}

const examStyles = StyleSheet.create({
    infoText: {
        color: '#757575', 
        marginHorizontal: 15, 
        marginBottom: 5,
    },
    listContainer: {
        paddingBottom: 50,
        paddingTop: 10, 
        paddingHorizontal: 15,
    }
});