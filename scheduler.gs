//Pulls data from google sheet and creates an event containing the information on a google calendar

//IMPORTANT
//UPDATE LINES: 12,14,28,30,50,77,97,99
//These lines depend on the specific sheet and calendar you are using.
//YOU NEED:
// sheet id
// sheet name
// calendar id


//returns an array of all the column titles
function getTitles()
{
  //put your spreadsheet ID here! #############################################
  var ss = SpreadsheetApp.openById();
  //put the sheet name here! ##################################################
  var fullSchedule = ss.getSheetByName();
  var data = fullSchedule.getDataRange().getValues();
  var titles = [];
  for (var i = 0; i < data[0].length; i++)
  {
    titles[i] = data[0][i];
  }
  return titles
}

//updates Daily Tasks according to the schedule
function updateDailyTasks()
{
  ////put your spreadsheet ID here! #############################################
  var ss = SpreadsheetApp.openById();
  //put the sheet name here! ##################################################
  var fullSchedule = ss.getSheetByName();
  var data = fullSchedule.getDataRange().getValues();
  var ids = ss.getSheetByName("Calendar_IDs").getDataRange().getValues();
  
  //get all the titles
  var titles = getTitles();
  
  for (var i = 1; i < data.length; i++)
  {
    
    //collect all the scheduling data into the single description string
    var description = ""
    for (var j = 1; j < titles.length; j++)
    {
      description = description + titles[j] + ": " + data[i][j] + "\n";
    }

    
    //grabs the calendar
    //put calendar id here
    var calendar = CalendarApp.getCalendarById();
    //grabs events for the day
    var events = calendar.getEventsForDay(new Date(data[i][0]));
    //flag used to indicate if "Daily Tasks" already exists
    var flag = false;
    //used to find pre-existing daily task if it exists
    var key;
    
    
    //check if daily task already exists
    //loop through day's events comparing to saved ids in sheet
    for (var j = 0; j < events.length; j++)
    {
      var name = events[j].getId();

      if (name == ids[i])
      {
        key = j;
        flag = true;
      }
      //Logger.log(flag);
    }

    //if no event exists, create a new one and save id to sheet
    if (flag == false)
    {
      //put event name here
      var event = calendar.createAllDayEvent('', new Date(data[i][0]));
      event.setDescription(description);
      var id = event.getId();
      var cell = ss.getSheetByName("Calendar_IDs").getRange(i+1,1);
      cell.setValue(id);
    }
    //if already exists, just update
    else
    {
        events[key].setDescription(description);
    }
  }
}


//deletes any days on the schedule prior to the current day
//DOES NOT TOUCH THE CALENDAR!!!!
function deleteOldEvents()
{
  ////put your spreadsheet ID here! #############################################
  var ss = SpreadsheetApp.openById();
  //put the sheet name here! ##################################################
  var fullSchedule = ss.getSheetByName('Sheet1');
  var ids = ss.getSheetByName("Calendar_IDs");
  //used to indicated end of loop
  var flag = false;
  
  //loop through 2nd row and test if older than the current day
  //if it is the previous day or earlier delete row on "Full Schedule" and "Calendar_IDs"
  while (flag == false)
  {
    var test = (fullSchedule.getRange(2,1).getValues());
    var scheduleDate = new Date(test);
    Logger.log(scheduleDate);
    var currentDate = new Date();
    Logger.log(currentDate);
    //set the date variables to make script easier to read
    var currentYear = currentDate.getFullYear();
    var scheduleYear = scheduleDate.getFullYear();
    var currentMonth = currentDate.getMonth();
    var scheduleMonth = scheduleDate.getMonth();
    var currentDay = currentDate.getDate();
    var scheduleDay = scheduleDate.getDate();
    //assusme it is the last iteration to be deleted
    flag = true;
    //if it is older, delete and reset flag to false to test again
    if(scheduleYear < currentYear)
    {
      fullSchedule.deleteRow(2);
      ids.deleteRow(2);
      flag = false;
    }
    else if ((scheduleMonth < currentMonth) && (scheduleYear == currentYear))
    {
      fullSchedule.deleteRow(2);
      ids.deleteRow(2);
      flag = false;
    }
    else if ((scheduleDay < currentDay) && (scheduleYear == currentYear) && (scheduleMonth == currentMonth))
    {
      fullSchedule.deleteRow(2);
      ids.deleteRow(2);
      flag = false;
    }
  }
  
}