from fastapi import FastAPI
import datetime
from supabase import create_client, Client
import psycopg2

app = FastAPI()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

try:
    client = create_client(url, key)
    print("Connection Success")
except Exception e:
    print(e.stackTrace())

@app.get("/")
async def root():
    return {"message" : "Hello World"}

@app.get("/date-movement/{date}")
async def getDateMovement(date: Date):
    response = client.table("finra_metrics")
        .select("*")
        .eq("finra_metrics.date", date)
        .execute()
    return response

@app.get("sector-movement/{sector}")
async def getSectorMovement(sector: str):
    response = client.table("finra_metrics")
        .select("*")
        .eq("finra_metrics.sector", sector)
        .execute()
    return response

@app.get("industry-movement/{industry}")
async def getIndustryMovement(industry: str):
    response = client.table("finra_metrics")
        .select("*")
        .eq("finra_metrics.industry", industry)
        .execute()
    return response

@app.get("symbol-movement/{symbol}")
async def getSymbolMovement(symbol: str):
    response = client.table("finra_metrics")
        .select("*")
        .eq("finra_metrics.symbol", symbol)
        .execute()
    return response