# Culinary Circles

## Challenge info

- **Name:** Culinary Circles
- **Event:** GPN CTF
- **Category:** Miscellaneous / OSINT / Geometry
- **Author:** Alkalem
- **Flag format:** `GPNCTF{.*}`

The challenge provides an archive containing nine restaurant screenshots.

The flavor text keeps referring to social circles, culinary circles, and rare intersections. That wording is very literal. The nine restaurant locations can be divided into three groups, each group defines a circle on the globe, and all three circles meet near one restaurant.

The challenge also explicitly says to use OpenStreetMap as the source of truth for location names.

## First look

Extracting `culinary-circles.tar.gz` gives nine PNG files:

```text
adam.png
alice.png
alkalem.png
beatrice.png
bob.png
bruno.png
carol.png
catherine.png
cristoph.png
```

Each image shows a restaurant or food-related location.

Some are straightforward map cards or Street View screenshots. Others are deliberately cropped or framed in a way that makes identification harder.

There is no obvious metadata or hidden file structure to exploit. The first part of the challenge is simply geolocating all nine screenshots.

## Geolocating the restaurants

I used the usual geo-OSINT methods:

- reverse image search
- Google Lens
- visible signs and branding
- road markings
- architecture
- driving side
- local businesses
- marina and street layouts

The nine locations were:

| Person | Restaurant | Location | Latitude | Longitude |
|---|---|---|---:|---:|
| **Alkalem** | Kippe 23 | Karlsruhe, Germany | 49.00748 | 8.41930 |
| **Adam** | Hofu | Køge, Denmark | 55.45690 | 12.17853 |
| **Alice** | The Peppermill | Nenagh, Ireland | 52.86181 | -8.19826 |
| **Beatrice** | BCHEF Burgers | Dijon, France | 47.32267 | 5.03815 |
| **Bob** | Pastéis de Belém | Lisbon, Portugal | 38.69755 | -9.20324 |
| **Bruno** | Mairie Restaurant & Events | Berkel en Rodenrijs, Netherlands | 51.99574 | 4.47555 |
| **Carol** | Skeppsbro Bakery | Stockholm, Sweden | 59.32471 | 18.07612 |
| **Catherine** | High-street unit | Armadale / Livingston area, UK | 55.89847 | -3.70242 |
| **Cristoph** | Café Marina | Sønderborg, Denmark | 54.89936 | 9.79558 |

A few of these needed more work than the others.

### Bob

The screenshot was cropped in a way that hid most of the recognizable branding.

Reverse image search on the remaining facade still matched it to:

```text
Pastéis de Belém
```

in Lisbon.

### Bruno

This image showed a Dutch-looking waterfront area with construction equipment nearby.

The first guesses based on the general appearance were misleading. Following the road layout and checking the actual map pin eventually led to:

```text
Mairie Restaurant & Events
```

in Berkel en Rodenrijs.

This was a good reminder to trust the map evidence more than the overall visual impression.

### Catherine

The large satellite image was mostly a distraction.

The useful clue was the small Street View thumbnail in the corner. It showed:

- a red-brick high street
- cars driving on the left
- double yellow lines
- a typical UK streetscape

The mouse cursor was also placed over the relevant area, which helped narrow the location considerably.

### Cristoph

The image showed a marina restaurant with an Albani-branded parasol.

Albani is a Danish brewery, which pointed toward Denmark. The marina signage and waterfront layout then matched:

```text
Café Marina
```

in Sønderborg.

## The grouping trick

Once all nine locations were identified, the filenames became important.

Grouping them by first letter gives three sets of three:

```text
A:
Alkalem
Adam
Alice
```

```text
B:
Beatrice
Bob
Bruno
```

```text
C:
Carol
Catherine
Cristoph
```

Three points uniquely define a circle.

So each group of three restaurant locations defines one circumcircle:

- Circle A through the three A locations
- Circle B through the three B locations
- Circle C through the three C locations

The phrase about culinary circles intersecting was telling us exactly what to do.

This also rules out a few tempting wrong approaches. The points are not meant to be paired for trilateration, and the distances between alphabetically related names are not the important part.

The structure is simply:

```text
three triplets -> three circles -> shared intersection
```

## Why flat geometry is not enough

These locations are spread across a large part of Europe.

Treating latitude and longitude as ordinary Cartesian coordinates and drawing flat circles gives inaccurate results. At this scale, the curvature of the Earth matters.

The correct model is a spherical circumcircle.

Each latitude and longitude pair can be converted into a unit vector:

```python
def to_xyz(lat, lon):
    lat = math.radians(lat)
    lon = math.radians(lon)

    return (
        math.cos(lat) * math.cos(lon),
        math.cos(lat) * math.sin(lon),
        math.sin(lat),
    )
```

For three points represented by unit vectors `v1`, `v2`, and `v3`, the plane through them has a normal vector:

```text
n = normalize((v2 - v1) × (v3 - v1))
```

That normal is the pole of the spherical circle.

The angular radius is:

```text
r = arccos(n · v1)
```

