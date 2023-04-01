interface Course {
    id: string,
    abbrev: string,
    type: string,
    title: string,
    classname: string,

    teacher: {
        name: string,
        abbrev: string
    },
};

interface Place {
    room: string
}

interface Time {
    period: number
}

interface Timetable {
    timestamp: number,
    date: string,
    studentid: string,
    classname: string,
    schedule: {
        day: string,
        courses: {time: Time, course: Course, place: Place, }[]
    }[]
};

interface Announcement {
    date: string,
    text: string
}

interface CourseChange {
    period: number,
    course: Course,
    type: string,
    info: string,

    substitute: {
        name: string,
        abbrev: string
    } | undefined,

    newPlace: {
        room: string
    } | undefined,
};

interface DayScheduleChanges {
    date: string,
    announcements: Announcement[],
    courseChanges: CourseChange[],
}

interface Exam {
    date: string,
    time: {
        beginPeriod: number,
        endPeriod: number
    }
    place: {
        room: string
    }
    course: Course
    info: string,

    asOfDate: string
}

interface ExamSchedule {
    timestamp: number,
    date: string,

    exams: Exam[]
}

interface ScheduleChangePlan {
    timestamp: number,
    studentid: string,
    announcements: Announcement[],

    dayScheduleChanges: DayScheduleChanges[]
}

export { Timetable, ScheduleChangePlan, Announcement, DayScheduleChanges, CourseChange, Course, Exam, ExamSchedule};