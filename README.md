# Vinyl API

API de gestion de vinyls pour un disquaire. Permet de gerer les groupes et les vinyls (ajout, edition, lecture, suppression) avec un systeme de roles (gerant / disquaire).

## Stack

- **Hono**
- **Prisma** - ORM (PostgreSQL / Supabase)
- **Zod** - validation des donnees
- **JWT** - authentification
- **bcryptjs** - hashage des mots de passe

## Lancer le projet

Ajouter le .env
La base est deja migree et seedee

```bash
pnpm install
npx prisma generate
pnpm dev
```

Le serveur tourne sur `http://localhost:3000`

## Tester avec Bruno

1. Ouvrir la collection Bruno du projet
2. Selectionner l'environnement **Dev**
3. Lancer la requete **Login** avec un des deux comptes :

`gerant@vinyl.fr` | `password123`
`disquaire@vinyl.fr` | `password123`

4. Il ya un script post-response qui stocke automatiquement le token en variable d'environnement
5. Toutes les autres requetes utilisent ce token, on peut directement tester les routes
