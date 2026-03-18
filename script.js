const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);


const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph'];

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
        
        const fullName = user.user_metadata.full_name || user.email;
        document.getElementById('greeting').innerText = "Welcome, " + fullName;

        // 1. Record Log (Para sa lahat)
        await recordLog(fullName, user.email);

        // 2. Admin Check (Para makita ang table)
        if (ADMIN_EMAILS.includes(user.email)) {
            document.getElementById('admin-view').style.display = 'block';
            fetchLogs();
        }
    }
}

async function recordLog(name, email) {
    const today = new Date().toLocaleDateString();
    if (localStorage.getItem('last_log_date') !== today) {
        const { error } = await _supabase.from('attendance').insert([{ full_name: name, email: email }]);
        if (!error) localStorage.setItem('last_log_date', today);
    }
}

async function fetchLogs() {
    const { data, error } = await _supabase
        .from('attendance')
        .select('*')
        .order('logged_at', { ascending: false });

    if (!error) {
        const tbody = document.getElementById('logs-body');
        tbody.innerHTML = '';
        data.forEach(log => {
            const row = `<tr>
                <td>${log.full_name}</td>
                <td>${log.email}</td>
                <td>${new Date(log.logged_at).toLocaleString()}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    }
}

async function logout() {
    await _supabase.auth.signOut();
    localStorage.removeItem('last_log_date');
    window.location.reload();
}

checkUser();
