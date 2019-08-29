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
let angleArray = []; //array that store the smoothed value of [alpha,beta,gamma]
let betaArray = [];
let alphaArray = [];
let gammaArray = [];
let output = 0;
let userHeight,topAngle,baseAngle;
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
	let alpha = Math.atan2(2*(w*z + x*y),1 - 2*(Math.pow(y,2)+Math.pow(z,2)));//alpha

  //pushing the value into the respective angle array
  betaArray.push(beta);
  alphaArray.push(alpha);
  gammaArray.push(gamma);
  console.log('B ' + betaArray.length);

  //if alphaArray length is 10, betaArray and gammaArray will also be 10
  if (betaArray.length == 10)
  {
    Smoothing();
    //reset all the value inside the array after every iteration
    betaArray = [];
    alphaArray = [];
    gammaArray = [];
  }
}
//Function used to smooth the data
//Output: the smoothed data from the inputted value
function Smoothing()
{
  let betaTotal = 0;
  let alphaTotal = 0;
  let gammaTotal = 0;

  for (let i in betaArray)
  {
    betaTotal += betaArray[i];
    alphaTotal += alphaArray[i];
    gammaTotal += gammaArray[i];
  }

  angleArray[0] = ((alphaTotal/10)*(180/Math.PI)).toFixed(2);
  angleArray[1] = ((betaTotal/10)*(180/Math.PI)).toFixed(2);
  angleArray[2] =  ((gammaTotal/10)*(180/Math.PI)).toFixed(2);
  document.getElementById("bValue").innerHTML = angleArray[1];
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
    if(userHeight == null)
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
  alert("Top angle has been set successfully!");
  topAngleCheck += 1

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
  alert("Base angle has been set successfully!");
  baseAngleCheck += 1;

  // enabling the calculate button only when base angle, top angle
  // and user height are present
  if(baseAngleCheck >= 1 && topAngleCheck >=1 && userHeight != undefined)
  {
    document.getElementById("calculateButton").disabled = false;
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
