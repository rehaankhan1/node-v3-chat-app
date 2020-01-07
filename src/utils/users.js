const user = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room}) => {
  //Clean the Data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //Validate the data
  if(!username || !room){
      return {
          error: 'Username and Room are Required!'
      }
  }

  // Check for existing user
  const existingUser = user.find((user) => {
      return user.room === room && user.username === username
  })

  //Validate Username
  if(existingUser){
      return {
          error: 'Username is in use!'
      }
  }

  //Store User
  const users = { id, username, room }
  user.push(users)
  return { users }

}

//remove a user
const removeUser = (id) => {
  const index = user.findIndex((userId) => userId.id === id)
  if(index !== -1){
      return user.splice(index, 1)[0]
  }
}

//get a user
const getUser = (id) => {
    const findUser = user.find((userField) => userField.id === id)
    if(findUser){
        return findUser
    }else{
        return undefined
    }
}

//get number of users in a room
const getTotal = (roomName) => {
  roomName = roomName.trim().toLowerCase()
return user.filter((user) => user.room === roomName)
}


addUser({
    id:22,
    username: 'Andrew    ',
    room: 'Learn React Native!'
})

addUser({
    id:23,
    username: 'Rehaan',
    room: 'Learn React Native!'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getTotal
}