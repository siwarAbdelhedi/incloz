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

Prérequis : la version de Node indiquée dans `.nvmrc` (`nvm use` à la racine),
et un MongoDB accessible. C'est la même version que celle utilisée par la CI.

Le front ne descend pas sous Node 22.22 : ses outils de test (jsdom, Testing
Library) l'exigent, et sous Node 20 le npm 10 associé résout l'arbre de
dépendances autrement — `npm ci` échoue alors sur un lockfile pourtant valide.

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

## Charte graphique

`frontend/src/theme.js` est la **source unique** des couleurs, de la typographie
et des valeurs de mise en page. Aucun composant ne doit réécrire une couleur en
dur : on passe par `theme.palette.*` ou l'attribut `sx`.

| Jeton | Valeur | Usage |
|---|---|---|
| `primary.main` | `#DC3A00` | Boutons et surfaces portant du texte |
| `primary.light` | `#FD4802` | Aplats décoratifs sans texte |
| `primary.dark` | `#B32E00` | Texte et liens orange sur fond clair |
| `secondary.main` | `#14235E` | Navy de marque |
| `brand.cream` / `peach` / `sand` | `#FFF6EB` / `#FFE5CF` / `#FCDAAF` | Les trois fonds de la charte |
| `layout.headerOffset` | `56px` / `64px` | Hauteur réelle de la barre fixe (palier à 600px) |

L'orange d'origine `#FD4802` plafonne à 3,44:1 avec du texte blanc, sous le seuil
WCAG AA de 4,5:1. `primary.main` en est une version à peine assombrie qui atteint
4,52:1 ; la teinte d'origine reste disponible en `primary.light` pour les aplats
qui ne portent pas de texte. `frontend/src/tests/theme.test.js` revérifie ces
contrastes à chaque exécution des tests.

`layout.headerOffset` est consommé à un seul endroit — le `<main>` d'`App.jsx`.
Aucune page ne doit compenser la barre fixe elle-même ; `layout.test.jsx` échoue
si l'une s'y remet.

La police de marque est **Outfit**, auto-hébergée via
`@fontsource-variable/outfit` — aucune requête vers un domaine tiers, donc pas de
dépendance réseau ni de fuite d'adresse IP des visiteurs. Pour en changer,
modifier `BRAND_FONT` dans `theme.js` et l'import correspondant dans `main.jsx`.

---

## Tests

```bash
npm --prefix backend test          # API
npm --prefix frontend test         # interface
```

### API

Vitest + supertest. Les tests tournent contre un **MongoDB en mémoire**
(`mongodb-memory-server`) : rien à installer, aucune base réelle touchée, et
chaque test repart d'une base vide.

L'API est instanciée sans ouvrir de port : `src/app.js` construit et exporte
l'application Express, `src/server.js` se contente de charger l'environnement,
de connecter MongoDB et d'écouter. C'est ce découpage qui rend l'API testable.

63 tests : inscription, connexion, invariants du hachage des mots de passe,
middleware `protect` (jeton absent, invalide, sans préfixe `Bearer`, compte
supprimé), accès aux produits, à la liste des comptes et au panier, en-têtes de
sécurité, limitation de débit, validation des entrées, et confidentialité des
pièces jointes des demandes sur-mesure.

### Interface

Vitest + Testing Library, dans un DOM simulé (jsdom). 13 tests sur la session :
état du header selon qu'on est connecté ou non, déconnexion, redirections de
`<ProtectedRoute>`, restauration de la session après rechargement, et tolérance
à un stockage corrompu.

## Scripts

| Commande | Effet |
|---|---|
| `npm run setup` | Installe les dépendances des deux applications |
| `npm --prefix backend test` | Tests de l'API |
| `npm --prefix frontend test` | Tests de l'interface |
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

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/custom-request` | Public, `multipart/form-data` | Dépôt d'une demande. Accuse réception sans renvoyer les données déposées |
| `GET` | `/custom-request` | Admin | Liste, la plus récente d'abord |
| `GET` | `/custom-request/:id` | Admin | Une demande |
| `GET` | `/custom-request/:id/photo` | Admin | Sert la pièce jointe |

Collecte identité, coordonnées, mensurations et une photo.

Les pièces jointes sont écrites dans `backend/private-uploads/`, **jamais servi
en statique**. Elles ne sortent que par la route `:id/photo`, réservée aux
administrateurs, et le nom de fichier n'apparaît dans aucune réponse de l'API.
Le dossier `backend/uploads/`, lui, reste public : il ne contient que les
visuels du catalogue.

### Upload

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/upload` | Admin — envoi d'un visuel sur Cloudinary |

### Limitation de débit

Toutes les routes `/api` sont plafonnées. Connexion et inscription : 10 tentatives
par quart d'heure. Formulaire sur-mesure : 5 envois par heure. Reste de l'API :
300 requêtes par quart d'heure. Ajustable par variable d'environnement, voir
`backend/.env.example`.

---

## Limites connues

À lire avant de reprendre le projet. Le détail et l'ordre de traitement sont
dans la roadmap.

### Sécurité

- Les pièces jointes des demandes sur-mesure sont stockées **sur le disque du
  serveur**. C'est privé et suffisant pour aujourd'hui, mais ça ne survit pas à
  un déploiement conteneurisé sans volume, et ça ne se réplique pas sur
  plusieurs instances. Cible : Cloudinary en mode `authenticated` avec URLs
  signées.
