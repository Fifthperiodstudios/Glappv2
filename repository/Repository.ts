import { ExamSchedule, ScheduleChangePlan, Timetable } from "../api/ApiModel";
import { User } from "../api/LoginApi";
import { NetworkDataSource, NetworkResult } from "../api/NetworkApi";
import { CourseViewProperties } from "../Statemanagement/AppModel";
import { createCoursesViewProperties, migrateCoursesViewProperties } from "../Statemanagement/Businesslogic";
import { initializeLocalDataSource, LocalDataSource } from "./LocalDataSource";

interface DataStatus {
    status: number,
    message: string
};

interface DataHolder<T> {
    data: T,
    status: DataStatus
}

const FetchDataStatus = {
    FATAL_ERROR: 0,
    LOADING: 1,
    SUCCESS_NO_CHANGE: 2,
    SUCCESS_DATACHANGE: 3,
    SUCCESS: 4,
    STORAGE_ERROR_NETWORK_DATA: 5,
    NETWORK_ERROR_OFFLINE_DATA: 6,
    NETWORK_ERROR: 7,
}

async function initializeRepository(schemaVersion?: number) {
    return await initializeLocalDataSource(schemaVersion);
}

async function fetchOfflineFirstTimetable(
    user: User,
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource,
): Promise<DataHolder<Timetable>> {

    let storedTimestamp: number | undefined;

    let localTimetable: Timetable | null = null;
    let networkTimetable: Timetable | null = null;
    let errorMessage: string = "";

    try {
        localTimetable = await localDataSource.fetchLocalTimetable();
        storedTimestamp = localTimetable.timestamp;
    } catch (e) {
        localTimetable = null;

        if (e instanceof Error) {
            errorMessage = e.message.substring(0, 20);

            console.log("Error accessing localstorage: " + e.message);
        }
    }

    try {
        const networkResult = await networkDataSource.fetchTimetableEndpoint(user, storedTimestamp);
        if (networkResult.status === "success") {
            networkTimetable = networkResult.data;
        } else if (networkResult.status === "no-change-since") {
            networkTimetable = localTimetable;
        } else {
            networkTimetable = null;
        }
    } catch (e) {
        networkTimetable = null;

        if (e instanceof Error) {
            errorMessage = e.message.substring(0, 20);

            console.log("Error requesting network timetable: " + e.message);
        }
    }

    if (networkTimetable && localTimetable) {
        let status: number;

        if (networkTimetable === localTimetable) {
            status = FetchDataStatus.SUCCESS_NO_CHANGE;
        }else {
            status = FetchDataStatus.SUCCESS_DATACHANGE;
            localDataSource.storeTimetableLocally(networkTimetable);
        }

        return {
            data: networkTimetable,
            status: {
                status,
                message: ""
            }
        }
    }

    if (networkTimetable) {
        localDataSource.storeTimetableLocally(networkTimetable);

        return {
            data: networkTimetable,
            status: {
                status: FetchDataStatus.STORAGE_ERROR_NETWORK_DATA,
                message: errorMessage
            }
        }
    }

    if (localTimetable) {
        return {
            data: localTimetable,
            status: {
                status: FetchDataStatus.NETWORK_ERROR_OFFLINE_DATA,
                message: errorMessage
            }
        }
    }

    throw new Error("FATAL_ERROR");
}

async function fetchOfflineFirstTimetableWithProps(
    user: User,
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource
): Promise<DataHolder<{timetable: Timetable, 
    coursesViewProperties: CourseViewProperties[]
   }>>  {

    const timetableHolder = await fetchOfflineFirstTimetable(user, localDataSource, networkDataSource);
    const coursesViewProperties = await fetchCourseViewProperties(timetableHolder.data, localDataSource);

    return {
        data: {
            timetable: timetableHolder.data,
            coursesViewProperties,
        },
        status: {
            ...timetableHolder.status
        }
    }
}

async function fetchTimetableWithPropsFromNetwork(
    user: User,
    localDataSource: LocalDataSource, 
    networkDataSource: NetworkDataSource,
    cachedTimetable: Timetable | null,
    cachedCoursesViewProperties: CourseViewProperties[],
): Promise<DataHolder<{timetable: Timetable | null, 
    coursesViewProperties: CourseViewProperties[]
   }>> {

    const timestamp = cachedTimetable === null ? undefined : cachedTimetable.timestamp;
    let networkResult;

    try {
        networkResult = await networkDataSource.fetchTimetableEndpoint(user, timestamp);
    }catch(e) {
        return {
            data: {timetable: cachedTimetable, coursesViewProperties: cachedCoursesViewProperties},
            status: {
                status: FetchDataStatus.NETWORK_ERROR_OFFLINE_DATA,
                message: ""
            }
        };
    }

    let timetable: Timetable | null;
    let coursesViewProperties: CourseViewProperties[];
    let status: DataStatus;

    if (networkResult.status === "success") {
        if (networkResult.data === null) throw new Error("network result data cannot be null when status is success");

        timetable = networkResult.data;
        coursesViewProperties = migrateCoursesViewProperties(networkResult.data, cachedCoursesViewProperties);

        status = {
            status: FetchDataStatus.SUCCESS_DATACHANGE,
            message: ""
        }

        localDataSource.storeTimetableLocally(timetable as Timetable);
        localDataSource.storeCoursesPropertiesLocally(coursesViewProperties);
    }else if (networkResult.status === "no-change-since") {
        timetable = cachedTimetable;
        coursesViewProperties = cachedCoursesViewProperties;

        status = {
            status: FetchDataStatus.SUCCESS_NO_CHANGE,
            message: ""
        }
    }else {
        throw new Error("Unexpected value for status property of network result");
    }

    return {
        data: {timetable, coursesViewProperties},
        status
    }

}

