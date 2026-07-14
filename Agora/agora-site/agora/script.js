const API_BASE = "http://127.0.0.1:8000";
/* ---------- Debate (debate.html) ---------- */
(function () {
  const qEl = document.getElementById("debateQ");
  if (!qEl) return;

  let currentDebateId = null;

  async function loadDebateResults() {
    if (!currentDebateId) return;

    try {
      const response = await fetch(
        `${API_BASE}/debates/${currentDebateId}/results`
      );

      if (!response.ok) {
        throw new Error("Debate results could not be loaded.");
      }

      const data = await response.json();
      renderResults(data);
    } catch (error) {
      console.error(error);
    }
  }

  function renderResults(data) {
    const total = data.total || 0;

    const agreePercent = total
      ? Math.round((data.agree / total) * 100)
      : 50;

    const disagreePercent = total
      ? 100 - agreePercent
      : 50;

    document.getElementById("barAgree").style.width =
      `${agreePercent}%`;

    document.getElementById("barDisagree").style.width =
      `${disagreePercent}%`;

    document.getElementById("pctAgree").textContent =
      `${agreePercent}% agree`;

    document.getElementById("pctDisagree").textContent =
      `${disagreePercent}% disagree`;

    document.getElementById("debateTally").textContent =
      `${total} votes cast`;
  }

  window.nextDebate = async function () {
    try {
      const response = await fetch(`${API_BASE}/debates/random`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Debate could not be loaded.");
      }

      const debate = await response.json();

      currentDebateId = debate.id;

      document.getElementById("debateTag").textContent =
        debate.tag;

      qEl.textContent =
        debate.question_text;

      document
        .querySelectorAll(".vote-btn")
        .forEach(button => button.classList.remove("picked"));

      await loadDebateResults();
    } catch (error) {
      console.error(error);
      qEl.textContent = "Debate question could not be loaded.";
    }
  };

  window.vote = async function (choice) {
    if (!currentDebateId) {
      alert("No debate question is selected.");
      return;
    }

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      alert("You must log in before voting.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/debates/${currentDebateId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            choice: choice
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Vote could not be submitted.");
        return;
      }

      document
        .querySelector(`.vote-btn.${choice}`)
        ?.classList.add("picked");

      renderResults(data);
    } catch (error) {
      console.error(error);
      alert("Backend connection failed.");
    }
  };

  window.nextDebate();
})();

/* ---------- This or That dice (dice.html) ---------- */
(function(){
  const diceBtn = document.getElementById('diceBtn');
  if(!diceBtn) return;

  const pairs = [
    {a:'Read the book first', b:'Watch the movie first'},
    {a:'Plot twist ending', b:'Slow-burn character arc'},
    {a:'Unreliable narrator', b:'Omniscient narrator'},
    {a:'Tragic ending', b:'Happy ending'},
    {a:'Practical effects', b:'CGI spectacle'},
    {a:'A series to binge', b:'A standalone story'},
    {a:'Antihero lead', b:'Reluctant hero'},
    {a:'Book club pick', b:'Movie night pick'},
  ];
  let picked = null;

  function pipLayout(n){
    const layouts = {
      1:[[12,12]],
      2:[[7,7],[17,17]],
      3:[[7,7],[12,12],[17,17]],
      4:[[7,7],[17,7],[7,17],[17,17]],
      5:[[7,7],[17,7],[12,12],[7,17],[17,17]],
      6:[[7,6],[17,6],[7,12],[17,12],[7,18],[17,18]],
    };
    return layouts[n];
  }
  window.rollDice = function(){
    diceBtn.classList.add('rolling');
    const n = Math.floor(Math.random()*6)+1;
    setTimeout(()=>{
      diceBtn.classList.remove('rolling');
      const face = document.getElementById('diceFace');
      const pips = pipLayout(n).map(p=>`<circle class="pip" cx="${p[0]}" cy="${p[1]}" r="1.6"/>`).join('');
      face.innerHTML = `<rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="var(--gold-dark)"/>${pips}`;
      const pair = pairs[Math.floor(Math.random()*pairs.length)];
      document.getElementById('totA').textContent = pair.a;
      document.getElementById('totB').textContent = pair.b;
      document.getElementById('totA').classList.remove('picked');
      document.getElementById('totB').classList.remove('picked');
      picked = null;
      document.getElementById('totResult').textContent = 'Pick a side.';
    }, 480);
  };
  window.pickTot = function(side){
    if(picked) return;
    picked = side;
    document.getElementById('tot'+(side==='a'?'A':'B')).classList.add('picked');
    document.getElementById('totResult').textContent = 'You picked. Roll again for a new pairing.';
  };
})();

