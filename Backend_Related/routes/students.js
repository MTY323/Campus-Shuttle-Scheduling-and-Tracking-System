const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all students
router.get('/', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students ORDER BY id ASC');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new student
router.post('/', async (req, res) => {
    try {
        const { student_id, name } = req.body;
        const [result] = await db.query(
            'INSERT INTO students (id, name, status) VALUES (?, ?, ?)',
            [student_id, name, 'active']
        );
        res.status(201).json({ message: 'Student added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student requests
router.post('/requests', async (req, res) => {
    try {
        const { student_id, route_id, route_name } = req.body;
        
        // Check if student already has a waiting request for this route
        const [existing] = await db.query(
            'SELECT * FROM student_requests WHERE student_id = ? AND route_name = ? AND status = "waiting"',
            [student_id, route_name]
        );
        
        if (existing.length > 0) {
            return res.status(200).json({ message: 'Request already exists', request_id: existing[0].request_id });
        }
        
        const [result] = await db.query(
            'INSERT INTO student_requests (student_id, route_id, route_name, status) VALUES (?, ?, ?, ?)',
            [student_id, route_id, route_name, 'waiting']
        );
        res.status(201).json({ message: 'Request submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Change student password
router.post('/change-password', async (req, res) => {
    try {
        const { student_id, currentPassword, newPassword } = req.body;

        // 1. Check if student exists and verify current password
        // Note: In a production app, use bcrypt to compare hashed passwords
        const [students] = await db.query(
            'SELECT * FROM students WHERE id = ? AND password = ?', 
            [student_id, currentPassword]
        );

        if (students.length === 0) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // 2. Update to new password
        await db.query(
            'UPDATE students SET password = ? WHERE id = ?',
            [newPassword, student_id]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get student requests
router.get('/requests', async (req, res) => {
    try {
        const [requests] = await db.query('SELECT * FROM student_requests WHERE status = "waiting"');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { student_id, name, status } = req.body;
        
        // Build update query dynamically based on provided fields
        let updateFields = [];
        let values = [];
        
        if (student_id !== undefined) {
            updateFields.push('id = ?');
            values.push(student_id);
        }
        if (name !== undefined) {
            updateFields.push('name = ?');
            values.push(name);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            values.push(status);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        values.push(req.params.id);
        
        await db.query(
            `UPDATE students SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
