// Assuming initialAvailability doesn't need to change
const initialAvailability = {
    'Bob': ['Mon 10:00 AM', 'Mon 3:00 PM', 'Wed 12:00 PM', 'Thu 12:00 PM'],
    // ... other people
};

let allInitialAvailabilities = {};

// Load initial availabilities from localStorage if available
const savedAllInitialAvailabilities = localStorage.getItem('allInitialAvailabilities');
if (savedAllInitialAvailabilities) {
    allInitialAvailabilities = JSON.parse(savedAllInitialAvailabilities);
}

let people = [
    {
        name: 'Bob',
        availability: [...initialAvailability['Bob']],
        maxDropInHours: 5, // half of maxHours as an example
        maxGroupTutoringHours: 5, // the other half
        scheduledDropInHours: 0,
        scheduledGroupTutoringHours: 0,
        assignedSlots: []
    },
    // ... other people
];

// Object to track assignments per table
let tableAssignments = {
    table1: [],
    table2: [],
    table3: [],
    table4: [],
    table5: [],
    table6: []
};


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    loadOrResetState();

    const scheduleContainer = document.getElementById('schedule-container');
    // Ensure that 'schedule-container' exists in your HTML.
    
    for (let i = 1; i <= 6; i++) {
        scheduleContainer.appendChild(createTable(i));
    }

    // Attach event listeners to buttons
    const saveButton = document.getElementById('save-button');
    const resetButton = document.getElementById('reset-button');
    const loadButton = document.getElementById('load-button');

    saveButton?.addEventListener('click', function() {
        saveState();
    });

    resetButton?.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the entire schedule?')) {
            resetSchedule();
        }
    });

    loadButton.addEventListener('click', function() {
        loadState();
    });

    const addStudentButton = document.getElementById('add-student-button');
    addStudentButton.addEventListener('click', addStudent);
    const pasteAddStudentButton = document.getElementById('paste-add-student-button');
    pasteAddStudentButton.addEventListener('click', addStudentFromPaste);

    updateLogPanel();
});

function addStudent() {
    console.log("Added a new student, unsaved:", people);

    const studentName = document.getElementById('student-name').value.trim();
    const dropInHoursInput = document.getElementById('drop-in-hours').value;
    const groupTutoringHoursInput = document.getElementById('group-tutoring-hours').value;

    const dropInHours = parseInt(dropInHoursInput, 10) || 0;
    const groupTutoringHours = parseInt(groupTutoringHoursInput, 10) || 0;

    if (!studentName) {
        alert('Please enter a student name.');
        return;
    }

    // Gather availability from select elements
    const availability = [
        ...document.getElementById('student-availability-monday').selectedOptions,
        ...document.getElementById('student-availability-tuesday').selectedOptions,
        ...document.getElementById('student-availability-wednesday').selectedOptions,
        ...document.getElementById('student-availability-thursday').selectedOptions,
        ...document.getElementById('student-availability-friday').selectedOptions,
    ].map(option => option.value).filter(value => value);

    if (availability.length === 0) {
        alert('Please select at least one availability time.');
        return;
    }

    // Add the new student to the people array
    people.push({
        name: studentName,
        availability: availability,
        maxDropInHours: dropInHours,
        maxGroupTutoringHours: groupTutoringHours,
        scheduledDropInHours: 0,
        scheduledGroupTutoringHours: 0,
        assignedSlots: []
    });

    // Update allInitialAvailabilities with the new student's initial availability
    allInitialAvailabilities[studentName] = [...availability];

    localStorage.setItem('allInitialAvailabilities', JSON.stringify(allInitialAvailabilities));

    // Clear the form for the next input
    document.getElementById('student-name').value = '';
    document.getElementById('drop-in-hours').value = '';
    document.getElementById('group-tutoring-hours').value = '';
    document.querySelectorAll('.student-availability select').forEach(select => {
        select.selectedIndex = 0;
    });

    alert('Student added!');
    updateLogPanel(); // Function to update the display of the schedule
}


