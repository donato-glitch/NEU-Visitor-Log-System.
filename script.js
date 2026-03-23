const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMINS = ['eduardo.donato@neu.edu.ph', 'jcesperanza@neu.edu.ph'];
let isViewingAdmin = true;

async function login() {
    await _supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: { 
            redirectTo: window.location.origin + window.location.pathname,
            queryParams: { prompt: 'select_account' }
        }
    });
}

async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        if (window.location.hash) {
            window.history.replaceState(null, null, window.location.pathname);
        }
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        const userEmail = session.user.email.toLowerCase();
        document.getElementById('user-status').innerText = `User: ${userEmail}`;
        
        const backBtn = document.querySelector('button[onclick="showView(\'admin\')"]');

        if (ADMINS.includes(userEmail)) {
            document.getElementById('role-switch-btn').style.display = 'block';
            if(backBtn) backBtn.style.display = 'block';
            showView('admin');
        } else {
            document.getElementById('role-switch-btn').style.display = 'none';
            if(backBtn) backBtn.style.display = 'none';
            showView('kiosk');
        }
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.href = window.location.origin + window.location.pathname;
}

function showView(view) {
    document.getElementById('admin-view').style.display = (view === 'admin') ? 'block' : 'none';
    document.getElementById('kiosk-view').style.display = (view === 'kiosk') ? 'block' : 'none';
    if(view === 'admin') loadAdminLogs();
}

function toggleRole() {
    isViewingAdmin = !isViewingAdmin;
    showView(isViewingAdmin ? 'admin' : 'kiosk');
}

async function loadAdminLogs() {
    const refreshBtn = document.querySelector('.bg-teal');
    if(refreshBtn) refreshBtn.style.opacity = '0.5';

    const { data, error } = await _supabase
        .from('attendance')
        .select('*')
        .order('logged_at', { ascending: false });

    if (error) {
        if(refreshBtn) refreshBtn.style.opacity = '1';
        return;
    }

    if (data) {
        const total = data.length;
        const students = data.filter(d => d.user_type === 'Student').length;
        const employees = data.filter(d => d.user_type === 'Employee' || d.user_type === 'Teacher' || d.user_type === 'Staff').length;

        if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
        if(document.getElementById('stat-students')) document.getElementById('stat-students').innerText = students;
        if(document.getElementById('stat-employees')) document.getElementById('stat-employees').innerText = employees;

        const logBody = document.getElementById('admin-log-data');
        if (logBody) {
            logBody.innerHTML = data.map(log => `
                <tr>
                    <td><strong>${log.full_name}</strong></td>
                    <td>${log.user_type || 'Student'}</td>
                    <td>${log.college || 'N/A'}</td>
                    <td>${log.reason || 'N/A'}</td>
                    <td>${new Date(log.logged_at).toLocaleTimeString()}</td>
                </tr>`).join('');
        }

        const updateEl = document.getElementById('last-update');
        if(updateEl) updateEl.innerText = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
    setTimeout(() => { if(refreshBtn) refreshBtn.style.opacity = '1'; }, 200);
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    const entry = {
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user_type').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    };

    const { error } = await _supabase.from('attendance').insert([entry]);
    if (!error) {
        alert("Successfully Registered!");
        const userEmail = session.user.email.toLowerCase();
        if (!ADMINS.includes(userEmail)) {
            logout();
        } else {
            loadAdminLogs();
        }
    } else {
        alert("Error: " + error.message);
    }
}

setInterval(() => { 
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = new Date().toLocaleTimeString(); 
}, 1000);

checkSession();
