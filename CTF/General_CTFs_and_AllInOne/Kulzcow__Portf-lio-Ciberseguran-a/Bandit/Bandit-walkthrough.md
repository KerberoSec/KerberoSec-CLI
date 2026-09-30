
___ 

# **INTRO**

>Esse é um walkthrough de como realizei os labs do Over the Wire. O Bandit Labs é o mais fácil de todos,
>servindo apenas como uma introdução ao Linux. Falarei como eu realizei esse lab, e explicando como cada
>função funciona.
>No setup dos labs, dá para utilizar qualquer terminal (Powershell, cmd, etc). Eu decidi usar o 
>terminal WSL, podendo rodar Linux dentro do Windows; dando uma experiência mais autêntica sobre comandos
>e shortcuts do OS. Utilizei o terminal do Ubuntu para esses labs.

___

## Level 0

O mais fácil de fazer. Mostra como realizar uma conexão ssh com o servidor do bandit, e abrir um arquivo.

Somente explicarei esse passo nesse nível, pois quase todos os outros terão o mesmo jeito de entrar na
próxima fase.
Executei o código:

```bash
ssh -p 2220 bandit0@bandit.labs.overthewire.org
```
o comando `ssh` em si serve para conectar em um computador remoto de maneira criptografada, o que a
maioria dos terminais conecta. `-p` é a port, geralmente você precisará da informação sobre ela, no
bandit, já é enviado. Se não, ele tenta conectar no port default do ssh (22), geralmente utilizado somente
fora desse lab. `bandit0@bandit.labs.overthewire.org` possui duas partes. `bandit0` é o usuário, que é 
separado por `@` e assim utilizando o IP ou o url, que sempre será `bandit.labs.overthewire.org`. O que 
vai mudar entre os níveis, é o login próprio, indo de 0 a 33.

Logo após, sempre terá uma senha. Todas as senhas estarão no arquivo `Bandit-passwords`, a fins de teste.
Essas senhas geralmente mudam conforme o tempo no Bandit Labs. Senhas não aparecem no terminal, para
a proteção do usuário. A senha do bandit0, é a mesma coisa que o login: `bandit0`.

Ao entrar nesse lab, a primeira coisa que faço é digitar:

```bash
ls
```
Esse código **lista todos os arquivos** que estão visíveis dentro do servidor. No caso, aparece o `readme`.

Abro ele utilizando:
```bash
cat readme
```
`cat` é um dos comandos que mais utilizarei, pois com ele que abro o arquivo, esse é o "clique duplo" do terminal.

E pronto! O arquivo abre uma mensagem de parabéns por completar o primeiro desafio, e me dá a senha para o próximo
nível: anoto a senha em algum lugar no meu pc, e saio. Para sair desse login no servidor, basta digitar `exit` ou `logout`.

___

## Level 1 -> 2

Dou `CTRL + V` na senha, e entro no servidor.

**Uma peculiaridade sobre os atalhos:**
>Geralmente, os atalhos do Linux se não configurados, são um pouco diferentes. Utiliza-se `CTRL + SHIFT + V`.

>Isso pode ser modificado nas configurações de terminal.

O Labs fala que há um arquivo chamado `-` que contém a senha, isso é uma pegadinha, e mostra como funcionam as peculiaridades dos terminais e servidores.

Seu primeiro instinto é fazer igual o readme, utilizando `cat -`

Ao invés disso, utilizei:
```bash
cat ./-
```
Terminais **não aceitam rodar arquivos com carácteres especiais**. Esses são reservados para comandos específicos, `-` geralmente é um prefixo para um argumento de comando, assim como o `-p` do port, ou um `mktemp -d` que você verá futuramente.

>Caso ficar preso ao ter digitado `-`, simplesmente aperte `CTRL + C`, é um atalho que é utilizado para sair da execução de funções.

___

## Level 2 -> 3

>Esse nível trata sobre **espaços no nome do arquivo**. É um truque bem simples, que será bastante utilizado.

Ao encontrar o arquivo, aparecerá `--spaces in this filename--`. O terminal (shell) não reconhece espaços como parte de um arquivo, e muitas pessoas tentam utilizar `_` para demonstrar espaços; é errado, pois `_` já é um caráctere em si, e diverge do nome do arquivo. Ao invés, utilizo `./" "`.

```bash
cat "./--spaces in this filename--"
```
E a senha aparecerá.

`" "` mostra para o shell que o arquivo está completamente entre essas duas aspas, ajudando ao programa a entender que espaços não significam itens diferentes.

**Por que o `./`?**

`./`aparecerá muito, pois representa o diretório (current directory) de uma pasta que você já está; com pastas dentro dela sendo definidas com `/`e o nome. `./` pode ser confundido diretamente com o `/`, mas não se engane: `./` é a pasta **atual**, e `/` é a pasta **raíz**, sendo ela a inicial.

___

## Level 3 -> 4

>O Bandit Camp avisa que a senha está em um arquivo escondido no diretório `inhere`.

Ao achar o arquivo, você tratará com o comando `cd`:

```bash
cd inhere
```
Como `inhere` está no mesmo diretório que você, não precisa utilizar `./`ainda. Ao entrar no diretório, se você utilizar `ls`, nada aparecerá, pois é um arquivo escondido.

Você pode utilizar dois tipos de comandos para encontrar o arquivo:

Utilizado para maneiras mas complexas, porém sem mostrar detalhes que o usuário básico ainda não entende, é o `find`, que faz exatamente o que o comando diz: encontrar; diferentemente do `ls`, ele mostra arquivos ocultos e normais: ocultos, geralmente utilizam `dotfile`, uma maneira de colocar `.` antes do nome do arquivo, para ocultá-lo.

Mais básico, porém mais complexo sobre a informação disponível em si, é o `ls -la`, que mostra de uma maneira mais detalhada todos os arquivos e diretórios do caminho que você está. Mostra as permissões, quem criou e quem pode **'rodar'** o arquivo. Vamos continuar com o `find`:

```bash
find
```

Nele, aparecerá um arquivo, chamado `...Hiding-From-You`. Para abrir esse arquivo, você tem que tomar em conta a capitalização.

Em shells, todos os arquivos criados são **case-sensitive**, ou seja, qualquer capitalização conta no arquivo ou diretório. Se você não escrever ou colar o nome do arquivo **exatamente como está**, ele não abrirá, pois o shell não reconhece.

```bash
cat ./...Hiding-From-You
```
Se você tentar rodar `cd` nele por pensar que `./` é um prefixo de diretório, aparecerá essa mensagem:
```bash
-bash: cd: ./...Hiding-From-You: Not a directory
```
Identificando então ele como arquivo. Abra ele, e copie a senha.

___

## Level 4 -> 5

>O prompt do Bandit Camp fala que o arquivo é o único legível para humanos (human-readable) entre os diversos na pasta `inhere`.

Seguindo o mesmo caminho do nível anterior, entrei no diretório. Dando `ls`, você verá que há diversos arquivos `-filexx` **xx significando seus números**.

Esse nível mostra a utilização do **wildcard**, ou `*`. Ele é utilizado para selecionar todos os arquivos em um diretório para rodar o comando, ao invés de um por um.

Juntamente, utilizarei `file`, que é um comando do Linux utilizado para ver o tipo de arquivo, lendo diretamente do conteúdo dentro deles. Isso é muito mais fácil que verificar cada arquivo. Juntamente com o `./`, direi que é o diretório **atual** para rodar esse comando.

```bash
file ./*
```
Isso mostra que somente um dos arquivos é possui `ASCII text`, ou seja, texto comum.

```bash
./-file00: data
./-file01: data
./-file02: data
./-file03: data
./-file04: data
./-file05: data
./-file06: data
./-file07: ASCII text
./-file08: data
./-file09: data
```

Utilizo a mesma solução do nível 2 -> 3 para abrir o arquivo e conseguir a senha.

