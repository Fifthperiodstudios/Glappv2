import { StatusBar } from "expo-status-bar";
import { Text } from 'react-native-paper'
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, RefreshControl, ScrollView} from "react-native";

import ListComponent from "../Components/ListComponent";
import ScreenHeader from "../Components/ScreenHeaderComponent";
import { Exam, ExamSchedule } from "../api/ApiModel";
import { DataHolder, FetchDataStatus, Repository } from "../repository/Repository";
import { FileLocalDataSource, LocalDataSource } from "../repository/LocalDataSource";
import { User } from "../api/LoginApi";
import { NetworkDataSource, ServerDataSource } from "../api/NetworkApi";
import { CourseViewProperties } from "../Statemanagement/AppModel";
import { examScheduleStateChanged } from "../Statemanagement/AppSlice";
import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import ErrorView from "../Components/ErrorViewComponent";
import { getCourseViewProperties, mapFromCoursesViewProperties } from "../Statemanagement/Businesslogic";
import NoScheduleChangesView from "../Components/NoScheduleChangesView";

/*

eigentlich gibt es 2 Fälle:
Examschedule
1. Fall: Bisher noch nichts geladen:
    laden aus dem Speicher oder Netzwerk
    temporaryCoursesViewProperties auslesen
    dispatchen(examsched, tempcourseviewprops)
2. Fall: Bisher bereits geladen
    laden nur aus dem Netzwerk
        falls success_nochange:
            nichts tun
        falls success_datachange:
            abspeichern
            temporaryCoursesViewProperties auslesen
            dispatchen()
        falls fehler:
            nichts tun, einfach das bestehende anzeigen

*/

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

export default function ExamScheduleScreen() {

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.appReducer.user);
    const examScheduleModel = useAppSelector((state) => state.appReducer.examSchedule);
    const examScheduleState = useAppSelector((state) => state.appReducer.examScheduleState);
    const coursesViewProperties = mapFromCoursesViewProperties(useAppSelector((state) => state.appReducer.coursesViewProperties));

    const [refreshing, setRefreshing] = useState(false);


    useEffect(() => {
        fetchOfflineFirstExams(user, FileLocalDataSource, ServerDataSource, dispatch);
    }, []);

    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={
                () => {
                    const timestamp = examScheduleModel === null ? undefined : examScheduleModel.timestamp;
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

    let content: ReactNode;

    if (examScheduleModel === null) {
        if (examScheduleState.status === FetchDataStatus.LOADING) {
            content = (<View key={0} style={{ flex: 1 }} />);
        } else {
            content = (
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
        }
    } else {
        console.log("after else");
        console.log(examScheduleModel);
        console.log(examScheduleModel.exams);
        if (examScheduleModel.exams.length > 0) {
            content = (
                <FlatList 
                        style={{flex: 1}}
                        contentContainerStyle={examStyles.listContainer} 
                        data={examScheduleModel.exams} 
                        refreshControl={refreshControl}
                        renderItem={
                            ({item}) => {
                                let courseViewProperties = getCourseViewProperties(coursesViewProperties, item.course);

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
                    <NoScheduleChangesView />
                </ScrollView>
            );
        }

    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <ScreenHeader text="Klausurplan" isOffline={examScheduleState.status === FetchDataStatus.NETWORK_ERROR_OFFLINE_DATA}/>
            <Text style={examStyles.infoText}>Wir können nicht garantieren, dass der Klausurplan korrekt oder vollständig angezeigt wird</Text>

            {content}
        </SafeAreaView>
    );
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