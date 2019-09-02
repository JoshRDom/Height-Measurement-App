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
let betaArray = [];  // Array to store beta angle values
let gammaArray = []; // Array to store gamma angle values
let betaAverage;     // Beta angle, averaged from betaArray, in radians
let gammaAverage;    // Gamma angle, averaged from gammaArray, in radians
let userHeight;      // Height of camera from the ground, estimated to be the user's own height
let topAngle;        // Beta angle of the top of the object, in radians
let baseAngle;       // Beta angle of the base of the object, in radians

/*
    smoothing()

    This function computes the average of elements in an array
    by performing summation using a for loop and then dividing
    the sum by the array length

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
    buttonCheck()
    
    This function checks if global variables baseAngle, topAngle
    and userHeight are defined. If they are, the calculate button
    of the HTML will be enabled.
    
    postconditions:
        if baseAngle, topAngle and userHeight are defined, the
        calculate button will be enabled. If any of these global
        variables become undefined, prior to calling this
        function, the calculate button is once again disabled
*/
function buttonCheck()
{
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
    cameraHeight()

    This function obtains a value for global variable
    userHeight from the user, and prints this value to the
    HTML. It does this by prompting the user for their height.
    Should the input be invalid (negative number or not a
    number), the user will be prompted again. If the field was
    left empty, however, a default height of 1.6 m is set
    instead.

    postconditions:
        a value will be stored into the global variable
        userHeight, depending on the user input;
        the said value will be displayed to the HTML;
        the function buttonCheck() is run to determine if
        the calculate button may be enabled
*/
function cameraHeight()
{
    userHeight = prompt("Please enter your camera height in metres.");

    while( isNaN(Number(userHeight)) || userHeight <= 0 )
    {
        if( userHeight == null || userHeight == "" )
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

    document.getElementById("heightOfCamera").innerHTML = userHeight + " m";
    buttonCheck()
}

/*
    measureTopAngle()

    This function obtains a value for global variable
    topAngle from global variable betaAverage, and prints this
    value to the HTML. It will check if the current
    betaAverage value is valid (beta between 0 and PI, and
    larger that baseAngle if defined) and sane (gamma 
    between -PI/6 and PI/6) first before allowing the
    current betaAverage value to be saved into topAngle.

    preconditions:
        device must be in the appropriate orientation as
        specified in the if block of the first tier of
        if-else statements;

    postconditions:
        global variable topAngle will be defined and the 
        current value of betaAverage will be printed into
        the HTML. If baseAngle was defined prior to running 
        this function, betaAverage is checked for validity
        beforehand;
        the function buttonCheck() is run to determine if
        the calculate button may be enable        
*/
function measureTopAngle()
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

        buttonCheck()
    }
    else
    {
        alert("Device orientation is invalid!");
    }
}

/*
    measureBaseAngle()

    This function obtains a value for global variable
    baseAngle from global variable betaAverage, and prints this
    value to the HTML. It will check if the current
    betaAverage value is valid (beta between 0 and PI/2, and
    smaller that topAngle if defined) and sane (gamma 
    between -PI/6 and PI/6) first before allowing the
    current betaAverage value to be saved into baseAngle.

    preconditions:
        device must be in the appropriate orientation as
        specified in the if block of the first tier of
        if-else statements;

    postconditions:
        global variable baseAngle will be defined and the 
        current value of betaAverage will be printed into
        the HTML. If topAngle was defined prior to running 
        this function, betaAverage is checked for validity
        beforehand;
        the function buttonCheck() is run to determine if
        the calculate button may be enable        
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

        buttonCheck();

    }
    else
    {
        alert("Device orientation is invalid!");
    }
}

/*
    calculate()

    This function calculates the distance to the object
    and the height of the object using the values of
    baseAngle, topAngle and userHeight and some simple
    trigonometry, then prints the calculated values to their
    respective elements in the HTML.

    preconditions:
        global variables baseAngle, topAngle and userHeight
        must be defined so that the calculate button which
        calls this function may be enabled

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