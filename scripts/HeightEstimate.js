"use strict";

let deviceAbsolute = null;
// try-catch: exception handling
let errorRef = document.getElementsById("toast");
try
{
    // initialising object for device orientation
    deviceAbsolute = new AbsoluteOrientationSensor({ frequency: 60 });

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

// GLOBAL VARIABLES
let instBeta; // Instantaneous beta angle values in radians
let instGamma; // Instantaneous gamma angle values in radians
let betaArray = []; // Array to store instantaneous beta angle values
let userHeight; // Height of camera from the ground, estimated to be the user's own height
let topAngle; // Beta angle of the top of the object
let baseAngle; // Beta angle of the base of the object

function reloadOrientationValues(deviceAbsolute)
{
    /*
    reloadOrientationValues() is a function that
    takes an object 'deviceAbsolute'
    and computes the beta and gamma angle values of the device.
    
    beta angle values are pushed into betaArray.
    Once the array reaches a certain length,
    the function smoothing() will run
    and betaArray will be emptied.
    */

    let x = deviceAbsolute.quaternion[0];
    let y = deviceAbsolute.quaternion[1];
    let z = deviceAbsolute.quaternion[2];
    let w = deviceAbsolute.quaternion[3];
    instBeta = Math.atan2(2*(w*x + y*z), 1 - 2*(Math.pow(x,2)+Math.pow(y,2)));
    instGamma = Math.asin(2*(w*y - x*z));

    betaArray.push(instBeta);
    if (betaArray.length == 20)
    {
        smoothing();
        betaArray = [];
    }
}

function smoothing()
{
    /*
    smoothing() is a function that
    calculates the average of angle values in betaArray
    and prints the average into the HTML element that has the id "bValue"
    */
    
    let betaTotal = 0;

    for (let i in betaArray)
    {
        betaTotal += betaArray[i];
    }

    let averageBeta = (betaTotal/betaArray.length)*(180/Math.PI);
    document.getElementById("bValue").innerHTML = averageBeta.toFixed(2) + "&deg;";
}

function cameraHeight()
{
    /*
    cameraHeight() is an onclick function that
    prompts the user for their height
    to be registered into the global variable 'userHeight'
    
    It will then check if global variables
    'baseAngle', 'topAngle' and 'userHeight' are defined
    so that the CALCULATE button may be enabled.
    */
    
    userHeight = prompt("Please enter your camera height in metres.");
    
    while(isNaN(Number(userHeight)) || userHeight <= 0)
    {
        if(userHeight == null || userHeight == "")
        {
            // In the case where the input field was left empty, a default height is set.
            userHeight = 1.6;
            alert("A default height of 1.6m has been set.")
        }
        else
        {
            // In the case where the input is a negative number or not a number, the user will be alerted and prompted again.
            alert("Invalid input! Camera height should be a positive number.");
            userHeight = prompt("Please enter your camera height in metres.");
        }
    }

    document.getElementById("heightOfCamera").innerHTML = userHeight + "m";
    if( baseAngle != undefined && topAngle != undefined && userHeight != undefined )
    {
        document.getElementById("calculateButton").disabled = false;
    }
    else
    {
        document.getElementById("calculateButton").disabled = true;
    }
}

function measureApexAngle()
{
    /*
    measureApexAngle() is an onclick function that
    checks if the device is in an appropriate orientation
    before registering the instantaneous beta angle value
    into the global variable 'topAngle'
    
    It will then check if global variables
    'baseAngle', 'topAngle' and 'userHeight' are defined
    so that the CALCULATE button may be enabled.
    */
    
    if( instGamma >= -Math.PI/6 && instGamma <= Math.PI/6 && instBeta >= 0 && instBeta <= Math.PI )
    {
        
        if( baseAngle != undefined && baseAngle > instBeta )
        {
            alert("Top angle must be greater than base angle!");
            topAngle = undefined;
            document.getElementById("topAngle").innerHTML = "";
        }
        else
        {
            topAngle = instBeta;
            document.getElementById("topAngle").innerHTML = (topAngle*(180/Math.PI)).toFixed(2) + "&deg;";
            alert("Top angle has been set successfully!");
        }

        if( baseAngle != undefined && topAngle != undefined && userHeight != undefined )
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

function measureBaseAngle()
{
    /*
    measureBaseAngle() is an onclick function that
    checks if the device is in an appropriate orientation
    before registering the instantaneous beta angle value
    into the global variable 'baseAngle'
    
    It will then check if global variables
    'baseAngle', 'topAngle' and 'userHeight' are defined
    so that the CALCULATE button may be enabled.
    */
    
    if( instGamma >= -Math.PI/6 && instGamma <= Math.PI/6 && instBeta >= 0 && instBeta <= Math.PI )
    {
        
        if(topAngle != undefined && topAngle < instBeta)
        {
            alert("Base angle must be smaller than top angle!");
            baseAngle = undefined;
            document.getElementById("baseAngle").innerHTML = "";
        }
        else
        {
            baseAngle = instBeta;
            document.getElementById("baseAngle").innerHTML = (baseAngle*(180/Math.PI)).toFixed(2) + "&deg;";
            alert("Base angle has been set successfully!");
        }

        if( baseAngle != undefined && topAngle != undefined && userHeight != undefined )
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

function calculate()
{
    /*
    calculate() is an onclick function that
    takes global variables 'userHeight', 'baseAngle' and 'topAngle'
    to calculate the distance the object is from the user, and the object's height.
    */
    
    let distance = Number(userHeight) * Math.tan(baseAngle);
    document.getElementById("distanceOfObject").innerHTML = distance.toFixed(2) + "m";

    let height = Number(userHeight) + distance * Math.tan(topAngle - Math.PI/2);
    document.getElementById("heightOfObject").innerHTML = height.toFixed(2) + "m";
}
