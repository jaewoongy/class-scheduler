// Assuming initialAvailability doesn't need to change
const initialAvailability = {
    'Alicent': ['Mon 10:00 AM', 'Mon 11:00 AM', 'Mon 12:00 PM', 'Mon 1:00 PM', 'Mon 2:00 PM', 'Mon 3:00 PM', 'Mon 4:00 PM', 'Mon 5:00 PM', 'Mon 6:00 PM', 'Mon 7:00 PM', 'Mon 8:00 PM'],
    'Bob': ['Mon 10:00 AM', 'Wed 12:00 PM', 'Thu 12:00 PM'],
    // ... other people
};

let people = [
    {
        name: 'Alicent',
        availability: [...initialAvailability['Alicent']],
        maxDropInHours: 5,
        maxGroupTutoringHours: 5,
        scheduledDropInHours: 0,
        scheduledGroupTutoringHours: 0,
        assignedSlots: []
    },
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
    const scheduleContainer = document.getElementById('schedule-container');
    // Ensure that 'schedule-container' exists in your HTML.
    
    for (let i = 1; i <= 6; i++) {
        scheduleContainer.appendChild(createTable(i));
    }
    loadState(); // This function should load the state. Ensure it's not failing.

    // Ensure these buttons exist in your HTML with these exact IDs.
    const saveButton = document.getElementById('save-button');
    const resetButton = document.getElementById('reset-button');
    const loadButton = document.getElementById('load-button');
    const savedPeople = localStorage.getItem('people');
    if (savedPeople) {
        people = JSON.parse(savedPeople);
    }
    
    // Now, add the event listener for handling clicks on .person-summary
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('person-summary')) {
            const detailsDiv = event.target.nextElementSibling;
            const isHidden = detailsDiv.classList.toggle('hidden');
            detailsDiv.style.maxHeight = isHidden ? '0' : `${detailsDiv.scrollHeight}px`;
        }
    });

    // Add null checks for buttons to avoid errors if they don't exist.
    saveButton?.addEventListener('click', function() {
        saveState();
    });

    resetButton?.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the entire schedule?')) {
            resetSchedule();
        }
    });

    // Uncommented this section; ensure 'load-button' exists if you're using this.
    loadButton.addEventListener('click', function() {
        if (confirm('Do you want to load previously saved data?')) {
            loadState();
        }
    });

    const addStudentButton = document.getElementById('add-student-button');
    addStudentButton.addEventListener('click', addStudent);


    updateLogPanel();
});

