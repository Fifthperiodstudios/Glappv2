/*
        ["MLK", "#8e44ad"],
        ["CS", "#D35400"],
        ["ELK", "#1ABC9C"],
        ["PH", "#2980B9"],
        ["SP", "#95A5A6"],
        ["CH", "#F1C40F"],
        ["BI", "#E91E68"],
        ["SW", "#E74C3C"],
        ["GE", "#795548"],
*/

interface CourseViewProperties {
    courseid: string,

    label: string,
    style: {
        backgroundColor: string
    },

    visible?: boolean,
}

interface SlotViewProperties {
    slotid: [number, number]
}

interface Settings {
    showEmptyCourse: boolean,
    showNotifications: boolean,
}

const colors = [
    "#F1C40F", //bienen gelb
    "#E67E22", //carrot gelb
    "#e74c3c", // gutes rot

    "#26de81", //schrilles hell grün
    "#1ABC9C", //mint grün
    
    "#2c78f8", //mittleres blau,
    "#34495e", //dunkles blau

    "#8e44ad", //lila
    "#E91E68", //pink

    "#795548", //braun
     
    "#95A5A6", //grau
];

export { CourseViewProperties, SlotViewProperties, Settings, colors};