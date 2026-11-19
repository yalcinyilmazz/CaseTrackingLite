
const SUPABASE_URL =
'https://oumgjcfdaojmyddhxjey.supabase.co';

const SUPABASE_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bWdqY2ZkYW9qbXlkZGh4amV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMDMxNTEsImV4cCI6MjExMDU3OTE1MX0._BOQg4L_2HTl-GnXFc-UqP-5EikrHq7jnywhHKeYuzY';

const db =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let cases = [];

let modal;

window.onload = async function () {

    modal = new bootstrap.Modal(
        document.getElementById('caseModal')
    );

    await loadCasesFromDb();
};

function showAddForm(){

    document.getElementById('caseId').value='';
    document.getElementById('title').value='';
    document.getElementById('description').value='';
    document.getElementById('status').value='Open';
    document.getElementById('assigned').value='';

    modal.show();
}

async function saveCase() {

    let id = document.getElementById('caseId').value;

    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let status = document.getElementById('status').value;
    let assigned = document.getElementById('assigned').value;

    if (title.trim() === '') {

        alert('Title zorunlu');

        return;
    }

    if (id === '') {

        const { error } = await db
            .from('cases')
            .insert([
                {
                    title: title,
                    description: description,
                    status: status,
                    assigned: assigned
                }
            ]);

        if (error) {
            console.error(error);
            alert('Kayıt eklenemedi');
            return;
        }
    }
    else {

        const { error } = await db
            .from('cases')
            .update({
                title: title,
                description: description,
                status: status,
                assigned: assigned
            })
            .eq('id', id);

        if (error) {
            console.error(error);
            alert('Güncelleme başarısız');
            return;
        }
    }

    await loadCasesFromDb();

    modal.hide();
}

function loadTable(){

    let tbody =
        document.getElementById('caseTableBody');

    tbody.innerHTML = '';

    cases.forEach(item => {

        let badge='';

        if(item.status==='Open')
            badge='<span class="badge-status open">Open</span>';

        if(item.status==='In Progress')
            badge='<span class="badge-status inprogress">In Progress</span>';

        if(item.status==='Waiting IT')
            badge='<span class="badge-status waiting">Waiting IT</span>';

        if(item.status==='Completed')
            badge='<span class="badge-status completed">Completed</span>';

        tbody.innerHTML += `
        <tr>

            <td>${item.id}</td>

            <td>${item.title}</td>

            <td>${item.description}</td>

            <td>${badge}</td>

            <td>${item.assigned}</td>

            <td>${item.date}</td>

            <td>

                <button class="btn btn-primary btn-sm"
                onclick="editCase(${item.id})">
                Edit
                </button>

                <button class="btn btn-danger btn-sm"
                onclick="deleteCase(${item.id})">
                Delete
                </button>

            </td>

        </tr>
        `;
    });
}

function editCase(id){

    let item = cases.find(x => x.id == id);

    document.getElementById('caseId').value=item.id;
    document.getElementById('title').value=item.title;
    document.getElementById('description').value=item.description;
    document.getElementById('status').value=item.status;
    document.getElementById('assigned').value=item.assigned;

    modal.show();
}

async function deleteCase(id){

    if(!confirm('Silmek istediğinizden emin misiniz?'))
        return;

    const { error } = await db
        .from('cases')
        .delete()
        .eq('id', id);

    if(error){

        console.error(error);

        alert('Silme başarısız');

        return;
    }

    await loadCasesFromDb();
}

function filterCases(){

    let value =
        document.getElementById("searchInput")
            .value
            .toLowerCase();

    let rows =
        document.querySelectorAll("#caseTableBody tr");

    rows.forEach(row => {

        row.style.display =
            row.innerText.toLowerCase().includes(value)
                ? ''
                : 'none';
    });
}


async function loadCasesFromDb() {

    const { data, error } = await db
        .from('cases')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    cases = data.map(x => ({
        id: x.id,
        title: x.title,
        description: x.description,
        status: x.status,
        assigned: x.assigned,
        date: new Date(x.created_date)
            .toLocaleString('tr-TR')
    }));

    loadTable();
}
//database pass : Yalcin.Yilmaz11*