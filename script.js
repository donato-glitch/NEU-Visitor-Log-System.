const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMINS = [
    'donatojayr31@gmail.com', 
    'eduardo.donato@neu.edu.ph',
    'jcesperanza@neu.edu.ph'
];

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
        document.getElementById('user-status').innerText = `Logged in: ${session.user.email}`;
        
        const isAdmin = ADMINS.includes(session.user.email.toLowerCase());
        
        if (isAdmin) {
            showView('admin');
            document.getElementById('back-to-admin-btn').style.display = 'block';
            document.getElementById('kiosk-logout-btn').style.display = 'none';
        } else {
            showView('kiosk');
            document.getElementById('back-to-admin-btn').style.display = 'none';
            document.getElementById('kiosk-logout-btn').style.display = 'block';
        }
    }
}

function showView(view) {
    document.getElementById('admin-view').style.display = (view === 'admin') ? 'block' : 'none';
    document.getElementById('kiosk-view').style.display = (view === 'kiosk') ? 'block' : 'none';
    if(view === 'admin') loadAdminLogs();
}

async function loadAdminLogs() {
    const { data, error } = await _supabase
        .from('attendance')
        .select('*')
        .order('logged_at', { ascending: false });
    
    if (data) {
        document.getElementById('total-count').innerText = data.length;
        document.getElementById('admin-log-data').innerHTML = data.map(log => `
            <tr>
                <td><strong>${log.full_name || 'Anonymous'}</strong></td>
                <td>${log.college || '---'}</td>
                <td>${log.reason || '---'}</td>
                <td>${log.logged_at ? new Date(log.logged_at).toLocaleTimeString() : '---'}</td>
            </tr>
        `).join('');
    }
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const college = document.getElementById('college').value;
    const reason = document.getElementById('reason').value;
    
    if(!college || !reason) { 
        alert("Please select college and reason."); 
        return; 
    }

    const { error } = await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        college: college,
        reason: reason
    }]);

    if (!error) { 
        alert("Visitor log successful!"); 
        window.location.reload(); 
    }
}

function clearForm() {
    document.getElementById('college').value = "";
    document.getElementById('reason').value = "";
    alert("Form cleared!");
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.href = window.location.origin + window.location.pathname;
}

setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

checkSession();
