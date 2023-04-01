import { loadAsync} from "expo-font";
import { TextProps } from "react-native";
import {Text} from "react-native"

export default function RobotoText({ children, style, ...rest }: React.PropsWithChildren<TextProps>) {

    loadAsync({
        'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf')
      });
    
    return (
        <Text style={[{ fontFamily: 'Roboto-Medium' }, style]} {...rest}>
        {children}
        </Text>
    );
};