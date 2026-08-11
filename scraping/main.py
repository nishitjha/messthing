
from playwright.sync_api import sync_playwright
import os
from dotenv import load_dotenv
import psycopg2
import json

load_dotenv()

days = ["M", "T", "W", "Th", "F", "S", "Su"]

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
            date = [x.strip() for x in raw_text.strip()[:raw_text.find("Breakfast\n")].split("\n") if x.strip()][-1]

            results[getfull(tab)] = {
                "day": getfull(tab),
                "date": date,
                "breakfast": breakfast_menu,
                "lunch": lunch_menu,
                "dinner": dinner_menu,
                "id": [1, 2, 3] 
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