// Assuming initialAvailability doesn't need to change
const initialAvailability = {
    'Alice': ['Mon 10:00 AM', 'Mon 11:00 AM', 'Mon 12:00 PM', 'Mon 1:00 PM', 'Mon 2:00 PM', 'Mon 3:00 PM', 'Mon 4:00 PM', 'Mon 5:00 PM', 'Mon 6:00 PM', 'Mon 7:00 PM', 'Mon 8:00 PM'],
    'Bob': ['Mon 10:00 AM', 'Wed 12:00 PM', 'Thu 12:00 PM'],
    // ... other people
};

const people = [
    {
        name: 'Alice',
        availability: [...initialAvailability['Alice']],
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
const tableAssignments = {
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
    
    
    // Now, add the event listener for handling clicks on .person-summary
    document.getElementById('schedule-info').addEventListener('click', function(event) {
        let summaryDiv = event.target.closest('.person-summary');
        if (summaryDiv) {
            console.log('Clicked summary for:', summaryDiv.textContent.trim().split(':')[0]);
            let detailsDiv = summaryDiv.nextElementSibling;
    
            // Check if the details are currently visible
            const isHidden = detailsDiv.classList.toggle('hidden');
            if (!isHidden) {
                // If details are not hidden, expand them
                detailsDiv.style.maxHeight = detailsDiv.scrollHeight + 'px';
            } else {
                // If details are hidden, collapse them
                detailsDiv.style.maxHeight = '0';
            }
        }
    });

    // Add null checks for buttons to avoid errors if they don't exist.
    saveButton?.addEventListener('click', function() {
        saveState();
        alert('Schedule saved!');
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

    document.querySelectorAll('.person-summary').forEach(function(summary) {
        summary.addEventListener('click', function() {
            // Find the next sibling element that is .person-details
            var details = this.nextElementSibling;

            // Toggle the .hidden class on .person-details
            if (details.classList.contains('hidden')) {
                details.classList.remove('hidden');
                details.style.maxHeight = details.scrollHeight + 'px';
            } else {
                details.style.maxHeight = null; // This will reset the max-height
                details.classList.add('hidden');
            }
        });
    });

    const addStudentButton = document.getElementById('add-student-button');
    addStudentButton.addEventListener('click', addStudent);


    updateLogPanel();
    attachSummaryEventListeners();
});

document.addEventListener('DOMContentLoaded', updateLogPanel);


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
attachSummaryEventListeners();




function resetForm() {
    document.getElementById('student-name').value = '';
    document.getElementById('student-availability').selectedIndex = 0;
}

function saveState() {
    localStorage.setItem('tableAssignments', JSON.stringify(tableAssignments));
    alert('Schedule saved!');
    updateLogPanel();
}



function loadState() {
    const savedAssignments = localStorage.getItem('tableAssignments');
    if (savedAssignments) {
        const loadedAssignments = JSON.parse(savedAssignments);
        Object.keys(tableAssignments).forEach(tableId => {
            tableAssignments[tableId] = loadedAssignments[tableId] || [];
            updateTable(tableId);
        });

        resetPeopleState();
        applyLoadedAssignments();
        updateLogPanel();
    } else {
        alert('No saved state to load.');
    }
    updateLogPanel();
}


function resetPeopleState() {
    people.forEach(person => {
        person.scheduledHours = 0;
        person.assignedSlots = [];
        person.availability = [...initialAvailability[person.name]];
    });
}

function applyLoadedAssignments() {
    Object.values(tableAssignments).forEach(assignments => {
        assignments.forEach(assignment => {
            const person = people.find(p => p.name === assignment.name);
            if (person) {
                person.scheduledHours++;
                person.assignedSlots.push(assignment.timeslot);
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

function removePerson(index) {
    if (confirm('Are you sure you want to remove this person?')) {
        // Update the scheduled hours for all assignments
        people[index].assignedSlots.forEach(assignment => {
            if (assignment.type === 'dropIn') {
                people[index].scheduledDropInHours--;
            } else if (assignment.type === 'groupTutoring') {
                people[index].scheduledGroupTutoringHours--;
            }
        });
        
        // Now safely remove the person from the array
        people.splice(index, 1);

        // Update the display
        updateLogPanel();
    }
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
        const removeOption = document.createElement('div');
        removeOption.className = 'dropdown-content';
        removeOption.textContent = `Remove ${event.target.dataset.assigned} (X)`;
        removeOption.onclick = function() {
            removeAssignment(event.target, event.target.dataset.assigned, timeslot);
        };
        dropdown.appendChild(removeOption);
    }

    // Populate the rest of the dropdown
    people.forEach(person => {
        if (person.availability.includes(timeslot)) {
            // Drop In Hours Option
            const dropInOption = document.createElement('div');
            dropInOption.className = 'dropdown-content';
            dropInOption.textContent = person.name + ' - Drop In Hours';
            dropInOption.onclick = function() {
                assignPerson(event.target, person.name, timeslot, 'dropIn');
                closeDropdowns();
            };
            dropdown.appendChild(dropInOption);

            // Group Tutoring Hours Option
            const groupTutoringOption = document.createElement('div');
            groupTutoringOption.className = 'dropdown-content';
            groupTutoringOption.textContent = person.name + ' - Group Tutoring Hours';
            groupTutoringOption.onclick = function() {
                assignPerson(event.target, person.name, timeslot, 'groupTutoring');
                closeDropdowns();
            };
            dropdown.appendChild(groupTutoringOption);
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


function removeAssignment(target, name, timeslot, hourType, tableId) {
    const person = people.find(p => p.name === name);
    if (!person) return;

    // Find the assignment index
    const assignmentIndex = person.assignedSlots.findIndex(assignment => assignment.timeslot === timeslot && assignment.type === hourType);
    if (assignmentIndex !== -1) {
        // Remove the assignment
        person.assignedSlots.splice(assignmentIndex, 1);
        if (hourType === 'dropIn') {
            person.scheduledDropInHours--;
        } else {
            person.scheduledGroupTutoringHours--;
        }
    }

    // Update the UI to reflect the removal
    target.classList.remove('filled-timeslot');
    target.textContent = 'Available';
    delete target.dataset.assigned;
    delete target.dataset.hourType;

    removeFromTableAssignments(name, timeslot, hourType, tableId);
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
        removeAssignment(target, target.dataset.assigned, timeslot, target.dataset.hourType, tableId);
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
    target.dataset.hourType = hourType;

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
    attachSummaryEventListeners();
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
    if (!tableId || !tableAssignments[tableId]) return;

    // Filter out the assignment to remove
    tableAssignments[tableId] = tableAssignments[tableId].filter(assignment => {
        return !(assignment.name === name && assignment.timeslot === timeslot && assignment.type === hourType);
    });
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
        logPanel.appendChild(personDiv);
    });
}


function removePerson(index) {
    if (confirm('Are you sure you want to remove this person?')) {
        // Remove the person from the array
        people.splice(index, 1);

        // Update the display
        updateLogPanel();
    }
}



// Call updateLogPanel initially to set up the log panel
updateLogPanel();




function groupAvailabilityByDay(availabilityList) {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    let groupedAvailability = weekDays.reduce((acc, day) => ({ ...acc, [day]: [] }), {});

    availabilityList.forEach(time => {
        const [day, ...rest] = time.split(' ');
        if (groupedAvailability[day] !== undefined) {
            groupedAvailability[day].push(rest.join(' '));
        }
    });

    // Sorting each day's times in ascending order
    for (let day of weekDays) {
        groupedAvailability[day].sort((a, b) => convertTo24hTime(a) - convertTo24hTime(b));
    }

    return groupedAvailability;
}





function convertTo24hTime(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}

function toggleDetails(event) {
    const detailsDiv = event.target.nextElementSibling;
    const isHidden = detailsDiv.classList.toggle('hidden');
    detailsDiv.style.maxHeight = isHidden ? '0' : `${detailsDiv.scrollHeight}px`;
}

function attachSummaryEventListeners() {
    const summaries = document.querySelectorAll('.person-summary');
    summaries.forEach(summary => {
        summary.addEventListener('click', toggleDetails);
    });
}


updateLogPanel();


function toggleDetails(event) {
    // Debugging logs
    console.log("Toggle details function called");

    const personDiv = event.target.closest('.person-div');
    const detailsDiv = personDiv.querySelector('.person-details');
    
    // Debugging logs
    console.log("personDiv:", personDiv);
    console.log("detailsDiv:", detailsDiv);

    const isHidden = detailsDiv.classList.toggle('hidden');
    detailsDiv.style.maxHeight = isHidden ? '0' : `${detailsDiv.scrollHeight}px`;
}


document.getElementById('schedule-info').addEventListener('click', function(event) {
    if (event.target.classList.contains('person-summary')) {
        toggleDetails(event);
    }
});
