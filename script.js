const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);


const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph'];

document.getElementById('login-btn').addEventListener('click', async () => {
    await _supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { redirectTo: window.location.href } 
    });
});

async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'flex';
        document.getElementById('user-email-display').innerText = session.user.email;
        
        // Remove gradient on dashboard
        document.body.style.background = "#f0f2f5";

        if (ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
            document.getElementById('admin-nav').style.display = 'block';
            toggleView('admin');
        } else {
            toggleView('user');
        }
    }
}

async function loadLogs() {
    let { data } = await _supabase.from('attendance').select('*').order('created_at', { ascending: false });
    if (data) {
        const dateVal = document.getElementById('filter-date').value;
        const collVal = document.getElementById('filter-college').value;
        
        let filtered = data;
        if(dateVal) filtered = filtered.filter(x => x.created_at.includes(dateVal));
        if(collVal !== "All") filtered = filtered.filter(x => x.college === collVal);

        document.getElementById('visitor-count').innerText = filtered.length;
        document.getElementById('log-list').innerHTML = filtered.map(log => `
            <tr>
                <td><strong>${log.full_name}</strong></td>
                <td>${log.college}</td>
                <td>${log.reason}</td>
                <td>${log.user_type}</td>
                <td>${new Date(log.created_at).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }
}

function toggleView(view) {
    const isAdmin = view === 'admin';
    document.getElementById('admin-view').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('user-view').style.display = isAdmin ? 'none' : 'block';
    document.getElementById('admin-tab').classList.toggle('active', isAdmin);
    document.getElementById('user-tab').classList.toggle('active', !isAdmin);
    if(isAdmin) loadLogs();
}

async function submitEntry() {
    const { data: { session } } = await _supabase.auth.getSession();
    const { error } = await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user-type').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    }]);

    if(!error) {
        alert("Success! Welcome to NEU Library.");
        loadLogs();
    }
}

async function logout() { await _supabase.auth.signOut(); window.location.reload(); }
checkUser();
