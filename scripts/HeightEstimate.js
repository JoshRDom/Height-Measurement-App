"use strict";

let deviceAbsolute = null;
// try-catch: exception handling
try
{
    // initialising object for device orientation
    deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 10 });

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
let userHeight = 0;

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
  if(angleArray.length == 5)
  {
    document.getElementById("bValue").innerHTML = (output/5).toFixed(2);
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
  while(isNaN(Number(userHeight)) || userHeight <= 0)
  {
    alert("Invalid input! Camera height should be a positive number.");
    userHeight = prompt("Please enter your camera height in metres.");
  }
  heightOfCameraRef.innerHTML = userHeight;
}

//Function to capture the tilt angle when user hit Top angle
//Record the beta value when the button is clicked
//IMPROVE:
// --set condition where can only apply when camera is on
function recordTopAngle()
{
  let bvalueRef = document.getElementById('bValue').value;
  let outputRef = document.getElementById('topAngle');

   outputRef.innerHTML = parseFloat(bvalueRef);
}

function recordBaseAngle()
{
  let bvalueRef = document.getElementById('bValue').value;
  let outputRef = document.getElementById('baseAngle');

  outputRef.innerHTML = bvalueRef;
}
