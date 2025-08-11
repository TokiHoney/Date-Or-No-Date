// Editable pairs
let pairs = [
  { date: "McDonald’s Feast Date", chore: "You have to sweep the kitchen first." },
  { date: "Wendy’s Crispy Chicken Night", chore: "You have to wear an apron for the rest of the day." },
  { date: "Taco Bell Fiesta Run", chore: "You must clean out the car first." },
  { date: "Taco John’s Snack Attack", chore: "You have to vacuum the living room right now." },
  { date: "Burger King Crown Night", chore: "You have to give the other person a 10-minute massage first." },
  { date: "Jimmy John’s Sub Picnic", chore: "You have to fetch snacks/drinks for the other person for the rest of the day." },
  { date: "Culver’s ButterBurger & Frozen Custard Date", chore: "You must make the bed perfectly first." },
  { date: "Magnolia Café Breakfast Date (Exira)", chore: "You must be the other person’s butler for 5 minutes." },
  { date: "Farmers Market Snack Stop (Atlantic or Guthrie Center)", chore: "You must make a silly TikTok together before you leave." },
  { date: "Honey Creek Smokehouse BBQ Night (Council Bluffs)", chore: "You must fold all the laundry in the basket first." },
  { date: "La Casa Pizza & Movie Night (Atlantic)", chore: "You have to sing a song dramatically in the living room." },
  { date: "Roadside Picnic at Lake Manawa", chore: "You have to do the dishes tonight." },
  { date: "Ice Cream Date at Frosty Treat (Carroll)", chore: "You have to sweep the kitchen first." },
  { date: "Home Blanket Fort Movie Night", chore: "You must clean out the car first." },
  { date: "Game Night at Home", chore: "You must give the other person a 10-minute massage first." },
  { date: "Bowling & Burgers Night at The Alley (Atlantic)", chore: "You must vacuum the living room first." },
  { date: "Fast Food Three-Stop Challenge (Choose any 3 chains nearby)", chore: "You must make the bed perfectly first." },
  { date: "Mystery Drive Date", chore: "You must wear an apron for the rest of the day." },
  { date: "Road Trip Fast-Food Crawl", chore: "You must be the other person’s butler for 5 minutes." },
  { date: "Taco Bell Midnight Run", chore: "You must fetch snacks/drinks for the other person for the rest of the day." },
  { date: "Mini Road Trip Adventure (within 80 miles)", chore: "You have to fold all the laundry first." },
  { date: "Sonic Drive-In Treat Stop", chore: "You must make a silly TikTok together before you start." },
  { date: "Dessert-Only Date at a Local Bakery (The Sweet Escape in Atlantic)", chore: "You must do the dishes tonight." },
  { date: "Casino & Buffet Night at Rhythm City Casino (Davenport)", chore: "You must sing a song dramatically before you can go." },
];

// Shuffle array function (Fisher-Yates)
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// --- DOM Elements ---
const container = document.getElementById('cards-container');
const info = document.getElementById('game-info');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupDesc = document.getElementById('popup-desc');
const popupButtons = document.getElementById('popup-buttons');
const listBtn = document.getElementById('toggle-list-btn');
const listContainer = document.getElementById('list-container');
const listBody = document.getElementById('list-body');

// --- Game State Variables ---
let chosenBoxIndex = null;
let openedBoxesCount = 0;
let pairsThisRound = [];
const totalBoxes = 24; // Keep this consistent with your list length
const boxesToOpen = totalBoxes - 2; // How many boxes to open before swap prompt

// --- Main Game Functions ---