function addStudentFromPaste() {
    const studentNameInput = document.getElementById('paste-student-name');
    const dropInHoursInput = document.getElementById('paste-drop-in-hours');
    const groupTutoringHoursInput = document.getElementById('paste-group-tutoring-hours');
    const pasteArea = document.getElementById('paste-area');

    const studentName = studentNameInput.value.trim();
    const dropInHours = parseInt(dropInHoursInput.value, 10) || 0;
    const groupTutoringHours = parseInt(groupTutoringHoursInput.value, 10) || 0;
    const pastedContent = pasteArea.value.trim();

    // Validate inputs
    if (!studentName) {
        alert('Please enter a student name.');
        return;
    }
    if (!pastedContent) {
        alert('Please paste the content into the box.');
        return;
    }

    const availability = parsePastedContent(pastedContent);

    // Add student if they do not already exist
    if (people.some(person => person.name === studentName)) {
        alert(`A student with the name ${studentName} already exists.`);
        return;
    }

    people.push({
        name: studentName,
        availability: availability,
        maxDropInHours: dropInHours,
        maxGroupTutoringHours: groupTutoringHours,
        scheduledDropInHours: 0,
        scheduledGroupTutoringHours: 0,
        assignedSlots: []
    });

    // Update storage and UI
    allInitialAvailabilities[studentName] = availability;
    localStorage.setItem('allInitialAvailabilities', JSON.stringify(allInitialAvailabilities));

    // Clear inputs
    studentNameInput.value = '';
    dropInHoursInput.value = '';
    groupTutoringHoursInput.value = '';
    pasteArea.value = '';

    alert('Student added from paste!');
    updateLogPanel();
}

function calculateAvailability(unavailableTimes) {
    const allTimes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].flatMap(day => 
        ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'].map(time => `${day} ${time}`)
    );

    return allTimes.filter(time => !unavailableTimes.includes(time));
}


function parsePastedContent(pastedContent) {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

    let availableTimes = [];
    let lines = pastedContent.split(/\r?\n/);

    console.log(`Total lines in pasted content: ${lines.length}`);
    console.log(`Pasted content before processing:\n'${pastedContent}'`);

    lines.forEach((line, index) => {
        if (index < timeSlots.length) {
            let timeslot = timeSlots[index];
            console.log(`Raw line ${index}: '${line}'`); // Logs the raw line for debugging
            line = line.trim();
            console.log(`Processing line ${index} for timeslot '${timeslot}': '${line}'`);

            if (line === '' || !line.match(/\S/)) { // Checks if the line is empty or contains only whitespace
                console.log(`  Line is blank or contains only whitespace, adding full availability for '${timeslot}'`);
                daysOfWeek.forEach(day => availableTimes.push(`${day} ${timeslot}`));
            } else {
                let unavailableDays = line.split(/\s*,\s*/).map(day => day.trim().toUpperCase());
                console.log(`Unavailable days for '${timeslot}': ${unavailableDays.join(', ')}`);

                daysOfWeek.forEach(day => {
                    if (!unavailableDays.includes(day.toUpperCase())) {
                        availableTimes.push(`${day} ${timeslot}`);
                    }
                });
            }
        }
    });

    console.log(`Finished processing. Available times:`, availableTimes);
    return availableTimes;
}

// Test the function with the provided data
const pastedContent = `
MON, WED
MON, WED
MON, WED

TUE, THU
MON, TUE, WED, THU
MON, WED
MON, TUE, WED, THU
MON, TUE, WED, THU
MON, WED
`.trim(); // Make sure to trim the pasted content to remove any leading/trailing whitespace

let availableTimes = parsePastedContent(pastedContent);
console.log("Final available times:", availableTimes);



// Be sure to call these functions after you define them
updateLogPanel();


function resetForm() {
    document.getElementById('student-name').value = '';
    document.getElementById('student-availability').selectedIndex = 0;
}
function saveState() {
    localStorage.setItem('people', JSON.stringify(people));
    localStorage.setItem('tableAssignments', JSON.stringify(tableAssignments));
    console.log("State saved:", people, tableAssignments);

    // Notify the user
    alert('State saved!');
    updateLogPanel();
}


function resetPeopleSchedule() {
    people.forEach(person => {
        person.scheduledDropInHours = 0;
        person.scheduledGroupTutoringHours = 0;
        person.assignedSlots = [];
    });
}
function loadOrResetState() {
    const savedAssignments = localStorage.getItem('tableAssignments');
    tableAssignments = savedAssignments ? JSON.parse(savedAssignments) : resetTableAssignments();

    const savedPeople = localStorage.getItem('people');
    if (savedPeople) {
        people = JSON.parse(savedPeople);
        resetPeopleToMatchTableAssignments(); // Make sure this function also resets the availability correctly
    } else {
        people = resetPeopleState();
    }

    updateAllTables();
    updateLogPanel();
}






