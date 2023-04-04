import { ReactNode } from "react";
import { Timetable } from "../api/ApiModel";
import {View, TouchableOpacity, StyleSheet, Text } from "react-native"
import { CourseViewProperties } from "../Statemanagement/AppModel";
import RobotoText from "./RobotoTextComponent";
import { getCourseViewProperties } from "../Statemanagement/Businesslogic";

type TimetableViewProps = {
    screenWidth: number,
    screenHeight: number,
    coursesViewPropertiesMap: Map<string, CourseViewProperties>,
    timetableModel: Timetable,
    day: number
};

export default function TimetableView(props: TimetableViewProps) {
    
    const {
        screenWidth,
        screenHeight,
        coursesViewPropertiesMap,
        timetableModel,
        day,
    } = props;

    const timetable: ReactNode[] = [];

    const timetableHeight = Math.round(screenHeight * 0.7);
    const timetableWidth = Math.round(screenWidth*0.85);

    const lessonWidth = (timetableWidth / 5) - 5;
    const lessonHeight = (timetableHeight / 13);

    const marginEnds = Math.round((screenWidth - timetableWidth) / 2.0);
    
    const dayNames = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

    let k = 0;

    for (let i = 0; i<timetableModel.schedule.length; i++) {
        const lessons: ReactNode[] = [];

        const numLessons = timetableModel.schedule[i].periods.length;

        const dayColor = i+1 === day ? "#54a3ff" : "grey";
        lessons.push(
            <RobotoText key={k} style={{...timetableViewStyles.lessonLabel, color: dayColor}}>
                {dayNames[i]}
            </RobotoText>
        );
        k++;

        for (let j = 0; j<numLessons; j++) {
            const period = timetableModel.schedule[i].periods[j];
            const course = period.course;

            let courseViewProperties;
            if (!course || !course.hasOwnProperty("id")) {
                courseViewProperties = coursesViewPropertiesMap.get("empty");
            }else {
                courseViewProperties = getCourseViewProperties(coursesViewPropertiesMap, course);
            }

            if(!courseViewProperties) courseViewProperties = getCourseViewProperties(coursesViewPropertiesMap, course);

            lessons.push(
                <TouchableOpacity
                        key={k}
                        style={{...timetableViewStyles.lessonButton, ...courseViewProperties.style, width: lessonWidth, height: lessonHeight,}}
                        onPress={() => console.log("pressed")}>
                            
                            <RobotoText style={timetableViewStyles.lessonButtonLabel}>{courseViewProperties.label}</RobotoText>

                </TouchableOpacity>
            )
            k++;
        }

        if (numLessons <= 0) {
            lessons.push(
                <TouchableOpacity
                        key={k}
                        style={{...timetableViewStyles.lessonButton, opacity: 0, width: lessonWidth, height: lessonHeight,}}>

                </TouchableOpacity>
            )
            k++;
        }

        timetable.push(<View key={k}>{lessons}</View>);
        k++;
    }

    return (
        <View style={{...timetableViewStyles.timetableContainer, 
            marginLeft: marginEnds,
            marginRight: marginEnds}}>
            {timetable}
        </View>
    )
};

const timetableViewStyles = StyleSheet.create({
    lessonLabel: {
        color: "grey",
        fontSize: 12, 
        textAlign: "center",
        marginBottom: 3
    },
    lessonButton: {
        borderRadius: 4, 
        elevation: 3,
        marginBottom: 5,
        justifyContent: "center"
    },
    lessonButtonLabel: {
        color: "white",
        textAlign: "center"
    },
    timetableContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15
    },
});