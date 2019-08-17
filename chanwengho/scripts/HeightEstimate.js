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

        deviceAbsolute.start();
    // when sensor has a reading, call the function
    deviceAbsolute.addEventListener('reading', () => reloadOrientationValues(deviceAbsolute));

    //start the sensor

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
function reloadOrientationValues(deviceAbsolute)
{
  document.getElementById("xValue").value = deviceAbsolute.quaternion[0];

}