___

## Level 5 -> 6

>Esse nível faz uma adição sobre o anterior. Ele avisa que o arquivo que possui a senha é:

>`human-readable`, `possui tamanho de 1033 bytes` e `não é executável`.

Dessa vez, ele irá ensinar como combinar comandos para rodar pesquisas automaticamente, sem precisar verificar um por um: com filtros e comandos diferentes de uma vez só.

Uso `find` novamente. Porém, com diferenças nos filtros. `.` é utilizado para somente pesquisar no diretório atual. 

Temos também o filtro `type`, que somente mostra um tipo específico de arquivo selecionado. Junto com ele, utilizarei `-f`, que faz ele excluir diretórios da pesquisa, e só mostrar arquivos.

O filtro `-size` é basicamente o que ele fala. Procura somente o tamanho do arquivo. Nos terminais, tipos de tamanhos possuem utilizam sufixos. Um byte é um caractere, então, ele tem o sufixo `c`. Kilobyte é `k`, um mega é `M` etcetera. Não é preciso lembrar dessas coisas: com o tempo você irá se acostumar, pesquisar no Google é algo normal. Utilizo o filtro `-size` e conforme o Camp mostrou, coloco `1033c` no tamanho.

`-not` é usado antes de um filtro, para fazer o trabalho oposto dele, e excluir o item da pesquisa. Coloco ele antes do `-executable`, que excluirá todos os executáveis.

Logo após, na mesma linha de comando, rodo o `-exec`. Que executa um outro comando juntamente com esse filtro. `-exec file {} +` vai executar o comando `file`, com o `{}` sendo um **placeholder** para a onde os nomes que aparecerão. O `+` simplesmente termina esse comando.

Juntamente com isso, é utilizado `|`, chamado **pipe**. Ele funciona como uma continuação do código, de uma maneira em que o *resultado* do anterior vira **input** do próximo código.

Finalmente, logo após o **pipe**, uso o comando `grep`, que serve nada mais como uma filtragem de padrões nas **strings** dos códigos pesquisados. Ele fica então como `grep ASCII`, mostrando assim todos os arquivos que são *human-readable*, pois **geralmente** os arquivos legíveis por humanos, estão como `ASCII text`, como visto anteriormente.

O código inteiro fica assim:

```bash
find . -type f -size 1033c -not -executable -exec file {} + | grep ASCII
```

Ele dará somente um arquivo:

```bash
./maybehere07/.file2: ASCII text, with very long lines (1000)
```

Rodo ele, e acho a senha.

Essa parte é meio complicada de entender. Recomendo refazer e ir tentando cada comando, para ver como cada tipo de filtro funciona. Caso você ache uma maneira mais fácil, pode utilizá-la. **Nenhum nível é feito somente de um jeito, com excessão do bandit 0**.

___

## Level 6 -> 7

>É a mesma coisa que o nível anterior. A maior diferença é que ao invés de estar em `inhere`, os arquivos estão escondidos no servidor. Ele avisa que o arquivo que precisamos para a senha **tem como dono `user` `bandit7`, `group` `bandit6`, e possui `33 bytes` de tamanho.**

A filtragem é feita do mesmo jeito. Utilizo o `/` para pesquisar no diretório `root`, que é a base de todos os arquivos e diretórios, a "entrada" do servidor. Ele tentará encontrar todos os arquivos dali.

Rodo então:

```bash
find / -type f -user bandit7 -group bandit6 -size 33c
```

Porém, ao invés de eu receber o arquivo principal, ele está escondido entre vários diretórios que o sistema não me dá permissão de visualizar, deixando o terminal muito *ocupado* para poder visualizar, tendo ínumeras linhas dizendo:

```bash
find: ‘/run/user/11006/systemd/inaccessible/dir’: Permission denied
find: ‘/run/user/11012’: Permission denied
find: ‘/run/sudo’: Permission denied
find: ‘/run/screen/S-bandit23’: Permission denied
find: ‘/run/screen/S-bandit12’: Permission denied
find: ‘/run/screen/S-bandit15’: Permission denied
find: ‘/run/screen/S-bandit25’: Permission denied
find: ‘/run/screen/S-bandit20’: Permission denied
find: ‘/run/multipath’: Permission denied
find: ‘/run/cryptsetup’: Permission denied
find: ‘/run/lvm’: Permission denied
find: ‘/run/systemd/propagate/fwupd.service’: Permission denied
find: ‘/run/systemd/propagate/ModemManager.service’: Permission denied
find: ‘/run/systemd/propagate/polkit.service’: Permission denied
find: ‘/run/systemd/propagate/chrony.service’: Permission denied
find: ‘/run/systemd/propagate/systemd-logind.service’: Permission denied
find: ‘/run/systemd/propagate/irqbalance.service’: Permission denied
```
**Posso encontrar ele do mesmo jeito?** Sim, o arquivo está no meio deles. Porém, muitas vezes não é algo recomendável, principalmente fora do Bandit. É uma perda de tempo ficar procurando manualmente, quando temos comandos que facilitam nessa mesma filtragem.

`/dev/null` é um arquivo específico do Linux que essencialmente destrói tudo que for mandado para ele. Podemos utilizar ele com um filtro próprio. `/dev`significa **devices**, com `null` sendo esse próprio "buraco-negro" de arquivos.

Também, temos números de **streams** de comandos. Essas streams, são os tipos de comandos que temos no Linux. Streams de número `0` são as de *input* para o comando. `1` é o *output* normal, geralmente ocorrendo logo após esse *input*. `2` são **mensagens de erro**, e é algo que iremos utilizar também para o nosso benefício.

Essa é a primeira vez em que o `>` também aparecerá. `>` nada mais é que uma função avisando o sistema que o *output* deve ser redirecionado para um *arquivo*, ao invés de aparecer no terminal. É ótimo para transferir *strings* de resultados para armazenamento rápido, e também para filtrar *outputs* desnecessários.

Por fim, meu código fica como:

```bash
find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null
```

Esse código finalmente nos dá o **arquivo** em que nossa senha está:

```bash
/var/lib/dpkg/info/bandit7.password
```

É algo em que quando pegamos o jeito, fica até simples; porém, temos tantos tipos de filtragem que torna o comando `find` tão intrinsecamente útil, quanto complexo.

___

## Level 7 -> 8

>O Camp avisa que a senha está no arquivo data.txt, próximo à palavra **millionth**.

Incrivelmente simples. Esse nível ensina como utilizar `grep` para obter resultados **dentro** de arquivos, ao invés dos arquivos em si.

`grep` é muito versátil na filtragem de pesquisas, podendo ser utilizado tanto com arquivos, quanto dentro deles, basta rodar os dados com o filtro para ele entender.

Rodo:

```bash
grep millionth data.txt
```

E logo dará a senha. Nada complicado, isso ensina ao usuário a pesquisar como funciona cada comando no terminal. Geralmente, para aprender mais sobre ele, você só precisa colocar o *nome* do comando, juntamente com `--help`, por exemplo: 

`grep --help` Assim, o terminal fornecerá todos os filtros e sub-comandos para rodar junto com ele. Também, temos as **man pages**, que são documentações locais; fornecendo manual sobre o assunto. Bandit fornece o **man page** do Ubuntu diretamente, mas temos diversos como de Linux mais generalizado, ou até manuais em português, um ótimo foi feito pelo **Uniriotec**, no portal **CCET**.

___

## Level 8 -> 9

>Agora, a senha do data.txt é a única string que ocorre somente uma vez.

Novamente, simples. Ao invés de `grep`, vou utilizar dois comandos diferentes, o `sort`, e `uniq`.

Como o comando fala, `uniq` performa funções como: filtrar *strings* duplicadas, e também fazer o inverso, tirando as únicas. Porém, há um problema: se eu rodar:

