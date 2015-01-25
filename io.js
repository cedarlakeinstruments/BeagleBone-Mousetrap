var trap = require("bonescript");
// Fullscale voltage is 1.8V on analog read
var FULLSCALE = 1.8;

setupIo();

// Configure IO pins
function setupIo()
{
    trap.pinMode("P8_19", trap.INPUT);
	trap.pinMode("USR3", trap.OUTPUT);
}

// Read mousetrap state
exports.readTrap = function ()
{
   return trap.digitalRead("P8_19");
}

// Turn LED on or off
exports.setLed = function (on)
{
	if (on)
	{
		trap.digitalWrite("USR3", trap.HIGH);
	}
	else
	{
		trap.digitalWrite("USR3", trap.LOW);
	}
}

// Read an LM34 temp sensor and return degF
exports.readTemp = function()
{
   var volts = FULLSCALE * trap.analogRead("P9_36");
   // Convert to kelvin
   var k = volts/3300 / 0.000001;
   // Convert to Fahrenheit
   var f= (k - 273.15)*9/5+32;
   //console.log("V,k,F: " + volts,k,f);
   return f;
}

