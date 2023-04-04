const baseUrl: string = "http://192.168.1.10:3000";
const studentLogin: string = `${baseUrl}/students`;
const teacherLogin: string = `${baseUrl}/teachers`;

const LoginNetworkErrorTypes = {
    SUCCESS: 0,
    ERROR: 1,
    CONNECTION_ERROR: 2,
    RESPONSE_ERROR: 3,
    FORMAT_ERROR: 4
}

async function fetchJsonContent(endpoint: string) {
    let response;

    try {
        response = await fetch(endpoint);
    }catch(e) {
        throw new Error("ConnectionError: Error requesting from Network.", {cause: LoginNetworkErrorTypes.CONNECTION_ERROR});
    }

    if (response.ok) {
        try {
            return await response.json();
        }catch(e) {
            throw new Error("FormatError: Response has unexpected structure.", {cause: LoginNetworkErrorTypes.FORMAT_ERROR})
        }
    } else {
        throw new Error("ResponseError: Response was bad (not 200 ok).", {cause: LoginNetworkErrorTypes.RESPONSE_ERROR});
    }
}

function validateAuthResponse(response: any) {
    if (response.hasOwnProperty("token")) {
            return response;
    }else {
        throw new Error("FormatError: Response has unexpected structure.", {cause: LoginNetworkErrorTypes.FORMAT_ERROR})
    }
}

async function loginStudent(username: string, password: string): Promise<User> {
    let endpoint = studentLogin + `/${username}/auth?password=${password}`;

    let response  = await fetchJsonContent(endpoint);

    let token = validateAuthResponse(response).token;

    return { username, token, type: "student" };
}

async function loginTeacher(username: string, password: string) : Promise <User> {
    let endpoint = teacherLogin + `/${username}/auth?password=${password}`;

    let response  = await fetchJsonContent(endpoint);

    let token = validateAuthResponse(response).token;

    return { username, token, type: "teacher" };
}

interface User {
    type: string;
    token: string;
    username: string;
}

export { loginStudent, loginTeacher, LoginNetworkErrorTypes, User};