function addStudent() {
    const studentName = document.getElementById('student-name').value.trim();
    const dropInHoursInput = document.getElementById('drop-in-hours').value;
    const groupTutoringHoursInput = document.getElementById('group-tutoring-hours').value;

    const dropInHours = parseInt(dropInHoursInput, 10) || 0;
    const groupTutoringHours = parseInt(groupTutoringHoursInput, 10) || 0;

    if (!studentName) {
        alert('Please enter a student name.');
        return;
    }

    // Ensure the availability select elements are named correctly and exist
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

    // Save updated people array to localStorage
    localStorage.setItem('people', JSON.stringify(people));

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


// Be sure to call these functions after you define them
updateLogPanel();




function resetForm() {
    document.getElementById('student-name').value = '';
    document.getElementById('student-availability').selectedIndex = 0;
}

function saveState() {
    localStorage.setItem('tableAssignments', JSON.stringify(tableAssignments));
    localStorage.setItem('people', JSON.stringify(people));
    alert('Schedule saved!');
    updateLogPanel();
}



function loadState() {
    const savedAssignments = localStorage.getItem('tableAssignments');
    const savedPeople = localStorage.getItem('people');
    
    if (savedAssignments) {
        tableAssignments = JSON.parse(savedAssignments);
        Object.keys(tableAssignments).forEach(tableId => updateTable(tableId));
    } else {
        alert('No saved table assignments to load.');
    }

    if (savedPeople) {
        people = JSON.parse(savedPeople);
        resetPeopleState();
        applyLoadedAssignments();
    } else {
        alert('No saved people data to load.');
    }
    
    updateLogPanel(); // Update UI after loading
}



function resetPeopleState() {
    people.forEach(person => {
        person.scheduledHours = 0;
        person.scheduledDropInHours = 0;
        person.scheduledGroupTutoringHours = 0;
        person.assignedSlots = [];

        if (initialAvailability[person.name]) {
            person.availability = [...initialAvailability[person.name]];
        } else {
            // Handle no initial data as appropriate
            person.availability = [];
        }
    });
}

function applyLoadedAssignments() {
    Object.values(tableAssignments).forEach(assignments => {
        assignments.forEach(assignment => {
            const person = people.find(p => p.name === assignment.name);
            if (person) {
                const hourType = assignment.type;
                if (hourType === 'dropIn') {
                    person.scheduledDropInHours++;
                } else {
                    person.scheduledGroupTutoringHours++;
                }
                person.assignedSlots.push(assignment);
                const availabilityIndex = person.availability.indexOf(assignment.timeslot);
                if (availabilityIndex !== -1) {
                    person.availability.splice(availabilityIndex, 1);
                }
            }
        });
    });
}





function resetSchedule() {
    resetPeopleState(); // Resets people to their initial state
    Object.keys(tableAssignments).forEach(tableId => {
        tableAssignments[tableId] = [];
        updateTable(tableId);
    });
    updateLogPanel();
}


function updateTable(tableId) {
    const table = document.getElementById(tableId);
    const assignments = tableAssignments[tableId];

    Array.from(table.querySelectorAll('td')).forEach(cell => {
        const timeslot = cell.dataset.timeslot;
        if (timeslot) {
            const assignedPersonName = assignments.find(assignment => assignment.timeslot === timeslot)?.name;
            if (assignedPersonName) {
                cell.textContent = assignedPersonName;
                cell.classList.add('filled-timeslot');
                cell.dataset.assigned = assignedPersonName;
            } else {
                cell.textContent = 'Available';
                cell.classList.remove('filled-timeslot');
                delete cell.dataset.assigned;
            }
        }
    });
}


// Update All Tables Function
function updateAllTables() {
    Object.keys(tableAssignments).forEach(tableId => updateTable(tableId));
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
        const formattedHour = hour > 12 ? hour - 12 : hour;
        const amPm = hour >= 12 ? 'PM' : 'AM';
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

    // Check if someone is already assigned to this slot and create a "Remove" option
    if (event.target.dataset.assigned) {
        const assignedName = event.target.dataset.assigned;  // The name of the assigned person
        const hourType = event.target.dataset.hourType;      // The hour type (dropIn/groupTutoring)

        const removeOption = document.createElement('div');
        removeOption.className = 'dropdown-content';
        removeOption.textContent = `Remove ${assignedName} (X)`;
        removeOption.onclick = function() {
            // Ensure the hourType is defined before calling removeAssignment
            if (hourType) {
                removeAssignment(event.target, assignedName, timeslot, hourType);
            } else {
                console.error('Hour type is undefined. Cannot remove assignment.');
            }
            closeDropdowns();
        };
        dropdown.appendChild(removeOption);
    }

    // Populate the rest of the dropdown with available people
    people.forEach(person => {
        if (person.availability.includes(timeslot)) {
            // Option for assigning Drop In Hours
            const dropInOption = document.createElement('div');
            dropInOption.className = 'dropdown-content';
            dropInOption.textContent = `${person.name} - Drop In Hours`;
            dropInOption.onclick = function() {
                assignPerson(event.target, person.name, timeslot, 'dropIn');
                closeDropdowns();
            };
            dropdown.appendChild(dropInOption);

            // Option for assigning Group Tutoring Hours
            const groupTutoringOption = document.createElement('div');
            groupTutoringOption.className = 'dropdown-content';
            groupTutoringOption.textContent = `${person.name} - Group Tutoring Hours`;
            groupTutoringOption.onclick = function() {
                assignPerson(event.target, person.name, timeslot, 'groupTutoring');
                closeDropdowns();
            };
            dropdown.appendChild(groupTutoringOption);
        }
    });

    // Add a 'No one available' option if the dropdown is empty
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



function removeAssignment(target, name, timeslot, hourType, tableId) {
    const person = people.find(p => p.name === name);
    if (!person) {
        console.error('Person not found.');
        return;
    }

    // Find the assignment index and type
    const assignmentIndex = person.assignedSlots.findIndex(assignment => assignment.timeslot === timeslot && assignment.type === hourType);

    if (assignmentIndex !== -1) {
        // Remove the assignment
        person.assignedSlots.splice(assignmentIndex, 1);

        // Adjust the person's scheduled hours based on hour type
        if (hourType === 'dropIn') {
            person.scheduledDropInHours--;
        } else if (hourType === 'groupTutoring') {
            person.scheduledGroupTutoringHours--;
        }
    } else {
        console.error('Assignment not found.');
        return;
    }

    // Update the UI for the timeslot
    target.classList.remove('filled-timeslot');
    target.textContent = 'Available';
    delete target.dataset.assigned;
    delete target.dataset.hourType;

    // Update table assignments
    removeFromTableAssignments(name, timeslot, hourType, tableId);

    // Refresh the display
    updateLogPanel();
}





function closeDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => dropdown.remove());
}

