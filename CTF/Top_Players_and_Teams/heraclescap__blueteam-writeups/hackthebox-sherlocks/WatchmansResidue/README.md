# Holmes 2025 2 : The Watchman's Residue

> Un MSP compromis, un bot IA manipulé, un accès TeamViewer volé. Moriarty est passé par là.

| Lab | Catégorie | Difficulté | Statut |
|---|---|---|---|
| [Holmes 2025 2 : The Watchman's Residue](https://app.hackthebox.com/sherlocks/TheWatchmansResidue) | SOC | Medium | 19/19 ✅ |

**Tactiques MITRE couvertes** : Initial Access, Execution, Credential Access, Persistence, Exfiltration, Lateral Movement

---

## Contexte

Le MSP CogWork gère l'infrastructure financière de la ville. Son bot d'helpdesk IA, `MSP-HELPDESK-AI`, répond aux tickets des techniciens. Moriarty s'en sert comme point d'entrée.

Le challenge fournit une image de triage KAPE de la workstation `CENTRAL-WS-5`, les logs TeamViewer, et un PCAP. Pas de Sysmon, pas de SRUM, pas de Prefetch dans la collecte. Pas de fichier JSON de chat non plus : toute la conversation entre l'attaquant et le bot est reconstituée depuis les flux HTTP du PCAP. Ça oblige à jongler entre plusieurs sources là où une seule aurait suffi dans un environnement mieux outillé.

---

## Outils utilisés

- **Wireshark** pour l'analyse du PCAP (Q1 à Q6, Q9)
- **Bloc Notes** pour parcourir les logs TeamViewer
- **Timeline Explorer** (Eric Zimmerman) pour les CSV EZParser
- **Registry Explorer** (Eric Zimmerman) pour les ruches NTUSER.DAT et SYSTEM
- **John the Ripper** pour cracker le master password KeePass
- **KeePass** pour ouvrir le fichier `.kdbx` exfiltré
- **KAPE avec !EZParser** pour la collecte et le parsing initial

---

## Investigation pas à pas

### Q1. IP de la machine décommissionnée

Premier réflexe sur le PCAP : ouvrir la table des conversations IPv4 dans Wireshark (Statistics > Conversations). L'adresse `10.0.69.45` ressort en tête avec le volume de trafic le plus élevé. Pour confirmer que c'est bien la machine qui a initié le chat avec le bot, un filtre HTTP ciblant les échanges avec `MSP-HELPDESK-AI` depuis cette IP lève le dernier doute.

**Réponse** : `10.0.69.45`

*[Image: Wireshark: table des conversations IPv4, 10.0.69.45 en tête]*

*[Image: Wireshark: filtre HTTP confirmant les échanges avec MSP-HELPDESK-AI depuis 10.0.69.45]*

---

### Q2. Hostname de la machine décommissionnée

J'aurais pu aller chercher directement la clé `ComputerName` dans la ruche SYSTEM via Registry Explorer, mais le PCAP répondait avant même d'ouvrir KAPE. En filtrant sur `ip.addr == 10.0.69.45`, un paquet NetBIOS Browser émis très tôt dans la capture contient un `Host Announcement` avec le nom de la machine en clair. Des requêtes NBNS pour `WATSON-ALPHA-2` dans la foulée confirment sans ambiguïté.

Le nom n'est pas anodin. On verra plus loin que l'attaquant signe ses messages "I AM WATSON" et que son compte TeamViewer s'appelle James Moriarty. Le challenge pousse la référence Sherlock Holmes jusqu'au bout.

**Réponse** : `WATSON-ALPHA-2`

*[Image: Wireshark: NBNS Host Announcement révélant le hostname WATSON-ALPHA-2]*

---

### Q3. Premier message de l'attaquant au chatbot

Les messages entre la machine de l'attaquant et le bot transitent en HTTP/JSON via l'endpoint `/api/messages/send`. Un filtre sur les requêtes POST émises par `10.0.69.45` fait ressortir tous les échanges. En suivant le flux 39 (Follow HTTP Stream), la conversation se reconstruit depuis le début et le premier message de l'attaquant apparaît dans le payload JSON.

**Réponse** : `Hello Old Friend`

*[Image: Wireshark: HTTP Stream flux 39, premier message de l'attaquant au chatbot]*

*[Image: Wireshark: HTTP Stream flux 39, premier message de l'attaquant au chatbot]*

---

### Q4. Heure du leak des credentials RMM

Le flux 63 contient la suite de la conversation, celle qui nous intéresse. On voit l'attaquant tenter une demande directe de credentials RMM qui se fait refuser proprement par le bot. Il change alors d'angle : il se présente comme technicien IT et glisse la même demande de credentials à l'intérieur d'une requête de troubleshooting qui semble parfaitement légitime. Le bot capitule à `2025-08-19T12:02:06.129Z`.

C'est un prompt injection par accumulation de contexte. Le modèle a priorisé la cohérence de la tâche sur sa règle de sécurité. La première demande échoue, la deuxième habillée en contexte légitime passe sans problème.

**Réponse** : `2025-08-19 12:02:06`

*[Image: Wireshark: flux 63, le bot capitule face à la demande habillée en contexte légitime]*

---

### Q5. Device ID et mot de passe du RMM

Toujours dans le flux 63, dans la réponse du bot qui suit immédiatement le prompt injection. Les credentials apparaissent en clair dans le corps de la réponse HTTP.

**Réponse** : `565963039:CogWork_Central_97&65`

*[Image: Wireshark: flux 63, credentials RMM en clair dans la réponse HTTP du bot]*

---

### Q6. Dernier message de l'attaquant

Fin du flux 63. L'attaquant envoie un message aléatoire sans trop de signification.

**Réponse** : `JM WILL BE BACK`

*[Image: Wireshark: flux 63, dernier message de l'attaquant : JM WILL BE BACK]*

---

### Q7. Heure d'accès à la workstation CogWork

Dans le dossier TeamViewer de la collecte KAPE, `Connections_incoming.txt` liste toutes les sessions entrantes avec les heures de début et de fin, directement en UTC. Trois sessions y figurent. Les deux premières viennent d'un compte `Cog-IT-ADMIN3` en août. La troisième est celle de James Moriarty le 20 août, avec une heure de début à `09:58:25`.

**Réponse** : `2025-08-20 09:58:25`

*[Image: Explorateur de fichiers: dossier TeamViewer contenant Connections_incoming.txt et TeamViewer15_Logfile.log]*

*[Image: Connections_incoming.txt: session James Moriarty le 20/08/2025 à 09:58:25 UTC]*

---

### Q8. Nom du compte RMM de l'attaquant

Le même fichier `Connections_incoming.txt` donne le nom du compte dans la seconde colonne, sur la ligne de la session du 20 août.

**Réponse** : `James Moriarty`

*[Image: Connections_incoming.txt: nom du compte RMM de l'attaquant : James Moriarty]*

---

### Q9. IP interne de la machine de l'attaquant

Dans `TeamViewer15_Logfile.log` ouvert dans Bloc Notes, un Ctrl+F sur "192.168", qui est le début d'une IP interne, fait ressortir une ligne de log qui contient l'IP source de l'attaquant en clair avec son port. 

**Réponse** : `192.168.69.213`

*[Image: TeamViewer15_Logfile.log: ligne "punch received" révélant l'IP interne 192.168.69.213]*

---

### Q10. Path de staging des outils

La collecte KAPE ne contient pas le `$MFT`, seulement le journal USN (`$J`). Dans Timeline Explorer, en filtrant sur les `FileCreate` d'exécutables après l'heure d'accès de l'attaquant, plusieurs outils suspects remontent : `JM.exe`, `mimikatz.exe`, `CredHistView.exe`, `WebBrowserPassView.exe` et `Everything.exe`. Ils partagent tous le même Parent Entry Number, ce qui signifie qu'ils sont dans le même dossier parent.

Pour retrouver le nom de ce dossier, j'ai filtré sur cet Entry Number, et le nom `safe` est apparu. En remontant encore d'un niveau avec son propre Parent Entry Number, on arrive à `C:\Windows\Temp\`. Le path complet est ainsi reconstruit sans MFT.

À noter : les outils KAPE eux-mêmes (`kape.exe`, `gkape.exe`, les parseurs EZ) apparaissent aussi dans le `$J`. Ils se distinguent facilement grâce à leurs timestamps correspondant au moment de la collecte et à leurs Entry Numbers distincts.

**Réponse** : `C:\Windows\temp\safe\`

*[Image: Timeline Explorer: journal USN $J, outils suspects dans C:\Windows\Temp\safe\ après l'heure d'accès]*

---

### Q11. Durée d'exécution de WebBrowserPassView (en ms)

J'ai d'abord cherché dans SRUM, absent de la collecte. Ensuite les EventID 4688/4689, qui ne retournaient rien d'exploitable. Sysmon n'était pas déployé non plus.

L'artefact qui répond à la question est UserAssist, une clé de registre dans `NTUSER.DAT` qui enregistre le focus time actif de chaque application GUI. Registry Explorer dispose d'un onglet dédié qui décode les valeurs automatiquement. En filtrant sur "WebBrowser", l'entrée pour `WebBrowserPassView.exe` affiche 8 secondes de focus.

Sa limite principale : UserAssist ne trace que les applications avec une interface graphique. Mimikatz lancé en ligne de commande n'y laisse aucune trace, d'où la méthode différente pour la question suivante.

**Réponse** : `8000`

*[Image: Registry Explorer: UserAssist, WebBrowserPassView.exe avec 8 secondes de focus time]*

---

### Q12. Heure d'exécution de mimikatz

Le fichier Prefetch de mimikatz est visible dans le `$J`, preuve qu'il a bien été créé sur le système, mais le fichier `.pf` lui-même n'a pas été collecté par les Targets KAPE utilisés. Le `$J` donne malgré tout la réponse : un Prefetch étant généré à la première exécution d'un outil, son entrée `FileCreate` dans le journal correspond exactement à l'heure d'exécution.

**Réponse** : `2025-08-20 10:07:08`

*[Image: Timeline Explorer: journal USN $J, FileCreate du Prefetch de mimikatz à 10:07:08]*

---

### Q13. Début de l'exfiltration (UTC)

Dans `TeamViewer15_Logfile.log`, un Ctrl+F sur "Send file" fait remonter directement les lignes d'exfiltration. Cinq fichiers sont envoyés depuis `C:\Windows\Temp\flyover\`, un second dossier de staging que l'attaquant a créé spécifiquement pour préparer l'exfiltration. Le premier `Send file` est horodaté à `11:12:07` en heure locale, ce qui donne `10:12:07` une fois converti en UTC.

**Réponse** : `2025-08-20 10:12:07`

*[Image: TeamViewer15_Logfile.log: première entrée "Send file" depuis C:\Windows\Temp\flyover\ à 11:12:07 (heure locale)]*

---

### Q14. Déplacement du `.kdbx` vers le dossier de staging

Dans le `$J` filtré sur le nom "Heisen", une entrée `FileCreate` sur `Heisen-9 remote snapshot.kdbx` apparaît à `10:11:09` avec un Entry Number situé dans le dossier `flyover`. Le fichier venait d'un dossier différent, ce que confirme un `ObjectIdChange` antérieur à `10:10:04`. Cinquante-sept secondes séparent ce staging du premier `Send file` dans les logs TeamViewer. La chronologie est cohérente.

**Réponse** : `2025-08-20 10:11:09`

*[Image: Timeline Explorer: journal USN $J, FileCreate de Heisen-9.kdbx dans le dossier flyover à 10:11:09]*

---

### Q15. Lecture du fichier `dump.txt`

Le CSV produit par LECmd dans Timeline Explorer, qui parse les fichiers LNK, montre un accès à `C:\Windows\Temp\safe\dump.txt` à `10:08:06` avec `C:\Windows\Temp\safe` comme répertoire de travail. La convention de nommage `dump.txt` correspond à l'output typique de mimikatz quand les logs sont redirigés vers un fichier. L'attaquant a exécuté l'outil à `10:07:08`, relu son résultat une minute plus tard, puis préparé les fichiers pour l'exfiltration.

**Réponse** : `2025-08-20 10:08:06`

*[Image: Timeline Explorer: LECmd CSV, accès à dump.txt depuis C:\Windows\Temp\safe\ à 10:08:06]*

---

### Q16. Mise en place de la persistence

J'ai cherché dans les Run keys, les services et les tâches planifiées. Rien d'anormal. L'attaquant a utilisé `Winlogon\Userinit`, un emplacement légitime beaucoup moins surveillé. Dans Registry Explorer, la valeur `Userinit` de la clé `SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` affiche `Userinit.exe, JM.exe` au lieu de la valeur normale `Userinit.exe`. Windows exécute tous les binaires listés séparés par une virgule après chaque logon utilisateur. Le `Last Write Time` de la clé dans l'arbre de gauche donne l'heure exacte de la modification.

**Réponse** : `2025-08-20 10:13:57`

*[Image: Registry Explorer: clé Winlogon\Userinit modifiée : Userinit.exe, JM.exe: Last Write Time 10:13:57]*

---

### Q17. ID MITRE de la sous-technique de persistence

La modification de `Winlogon\Userinit` pour y ajouter un binaire malveillant exécuté à chaque logon correspond directement à cette sous-technique documentée sur ATT&CK, qui couvre à la fois Persistence et Privilege Escalation.

**Réponse** : `T1547.004`

*[Image: MITRE ATT&CK: T1547.004 Boot or Logon Autostart Execution : Winlogon Helper DLL]*

---

### Q18. Fin de la session RMM malveillante

`Connections_incoming.txt` donne l'heure de fin directement en UTC dans la colonne correspondante : `10:14:27`. Pour confirmer, `TeamViewer15_Logfile.log` montre `SessionManagerDesktop: SessionTerminate` à `11:14:27` en heure locale, ce qui donne bien `10:14:27` UTC après conversion. Les deux sources concordent.

**Réponse** : `2025-08-20 10:14:27`

*[Image: Connections_incoming.txt: heure de fin de session 10:14:27 UTC]*

---

### Q19. Credentials pour `Heisen-9-WS-6`

Le `.kdbx` est fourni dans le challenge. Pour l'ouvrir, il faut le master password. `dump.txt` est absent de la collecte, les PDFs exfiltrés ne sont pas dans le zip, et les artefacts navigateur dans AppData sont vides. J'ai d'abord essayé quelques mots de passe évidents liés au scénario (`WATSON`, `revolution`, `CogWork_Central_97&65`). Rien.

J'ai ensuite extrait le hash du fichier `.kdbx` avec `keepass2john` et lancé John the Ripper contre la wordlist rockyou. Le master password est tombé en quelques minutes. C'était `cutiepie14`. Une fois le coffre ouvert dans KeePass, l'entrée pour `Heisen-9-WS-6` donne les credentials du mouvement latéral.

Stocker les accès de toute l'infrastructure derrière un master password présent dans rockyou, ça annule complètement l'intérêt du gestionnaire.

**Réponse** : `Werni:Quantum1!`

*[Image: John the Ripper: keepass2john + rockyou, master password cutiepie14 cracké en quelques minutes]*

*[Image: KeePass: entrée Heisen-9-WS-6 avec credentials Werni:Quantum1!]*

---

## Chaîne d'attaque reconstituée

```
Machine décommissionnée WATSON-ALPHA-2 (10.0.69.45)
       │
       ▼
Session chat MSP-HELPDESK-AI via HTTP (PCAP flux 39/63)
  "Hello Old Friend" puis manipulation identitaire
       │
       ▼
Prompt Injection: 2025-08-19 12:02:06
  Credentials TeamViewer leakés par le bot
  [T1598.003 - Spearphishing via Service]
       │
       ▼
Accès TeamViewer CENTRAL-WS-5: 2025-08-20 09:58:25 UTC
  IP : 192.168.69.213 / Compte : James Moriarty
       │
       ├──► Staging outils dans C:\Windows\Temp\safe\
       │       JM.exe, mimikatz.exe, CredHistView.exe
       │       WebBrowserPassView.exe, Everything.exe
       │
       ├──► WebBrowserPassView: 10:03:46 (8s de focus)
       │       [T1555.003 - Credentials from Web Browsers]
       │
       ├──► mimikatz: 10:07:08
       │       Output dump.txt lu à 10:08:06
       │       [T1003.001 - LSASS Memory]
       │
       ├──► Staging exfiltration dans C:\Windows\Temp\flyover\
       │       Heisen-9.kdbx copié à 10:11:09
       │
       ├──► Exfiltration via TeamViewer FileTransfer: 10:12:07 UTC
       │       5 fichiers dont dump.txt et Heisen-9.kdbx
       │       [T1048 - Exfiltration Over Alternative Protocol]
       │
       ├──► Persistence Winlogon\Userinit: 10:13:57
       │       JM.exe ajouté
       │       [T1547.004 - Winlogon Helper DLL]
       │
       └──► Fin de session: 10:14:27 UTC
                      │
                      ▼
              KeePass cracké (cutiepie14 dans rockyou)
              Werni:Quantum1! pour Heisen-9-WS-6
              [T1078 - Valid Accounts]
```

---

## Ce que j'ai retenu

**Le PCAP comme source principale pour les six premières questions.** Je m'attendais à trouver la conversation avec le bot dans un fichier JSON quelque part dans la collecte KAPE. Elle était dans les flux HTTP du PCAP. Un Follow Stream sur les POST vers `/api/messages/send` et toute la conversation ressort proprement. Ça change l'ordre de priorité des sources pour ce type de challenge.

**`Connections_incoming.txt` avant le log principal.** Pour les heures de session TeamViewer, ce fichier donne directement les timestamps UTC sans avoir à chercher dans 687 Ko de logs. Il liste le nom du compte, les sessions précédentes, les heures de début et de fin. C'est lui qu'il faut ouvrir en premier quand on cherche des informations de session TeamViewer.

**UserAssist pour la durée d'exécution des outils GUI.** J'ai épuisé SRUM, Sysmon et les EventLogs avant d'y arriver. UserAssist est l'artefact natif Windows qui enregistre le focus time actif de chaque application graphique. Registry Explorer le décode dans un onglet dédié sans manipulation particulière. Sa limite est claire : pour un outil CLI comme mimikatz, il ne laisse rien. Le timestamp du Prefetch dans le `$J` prend alors le relais.

**Le timezone dans les logs applicatifs.** `Connections_incoming.txt` stocke en UTC. `TeamViewer15_Logfile.log` stocke en heure locale. Les croiser sans s'en apercevoir donne une timeline fausse, et l'erreur est facile à ne pas voir sous pression. La bonne habitude : vérifier la timezone de chaque source avant de construire la timeline, pas après.

**`cutiepie14` comme master password.** Un gestionnaire de mots de passe ne vaut que ce que vaut son master password. Concentrer les accès de toute l'infrastructure derrière un mot de passe trouvable dans rockyou annule complètement la sécurité du coffre. C'est souvent là que se brise la chaîne de confiance.

---

## Références

- [MITRE ATT&CK T1547.004](https://attack.mitre.org/techniques/T1547/004/): Winlogon Helper DLL
- [MITRE ATT&CK T1003.001](https://attack.mitre.org/techniques/T1003/001/): LSASS Memory
- [MITRE ATT&CK T1555.003](https://attack.mitre.org/techniques/T1555/003/): Credentials from Web Browsers
- [MITRE ATT&CK T1048](https://attack.mitre.org/techniques/T1048/): Exfiltration Over Alternative Protocol
- [MITRE ATT&CK T1078](https://attack.mitre.org/techniques/T1078/): Valid Accounts
- [Eric Zimmerman Tools](https://ericzimmerman.github.io/): Registry Explorer, Timeline Explorer, MFTECmd, LECmd
- [John the Ripper](https://www.openwall.com/john/): Password cracker
- [KeePass](https://keepass.info/): Gestionnaire de mots de passe
