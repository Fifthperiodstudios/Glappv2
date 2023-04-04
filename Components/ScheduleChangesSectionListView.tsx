import { ReactNode } from "react";
import { Announcement, CourseChange, ScheduleChangePlan } from "../api/ApiModel";
import { CourseViewProperties } from "../Statemanagement/AppModel";
import ListComponent from "./ListComponent";
import { Text } from "react-native-paper";
import { View, SectionList, StyleSheet } from "react-native"
import { getCourseViewProperties } from "../Statemanagement/Businesslogic";
import GeneralInfoHeader from "./GeneralInfoHeaderComponent";
import GeneralInfoCard from "./GeneralInfoCardComponent";
import dayjs from "dayjs";

function renderScheduleChangeItem(courseChange: CourseChange,
    coursesViewPropertiesMap: Map<string, CourseViewProperties>,
    isLastElement: boolean) {

    const courseViewProperties = getCourseViewProperties(coursesViewPropertiesMap, courseChange.course);

    let color: string = courseViewProperties.style.backgroundColor;
    let label: string = courseViewProperties.label;

    let subHeadline = "";

    if (courseChange.newPlace) {
        let newRoom = "?";
        if (courseChange.newPlace.room !== undefined) {
            newRoom = courseChange.newPlace.room;
        }
        subHeadline += "Raumänderung: " + newRoom + " ";
    }
    
    if (courseChange.substitute) {
        let substitutionTeacher = "?";
        if (courseChange.substitute.abbrev !== undefined) {
            substitutionTeacher = courseChange.substitute.abbrev;
        }
        subHeadline += "Vertretung bei " + substitutionTeacher;
    }

    let additionalInfo = courseChange.info.length > 0 ? courseChange.info.substring(0, 145) : undefined;
    if (courseChange.info.length > 145) {
        additionalInfo += "...";
    }

    if (subHeadline.length <= 0 && additionalInfo) {
        subHeadline = additionalInfo;
        additionalInfo = undefined;
    }

    let marginBottom = 5;

    if (isLastElement) {
        marginBottom = 30;
    }

    return <ListComponent
        circleColor={color}
        circleText={label}
        headlineText={courseChange.time.period + ". " + label}
        subHeadlineText={subHeadline}
        additionalInfo={additionalInfo}
        style={{marginBottom}}
    />
}

function renderGeneralInfoCard(announcementsData: Announcement[]) {
    return <GeneralInfoCard announcements={announcementsData} />
}

function renderGeneralInfoHeader(title: string) {
    return (
        <GeneralInfoHeader title={title} />
    );
}

function renderDayScheduleChangeHeader(scheduleScreenSection: ScheduleChangeScreenSection<CourseChange, Announcement>): React.ReactElement {
    const announcements: ReactNode[] = [];

    for (let i = 0; i < scheduleScreenSection.auxilliaryData.length; i++) {
        let announcement = scheduleScreenSection.auxilliaryData[i];
        announcements.push(
            <Text key={i} style={{ color: '#757575' }}>{announcement.text}</Text>
        );
    }

    const header = (
        <View style={{ flex: 1, marginBottom: 15}}>
            <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 5 }}>
                {scheduleScreenSection.title}
            </Text>
            {announcements}
        </View>
    );

    return header;
};

type ScheduleChangeScreenSection<T, K> = { type: string, title: string, auxilliaryData: K[], data: T[] };

type ScheduleChangesSectionListViewProps = {
    scheduleChangePlan: ScheduleChangePlan,
    coursesViewPropertiesMap: Map<string, CourseViewProperties>,
    refreshControl: React.ReactElement
}

export default function ScheduleChangesSectionListView(props: ScheduleChangesSectionListViewProps) {
    const sections : ScheduleChangeScreenSection<CourseChange | Announcement[], Announcement>[]  = [];
    const { scheduleChangePlan, coursesViewPropertiesMap, refreshControl } = props;

    sections.push(
        {
            type: "generalInfoSection", 
            title: "Allgemeine Informationen", 
            auxilliaryData: [],
            data: [scheduleChangePlan.announcements]
        }
    )

    for (let dayScheduleChanges of scheduleChangePlan.dayScheduleChanges) {
        sections.push(
            {
                type: "scheduleChangesSection", 
                title: dayjs(dayScheduleChanges.date).locale('de').format("dddd DD.MM."),
                auxilliaryData: dayScheduleChanges.announcements,
                data: dayScheduleChanges.courseChanges
            }
        );
    }

    return (<SectionList
            refreshControl={refreshControl}
            style={{ flex: 1 }}
            contentContainerStyle={scheduleChangeStyles.listContainer}
            sections={sections}
            renderSectionHeader={
                (info: {section: ScheduleChangeScreenSection<CourseChange | Announcement[], Announcement>}) => {
                    if (info.section.type === "generalInfoSection") {
                        if ((info.section.data[0] as Announcement[]).length > 0) {
                            return renderGeneralInfoHeader(info.section.title);
                        }else {
                            return null;
                        }
                    }
    
                    return renderDayScheduleChangeHeader(info.section as ScheduleChangeScreenSection<CourseChange, Announcement>);
                }
            }

            renderItem={
                (renderItem) => {

                    if (renderItem.section.type === "generalInfoSection") {
                        if ((renderItem.section.data[0] as Announcement[]).length > 0) {
                            return renderGeneralInfoCard(renderItem.item as Announcement[]);
                        }else {
                            return null;
                        }
                    }

                    return renderScheduleChangeItem(renderItem.item as CourseChange, 
                                                    coursesViewPropertiesMap, 
                                                    renderItem.index === renderItem.section.data.length-1);
                }
            }
        />
    );
}

export const scheduleChangeStyles = StyleSheet.create({
    listContainer: {
        paddingBottom: 50,
        paddingTop: 10,
        paddingHorizontal: 15
    }
});

export {renderGeneralInfoCard, renderGeneralInfoHeader};