```bash
uniq -u data.txt
```

Ele irá mostrar **todas** as senhas de qualquer jeito. 

**Por que isso ocorre?** 

Quando strings estão desarrumadas e misturadas, `uniq` acha que **todas** são únicas, somente conseguindo filtrar linhas adjacentes de outras.

Por isso, o `sort` entra junto com o *pipe* `|`. `sort` faz a ordernação de todas as strings por ordem alfabética e numérica; ajudando assim o outro comando.

Rodo:

```bash
sort data.txt | uniq -u
```

A senha logo aparece.

___

## Level 9 -> 10

>A senha dentro do data.txt é uma das *strings* legíveis por humanos, precedido por vários caracteres `=`.

Outro aprendizado sobre filtragem. Agora, utilizo `strings`, que mostra todas as strings **imprimíveis** dentro de um arquivo.

Rodo agora:

```bash
strings data.txt
```

Isso mostrará caracteres próprios, ao invés de vários símbolos. Com base nesse arquivo, a resolução já está fácil e basta dar o scroll para cima, que você verá a senha. **Porém**, isso é meia-resposta, você não quer precisar dar o scroll, pois alguns arquivos podem ser muito grandes para encontrar algo tão facilmente. Assim, utilizo a informação que vários `=` precedem a senha, com a filtragem do `grep` para mostrá-los. como são vários, utilizo pelo menos **3** para ter certeza da precisão:

```bash
strings data.txt | grep ===
```

O output já aparece após três strings com diversos `=`, dizendo que a senha é aquela.

___

## Level 10 -> 11

>A senha está novamente dentro do arquivo data.txt, com dados codificada por base64.

Primeiro, vamos abordar de uma maneira rasa sobre o que é **codificação** e **decodificação**.

**Codificação** nada mais é que ajudar na acessibilidade de um arquivo; tendo assim um melhor acesso na própria compatibilidade dos arquivos, garantindo que dados não seráo perdidos na mudança de sistemas e linguagens. **Decodificação**, é quando os dados em si são "abertos" e utilizáveis.

Você verá a codificação caso faça o `cat data.txt`, que mostrará um código grande. Ele é sucedido por `==`.
>Sempre lembre que `==` é um indicador que o arquivo é codificado por `base64`. Ele não **garante**, mas ajuda a perceber.

Caso você utilizou o `--help`, irá ver que para decodificar um arquivo basta colocar o sufixo `-d`. Utilizo:

```bash
base64 -d data.txt
```
E obtenho a senha dentro do arquivo.

___

## Level 11 -> 12

>A senha está no data.txt, onde todas as letras minúsculas (a-z) e maíusculas (A-Z) foram rotacionadas por 13 posições.

Rotacionar alfabeto por 13 posições é um sinal de ROT13.

**O que é ROT13?**

É um sistema de codificação de dados. Não serve exatamente como o conceito anterior de acessibilidade, mas sim como um início à *criptografia*. Ele não protege bem, mas serve bastante para ocultar dados básicos como spoilers, para o usuário não ver com facilidade os dados dentro. Utiliza a rotação do alfabeto em 13 letras, ou seja, troca o alfabeto na metade. Ele começa pelo **N** ao invés do **A**, terminando pelo **M** ao invés do **Z**. Fica desse jeito:

>**N O P Q R S T U V W X Y Z A B C D E F G H I J K L M**

Se abrir o data.txt, você verá algo tipo assim:

```bash
Gur cnffjbeq vf 7k16JArUVv5LxVuJfsSVdbbtaHGlw9D4
```
Portanto, devemos **transformar** esses dados utilizando o comando `tr`.

Esse comando é muito útil para transformar certas letras em outras, utilizado não só em ROT13, mas também com criptografias mais avançadas.

Ele funciona desse jeito:

```bash
echo abc | tr 'abc' 'xyz'
```
>Resultado: xyz -> `a` virou `x`, `b` virou `y`, `c` virou `z` no arquivo final.

Caso eu queira colocar uma *range* de letras, por exemplo de `A` a `F`, simplesmente coloco `A-F`. Letras maíusculas (uppercase) e minúsculas (lowercase) **devem** ser diferenciadas para o shell entender, ele é *case-sensitive*.
Ele não funciona por conta própria, e precisa de um **pipe** `|` para abrir o arquivo primeiro.

Para resolver o problema desse exercício, basta eu colocar o filtro de *lowercase* e *uppercase* com o comando:

```bash
cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

Repare que ao invés de um simples `N-Mn-m` é utilizado o A, isso vale pois o `tr` não dá o *wrap* automático no alfabeto, fazendo um "loop" esperado. Devemos auxiliá-lo a continuar novamente, para jogar até o M. Adicionando o `Aa` já ajuda na prática.

___

## Level 12 -> 13

>A senha dentro do data.txt é uma `hexdump` de um arquivo que foi repetidamente comprimido.

Esse nível não é complicado pela sua complexidade, mas sim pela quantidade de passos a serem feitos dentro dele; sendo o jeito desse nível Bandit de fixar na mente por repetição, Primeiramente, entro no servidor, e já de início crio uma pasta temporária, `tmp`, pois o **root** não aceita a criação e modificação de arquivos por usuários de fora.

Utilizo:

```bash

mktemp -d
```

`mktemp` é um comando básico para criar diretórios temporários usado frequentemente nos shells.

Utilizo o comando `cp` que faz a **cópia** do data.txt para o diretório tmp que aparecer no prompt, copiando e colando o caminho. Exemplo:

```bash
cp data.txt /tmp/tmp.csujppgA3p
```

Entro no arquivo tmp, e começo a trabalhar de lá.

Se eu der o `cat` no arquivo, verei que é um arquivo com código **hexadecimal**.

**O que é um código hexadecimal?**

São códigos representados por dados binários codificados em uma forma legível para humanos: agrupando em colunas de 4 bits. Ajuda muito para consolidar informações e facilitar leitura da representação dos dados em si, ao invés da compressão regular que não dá para entender.

Como não conseguimos ler hexadecimal, iremos descomprimir esse arquivo. Existem diversas maneiras de compressão, com programas diferentes que rodam seus próprios algorítmos. Dois principais são o `gzip` que já vem imbutido nos terminais, e o `bzip`, que geralmente precisa ser baixado na máquina ou servidor.

Para descomprimir um arquivo, preciso saber qual programa comprimiu ele

**Como acho qual programa comprimiu um arquivo?**

É bem simples, e não precisa decorar de cabeça no início. Só precisamos utilizar a **segunda coluna de dados hex**, que são os 4 primeiros dígitos dentro do código.

**Sempre iremos ver a primeira linha**, não precisa procurar pelo código inteiro. Os prefixos de cada compressor estão nos primeiros dígitos `hex` do arquivo (assinaturas). Para saber quais digitos representam o que, temos diversos recursos na internet que ajuda a mostrar os prefixos.**Wikipedia** tem uma lista compreensiva de assinaturas de programas.

Conforme a lista mostra, temos no hex os dígitos `1f8b`. Esse é o tipo de assinatura do `gzip`.

>Gzip e Bzip2 precisam que os arquivos tenham os sufixos `.gz`` e ``.bz2` para poderem reconhecer e descomprimir arquivos do tipo.
>Também, precisam estar descomprimidos para poder rodar.

O comando `xxd` cria e remove o **hexdump** dos arquivos, transformando eles em arquivos compressos "normais", ao invés de hexadecimais, e vice-versa. Para criar, basta colocar o nome do arquivo junto com o comando, e para remover o hexdump é somente necessário colocar o -r na frente.

Utilizo então:

```bash

