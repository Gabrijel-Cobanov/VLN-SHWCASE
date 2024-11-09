const express = require('express')
const { Pool } = require('pg')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const PORT = 5000
const livereload = require('livereload')
const connectLivereload = require('connect-livereload')

require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    idleTimeoutMillis: 10000,
})

app.use(express.static(path.join(__dirname, 'public')))

const liveReloadServer = livereload.createServer()
liveReloadServer.watch(path.join(__dirname, 'public'))
liveReloadServer.watch(path.join(__dirname, 'views'))

app.use(connectLivereload())

// Dummy data za demonstraciju izmjene šifre u broken auth
const users = {
    'johndoe@example.com':              'oldpassword123',
    'janesmith@example.com':            'password456',
    'gandalf@grey.com':                 'YouShallNotPAss2024',
    'jovan.fitilj@Continental.com':     'SizifSPistoljem'
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

app.post('/search', async (req, res) => {
    const { query, sqlVulnEnabled } = req.body

    try {
        let result
        if (sqlVulnEnabled) {
            result = await pool.query(query)
        } else {
            // Parametrizacijom upita se obranimo od SQL injection napada budući da
            // cijeli korisnički unos ide u parametar koji se prepoznaje isključivo kao podatak, a ne naredba
            result = await pool.query('SELECT tracktitle FROM movie NATURAL JOIN track WHERE tracktitle ILIKE $1', [`%${query}%`])
        }

        res.json({ results: result.rows.map(row => row.tracktitle) })
    } catch (error) {
        console.error('Database query error:', error)
        res.status(500).json({ error: 'Database query error' })
    }
})

app.post('/change-password', (req, res) => {
    const { email, oldPassword, newPassword, authVulnEnabled } = req.body

    if (!email || !newPassword) {
        return res.json({ message: 'Email and new password are required.' })
    }

    if (!users[email]) {
        return res.json({ message: 'User not found.' })
    }

    if (!authVulnEnabled) {
        if (users[email] !== oldPassword) {
            return res.json({ message: 'Old password is incorrect. Text message to registered number sent.' })
        }
    }

    users[email] = newPassword
    // ovdje bi se ta šifra zapisala u bazu, ali ovo je samo demonstracija
    res.json({ message: 'Password successfully changed.' })
})


pool.connect()
    .then(() => console.log('Connected to the database!'))
    .catch(err => console.error('Connection error', err.stack))

// Pali mašinu
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