// Function to start or restart the game
function setupGame() {
  // Reset state
  chosenBoxIndex = null;
  openedBoxesCount = 0;
  container.innerHTML = ''; // Clear old boxes
  listBody.innerHTML = ''; // Clear old list
  info.textContent = 'Pick one box to keep your date.';
  popup.style.display = 'none';

  // Shuffle a new set of pairs for this round
  pairsThisRound = shuffle([...pairs]);

  // Build the boxes with numbers
  pairsThisRound.forEach((opt, i) => {
    // Create card element
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = i + 1;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Box ${i + 1}`);
    card.dataset.index = i;

    // Add event listeners
    card.addEventListener('click', () => onCardClick(i));
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCardClick(i);
      }
    });
    container.appendChild(card);
    
    // Populate the list for the "Show List" button
    const row = document.createElement('tr');
    row.innerHTML = `<td>${opt.date}</td><td>${opt.chore}</td>`;
    listBody.appendChild(row);
  });
}

// Handles clicking on a card
function onCardClick(index) {
  const card = container.children[index];
  if (card.classList.contains('disabled') || card.classList.contains('opened')) {
    return; // Ignore clicks on opened boxes
  }

  // First pick: choosing your box
  if (chosenBoxIndex === null) {
    chosenBoxIndex = index;
    card.classList.add('selected');
    info.textContent = `You chose box #${index + 1}. Now open ${boxesToOpen} other boxes.`;
    return;
  }
  
  // Cannot open your selected box
  if (index === chosenBoxIndex) {
    alert('This is your chosen box! You cannot open it now.');
    return;
  }
  
  // Open a box
  openBox(card, index);
  openedBoxesCount++;

  if (openedBoxesCount === boxesToOpen) {
    info.textContent = `All other boxes opened. Time to make a choice!`;
    showSwapOptions();
  } else {
    const remainingToOpen = boxesToOpen - openedBoxesCount;
    info.textContent = `You have ${remainingToOpen} more box(es) to open.`;
  }
}

// Reveals the content of a box
function openBox(card, index) {
  card.classList.add('opened', 'disabled');
  card.innerHTML = `
    <div class="date-title">${pairsThisRound[index].date}</div>
    <div class="chore-text">${pairsThisRound[index].chore}</div>
  `;
  card.setAttribute('aria-label', `Box ${index + 1} opened. It contained: ${pairsThisRound[index].date}.`);
  card.setAttribute('tabindex', '-1'); // Remove from tab order
}

// --- Popup and Final Choice Functions ---

// Shows the "Swap or Keep" popup
function showSwapOptions() {
  const cards = container.children;
  let otherBoxIndex = -1;
  // Find the one box that isn't opened and isn't the chosen one
  for (let i = 0; i < cards.length; i++) {
    if (i !== chosenBoxIndex && !cards[i].classList.contains('opened')) {
      otherBoxIndex = i;
      break;
    }
  }

  // Set up and display the popup
  popup.style.display = 'flex';
  popupTitle.textContent = 'Swap or Keep?';
  popupDesc.innerHTML = `
    Your chosen box is #${chosenBoxIndex + 1}.<br>
    The other unopened box is #${otherBoxIndex + 1}.<br>
    Do you want to <strong>SWAP</strong> your box for the other one?
  `;
  
  // Add Swap and Keep buttons
  popupButtons.innerHTML = `
    <button onclick="handleFinalChoice(true, ${otherBoxIndex})">Yes, Swap!</button>
    <button onclick="handleFinalChoice(false, ${chosenBoxIndex})">No, Keep It!</button>
  `;
}

// Handles the final decision
function handleFinalChoice(didSwap, finalIndex) {
  const finalPair = pairsThisRound[finalIndex];
  
  // Update popup to show the result
  popupTitle.textContent = 'Your Date Is...';
  popupDesc.innerHTML = `
    <div class="date-title" style="font-size: 1.5rem; margin-bottom: 1rem;">${finalPair.date}</div>
    <div class="chore-text" style="font-size: 1.1rem;">BUT... ${finalPair.chore}</div>
  `;
  
  // Change buttons to a single "Play Again" button
  popupButtons.innerHTML = `<button onclick="closePopup()">Play Again</button>`;
}

// Closes the popup and restarts the game
function closePopup() {
  popup.style.display = 'none';
  setupGame(); // Restart the game
}

// --- UI Toggles ---

// Toggle for the "Show/Hide List" button
listBtn.addEventListener('click', () => {
  const isHidden = listContainer.getAttribute('aria-hidden') === 'true';
  if (isHidden) {
    listContainer.style.display = 'block';
    listContainer.setAttribute('aria-hidden', 'false');
    listBtn.textContent = 'Hide Date & Chore List';
    listBtn.setAttribute('aria-expanded', 'true');
  } else {
    listContainer.style.display = 'none';
    listContainer.setAttribute('aria-hidden', 'true');
    listBtn.textContent = 'Show Date & Chore List';
    listBtn.setAttribute('aria-expanded', 'false');
  }
});

// --- Initial Game Start ---
setupGame();