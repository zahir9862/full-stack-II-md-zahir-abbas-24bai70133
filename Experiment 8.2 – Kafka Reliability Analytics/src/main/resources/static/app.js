const $ = id => document.getElementById(id);
async function api(path, options={}) {
  const res = await fetch('/api' + path, {headers:{'Content-Type':'application/json'}, ...options});
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
}
function esc(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function refresh(){
  try {
    const s = await api('/state');
    $('processedCount').textContent=s.processedCount;
    $('dlqCount').textContent=s.dlqCount;
    $('activityCount').textContent=s.activity.length;
    $('activity').innerHTML=s.activity.length ? s.activity.map(x=>`<tr><td>${x.sequence}</td><td>${esc(new Date(x.time).toLocaleTimeString())}</td><td>${esc(x.eventId)}</td><td><span class="status">${esc(x.type)}</span></td><td>${esc(x.message)}</td></tr>`).join('') : '<tr><td colspan="5">No events yet.</td></tr>';
    $('dlq').innerHTML=s.dlq.length ? s.dlq.map(x=>`<tr><td>${esc(x.eventId)}</td><td>${x.attempts}</td><td>${esc(new Date(x.failedAt).toLocaleTimeString())}</td><td>${esc(x.reason)}</td></tr>`).join('') : '<tr><td colspan="4">No failed events in the DLQ.</td></tr>';
  } catch(e) {$('result').textContent='Could not connect to the app. Make sure Spring Boot is running.';}
}
async function publish(idOverride=null){
  const eventId=idOverride ?? $('eventId').value.trim();
  const payload={eventId:eventId || null,simulateFailure:$('failure').value==='true',maxRetries:Number($('retries').value)};
  try {
    const r=await api('/publish',{method:'POST',body:JSON.stringify(payload)});
    $('result').textContent=`${r.status}: ${r.message} Event ID: ${r.eventId}`;
    if(!$('eventId').value.trim()) $('eventId').value=r.eventId;
    await refresh();
  } catch(e){$('result').textContent='Error publishing event. Check the terminal for application errors.';}
}
$('publish').addEventListener('click',()=>publish());
$('duplicate').addEventListener('click',()=>{const id=$('eventId').value.trim();if(!id){$('result').textContent='Enter an Event ID first, then publish it before testing duplicate protection.';return;}publish(id);});
$('reset').addEventListener('click',async()=>{try{await api('/reset',{method:'POST'});$('eventId').value='';$('result').textContent='Experiment data cleared.';await refresh();}catch(e){$('result').textContent='Could not reset. Check the terminal.';}});
$('refresh').addEventListener('click',refresh);
refresh();
