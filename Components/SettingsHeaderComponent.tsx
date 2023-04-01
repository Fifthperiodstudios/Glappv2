import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import {Text, IconButton} from "react-native-paper"
import { RootStackParamList } from "../AppContent";

export default function SettingsHeader () {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList, "Settings">>();

    return (
        <View style={settingsHeaderStyles.headerContainer}>
            <IconButton
                    icon="arrow-left"
                    iconColor="grey"
                    size={20}
                    onPress={() => nav.navigate("Home")} />
            <Text variant="headlineMedium" style={settingsHeaderStyles.headerLabel}>
                Einstellungen
            </Text>
        </View>
    );
}

const settingsHeaderStyles = StyleSheet.create({
    headerContainer: {
        paddingBottom: 10, 
        flexDirection: "row", 
        marginTop: 15, 
        marginLeft: 5, 
        marginRight: 15, 
        alignItems: "center"
    },
    headerLabel: {
        flex: 1, 
        fontWeight: "bold"
    }
});