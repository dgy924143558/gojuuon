import { useState } from 'react'
import { explorerUrl } from '@/utils/constants'
import { useBurnMedal } from '@/hooks/useSolMedal'
import type { MedalNFT } from '@/types'

interface NFTCardProps {
  medal: MedalNFT
  onBurnSuccess?: () => void
}

export function NFTCard({ medal, onBurnSuccess }: NFTCardProps) {
  const { burnMedal, loading, error, txSignature } = useBurnMedal()
  const [confirming, setConfirming] = useState(false)

  const handleBurn = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    await burnMedal(medal.mint)
    setConfirming(false)
    onBurnSuccess?.()
  }

  const mintedDate = new Date(medal.mintedAt * 1000).toLocaleDateString('zh-CN')

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-800 transition-colors">
      {/* 奖牌头部 */}
      <div className="bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-amber-900/40 p-8 text-center border-b border-gray-800">
        <div className="text-6xl mb-2">🥉</div>
        <div className="text-amber-400 font-bold text-lg">季军</div>
        <div className="text-gray-500 text-xs mt-1">#{medal.serial}</div>
      </div>

      {/* 奖牌信息 */}
      <div className="p-5">
        <h3 className="font-semibold text-white mb-3 truncate" title={medal.competitionName}>
          {medal.competitionName}
        </h3>
        <div className="space-y-1.5 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{medal.competitionDate}</span>
          </div>
          {medal.description && (
            <div className="flex items-start gap-2">
              <span>📝</span>
              <span className="line-clamp-2 text-xs">{medal.description}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>铸造于 {mintedDate}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={explorerUrl('address', medal.mint)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 text-xs border border-gray-700 rounded-lg text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
          >
            查看铸造
          </a>
          <button
            onClick={handleBurn}
            disabled={loading}
            className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
              confirming
                ? 'bg-red-900 border border-red-700 text-red-300 hover:bg-red-800'
                : 'border border-gray-700 text-gray-400 hover:border-red-700 hover:text-red-400'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {loading ? '融化中...' : confirming ? '确认融化？' : '🔥 融化'}
          </button>
        </div>

        {confirming && (
          <p className="text-xs text-red-400 mt-2 text-center">
            融化后 NFT 销毁，将收回 ~1 SOL。点击再次确认
          </p>
        )}

        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}

        {txSignature && (
          <p className="text-xs text-green-400 mt-2">
            融化成功！{' '}
            <a href={explorerUrl('tx', txSignature)} target="_blank" rel="noopener noreferrer" className="underline">
              查看交易
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
