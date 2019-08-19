"use strict";

let deviceAbsolute = null;
// try-catch: exception handling
try
{
    // initialising object for device orientation
    deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 10 });

    //if sensor is available but there is problem in using it
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

    //start the sensor
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
    errorText =" Sensor is not supported by the User Agent.";
  }
  else
  {
    errorText = "Sensor not supported";
  }
  errorRef.innerText = errorText;
}

// function to print value on the webpage
let angleArray = [];

function reloadOrientationValues(deviceAbsolute)
{
let x = deviceAbsolute.quaternion[0];
let y = deviceAbsolute.quaternion[1];
let z = deviceAbsolute.quaternion[2];
let w = deviceAbsolute.quaternion[3];
let angle = 0;
let data = [];
let output = 0;
data[0] = Math.atan2(2*(w*x + y*z), 1 - 2*(Math.pow(x,2)+Math.pow(y,2)));
//console.log(data);
  angle = data[0]*(180/Math.PI);
  angleArray.push(angle);
  if(angleArray.length == 5)
  {
    for(let i = 0;i < 5;i++)
    {
      output += angleArray[i];
    }
    document.getElementById("bValue").value = (output/5).toFixed(2);
    angleArray = [];
    output = 0;
  }
}

//A function to get the height
//from the user for futture calculation
//using prompt function
function setCameraHeight()
{
  let heightAnsRef = document.getElementById('heightOfCamera')
  let userHeight = prompt("Please enter your camera height");

  heightAnsRef.innerHTML = userHeight;
}

// end: code for device orientation