function loadState() {
    console.log("Calling loadState");
    const savedAssignments = localStorage.getItem('tableAssignments');
    if (savedAssignments) {
        tableAssignments = JSON.parse(savedAssignments);
        updateAllTables(); // Update all tables based on the current state of tableAssignments
    }
    updateLogPanel(); // Update log panel to reflect the current state
}

function resetTableAssignments() {
    // Reset tableAssignments object to its initial state
    return {
        table1: [], table2: [], table3: [],
        table4: [], table5: [], table6: []
    };
}

function resetPeopleBasedOnAssignments() {
    // Clear previous assignments and reset scheduled hours for each person
    people.forEach(person => {
        person.scheduledDropInHours = 0;
        person.scheduledGroupTutoringHours = 0;
        person.assignedSlots = [];

        // Reapply assignments based on current tableAssignments
        for (let tableId in tableAssignments) {
            tableAssignments[tableId].forEach(assignment => {
                if (assignment.names.includes(person.name)) {
                    const hourType = assignment.hourType;
                    if (hourType === 'dropIn') {
                        person.scheduledDropInHours++;
                    } else if (hourType === 'groupTutoring') {
                        person.scheduledGroupTutoringHours++;
                    }
                    person.assignedSlots.push({
                        timeslot: assignment.timeslot,
                        type: hourType,
                        tableId: tableId
                    });
                }
            });
        }
    });
}

function resetPeopleAssignments() {
    // Clear previous assignments and reset scheduled hours
    people.forEach(person => {
        person.scheduledDropInHours = 0;
        person.scheduledGroupTutoringHours = 0;
        person.assignedSlots = [];
    });

    // Reapply assignments based on loaded tableAssignments
    Object.keys(tableAssignments).forEach(tableId => {
        tableAssignments[tableId].forEach(assignment => {
            assignment.names.forEach(name => {
                const person = people.find(p => p.name === name);
                if (person) {
                    const hourType = assignment.hourType;
                    if (hourType === 'dropIn') {
                        person.scheduledDropInHours++;
                    } else if (hourType === 'groupTutoring') {
                        person.scheduledGroupTutoringHours++;
                    }
                    person.assignedSlots.push({
                        timeslot: assignment.timeslot,
                        type: hourType,
                        tableId: tableId
                    });
                }
            });
        });
    });

    // Refresh each person's availability
    refreshPeopleAvailability();
}

function refreshPeopleAvailability() {
    people.forEach(person => {
        person.availability = allInitialAvailabilities[person.name] ? [...allInitialAvailabilities[person.name]] : [];
        person.assignedSlots.forEach(assignment => {
            const index = person.availability.indexOf(assignment.timeslot);
            if (index > -1) {
                person.availability.splice(index, 1);
            }
        });
    });
}

function resetPeopleState() {
    return Object.keys(initialAvailability).map(name => ({
        name: name,
        availability: [...initialAvailability[name]],
        maxDropInHours: 5, // example value, adjust as needed
        maxGroupTutoringHours: 5, // example value, adjust as needed
        scheduledDropInHours: 0,
        scheduledGroupTutoringHours: 0,
        assignedSlots: []
    }));
}

function resetPeopleToMatchTableAssignments() {
    people.forEach(person => {
        person.scheduledDropInHours = 0;
        person.scheduledGroupTutoringHours = 0;
        person.assignedSlots = [];

        // Use allInitialAvailabilities if the person's initial availability is not in initialAvailability
        if (allInitialAvailabilities[person.name]) {
            person.availability = [...allInitialAvailabilities[person.name]];
        } else if (initialAvailability[person.name]) {
            person.availability = [...initialAvailability[person.name]];
        } else {
            console.warn(`No initial availability found for: ${person.name}, initializing to empty array.`);
            person.availability = [];
        }

        Object.values(tableAssignments).flat().forEach(assignment => {
            if (assignment.names.includes(person.name)) {
                const hourType = assignment.hourType;
                if (hourType === 'dropIn') {
                    person.scheduledDropInHours++;
                } else if (hourType === 'groupTutoring') {
                    person.scheduledGroupTutoringHours++;
                }
                person.assignedSlots.push({
                    timeslot: assignment.timeslot,
                    type: hourType,
                    tableId: findTableIdByTimeslot(assignment.timeslot)
                });

                // Remove the assigned timeslot from availability
                const index = person.availability.indexOf(assignment.timeslot);
                if (index > -1) {
                    person.availability.splice(index, 1);
                }
            }
        });
    });
}



