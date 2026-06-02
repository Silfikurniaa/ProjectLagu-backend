export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Gunakan method POST"
    });
  }

  const { recommendation } = req.body;

  if (!recommendation) {
    return res.status(400).json({
      error: "Hasil rekomendasi kosong"
    });
  }

  try {

    const prompt = `
Buat sebuah cover album musik yang menarik berdasarkan rekomendasi berikut:

${recommendation}

Ketentuan:
- gaya modern dan profesional
- cocok untuk aplikasi streaming musik
- warna menarik dan artistik
- kualitas tinggi
- tidak ada tulisan atau watermark
- fokus pada suasana musik yang direkomendasikan
- satu gambar saja
- nuansa visual harus sesuai mood musik
- tampak seperti cover album premium
- background estetik
    `.trim();

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json({
        error: "Gagal membuat gambar dari image API gratis"
      });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    return res.status(200).json({
      image: base64Image
    });

  } catch (error) {

    console.error("Generate image error:", error);

    return res.status(500).json({
      error: "Gagal menghubungi image API"
    });

  }
}
