const supabaseUrl = 'https://nkskdibhsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJoc3F5eGdpcm90b2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTYxNDQsImV4cCI6MjA4OTMzMjE0NH0.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'jcesperanza@neu.edu.ph';

document.getElementById('login-btn').addEventListener('click', async () => {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://donato-glitch.github.io/NEU-Visitor-Log-System/'
        }
    });
    if (error) console.error("Login Error:", error.message);
});

async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        const user = session.user;
        document.getElementById('auth-section').style.display = 'none';
        if (user.email === ADMIN_EMAIL) {
            document.getElementById('admin-section').style.display = 'block';
            document.getElementById('admin-greeting').innerText = "Welcome, Admin Jeremias!";
        } else {
            document.getElementById('user-section').style.display = 'block';
            const name = user.user_metadata.full_name || user.email;
            document.getElementById('greeting').innerText = "Welcome, " + name + "!";
        }
    }
}
checkUser();
