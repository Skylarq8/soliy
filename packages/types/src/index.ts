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
export type Boost = Tables['boosts']['Row']
export type Notification = Tables['notifications']['Row']

export type Category = 'clothing' | 'skincare' | 'makeup' | 'accessories'
export type ListingStatus = 'active' | 'swapped' | 'sold' | 'archived'
export type ProposalStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'completed'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface ClothingMeta {
  brand?: string
  size_local?: string
  size_intl?: string
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
  formula_type?: string
  percent_used?: number
  hygiene_note?: string
}

export interface AccessoriesMeta {
  brand?: string
  material?: string
  dimensions?: string
  hardware_condition?: string
}

export type CategoryMeta = ClothingMeta | SkincareMeta | MakeupMeta | AccessoriesMeta
