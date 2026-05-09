const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Read data from JSON file safely
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Create the file with an empty array if it doesn't exist
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        // Handle cases where the file might be empty or corrupted
        return JSON.parse(rawData || "[]"); 
    } catch (err) {
        console.error("Error reading from data.json:", err);
        return [];
    }
};

// Helper: Write data to JSON file
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to data.json:", err);
    }
};

// --- API ROUTES ---

// 1. Root Route
app.get('/', (req, res) => {
    res.send("TrackWise Full-Stack Backend is Running!");
});

// 2. GET: Fetch all transactions
app.get('/api/transactions', (req, res) => {
    const transactions = readData();
    console.log(`Fetched ${transactions.length} transactions`);
    res.json(transactions);
});

// 3. POST: Add a new transaction (Preserves existing data)
app.post('/api/transactions', (req, res) => {
    const existingTransactions = readData();
    
    const newTx = { 
        ...req.body, 
        id: Date.now() // Unique ID
    };

    // Merge new transaction with the old list
    const updatedList = [newTx, ...existingTransactions];
    
    writeData(updatedList);
    console.log("New transaction saved successfully!");
    res.status(201).json(newTx);
});

// 4. DELETE: Remove a transaction
app.delete('/api/transactions/:id', (req, res) => {
    const existingTransactions = readData();
    const idToDelete = parseInt(req.params.id);
    
    const filteredList = existingTransactions.filter(t => t.id !== idToDelete);
    
    writeData(filteredList);
    console.log(`Deleted transaction with ID: ${idToDelete}`);
    res.json({ message: "Transaction deleted successfully" });
});

// Start Server
app.listen(PORT, () => {
    console.log('-----------------------------------------');
    console.log(`TrackWise Backend Active`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log('-----------------------------------------');
});