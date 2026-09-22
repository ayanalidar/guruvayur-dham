import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ROOMS, SITE } from "@/lib/site-data";

/**
 * GET /api/google-hotels-feed
 *
 * Generates a Google Hotel Center compliant XML feed.
 * Google fetches this URL publicly (no auth required) to ingest property +
 * room + rate data into the Hotel Center platform.
 *
 * Feed URL (production): https://guruvayurdham.co.in/api/google-hotels-feed
 *
 * Content-Type: application/xml  (Google's spec recommends XML, not JSON).
 *
 * The feed includes:
 *   - <Property> info (name, address, phone, URL, latitude/longitude, currency, language)
 *   - <RoomTypes> with all room types from the ROOMS array (or the live
 *     Room table — uses DB if reachable, falls back to ROOMS constant)
 *   - <Rates> with each room's nightly price (and originalPrice for the
 *     strikethrough comparison)
 *
 * Reference: Google Hotel Center "Properties" feed structure (simplified
 * for our 16-room property — production Google feeds can be hundreds of
 * fields; we publish the ones Google actually indexes).
 */
export async function GET() {
  // Prefer live DB rooms (so admin edits propagate to the feed); fall back
  // to the ROOMS constant from site-data.ts if the DB is unreachable.
  let rooms: any[] = [];
  try {
    const dbRooms = await db.room.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    });
    if (dbRooms && dbRooms.length > 0) {
      rooms = dbRooms;
    } else {
      rooms = ROOMS as any;
    }
  } catch {
    rooms = ROOMS as any;
  }

  const lastModified = new Date().toISOString();

  const roomTypeXml = rooms.map((r: any) => {
    const roomId = r.slug || r.id;
    const name = xmlEscape(r.name || "");
    const description = xmlEscape(r.description || r.shortDesc || "");
    const capacity = Number(r.capacity) || 2;
    const size = xmlEscape(r.size || "");
    const bedType = xmlEscape(r.bedType || "");
    const price = Number(r.price) || 0;
    const originalPrice = Number(r.originalPrice) || price;
    // gallery is JSON-stringified array of URLs in DB; in the ROOMS
    // constant it's already an array. Handle both.
    let gallery: string[] = [];
    if (Array.isArray(r.gallery)) gallery = r.gallery;
    else if (typeof r.gallery === "string") {
      try { gallery = JSON.parse(r.gallery) || []; } catch { gallery = []; }
    }
    const imageUrls = (gallery.length > 0 ? gallery : [r.image])
      .filter(Boolean)
      .map(url => `        <ImageURL>${xmlEscape(url)}</ImageURL>`)
      .join("\n");

    return `    <RoomType id="${xmlEscape(roomId)}">
      <Name>${name}</Name>
      <Description>${description}</Description>
      <Capacity>${capacity}</Capacity>
      <Size>${size}</Size>
      <BedType>${bedType}</BedType>
      <PhotoURL>
${imageUrls || `        <ImageURL>${xmlEscape(r.image || "")}</ImageURL>`}
      </PhotoURL>
      <Rates>
        <Rate id="default">
          <Price currency="INR">${price}</Price>
          ${originalPrice && originalPrice !== price ? `<OriginalPrice currency="INR">${originalPrice}</OriginalPrice>` : ""}
          <Basis>Per night</Basis>
        </Rate>
      </Rates>
    </RoomType>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<HotelCenterFeed xmlns="http://www.google.com/2017/hotel_center">
  <LastModified>${lastModified}</LastModified>
  <Property>
    <Name>${xmlEscape(SITE.name)}</Name>
    <Address>${xmlEscape(SITE.address)}</Address>
    <Phone>${xmlEscape(SITE.phone)}</Phone>
    <Email>${xmlEscape(SITE.email)}</Email>
    <URL>https://${xmlEscape(SITE.domain)}/</URL>
    <Domain>${xmlEscape(SITE.domain)}</Domain>
    <Currency>INR</Currency>
    <Language>en</Language>
    <Latitude>27.4924</Latitude>
    <Longitude>77.6900</Longitude>
    <TotalRooms>${SITE.totalRooms}</TotalRooms>
    <CheckInTime>12:00</CheckInTime>
    <CheckOutTime>11:00</CheckOutTime>
    <StarRating>3</StarRating>
    <Description>${xmlEscape(`${SITE.name} is a ${SITE.totalRooms}-room premium pilgrim stay in Mathura. ${SITE.distanceToTemple}. Clean AC rooms, 24×7 hot water, free WiFi, free parking. Walk to Krishna Janmabhoomi, short drive to Vrindavan's Banke Bihari and Prem Mandir. Pooja booking assistance and local transport arranged at zero commission.`)}</Description>
    <Amenities>
      <Amenity>Free WiFi</Amenity>
      <Amenity>Air Conditioning</Amenity>
      <Amenity>LED TV</Amenity>
      <Amenity>24x7 Hot Water</Amenity>
      <Amenity>Attached Bathroom</Amenity>
      <Amenity>Power Backup</Amenity>
      <Amenity>Free Parking</Amenity>
      <Amenity>Room Service</Amenity>
      <Amenity>Laundry</Amenity>
      <Amenity>CCTV Security</Amenity>
      <Amenity>Elevator</Amenity>
    </Amenities>
    <PhotoURL>
      <ImageURL>https://${xmlEscape(SITE.domain)}/guruyavur.png</ImageURL>
    </PhotoURL>
  </Property>
  <RoomTypes>
${roomTypeXml}
  </RoomTypes>
</HotelCenterFeed>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Last-Modified": lastModified,
    },
  });
}

/** Minimal XML escaper — sufficient for our static + DB-driven content. */
function xmlEscape(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
