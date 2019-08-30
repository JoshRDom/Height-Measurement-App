"use strict";

let deviceAbsolute = null;
// try-catch: exception handling
try
{
    // initialising object for device orientation
    deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 50 });

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
let betaArray = [];
let gammaArray = [];
let output = 0;
let userHeight,topAngle,baseAngle,averageBeta,averageGamma;
let baseAngleCheck = 0;
let topAngleCheck = 0;

function reloadOrientationValues(deviceAbsolute)
{
  let x = deviceAbsolute.quaternion[0];
	let y = deviceAbsolute.quaternion[1];
	let z = deviceAbsolute.quaternion[2];
	let w = deviceAbsolute.quaternion[3];
	let beta = Math.atan2(2*(w*x + y*z), 1 - 2*(Math.pow(x,2)+Math.pow(y,2))); //beta
	let gamma = Math.asin(2*(w*y - x*z)); //gamma

  //pushing the value into the respective angle array
  betaArray.push(beta);
  gammaArray.push(gamma);

  //if alphaArray length is 10, betaArray and gammaArray will also be 10
  if (betaArray.length == 10)
  {
    smoothing();
    //reset all the value inside the array after every iteration
    betaArray = [];
    gammaArray = [];
  }
}
//Function used to smooth the data
//Output: the smoothed data from the inputted value
function smoothing()
{
  let betaTotal = 0;
  let gammaTotal = 0;

  for (let i in betaArray)
  {
    betaTotal += betaArray[i];
    gammaTotal += gammaArray[i];
  }

  averageBeta = ((betaTotal/10)*(180/Math.PI)).toFixed(2);
  averageGamma =  ((gammaTotal/10)*(180/Math.PI)).toFixed(2);
  document.getElementById("bValue").innerHTML = averageBeta;
}
// end: code for device orientation

// A function to get the height
//from the user for future calculation
//using prompt function
function setCameraHeight()
{
  let heightOfCameraRef = document.getElementById("heightOfCamera");
  userHeight = prompt("Please enter your camera height in metres.");
  // checking whether input is valid  and keep promting
  // until a valid input is entered
  while(isNaN(Number(userHeight)) || userHeight <= 0)
  {
    if(userHeight == null || userHeight == "")
    {
      userHeight = 1.6;
      alert("A default height of 1.6m has been set.")
    }
    else
    {
      alert("Invalid input! Camera height should be a positive number.");
      userHeight = prompt("Please enter your camera height in metres.");
    }
  }
  //end of while loop

  heightOfCameraRef.innerHTML = userHeight + "m";
  // enabling the calculate button only when base angle, top angle
  // and user height are present
  if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
  {
    document.getElementById("calculateButton").disabled = false;
  }
  else
  {
    document.getElementById("calculateButton").disabled = true;
  }
}

//Function to capture the tilt angle when user hit Top angle
//Record the beta value when the button is clicked
//IMPROVE:
// --set condition where can only apply when camera is on
function recordTopAngle()
{
  if(averageGamma >= -30 && averageGamma <= 30 && averageBeta >= 0 && averageBeta <= 180)
  {
    let bvalueRef = document.getElementById("bValue").innerText;
    let outputRef = document.getElementById("topAngle");
    topAngle = Number(bvalueRef);
    if(baseAngle != undefined && baseAngle > topAngle)
    {
      alert("Top angle must be greater than base angle!");
      topAngle = undefined;
      topAngleCheck = 0;
      outputRef.innerHTML = "";
    }
    else
    {
      outputRef.innerHTML = topAngle + "&deg;";
      alert("Top angle has been set successfully!");
      topAngleCheck += 1;
      }

    // enabling the calculate button only when base angle, top angle
    // and user height are present
    if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
    {
      document.getElementById("calculateButton").disabled = false;
    }
    else
    {
      document.getElementById("calculateButton").disabled = true;
    }
  }
  else
  {
    alert("Device orientation is invalid!");
  }
}

function recordBaseAngle()
{
  if(averageGamma >= -30 && averageGamma <= 30 && averageBeta >= 0 && averageBeta <= 180)
  {
    let bvalueRef = document.getElementById("bValue").innerText;
    let outputRef = document.getElementById("baseAngle");
    baseAngle = Number(bvalueRef);
    if(topAngle != undefined && topAngle < baseAngle)
    {
      alert("Base angle must be smaller than top angle!");
      baseAngle = undefined;
      baseAngleCheck = 0;
      outputRef.innerHTML = "";
    }
    else
    {
      outputRef.innerHTML = baseAngle + "&deg;";
      alert("Base angle has been set successfully!");
      baseAngleCheck += 1;
    }

    // enabling the calculate button only when base angle, top angle
    // and user height are present
    if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
    {
      document.getElementById("calculateButton").disabled = false;
    }
    else
    {
      document.getElementById("calculateButton").disabled = true;
    }
  }
  else
  {
    alert("Device orientation is invalid!");
  }
}

// Function to calculate the distance and height
// Output: return height of the object
//       : distance from user to the object
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
