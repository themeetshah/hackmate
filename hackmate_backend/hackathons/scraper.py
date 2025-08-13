import os
import sys
from datetime import datetime
import re
import time

# --- Django Setup ---
# This allows the script to be run as a standalone file.
# Ensure 'hackmate_backend.settings' matches your project's settings file.
project_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hackmate_backend.settings')
import django
django.setup()
# --- End Django Setup ---

# Import models and libraries AFTER Django setup
from hackathons.models import Hackathon
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def parse_date_range(date_str, year):
    """
    Parses date strings from MLH, like "Aug 23rd - 25th, 2025".
    Handles single-day events and dates spanning different months.
    """
    try:
        # Remove ordinal suffixes (st, nd, rd, th) for easier parsing
        date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
        parts = date_str.replace(',', '').split()

        start_month_str = parts[0]
        start_day_str = parts[1]

        # Handle single-day events, e.g., "Aug 23 2025"
        if len(parts) == 3 and parts[2].isdigit():
            single_date = datetime.strptime(f"{start_month_str} {start_day_str} {parts[2]}", "%b %d %Y")
            return single_date, single_date

        # Handle date ranges, e.g., "Aug 23 - 25 2025"
        end_day_str = parts[3]
        end_month_str = start_month_str
        if len(parts) == 6:  # Handle ranges spanning months, e.g., "Aug 23 - Sep 1 2025"
            end_month_str = parts[3]
            end_day_str = parts[4]

        start_date = datetime.strptime(f"{start_month_str} {start_day_str} {year}", "%b %d %Y")
        end_date = datetime.strptime(f"{end_month_str} {end_day_str} {year}", "%b %d %Y")

        # Handle year change for events like "Dec 30 - Jan 5"
        if end_date < start_date:
            end_date = end_date.replace(year=year + 1)

        return start_date, end_date
    except (ValueError, IndexError) as e:
        print(f"⚠️  Could not parse date string: '{date_str}'. Error: {e}")
        return None, None


def scrape_mlh_with_selenium():
    """
    Scrapes the MLH events page using Selenium to bypass bot detection and handle JavaScript rendering.
    """
    print("🚀 Starting scrape of MLH with Selenium...")
    url = "https://mlh.io/seasons/2025/events"

    # Configure Chrome options for headless Browse
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

    # Assumes chromedriver is in your system's PATH
    service = Service()
    driver = webdriver.Chrome(service=service, options=chrome_options)

    html = None
    try:
        print(f"Fetching {url} with a headless browser...")
        driver.get(url)

        # Robustly wait for the page to finish rendering
        print("Waiting for page content to become visible...")
        WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".event-wrapper"))
        )
        # Add a short, fixed delay as an extra insurance policy for all content to settle
        time.sleep(3)
        print("✅ Page rendered successfully.")

        # Get the page source after JavaScript has loaded
        html = driver.page_source

    except Exception as e:
        print(f"❌ Selenium failed to fetch the page. Error: {e}")
        return []
    finally:
        # Always close the browser to free up resources
        driver.quit()

    if not html:
        print("❌ Failed to get HTML content from the browser.")
        return []

    soup = BeautifulSoup(html, 'html.parser')
    hackathons = []

    event_cards = soup.select('.event-wrapper')
    print(f"Found {len(event_cards)} hackathon cards.")

    for card in event_cards:
        try:
            title_element = card.select_one('h3.event-name')
            title = title_element.text.strip() if title_element else ''

            url_element = card.select_one('a.event-link')
            hackathon_url = url_element['href'] if url_element else ''

            image_element = card.select_one('.image-wrap img')
            image_url = image_element['src'] if image_element else ''

            date_element = card.select_one('p.event-date')
            date_text = date_element.text.strip() if date_element else ''

            location_element = card.select_one('span[itemprop="location"]')
            location = location_element.text.strip() if location_element else 'Unknown'

            is_virtual = 'online' in location.lower() or 'virtual' in location.lower()

            # The year is usually in the date text for MLH, but we pass the current year as a fallback
            current_year = datetime.now().year
            start_date, end_date = parse_date_range(date_text, current_year)

            if start_date and end_date and title:
                hackathons.append({
                    'title': title,
                    'url': hackathon_url,
                    'image': image_url,
                    'start_date': start_date,
                    'end_date': end_date,
                    'location': location,
                    'is_virtual': is_virtual,
                    'platform': 'mlh',
                    'description': '',  # Description is not available on the list page
                    'registration_deadline': start_date,  # Use start_date as a placeholder
                })
        except Exception as e:
            print(f"⚠️  Could not parse a card. Error: {e}. Skipping.")

    print(f"✅ Successfully parsed {len(hackathons)} hackathons.")
    return hackathons


def save_hackathons(hackathons_data):
    """
    Saves scraped hackathon data into the Django database, avoiding duplicates.
    """
    if not hackathons_data:
        print("No hackathon data to save.")
        return 0, 0

    print("💾 Saving data to the database...")
    created_count = 0
    updated_count = 0

    for h_data in hackathons_data:
        if not h_data.get('start_date'):
            print(f"Skipping '{h_data['title']}' due to missing date.")
            continue

        defaults = {
            'description': h_data.get('description', ''),
            'image': h_data.get('image', ''),
            'start_date': h_data.get('start_date'),
            'end_date': h_data.get('end_date'),
            'registration_deadline': h_data.get('registration_deadline', h_data.get('start_date')),
            'location': h_data.get('location', 'Unknown'),
            'is_virtual': h_data.get('is_virtual', False),
            'platform': h_data.get('platform', 'other'),
        }

        # Use URL as a unique identifier if available, otherwise fall back to title.
        identifier = {'url': h_data['url']} if h_data.get('url') else {'title': h_data['title']}

        try:
            obj, created = Hackathon.objects.get_or_create(**identifier, defaults=defaults)

            if created:
                created_count += 1
                print(f"   -> CREATED: {obj.title}")
            else:
                updated_count += 1
        except Exception as e:
            print(f"❌ Error saving '{h_data.get('title')}'. Error: {e}")

    return created_count, updated_count


if __name__ == '__main__':
    print("--- Starting MLH Hackathon Scraper ---")
    scraped_data = scrape_mlh_with_selenium()
    created, updated = save_hackathons(scraped_data)
    print("\n--- Scraping Complete ---")
    print(f"New Hackathons Added: {created}")
    print(f"Existing Hackathons Found: {updated}")
    print("--------------------------")