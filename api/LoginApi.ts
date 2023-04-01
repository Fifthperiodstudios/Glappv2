const baseUrl: string = "http://192.168.1.10:3000";
const studentLogin: string = `${baseUrl}/students`;
const teacherLogin: string = `${baseUrl}/teachers`;

async function loginStudent(username: string, password: string): Promise<User> {
    let endpoint = studentLogin + `/${username}/auth?password={password}`;

    let response = await fetch(endpoint);
    let token = await evaluateResponse(response);

    return { username, token, type: "student" };
}

async function loginTeacher(username: string, password: string) : Promise <User> {
    let endpoint = teacherLogin + `/${username}/auth?password=${password}`;

    let response = await fetch(endpoint);
    let token = await evaluateResponse(response);

    return { username, token, type: "teacher" };
}

async function evaluateResponse(response : Response) {
    if (response.ok) {
        let json = await response.json();
        console.log(json);

        let token = json['token'];
        console.log(token);

        if (!token) {
            throw new Error("Response Format Error")
        }

        return token;
    } else {
        throw new Error('Response Error');
    }
}


interface User {
    type: string;
    token: string;
    username: string;
}

export { loginStudent, loginTeacher, User };