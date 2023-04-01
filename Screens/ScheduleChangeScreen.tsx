import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl, View, ScrollView } from "react-native";
import { ReactNode, useEffect, useState } from "react";

import ScreenHeader from "../Components/ScreenHeaderComponent";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import { scheduleChangePlanStateChanged } from "../Statemanagement/AppSlice";
import ErrorView from "../Components/ErrorViewComponent";
import SuccessBalancedView from "../Components/SuccessBalancedView";
import { NetworkDataSource, ServerDataSource } from "../api/NetworkApi";
import { DataHolder, FetchDataStatus, Repository } from "../repository/Repository";
import { mapFromCoursesViewProperties } from "../Statemanagement/Businesslogic";
import { User } from "../api/LoginApi";
import ScheduleChangesSectionListView, { renderGeneralInfoCard, renderGeneralInfoHeader, scheduleChangeStyles } from "../Components/ScheduleChangesSectionListView";
import { ScheduleChangePlan } from "../api/ApiModel";
import SuccessPositiveView from "../Components/SuccessPositiveView";
import GeneralInfoHeader from "../Components/GeneralInfoHeaderComponent";
import GeneralInfoCard from "../Components/GeneralInfoCardComponent";

function fetchScheduleChangesFromNetwork(
    user: User, 
    networkDataSource: NetworkDataSource,
    scheduleChangePlan: ScheduleChangePlan | null,
    setRefreshing: (isRefreshing: boolean) => void,
    dispatch: any) {

    Repository.fetchScheduleChangesFromNetwork(user, networkDataSource, scheduleChangePlan).then((result: DataHolder<ScheduleChangePlan | null>) => {
        const {data, status} = result;
        
        if (status.status === FetchDataStatus.SUCCESS_DATACHANGE) {
            dispatch(scheduleChangePlanStateChanged({scheduleChangePlan: data, status}));
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

    let mainContent: ReactNode;

    if (scheduleChangePlanModel === null) {
        if (scheduleChangePlanState.status === FetchDataStatus.LOADING) {
            mainContent = (<View style={{ flex: 1 }} />);
        } else {
            mainContent = (
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
            mainContent = (
                <ScheduleChangesSectionListView 
                    scheduleChangePlan={scheduleChangePlanModel}
                    coursesViewPropertiesMap={coursesViewPropertiesMap}
                    refreshControl={refreshControl}
                />
            );
        }else {

            let content: ReactNode[] = [];
            let key = 0;
            if (scheduleChangePlanModel.announcements.length > 0) {
                content.push(<GeneralInfoHeader key={key} title="Allgemeine Informationen" />);
                key++;
                content.push(<GeneralInfoCard key={key} announcements={scheduleChangePlanModel.announcements} />);
                key++;
            }

            const headline = "Du hast aktuell keine Änderungen.";
            const subheader = scheduleChangePlanModel.announcements.length > 0 ? "Beachte aber die allgemeinen Informationen oben" : "";

            if (user.type === "student") {
                content.push(<SuccessBalancedView key={key} style={{flex: 1}} headline={headline} subheader={subheader} />)
            }else {
                content.push(<SuccessPositiveView key={key} style={{flex: 1}} headline={headline} subheader={subheader} />)
            }
            
            mainContent = (<ScrollView
                            key={0}
                            style={{ flex: 1 }}
                            contentContainerStyle={{...scheduleChangeStyles.listContainer, flex: 1}}
                            refreshControl={refreshControl}>
                            {content}
                        </ScrollView>);
        }
            
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar />
            <ScreenHeader text="Vertretungsplan" />
            {mainContent}
        </SafeAreaView>
    );
}
