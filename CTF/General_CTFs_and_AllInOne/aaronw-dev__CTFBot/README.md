# CTF Bot
A very simple Discord bot to find new and upcoming CTF events, powered by CTFTime.

## Commands
### /ctfinfo | `eventid`
Find more information about a CTF event. Powered by web scraping.
*[Image: /ctfinfo command]*
### /upcoming
Get upcoming CTF events from CTFTime. Powered by web scraping.
*[Image: /ctfinfo command]*

### /ctfparticipants | `eventid`
Get a list of people participating in a CTF event. 

### /addctfchannels | `ctf_name` | `headers` | `announce`
Add a Discord category and channels for a CTF event. Various arguments are provided for channel setup. 

### /delctfchannels | `category`
Delete the Discord category and channels for a given event.