import { StatusBar } from "expo-status-bar";
import { View, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Dialog, Portal, Switch, Text } from "react-native-paper";
import { ReactNode, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import PolicyAgreements from "../Components/PolicyAgreements";
import ColorButton from "../Components/ColorButtonComponent";
import SettingsHeader from "../Components/SettingsHeaderComponent";
import { RootStackParamList } from "../AppContent";
import { useAppDispatch, useAppSelector } from "../Statemanagement/hooks";
import { coursesViewPropertiesChanged, courseViewPropertiesChanged, resetState, settingsChanged } from "../Statemanagement/AppSlice";
import { LoginStates, loginStateChanged } from "../Statemanagement/LoginSlice";
import { deleteLocalDataSource, FileLocalDataSource } from "../repository/LocalDataSource";
import { colors, CourseViewProperties } from "../Statemanagement/AppModel";
import { Repository } from "../repository/Repository";

export default function SettingsScreen() {

    const dispatch = useAppDispatch();
    const coursesViewProperties = useAppSelector((state) => state.appReducer.coursesViewProperties);
    const settings = useAppSelector((state) => state.appReducer.settings);
    const [showEmptyCourse, setShowEmptyCourse] = useState(settings.showEmptyCourse);

    const [colorDialogIsVisible, setColorDialogVisibility] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseViewProperties|null>(null);

    const courseButtons : ReactNode[] = [];
    const colorButtons: ReactNode[] = [];

    let i = 0;

    coursesViewProperties.forEach((prop) => {
        courseButtons.push(
            (
                <ColorButton key={i} onClick={() => {setColorDialogVisibility(true); setSelectedCourse(prop)}} color={prop.style.backgroundColor} diameter={Math.min(52, (Dimensions.get('screen').width - 100)/5)} labelText={prop.label}/>
            )
        );
        i++;
    })

    i = 0;

    const settingsColors = [...colors, "#EDEDED"];

    settingsColors.forEach((prop) => {
        colorButtons.push(
            (
                <ColorButton key={i} onClick={() => {
                    setColorDialogVisibility(false);

                    if (selectedCourse !== null) {
                        dispatch(courseViewPropertiesChanged({courseid: selectedCourse.courseid, label: selectedCourse.label, style: {...selectedCourse.style, backgroundColor: prop}}))
                    }
                }} color={prop} diameter={(Dimensions.get('screen').width * 0.60)/5}/>
            )
        );
        i++;
    });

    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList, "Settings">>();

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar />
            <SettingsHeader/>
            <ScrollView style={{flex: 1, marginTop: 20}} contentContainerStyle={{flex: 1, alignItems: "center", marginHorizontal: 30}}>
                <View style={settingsStyles.settingsItemWithSwitch}>
                    <MaterialCommunityIcons style={{marginRight: 15}} name="bell" size={20} color="grey"/>
                    <Text style={settingsStyles.settingsItemLabel}>Benachrichtigungen</Text>
                    <Switch color="rgb(152, 214, 129)" value={true}  />
                </View>

                <View style={settingsStyles.settingsItemWithSwitch}>
                    <MaterialCommunityIcons style={{marginRight: 15}} name="card-outline" size={20} color="grey"/>
                    <Text style={settingsStyles.settingsItemLabel}>Freistunden explizit anzeigen</Text>
                    <Switch color="rgb(152, 214, 129)" value={showEmptyCourse} onChange={() => {
                        for (let courseViewProp of coursesViewProperties) {
                            if (courseViewProp.courseid === "empty") {
                                console.log(!showEmptyCourse);
                                console.log({...courseViewProp, visible: !showEmptyCourse});
                                const opacity = !showEmptyCourse === true ? 1 : 0;
                                const style = {backgroundColor: courseViewProp.style.backgroundColor};
                                Object.assign(style, courseViewProp.style, {opacity});

                                dispatch(courseViewPropertiesChanged({...courseViewProp, style, visible: !showEmptyCourse}))
                            }
                        }

                        dispatch(settingsChanged({...settings, showEmptyCourse: !showEmptyCourse}));
                        setShowEmptyCourse(!showEmptyCourse);
                    }} />
                </View>

                <View style={{flexDirection: "row", marginTop: 22, alignItems: "center"}}>
                    <MaterialCommunityIcons style={{marginRight: 15}} name="palette" size={20} color="grey"/>
                    <Text style={settingsStyles.settingsItemLabel}>Farben setzen</Text>
                </View>
            
                <View style={{flexDirection: "row", marginTop: 22, flexWrap: "wrap", marginBottom: 22}}>
                    {courseButtons}
                </View>

                <TouchableOpacity style={settingsStyles.settingsItemClickable}>
                    <MaterialCommunityIcons style={{marginRight: 15}} name="information-outline" size={20} color="grey"/>
                    <Text style={settingsStyles.settingsItemLabel}>Über die App</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => {
                        console.log("Logging out...");

                        deleteLocalDataSource().then(() => {
                            console.log("localdatasource deleted");
                            dispatch(resetState());
                            dispatch(loginStateChanged({isSignedIn: false, status: {status: LoginStates.LOGGED_OUT, message: ""}}));
                        }, (error) => {
                            dispatch(resetState());
                            dispatch(loginStateChanged({isSignedIn: false, status: {status: LoginStates.LOGGED_OUT, message: ""}}));
                            console.log(error.message);
                        });
                    }} 
                    style={settingsStyles.settingsItemClickable}
                >
                    <MaterialCommunityIcons style={{marginRight: 15}} name="logout" size={20} color="grey"/>
                    <Text style={settingsStyles.settingsItemLabel}>Ausloggen</Text>
                </TouchableOpacity>
                <PolicyAgreements marginTop={10} marginEnds={{marginLeft: 0, marginRight: 0}} color="#6AA5EA"/>
            </ScrollView>

            <Portal>
            <Dialog visible={colorDialogIsVisible} onDismiss={() => {setColorDialogVisibility(false)}}>
                <Dialog.Title>Farbe wählen</Dialog.Title>
                <Dialog.Content>
                <View style={{flexDirection: "row", flexWrap: "wrap", marginBottom: 22}}>
                    {colorButtons}
                </View>
                </Dialog.Content>
            </Dialog>
            </Portal>

        </SafeAreaView>
    );
}

const settingsStyles = StyleSheet.create({
    settingsItemWithSwitch: {
        flexDirection: "row", 
        marginBottom: 10, 
        alignItems: "center"
    },
    settingsItemClickable: {
        flexDirection: "row", 
        marginBottom: 22, 
        alignItems: "center"
    },
    settingsItemLabel: {
        fontWeight: "bold",
        flex: 1
    }
});