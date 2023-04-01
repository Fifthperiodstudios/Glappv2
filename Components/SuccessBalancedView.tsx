
import { View, Image, Text, ViewStyle } from "react-native";

type SuccessBalancedViewProps = {
    headline: string,
    subheader: string,
    style?: ViewStyle
};

export default function SuccessBalancedView({ style, headline, subheader }: SuccessBalancedViewProps) {

    return (
        <View style={[{justifyContent: "center", alignItems: "center", marginHorizontal: 15, flex: 1 }, style]}>
            <Image source={require('../assets/bluebackgroundgirl.png')} style={{ resizeMode: "contain", width: '75%', height: '40%' }} />
            <Text style={{ textAlign: "center", fontSize: 24, color: "#414141" }}>
              {headline}
            </Text>
            <Text style={{ textAlign: "center", fontSize: 14, color: "#757575" }}>
                {subheader}
            </Text>
        </View>
    );
}