function applyLoadedAssignments() {
    // Clear existing assigned slots for each person
    people.forEach(person => person.assignedSlots = []);

    // Iterate over each table's assignments and apply them
    Object.keys(tableAssignments).forEach(tableId => {
        tableAssignments[tableId].forEach(assignment => {
            const person = people.find(p => p.name === assignment.name);
            if (person) {
                // Add the assignment to the person's list of assigned slots
                person.assignedSlots.push({
                    timeslot: assignment.timeslot,
                    type: assignment.type,
                    tableId: tableId // Ensure this is provided when saving the assignment
                });

                // Update the person's scheduled hours based on the type of hour
                if (assignment.type === 'dropIn') {
                    person.scheduledDropInHours++;
                } else {
                    person.scheduledGroupTutoringHours++;
                }

                // Optionally, remove the timeslot from the person's availability
                const availabilityIndex = person.availability.indexOf(assignment.timeslot);
                if (availabilityIndex !== -1) {
                    person.availability.splice(availabilityIndex, 1);
                }
            } else {
                // Handle the case where the person is not found in the people array
                console.warn('Person not found for assignment:', assignment);
            }
        });
    });

    // Update the UI to reflect the loaded assignments
    updateLogPanel();
}

function resetSchedule() {
    // Clear table assignments in memory
    Object.keys(tableAssignments).forEach(tableId => {
        tableAssignments[tableId] = [];
        updateTable(tableId); // Update each table to show cleared slots
    });

    // Reset scheduled hours and slots for each person in memory
    people.forEach(person => {
        person.scheduledDropInHours = 0;
        person.scheduledGroupTutoringHours = 0;
        person.assignedSlots = [];

        // Restore each person's availability to their initial state
        person.availability = allInitialAvailabilities[person.name] ? [...allInitialAvailabilities[person.name]] : [];
    });

    // Update the UI to reflect the reset
    updateLogPanel();
    alert('Schedule has been reset to the original state.');
}




function updateTable(tableId) {
    const table = document.getElementById(tableId);
    const assignments = tableAssignments[tableId];

    Array.from(table.querySelectorAll('td')).forEach(cell => {
        const timeslot = cell.dataset.timeslot;
        if (timeslot) {
            // Find the assignment for this timeslot
            const assignment = assignments.find(a => a.timeslot === timeslot);

            if (assignment && assignment.names.length > 0) {
                // Join the names for display if there are assigned people
                cell.textContent = assignment.names.join(", ");
                cell.classList.add('filled-timeslot');
                cell.dataset.assigned = assignment.names.join(", ");
            // Update the dataset for multiple assigned names
                cell.dataset.assignedNames = JSON.stringify(assignment.names);
            } else {
                // If no one is assigned, mark the cell as available
                cell.textContent = 'Available';
                cell.classList.remove('filled-timeslot');
                delete cell.dataset.assigned;
                delete cell.dataset.assignedNames;
            }
        }
    });
}



// Update All Tables Function
function updateAllTables() {
    Object.keys(tableAssignments).forEach(tableId => {
        updateTable(tableId); // Assuming updateTable function updates each table
    });
}

function resetLocalStorage() {
    localStorage.removeItem('scheduleState');
    // Optionally clear the titles if needed
    // for (let i = 1; i <= 6; i++) {
    //     localStorage.removeItem(`tableTitle-${i}`);
    // }
}

window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-content')) {
        closeDropdowns();
    }
});