xxd -r data.txt compressed_data
```

Se executar o `compressed_data`, verá que é uma compressão já vista anteriormente no Camp, agora com uma resolução de como desfazer isso. Voltando no `data.txt`, você consegue relembrar qual é o tipo de compressão. Se não quiser ver aquele número gigante inteiro, basta utilizar o **pipe** `|` `head` junto com o `cat data.txt`, que só mostrará a cabeça do arquivo.

Então, basta modificar o `compressed_data`, para `compressed_data.gz`. Para fazer isso, usamos o comando **mover** `mv`, que é utilizado para renomear arquivos e movê-los entre diretórios. Para renomeá-lo, basta colocar o **nome** do arquivo, depois o nome que quiser:

```bash
mv compressed_data compressed_data.gz
```
E rodo o gzip:

```bash
gzip -d compressed_data.gz
```

Ao abrir o arquivo, verá que ainda está comprimido. Basta dar o hexdump novamente, que você verá qual é a próxima compressão.

Verá que o `hex` está diferente. Agora, com a assinatura `42 5a 68`. Essa assinatura é do `BZip2`. Faço a mesma coisa que com o Gzip, com a única diferença sendo o comando `bzip2` para fazer a descompressão `-d`.

Repito todo esse processo, até me deparar com um número diferente. Esse não é de um arquivo comprimido, e sim, de um arquivo `tar`.

**Como sei que é .tar?**

Basta ver nas `strings`. Ele possui um `data5.bin` ao lado, descomprimido.

`tar` é um tipo de arquivo que possui vários diretórios e outros arquivos ou programas dentro dele, sendo uma forma mais segura para não perder dados durante o movimento entre sistemas. O comando `-cf` **cria** um arquivo .tar, com `-xf` sendo feito para **extrair** arquivos ou programas dentro dele. Rodo então:

```bash
tar -xf compressed_data
```

Quando dou `ls`, vejo que há agora o `data5.bin` no meu diretório; esse arquivo sendo compresso também. Ao dar o **hexdump**, vejo outro arquivo .tar. Ao receber o `data6.bin` e dar o **hexdump**, voltam as compressões, dessa vez pelo `bzip2`. 

Logo após, outro `.tar`, e mais um **hexdump** ao obter o `data8.bin`.

Agora, mais um `gzip`.

Finalmente, temos a senha dentro do `data8`. Aqui aprendemos como encontrar o tipo de **hex**, como funcionam arquivos `.tar`, e como fazer a compressão/descompressão de arquivos junto com o **hexdump**. 

___

## Level 13 -> 14

> Não há senha nesse nível, somente um arquivo sshkey.private para ser utilizado no próximo nível.

Logando no bandit13, você verá o arquivo sshkey.private. Você precisa baixar ele na sua própria máquina para ter acesso ao próximo servidor. Isso é simples e fácil, basta somente entender mais sobre as funções `ssh` e `scp`. Eu saio do servidor, e fico na minha máquina.

`scp` significa **Secure Copy Protocol**, que faz a transferência segura de arquivos na rede de um servidor para a máquina. Ele utiliza quase o mesmo comando que o `ssh`:

```bash
scp -P 2220 bandit14@bandit.labs.overthewire.org:sshkey.private .
```

Assim, ele inicia o *download* do arquivo. Umas diferenças do `ssh`, é a porta `-p` sendo maíuscula, e o *download* do arquivo sendo caracterizado por `:[FILENAME]`. O `.` é utilizado para representar o caminho de download, que irá para a pasta principal da minha máquina.

Sendo assim, dou o `ls` e vejo que o arquivo está lá. Agora, utilizo o comando `ssh`, com a diferença de usar o `-i` no começo, que é utilizado para a identificação de arquivos no servidor.

```bash
ssh -i sshkey.private -p 2220 bandit14@bandit.labs.overthewire.org
```

Porém, recebo um erro de autenticação de arquivo logo quando tento entrar:

```bash
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0640 for 'sshkey.private' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "sshkey.private": bad permissions
```

O servidor avisa que o arquivo com a *private key* está **desprotegido**.

Utilizo o `ls -li` para ver as permissões do arquivo. Ele fica como `-rw-r-----`. 

**Quais são as permissões?**

Existem diferentes tipos de permissões no Linux. `r` significa **read** (ler), `w` significa **write** (escrever) e `x` significa execute (executar).

Também, existem diferentes grupos: **Owner** (dono do arquivo ou diretório), **Group** (grupo de usuários que possuem as mesmas permissões para gerenciamento de arquivo) e **Others** (todos os outros usuários). Eles estão separados dentro das linhas. 

As primeiras **três** linhas são as do **Owner**, referenciada como: `-rwx------`.

As segundas, são do **Group**: `----rwx---`.

As últimas, são do **Others**: `-------rwx`.

Repare que nunca é utilizada a primeira linha. Ela é reservada para simplesmente indicar que o é um **diretório**, não sendo permissão em si. Caso não seja um arquivo, e sim uma pasta, o arquivo fica assim:
`drwx------`. Quando todos os usuários possuem **todas** as permissões em uma *pasta*, assim todas as linhas são preenchidas: `drwxrwxrwx`.

Posso alterar permissões facilmente com o `chmod`.

**Chmod** significa *changemode*, que altera permissões de usuários. Ele utiliza **octal** para calcular permissões, que é um sistema de números que utilizam dígitos de **0** a **7**, representando potências de 8.

>Não é necessário saber de cabeça; porém, você irá aprender conforme o tempo. Existem diversos *cheatsheets* na internet mostrando quais números representam tipos de permissão para quais grupos.

Utilizo o `chmod 700` para dar permissão **somente** para o **Owner**, e rodo o `ssh`:

```bash
chmod 700 sshkey.private
ssh -i sshkey.private bandit14@bandit.labs.overthewire.org
```

Assim, entro no nível 14.

___

## Level 14 -> 15

>A senha pode ser obtida mandando a senha do nível atual para a **port 30000 no localhost**.

Anteriormente, o nível 13 do Camp avisou que a senha do 14 estava na pasta **/etc/bandit_pass/bandit14**. Para pegar a senha do 15, eu entro na pasta, e pego a senha do 14 que será relevante para o netcat: sendo utilizada na validação para poder retirar a senha nova.

Utilizo o netcat `nc` para abrir a porta no localhost. 

**O que é Netcat?**

É um programa completo de networking que conecta dois aparelhos por TCP, também podendo utilizar UDP. Ele ajuda a facilitar transferência de arquivos, fazer scanning, debugging, remote shells, até servindo como um chat. Versátil e bem utilizado.

O comando `nc` fica assim:

```bash
nc localhost 30000
```

Ele pede a senha, e envio a do bandit14. Recebo um parabéns, e ganho a senha.

___

## Level 15 -> 16

>A senha do próximo nível pode ser obtida ao mandar a senha do nível atual para a **porta 30001 no localhost** usando criptografia **SSL/TLS**

Começamos então uma introdução própria para a criptografia utilizando `openssl`.

`openssl` é um *toolkit* que estabelece conexões criptografadas **SSL** e **TLS** (Secure Sockets Layer e Transport Layer Security). Eles são protocolos que criptografam dados pela internet; a diferença entre os dois, é que o **TLS** é uma versão mais nova do **SSL**, aprimorada e bem mais segura.

A utilização é simples, usamos o `s_client` que é um comando transformando o shell em um usuário genérico SSL para envio de dados. Ele roda assim:

```bash
openssl s_client -connect localhost:30001
```

Note que o **port** fica logo após o `:`, o **OpenSSL** prefere uma maneira mais simples de conectar as portas ao invés do `-p`.

Você verá que o terminal, desde a conexão com o bandit15 até o final do prompt desapareceu, entrando em uma sessão bruta de TLS para aguardar novas instruções.

___

## Level 16 -> 17

>As credenciais do próximo nível podem ser obtidas ao enviar a senha do nível atual para uma **porta do localhost na faixa de 31000 até 32000**.

Nesse nível, utilizarei o `nmap`.

**O que é o Nmap?**

É um scanner de dados de uma conexão. Ele pode procurar **portas**, **host**, **versão**, entre diversas outras coisas. Muito versátil para a obtenção de dados.

Utilizo o comando `-sV`, que faz um scan de tipo de serviço dentro do protocolo IP (se é ssh, http, etc- o que está rodando nessa porta), juntamente com o `-p`, que escaneia as portas. Ele fica assim:

```bash
nmap -sV localhost -p 31000-32000
```

Ele dará o scan algumas portas abertas: em que para mim, os serviços retornam como **Unknown**. Eu tento todas as portas abertas manualmente, já que são em um número relativamente pequeno, até achar a própria que preciso (31790).

Assim, estabeleço a conexão normal do `openssl`, porém se eu rodar ele do mesmo jeito que sempre rodo, ele dará uma mensagem no final.

`KEYUPDATE`

E não deixará utilizar comandos. 

**Por que isso acontece?**

O SSL está mandando uma mensagem de key update que acaba travando o shell. Para não ter esse problema, utilizamos o `-quiet`, que silencia as mensagens do sistema e faz os inputs/outputs agirem como os do `netcat`. 

```bash
openssl s_client localhost:31790 -quiet
```
Ele pedirá a senha, e ao invés de dar a senha normal, trará uma chave RSA.

**Isso é o mesmo tipo de private key que você acha no bandit 14.**

Saio do servidor, e na minha máquina utilizo o comando `nano`.

`nano` é um editor que cria arquivos dentro do terminal, com o usuário podendo escrever ou colar strings para fazer scripts básicos.

Escrevo:

```bash
nano sshkey17.private
```

Ele abrirá o editor. Coloco desde o início da mensagem até o fim, utilizando o `-----BEGIN RSA PRIVATE KEY-----` tanto quanto `-----END RSA PRIVATE KEY-----`. Aperto `CTRL + S` para salvar, e `CTRL + X` para sair do editor. 

___

## Level 17 -> 18

> Tem 2 arquivos no diretório principal: `passwords.old` e `passwords.new`. A senha para o próximo nível está em `passwords.new` e é a única linha modificada entre os dois arquivos.

Incrivelmente simples. Utilizamos o comando `diff`, que mostra as diferenciações entre arquivos, vendo o que mudou em cada versão.

Escrevo:

```bash
diff passwords.old passwords.new
```
O resultado velho sai como `<` e o novo como `>`.

Assim, sabemos o que nos arquivos mudaram de uma maneira rápida e concisa, sem dados desnecessários.

## Level 18 -> 19

>A senha está em um arquivo escrito readme no diretório principal. Infelizmente, alguém modificou .bashrc para fazer o log out quando você loga usando SSH.

Outra solução muito simples e **já utilizada** para o bandit 14. Ao invés de entrar no 18, eu simplesmente pego o arquivo:

```bash
scp -P 2220 bandit18@bandit.labs.overthewire.org:readme .
```
Isso faz com que o sistema não perceba que eu interagi pelo `ssh` - burlando o .bashrc, me dando assim a senha tranquilamente.

## Level 19 -> 20

>Para conseguir acesso ao próximo nível, você deve usar o `setuid binary` no diretório principal. A senha para esse nível pode ser encontrada em `/etc/bandit_pass/`.

Aqui, como é dada a dica, utilizamos um arquivo `setuid`.

**O que é setuid?**

É um arquivo binário que é utilizado para executar comandos usando o UID do proprietário do arquivo. No exemplo desse nível, o **bandit19** terá permissões de login do **bandit20** com o arquivo **setuid** `bandit20-do`.

Utilizo `./` para avisar o sistema que estou rodando o arquivo que está dentro desse diretório, e utilizo ele como prefixo para meus comandos que necessitam de permissão do bandit 20:

```bash
./bandit20-do ls /etc/bandit_pass
```

Ele irá mostrar diversos arquivos. Como quero a senha para o **bandit 20**, vou no arquivo com o mesmo nome, e rodo ele.

```bash
./bandit20-do cat /etc/bandit_pass/bandit20
```
Assim, obtenho a senha para o próximo nível.

___

## Level 20 -> 21

> Tem um setuid binário no diretório principal que faz o seguinte: cria uma conexão com o localhost na porta que você especificar, e lê uma linha de texto da conexão e compara com a senha do nível anterior. Se estiver certa, ele irá transmitir a senha para o próximo nível.

**Primeiro, iremos por partes.**

A primeira parte é verificar a senha do último nível. Como mostrado na última tentativa, a senha fica no `/etc/bandit_pass/bandit20`. Não precisamo utulizar um `setuid` de autenticação agora, pois temos a credencial do bandit20. Utilizarei o comando `nc` visto no bandit15 para criar uma conexão.

Com o `nc` usarei os seguintes comandos: `-n` que suprime as resoluções de nome (não traduz IP ou portas para nomes, lê como original para conexões; simplesmente te dá o dado "bruto"). `-v` que mostra basicamente o que o servidor e o *netcat* está fazendo; a conexão que foi feita, quem entrou, quando fechou etc. E o `-p` que é a conhecida **porta**. Usarei eles com o comando `cat` para rodar o bandit20 com a senha e transmitir ela por *netcat*. Juntos, eles podem ficar assim:

```bash
cat /etc/bandit_pass/bandit20 | nc -nvp 1234 &
```

A porta, como explicado no enunciado, pode ser qualquer uma. 1234 é a mais básica. Uso o `&` para explicar para o shell rodar o comando inteiro como plano de fundo; ou seja: ele continuará rodando sem interrupções, mas não travará o prompt, você pode rodar outros comandos junto.

Com a conexão aberta, agora entro nela usando o *setuid*.

```bash
./suconnect 1234
```

Logo, ele transmite a mensagem com a senha anterior, verifica e me dá a senha do próximo nível.

___

## Level 21 -> 22

> Um programa está rodando em intervalos regulares de `cron`; o planejador baseado em tempo. Olhe em /etc/cron.d/ para a configuração e veja qual comando está sendo executado.

Esse nível é simples, e basicamente ensina para que servem os `crons`.

**O que é cron?**

`Cron` nada mais é que, como o enunciado fala, é um planejador de comandos. Ele pode ser criado com uma linha de código, rodando ela de um jeito simples e literal em loop conforme o tempo configurado; útil para tarefas de ciclos. 

Entro na pasta `cron.d` e vejo os arquivos. Existe um chamado `cronjob_bandit22`; como ele referencia o próximo nível, dou `cat` nele.

Lá, ele mostra o arquivo `cron` funcionando:

```bash
@reboot bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
* * * * * bandit22 /usr/bin/cronjob_bandit22.sh &> /dev/null
```

Essencialmente falando para deixar o `/usr/bin/cronjob_bandit22.sh` rodando uma vez no fundo quando o sistema iniciar, e jogar informações no `/dev/null` que seria a "lixeira" permanente do sistema que destrói strings enviadas para ela. O `* * * * *` faz o sistema rodar a cada minuto. Cada `*` significa um valor de tempo indefinido utilizando o wildcard. Ele segue o padrão:

`*` Minuto (0-59) 
`* *` Hora (0-23)
`* * *` Dia do mês (1-31)
`* * * *` Mês (1-12)
`* * * * *` Dia da semana (pode ser 0-7, domingo sendo 0 ou 7)

Rodo o arquivo, e ele mostra outro `cron`, que faz o bandit22 gerar permissão `644` para o arquivo `/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv`: o dono pode ler e escrever, e os grupos com outros usuários (bandit21) podem somente ler.

também, esse mesmo `cron` roda o script para `/etc/bandit_pass/bandit22` e transfere os dados do arquivo para o `tmp`, assim deixando a senha no arquivo com permissões. A senha está dentro dele.

___

## Level 22 -> 23

>Um programa está rodando automaticamente em intervalos regulares de `cron`. Olhe em `/etc/cron.d/` para ver a configuração e qual comando está sendo executado.

Nós iremos utilizar exatamente o mesmo conceito do nível 21 -> 22. Rodo o cronjob_bandit23 na pasta, e depois o  /usr/bin/cronjob_bandit23.sh. 

Ele dá um *shell script* mais elaborado:

```bash
#!/bin/bash

