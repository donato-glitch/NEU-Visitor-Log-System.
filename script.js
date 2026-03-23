const ADMIN_PASS = "admin123";

async function login() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessCode = urlParams.get('access');

    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';

    if (accessCode === ADMIN_PASS) {
        document.getElementById('user-status').innerText = "Admin: Professor Mode";
        document.getElementById('role-switch-btn').style.display = 'block';
        showView('admin');
        loadAdminLogs();
    } else {
        document.getElementById('user-status').innerText = "Visitor Mode";
        document.getElementById('role-switch-btn').style.display = 'none';
        showView('kiosk');
    }
}

async function checkSession() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-app').style.display = 'none';
}

async function logout() {
    window.location.href = window.location.origin + window.location.pathname;
}

async function loadAdminLogs() {
    const { data, error } = await _supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return;

    const tbody = document.getElementById('admin-log-body');
    tbody.innerHTML = '';
    
    let studentCount = 0;
    let staffCount = 0;

    data.forEach(log => {
        const row = `<tr>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td>${log.full_name}</td>
            <td>${log.user_type}</td>
            <td>${log.college || 'N/A'}</td>
            <td>${log.reason}</td>
        </tr>`;
        tbody.innerHTML += row;

        if (log.user_type === 'Student') studentCount++;
        else staffCount++;
    });

    document.getElementById('total-visitors').innerText = data.length;
    document.getElementById('student-count').innerText = studentCount;
    document.getElementById('staff-count').innerText = staffCount;
}

async function submitVisitorData(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = 'Submitting...';

    const formData = {
        full_name: document.getElementById('full_name').value,
        user_type: document.getElementById('user_type').value,
        college: document.getElementById('college').value,
        reason: document.getElementById('reason').value
    };

    const { error } = await _supabase.from('visitors').insert([formData]);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('Successfully Registered!');
        document.getElementById('visitor-form').reset();
    }
    btn.disabled = false;
    btn.innerText = 'Submit Entry';
}

function showView(view) {
    document.getElementById('admin-view').style.display = view === 'admin' ? 'block' : 'none';
    document.getElementById('kiosk-view').style.display = view === 'kiosk' ? 'block' : 'none';
}

window.onload = checkSession;
