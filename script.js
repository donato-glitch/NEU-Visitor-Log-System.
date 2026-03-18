const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph', 'donatojayr31@gmail.com'];

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
        document.getElementById('user-section').style.display = 'block';
        if (ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
            document.getElementById('admin-controls').style.display = 'block';
        }
    }
}

function toggleRole(role) {
    const userBtn = document.getElementById('user-view-btn');
    const adminBtn = document.getElementById('admin-view-btn');
    if (role === 'admin') {
        document.getElementById('visitor-form-container').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        adminBtn.classList.add('active');
        userBtn.classList.remove('active');
        updateStats();
    } else {
        document.getElementById('visitor-form-container').style.display = 'block';
        document.getElementById('admin-view').style.display = 'none';
        userBtn.classList.add('active');
        adminBtn.classList.remove('active');
    }
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const reason = document.getElementById('reason').value;
    if(!reason) return alert("Please enter reason");

    await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user-type').value,
        college: document.getElementById('college').value,
        reason: reason
    }]);
    alert("Logged Successfully!");
    document.getElementById('reason').value = "";
}

async function updateStats() {
    let { data } = await _supabase.from('attendance').select('*');
    if(data) {
        const collegeFilter = document.getElementById('filter-college').value;
        const typeFilter = document.getElementById('filter-type').value;

        document.getElementById('total-stat').innerText = data.length;

        let filtered = data;
        if(collegeFilter !== "All") filtered = filtered.filter(d => d.college === collegeFilter);
        if(typeFilter !== "All") filtered = filtered.filter(d => d.user_type === typeFilter);

        document.getElementById('filtered-stat').innerText = filtered.length;
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.reload();
}

checkUser();
