const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);
const ADMIN_EMAIL = 'jcesperanza@neu.edu.ph';

document.getElementById('login-btn').addEventListener('click', async () => {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://donato-glitch.github.io/NEU-Visitor-Log-System/' }
    });
});

async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        const user = session.user;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';

        // Requirement: "Welcome to NEU Library!"
        document.getElementById('greeting').innerText = "Welcome to NEU Library!";

        // Show Admin Stats if Admin
        if (user.email === ADMIN_EMAIL || user.email === 'eduardo.donato@neu.edu.ph') {
            document.getElementById('admin-view').style.display = 'block';
            fetchStats();
        }
    }
}

async function submitLog() {
    const { data: { session } } = await _supabase.auth.getSession();
    const uType = document.getElementById('user-type').value;
    const coll = document.getElementById('college').value;
    const reas = document.getElementById('reason').value;

    if (!reas) return alert("Please enter a reason");

    const { error } = await _supabase.from('attendance').insert([{
        full_name: session.user.user_metadata.full_name,
        email: session.user.email,
        user_type: uType,
        college: coll,
        reason: reas
    }]);

    if (!error) {
        alert("Log recorded! Enjoy the library.");
        document.getElementById('visitor-form-container').style.display = 'none';
        fetchStats(); // Refresh stats for admin
    }
}

async function fetchStats() {
    const { data, error } = await _supabase.from('attendance').select('*').order('logged_at', { ascending: false });
    if (!error) {
        // Update Cards
        document.getElementById('today-count').innerText = data.length;
        document.getElementById('emp-count').innerText = data.filter(r => r.user_type !== 'Student').length;
        document.getElementById('ics-count').innerText = data.filter(r => r.college === 'ICS').length;

        // Update Table
        const tbody = document.getElementById('logs-body');
        tbody.innerHTML = data.map(log => `
            <tr>
                <td>${log.full_name}</td>
                <td>${log.college || '-'}</td>
                <td>${log.reason || '-'}</td>
                <td>${new Date(log.logged_at).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.reload();
}
checkUser();
