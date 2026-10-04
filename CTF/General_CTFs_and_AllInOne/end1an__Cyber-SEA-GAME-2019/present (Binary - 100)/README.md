# present (Binary: 100)
  
The challenge file can be downloaded here.  

After extracting the ZIP file, we got the EXE file named `present.exe`.  
Execute the file, only text `Oops...` returned.  
*[Image: oops]*
  
By checking the EXE file with `PEiD`, we found that it was packed with UPX which can be easily unpacked as follows:  
*[Image: PDiD]*
  
*[Image: unpacked]*  
The file after unpacking is `present-unpack.exe`.  
Next step is load the unpacked file to IDA, and search for the string `Oops`.  
*[Image: ida]*  
  
There is the condition `jz short loc_4014E7` before printing `Oops`, so we change the opcode `jz` to `jnz`,
  
Try to run the EXE file again, and got the Base64 string.  
`ZmxhZ3tURVNUX0VBU1lfSVNfREVCVUdHRVJfUFJFU0VOVCEhfQ==`
*[Image: flag]*

The flag is flag{TEST_EASY_IS_DEBUGGER_PRESENT!!}
