const express = require('express');
const Entry = require('../models/entryModel');
const router = express.Router();

// POST: Add a new study entry
router.post('/', async (req, res) => {
    try {
        const { topicName, questions, referenceLink } = req.body;
        // Split questions string into an array, trimming whitespace
        const questionsArray = questions.split(',').map(q => q.trim()).filter(q => q);

        const newEntry = new Entry({
            topicName,
            questions: questionsArray,
            referenceLink
        });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(400).json({ message: 'Error adding entry', error });
    }
});

// GET: Get all study entries
router.get('/', async (req, res) => {
    try {
        const entries = await Entry.find().sort({ dateStudied: -1 }); // Newest first
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching entries', error });
    }
});

// GET: Get a random question for a "Surprise Revision"
router.get('/surprise', async (req, res) => {
    try {
        // Find all entries that have at least one question
        const entriesWithQuestions = await Entry.find({ 'questions.0': { $exists: true } });
        if (entriesWithQuestions.length === 0) {
            return res.status(404).json({ message: 'No questions found to revise.' });
        }
        
        // Pick a random entry
        const randomEntry = entriesWithQuestions[Math.floor(Math.random() * entriesWithQuestions.length)];
        // Pick a random question from that entry
        const randomQuestion = randomEntry.questions[Math.floor(Math.random() * randomEntry.questions.length)];

        res.status(200).json({
            question: randomQuestion,
            topic: randomEntry.topicName,
            entryId: randomEntry._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching surprise question', error });
    }
});

// PUT: Update the memory strength of an entry
router.put('/:id/strength', async (req, res) => {
    try {
        const { strength } = req.body; // Expect 'Weak', 'Medium', or 'Strong'
        const updatedEntry = await Entry.findByIdAndUpdate(
            req.params.id,
            { memoryStrength: strength, lastRevised: Date.now() },
            { new: true } // Return the updated document
        );
        res.status(200).json(updatedEntry);
    } catch (error) {
        res.status(400).json({ message: 'Error updating strength', error });
    }
});


module.exports = router;