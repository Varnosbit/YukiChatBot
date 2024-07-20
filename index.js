import express from "express";
import fs from "fs-extra";
import querystring from "querystring";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();

let responses = {};

try {
  const jsonFile = fs.readFileSync(__dirname + "/yuki.json", "utf-8");
  responses = JSON.parse(jsonFile);
  
} catch (error) {
  console.error("Error reading JSON file:", error);
}

app.use(express.json());

app.get('/', (req, res) => res.sendFile(__dirname + '/yuki.html'));

app.get('/teachHT', (req, res) => res.sendFile(__dirname + '/teachYuki.html'));

app.get("/teach", (req, res) => {

  
  const { word, responsesToAdd } = req.query;

  if (!word || !responsesToAdd) {
    return res
      .status(400)
      .json({ error: "Both 'word' and 'responsesToAdd' fields are required." });
  }
  
  const responsesToAddArray = querystring.unescape(responsesToAdd).split(",");

  const lowercaseWord = word.toLowerCase();
  if (!responses[lowercaseWord]) {
    responses[lowercaseWord] = [];
  }

  responses[lowercaseWord].push(...responsesToAddArray);
  fs.writeFileSync(
    __dirname + "/yuki.json",
    JSON.stringify(responses, null, 4),
    "utf-8"
  );
   
  const addedResponsesMessage = chalk.bold.green(
    `Responses added successfully for word "${word}"!`
  );
  console.log(addedResponsesMessage);
  
  res.json({ response: addedResponsesMessage });
});

app.get("/delete", (req, res) => {
  const { word, response, password } = req.query;
  const apipassowrd = "FS";
  if (!word) {
    return res.status(400).json({ error: "'word' field is required." });
  }
  if (password != apipassowrd) {
    return res
    .status(500)
    .json({ response: "فقط allou Mohamed " });
  }

  const lowercaseWord = word.toLowerCase();
  if (!responses[lowercaseWord]) {
    const noResponsesMessage = `علمني كيف أرد على "${word}".`;
    console.log(noResponsesMessage);
    return res.json({ response: noResponsesMessage });
  }

  if (response) {
    const index = responses[lowercaseWord].indexOf(response);
    if (index !== -1) {
      responses[lowercaseWord].splice(index, 1);
      if (responses[lowercaseWord].length === 0) {
        delete responses[lowercaseWord];
      }
      fs.writeFileSync(
        __dirname + "/yuki.json",
        JSON.stringify(responses, null, 4),
        "utf-8"
      );
      const deletedResponseMessage = chalk.bold.red(
        `Response "${response}" deleted from word "${word}"`
      );
      console.log(deletedResponseMessage);
      return res.json({ response: deletedResponseMessage });
    } else {
      const responseNotFoundMessage = chalk.bold.yellow(
        `Response "${response}" not found for word "${word}"`
      );
      console.log(responseNotFoundMessage);
      return res.json({ response: responseNotFoundMessage });
    }
  } else {
    delete responses[lowercaseWord];
    fs.writeFileSync(
      __dirname + "/yuki.json",
      JSON.stringify(responses, null, 4),
      "utf-8"
    );
    const allResponsesDeletedMessage = chalk.bold.red(
      `All responses for word "${word}" deleted`
    );
    console.log(allResponsesDeletedMessage);
    return res.json({ response: allResponsesDeletedMessage });
  }
});

app.get("/yuki", (req, res) => {
  const { word } = req.query;
  
  if (!word) {
    return res
      .status(400)
      .json({ error: "'word' query parameter is required." });
  }
  
  const author = ["allou mohamed", "author", "من صنعك", "طورك", "المطور", "المبرمج", "الصانع", "أبوك", "صنعك", "طورك"];

  if (author.includes(word) || author.includes(word.toLowerCase())) {
     res.json({ response: '• الذكاء الذي تكلمه الآن هو Yuki BOT 🤖\n-المطور: Allou Mohamed\n-رابط المطور:\nfacebook.com/proArCoder\n-أتمنى لك نهارا جميلا 🌝🫂'  });
    return;
    }

  
  const bestMatch = calculateBestMatch(word, responses);
  if (!bestMatch) {
    const teachMessage = chalk.bold.blue(`Tech Bot "${word}"`);
    console.log(teachMessage);
    return res.json({ response: `علمني كيف أرد على "${word}"` });
  }

  const randomIndex = getRandomIndex(bestMatch.length);
  const responseMessage = chalk.bold.cyan(bestMatch[randomIndex]);
  console.log(responseMessage);
  return res.json({ response: bestMatch[randomIndex]  });
});

const port = 3000;
const lengthTxT = Object.keys(responses).length;
  console.log(`yuki know reply to: ${lengthTxT}  word 🙆`);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

function calculateBestMatch(input, responses) {
  const inputWords = input.toLowerCase().split(" ");
  let bestMatch = null;
  let bestMatchScore = 0;

  for (const response in responses) {
    const responseWords = response.split(" ");
    let commonWords = 0;

    for (const inputWord of inputWords) {
      if (responseWords.includes(inputWord)) {
        commonWords++;
      }
    }

    const similarityScore = commonWords / responseWords.length;
    if (similarityScore > bestMatchScore) {
      bestMatch = responses[response];
      bestMatchScore = similarityScore;
    }
  }

  return bestMatch;
}

function getRandomIndex(arrayLength) {
  const randomIndex = Math.floor(Math.random() * arrayLength);
  return randomIndex;
        }
    