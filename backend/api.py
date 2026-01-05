from fastapi import FastAPI
from datetime import date
from supabase import create_client, Client
import psycopg2
import os
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

client = None

try:
    client = create_client(url, key)
    print("Connection Success")
except Exception as e:
    print(e)

@app.get("/")
async def root():
    return {"message" : "Hello World"}

@app.get("/date-movement/{date}")
async def getDateMovement(date: date):
    response = client.table("finra_metrics") \
        .select("*") \
        .eq("date", date) \
        .execute() 
    return response

@app.get("sector-movement/{sector}")
async def getSectorMovement(sector: str):
    response = client.table("finra_metrics") \
        .select("*") \
        .eq("sector", sector) \
        .execute()
    return response

@app.get("industry-movement/{industry}")
async def getIndustryMovement(industry: str):
    response = client.table("finra_metrics") \
        .select("*") \
        .eq("industry", industry) \
        .execute()
    return response

@app.get("symbol-movement/{symbol}")
async def getSymbolMovement(symbol: str):
    response = client.table("finra_metrics") \
        .select("*") \
        .eq("symbol", symbol) \
        .execute()
    return response


def getSymbolMovementTest(symbol: str):
    response = client.table("finra_metrics") \
        .select("*") \
        .eq("symbol", symbol) \
        .execute()
    return response

print(getSymbolMovementTest("AAPL"))