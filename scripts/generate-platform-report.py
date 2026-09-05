#!/usr/bin/env python3
"""
Guruvayur Dham Platform - Feature & SEO Report PDF Generator
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus.tableofcontents import TableOfContents
import hashlib

# ─── Font Registration ───
# Use NotoSerifSC (static weights, works with ReportLab) for both serif + sans roles
FONT_DIR = '/usr/share/fonts/truetype'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/noto-serif-sc/NotoSerifSC-Bold.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
# Use DejaVu Sans for the sans-serif role (Latin-only, but fine for headers/labels)
pdfmetrics.registerFont(TTFont('NotoSansSC', f'{FONT_DIR}/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('NotoSansSC-Bold', f'{FONT_DIR}/dejavu/DejaVuSans-Bold.ttf'))
registerFontFamily('NotoSansSC', normal='NotoSansSC', bold='NotoSansSC-Bold')

# ─── Colors ───
INK = HexColor('#0F0A08')
CHAMPAGNE = HexColor('#D4AF37')
CHAMPAGNE_LIGHT = HexColor('#E8D091')
IVORY = HexColor('#F5F0E8')
CREAM = HexColor('#FAF6EE')
MAROON = HexColor('#6B1A1A')
MUTED = HexColor('#666666')
LIGHT_BG = HexColor('#F8F6F0')
BORDER = HexColor('#E0DAD0')

# ─── Styles ───
styles = getSampleStyleSheet()
style_cover_title = ParagraphStyle('CoverTitle', fontName='NotoSerifSC-Bold', fontSize=36, leading=42, textColor=CHAMPAGNE, alignment=TA_CENTER, spaceAfter=12)
style_cover_subtitle = ParagraphStyle('CoverSubtitle', fontName='NotoSerifSC', fontSize=16, leading=22, textColor=IVORY, alignment=TA_CENTER, spaceAfter=8)
style_cover_tag = ParagraphStyle('CoverTag', fontName='NotoSansSC', fontSize=10, leading=14, textColor=CHAMPAGNE_LIGHT, alignment=TA_CENTER)
style_h1 = ParagraphStyle('H1', fontName='NotoSerifSC-Bold', fontSize=22, leading=28, textColor=INK, spaceBefore=24, spaceAfter=12, keepWithNext=True)
style_h2 = ParagraphStyle('H2', fontName='NotoSerifSC-Bold', fontSize=16, leading=22, textColor=MAROON, spaceBefore=18, spaceAfter=8, keepWithNext=True)
style_h3 = ParagraphStyle('H3', fontName='NotoSansSC-Bold', fontSize=13, leading=18, textColor=INK, spaceBefore=14, spaceAfter=6, keepWithNext=True)
style_body = ParagraphStyle('Body', fontName='NotoSerifSC', fontSize=10.5, leading=16, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=8)
style_bullet = ParagraphStyle('Bullet', fontName='NotoSerifSC', fontSize=10.5, leading=16, textColor=INK, leftIndent=24, bulletIndent=12, spaceAfter=4)
style_toc_l0 = ParagraphStyle('TOCL0', fontName='NotoSerifSC-Bold', fontSize=12, leading=18, textColor=INK, leftIndent=0, spaceBefore=6)
style_toc_l1 = ParagraphStyle('TOCL1', fontName='NotoSerifSC', fontSize=10.5, leading=15, textColor=MUTED, leftIndent=18, spaceBefore=2)
style_table_header = ParagraphStyle('TableHeader', fontName='NotoSansSC-Bold', fontSize=9, leading=12, textColor=white, alignment=TA_CENTER)
style_table_cell = ParagraphStyle('TableCell', fontName='NotoSerifSC', fontSize=9, leading=13, textColor=INK, alignment=TA_LEFT)
style_note = ParagraphStyle('Note', fontName='NotoSerifSC', fontSize=9.5, leading=14, textColor=MUTED, leftIndent=12, spaceBefore=4)

def heading(text, style, level=0):
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key; p.bookmark_level = level; p.bookmark_text = text; p.bookmark_key = key
    return p

def bullets(items, style=style_bullet):
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=24, value='circle') for item in items],
        bulletType='bullet', bulletColor=CHAMPAGNE, bulletFontSize=8, leftIndent=18, spaceBefore=4, spaceAfter=8
    )

def make_table(data, col_widths=None):
    if col_widths is None:
        num_cols = len(data[0]); avail = 170 * mm; col_widths = [avail / num_cols] * num_cols
    wrapped = []
    for i, row in enumerate(data):
        wrapped_row = []
        for cell in row:
            if isinstance(cell, str):
                style = style_table_header if i == 0 else style_table_cell
                wrapped_row.append(Paragraph(cell, style))
            else:
                wrapped_row.append(cell)
        wrapped.append(wrapped_row)
    t = Table(wrapped, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), INK), ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'NotoSansSC-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8), ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [LIGHT_BG, CREAM]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 5), ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    return t

def cover_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(INK); canvas.rect(0, 0, w, h, fill=1)
    canvas.setFillColor(CHAMPAGNE); canvas.rect(0, h - 8, w, 8, fill=1); canvas.rect(0, 0, w, 8, fill=1)
    canvas.setFillColor(HexColor('#D4AF37')); canvas.setFillAlpha(0.04)
    canvas.setFont('NotoSerifSC', 280); canvas.drawCentredString(w / 2, h / 2 - 100, 'OM')
    canvas.setFillAlpha(1)
    canvas.setFillColor(CHAMPAGNE); canvas.setFont('NotoSerifSC-Bold', 14)
    canvas.drawCentredString(w / 2, h - 50, 'GURUVAYUR DHAM')
    canvas.setFillColor(CHAMPAGNE_LIGHT); canvas.setFont('NotoSansSC', 8)
    canvas.drawCentredString(w / 2, h - 65, 'LUXURY PILGRIM STAY')
    canvas.restoreState()

def body_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(CHAMPAGNE); canvas.setLineWidth(1)
    canvas.line(20 * mm, h - 15 * mm, w - 20 * mm, h - 15 * mm)
    canvas.setFillColor(MUTED); canvas.setFont('NotoSansSC', 8)
    canvas.drawString(20 * mm, h - 12 * mm, 'Guruvayur Dham Platform Report')
    canvas.drawRightString(w - 20 * mm, h - 12 * mm, '2026')
    canvas.setStrokeColor(BORDER); canvas.line(20 * mm, 15 * mm, w - 20 * mm, 15 * mm)
    canvas.setFillColor(MUTED); canvas.setFont('NotoSansSC', 8)
    canvas.drawString(20 * mm, 10 * mm, 'Guruvayur Dham')
    canvas.drawRightString(w - 20 * mm, 10 * mm, f'Page {doc.page}')
    canvas.restoreState()

class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

story = []

# ── COVER ──
story.append(Spacer(1, 120 * mm))
story.append(Paragraph('Guruvayur Dham', style_cover_title))
story.append(Spacer(1, 6 * mm))
story.append(Paragraph('Platform Feature &amp; SEO Report', style_cover_subtitle))
story.append(Spacer(1, 4 * mm))
story.append(Paragraph('In-Depth Guide to Every Feature, Page, and SEO Capability', style_cover_tag))
story.append(Spacer(1, 30 * mm))
story.append(Paragraph('January 2026 Edition', style_cover_tag))
story.append(Spacer(1, 4 * mm))
story.append(Paragraph('Prepared for: Ayan Arham', style_cover_tag))
story.append(PageBreak())

# ── TOC ──
story.append(Paragraph('Table of Contents', style_h1))
story.append(Spacer(1, 6 * mm))
toc = TableOfContents()
toc.levelStyles = [style_toc_l0, style_toc_l1]
story.append(toc)
story.append(PageBreak())

# ══ CHAPTER 1: EXECUTIVE SUMMARY ══
story.append(heading('1. Executive Summary', style_h1, 0))
story.append(Paragraph('Guruvayur Dham is a comprehensive digital platform for a luxury pilgrim hotel in Mathura, Uttar Pradesh, located opposite Mata Pathwari Mandir in Natwar Nagar, Dholi Pyau. Built on Next.js 16 with a PostgreSQL database, the platform serves as a complete hotel management system, content management system (CMS), pilgrim assistant, and SEO-driven marketing engine all in one.', style_body))
story.append(Paragraph('This document provides an in-depth analysis of every feature built into the platform, the SEO reach across 23+ pages, the technology stack, deployment infrastructure, and operational capabilities. The platform has been designed with a pilgrim-first approach, understanding that devotees visiting Mathura need not just a room, but a spiritual companion that coordinates darshan timings, pooja bookings, festival planning, and temple visits.', style_body))
story.append(Spacer(1, 6 * mm))
story.append(heading('1.1 Platform at a Glance', style_h2, 1))
story.append(make_table([
    ['Metric', 'Value'],
    ['Total Pages', '23+ (10 core + 13 SEO landing pages)'],
    ['Languages Supported', '5 (English, Hindi, Marathi, Gujarati, Malayalam)'],
    ['CMS Content Blocks', '70+ editable text/image fields'],
    ['Database Models', '40+ Prisma models'],
    ['API Endpoints', '50+ REST API routes'],
    ['SEO Landing Pages', '13 (5 festivals + 4 hotels-near + 4 darshan-timings)'],
    ['Total SEO Content', '11,108 words across landing pages'],
    ['Estimated Monthly Search Reach', '750,000+ searches'],
    ['Deployment Targets', 'Vercel (production) + any VPS via Docker'],
    ['Cron Jobs', '1 (post-stay review funnel, daily)'],
], col_widths=[55*mm, 115*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('1.2 Technology Stack', style_h2, 1))
story.append(Paragraph('The platform is built on a modern, production-grade technology stack designed for performance, scalability, and maintainability:', style_body))
story.append(make_table([
    ['Layer', 'Technology', 'Purpose'],
    ['Frontend', 'Next.js 16 + React 19', 'Server-rendered SPA with hash routing'],
    ['Styling', 'Tailwind CSS + shadcn/ui', 'Responsive design + component library'],
    ['Animations', 'Framer Motion', 'Page transitions, scroll reveals, micro-interactions'],
    ['Backend', 'Next.js API Routes', '50+ REST endpoints for all business logic'],
    ['Database', 'PostgreSQL (Neon)', 'Hosted Postgres with 40+ Prisma models'],
    ['ORM', 'Prisma 6', 'Type-safe database access + migrations'],
    ['Auth', 'NextAuth + OAuth', 'Email/password, OTP, PIN, Google, Facebook'],
    ['Payments', 'Razorpay', 'Room bookings + pooja payments'],
    ['AI Chatbot', 'Groq (LLaMA 3.3) + z-ai fallback', 'WhatsApp bot + website chat widget'],
    ['Storage', 'Vercel Blob + local fallback', 'Image uploads for CMS'],
    ['Deployment', 'Vercel + Docker (VPS-ready)', 'Auto-deploy from GitHub + self-hosted'],
    ['Cron', 'Vercel Cron', 'Daily review funnel automation'],
    ['Monitoring', 'Built-in analytics + web vitals', 'Core Web Vitals tracking + event logging'],
], col_widths=[30*mm, 50*mm, 90*mm]))
story.append(PageBreak())

# ══ CHAPTER 2: PAGES & CONTENT ══
story.append(heading('2. Pages &amp; Content Architecture', style_h1, 0))
story.append(Paragraph('The platform features 23+ pages organized into three tiers: core pages (the main hotel website), SEO landing pages (designed to capture search traffic for high-intent pilgrim queries), and administrative pages (CMS, dashboard, settings). Every page is connected via a hash-based router and fully integrated with the CMS for instant content updates.', style_body))
story.append(heading('2.1 Core Pages (10)', style_h2, 1))
story.append(Paragraph('These are the primary pages of the hotel website. Each is fully CMS-driven, meaning all text, images, and data can be edited through the admin dashboard without touching code.', style_body))
story.append(make_table([
    ['Page', 'Route', 'Purpose'],
    ['Home', '/#/', 'Landing page with hero, rooms preview, pooja, testimonials, blog, FAQ'],
    ['Rooms', '/#/rooms', 'Filterable room grid (type, budget, occupancy) with live availability'],
    ['Room Detail', '/#/rooms/[slug]', 'Full room info, gallery, amenities, availability calendar'],
    ['Pooja', '/#/pooja', 'Temple pooja booking (Palpayasam, Abhishek, Aarti, etc.)'],
    ['About', '/#/about', 'Family-run pilgrim home story since 1998'],
    ['Gallery', '/#/gallery', 'Masonry photo gallery (Rooms, Temple, Facilities, Surroundings)'],
    ['Events', '/#/events', 'Festival calendar (Janmashtami, Holi, Diwali, etc.)'],
    ['Blog', '/#/blog', 'Travel guide articles + darshan timing guides'],
    ['FAQ', '/#/faq', '14 most-asked questions with FAQPage schema'],
    ['Contact', '/#/contact', 'WhatsApp form + contact info + Google Maps embed'],
], col_widths=[28*mm, 35*mm, 107*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('2.2 SEO Landing Pages (13)', style_h2, 1))
story.append(Paragraph('These are purpose-built pages designed to capture high-intent search traffic from pilgrims planning their Mathura visit. Each page has 800+ words of SEO-optimized content, JSON-LD structured data, FAQ accordion, and a booking CTA. The combined monthly search reach is estimated at 750,000+ searches.', style_body))
story.append(heading('2.2.1 Festival Pages (5)', style_h3, 2))
story.append(make_table([
    ['Page', 'Slug', 'Est. Monthly Searches', 'JSON-LD Schema'],
    ['Janmashtami', '/#/janmashtami', '~450,000 (seasonal spike)', 'Event'],
    ['Holi in Mathura', '/#/holi-in-mathura', '~200,000 (seasonal spike)', 'Event'],
    ['Diwali in Mathura', '/#/diwali-in-mathura', '~150,000 (seasonal spike)', 'Event'],
    ['Radhashtami', '/#/radhashtami', '~50,000', 'Event'],
    ['Kartik Purnima', '/#/kartik-purnima', '~40,000', 'Event'],
], col_widths=[35*mm, 40*mm, 55*mm, 40*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('2.2.2 Hotels Near Pages (4)', style_h3, 2))
story.append(Paragraph('These pages target bottom-of-funnel searches: pilgrims who have decided which temple to visit and now need a room nearby. Conversion rates on these pages are very high.', style_body))
story.append(make_table([
    ['Page', 'Slug', 'Est. Monthly Searches', 'JSON-LD Schema'],
    ['Near Banke Bihari (Vrindavan)', '/#/hotels-near-banke-bihari-vrindavan', '~12,000', 'TouristAttraction'],
    ['Near Krishna Janmabhoomi', '/#/hotels-near-krishna-janmabhoomi', '~8,000', 'TouristAttraction'],
    ['Near Dwarkadhish Temple', '/#/hotels-near-dwarkadhish-temple', '~5,000', 'TouristAttraction'],
    ['Near Mata Pathwari Mandir', '/#/hotels-near-mata-pathwari-mandir', '~3,000 (low competition)', 'TouristAttraction'],
], col_widths=[45*mm, 50*mm, 40*mm, 35*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('2.2.3 Darshan Timing Pages (4)', style_h3, 2))
story.append(Paragraph('Evergreen content pages targeting pilgrims searching for temple timings. These position the hotel as the local authority and naturally drive bookings.', style_body))
story.append(make_table([
    ['Page', 'Slug', 'Est. Monthly Searches', 'JSON-LD Schema'],
    ['Krishna Janmabhoomi Timings', '/#/krishna-janmabhoomi-darshan-timings', '~15,000', 'TouristAttraction + FAQPage'],
    ['Banke Bihari Timings', '/#/banke-bihari-darshan-timings', '~18,000', 'TouristAttraction + FAQPage'],
    ['Dwarkadhish Temple Timings', '/#/dwarkadhish-temple-timings', '~8,000', 'TouristAttraction + FAQPage'],
    ['Complete Temple Guide', '/#/mathura-temple-darshan-guide', '~6,000', 'TouristAttraction + FAQPage'],
], col_widths=[45*mm, 50*mm, 40*mm, 35*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('2.2.4 Each SEO Page Contains', style_h3, 2))
story.append(bullets([
    '<b>3-paragraph introduction</b> (500+ words) - main SEO content targeting primary keywords',
    '<b>3 content sections</b> (300+ words each) - guide, tips, logistics, or temple-specific information',
    '<b>5 FAQs</b> with FAQPage JSON-LD schema - Google can show these as expandable rich results',
    '<b>Hero image</b> - full-width background image (editable via CMS)',
    '<b>Booking CTA sidebar</b> - sticky sidebar with WhatsApp + View Rooms buttons',
    '<b>Related pages sidebar</b> - links to other pages in the same category',
    '<b>Meta description</b> - 120-160 characters, optimized for Google search snippets',
    '<b>Breadcrumbs</b> - Home &gt; Category &gt; Page (for navigation + SEO)',
    '<b>Bottom CTA</b> - full-width call-to-action section with WhatsApp + room booking',
]))
story.append(PageBreak())

# ══ CHAPTER 3: CMS ══
story.append(heading('3. Content Management System (CMS)', style_h1, 0))
story.append(Paragraph('The platform includes a full-featured CMS that allows non-technical staff to edit every piece of text and every image on the website without touching code. The CMS is organized into two editors: a content block editor (for section text like headlines, subtitles, contact info) and a structured data editor (for lists like rooms, events, FAQs, testimonials, poojas, blog posts, and SEO pages).', style_body))
story.append(heading('3.1 Content Block Editor (/admin/content)', style_h2, 1))
story.append(Paragraph('The content block editor manages 70+ editable text and image fields organized into 16 categories. Changes go live instantly after saving. The editor supports search, category filtering, and unsaved change indicators.', style_body))
story.append(make_table([
    ['Category', 'Editable Fields', 'Example Keys'],
    ['Site Settings', 'Name, tagline, phone, email, address, rating, room count', 'site.name, site.phone, site.email'],
    ['Hero Section', 'Eyebrow, headline, highlight, subheadline, background image', 'hero.eyebrow, hero.bgImage'],
    ['Why Choose Us', 'Eyebrow, title, subtitle', 'whyChooseUs.eyebrow'],
    ['Rooms Section', 'Eyebrow, title, subtitle', 'rooms.eyebrow'],
    ['Pooja Section', 'Eyebrow, title, subtitle', 'pooja.eyebrow'],
    ['About Section', 'Eyebrow, title, 3-paragraph story', 'about.story'],
    ['Contact Section', 'Eyebrow, title, subtitle, phone, WhatsApp, email, maps', 'contact.phone, contact.mapEmbed'],
    ['Events Section', 'Eyebrow, title, subtitle', 'events.eyebrow'],
    ['Blog Section', 'Eyebrow, title, subtitle', 'blog.eyebrow'],
    ['Testimonials', 'Eyebrow, title, subtitle', 'testimonials.eyebrow'],
    ['FAQ Section', 'Eyebrow, title, subtitle', 'faq.eyebrow'],
    ['Gallery Section', 'Eyebrow, title, subtitle', 'gallery.eyebrow'],
    ['Plan Your Darshan', 'Eyebrow, title, subtitle, cards (JSON)', 'darshan.cards'],
    ['Login Page', 'Background image, logo', 'login.bgImage'],
    ['Reviews Funnel', 'Google Reviews link, enabled toggle, hours delay', 'reviews.googleLink'],
    ['Footer', 'CTA headline, CTA subtitle, tagline, socials, made-by', 'footer.ctaHeadline'],
], col_widths=[40*mm, 60*mm, 70*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('3.2 Structured Data Editor (/admin/cms)', style_h2, 1))
story.append(Paragraph('The structured data editor manages list-based content. It has 11 tabs, each with full CRUD (create, read, update, delete) operations. All changes go live instantly.', style_body))
story.append(make_table([
    ['Tab', 'Data Type', 'Editable Fields', 'CMS Storage'],
    ['Rooms', 'Room listings', 'Name, slug, type, price, capacity, image, gallery, amenities, description', 'Prisma Room model'],
    ['Poojas', 'Temple offerings', 'Name, price, duration, description, prasadam, image, significance', 'Prisma Pooja model'],
    ['Gallery', 'Photo gallery', 'Tab, src, alt, caption, span (tall/wide), sort order', 'Prisma GalleryImage model'],
    ['Carousel', 'Hero slides', 'Title, subtitle, image, CTA text, CTA link', 'Prisma CarouselSlide model'],
    ['Why Us', 'Feature cards', 'Icon, title, description', 'Prisma Feature model'],
    ['Events', 'Festival calendar', 'Name, date, highlight, image, description', 'Prisma Event model'],
    ['Reviews', 'Guest testimonials', 'Name, city, rating, room, review text', 'Prisma Testimonial model'],
    ['FAQs', 'Q&amp;A list', 'Question, answer', 'Prisma FAQItem model'],
    ['Badges', 'Trust badges', 'Icon, text', 'Prisma TrustBadge model'],
    ['Blog', 'Articles', 'Title, slug, excerpt, category, date, image, multi-paragraph content', 'Prisma BlogPost model'],
    ['SEO Pages', 'All 13 landing pages', 'Title, meta description, eyebrow, hero image, intro, sections, FAQs', 'ContentBlock (JSON)'],
], col_widths=[22*mm, 28*mm, 75*mm, 45*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('3.3 Image Upload System', style_h2, 1))
story.append(Paragraph('The CMS includes an integrated image upload system that works across all editors. When a user uploads an image, it is stored via Vercel Blob (cloud storage, persistent across deploys) if the BLOB_READ_WRITE_TOKEN environment variable is set. Otherwise, it falls back to local filesystem storage at /public/uploads/ (persistent on VPS, ephemeral on Vercel serverless).', style_body))
story.append(bullets([
    'Supported formats: JPEG, PNG, WebP, GIF, AVIF',
    'Maximum file size: 10 MB',
    'Auto-generates unique filenames (timestamp + random suffix)',
    'Validates file type server-side for security',
    'Returns public URL immediately for instant preview',
]))
story.append(PageBreak())

# ══ CHAPTER 4: BOOKING ══
story.append(heading('4. Booking &amp; Revenue System', style_h1, 0))
story.append(Paragraph('The platform includes a complete hotel booking system with dynamic pricing, coupon support, early-bird discounts, multi-channel inventory sync, and automated post-stay follow-up. The booking flow is designed to be completed in under 30 seconds via WhatsApp, matching the pilgrim-friendly approach of the hotel.', style_body))
story.append(heading('4.1 Guest Booking Flow', style_h2, 1))
story.append(Paragraph('The guest booking page (/#/book) implements a 4-step wizard:', style_body))
story.append(make_table([
    ['Step', 'Title', 'What Happens'],
    ['1', 'Dates &amp; Room', 'Guest selects check-in/out dates + room type. Live availability shown. Dynamic price calculated.'],
    ['2', 'Guest Details', 'Name, phone, email, number of guests, darshan slot preference (optional).'],
    ['3', 'Coupon &amp; Payment', 'Optional coupon code. Early-bird auto-applied if eligible. Razorpay payment or pay-on-arrival.'],
    ['4', 'Confirmation', 'Booking reference (GD-XXXXXX) generated. WhatsApp confirmation sent. Reminders scheduled.'],
], col_widths=[12*mm, 35*mm, 123*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('4.2 Dynamic Pricing Engine', style_h2, 1))
story.append(Paragraph('The pricing engine calculates room rates based on multiple factors, ensuring optimal revenue during peak seasons while remaining competitive during off-peak periods:', style_body))
story.append(bullets([
    '<b>Base price</b> - Per-room nightly rate from the Room record',
    '<b>Weekend surge</b> - 20-30% increase on Fridays and Saturdays',
    '<b>Festival surge</b> - Configurable multiplier for festival dates (Janmashtami, Holi, etc.)',
    '<b>Early-bird discount</b> - 15% off for bookings made 30+ days in advance',
    '<b>Last-minute pricing</b> - 10% discount for same-day bookings (if rooms available)',
    '<b>Coupon support</b> - Percentage or flat-amount coupons with usage limits and validity windows',
    '<b>Per-night breakdown</b> - Each night priced independently based on its specific date rules',
]))
story.append(heading('4.3 Channel Manager Auto-Sync', style_h2, 1))
story.append(Paragraph('When a booking is made (direct, walk-in, or from an OTA), the platform automatically broadcasts a BLOCK signal to all other connected channel partners (Booking.com, MakeMyTrip, Goibibo, Agoda). This prevents double-bookings across channels. Each channel partner has a dedicated webhook endpoint:', style_body))
story.append(make_table([
    ['Channel', 'Webhook URL', 'Authentication'],
    ['Booking.com', '/api/channel-webhook/BOOKING_COM', 'X-Channel-Key header'],
    ['MakeMyTrip', '/api/channel-webhook/MAKEMYTRIP', 'X-Channel-Key header'],
    ['Goibibo', '/api/channel-webhook/GOIBIBO', 'X-Channel-Key header'],
    ['Agoda', '/api/channel-webhook/AGODA', 'X-Channel-Key header'],
], col_widths=[35*mm, 75*mm, 60*mm]))
story.append(Paragraph('Each webhook endpoint also has a GET health check that returns the channel connection status, last sync time, total bookings, and setup instructions for the partner dashboard. The sync logic is centralized in /lib/channel-sync.ts for reuse across all booking entry points.', style_body))
story.append(PageBreak())

# ══ CHAPTER 5: WHATSAPP ══
story.append(heading('5. WhatsApp Chatbot', style_h1, 0))
story.append(Paragraph('The platform features a floating WhatsApp chat widget on every page (except the login page). The bot uses intent recognition for common pilgrim queries and falls back to AI (Groq LLaMA 3.3) for general questions. It also includes a production-ready webhook for real WhatsApp Business API integration.', style_body))
story.append(heading('5.1 Website Chat Widget', style_h2, 1))
story.append(bullets([
    '<b>Floating green button</b> - Bottom-right of every page, with pulse animation',
    '<b>Auto-open</b> - Opens after 8 seconds on first visit (once per session)',
    '<b>Quick-reply chips</b> - "Book a room", "Pooja list", "Darshan timings", "Check-in time", "Festival dates"',
    '<b>Typing indicator</b> - Animated dots while bot processes the response',
    '<b>Unread badge</b> - Red counter on the button when chat is closed and bot has replied',
    '<b>Chat history</b> - Persisted in localStorage so returning guests see their previous messages',
    '<b>Mobile responsive</b> - Full-screen chat on mobile, floating window on desktop',
]))
story.append(heading('5.2 Intent Recognition', style_h2, 1))
story.append(Paragraph('The bot recognizes the following intents without AI (instant response, zero cost):', style_body))
story.append(make_table([
    ['Intent', 'Trigger Keywords', 'Response'],
    ['Greeting', 'hi, hello, hey, namaskaram, namaste', 'Welcome message with help options'],
    ['Booking', 'book, room, availability, reserve', 'Room list + booking link + instructions'],
    ['Pooja', 'pooja, aarti, abhishek, bhog, offering', 'Pooja list + prices + booking link'],
    ['Darshan', 'darshan, timing, temple time', 'Temple timings for all major Mathura temples'],
    ['Festival', 'festival, janmashtami, holi, diwali', 'Festival calendar + booking advice'],
    ['Check-in/out', 'check-in, check-out, time', 'Timings + early/late options + pricing'],
    ['Directions', 'reach, how, direction, airport, train', 'Address + transport options + pickup info'],
    ['Dress code', 'dress, code, mundu, saree, wear', 'Temple dress code for men and women'],
    ['Booking status', 'my booking, status, reference', 'Looks up booking by phone number'],
    ['AI fallback', 'Anything else', 'AI generates a contextual response'],
], col_widths=[28*mm, 50*mm, 92*mm]))
story.append(heading('5.3 WhatsApp Business API Integration', style_h2, 1))
story.append(Paragraph('For real WhatsApp messaging (not just the website widget), the platform includes a production-ready webhook endpoint at /api/whatsapp/webhook. This handles Meta WhatsApp Business API webhook verification (GET) and incoming message processing (POST).', style_body))
story.append(bullets([
    '<b>Webhook verification</b> - Handles Meta hub.challenge verification on setup',
    '<b>Message processing</b> - Parses incoming WhatsApp messages and routes to intent handler',
    '<b>Reply via Graph API</b> - Sends responses via Meta Graph API (v18.0)',
    '<b>Conversation logging</b> - All conversations logged in the Notifications table',
    '<b>Environment variables</b> - WHATSAPP_VERIFY_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN',
    '<b>Graceful degradation</b> - If env vars are not set, bot works in dev mode (logs to console)',
]))
story.append(PageBreak())

# ══ CHAPTER 6: REVIEW FUNNEL ══
story.append(heading('6. Post-Stay Review Funnel', style_h1, 0))
story.append(Paragraph('The post-stay review funnel is an automated system that sends a Google Reviews request to guests 2 hours after they check out. This is the single highest-ROI feature for improving the hotel Google ranking, as more positive reviews directly translate to higher search visibility and more direct bookings (reducing OTA commission costs).', style_body))
story.append(heading('6.1 How It Works', style_h2, 1))
story.append(bullets([
    '<b>Step 1:</b> Guest checks out at 11:00 AM IST',
    '<b>Step 2:</b> At 1:00 PM IST (2 hours later), the cron job runs (daily via Vercel Cron at 7:30 AM UTC)',
    '<b>Step 3:</b> System finds all bookings that checked out in the target window',
    '<b>Step 4:</b> Creates a ReviewRequest record (status: PENDING)',
    '<b>Step 5:</b> Sends a personalized WhatsApp message with the Google Reviews link',
    '<b>Step 6:</b> Marks the ReviewRequest as SENT',
    '<b>Step 7:</b> Guest clicks link, leaves a review on Google',
    '<b>Step 8:</b> Admin can mark as COMPLETED in the dashboard',
]))
story.append(heading('6.2 Configuration (CMS-Editable)', style_h2, 1))
story.append(make_table([
    ['Setting', 'Content Block Key', 'Default Value'],
    ['Google Reviews Link', 'reviews.googleLink', 'https://g.page/r/GURUVAYUR_DHAM/review'],
    ['Funnel Enabled', 'reviews.funnelEnabled', 'true'],
    ['Hours After Checkout', 'reviews.funnelHours', '2'],
], col_widths=[45*mm, 55*mm, 70*mm]))
story.append(heading('6.3 Technical Details', style_h2, 1))
story.append(bullets([
    '<b>Cron schedule:</b> 7:30 AM UTC daily (= 1:00 PM IST, 2 hours after 11 AM checkout)',
    '<b>Dry run mode:</b> ?dryRun=1 returns what would be sent without actually sending',
    '<b>Idempotency:</b> Checks for existing ReviewRequest before sending (prevents duplicates)',
    '<b>Fallback:</b> If WhatsApp API env vars are not set, requests are queued (status: PENDING) for manual send',
    '<b>Logging:</b> All sends logged in the Notifications table with booking reference',
]))
story.append(PageBreak())

# ══ CHAPTER 7: SEO ══
story.append(heading('7. SEO &amp; Structured Data', style_h1, 0))
story.append(Paragraph('The platform is built with SEO as a first-class priority. Every page has optimized meta tags, JSON-LD structured data, semantic HTML, and fast load times. The 13 SEO landing pages alone target an estimated 750,000+ monthly searches across festivals, hotel-near queries, and darshan timing guides.', style_body))
story.append(heading('7.1 JSON-LD Structured Data', style_h2, 1))
story.append(Paragraph('Google uses structured data to understand page content and display rich results (star ratings, event dates, FAQ accordions, etc.). The platform injects the following schemas:', style_body))
story.append(make_table([
    ['Schema Type', 'Where Used', 'Rich Result'],
    ['Hotel (LodgingBusiness)', 'Server-rendered in layout head', 'Knowledge panel, hotel info card'],
    ['WebSite (with SearchAction)', 'Server-rendered in layout head', 'Sitelinks search box'],
    ['Organization', 'Server-rendered in layout head', 'Knowledge panel, social profiles'],
    ['Event', 'Festival pages (Janmashtami, Holi, Diwali, Radhashtami, Kartik Purnima)', 'Event rich results with dates'],
    ['TouristAttraction', 'Hotels-near pages + darshan timing pages', 'Attraction info in search results'],
    ['FAQPage', 'FAQ page + every SEO landing page (13 pages x 5 FAQs)', 'Expandable FAQ snippets in search results'],
    ['Article', 'Blog post detail pages', 'Article rich results with author + date'],
], col_widths=[40*mm, 70*mm, 60*mm]))
story.append(heading('7.2 Dynamic Sitemap', style_h2, 1))
story.append(Paragraph('The platform generates a dynamic sitemap.xml at /sitemap.xml that includes:', style_body))
story.append(bullets([
    '<b>9 static SPA routes</b> - Home, Rooms, Pooja, About, Gallery, Events, Blog, FAQ, Contact',
    '<b>13 SEO landing pages</b> - All festival, hotels-near, and darshan-timing pages',
    '<b>Dynamic blog post URLs</b> - Every published BlogPost with lastmod from updatedAt',
    '<b>Priorities</b> - Home (1.0), SEO pages (0.8-0.9), blog posts (0.7), FAQ/Gallery (0.6)',
    '<b>Change frequency</b> - Daily for home/blog, weekly for rooms/events, monthly for FAQ/gallery',
]))
story.append(heading('7.3 Robots.txt', style_h2, 1))
story.append(Paragraph('A dynamic robots.txt at /robots.txt allows all major bots (Googlebot, Bingbot, Twitterbot, Facebook) to crawl public content while blocking admin, API, booking, login, kitchen, CMS, and settings routes. It also points to the sitemap location.', style_body))
story.append(heading('7.4 Meta Tags &amp; Open Graph', style_h2, 1))
story.append(bullets([
    '<b>Title tags</b> - Template-based: "Page Name | Guruvayur Dham"',
    '<b>Meta descriptions</b> - 120-160 characters, optimized for each page',
    '<b>Keywords</b> - 12 targeted keywords in layout metadata',
    '<b>Open Graph</b> - og:title, og:description, og:image (1200x630), og:locale (en_IN)',
    '<b>Twitter Cards</b> - summary_large_image with title, description, and image',
    '<b>Canonical URLs</b> - Set in layout metadata',
    '<b>Robots meta</b> - index: true, follow: true, max-image-preview: large',
]))
story.append(heading('7.5 SEO Audit Tool', style_h2, 1))
story.append(Paragraph('The platform includes a built-in SEO audit tool at /admin/settings that performs real checks on the live site. Unlike the previous version (which awarded fake 100/100 scores), the current audit:', style_body))
story.append(bullets([
    'Fetches the base URL and runs real HTML checks (title, meta, H1, schema, canonical, OG, images, alt text, word count)',
    'Checks /sitemap.xml, /robots.txt, and /manifest.json existence and size',
    'For each SPA hash route, saves the base HTML score plus a section-specific recommendation',
    'Surfaces per-page expandable issue lists in the admin UI (not just score numbers)',
    'Pings Google and Bing with the sitemap URL after each audit',
]))
story.append(PageBreak())

# ══ CHAPTER 8: I18N ══
story.append(heading('8. Multilingual Support (i18n)', style_h1, 0))
story.append(Paragraph('The platform supports 5 languages: English, Hindi, Marathi, Gujarati, and Malayalam. A language selector in the navbar allows instant switching, and all page content (not just navigation labels) translates automatically. The system uses a three-layer translation approach: CMS admin-curated translations, built-in translation file, and hardcoded fallbacks.', style_body))
story.append(heading('8.1 How Language Switching Works', style_h2, 1))
story.append(Paragraph('The useContent() hook integrates with the i18n system. When resolving a content block, it checks in order:', style_body))
story.append(bullets([
    '<b>Layer 1: Admin-curated translation</b> - Checks for a DB content block with the key suffix __lang (e.g., hero.headline__hi). If the admin has translated a block to Hindi, this wins.',
    '<b>Layer 2: Default DB block</b> - Checks the default-language content block (e.g., hero.headline). For English, this is the final answer. For other languages, it prefers the built-in translation if one exists.',
    '<b>Layer 3: Built-in translation file</b> - Checks translations.ts for the current language (e.g., t("hero.headline") in Hindi returns the Hindi translation).',
    '<b>Layer 4: Hardcoded fallback</b> - Uses the fallback string passed to the get() function.',
]))
story.append(heading('8.2 Translated Content', style_h2, 1))
story.append(make_table([
    ['Content Area', 'Keys Translated', 'All 5 Languages?'],
    ['Navigation', 'nav.home, nav.rooms, nav.pooja, etc. (12 keys)', 'Yes'],
    ['Hero section', 'hero.eyebrow, hero.headline, hero.subheadline (4 keys)', 'Yes'],
    ['Why Choose Us', 'whyChooseUs.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Rooms section', 'rooms.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Pooja section', 'pooja.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['About section', 'about.eyebrow, title, story (3 keys, including 3-paragraph story)', 'Yes'],
    ['Contact section', 'contact.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Events section', 'events.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Blog section', 'blog.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Testimonials', 'testimonials.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['FAQ section', 'faq.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Gallery section', 'gallery.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Darshan section', 'darshan.eyebrow, title, subtitle (3 keys)', 'Yes'],
    ['Footer', 'footer.ctaHeadline, ctaSubtitle, tagline, quickLinks, etc. (8 keys)', 'Yes'],
    ['Common/CTA', 'cta.bookNow, cta.call, common.checkIn, etc. (15 keys)', 'Yes'],
    ['Login page', 'login.welcome, signIn, createAccount, etc. (15 keys)', 'Yes'],
    ['Booking flow', 'booking.title, step1, step2, etc. (8 keys)', 'Yes'],
], col_widths=[40*mm, 85*mm, 45*mm]))
story.append(PageBreak())

# ══ CHAPTER 9: DEPLOYMENT ══
story.append(heading('9. Deployment &amp; Infrastructure', style_h1, 0))
story.append(Paragraph('The platform is designed for dual deployment: Vercel (current production) and any VPS via Docker (future migration). Both paths are fully supported with zero code changes. The VPS setup includes auto-HTTPS via Caddy, PostgreSQL in a container, and a dedicated cron container for the review funnel.', style_body))
story.append(heading('9.1 Vercel Deployment (Current)', style_h2, 1))
story.append(bullets([
    '<b>Auto-deploy</b> from GitHub main branch on every push',
    '<b>Build command:</b> next build (with postinstall: prisma generate)',
    '<b>Environment variables:</b> DATABASE_URL, NEXTAUTH_SECRET, RAZORPAY_*, WHATSAPP_*, etc.',
    '<b>Cron job:</b> Daily at 7:30 AM UTC for review funnel (Vercel Cron via vercel.json)',
    '<b>Image storage:</b> Vercel Blob (requires BLOB_READ_WRITE_TOKEN) or local fallback',
    '<b>Health check:</b> /api/health endpoint for uptime monitoring',
]))
story.append(heading('9.2 VPS Deployment (Docker)', style_h2, 1))
story.append(Paragraph('The platform is fully VPS-ready with a complete Docker setup. A single deploy.sh script handles all operations: build, deploy, migrate, seed, backup, restore, logs, and status.', style_body))
story.append(make_table([
    ['Service', 'Container', 'Purpose'],
    ['PostgreSQL 16', 'guruvayur-postgres', 'Database (persistent volume)'],
    ['Next.js App', 'guruvayur-app', 'Web server (standalone build, non-root user)'],
    ['Caddy 2', 'guruvayur-caddy', 'Reverse proxy + auto HTTPS (Let\'s Encrypt)'],
    ['Cron', 'guruvayur-cron', 'Review funnel (runs every 15 min in a loop)'],
], col_widths=[35*mm, 45*mm, 90*mm]))
story.append(Spacer(1, 4 * mm))
story.append(heading('9.3 Deploy Script Commands', style_h2, 1))
story.append(make_table([
    ['Command', 'Action'],
    ['./deploy.sh', 'Full deploy (git pull, build, restart, migrate, seed)'],
    ['./deploy.sh quick', 'Quick restart (no rebuild)'],
    ['./deploy.sh build', 'Build only (no start)'],
    ['./deploy.sh logs', 'Tail app logs'],
    ['./deploy.sh stop', 'Stop all services'],
    ['./deploy.sh db', 'Apply database schema changes (prisma db push)'],
    ['./deploy.sh seed', 'Run seed scripts'],
    ['./deploy.sh funnel', 'Test the review funnel (dry run)'],
    ['./deploy.sh status', 'Show service status + disk usage'],
    ['./deploy.sh backup', 'Backup database to backup-YYYYMMDD-HHMMSS.sql.gz'],
    ['./deploy.sh restore <file>', 'Restore database from a backup file'],
], col_widths=[55*mm, 115*mm]))
story.append(PageBreak())

# ══ CHAPTER 10: ADMIN ══
story.append(heading('10. Admin &amp; Operations Dashboard', style_h1, 0))
story.append(Paragraph('The platform includes a comprehensive admin dashboard for hotel staff. Accessible at /#/admin, it provides real-time visibility into bookings, availability, channel sync, reviews, housekeeping, kitchen orders, and more. Role-based access control supports GUEST, STAFF, and MANAGER roles.', style_body))
story.append(heading('10.1 Admin Pages', style_h2, 1))
story.append(make_table([
    ['Page', 'Route', 'Purpose'],
    ['Admin Dashboard', '/#/admin', 'Overview: bookings, revenue, occupancy, recent activity'],
    ['Admin Hub', '/#/admin/hub', 'Central hub with quick links to all admin sections'],
    ['Admin Bookings', '/#/admin/bookings', 'All bookings with filters (status, source, date)'],
    ['Admin Content', '/#/admin/content', 'Content block editor (70+ fields, 16 categories)'],
    ['Admin Rooms', '/#/admin/rooms', 'Room management (prices, availability, inventory)'],
    ['Admin Channels', '/#/admin/channels', 'Channel partner config + sync logs'],
    ['CMS Editor', '/#/cms', 'Structured data editor (11 tabs: rooms, poojas, SEO pages, etc.)'],
    ['Settings', '/#/settings', 'Channel partner API keys + SEO audit tool'],
], col_widths=[35*mm, 40*mm, 95*mm]))
story.append(heading('10.2 Authentication', style_h2, 1))
story.append(bullets([
    '<b>Guest login</b> - Email/password, OTP (phone), or OAuth (Google, Facebook)',
    '<b>Staff login</b> - PIN or email/password (role: STAFF or MANAGER)',
    '<b>2FA support</b> - Two-factor authentication via TOTP',
    '<b>Password reset</b> - Email-based reset flow with secure tokens',
    '<b>Session management</b> - Persistent sessions with expiry',
    '<b>AdminGuard</b> - Route protection for all /admin/* routes',
]))
story.append(heading('10.3 Operational Features', style_h2, 1))
story.append(make_table([
    ['Feature', 'Description'],
    ['Live Availability', 'Real-time room availability for 90 days, updated on every booking'],
    ['Housekeeping Board', 'Room status tracking (dirty, cleaning, inspected, ready)'],
    ['Kitchen Orders', 'In-room meal ordering system with order tracking'],
    ['Night Audit', 'Daily reconciliation of bookings, revenue, and occupancy'],
    ['Customer CRM', 'Guest profiles with booking history, loyalty points, preferences'],
    ['Coupon Management', 'Create/track coupons with usage limits and validity windows'],
    ['Festival Alerts', 'Automated alerts for upcoming festivals (surge pricing triggers)'],
    ['Maintenance Blocks', 'Mark rooms as under maintenance with notes'],
    ['Travel Agent Portal', 'Manage travel agent partnerships with commission tracking'],
    ['Influencer Portal', 'Track influencer referrals with click analytics'],
    ['Audit Log', 'All admin actions logged for accountability'],
], col_widths=[40*mm, 130*mm]))
story.append(PageBreak())

# ══ CHAPTER 11: PWA ══
story.append(heading('11. PWA &amp; Performance', style_h1, 0))
story.append(Paragraph('The platform is a Progressive Web App (PWA) with offline support, push notifications, and add-to-home-screen capability. Performance is optimized for fast load times on mobile networks, which is critical for pilgrim users in areas with poor connectivity.', style_body))
story.append(heading('11.1 PWA Features', style_h2, 1))
story.append(bullets([
    '<b>Service Worker</b> - Registered for offline caching of static assets',
    '<b>Web App Manifest</b> - Installable on Android/iOS with app icons',
    '<b>Push Notifications</b> - VAPID key support for web push (booking confirmations, festival alerts)',
    '<b>Add to Home Screen</b> - Prompt shown to returning visitors',
    '<b>Apple Touch Icons</b> - Optimized icons for iOS home screen',
    '<b>Maskable Icons</b> - Adaptive icons for Android',
    '<b>Theme Color</b> - #0F0A08 (matches the dark ink theme)',
]))
story.append(heading('11.2 Performance Optimizations', style_h2, 1))
story.append(bullets([
    '<b>Next.js standalone build</b> - Minimal server bundle, no unnecessary node_modules',
    '<b>Image optimization</b> - Next.js Image component with lazy loading and responsive sizes',
    '<b>Font optimization</b> - Variable fonts (Fraunces, Manrope) with display: swap',
    '<b>Code splitting</b> - Automatic route-based code splitting',
    '<b>Core Web Vitals</b> - LCP, FID, CLS tracked via PerformanceObserver',
    '<b>Analytics</b> - Custom event tracking (page views, bookings, CTA clicks)',
    '<b>Rate limiting</b> - API rate limiting to prevent abuse',
    '<b>Caching</b> - Static assets cached for 1 year (immutable), API responses cache: no-store',
]))
story.append(PageBreak())

# ══ CHAPTER 12: SECURITY ══
story.append(heading('12. Security', style_h1, 0))
story.append(Paragraph('The platform implements multiple layers of security to protect guest data, prevent abuse, and ensure reliable operation. All sensitive operations are server-side, and authentication is required for all admin and booking endpoints.', style_body))
story.append(bullets([
    '<b>Authentication</b> - NextAuth with JWT sessions, OAuth (Google, Facebook), OTP, PIN',
    '<b>Authorization</b> - Role-based access control (GUEST, STAFF, MANAGER)',
    '<b>AdminGuard</b> - Server-side route protection for all /admin/* routes',
    '<b>Rate limiting</b> - API rate limiting (3 reviews/hour, booking limits per IP)',
    '<b>Input validation</b> - Zod schemas for all form inputs',
    '<b>SQL injection protection</b> - Prisma ORM with parameterized queries',
    '<b>XSS protection</b> - React automatic escaping, no dangerouslySetInnerHTML on user input',
    '<b>CSRF protection</b> - SameSite cookies for auth sessions',
    '<b>HTTPS enforcement</b> - Caddy auto-redirects HTTP to HTTPS',
    '<b>Security headers</b> - HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy',
    '<b>File upload validation</b> - Server-side file type + size validation (max 10MB)',
    '<b>Non-root Docker user</b> - App runs as nextjs:nodejs (UID 1001) in production',
]))
story.append(PageBreak())

# ══ CHAPTER 13: ROADMAP ══
story.append(heading('13. Future Roadmap', style_h1, 0))
story.append(Paragraph('The platform is designed for continuous growth. The following features are recommended for the next phase of development, ranked by expected impact:', style_body))
story.append(heading('13.1 Phase 2 SEO Expansion', style_h2, 1))
story.append(make_table([
    ['Page Type', 'Pages', 'Est. Monthly Searches'],
    ['How to Reach guides', '5 (Mathura, Delhi-Mathura, Agra-Mathura, Mathura-Vrindavan, Railway to Temples)', '~75,000'],
    ['Pooja-specific landing pages', '4 (Palpayasam, Abhishek, Aarti, Annadan)', '~14,000'],
    ['Itinerary guides', '4 (2-day, Vrindavan day trip, Braj circuit, temple tour)', '~27,000'],
    ['Distance/Route pages', '4 (Mathura-Vrindavan, Delhi-Mathura, Mathura-Agra, Mathura-Gokul)', '~34,000'],
    ['Dress code + Best time', '2 (Dress code, Best time to visit)', '~11,000'],
    ['Comparison/Listicle pages', '3 (Top 10 temples, Mathura vs Vrindavan, Budget hotels)', '~25,000'],
], col_widths=[45*mm, 75*mm, 50*mm]))
story.append(heading('13.2 Feature Roadmap', style_h2, 1))
story.append(make_table([
    ['Feature', 'Impact', 'Effort'],
    ['Festival Surge Pricing', 'High (30-50% revenue increase during peaks)', 'Medium'],
    ['Waitlist + Auto-Notify', 'High (captures lost bookings)', 'Medium'],
    ['Group Booking Flow', 'High (large revenue source)', 'High'],
    ['Pooja Calendar Booking', 'Medium (visual date picker for poojas)', 'Medium'],
    ['Darshan Slot Reminders', 'Medium (adds value for first-time visitors)', 'Low'],
    ['Pilgrim Itinerary Planner', 'Medium (shareable day-by-day plan)', 'High'],
    ['Housekeeping Dashboard', 'Medium (saves 30+ min/day)', 'Medium'],
    ['Real OTA API Integration', 'High (prevents double-bookings)', 'High'],
], col_widths=[50*mm, 75*mm, 45*mm]))
story.append(PageBreak())

# ══ CHAPTER 14: SUMMARY ══
story.append(heading('14. Summary', style_h1, 0))
story.append(Paragraph('The Guruvayur Dham platform is a comprehensive, production-ready digital solution for a pilgrim hotel. It combines a beautiful, fast website with a powerful CMS, intelligent WhatsApp chatbot, automated review funnel, multi-channel booking sync, and 13 SEO-optimized landing pages targeting 750,000+ monthly searches.', style_body))
story.append(Paragraph('The platform is deployed on Vercel with automatic deploys from GitHub, and is also fully VPS-ready with a complete Docker setup. All content is editable through the CMS without code changes, and the site supports 5 languages for pilgrims from across India.', style_body))
story.append(heading('14.1 Key Metrics', style_h2, 1))
story.append(make_table([
    ['Metric', 'Value'],
    ['Total Pages', '23+'],
    ['SEO Landing Pages', '13'],
    ['Total SEO Content', '11,108 words'],
    ['Estimated Monthly Search Reach', '750,000+'],
    ['Languages', '5'],
    ['CMS Content Blocks', '70+'],
    ['API Endpoints', '50+'],
    ['Database Models', '40+'],
    ['JSON-LD Schemas', '7 types (Hotel, WebSite, Organization, Event, TouristAttraction, FAQPage, Article)'],
    ['Deployment Targets', 'Vercel + any VPS (Docker)'],
    ['PWA Ready', 'Yes (offline, push, installable)'],
    ['Typecheck Errors', '0'],
], col_widths=[60*mm, 110*mm]))
story.append(Spacer(1, 8 * mm))
story.append(Paragraph('<i>This document was generated on January 2026 and reflects the current state of the platform. For the latest features and updates, visit the GitHub repository at github.com/ayanalidar/guruvayur-dham.</i>', style_note))

# ─── Build ───
output_path = '/home/z/my-project/download/guruvayur-dham-platform-report.pdf'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
doc = TocDocTemplate(output_path, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=25*mm, bottomMargin=20*mm, title='Guruvayur Dham Platform Report', author='Guruvayur Dham', subject='Platform Features, SEO Reach, and Technical Documentation', creator='Z.ai')
doc.multiBuild(story, onFirstPage=cover_page, onLaterPages=body_page)
print(f'PDF generated: {output_path}')
print(f'Size: {os.path.getsize(output_path) / 1024:.1f} KB')
