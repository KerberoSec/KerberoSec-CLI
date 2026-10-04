# 🚀 Blazingly fast 🚀: Write-up

В предупреждении компилятора видим путь к файлу `playground.rs`. Его можно спокойно прочитать и вывести, например так:

```rust
use std::fs;

fn run(flag: &UnsafeCell<String>) {
    println!("{}", fs::read_to_string("playground.rs").unwrap());
}
```

Результат:

```rust
#![forbid(unsafe_code)]
use std::cell::UnsafeCell;

fn main() {
    let flag = std::fs::read_to_string("flag").unwrap();
    std::fs::File::create("flag").unwrap();
    run(&UnsafeCell::new(flag));
}
use std::fs;

fn run(flag: &UnsafeCell<String>) {
    println!("{}", fs::read_to_string("playground.rs").unwrap());
}
```

По-видимому, к засылаемому файлу приписывается преамбула, считывающая флаг в переменную, затирающая его пустым файлом и передающая в функцию `run`. Документация по [`UnsafeCell`](https://doc.rust-lang.org/std/cell/struct.UnsafeCell.html) подсказывает, что достать из этого объекта значение без `unsafe` никак нельзя. Первая строка: `#![forbid(unsafe_code)]`: запрещает использование `unsafe`, так что этот метод не подходит. Более того, Rust действительно старается быть безопасным языком, и использование этого аттрибута запрещает в том числе опции, влияющие на линковку, так что добиться того, что наш код запустится перед `main`, невозможно. Никаких крейтов, кроме `std`, в песочнице нет, так что воспользоваться чужой абстракцией тоже не получится.

Придется обходить гарантии безопасности языка. Есть сложный вариант: воспользоваться какой-нибудь мисоптимизацией компилятора. Это, вероятно, возможно, но мы этот вариант обойдем в силу наличия более простого решения. Воспользуемся тем, что Rust не может отслеживать, что происходит вне его области ответственности.

Например, мы можем запустить подпроцесс с программой на Python и из нее сделать любые небезопасные действия с Rust-процессом. Как можно прочитать память процесса? Например, через `ptrace` API или, что еще проще, `/proc/pid/mem`. Собственно, этот же файл можно прочитать и из самого Rust, что мы и сделаем:

```rust
use std::fs;
use std::os::unix::fs::FileExt;

fn run(flag: &UnsafeCell<String>) {
    let mem = fs::File::open("/proc/self/mem").unwrap();
    let mut buf = [0; 100];
    mem.read_at(&mut buf, flag.get() as u64).unwrap();
    println!("{buf:?}");
}
```

```
[41, 0, 0, 0, 0, 0, 0, 0, 160, 139, 30, 243, 95, 85, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0, 160, 139, 30, 243, 95, 85, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 212, 46, 190, 242, 95, 85, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 3, 179, 188, 242, 95, 85, 0, 0, 128, 71, 210, 63, 188, 127, 0, 0, 230, 168, 188, 242, 95, 85, 0, 0, 128, 71, 210, 63]
```

Это явно не ASCII. Что пошло не так?

Мы вывели байты объекта типа [`String`](https://doc.rust-lang.org/std/string/struct.String.html). Раздел документации [Representation](https://doc.rust-lang.org/std/string/struct.String.html#representation) говорит, что такой объект содержит указатель, длину строки и размер буффера: прямо как `std::string` в C++. По-видимому, первые 8 байт: то ли длина, то ли размер буффера, потом идет указатель, потом опять то же самое число. Воспользуемся этим и произведем разыменование еще раз:

```rust
use std::fs;
use std::os::unix::fs::FileExt;

fn read_usize<T>(mem: &fs::File, address: *const T) -> usize {
    let mut buf = [0; 8];
    mem.read_at(&mut buf, address as usize as u64).unwrap();
    usize::from_ne_bytes(buf)
}

fn run(flag: &UnsafeCell<String>) {
    let mem = fs::File::open("/proc/self/mem").unwrap();
    let base = read_usize(&mem, (flag.get() as *const u8).wrapping_add(8));
    let length = read_usize(&mem, flag.get());
    let mut flag = vec![0; length];
    mem.read_at(&mut flag, base as u64).unwrap();
    let flag = String::from_utf8(flag).unwrap();
    println!("{flag}");
}
```

Отметим, что порядок полей `Vec` не стандартизирован, поэтому в других конфигурациях он может отличаться. В этом случае нужно поправить оффсеты.

Наконец, если вы плохо знаете Rust и не смогли въехать, можно было собрать программу на C и запустить подпроцесс, либо воспользоваться Python или shell.

Флаг: **ugra_I_unsound_is_nauseating_2p7otpru7t3l**

# Postmortem

Достаточно поздно в ходе соревнования обнаружилось, что комбинация следующих фактов порождает некоторое недоразумение:

1. Флаг кладется в контейнер как volume при его старте
2. Контейнер запускает при старте `rustc playground.rs` и собранный бинарный файл подряд
3. Преамбула удаляет флаг при запуске, а до этого он существует
4. `include_str!`

Таким образом, было достаточно следующего решения:

```rust
fn run(_flag: &UnsafeCell<String>) {
    println!("{}", include_str!("flag"));
}
```

По-хорошему нужно было добавлять файл `flag` только после сборки. Будем знать.
