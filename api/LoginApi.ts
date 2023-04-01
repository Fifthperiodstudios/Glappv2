const baseUrl: string = "http://192.168.1.10:3000";
const studentLogin: string = `${baseUrl}/students`;
const teacherLogin: string = `${baseUrl}/teachers`;

async function loginStudent(username: string, password: string): Promise<User> {
    let endpoint = studentLogin + `/${username}/auth?password={password}`;
    let response;
    try {
        response  = await fetch(endpoint);
    }catch(e) {
        throw new Error("NetworkError");
    }

    let token = await evaluateResponse(response);

    return { username, token, type: "student" };
}

async function loginTeacher(username: string, password: string) : Promise <User> {
    let endpoint = teacherLogin + `/${username}/auth?password=${password}`;
    let response;
    try {
        response  = await fetch(endpoint);
    }catch(e) {
        throw new Error("NetworkError");
    }
     
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
            throw new Error("ResponseFormatError")
        }

        return token;
    } else {
        throw new Error('ResponseError');
    }
}


interface User {
    type: string;
    token: string;
    username: string;
}

export { loginStudent, loginTeacher, User };