function createTable(buildingNumber) {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const table = document.createElement('table');
    table.className = 'schedule-table';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    table.id = 'table' + buildingNumber; // This will create IDs like 'table1', 'table2', etc.


    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time/Day';
    headerRow.appendChild(timeHeader);

    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = day;
        headerRow.appendChild(dayHeader);
    });

    const tbody = table.createTBody();
    for (let hour = 10; hour <= 20; hour++) {
        const row = tbody.insertRow();
        const timeCell = document.createElement('td');
        let formattedHour = hour;
        let amPm = 'AM';
        
        if (hour > 12) {
            formattedHour = hour - 12;
            amPm = 'PM';
        } else if (hour === 12) { // When it's 12 PM, no need to subtract 12
            amPm = 'PM';
        }
        
        timeCell.textContent = `${formattedHour}:00 ${amPm}`;
        row.appendChild(timeCell);

        for (let i = 0; i < daysOfWeek.length; i++) {
            const cell = row.insertCell();
            const timeslot = `${daysOfWeek[i]} ${formattedHour}:00 ${amPm}`;
            cell.textContent = 'Available';
            cell.dataset.timeslot = timeslot;
            cell.onclick = function(event) {
                showDropdown(event, timeslot);
            };
        }
    }

    const titleDiv = document.createElement('div');
    titleDiv.className = 'table-title';
    titleDiv.contentEditable = true;
    titleDiv.textContent = `Building ${buildingNumber} (Click to Change Title)`; // Default text


    const buildingDiv = document.createElement('div');
    buildingDiv.className = 'building';
    buildingDiv.appendChild(titleDiv); // Append the title first
    buildingDiv.appendChild(table);

    return buildingDiv;
}

function showDropdown(event, timeslot) {
    closeDropdowns();
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.style.left = `${event.pageX}px`;
    dropdown.style.top = `${event.pageY}px`;

    // Check if someone is already assigned to this slot and create "Remove" options
    if (event.target.dataset.assignedNames) {
        const assignedNames = JSON.parse(event.target.dataset.assignedNames);
        assignedNames.forEach(assignedName => {
            const removeOption = document.createElement('div');
            removeOption.className = 'dropdown-content';
            removeOption.textContent = `Remove ${assignedName} (X)`;
            removeOption.onclick = function() {
                // Retrieve the hour type for each specific assignment
                const assignment = tableAssignments[findTableId(event.target)].find(a => a.timeslot === timeslot && a.names.includes(assignedName));
                if (assignment && assignment.hourType) {
                    removeAssignment(event.target, assignedName, timeslot, assignment.hourType);
                } else {
                    console.error('Hour type is undefined. Cannot remove assignment.');
                }
                closeDropdowns();
            };
            dropdown.appendChild(removeOption);
        });
    }

    // Populate the rest of the dropdown with available people
    people.forEach(person => {
        if (person.availability.includes(timeslot)) {
            ['dropIn', 'groupTutoring'].forEach(hourType => {
                const option = document.createElement('div');
                option.className = 'dropdown-content';
                option.textContent = `${person.name} - ${hourType === 'dropIn' ? 'Drop In Hours' : 'Group Tutoring Hours'}`;
                option.onclick = function() {
                    assignPerson(event.target, person.name, timeslot, hourType);
                    closeDropdowns();
                };
                dropdown.appendChild(option);
            });
        }
    });

    if (dropdown.childElementCount === 0) {
        const noOneAvailable = document.createElement('div');
        noOneAvailable.className = 'dropdown-content';
        noOneAvailable.textContent = 'No one available';
        dropdown.appendChild(noOneAvailable);
    }

    document.body.appendChild(dropdown);
    dropdown.style.display = 'block';
    event.stopPropagation();
}


function removeAssignment(target, name, timeslot) {
    console.log("Attempting to remove assignment:", { name, timeslot });
    const tableId = findTableId(target);
    if (!tableId) {
        console.error('Table ID is undefined, cannot remove assignment:', { name, timeslot });
        return;
    }

    const person = people.find(p => p.name === name);
    if (!person) {
        console.error('Person not found:', name);
        return;
    }

    const assignmentIndex = person.assignedSlots.findIndex(as => as.timeslot === timeslot && as.tableId === tableId);
    if (assignmentIndex !== -1) {
        const assignment = person.assignedSlots[assignmentIndex];
        person.assignedSlots.splice(assignmentIndex, 1);

        if (assignment.type === 'dropIn') {
            person.scheduledDropInHours = Math.max(person.scheduledDropInHours - 1, 0);
        } else if (assignment.type === 'groupTutoring') {
            person.scheduledGroupTutoringHours = Math.max(person.scheduledGroupTutoringHours - 1, 0);
        }

        removeFromTableAssignments(name, timeslot, assignment.type, tableId);
        
        if (!person.availability.includes(timeslot)) {
            person.availability.push(timeslot);
            person.availability.sort(sortTimes); // Sort timeslots chronologically
        }
    } else {
        console.error('Assignment not found:', { name, timeslot });
    }

    localStorage.setItem('people', JSON.stringify(people)); // Save changes
    updateTable(tableId);
    updateLogPanel(); // Refresh the UI to reflect changes
}




function closeDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => dropdown.remove());
}

function assignPerson(target, name, timeslot, hourType) {
    const person = people.find(p => p.name === name);
    if (!person) {
        alert('Person not found.');
        return;
    }

    const tableId = findTableId(target);
    if (!tableId) {
        console.error('Table ID is undefined, cannot assign person:', { name, timeslot, hourType });
        return;
    }

    let assignment = tableAssignments[tableId].find(a => a.timeslot === timeslot);
    if (!assignment) {
        assignment = { timeslot, names: [], hourType };
        tableAssignments[tableId].push(assignment);
    }

    if (assignment.names.includes(name)) {
        alert(`${name} is already assigned to this timeslot.`);
        return;
    }

    if (assignment.names.length >= 2) {
        alert('This timeslot is already fully booked.');
        return;
    }

    assignment.names.push(name);
    if (hourType === 'dropIn') {
        person.scheduledDropInHours++;
    } else {
        person.scheduledGroupTutoringHours++;
    }
    person.assignedSlots.push({ name, timeslot, type: hourType, tableId });

    // Remove the timeslot from the person's availability
    const timeslotIndex = person.availability.indexOf(timeslot);
    if (timeslotIndex !== -1) {
        person.availability.splice(timeslotIndex, 1);
    }

    localStorage.setItem('people', JSON.stringify(people)); // Save changes
    updateTable(tableId);
    updateLogPanel();
}


function findTableId(element) {
    while (element && !element.matches('.schedule-table')) {
        element = element.parentElement;
    }
    return element ? element.id : undefined;
}

function findTableIdByTimeslot(timeslot) {
    // Loop through each tableId in tableAssignments
    for (let tableId in tableAssignments) {
        if (tableAssignments.hasOwnProperty(tableId)) {
            // Check if this table has the timeslot in its assignments
            const found = tableAssignments[tableId].some(assignment => assignment.timeslot === timeslot);
            if (found) {
                // Return the tableId where the timeslot is found
                return tableId;
            }
        }
    }
    return null; // Return null if no matching tableId is found
}


function addToTableAssignments(name, timeslot, hourType, tableId) {
    if (!tableId || !tableAssignments[tableId]) {
        console.error('Cannot add to tableAssignments. Invalid tableId:', tableId);
        return;
    }

    const existingAssignmentIndex = tableAssignments[tableId].findIndex(assignment =>
        assignment.name === name && assignment.timeslot === timeslot && assignment.type === hourType
    );

    if (existingAssignmentIndex === -1) {
        tableAssignments[tableId].push({ name, timeslot, type: hourType });
    } else {
        console.error('Assignment already exists:', { name, timeslot, hourType, tableId });
    }
}

function removeFromTableAssignments(name, timeslot, hourType, tableId) {
    if (tableAssignments[tableId]) {
        const assignment = tableAssignments[tableId].find(a => a.timeslot === timeslot);
        if (assignment) {
            assignment.names = assignment.names.filter(n => n !== name);
            if (assignment.names.length === 0) {
                // If no names left, remove the assignment from the table
                tableAssignments[tableId] = tableAssignments[tableId].filter(a => a !== assignment);
            }
        }
    } else {
        console.error('Failed to find table assignments for tableId:', tableId);
    }
}


