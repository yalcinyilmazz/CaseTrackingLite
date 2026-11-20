
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

let detailModal;

window.onload = async function () {

    modal = new bootstrap.Modal(
        document.getElementById('caseModal')
		);
	
	detailModal = new bootstrap.Modal(
    document.getElementById('detailModal')
);




    const {
        data: { session }
    } = await db.auth.getSession();

    if (
        session &&
        allowedUsers.includes(
            session.user.email
        )
    ) {

        document.getElementById(
            'loginContainer'
        ).style.display = 'none';

        document.getElementById(
            'appContainer'
        ).style.display = 'block';




		
        await loadCasesFromDb();
		
		
    }
	

document.addEventListener("keydown", function(event) {

    const modalElement =
        document.getElementById('caseModal');

    const modalOpen =
        modalElement &&
        modalElement.classList.contains('show');

    if (modalOpen) {

        if (event.key === "Escape") {

            modal.hide();
        }

        console.log("CTRL ENTER ALGILANDI");
		if (event.ctrlKey &&
            event.key === "Enter") {

            event.preventDefault();

            saveCase();
        }
    }

    const loginVisible =
        document.getElementById('loginContainer')
            .style.display !== 'none';

    if (
        loginVisible &&
        event.key === "Enter"
    ) {

        login();
    }
	
	if (
    !loginVisible &&
    event.altKey &&
    event.key.toLowerCase() === "a"
) {

    event.preventDefault();

    showAddForm();
}

if (
    !loginVisible &&
    event.altKey &&
    event.key.toLowerCase() === "f"
) {

    event.preventDefault();

    document
        .getElementById('searchInput')
        .focus();

    document
        .getElementById('searchInput')
        .select();
}

});

};


const allowedUsers = [
    "yalcin.yilmaz@marport.com.tr",
    "beyhan.yildirim@marport.com.tr",
	"mehmet.bayrakal@marport.com.tr",
	"soner.oz@marport.com.tr",
    "ilayda.sariyar@marport.com.tr",
    "alper.suicmez@marport.com.tr"
];

let currentUser = null;

function showAddForm(){

    document.getElementById('caseId').value='';
    document.getElementById('title').value='';
    document.getElementById('description').value='';
    document.getElementById('status').value='Open';
    document.getElementById('assigned').value='';

    modal.show();

setTimeout(() => {

    document.getElementById('title').focus();

}, 150);
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

    const {
        data: { user }
    } = await db.auth.getUser();

    if (!user) {

        alert('Oturum bulunamadı.');

        return;
    }

    // YENİ KAYIT
    if (id === '') {

        const { error } = await db
            .from('cases')
            .insert([
                {
                    title: title,
                    description: description,
                    status: status,
                    assigned: assigned,

                    created_by: user.email,
                    updated_by: user.email,

                    change_date: new Date().toISOString()
                }
            ]);

        if (error) {

            console.error(error);

            alert('Kayıt eklenemedi');

            return;
        }
    }

    // GÜNCELLEME
    else {

        const existingCase =
            cases.find(x => x.id == id);

        if (existingCase) {

            const { error: historyError }
                = await db
                    .from('case_history')
                    .insert([
                        {
                            case_id: existingCase.id,

                            title: existingCase.title,

                            description:
                                existingCase.description,

                            status:
                                existingCase.status,

                            assigned:
                                existingCase.assigned,

                            created_by:
                                existingCase.created_by,

                            updated_by:
                                existingCase.updated_by,

                            
                        }
                    ]);

							if (historyError) {

					console.error(historyError);

					alert(
						'History kaydı oluşturulamadı: ' +
						historyError.message
					);

					return;
				}
						}

        const { error } = await db
            .from('cases')
            .update({

                title: title,

                description: description,

                status: status,

                assigned: assigned,

                updated_by: user.email,

                change_date:
                    new Date().toISOString()

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
		
		const showClosed =
    document.getElementById(
        'showClosedCases'
    )?.checked;

if (
    item.status === "Completed" &&
    !showClosed
) {
    return;
}
		
		

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
				<tr onclick="showDetails(${item.id})">


			<td>${item.id}</td>

				<td>${item.title}</td>

				<td class="description-cell">
				${item.description}
			</td>

				<td>${badge}</td>

<td>${item.assigned}</td>

<td>${item.change_date || ''}</td>

<td>${item.date}</td>

<td>${item.created_by || ''}</td>

<td>

    <button class="btn btn-primary btn-sm"
    onclick="event.stopPropagation(); editCase(${item.id})">
    Edit
    </button>

    <button class="btn btn-danger btn-sm"
    onclick="event.stopPropagation(); deleteCase(${item.id})">
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
			created_by: x.created_by,

			change_date: x.change_date
			? new Date(x.change_date)
				.toLocaleDateString('tr-TR')
			: '',

			date: new Date(x.created_date)
				.toLocaleDateString('tr-TR')

		}));

    loadTable();
}
	
	async function login() {

    const email =
        document.getElementById('loginEmail').value;

    const password =
        document.getElementById('loginPassword').value;

    const { data, error } =
        await db.auth.signInWithPassword({

            email: email,
            password: password

        });

    if (error) {

        alert("Email veya şifre hatalı !");

        return;
    }

    if (!allowedUsers.includes(email)) {

        await db.auth.signOut();

        alert(
            "Bu uygulamaya erişim yetkiniz bulunmamaktadır."
        );

        return;
    }

    currentUser = data.user;
const emailPart =
    currentUser.email.split('@')[0];

const fullName =
    emailPart
        .split('.')
        .map(
            x => x.charAt(0).toUpperCase() +
                 x.slice(1).toLowerCase()
        )
        .join(' ');

document.getElementById(
    'currentUserName'
).innerText =
    fullName;

    document.getElementById(
        'loginContainer'
    ).style.display = 'none';

    document.getElementById(
        'appContainer'
    ).style.display = 'block';
	
	document.body.style.background =
'linear-gradient(135deg, #1ba0e1 0%, #005cbf 35%, #003b82 100%)';

    await loadCasesFromDb();
}

