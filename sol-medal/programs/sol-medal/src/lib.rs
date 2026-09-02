use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mpl_token_metadata::types::{Collection, Creator, DataV2},
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub const MINT_PRICE: u64 = 1_000_000_000; // 1 SOL
pub const PLATFORM_FEE: u64 = 1_000_000;   // 0.001 SOL

#[program]
pub mod sol_medal {
    use super::*;

    /// 初始化平台配置（只需调用一次）
    pub fn initialize(
        ctx: Context<Initialize>,
        platform_wallet: Pubkey,
        collection_uri: String,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.platform_wallet = platform_wallet;
        config.collection_mint = ctx.accounts.collection_mint.key();
        config.total_minted = 0;
        config.bump = ctx.bumps.config;

        let seeds: &[&[&[u8]]] = &[&[b"config", &[ctx.bumps.config]]];

        // 铸造合集 NFT
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.collection_mint.to_account_info(),
                    to: ctx.accounts.collection_token_account.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                seeds,
            ),
            1,
        )?;

        // 创建合集元数据
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.collection_metadata.to_account_info(),
                    mint: ctx.accounts.collection_mint.to_account_info(),
                    mint_authority: ctx.accounts.config.to_account_info(),
                    payer: ctx.accounts.authority.to_account_info(),
                    update_authority: ctx.accounts.config.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                seeds,
            ),
            DataV2 {
                name: "SolMedal Collection".to_string(),
                symbol: "SMED".to_string(),
                uri: collection_uri,
                seller_fee_basis_points: 500,
                creators: Some(vec![Creator {
                    address: ctx.accounts.authority.key(),
                    verified: false,
                    share: 100,
                }]),
                collection: None,
                uses: None,
            },
            true,
            true,
            None,
        )?;

        // 创建合集 MasterEdition
        create_master_edition_v3(
            CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.collection_master_edition.to_account_info(),
                    mint: ctx.accounts.collection_mint.to_account_info(),
                    update_authority: ctx.accounts.config.to_account_info(),
                    mint_authority: ctx.accounts.config.to_account_info(),
                    payer: ctx.accounts.authority.to_account_info(),
                    metadata: ctx.accounts.collection_metadata.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                seeds,
            ),
            Some(0),
        )?;

        Ok(())
    }

    /// 铸造季军奖牌 NFT，消耗 1.001 SOL
    pub fn mint_medal(
        ctx: Context<MintMedal>,
        competition_name: String,
        competition_date: String,
        description: String,
        image_uri: String,
    ) -> Result<()> {
        require!(competition_name.len() <= 64, MedalError::NameTooLong);
        require!(competition_date.len() <= 32, MedalError::DateTooLong);
        require!(description.len() <= 256, MedalError::DescriptionTooLong);

        let config_bump = ctx.accounts.config.bump;
        let seeds: &[&[&[u8]]] = &[&[b"config", &[config_bump]]];

        // 1. 平台手续费 0.001 SOL → platform_wallet
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.platform_wallet.to_account_info(),
                },
            ),
            PLATFORM_FEE,
        )?;

        // 2. 锁入 1 SOL → medal_record PDA（融化时归还）
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.medal_record.to_account_info(),
                },
            ),
            MINT_PRICE,
        )?;

        // 3. 铸造 NFT token（mint authority = config PDA）
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.nft_mint.to_account_info(),
                    to: ctx.accounts.nft_token_account.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                seeds,
            ),
            1,
        )?;

        // 4. 创建 Metaplex 元数据
        let serial = ctx.accounts.config.total_minted + 1;
        let nft_name = format!("SolMedal #{} 季军", serial);
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.nft_metadata.to_account_info(),
                    mint: ctx.accounts.nft_mint.to_account_info(),
                    mint_authority: ctx.accounts.config.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    update_authority: ctx.accounts.config.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                seeds,
            ),
            DataV2 {
                name: nft_name.clone(),
                symbol: "SMED".to_string(),
                uri: image_uri,
                seller_fee_basis_points: 500,
                creators: Some(vec![Creator {
                    address: ctx.accounts.config.authority,
                    verified: false,
                    share: 100,
                }]),
                collection: Some(Collection {
                    verified: false,
                    key: ctx.accounts.config.collection_mint,
                }),
                uses: None,
            },
            true,
            true,
            None,
        )?;

        // 5. 创建 MasterEdition（唯一 NFT）
        create_master_edition_v3(
            CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.nft_master_edition.to_account_info(),
                    mint: ctx.accounts.nft_mint.to_account_info(),
                    update_authority: ctx.accounts.config.to_account_info(),
                    mint_authority: ctx.accounts.config.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    metadata: ctx.accounts.nft_metadata.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                seeds,
            ),
            Some(0),
        )?;

        // 6. 存储奖牌数据
        let record = &mut ctx.accounts.medal_record;
        record.nft_mint = ctx.accounts.nft_mint.key();
        record.organizer = ctx.accounts.payer.key();
        record.competition_name = competition_name.clone();
        record.competition_date = competition_date.clone();
        record.description = description;
        record.serial = serial;
        record.minted_at = Clock::get()?.unix_timestamp;
        record.bump = ctx.bumps.medal_record;

        ctx.accounts.config.total_minted = serial;

        emit!(MedalMinted {
            nft_mint: ctx.accounts.nft_mint.key(),
            organizer: ctx.accounts.payer.key(),
            competition_name,
            competition_date,
            serial,
        });

        Ok(())
    }

    /// 融化奖牌，归还 1 SOL + 账户租金
    pub fn burn_medal(ctx: Context<BurnMedal>) -> Result<()> {
        // 销毁 NFT token
        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.nft_mint.to_account_info(),
                    from: ctx.accounts.nft_token_account.to_account_info(),
                    authority: ctx.accounts.holder.to_account_info(),
                },
            ),
            1,
        )?;

        // medal_record 的 `close = holder` 属性会自动将账户内所有
        // lamports（租金 + 1 SOL）发回 holder

        emit!(MedalBurned {
            nft_mint: ctx.accounts.nft_mint.key(),
            holder: ctx.accounts.holder.key(),
        });

        Ok(())
    }
}

