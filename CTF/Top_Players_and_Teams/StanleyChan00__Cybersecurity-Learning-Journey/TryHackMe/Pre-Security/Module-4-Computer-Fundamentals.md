# TryHackMe Pre Security: Module 4: Computer Fundamentals
## Inside a Computer System

**Motherboard:** This is what connects all components together and allows them to communicate. Everything plugs into or connects through the motherboard.

**Central Processing Unit(CPU):** The "brain" of the computer which performs all the calculations and executes all the instructions

**Random Access Memory(RAM):** This is the "short term memory" of the computer which allows for us to get fast access to the data within. It's temporary and volatile as the content within disappears when power is gone.

**Storage(SSD/HDD: Solid State Drive/Hard Disk Drive):** This is the storage for long term data. SSD is fast but more expensive and has no moving parts(safer). HDD is cheaper but has moving parts and is thus prone to failure. 

**Power Supply(PSU):** Powers the entire device

**Graphics Card(GPU: Graphic Processing Unit):** Proceesses and outputs visual data to monitors/displays

**Input/Output(I/O)** devices: Keyboards, flashdrives, monitors, etc.

It looks like this on the motherboard:

<img width="1164" height="764" alt="Motherboard" src="https://github.com/user-attachments/assets/fa111a6f-fa8f-441c-861f-7d2ef450a5c9" />

### What Happens When You Press the Start Button

Here's all the steps our computer goes through when we first power on the device and before it's operating system boots up:

<img width="796" height="95" alt="Start Button" src="https://github.com/user-attachments/assets/62910035-19a6-4685-a9d0-3fed103a3ce2" />

1) The power button sends a signal to the PSU to begin powering up the whole system. Now, electricity starts flowing through the device.
2) This is where the firmware, which gets all the components in our device to start up, gets booted up. The main firmware currently used is "Unified Extensible Firmware Interface"(UEFI). UEFI has mostly replaced "BIOS", which was used in the past.
3) "Power On Self Test"(POST) is one of the routines UEFI uses to ensure everything is present and functioning correctly
4) This is where UEFI looks for where the bootloader program(Explained in the next step) is stored on the device. The UEFI has a priority list(the "boot order") which it looks through sequentially to find them.
5) The UEFI executes a small "bootloader" program stored on the device, which knows where the Operating System is and takes that OS and copies it onto the RAM. At this point, the OS now takes full control over the computer

## Computer Types

* **Laptops:** Portable computers with battery
* **Desktop:** Stationary computer that's typically stronger and can use the extra space for bigger and better components
* **Workstation:** High performance "desktop" meant for professional work 
* **Server:** Usually no monitors but serve to handle network requests and hosting 
* **Smartphone:** Our mobile "computers" that fit in our pocket
* **Tablet:** Larger screen "smartphone" 
* **IoT devices:** Devices connected to networks with a single purpose like thermostats, smart doorbells, fitness tracking watches, etc
* **Embedded Computers:** "Computers" built into another device like a coffee maker controller, automatic door sensor, lamp dimmer chips, etc

The difference between IoT and Embedded Computers is mainly that IoT devices are connected to networks. 

## Client-Server Basics
This lesson gives an overview of the previous Module 3: "How websites work", which I covered all in depth.

However here, it gives us a nice analogy of ordering pizza as a visual in how interacting with a web server works:

<img width="1109" height="749" alt="Visual" src="https://github.com/user-attachments/assets/bfbca077-c47f-48c0-93de-dec4c8906e59" />

In essence:

1) Alice wants to order Pizza and sends Bob to the Pizza shop.
2) Bob uses the "DNS" to find the "Address"("IP address") of the shop.
3) He chooses which "port" to enter through if he wants to get takeout, delivery, etc.
4) When ordering the pizza at the register, him and the cashier use a "protocol" which is how they communicate
5) Bob "requests" and the "server" responds back and Bob brings the pizza back to Alice.

In technical terms, Alice is the client. She uses her web browser to connect to a web server. In order to do so, she uses the DNS to find the IP address of the website she wants to access along with the corresponding port. 

She communicates with the web server using the HTTP protocol, by making an HTTP request and the server responding with their HTTP response. Then Alice's browser converts the code/data sent from the server into the visual readable data: ie. the website. 

### HTTP Commands

In addition to the commands explored in Module 3, this lesson gives us a few more examples:

* Patch: Partially Modifies a resource (like updating an email address without changin anything else like their name/password)
* Head: Just a `GET` request, except it only asks for the headers and not the body. It only asks for the metadata.
* Options: Asks the server what HTTP commands are allowed on that server
* Connect: Sets up a secure connection between the two devices without any intermediates that can see it. For example, when connecting to a web server while I'm at school using the school wifi, we can use this command to create a proxy connection which prevents the school from seeing our data sent through the website server.
* Trace: Kind of like a diagnostic test. It sends a request to the server, in which the server echoes it back in the exact same way so we can see if anything between them altered the request

