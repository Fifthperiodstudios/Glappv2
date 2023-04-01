import { Course, Timetable } from "../api/ApiModel";
import { colors, CourseViewProperties } from "./AppModel";

function shuffleArray<Type>(originalArray: Iterable<Type>): Type[]{

    let array = [...originalArray];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
};

function mapFromCoursesViewProperties(coursesViewProperties: CourseViewProperties[]) {
    const courseMap = new Map<string, CourseViewProperties>();

    for (let courseViewProperties of coursesViewProperties) {
        courseMap.set(courseViewProperties.courseid, courseViewProperties);
    }

    return courseMap;
}

function createCoursesViewProperties(timetable: Timetable) : CourseViewProperties[] {
    const coursesViewProperties = [];
    const courseMap = new Map<string, CourseViewProperties>();

    if (courseMap.get("empty") === undefined) {
        const emptyCourse = getEmptyDefaultCourseViewProperties();
        coursesViewProperties.push(emptyCourse);
        courseMap.set(emptyCourse.courseid, emptyCourse);
    }

    const shuffledColors = shuffleArray(colors);

    for (let i = 0; i < timetable.schedule.length; i++) {
        for (let j = 0; j < timetable.schedule[i].courses.length; j++) {
            const course = timetable.schedule[i].courses[j].course;

            if (courseMap.get(course.abbrev) !== undefined) {
                continue;
            }

            if (course.hasOwnProperty("abbrev")) {
                let randomColor = shuffledColors.pop();

                if (randomColor === undefined) {
                    randomColor = colors[0];
                }

                const courseViewProperties = createCourseViewProperties(course, randomColor);

                courseMap.set(courseViewProperties.courseid, courseViewProperties);
                coursesViewProperties.push(courseViewProperties);
            }
        }
    }

    return coursesViewProperties;
};

function createCourseViewProperties(course: Course, color: string): CourseViewProperties{
    const courseViewProperties = {
        courseid: course.abbrev,
        label: course.abbrev,
        
        style: {
            backgroundColor: color
        }
    };

    return courseViewProperties;
}

function getCourseViewProperties(
        coursesViewPropertiesMap: Map<string, CourseViewProperties>,
        course: Course
    ) : CourseViewProperties{
    
    
    const defaultCourseViewProperty = {
        courseid: "_default_",

        label: course.abbrev,
        style: {
            backgroundColor: "grey",
            borderStyle: "dashed",
            borderWidth: 1
        }
    }

    return coursesViewPropertiesMap.get(course.abbrev) || defaultCourseViewProperty;
}

function getEmptyDefaultCourseViewProperties() {
    const emptyCourse = {
        courseid: "empty", 

        label: "Frei", 
        style: {
            backgroundColor: "#EDEDED",
            borderStyle: "dashed",
            borderWidth: 1,
            opacity: 1
        },

        visible: true,
    };

    return emptyCourse;
}

function migrateCoursesViewProperties(newTimetable: Timetable,
                                      oldCoursesViewPropertiesList: CourseViewProperties[]) : CourseViewProperties[]{
    const courseMap = mapFromCoursesViewProperties(oldCoursesViewPropertiesList);
    const reverseColorMap = new Map<string, CourseViewProperties>();

    for (let courseViewProperties of oldCoursesViewPropertiesList) {
        reverseColorMap.set(courseViewProperties.style.backgroundColor, courseViewProperties);
    }

    const availableColors = [];

    for (let color of colors) {
        if (reverseColorMap.get(color) === undefined) {
            availableColors.push(color);
        }
    }

    const shuffledColors = shuffleArray(availableColors);

    const migratedCoursesViewPropertiesMap = new Map<string, CourseViewProperties>();

    for (let i = 0; i < newTimetable.schedule.length; i++) {
        for (let j = 0; j < newTimetable.schedule[i].courses.length; j++) {
            const course = newTimetable.schedule[i].courses[j].course;
            let courseViewProperties;

            if (course.hasOwnProperty("abbrev")) {
                courseViewProperties = courseMap.get(course.abbrev);
            }else {
                courseViewProperties = courseMap.get("empty");
            }

            if (courseViewProperties !== undefined) {
                //if the courseviewprops need to be changed (e.g. because the new timetable has new
                //info /calls for new props) then courseViewProperties may have to be copied.
                migratedCoursesViewPropertiesMap.set(courseViewProperties.courseid, courseViewProperties);
                continue;
            }

            if (course.hasOwnProperty("abbrev")) {
                let randomColor = shuffledColors.pop();

                if (randomColor === undefined) {
                    randomColor = colors[0];
                }

                const courseViewProperties = createCourseViewProperties(course, randomColor);

                courseMap.set(course.abbrev, courseViewProperties);
                migratedCoursesViewPropertiesMap.set(courseViewProperties.courseid, courseViewProperties);
            }else {
                const emptyCourse = getEmptyDefaultCourseViewProperties();
                migratedCoursesViewPropertiesMap.set(emptyCourse.courseid, emptyCourse);
                courseMap.set(emptyCourse.courseid, emptyCourse);
            }
        }
    }

    const migratedCoursesViewProperties: CourseViewProperties[] = [];
    migratedCoursesViewPropertiesMap.forEach((value, key) => {
        migratedCoursesViewProperties.push(value);
    })

    return migratedCoursesViewProperties;
};


export { mapFromCoursesViewProperties, getCourseViewProperties, getEmptyDefaultCourseViewProperties, createCoursesViewProperties, migrateCoursesViewProperties };