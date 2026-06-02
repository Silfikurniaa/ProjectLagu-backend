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

  const { songs } = req.body;

  if (!songs) {
    return res.status(400).json({
      error: "Data lagu kosong"
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY belum diatur di Environment Variables Vercel"
    });
  }

  try {

    const prompt = `
Berikut adalah riwayat lagu yang sering didengarkan pengguna:

${songs}

Tugas:
1. Analisis selera musik pengguna.
2. Jelaskan genre atau karakter musik yang disukai.
3. Berikan 5 rekomendasi lagu baru.
4. Berikan alasan singkat untuk setiap rekomendasi.

Gunakan bahasa Indonesia yang sederhana dan rapi.
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Gagal mendapatkan respons dari Gemini"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini tidak memberikan hasil analisis.";

    return res.status(200).json({
      result: text
    });

  } catch (error) {

    console.error("Analyze error:", error);

    return res.status(500).json({
      error: "Gagal menghubungi Gemini AI"
    });

  }
}
