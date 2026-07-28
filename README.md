# Incloz

Marque de **vêtements de sport adaptés pour parathlètes**, avec personnalisation
des produits selon les besoins de chaque client (fermetures par pressions,
auto-agrippant ou aimants).

Ce dépôt regroupe l'API et le site web. Les deux vivaient auparavant dans
`inclozB` et `inclozF` ; leurs historiques respectifs sont intégralement
préservés ici.

```
incloz/
├── backend/     API REST — Node.js, Express, MongoDB
├── frontend/    Site web — React, Vite, Material UI
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Démarrer

### Avec Docker (recommandé)

Une commande lance la base, l'API et le front :

```bash
docker compose up -d
```

| | URL |
|---|---|
| Site | http://localhost:5173 |
| API | http://localhost:5000 |
| MongoDB | `mongodb://localhost:27017/incloz` |

Le code de `backend/src` et `frontend/src` est monté en volume : les
modifications sont prises en compte à chaud, sans reconstruire les images.

```bash
docker compose logs -f      # suivre les logs
docker compose down         # tout arrêter
```

### Sans Docker

Prérequis : Node.js 20+, et un MongoDB accessible.

```bash
npm install                 # dépendances du monorepo (concurrently)
npm run setup               # dépendances de backend/ et frontend/
cp backend/.env.example backend/.env     # puis remplir MONGO_URI et JWT_SECRET
npm run dev                 # lance l'API et le front en parallèle
```

Pour pointer le front sur l'API locale plutôt que sur la production, créer
`frontend/.env.local` :

```
VITE_API_URL=http://localhost:5000/api
VITE_IMG_URL=http://localhost:5000/uploads
```

### Créer un compte et des données de test

```bash
API=http://localhost:5000/api

# Un compte administrateur
curl -X POST $API/users -H 'Content-Type: application/json' \
  -d '{"name":"Admin","email":"admin@incloz.fr","password":"Admin1234"}'

# Le passer admin (aucun endpoint ne le permet : c'est volontaire)
docker exec incloz-mongo mongosh incloz --quiet \
  --eval 'db.users.updateOne({email:"admin@incloz.fr"},{$set:{isAdmin:true}})'

# Récupérer un jeton, puis créer un produit
TOKEN=$(curl -s -X POST $API/users/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@incloz.fr","password":"Admin1234"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X POST $API/products -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"T-shirt Fitness","subtitle":"T-shirt 100% adaptable","description":"T-shirt en coton.","price":29.9,"image":"tshirt.png"}'
```

Les images `tshirt.png`, `jogging.png`, `short.png` et `veste.png` sont déjà
présentes dans `backend/uploads/`.

---

## Tests

```bash
npm --prefix backend test          # une fois
npm --prefix backend run test:watch
```

Vitest + supertest. Les tests tournent contre un **MongoDB en mémoire**
(`mongodb-memory-server`) : rien à installer, aucune base réelle touchée, et
chaque test repart d'une base vide.

L'API est instanciée sans ouvrir de port : `src/app.js` construit et exporte
l'application Express, `src/server.js` se contente de charger l'environnement,
de connecter MongoDB et d'écouter. C'est ce découpage qui rend l'API testable.

Couverture actuelle — 28 tests sur l'authentification et les autorisations :
inscription, connexion, invariants du hachage des mots de passe, middleware
`protect` (jeton absent, invalide, sans préfixe `Bearer`, compte supprimé),
accès aux produits, à la liste des comptes et au panier.

Le front n'a pas encore de tests.

## Scripts

| Commande | Effet |
|---|---|
| `npm run setup` | Installe les dépendances des deux applications |
| `npm --prefix backend test` | Tests de l'API |
| `npm run dev` | Lance l'API et le front en parallèle |
| `npm run dev:api` / `npm run dev:web` | Lance une seule des deux |
| `npm run lint` | ESLint sur le front |
| `npm run build` | Build de production du front |
| `npm run up` / `npm run down` / `npm run logs` | Raccourcis docker compose |

---

## Variables d'environnement

**`backend/.env`** — contient les secrets, jamais committé. Voir
`backend/.env.example`.

| Variable | Rôle |
|---|---|
| `PORT` | Port d'écoute de l'API (5000) |
| `MONGO_URI` | Chaîne de connexion MongoDB |
| `JWT_SECRET` | Clé de signature des jetons — doit être longue et aléatoire |
| `CLOUDINARY_*` | Identifiants Cloudinary pour `POST /api/upload` |

**`frontend/.env`** — suivi par git, et c'est volontaire : les variables `VITE_*`
sont injectées dans le bundle au build et sont donc publiques par nature. Elles
ne contiennent que des URLs. Pour surcharger en local, utiliser
`frontend/.env.local` (ignoré par git).

