import * as FileSystem from 'expo-file-system';
import { ExamSchedule, Timetable } from '../api/ApiModel';
import { CourseViewProperties } from '../Statemanagement/AppModel';

const schemaVersion = 1.0;

const localDirectory: string = FileSystem.documentDirectory + "localdata";

const ActionStatus = {
    SUCCESS: 1,
    ALREADY_EXISTS: 2,
    CREATED_AND_SCHEMA_CHANGED: 3,
};


async function initializeLocalDataSource(storedSchemaVersion?: number) : Promise<Number>{
    const dirInfo = await FileSystem.getInfoAsync(localDirectory);
    if (dirInfo.exists) {
        console.log("Directory exists");
        if (storedSchemaVersion === undefined || storedSchemaVersion < schemaVersion) {
            console.log("Directory contains data of old schema version");
            await FileSystem.deleteAsync(localDirectory);
            await FileSystem.makeDirectoryAsync(localDirectory, { intermediates: true });
            return ActionStatus.CREATED_AND_SCHEMA_CHANGED;
        }else {
            return ActionStatus.ALREADY_EXISTS;
        }
    }else {
        console.log("Directory does not exist, creating directory");
        await FileSystem.makeDirectoryAsync(localDirectory, { intermediates: true });
        return ActionStatus.CREATED_AND_SCHEMA_CHANGED;
    }
}

async function deleteLocalDataSource(): Promise<void>{
    await FileSystem.deleteAsync(localDirectory);
}

async function storeTimetableLocally(timetable: Timetable) {
    const dirInfo = await FileSystem.getInfoAsync(localDirectory);

    if (!dirInfo.exists) {
        throw new Error("NO_LOCAL_DATA_FOLDER");
    }

    await FileSystem.writeAsStringAsync(localDirectory + "/timetable.json", JSON.stringify(timetable));
}

async function fetchLocalTimetable() : Promise<Timetable>{
    const dirInfo = await FileSystem.getInfoAsync(localDirectory + "/timetable.json");

    if (!dirInfo.exists) {
        throw new Error("TIMETABLE_DOESNT_EXIST");
    }

    const timetable = await FileSystem.readAsStringAsync(localDirectory + "/timetable.json");

    return JSON.parse(timetable);
}

async function storeExamScheduleLocally(ExamSchedule: ExamSchedule) {
    const dirInfo = await FileSystem.getInfoAsync(localDirectory);

    if (!dirInfo.exists) {
        throw new Error("NO_LOCAL_DATA_FOLDER");
    }

    await FileSystem.writeAsStringAsync(localDirectory + "/examschedule.json", JSON.stringify(ExamSchedule));
}

async function fetchLocalExamSchedule() : Promise<ExamSchedule>{
    const dirInfo = await FileSystem.getInfoAsync(localDirectory + "/examschedule.json");

    if (!dirInfo.exists) {
        throw new Error("ExamSchedule_DOESNT_EXIST");
    }

    const ExamSchedule = await FileSystem.readAsStringAsync(localDirectory + "/examschedule.json");

    return JSON.parse(ExamSchedule);
}

async function storeCoursesPropertiesLocally(courseViewProperties: CourseViewProperties[]) {
    const dirInfo = await FileSystem.getInfoAsync(localDirectory);

    if (!dirInfo.exists) {
        throw new Error("NO_LOCAL_DATA_FOLDER");
    }

    await FileSystem.writeAsStringAsync(localDirectory + "/courseproperties.json", JSON.stringify(courseViewProperties));
}

async function fetchLocalCoursesViewProperties() : Promise<CourseViewProperties[]> {
    const dirInfo = await FileSystem.getInfoAsync(localDirectory + "/courseproperties.json");

    if (!dirInfo.exists) {
        throw new Error("COURSESPROPS_DONT_EXIST");
    }

    const coursesprops = await FileSystem.readAsStringAsync(localDirectory + "/courseproperties.json");

    return JSON.parse(coursesprops);
}

interface LocalDataSource {
    initializeLocalDataSource: (storedSchemaVersion?: number) => Promise<Number>,
    deleteLocalDataSource: () => Promise<void>,
    storeTimetableLocally: (timetable: Timetable) => Promise<void>,
    fetchLocalTimetable: () => Promise<Timetable>,
    storeExamScheduleLocally: (ExamSchedule: ExamSchedule) => Promise<void>,
    fetchLocalExamSchedule: () => Promise<ExamSchedule>,
    storeCoursesPropertiesLocally: (coursesViewProperties: CourseViewProperties[]) => Promise<void>,
    fetchLocalCoursesViewProperties: () => Promise<CourseViewProperties[]>,
};

export const FileLocalDataSource = {
    schemaVersion,
    initializeLocalDataSource,
    deleteLocalDataSource,
    storeTimetableLocally,
    fetchLocalTimetable,
    storeExamScheduleLocally,
    fetchLocalExamSchedule,
    storeCoursesPropertiesLocally,
    fetchLocalCoursesViewProperties
}

export {
    ActionStatus, 
    schemaVersion, 
    LocalDataSource,
    initializeLocalDataSource, 
    deleteLocalDataSource, 
    storeTimetableLocally, 
    fetchLocalTimetable, 
    storeExamScheduleLocally,
    fetchLocalExamSchedule,
    storeCoursesPropertiesLocally, 
    fetchLocalCoursesViewProperties
};

