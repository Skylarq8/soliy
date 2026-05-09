import type { Database } from '@swaply/db'

export type Tables = Database['public']['Tables']

export type User = Tables['users']['Row']
export type Listing = Tables['listings']['Row'] & {
  users?: Pick<User, 'nickname' | 'avatar_url' | 'safe_score' | 'swap_count'> | null
}
export type Proposal = Tables['proposals']['Row']
export type EnrichedProposal = Proposal & {
  sender?: Pick<User, 'id' | 'name' | 'nickname' | 'avatar_url' | 'safe_score' | 'swap_count'> | null
  receiver?: Pick<User, 'id' | 'name' | 'nickname' | 'avatar_url' | 'safe_score' | 'swap_count'> | null
  offered_listings?: Listing[]
  requested_listings?: Listing[]
  latest_message?: Message | null
}
export type Message = Tables['messages']['Row'] & {
  users?: Pick<User, 'nickname' | 'avatar_url'> | null
}
export type Review = Tables['reviews']['Row']
export type Verification = Tables['verifications']['Row']
export type Follow = Tables['follows']['Row']
export type SavedListing = Tables['saved_listings']['Row']
export type MessageRead = Tables['message_reads']['Row']
export type Boost = Tables['boosts']['Row']
export type Notification = Tables['notifications']['Row']

export type Category = 'clothing' | 'skincare' | 'makeup' | 'accessories' | 'perfume' | 'instruments'
export type ListingStatus = 'active' | 'swapped' | 'sold' | 'archived'
export type ProposalStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'completed'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface ClothingMeta {
  brand?: string
  size?: string
  size_local?: string
  size_intl?: string
  color?: string
  gender?: string
  material?: string
}

export interface SkincareMeta {
  brand?: string
  skin_type?: string
  percent_used?: number
  expiry_date?: string
  is_opened?: boolean
}

export interface MakeupMeta {
  brand?: string
  shade?: string
  finish_type?: string
  percent_used?: number
  expiry_date?: string
  hygiene_note?: string
}

export interface AccessoriesMeta {
  accessory_type?: string
  brand?: string
  material?: string
  dimensions?: string
}

export interface PerfumeMeta {
  brand?: string
  fragrance_type?: string
  percent_used?: number
  longevity?: string
}

export interface InstrumentsMeta {
  instrument_type?: string
  brand?: string
  year?: number
  accessories_included?: string
  damage_notes?: string
}

export type CategoryMeta = ClothingMeta | SkincareMeta | MakeupMeta | AccessoriesMeta | PerfumeMeta | InstrumentsMeta
