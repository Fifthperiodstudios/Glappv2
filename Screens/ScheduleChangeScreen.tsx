import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl, View, ScrollView } from "react-native";
import { ReactNode, useEffect, useState } from "react";

import ScreenHeader from "../Components/ScreenHeaderComponent";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import { scheduleChangePlanStateChanged } from "../Statemanagement/AppSlice";
import ErrorView from "../Components/ErrorViewComponent";
import NoScheduleChangesView from "../Components/NoScheduleChangesView";
import { NetworkDataSource, ServerDataSource } from "../api/NetworkApi";
import { DataHolder, FetchDataStatus, Repository } from "../repository/Repository";
import { mapFromCoursesViewProperties } from "../Statemanagement/Businesslogic";
import { User } from "../api/LoginApi";
import ScheduleChangesSectionListView from "../Components/ScheduleChangesSectionListView";
import { ScheduleChangePlan } from "../api/ApiModel";

function fetchScheduleChangesFromNetwork(
    user: User, 
    networkDataSource: NetworkDataSource,
    scheduleChangePlan: ScheduleChangePlan | null,
    setRefreshing: (isRefreshing: boolean) => void,
    dispatch: any) {

    Repository.fetchScheduleChangesFromNetwork(user, networkDataSource, scheduleChangePlan).then((result: DataHolder<ScheduleChangePlan | null>) => {
        const {data, status} = result;
        
        if (status.status === FetchDataStatus.SUCCESS_DATACHANGE) {
            console.log("successs2");
            dispatch(scheduleChangePlanStateChanged({scheduleChangePlan: data, status}));
            console.log("succ3");
        }

    }, (error: Error) => {
        dispatch(scheduleChangePlanStateChanged(
            {
                scheduleChangePlan: null, 
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

export default function ScheduleChangeScreen() {

    const dispatch = useAppDispatch();

    const user = useAppSelector((state) => state.appReducer.user);

    const scheduleChangePlanState = useAppSelector((state) => state.appReducer.scheduleChangePlanState);
    const scheduleChangePlanModel = useAppSelector((state) => state.appReducer.scheduleChangePlan);

    const coursesViewPropertiesMap = mapFromCoursesViewProperties(
        useAppSelector((state) => state.appReducer.coursesViewProperties)
    );


    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchScheduleChangesFromNetwork(user, ServerDataSource, scheduleChangePlanModel, setRefreshing, dispatch);
    }, []);

    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={
                () => {
                    fetchScheduleChangesFromNetwork(user, 
                                           ServerDataSource,
                                           scheduleChangePlanModel,
                                           setRefreshing, 
                                           dispatch);
                }
            }
        />
    );

    let content: ReactNode;

    if (scheduleChangePlanModel === null) {
        if (scheduleChangePlanState.status === FetchDataStatus.LOADING) {
            console.log("thisisit");
            content = (<View key={0} style={{ flex: 1 }} />);
        } else {
            console.log("fov");
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
        if (scheduleChangePlanModel.dayScheduleChanges.length > 0) {
            console.log("favw");
            content = (
                <ScheduleChangesSectionListView 
                    scheduleChangePlan={scheduleChangePlanModel}
                    coursesViewPropertiesMap={coursesViewPropertiesMap}
                    refreshControl={refreshControl}
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
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <ScreenHeader text="Vertretungsplan" />
            {content}
        </SafeAreaView>
    );
}
