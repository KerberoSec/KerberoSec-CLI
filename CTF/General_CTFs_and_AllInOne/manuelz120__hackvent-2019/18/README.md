## HV19.18 Dance with me

Santa had some fun and created todays present with a special dance. this is what he made up for you:

```
096CD446EBC8E04D2FDE299BE44F322863F7A37C18763554EEE4C99C3FAD15
```

Dance with him to recover the flag.

### Resources

`HV19-dance.zip`

### Solution

When we extract the zip file, we get an iOS binary (Mach-O universal binary with 3 architectures), but probably not an iOS app, because we are missing a lot of resources (e.g. plist files). Opening the file up in IDA confirms this assumption. The binary only consists of a few functions. When executed, it reads the flag (maximum 32 bytes) from stdin, and passes it to the `dance` function, which most likely does some sort of encryption. Afterwards, the ciphertext bytes are printed to stdout. Based on this observation, we can assume that the string we received with the challenge description (31 bytes) is probably our encrypted flag.

My next step was to pinpoint the cipher algorithm. The `dance_block` function quickly caught my attention, because it contains some suspicious constants (0x61707865, 0x3320646E, 0x79622D32, 0x6B206574). A quick google search reveals, that these constants are part of the [Salsa20](https://cr.yp.to/snuffle/security.pdf) cipher. 

Now we only need to find the key and iv. Most likely, these are passed along with the plaintext to the `dance` (encryption) function. This happens in 0x100007E2C. Apart from the user supplied input, this function takes two more parameters. One of them (probably the iv), is passed as an immediate value and looks like this: `0x11458fe7a8d032b1`. The other one (our key), is copied from the data section starting at `0x100007F50`.

With this information, I was able to create a small C# which decrypts the input and prints the flag:

```C#
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HV1918
{
    class Program
    {
        static void Main(string[] args)
        {
            var encrypted = StringToByteArray("096CD446EBC8E04D2FDE299BE44F322863F7A37C18763554EEE4C99C3FAD15");
            var salsa = new Salsa20();
            var iv = "11458fe7a8d032b1";
            var decryptor = salsa.CreateDecryptor(StringToByteArray("0320634661b63cafaa76c27eea00b59bfb2f7097214fd04cb257ac2904efee46"),
                StringToByteArray(iv));
            var output = new byte[encrypted.Length];
            decryptor.TransformBlock(encrypted, 0, encrypted.Length, output, 0);

            Console.WriteLine(Encoding.ASCII.GetString(output));

            Console.ReadLine();
        }

        public static byte[] StringToByteArray(string hex)
        {
            return Enumerable.Range(0, hex.Length)
                        .Where(x => x % 2 == 0)
                        .Select(x => Convert.ToByte(new string(hex.Substring(x, 2).ToArray()), 16))
                        .ToArray();
        }
    }
}

```

**Flag:** HV19{Danc1ng_Salsa_in_ass3mbly}