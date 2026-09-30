# Zoom :camera:

| Category | Difficulty |
|:--------:|:----------:|
| Misc     | Medium     |

## Challenge Description
Where in the world is the red dot?

Format: ictf{lat,long} rounded to three decimal places. example: ictf{12.345,-67.890}

## Attachment(s)
[beavertail.png](https://github.com/ImaginaryCTF/ImaginaryCTF-2025-Challenges/blob/38ac5e6f7017683f906bcb1d8eb811096ee95b95/Misc/zoom/dist/beavertail.png)

***

## Walkthrough
I always start these location finding challenges by using Google Lens (search by image) as a starting point. Use the search results to start narrowing down where the picture was taken.

I zoomed in on two specific parts of the image to help pinpoint where the red dot was: the logo on the plane wing and the bottom-right quadrant.

I made some big assumptions when looking for this location:
* The location must be in the country where this airline is based (the picture filename is another hint here :wink:)
* This must be a flight to/from a major hub airport of this airline

Searching the major hubs of this airline gave three results. I looked at the satellite view to see if either looked similar to the given picture. This search proved fruitless (so my initial assumption was proven to be incorrect).

I then searched to find a list of cities where this airline has domestic flights to and from, knowing I've already eliminated three airports from this list.

Instead of looking at 10+ airports individually, I pivoted and zoomed in on the bottom-right quadrant of the image using Google Lens: which gave a much better lead to follow. In the search results I stumbled upon a country club that looks exactly like the attached picture.

Now I head back to [Google Maps](https://www.google.com/maps) looking for the club. Doing this my first assumption was proven to be correct: this location is across the river from an airport. 

Place a pin in the same place as the red dot and round the coordinates to three decimal places. Be sure to follow the example flag syntax!

Challenge solved! :sunglasses:
