const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the 'public' directory

// Endpoint to save quiz results
app.post('/saveResult', (req, res) => {
    const result = req.body;
    const filePath = path.join(__dirname, 'results.json');

    // Read existing results
    fs.readFile(filePath, 'utf8', (err, data) => {
        let results = [];
        if (!err && data) {
            results = JSON.parse(data);
        }

        // Add new result
        results.push(result);

        // Write updated results back to file
        fs.writeFile(filePath, JSON.stringify(results, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving result');
            }
            res.send('Result saved successfully');
        });
    });
});

// Serve the review.html file
app.get('/review', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/review.html'));
});

// Endpoint to get results
app.get('/getResults', (req, res) => {
    const filePath = path.join(__dirname, 'results.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error loading results');
        }
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