myname=$(whoami)
mytarget=$(echo I am user $myname | md5sum | cut -d ' ' -f 1)

echo "Copying passwordfile /etc/bandit_pass/$myname to /tmp/$mytarget"

cat /etc/bandit_pass/$myname > /tmp/$mytarget
```

`$myname` é o valor do usuário da senha (bandit23)
`$mytarget` é o comando que vai encontrar o arquivo-alvo. Rodando aquele comando `echo`, utilizando o `$myname` junto com os outros comando do *pipe* acharemos nosso target.

**O que é echo?**
Ele transforma texto em *stdout*, ou em termos básicos, um *output* utilizável sem dar erros de síntaxe. 

`md5sum` basicamente gera uma 'credencial digital' de um texto recebindo, fazedo o `checksum` e gerando um código próprio para aquelas palavras, podendo ser utilizado como senha; ou nesse caso, o nome do arquivo. O `cut -d` vai delimitar e cortar seções do código: nesse caso, espaços. O `-f 1` seleciona o **field 1**, o primeiro campo *antes* da primeira delimitação.

Ele ficará assim:

```bash
echo I am user bandit23 | md5sum | cut -d ' ' -f 1
```

O `md5sum` nos dará o nome do arquivo; basta rodá-lo como /tmp/[ARQUIVO] e teremos a senha.

O bandit então mostra como esse sistema pode ser um *exploit*. Não se automatiza um script de senha de maneira como palavras-chave, pois basta rodar o .sh uma vez para entender que basta necessitar a palavra correta dentro do script para obter a credencial.

___

## Level 23 -> 24

> Um programa está rodando automaticamente em intervalos regulares de `cron`. Olhe em `/etc/cron.d`.

Quando entramos na pasta e rodamos os arquivos, nós vemos o script que está sendo executado automaticamente:

```bash
#!/bin/bash

