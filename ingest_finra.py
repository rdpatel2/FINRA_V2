import polars as pl
import argparser
import os
from supabase import create_client, Client
import datetime

def read_data():
    df = pl.scan_csv(
        "finra_today.txt",
        separator="|",
        schema={
            "Date": pl.Int32,
            "Symbol": pl.Utf8,
            "ShortVolume": pl.Int64,
            "ShortExemptVolume": pl.Int64,
            "TotalVolume": pl.Int64,
            "Market": pl.Utf8,
        }
    ).collect()

    # Convert Date column from 20251126 → real date type
    df = df.with_columns(
        pl.col("Date")
        .cast(pl.Utf8)
          .str.strptime(pl.Date, "%Y%m%d")
    )

    # Split Market column "B,Q,N" → ["B","Q","N"] and explode
    df = df.with_columns(
        pl.col("Market").str.split(",")
    ).explode("Market")

    df = df.with_columns(pl.col("ShortVolume") / pl.col("TotalVolume")).alias("ShortPct")
    df = df.with_columns(pl.col("ShortExemptVolume") / pl.col("ShortVolume")).alias("ExemptPct")


    # TODO: read in command line args, --url "SUPABASE_URL" --key "SUPABASE_KEY"
    # This script should only be executed by github actions, so key and url will be stored in secrets, not seen
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="Enter the url for the supabase DB")
    parser.add_argument("key", help="Enter the key for the supabase DB")

    # TODO: connect to DB, upload data, create second table
    args = parser.parse_args()
    url = args.url
    key = args.key
    try:
        client = create_client(url, key)
        print("Connection successful")
    except Exception as e:
        print(e)
    
    # Insert data into db
    response = (
        client.table("raw_finra")
        .insert(df.to_dict(orient="dict"))
        .execute()
    )
    # Short Momentum = short % tdy - short % yday
    # SELECT AVG(ShortPct) FROM finra_metrics WHERE Date = YDAY GROUP BY Symbol
    # We also need to add functionality so that if today is a sunday or monday to use last friday's data (go back 1 or 2 dates)
    today = datetime.date.today()
    if today.weekday() == 0
        # today is a monday then we have to go back to last friday to et the last days data
        yday_date = datetime.date.today() - datetime.timedelta(days=3)
    elif today.weekday() == 6 
        # today is a sunday then we have to go back to friday to get the last days data
        yday_date = datetimte.date.today() - datetime.timedelta(days=2)
    else:
        # If we are at a date T - Sa, then the previous date will have data
        yday_date = datetimte.date.today() - datetime.timedelta(days=1)

    response = (
        client.table("finra_metrics")
        .select("Symbol, ShortPct.avg()")
        .eq("Date", yday_date)
    )
    # This res will give all symbols that have a previous short %, we need to parse through data frame and assign short momentum to all entries with same symbol
    print(response)