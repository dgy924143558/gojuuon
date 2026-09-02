import { PublicKey } from '@solana/web3.js'

// 部署后用 `solana address -k target/deploy/sol_medal-keypair.json` 查看并更新
export const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

// 你自己的收费钱包地址
export const PLATFORM_WALLET = new PublicKey('11111111111111111111111111111111')

export const MINT_PRICE_LAMPORTS = 1_000_000_000  // 1 SOL
export const PLATFORM_FEE_LAMPORTS = 1_000_000    // 0.001 SOL
export const TOTAL_COST_LAMPORTS = MINT_PRICE_LAMPORTS + PLATFORM_FEE_LAMPORTS

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

export const NETWORK = 'devnet'
export const EXPLORER_BASE = 'https://explorer.solana.com'

export function explorerUrl(type: 'tx' | 'address', value: string) {
  return `${EXPLORER_BASE}/${type}/${value}?cluster=${NETWORK}`
}