Sans aucun fichier `.env`, `frontend/src/config/api.js` retombe sur
`http://localhost:5000`.

---

## API

Base : `/api`. Les routes privées attendent un en-tête
`Authorization: Bearer <token>`.

### Utilisateurs

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/users` | Public | Inscription. `isAdmin` n'est pas lisible depuis le corps de la requête |
| `POST` | `/users/login` | Public | Connexion, renvoie un JWT valable 30 jours |
| `GET` `PUT` | `/users/profile` | Privé | Consulter / modifier son profil |
| `GET` | `/users` | Admin | Liste des comptes (sans les mots de passe) |
| `GET` `PUT` `DELETE` | `/users/:id` | Admin | Gestion d'un compte |

### Produits

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/products` | Public |
| `GET` | `/products/:id` | Public |
| `POST` | `/products` | Admin |

### Panier

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/cart` | Privé |
| `POST` | `/cart` | Privé |

> Ces routes existent et fonctionnent, mais **le front ne les utilise pas** :
> il gère le panier en `localStorage`. Voir « Limites connues ».

### Demandes sur-mesure

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/custom-request` | Public, `multipart/form-data` |

Collecte identité, coordonnées, mensurations et une photo.

### Upload

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/upload` | **Public** — voir l'avertissement ci-dessous |

---

## Limites connues

À lire avant de reprendre le projet. Le détail et l'ordre de traitement sont
dans la roadmap.

### Sécurité

- **`POST /api/upload` n'exige aucune authentification** et pousse directement
  sur le compte Cloudinary. N'importe qui peut y déposer des fichiers, à vos
  frais. Cette route n'est utilisée par aucun écran du front : la protéger ou
  la supprimer est le correctif le plus rentable du projet.
- Les photos envoyées via le formulaire sur-mesure sont écrites sur le disque
  dans `backend/uploads/`, servi en statique et **sans authentification**. Les
  noms de fichiers (`photos-<timestamp>.jpg`) sont énumérables. Ces photos
  accompagnent des données de santé au sens large (mensurations).
- Pas de `helmet`, pas de rate limiting, pas de validation des entrées.
- Dépendances obsolètes : Mongoose 5 (fin de vie, vulnérabilité critique
  d'injection), jsonwebtoken 8, multer 1.4.

### Fonctionnel

- **Aucune commande, aucun paiement.** `orderController.js`,
  `paymentController.js`, `orderRoutes.js`, `paymentRoutes.js` et
  `paymentModel.js` sont des fichiers vides. Le site ne peut rien vendre en
  l'état.
- Le panier ne quitte pas le navigateur et **les prix y sont stockés côté
  client**, donc modifiables. À rebrancher sur `/api/cart` avec un calcul du
  montant côté serveur avant toute vente.
- Le header ne sait pas qu'un utilisateur est connecté : « Se connecter » reste
  affiché et il n'existe aucun bouton de déconnexion.
- Pas de parcours « mot de passe oublié », alors que le lien existe dans le
  formulaire de connexion.
- Les pages légales (CGU, mentions légales, politique de confidentialité) sont
  accessibles mais ne contiennent qu'un titre.

### Qualité

- **Aucun test automatisé**, dans aucune des deux applications.
- Environ 13 Mo d'images non optimisées dans `frontend/src/assets/` et un
  bundle JS de 510 Ko.
- Accessibilité jamais auditée — un enjeu central pour une marque qui
  s'adresse à des athlètes en situation de handicap.

---

## Déploiement

⚠️ **La CI de ce dépôt ne déploie rien pour l'instant.**

Les anciens dépôts déployaient depuis un runner GitHub self-hosted
(`pm2 restart inclozB` à chaque push sur `main`, sans test préalable). Un runner
self-hosted étant enregistré par dépôt, celui-ci ne répondra pas ici : il faut
en enregistrer un nouveau et recréer le secret `ENV_FILE`.

Le squelette du job, avec le garde-fou `needs: [backend, frontend]` qui manquait,
est en commentaire à la fin de `.github/workflows/ci.yml`.

Avant de couper `inclozB` et `inclozF`, vérifier que le déploiement fonctionne
depuis ce dépôt.

---

## Contribuer

Une branche par sujet, préfixée par le type de changement :
`feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`, `perf/`, `ci/`.

L'intérêt principal du monorepo est de pouvoir modifier l'API et le front
**dans le même commit** quand le contrat entre les deux change. Les trois bugs
bloquants corrigés en juillet 2026 venaient tous d'un désaccord entre les deux
dépôts : le front écrivait la session sous une clé et la relisait sous une
autre, testait un champ `role` que l'API ne renvoyait pas, et redirigeait vers
des routes inexistantes. Un seul diff les aurait rendus visibles.
