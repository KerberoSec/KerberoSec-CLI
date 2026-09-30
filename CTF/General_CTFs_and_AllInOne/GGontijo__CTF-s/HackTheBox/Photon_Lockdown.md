<h1 align="center">Photon Lockdown</h1>
<p align="center">
<img src="https://avatars.githubusercontent.com/u/31746234?s=200&v=4" alt="HackTheBox"/> 
</p>
<h3 align="center">Hack The Box | Dificuldade: Muito Fácil</h3>
<p> Esse desafio foi bastante simples. O zip que é disponibilizado na plataforma contém os seguintes arquivos:</p>

*[Image: alt text]*
<p> Contém o seguinte conteúdo:</p>

*[Image: alt text]*

<p> A existência dos arquivos fwu_ver e hw_ver não tem importância, na descrição do desafio ele cita que o conteúdo é uma cópia do firmware do dispositivo adversário.</p>
<p> O que realmente importa para nós aqui é o arquivo rootfs do linux embarcado, para extrairmos o sistema de arquivos dele podemos montá-lo ou extrai-lo utilizando alguma ferramenta como o unsquashfs que pode ser obtido por meio do pacote squashfs-tools.</p>
<p> Após a extração pdoemos ver a estrutura de arquivos do sistema embarcado:</p>

*[Image: alt text]*

*[Image: alt text]*

<p> Feito isso, buscamos o formato da flag pelo sistema de arquivos e encontramos a flag: </p>

`grep -r '.' -e 'HTB' 2>/dev/null`

*[Image: alt text]*
