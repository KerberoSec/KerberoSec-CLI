# HTB Mission Pinpossible
Here contains the MATLAB script for the CTF. The zip file is encrypted with the CTG flag. 

**CHALLENGE DESCRIPTION**

Our field agent cannot access the enemy base due to the password-protected internal gates, but observed that the password seemed to be partially displayed as it was typed into the security keypad. Thanks to an audacious mission, we were able to implant an embedded device into the wiring for the keypad's monitor, and intercepted some data. Your mission is to recover the password from the collected data.

## Hints
The given .logicdata file contains the I2C signal (SDA sand SCL) between arduino and the LCD display controller, PCF8574A. The file can be read by a software and the data can be exported for further process. To extract the password from the data, it is useful to understand the I2C protocol and the communication method used in the LCD display library.

**Useful resources**

The [data sheet of PCF8574F](https://www.nxp.com/docs/en/data-sheet/PCF8574_PCF8574A.pdf) contains the details about the I2C protocol. 
The source code of the [Arduino Library](https://github.com/mathertel/LiquidCrystal_PCF8574) for LCD display with I2C PCF8574 adapter.
