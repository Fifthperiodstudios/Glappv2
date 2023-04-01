import { ViewStyle } from "react-native/types";
import { Text } from "react-native";
import { Announcement } from "../api/ApiModel";
import { ReactNode } from "react";
import RobotoText from "./RobotoTextComponent";
import { Surface } from "react-native-paper";

type GeneralInfoCardProps = {
    announcements: Announcement[],
    style?: ViewStyle
}
export default function GeneralInfoCard(props: GeneralInfoCardProps) {
    let announcements: ReactNode[] = [];

    let j = 0;
    for (let announcement of props.announcements) {
        announcements.push(
            <RobotoText key={j} style={{ fontWeight: "bold", color: "#949494" }}>{new Date(announcement.date).toLocaleDateString('de-DE', { weekday: 'long', month: 'short', day: 'numeric' })}:</RobotoText>
        );
        j++;
        announcements.push(
            <Text key={j} style={{ color: '#757575', marginBottom: 5 }}>{announcement.text}</Text>
        );
        j++;
    }

    let marginVertical = 15;
    if (announcements.length === 0) {
        announcements.push(
            <RobotoText key={j} style={{ fontWeight: "bold", color: "#949494" }}>Keine</RobotoText>
        );
        marginVertical = 0;
    }

    return (
        <Surface theme={{
            colors: {
                elevation: {
                    "level0": "#EDF5FF"
                }
            }
        }}
            elevation={0}
            style={{
                borderRadius: 10,
                marginVertical,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginBottom: 15,
                flexDirection: "column",
                alignItems: "flex-start"
            }}>
            {announcements}
        </Surface>
    );
}