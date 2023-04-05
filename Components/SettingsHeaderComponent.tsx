import { StyleSheet, View } from "react-native";
import {Text, IconButton} from "react-native-paper"

export default function SettingsHeader (props: {onPress: () => void}) {
    return (
        <View style={settingsHeaderStyles.headerContainer}>
            <IconButton
                    icon="arrow-left"
                    iconColor="grey"
                    size={20}
                    onPress={props.onPress} />
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