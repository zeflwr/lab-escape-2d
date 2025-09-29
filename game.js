const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 32;
const mapWidth = 10;
const mapHeight = 10;

let map = []; 
let player = { x: 1, y: 1 };
let inventory = [];
let reactions = [];

// Load map
fetch('map.json').then(res=>res.json()).then(data=>{ map=data; drawMap(); });
// Load reactions
fetch('reactions.json').then(res=>res.json()).then(data=>{ reactions=data.reactions; });

function drawMap() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<mapHeight;y++){
    for(let x=0;x<mapWidth;x++){
      if(map[y][x].type===1) ctx.fillStyle="#333"; // wall
      else if(map[y][x].type===2) ctx.fillStyle="#888"; // door
      else ctx.fillStyle="#aaa"; // floor
      ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
    }
  }
  drawItems();
  drawPlayer();
}

function drawPlayer() {
  ctx.fillStyle="red";
  ctx.fillRect(player.x*tileSize, player.y*tileSize, tileSize, tileSize);
}

function drawItems() {
  map.forEach((row,y)=>{
    row.forEach((cell,x)=>{
      if(cell.item){
        ctx.fillStyle="green";
        ctx.fillRect(x*tileSize+8, y*tileSize+8, 16, 16);
      }
    });
  });
}

// Movement
document.addEventListener('keydown', e=>{
  let newX=player.x, newY=player.y;
  if(e.key==="ArrowUp") newY--;
  if(e.key==="ArrowDown") newY++;
  if(e.key==="ArrowLeft") newX--;
  if(e.key==="ArrowRight") newX++;
  if(map[newY] && map[newY][newX] && map[newY][newX].type!==1){
    player.x=newX; player.y=newY;
    pickItem();
  }
  drawMap();
});

function pickItem(){
  const cell=map[player.y][player.x];
  if(cell.item){
    inventory.push(cell.item);
    showMessage(`Picked up ${cell.item}`);
    cell.item=null;
    renderInventory();
  }
}

function renderInventory(){
  const invDiv=document.getElementById('inventory');
  invDiv.innerHTML='';
  inventory.forEach(it=>{
    const btn=document.createElement('button');
    btn.textContent=it;
    btn.onclick=()=>btn.classList.toggle('selected');
    invDiv.appendChild(btn);
  });
}

function showMessage(msg){
  const msgDiv=document.getElementById('messages');
  msgDiv.textContent=msg;
  setTimeout(()=>{ msgDiv.textContent=''; }, 2000);
}

// Combine button
const combineBtn=document.createElement('button');
combineBtn.textContent="Combine Selected";
combineBtn.onclick=()=>{
  const selected=[...document.querySelectorAll('#inventory button.selected')].map(b=>b.textContent);
  if(selected.length<2){ showMessage("Select 2 items to combine"); return; }
  const reaction=reactions.find(r=>selected.every(s=>r.reactants.includes(s)));
  if(reaction){
    showMessage(`Reaction success: ${reaction.result}`);
    inventory=inventory.filter(i=>!selected.includes(i));
    renderInventory();
  } else showMessage("No reaction happened!");
};
document.body.appendChild(combineBtn);