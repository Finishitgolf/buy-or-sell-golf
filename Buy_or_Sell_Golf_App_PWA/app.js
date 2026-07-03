let players = ["Player 1","Player 2","Player 3","Player 4"];
let scores = Array.from({length:18},()=>Array(4).fill(""));

function $(id){ return document.getElementById(id); }

function savePlayers(){
  players = [0,1,2,3].map(i => $("p"+i).value || `Player ${i+1}`);
  renderScoreGrid();
  renderMarketSelects();
  renderBankrolls();
  updateStandings();
}

function renderScoreGrid(){
  const grid = $("scoreGrid");
  grid.innerHTML = "";
  const header = document.createElement("div");
  header.className="score-row header";
  header.innerHTML = `<div>Hole</div>${players.map(p=>`<div>${p}</div>`).join("")}`;
  grid.appendChild(header);
  for(let h=0; h<18; h++){
    const row = document.createElement("div");
    row.className="score-row";
    row.innerHTML = `<div>${h+1}</div>` + players.map((p,i)=>`<input inputmode="numeric" data-h="${h}" data-p="${i}" value="${scores[h][i] || ""}">`).join("");
    grid.appendChild(row);
  }
  grid.querySelectorAll("input").forEach(inp=>{
    inp.addEventListener("input", e=>{
      scores[+e.target.dataset.h][+e.target.dataset.p]=e.target.value;
    });
  });
}

function totalsThrough(holeCount=18){
  return players.map((p,i)=>{
    let total=0, played=0;
    for(let h=0; h<holeCount; h++){
      const v=parseInt(scores[h][i],10);
      if(!isNaN(v)){ total+=v; played++; }
    }
    return {name:p,total,played,index:i};
  }).sort((a,b)=> a.total-b.total);
}

function handicapBonus(rank){
  return rank; // rank 0=>0, 1=>1, 2=>2, 3=>3
}

function latestWindow(){
  let maxHole=0;
  for(let h=0; h<18; h++){
    if(scores[h].some(v=>v!=="")) maxHole=h+1;
  }
  return [15,12,9,6,3].find(w=>maxHole>=w) || 3;
}

function updateStandings(){
  const windowHole = latestWindow();
  const standings = totalsThrough(windowHole);
  let html = `<h3>Standings Through Hole ${windowHole}</h3><table class="table"><tr><th>Rank</th><th>Player</th><th>Total</th><th>Bonus</th></tr>`;
  standings.forEach((s,rank)=>{
    html += `<tr><td>${rank+1}</td><td>${s.name}</td><td>${s.played? s.total : "-"}</td><td>${handicapBonus(rank)} stroke${handicapBonus(rank)==1?"":"s"}</td></tr>`;
  });
  html += `</table><p class="small">Last place is the best handicap stock. First place gets no bonus.</p>`;
  $("standings").innerHTML = html;
}

function renderMarketSelects(){
  ["ownedPlayer","ownerPlayer"].forEach(id=>{
    const sel=$(id); sel.innerHTML="";
    players.forEach((p,i)=>{
      const opt=document.createElement("option");
      opt.value=i; opt.textContent=p;
      sel.appendChild(opt);
    });
  });
}

function renderBankrolls(){
  $("bankrolls").innerHTML = players.map((p,i)=>`
    <label>${p} bankroll / running total
      <input inputmode="numeric" placeholder="Example: -12 or +18">
    </label>`).join("");
}

document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

$("savePlayers").addEventListener("click", savePlayers);
$("calc").addEventListener("click", updateStandings);
$("doublePrice").addEventListener("click", ()=>{
  const price=$("price");
  const vals=[1,2,4,8,16];
  const current=+price.value;
  const next=vals[Math.min(vals.indexOf(current)+1, vals.length-1)];
  price.value=next;
});
$("dividend").addEventListener("click", ()=>{
  $("dividendText").innerHTML = `<p><b>Dividend:</b> winning side collects $2 from each opposing player. Respect the $40 max-loss cap.</p>`;
});

savePlayers();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(()=>{});
}
