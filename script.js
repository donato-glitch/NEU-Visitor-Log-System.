

async function checkUser() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        const user = session.user;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        
        
        document.getElementById('greeting').innerText = "Welcome to NEU Library!";

        
        const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'eduardo.donato@neu.edu.ph'];
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
