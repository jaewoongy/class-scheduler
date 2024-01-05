// The array of people and their availability
const people = [
    { name: 'Alice', availability: ['Mon 10:00 AM', 'Tue 11:00 AM'] },
    { name: 'Bob', availability: ['Mon 10:00 AM', 'Wed 12:00 PM'] },
    // ... other people ...
];

// Function to create and append the schedule table to the container
function createTable(buildingNumber) {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const table = document.createElement('table');
    table.className = 'schedule-table';
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    // Create header cells
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time/Day';
    headerRow.appendChild(timeHeader);
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = day;
        headerRow.appendChild(dayHeader);
    });

    // Create the time slot rows
    const tbody = table.createTBody();
    for (let hour = 10; hour <= 20; hour++) {
        const row = tbody.insertRow();
        const timeCell = document.createElement('td');
        timeCell.textContent = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        row.appendChild(timeCell);

        for (let i = 1; i <= daysOfWeek.length; i++) {
            const cell = document.createElement('td');
            cell.textContent = 'Available';
            cell.onclick = function(event) {
                showDropdown(event, `${daysOfWeek[i-1]} ${timeCell.textContent}`);
            };
            row.appendChild(cell);
        }
    }

    // Create the container for the building's schedule
    const buildingDiv = document.createElement('div');
    buildingDiv.className = 'building';
    buildingDiv.appendChild(table);

    return buildingDiv;
}

// Show the dropdown for selecting an available person
function showDropdown(event, timeslot) {
    closeDropdowns();

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.style.display = 'block';
    dropdown.style.position = 'absolute';
    dropdown.style.left = event.pageX + 'px';
    dropdown.style.top = event.pageY + 'px';

    people.forEach(person => {
        if (person.availability.includes(timeslot)) {
            const option = document.createElement('div');
            option.className = 'dropdown-content';
            option.textContent = person.name;
            option.onclick = function() {
                assignPerson(event.target, person.name);
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
    event.stopPropagation();
    console.log("Attempting to show dropdown for timeslot: " + timeslot);

}

    
// Close all open dropdowns
function closeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => dropdown.remove());
}

// Assign a person to a time slot
function assignPerson(target, name) {
    target.textContent = name;
    console.log("Assigning " + name + " to the timeslot.");
}

// Add a global event listener to close dropdowns when clicking anywhere on the page
window.addEventListener('click', closeDropdowns);

// Generate the schedule tables once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    for (let i = 1; i <= 6; i++) {
        scheduleContainer.appendChild(createTable(i));
    }
});
