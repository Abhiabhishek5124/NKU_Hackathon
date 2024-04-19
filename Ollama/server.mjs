import ollama from 'ollama'
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
const app = express();
const port = 3009;
app.use(express.static('./pages'));
app.use(bodyParser.json());
//read the file
//const fileContents = fs.readFileSync('./assets/testAbstract.docx', 'utf-8');
//console.log(fileContents);

//generate the question

let question = "When was GitHub first created"
const responseOllama = await ollama.chat({
  model: 'mistral',
  messages: [{ role: 'user', content: question }],
})
app.get('/', (req, res) => {
  const myPage = fs.readFileSync('./testFile.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.post('/askquestion', (req, res) => {
  const responseObject = {
    question: question,
    answer: responseOllama.message.content
  };
  console.log(responseObject.answer);
  res.send(responseObject);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});