(Quick note. Most web servers disable the `TRACE` request method due an attack called "Cross-Site Tracking(XST) which could force the browser to "echo" back hidden secure session cookies or more.)

This lesson allowed us to use their virtual machine to see these commands in real time. It looks like this:

<img width="1219" height="912" alt="Lab" src="https://github.com/user-attachments/assets/f0cbe7a0-801a-440c-b682-8c85ef89c1d6" />

All the GET request methods we sent as well as the headers are there. We could also see the response the server sent back as well as the response's body on a separate tab.

## Virtualisation Basics
Virtualisation is the concept of being able to run multiple operating systems("Virtual Machines") on a single physical device.

Without this concept, as it used to be in the past, organizations would have each major service be dedicated to a single isolated device. Each device would have it's own job. 

One device would run one website. One device would run one email service. One device would run a database, etc.

For obvious reasons, this is incredibly inefficient and is like one person living alone in a hotel with so many other rooms being free to use. 

**Virtualisation** fixes this problem by allowing a piece of hardware to be used to its fullest extent and run multiple operating systems on it's own singular device.

This is done through a layer of software called **"Hypervisor"** which splits up the hardware resources being run on a single device into different operating systems so that they all run independently, each thinking they have their own dedicated CPU, RAM, etc.

With this, one singular device can host 50 separate websites, run an email service, and more all at the same time. 

### Hypervisor

Two types of Hypervisors:

1) **Bare Metal Hypervisors:** Software that runs directly on top of the physical hardware with no conventional operating system under it like Windows or MacOS.
2) **Hosted Hypervisors:** This runs *on top* of an existing operating system. For instance, a MacOS machine that opens up a "window" of a virtual machine running a different OS. 

Practically, Bare Metal Hypervisors are more for hosting servers or data centers while Hosted Hypervisors are more for isolating systems and compartmented testing

### Containers 
With virtualisation, each virtual machine that we have must have its own copy of the OS it operates on which eats up a lot more storage, memory, and time to get booted up.

Containers solve this problem and allows isolated virtual environments without needing an entire copy of an OS to be run. The only caveat is that it requires the same OS as its host because it shares the same OS "kernal" as its host. 

So a Windows container can not run on a MacOS machine. But regardless, containers allow us to isolate "machines" without using so much storage and also be able to run it a lot quicker than a regular VM. 

**"Container Images"** are "read-only" templates used to create containers. The "blueprint" for containers. 

**Docker** is currently the software used most for Containers 

### Virtualisation Lab
In this lab, we used an application called "Virtualizon Manager" which allows us to see and manage all the virtual machines and Hosts that they are running on.

Our task was to find out what went wrong with the email service as everyone in the company suddenly stopped receiving emails.

We looked at all the VMs and noticed that the VM for the emails was down in error. So we restarted it and got it up and runnning again. We also created a new VM for the marketing department to host their website. 

We gave this VM 4 CPU cores, 8GB of Ram as well as 100GB of storage and got it running.

<img width="1084" height="803" alt="VM Monitoring" src="https://github.com/user-attachments/assets/fd829821-dfb8-4382-ad2c-a622578688ab" />

Lastly, we took a look at the curernt Hosts and noted potential problems and their status. "HV-PROD-02" is almost at full capacity while "HV-PROD-01" is able to handle much more. "HV-BACKUP-01" is also currently down and disconnected.

<img width="1094" height="819" alt="Hosts" src="https://github.com/user-attachments/assets/ec1725d2-3b95-4828-a4dc-98b90ad644f0" />

## Cloud Computing Fundamentals
Cloud is what allows us, anywhere all around the world, access to a vast amount of physical servers and data that's ready for use at a moment's notice.

We can access scalable servers that are ready on demand to create VMs for hosting. We can store files and data that's accessible whenever and wherever we are. Cloud is what makes stuff like watching a video on youtube or watching a show on Netflix possible. 

TryHackMe gave a nice visual in how Cloud came to be:

<img width="75%" height="75%" alt="Cloud Evolution" src="https://github.com/user-attachments/assets/d29e31cc-f432-4659-b28d-776d9f6851a2" />

### Types of Cloud

1) **Public:** These are the vast amount of servers that's available for public use. A company like Amazon AWS owns a vast amount of these physical devices and allows the public to "rent" space on it. 
2) **Private:** These are dedicated servers built for private use. For example, a bank buying a bunch of servers that they own and hosting their own "Cloud" for their own use
3) **Hybrid:** A mix of both public and private. For example, they may keep some stuff on private Cloud servers for confidential data while  using public Cloud services for the rest. 

#### Main Cloud Service Models:

* **Infrastructure as a Service(IaaS):** You essentially just "rent" the hardware and network while you get to customize everything else for yourself, like the OS, application, etc
* **Platform as a Service(PaaS):** The Cloud provider takes care of all the servers, hardware, and operating systems while you just build your application on top of it all. Like sending code for the Cloud provider to deploy and run without you having to worry about anything else. 
* **Software as a Service(SaaS):** All the software, code, etc is handled and finished. You pay to use their software over the cloud

TryHackMe provided this good visual on the 3 models:

<img width="75%" height="75%" alt="Cloud Service Models" src="https://github.com/user-attachments/assets/549c8f98-ed41-4574-a84c-ce85ef02ebac" />

### Cloud Lab
In this lab, we had access to an interface that's similar to AWS's platform.

It allowed us to create VMs, choose which region for these VMS to live in, as well manage the VMs and the power capacity we want them to have. The platform looked like this:

<img width="1191" height="919" alt="Cloud Lab" src="https://github.com/user-attachments/assets/85115cf4-e6b4-4a1d-9493-29704e7bd5e6" />

#### Terms:

**EC2(Virtual Computer/Server):** These are the virtual machines that the Cloud service provider(AWS) allows us to have, all with its own set of dedicated CPU, RAM, etc.

**Instance Type:** These types allow us to choose how powerful we want out VM to be. The bigger the instance, the more power and expensive it is. 

TryHackMe had us create 3 different VMs with different instance sizes and had us see the effects it had on our billing costs.
