#**INTRO**

>Krypton é a introdução para codificação/decodificação e criptografia. Nela, o usuário aprende a *procurar* ao invés de simplesmente seguir o código.
>Um laboratório interativo e prático, ensinando como realizar funções um pouco mais avançadas para desvendar senhas próprias.
>É esperado conhecimento sobre as funções do **Bandit**. Não faça esse laboratório antes, muitas coisas vão passar despercebidas, mesmas coisas que serão fáceis caso realize o Camp anterior.

___

## Krypton 0 -> 1

>Bem vindo ao Krypton! Esse nível é fácil. A string a seguir codifica a senha usando Base64:
>S1JZUFRPTklTR1JFQVQ=
>Use essa senha para logar no krypton.labs.overthewire.org com o usuário krypton1 usando SSH na porta 2231. Você pode encontrar as senhas para os próximos níveis em `/krypton`.

Incrivelmente fácil, e retorna para os níveis de decodificação do Bandit. Utilizo o sistema de decodificação do `Base64` após dar `echo` da senha:

```bash
echo "S1JZUFRPTklTR1JFQVQ=" | base64 -d
```

A senha logo aparece ao lado do meu usuário.

___

## Krypton 1 -> 2

>A senha do nível 2 está no arquivo `krypton2`. Está 'codificado' usando uma rotação simples.

É muito simples, apenas utilizando a rotação que aprendemos no Bandit: `ROT13`. Identificando o arquivo, eu utilizo o mesmo 'cheatsheet' do que aprendi no ROT13, copiando das minhas anotações, e colando junto com a cifra:

```bash
cat krypton2 | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

Facilmente assim, adquiro a senha para o próximo nível.

___

## Krypton 2 -> 3

>ROT13 é uma simples cifra de substituição...

Krypton 2 utiliza a cifra de **CAESAR** para fazer a criptografia do arquivo `krypton3`. Existem alguns arquivos dentro da pasta junto com ele, `encrypt` que utiliza a cifra para rapidamente criptografar, `keyfile.dat` que mostra para o encrypt como criptografar, e o `README` mostrando como esses arquivos são utilizados para fazer a criptografia.

Como visto no `README`, crio uma pasta temporária e utilizo o comando `ln -s`, que cria um link a partir do nome do arquivo; basta eu colocar o caminho `/krypton/krypton2/keyfile.dat` e ele está na pasta como se tivesse sido copiado. `encrypt` roda com as permissões de krypton 3, então dou permissão total para a minha pasta.

Rodo agora um `echo` básico com o alfabeto inteiro e salvo em um arquivo chamado `alphabet`, ele será minha base para saber como é feita a criptografia. Usar o arquivo é simples:

```bash
/krypton/krypton2/encrypt [TMPFILE]/alphabet
```

Logo recebo o arquivo `ciphertext`. Agora, tenho a base de como será a senha:

A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
M N O P Q R S T U V W X Y Z A B C D E F G H I J K L

Quando abri o `krypton3`, a senha foi dada. Utilizo essa base ao lado, e vejo quais letras utilizar para decriptografar. Por exemplo, **O** na verdade seria o **C**, **Q** seria o **E**, adiante. Com isso, tenho a senha para o próximo Krypton, e conhecimento sobre como decriptografar uma cifra CAESAR.

___

## Krypton 3 -> 4

>Muito bem. Você passou de uma cifra fácil de substituição. A maior fraqueza de uma cifra de substituição é o uso repetido de uma *key* fácil. No último nível...
>Nesse exemplo, o mecanismo da cifra não vai estar disponível para você, o *attacker*. A senha do próximo nível está em `krypton4`.

Aqui aprendemos sobre interpretação de cifras e análise de frequência.

Nós nos deparamos com os arquivos `found1` `found2` e `found3`, também com o `README` que fala o enunciado, `HINT1` e `HINT2`, e finalmente a nosso arquivo com a cifra, `krypton4`.

Abrindo as dicas, ele fala que umas letras em inglês são mais proeminentes que outras, também diz que "análise de frequência é sua amiga".

**O que é Análise de Frequência?**

Com uma pesquisa no Google, podemos ver que no mundo de criptografia, nada mais é que a análise de padrões frequentes em um item; seja uma cifra, um script, entre outras coisas. Primeiramente, nós iremos ver a frequência das diversas letras que vemos se formando nos arquivos `found`.

Pesquisando pelas manpages e fóruns, a melhor maneira que encontrei de realizar uma busca simples de frequência é com o comando:

```bash
cat found1 found2 found3 | fold -w1 | sort | uniq -c | sort -nr
```

Esses sufixos são bem simples. `fold -w1` é utilizado para manter cada palavra em uma linha. `sort` como visto no Bandit, irá agrupar as letras similares juntas, `uniq -c` irá contá-las, e o sufixo `-nr` do `sort` mostra as letras mais frequentes primeiro. Aparecerá assim:

```bash
704
456 S
340 Q
301 J
257 U
246 B
240 N
227 G
227 C
210 D
132 Z
130 V
129 W
86 M
84 Y
75 T
71 X
67 K
64 E
60 L
55 A
28 F
19 I
12 O
4 R
4 H
2 P
```
essas são as letras mais frequentes ordenadas, então assim caracterizadas em ordem: `S Q J U B N G C D Z V W M Y T X K E L A F I O R H P`, vista pelo número (quantidade) em que essas letras aparecem.

Com isso, temos nosso 'alfabeto' de frequência. Utilizo a outra dica para pesquisar no Google quais são as letras mais frequentes na lingua inglesa, que são de acordo com a tabela de frequência de Cornell: `E T A O I N S R H D L U C M F Y W G P B V K X Q J Z`.

Finalmente, rodo o comando para traduzir a cifra como utilizei para ROT13, `tr` é o seu aliado na criptografia.

```bash
cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'ETAOINSRHDLUCMFYWGPBVKXQJZ'
```

Recebo isso: `WELLU ISEAH ELEKE LYICN MTOOW INURO BNCAE`

Não, isso não foi feito errado.

As dicas são somente para dar um pontapé inicial para decifrar as palavras-chave. Agora, a **análise de frequência** entra como a discernição de dados comuns e reconheciveis. Saber inglês é crucial para decifrar, utilizo contexto para começar a desvendar a palavra-chave.

Vimos que na primeira parte temos `WELL`, e logo podemos pensar que está tentando dizer **WELL DONE**. Com isso, iremos mudar o alfabeto de frequência em **inglês** para decifrar. Invertemos as letras `U I S` das **letras frequentes em inglês** por `D O N`, sabemos que `E` está certo: 

```bash
# antes:
cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'ETAOINSRHDLUCMFYWGPBVKXQJZ'
# depois:
cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'ETAIOSNRHULDCMFYWGPBVKXQJZ'
```
Recebemos:

`WELLD ONEAH ELEKE LYOCS MTIIW OSDRI BSCAE`

Depois, vejo que tem uma parte com letras juntas, `II` perto do `W O`, com um `S` entre o `D`. Como vemos na mesama cifra, já temos o `L L` com dupla, e deciframos as outras letras com o `WELLDONE`. Troco o `S` pelo `R`, e o `II` pelo `S`, depois invertendo o `I` e `R`. Aos poucos, verifico e tento trocar pela palavra `PASSWORD`. 

```bash

