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
        
       
        document.getElementById('welcome-msg').innerText = "Welcome to NEU Library!";

        
        if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
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

// ... (retain your fetchStats, submitLog, and logout functions here)
