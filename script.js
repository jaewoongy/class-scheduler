// The array of people and their availability
const people = [
    { name: 'Alice', availability: ['Mon 10:00 AM', 'Tue 11:00 AM'], maxHours: 10, scheduledHours: 0, assignedSlots: [] },
    { name: 'Bob', availability: ['Mon 10:00 AM', 'Wed 12:00 PM'], maxHours: 10, scheduledHours: 0, assignedSlots: [] },
    // ... other people
];

document.addEventListener('DOMContentLoaded', function() {
    const scheduleContainer = document.getElementById('schedule-container');
    for (let i = 1; i <= 6; i++) {
        scheduleContainer.appendChild(createTable(i));
    }
    updateLogPanel();
});

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

    const buildingDiv = document.createElement('div');
    buildingDiv.className = 'building';
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
        // Check if this slot is already assigned to someone else
        if (target.dataset.assigned && target.dataset.assigned !== name) {
            // Revert the previously assigned person's hours and availability
            removeAssignment(target, target.dataset.assigned, timeslot);
        }

        // If the slot is already assigned to this person, remove the assignment.
        if (target.dataset.assigned === name) {
            target.classList.remove('filled-timeslot');
            target.textContent = 'Available';
            target.removeAttribute('data-assigned');
            person.scheduledHours--;
            person.availability.push(timeslot); // Add back the available time
            person.assignedSlots = person.assignedSlots.filter(slot => slot !== timeslot);
        } else {
            // Assign the new person to the slot.
            if (person.scheduledHours < person.maxHours) {
                target.classList.add('filled-timeslot');
                target.textContent = name;
                target.dataset.assigned = name;
                person.scheduledHours++;
                person.assignedSlots.push(timeslot);
                person.availability = person.availability.filter(availableTime => availableTime !== timeslot);
            } else {
                alert(name + " has reached their maximum working hours.");
            }
        }
    }

    updateLogPanel();
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

