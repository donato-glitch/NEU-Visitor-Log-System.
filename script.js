const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Prof Jerry's email is defined here as Admin
const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph'];

document.getElementById('login-btn').addEventListener('click', async () => {
    await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
});

async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'flex';
        document.getElementById('user-email-display').innerText = session.user.email;

        // Role-Based Access: Check if user is Admin
        if (ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
            document.getElementById('admin-nav').style.display = 'block';
            toggleView('admin');
        } else {
            toggleView('user');
        }
    }
}

async function loadData() {
    let { data } = await _supabase.from('attendance').select('*').order('created_at', { ascending: false });
    if (data) {
        const dateFilter = document.getElementById('filter-date').value;
        const collegeFilter = document.getElementById('filter-college').value;
        const reasonFilter = document.getElementById('filter-reason').value;

        let filtered = data;
        if(dateFilter) filtered = filtered.filter(d => d.created_at.includes(dateFilter));
        if(collegeFilter !== "All") filtered = filtered.filter(d => d.college === collegeFilter);
        if(reasonFilter !== "All") filtered = filtered.filter(d => d.reason === reasonFilter);

        document.getElementById('total-count').innerText = filtered.length;
        document.getElementById('log-body').innerHTML = filtered.map(log => `
            <tr>
                <td><strong>${log.full_name}</strong></td>
                <td>${log.college}</td>
                <td>${log.reason}</td>
                <td>${log.user_type}</td>
                <td>${new Date(log.created_at).toLocaleString()}</td>
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
    if(isAdmin) loadData();
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const { error } = await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('role').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    }]);

    if (!error) {
        alert("Visit Log Submitted! Welcome to NEU Library.");
        if (ADMIN_EMAILS.includes(session.user.email)) loadData();
    }
}

async function logout() { await _supabase.auth.signOut(); window.location.reload(); }
checkUser();