function updateLogPanel() {
    console.log("Updating Log Panel");

    const logPanel = document.getElementById('schedule-info');
    logPanel.innerHTML = ''; // Clear existing content

    people.forEach(person => {
        console.log("Person in log panel:", person);
        const personDiv = document.createElement('div');
        personDiv.className = 'person-div';

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'person-summary';
        summaryDiv.textContent = `${person.name}: ${person.scheduledDropInHours}/${person.maxDropInHours} Drop in Hours, ${person.scheduledGroupTutoringHours}/${person.maxGroupTutoringHours} Group Tutoring Hours.`;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-button';
        removeButton.onclick = function() {
            removePerson(person.name);
        };
        summaryDiv.appendChild(removeButton);
        personDiv.appendChild(summaryDiv);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'person-details hidden';

        const availabilityByDay = groupAvailabilityByDay(person.availability);
        for (const [day, times] of Object.entries(availabilityByDay)) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-div';
            const dayLabel = document.createElement('strong');
            dayLabel.textContent = day + ': ';
            dayDiv.appendChild(dayLabel);

            const timesSpan = document.createElement('span');
            timesSpan.textContent = times.join(', ');
            dayDiv.appendChild(timesSpan);

            detailsDiv.appendChild(dayDiv);
        }

        personDiv.appendChild(detailsDiv);
        logPanel.appendChild(personDiv);
    });
}



// Call this function to update the log panel
updateLogPanel();


function removePerson(identifier) {
    let personIndex;

    // Determine if 'identifier' is a number (index) or a string (name)
    if (typeof identifier === 'number') {
        personIndex = identifier;
    } else if (typeof identifier === 'string') {
        personIndex = people.findIndex(p => p.name === identifier);
    }

    // Check if the person was found
    if (personIndex === -1 || personIndex === undefined) {
        alert('Person not found.');
        return; // Exit if the person is not found
    }

    if (confirm('Are you sure you want to remove this person?')) {
        // Remove assignments from the tables
        people[personIndex].assignedSlots.forEach(assignment => {
            // Find the table cell and update UI
            const tableId = `table${assignment.timeslot.split(' ')[0]}`; // Assuming table ID is derived from the day
            const cell = document.querySelector(`#${tableId} [data-timeslot='${assignment.timeslot}']`);
            if (cell) {
                cell.classList.remove('filled-timeslot');
                cell.textContent = 'Available';
                delete cell.dataset.assigned;
                delete cell.dataset.hourType;
            }

            // Update tableAssignments
            removeFromTableAssignments(people[personIndex].name, assignment.timeslot, assignment.type, tableId);
        });

        // Remove the person from the people array
        people.splice(personIndex, 1);

        // Update the display
        updateLogPanel();
    }
}

// Call updateLogPanel initially to set up the log panel
updateLogPanel();

function groupAvailabilityByDay(availabilityList) {
    const availabilityByDay = { 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [] };

    availabilityList.forEach(timeSlot => {
        const [day, ...timeParts] = timeSlot.split(' ');
        if (day && timeParts.length > 0 && availabilityByDay.hasOwnProperty(day)) {
            const time = timeParts.join(' '); // Reconstruct the time with AM/PM
            availabilityByDay[day].push(time);
        }
    });

    return availabilityByDay;
}


function convertTo12hTime(time24h) {
    let [hours, minutes] = time24h.split(':');
    hours = parseInt(hours, 10);
    let suffix = 'AM';

    if (hours >= 12) {
        suffix = 'PM';
        if (hours > 12) {
            hours -= 12;
        }
    } else if (hours === 0) {
        hours = 12;
    }
    // Ensure two digits for minutes
    minutes = minutes.padStart(2, '0');

    return `${hours}:${minutes} ${suffix}`;
}

function sortTimes(a, b) {
    // Extract hours and minutes from the time strings
    const timeRegex = /(\d+):(\d+) (AM|PM)/;
    const [ , hoursA, minutesA, periodA ] = timeRegex.exec(a) || [];
    const [ , hoursB, minutesB, periodB ] = timeRegex.exec(b) || [];

    // Convert to 24-hour format for comparison
    const totalMinutesA = (parseInt(hoursA) % 12 + (periodA === 'PM' ? 12 : 0)) * 60 + parseInt(minutesA);
    const totalMinutesB = (parseInt(hoursB) % 12 + (periodB === 'PM' ? 12 : 0)) * 60 + parseInt(minutesB);

    return totalMinutesA - totalMinutesB;
}



document.body.addEventListener('click', function(event) {
    // Check if the clicked element has the class 'person-summary'
    if (event.target.classList.contains('person-summary')) {
        const detailsDiv = event.target.nextElementSibling;
        
        if (detailsDiv && detailsDiv.classList.contains('person-details')) {
            const isHidden = detailsDiv.classList.toggle('hidden');
            detailsDiv.style.maxHeight = isHidden ? '0' : `${detailsDiv.scrollHeight}px`;
        }
    }
});

updateLogPanel();
