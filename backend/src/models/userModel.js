import mongoose from "mongoose"
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Depuis Mongoose 7, un middleware déclaré `async` est attendu par la
// bibliothèque : `next` ne lui est plus passé et vaut donc `undefined`.
// L'appeler levait « next is not a function » à chaque enregistrement — donc
// à chaque inscription et à chaque modification de profil. La sortie anticipée
// se fait maintenant par un `return` nu, et la fin du hook par la simple
// résolution de la promesse.
userSchema.pre('save', async function () {
  // Sans cette sortie, un save qui ne touche pas au mot de passe (changement
  // de nom, d'email...) re-hashait le hash existant et rendait le compte
  // définitivement inaccessible.
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
