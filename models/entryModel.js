const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    topicName: {
        type: String,
        required: true,
        trim: true
    },
    // Storing questions as an array of strings
    questions: {
        type: [String],
        default: []
    },
    // For theory topics, like the W3Schools link
    referenceLink: {
        type: String,
        trim: true
    },
    dateStudied: {
        type: Date,
        default: Date.now
    },
    memoryStrength: {
        type: String,
        enum: ['Weak', 'Medium', 'Strong', 'New'], // Pre-defined possible values
        default: 'New'
    },
    // We can add a last revised date to improve revision logic later
    lastRevised: {
        type: Date
    }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;