async function logout() {

    await db.auth.signOut();

    location.reload();
}

async function changePassword() {

    const newPassword = prompt(
        "Yeni şifrenizi giriniz"
    );

    if (!newPassword)
        return;

    if (newPassword.length < 6) {

        alert(
            "Şifre en az 6 karakter olmalıdır."
        );

        return;
    }

    const { error } =
        await db.auth.updateUser({

            password: newPassword

        });

    if (error) {

        console.error(error);

        alert(
            "Şifre değiştirilemedi."
        );

        return;
    }

    alert(
        "Şifreniz başarıyla güncellendi."
    );
}



function handleCtrlEnter(event) {

    if (event.ctrlKey && event.key === "Enter") {

        saveCase();
    }
}


function handleEsc(event) {

    if (event.key === "Escape") {

        modal.hide();
    }
}

function filterClosedCases() {

    loadTable();
}



async function showDetails(id) {

    const item =
        cases.find(x => x.id == id);

    if (!item)
        return;

    document.getElementById(
        'detailTitle'
    ).innerText =
        item.title;

    document.getElementById(
        'detailDescription'
    ).innerText =
        item.description;

    document.getElementById(
        'detailStatus'
    ).innerText =
        item.status;

    document.getElementById(
        'detailAssigned'
    ).innerText =
        item.assigned;

    document.getElementById(
        'detailChangeDate'
    ).innerText =
        item.change_date || '';

    document.getElementById(
        'detailCreatedBy'
    ).innerText =
        item.created_by || '';

    document.getElementById(
        'detailDate'
    ).innerText =
        item.date;

    document.getElementById(
        'detailModalTitle'
    ).innerText =
        `Case Detail #${item.id}`;

    const { data: historyData, error: historyError }
        = await db
            .from('case_history')
            .select('*')
            .eq('case_id', id)
            .order('history_id', {
                ascending: false
            });

    if (!historyError) {

        renderHistory(historyData);
    }

    detailModal.show();
}

function renderHistory(historyData) {

    const container =
        document.getElementById(
            'historyContainer'
        );

    if (
        !historyData ||
        historyData.length === 0
    ) {

        container.innerHTML = `
            <div class="alert alert-light">
                Bu kayıt için henüz geçmiş versiyon bulunmuyor.
            </div>
        `;

        return;
    }

    let html = '';

    historyData.forEach(item => {

        html += `

			<div class="history-card">

				<div class="history-date">

					${item.snapshot_date
						? new Date(item.snapshot_date)
							.toLocaleDateString('tr-TR')
						: ''}

				</div>

							<div class="history-description">
				<p>${item.description || ''}</p>
			</div>

			</div>

			`;
    });

    container.innerHTML = html;
	
	

}

function exportToExcel() {

    const excelData =
        cases.map(item => ({

            ID: item.id,

            Title: item.title,

            Description: item.description,

            Status: item.status,

            Assigned: item.assigned,

            LastChange: item.change_date,

            Date: item.date,

            CreatedBy: item.created_by

        }));

    const worksheet =
        XLSX.utils.json_to_sheet(
            excelData
        );

    worksheet["!cols"] = [

        { wch: 8 },   // ID
        { wch: 25 },  // Title
        { wch: 60 },  // Description
        { wch: 18 },  // Status
        { wch: 25 },  // Assigned
        { wch: 15 },  // LastChange
        { wch: 15 },  // Date
        { wch: 35 }   // CreatedBy

    ];

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Cases'
    );

    XLSX.writeFile(
        workbook,
        'CaseTracking.xlsx'
    );
}

//database pass : Yalcin.Yilmaz11*
