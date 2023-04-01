
import { View, Image, Text, ViewStyle } from "react-native";

type SuccessPositiveViewProps = {
    headline: string,
    subheader: string,
    style?: ViewStyle
};

export default function SuccessPositiveView({ style, headline, subheader }: SuccessPositiveViewProps) {

    return (
        <View style={[{justifyContent: "center", alignItems: "center", marginHorizontal: 15, flex: 1 }, style]}>
            <Image source={require('../assets/greenbackgroundguy.png')} style={{ resizeMode: "contain", width: '75%', height: '40%' }} />
            <Text style={{ textAlign: "center", fontSize: 24, color: "#414141" }}>
              {headline}
            </Text>
            <Text style={{ textAlign: "center", fontSize: 14, color: "#757575" }}>
                {subheader}
            </Text>
        </View>
    );
}

