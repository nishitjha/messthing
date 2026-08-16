from playwright.sync_api import sync_playwright
import os
from dotenv import load_dotenv
import psycopg2
import json
import uuid
from datetime import date, timedelta

load_dotenv()

days = ["M", "T", "W", "Th", "F", "S", "Su"]
weekday_index = {"M": 0, "T": 1, "W": 2, "Th": 3, "F": 4, "S": 5, "Su": 6}

def getfull(code):
    match code:
        case "M":
            return "Monday"
        case "T":
            return "Tuesday"
        case "W":
            return "Wednesday"
        case "Th":
            return "Thursday"
        case "F":
            return "Friday"
        case "S":
            return "Saturday"
        case "Su":
            return "Sunday"

def get_date_for_day(code):
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    target = monday + timedelta(days=weekday_index[code])
    day = target.day
    suffix = "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
    return f"{day}{suffix} {target.strftime('%B %Y')}"

def scrape():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("https://www.ssms-pilani.in/", wait_until="networkidle")

        for tab in days:
            page.get_by_text(tab, exact=True).first.click()
            page.wait_for_timeout(800)

            raw_text = page.locator("body").inner_text()
            breakfast_menu = [x.strip() for x in raw_text.strip()[raw_text.find("Breakfast\n"):raw_text.find("Lunch\n")].split("\n")[2:] if x.strip()]
            lunch_menu = [x.strip() for x in raw_text.strip()[raw_text.find("Lunch\n"):raw_text.find("Dinner\n")].split("\n")[2:] if x.strip()]
            dinner_menu = [x.strip() for x in raw_text.strip()[raw_text.find("Dinner\n"):raw_text.find("Developed")].split("\n")[2:-8] if x.strip()]

            results[getfull(tab)] = {
                "day": getfull(tab),
                "date": get_date_for_day(tab),
                "breakfast": breakfast_menu,
                "lunch": lunch_menu,
                "dinner": dinner_menu,
                "id": [str(uuid.uuid4()) for _ in range(3)],
            }

        browser.close()

    return results

def saveDB(results):
    conn = psycopg2.connect(os.getenv("NEON_DATABASE_URL"))
    cur = conn.cursor()

    for day_name, menu in results.items():
        cur.execute(
            """
            INSERT INTO menu (day, date, breakfast, lunch, dinner, id)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (day)
            DO UPDATE SET date = EXCLUDED.date,
                          breakfast = EXCLUDED.breakfast,
                          lunch = EXCLUDED.lunch,
                          dinner = EXCLUDED.dinner,
                          scraped_at = now()
            """,
            (
                day_name,
                menu["date"],
                json.dumps(menu["breakfast"]),
                json.dumps(menu["lunch"]),
                json.dumps(menu["dinner"]),
                menu["id"],
            ),
        )

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    print("Doing stuff...")
    data = scrape()
    saveDB(data)
    print("All done.")