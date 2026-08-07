import mongoose from 'mongoose'

const customRequestSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    rue: { type: String },
    ville: { type: String },
    codePostal: { type: String },

    typeVetement: {
      type: String,
      enum: ['tshirt', 'short', 'jogging'],
      required: true,
    },

    taille: { type: Number },
    hanches: { type: Number },
    cuisse: { type: Number },
    entrejambe: { type: Number },

    photos: { type: String },

    // Preuve du consentement. Le règlement demande de pouvoir démontrer non
    // seulement qu'une personne a consenti, mais à quoi : l'horodatage seul ne
    // suffit pas, la version du texte accepté est conservée avec lui.
    consentementLe: { type: Date, required: true },
    versionPolitique: { type: String, required: true },

    // Date au-delà de laquelle la fiche et sa photo doivent être supprimées.
    // Voir config/conservation.js et scripts/purgerDemandes.js.
    expireLe: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
)

const CustomRequest = mongoose.model('CustomRequest', customRequestSchema)

export default CustomRequest