// ─── 账户数据结构 ───────────────────────────────────────────

#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,
    pub platform_wallet: Pubkey,
    pub collection_mint: Pubkey,
    pub total_minted: u64,
    pub bump: u8,
}

impl PlatformConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1;
}

#[account]
pub struct MedalRecord {
    pub nft_mint: Pubkey,
    pub organizer: Pubkey,
    pub competition_name: String, // max 64
    pub competition_date: String, // max 32
    pub description: String,      // max 256
    pub serial: u64,
    pub minted_at: i64,
    pub bump: u8,
}

impl MedalRecord {
    pub const LEN: usize = 8 + 32 + 32 + (4 + 64) + (4 + 32) + (4 + 256) + 8 + 8 + 1;
}

// ─── 指令上下文 ────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = PlatformConfig::LEN,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, PlatformConfig>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = config,
        mint::freeze_authority = config,
    )]
    pub collection_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = collection_mint,
        associated_token::authority = config,
    )]
    pub collection_token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex 负责验证
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex 负责验证
    #[account(mut)]
    pub collection_master_edition: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintMedal<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,

    /// CHECK: 平台收费钱包
    #[account(
        mut,
        constraint = platform_wallet.key() == config.platform_wallet @ MedalError::WrongPlatformWallet
    )]
    pub platform_wallet: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = config,
        mint::freeze_authority = config,
    )]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = nft_mint,
        associated_token::authority = payer,
    )]
    pub nft_token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex 负责验证
    #[account(mut)]
    pub nft_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex 负责验证
    #[account(mut)]
    pub nft_master_edition: UncheckedAccount<'info>,

    // 存储奖牌数据 + 锁住 1 SOL（融化时通过 close=holder 归还）
    #[account(
        init,
        payer = payer,
        space = MedalRecord::LEN,
        seeds = [b"medal", nft_mint.key().as_ref()],
        bump,
    )]
    pub medal_record: Account<'info, MedalRecord>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BurnMedal<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,

    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = holder,
        constraint = nft_token_account.amount == 1 @ MedalError::NotHolder,
    )]
    pub nft_token_account: Account<'info, TokenAccount>,

    // close = holder: 关闭账户，所有 lamports（租金 + 1 SOL）返回 holder
    #[account(
        mut,
        seeds = [b"medal", nft_mint.key().as_ref()],
        bump = medal_record.bump,
        close = holder,
    )]
    pub medal_record: Account<'info, MedalRecord>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// ─── 事件 ─────────────────────────────────────────────────

#[event]
pub struct MedalMinted {
    pub nft_mint: Pubkey,
    pub organizer: Pubkey,
    pub competition_name: String,
    pub competition_date: String,
    pub serial: u64,
}

#[event]
pub struct MedalBurned {
    pub nft_mint: Pubkey,
    pub holder: Pubkey,
}

// ─── 错误 ─────────────────────────────────────────────────

#[error_code]
pub enum MedalError {
    #[msg("比赛名称过长（最多 64 字符）")]
    NameTooLong,
    #[msg("日期过长（最多 32 字符）")]
    DateTooLong,
    #[msg("描述过长（最多 256 字符）")]
    DescriptionTooLong,
    #[msg("平台钱包地址不匹配")]
    WrongPlatformWallet,
    #[msg("你不持有该 NFT")]
    NotHolder,
}
