const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getTotal } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = 3000 || process.env.PORT

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))



io.on('connection', (socket) => {
  console.log('New Websocket Connection!')

  

socket.on('join', (options , callback) => {

  const {  error, users } = addUser({  id:socket.id, ...options })
  if(error){
    return callback(error)
  }
  

    socket.join(users.room)

    socket.emit('message', generateMessage(users.username,'Welcome!'))
    socket.broadcast.to(users.room).emit('message', generateMessage(users.username, `${users.username} has Joined!`))

    io.to(users.room).emit('roomData', {
      room: users.room,
      users:getTotal(users.room)
    })

    callback()

})








socket.on('newMessage', (message, callback) => {

    const eachUser = getUser(socket.id)

    const filter = new Filter()

    if(filter.isProfane(message)) {
        return callback('Profanity is not allowed!')
    }

    io.to(eachUser.room).emit('message', generateMessage(eachUser.username, message))
    callback()
})




socket.on('sendLocation', (location, callback) => {
    const eachUser = getUser(socket.id)
  //  <a href="https://google.com/maps?q=${location.latitude},${location.longitude}"><p>My current Location</p></a>
    io.to(eachUser.room).emit('location-message', generateLocationMessage(eachUser.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
    callback()
})
//links.mead.io/chatassets
 socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user) {
        io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left!`))
        io.to(user.room).emit('roomData', {
          room: user.room,
          users:getTotal(user.room)
        })
    }
 })
})






server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})