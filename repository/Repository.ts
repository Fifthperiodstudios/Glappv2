import { ExamSchedule, ScheduleChangePlan, Timetable } from "../api/ApiModel";
import { User } from "../api/LoginApi";
import { NetworkDataSource, NetworkStatusTypes } from "../api/NetworkApi";
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

    STORAGE_ERROR: 5,
    /*
    Practically not an error, won't be displayed, as this always happens
    the first time the app is started.
    */
    STORAGE_ERROR_NETWORK_DATA: 6, 

    /*
    This is display through a greyed out statusbar
    */
    NETWORK_ERROR_OFFLINE: 7, 

    /*
    This should cause the user to be logged out.
    */
    NETWORK_ERROR_UNAUTHORIZED: 8,

    /*
    This is probably a more severe error that the user should be notified about.
    Should be displayed along with offline data, if available.
    */
    NETWORK_ERROR_OTHER: 9 
}

function evaluateNetworkError(e: unknown) : {cause: number, message: string} {
    if (e instanceof Error) {
        if ("cause" in e) {
            if (typeof e.cause === "number") {


                return {cause: e.cause, message: e.message};
            }
        }
    }

    return {cause: NetworkStatusTypes.ERROR, message: "Unknown Error"};
}

async function initializeRepository(schemaVersion?: number) {
    return await initializeLocalDataSource(schemaVersion);
}

async function fetchOfflineFirstTimetable(
    user: User,
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource,
): Promise<DataHolder<Timetable|null>> {

    let storedTimestamp: number | undefined;

    let localTimetable: Timetable | null = null;

    let networkTimetable: Timetable | null = null;
    let networkStatus: number = NetworkStatusTypes.ERROR;

    let errorMessage = "";

    try {
        localTimetable = await localDataSource.fetchLocalTimetable();
        storedTimestamp = localTimetable.timestamp;
    } catch (e) {
        console.log("fetchOfflineFirstTimetable@localDataSource.fetchLocalTimetable()");
    
        if (e instanceof Error) {
            console.log("Error accessing localstorage: " + e.message);
            errorMessage = e.message.substring(0, 20);
        }
    }

    try {
        const networkResult = await networkDataSource.fetchTimetableEndpoint(user, storedTimestamp);
        if (networkResult.status === "success") {
            networkTimetable = networkResult.data;
        } else if (networkResult.status === "no-change-since") {
            networkTimetable = localTimetable;
        }

        networkStatus = NetworkStatusTypes.SUCCESS;
    } catch (e) {
        console.log("fetchOfflinefirstTimetable@networkDataSource.fetchTimetableEndpoint");
        console.log(e);

        const {cause, message} = evaluateNetworkError(e);
        errorMessage = message.substring(0,20);
        networkStatus = cause;
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
        if (networkStatus === NetworkStatusTypes.CONNECTION_ERROR) {
            return {
                data: localTimetable,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OFFLINE,
                    message: errorMessage
                }
            }
        }else if(networkStatus === NetworkStatusTypes.UNAUTHORIZED) {
            return {
                data: null,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED,
                    message: errorMessage
                }
            }
        }else {
            return {
                data: localTimetable,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OTHER,
                    message: errorMessage
                }
            }
        }
    }

    throw new Error("FatalError: We could neither load the timetable from storage nor from the network.", {cause: FetchDataStatus.FATAL_ERROR});
}

async function fetchOfflineFirstTimetableWithProps(
    user: User,
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource
): Promise<DataHolder<{timetable: Timetable | null, 
    coursesViewProperties: CourseViewProperties[]
   }>>  {

    const timetableHolder = await fetchOfflineFirstTimetable(user, localDataSource, networkDataSource);

    let coursesViewProperties: CourseViewProperties[] = [];
    if (timetableHolder.data) {
        coursesViewProperties = await fetchCourseViewProperties(timetableHolder.data, localDataSource);
    }

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
        console.log("fetchTimetableWithPropsFromNetwork@networkDataSource.fetchTimetableEndpoint");
        console.log(e);
        const {cause, message} = evaluateNetworkError(e);
        const errorMessage = message.substring(0, 20);
    
        if (cause === NetworkStatusTypes.CONNECTION_ERROR) {
            return {
                data: {timetable: cachedTimetable, coursesViewProperties: cachedCoursesViewProperties},
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OFFLINE,
                    message: errorMessage
                }
            };
        } else if (cause === NetworkStatusTypes.UNAUTHORIZED) {
            return {
                data: {timetable: null, coursesViewProperties: []},
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED,
                    message: errorMessage
                }
            }
        }else {
            return {
                data: {timetable: cachedTimetable, coursesViewProperties: cachedCoursesViewProperties},
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OTHER,
                    message: errorMessage
                }
            }
        }
    }

    let timetable: Timetable | null;
    let coursesViewProperties: CourseViewProperties[];
    let status: DataStatus;

    if (networkResult.status === "success") {
        timetable = networkResult.data;
        coursesViewProperties = migrateCoursesViewProperties(networkResult.data, cachedCoursesViewProperties);

        status = {
            status: FetchDataStatus.SUCCESS_DATACHANGE,
            message: ""
        }

        localDataSource.storeTimetableLocally(timetable as Timetable);
        localDataSource.storeCoursesPropertiesLocally(coursesViewProperties);

        return {
            data: {timetable, coursesViewProperties},
            status
        }
    }else if (networkResult.status === "no-change-since") {
        timetable = cachedTimetable;
        coursesViewProperties = cachedCoursesViewProperties;

        status = {
            status: FetchDataStatus.SUCCESS_NO_CHANGE,
            message: ""
        }

        return {
            data: {timetable, coursesViewProperties},
            status
        }
    }

    throw new Error("FatalError: Unreachable statement reached.");
}