myname=$(whoami)

cd /var/spool/$myname/foo
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." -a "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" ./$i)"
        if [ "${owner}" = "bandit23" ]; then
            timeout -s 9 60 ./$i
        fi
        rm -f ./$i
    fi
done
```

Esse script é **muito** importante, pois ele mostra que está executando *todos* os scripts dentro de `/var/spool/$myname/foo` com o dono bandit23. Se o dono for `bandit23`, ele tem um  *timeout* com *SIGKILL* de 60 segundos. Ou seja, se o script rodar por mais de 60 segundos, o sinal é cortado.

Relembrando dos passos anteriores, as senhas normais estão **sempre** guardadas nos arquivos: `/etc/bandit_pass/bandit**` com o `**` sendo o número do bandit que precisa. 

Com isso em mente, vamos criar uma pasta temporária e colocar nosso script lá.

O script será bem simples. Crio com o comando `nano bandit24.sh`:

```bash
#!/bin/bash
cat /etc/bandit_pass/bandit24 > /tmp/tmp.53M3LxWxcE/password
```

Vamos por partes:

`#!/bin/bash` > **SEMPRE** será utilizado para esse tipo de *shell script*, ele se chama **shebang** e ele avisa qual intérprete do sistema é utilizado para ler o script. O sistema sempre procura pelo `#!`, ele avisa que o resto da linha significa o intérprete. `/bin/bash` é o caminho para o programa **Bash**, geralmente utilizado; porém, existem diversos tipos de programas para inúmeras situações.

`cat /etc/bandit_pass/bandit24 > /tmp/tmp.53M3LxWxcE/password` > irá rodar o **bandit24** que possui a senha, e enviará para o arquivo `password`dentro do tmp.

Após sair do `nano`, eu crio o arquivo especificado que vai ter a senha. Para criar um arquivo vazio, basta executar o comando `touch password` que irá criar o caminho com esse nome.

Dou `chmod 777` na pasta, `password` e `bandit24.sh`. Isso **não é seguro** em ambientes fora de teste, porém como é Bandit, vou pela maneira mais rápida. Com um cheatsheet podemos ver as permissões necessárias (ler e escrever), dando assim uma permissão 644 se não fosse um ambiente controlado.

Finalmente, copio o arquivo para aquele local que roda os scripts:

```bash
cp bandit24.sh /var/spool/bandit24/foo
```

Aguardo 60 segundos, leio password, e obtenho a senha.

O Bandit explora agora uma vulnerabilidade de envio de arquivos com permissões elevadas. O `cron` presente roda qualquer script de bandit23, trazendo assim uma maior facilidade de simplesmente pegar uma senha com um script, como vemos aqui.

___

## Level 24 -> 25

>Um daemon está escutando na porta 30002 e te dará a senha do bandit25 se der a senha do bandit24 e um número pin secreto de 4 números. Não tem maneira de receber o código exceto indo atrás das 10000 combinações; falado brute-forcing.

Esse nível finalmente ensina uma ferramenta mais especializada de *pentesting*, o **brute-force**.

Ele funciona ao redor de scripts que automatizam uma maneira de penetrar um sistema de uma maneira automatizada e simples, muitas vezes envolvendo teste de inúmeras combinações específicas para obter senhas. Invasões de **brute force** são muitas vezes impedidas por `rate-limits`, que fazem a prevenção contra `spam` que justamente causam no sistema. Geralmente, essas técnicas são mais utilizadas para sistemas simples e com administração mais inexperiente.

O que irei utilizar para isso:

`shell script` por bash, como ensinado momentaneamente com os cronjobs,
loops `for`

O script é bem básico. Rodo um script `for` no nano. `for` é essencialmente utilizado para loops, sejam eles de caràcteres ou numerais. Ele fica mais ou menos assim:

```bash
for i in 0 1 2 3 4 5
do echo $i;
done
```
O echo roda no shell:
```bash
0
1
2
3
4
5
```

Para **ranges** de números, é preciso usar *chaves* junto com `..` entre os números. `for` significa 'repetir um bloco de comando para *cada valor* nessa lista'. `i` seriam esses valores e `in` é o prefixo para os intervalos.

Logo após o `for`, assim começa o nosso código próprio para o loop.

`do` inicia o comando. Uso o `echo` [SENHA] (sem os colchetes) `$i`, o `$` sinaliza para o script rodar os números dentro do `i`. Se rodar sem, ele só irá repetir a letra. Uso o ``>>`` para mandar o script arquivar o resultado em uma pasta `attempts.txt`, e `;` para finalizar essa linha de comando.
`done` é utilizado para finalizar esse loop `for`.
Após, coloco no script `cat attempts.txt | nc localhost 30002 > results.txt` que fala, como mostrado nos bandits anteriores, para rodar o arquivo, usar seu output no `netcat`, e armazenar os resultados no `results.txt`.

**Antes de mostrar como fica esse código unido, mostrarei algo que muitas pessoas, inclusive eu acabam errando sobre scripts `Bash`.

Eles **não** seguem fluxos comuns de comandos. Uma pessoa esperaria:

```bash
do nc localhost 30002 | echo [SENHA] $i;
done
``` 

Mas isso **não funcionará**. A lógica para muitas linguagens está certa, porém Linux geralmente roda pelo fluxo `stdin` e `stdout`, input e output. `echo` é um comando que escreve `stdout` para o terminal, com o `nc localhost 300002` somente lendo `stdin` e gerando **respostas do servidor** em `stdout`. Eles entram em conflito, ao invés do `echo` transmitir a mensagem para o `localhost`, ele irá simplesmente rodar o comando no terminal em si. As **manpages** ajudam muito a descobrir quais comandos são `stdin` e `stdout`. Sempre temos que tomar cuidado, para a combinação de comandos dar certo.

