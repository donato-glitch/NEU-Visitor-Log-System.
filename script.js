const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph', 'donatojayr31@gmail.com'];


document.getElementById('login-btn').addEventListener('click', async () => {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
            redirectTo: 'https://donato-glitch.github.io/NEU-Visitor-Log-System/' 
        }
    });
    if (error) alert("Login Error: " + error.message);
});


async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        document.getElementById('greeting').innerText = "Welcome to NEU Library!";

        if (ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
            document.getElementById('admin-controls').style.display = 'block';
        }
    }
}


function toggleRole(role) {
    if (role === 'admin') {
        document.getElementById('visitor-form-container').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        fetchStats();
    } else {
        document.getElementById('visitor-form-container').style.display = 'block';
        document.getElementById('admin-view').style.display = 'none';
    }
}


async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const reason = document.getElementById('reason').value;
    if (!reason) return alert("Please enter a reason.");

    const { error } = await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: document.getElementById('user-type').value,
        college: document.getElementById('college').value,
        reason: reason
    }]);

    if (!error) {
        alert("Visit logged successfully!");
        document.getElementById('reason').value = "";
    } else {
        alert("Error: " + error.message);
    }
}


async function fetchStats() {
    let { data, error } = await _supabase.from('attendance').select('*').order('logged_at', { ascending: false });
    if (error) return;

    document.getElementById('today-count').innerText = data.length;
    document.getElementById('cics-count').innerText = data.filter(d => d.college === 'CICS').length;
    document.getElementById('emp-count').innerText = data.filter(d => d.user_type !== 'Student').length;

    const tbody = document.getElementById('logs-body');
    tbody.innerHTML = data.map(log => `
        <tr>
            <td>${log.full_name}</td>
            <td>${log.college}</td>
            <td>${new Date(log.logged_at).toLocaleTimeString()}</td>
        </tr>
    `).join('');
}


async function logout() {
    await _supabase.auth.signOut();
    window.location.reload();
}

checkUser();
