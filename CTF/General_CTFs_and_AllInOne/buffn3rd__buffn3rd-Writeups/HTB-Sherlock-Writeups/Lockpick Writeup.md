# **Lockpick Writeup**
![image](https://github.com/user-attachments/assets/7a951cda-b8f2-46eb-8dfb-02e3a26ed6c9)

Forela needs your help! A whole portion of our UNIX servers have been hit witCreath what we think is ransomware. We are refusing to pay the attackers and need you to find a way to recover the files provided. Warning This is a warning that this Sherlock includes software that is going to interact with your computer and files. This software has been intentionally included for educational purposes and is NOT intended to be executed or used otherwise. Always handle such files in isolated, controlled, and secure environments. Once the Sherlock zip has been unzipped, you will find a DANGER.txt file. Please read this to proceed.

**Tools:**
  - FlareVM
  - Ghidra
  - HashmyFiles
  - VSCode

**Learned:**
  - Analysis of malicious binaries
  - Static Malware Analysis
  - Using decryption scripts

### **Question 1**
Please confirm the encryption key string utilised for the encryption of the files provided?

Initial analysis we are given a zip folder and unzipping the contents we are given a file named ‘bescrypt.zip’. Inside of the zipped folder is a folder full of files appeared to be encrypted with a ‘24bes’ extension.

![image](https://github.com/user-attachments/assets/3823a017-58d5-4bca-8f9c-0d8e36977491)

Looking at the files with the type ‘file’ I was able to figure the compiler that was used using DIE (Detect it Easy) on the ‘bescrypt3.2’. This is important as it helps us in understanding the characteristics of the file and its associated binaries. To better help I am going to use Ghidra to look at the contents of this file to see if we can locate the encryption key. Opening this inside of Ghidra I was able to recover the encryption key. Let me walk through how I got there…

![image](https://github.com/user-attachments/assets/8586ab58-6803-4220-b065-9b1173cde921)

I began under the symbol tree at the top and worked my way down until I got to main… reading through I was looking where a function or module for encryption was being called. Finally, I stumbled across this process directory where it calls the ‘forela-criticaldata’. Doing research I learned this is a encryption process and it had the key which was common from what I saw with my reading.

Answer: bhUlIshutrea98liOp

### **Question 2**
We have recently recieved an email from [wbevansn1@cocolog-nifty.com](wbevansn1@cocolog-nifty.com) demanding to know the first and last name we have him registered as. They believe they made a mistake in the application process. Please confirm the first and last name of this applicant.

Alright… since at this point I knew the encryption key I can reverse this using a decryption key. I took this to AI to write this and it wrote me a decryption key.

import OS
def decrypt_file(encrypted_file):
key = “bhUlIshutrea98liOp” # The provided encryption key try:
# Open the encrypted file in binary read mode
with open(encrypted_file, ‘rb’) as f:
file_data = f.read()

# Decrypt the file data using XOR with the key
key_length = len(key)
decrypted_data = bytearray()
for i in range(len(file_data)):
decrypted_data.append(file_data[i] ^ ord(key[i % key_length]))

# Create the original file name by removing the .24bes extension
original_file = encrypted_file[:-6] # Remove the last 6 characters (.24bes)

# Write the decrypted data back to the original file
with open(original_file, ‘wb’) as f:
f.write(decrypted_data)

# Delete the encrypted file and the note file
os.remove(encrypted_file)
note_file = f”{encrypted_file}_note.txt”
if os.path.exists(note_file):
os.remove(note_file)

print(f”Decryption successful. Original file restored: {original_file}”) except Exception as e:
print(f”An error occurred: {e}”)if __name__ == “__main__”:
import sys
if len(sys.argv) != 2:
print(f”Usage: {sys.argv[0]} <encrypted_file>”)
else:
decrypt_file(sys.argv[1])
Perfect the script is working! Thank you ChatGPT. I am going to work on decrypting all the files then opening them up to find the answers!

![image](https://github.com/user-attachments/assets/f4b3855e-cfa8-4ae6-978e-310a2332d7f3)

In the ‘forela_uk_applicants.sql’, searching for the email we got I found the user.

![image](https://github.com/user-attachments/assets/d0d7379e-2e75-445f-85fe-a248e0f88409)

Answer: Walden Bevans

### **Question 3**
What is the MAC address and serial number of the laptop assigned to Hart Manifould?

In the it_assets.xml, searching for Harts name I found the associated mac address

![image](https://github.com/user-attachments/assets/a19b6616-7cc2-4be6-a8ae-7b3785d2fbae)

Answer: E8-16-DF-E7-52: 48, 1316262

### **Question 4**
What is the email address of the attacker?

From what I read online the file, ‘complaints.csv..24bes_note.txt’ is the note and it has a contact in there.

Answer: bes24@protonmail.com

### **Question 5**
City of London Police have suspiciouns of some insider trading taking part within our trading organisation. Please confirm the email address of the person with the highest profit percentage in a single trade alongside the profit percentage.

In the ‘trading-firebase_bkup.json’ I was able to find the email address but when I opened it and formatted the document… I was overwhelmed. So, I thought if I can create a script to parse through all this data to extract the individual with the highest profit percentage and I was able to get one from AI… shoutout to ChatGPT

import json
import argparse
from decimal import Decimal
def find_highest_profit(json_file):
try:
# Read the JSON file
with open(json_file, ‘r’) as f:
data = json.load(f, parse_float=Decimal) # Check if data is a dictionary
if not isinstance(data, dict):
print(“The JSON file should contain a dictionary of records.”)
return # Find the record with the highest profit_percentage
highest_profit_key = max(data, key=lambda k: data[k].get(‘profit_percentage’, Decimal(‘-inf’)))
highest_profit_record = data[highest_profit_key] # Print the record with the highest profit percentage
print(“Record with the highest profit percentage:”)
print(json.dumps(highest_profit_record, indent=4, default=str)) except FileNotFoundError:
print(f”The file {json_file} does not exist.”)
except json.JSONDecodeError:
print(f”The file {json_file} is not a valid JSON file.”)
except Exception as e:
print(f”An error occurred: {e}”)if __name__ == “__main__”:
parser = argparse.ArgumentParser(description=’Find the record with the highest profit percentage in a JSON file.’)
parser.add_argument(‘json_file’, help=’Path to the JSON file’)

args = parser.parse_args()
Found the person

![image](https://github.com/user-attachments/assets/64120c3a-5ac2-49c5-8e1b-b760013a2a44)

Answer: fmosedale17a@bizjournals.com, 142303.1996053929628411706675436

### **Question 6**
Our E-Discovery team would like to confirm the IP address detailed in the Sales Forecast log for a user who is suspected of sharing their account with a colleague. Please confirm the IP address for Karylin O’Hederscoll.

In the sales_forecast.xlsx you can find this answer just by simply searching for Karylin name

![image](https://github.com/user-attachments/assets/76ebe758-a255-48e8-85e7-cfe17ac50669)

Answer: 8.254.104.208

### **Question 7**
Which of the following file extensions is not targeted by the malware? `.txt, .sql,.ppt, .pdf, .docx, .xlsx, .csv, .json, .xml`

According to this article.

It encrypts these files except for ppt

![image](https://github.com/user-attachments/assets/ebf8989c-c1f1-4d16-9237-abf6ccc8ee1b)

Answer: .ppt

### **Question 8**
We need to confirm the integrity of the files once decrypted. Please confirm the MD5 hash of the applicants DB.

Using HashmyFiles I will find this

![image](https://github.com/user-attachments/assets/6e5e70d8-ac91-4e53-b18d-948a19f12524)

Answer: f3894af4f1ffa42b3a379dddba384405

### **Question 9**
We need to confirm the integrity of the files once decrypted. Please confirm the MD5 hash of the trading backup.

![image](https://github.com/user-attachments/assets/8633d451-ea76-4296-b65f-c74cdc374344)

Answer: 87baa3a12068c471c3320b7f41235669

### **Question 10**
We need to confirm the integrity of the files once decrypted. Please confirm the MD5 hash of the complaints file.

![image](https://github.com/user-attachments/assets/66f07606-17a8-4e88-8dff-caf8b9580154)

Answer: c3f05980d9bd945446f8a21bafdbf4e7

This was a fun challenge and got super easy once you were able to get a script to decrypt it!
