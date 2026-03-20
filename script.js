const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// List of Admins
const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph', 'donato-glitch@gmail.com'];

// Login Logic
document.getElementById('login-btn').addEventListener('click', async () => {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
    });
});

// Check User Session
async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        
        const userEmail = session.user.email.toLowerCase();
        if (ADMIN_EMAILS.includes(userEmail)) {
            document.getElementById('admin-controls').style.display = 'block';
        }
    }
}

// Toggle View
function toggleRole(role) {
    if (role === 'admin') {
        document.getElementById('visitor-form-container').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        document.getElementById('admin-view-btn').classList.add('active');
        document.getElementById('user-view-btn').classList.remove('active');
        updateStats();
    } else {
        document.getElementById('visitor-form-container').style.display = 'block';
        document.getElementById('admin-view').style.display = 'none';
        document.getElementById('user-view-btn').classList.add('active');
        document.getElementById('admin-view-btn').classList.remove('active');
    }
}

// Submit Visit
async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const { error } = await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user-type').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    }]);

    if(!error) {
        alert("Visit Recorded!");
        updateStats();
    }
}

// Update Dashboard Stats
async function updateStats() {
    let { data } = await _supabase.from('attendance').select('*');
    if(data) {
        const dateFilter = document.getElementById('filter-date').value;
        const reasonFilter = document.getElementById('filter-reason').value;

        let filtered = data;
        if(reasonFilter !== "All") filtered = filtered.filter(d => d.reason === reasonFilter);
        if(dateFilter) filtered = filtered.filter(d => d.created_at.includes(dateFilter));

        document.getElementById('total-circle').innerText = data.length;
        document.getElementById('filtered-stat').innerText = filtered.length;
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.reload();
}

checkUser();
