## Some Assembly Required 1

[Link to challenge](https://play.picoctf.org/practice/challenge/152)

Write-up:

1. The website has an input box and a Submit button. Submit any random text returns Incorrect.

2. Analyzing the source code shows us that a JavaScript file exists, and its code is definitely obfuscated (obfuscated-script.js).
After some analyzing, we can see that this code has a decoder function:

    ```javascript
    const _0x4e0e = function(_0x553839, _0x53c021) {
        _0x553839 = _0x553839 - 0x1d6; // - 470
        let _0x402c6f = _0x402c[_0x553839];
        return _0x402c6f;
    };
    ```

    This function has two parameters, even if the second one isn't used: common obfuscation technique. Basically, it receives an input and subtracts 0x1d6 (470) from it. It then uses this value to get an item from a string list and returns it.
    
3. Next, we see an array shuffling function:

    ```javascript
    (function(_0x76dd13, _0x3dfcae) {
        const _0x371ac6 = _0x4e0e;
        while (!![]) {
            try {
                const _0x478583 = -parseInt(_0x371ac6(0x1eb)) + parseInt(_0x371ac6(0x1ed)) + 
                                -parseInt(_0x371ac6(0x1db)) * -parseInt(_0x371ac6(0x1d9)) + 
                                -parseInt(_0x371ac6(0x1e2)) * -parseInt(_0x371ac6(0x1e3)) + 
                                -parseInt(_0x371ac6(0x1de)) * parseInt(_0x371ac6(0x1e0)) + 
                                parseInt(_0x371ac6(0x1d8)) * parseInt(_0x371ac6(0x1ea)) + 
                                -parseInt(_0x371ac6(0x1e5));
                
                if (_0x478583 === _0x3dfcae) {
                    break;
                } else {
                    _0x76dd13['push'](_0x76dd13['shift']());
                }
            } catch (_0x41d31a) {
                _0x76dd13['push'](_0x76dd13['shift']());
            }
        }
    })(_0x402c, 0x994c3);
    ```

    This function is shuffling the array to make calculations harder. By running this function in a separate file (simulate-shuffle.js), we can see what the shuffled list looks like:

    ```javascript
    AFTER shuffle: [
    'instance',       'copy_char',
    '43591XxcWUl',    '504454llVtzW',
    'arrayBuffer',    '2NIQmVj',
    'result',         'value',
    '2wfTpTR',        'instantiate',
    '275341bEPcme',   'innerHTML',
    '1195047NznhZg',  '1qfevql',
    'input',          '1699808QuoWhA',
    'Correct!',       'check_flag',
    'Incorrect!',     './JIFxzHyW8W',
    '23SMpAuA',       '802698XOMSrr',
    'charCodeAt',     '474547vVoGDO',
    'getElementById'
    ]
    ```

4. Analyzing the async function, we can see the decoder function being assigned to a different hex value for obfuscation purposes.
Also, there are multiple assignments meant to confuse us. After some calculation, we get:

    ```javascript
    (async () => {
        const _0x48c3be = _0x4e0e; // -470
        let _0x5f0229 = await fetch(_0x48c3be(0x1e9)); // fetch('./JIFxzHyW8W') WebAssembly module
        let _0x1d99e9 = await WebAssembly[_0x48c3be(0x1df)](await _0x5f0229[_0x48c3be(0x1da)]()); // WebAssembly.instantiate(arrayBuffer)
        let _0x1f8628 = _0x1d99e9[_0x48c3be(0x1d6)]; // WebAssembly.instantiate(arrayBuffer).instance
        exports = _0x1f8628['exports']; // WebAssembly.instantiate(arrayBuffer).instance.exports
    })();
    ```

    We can access ./JIFxzHyW8W to download it: analyzing it shows us the flag: **picoCTF{d88090e679c48f3945fcaa6a7d6d70c5}**

## Personal Notes & Improvements

**Alternative/Better Solutions:**
This probably isn't the best solution: spent too much time manually deobfuscating the JavaScript, make it more readable next time.
