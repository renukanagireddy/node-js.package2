const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const app = express()
app.use(express.json())
const bcrypt = require('bcrypt')

const dbPath = path.join(__dirname, 'userData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//Register User API
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `SELECT * 
  FROM user 
  WHERE username='${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    const createUserQuery = `INSERT INTO
         user(username,name,password,gender,location)
      VALUES 
      ('${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}',
      );`
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      let result = await db.run(createUserQuery)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

module.exports = app