function assignPerson(target, name, timeslot, hourType) {
    const person = people.find(p => p.name === name);
    if (!person) {
        alert('Person not found.');
        return; // Person must exist in the people array
    }

    const tableId = findTableId(target);

    // If the slot is already assigned, we need to remove the previous person or hour type from the slot
    if (target.dataset.assigned) {
        // Remove previous assignment
        const previousAssignedName = target.dataset.assigned;
        const previousHourType = target.dataset.hourType;
        removeAssignment(target, previousAssignedName, timeslot, previousHourType, tableId);
    }

    // Check if the person has remaining hours for the chosen hour type
    let remainingHours = hourType === 'dropIn' ? person.dropInHours - person.scheduledDropInHours 
                                                : person.groupTutoringHours - person.scheduledGroupTutoringHours;

    // If there are no remaining hours for the chosen hour type, alert and return
    if (remainingHours <= 0) {
        alert(`${name} has no remaining ${hourType === 'dropIn' ? 'drop-in' : 'group tutoring'} hours.`);
        return;
    }

    // Assign the person to the slot
    target.classList.add('filled-timeslot');
    target.textContent = name;
    target.dataset.assigned = name;
    target.dataset.hourType = hourType; // Set hour type as a data attribute


    // Update the person's scheduled hours
    if (hourType === 'dropIn') {
        person.scheduledDropInHours++;
    } else {
        person.scheduledGroupTutoringHours++;
    }

    // Add to the person's assignedSlots array
    person.assignedSlots.push({ timeslot, type: hourType });

    // Update the tableAssignments
    addToTableAssignments(name, timeslot, hourType, tableId);

    // Reflect the changes in the UI
    updateLogPanel();
}

function addToTableAssignments(name, timeslot, hourType, tableId) {
    // Logic to add the assignment to the specific table
    // This should handle the internal logic of how assignments are stored
    // For instance, it could look something like this:
    tableAssignments[tableId].push({ name, timeslot, type: hourType });
}


function findTableId(target) {
    // Traverse up the DOM tree to find the parent table and return its ID
    let currentElement = target;
    while (currentElement && !currentElement.classList.contains('schedule-table')) {
        currentElement = currentElement.parentElement;
    }
    return currentElement ? currentElement.id : null;
}

function addToTableAssignments(name, timeslot, hourType, tableId) {
    if (tableId && tableAssignments[tableId]) {
        tableAssignments[tableId].push({ name, timeslot, type: hourType });
    }
}

function removeFromTableAssignments(name, timeslot, hourType, tableId) {
    if (tableAssignments[tableId]) {
        tableAssignments[tableId] = tableAssignments[tableId].filter(assignment => {
            return assignment.name !== name || assignment.timeslot !== timeslot || assignment.type !== hourType;
        });
    }
}


function updateLogPanel() {
    const logPanel = document.getElementById('schedule-info');
    logPanel.innerHTML = ''; // Clear existing content

    people.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.className = 'person-div';

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'person-summary';
        summaryDiv.textContent = `${person.name}: ${person.scheduledDropInHours}/${person.maxDropInHours} Drop in Hours, ${person.scheduledGroupTutoringHours}/${person.maxGroupTutoringHours} Group Tutoring Hours.`;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-button';
        removeButton.onclick = function() {
            removePerson(index);
        };
        summaryDiv.appendChild(removeButton);
        personDiv.appendChild(summaryDiv);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'person-details hidden';

        // Grouping the availability by day of the week
        const availabilityByDay = groupAvailabilityByDay(person.availability);
        for (const [day, times] of Object.entries(availabilityByDay)) {
            const dayDiv = document.createElement('div');
            const dayLabel = document.createElement('strong');
            dayLabel.textContent = day + ': ';
            dayDiv.appendChild(dayLabel);

            const timesText = times.map(time => {
                // Append AM or PM to the time
                return convertTo12hTime(time);
            }).join(', ');

            const timesSpan = document.createElement('span');
            timesSpan.textContent = timesText;
            dayDiv.appendChild(timesSpan);
            detailsDiv.appendChild(dayDiv);
        }

        personDiv.appendChild(detailsDiv);
        logPanel.appendChild(personDiv);
    });
}



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
        const [day, time] = timeSlot.split(' ');
        if (day && time && availabilityByDay.hasOwnProperty(day)) {
            availabilityByDay[day].push(time);
        }
    });

    return availabilityByDay;
}


function convertTo12hTime(time24h) {
    const [hours24, minutes] = time24h.split(':');
    const hours = parseInt(hours24, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours + 11) % 12 + 1); // Convert 24h to 12h format
    return `${hours12}:${minutes} ${suffix}`;
}

document.body.addEventListener('click', function(event) {
    // Check if the clicked element has the class 'person-summary'
    if (event.target.classList.contains('person-summary')) {
        const detailsDiv = event.target.nextElementSibling;
        const isHidden = detailsDiv.classList.toggle('hidden');
        detailsDiv.style.maxHeight = isHidden ? '0' : `${detailsDiv.scrollHeight}px`;
    }
});


updateLogPanel();
