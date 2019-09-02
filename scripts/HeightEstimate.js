/*
Extracted from: https://eng1003.monash/apps/sensortest/
Sensor Test web app
Copyright (c) 2019 Monash University
Written by Michael Wybrow and Arvind Kaur
*/

"use strict";

let deviceAbsolute = null;
// try-catch: exception handling
let errorRef = document.getElementById("toast");
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

// GLOBAL VARIABLES
let betaArray = []; // Array to store beta angle values
let gammaArray = []; // Array to store gamma angle values
let betaAverage; // beta angle value averaged from betaArray
let gammaAverage; // gamma angle value averaged from gammaArray
let userHeight; // Height of camera from the ground, estimated to be the user's own height
let topAngle; // Beta angle of the top of the object
let baseAngle; // Beta angle of the base of the object

/*
    reloadOrientationValues()

    This function produces the device's orientation
    in the beta and gamma directions. It does this by
    taking the four numbers in the array corresponding
    to the property quaternion in the object deviceAbsolute
    as parameters for calculating the device's orientation
    in the beta and gamma directions. These values are
    pushed into betaArray and gammaArray and once the arrays
    reach a predetermined length, the function smoothing() is
    run, then the arrays are emptied.
    
    argument: deviceAbsolute: this is the object that
        has the property quaternion. corresponding to this
        property, is an array that contains four numbers
        which act as parameters to the device's orientation
        in the alpha, beta and gamma direction.
        
    postconditions:
        once calculated, beta and gamma angles are pushed into
        betaArray and gammaArray respectively. When the arrays
        reach a predetermined length, a function smoothing() is
        run, then the arrays are emptied
*/
function reloadOrientationValues(deviceAbsolute)
{
    let x = deviceAbsolute.quaternion[0];
    let y = deviceAbsolute.quaternion[1];
    let z = deviceAbsolute.quaternion[2];
    let w = deviceAbsolute.quaternion[3];

    let beta = Math.atan2(2*(w*x + y*z), 1 - 2*(Math.pow(x,2)+Math.pow(y,2)));
    let gamma = Math.asin(2*(w*y - x*z));

    betaArray.push(beta);
    gammaArray.push(gamma);

    if ( betaArray.length == 10 )
    {
        betaAverage = smoothing(betaArray);
        gammaAverage = smoothing(gammaArray);
        
        document.getElementById("bValue").innerHTML = (betaAverage*(180/Math.PI)).toFixed(2) + "&deg;";
        
        betaArray = [];
        gammaArray = [];
    }
}

/*
    smoothing()
    
    argument: anArray: this represents the array in which the
        average value of its elements is to be determined
        
    preconditions:
        array must only contain number-type elements
    
    returns:
        the average of elements in the array
*/
function smoothing(anArray)
{
    let sum = 0;

    for ( let i in anArray )
    {
        sum += anArray[i];
    }

    return sum/anArray.length;
}

/*
    cameraHeight() 
    
    postconditions:
        a value will be stored into the global variable
        userHeight, depending on the user input;
        the said value will be displayed to the HTML;
        if global variables baseAngle, topAngle and userHeight
        are defined, the calculate button will be enabled
*/
function cameraHeight()
{
    userHeight = prompt("Please enter your camera height in metres.");

    while( isNaN(Number(userHeight)) || userHeight <= 0 )
    {
        if( userHeight == null || userHeight == "" )
        {
            // In the case where the input field was left
            // empty, a default height is set.
            userHeight = 1.6;
            alert("A default height of 1.6m has been set.")
        }
        else
        {
            // In the case where the input is a negative number
            // or not a number, the user will be alerted and
            // prompted again.
            alert("Invalid input! Camera height should be a positive number.");
            userHeight = prompt("Please enter your camera height in metres.");
        }
    }

    document.getElementById("heightOfCamera").innerHTML = userHeight + " m";
    if( baseAngle != undefined && topAngle != undefined && userHeight != undefined )
    {
        document.getElementById("calculateButton").disabled = false;
    }
    else
    {
        document.getElementById("calculateButton").disabled = true;
    }
}

/*
    measureTopAngle()
    
    preconditions:
        device must be in the appropriate orientation as
        specified in the if block of the first tier of
        if-else statements;
        
    postconditions:
        global variable topAngle will be defined and the 
        current value of betaAverage will be printed into
        the HTML. If baseAngle was defined prior to running 
        this function, betaAverage is checked for validity
        beforehand        
*/
function measureApexAngle()
{
    if ( gammaAverage >= -Math.PI/6 && gammaAverage <= Math.PI/6 && betaAverage >= 0 && betaAverage <= Math.PI )
    {

        if ( baseAngle != undefined && baseAngle > betaAverage )
        {
            alert("Top angle must be greater than base angle!");
            topAngle = undefined;
            document.getElementById("topAngle").innerHTML = "";
        }
        else
        {
            topAngle = betaAverage;
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

/*
    measureBaseAngle()
    
    preconditions:
        device must be in the appropriate orientation as
        specified in the if block of the first tier of
        if-else statements;
        
    postconditions:
        global variable baseAngle will be defined and the 
        current value of betaAverage will be printed into
        the HTML. If topAngle was defined prior to running 
        this function, betaAverage is checked for validity
        beforehand        
*/
function measureBaseAngle()
{
    if( gammaAverage >= -Math.PI/6 && gammaAverage <= Math.PI/6 && betaAverage >= 0 && betaAverage <= Math.PI/2 )
    {

        if( topAngle != undefined && topAngle < betaAverage )
        {
            alert("Base angle must be smaller than top angle!");
            baseAngle = undefined;
            document.getElementById("baseAngle").innerHTML = "";
        }
        else
        {
            baseAngle = betaAverage;
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

 /*
    calculate()
    
    preconditions:
        global variables baseAngle, topAngle and userHeight
        must be defined
        
    postconditions:
        calculated distance and height are printed to the HTML
*/
function calculate()
{
    let distance = Number(userHeight) * Math.tan(baseAngle);
    document.getElementById("distanceOfObject").innerHTML = distance.toFixed(2) + " m";

    let height = Number(userHeight) + distance * Math.tan(topAngle - Math.PI/2);
    document.getElementById("heightOfObject").innerHTML = height.toFixed(2) + " m";
}
