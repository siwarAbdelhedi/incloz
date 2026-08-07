import { Link as RouterLink } from 'react-router-dom'
import { Link, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import PageLegale, { Paragraphe, Section, Valeur } from '../components/PageLegale'
import { DERNIERE_MISE_A_JOUR, EDITEUR, HEBERGEUR } from '../config/entreprise'

/**
 * Mentions légales — obligatoires pour tout site accessible au public, que
 * l'activité soit commerciale ou non (article 6 III de la loi pour la
 * confiance dans l'économie numérique).
 *
 * Cette page ne contenait qu'un titre alors qu'elle était routée, donc
 * publiquement accessible et vide.
 */
const Ligne = ({ libelle, children }) => (
  <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
    <strong>{libelle} : </strong>
    {children}
  </Typography>
)

Ligne.propTypes = {
  libelle: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales" miseAJour={DERNIERE_MISE_A_JOUR}>
      <Section titre="Éditeur du site">
        <Ligne libelle="Dénomination">{EDITEUR.denomination}</Ligne>
        <Ligne libelle="Forme juridique">
          <Valeur champ="forme juridique">{EDITEUR.formeJuridique}</Valeur>
        </Ligne>
        {EDITEUR.capitalSocial && (
          <Ligne libelle="Capital social">{EDITEUR.capitalSocial}</Ligne>
        )}
        <Ligne libelle="Siège social">
          <Valeur champ="adresse du siège">{EDITEUR.adresse}</Valeur>
        </Ligne>
        <Ligne libelle="SIRET">
          <Valeur champ="SIRET">{EDITEUR.siret}</Valeur>
        </Ligne>
        {EDITEUR.rcs && <Ligne libelle="RCS">{EDITEUR.rcs}</Ligne>}
        {EDITEUR.tva && <Ligne libelle="TVA intracommunautaire">{EDITEUR.tva}</Ligne>}
        <Ligne libelle="Directeur de la publication">
          <Valeur champ="directeur de la publication">
            {EDITEUR.directeurPublication}
          </Valeur>
        </Ligne>
        <Ligne libelle="Contact">
          <Valeur champ="adresse e-mail de contact">{EDITEUR.emailContact}</Valeur>
        </Ligne>
      </Section>

      <Section titre="Hébergeur">
        <Paragraphe>
          Le site est hébergé par :
        </Paragraphe>
        <Ligne libelle="Dénomination">
          <Valeur champ="nom de l’hébergeur">{HEBERGEUR.denomination}</Valeur>
        </Ligne>
        <Ligne libelle="Adresse">
          <Valeur champ="adresse de l’hébergeur">{HEBERGEUR.adresse}</Valeur>
        </Ligne>
        <Ligne libelle="Téléphone">
          <Valeur champ="téléphone de l’hébergeur">{HEBERGEUR.telephone}</Valeur>
        </Ligne>
      </Section>

      <Section titre="Propriété intellectuelle">
        <Paragraphe>
          L’ensemble des éléments composant ce site — textes, photographies,
          illustrations, logo, charte graphique et code source — est protégé par
          le droit de la propriété intellectuelle. Sauf mention contraire, ils
          sont la propriété de {EDITEUR.denomination}.
        </Paragraphe>
        <Paragraphe>
          Toute reproduction, représentation ou adaptation, totale ou partielle,
          sur quelque support que ce soit, est interdite sans autorisation
          écrite préalable.
        </Paragraphe>
      </Section>

      <Section titre="Données personnelles">
        <Paragraphe>
          Le traitement des données collectées sur ce site — notamment par le
          formulaire de demande sur-mesure — est décrit dans la{' '}
          <Link component={RouterLink} to="/politique-confidentialite" color="primary.dark">
            politique de confidentialité
          </Link>
          . Les conditions d’utilisation du site figurent dans les{' '}
          <Link component={RouterLink} to="/cgu" color="primary.dark">
            conditions générales d’utilisation
          </Link>
          .
        </Paragraphe>
      </Section>

      <Section titre="Signaler un contenu">
        <Paragraphe>
          Pour signaler un contenu illicite ou une erreur dans ces mentions,
          écrire à{' '}
          <Valeur champ="adresse e-mail de contact">{EDITEUR.emailContact}</Valeur>.
        </Paragraphe>
      </Section>
    </PageLegale>
  )
}
