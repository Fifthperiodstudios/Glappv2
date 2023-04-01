import { Text } from "react-native-paper"
import { ViewStyle } from "react-native/types";

type GeneralInfoHeaderProps = {
    title: string,
    style?: ViewStyle
}
export default function GeneralInfoHeader(props: GeneralInfoHeaderProps) {
    return (
            <Text variant="titleLarge" style={[{ fontWeight: "bold", marginBottom: 5 }, props.style]}>
                {props.title}
            </Text>
        );
}