No começo, é complicado desvendar quais são os `stdin` e `stdout`, mas conforme você trabalhar com Linux, verá que é simplesmente uma questão de aprender os conceitos da 'língua' mesmo.

Faço então:

```bash
#!/bin/bash
for i in {0000..9999}
do
    echo [SENHA] $i >> combinations.txt;
done

cat combinations.txt | nc localhost 30002 > results.txt
```

Assim, basta rodar o `cat results.txt` com o comando `uniq -u` para receber somente a senha, sem o documento inteiro; tendo assim o primeiro script de *brute force*.

**Um aviso:**

Cada **daemon** (programa que roda pelo cron) é diferente. Nem sempre eles permitirão esses loops múltiplos; alguns podem trancar a conexão com muitos prompts. Há diversas e mais detalhadas maneiras de realizar o *brute force*.

___

## Level 25 -> 26

> Logar para o bandit 26 do 25 deve ser rasoávelmente fácil. O shell do user para o bandit26 não é /bin/bash, mas algo diferente. Ache o que é, como funciona, e como sair dele.

Primeiramente, irei descobrir qual é a shell rodando. Existe um arquivo que mostra todos os logins que rodam, suas permissões, e qual shell está rodando eles. É o arquivo dentro da pasta `/etc` chamado `passwd`.

Rodando ele e procurando a string do bandit26, você encontra isso:

`bandit26:x:11026:11026:bandit level 26:/home/bandit26:/usr/bin/showtext`

Abro a shell `/usr/bin/showtext` e vejo o que ela está rodando.

```bash
#!/bin/sh

export TERM=linux

exec more ~/text.txt
exit 0
```

Então, ele está rodando `~/text.txt` pelo programa `more`, e fazendo um `exit 0`, ou seja, dando *log-out* exatamente logo após rodar o outro arquivo.

`more` é um leitor de arquivos de paginação grande, que é geralmente rodado para evitar *overflow* de informação, somente renderizando uma parte de paginação por vez, continuando apenas após scroll. Ou seja, strings podem ser "pausados" para a tela em que não estiver visualizando eles. Quando a janela é muito menor do que o necessário para rodar as strings, ele entra em modo interativo, como se fosse um painel de edição desses comandos para dar *debug*.

Irei usar isso como *exploit*, sabendo agora que bandit26 roda com `more`.

Além disso, como sempre rodo `ls` na página principal, e pego os dados do arquivo `bandit26.sshkey`, copio para meu próprio terminal após sair.

Diminuo a tela o máximo possível tanto na horizontal quanto vertical, e entro com a key.

Ele tenta abrir a página inicial, mas ao invés disso, roda apenas o `more`; podendo ser aberto seu modo interativo ao apertar a letra `V`, abindo o editor `vim`. Tenho certeza que não estou no modo de inserção (apertar ESC).

Na `manpage`, há varios comandos para o editor `vim`. Um deles, é `set shell`. Ele irá mudar o tipo de shell que é utilizado no **vim**; modifico para bin/bash:

```bash
:set shell=/bin/bash
```

**Sempre é utilizado : antes do comando no editor `vim`**.

Pronto! Agora basta resumir/executar o shell de bandit26 novamente.

```bash
:shell
```

Ele irá abrir o servidor normalmente agora, e estamos no bandit26. Por precaução, pegarei a senha no arquivo de sempre `/etc/bandit_pass/bandit26`;

___

## Level 26 -> 27

>Parabéns pegando uma shell! Agora vá de pressa e pegue a senha para bandit27!

Se estiver no arquivo principal, é simples. Vemos que tem o `setuid` do bandit27. Rodo ele com:

```bash
./bandit27-do cat /etc/bandit_pass/bandit27
```

E obtenho a senha.

___

## Level 27 -> 28

>Há um repositório git em ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo pela porta 2220. A senha do user bandit27-git é a mesma do bandit27. Clone o repositório e ache a senha para o próximo nível.

**O que é Git?**

É um sistema de controle de versões. Códigos são geralmente atribuídos e salvos localmente ou remotamente, para ajudar na distribuição e visualização de alterações.

Nesse nível, mantenho no meu diretório. Em muitos casos, especialmente em bandit que está em constante mudança, permissões são trocadas. Eu tento abrir e clonar o repositório dentro do bandit27, e ele irá me dar esse erro:

