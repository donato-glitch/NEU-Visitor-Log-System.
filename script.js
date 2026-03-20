const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph'];

document.getElementById('login-btn').addEventListener('click', async () => {
    await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
});

async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'flex';
        if (ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
            document.getElementById('admin-controls').style.display = 'block';
        }
    }
}

async function updateStats() {
    let { data } = await _supabase.from('attendance').select('*').order('created_at', { ascending: false });
    if (data) {
        document.getElementById('total-circle').innerText = data.length;
        
        // RENDER TABLE ROWS (Pangalan ng nag log)
        const logBody = document.getElementById('log-body');
        logBody.innerHTML = data.map(log => `
            <tr>
                <td>${log.full_name}</td>
                <td>${log.college}</td>
                <td>${log.reason}</td>
                <td>${new Date(log.created_at).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }
}

function toggleRole(role) {
    const isMain = role === 'user';
    document.getElementById('visitor-form-container').style.display = isMain ? 'block' : 'none';
    document.getElementById('admin-view').style.display = isMain ? 'none' : 'grid';
    document.getElementById('user-view-btn').className = isMain ? 'active' : '';
    document.getElementById('admin-view-btn').className = isMain ? '' : 'active';
    if(!isMain) updateStats();
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user-type').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    }]);
    alert("Entry Recorded!");
}

async function logout() { await _supabase.auth.signOut(); window.location.reload(); }
checkUser();
