const $ = (id) => document.getElementById(id);
async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Could not load tasks');
    const tasks = await response.json();
    $('taskList').innerHTML = tasks.length ? tasks.map(t => `<div class="task-row"><span>${escapeHtml(t.title)}</span><span class="id">#${t.id}</span><span class="pill">${t.status}</span></div>`).join('') : '<div class="empty">No tasks yet. Add one above to get started.</div>';
  } catch (e) { $('taskList').innerHTML = '<div class="empty">API not reachable. Start the Spring Boot application.</div>'; }
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
$('taskForm').addEventListener('submit', async e => {
  e.preventDefault();
  const title = $('taskTitle').value.trim();
  if (!title) return;
  const response = await fetch('/api/tasks', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title})});
  if (response.ok) { $('taskTitle').value=''; loadTasks(); } else alert('Could not create task. Check the application terminal.');
});
$('refreshBtn').addEventListener('click', loadTasks);
$('runBtn').addEventListener('click', async () => {
  $('runBtn').disabled = true; $('pipelineState').textContent='Running'; $('qualityState').textContent='In progress';
  $('runMessage').textContent='Simulating the CI stages…';
  const ids=['s1','s2','s3','s4'];
  for (let i=0;i<ids.length;i++) {
    $(ids[i]).textContent='RUNNING'; $(ids[i]).className='stage-state running';
    $('progress').style.width=((i+1)*25)+'%'; $('progressText').textContent=((i+1)*25)+'%';
    await new Promise(r=>setTimeout(r,650));
    $(ids[i]).textContent=i===3?'PLANNED':'PASSED'; $(ids[i]).className='stage-state '+(i===3?'':'passed');
  }
  $('pipelineState').textContent='Demo complete'; $('qualityState').textContent='Review tests';
  $('runMessage').textContent='Visual demo finished — run mvn test for real test results.';
  $('runBtn').disabled=false;
});
loadTasks();
