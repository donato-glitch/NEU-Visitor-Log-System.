const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMINS = ['eduardo.donato@neu.edu.ph', 'jcesperanza@neu.edu.ph'];
let isViewingAdmin = true;

async function login() {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
    });
}

async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        const userEmail = session.user.email.toLowerCase();
        document.getElementById('user-status').innerText = `User: ${userEmail}`;
        if (ADMINS.includes(userEmail)) {
            document.getElementById('role-switch-btn').style.display = 'block';
            showView('admin');
        } else {
            showView('kiosk');
        }
    }
}

function toggleRole() {
    isViewingAdmin = !isViewingAdmin;
    showView(isViewingAdmin ? 'admin' : 'kiosk');
}

function showView(view) {
    document.getElementById('admin-view').style.display = (view === 'admin') ? 'block' : 'none';
    document.getElementById('kiosk-view').style.display = (view === 'kiosk') ? 'block' : 'none';
    const isUserAdmin = ADMINS.some(email => document.getElementById('user-status').innerText.includes(email));
    document.getElementById('back-to-admin-btn').style.display = (isUserAdmin && view === 'kiosk') ? 'block' : 'none';
    if(view === 'admin') loadAdminLogs();
}

async function loadAdminLogs() {
    const range = document.getElementById('date-range').value;
    const type = document.getElementById('visitor-type').value;
    let query = _supabase.from('attendance').select('*');
    if (range === 'today') {
        query = query.gte('logged_at', new Date().toISOString().split('T')[0]);
    } else if (range === 'week') {
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('logged_at', weekAgo.toISOString());
    }
    if (type !== 'all') query = query.eq('user_type', type);
    const { data } = await query.order('logged_at', { ascending: false });
    if (data) {
        document.getElementById('stat-total').innerText = data.length;
        document.getElementById('stat-students').innerText = data.filter(d => d.user_type === 'Student').length;
        document.getElementById('stat-employees').innerText = data.filter(d => d.user_type === 'Employee').length;
        document.getElementById('admin-log-data').innerHTML = data.map(log => `<tr><td><strong>${log.full_name}</strong></td><td>${log.user_type || 'Student'}</td><td>${log.college}</td><td>${log.reason}</td><td>${new Date(log.logged_at).toLocaleDateString()}</td></tr>`).join('');
    }
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const entry = {
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user_type').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    };
    const { error } = await _supabase.from('attendance').insert([entry]);
    if (!error) {
        alert("Entry Recorded!");
        if (ADMINS.includes(session.user.email.toLowerCase())) showView('admin');
        else logout();
    }
}

function clearForm() {
    document.getElementById('college').selectedIndex = 0;
    document.getElementById('reason').selectedIndex = 0;
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.reload();
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
checkSession();
