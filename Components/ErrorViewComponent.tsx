import { View, Image, Text, ViewProps, StyleProp, ViewStyle } from "react-native";

type ErrorProps = {
    headline: string,
    subHeader: string,
    style?: ViewStyle 
};

export default function ErrorView({style, headline, subHeader} : ErrorProps) {

    return (
        <View style={[{ justifyContent: "center", marginHorizontal: 15}, style]}>
            <Image source={require('../assets/redbackgroundgirl.png')} style={{ alignSelf: "center", resizeMode: "contain", width: '60%', height: '60%' }} />
            <Text style={{ textAlign: "center", fontSize: 24, color: "#414141" }}>
                {headline}
            </Text>
            <Text style={{ textAlign: "center", fontSize: 18, color: "#414141" }}>
                {subHeader}
            </Text>
        </View>
    );
}

export {ErrorProps};