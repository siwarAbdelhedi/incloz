import mongoose from 'mongoose'

const adaptatioSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    advice: {
      type: String,
      required: true,
    },
    side: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Adaptatio = mongoose.model('Adaptatio', adaptatioSchema)

export default Adaptatio
