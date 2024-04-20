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

const docxFilePath = './assets/Budget.docx';
let fileContent = '';
let modelContent = '';

// Read the content of the .docx file
fs.readFile(docxFilePath, (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  
  // Extract text from the .docx file
  mammoth.extractRawText({ buffer: data })
    .then(async result => {
      fileContent = result.value;

      // Construct the content for generating questions
      modelContent = `Create ten questions from the below text related to financial literacy and create a json array with the question, four options, correct answer, description (description about that answer. What and Why?). Only one option should be correct among the 4 options. Just give the JSON array and nothing else
        ------------
        ${fileContent}
        ------------  `;

      try {
        // Generate questions using the GPT-3.5 model
        const responseGPT = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: modelContent }],
          temperature: 0,
          max_tokens: 1500,
        });

        console.log(responseGPT.choices[0].message.content);

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

      } catch (err) {
        console.error('Error generating questions:', err);
      }
    })
    .catch(error => {
      console.error('Error extracting text from .docx:', error);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
