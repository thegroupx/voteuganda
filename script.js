// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDRaq_j5SdX4Bc-AzuVvaGYU4zE7GRKMS8",
  authDomain: "vote-e5fad.firebaseapp.com",
  databaseURL: "https://vote-e5fad-default-rtdb.firebaseio.com",
  projectId: "vote-e5fad",
  storageBucket: "vote-e5fad.appspot.com",
  messagingSenderId: "350589656939",
  appId: "1:350589656939:web:5b844ff6c745169d6df62e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Candidate data
const candidates = [
  { id: 1, name: 'Mugisha Muntu', img: '/assets/vote/cand1.jpg', symbol: '/assets/vote/sym1.jpeg' },
  { id: 2, name: 'Nancy Kalembe', img: '/assets/vote/cand2.jpg', symbol: '/assets/vote/sym2.jpeg' },
  { id: 3, name: 'Nathan Nandala Mafabi', img: '/assets/vote/cand3.jpg', symbol: '/assets/vote/sym3.jpeg' },
  { id: 4, name: 'Robert Kyagulanyi Ssentamu', img: '/assets/vote/cand4.jpg', symbol: '/assets/vote/sym4.jpeg' },
  { id: 5, name: 'Yoweri Kaguta Museveni', img: '/assets/vote/cand5.jpg', symbol: '/assets/vote/sym5.jpeg' }
];
const form = document.getElementById('ballotForm');
const submitBtn = document.getElementById('submitBtn');
const statusEl = document.getElementById('status');
const resultsBox = document.getElementById('results');
const resultsList = document.getElementById('resultsList');

// Simple fingerprint
function getFingerprint() {
  return navigator.userAgent + screen.width + screen.height;
}

// Render candidates with fallback
function renderCandidates() {
  form.innerHTML = '';
  candidates.forEach(c => {
    const card = document.createElement('label');
    card.className = 'card bg-white shadow hover:shadow-md p-0 relative';
    card.innerHTML = `
      <div class="relative">
        <img src="${c.img}" class="candidate-img" 
             onerror="this.src='/assets/vote/fallback.png'" />
        <img src="${c.symbol}" class="symbol" 
             onerror="this.style.display='none'" />
      </div>
      <div class="p-4 flex items-center justify-between">
        <p class="font-semibold">${c.name}</p>
        <input type="radio" name="candidate" value="${c.id}" class="w-5 h-5" />
      </div>
    `;
    form.appendChild(card);
  });
}

renderCandidates();

// Enable submit button on selection
form.addEventListener('change', () => {
  submitBtn.disabled = !document.querySelector('input[name="candidate"]:checked');
});

// Prevent multiple votes per device
if (localStorage.getItem('ballot_voted') === '1') {
  submitBtn.disabled = true;
  statusEl.textContent = 'You have already voted on this device.';
}

// Submit vote
submitBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="candidate"]:checked');
  if (!selected) return;

  submitBtn.disabled = true;
  statusEl.textContent = 'Submitting your vote...';

  const candidateId = selected.value;
  const fp = getFingerprint();

  const voteRef = db.ref('votes/' + candidateId + '/' + fp);
  voteRef.set(true)
    .then(() => {
      localStorage.setItem('ballot_voted', '1');
      statusEl.textContent = '✅ Vote recorded. Thank you!';
      loadResults();
    })
    .catch(err => {
      submitBtn.disabled = false;
      statusEl.textContent = '❌ ' + err.message;
    });
});

// Load results
function loadResults() {
  db.ref('votes').once('value').then(snapshot => {
    const votes = snapshot.val() || {};
    resultsList.innerHTML = '';

    candidates.forEach(c => {
      let count = votes[c.id] ? Object.keys(votes[c.id]).length : 0;

      const li = document.createElement('li');
      li.className = 'bg-white rounded-xl p-3 shadow flex items-center justify-between';

      li.innerHTML = `
        <span class="font-semibold text-blue-600">${c.name}</span>
        <span class="text-gray-800">${count} votes</span>
      `;

      resultsList.appendChild(li);
    });

    resultsBox.classList.remove('hidden');
  });
}
// View results button
document.getElementById('viewResults').addEventListener('click', loadResults);

// Initial results load
loadResults();