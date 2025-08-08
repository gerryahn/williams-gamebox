
(function(){
  const board = document.getElementById('game');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const btn = document.getElementById('btnStart');

  let score = 0, time = 60, timer = null, currentAnswer = null;

  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

  function newRound(){
    // Generate an easy equation (addition or subtraction)
    const op = Math.random()<0.5 ? '+' : '-';
    let a = randInt(1, 20), b = randInt(1, 20);
    if (op==='-' && b>a) [a,b] = [b,a];
    const ans = op==='+' ? a+b : a-b;
    currentAnswer = ans;

    const choices = new Set([ans]);
    while(choices.size<9){
      choices.add(ans + randInt(-10, 10));
    }
    const list = Array.from(choices).sort(()=>Math.random()-0.5);

    board.innerHTML = '';
    const eq = document.createElement('div');
    eq.id = 'equation';
    eq.textContent = `${a} ${op} ${b} = ?`;
    board.appendChild(eq);

    const grid = document.createElement('div');
    grid.className = 'grid';
    list.forEach((val, idx)=>{
      const t = document.createElement('button');
      t.className = 'tile';
      t.type = 'button';
      t.textContent = String(val);
      t.setAttribute('aria-label', `Answer ${val}`);
      t.addEventListener('click', ()=> choose(val, t));
      // Keyboard shortcuts 1-9
      t.dataset.key = (idx+1).toString();
      grid.appendChild(t);
    });
    board.appendChild(grid);
  }

  function choose(val, el){
    if (val===currentAnswer){
      score += 10; flash(el, 'correct');
    } else {
      score = Math.max(0, score-5); flash(el, 'wrong');
    }
    scoreEl.textContent = score;
    setTimeout(newRound, 250);
  }

  function flash(el, cls){
    el.classList.add(cls);
    setTimeout(()=> el.classList.remove(cls), 250);
  }

  function start(){
    if (timer) return;
    score = 0; time = 60; scoreEl.textContent = '0'; timeEl.textContent = '60';
    newRound();
    timer = setInterval(()=>{
      time -= 1; timeEl.textContent = time;
      if (time<=0){ stop(); alert(`Time! Your score: ${score}`); }
    }, 1000);
  }
  function stop(){ clearInterval(timer); timer = null; }

  btn.addEventListener('click', start);

  // Keyboard shortcuts: 1..9 to select tiles
  window.addEventListener('keydown', (e)=>{
    if (e.key>='1' && e.key<='9'){
      const tile = board.querySelector(`.tile[data-key="${e.key}"]`);
      if (tile) tile.click();
    }
    if (e.key==='Enter' && !timer) start();
  });
})();
