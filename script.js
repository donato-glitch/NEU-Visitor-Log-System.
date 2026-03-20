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
        document.getElementById('user-section').style.display = 'block';
        const userEmail = session.user.email.toLowerCase();
        if (ADMIN_EMAILS.includes(userEmail)) {
            document.getElementById('admin-controls').style.display = 'block';
        }
    }
}

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

async function updateStats() {
    let { data } = await _supabase.from('attendance').select('*');
    if (data) {
        const dateVal = document.getElementById('filter-date').value;
        const collegeVal = document.getElementById('filter-college').value;
        const typeVal = document.getElementById('filter-type').value;

        let filtered = data;
        if (collegeVal !== "All") filtered = filtered.filter(d => d.college === collegeVal);
        if (typeVal === "Teacher") filtered = filtered.filter(d => d.user_type !== "Student");
        if (dateVal) filtered = filtered.filter(d => d.created_at.includes(dateVal));

        document.getElementById('total-circle').innerText = data.length;
        document.getElementById('filtered-stat').innerText = filtered.length;
    }
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
    alert("Log Submitted!");
    updateStats();
}

async function logout() { await _supabase.auth.signOut(); window.location.reload(); }
checkUser();
