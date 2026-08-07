import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'
import { api, createUser, auth } from './helpers.js'
import CustomRequest from '../src/models/customRequestModel.js'
import { PRIVATE_UPLOADS_DIR } from '../src/config/paths.js'
import { DUREE_CONSERVATION_MOIS, dateExpiration } from '../src/config/conservation.js'
import { purgerDemandesExpirees } from '../src/services/purgeDemandes.js'

const demandeValide = (requete) =>
  requete
    .field('consentement', 'true')
    .field('nom', 'Durand')
    .field('prenom', 'Camille')
    .field('email', 'camille@exemple.fr')
    .field('telephone', '0600000000')
    .field('typeVetement', 'tshirt')

describe('Consentement au dépôt d’une demande sur-mesure', () => {
  it('refuse une demande sans consentement', async () => {
    const res = await api()
      .post('/api/custom-request')
      .field('nom', 'Durand')
      .field('prenom', 'Camille')
      .field('email', 'camille@exemple.fr')
      .field('telephone', '0600000000')
      .field('typeVetement', 'tshirt')

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/consentement/i)
    expect(await CustomRequest.countDocuments()).toBe(0)
  })

  it('refuse une case explicitement décochée', async () => {
    const res = await demandeValide(
      api().post('/api/custom-request')
    ).field('consentement', 'false')

    expect(res.status).toBe(400)
    expect(await CustomRequest.countDocuments()).toBe(0)
  })

  it('accepte une demande consentie et en conserve la preuve', async () => {
    const avant = new Date()
    const res = await demandeValide(api().post('/api/custom-request'))

    expect(res.status).toBe(201)

    const demande = await CustomRequest.findById(res.body.id)
    expect(demande.consentementLe.getTime()).toBeGreaterThanOrEqual(avant.getTime() - 1000)
    expect(demande.versionPolitique).toBeTruthy()
  })

  // La date vient du serveur : un client qui l'annonce lui-même ne prouve rien.
  it('ignore une date de consentement envoyée par le client', async () => {
    const anterieure = new Date('2020-01-01').toISOString()
    const res = await demandeValide(
      api().post('/api/custom-request')
    ).field('consentementLe', anterieure)

    const demande = await CustomRequest.findById(res.body.id)
    expect(demande.consentementLe.getFullYear()).toBeGreaterThan(2020)
  })
})

describe('Durée de conservation', () => {
  it('pose une échéance à la bonne distance du dépôt', () => {
    const depart = new Date('2026-08-07T10:00:00Z')
    const echeance = dateExpiration(depart)

    const moisEcoules =
      (echeance.getFullYear() - depart.getFullYear()) * 12 +
      (echeance.getMonth() - depart.getMonth())

    expect(moisEcoules).toBe(DUREE_CONSERVATION_MOIS)
  })

  // setMonth gère les mois de longueurs différentes : le 31 d'un mois ne peut
  // pas donner un 31 dans un mois qui n'en a que 30.
  it('ne produit pas de date impossible depuis un 31', () => {
    const echeance = dateExpiration(new Date('2026-01-31T10:00:00Z'))
    expect(Number.isNaN(echeance.getTime())).toBe(false)
  })

  it('enregistre l’échéance avec la demande', async () => {
    const res = await demandeValide(api().post('/api/custom-request'))
    const demande = await CustomRequest.findById(res.body.id)

    expect(demande.expireLe).toBeInstanceOf(Date)
    expect(demande.expireLe.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('Purge des demandes expirées', () => {
  const creerDemande = async ({ expireLe, photo = null }) => {
    if (photo) {
      fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true })
      fs.writeFileSync(path.join(PRIVATE_UPLOADS_DIR, photo), 'contenu de test')
    }

    return CustomRequest.create({
      nom: 'Durand',
      prenom: 'Camille',
      email: 'camille@exemple.fr',
      telephone: '0600000000',
      typeVetement: 'tshirt',
      photos: photo,
      consentementLe: new Date(),
      versionPolitique: 'test',
      expireLe,
    })
  }

  const hier = () => new Date(Date.now() - 24 * 60 * 60 * 1000)
  const demain = () => new Date(Date.now() + 24 * 60 * 60 * 1000)

  it('laisse intacte une demande encore dans sa durée', async () => {
    await creerDemande({ expireLe: demain() })

    const bilan = await purgerDemandesExpirees()

    expect(bilan.fiches).toBe(0)
    expect(await CustomRequest.countDocuments()).toBe(1)
  })

  it('supprime une demande expirée', async () => {
    await creerDemande({ expireLe: hier() })

    const bilan = await purgerDemandesExpirees()

    expect(bilan.fiches).toBe(1)
    expect(await CustomRequest.countDocuments()).toBe(0)
  })

  // Le point central : un index TTL aurait effacé la fiche en laissant la
  // photo sur le disque, sans plus rien pour la rattacher à quoi que ce soit.
  it('supprime aussi la photo, pas seulement la fiche', async () => {
    const photo = `test-purge-${Date.now()}.png`
    await creerDemande({ expireLe: hier(), photo })

    const chemin = path.join(PRIVATE_UPLOADS_DIR, photo)
    expect(fs.existsSync(chemin)).toBe(true)

    const bilan = await purgerDemandesExpirees()

    expect(bilan.photos).toBe(1)
    expect(fs.existsSync(chemin)).toBe(false)
    expect(await CustomRequest.countDocuments()).toBe(0)
  })

  it('supprime la fiche même si la photo a déjà disparu', async () => {
    await creerDemande({ expireLe: hier(), photo: 'fichier-absent.png' })

    const bilan = await purgerDemandesExpirees()

    expect(bilan.fiches).toBe(1)
    expect(bilan.echecs).toHaveLength(0)
  })

  it('ne touche que ce qui est expiré quand les deux coexistent', async () => {
    await creerDemande({ expireLe: hier() })
    const gardee = await creerDemande({ expireLe: demain() })

    await purgerDemandesExpirees()

    const restantes = await CustomRequest.find({})
    expect(restantes).toHaveLength(1)
    expect(String(restantes[0]._id)).toBe(String(gardee._id))
  })
})
