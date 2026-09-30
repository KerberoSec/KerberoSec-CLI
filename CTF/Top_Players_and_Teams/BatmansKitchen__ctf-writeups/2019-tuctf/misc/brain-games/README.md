> Time to go back to the basics... you remember those, right?

Solved by Vanilla

This challenge was more “annoying” than difficult.  It has three stages, asking about base conversion, bitwise operations, and virus history.  All must be solved within a time limit that makes manually solving them impractical.  It would be easy to automate if everything were presented in a “nice”, easy to parse, text-based format.  But it’s not.  Instead, it’s some curses user interface, with text cut off everywhere, over the wire having tons of escape sequences, and other junk that nobody really wants to deal with.

I started by trying to implement an interpreter for the VT-100 escape sequences myself, but this ended up not working for some reason or another.  At some point, Dan mentioned tmux… This ended up being a really great suggestion, since tmux already interprets all these escape sequences, and you can request pane captures through the command line.  I ended up taking this approach.

That handles the escape sequences bit, but it still has cut-off text everywhere.  I handled this through a few steps:
Crop to the known-relevant area, so you don’t have some massive ASCII art face on the side you have to deal with
Remove all non-alphanumeric characters, so you end up with all the letters smashed together
Strip off any line drawing characters that crept in on the edges (“lqx”, etc)
At this point we have a relatively clean input, but it’s still missing characters from time to time, so for example you get “Otal”, “Hexadeimal” (missing characters) etc., and it’s not consistent; to handle this last part, I know the expected set of choices, and I know the input is almost one of them, so I use a (modified to use insertions and deletions only, not substitutions) Levenshtein distance to figure out which possibility is closest to what we got

So it’s kind of nasty, but it solves it:

#!/usr/bin/env python3
import subprocess
import argparse
import time
import re

def levenshtein(a, b):
    """
    >>> levenshtein("hello", "hello")
    0
    >>> levenshtein("Hello", "hello")
    2
    >>> levenshtein("Helo", "hello")
    3
    """

    chex = {}

    def go(alen, blen):
        if alen == 0:
            return blen
        if blen == 0:
            return alen
        if (alen, blen) not in chex:
            if a[alen: 1] == b[blen: 1]:
                res = go(alen: 1, blen: 1)
            else:
                res = min(1 + go(alen: 1, blen), 1 + go(alen, blen: 1))
            chex[alen, blen] = res
        return chex[alen, blen]

    return go(len(a), len(b))

def closest(text, possibilities):
    return min(possibilities, key=lambda p: levenshtein(text, p))

class Tmux:
    def __init__(self):
        pass

    def send_command(self, *args):
        return subprocess.check_output(["tmux"] + list(args))

    def new_session(self, command):
        self.send_command("new-session", "-d", command)

    def capture_pane(self):
        return self.send_command("capture-pane", "-p")

    def send_keys(self, keys):
        return self.send_command("send-keys", keys)

    def capture_relevant_area(self):
        pane = self.capture_pane()
        return b"\n".join(line[41:] for line in pane.split(b"\n")).decode()

BASE_NAMES = {"Decimal": 10, "Hexadecimal": 16, "Octal": 8, "Binary": 2}
TO_BASES = {
    10: str,
    16: lambda x: format(x, "x"),
    8: lambda x: "0" + format(x, "o"),
    2: lambda x: format(x, "b"),
}
DELAY = 0.3

