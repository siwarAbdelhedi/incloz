## Ce que fait cette PR

<!-- En une ou deux phrases : le problème résolu, pas la liste des fichiers. -->

## Comment le vérifier

<!-- Les étapes pour reproduire, ou les scénarios couverts par les tests. -->

## Checklist

- [ ] La PR cible `dev` (une PR vers `main` est une promotion en production)
- [ ] `npm --prefix backend test` passe
- [ ] `npm run lint` et `npm run build` passent
- [ ] Le comportement a été vérifié à la main, pas seulement par les tests
- [ ] Le README est à jour si l'API, les variables d'environnement ou
      l'installation changent

## Points d'attention

<!-- Migration de données, variable d'environnement à créer, ordre de merge,
     effet de bord connu... Écrire « aucun » si ce n'est pas le cas. -->
