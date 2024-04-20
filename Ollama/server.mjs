import ollama from 'ollama'
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import * as mammoth from 'mammoth';
const app = express();
const port = 3009;
app.use(express.static('/Users/bhuwanbhandari/Desktop/NKU_HACKATHON'));
app.use(bodyParser.json());
//read the file
const docxFilePath = './assets/Income.docx';
let fileContent = '';
fs.readFile(docxFilePath, (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  // Convert .docx to plain text
  mammoth.extractRawText({ buffer: data })
    .then(result => {
      fileContent = result.value;
      //console.log(fileContent);// Print the content to the console
    })
    .catch(error => {
      console.error('Error extracting text from .docx:', error);
    });
});

//console.log(fileContents);

//generate the question
const responseOllama = await ollama.chat({
  model: 'mistral',
  messages: [{ role: 'user', content:`Create ten questions related to financial literacy and create a json array with the question, four options and answer. Just give the 
  JSON array and nothing else` }],
})
let answer = responseOllama.message.content;
let jsonAnswer = JSON.parse(answer);

app.get('/', (req, res) => {
  const myPage = fs.readFileSync('./debtQuiz.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/data.json', (req, res) => {
  res.send(jsonAnswer);
  console.log("Json file sent")
});
app.post('/askquestion', (req, res) => {
  const responseObject = {
    question: responseOllama.message.content
  };
  //console.log(fileContent);
  res.send(responseObject);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});




