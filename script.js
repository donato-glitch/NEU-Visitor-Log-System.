const supabaseUrl = 'https://nkskdibsqyxgirotoly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rc2tkaWJzcXl4Z2lyb3RvbHkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3Mzc1NjE0NCwiZXhwIjoyMDg5MzMyMTQ0fQ.yq3jFykJN4EVgIJ1gTpf1ue2tq1zNz6keVCBcLxSAwc';

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'jcesperanza@neu.edu.ph';

// 1. Login Function
document.getElementById('login-btn').addEventListener('click', async () => {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) console.error("Login Error:", error.message);
});

// 2. Check Session & UI Update
async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (session) {
        const user = session.user;
        // Itago ang login section
        document.getElementById('auth-section').style.display = 'none';

        if (user.email === ADMIN_EMAIL) {
            // ADMIN VIEW (Para kay Prof Jerry)
            document.getElementById('admin-section').style.display = 'block';
            document.getElementById('greeting').innerText = "Welcome, Admin Jeremias!";
        } else {
            // REGULAR USER VIEW (Para sa students)
            document.getElementById('user-section').style.display = 'block';
            const name = user.user_metadata.full_name || user.email;
            document.getElementById('greeting').innerText = "Welcome, " + name + "!";
        }
    }
}

checkUser();