async function fetchOfflineFirstExams(
    user: User,
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource,
): Promise<DataHolder<ExamSchedule>> {

    let storedTimestamp: number | undefined;

    let localExamSchedule: ExamSchedule | null = null;
    let networkExamSchedule: ExamSchedule | null = null;

    let errorMessage: string = "";

    try {
        localExamSchedule = await localDataSource.fetchLocalExamSchedule();
        storedTimestamp = localExamSchedule.timestamp;
    } catch (e) {
        localExamSchedule = null;

        if (e instanceof Error) {
            errorMessage = e.message.substring(0, 20);

            console.log("Error accessing localstorage: " + e.message);
        }
    }

    try {
        const networkResult = await networkDataSource.fetchExamsEndpoint(user, storedTimestamp);
        if (networkResult.status === "success") {
            networkExamSchedule = networkResult.data;
        } else if (networkResult.status === "no-change-since") {
            networkExamSchedule = localExamSchedule;
        } else {
            networkExamSchedule = null;
        }
    } catch (e) {
        networkExamSchedule = null;

        if (e instanceof Error) {
            errorMessage = e.message.substring(0, 20);

            console.log("Error requesting network timetable: " + e.message);
        }
    }

    if (networkExamSchedule && localExamSchedule) {
        let status: number;

        if (networkExamSchedule === localExamSchedule) {
            status = FetchDataStatus.SUCCESS_NO_CHANGE;
        }else {
            status = FetchDataStatus.SUCCESS_DATACHANGE;
            localDataSource.storeExamScheduleLocally(networkExamSchedule);
        }

        return {
            data: networkExamSchedule,
            status: {
                status,
                message: ""
            }
        }
    }

    if (networkExamSchedule) {
        localDataSource.storeExamScheduleLocally(networkExamSchedule);

        return {
            data: networkExamSchedule,
            status: {
                status: FetchDataStatus.STORAGE_ERROR_NETWORK_DATA,
                message: errorMessage
            }
        }
    }

    if (localExamSchedule) {
        return {
            data: localExamSchedule,
            status: {
                status: FetchDataStatus.NETWORK_ERROR_OFFLINE_DATA,
                message: errorMessage
            }
        }
    }

    throw new Error("FATAL_ERROR");
}

async function fetchExamsFromNetwork(
    user: User, 
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource,
    cachedExamSchedule: ExamSchedule | null) {

    const timestamp = cachedExamSchedule === null ? undefined : cachedExamSchedule.timestamp;
    let networkResult;

    try {
        networkResult = await networkDataSource.fetchExamsEndpoint(user, timestamp);
    }catch(e) {
        return {
            data: cachedExamSchedule,
            status: {
                status: FetchDataStatus.NETWORK_ERROR_OFFLINE_DATA,
                message: ""
            }
        };
    }
    let data: ExamSchedule | null;
    let status: DataStatus;

    if (networkResult.status === "success") {
        data = networkResult.data;
        status = {
            status: FetchDataStatus.SUCCESS_DATACHANGE,
            message: ""
        }

        localDataSource.storeExamScheduleLocally(networkResult.data);
    }else if (networkResult.status === "no-change-since"){
        data = cachedExamSchedule;
        status = {
            status: FetchDataStatus.SUCCESS_NO_CHANGE,
            message: ""
        }
    }else {
        throw new Error("Unexpected value for status property of network result");
    }

    return {
        data,
        status
    }
}

async function fetchScheduleChangesFromNetwork(
    user: User,
    networkDataSource: NetworkDataSource,
    scheduleChangePlan: ScheduleChangePlan | null
): Promise<DataHolder<ScheduleChangePlan | null>> {

    const timestamp = scheduleChangePlan === null ? undefined : scheduleChangePlan.timestamp;
    const networkResult = await networkDataSource.fetchScheduleChangesEndpoint(user, timestamp);
    let data: ScheduleChangePlan | null;
    let status: DataStatus;

    if (networkResult.status === "success") {
        data = networkResult.data;
        status = {
            status: FetchDataStatus.SUCCESS_DATACHANGE,
            message: ""
        }

    }else if (networkResult.status === "no-change-since"){
        data = scheduleChangePlan;
        status = {
            status: FetchDataStatus.SUCCESS_NO_CHANGE,
            message: ""
        }
    }else {
        throw new Error("Unexpected value for status property of network result");
    }

    return {
        data,
        status
    }
}

async function fetchCourseViewProperties(timetable: Timetable, localDataSource: LocalDataSource) {
    let coursesViewProperties: CourseViewProperties[];
    try {
        const localCoursesViewProperties = await localDataSource.fetchLocalCoursesViewProperties();
        coursesViewProperties = migrateCoursesViewProperties(timetable, localCoursesViewProperties);

        localDataSource.storeCoursesPropertiesLocally(coursesViewProperties);
    } catch (e) {
        coursesViewProperties = createCoursesViewProperties(timetable);

        localDataSource.storeCoursesPropertiesLocally(coursesViewProperties);
        if (e instanceof Error) {
            console.log("Error fetching localCoursesViewProperties " + e.message);
        }
    }

    return coursesViewProperties;
}

export { FetchDataStatus, DataHolder, DataStatus };

export const Repository = {
    initializeRepository,
    fetchOfflineFirstTimetable,
    fetchOfflineFirstTimetableWithProps,
    fetchTimetableWithPropsFromNetwork,
    fetchOfflineFirstExams,
    fetchExamsFromNetwork,
    fetchScheduleChangesFromNetwork,
    fetchCourseViewProperties,
};