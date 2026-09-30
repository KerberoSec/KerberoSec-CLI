# ROOT ME scoreboard

Un bot Discord pour afficher le scoreboard de ROOT ME sur un serveur Discord.

## Installation

1. Cloner le dépôt

```bash
git clone https://github.com/LighTend3r/scoreboard_root-me_for_discord.git
```

2. créer un fichier `.env` à la racine du projet (Un template est fourni dans le fichier `.env.template`)

```bash
touch .env
```

3. Ajouter les variables d'environnement suivantes dans le fichier `.env`

```env
DISCORD_TOKEN
RM_API_KEY
GUILD_ID
```

Le `DISCORD_TOKEN` est le token de votre bot discord, vous pouvez le récupérer sur le [portail développeur Discord](https://discord.com/developers/applications)

Le `RM_API_KEY` est la clé d'API de VOTRE compte ROOT ME, vous pouvez la récupérer sur [ROOT ME](https://www.root-me.org/?page=preferences)

Le `GUILD_ID` est l'identifiant de votre serveur Discord, vous pouvez le récupérer en activant le mode développeur sur Discord et en cliquant droit sur votre serveur

4. lancer le docker-compose

```bash
docker-compose up -d
```

## Utilisation

`/ping` : Vérifie si le bot est en ligne

`/add_user <pseudo:str | rm_id:int>` : Ajouter un utilisateur à la BDD

`/remove_user <pseudo:str | rm_id:int>` : Supprimer un utilisateur de la BDD

`/profile <pseudo:str | rm_id:int>` : Affiche le profil d'un utilisateur

`/scoreboard [period:str = "all" | force_update:bool = False]` : Affiche le scoreboard des utilisateurs dans la BDD

`/who_solved <name_chall:str | challenge_id:int>` : Affiche les utilisateurs ayant résolu un challenge

`/chall <name:str>` : Affiche tous les chall qui comporte "name" dans leur nom

`/search_profile <pseudo:str>` : Recherche un utilisateur sur ROOT ME

`/help` : Affiche l'aide