```bash
Cloning into 'repo'...
The authenticity of host '[localhost]:2220 ([127.0.0.1]:2220)' can't be established.
ED25519 key fingerprint is SHA256:C2ihUBV7ihnV1wUXRb4RrEcLfXC5CXlhmAAM/urerLY.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Could not create directory '/home/bandit27/.ssh' (Permission denied).
Failed to add the host to the list of known hosts (/home/bandit27/.ssh/known_hosts).
                         _                     _ _ _
                        | |__   __ _ _ __   __| (_) |_
                        | '_ \ / _` | '_ \ / _` | | __|
                        | |_) | (_| | | | | (_| | | |_
                        |_.__/ \__,_|_| |_|\__,_|_|\__|

                      This is an OverTheWire game server.
            More information on http://www.overthewire.org/wargames

!!! You are trying to log into this SSH server with a password on port 2220 from localhost.
!!! Connecting from localhost is blocked to conserve resources.
!!! Please log out and log in again.

backend: gibson-0
Received disconnect from 127.0.0.1 port 2220:2: no authentication methods enabled
Disconnected from 127.0.0.1 port 2220
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

**O que isso significa?**

A linha `!!! Connecting from localhost is blocked to conserve resources.`, ou seja, o *host* bloqueou a usagem de conexão do localhost para não tomar muitos recursos do servidor. É algo comum, e não há problema sobre isso, somente muda a metodologia.

Primeiramente, crio uma pasta chamada `bandit27`.

Para clonar um repositório (fazer um download de sua cópia), é simples. Basta usar `git clone` e o endereço; com a porta sendo feita igual no `openssl`, utilizando `:`. Ele fica assim:

```bash
git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo
```
Reutilizo a senha do bandit27 quando o prompt pedir.

Pronto, quando dou `ls`, a pasta `repo` está dentro da minha pasta. Com isso, vejo que todas as pastas que clonarei, estarão como **repo**, então é melhor criar pastas para diferentes níveis, se não haverá conflito. Abro ela, e executo o arquivo `README`. Pronto, logo consigo a senha.

___

## level 28 -> 29

>tem um repositório git em ssh://bandit28-git@bandit.labs.overthewire.org/home/bandit28-git/repo pela porta 2220. a senha do bandit28-git é a mesma do bandit28. clone o repositório e ache a senha para o próximo nível.

isso utiliza as mesmas funções do bandit 27 -> 28, porém, com uma adição de alguns comandos:

`git log` e `git show`

`git log` mostra todo o controle de versões (commits). Quais commits existem, e os comentários.
`git show` abre esses commits para mostrar suas mudanças. as commits falarão isso:

```bash
commit b0354c7be30f500854c5fc971c57e9cbe632fef6 (head -> master, origin/master, origin/head)
author: morla porla <morla@overthewire.org>
date:   tue oct 14 09:26:19 2025 +0000

    fix info leak

commit d0cf2ab7dd7ebc6075b59102a980155268f0fe8f
author: morla porla <morla@overthewire.org>
date:   tue oct 14 09:26:19 2025 +0000

    add missing data

commit bd6bc3a57f81518bb2ce63f5816607a754ba730d
author: ben dover <noone@overthewire.org>
date:   tue oct 14 09:26:18 2025 +0000

    initial commit of readme.md
```

lendo os comentários, descubro que foi feita a versão original > a senha foi colocada > o **leak** de informações foi corrigido, agora temos nosso meio de obter o exploit. executo `git show` sem nada, e ele me dará as mudanças do último commit (escrito head); mostrando em vermelho o que foi removido (a senha), e em verde o que foi adicionado (a censura). caso eu queira ver dentro de outros commits, basta colocar seu id depois do `show`.

isso mostra que informações sensíveis ainda são armazenadas no histórico **mesmo** se já foram apagadas, por isso que efetua mudanças, deve tomar bastante cuidado. pego a senha, e vou para o próximo nível.

___

## Level 29 -> 30

>Tem um repositório Git em  ssh://bandit29-git@bandit.labs.overthewire.org/home/bandit29-git/repo pela porta 2220. A senha do user é a mesma do bandit29. Clone o repositório e ache a senha.

Nesse bandit, é mostrado *branches*, ou *ramificações*. Geralmente, em um repositório, existem branches diferentes para usuários terem melhor controle.

Quando rodo `git log` e `git show`, mostra apenas que não há senha, e só há modificação no usuário. Então, não temos informação nessa branch: devemos procurar por outras.

Com o comando `git branch -a`, ele lista **todas** as branches dentro de um repositório. Muito útil, pois vemos a branch de desenvolvimento `dev`. Geralmente, podemos estimar que credenciais, scripts de backend entre outras coisas estão armazenadas nas mesmas.

Assim, nós podemos utilizar o `git switch` utilizando `dev` como um argumento, mudo para o repositório de desenvolvedor. `git log` e `git show` já me mostram os commits, e eu consigo pegar a senha.

Esse nível mostra como quem possui uma credencial suficientemente alta, pode simplesmente entrar em outros caminhos do repositório mesmo estando em branches diferentes, e conseguir informações sensíveis: por isso, mesmo quando há uma senha robusta, não é certeza que estamos protegidos caso a administração do sistema e repositório em si é fraca.

## Level 30 -> 31

>Tem um repositório Git em ssh://bandit30-git@bandit.labs.overthewire.org/home/bandit30-git/repo pela porta 2220. A senha do user é a mesma do bandit30. Clone o repositório e ache a senha.

Para procurarmos uma senha ao invadir um repositório, devemos fazer um *checklist* mental sobre o que procurar: o óbvio, o lógico, e o escondido.

**Óbvio:**

Dentro do repositório. Uma mensagem que deixa escapar a senha ou sua localização. Commits com credenciais ou mudanças vindas de outras branches. Geralmente, somente um `git log` e `git show` pode mostrar.

**Lógico:**

Se não está dentro daquela branch, então deve estar em outra. Procura-se dentro de outras branches, vasculha por commits, *restaura* e dá *detach* na HEAD para ver se não há algo escondido no caminho. Comandos mais utilizados são `git branch`, `git branch -a`, e `git switch`, acima dos anteriores.

E quando não encontramos nada?

**Escondido:**

É feito por via das dúvidas. Não há nada, nenhum outro commit, outra branch; tudo que foi modificado não pode ser restaurado e somente aquele arquivo resta. Existem as `tags` que podem estar sobrando e o criador do repositório esqueceu de apagá-las. Uma `tag` marca um ponto no histórico do repositório, para representar uma mudança abrupta, um ponto que não se deve esquecer, um *checkpoint*. Algumas vezes, essas `tags` por não serem verificadas com frequência, podem ter credenciais dentro delas, como é o caso desse nível. Nós podemos tentar verificar se há alguma.

Rodo `git tag` e encontro a tag `secret` dentro do repositório. Simplesmente dou `git show secret` e já aparece a senha. Isso mostra que não importa "esconder" uma credencial. Se alguém invade seu repositório, dificilmente haverá uma maneira de proteger algo dentro dele, caso o invasor conheça os comandos necessários.

___

## Level 31 -> 32

>Tem um repositório Git em ssh://bandit31-git@bandit.labs.overthewire.org/home/bandit31-git/repo pela porta 2220. A senha do user é a mesma do bandit31. Clone o repositório e ache a senha.

Esse nível é um pouco complicado, pois ele mostra os comandos `git push`, `git add`, `git commit` e também sobre o `.gitignore`.

`git add` basicamente fala para Git quais são as mudanças que você vai querer jogar na atualização do repositório. Utilizaremos  `-f` junto ao add, por conta do `.gitignore`.

`.gitignore` é um arquivo que geralmente é criado para não deixar certos tipos de arquivos serem mandados para o repositório: geralmente utilizado para um controle mais rigoroso de versão, para evitar inclusão acidental de arquivos. `-f` junto ao `git add` força o Git a ignorar esse arquivo.

`git commit` de uma maneira mais simples, é uma atualização de versão na linha do tempo, uma *snapshot* para o desenvolvedor poder ter um controle e voltar caso seja necessária alguma mudança. 

`git push` então funciona para enviar esse commit para o repositório remoto, finalmente publicando ele para todos os usuários com permissão verem as mudanças.

**A senha**

Quando eu dou `cat` no arquivo `README.md`, ele fala o seguinte:

```bash
This time your task is to push a file to the remote repository.

Details:
    File name: key.txt
    Content: 'May I come in?'
    Branch: master
```

Então devo criar um arquivo `key.txt` com as palavras `May I come in?`

Eu utilizo `nano` por costume, mas tem como simplesmente escrever `echo "May I come in?" > key.txt`

Utilizo `git add -f key.txt`, e então `commit`. Escrevo qualquer coisa no commit quando abre a tela de edição, e finalmente dou push:

`git push -u origin master`. `u` serve para arrumar a *upstream*, ou seja, esse será seu repositório *push* padrão, depois que fizer da primeira vez. `origin` é o nome automático que o terminal fornece a um repositório remoto quando ele é clonado, e `master` é a branch que será feito o push.

Finalmente, recebo a senha. Esse nível demonstra não apenas a invasão, mas como utilizar Git para enviar um arquivo ao repositório remoto como criador. Também, demonstra como configurações incorretas podem acarretar em acessos indevidos, caso o repositório não esteja seguro.

___

## Level 32 -> 33

>Depois de todas essas coisas de git, está na hora de uma outra escapada. Boa sorte!

Ao entrar nesse login, recebemos um aviso `WELCOME TO UPPERCASE SHELL`. Significa que essa shell está rodando todos os *inputs* do usuário em caps; fazendo comandos não rodar por serem case-sensitive. 

Isso é uma introdução para **variáveis**, `locais` que estão disponiveis na shell, `shell` que são *feitas* pela shell, e `ambientais` que são variáveis disponíveis no sistema todo. Essas variáveis estão sempre em uppercase, perfeitas para serem rodadas nesse sistema.

Utilizo a variável `$0` como encontrada nas manpages, ela se expande para o nome da shell ou script sendo utilizado(a), com a variável e shell sendo executadas, transformando assim o `$0` em algo "seguro" para rodar comandos.

Assim, eu rodo em modo de variável o `cat` para ler a senha: `/etc/bandit\_pass/bandit33`

**Por que o `\`?**

Como as manpages ensinam, com essa uppercase shell, o `_` também é afetado e modificado. `\` se utiliza para dizer ao sistema para manter ele como ele está. 

Simples e prático, esse último nível oferece uma boa introdução para variáveis básicas e como afetam shells.

# **CONCLUSÃO**

**Bandit** é um ótimo bootcamp para ensinar Linux, e um pontapé inicial para criptografia e cibersegurança. Ele não só ensina como navegar um terminal Linux, mas também como qutilizar exploits dentro dele, acessar redes externas, codificação e criptografia básica: até como a realização de scripts a  realizar ataques de *brute-force*.

É um passo essencial na introdução dos conceitos Linux, e uma ótima aula de como aprender a utilizar mais conceitos, ao invés de somente *codar* sem explicação. Você aprende a pensar fora da caixa, e transformar seu mindset em um de investigação e curiosidade.