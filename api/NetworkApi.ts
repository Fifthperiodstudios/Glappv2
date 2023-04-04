import { User } from "./LoginApi";

const baseUrl: string = "http://192.168.1.10:3000";

interface NetworkResult {
    status: string,
    data: any
}

interface NetworkDataSource {
    fetchTimetableEndpoint: (user: User, timestamp?: number) => Promise<NetworkResult>,
    fetchScheduleChangesEndpoint: (user: User, timestamp?: number) => Promise<NetworkResult>,
    fetchExamsEndpoint: (user: User, timestamp?: number) => Promise<NetworkResult>
};

const NetworkStatusTypes = {
    SUCCESS: 0,
    ERROR: 1,
    CONNECTION_ERROR: 2, // When we cant even connect to the WEB API
    RESPONSE_ERROR: 3, // When we can connect, but we get a different response than 200 OK
    FORMAT_ERROR: 4, // When we get a 200 ok but the Response is not formatted correctly
}

async function fetchTimetableEndpoint(user: User, timestamp?: number): Promise<NetworkResult> {
    let timetableEndpoint: string = baseUrl;

    if (user.type == "student") {
        timetableEndpoint += `/students/${user.username}/timetable`;
    }else{
        timetableEndpoint += `/teachers/${user.username}/timetable`;
    }

    if (timestamp !== undefined) {
        timetableEndpoint += `?timestamp=${timestamp}`;
    }

    return validateNetworkResultSchema(await fetchJsonContent(timetableEndpoint));
}

async function fetchScheduleChangesEndpoint(user: User, timestamp?: number) : Promise<NetworkResult>{
    let substitutionsEndpoint: string = baseUrl;

    if (user.type == "student") {
        substitutionsEndpoint += `/students/${user.username}/schedulechanges`;
    }else{
        substitutionsEndpoint += `/teachers/${user.username}/schedulechanges`;
    }

    if (timestamp !== undefined) {
        substitutionsEndpoint += `?timestamp=${timestamp}`;
    }

    return validateNetworkResultSchema(await fetchJsonContent(substitutionsEndpoint));
}

async function fetchExamsEndpoint(user: User, timestamp?: number) : Promise<NetworkResult>{
    let examsEndpoint: string = baseUrl;

    if (user.type == "student") {
        examsEndpoint += `/students/${user.username}/examschedule`;
    }else{
        examsEndpoint += `/teachers/${user.username}/examschedule`;
    }

    if (timestamp !== undefined) {
        examsEndpoint += `?timestamp=${timestamp}`;
    }

    return validateNetworkResultSchema(await fetchJsonContent(examsEndpoint));
}

function validateNetworkResultSchema(response: any) {
    if (response.hasOwnProperty('status') &&
        response.hasOwnProperty('data')) {
            if (response.status === "success") {
                if (!response.data) {
                    throw new Error("FormatError: Response is 'success' but data field is null.", {cause: NetworkStatusTypes.FORMAT_ERROR});
                }
                return response;
            } else if (response.status === "no-change-since") {
                return response;
            } else {
                throw new Error("FormatError: Response has unexpected 'status' value.", {cause: NetworkStatusTypes.FORMAT_ERROR});
            }
    }else {
        throw new Error("FormatError: Response has unexpected structure.", {cause: NetworkStatusTypes.FORMAT_ERROR});
    }
}

async function fetchJsonContent(endpoint: string) {
    let response;
    
    try {
        response = await fetch(endpoint);
    }catch(e) {
        console.log(e);
        throw new Error("ConnectionError: Error requesting from Network.", {cause: NetworkStatusTypes.CONNECTION_ERROR});
    }

    if (response.ok) {
        try {
            return await response.json();
        }catch(e) {
            throw new Error("FormatError: Response okay but may not be json.", {cause: NetworkStatusTypes.FORMAT_ERROR});
        }
    } else {
        throw new Error("ResponseError: Response was bad (not 200 ok).", {cause: NetworkStatusTypes.RESPONSE_ERROR});
    }
}

export const ServerDataSource = {
    fetchScheduleChangesEndpoint,
    fetchTimetableEndpoint,
    fetchExamsEndpoint
};

export {NetworkResult, NetworkStatusTypes, NetworkDataSource};