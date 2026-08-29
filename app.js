const state=JSON.parse(localStorage.getItem('clr05'))||JSON.parse(localStorage.getItem('clr01'))||{cash:2500,wins:0,losses:0,rep:0,gear:3.55,shift:5200};
let race={}; const ratios=[2.45,1.45,1.00,0.69];
const $=id=>document.getElementById(id);
function sync(){ $('cash').textContent=state.cash;$('wins').textContent=state.wins;$('losses').textContent=state.losses;$('rep').textContent=$('rep2').textContent=$('repTop').textContent=state.rep;$('prog').value=Math.min(100,state.rep);$('gear').value=state.gear;$('gearText').textContent=$('gearText2').textContent=(+state.gear).toFixed(2);$('shift').value=state.shift;$('shiftVal').textContent=state.shift+' RPM'; estimate(); }
function persist(){localStorage.setItem('clr05',JSON.stringify(state))}
function go(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('navActive',b.dataset.screen===id));window.scrollTo(0,0);if(id==='race'&&race.phase==='done')resetRace()}
function updateGear(v){$('gearText').textContent=$('gearText2').textContent=(+v).toFixed(2);estimate(+v)}
function estimate(g=+$('gear').value){const hit=(g-3.23)/1.33;$('estEt').textContent=(10.2-hit*.5).toFixed(1)+'–'+(10.6-hit*.45).toFixed(1);$('estMph').textContent=(70+hit*3).toFixed(0)+'–'+(74+hit*3).toFixed(0)+' MPH'}
function saveTune(){state.gear=+$('gear').value;state.shift=+$('shift').value;persist();sync();go('garage')}
function setDash(){ $('raceRpm').textContent=Math.round(race.rpm);$('raceGear').textContent=race.gear;$('raceSpeed').textContent=Math.round(race.speed);$('raceDist').textContent=Math.min(660,Math.round(race.dist));$('tachFill').style.width=Math.min(100,Math.max(0,(race.rpm-800)/5600*100))+'%';$('shiftLight').classList.toggle('on',race.phase==='running'&&race.gear<4&&race.rpm>=state.shift-250);if($('distanceBoard'))$('distanceBoard').textContent=(race.phase==='done'?'FINISH':race.phase==='running'?'RACING':'START')+' • '+Math.min(660,Math.round(race.dist))+' / 660 FT'}
function resetRace(){cancelAnimationFrame(race.raf);clearInterval(race.burnTimer);race={phase:'burnout',rpm:1100,gear:1,speed:0,dist:0,start:0,last:0,rt:null,greenAt:0,shiftPenalty:0,spin:0,burnout:0,raf:0,oppEt:+(10.05+(Math.random()-.5)*.6).toFixed(3)};$('slip').classList.add('hidden');$('raceBtn').onclick=raceAction;const track=$('track');track.classList.remove('runningRoad');track.style.setProperty('--road-offset','0px');track.style.setProperty('--start-x','0px');track.style.setProperty('--finish-x','79%');track.style.setProperty('--finish-opacity','1');$('raceTruck').style.setProperty('--car-x','0px');$('oppTruck').style.setProperty('--car-x','0px');$('raceTruck').className='raceVehicle player renderedRaceVehicle';$('oppTruck').className='raceVehicle opponent spriteVehicle';$('stageLamp').classList.remove('on');$('flashLamp').classList.remove('on');$('raceMsg').textContent='HOLD BURNOUT • BUILD TIRE HEAT';$('raceBtn').textContent='HOLD BURNOUT';$('raceBtn').disabled=false;$('raceBtn').classList.remove('hidden');$('shiftBtn').classList.add('hidden');$('tireHeat').style.width='0%';setDash()}
function burnoutOn(){if(race.phase!=='burnout'||race.burnTimer)return;race.rpm=4800;$('raceBtn').classList.add('pressed');$('raceTruck').classList.add('burning');$('raceMsg').textContent='BURNOUT • HEATING THE RADIALS';race.burnTimer=setInterval(()=>{race.burnout=Math.min(100,race.burnout+2.5);$('tireHeat').style.width=race.burnout+'%'},75);setDash()}
function burnoutOff(){if(race.phase!=='burnout')return;clearInterval(race.burnTimer);race.burnTimer=null;$('raceBtn').classList.remove('pressed');$('raceTruck').classList.remove('burning');race.rpm=1100;race.phase='stage';$('raceBtn').textContent='ROLL INTO STAGE';$('raceMsg').textContent=race.burnout>45?'BURNOUT GOOD • CREEP TO THE PAINT':'TIRES ARE COOL • YOU MAY SPIN';setDash()}
function stage(){if(race.phase!=='stage')return;race.phase='waiting';$('raceBtn').disabled=true;$('raceBtn').textContent='STAGED';$('stageLamp').classList.add('on');$('raceTruck').style.setProperty('--car-x','8px');$('oppTruck').style.setProperty('--car-x','8px');$('raceMsg').textContent='STAGED • WATCH THE FLASHLIGHT';setTimeout(()=>{if(race.phase!=='waiting')return;$('flashLamp').classList.add('on');race.greenAt=performance.now();race.phase='green';$('raceBtn').disabled=false;$('raceBtn').textContent='LAUNCH';$('raceMsg').textContent='GO!';setTimeout(()=>$('flashLamp').classList.remove('on'),420)},1050+Math.random()*1800)}
function launch(){if(!['waiting','green'].includes(race.phase))return;const now=performance.now();if(race.phase==='waiting'){race.rt=-.001;$('raceMsg').textContent='RED LIGHT!'}else race.rt=(now-race.greenAt)/1000;race.phase='running';race.start=now;race.last=now;$('raceBtn').classList.add('hidden');$('shiftBtn').classList.remove('hidden');race.rpm=2600;race.spin=Math.max(0,38-race.burnout*.36)+(state.gear-3.55)*16;$('raceTruck').classList.add('launching','running');$('oppTruck').classList.add('running');$('track').classList.add('runningRoad');race.raf=requestAnimationFrame(tick)}
function shiftGear(){if(race.phase!=='running'||race.gear>=4)return;const before=race.rpm,diff=Math.abs(before-state.shift);race.shiftPenalty+=diff/2200;race.gear++;race.rpm=Math.max(2500,before*(ratios[race.gear-1]/ratios[race.gear-2]));$('raceMsg').textContent=diff<300?'CLEAN SHIFT!':before>state.shift?'LATE SHIFT':'EARLY SHIFT';setDash()}
function tick(now){if(race.phase!=='running')return;const dt=Math.min(.04,(now-race.last)/1000);race.last=now;const traction=1-Math.min(.40,race.spin/100),power=245/3850,ratio=ratios[race.gear-1]*state.gear;let accel=(power*1120*ratio/8.7)*traction/(1+race.speed/100);accel=Math.max(3,accel-race.shiftPenalty*.75);race.speed+=accel*dt;race.dist+=race.speed*1.46667*dt;race.rpm=800+(race.speed*state.gear*ratios[race.gear-1]*336/27.99);if(race.rpm>6200){race.rpm=6200;race.shiftPenalty+=.012}race.spin=Math.max(0,race.spin-dt*19);$('raceTruck').classList.toggle('spinning',race.spin>12);const elapsed=(now-race.start)/1000,oppDist=Math.min(660,660*Math.pow(Math.min(1,elapsed/race.oppEt),1.16));const track=$('track');track.style.setProperty('--road-offset',(-race.dist*2.2%76)+'px');const travel=Math.max(0,track.clientWidth-210);const playerX=Math.min(travel*.78,travel*.78*(race.dist/660));const oppX=Math.min(travel*.78,travel*.78*(oppDist/660));$('raceTruck').style.setProperty('--car-x',playerX+'px');$('oppTruck').style.setProperty('--car-x',oppX+'px');const lead=oppDist-race.dist;$('oppTruck').classList.toggle('raceAhead',lead>8);$('oppTruck').classList.toggle('raceBehind',lead<-8);setDash();if(race.dist>=660){finishRace(now);return}race.raf=requestAnimationFrame(tick)}
function finishRace(now){race.phase='done';$('track').classList.remove('runningRoad');$('track').style.setProperty('--finish-x','79%');$('track').style.setProperty('--finish-opacity','1');$('raceTruck').classList.remove('running','spinning');$('oppTruck').classList.remove('running');$('shiftBtn').classList.add('hidden');$('raceBtn').classList.remove('hidden');$('raceBtn').disabled=false;$('raceBtn').textContent='RACE AGAIN';$('raceBtn').onclick=resetRace;const raw=(now-race.start)/1000,et=+(raw+race.shiftPenalty*.16).toFixed(3),mph=+race.speed.toFixed(1),rt=race.rt??0,red=rt<0,win=!red&&et<race.oppEt;if(win){state.cash+=200;state.wins++;state.rep+=10}else{state.cash=Math.max(0,state.cash-200);state.losses++}persist();sync();$('raceMsg').textContent=red?'RED LIGHT • JAX TAKES IT':win?'WIN LIGHT • RACIN’ CAJUN!':'JAX GOT YOU THIS TIME';$('slip').innerHTML=`<div class="winner">${win?'YOU WIN':'YOU LOSE'}</div><h3>1/8 MILE TIME SLIP</h3><div class="slipgrid"><span>REACTION<b>${red?'RED':rt.toFixed(3)}</b></span><span>YOUR ET<b>${et}</b></span><span>YOUR MPH<b>${mph}</b></span><span>JAX ET<b>${race.oppEt}</b></span></div><small>${win?'+$200 • +10 REP':'-$200 • TUNE IT AND TRY AGAIN'}</small>`;$('slip').classList.remove('hidden')}
function raceAction(){if(race.phase==='idle'||race.phase==='done')resetRace();else if(race.phase==='stage')stage();else if(race.phase==='waiting'||race.phase==='green')launch()}
window.addEventListener('DOMContentLoaded',()=>{
  const rb=$('raceBtn');
  const startBurn=e=>{
    if(race.phase!=='burnout') return;
    e.preventDefault();
    burnoutOn();
    if(e.pointerId!=null && rb.setPointerCapture){
      try{ rb.setPointerCapture(e.pointerId); }catch(_){}
    }
  };
  const stopBurn=e=>{
    if(race.phase!=='burnout') return;
    if(e) e.preventDefault();
    burnoutOff();
  };

  // Pointer capture keeps the burnout active while the finger is held,
  // even if Android reports small movement outside the button.
  rb.addEventListener('pointerdown',startBurn,{passive:false});
  rb.addEventListener('pointerup',stopBurn,{passive:false});
  rb.addEventListener('pointercancel',stopBurn,{passive:false});

  // Fallback for WebViews/browsers with incomplete pointer-event support.
  rb.addEventListener('touchstart',e=>{
    if(race.phase==='burnout' && !window.PointerEvent) startBurn(e);
  },{passive:false});
  rb.addEventListener('touchend',e=>{
    if(race.phase==='burnout' && !window.PointerEvent) stopBurn(e);
  },{passive:false});
  rb.addEventListener('mousedown',e=>{
    if(race.phase==='burnout' && !window.PointerEvent) startBurn(e);
  });
  window.addEventListener('mouseup',e=>{
    if(race.phase==='burnout' && !window.PointerEvent) stopBurn(e);
  });

  resetRace();sync();go('home');
});