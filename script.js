const initialAvailability = {
    'Alice': ['Mon 10:00 AM', 'Mon 10:00 AM', 'Mon 11:00 AM', 'Mon 12:00 PM', 'Mon 1:00 PM', 'Mon 2:00 PM', 'Mon 3:00 PM', 'Mon 4:00 PM', 'Mon 5:00 PM', 'Mon 6:00 PM', 'Mon 7:00 PM', 'Mon 8:00 PM'],
    'Bob': ['Mon 10:00 AM', 'Wed 12:00 PM'],
    // ... other people
};

const people = [
    { name: 'Alice', availability: [...initialAvailability['Alice']], maxHours: 10, scheduledHours: 0, assignedSlots: [] },
    { name: 'Bob', availability: [...initialAvailability['Bob']], maxHours: 10, scheduledHours: 0, assignedSlots: [] },
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
    
    if (!studentName) {
        alert('Please enter a student name.');
        return;
    }

    const availability = [
        ...document.getElementById('student-availability-monday').selectedOptions,
        ...document.getElementById('student-availability-tuesday').selectedOptions,
        ...document.getElementById('student-availability-wednesday').selectedOptions,
        ...document.getElementById('student-availability-thursday').selectedOptions,
        ...document.getElementById('student-availability-friday').selectedOptions,
    ].map(option => option.value).filter(value => value); // This will exclude any empty strings from options without value
    
    if (availability.length === 0) {
        alert('Please select at least one availability time.');
        return;
    }
    
    // Assuming `people` is an array in your global scope
    people.push({
        name: studentName,
        availability: availability,
        maxHours: 10, // Assuming you want to set a default maxHours value
        scheduledHours: 0,
        assignedSlots: []
    });

    // Assuming you have a function to update your UI
    updateLogPanel();

    // Clear the form for the next input
    document.getElementById('student-name').value = '';
    document.querySelectorAll('.student-availability').forEach(select => {
        Array.from(select.options).forEach(option => option.selected = false);
    });

    alert('Student added!');
    updateLogPanel();
    attachSummaryEventListeners();
}



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
            const option = document.createElement('div');
            option.className = 'dropdown-content';
            option.textContent = person.name;
            option.onclick = function() {
                assignPerson(event.target, person.name, timeslot);
                closeDropdowns();
            };
            dropdown.appendChild(option);
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
    const person = people.find(p => p.name === name);
    if (person) {
        // Existing removal logic
        person.scheduledHours--;
        person.assignedSlots = person.assignedSlots.filter(slot => slot !== timeslot);
        person.availability.push(timeslot);

        // Update UI
        target.classList.remove('filled-timeslot');
        target.removeAttribute('data-assigned');
        target.textContent = 'Available';

        // Update tableAssignments
        const tableId = findTableId(target);
        if (tableId) {
            tableAssignments[tableId] = tableAssignments[tableId].filter(assignment => !(assignment.name === name && assignment.timeslot === timeslot));
        }

        
    }
    updateLogPanel();
    attachSummaryEventListeners(); 
}


function closeDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => dropdown.remove());
}

function assignPerson(target, name, timeslot) {
    const person = people.find(p => p.name === name);
    if (person) {
        // Identify the table ID from the target element's parents
        const tableId = findTableId(target);

        // Check if this slot is already assigned to someone else
        if (target.dataset.assigned && target.dataset.assigned !== name) {
            // Revert the previously assigned person's hours and availability
            removeAssignment(target, target.dataset.assigned, timeslot, tableId);
        }

        // If the slot is already assigned to this person, remove the assignment.
        if (target.dataset.assigned === name) {
            target.classList.remove('filled-timeslot');
            target.textContent = 'Available';
            target.removeAttribute('data-assigned');
            person.scheduledHours--;
            person.availability.push(timeslot); // Add back the available time
            person.assignedSlots = person.assignedSlots.filter(slot => slot !== timeslot);
            // Remove from tableAssignments
            removeFromTableAssignments(name, timeslot, tableId);
        } else {
            // Assign the new person to the slot.
            if (person.scheduledHours < person.maxHours) {
                target.classList.add('filled-timeslot');
                target.textContent = name;
                target.dataset.assigned = name;
                person.scheduledHours++;
                person.assignedSlots.push(timeslot);
                person.availability = person.availability.filter(availableTime => availableTime !== timeslot);
                // Add to tableAssignments
                addToTableAssignments(name, timeslot, tableId);
            } else {
                alert(name + " has reached their maximum working hours.");
            }
        }
    }

    updateLogPanel();
    attachSummaryEventListeners();
}

function findTableId(target) {
    // Traverse up the DOM tree to find the parent table and return its ID
    let currentElement = target;
    while (currentElement && !currentElement.classList.contains('schedule-table')) {
        currentElement = currentElement.parentElement;
    }
    return currentElement ? currentElement.id : null;
}

function addToTableAssignments(name, timeslot, tableId) {
    if (tableId && tableAssignments[tableId]) {
        tableAssignments[tableId].push({ name, timeslot });
    }
}

function removeFromTableAssignments(name, timeslot, tableId) {
    if (tableId && tableAssignments[tableId]) {
        tableAssignments[tableId] = tableAssignments[tableId].filter(assignment => !(assignment.name === name && assignment.timeslot === timeslot));
    }
}

function updateLogPanel() {
    const logPanel = document.getElementById('schedule-info');
    logPanel.innerHTML = '';

    people.forEach(person => {
        const personDiv = document.createElement('div');
        personDiv.className = 'person-div';

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'person-summary';
        summaryDiv.textContent = `${person.name}: ${person.scheduledHours} hours scheduled, ${person.maxHours - person.scheduledHours} hours remaining.`;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'person-details hidden';

        const availabilityByDay = groupAvailabilityByDay(person.availability);
        Object.entries(availabilityByDay).forEach(([day, times]) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-div';
            dayDiv.textContent = `${day}: ${times.join(', ')}`;
            detailsDiv.appendChild(dayDiv);
        });

        personDiv.appendChild(summaryDiv);
        personDiv.appendChild(detailsDiv);
        logPanel.appendChild(personDiv);
    });

    attachSummaryEventListeners();
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
