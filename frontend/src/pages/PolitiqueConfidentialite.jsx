import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import PageLegale, { Paragraphe, Section, Valeur } from '../components/PageLegale'
import {
  CNIL,
  CONTACT_DONNEES,
  DERNIERE_MISE_A_JOUR,
  DUREE_CONSERVATION_MOIS,
  EDITEUR,
} from '../config/entreprise'

/**
 * Politique de confidentialité.
 *
 * Son contenu décrit ce que le code fait réellement, et rien d'autre : les
 * champs listés sont ceux du modèle CustomRequest et du modèle User, les
 * durées sont celles appliquées par la purge, et les mesures de sécurité
 * décrites sont celles en place. Toute évolution de la collecte doit être
 * répercutée ici — et la version du texte incrémentée dans config/entreprise.js,
 * puisqu'elle est enregistrée avec chaque consentement.
 */

const TRAITEMENTS = [
  {
    finalite: 'Étudier une demande de vêtement sur-mesure et y répondre',
    donnees:
      'Nom, prénom, adresse e-mail, téléphone, adresse postale, type de vêtement souhaité, tour de taille, largeur des hanches, cuisse, entrejambe, et une photographie si elle est jointe',
    base: 'Consentement, recueilli sur le formulaire',
    duree: `${DUREE_CONSERVATION_MOIS} mois à compter du dépôt`,
  },
  {
    finalite: 'Créer et gérer un compte sur le site',
    donnees: 'Nom, adresse e-mail, mot de passe (conservé sous forme chiffrée)',
    base: 'Exécution de mesures prises à la demande de la personne',
    duree: 'Jusqu’à la suppression du compte',
  },
  {
    finalite:
      'Empêcher les envois massifs et les tentatives répétées de connexion',
    donnees: 'Adresse IP, en mémoire vive uniquement, jamais enregistrée en base',
    base: 'Intérêt légitime à protéger le service',
    duree: 'De 15 minutes à 1 heure selon le formulaire concerné',
  },
]

const DROITS = [
  ['Accès', 'Obtenir une copie des données vous concernant.'],
  ['Rectification', 'Faire corriger une information inexacte ou incomplète.'],
  ['Effacement', 'Demander la suppression de vos données.'],
  ['Limitation', 'Demander le gel d’un traitement le temps d’une vérification.'],
  ['Opposition', 'Vous opposer à un traitement fondé sur l’intérêt légitime.'],
  ['Portabilité', 'Récupérer vos données dans un format lisible par machine.'],
  [
    'Retrait du consentement',
    'Retirer à tout moment le consentement donné pour une demande sur-mesure, sans que cela remette en cause ce qui a été fait avant.',
  ],
]

