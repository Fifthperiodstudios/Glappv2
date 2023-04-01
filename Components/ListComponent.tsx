import { Surface, Text } from "react-native-paper";
import RobotoText from "./RobotoTextComponent";
import chroma from "chroma-js"
import { View, ViewStyle } from "react-native"

type ListComponentProps = {
    circleColor: string | undefined,
    circleText: string, 
    headlineText: string,
    subHeadlineText: string,
    additionalInfo?: string,
    style?: ViewStyle
}

function opaqueColor(color: string) {
    let [r, g, b] = chroma(color).rgb();
    let sourceAlpha = 0.1

    return [
        ((1 - sourceAlpha) * 255) + (sourceAlpha * r),
        ((1 - sourceAlpha) * 255) + (sourceAlpha * g),
        ((1 - sourceAlpha) * 255) + (sourceAlpha * b)
    ];
}

export default function ListComponent(props: ListComponentProps) {

    return (
        <Surface theme={{colors: {
            elevation:{
                "level0": chroma(opaqueColor(props.circleColor === undefined ? "#8effad" : props.circleColor)).name()
            } 
        }}} 
        elevation={0}
        style={[{
            borderRadius: 10,
            flex: 1,
            marginVertical: 5,
            minHeight: 80,
            flexDirection: "row",
            alignItems: "center"}, props.style]}>
            <View style={{marginLeft: 10, justifyContent: "center", marginRight: 15, borderRadius: 200, width: 45, height: 45, backgroundColor: props.circleColor}}>
                <RobotoText style={{color: "white", textAlign: "center"}}>
                        {props.circleText}
                </RobotoText> 
            </View>
            <View style={{flexDirection: "column", flex: 1, marginRight: 10, marginBottom: 10, marginTop: 10}}>
                <RobotoText style={{flex: 1, textAlignVertical: "bottom", fontWeight: "bold", color: "#1C1B1F"}}>{props.headlineText}</RobotoText>
                <RobotoText style={{flex: 1, color: "#949494"}}>
                    {props.subHeadlineText}
                </RobotoText>
                {props.additionalInfo !== undefined ? <Text style={{flex:1, color: "#6D6D6D"}}>{props.additionalInfo}</Text> : null}
            </View>
            
        </Surface>
    );
}

