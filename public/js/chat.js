const socket = io()


//Elements
const $messageForm = document.querySelector('#data')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    //Height of the last message
    const newMessageStyles = getComputedStyle($newMessage) 
    //get margin bottom spacing value 
    //see cssStyleDeclaration in console, you will find margin bottom

    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //getting total height

    //visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
          $messages.scrollTop = $messages.scrollHeight
    }

    // console.log(newMessageMargin)
}



socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('location-message', (message) => {
    console.log(message)
    const html = Mustache.render($locationTemplate, {
        username: message.username,
       location: message.url,
       createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
  
})

socket.on('roomData', ({   room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})



// const input = document.querySelector('#inpt')

const form = $messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    
    // console.log(input.value)
   const message =  e.target.elements.message.value
    socket.emit('newMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()


       if(error){
           return console.log(error)
       }
       console.log('Message Delivered!')
    })
})


document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    $messageFormLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
    //   console.log(position.coords.latitude)

    const loc = `Location: ${position.coords.longitude}, ${position.coords.latitude}`
    socket.emit('sendLocation', {
        latitude:position.coords.latitude,
        longitude:position.coords.longitude
    }, () => {
       console.log('Location Shared!')
       $messageFormLocation.removeAttribute('disabled')
    })
    })

})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})