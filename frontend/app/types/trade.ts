export interface Trade{
  date: Date,
  symbol: String,
  exchange: String,
  industry: String,
  sector: String,
  name: String,
  short_volume: number,
  total_volume: number,
  short_pct: number,
  short_zscore: number,
  volume_zscore: number
}