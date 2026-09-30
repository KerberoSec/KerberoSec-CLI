# where_am_i (forensics)

# Instructions to Contestant

You've been able to get on a router and capture some traffic in an effort to map out the the corporate network.  Your intelligence team has told you that your target device has an IP address of 172.16.58.47 but no one knows that actual location of it.  Examine the network traffic and see if you can figure out the location of that device.

NOTE:  I screwed up and used the format ACSC{<flag>} when I put this together and didn't have time to recreate it all

#Solution Packet 10 contains an OSPF hello packet from 192.1.0.4 which contains a list of networks it is advertising.  While 172.16.58.47 is not contained in the list, it does show up as the router ID for the OSPF process.  Packet 740 contains a request to 192..1.0.4 for OID 1.3.6.1.2.1.1.6.0 which is the locator for the sysLocation variable.  In packet 741 we see the reply with the value.

#flag: ACSC{UnderTheMoon}
