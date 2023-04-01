
import { View, Image, Text, ViewStyle } from "react-native";

type NoScheduleChangesViewProps = {
    style?: ViewStyle
};

export default function NoScheduleChangesView({ style }: NoScheduleChangesViewProps) {

    return (
        <View style={[{justifyContent: "center", alignItems: "center", marginHorizontal: 15, flex: 1 }, style]}>
            <Image source={require('../assets/bluebackgroundgirl.png')} style={{ resizeMode: "contain", width: '75%', height: '40%' }} />
            <Text style={{ textAlign: "center", fontSize: 24, color: "#414141" }}>
              Du hast aktuell keine Änderungen.
            </Text>
            <Text style={{ textAlign: "center", fontSize: 14, color: "#757575" }}>
                Beachte aber die allgemeinen Informationen oben.
            </Text>
        </View>
    );
}

export { NoScheduleChangesViewProps };

