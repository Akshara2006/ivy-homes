export interface Listing {
  listing_id: string
  listing_url: string
  website: string
  city_id: number
  apartment_name: string
  locality: string
  property_type: string
  bedroom: number
  bathroom: number
  balcony: number
  floor: number
  total_floors: number
  furnishing: string
  facing_direction: string
  covered_parking: number
  price: number
  carpet_area: number
  super_built_up_area?: number
  super_builtup_area?: number
  latitude: number
  longitude: number
  posted_by: string
  posted_by_name: string
  posted_by_contact: string
  project_id: string | null
  description: string
  posted_at: string
  is_verified?: boolean
  is_live?: boolean
}

export interface Rental {
  listing_id: string
  listing_url: string
  website: string
  city_id: number
  title: string
  apartment_name: string
  locality: string
  property_type: string
  bedroom: number
  bathroom: number
  floor: number
  total_floors: number
  furnishing: string
  facing_direction: string
  price: number
  deposit: number
  maintenance: number
  carpet_area: number
  super_builtup_area?: number
  super_built_up_area?: number
  latitude: number
  longitude: number
  posted_by: string
  posted_by_name: string
  posted_by_contact: string
  description: string
  posted_at: string
}

export interface Project {
  project_id: string
  project_url: string
  city_id: number
  apartment_name: string
  developer_name: string
  locality: string
  project_status: string
  total_units: number
  total_towers: number
  total_floors: number
  launch_date: string
  possession_date: string
  rera_number: string
  min_area_sqft: number
  max_area_sqft: number
  total_listings: number
  price_min: number
  price_max: number
  amenities: string[]
  latitude: number
  longitude: number
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  page_size: number
  results: T[]
}

export interface FavouritesResponse {
  count: number
  results: Listing[]
}

export interface AnalyticsSummary {
  city: string
  total_listings: number
  median_price: number
  median_price_per_sqft: number
  by_locality: { locality: string; count: number; median_price: number }[]
  by_bhk: { bedroom: number; count: number }[]
}

export interface AuthUser {
  email: string
  name: string
}

export interface LoginResponse {
  token?: string
  access_token?: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface ListingFilters {
  locality?: string
  bhk?: number
  bedroom?: number
  property_type?: string
  min_price?: number
  max_price?: number
  furnishing?: string
  sort_by?: string
  order?: string
  project_id?: string
}

export interface RentalFilters {
  locality?: string
  bhk?: number
  bedroom?: number
  furnishing?: string
  sort_by?: string
  order?: string
}

export interface ProjectFilters {
  locality?: string
  project_status?: string
  sort_by?: string
  order?: string
}
