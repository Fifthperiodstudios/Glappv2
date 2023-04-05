import * as SecureStore from 'expo-secure-store';
import { User } from "../api/LoginApi";

interface Settings {
    user: User,

    preferences: Preferences
}

interface Preferences {
    showEmptyCourse: boolean,
    showNotifications: boolean,
}

const initalSettingsState: Settings = {
    user: {username: "", type: "", token: ""},

    preferences: {
        showEmptyCourse: true,
        showNotifications: true,
    }
}


async function saveUser(user: User) {
    await SecureStore.setItemAsync("username", user.username);
    await SecureStore.setItemAsync("type", user.type);
    await SecureStore.setItemAsync("token", user.token);
}

async function logoutUser() {
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("type");
    await SecureStore.deleteItemAsync("token");
}

async function getUser() : Promise<User>{

    const username = await SecureStore.getItemAsync("username");
    const type = await SecureStore.getItemAsync("type");
    const token = await SecureStore.getItemAsync("token");

    if (username === null || type === null || token === null) {
        throw new Error("User is probably logged out.");
    }

    return {
        username,
        type,
        token
    }
}

async function setShowEmptyCourse(showEmptyCourse: boolean) {
    let valueShowEmptyCourse;
    if (showEmptyCourse) {
        valueShowEmptyCourse = "true";
    }else {
        valueShowEmptyCourse = "false";
    }

    await SecureStore.setItemAsync("showEmptyCourse", valueShowEmptyCourse);
}

async function getShowEmptyCourse() : Promise<boolean>{
    let showEmptyCourse;
    let valueShowEmptyCourse = await SecureStore.getItemAsync("showEmptyCourse");
    
    if (valueShowEmptyCourse === null) {
        await SecureStore.setItemAsync("showEmptyCourse", "true");
        showEmptyCourse = true;
    }else {
        if (valueShowEmptyCourse === "true") {
            showEmptyCourse = true;
        }else if (valueShowEmptyCourse === "false") {
            showEmptyCourse = false;
        }else {
            SecureStore.setItemAsync("showEmptyCourse", "true");
            showEmptyCourse = true;
        }
    }

    return showEmptyCourse;
}

async function getStoredSchemaVersion() : Promise<number | null>{
    const valueStoredSchemaVersion = await SecureStore.getItemAsync("storedSchemaVersion");

    if (valueStoredSchemaVersion) {
        return Number(valueStoredSchemaVersion);
    }else {
        return null;
    }
}

async function setStoredSchemaVersion(schemaVersion: number) : Promise<void>{
    await SecureStore.setItemAsync("storedSchemaVersion", schemaVersion.toString());
}

async function getPreferences() : Promise<Preferences>{
    const showEmptyCourse = await getShowEmptyCourse();

    return {showEmptyCourse, showNotifications: false};
}

async function resetPreferences(): Promise<void> {
    //you should rather remove the preferences entirely
    await SecureStore.setItemAsync("showEmptyCourse", "true");
}

export const SettingsManager = {
    logoutUser,
    getUser,
    saveUser,
    getStoredSchemaVersion,
    setStoredSchemaVersion,
    setShowEmptyCourse,
    getShowEmptyCourse,
    getPreferences,
    resetPreferences,
}

export { Settings, Preferences, initalSettingsState }