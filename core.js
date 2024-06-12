import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const SELECTED_MODEL = 'Phi-3-mini-4k-instruct-q4f16_1-MLC'

const $ = el =>document.querySelector(el)

const $form = document.querySelector('form')
const $input = document.querySelector('input')
const $template = document.querySelector('#message-template')
const $message = document.querySelector('ul')
const $container = document.querySelector('main')
const $button = document.querySelector('button')
const $info = document.querySelector('small')

let messages = []

const engine = await CreateWebWorkerMLCEngine(
  new Worker('/worker.js', { type: 'module' }),
  SELECTED_MODEL,{
    initProgressCallback: (info) => {
      
      $info.textContent = `${ info.text }`
      
      if( info.progress === 1 ){
        $button.removeAttribute('disabled')
      }
    }
  }
)

$form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const messageText = $input.value.trim()

  if(messageText !== ''){
    $input.value = ''
  }

  addMessage(messageText,'user')
  $button.setAttribute('disabled', true)
  
  const userMessage = {
    role: 'user',
    content: messageText
  }

  messages.push(userMessage)

 
  const chunks = await engine.chat.completions.create({
    messages,
    stream: true
  })

  let reply = ''

  const $botMessage = addMessage('', 'bot')

  for await (const chunk of chunks) {
    const choice = chunk.choices[0]
    const content = choice?.delta?.content ?? ""
    reply += content
    $botMessage.textContent = reply
  }
  $button.removeAttribute('disabled')
  
  messages.push({
    role: 'assistant',
    content: reply
  })
  $container.scrollTop = $container.scrollHeight
 
})

function addMessage(text, sender) {
  //Clone template
  const clonedTemplate = $template.content.cloneNode(true)

  const $newMessage = clonedTemplate.querySelector('.message')
  const $who = $newMessage.querySelector('span')
  const $text = $newMessage.querySelector('p')

  $text.textContent = text
  $who.textContent = sender === 'bot' ? 'IA': 'You'
  $newMessage.classList.add(sender)

  $message.appendChild($newMessage)
  $button.setAttribute('disabled', true)

  //Update scroll
   $container.scrollTop = $container.scrollHeight

   return $text
}