Every point `X` on that spherical circle satisfies:

```text
n · X = cos(r)
```

## Solving for the shared intersection

Each of the three circles gives one plane equation:

```text
nA · X = cos(rA)
nB · X = cos(rB)
nC · X = cos(rC)
```

These can be written as a linear system:

```text
M X = b
```

where the rows of `M` are the three circle normals.

Solving the system gives a 3D point `X0`. If the circles truly share one point on Earth, the length of `X0` should be very close to 1.

The calculated circles were approximately:

```text
Circle A
Pole: 53.683, 2.006
Radius: 6.15 degrees

Circle B
Pole: 48.123, -8.945
Radius: 9.43 degrees

Circle C
Pole: 61.252, 4.679
Radius: 6.90 degrees
```

The linear solve produced:

```text
||X0|| = 0.999973
```

That is extremely close to 1, confirming that the three circles were intentionally constructed to meet on the sphere.

The shared intersection was approximately:

```text
57.4356, -6.5975
```

That lands on the Isle of Skye in Scotland.

<img width="1143" height="734" alt="image" src="https://github.com/user-attachments/assets/42544bee-ec41-4257-ae42-d3accc67df07" />

## Finding the restaurant

Because the original geolocation coordinates came from screenshots and map pins, the circle intersection was not perfectly exact.

Small differences between Google pin centers and OpenStreetMap venue coordinates produced a small cluster rather than one mathematically perfect point.

The challenge specifically said to use OpenStreetMap as the source of truth, so I checked the area around the intersection there.

The restaurant at the intended location was:

```text
The Three Chimneys
```

Its OpenStreetMap location is approximately:

```text
57.443422, -6.641956
```

That matches the intersection closely enough given the precision of the nine source coordinates.

The closing phrase `Takeout order` also fits nicely, since the final restaurant is in a fairly remote part of the Isle of Skye.

## Solver

```python
import math
import numpy as np

def to_xyz(lat, lon):
    lat = math.radians(lat)
    lon = math.radians(lon)

    return (
        math.cos(lat) * math.cos(lon),
        math.cos(lat) * math.sin(lon),
        math.sin(lat),
    )

def to_ll(vector):
    x, y, z = vector

    return (
        math.degrees(math.asin(z)),
        math.degrees(math.atan2(y, x)),
    )

def subtract(a, b):
    return (
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    )

def cross(a, b):
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )

def dot(a, b):
    return (
        a[0] * b[0]
        + a[1] * b[1]
        + a[2] * b[2]
    )

def normalize(vector):
    magnitude = math.sqrt(dot(vector, vector))

    return (
        vector[0] / magnitude,
        vector[1] / magnitude,
        vector[2] / magnitude,
    )

def spherical_circle(point1, point2, point3):
    v1 = to_xyz(*point1)
    v2 = to_xyz(*point2)
    v3 = to_xyz(*point3)

    normal = normalize(
        cross(
            subtract(v2, v1),
            subtract(v3, v1),
        )
    )

    if dot(normal, v1) < 0:
        normal = (
            -normal[0],
            -normal[1],
            -normal[2],
        )

    radius = math.acos(
        max(-1, min(1, dot(normal, v1)))
    )

    return normal, radius

groups = {
    "A": [
        (49.00748, 8.41930),
        (55.45690, 12.17853),
        (52.86181, -8.19826),
    ],
    "B": [
        (47.32267, 5.03815),
        (38.69755, -9.20324),
        (51.99574, 4.47555),
    ],
    "C": [
        (59.32471, 18.07612),
        (55.89847, -3.70242),
        (54.89936, 9.79558),
    ],
}

poles = []
cosines = []

for name, points in groups.items():
    normal, radius = spherical_circle(*points)

    poles.append(normal)
    cosines.append(math.cos(radius))

    pole_lat, pole_lon = to_ll(normal)

    print(
        f"Circle {name}: "
        f"pole={pole_lat:.3f},{pole_lon:.3f} "
        f"radius={math.degrees(radius):.3f}"
    )

x0 = np.linalg.solve(
    np.array(poles),
    np.array(cosines),
)

point = x0 / np.linalg.norm(x0)
latitude, longitude = to_ll(tuple(point))

print(f"||X0|| = {np.linalg.norm(x0):.6f}")
print(f"Intersection = {latitude:.6f}, {longitude:.6f}")
```

Running it gives an intersection on the Isle of Skye, close to The Three Chimneys.

## Flag

```text
GPNCTF{The Three Chimneys}
```

## Final thoughts

This was a really nice OSINT challenge where the geolocation work was only the first half.

The filenames provided the structure, the flavor text explained the geometry, and the OpenStreetMap note told us how to resolve the final location into a restaurant name.

The main lessons were:

- geolocate all nine images before trying to force a pattern
- group the locations by filename prefix
- use spherical geometry rather than flat latitude and longitude
- treat OpenStreetMap as the final authority for the restaurant name
- expect small coordinate errors when working from screenshots and map pins

Once the three triplets were recognized as circumcircles, the challenge title and description made perfect sense.
