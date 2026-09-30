## `Flag command`

The first interface looks like this, where the prompt says us to play game. 

<img  alt="image" src="https://github.com/user-attachments/assets/9648553f-2bec-49b5-8e39-ba61c4a049f2" />

Let's play the game hehee..

<img alt="image" src="https://github.com/user-attachments/assets/3afae693-284c-4d8a-9dd1-f9f1393cccc4" />

The first thing I will look is the `source code`. 

I have looked over all the css files, if the flag is somewhere commended or not , and end up finding nothing..

<img alt="image" src="https://github.com/user-attachments/assets/5b038714-2696-432f-89ec-51ca9a3a03ea" />

But one interestig thing I have got is `fetchOptions` function under `main.js`, simply the function is used to fetch the data and convert it to `json` data, can we access it ?
```js
const fetchOptions = () => {
    fetch('/api/options')
        .then((data) => data.json())
        .then((res) => {
            availableOptions = res.allPossibleCommands;

        })
        .catch(() => {
            availableOptions = undefined;
        })
}
```

Yes, We can get the `json` output & here you can see a secret like `Blip-blop, in a pickle with a hiccup! Shmiggity-shmack`. Let's try to submit it in game : )

<img alt="image" src="https://github.com/user-attachments/assets/9f03682f-a775-43de-a8d5-f6d6931fea42" />

Yup here we got the flag. 

| <img  alt="image" src="https://github.com/user-attachments/assets/c8541d4c-6d68-4adf-a8b7-e16e8556b9ac" /> | <img  alt="image" src="https://github.com/user-attachments/assets/10870515-6308-4db7-b321-2616c01125b0" /> |
| --- | --- | 

