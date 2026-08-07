import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@mui/material'
import PageLegale, { Paragraphe, Section, Valeur } from '../components/PageLegale'
import { CNIL, DERNIERE_MISE_A_JOUR, EDITEUR } from '../config/entreprise'

/**
 * Conditions générales d'utilisation.
 *
 * Ce sont des CGU, pas des CGV : le site ne permet aujourd'hui aucun achat en
 * ligne — il n'y a ni commande, ni paiement. Le texte le dit explicitement
 * plutôt que de laisser croire le contraire. Des conditions générales de vente
 * devront être rédigées avant la première vente, et elles répondent à des
 * obligations différentes.
 */
export default function CGU() {
  return (
    <PageLegale
      titre="Conditions générales d’utilisation"
      miseAJour={DERNIERE_MISE_A_JOUR}
      chapeau="Ces conditions encadrent l’utilisation du site Incloz. Les consulter est libre ; les accepter est nécessaire pour créer un compte ou déposer une demande sur-mesure."
    >
      <Section titre="1. Objet">
        <Paragraphe>
          Le présent document définit les modalités d’accès et d’utilisation du
          site Incloz, édité par {EDITEUR.denomination}, qui conçoit des
          vêtements de sport adaptés aux parathlètes.
        </Paragraphe>
        <Paragraphe>
          L’utilisation du site vaut acceptation de ces conditions. Un visiteur
          qui ne les accepte pas est invité à ne pas l’utiliser.
        </Paragraphe>
      </Section>

      <Section titre="2. Accès au site">
        <Paragraphe>
          Le site est accessible gratuitement, à toute personne disposant d’un
          accès à internet. Les frais liés à cet accès — matériel, connexion —
          restent à la charge du visiteur.
        </Paragraphe>
        <Paragraphe>
          L’éditeur s’efforce de maintenir le site accessible en permanence,
          sans garantie de résultat. L’accès peut être interrompu, notamment
          pour maintenance, mise à jour ou en cas de panne, sans que cela ouvre
          droit à indemnité.
        </Paragraphe>
      </Section>

      <Section titre="3. Absence de vente en ligne">
        <Paragraphe>
          <strong>
            Le site ne permet pas, à ce jour, d’acheter un produit en ligne.
          </strong>{' '}
          Aucune commande ne peut être passée et aucun paiement n’est encaissé.
          Le panier accessible depuis le site est un outil de sélection : il ne
          constitue ni une commande, ni une réservation, ni un engagement de
          l’une ou l’autre partie.
        </Paragraphe>
        <Paragraphe>
          Les prix affichés le sont à titre indicatif. Toute vente future sera
          encadrée par des conditions générales de vente distinctes, portées à
          la connaissance de l’acheteur avant la commande.
        </Paragraphe>
      </Section>

      <Section titre="4. Compte utilisateur">
        <Paragraphe>
          La création d’un compte requiert un nom, une adresse e-mail valide et
          un mot de passe d’au moins huit caractères. Le visiteur s’engage à
          fournir des informations exactes et à les tenir à jour.
        </Paragraphe>
        <Paragraphe>
          Les identifiants sont personnels et confidentiels. Le titulaire du
          compte est responsable des actions effectuées depuis celui-ci et
          s’engage à signaler sans délai toute utilisation non autorisée.
        </Paragraphe>
        <Paragraphe>
          Le compte peut être supprimé à tout moment sur simple demande adressée
          à{' '}
          <Valeur champ="adresse e-mail de contact">{EDITEUR.emailContact}</Valeur>.
          L’éditeur peut suspendre ou supprimer un compte en cas de manquement
          aux présentes conditions, après en avoir informé son titulaire.
        </Paragraphe>
      </Section>

      <Section titre="5. Demandes sur-mesure">
        <Paragraphe>
          Le formulaire de demande sur-mesure permet de transmettre des
          mensurations, un type de vêtement souhaité et, facultativement, une
          photographie, afin que l’éditeur étudie la faisabilité d’une pièce
          adaptée.
        </Paragraphe>
        <Paragraphe>
          <strong>Une demande n’est pas une commande.</strong> Elle n’engage ni
          le demandeur ni l’éditeur, ne fixe aucun prix et ne crée aucune
          obligation de réalisation. Elle ouvre un échange, rien de plus.
        </Paragraphe>
        <Paragraphe>
          Le dépôt d’une demande suppose le consentement exprès au traitement
          des données qu’elle contient, recueilli sur le formulaire et décrit
          dans la{' '}
          <Link component={RouterLink} to="/politique-confidentialite" color="primary.dark">
            politique de confidentialité
          </Link>
          .
        </Paragraphe>
      </Section>

      <Section titre="6. Comportement attendu">
        <Paragraphe>
          Le visiteur s’engage à ne pas nuire au fonctionnement du site,
          notamment à ne pas tenter d’accéder à des espaces réservés, de
          contourner les mesures de sécurité, d’adresser des envois massifs ou
          automatisés, ni de déposer un contenu illicite, injurieux ou portant
          atteinte aux droits d’un tiers.
        </Paragraphe>
        <Paragraphe>
          Une photographie transmise ne doit représenter que le demandeur, ou
          une personne dont il a recueilli l’accord.
        </Paragraphe>
      </Section>

      <Section titre="7. Propriété intellectuelle">
        <Paragraphe>
          Les contenus du site sont protégés. Les conditions de leur
          réutilisation figurent dans les{' '}
          <Link component={RouterLink} to="/mentions-legales" color="primary.dark">
            mentions légales
          </Link>
          .
        </Paragraphe>
        <Paragraphe>
          Les contenus transmis par un visiteur restent sa propriété. Il
          autorise l’éditeur à les utiliser aux seules fins de traiter sa
          demande, pour la durée de conservation annoncée.
        </Paragraphe>
      </Section>

      <Section titre="8. Responsabilité">
        <Paragraphe>
          Les informations publiées sur le site le sont à titre indicatif.
          L’éditeur s’efforce d’en assurer l’exactitude sans pouvoir la
          garantir, et ne saurait être tenu responsable d’une décision prise sur
          leur seul fondement.
        </Paragraphe>
        <Paragraphe>
          Les conseils d’adaptation présentés sur le site ne constituent pas un
          avis médical et ne remplacent pas l’avis d’un professionnel de santé.
        </Paragraphe>
      </Section>

      <Section titre="9. Modification des conditions">
        <Paragraphe>
          Ces conditions peuvent être modifiées à tout moment. La version
          applicable est celle publiée sur cette page au moment de
          l’utilisation ; sa date de mise à jour figure en tête de page.
        </Paragraphe>
      </Section>

      <Section titre="10. Droit applicable et réclamations">
        <Paragraphe>
          Les présentes conditions sont soumises au droit français. En cas de
          différend, une solution amiable sera recherchée avant toute action
          contentieuse.
        </Paragraphe>
        <Paragraphe>
          Toute réclamation relative aux données personnelles peut être adressée
          à la {CNIL.denomination} — {CNIL.adresse} —{' '}
          <Link href={CNIL.site} target="_blank" rel="noopener noreferrer" color="primary.dark">
            cnil.fr
          </Link>
          .
        </Paragraphe>
      </Section>
    </PageLegale>
  )
}
