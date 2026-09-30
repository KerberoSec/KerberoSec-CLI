# Questions
We click on the first TCP packet and we Follow the TCP stream
There is some good information about the CPU like:  
"IM151-8 PN/DP CPU"   
"Original Siemens Equipment"  
"6ES7151-8AB01-0AB0"  
"C6TW74882012"  
(Also check the bottom setting of the window to "Show Data As: Hex Dump")

### 1. Identificați care este versiunea de Firmware a PLC-ului (unității Logice- CPU) (Points: 400)
### 3.2.6
We can look in the capture and see the word Bootloader and a V right before it that stands for Version and right after it we can see the hex bytes: 03 02 06 

### 2. Care este versiunea Firmware-lui PLC-ului (unității Logice- CPU) ce o recomanda Compania producătoare la zi? (Points: 375)
### 3.2.18

If we google the name of the CPU we find the [manufaturer's website](https://support.industry.siemens.com/cs/document/47353723/firmware-updates-for-im151-8-pn-dp-cpu-(6es7151-8ab01-0ab0)?dti=0&lc=en-BY) where we search for the latest patch which is 3.2.18 (at the time of writing this).

### 3. Care este numărul Slotului unde este poziționata unitatea CPU al PLC-ului identificat in captura data de trafic? (Points: 375)
### 2
At the top of the packet after the boot we see the slot number.