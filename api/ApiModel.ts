interface Timetable {
    timestamp: number,
    date: string,
    schedule: {
        day: string,
        periods: {time: Time, course?: Course, place?: Place}[]
    }[]
};

interface Place {
    room: string
}

interface Time {
    period: number
}

interface Course {
    id: string,
    abbrev: string,
    type: string,
    classname: string,
    title?: string,

    teacher: Teacher
};

interface Teacher {
    abbrev: string
}

interface ExamSchedule {
    timestamp: number,
    date: string,

    exams: Exam[]
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

interface ScheduleChangePlan {
    timestamp: number,
    announcements: Announcement[],

    dayScheduleChanges: DayScheduleChanges[]
}

interface DayScheduleChanges {
    date: string,
    announcements: Announcement[],
    courseChanges: CourseChange[],
}

interface Announcement {
    date: string,
    text: string
}

interface CourseChange {
    course: Course,
    time: Time,
    place: Place,

    info: string,

    substitute: {
        name: string,
        abbrev: string
    } | undefined,

    newPlace: {
        room: string
    } | undefined,
};


export { Timetable, ScheduleChangePlan, Announcement, DayScheduleChanges, CourseChange, Course, Exam, ExamSchedule};