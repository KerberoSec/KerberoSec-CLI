# Tools #
## File analysis ##
- ### ".doc"-Analysis ### : 
    - #### OLETOOLS ####
      located in "~/…/lib/python3.11/site-packages/oletools"
      ##### Usage #####
      python3 oleid.py [FILEPATH]
      ##### Description #####
      Gives an overview over indicators which are embedded in a ".doc"-file.
      Other scripts in the "oletools" (e.g. oleobj.py) can be used for further analysis.

## Memory Image Analysis ##
- #### VOLATILITY ####
  ##### Usage #####
  vol [options]
  e.g. vol -f [filepath_to_image.raw] [plugin_name]
  Cheatsheet can be found [here](https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet).
  
## Static Executable Analysis ##
- #### FLOSS #####
  FLOSS is a tool developed by mandiant. It can extract strings (even obfuscated/base64/...) from a ".exe"-file and can therefore help identifying malware.
  ##### Usage #####
  Execute the "floss.exe" using PowerShell:
  ```
  floss.exe [Path_to_.exe_file] |Out-file [Path_to_output.txt_file]
  ```
  Further information on FLOSS can be found [here](https://github.com/mandiant/flare-floss).

## Log Analysis ##
- #### JQ: JSON Filtering ####
  JQ is a lightweight command line tool to filter through json files to get only desired events/entries.
  ##### Usage #####
  Execute JQ in Kali using the terminal:
  ```
  jq [FILTER] file_to_filter.json
  ```
  Further information on JQ can be found [here](https://jqlang.github.io/jq/manual/)
