import { PublicKey } from '@solana/web3.js'

export interface MedalRecord {
  nftMint: PublicKey
  organizer: PublicKey
  competitionName: string
  competitionDate: string
  description: string
  serial: number
  mintedAt: number
  bump: number
}

export interface MintMedalParams {
  competitionName: string
  competitionDate: string
  description: string
  imageUri?: string
  recipientAddress?: string
}

export interface MedalNFT {
  mint: string
  name: string
  image?: string
  competitionName: string
  competitionDate: string
  description: string
  serial: number
  mintedAt: number
}
