import asyncio
from playwright.async_api import async_playwright
import hashlib
import csv
import os
from datetime import datetime

CSV_FILE = "naukri_jobs.csv"

async def scrape_job_page(page, job_url):
    await page.goto(job_url)
    await page.wait_for_selector("section.styles_job-desc-container__txpYf", timeout=60000)

    title_el = await page.query_selector("h1.styles_jd-header-title__rZwM1, div.styles_jd-header-title__rZwM1")
    title = await title_el.inner_text() if title_el else ""

    comp_el = await page.query_selector("div.styles_jd-header-comp-name__MvqAI > a")
    company = await comp_el.inner_text() if comp_el else ""

    info_labels = await page.query_selector_all("div.styles_details__Y424J")
    info_dict = {}
    for item in info_labels:
        label_el = await item.query_selector("label")
        span_el = await item.query_selector("span")
        if label_el and span_el:
            label = (await label_el.inner_text()).replace(":", "").strip()
            value = (await span_el.inner_text()).strip()
            info_dict[label] = value

    edu_dict = {}
    ug_el = await page.query_selector("div.styles_education__KXFkO div.styles_details__Y424J:nth-child(2) > span")
    pg_el = await page.query_selector("div.styles_education__KXFkO div.styles_details__Y424J:nth-child(3) > span")
    edu_dict['UG'] = await ug_el.inner_text() if ug_el else ""
    edu_dict['PG'] = await pg_el.inner_text() if pg_el else ""

    skill_els = await page.query_selector_all("div.styles_key-skill__GIPn_ a span")
    key_skills = [await sk.inner_text() for sk in skill_els]

    posted_el = await page.query_selector("div.styles_jhc__jd-stats__KrId0 span:has-text('Posted:') span")
    date_posted = await posted_el.inner_text() if posted_el else ""

    scraped_date = datetime.today().strftime("%Y-%m-%d")
    job_id = hashlib.sha256((title + company + date_posted).encode()).hexdigest()

    return {
        "job_id": job_id,
        "title": title,
        "company": company,
        "role": info_dict.get("Role", ""),
        "industry": info_dict.get("Industry Type", ""),
        "department": info_dict.get("Department", ""),
        "employment_type": info_dict.get("Employment Type", ""),
        "role_category": info_dict.get("Role Category", ""),
        "education": edu_dict,
        "key_skills": key_skills,
        "date_posted": date_posted,
        "scraped_date": scraped_date,
        "url": job_url
    }


async def scrape_naukri_jobs(pages=2, keyword="software-engineer"):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.97 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )

        # --- Prepare CSV file ---
        header = [
            "job_id", "title", "company", "role", "industry", "department", 
            "employment_type", "role_category", "education_UG", "education_PG", 
            "key_skills", "date_posted", "scraped_date", "url"
        ]
        
        file_exists = os.path.exists(CSV_FILE)
        with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(header)

        all_jobs = []

        # --- Loop through pages ---
        for page_num in range(209, 209+pages + 1):
            url = f"https://www.naukri.com/{keyword}-jobs-{page_num}"
            print("Opening:", url)
            await page.goto(url)

            try:
                await page.wait_for_selector("div.cust-job-tuple", state="attached", timeout=60000)
                print(f"Page {page_num} jobs loaded successfully!")
            except:
                print(f"Timeout: No jobs found on page {page_num}")
                continue

            job_cards = await page.query_selector_all("div.cust-job-tuple")
            job_links = []
            for job in job_cards:
                job_link_el = await job.query_selector("a.title")
                if job_link_el:
                    link = await job_link_el.get_attribute("href")
                    if link:
                        job_links.append(link)

            # --- Process each job ---
            for job_link in job_links:
                try:
                    job_data = await scrape_job_page(page, job_link)
                    all_jobs.append(job_data)

                    # Append to CSV immediately
                    with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
                        writer = csv.writer(f)
                        writer.writerow([
                            job_data["job_id"],
                            job_data["title"],
                            job_data["company"],
                            job_data["role"],
                            job_data["industry"],
                            job_data["department"],
                            job_data["employment_type"],
                            job_data["role_category"],
                            job_data["education"].get("UG", ""),
                            job_data["education"].get("PG", ""),
                            ", ".join(job_data["key_skills"]),
                            job_data["date_posted"],
                            job_data["scraped_date"],
                            job_data["url"]
                        ])

                    print(job_data['title'], "|", job_data['company'], "| Posted:", job_data['date_posted'])
                except Exception as e:
                    print("Error scraping job page:", e)

            # --- Delay between pages ---
            await asyncio.sleep(2)

        await browser.close()
        print(f"Total jobs scraped this session: {len(all_jobs)}")
        print(f"Progress saved incrementally to {CSV_FILE}")
        return all_jobs


if __name__ == "__main__":
    asyncio.run(scrape_naukri_jobs(pages=5111-209, keyword="software-engineer"))
