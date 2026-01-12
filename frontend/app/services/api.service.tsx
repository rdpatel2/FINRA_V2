import axios from "axios";
import { Trade } from "../types/trade";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const FinraApi = {

  getAll(): Promise<Trade[]> {
    return api.get<Trade[]>('/')
    .then(res => res.data);
  },

  getByDate(date: string): Promise<Trade[]> {
    return api
      .get<Trade[]>(`/date-movement/${date}`)
      .then(res => res.data);
  },

  getBySector(sector: string): Promise<Trade[]> {
    return api
      .get<Trade[]>(`/sector-movement/${sector}`)
      .then(res => res.data);
  },

  getByIndustry(industry: string): Promise<Trade[]> {
    return api
      .get<Trade[]>(`/industry-movement/${industry}`)
      .then(res => res.data);
  },

  getBySymbol(symbol: string): Promise<Trade[]> {
    return api
      .get<Trade[]>(`/symbol-movement/${symbol}`)
      .then(res => res.data);
  },
};
