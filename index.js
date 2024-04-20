const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const fs = require('fs');
const mammoth = require('mammoth');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 4400;

app.use(express.static('/Users/abhishek/Desktop/NKU_HACKATHON'));
app.use(bodyParser.json());

let modelContent = [];
const filepaths = [
  './assets/Income.docx',
  './assets/Budget.docx',
  './assets/Savings.docx',
  './assets/DEBT.docx'
];
const jsonFileNames = filepaths.map(filepath => {
  const baseName = filepath.split('/').pop(); // Get the base filename
  return baseName.replace('.docx', '.json'); // Replace .docx extension with .json
});

// Read content of each .docx file
Promise.all(filepaths.map(readFileAsync))
  .then(contents => {
    modelContent = contents.map(content => `Create ten questions from the below text related to financial literacy and create a json array with the question, four options, correct answer, description (description about that answer. What and Why?). Only one option should be correct among the 4 options. Just give the JSON array and nothing else
      ------------
      ${content}
      ------------`);

    // Define the messages to send for each completion
    const messages = modelContent.map(content => ({ role: 'user', content }));

    // Perform multiple completions in parallel
    Promise.all(messages.map(message => openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [message],
      temperature: 0,
      max_tokens: 1500,
    })))
      .then(completions => {
        completions.forEach((responseGPT, index) => {
          console.log(`Completion ${index + 1}:`, responseGPT.choices[0].message.content);
          // Send the generated questions as JSON response
          const fileName = jsonFileNames[index]
          fs.writeFileSync(fileName, JSON.parse(JSON.stringify(responseGPT.choices[0].message.content, null, 2)));
          app.get(`/generateQuestions/${index}`, (req, res) => {
            res.status(200).json(responseGPT);
          });
        });
      })
      .catch(err => {
        console.error('Error generating questions:', err);
      });
  })
  .catch(err => {
    console.error('Error reading files:', err);
  });

        // console.log(responseGPT.choices[0].message.content);

        // Send the generated questions as JSON response
        app.get('/generateQuestions', (req, res) => {
          res.status(200).json(responseGPT);
        });

        app.get('/data.json', (req, res) => {
          res.send(jsonAnswer);
          console.log("Json file sent")
        });

        app.post('/askquestion', (req, res) => {
          const responseObject = {
            question: responseGPT.message.content
          };
          //console.log(fileContent);
          res.send(responseObject);
        });

      

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Helper function to read a file asynchronously
function readFileAsync(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        mammoth.extractRawText({ buffer: data })
          .then(result => resolve(result.value))
          .catch(reject);
      }
    });
  });
}