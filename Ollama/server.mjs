import ollama from 'ollama'
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import * as mammoth from 'mammoth';
const app = express();
const port = 3009;
app.use(express.static('./pages'));
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
      console.log(fileContent);// Print the content to the console
    })
    .catch(error => {
      console.error('Error extracting text from .docx:', error);
    });
});
let modelContent = `You are an expert in creating practice questions based on study material.
Your goal is to prepare a student about the financial literacy. You do this by asking questions from the source below.:

------------
${fileContent}
------------

Make sure the questions are straight `
//console.log(fileContents);

//generate the question
const responseOllama = await ollama.chat({
  model: 'mistral',
  messages: [{ role: 'user', content: modelContent }],
})

app.get('/', (req, res) => {
  const myPage = fs.readFileSync('./testFile.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
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




