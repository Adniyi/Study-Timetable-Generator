let courses = [];
const studyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Load courses from localStorage when the page loads
window.onload = function() {
    const storedCourses = JSON.parse(localStorage.getItem('courses'));
    console.log(storedCourses)
    if (storedCourses) {
        courses = storedCourses;
        updateCourseList();  // Update the course list with stored data
    }
};

function calculateWeightOfCourses(courses) {
    const totalUnits = courses.reduce((sum, course) => sum + parseInt(course.units), 0);
    const weeklyHours = parseInt(document.getElementById('weeklyHours').value);
    
    return courses.map(course => ({
        ...course,
        studyHours: (course.units / totalUnits) * weeklyHours
    }));
}

function allocateStudyTime(weightedCourses) {
    const dailyLimit = parseFloat(document.getElementById('dailyLimit').value);
    const timetable = {};
    
    studyDays.forEach(day => {
        timetable[day] = [];
    });

    weightedCourses.forEach(course => {
        let remainingHours = course.studyHours;
        
        for (const day of studyDays) {
            if (remainingHours <= 0) break;

            const availableHours = dailyLimit - timetable[day].reduce((sum, slot) => sum + slot.hours, 0);
            
            if (availableHours > 0) {
                const allocatedHours = Math.min(availableHours, remainingHours);
                timetable[day].push({
                    course: course.name,
                    hours: allocatedHours
                });
                remainingHours -= allocatedHours;
            }
        }
    });

    return timetable;
}

function formatStudyTime(hours) {
    const hoursInt = Math.floor(hours);
    const minutes = Math.round((hours - hoursInt) * 60);
    
    if (hoursInt === 0) {
        return `${minutes} minutes`;
    } else if (minutes === 0) {
        return `${hoursInt} hour${hoursInt !== 1 ? 's' : ''}`;
    } else {
        return `${hoursInt} hour${hoursInt !== 1 ? 's' : ''}, ${minutes} minutes`;
    }
}

function addCourse(){
    const name = document.getElementById('courseName').value;
    const units = document.getElementById('units').value;

    if (name && units) {
        const newCourse = {
            id: Date.now(),
            name,
            units: parseInt(units)
        };
        courses.push(newCourse);
        updateCourseList();
        saveCoursesToLocalStorage();
        clearForm();
    }
}

function clearForm() {
    document.getElementById('courseName').value = '';
    document.getElementById('units').value = '';
}

function removeCourse(id) {
    courses = courses.filter(course => course.id !== id);
    updateCourseList();
    saveCoursesToLocalStorage();
}

function updateCourseList() {
    const courseList = document.getElementById('courseList');
    const generateBtn = document.getElementById('generateBtn');

    courseList.innerHTML = courses.map(course => `
        <div class="course-item">
            <div class="course-info">
                <span>${course.name}</span>
                <span>${course.units} units</span>
            </div>
            <button class="remove-btn" onclick="removeCourse(${course.id})">
                <span class="x-icon"></span>
            </button>
        </div>
    `).join('');

    generateBtn.style.display = courses.length > 0 ? 'block' : 'none';
}

// Save courses to localStorage
function saveCoursesToLocalStorage() {
    localStorage.setItem('courses', JSON.stringify(courses));
}

function generateTimetable() {
    const timetableBody = document.getElementById('timetableBody');
    const timetableCard = document.getElementById('timetableCard');
    
    const weightedCourses = calculateWeightOfCourses(courses);
    const timetable = allocateStudyTime(weightedCourses);
    
    timetableCard.style.display = 'block';
    
    timetableBody.innerHTML = studyDays.map(day => {
        const daySchedule = timetable[day];
        const scheduleText = daySchedule.map(slot => 
            `${slot.course}: ${formatStudyTime(slot.hours)}`
        ).join(' | ');

        // Store the timetable data in localStorage
        localStorage.setItem('timetable', JSON.stringify({
            day,
            scheduleText
        }));
        return `
            <tr>
                <td>${day}</td>
                <td class="study-hours">${scheduleText || 'No studies scheduled'}</td>
            </tr>
        `;
        
    }).join('');
}
