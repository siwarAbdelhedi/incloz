import fs from 'fs'
import path from 'path'
import { describe, it, expect, afterEach } from 'vitest'
import { api, createUser, auth } from './helpers.js'
import { PRIVATE_UPLOADS_DIR, PUBLIC_UPLOADS_DIR, resolvePrivateUpload } from '../src/config/paths.js'

// Un vrai PNG minimal : le fileFilter contrôle l'extension et le type MIME.
const pngMinimal = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

const champsValides = {
  nom: 'Martin',
  prenom: 'Camille',
  email: 'camille@incloz.fr',
  telephone: '0600000000',
  typeVetement: 'tshirt',
}

const envoyerDemande = (avecPhoto = true) => {
  let req = api().post('/api/custom-request')
  for (const [k, v] of Object.entries(champsValides)) req = req.field(k, v)
  return avecPhoto ? req.attach('photos', pngMinimal, 'photo.png') : req
}

const fichiersPrives = () =>
  fs.existsSync(PRIVATE_UPLOADS_DIR)
    ? fs.readdirSync(PRIVATE_UPLOADS_DIR).filter((f) => f !== '.gitignore')
    : []

afterEach(() => {
  for (const f of fichiersPrives()) fs.unlinkSync(path.join(PRIVATE_UPLOADS_DIR, f))
})

describe('Dépôt d’une demande sur-mesure', () => {
  it('accepte une demande avec photo', async () => {
    const res = await envoyerDemande()

    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
  })

  // La réponse renvoyait tout l'enregistrement, y compris le nom du fichier.
  it('accuse réception sans renvoyer les données déposées', async () => {
    const res = await envoyerDemande()

    expect(res.body.nom).toBeUndefined()
    expect(res.body.telephone).toBeUndefined()
    expect(res.body.photos).toBeUndefined()
    expect(JSON.stringify(res.body)).not.toMatch(/\.png/)
  })

  it('écrit la photo hors du dossier servi en statique', async () => {
    await envoyerDemande()

    expect(fichiersPrives()).toHaveLength(1)
    const publics = fs.readdirSync(PUBLIC_UPLOADS_DIR)
    expect(publics.filter((f) => f.startsWith('photos-'))).toHaveLength(0)
  })

  it('refuse un fichier qui n’est ni image ni PDF', async () => {
    let req = api().post('/api/custom-request')
    for (const [k, v] of Object.entries(champsValides)) req = req.field(k, v)
    const res = await req.attach('photos', Buffer.from('#!/bin/sh'), 'script.sh')

    expect(res.status).toBe(400)
    expect(fichiersPrives()).toHaveLength(0)
  })
})

describe('Consultation des demandes', () => {
  it('refuse la liste à un visiteur anonyme', async () => {
    expect((await api().get('/api/custom-request')).status).toBe(401)
  })

  it('refuse la liste à un utilisateur non administrateur', async () => {
    const { token } = await createUser({ email: 'simple@incloz.fr' })
    const res = await api()
      .get('/api/custom-request')
      .set(...auth(token))

    expect(res.status).toBe(403)
  })

  it('liste les demandes pour un administrateur, sans le nom de fichier', async () => {
    await envoyerDemande()
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })

    const res = await api()
      .get('/api/custom-request')
      .set(...auth(token))

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].nom).toBe('Martin')
    expect(res.body[0].photos).toBeUndefined()
    expect(res.body[0].aUnePhoto).toBe(true)
    expect(res.body[0].photoUrl).toMatch(/^\/api\/custom-request\/\w+\/photo$/)
  })
})

describe('Accès à la photo', () => {
  const deposerEtRecupererUrl = async () => {
    const depot = await envoyerDemande()
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })
    const liste = await api()
      .get('/api/custom-request')
      .set(...auth(token))
    return { url: liste.body[0].photoUrl, token, id: depot.body.id }
  }

  it('refuse la photo à un visiteur anonyme', async () => {
    const { url } = await deposerEtRecupererUrl()
    expect((await api().get(url)).status).toBe(401)
  })

  it('refuse la photo à un utilisateur non administrateur', async () => {
    const { url } = await deposerEtRecupererUrl()
    const { token } = await createUser({ email: 'simple@incloz.fr' })

    const res = await api()
      .get(url)
      .set(...auth(token))
    expect(res.status).toBe(403)
  })

  it('sert la photo à un administrateur, sans mise en cache', async () => {
    const { url, token } = await deposerEtRecupererUrl()

    const res = await api()
      .get(url)
      .set(...auth(token))

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/image\/png/)
    expect(res.headers['cache-control']).toBe('private, no-store')
  })

  // Le cœur du problème : ces fichiers étaient servis en statique sous des
  // noms de la forme photos-<timestamp>.jpg, énumérables par force brute.
  it('n’expose plus la photo via /uploads', async () => {
    await envoyerDemande()
    const nomFichier = fichiersPrives()[0]

    const res = await api().get(`/uploads/${nomFichier}`)
    expect(res.status).toBe(404)
  })

  it('sert toujours les visuels publics du catalogue', async () => {
    const res = await api().get('/uploads/tshirt.png')
    expect(res.status).toBe(200)
  })

  it('renvoie 404 quand la demande n’a pas de photo', async () => {
    const depot = await envoyerDemande(false)
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })

    const res = await api()
      .get(`/api/custom-request/${depot.body.id}/photo`)
      .set(...auth(token))
    expect(res.status).toBe(404)
  })
})

describe('resolvePrivateUpload', () => {
  it('accepte un nom de fichier simple', () => {
    expect(resolvePrivateUpload('photos-123.png')).toBe(
      path.join(PRIVATE_UPLOADS_DIR, 'photos-123.png')
    )
  })

  it('neutralise une tentative de remontée de dossier', () => {
    const resolu = resolvePrivateUpload('../../etc/passwd')
    expect(resolu).toBe(path.join(PRIVATE_UPLOADS_DIR, 'passwd'))
    expect(resolu).not.toMatch(/etc/)
  })

  it('neutralise un chemin absolu', () => {
    expect(resolvePrivateUpload('/etc/passwd')).toBe(
      path.join(PRIVATE_UPLOADS_DIR, 'passwd')
    )
  })

  it('renvoie null sans nom de fichier', () => {
    expect(resolvePrivateUpload(null)).toBeNull()
    expect(resolvePrivateUpload('')).toBeNull()
  })
})
