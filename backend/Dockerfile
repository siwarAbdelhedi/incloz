# Dockerfile pour le backend Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["npm", "start"] 