async function fetchOfflineFirstExams(
    user: User,
    localDataSource: LocalDataSource,
    networkDataSource: NetworkDataSource,
): Promise<DataHolder<ExamSchedule | null>> {

    let storedTimestamp: number | undefined;

    let localExamSchedule: ExamSchedule | null = null;
    let networkExamSchedule: ExamSchedule | null = null;
    let networkStatus: number = NetworkStatusTypes.ERROR;

    let errorMessage: string = "";

    try {
        localExamSchedule = await localDataSource.fetchLocalExamSchedule();
        storedTimestamp = localExamSchedule.timestamp;
    } catch (e) {
        console.log("fetchOfflineFirstExams@localDataSource.fetchLocalExamSchedule");
        console.log(e);

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
        }
        networkStatus = NetworkStatusTypes.SUCCESS;
    } catch (e) {
        console.log("fetchOfflineFirstExams@networkDataSource.fetchExamsEndpoint");
        console.log(e);

        networkExamSchedule = null;
        const {cause, message} = evaluateNetworkError(e);
        networkStatus = cause;
        errorMessage = message.substring(0, 20);
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
        if (networkStatus === NetworkStatusTypes.CONNECTION_ERROR){
            return {
                data: localExamSchedule,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OFFLINE,
                    message: errorMessage
                }
            }
        } else if (networkStatus === NetworkStatusTypes.UNAUTHORIZED) {
            return {
                data: null,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED,
                    message: errorMessage
                }
            }
        }else {
            return {
                data: localExamSchedule,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OTHER,
                    message: errorMessage
                }
            }
        }
    }

    throw new Error("FatalError: Unreachable statement reached.");
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
        console.log("fetchExamsFromNetwork@networkDataSource.fetchExamsEndpoint");
        console.log(e);

        const {cause, message} = evaluateNetworkError(e);
        if (cause === NetworkStatusTypes.CONNECTION_ERROR) {
            return {
                data: cachedExamSchedule,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OFFLINE,
                    message: ""
                }
            };
        }else if (cause === NetworkStatusTypes.UNAUTHORIZED){
            return {
                data: null,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED,
                    message: ""
                }
            };
        }else {
            return {
                data: cachedExamSchedule,
                status: {
                    status: FetchDataStatus.NETWORK_ERROR_OTHER,
                    message: message.substring(0,20)
                }
            };
        }
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

        return {
            data,
            status
        }

    }else if (networkResult.status === "no-change-since"){
        data = cachedExamSchedule;
        status = {
            status: FetchDataStatus.SUCCESS_NO_CHANGE,
            message: ""
        }

        return {
            data,
            status
        }
    }

    throw new Error("FatalError: Unreachable statement reached.")

}

async function fetchScheduleChangesFromNetwork(
    user: User,
    networkDataSource: NetworkDataSource,
    scheduleChangePlan: ScheduleChangePlan | null
): Promise<DataHolder<ScheduleChangePlan | null>> {

    const timestamp = scheduleChangePlan === null ? undefined : scheduleChangePlan.timestamp;
    let networkResult;

    try {
        networkResult = await networkDataSource.fetchScheduleChangesEndpoint(user, timestamp);
    }catch (e) {
        console.log("fetchScheduleChangesFromNetwork@networkDataSource.fetchScheduleChangesEndpoint");
        console.log(e);

        const {cause, message} = evaluateNetworkError(e);
        
        switch(cause) {
            case NetworkStatusTypes.UNAUTHORIZED:
                return {
                    data: null,
                    status: {
                        status: FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED,
                        message: message.substring(0, 20)
                    }
                };
            default:
                return {
                    data: null,
                    status: {
                        status: FetchDataStatus.NETWORK_ERROR_UNAUTHORIZED,
                        message: message.substring(0, 20)
                    }
                };
        }
    }

    let data: ScheduleChangePlan | null;
    let status: DataStatus;

    if (networkResult.status === "success") {
        data = networkResult.data;

        status = {
            status: FetchDataStatus.SUCCESS_DATACHANGE,
            message: ""
        }

        return {
            data,
            status
        }
    }else if (networkResult.status === "no-change-since"){
        data = scheduleChangePlan;
        status = {
            status: FetchDataStatus.SUCCESS_NO_CHANGE,
            message: ""
        }

        return {
            data,
            status
        }
    }

    throw new Error("FatalError: Unreachable statement reached.")
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