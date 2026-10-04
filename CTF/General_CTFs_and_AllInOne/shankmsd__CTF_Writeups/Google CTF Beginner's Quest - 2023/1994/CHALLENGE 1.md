## Challenge 🧩

It is 13:37 in the afternoon. A cup of coffee on your table is slowly getting cold. You are frantically clicking through various flight aggregators in a desperate attempt to find last remaining plane tickets from London Heathrow to Harry Reid International Airport in Las Vegas to get to DEFCON on time. Sadly, it seems to be too late. All the available tickets are gone. After a couple of minutes of pondering you finally decide that nothing can get between you and your desire to dive into the latest advances in the world of hacking. You suddenly remember that you still have your boarding pass from last year hidden somewhere in a drawer. Interesting: you wonder: how difficult would it be for you to just print yourself exactly the same boarding pass, but issued the following year?

HINT: I have heard something about BCBP. Could that be  of any use?

## Solution 🕵️‍♂️

Using previous challenge QR code we get details of boarding pass like Passenger Name, Booking Reference, Origin Airport, Destination Airport, Flight Operator, Flight Number, Date of Travel(In Julian) Seat Class,Seat Number and  Boarding Index.

```text
M1JOHN/DOE            ECTFXYZ LHRLASCTF815  210U001A0002 158>2181WK9210BCTF1906V3KQ3NA2D2A6661234567890                    20K FLAG{ALLONBOARD}
```

So we need to change the year of travel from 2019 to 2020 and day will remain same (210 day of year).
So `9210` will be `0210`

Updated boarding pass will be

```text
M1JOHN/DOE            ECTFXYZ LHRLASCTF815  210U001A0002 158>2181WK0210BCTF1906V3KQ3NA2D2A6661234567890 0CTF                    20K FLAG{ALLONBOARD}
```

Genrate QR Code using any tool and upload it to `qrcode-basic-dot-gctf-2023.uc.r.appspot.com`

`Tool Used: CyberChef`

### References

> `krebsonsecurity.com/2015/10/whats-in-a-boarding-pass-barcode-a-lot` </br>
> `iata.org/contentassets/1dccc9ed041b4f3bbdcf8ee8682e75c4/2021_03_02-bcbp-implementation-guide-version-7-.pdf`

## Flag 🚩

`FLAG{CATCHMEIFYOUCAN}`
