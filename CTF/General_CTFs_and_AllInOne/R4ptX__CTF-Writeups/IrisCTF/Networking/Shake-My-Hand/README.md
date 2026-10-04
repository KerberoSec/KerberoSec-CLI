# IrisCTF 2025: "Shake My Hand" Writeup & Walkthrough
This is an interactive Python writeup and walkthrough for the "Shake My Hand" 2025 Iris CTF challenge.

![Title Screen](https://github.com/AdmiralSYN-ACKbar/shakemyhand-walkthrough/blob/main/screenshots/titlepage.png?raw=true)

![Mission 1](https://github.com/AdmiralSYN-ACKbar/shakemyhand-walkthrough/blob/main/screenshots/mission1.png?raw=true)

## Features
- Step-by-step TCP handshake demonstration
- Real-time packet crafting and analysis with Scapy
- ASCII art interface

## Requirements
- Python 3.x
- Scapy library (pip install scapy)
- Windows/Linux compatible

## Install/run with PIP
1. Install with "pip install shakemyhand-walkthrough"
2. Enter "shakemyhand-walkthrough" at terminal.

## Manual install/run
Download shakemyhand-walkthrough.py, make sure you have scapy installed (pip install scapy) and run the file with "python ./shakemyhand-walkthrough.py"

## Additional Information

This program uses built-in Scapy modules and functions to craft and manipulate network packets:

- **`IP`**: Used to create and configure the IP headers of the packets.
- **`TCP`**: Used to create and configure the TCP headers of the packets.
- **`Raw`**: Used to add raw payload data to the packets.
- **`raw`**: Converts crafted packets into raw bytes for transmission.
- **`base64`**: Encodes raw bytes into a base64 string.

You can learn more about how this program utilizes Scapy to solve the challenge by refering to the following functions in the code:

- `create_syn`: Crafts a SYN packet to initiate the TCP handshake.
- `create_ack`: Creates an ACK packet to acknowledge the server's SYN-ACK.
- `create_response`: Sends a PSH+ACK packet with data.
- `decode_and_show`: Decodes a base64 packet and logs details about IP/TCP layers, sequence/ack numbers, flags, and payload.

See code comments for additional information on script functionality. 