VIRUS_ANSWERS = {
    "FirstwormtospreadovertheInternetandthefirstwellknownusefbufferoverflows": "Morris Worm",
    "Thebestknownoftheearlymcrovirusesmassmaileditselfandcauedest80millionindamages": "Melissa Virus",
    "FirstknownvirustoeraseflshROMBIOSdataactivatesonApril26": "CIH Virus",
    "MassmailerviruswithaVBSciptattachmentconsideredoneofthemstdamagingwormsever": "ILOVEYOU Worm",
    "ExploitedWindowsservicestospreadoveranetworkin2003DDoSedWndowsUpdate": "Blaster Worm",
    "ExploitedWindowsLSASSspredoverinterconnectednetworksRemovedMyDoomandBaglein2004": "Sasser Worm",
    "BridgedanairgaptostealthakedownIraniannucleardevelopmentin010": "Stuxnet",
    "Atrojanwhichmarkedthestatoftheransomwareerain2013": "CryptoLocker",
    "AbotnetwhichspreadoverthInternetofThingstocommitlargescaeDDoSattacksfrom2016onward": "Mirai",
    "RansomwarewhichutilizedleaedNSAexploitsthatlaunchedaglobalttackonWindowscomputers": "WannaCry",
    "Thismaliciouscommandfrom174eatssystemresourcesuntilacrashccurs": "Forkbomb",
    "NonmaliciousDOSvirusthatnfectsfileswhenpresentinmemoryPaloadforcesallonscreencharacterstofalldown": "Cascade",
    "Thisvirusin2003exploitedbufferoverflowinMicrosoftSQLServeandtooklessthan10minutestoreach90ofvulnerablecomputersworldwide": "Slammer Worm",
    "Anearlybotnetwhichdidnonitialdamageotherthanblockantiviruupdatesin20082009": "Conficker",
    "AMSDOSviruswhichwhenruinfectseveryDOSexecutableinthecrrentdirectoryPlaysatunethatlastapproximately149": "Techno",
    "SpywarebestknownforitspupleapemascotThesoftwareisalsoclssifiedasadwareandwassuedtwice": "BonziBUDDY",
    "OneoftheonlyknownvirusesfortheSolarisoperatingsystemdevelpedin1998": "Solar Sunrise",
    "Arogueantivirusprogramwhihsimulatesamalwareinfectionaftersveralweeksrunningunactivated": "Navashield",
    "OneofthefirseknownvirusespreadthroughtheARPANETInfectedystemsdisplaythemessageIMTHECREEERCATCHMEIFYOUCAN": "Creeper",
    "ThefirstnematodecreatedtfightinfectionsofCreeper": "Reaper",
}

def main(args=None):
    parser = argparse.ArgumentParser(allow_abbrev=False)
    parser.add_argument("host")
    parser.add_argument("port", type=int)
    args = parser.parse_args(args)

    tmux = Tmux()
    tmux.new_session("nc {} {}".format(args.host, args.port))
    time.sleep(DELAY)
    #print(tmux.capture_relevant_area())

    if True:
        tmux.send_keys("1\n")
        time.sleep(DELAY)
        #while True:
        for i in range(20):
            area = tmux.capture_relevant_area()
            #print(area)
            area = re.sub("[^A-Za-z0-9]", "", area)
            area = area.strip("lqx")
            print(area)
            if "WelcometoBrainGames" in area:
                break
            match = re.search(
                "Whatis([0-9a-f]*)([HexadDecimalOctalBinary]*)in([HexadDecimalOctalBinary]*)",
                area,
            )
            if match:
                value = match.group(1)
                from_base = BASE_NAMES[closest(match.group(2), BASE_NAMES.keys())]
                to_base = BASE_NAMES[closest(match.group(3), BASE_NAMES.keys())]
                value = int(value, from_base)
                answer = TO_BASES[to_base](value)
                print("My answer:", answer)
                tmux.send_keys(answer + "\n")
                time.sleep(DELAY)
            else:
                raise AssertionError("No match")

    if True:
        tmux.send_keys("2\n")
        time.sleep(DELAY)
        #while True:
        for i in range(20):
            area = tmux.capture_relevant_area()
            #print(area)
            area = re.sub("[^A-Za-z0-9]", "", area)
            area = area.strip("lqx")
            print(area)
            if "WelcometoBrainGames" in area:
                break
            match = re.search(
                r"Whatis(\d+)(AND|OR|XOR)(\d+)",
                area,
            )
            if match:
                value1 = int(match.group(1))
                value2 = int(match.group(3))
                if match.group(2) == "AND":
                    answer = value1 & value2
                elif match.group(2) == "OR":
                    answer = value1 | value2
                elif match.group(2) == "XOR":
                    answer = value1 ^ value2
                else:
                    raise AssertionError("Unhandled")
                print("My answer:", answer)
                tmux.send_keys("{}\n".format(answer))
                time.sleep(DELAY)
            else:
                raise AssertionError("No match")

    if True:
        tmux.send_keys("3\n")
        time.sleep(DELAY)
        #while True:
        for i in range(20):
            area = tmux.capture_relevant_area()
            #print(area)
            area = re.sub("[^A-Za-z0-9]", "", area)
            area = area.strip("lqx")
            print(area)
            if "WelcometoBrainGames" in area:
                break
            best_key = closest(area, VIRUS_ANSWERS.keys())
            if levenshtein(area[:len(best_key)], best_key) <= 20:
                answer = VIRUS_ANSWERS[best_key]
                print("My answer:", answer)
            else:
                raise AssertionError("Unknown question")
            tmux.send_keys("{}\n".format(answer))
            time.sleep(DELAY)

    print(tmux.capture_pane().decode())

    tmux.send_keys("C-c")
    time.sleep(DELAY)

if __name__ == "__main__":
    main()

Flag: TUCTF{7H3_M0R3_Y0U_KN0W_G1F}  (actually, the last underscore was missing, just like characters in “octal” etc were missing: I had to guess that there was an underscore there)

