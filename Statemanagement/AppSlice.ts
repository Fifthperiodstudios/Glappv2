import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../api/LoginApi";
import { ExamSchedule, ScheduleChangePlan, Timetable } from "../api/ApiModel";
import { CourseViewProperties } from "./AppModel";
import { DataStatus, FetchDataStatus } from "../repository/Repository";
import { initalSettingsState, Preferences, Settings } from "../repository/Settings";

interface AppState {
    settings: Settings,

    coursesViewProperties: CourseViewProperties[];
    temporaryCoursesViewProperties: CourseViewProperties[];

    timetable: Timetable | null,
    timetableState: DataStatus,

    scheduleChangePlan: ScheduleChangePlan | null,
    scheduleChangePlanState: DataStatus,

    examSchedule: ExamSchedule | null,
    examScheduleState: DataStatus
}

const initialState: AppState = {
    settings: initalSettingsState,

    coursesViewProperties: [],
    temporaryCoursesViewProperties: [],

    timetable: null,
    timetableState: { status: FetchDataStatus.LOADING, message: "" },

    scheduleChangePlan: null,
    scheduleChangePlanState: { status: FetchDataStatus.LOADING, message: "" },

    examSchedule: null,
    examScheduleState: { status: FetchDataStatus.LOADING, message: "" }
}


export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        loggedIn: (state, action: PayloadAction<User>) => {
            return {
                ...state,
                settings: {...state.settings, user: action.payload}
            };
        },

        coursesViewPropertiesChanged: (state, action: PayloadAction<CourseViewProperties[]>) => {
            return { ...state, coursesViewProperties: action.payload };
        },

        courseViewPropertiesChanged: (state, action: PayloadAction<CourseViewProperties>) => {
            state.coursesViewProperties.forEach((props) => {
                if (props.courseid === action.payload.courseid) {
                    props.style = action.payload.style;
                    props.label = action.payload.label;
                    props.visible = action.payload.visible;
                }
            });
            return state;
        },

        timetableStateChanged: (state, action: PayloadAction<{ timetable: Timetable | null, status: DataStatus }>) => {
            return { ...state, timetable: action.payload.timetable, timetableState: action.payload.status };
        },

        scheduleChangePlanStateChanged: (state, action: PayloadAction<{ scheduleChangePlan: ScheduleChangePlan | null, status: DataStatus }>) => {
            return { ...state, scheduleChangePlan: action.payload.scheduleChangePlan, scheduleChangePlanState: action.payload.status };
        },

        examScheduleStateChanged: (state, action: PayloadAction<{ examSchedule: ExamSchedule | null, status: DataStatus }>) => {
            return { ...state, examSchedule: action.payload.examSchedule, examScheduleState: action.payload.status };
        },

        preferencesChanged: (state, action: PayloadAction<Preferences>) => {
            return { ...state, settings: {...state.settings, preferences: action.payload} };
        },

        resetState: () => {
            return { ...initialState };
        }
    }
});

export default appSlice.reducer;
export const { loggedIn, preferencesChanged, examScheduleStateChanged, courseViewPropertiesChanged, resetState, coursesViewPropertiesChanged, timetableStateChanged, scheduleChangePlanStateChanged } = appSlice.actions;
