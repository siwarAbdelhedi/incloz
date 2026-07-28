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
  },
  {
    timestamps: true,
  }
)

const CustomRequest = mongoose.model('CustomRequest', customRequestSchema)

export default CustomRequest
