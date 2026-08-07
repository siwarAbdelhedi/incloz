# Dockerfile pour le frontend React/Vite
#
# La version doit suivre .nvmrc, comme le fait la CI (`node-version-file`).
# Le front est le plus strict des deux : package.json y déclare
# `engines: ^22.22.2 || >=24.15.0`. Sur l'ancien node:18, `npm ci` sortait en
# EUSAGE et l'image ne se construisait pas — ni celle-ci, ni Dockerfile.dev,
# donc `docker compose up` échouait sur le service web.
FROM node:24-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Stage de production avec nginx
FROM nginx:alpine

# Copier les fichiers construits
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande pour démarrer nginx
CMD ["nginx", "-g", "daemon off;"] 