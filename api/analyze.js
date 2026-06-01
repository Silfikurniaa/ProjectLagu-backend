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

  try {

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-4.1-mini",

          input: `
Berikut adalah riwayat lagu yang sering didengarkan pengguna:

${songs}

Tugas:

1. Analisis selera musik pengguna.
2. Jelaskan genre atau karakter musik yang disukai.
3. Berikan 5 rekomendasi lagu baru.
4. Berikan alasan singkat untuk setiap rekomendasi.

Gunakan bahasa Indonesia yang sederhana dan rapi.
          `
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Gagal mendapatkan respons OpenAI"
      });

    }

    let text = "";

    try {

      text =
        data.output[0]
        .content[0]
        .text;

    } catch {

      text =
        JSON.stringify(data);
    }

    return res.status(200).json({
      result: text
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Gagal menghubungi AI"
    });

  }
}
