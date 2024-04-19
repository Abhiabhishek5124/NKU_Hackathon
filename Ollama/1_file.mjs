
import ollama from 'ollama'

let question = "What is the national anthem of Nepal?"
const response = await ollama.chat({
  model: 'mistral',
  messages: [{ role: 'user', content: question }],
})
console.log(response.message.content)
