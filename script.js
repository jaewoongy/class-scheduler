const initialAvailability = {
    'Alice': ['Mon 10:00 AM', 'Tue 11:00 AM'],
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
});

function saveState() {
    localStorage.setItem('tableAssignments', JSON.stringify(tableAssignments));
}


function loadState() {
    const savedAssignments = localStorage.getItem('tableAssignments');
    console.log('Loading state:', savedAssignments); // Debug log

    if (savedAssignments) {
        const loadedAssignments = JSON.parse(savedAssignments);
        Object.keys(loadedAssignments).forEach(tableId => {
            tableAssignments[tableId] = loadedAssignments[tableId];
            updateTable(tableId);
        });
        updateLogPanel();
    } else {
        console.log('No saved state to load.'); // Debug log
        alert('No saved state to load.');
    }
}




function resetSchedule() {
    people.forEach(person => {
        person.scheduledHours = 0;
        person.assignedSlots = [];
        person.availability = [...initialAvailability[person.name]];
    });
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
    // Find the person in the people array
    const person = people.find(p => p.name === name);
    if (person) {
        // Reduce the person's scheduled hours
        person.scheduledHours--;

        // Remove the timeslot from the person's assignedSlots
        person.assignedSlots = person.assignedSlots.filter(slot => slot !== timeslot);

        // Add the timeslot back to the person's availability
        person.availability.push(timeslot);

        // Remove the 'filled-timeslot' class to reset the styling
        target.classList.remove('filled-timeslot');

        // Clear the 'data-assigned' attribute and reset the cell's text content
        target.removeAttribute('data-assigned');
        target.textContent = 'Available';

        // Update the log panel to reflect the change
        updateLogPanel();
    }
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
        const remainingHours = person.maxHours - person.scheduledHours;
        const availability = person.availability.sort().join(', '); // Sort and join the available times
        const personInfo = document.createElement('div');
        personInfo.innerHTML = `<strong>${person.name}</strong>: ${person.scheduledHours} hours scheduled, ${remainingHours} hours remaining. Remaining available times: ${availability}`;
        logPanel.appendChild(personInfo);
    });
}

