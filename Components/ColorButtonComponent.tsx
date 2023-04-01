import {Dimensions, Text, TouchableOpacity, View} from "react-native"

type ColorButtonProps = {
    labelText?: string,
    color: string,
    diameter: number,
    onClick?: () => void
}

export default function ColorButton(props: ColorButtonProps) {
    
    return (
        <View style={{alignItems: "center", width: props.diameter*1.25, marginHorizontal: 5, marginVertical: 5}}>
            <TouchableOpacity onPress={props.onClick} style={{width: props.diameter, height: props.diameter, borderRadius: 100, borderColor: "#EEEEEE", borderWidth: 2, backgroundColor: props.color}}/>
            {
            props.labelText !== undefined? 
                <Text style={{width: props.diameter*1.25, textAlign: "center", fontSize: 12, fontFamily: "Roboto-Medium", color: "#989898"}}>
                    {props.labelText}
                </Text>
            : null
            }
        </View>
    );
};