export default function PolitiqueConfidentialite() {
  return (
    <PageLegale
      titre="Politique de confidentialité"
      miseAJour={DERNIERE_MISE_A_JOUR}
      chapeau="Incloz conçoit des vêtements adaptés : pour le faire, il faut des mensurations, et parfois une photographie. Ce sont des informations intimes. Cette page dit exactement lesquelles sont collectées, pourquoi, qui peut les lire et quand elles sont supprimées."
    >
      <Section titre="Qui est responsable de ces données">
        <Paragraphe>
          Le responsable du traitement est {EDITEUR.denomination},{' '}
          <Valeur champ="adresse du siège">{EDITEUR.adresse}</Valeur>.
        </Paragraphe>
        <Paragraphe>
          Pour toute question ou pour exercer vos droits, écrivez à{' '}
          <Valeur champ="adresse dédiée aux données personnelles">
            {CONTACT_DONNEES}
          </Valeur>
          . Aucun délégué à la protection des données n’est désigné : l’activité
          ne repose pas sur un suivi à grande échelle et ne l’impose pas.
        </Paragraphe>
      </Section>

      <Section titre="Ce qui est collecté, et pourquoi">
        <TableContainer sx={{ overflowX: 'auto', mb: 2 }}>
          <Table size="small" aria-label="Traitements de données réalisés par Incloz">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  Finalité
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  Données
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  Base légale
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  Conservation
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TRAITEMENTS.map((t) => (
                <TableRow key={t.finalite}>
                  <TableCell>{t.finalite}</TableCell>
                  <TableCell>{t.donnees}</TableCell>
                  <TableCell>{t.base}</TableCell>
                  <TableCell>{t.duree}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Paragraphe>
          Aucune donnée n’est collectée en dehors de ces cas. Les champs
          d’adresse postale et les mensurations autres que celles nécessaires au
          vêtement demandé sont facultatifs : les laisser vides n’empêche pas
          d’envoyer une demande.
        </Paragraphe>
      </Section>

      <Section titre="Données pouvant révéler un état de santé">
        <Paragraphe>
          Une demande sur-mesure porte sur un vêtement adapté. Les mensurations,
          le type d’adaptation demandé et une éventuelle photographie peuvent
          révéler une situation de handicap — c’est-à-dire une donnée relative à
          la santé, que le règlement européen protège plus strictement que les
          autres.
        </Paragraphe>
        <Paragraphe>
          Ces informations ne sont donc traitées que sur la base d’un{' '}
          <strong>consentement exprès</strong>, donné en cochant une case
          dédiée sur le formulaire. Ce consentement est horodaté et conservé
          avec la demande, avec la version de la présente politique. Il peut
          être retiré à tout moment, ce qui entraîne la suppression de la
          demande.
        </Paragraphe>
      </Section>

      <Section titre="Qui peut y accéder">
        <Paragraphe>
          Les demandes sur-mesure ne sont consultables que par les personnes
          habilitées chez {EDITEUR.denomination}, après authentification.
          Aucune donnée n’est vendue, louée, ni transmise à un tiers à des fins
          commerciales.
        </Paragraphe>
        <Paragraphe>
          Le seul tiers qui intervient est l’hébergeur du site, identifié dans
          les{' '}
          <Link component={RouterLink} to="/mentions-legales" color="primary.dark">
            mentions légales
          </Link>
          , qui agit sur instruction et n’exploite pas ces données pour son
          propre compte. Le site n’utilise aucun service d’analyse d’audience,
          aucune régie publicitaire et aucune police de caractères chargée
          depuis un domaine tiers : votre navigateur ne contacte aucun serveur
          en dehors de ceux d’Incloz.
        </Paragraphe>
      </Section>

      <Section titre="Comment elles sont protégées">
        <Paragraphe>Les mesures suivantes sont en place :</Paragraphe>
        <List dense sx={{ listStyleType: 'disc', pl: 3, mb: 2 }}>
          {[
            'Les photographies jointes aux demandes sont stockées hors de tout dossier public. Elles ne sont accessibles que par une adresse protégée réservée aux administrateurs, et leur nom de fichier n’apparaît dans aucune réponse du site.',
            'Les mots de passe ne sont jamais conservés en clair : seule une empreinte chiffrée est enregistrée, et elle ne permet pas de retrouver le mot de passe.',
            'Les échanges entre votre navigateur et le site sont chiffrés.',
            'Le nombre de tentatives de connexion et d’envois de formulaire est plafonné, pour limiter les attaques automatisées.',
            'Les données transmises sont contrôlées avant enregistrement.',
          ].map((mesure) => (
            <ListItem key={mesure} sx={{ display: 'list-item', pl: 0, py: 0.5 }}>
              <ListItemText primary={mesure} />
            </ListItem>
          ))}
        </List>
        <Paragraphe>
          Aucune mesure ne rend un système inviolable. En cas de violation
          susceptible d’engendrer un risque élevé pour vos droits, vous en serez
          informé conformément à l’article 34 du règlement.
        </Paragraphe>
      </Section>

      <Section titre="Cookies et stockage local">
        <Paragraphe>
          <strong>Le site ne dépose aucun cookie</strong> et n’utilise aucun
          traceur publicitaire ou statistique. C’est pourquoi aucun bandeau de
          consentement ne vous est présenté : il n’y a rien à consentir.
        </Paragraphe>
        <Paragraphe>
          Deux informations sont enregistrées dans le stockage local de votre
          navigateur, et n’en sortent jamais sans votre action :
        </Paragraphe>
        <List dense sx={{ listStyleType: 'disc', pl: 3, mb: 2 }}>
          <ListItem sx={{ display: 'list-item', pl: 0, py: 0.5 }}>
            <ListItemText primary="Votre session, si vous vous connectez, pour vous éviter de saisir vos identifiants à chaque page. Elle est effacée à la déconnexion." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0, py: 0.5 }}>
            <ListItemText primary="Le contenu de votre panier, qui reste sur votre appareil et n’est transmis à personne." />
          </ListItem>
        </List>
        <Paragraphe>
          Vider le stockage local de votre navigateur suffit à les supprimer.
        </Paragraphe>
      </Section>

      <Section titre="Vos droits">
        <Paragraphe>
          Le règlement européen vous reconnaît les droits suivants sur vos
          données :
        </Paragraphe>
        <Box component="dl" sx={{ m: 0, mb: 2 }}>
          {DROITS.map(([nom, texte]) => (
            <Box key={nom} sx={{ mb: 1.5 }}>
              <Typography component="dt" variant="body1" fontWeight={700} color="secondary.main">
                {nom}
              </Typography>
              <Typography component="dd" variant="body1" color="text.primary" sx={{ m: 0 }}>
                {texte}
              </Typography>
            </Box>
          ))}
        </Box>
        <Paragraphe>
          Pour les exercer, écrivez à{' '}
          <Valeur champ="adresse dédiée aux données personnelles">
            {CONTACT_DONNEES}
          </Valeur>
          . Une réponse vous sera apportée dans un délai d’un mois. Une preuve
          d’identité pourra vous être demandée en cas de doute raisonnable sur
          l’origine de la demande.
        </Paragraphe>
      </Section>

      <Section titre="Réclamation">
        <Paragraphe>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont
          pas respectés, vous pouvez introduire une réclamation auprès de la{' '}
          {CNIL.denomination} — {CNIL.adresse} —{' '}
          <Link href={CNIL.site} target="_blank" rel="noopener noreferrer" color="primary.dark">
            cnil.fr
          </Link>
          .
        </Paragraphe>
      </Section>

      <Section titre="Modifications de cette politique">
        <Paragraphe>
          Cette politique peut évoluer, notamment si la collecte change. La date
          de dernière mise à jour figure en tête de page. Les demandes déjà
          déposées restent régies par la version acceptée au moment de leur
          envoi, dont la référence est conservée avec elles.
        </Paragraphe>
      </Section>
    </PageLegale>
  )
}
