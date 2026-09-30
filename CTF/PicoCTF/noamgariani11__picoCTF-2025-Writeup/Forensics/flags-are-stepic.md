# Description

A group of underground hackers might be using this legit site to communicate. 
Use your forensic techniques to uncover their message
Try it here!

# Solution

Once you start the instance you can go to `http://standard-pizzas.picoctf.net:56409/` and if you scroll through the "Country Flags" you will come across "Upanzi, Republic The" and see the image saying Upanzi Network which is obviously not a country flag. Upanzi Network is a part of CyLab-Africa.

You can also use curl, wget, or just look through the source to see the list of countries in html. For instance `curl http://standard-pizzas.picoctf.net:56409/ > index.html`

This is the line of interest:

`{ name: "Upanzi, Republic The",img: "flags/upz.png", style:"width: 120px!important; height: 90px!important;" },`

You can see it has upz.png which could be looked into and downloaded with the following command: `wget http://standard-pizzas.picoctf.net:56409/flags/upz.png`

If you need you can set up a virtual environment with python with the following commands: `python3 -m venv venv` and then `source venv/bin/activate`.

Once that is done you can install the stepic package with pip: `pip install stepic`

Lastly, run it with the decode flag. Another method could be using apt install to get the package: `sudo apt install stepic`

The use this command to get the flag: `stepic -i upz.png -d`

Flag: `picoCTF{fl4g_h45_fl4ga66...}`