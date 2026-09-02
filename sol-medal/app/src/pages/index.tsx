import Head from 'next/head'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Home() {
  const { connected } = useWallet()

  return (
    <>
      <Head>
        <title>SolMedal — 链上奖牌</title>
        <meta name="description" content="铸造你的区块链奖牌证书" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏅</span>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              SolMedal
            </span>
          </div>
          <div className="flex items-center gap-6">
            {connected && (
              <>
                <Link href="/mint" className="text-gray-300 hover:text-white transition-colors text-sm">
                  铸造奖牌
                </Link>
                <Link href="/my-medals" className="text-gray-300 hover:text-white transition-colors text-sm">
                  我的奖牌
                </Link>
              </>
            )}
            <WalletMultiButton />
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-8xl mb-8">🏅</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 bg-clip-text text-transparent">
            SolMedal
          </h1>
          <p className="text-xl text-gray-400 mb-3">链上奖牌 · 永久存证 · 可信防伪</p>
          <p className="text-gray-500 mb-14 max-w-lg mx-auto">
            将比赛荣誉铸造成 Solana 链上 NFT 奖牌，永久记录、随时可验。
            可以收藏、售卖或融化回收
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-amber-700 transition-colors">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-semibold mb-2">合集认证</h3>
              <p className="text-gray-400 text-sm">归属同一合集，真实可验证，防伪冖索敌无</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-amber-700 transition-colors">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">可交易</h3>
              <p className="text-gray-400 text-sm">在 Magic Eden 等 NFT 市场自由买卖</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left hover:border-amber-700 transition-colors">
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="font-semibold mb-2">可融化</h3>
              <p className="text-gray-400 text-sm">销毁 NFT 归还 ~1 SOL 质押金</p>
            </div>
          </div>

          {!connected ? (
            <div>
              <p className="text-gray-400 mb-4 text-sm">连接 Phantom 钉包开始使用</p>
              <WalletMultiButton />
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/mint"
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-semibold hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-900/30"
              >
                铸造奖牌
              </Link>
              <Link
                href="/my-medals"
                className="px-8 py-3 border border-gray-700 rounded-xl font-semibold hover:border-gray-500 transition-all"
              >
                我的奖牌
              </Link>
            </div>
          )}
        </main>

        <footer className="text-center text-gray-700 text-xs pb-8">
          运行在 Solana Devnet · SolMedal 合集
        </footer>
      </div>
    </>
  )
}
