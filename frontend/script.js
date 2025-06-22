document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api/entries';

    const form = document.getElementById('add-entry-form');
    const dashboard = document.getElementById('dashboard');
    const getSurpriseBtn = document.getElementById('get-surprise-btn');
    const surpriseArea = document.getElementById('surprise-area');
    let currentSurpriseEntryId = null; 

    // --- 1. FETCH AND DISPLAY ALL ENTRIES ---
    const fetchEntries = async () => {
        try {
            const response = await fetch(API_URL);
            const entries = await response.json();
            
            dashboard.innerHTML = ''; 
            if (entries.length === 0) {
                dashboard.innerHTML = '<p>No study entries yet. Add one to get started!</p>';
                return;
            }

            entries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('entry');

                const daysSinceStudied = (new Date() - new Date(entry.dateStudied)) / (1000 * 60 * 60 * 24);
                let revisionBadge = '';
                if (daysSinceStudied > 2 && entry.memoryStrength !== 'Strong' && entry.memoryStrength !== 'New') {
                    revisionBadge = '<span class="revision-badge">Revision Due!</span>';
                }

                // Add class based on memory strength for the left border color
                entryDiv.classList.add(`strength-${entry.memoryStrength.toLowerCase()}`);

                entryDiv.innerHTML = `
                    <h3>
                        <span>${entry.topicName}</span>
                        ${revisionBadge}
                    </h3>
                    <p class="entry-meta">
                        <span><i class="fas fa-calendar-alt"></i> Studied on: ${new Date(entry.dateStudied).toLocaleDateString()}</span> | 
                        <span><i class="fas fa-brain"></i> Strength: <strong>${entry.memoryStrength}</strong></span>
                    </p>
                    ${entry.questions.length > 0 ? `<p><i class="fas fa-question-circle"></i> <strong>Questions:</strong> ${entry.questions.join(', ')}</p>` : ''}
                    ${entry.referenceLink ? `<p><i class="fas fa-link"></i> <strong>Reference:</strong> <a href="${entry.referenceLink}" target="_blank">View Resource</a></p>` : ''}
                `;
                dashboard.appendChild(entryDiv);
            });
        } catch (error) {
            console.error('Error fetching entries:', error);
            dashboard.innerHTML = '<p style="color: #ff6b6b;">Could not load entries. Is the server running?</p>';
        }
    };

    // --- 2. HANDLE FORM SUBMISSION TO ADD NEW ENTRY ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const newEntry = {
            topicName: document.getElementById('topic-name').value,
            questions: document.getElementById('questions').value,
            referenceLink: document.getElementById('reference-link').value
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
            });
            form.reset();
            fetchEntries(); 
        } catch (error) {
            console.error('Error adding entry:', error);
            alert('Failed to add entry.');
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Save Entry';
        }
    });

    // --- 3. HANDLE SURPRISE REVISION ---
    getSurpriseBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/surprise`);
            if (!response.ok) {
                const err = await response.json();
                alert(err.message);
                return;
            }
            const data = await response.json();
            document.getElementById('surprise-topic').textContent = data.topic;
            document.getElementById('surprise-question').textContent = data.question;
            currentSurpriseEntryId = data.entryId;
            surpriseArea.classList.remove('hidden');
        } catch (error) {
            console.error('Error getting surprise question:', error);
        }
    });
    
    // --- 4. HANDLE MEMORY STRENGTH UPDATE ---
    surpriseArea.addEventListener('click', async (e) => {
        if (e.target.closest('.strength-btn')) {
            const button = e.target.closest('.strength-btn');
            const strength = button.dataset.strength;
            if (!currentSurpriseEntryId) return;

            try {
                await fetch(`${API_URL}/${currentSurpriseEntryId}/strength`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ strength })
                });

                surpriseArea.classList.add('hidden');
                currentSurpriseEntryId = null;
                fetchEntries(); 
            } catch (error) {
                console.error('Error updating strength:', error);
            }
        }
    });

    // Initial fetch of entries when the page loads
    fetchEntries();
});