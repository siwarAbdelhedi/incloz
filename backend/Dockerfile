# Dockerfile pour le backend Node.js
#
# La version doit suivre .nvmrc, comme le fait la CI (`node-version-file`).
# Elle était restée sur 18 : le npm 10 associé ne résout pas l'arbre de
# dépendances comme le npm 11 livré avec Node 22+, et `npm ci` échouait sur un
# lockfile pourtant valide. La CI, elle, tournait sur la bonne version et
# restait verte — l'écart n'était donc signalé nulle part.
FROM node:24-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances. `--only=production` est déprécié depuis npm 7.
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Créer le dossier uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["npm", "start"] 