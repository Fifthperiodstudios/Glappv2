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

    return fetchJsonContent(timetableEndpoint, user.token);
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

    return fetchJsonContent(substitutionsEndpoint, user.token);
}

async function fetchExamsEndpoint(user: User, timestamp?: number) : Promise<NetworkResult>{
    let examsEndpoint: string = baseUrl;

    if (user.type == "student") {
        examsEndpoint += `/students/${user.username}/exams`;
    }else{
        examsEndpoint += `/teachers/${user.username}/exams`;
    }

    if (timestamp !== undefined) {
        examsEndpoint += `?timestamp=${timestamp}`;
    }

    return fetchJsonContent(examsEndpoint, user.token);
}

async function fetchJsonContent(endpoint: string, token: string) {
    let response = await fetch(endpoint);

    if (response.ok) {
        const jsonResponse = await response.json();

        if (jsonResponse.hasOwnProperty('status') &&
            jsonResponse.hasOwnProperty('data')) {
            return jsonResponse;
        }else {
            throw new Error("Format Error");
        }
    } else {
        throw new Error("Response Error");
    }
}

export const ServerDataSource = {
    fetchScheduleChangesEndpoint,
    fetchTimetableEndpoint,
    fetchExamsEndpoint
};

export {NetworkResult, NetworkDataSource};