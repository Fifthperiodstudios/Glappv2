import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../api/LoginApi";
import { ExamSchedule, ScheduleChangePlan, Timetable } from "../api/ApiModel";
import { CourseViewProperties, Settings, SlotViewProperties } from "./AppModel";
import { DataStatus, FetchDataStatus } from "../repository/Repository";

interface AppState {
    user: User,
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
    user: { username: "", token: "", type: "" },

    settings: {
        showEmptyCourse: true,
        showNotifications: true,
    },

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
                user: action.payload
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

        slotsViewPropertiesChanged: (state, action: PayloadAction<SlotViewProperties[]>) => {
            return { ...state, slotsViewProperties: action.payload };
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

        settingsChanged: (state, action: PayloadAction<Settings>) => {
            return { ...state, settings: action.payload };
        },

        resetState: () => {
            return { ...initialState };
        }
    }
});

export default appSlice.reducer;
export const { loggedIn, settingsChanged, examScheduleStateChanged, courseViewPropertiesChanged, resetState, coursesViewPropertiesChanged, slotsViewPropertiesChanged, timetableStateChanged, scheduleChangePlanStateChanged } = appSlice.actions;
