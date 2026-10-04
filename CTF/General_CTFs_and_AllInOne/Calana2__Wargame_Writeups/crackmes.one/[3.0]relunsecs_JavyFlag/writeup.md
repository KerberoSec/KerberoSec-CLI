Aquí la documentación para saber como cargar este módulo en NodeJs:
- https://nodejs.org/learn/getting-started/nodejs-with-webassembly
- https://nodejs.org/api/wasi.html?ref=del.igh.tf#wasi_webassembly_system_interf

```js
const fs = require('node:fs');
const { WASI } = require('node:wasi');

const wasi = new WASI({
  version: 'preview1',
});
const wasmBuffer = fs.readFileSync('flag.wasm');
var wasmModule = new WebAssembly.Module(wasmBuffer);
var wasmInstance = new WebAssembly.Instance(wasmModule, wasi.getImportObject());

wasmInstance.exports._start()
fs.writeFile('memory.dump', new Uint8Array(Buffer.from(wasmInstance.exports.memory.buffer)) , ()=>{});
```

Llamar a `_start` para inicializar la memoria y luego volcarla revela la flag en UTF-16:
```
 nodejs dump.js &&  xxd memory.dump| grep -v "0000 0000 0000 0000 0000 0000 0000 0000"  | grep 154fd0 -A 3
(node:141195) ExperimentalWarning: WASI is an experimental feature and might change at any time
(Use `nodejs --trace-warnings ...` to show where the warning was created)
00154fd0: 5b02 0000 08ec 0229 be52 be45 be4c be55  [......).R.E.L.U
00154fe0: be4e be53 be45 be43 be7b be6a be33 be76  .N.S.E.C.{.j.3.v
00154ff0: be79 be5f be31 be73 be5f be34 be77 be33  .y._.1.s._.4.w.3
00155000: be73 be30 be6d be33 be7d 2619 00e3 062f  .s.0.m.3.}&..../
```

`RELUNSEC{j3vy_1s_4w3s0m3}`

