const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all coordinators
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM coordinators ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new coordinator
router.post('/', async (req, res) => {
    try {
        const { id, name } = req.body;
        const defaultPassword = 'coord123'; // Define your default here
        await db.query(
            'INSERT INTO coordinators (id, name, status, password) VALUES (?, ?, ?, ?)',
            [id, name, 'active', defaultPassword]
        );
        res.status(201).json({ message: 'Coordinator added with default password: ' + defaultPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete coordinator
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM coordinators WHERE id = ?', [req.params.id]);
        res.json({ message: 'Coordinator deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// routes/coordinators.js
router.put('/:id', async (req, res) => {
    try {
        const { id, name } = req.body;
        const oldId = req.params.id;
        
        await db.query(
            'UPDATE coordinators SET id = ?, name = ? WHERE id = ?',
            [id, name, oldId]
        );
        res.json({ message: 'Coordinator updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;