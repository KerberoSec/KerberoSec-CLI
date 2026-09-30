# ctfhookup
> Not the CTF dating app you had hoped for.

Script to Generate "Custom" ICS files and Notice about upcomming ctf Events through webhooks.

## WHY?
Reasons being mostly lazy.

## INSTALL
### pipenv
```bash
pipenv install
```

### i don't know what pipenv is.
> https://www.youtube.com/watch?v=GBQAKldqgZs

```bash
pip install -r requirements
```

## USAGE
```bash
cp example.env .env
```

```bash
usage: main.py [-h] [--calendar] [--location LOCATION] [--webhook] [--days DAYS]

CTFtime Ical and Webhooks

optional arguments:
  -h, --help           show this help message and exit
  --calendar           Generates ical file for all upcomming ctf evetns
  --location LOCATION  where do you want calendar to apeear
  --webhook            enables webhook mode, and will start pushing events that are upcomming.
  --days DAYS          how many days should it notice about ctf
```

## ctftime.datapor.no
You can import the calendar directly from https://ctftime.datapor.no.
It looks like this in the Google Calendar.
![](https://i.imgur.com/nlGuMW4.jpg)

## CONTRIBUTIONS
Want to help out?

Poke me on discord: skandix#1269

