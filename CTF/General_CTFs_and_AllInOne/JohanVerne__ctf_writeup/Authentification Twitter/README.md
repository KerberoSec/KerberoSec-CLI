# Authentification Twitter

## Challenge

A twitter authentication session has been captured, you have to retrieve the password.

## Solution

Depuis Wireshark, en inspectant la couche HTTP du paquet, dans la section "Authorization", on obtient le nom d'utilisateur et le mot de passe en clair (qui sont très originaux et sécurisés)

## Flag

password
