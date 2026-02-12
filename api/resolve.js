export default async function handler(req, res) {
  try {
    const slug = (req.query.slug || "").toString().trim().toLowerCase();

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" });
    }

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = "Viewing Room";
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    if (!BASE_ID || !AIRTABLE_TOKEN) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const formula = `{Slug}='${slug.replace(/'/g, "\\'")}'`;
    const url =
      `https://api.airtable.com/v0/${BASE_ID}/` +
      encodeURIComponent(TABLE_NAME) +
      `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });

    const data = await r.json();

    const record = data.records && data.records[0];
    const embed = record?.fields?.["Viewing room URL Airtable"];

    if (!embed) {
      return res.status(404).json({ error: "Slug not found" });
    }

    return res.status(200).json({ embed });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
