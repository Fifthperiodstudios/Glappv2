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

    //We add a courseViewProperty for the empty course
    const emptyCourse = getEmptyDefaultCourseViewProperties();
    coursesViewProperties.push(emptyCourse);
    courseMap.set(emptyCourse.courseid, emptyCourse);

    const shuffledColors = shuffleArray(colors);

    for (let i = 0; i < timetable.schedule.length; i++) {
        for (let j = 0; j < timetable.schedule[i].periods.length; j++) {
            const course = timetable.schedule[i].periods[j].course;

            //We have already added a courseViewProps for the empty course, so we can skip it
            if (course === undefined) {
                continue;
            }

            //if its not an empty course and we have already added a courseViewProps for it, skip it
            if (courseMap.get(course.id) !== undefined) {
                continue;
            }

            //if the course does not have a courseViewProp we create one
            if (course.hasOwnProperty("id")) {
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
        courseid: course.id,
        label: course.abbrev,
        
        style: {
            backgroundColor: color
        }
    };

    return courseViewProperties;
}

function getCourseViewProperties(
        coursesViewPropertiesMap: Map<string, CourseViewProperties>,
        course: Course | undefined
    ) : CourseViewProperties{

    let courseViewProp: CourseViewProperties | undefined;

    //Check if the course is the empty course and if we already have courseViewProps for it
    if (course === undefined) {
        courseViewProp = coursesViewPropertiesMap.get("empty");
    }

    //if we don't already have courseViewProps for it (this shouldnt happen), return the default one.
    if (course === undefined) {
        return getEmptyDefaultCourseViewProperties();
    }

    //The course is defined
    const courseid = course.hasOwnProperty('id') ? course.id : "_default_";

    const defaultCourseViewProperty = {
        courseid,

        label: course.abbrev,
        style: {
            backgroundColor: "grey",
            borderStyle: "dashed",
            borderWidth: 1
        }
    }

    return coursesViewPropertiesMap.get(course.id) || defaultCourseViewProperty;
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
        for (let j = 0; j < newTimetable.schedule[i].periods.length; j++) {
            const course = newTimetable.schedule[i].periods[j].course;
            let courseViewProperties;

            //Check if we have courseViewProps for the course in the existing coursesViewProperties
            if (!course) {
                courseViewProperties = courseMap.get("empty");
            }else {
                courseViewProperties = courseMap.get(course.id);
            }

            //If we have, set the migratedCoursesViewProps appropriately
            if (courseViewProperties !== undefined) {
                //if the courseviewprops need to be changed (e.g. because the new timetable has new
                //info /calls for new props) then courseViewProperties may have to be copied.
                migratedCoursesViewPropertiesMap.set(courseViewProperties.courseid, courseViewProperties);
                continue;
            }

            //If we dont, meaning this is a new Course (might be the empty course):
            if (course) {
                let randomColor = shuffledColors.pop();

                if (randomColor === undefined) {
                    randomColor = colors[0];
                }

                const courseViewProperties = createCourseViewProperties(course, randomColor);

                courseMap.set(course.id, courseViewProperties);
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