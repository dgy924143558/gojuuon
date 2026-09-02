import { useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
} from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  PROGRAM_ID,
  PLATFORM_WALLET,
  TOKEN_METADATA_PROGRAM_ID,
  explorerUrl,
} from '@/utils/constants'
import { getConfigPda, getMedalRecordPda, getMetadataPda, getMasterEditionPda } from '@/utils/pda'
import type { MintMedalParams, MedalNFT } from '@/types'

function loadIdl() {
  try {
    return require('@/idl/sol_medal.json')
  } catch {
    return null
  }
}

function getProgram(connection: any, wallet: any) {
  const idl = loadIdl()
  if (!idl) throw new Error('IDL 未找到。请先运行 anchor build 并复制 IDL 到 src/idl/sol_medal.json')
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  return new Program(idl, PROGRAM_ID, provider)
}

export function useMintMedal() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const mintMedal = useCallback(
    async (params: MintMedalParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        setError('请先连接钉包')
        return
      }

      setLoading(true)
      setError(null)
      setTxSignature(null)

      try {
        const program = getProgram(connection, wallet)

        const nftMintKeypair = Keypair.generate()
        const nftMint = nftMintKeypair.publicKey

        const [configPda] = getConfigPda()
        const [medalRecordPda] = getMedalRecordPda(nftMint)
        const [metadataPda] = getMetadataPda(nftMint)
        const [masterEditionPda] = getMasterEditionPda(nftMint)

        const nftTokenAccount = getAssociatedTokenAddressSync(nftMint, wallet.publicKey)

        // 默认图片 URI，实际项目建议上传到 Arweave/IPFS
        const imageUri = params.imageUri || 'https://raw.githubusercontent.com/dgy924143558/gojuuon/master/sol-medal/assets/medal-bronze.png'

        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1gdH')

        const tx = await program.methods
          .mintMedal(
            params.competitionName,
            params.competitionDate,
            params.description,
            imageUri
          )
          .accounts({
            payer: wallet.publicKey,
            config: configPda,
            platformWallet: PLATFORM_WALLET,
            nftMint,
            nftTokenAccount,
            nftMetadata: metadataPda,
            nftMasterEdition: masterEditionPda,
            medalRecord: medalRecordPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([nftMintKeypair])
          .rpc()

        setTxSignature(tx)

        // 如果要发送给其他人，铸造后转账
        if (params.recipientAddress) {
          await transferNft(connection, wallet, nftMint, new PublicKey(params.recipientAddress))
        }
      } catch (e: any) {
        setError(e.message || '铸造失败')
      } finally {
        setLoading(false)
      }
    },
    [connection, wallet]
  )

  return { mintMedal, loading, error, txSignature }
}

export function useBurnMedal() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const burnMedal = useCallback(
    async (nftMintStr: string) => {
      if (!wallet.publicKey) {
        setError('请先连接钉包')
        return
      }

      setLoading(true)
      setError(null)
      setTxSignature(null)

      try {
        const program = getProgram(connection, wallet)
        const nftMint = new PublicKey(nftMintStr)
        const [medalRecordPda] = getMedalRecordPda(nftMint)
        const nftTokenAccount = getAssociatedTokenAddressSync(nftMint, wallet.publicKey)

        const tx = await program.methods
          .burnMedal()
          .accounts({
            holder: wallet.publicKey,
            nftMint,
            nftTokenAccount,
            medalRecord: medalRecordPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        setTxSignature(tx)
      } catch (e: any) {
        setError(e.message || '融化失败')
      } finally {
        setLoading(false)
      }
    },
    [connection, wallet]
  )

  return { burnMedal, loading, error, txSignature }
}

export function useMyMedals() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [medals, setMedals] = useState<MedalNFT[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMedals = useCallback(async () => {
    if (!wallet.publicKey) return
    setLoading(true)
    try {
      const program = getProgram(connection, wallet)

      // 查找所有 medal_record PDA——通过 discriminator 匹配
      const records = await program.account.medalRecord.all()

      // 过滤出当前钱包持有的
      const myMintSet = new Set<string>()
      const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      })
      for (const { account } of tokenAccounts.value) {
        const amount = account.data.readBigUInt64LE(64)
        if (amount === 1n) {
          const mintBytes = account.data.slice(0, 32)
          myMintSet.add(new PublicKey(mintBytes).toBase58())
        }
      }

      const myMedals: MedalNFT[] = records
        .filter((r: any) => myMintSet.has(r.account.nftMint.toBase58()))
        .map((r: any) => ({
          mint: r.account.nftMint.toBase58(),
          name: `SolMedal #${r.account.serial} 季军`,
          competitionName: r.account.competitionName,
          competitionDate: r.account.competitionDate,
          description: r.account.description,
          serial: r.account.serial.toNumber(),
          mintedAt: r.account.mintedAt.toNumber(),
        }))

      setMedals(myMedals)
    } catch (e) {
      setMedals([])
    } finally {
      setLoading(false)
    }
  }, [connection, wallet])

  return { medals, loading, fetchMedals }
}

async function transferNft(
  connection: any,
  wallet: any,
  nftMint: PublicKey,
  recipient: PublicKey
) {
  const { createTransferInstruction, getOrCreateAssociatedTokenAccount } = await import('@solana/spl-token')
  const senderAta = getAssociatedTokenAddressSync(nftMint, wallet.publicKey)
  const recipientAta = await getOrCreateAssociatedTokenAccount(connection, wallet, nftMint, recipient)
  // 转账逻辑可进一步完善
}
