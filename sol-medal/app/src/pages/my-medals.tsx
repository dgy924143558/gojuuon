import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useMyMedals } from '@/hooks/useSolMedal'
import { NFTCard } from '@/components/NFTCard'

export default function MyMedals() {
  const { connected, publicKey } = useWallet()
  const { medals, loading, fetchMedals } = useMyMedals()

  useEffect(() => {
    if (connected) fetchMedals()
  }, [connected, fetchMedals])

  return (
    <>
      <Head>
        <title>我的奖牌 — SolMedal</title>
      </Head>

      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <span className="font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              SolMedal
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mint" className="text-gray-400 hover:text-white text-sm transition-colors">
              铸造奖牌
            </Link>
            <WalletMultiButton />
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">我的奖牌</h1>
            {connected && (
              <button
                onClick={fetchMedals}
                className="text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-lg px-3 py-1.5"
              >
                刷新
              </button>
            )}
          </div>

          {!connected ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-6">💛</div>
              <p className="text-gray-400 mb-6">连接钉包查看你的奖牌</p>
              <WalletMultiButton />
            </div>
          ) : loading ? (
            <div className="text-center py-24">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : medals.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-6">🎯</div>
              <p className="text-gray-400 mb-2">还没有奖牌</p>
              <p className="text-gray-600 text-sm mb-8">铸造一枚季军奖牌吧</p>
              <Link
                href="/mint"
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-semibold hover:from-amber-500 hover:to-orange-500 transition-all"
              >
                去铸造
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medals.map(medal => (
                <NFTCard key={medal.mint} medal={medal} onBurnSuccess={fetchMedals} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