/* ---------- Genre recommendation (recommend.html) ---------- */
(function(){
  const genreGrid = document.getElementById('genreGrid');
  if(!genreGrid) return;

  const genres = [
    {
      name:'Literary Fiction',
      items:[
        {book:'Norwegian Wood', bookNote:'Murakami on memory, loss, and youth in 1960s Tokyo.', film:'Lost in Translation', filmNote:'Quiet connection between two people out of place.'},
        {book:'The Remains of the Day', bookNote:'A butler reckons with duty and a life not lived.', film:'Call Me by Your Name', filmNote:'A slow, sun-drenched coming of age.'},
      ]
    },
    {
      name:'Mystery & Thriller',
      items:[
        {book:'Gone Girl', bookNote:'A marriage unravels, twist by twist.', film:'Se7en', filmNote:'A grim procession toward a gut-punch ending.'},
        {book:'The Silent Patient', bookNote:'A psychotherapist obsessed with a silent patient\u2019s secret.', film:'Shutter Island', filmNote:'A U.S. Marshal, an asylum, and a mind that can\u2019t be trusted.'},
      ]
    },
    {
      name:'Sci-Fi & Fantasy',
      items:[
        {book:'House of Leaves', bookNote:'A house that is bigger inside than out.', film:'Inception', filmNote:'Layers of dreams within dreams.'},
        {book:'The Name of the Wind', bookNote:'A legend telling his own story.', film:'The Lord of the Rings: The Fellowship of the Ring', filmNote:'A small group carries an impossible weight.'},
        {book:'Dune', bookNote:'Empire, ecology, and prophecy on a desert planet.', film:'Blade Runner 2049', filmNote:'A slow-burn future built on atmosphere.'},
      ]
    },
    {
      name:'Horror',
      items:[
        {book:'The Haunting of Hill House', bookNote:'A house that keeps its own counsel.', film:'Hereditary', filmNote:'Grief that curdles into something far worse.'},
        {book:'Bird Box', bookNote:'Survival when looking outside means death.', film:'A Quiet Place', filmNote:'Survival when a sound means death.'},
      ]
    },
    {
      name:'Romance',
      items:[
        {book:'Normal People', bookNote:'Two people who keep finding their way back to each other.', film:'Eternal Sunshine of the Spotless Mind', filmNote:'Love, memory, and the ache of losing both.'},
        {book:'Pride and Prejudice', bookNote:'Wit, pride, and a slow-earned romance.', film:'Amélie', filmNote:'Whimsical Parisian warmth and quiet courage.'},
      ]
    },
    {
      name:'Non-Fiction',
      items:[
        {book:'Sapiens', bookNote:'A sweeping account of how humans came to run the world.', film:'Free Solo', filmNote:'A real story told with documentary precision.'},
        {book:'Educated', bookNote:'A memoir of leaving a childhood behind to learn the world.', film:'The Social Network', filmNote:'Ambition, ego, and the cost of building something big.'},
      ]
    },
  ];

  let activeGenre = null;

  genres.forEach((g,i)=>{
    const card = document.createElement('button');
    card.className='genre-card';
    card.type='button';
    card.innerHTML = `<span class="gname">${g.name}</span><span class="gcount">${g.items.length} pairings</span>`;
    card.onclick = ()=>{
      document.querySelectorAll('.genre-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      activeGenre = g;
      showPairing(g);
    };
    genreGrid.appendChild(card);
  });

  function showPairing(g){
    const pick = g.items[Math.floor(Math.random()*g.items.length)];
    document.getElementById('recGenre').textContent = g.name;
    document.getElementById('recBook').textContent = pick.book;
    document.getElementById('recBookNote').textContent = pick.bookNote;
    document.getElementById('recFilm').textContent = pick.film;
    document.getElementById('recFilmNote').textContent = pick.filmNote;
    document.getElementById('recResult').classList.add('show');
    document.getElementById('recEmpty').style.display = 'none';
  }
  window.shufflePairing = function(){
    if(!activeGenre) return;
    showPairing(activeGenre);
  };
})();

/* ---------- Guess the Title (guess.html) ---------- */
(function(){
  const clueEl = document.getElementById('emojiClue');
  if(!clueEl) return;

  const questions = [
    {emoji:'🕷️🧑‍🎓🏙️', answer:'Spider-Man', type:'Film', decoys:['Batman','Iron Man','Daredevil']},
    {emoji:'🦁👑🐗', answer:'The Lion King', type:'Film', decoys:['Madagascar','Zootopia','The Jungle Book']},
    {emoji:'💍🌋🧙\u200d♂️', answer:'The Lord of the Rings', type:'Book', decoys:['The Hobbit','Eragon','The Chronicles of Narnia']},
    {emoji:'🦉⚡🧙', answer:'Harry Potter', type:'Book', decoys:['Percy Jackson','The Magicians','Artemis Fowl']},
    {emoji:'🕰️👧🐇', answer:'Alice in Wonderland', type:'Book', decoys:['Peter Pan','The Wizard of Oz','Coraline']},
    {emoji:'🚀🌌👨\u200d🚀', answer:'Interstellar', type:'Film', decoys:['Gravity','The Martian','Ad Astra']},
    {emoji:'🦖🏝️🧬', answer:'Jurassic Park', type:'Film', decoys:['King Kong','Godzilla','The Lost World']},
    {emoji:'🐋⚓📖', answer:'Moby-Dick', type:'Book', decoys:['Life of Pi','The Old Man and the Sea','Treasure Island']},
    {emoji:'🏚️👻📓', answer:'The Haunting of Hill House', type:'Book', decoys:['Dracula','The Shining','House of Leaves']},
    {emoji:'🔥📚🚒', answer:'Fahrenheit 451', type:'Book', decoys:['1984','Brave New World','The Giver']},
  ];

  let order = shuffle([...Array(questions.length).keys()]);
  let pos = 0;
  let score = 0;
  let attempted = 0;
  let answered = false;

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  function render(){
    const q = questions[order[pos]];
    answered = false;
    clueEl.textContent = q.emoji;
    document.getElementById('guessType').textContent = q.type;
    document.getElementById('guessCount').textContent = `Question ${pos+1} of ${questions.length}`;
    document.getElementById('scorePill').textContent = `${score} / ${attempted} correct`;
    document.getElementById('guessFeedback').textContent = 'Pick the title this emoji clue is hiding.';

    const options = shuffle([q.answer, ...q.decoys]);
    const grid = document.getElementById('optionGrid');
    grid.innerHTML = '';
    options.forEach(opt=>{
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.type = 'button';
      btn.textContent = opt;
      btn.onclick = ()=>checkAnswer(btn, opt, q.answer);
      grid.appendChild(btn);
    });
  }

  function checkAnswer(btn, chosen, answer){
    if(answered) return;
    answered = true;
    attempted++;
    const correct = chosen === answer;
    if(correct) score++;
    document.querySelectorAll('.option-btn').forEach(b=>{
      b.disabled = true;
      if(b.textContent === answer) b.classList.add('correct');
      else if(b === btn) b.classList.add('wrong');
    });
    document.getElementById('guessFeedback').textContent = correct
      ? 'Right — nicely spotted.'
      : `Not quite. It was "${answer}".`;
    document.getElementById('scorePill').textContent = `${score} / ${attempted} correct`;
  }

  window.nextGuess = function(){
    pos++;
    if(pos >= order.length){
      order = shuffle([...Array(questions.length).keys()]);
      pos = 0;
    }
    render();
  };
  render();
})();

/* ---------- Book-to-Film Bingo (bingo.html) ---------- */
(function(){
  const grid = document.getElementById('bingoGrid');
  if(!grid) return;

  const prompts = [
    'Read the book before seeing the film',
    'Watched the film before reading the book',
    'Found a movie that beat the book',
    'Spotted a scene invented for the screen',
    'Called an adaptation totally faithful',
    'Have a book you wish someone would adapt',
    'Read something being adapted this year',
    'Followed a classic across decades of adaptations',
    'Said the casting matched the book perfectly',
    'Watched a book turned into a series',
    'Enjoyed a YA novel turned into a movie',
    'Read a fantasy series with a screen version',
    'FREE',
    'Watched a nonfiction book turned documentary',
    'Debated an adaptation with a book club',
    'Noticed the ending changed on screen',
    'Compared two different film versions of one book',
    'Found extra plot worth in the deleted scenes',
    'Started reading because of the movie',
    'Put a book down because the film disappointed',
    'Followed a director known for adaptations',
    'Rewatched a childhood book-to-film favorite',
    'Recognized the tone nailed on screen',
    'Loved an animated adaptation',
    'Cheered when an adaptation won an award',
  ];

  const FREE_INDEX = 12;
  let marked = new Set([FREE_INDEX]);

  function render(){
    grid.innerHTML = '';
    prompts.forEach((text, i)=>{
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'bingo-cell' + (i===FREE_INDEX ? ' free' : '') + (marked.has(i) ? ' marked' : '');
      cell.textContent = text;
      cell.onclick = ()=>{
        if(i === FREE_INDEX) return;
        if(marked.has(i)) marked.delete(i); else marked.add(i);
        render();
      };
      grid.appendChild(cell);
    });
    checkBingo();
  }

  function checkBingo(){
    const lines = [];
    for(let r=0;r<5;r++) lines.push([0,1,2,3,4].map(c=>r*5+c));
    for(let c=0;c<5;c++) lines.push([0,1,2,3,4].map(r=>r*5+c));
    lines.push([0,6,12,18,24]);
    lines.push([4,8,12,16,20]);
    const hasBingo = lines.some(line=>line.every(idx=>marked.has(idx)));
    document.getElementById('bingoBanner').classList.toggle('show', hasBingo);
  }

  window.resetBingo = function(){
    marked = new Set([FREE_INDEX]);
    render();
  };
  render();
})();

/* ---------- Titles: shared dataset ---------- */
const AGORA_TITLES = [
  {id:'norwegian-wood', type:'book', title:'Norwegian Wood', genre:'Literary Fiction', blurb:'Murakami on memory, loss, and youth in 1960s Tokyo.', seedRating:4.3, seedCount:128},
  {id:'lost-in-translation', type:'film', title:'Lost in Translation', genre:'Literary Fiction', blurb:'Quiet connection between two people out of place in Tokyo.', seedRating:4.5, seedCount:212},
  {id:'remains-of-the-day', type:'book', title:'The Remains of the Day', genre:'Literary Fiction', blurb:'A butler reckons with duty and a life not lived.', seedRating:4.2, seedCount:96},
  {id:'call-me-by-your-name', type:'film', title:'Call Me by Your Name', genre:'Literary Fiction', blurb:'A slow, sun-drenched coming of age in northern Italy.', seedRating:4.4, seedCount:301},
  {id:'gone-girl', type:'book', title:'Gone Girl', genre:'Mystery & Thriller', blurb:'A marriage unravels, twist by twist.', seedRating:4.1, seedCount:410},
  {id:'se7en', type:'film', title:'Se7en', genre:'Mystery & Thriller', blurb:'A grim procession toward a gut-punch ending.', seedRating:4.6, seedCount:520},
  {id:'silent-patient', type:'book', title:'The Silent Patient', genre:'Mystery & Thriller', blurb:'A psychotherapist obsessed with a silent patient\u2019s secret.', seedRating:4.0, seedCount:275},
  {id:'shutter-island', type:'film', title:'Shutter Island', genre:'Mystery & Thriller', blurb:'A U.S. Marshal, an asylum, and a mind that can\u2019t be trusted.', seedRating:4.3, seedCount:398},
  {id:'house-of-leaves', type:'book', title:'House of Leaves', genre:'Sci-Fi & Fantasy', blurb:'A house that is bigger inside than out.', seedRating:4.2, seedCount:150},
  {id:'inception', type:'film', title:'Inception', genre:'Sci-Fi & Fantasy', blurb:'Layers of dreams within dreams.', seedRating:4.7, seedCount:610},
  {id:'name-of-the-wind', type:'book', title:'The Name of the Wind', genre:'Sci-Fi & Fantasy', blurb:'A legend telling his own story.', seedRating:4.5, seedCount:340},
  {id:'fellowship-of-the-ring', type:'film', title:'The Lord of the Rings: The Fellowship of the Ring', genre:'Sci-Fi & Fantasy', blurb:'A small group carries an impossible weight.', seedRating:4.8, seedCount:702},
  {id:'dune', type:'book', title:'Dune', genre:'Sci-Fi & Fantasy', blurb:'Empire, ecology, and prophecy on a desert planet.', seedRating:4.4, seedCount:288},
  {id:'blade-runner-2049', type:'film', title:'Blade Runner 2049', genre:'Sci-Fi & Fantasy', blurb:'A slow-burn future built on atmosphere.', seedRating:4.1, seedCount:245},
  {id:'haunting-of-hill-house', type:'book', title:'The Haunting of Hill House', genre:'Horror', blurb:'A house that keeps its own counsel.', seedRating:4.0, seedCount:132},
  {id:'hereditary', type:'film', title:'Hereditary', genre:'Horror', blurb:'Grief that curdles into something far worse.', seedRating:4.2, seedCount:290},
  {id:'bird-box', type:'book', title:'Bird Box', genre:'Horror', blurb:'Survival when looking outside means death.', seedRating:3.8, seedCount:180},
  {id:'a-quiet-place', type:'film', title:'A Quiet Place', genre:'Horror', blurb:'Survival when a sound means death.', seedRating:4.3, seedCount:410},
  {id:'normal-people', type:'book', title:'Normal People', genre:'Romance', blurb:'Two people who keep finding their way back to each other.', seedRating:4.2, seedCount:220},
  {id:'eternal-sunshine', type:'film', title:'Eternal Sunshine of the Spotless Mind', genre:'Romance', blurb:'Love, memory, and the ache of losing both.', seedRating:4.6, seedCount:380},
  {id:'pride-and-prejudice', type:'book', title:'Pride and Prejudice', genre:'Romance', blurb:'Wit, pride, and a slow-earned romance.', seedRating:4.5, seedCount:410},
  {id:'amelie', type:'film', title:'Amélie', genre:'Romance', blurb:'Whimsical Parisian warmth and quiet courage.', seedRating:4.4, seedCount:355},
  {id:'sapiens', type:'book', title:'Sapiens', genre:'Non-Fiction', blurb:'A sweeping account of how humans came to run the world.', seedRating:4.3, seedCount:502},
  {id:'free-solo', type:'film', title:'Free Solo', genre:'Non-Fiction', blurb:'A real story told with documentary precision.', seedRating:4.7, seedCount:340},
  {id:'educated', type:'book', title:'Educated', genre:'Non-Fiction', blurb:'A memoir of leaving a childhood behind to learn the world.', seedRating:4.6, seedCount:466},
  {id:'social-network', type:'film', title:'The Social Network', genre:'Non-Fiction', blurb:'Ambition, ego, and the cost of building something big.', seedRating:4.3, seedCount:389},
];

function starString(rating){
  const full = Math.round(rating);
  let out = '';
  for(let i=1;i<=5;i++) out += `<span class="${i<=full?'':'dim'}">★</span>`;
  return out;
}

/* ---------- Titles: browse grid (titles.html) ---------- */
(function(){
  const grid = document.getElementById('titleGrid');
  if(!grid) return;

  const typeFilterRow = document.getElementById('typeFilter');
  const genreFilterRow = document.getElementById('genreFilter');
  let activeType = 'all';
  let activeGenre = 'all';

  const genres = ['all', ...new Set(AGORA_TITLES.map(t=>t.genre))];

  ['all','book','film'].forEach(t=>{
    const chip = document.createElement('button');
    chip.className = 'chip' + (t==='all' ? ' active' : '');
    chip.type = 'button';
    chip.textContent = t==='all' ? 'All types' : (t==='book' ? 'Books' : 'Films');
    chip.onclick = ()=>{
      activeType = t;
      typeFilterRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      render();
    };
    typeFilterRow.appendChild(chip);
  });

  genres.forEach(g=>{
    const chip = document.createElement('button');
    chip.className = 'chip' + (g==='all' ? ' active' : '');
    chip.type = 'button';
    chip.textContent = g==='all' ? 'All genres' : g;
    chip.onclick = ()=>{
      activeGenre = g;
      genreFilterRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      render();
    };
    genreFilterRow.appendChild(chip);
  });

  function render(){
    grid.innerHTML = '';
    const filtered = AGORA_TITLES.filter(t=>
      (activeType==='all' || t.type===activeType) &&
      (activeGenre==='all' || t.genre===activeGenre)
    );
    if(filtered.length === 0){
      grid.innerHTML = '<p class="review-empty">Nothing matches those filters yet.</p>';
      return;
    }
    filtered.forEach(t=>{
      const card = document.createElement('a');
      card.className = 'title-card';
      card.href = `title.html?id=${t.id}`;
      card.innerHTML = `
        <span class="title-type">${t.type}</span>
        <h3>${t.title}</h3>
        <span class="genre-tag">${t.genre}</span>
        <p>${t.blurb}</p>
        <span class="rating-line"><span class="stars">${starString(t.seedRating)}</span> ${t.seedRating.toFixed(1)} · ${t.seedCount} ratings</span>
      `;
      grid.appendChild(card);
    });
  }
  render();
})();

/* ---------- Titles: detail page (title.html) ---------- */
(function(){
  const detailEl = document.getElementById('titleDetail');
  if(!detailEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const item = AGORA_TITLES.find(t=>t.id===id) || AGORA_TITLES[0];

  const seedReviews = [
    {stars:5, text:'Exactly what I needed this month \u2014 could not put it down.'},
    {stars:4, text:'Strong start, and the ending stuck with me for days.'},
  ];
  let reviews = seedReviews.slice();
  let totalRating = item.seedRating * item.seedCount;
  let totalCount = item.seedCount;
  let selectedStars = 0;

  document.getElementById('titleType').textContent = item.type;
  document.getElementById('titleName').textContent = item.title;
  document.getElementById('titleGenre').textContent = item.genre;
  document.getElementById('titleBlurb').textContent = item.blurb;

  function renderSummary(){
    const avg = totalRating / totalCount;
    document.getElementById('avgStars').innerHTML = starString(avg);
    document.getElementById('avgNum').textContent = avg.toFixed(1);
    document.getElementById('ratingCount').textContent = totalCount + ' ratings';
  }
  function renderReviews(){
    const list = document.getElementById('reviewList');
    list.innerHTML = '';
    reviews.slice().reverse().forEach(r=>{
      const el = document.createElement('div');
      el.className = 'review-item';
      el.innerHTML = `<span class="stars">${starString(r.stars)}</span><p>${r.text}</p>`;
      list.appendChild(el);
    });
  }

  const starInput = document.getElementById('starInput');
  for(let i=1;i<=5;i++){
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '★';
    b.onclick = ()=>{
      selectedStars = i;
      starInput.querySelectorAll('button').forEach((btn,idx)=>{
        btn.classList.toggle('filled', idx < i);
      });
    };
    starInput.appendChild(b);
  }

  window.submitFeedback = function(e){
    e.preventDefault();
    if(selectedStars===0){
      document.getElementById('feedbackHint').textContent = 'Pick a star rating first.';
      return;
    }
    const text = document.getElementById('feedbackText').value.trim() || 'No comment left.';
    reviews.push({stars:selectedStars, text});
    totalRating += selectedStars;
    totalCount += 1;
    renderSummary();
    renderReviews();
    document.getElementById('feedbackForm').reset();
    starInput.querySelectorAll('button').forEach(btn=>btn.classList.remove('filled'));
    selectedStars = 0;
    document.getElementById('feedbackHint').textContent = 'Thanks \u2014 your rating updated the average above.';
  };

  renderSummary();
  renderReviews();
})();

/* ---------- Register (register.html) ---------- */
(function(){
  const form = document.getElementById('registerForm');
  if(!form) return;
  window.submitRegister = function(e){
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    form.style.display='none';
    document.getElementById('successMsg').textContent = `${name || 'Your account'} is registered. This is a front-end demo \u2014 wire it to your backend to persist it.`;
    document.getElementById('registerSuccess').classList.add('show');
  };
})();

/* ---------- Tickets (tickets.html) ---------- */
(function(){
  const list = document.getElementById('ticketList');
  if(!list) return;
  let count = 0;
  window.submitTicket = function(e){
    e.preventDefault();
    count++;
    const subject = document.getElementById('tkSubject').value.trim();
    const category = document.getElementById('tkCategory').value;
    const id = 'TCK-' + String(1000+count);
    const el = document.createElement('div');
    el.className='ticket';
    el.innerHTML = `
      <div class="ticket-main">
        <span class="ticket-id">${id}</span>
        <span class="ticket-subject">${subject}</span>
        <span class="ticket-meta">${category} \u00b7 just now</span>
      </div>
      <span class="status open" onclick="cycleStatus(this)">Open</span>
    `;
    list.prepend(el);
    e.target.reset();
  };
  window.cycleStatus = function(el){
    const order = ['open','progress','resolved'];
    const labels = {open:'Open', progress:'In progress', resolved:'Resolved'};
    const current = order.find(o=>el.classList.contains(o));
    const next = order[(order.indexOf(current)+1) % order.length];
    el.classList.remove(current);
    el.classList.add(next);
    el.textContent = labels[next];
  };
})();
