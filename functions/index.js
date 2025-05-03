const functions = require("firebase-functions");
const {google} = require("googleapis");
const {readFileSync} = require("fs");
const cors = require("cors")({origin: true});

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(readFileSync("./credentials.json", "utf8")),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID =
  "1189YopeD-amrFH15La2EWpsl4yhyvGGgkdlb0qpGexs"; // 예: 1AbCDeFgHiJkLmNo...

exports.uploadToSheet = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Only POST requests are allowed");
    }

    try {
      const data = req.body.data;

      if (!Array.isArray(data) || !Array.isArray(data[0])) {
        return res.status(400).send("Invalid data format");
      }

      const authClient = await auth.getClient();
      const sheets = google.sheets({version: "v4", auth: authClient});

      const range = "list!C9"; // 시작 셀
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: data,
        },
      });

      res.status(200).send("✅ 시트에 성공적으로 업로드됨");
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      res.status(500).send("서버 오류: " + err.message);
    }
  });
});
