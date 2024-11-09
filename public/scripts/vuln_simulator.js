// vuln_simulator.js

document.addEventListener("DOMContentLoaded", function() {
    console.log("Loaded script")
    const searchButton = document.querySelector(".secondary-button")
    const sqlVulnToggleButton = document.getElementById("sql-vuln-toggle")
    const authVulnToggleButton = document.getElementById("auth-vuln-toggle")
    
    const searchResults = document.getElementById("search-results")
    const searchInput = document.getElementById("movie-search")

    const submitButton = document.getElementById('submit-password-change')
    const changeResult = document.getElementById('change-result')

    const form = document.querySelector('.vuln-demo-playground-header form');

    let sqlVulnEnabled = true
    let authVulnEnabled = true

    // Toggle vulnerability status
    sqlVulnToggleButton.addEventListener("click", function() {
        sqlVulnEnabled = !sqlVulnEnabled
        sqlVulnToggleButton.textContent = sqlVulnEnabled ? "Isključi ranjivost" : "Uključi ranjivost"

        if (sqlVulnEnabled) {
            sqlVulnToggleButton.classList.add('vuln-on')
        } else {
            sqlVulnToggleButton.classList.remove('vuln-on')
        }
    })

    authVulnToggleButton.addEventListener("click", function() {
        authVulnEnabled = !authVulnEnabled
        authVulnToggleButton.textContent = authVulnEnabled ? "Isključi ranjivost" : "Uključi ranjivost"

        if (authVulnEnabled) {
            authVulnToggleButton.classList.add('vuln-on')
        } else {
            authVulnToggleButton.classList.remove('vuln-on')
        }
    })

    // Dohvati 
    async function fetchSearchResults(query) {
        try {
            console.log("Fetching results now!")
            const response = await fetch("/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, sqlVulnEnabled })
            })

            const data = await response.json()
            
            searchResults.innerHTML = ""
            data.results.forEach(result => {
                const listItem = document.createElement("li")
                listItem.textContent = result
                searchResults.appendChild(listItem)
            })
        } catch (error) {
            console.error("Error fetching search results:", error)
        }
    }


    searchButton.addEventListener("click", function() {
        const queryText = searchInput.value

        let query
        if (sqlVulnEnabled) {
            // Nesigurni upit
            query = `SELECT tracktitle FROM track NATURAL JOIN movie WHERE tracktitle ILIKE '%${queryText}%' LIMIT 20` 
        } else {
            query = queryText
        }

        fetchSearchResults(query)
    })

    submitButton.addEventListener('click', async () => {
        const email = document.getElementById('email').value
        const oldPassword = document.getElementById('old-password').value
        const newPassword = document.getElementById('new-password').value
    
        try {
            const response = await fetch('/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, oldPassword, newPassword, authVulnEnabled })
            })
            const result = await response.json()
            changeResult.textContent = result.message
        } catch (error) {
            changeResult.textContent = 'An error occurred while attempting to change the password.'
        }
    })

})
