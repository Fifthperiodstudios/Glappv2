import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import {Text, IconButton} from "react-native-paper"
import { RootStackParamList } from "../AppContent";
import { ReactNode, useState } from "react";

type ScreenHeaderProps = {
    text: string,
    status: "offline" | "normal" | "error",
    errorText?: string
};

export default function ScreenHeader (props: ScreenHeaderProps) {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
    const [isErrorTextDisplayed, setErrorTextDisplay] = useState(false);

    const offlineContent = (<View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                                <Text variant="headlineMedium" style={{...screenHeaderStyles.headerLabel, flex: 0, color: "lightgrey"}}>
                                    {props.text}
                                </Text>
                                <IconButton size={20} icon="earth-off" iconColor="lightgrey" />
                            </View>);

    const normalContent = (<Text variant="headlineMedium" style={screenHeaderStyles.headerLabel}>
                                {props.text}
                            </Text>);
    
    const errorText = (<Text style={{flex: 0, marginLeft: 15, marginRight: 15, marginBottom: 10, color: "darkred"}}>
                        {props.errorText}
                       </Text>);

    const errorContent = (<View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                            <Text variant="headlineMedium" style={{...screenHeaderStyles.headerLabel, flex: 0, color: "darkred"}}>
                                {props.text}
                            </Text>
                            <IconButton size={20} icon="alert-circle" iconColor="darkred" onPress={() => setErrorTextDisplay(!isErrorTextDisplayed)} />
                        </View>);

    let content: ReactNode;

    switch (props.status) {
        case "offline":
            content = offlineContent;
            break;
        case "normal":
            content = normalContent;
            break;
        case "error":
            content = errorContent;
            break;
    }

    return (
        <View style={{}}>
            <View style={screenHeaderStyles.headerContainer}>
                {content}
                <IconButton
                    icon="cog"
                    iconColor="grey"
                    size={20}
                    onPress={() => nav.navigate("Settings")} />
            </View>
            {isErrorTextDisplayed ? errorText : null}
        </View>
        
    );
}

const screenHeaderStyles = StyleSheet.create({
    headerContainer: {
        paddingBottom: 10, 
        flexDirection: "row", 
        marginTop: 15, 
        marginLeft: 15, 
        marginRight: 15, 
        alignItems: "center"
    },
    headerLabel: {
        flex: 1, 
        fontWeight: "bold"
    }
});