# antes:
cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'ETAIOSNRHULDCMFYWGPBVKXQJZ'
# depois:
cat krypton4 | tr 'SQJUBNGCDZVWMYTXKELAFIORHP' 'EATSORNIHULDCPFYWGPBVKXQJZ'
```

Então:

`WELLD ONETH ELEKE LYOCR PASSW ORDIS BRCTE`

Troco os mais óbvios: `C` por `U`, `K` pelo `V` e finalmente `Y` pelo `F`, tendo então a resposta do nível 4.

Assim aprendemos muito bem a reconhecer padrões. Não foi na primeira tentativa que consegui sozinho, e esse nível ensina sobre pesquisa e treinamento de mente para a interpretação de contexto. É complicado, mas nada impossível: tutoriais ajudam bastante, e com o tempo conseguimos adquirir essa "visão" para cifras. 

## Krypton 4 -> 5

>Você provavelmente usou alguma forma de FA e senso comum para resolver esse...

Esse nível utiliza a Cifra de Vigenère, que utiliza uma tabela de diferentes Cifras de César, de uma maneira mais simplificada. A tabela de Vigenère utiliza um alfabeto base de A a Z tanto nas linhas quanto nas colunas. Então dentro dela, o mesmo alfabeto porém repetido de uma forma que a próxima letra na linha seja a primeira. Por exemplo:

```bash
ABCDEFGH...
BCDEFGHI...
CDEFGHIJ...
``` 
Entre outros. A pessoa escreve uma frase, tipo **ATACAR O ALVO**, e então uma palavra cifra, tipo **CHAVE**, repetindo ela até o comprimento da frase. Exemplo:

```bash
ATACAROALVO
CHAVECHAVEC
```
As frases para codificar na cifra, correspondem à **linha base** da tabela, enquanto a cifra em si é **coluna**.  Por exemplo, a primeira letra fica na linha **A** e coluna **C**; dando a letra **C** codificada. No todo, a frase ficará assim:

```bash
CAAXET V AGZQ
```

Sabendo a cifra, é fácil decodificar. O problema maior é fazer isso *sem* a cifra. Nesse lab do *Krypton*, só sabemos que a cifra possui **6 letras**. Para desvendar isso manualmente, teria que ser feito um script para fazer o *parse* das letras no found1, 2, e 3.

Para resolver isso manualmente, seria possível escrever um script para realizar análise de frequência e testar possíveis chaves com base no tamanho conhecido.

Como o desafio já fornece o tamanho da chave (6), utilizei uma ferramenta de análise de cifra de Vigenère para acelerar o processo de identificação da chave.

A técnica que utilizei foi pesquisada no StackOverFlow e outros blogs, a fim de fazer a resolução de uma maneira mais eficaz.

Para auxiliar na análise da cifra, utilizei a ferramenta:

[dCode Vigenère Cipher Tool](https://www.dcode.fr/vigenere-cipher)

**OBS: Não utilize adblocks nesse site, pois tem problemas com o decodificador.**

Ele está em francês, porém com tradução do Google fica bem fácil de decifrar. Após analisar os arquivos **found1** e **found2**, identifiquei que o conteúdo cifrado relevante está no arquivo **found1**. Copio *todo* o texto dele no campo **Vigenere Cifrado**. Como sei apenas a quantidade de letras da cifra, seleciono *Saber o comprimento/tamanho da chave, número de letras:*, e coloco **6** na caixa. Aperto *DECODIFICAÇÂO* e no canto esquerdo aparece o resultado.

Há diversas colunas de letra, mas o importante é o primeiro resultado sozinho ao lado, essa é a *chave*.

Agora, no campo cifrado coloco a frase dentro do arquivo **krypton5**, e no método de descriptografia, coloco a chave que acabei de adquirir, na primeira opção: logo decodifico.

Chave encontrada: XXXXX
Senha para o nível Krypton5: XXXXX

Finalmente, obtenho a frase para entrar no Krypton 5.