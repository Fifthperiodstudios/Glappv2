import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import {Text, IconButton} from "react-native-paper"
import { RootStackParamList } from "../AppContent";

type ScreenHeaderProps = {
    text: string,
    isOffline?: boolean
};

export default function ScreenHeader (props: ScreenHeaderProps) {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();

    return (
        <View style={screenHeaderStyles.headerContainer}>
                {props.isOffline !== undefined && props.isOffline === true ? 
                    <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                        <Text variant="headlineMedium" style={{...screenHeaderStyles.headerLabel, flex: 0, color: "lightgrey"}}>
                            {props.text}
                        </Text>
                        <IconButton size={20} icon="earth-off" iconColor="lightgrey" />
                    </View> 
                    :
                    <Text variant="headlineMedium" style={screenHeaderStyles.headerLabel}>
                        {props.text}
                    </Text>
                }

                <IconButton
                    icon="cog"
                    iconColor="grey"
                    size={20}
                    onPress={() => nav.navigate("Settings")} />
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