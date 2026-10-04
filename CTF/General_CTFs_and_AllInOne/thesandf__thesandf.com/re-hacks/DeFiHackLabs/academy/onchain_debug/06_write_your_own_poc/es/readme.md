# Debugging/Análisis OnChain de Transacciones: 6. Escribe tu propio PoC (Reentrancy)

Autor: [gbaleeee](https://twitter.com/gbaleeeee)

Traducción: [JP](https://x.com/CanonicalJP) 

Comunidad [Discord](https://discord.gg/Fjyngakf3h)

Este trabajo también fue publicado en XREX | [WTF Academy](https://github.com/AmazingAng/WTF-Solidity#%E9%93%BE%E4%B8%8A%E5%A8%81%E8%83%81%E5%88%86%E6%9E%90)

En este artículo, aprenderemos sobre reentrancy demostrando un ataque del mundo real y usando Foundry para realizar pruebas y reproducirlo.

## Prerrequisitos
1. Comprender los vectores de ataque comunes en los contratos inteligentes. [DeFiVulnLabs](https://github.com/SunWeb3Sec/DeFiVulnLabs) es un excelente recurso para comenzar.
2. Conocer cómo funciona el modelo básico de DeFi y cómo los contratos inteligentes interactúan entre sí.

## Qué es un Ataque de Reentrancy

Fuente: [Reentrancy](https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/) por Consensys.

El Ataque de Reentrancy es un vector de ataque popular. Ocurre casi cada mes si observamos la base de datos de [DeFiHackLabs](https://github.com/SunWeb3Sec/DeFiHackLabs). Para más información, hay otro excelente repositorio que mantiene una colección de [ataques de reentrancy](https://github.com/pcaversaccio/reentrancy-attacks).

En resumen, si una función invoca una llamada externa no confiable, podría existir un riesgo de ataque de reentrancy.

Los Ataques de Reentrancy se pueden identificar principalmente en tres tipos:
1. Reentrancy de Función Única
2. Reentrancy de Función Cruzada
3. Reentrancy de Contrato Cruzado

## PoC práctico: DFX Finance

- Fuente: [Alerta de Pckshield 11/11/2022](https://twitter.com/peckshield/status/1590831589004816384)
  > Parece que el pool DEX de @DFXFinance (llamado Curve) ha sido hackeado (con una pérdida de 3000 ETH o ~$4M) debido a la falta de una protección adecuada contra reentrancy. Aquí hay una transacción de ejemplo: https://etherscan.io/tx/0x6bfd9e286e37061ed279e4f139fbc03c8bd707a2cdd15f7260549052cbba79b7. Los fondos robados están siendo depositados en @TornadoCash

- Visión general de la transacción

  Basándonos en la transacción anterior, podemos observar información limitada de etherscan. Incluye información sobre el remitente (atacante), el contrato del atacante, eventos durante la transacción, etc. La transacción está etiquetada como "Transacción MEV" y "Flashbots", lo que indica que el atacante intentó evadir el impacto de los bots de front-running.
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215320542-a7798698-3fd4-4acf-90bf-263d37379795.png)  
  
- Análisis de la transacción
  
  Podemos usar [Phalcon de Blocksec](https://phalcon.blocksec.com/tx/eth/0x6bfd9e286e37061ed279e4f139fbc03c8bd707a2cdd15f7260549052cbba79b7) para hacer una investigación más profunda.

- Análisis de saldo 

  En la sección *Cambios de Saldo*, podemos ver la alteración en los fondos con esta transacción. El contrato de ataque (receptor) recolectó una gran cantidad de tokens `USDC` y `XIDR` como beneficio, y el contrato llamado `dfx-xidr-v2` perdió una gran cantidad de tokens `USDC` y `XIDR`. Al mismo tiempo, la dirección que comienza con `0x27e8` también obtuvo algunos tokens `USDC` y `XIDR`. Según la investigación de esta dirección, esta es la dirección de la billetera multi-firma de gobernanza de DFX Finance.

  ![imagen](https://user-images.githubusercontent.com/53768199/215320922-72207a7f-cfac-457d-b69e-3fddc043206b.png)  

  Basándonos en las observaciones anteriores, la víctima es el contrato `dfx-xidr-v2` de DFX Finance y los activos perdidos son tokens `USDC` y `XIDR`. La dirección multi-firma de DFX también recibe algunos tokens durante el proceso. Basándonos en nuestra experiencia, debería estar relacionado con la lógica de las comisiones.

- Análisis del flujo de activos

  Podemos usar otra herramienta de Blocksec llamada [metasleuth](https://metasleuth.io/result/eth/0x6bfd9e286e37061ed279e4f139fbc03c8bd707a2cdd15f7260549052cbba79b7) para analizar el flujo de activos.

  ![imagen](https://user-images.githubusercontent.com/53768199/215321213-7ead5043-1410-4ab6-b247-1e710d931fe8.png)

  Basándonos en el gráfico anterior, el atacante pidió prestada una gran cantidad de tokens `USDC` y `XIDR` del contrato víctima en los pasos [1] y [2]. En los pasos [3] y [4], los activos prestados fueron enviados de vuelta al contrato víctima. Después de eso, los tokens `dfx-xidr-v2` son acuñados para el atacante en el paso [5] y la billetera multi-firma de DFX recibe la comisión tanto en `USDC` como en `XIDR` en los pasos [6] y [7]. Al final, los tokens `dfx-xidr-v2` son quemados de la dirección del atacante.

  En resumen, el flujo de activos es:
  1. El atacante pidió prestados tokens `USDC` y `XIDR` del contrato víctima.
  2. El atacante envió los tokens `USDC` y `XIDR` de vuelta al contrato víctima.
  3. El atacante acuñó tokens `dfx-xidr-v2`.
  4. La billetera multi-firma de DFX recibió tokens `USDC` y `XIDR`.
  5. El atacante quemó tokens `dfx-xidr-v2`.

  Esta información puede ser verificada con el siguiente análisis de trazas.

- Análisis de trazas

  Observemos la transacción bajo el nivel de expansión 2.

  ![imagen](https://user-images.githubusercontent.com/53768199/215321768-6aa93999-9a77-4af5-b758-dd91f7dc3973.png) 

  El flujo completo de ejecución de funciones de la transacción de ataque puede verse como:

  1. El atacante invocó la función `0xb727281f` para el ataque.
  2. El atacante llamó a `viewDeposit` en el contrato `dfx-xidr-v2` vía `staticcall`.
  3. El atacante activó la función `flash` en el contrato `dfx-xidr-v2` con `call`. Vale la pena notar que en esta traza, la función `0xc3924ed6` en el contrato de ataque se usó como callback.

  ![imagen](https://user-images.githubusercontent.com/53768199/215322039-59a46e1f-c8c5-449f-9cdd-5bebbdf28796.png) 

  4. El atacante llamó a la función `withdraw` en el contrato `dfx-xidr-v2`.

- Análisis detallado

  La intención del atacante al llamar a la función viewDeposit en el primer paso se puede encontrar en el comentario de la función `viewDeposit`. El atacante quiere obtener el número de tokens `USDC` y `XIDR` para acuñar 200_000 * 1e18 tokens `dfx-xidr-v2`.

  ![imagen](https://user-images.githubusercontent.com/53768199/215324532-b441691f-dae4-4bb2-aadb-7bd93d284270.png)  

  Y en el siguiente paso ataca usando el valor de retorno de la función `viewDeposit` como un valor similar para la entrada de la invocación de la función `flash` (el valor no es exactamente el mismo, más detalles después)
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215329296-97b6af11-32aa-4d0a-a7c4-019f355be04d.png)

  El atacante invoca la función `flash` en el contrato víctima como segundo paso. Podemos obtener algunas ideas del código:
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215329457-3a48399c-e2e1-43a8-ab63-a89375fbc239.png)  

  Como puedes ver, la función `flash` es similar al flash loan en Uniswap V2. El usuario puede pedir prestados activos a través de esta función. Y la función `flash` tiene una función de callback para el usuario.

  ```solidity
  IFlashCallback(msg.sender).flashCallback(fee0, fee1, data);
  ```
  
  Esta invocación corresponde a la función de callback en el contrato del atacante en la sección anterior de análisis de trazas. Si hacemos la verificación de Hash de 4Bytes, es `0xc3924ed6` 

  ![imagen](https://user-images.githubusercontent.com/53768199/215329899-a6f2cc00-f2ac-49c8-b4df-38bb24663f37.png)  
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215329919-bbeb557d-41d0-47fb-bdf8-321e5217854e.png)  
  
  El último paso es llamar a la función `withdraw`, y quemará el token estable (`dfx-xidr-v2`) y retirará los activos emparejados (`USDC`, `XIDR`).

  ![imagen](https://user-images.githubusercontent.com/53768199/215330132-7b54bf35-3787-495a-992d-ac2bcabb97d9.png)  

- Implementación del PoC

  Basándonos en el análisis anterior, podemos implementar el esqueleto del PoC a continuación:

```solidity
  contract EXP {
      uint256 amount;
      function testExploit() public{
        uint[] memory XIDR_USDC = new uint[](2);
        XIDR_USDC[0] = 0;
        XIDR_USDC[1] = 0;
        ( , XIDR_USDC) = dfx.viewDeposit(200_000 * 1e18);
        dfx.flash(address(this), XIDR_USDC[0] * 995 / 1000, XIDR_USDC[1] * 995 / 1000, new bytes(1)); // 5% fee
        dfx.withdraw(amount, block.timestamp + 60);
    }
  
    function flashCallback(uint256 fee0, uint256 fee1, bytes calldata data) external{
        /*
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        */
    }
  }
  ```

  Es probable que surja la pregunta de cómo un atacante roba activos con la función `withdraw` en un flash loan. Obviamente, esta es la única parte en la que el atacante puede trabajar. Ahora profundicemos en la función de callback: 
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215330695-1b1fa612-4f01-4c6a-a5be-7324f464ecb1.png)

  Como puedes ver, el atacante llamó a la función `deposit` en el contrato víctima y recibirá los activos numerarios que el pool soporta y acuñará tokens de curvas. Como se mencionó en el gráfico anterior, `USDC` y `XIDR` se envían a la víctima a través de `transferFrom`.
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215330576-d15642f7-5819-4e83-a8c8-1d3a48ad8c6d.png)
  
  En este punto, se sabe que la finalización del flash loan se determina comprobando si los activos de tokens correspondientes en el contrato son mayores o iguales al estado antes de la ejecución del callback del flash loan. Y la función `deposit` hará que esta validación se complete.

 ```solidity
  require(balance0Before.add(fee0) <= balance0After, 'Curve/insufficient-token0-returned');
  require(balance1Before.add(fee1) <= balance1After, 'Curve/insufficient-token1-returned');
  ```

  Debe notarse que el atacante preparó algunos tokens `USDC` y `XIDR` para el mecanismo de comisiones del flash loan antes del ataque. Es por eso que el depósito del atacante es relativamente mayor que la cantidad prestada. Así que la cantidad total para la invocación de `deposit` es la cantidad prestada con el flash loan más la comisión. La validación en la función `flash` puede pasarse con esto.

  Como resultado, el atacante invocó `deposit` en la función de callback, evitó la validación en el flash loan y dejó el registro para el depósito. Después de todas estas operaciones, el atacante retiró los tokens.

  En resumen, el flujo completo del ataque es:
  1. Preparar algunos tokens `USDC` y `XIDR` por adelantado.
  2. Usar `viewDeposit()` para obtener el número de activos para el posterior `deposit()`.
  3. Hacer flash de tokens `USDC` y `XIDR` basándose en el valor de retorno del paso 2.
  4. Invocar la función `deposit()` en el callback del flash loan.
  5. Ya que tenemos un registro de depósito en el paso anterior, ahora retiramos los tokens.
  
  La implementación completa del PoC:  

  ```solidity
  contract EXP {
      uint256 amount;
      function testExploit() public{
        uint[] memory XIDR_USDC = new uint[](2);
        XIDR_USDC[0] = 0;
        XIDR_USDC[1] = 0;
        ( , XIDR_USDC) = dfx.viewDeposit(200_000 * 1e18);
        dfx.flash(address(this), XIDR_USDC[0] * 995 / 1000, XIDR_USDC[1] * 995 / 1000, new bytes(1)); // 5% fee
        dfx.withdraw(amount, block.timestamp + 60);
    }

      function flashCallback(uint256 fee0, uint256 fee1, bytes calldata data) external{
        (amount, ) = dfx.deposit(200_000 * 1e18, block.timestamp + 60);
    }
  }
  ```

  Se puede encontrar una base de código más detallada en el repositorio DefiHackLabs: [DFX_exp.sol](https://github.com/SunWeb3Sec/DeFiHackLabs/blob/main/src/test/2022-11/DFX_exp.sol)

- Verificar el Flujo de Fondos  
  
  Ahora, podemos verificar el gráfico de flujo de activos con los eventos de tokens durante la transacción.
  
  ![imagen](https://user-images.githubusercontent.com/53768199/215331469-e1edd9b4-5147-4f82-9e38-64edce3cc91f.png)

  Al final de la función `deposit`, los tokens `dfx-xidr-v2` fueron acuñados para el atacante. 

  ![imagen](https://user-images.githubusercontent.com/53768199/215331545-9730e5b0-564d-45d8-b169-3b7c8651962f.png)

  En la función `flash`, el evento de transferencia muestra la recolección de comisiones (`USDC` y `XIDR`) para la billetera multi-firma de DFX.

  ![imagen](https://user-images.githubusercontent.com/53768199/215331819-d80a1775-4056-4ddd-9083-6f5241d07213.png)

  La función `withdraw` quemó los tokens `dfx-xidr-v2` que fueron acuñados en los pasos anteriores.

- Resumen

  El ataque de reentrancy a DFX Finance es un típico ataque de reentrancy de función cruzada, donde el atacante completa la reentrancy llamando a la función `deposit` en la función de callback del flash loan. 
  
  Vale la pena mencionar que la técnica de este ataque corresponde exactamente a la cuarta pregunta en el CTF damnvulnerabledefi [Side Entrance]. Si los desarrolladores del proyecto lo hubieran hecho cuidadosamente antes, quizás este ataque no habría ocurrido 🤣. En diciembre del mismo año, el proyecto [Deforst](https://github.com/SunWeb3Sec/DeFiHackLabs#20221223---defrost---reentrancy) también fue atacado debido a un problema similar.

## Material de Aprendizaje (en Inglés)
[Ataques de Reentrancy en Contratos Inteligentes Destilados](https://blog.pessimistic.io/reentrancy-attacks-on-smart-contracts-distilled-7fed3b04f4b6)  
[Post Mortem de C.R.E.A.M. Finance: Exploit de AMP](https://medium.com/cream-finance/c-r-e-a-m-finance-post-mortem-amp-exploit-6ceb20a630c5)  
[Ataque de Reentrancy de Contrato Cruzado](https://inspexco.medium.com/cross-contract-reentrancy-attack-402d27a02a15)  
[Post-Mortem de la Recompensa por Errores de la Estrategia de Rendimiento de Sherlock](https://mirror.xyz/0xE400820f3D60d77a3EC8018d44366ed0d334f93C/LOZF1YBcH1eBdxlC6HP223cAMeTpNgQ-Kc4EjQuxmGA)  
[Decodificando el Exploit de Reentrancy de Solo Lectura de $220K | QuillAudits](https://quillaudits.medium.com/decoding-220k-read-only-reentrancy-exploit-quillaudits-30871d728ad5)  

