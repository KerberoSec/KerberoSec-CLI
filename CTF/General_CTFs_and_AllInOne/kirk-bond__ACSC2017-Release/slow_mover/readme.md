# slow_mover (network forensics)

# Instructions to Contestant
Your boss just handed you this pcap that one of your network sensors captured.  He's possative that there is something fishy going on here but has no clue what it is.

#  Setup  Just need a copy of the PCAP

# Solution:  An examination of the streams doesn't show any real difference between any of the packet sequences and there doesn't appear to be any data hidden in them.  A closer look reveals that the source ports look odd.  They are all right around 10,000 and source ports are actually reused in short order.  If you subtract 10,000 from each source port, you will find the decimal value of an ascii character

# Flag:  acsc2017{SneakySneakySneaky}
