"use strict";

let deviceAbsolute = null;
// try-catch: exception handling
try
{
    // initialising object for device orientation
    deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 30 });

    // if sensor is available but there is problem in using it
    deviceAbsolute.addEventListener('error', event => {
    // Handle runtime errors.
    if (event.error.name === 'NotAllowedError')
    {
      errorRef.innerText ="Permission to access sensor was denied.";
    }
    else if (event.error.name === 'NotReadableError' )
    {
      errorRef.innerText = "Cannot connect to the sensor.";
    }});
    // when sensor has a reading, call the function
    deviceAbsolute.addEventListener('reading', () => reloadOrientationValues(deviceAbsolute));

    // start the sensor
    deviceAbsolute.start();
}
catch (error)
{
// Handle construction errors.
  let errorText = "";
  if (error.name === 'SecurityError')
  {
    errorText = "Sensor construction was blocked by the Feature Policy.";
  }
  else if (error.name === 'ReferenceError')
  {
    errorText = "Sensor is not supported by the User Agent.";
  }
  else
  {
    errorText = "Sensor not supported";
  }
  errorRef.innerText = errorText;
}

// function to print value on the webpage
let angleArray = [];
let output = 0;
let userHeight,topAngle,baseAngle;;
let baseAngleCheck = 0;
let topAngleCheck = 0;

function reloadOrientationValues(deviceAbsolute)
{
  let x = deviceAbsolute.quaternion[0];
  let y = deviceAbsolute.quaternion[1];
  let z = deviceAbsolute.quaternion[2];
  let w = deviceAbsolute.quaternion[3];
  let data = Math.atan2(2*(w*x + y*z), 1 - 2*(Math.pow(x,2)+Math.pow(y,2)));
  let angle = data*(180/Math.PI);

  angleArray.push(angle);
  output += angle;
  if(angleArray.length == 10)
  {
    let averageAngle = (output/10).toFixed(2);
    document.getElementById("bValue").innerHTML = averageAngle;
    angleArray = [];
    output = 0;
  }
}
// end: code for device orientation

// A function to get the height
// from the user for future calculation
// using prompt function
function setCameraHeight()
{
  let heightOfCameraRef = document.getElementById("heightOfCamera");
  userHeight = prompt("Please enter your camera height in metres.");
  // checking whether input is valid  and keep promting
  // until a valid input is entered
  while(isNaN(Number(userHeight)) || userHeight <= 0)
  {
    alert("Invalid input! Camera height should be a positive number.");
    userHeight = prompt("Please enter your camera height in metres.");
  }
  heightOfCameraRef.innerHTML = userHeight + "m";
  // enabling the calculate button only when base angle, top angle
  // and user height are present
  if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
  {
    document.getElementById("calculateButton").disabled = false;
  }
}

//Function to capture the tilt angle when user hit Top angle
//Record the beta value when the button is clicked
//IMPROVE:
// --set condition where can only apply when camera is on
function recordTopAngle()
{
  let bvalueRef = document.getElementById("bValue").innerText;
  let outputRef = document.getElementById("topAngle");
  topAngle = bvalueRef;
  outputRef.innerHTML = topAngle + "&deg;";
  topAngleCheck += 1;
  // enabling the calculate button only when base angle, top angle
  // and user height are present
  if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
  {
    document.getElementById("calculateButton").disabled = false;
  }
}

function recordBaseAngle()
{
  let bvalueRef = document.getElementById("bValue").innerText;
  let outputRef = document.getElementById("baseAngle");
  baseAngle = bvalueRef;
  outputRef.innerHTML = baseAngle + "&deg;";
  baseAngleCheck += 1;
  // enabling the calculate button only when base angle, top angle
  // and user height are present
  if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
  {
    document.getElementById("calculateButton").disabled = false;
  }
}

function calculate()
{
  let distanceOfObjectRef = document.getElementById("distanceOfObject");
  let heightOfObjectRef = document.getElementById("heightOfObject");
  let h1 = Number(userHeight);
  let beta = baseAngle*(Math.PI/180);
  let distance = h1 * Math.tan(beta);
  distanceOfObjectRef.innerHTML = distance.toFixed(2) + "m";

  let alpha = (topAngle-90)*(Math.PI/180);
  let h2 = distance * Math.sin(alpha);
  let height = h1 + h2;
  heightOfObjectRef.innerHTML = height.toFixed(2) + "m";
}
