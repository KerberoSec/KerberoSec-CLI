---
title: "Missing Person: OSINT, Solved in Under 3 Minutes"
room: "Missing Person"
platform: TryHackMe
url: https://tryhackme.com/room/missingperson
difficulty: Easy
date_solved: 2026-07-10
time_to_solve: "2m47s"
tags: [osint, exif, geolocation, image-analysis]
cves: []
flags: { osint: true }
flagship: true
order: 50
---

A pure OSINT rescue: *"My friend went on holiday in 2025 and I haven't heard from him since: help me track him down for the police report."* Given a zip of his shared photos, reconstruct where he was and when: start to all-8-answers in **2 minutes 47 seconds** (17:13:20 → 17:16:07).

## Method
No exploitation: retrieval. The whole box is *read the pixels + read the metadata*. Extract the photos and work two channels in parallel: what's **visible in frame** (signs, venues, branding) and what's **baked into EXIF** (timestamps, camera, occasionally GPS). There's no GPS here, so it's visual geolocation.

## Investigation
- **The circuit.** A prominent trackside sign identifies the venue: the **Pertamina Mandalika International Street Circuit** (Lombok, Indonesia), and the event's dates place him there in **October 2025**.
- **The venues.** Frame details pin the surrounding spots: a **Mexican restaurant** (*Cantina Mexicana*) and a beach bar (**Surfers Bar**, on Jl. Raya Kuta, Kuta, Lombok): each confirmed by matching the photo's signage against maps.
- **The timeline.** EXIF timestamps fix the photo-taking times, ordering his last known movements for the report.

## Findings
All 8 answers: commercial name of the circuit, event dates, the restaurant, the bar's address, photo times: were recovered from the images alone. Exact strings masked here per THM convention.

## The Lesson
OSINT is *retrieval-shaped*, which is why it's fast: you're not waiting on a scan or coaxing a shell, you're reading the actual evidence. The discipline is looking at the whole frame: a background sign geolocates a photo faster than any tool, and letting EXIF timestamps do the sequencing for free. And the framing matters: this wasn't a puzzle, it was a missing person. Mission-shaped work moves.

