'use strict';
// All pages share navigation. Page-specific features initialise only when present.
const menuButton = document.querySelector('.menu-toggle');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  document.querySelector('#navigation').classList.toggle('open', open);
});
document.querySelector('#year').textContent = new Date().getFullYear();
const STORAGE_KEY = 'cos106.tasks.v1';
function readStored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
const portrait = document.querySelector('#portrait');
if (portrait) {
  const photo = readStored('cos106.portrait.v1', null);
  if (typeof photo === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(photo)) {
    portrait.src = photo; portrait.alt = 'User-supplied student photograph';
    document.querySelector('#photo-status').textContent = 'Your photograph is saved in this browser.';
  }
  document.querySelector('#photo-upload').addEventListener('change', async event => {
    const file = event.target.files[0];
    const status = document.querySelector('#photo-status');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      status.textContent = 'Choose a JPG, PNG, or WebP photograph smaller than 2 MB.'; return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      portrait.src = reader.result; portrait.alt = 'User-supplied student photograph';
      try { localStorage.setItem('cos106.portrait.v1', JSON.stringify(reader.result)); status.textContent = 'Photo saved in this browser. For the hosted site, replace assets/profile.jpg in the repository.'; }
      catch { status.textContent = 'Photo displayed, but browser storage is unavailable.'; }
    };
    reader.onerror = () => { status.textContent = 'Could not read this photo. Please try another.'; };
    reader.readAsDataURL(file);
  });
}
const taskForm = document.querySelector('#task-form');
if (taskForm) {
  const saved = readStored(STORAGE_KEY, []);
  let tasks = Array.isArray(saved) ? saved.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.done === 'boolean').map(t => ({id:t.id,title:t.title.slice(0,180),done:t.done,date:typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) ? t.date : '',category:['Assignment','Study','Project','Personal'].includes(t.category) ? t.category : 'Study'})) : [];
  let filter = 'all';
  const list = document.querySelector('#task-list');
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); document.querySelector('#storage-status').textContent = ''; }
    catch { document.querySelector('#storage-status').textContent = 'Storage unavailable. These changes will last only while this page is open.'; }
  }
  function renderTasks() {
    list.replaceChildren();
    const visible = tasks.filter(t => filter === 'all' || (filter === 'completed' ? t.done : !t.done));
    visible.forEach(task => {
      const item = document.createElement('li'); item.className = `task${task.done ? ' done' : ''}`;
      const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done; check.id = `task-${task.id}`;
      check.addEventListener('change', () => { task.done = check.checked; persist(); renderTasks(); document.getElementById(check.id)?.focus(); document.querySelector('#task-status').textContent = task.done ? 'Task completed.' : 'Task marked active.'; });
      const details = document.createElement('div'); details.className = 'task-details';
      const label = document.createElement('label'); label.htmlFor = check.id; label.textContent = task.title;
      const meta = document.createElement('small'); meta.textContent = task.category + (task.date ? ` · Due ${new Date(task.date+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}` : ' · No due date');
      details.append(label,meta);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-task'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete ${task.title}`);
      remove.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); persist(); renderTasks(); document.querySelector('#task-title').focus(); document.querySelector('#task-status').textContent = 'Task deleted.'; });
      item.append(check,details,remove); list.append(item);
    });
    const done = tasks.filter(t => t.done).length;
    document.querySelector('#progress-number').textContent = `${done} / ${tasks.length}`;
    const progress = document.querySelector('#progress'); progress.max = tasks.length || 1; progress.value = done;
    document.querySelector('#empty-state').hidden = visible.length > 0;
    document.querySelector('#empty-state').textContent = tasks.length ? 'No tasks in this view.' : 'A fresh start. Add your first task above.';
  }
  taskForm.addEventListener('submit', event => {
    event.preventDefault(); const title = taskForm.elements.title.value.trim();
    document.querySelector('#task-error').textContent = title ? '' : 'Please enter a task name.';
    if (!title) { taskForm.elements.title.focus(); return; }
    tasks.push({id:crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, date:taskForm.elements.date.value,category:taskForm.elements.category.value,done:false});
    persist(); taskForm.reset(); renderTasks(); taskForm.elements.title.focus(); document.querySelector('#task-status').textContent = 'Task added.';
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); renderTasks();
  }));
  renderTasks();
}
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const draft = document.querySelector('#email-draft');
  contactForm.addEventListener('input', () => { draft.hidden = true; draft.removeAttribute('href'); document.querySelector('#contact-status').textContent = ''; });
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(['name','email','phone','message'].map(name => [name,contactForm.elements[name].value.trim()]));
    const errors = {};
    Object.entries(values).forEach(([key,value]) => { if (!value) errors[key] = 'This field is required.'; });
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.';
    if (values.phone && !/^\d+$/.test(values.phone)) errors.phone = 'Use digits only, without spaces, letters, or a + prefix.';
    Object.keys(values).forEach(key => { document.querySelector(`#${key}-error`).textContent = errors[key] || ''; contactForm.elements[key].setAttribute('aria-invalid',String(Boolean(errors[key]))); });
    const firstError = Object.keys(errors)[0];
    draft.hidden = true;
    if (firstError) { contactForm.elements[firstError].focus(); document.querySelector('#contact-status').textContent = 'Please correct the highlighted fields.'; return; }
    // Set this to your preferred public contact address before deployment.
    const recipient = 'egehdivine2019@gmail.com';
    const body = `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\n\n${values.message}`;
    draft.href = `mailto:${recipient}?subject=${encodeURIComponent('Student portfolio enquiry')}&body=${encodeURIComponent(body)}`;
    draft.hidden = false; document.querySelector('#contact-status').textContent = 'All fields look good. Open the email draft below to send it using your email app.';
  });
}
