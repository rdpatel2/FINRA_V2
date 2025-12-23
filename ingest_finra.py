import polars as pl
import argparse
import os
from supabase import create_client, Client
import financedatabase as fd
import datetime
import psycopg2

# Set to true for local testing, false for github actions script
TEST = False

if TEST:
    from dotenv import load_dotenv
    load_dotenv()

def read_data():
    # Scan in number of entries 
    total_rows = pl.scan_csv(
    "finra_today.txt",
    separator="|",
    ).select(pl.len()).collect().item()
    
    # Scan in everything before the last line
    df = pl.scan_csv(
        "finra_today.txt",
        separator="|",
        schema={
            "date": pl.Utf8,
            "symbol": pl.Utf8,
            "short_volume": pl.Int64,
            "shortExemptVolume": pl.Int64,
            "total_volume": pl.Int64,
            "market": pl.Utf8,
        },
        n_rows = total_rows - 1
    ).collect()

    # Convert Date column from 20251126 → real date type
    df = df.with_columns(
        pl.col("date")
        .cast(pl.Utf8)
          .str.strptime(pl.Date, "%Y%m%d")
    )

    # Assign things like industry, sector, and exchange to equities and etfs
    df = df.drop(['market', 'shortExemptVolume'])
    equities = fd.Equities().select().reset_index()
    equities = equities.drop(columns=['summary', 'currency', 'industry_group', 'market', 'country', 'state', 'city', 'zipcode', 'website', 'market_cap', 'isin', 'cusip', 'figi', 'composite_figi', 'shareclass_figi'])
    etfs = fd.ETFs().select().reset_index()
    etfs = etfs.drop(columns=['currency', 'summary', 'category_group', 'category', 'family', 'Unnamed: 8', 'Unnamed: 9'])

    # This script should only be executed by github actions, so key and url will be stored in secrets, not seen
    if TEST: 
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
    else:
        parser = argparse.ArgumentParser()
        parser.add_argument("url", help="Enter the url for the supabase DB")
        parser.add_argument("key", help="Enter the key for the supabase DB")

        args = parser.parse_args()
        url = args.url
        key = args.key

    try:
        client = create_client(url, key)
        print("Connection successful")
    except Exception as e:
        print(e)

    # Add data from the finanace database lib to our main polar dataframe
    # Need pyarrow
    df = df.join(pl.from_pandas(equities), how="left", on="symbol")
    df = df.join(pl.from_pandas(etfs), how="left", on="symbol")
    df = df.drop(['exchange_right', 'name_right'])
    df = df.drop_nulls(subset=['symbol', 'date', 'short_volume', 'total_volume'])

    # Insert data into db
    df = df.with_columns([
        pl.col(pl.Date).cast(pl.Utf8)
    ])

    response = (
        client.table("finra_metrics")
        .insert(df.to_dicts())
        .execute()
    )

    response = client.rpc('update_all_zscores').execute()
    print(f"Updated z-scores for {response.data} rows")

read_data()