- Les mots de passe n'ont pas de parcours de récupération, alors que le lien
  « mot de passe oublié » existe dans le formulaire de connexion.
- Aucune durée de conservation n'est appliquée aux demandes sur-mesure ni à
  leurs photos.
- **MongoDB tourne sans authentification.** C'est acceptable tant que la base
  n'est joignable que depuis le loopback ou un réseau privé — mais c'est le seul
  rempart. En production, activer une authentification (`MONGO_INITDB_ROOT_*` et
  un utilisateur applicatif dédié) et ne jamais publier le port sur une
  interface publique. La base de développement de ce projet a été vidée par un
  robot le 28 juillet 2026 : elle était publiée sur `0.0.0.0:27017` sans mot de
  passe. Une base ouverte est trouvée en quelques heures.
- Dépendances obsolètes : Mongoose 5 (fin de vie, vulnérabilité critique
  d'injection), jsonwebtoken 8, multer 1.4.

Déjà traité : `helmet`, limitation de débit, validation des entrées sur toutes
les routes d'écriture, `POST /api/upload` réservé aux administrateurs, corps
JSON et fichiers plafonnés, pièces jointes sorties du dossier public et
réservées aux administrateurs, port MongoDB de la stack de développement lié au
loopback.

### Fonctionnel

- La barre fixe se replie sur deux lignes (88px au lieu de 64px) dans une
  fenêtre large de **900 à 904px** : à cette largeur exacte, le menu de bureau
  vient de s'afficher mais ne tient pas encore. Le contenu passe alors sous la
  barre. Fenêtre étroite, mais réelle — à traiter avec la refonte du header.
- **Aucune commande, aucun paiement.** `orderController.js`,
  `paymentController.js`, `orderRoutes.js`, `paymentRoutes.js` et
  `paymentModel.js` sont des fichiers vides. Le site ne peut rien vendre en
  l'état.
- Le panier ne quitte pas le navigateur et **les prix y sont stockés côté
  client**, donc modifiables. À rebrancher sur `/api/cart` avec un calcul du
  montant côté serveur avant toute vente.
- Pas de parcours « mot de passe oublié », alors que le lien existe dans le
  formulaire de connexion.
- Le lien « Nos adaptations » du menu pointe vers `/adaptations`, une page qui
  n'existe pas — le visiteur tombe sur le 404. Le modèle et le contrôleur
  existent côté API mais la route n'est pas montée et l'écran n'est pas écrit.
- Les pages légales (CGU, mentions légales, politique de confidentialité) sont
  accessibles mais ne contiennent qu'un titre.

### Qualité

- **Deux copies de Vite cohabitent** dans le front : la version 5 déclarée en
  dépendance sert au `dev` et au `build`, mais Vitest 4 exige Vite ≥ 6 et
  installe donc sa propre copie (Vite 8) pour exécuter les tests. Les tests ne
  passent pas par le même bundler que la production — une transformation peut
  donc réussir en test et échouer au build, ou l'inverse. À résoudre en montant
  le front sur Vite 7+, ce qui implique aussi `@vitejs/plugin-react` 5.
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

## Branches et environnements

Deux branches longue durée :

| Branche | Rôle | Ce qui s'y trouve |
|---|---|---|
| `main` | **Production** | Uniquement ce qui a été validé en recette |
| `dev` | **Recette / intégration** | Les fonctionnalités en cours de validation |

Le chemin d'une modification :

```
feat/ma-fonctionnalite  ──PR──>  dev  ──PR de promotion──>  main
                                  ▲                          ▲
                            validée en recette          mise en production
```

1. Brancher **depuis `dev`**, jamais depuis `main` :
   `git checkout dev && git pull && git checkout -b feat/mon-sujet`
2. Ouvrir la PR **vers `dev`**. La CI doit être verte pour merger.
3. Valider le comportement sur la recette.
4. Quand `dev` est jugée bonne, ouvrir une PR **`dev` → `main`**. C'est cette
   PR qui déclenche la mise en production ; elle regroupe tout ce qui a été
   validé depuis la dernière livraison.

Ne jamais pousser directement sur `main` : elle ne doit contenir que ce qui est
passé par `dev`. Un correctif urgent suit le même chemin — il est simplement
promu tout de suite après avoir été mergé dans `dev`.

Après une mise en production, `main` et `dev` sont identiques. Si un correctif a
dû être appliqué directement sur `main`, le reporter sur `dev` (`git checkout dev
&& git merge main`) pour éviter que les deux branches ne divergent.

Chaque environnement a ses propres variables (base de données, `JWT_SECRET`,
Cloudinary). La recette ne doit jamais pointer sur la base de production.

## Contribuer

Une branche par sujet, préfixée par le type de changement :
`feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`, `perf/`, `ci/`.

L'intérêt principal du monorepo est de pouvoir modifier l'API et le front
**dans le même commit** quand le contrat entre les deux change. Les trois bugs
bloquants corrigés en juillet 2026 venaient tous d'un désaccord entre les deux
dépôts : le front écrivait la session sous une clé et la relisait sous une
autre, testait un champ `role` que l'API ne renvoyait pas, et redirigeait vers
des routes inexistantes. Un seul diff les aurait rendus visibles.
