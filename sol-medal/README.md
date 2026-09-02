# SolMedal 🏅

链上奖牌铸造系统 — Solana NFT Medal System

## 功能

- 连接 Phantom 钱包
- 铸造季军奖牌 NFT（1.001 SOL）
- 将奖牌 transfer 给获奖者
- 融化奖牌归还 1 SOL

## 技术栈

- **合约**: Anchor 0.30.1 + Metaplex Token Metadata
- **前端**: Next.js 14 + Tailwind CSS + @solana/wallet-adapter
- **网络**: Solana Devnet

## 项目结构

```
sol-medal/
├── programs/sol-medal/src/lib.rs   # Anchor 合约
├── app/                             # Next.js 前端
│   └── src/
│       ├── pages/                   # 页面
│       ├── components/              # 组件
│       ├── hooks/                   # Anchor 交互 hooks
│       └── utils/                   # 常量 / 工具
├── Anchor.toml
└── Cargo.toml
```

## 本地运行步骤

### 1. 安装工具链

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# 切换到 devnet，生成钱包
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 5   # 领测试 SOL
```

### 2. 编译 & 部署合约

```bash
cd sol-medal
anchor build

# 查看生成的 Program ID
solana address -k target/deploy/sol_medal-keypair.json

# 将 Program ID 填入:
# 1. programs/sol-medal/src/lib.rs  declare_id! 宏
# 2. Anchor.toml [programs.devnet] sol_medal = "..."
# 然后重新 anchor build

anchor deploy --provider.cluster devnet
```

### 3. 初始化合集

```bash
# 部署后运行初始化脚本（填好 constants.ts 后）
cd app
npm run init
```

### 4. 启动前端

```bash
cd app
npm install

# 复制 IDL
cp ../target/idl/sol_medal.json src/idl/sol_medal.json

# 更新 src/utils/constants.ts:
# - PROGRAM_ID: 部署后的 Program ID
# - PLATFORM_WALLET: 你的收费钱包地址

npm run dev
# 打开 http://localhost:3000
```

## 经济模型

| 操作 | 费用 |
|------|------|
| 铸造奖牌 | 1.001 SOL |
| 平台手续费 | 0.001 SOL（不退） |
| 融化奖牌 | 归还 ~1.002 SOL（含账户租金） |
