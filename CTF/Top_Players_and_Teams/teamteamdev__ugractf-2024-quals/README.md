# Ugra CTF Quals 2024

10-11 февраля 2024 | [Сайт](https://2024.ugractf.ru) | [Результаты](SCOREBOARD.md)

## Таски

[🚀 Blazingly fast 🚀](tasks/awolfinunix/) (purplesyringa, ctb 300)  
[GGWP](tasks/ggwp/) (purplesyringa, stegano 100)  
[Golden Gate](tasks/goldengate/) (purplesyringa, ctb 100)  
[Google Dyslexia](tasks/googledyslexia/) (purplesyringa, misc 50)  
[IF](tasks/if/) (enhydra, recon 200)  
[Входящее письмо](tasks/inbox/) (nsychev, misc 50)  
[Во тьме](tasks/inthedark/) (purplesyringa, admin 200)  
[Всё это как-то подозрительно](tasks/lookingsus/) (enhydra, recon 200)  
[Посланник](tasks/notezic/) (enhydra, crypto 150)  
[Раз, два, взяли](tasks/onetwograb/) (enhydra, misc 100)  
[Pedersen](tasks/pedersen/) (deffrian, crypto 300)  
[Несложная](tasks/peterparker/) (purplesyringa, ppc 100)  
[Сложная](tasks/peterparker2/) (purplesyringa, ppc 150)  
[На старой железяке…](tasks/pinique/) (ksixty, ppc 150)  
[Будильник](tasks/pupupu/) (purplesyringa, web 350)  
[Ешь богатых!](tasks/securityisamyth/) (purplesyringa, crypto 350)  
[If a tree falls in a forest](tasks/thescenicroute/) (purplesyringa, ppc 400)  
[Прямо с веточки](tasks/treemen/) (udn_t, forensics 200)  
[Раскодируй](tasks/urldecode/) (rozetkinrobot, pwn 200)  
[Уж](tasks/uzh/) (abbradar, misc 50)  
[Уж 2](tasks/uzh2/) (abbradar, reverse 200)  
[Файловая система](tasks/vfs/) (purplesyringa, pwn 400)  
[Калитка](tasks/wicketgate/) (baksist, web 100)  
[Языковой барьер](tasks/worldwide/) (baksist, web 150)

## Команда разработки

Олимпиада была подготовлена командой [team Team].

[Никита Сычев](https://github.com/nsychev): руководитель команды, разработчик тасков и системы регистрации  
[Калан Абе](https://github.com/kalan): разработчик тасков  
[Коля Амиантов](https://github.com/abbradar): разработчик тасков, инженер по надёжности  
[Ваня Клименко](https://github.com/ksixty): разработчик тасков и сайта, дизайнер  
[Никита Мещеряков](https://github.com/deffrian): разработчик тасков  
[Даниил Новоселов](https://github.com/gudn): разработчик тасков  
[Матвей Сердюков](https://github.com/baksist): разработчик тасков  
[Алиса Сиренева](https://github.com/purplesyringa): разработчик тасков и платформы  
[Евгений Черевацкий](https://github.com/rozetkinrobot): разработчик тасков

## Организаторы

Организаторы Ugra CTF: Югорский НИИ информационных технологий, Департамент информационных технологий и цифрового развития ХМАО: Югры, Департамент образования и науки ХМАО: Югры и команда [team Team].

## Генерация заданий

Некоторые таски создаются динамически: у каждого участника своя, уникальная версия задания. В таких заданиях вам необходимо запустить генератор. Путь к нему доступен в конфигурации таска: YAML-файле: в параметре `generator`.

Генератор запускается из директории задания и принимает три аргумента: уникальный идентификатор участника, директорию для сохранения файлов для участника и названия генерируемых тасков. Например, так:

```bash
../_scripts/kyzylborda-lib-generator 12345 attachments uzh,uzh2
```

Уникальный идентификатор используется для инициализации генератора псевдослучайных чисел, если такой используется. Благодаря этому, повторные запуски генератора выдают одну и ту же версию задания.

Генератор выведет на стандартный поток вывода JSON-объект, содержащий флаг к заданию и информацию для участника, а в директории `attachments` появятся вложения, если они есть.

## Лицензия

Материалы соревнования можно использовать для тренировок, сборов и других личных целей, но запрещено использовать на своих соревнованиях. Подробнее: [в лицензии](LICENSE).
