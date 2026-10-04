## HV19.05 Santa Parcel Tracking

To handle the huge load of parcels Santa introduced this year a parcel tracking system. He didn't like the black and white barcode, so he invented a more solemn barcode. Unfortunately the common barcode readers can't read it anymore, it only works with the pimped models santa owns. Can you read the barcode

### Solution 

Scanning the barcode results in "Not the solution", so I assume the flag is stored into the colors. Manual analysis did not help, so I wrote a small C# program, which extracts all the colors from the image, piped them into a file (separated per channel) and took a closer look. As I know that the flag format for Hackvent is `HV19{}`, I started to look for the related ASCII codes (`72, 86, 49, 57`). Apparently, this sequence is present in the blue-channel of the barcode (from byte 13: 48). 
Finally, I adapted my program to extract the flag:

```C#
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace HV1905
{
    class Program
    {
        static void Main(string[] args)
        {
            var colors = new List<Color>();
            var image = new Bitmap(@"./157de28f-2190-4c6d-a1dc-02ce9e385b5c.png");

            for (var y = 0; y < image.Height; y++)
            {
                for (var x = 0; x < image.Width; x++)
                {
                    var color = image.GetPixel(x, y);
                    if (!colors.Contains(color))
                    {
                        colors.Add(color);
                    }
                }
            }

            var lines = colors.Select(c => {
                return (char)c.B;
            }).ToArray();

            var flag = new string(lines).Substring(13, 35);

            Console.WriteLine(flag);

            Console.ReadLine();
        }

    }
}
```

**Flag:** HV19{D1fficult_to_g3t_a_SPT_R3ader}

