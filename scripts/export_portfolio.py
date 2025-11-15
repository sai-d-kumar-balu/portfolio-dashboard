import json
import math
from datetime import datetime
from pathlib import Path

import pandas as pd


COLUMN_MAP = {
    "Unnamed: 0": "no",
    "Unnamed: 1": "particulars",
    "Unnamed: 2": "purchase_price",
    "Unnamed: 3": "quantity",
    "Unnamed: 4": "investment",
    "Unnamed: 5": "portfolio_pct",
    "Unnamed: 6": "ticker",
    "Unnamed: 7": "cmp",
    "Unnamed: 8": "present_value",
    "Unnamed: 9": "gain_loss",
    "Unnamed: 10": "gain_loss_pct",
    "Unnamed: 11": "market_cap",
    "Unnamed: 12": "pe_ttm",
    "Unnamed: 13": "latest_earnings",
    "Core Fundamentals": "revenue_ttm",
    "Unnamed: 15": "ebitda_ttm",
    "Unnamed: 16": "ebitda_margin",
    "Unnamed: 17": "pat",
    "Unnamed: 18": "pat_margin",
    "Unnamed: 19": "cfo_recent",
    "Unnamed: 20": "cfo_five_year",
    "Unnamed: 21": "fcf_five_year",
    "Unnamed: 22": "debt_to_equity",
    "Unnamed: 23": "book_value",
    "Growth (3 years": "growth_revenue",
    "Unnamed: 25": "growth_ebitda",
    "Unnamed: 26": "growth_profit",
    "Unnamed: 27": "growth_market_cap",
    "Unnamed: 28": "price_to_sales",
    "Unnamed: 29": "cfo_to_ebitda",
    "Unnamed: 30": "cfo_to_pat",
    "Unnamed: 31": "price_to_book",
    "Unnamed: 32": "stage2_flag",
    "Unnamed: 33": "sale_price",
    "Unnamed: 34": "notes",
}


def to_number(value):
    if isinstance(value, str):
        value = value.strip()
        if value == "":
            return None
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return value


def normalize(value):
    if isinstance(value, str):
        value = value.strip()
        if value == "":
            return None
    if isinstance(value, float) and math.isnan(value):
        return None
    return value


def export():
    root = Path(__file__).resolve().parents[1]
    df = pd.read_excel(root / "data" / "portfolio.xlsx", sheet_name="Priyanshu")
    df = df.rename(columns=COLUMN_MAP)

    holdings = []
    current_sector = None

    for _, row in df.iterrows():
        raw_name = row.get("particulars")
        name = raw_name.strip() if isinstance(raw_name, str) else ""

        if name and "sector" in name.lower():
            current_sector = name.replace("Sector", "").strip()
            continue

        no_value = row.get("no", math.nan)
        if name == "" or pd.isna(no_value):
            continue

        try:
            record_id = int(float(no_value))
        except (TypeError, ValueError):
            continue

        record = {
            "id": record_id,
            "name": name,
            "sector": current_sector or "Uncategorized",
            "purchasePrice": to_number(row.get("purchase_price")),
            "quantity": to_number(row.get("quantity")),
            "investment": to_number(row.get("investment")),
            "portfolioWeight": to_number(row.get("portfolio_pct")),
            "ticker": normalize(row.get("ticker")),
            "cmp": to_number(row.get("cmp")),
            "presentValue": to_number(row.get("present_value")),
            "gainLoss": to_number(row.get("gain_loss")),
            "gainLossPct": to_number(row.get("gain_loss_pct")),
            "marketCap": to_number(row.get("market_cap")),
            "peRatio": to_number(row.get("pe_ttm")),
            "latestEarnings": to_number(row.get("latest_earnings")),
            "revenueTtm": to_number(row.get("revenue_ttm")),
            "ebitdaTtm": to_number(row.get("ebitda_ttm")),
            "ebitdaMargin": to_number(row.get("ebitda_margin")),
            "pat": to_number(row.get("pat")),
            "patMargin": to_number(row.get("pat_margin")),
            "cfoRecent": to_number(row.get("cfo_recent")),
            "cfoFiveYear": to_number(row.get("cfo_five_year")),
            "fcfFiveYear": to_number(row.get("fcf_five_year")),
            "debtToEquity": to_number(row.get("debt_to_equity")),
            "bookValue": to_number(row.get("book_value")),
            "growthRevenue": to_number(row.get("growth_revenue")),
            "growthEbitda": to_number(row.get("growth_ebitda")),
            "growthProfit": to_number(row.get("growth_profit")),
            "growthMarketCap": to_number(row.get("growth_market_cap")),
            "priceToSales": to_number(row.get("price_to_sales")),
            "cfoToEbitda": to_number(row.get("cfo_to_ebitda")),
            "cfoToPat": to_number(row.get("cfo_to_pat")),
            "priceToBook": to_number(row.get("price_to_book")),
            "stage2": normalize(row.get("stage2_flag")),
            "salePrice": to_number(row.get("sale_price")),
            "notes": normalize(row.get("notes")),
        }

        holdings.append(record)

    output = {
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "currency": "INR",
        "holdings": holdings,
    }

    data_dir = root / "src" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    with (data_dir / "portfolio.json").open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)

    print(f"Exported {len(holdings)} holdings to {data_dir / 'portfolio.json'}")


if __name__ == "__main__":
    export()

