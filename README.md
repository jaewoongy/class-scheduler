I have the instructions below for the class scheduling site I created.
Link to the Website: https://jaewoongy.github.io/class-scheduler/

**Instructions:**

**You can enlarge the size of the tables and fonts by zooming in (keyboard shortcut is: "CTRL" and "plus sign (+)")**

#**Option 1:**
Add student via paste: 
There are two options to add a student tutor. It's quicker to add them using the first option, using the "paste unavailability days" box. I will show the image below for reference.

Example:
Adding A Student as Student Tutor:
First, in the Sheets, copy the highlighted times as shown. 
<img width="1380" alt="Screenshot 2024-05-08 at 12 53 42 AM" src="https://github.com/jaewoongy/class-scheduler/assets/56903210/7e9b68c0-8a65-4526-b863-05f0a91f756a">

These times represent the days of the week they are unavailable to teach at that current time slot. (Melly is unavailable for 1PM on MON, WED):

Input their name and group/drop in hours in the first 3 boxes, and paste the copied line from sheets in the big box. You must separate each hour by a new line **and type None for the blank excel cells at that corresponding time**, as shown:
Screen Shot 2024-01-22 at 8.58.03 AM.png

Once you press "Add Student", Melly should show up on the list of student tutors. The code will automatically recalculate the student's unavailable times to find all their available times. You can click on each student to see the times they are available as shown:
<img width="715" alt="Screenshot 2024-05-08 at 12 54 29 AM" src="https://github.com/jaewoongy/class-scheduler/assets/56903210/06442959-61c7-4644-b409-1f5055321df3">

This is helpful since you can use these times to determine what times/days they can be available for without having to look at the google form of their times and # of assigned hours.



**Step 2:** Add student tutor to table (You can either add more student tutors, remove student tutors (Using the Red X) or keep the current list of students for this step.)

If you click on each cell corresponding to a Time and Day, you can see who you can assign to that time slot based on their available times that you pasted in when adding students:

<img width="648" alt="Screenshot 2024-01-27 at 6 38 07 PM" src="https://github.com/jaewoongy/class-scheduler/assets/56903210/041b3fb0-395f-4089-a181-69c899e7b5b9">

I color coded for better organization (blue represents the tutor is doing a drop in, red represents the tutor is doing a group session).

Once you add a student to a time/day slot, it should be reflected in their available time and # of drop in hours/group tutoring hours filled in the list as shown above for Melly. You can also remove Melly from her assigned times on the table. Also, note that you can add two students to a time slot, which is helpful for the drop-ins.


**Step 3:** Done! You should save whenever you can.

When you press "Save Schedule" at the top of the site, it should save the changes that you have made in adding the tutor and assigning shifts to the table, even after pressing "Reset Schedule". You can then load the saved file by pressing "Load Schedule"
