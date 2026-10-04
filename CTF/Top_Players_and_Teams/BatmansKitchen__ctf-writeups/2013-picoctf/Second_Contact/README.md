# Second Contact

* Problem:
  
  As you're bumming around the Kuiper Belt, you catch an incoming transmission from a distant source. They seem to be scanning the area, looking for something... Maybe you should try to find it first.

  This trace file is also available in cloudshark [here](http://www.cloudshark.org/captures/f0741cdfee53)

* Solution:
  
  THIS HINT IS REALLY USEFUL!!
  
  Look for packets going to and from a search engine, and the key is the name of the author of the thing they're looking for
  
  Sorting the packet by length, and viewing from the longest ones gives us bunch of text (This can be done in WireShark, I haven't figured out how to accomplish it in CloudShark). Right click and follow TCP stream, and we can see the author name

* Answer:

  Aleph One
