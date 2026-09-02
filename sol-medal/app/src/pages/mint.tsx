import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useMintMedal } from '@/hooks/useSolMedal'
import { explorerUrl } from '@/utils/constants'

export default function Mint() {
  const { connected } = useWallet()
  const { mintMedal, loading, error, txSignature } = useMintMedal()

  const [form, setForm] = useState({
    competitionName: '',
    competitionDate: '',
    description: '',
    recipientAddress: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await mintMedal({
      competitionName: form.competitionName,
      competitionDate: form.competitionDate,
      description: form.description,
      recipientAddress: form.recipientAddress || undefined,
    })
  }

  return (
    <>
      <Head>
        <title>铸造奖牌 — SolMedal</title>
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
            <Link href="/my-medals" className="text-gray-400 hover:text-white text-sm transition-colors">
              我的奖牌
            </Link>
            <WalletMultiButton />
          </div>
        </nav>

        <div className="max-w-md mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-5xl">🥉</span>
            <div>
              <h1 className="text-2xl font-bold">铸造季军奖牌</h1>
              <p className="text-gray-500 text-sm mt-0.5">费用1.001 SOL · 融化可回收 ~1 SOL</p>
            </div>
          </div>

          {!connected ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-6">请先连接钉包</p>
              <WalletMultiButton />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">比赛名称 *</label>
                <input
                  type="text"
                  required
                  maxLength={64}
                  placeholder="例：2024 全国编程大赛"
                  value={form.competitionName}
                  onChange={e => setForm({ ...form, competitionName: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">比赛日期 *</label>
                <input
                  type="date"
                  required
                  value={form.competitionDate}
                  onChange={e => setForm({ ...form, competitionDate: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">获奖说明</label>
                <textarea
                  rows={3}
                  maxLength={256}
                  placeholder="例：参赛 500 人，项目方向 AI 应用，最终进入决赛圈并获季军..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                />
                <p className="text-gray-700 text-xs mt-1 text-right">{form.description.length} / 256</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  获奖者钉包地址
                  <span className="text-gray-600 ml-1">(可空，空则铸造到自己钉包)</span>
                </label>
                <input
                  type="text"
                  placeholder="Solana 钉包地址"
                  value={form.recipientAddress}
                  onChange={e => setForm({ ...form, recipientAddress: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none transition-colors font-mono text-sm"
                />
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm">
                <div className="flex justify-between text-gray-400 mb-2">
                  <span>NFT 质押（融化可回收）</span>
                  <span>1.000 SOL</span>
                </div>
                <div className="flex justify-between text-gray-400 mb-3">
                  <span>平台手续费</span>
                  <span>0.001 SOL</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-700 pt-3">
                  <span>总计</span>
                  <span className="text-amber-400">1.001 SOL</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {txSignature && (
                <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-green-400 text-sm">
                  铸造成功！ 
                  <a
                    href={explorerUrl('tx', txSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    查看交易
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-semibold text-lg hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
              >
                {loading ? '铸造中...' : '铸造奖牌 (1.001 SOL)'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
