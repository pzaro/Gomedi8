// ==========================================
// 1. GOOGLE SHEETS & DATA SETUP
// ==========================================

const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyAZ0Inog6pOzlNLx5qh8viyfn0ifPvmKpHkNbGg5MT6fTEqfAcxKEO1IE7CGVFZsP8/exec"; 

// Αρχικοποίηση με κενά πεδία
let m_data = {
    n: "", s: "", f: "", am: "", iban: "", bank: "", addr: "", email: ""
};

const emptyPerson = () => ({
    n: '', s: '', f: '', addr: '', afm: '', tel: '', mob: '', email: '',
    l_n: '', l_s: '', l_f: '', l_addr: '', l_email: '', l_am: '', l_ds: '', l_afm: '', l_tel: '', l_mob: '',
    p_party: true, p_law: true
});

let reqs = [emptyPerson()];
let resps = [emptyPerson()];
let currentPartyIdx = 0;


// ==========================================
// 1.5. CLOUD REGISTRATION & FETCH LOGIC (GOOGLE SHEETS)
// ==========================================

async function registerMediator() {
    const am = document.getElementById('reg_m_amd').value.trim();
    const f = document.getElementById('reg_m_f').value.trim();
    const n = document.getElementById('reg_m_n').value.trim();
    const s = document.getElementById('reg_m_s').value.trim();
    const iban = document.getElementById('reg_m_iban').value.trim();
    const bank = document.getElementById('reg_m_bank').value.trim();
    const addr = document.getElementById('reg_m_addr').value.trim();
    const email = document.getElementById('reg_m_email').value.trim();

    if(!am || !n || !s) { alert("Παρακαλώ συμπληρώστε τουλάχιστον ΑΜΔ, Όνομα και Επώνυμο."); return; }

    const url = `${GOOGLE_APP_SCRIPT_URL}?action=writeMediator&am=${encodeURIComponent(am)}&n=${encodeURIComponent(n)}&s=${encodeURIComponent(s)}&f=${encodeURIComponent(f)}&iban=${encodeURIComponent(iban)}&bank=${encodeURIComponent(bank)}&addr=${encodeURIComponent(addr)}&email=${encodeURIComponent(email)}`;
    document.getElementById('reg_m_amd').value = "Αποθήκευση..."; 
    
    try {
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.status === "success") {
            alert("✅ Ο Διαμεσολαβητής αποθηκεύτηκε επιτυχώς στο Google Sheet!");
            document.getElementById('reg_m_amd').value = ''; document.getElementById('reg_m_f').value = '';
            document.getElementById('reg_m_n').value = ''; document.getElementById('reg_m_s').value = '';
            document.getElementById('reg_m_iban').value = ''; document.getElementById('reg_m_bank').value = '';
            document.getElementById('reg_m_addr').value = ''; document.getElementById('reg_m_email').value = '';
        } else if (data.message === "Exists") {
            alert("⚠️ Προσοχή: Υπάρχει ήδη Διαμεσολαβητής με αυτό το ΑΜΔ στο Google Sheet!");
            document.getElementById('reg_m_amd').value = am;
        }
    } catch(e) {
        alert("❌ Σφάλμα σύνδεσης. Ελέγξτε το Internet.");
        document.getElementById('reg_m_amd').value = am;
    }
}

async function loadMediator() {
    const inputAMD = document.getElementById('mediator_amd_input').value.trim();
    if(!inputAMD) return;
    
    document.getElementById('mediator_amd_input').value = "Φόρτωση...";

    const url = `${GOOGLE_APP_SCRIPT_URL}?action=readMediator&am=${encodeURIComponent(inputAMD)}`;
    
    try {
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.status === "success") {
            m_data = { ...data.data };
            draw();
            alert(`✅ Δεδομένα ελήφθησαν από Google Sheets!\nΔιαμεσολαβητής: ${m_data.n} ${m_data.s}\nΑΜΔ: ${m_data.am}`);
            document.getElementById('mediator_amd_input').value = ""; 
        } else {
            alert("❌ Δεν βρέθηκε Διαμεσολαβητής με αυτό το ΑΜΔ στο Cloud. Πηγαίνετε στην 'ΕΓΓΡΑΦΗ ΧΡΗΣΤΩΝ' για να τον προσθέσετε.");
            document.getElementById('mediator_amd_input').value = inputAMD;
        }
    } catch(e) {
        alert("❌ Σφάλμα σύνδεσης με το Google Sheet.");
        document.getElementById('mediator_amd_input').value = inputAMD;
    }
}

async function registerLawyer() {
    const afm = document.getElementById('reg_l_afm').value.trim();
    const mob = document.getElementById('reg_l_mob').value.trim();
    const tel = document.getElementById('reg_l_tel').value.trim();
    const n = document.getElementById('reg_l_n').value.trim();
    const s = document.getElementById('reg_l_s').value.trim();
    const f = document.getElementById('reg_l_f').value.trim();
    const am = document.getElementById('reg_l_am').value.trim();
    const ds = document.getElementById('reg_l_ds').value.trim();
    const addr = document.getElementById('reg_l_addr').value.trim();
    const email = document.getElementById('reg_l_email').value.trim();

    if(!afm && !mob) { alert("Συμπληρώστε ΑΦΜ ή Κινητό για να είναι δυνατή η αναζήτηση."); return; }
    if(!n || !s) { alert("Συμπληρώστε Όνομα και Επώνυμο."); return; }

    const url = `${GOOGLE_APP_SCRIPT_URL}?action=writeLawyer&afm=${encodeURIComponent(afm)}&mob=${encodeURIComponent(mob)}&tel=${encodeURIComponent(tel)}&n=${encodeURIComponent(n)}&s=${encodeURIComponent(s)}&f=${encodeURIComponent(f)}&am=${encodeURIComponent(am)}&ds=${encodeURIComponent(ds)}&addr=${encodeURIComponent(addr)}&email=${encodeURIComponent(email)}`;
    document.getElementById('reg_l_n').value = "Αποθήκευση...";

    try {
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.status === "success") {
            alert("✅ Ο Δικηγόρος αποθηκεύτηκε επιτυχώς στο Google Sheet!");
            document.getElementById('reg_l_afm').value = ''; document.getElementById('reg_l_mob').value = '';
            document.getElementById('reg_l_tel').value = ''; document.getElementById('reg_l_n').value = '';
            document.getElementById('reg_l_s').value = ''; document.getElementById('reg_l_f').value = '';
            document.getElementById('reg_l_am').value = ''; document.getElementById('reg_l_ds').value = '';
            document.getElementById('reg_l_addr').value = ''; document.getElementById('reg_l_email').value = '';
        } else if (data.message === "Exists") {
            alert("⚠️ Προσοχή: Υπάρχει ήδη Δικηγόρος με αυτό το ΑΦΜ ή Κινητό στο Google Sheet!");
            document.getElementById('reg_l_n').value = n;
        }
    } catch(e) {
        alert("❌ Σφάλμα σύνδεσης. Ελέγξτε το Internet.");
        document.getElementById('reg_l_n').value = n;
    }
}

async function autoFillLawyer(val, type, idx, isResp) {
    if(!val.trim()) return;
    
    let arr = isResp ? resps : reqs;
    let oldVal = type === 'afm' ? arr[idx].l_afm : arr[idx].l_mob;
    
    if(type === 'afm') arr[idx].l_afm = "Φόρτωση...";
    if(type === 'mob') arr[idx].l_mob = "Φόρτωση...";
    renderLists();

    const url = `${GOOGLE_APP_SCRIPT_URL}?action=readLawyer&query=${encodeURIComponent(val.trim())}`;
    
    try {
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.status === "success") {
            arr[idx].l_afm = data.data.afm || '';
            arr[idx].l_mob = data.data.mob || '';
            arr[idx].l_tel = data.data.tel || '';
            arr[idx].l_n = data.data.n || '';
            arr[idx].l_s = data.data.s || '';
            arr[idx].l_f = data.data.f || '';
            arr[idx].l_am = data.data.am || '';
            arr[idx].l_ds = data.data.ds || '';
            arr[idx].l_addr = data.data.addr || '';
            arr[idx].l_email = data.data.email || '';
            renderLists();
            draw();
        } else {
            alert("❌ Δεν βρέθηκε Δικηγόρος στο Cloud με αυτά τα στοιχεία.");
            if(type === 'afm') arr[idx].l_afm = val.trim();
            if(type === 'mob') arr[idx].l_mob = val.trim();
            renderLists();
        }
    } catch(e) {
        if(type === 'afm') arr[idx].l_afm = val.trim();
        if(type === 'mob') arr[idx].l_mob = val.trim();
        renderLists();
    }
}


// ==========================================
// 2. UI RENDERING FUNCTIONS
// ==========================================
function addReq() { reqs.push(emptyPerson()); renderLists(); draw(); }
function rmReq(idx) { reqs.splice(idx, 1); renderLists(); draw(); }
function addResp() { resps.push(emptyPerson()); renderLists(); draw(); }
function rmResp(idx) { resps.splice(idx, 1); renderLists(); draw(); }

function renderLists() {
    const buildForm = (arr, prefix, idx, isResp) => {
        const r = arr[idx];
        const arrName = isResp ? 'resps' : 'reqs';
        const title = isResp ? `Έτερο Μέρος ${arr.length > 1 ? idx+1 : ''}` : `Επισπεύδων ${arr.length > 1 ? idx+1 : ''}`;
        
        return `
        <div class="party-block">
            <div class="party-title">${title}</div>
            ${idx > 0 ? `<button class="btn-rm" onclick="${isResp?'rmResp':'rmReq'}(${idx})">Διαγραφή</button>` : ''}
            <div class="row-3">
                <div class="form-group"><label>Όνομα</label><input value="${r.n}" oninput="${arrName}[${idx}].n=this.value; draw()"></div>
                <div class="form-group"><label>Επώνυμο</label><input value="${r.s}" oninput="${arrName}[${idx}].s=this.value; draw()"></div>
                <div class="form-group"><label>Πατρώνυμο</label><input value="${r.f}" oninput="${arrName}[${idx}].f=this.value; draw()"></div>
            </div>
            <div class="row-2">
                <div class="form-group"><label>Διεύθυνση</label><input value="${r.addr}" oninput="${arrName}[${idx}].addr=this.value; draw()"></div>
                <div class="form-group"><label>ΑΦΜ</label><input value="${r.afm}" oninput="${arrName}[${idx}].afm=this.value; draw()"></div>
            </div>
            <div class="row-3">
                <div class="form-group"><label>Κινητό</label><input value="${r.mob}" oninput="${arrName}[${idx}].mob=this.value; draw()"></div>
                <div class="form-group"><label>Email</label><input value="${r.email}" oninput="${arrName}[${idx}].email=this.value; draw()"></div>
            </div>
            <label class="chk-label"><input type="checkbox" ${r.p_party?'checked':''} onchange="${arrName}[${idx}].p_party=this.checked; draw()"> ΠΑΡΩΝ/ΟΥΣΑ ΣΤΗΝ ΥΑΣ</label>
            
            <div class="sub-title" style="display:flex; justify-content: space-between; align-items: center;">
                <span>Νομικός Παραστάτης</span>
                <span style="font-size: 0.7rem; color: #64748b; font-weight: normal; text-transform: none;">Cloud Αναζήτηση (Enter)</span>
            </div>
            <div class="row-2" style="background: #f0f9ff; padding: 10px; border-radius: 6px; border: 1px dashed #bae6fd; margin-bottom: 10px;">
                <div class="form-group" style="margin:0;"><label>ΑΦΜ 🔍</label><input value="${r.l_afm}" placeholder="Βάλε ΑΦΜ & Enter..." onchange="autoFillLawyer(this.value, 'afm', ${idx}, ${isResp})"></div>
                <div class="form-group" style="margin:0;"><label>Κινητό 🔍</label><input value="${r.l_mob}" placeholder="Βάλε Κινητό & Enter..." onchange="autoFillLawyer(this.value, 'mob', ${idx}, ${isResp})"></div>
            </div>
            <div class="row-3">
                <div class="form-group"><label>Όνομα Δικηγόρου</label><input value="${r.l_n}" placeholder="Όνομα..." oninput="${arrName}[${idx}].l_n=this.value; draw()"></div>
                <div class="form-group"><label>Επώνυμο Δικηγόρου</label><input value="${r.l_s}" placeholder="Επώνυμο..." oninput="${arrName}[${idx}].l_s=this.value; draw()"></div>
                <div class="form-group"><label>Πατρώνυμο</label><input value="${r.l_f}" placeholder="Πατρώνυμο..." oninput="${arrName}[${idx}].l_f=this.value; draw()"></div>
            </div>
            <div class="row-3">
                <div class="form-group"><label>Σταθερό Τηλ.</label><input value="${r.l_tel}" placeholder="Σταθερό..." oninput="${arrName}[${idx}].l_tel=this.value; draw()"></div>
                <div class="form-group"><label>Α.Μ.</label><input value="${r.l_am}" placeholder="π.χ. 1234" oninput="${arrName}[${idx}].l_am=this.value; draw()"></div>
                <div class="form-group"><label>Δ.Σ.</label><input value="${r.l_ds}" placeholder="π.χ. ΔΣΑ" oninput="${arrName}[${idx}].l_ds=this.value; draw()"></div>
            </div>
            <div class="row-2">
                <div class="form-group"><label>Διεύθυνση Δικηγόρου</label><input value="${r.l_addr}" placeholder="Διεύθυνση..." oninput="${arrName}[${idx}].l_addr=this.value; draw()"></div>
                <div class="form-group"><label>Email Δικηγόρου</label><input value="${r.l_email}" placeholder="Email..." oninput="${arrName}[${idx}].l_email=this.value; draw()"></div>
            </div>
            <label class="chk-label"><input type="checkbox" ${r.p_law?'checked':''} onchange="${arrName}[${idx}].p_law=this.checked; draw()"> ΔΙΚΗΓΟΡΟΣ ΠΑΡΩΝ/ΟΥΣΑ</label>
        </div>`;
    };
    document.getElementById('req_container').innerHTML = reqs.map((_, i) => buildForm(reqs, 'Req', i, false)).join('');
    document.getElementById('resp_container').innerHTML = resps.map((_, i) => buildForm(resps, 'Resp', i, true)).join('');
}

const fmtD = (d) => d ? d.split('-').reverse().join('/') : "................";
const getDay = (d) => d ? ["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"][new Date(d).getDay()] : "................";
const getFullName = (n, s) => [n, s].filter(Boolean).join(' ') || "................";

function updatePartySelect() {
    const sel = document.getElementById('party_select');
    const all = [...reqs, ...resps];
    if (currentPartyIdx >= all.length) currentPartyIdx = 0;
    sel.innerHTML = all.map((p, i) => `<option value="${i}" ${i==currentPartyIdx?'selected':''}>${getFullName(p.n, p.s)} ${i<reqs.length?'(Επισπεύδων)':'(Έτερο Μέρος)'}</option>`).join('');
}

function changeParty() { currentPartyIdx = parseInt(document.getElementById('party_select').value); draw(); }

function draw() {
    const d = {
        fee: document.getElementById('m_fee').value,
        subj: document.getElementById('p_subj').value || "................",
        court: document.getElementById('p_court').value || "................",
        court_d: document.getElementById('p_court_d').value || "................",
        court_n: document.getElementById('p_court_n').value || "................",
        z_date: document.getElementById('yas_date').value,
        z_time: document.getElementById('yas_time').value || "....:....",
        z_link: document.getElementById('z_link').value || "................",
        z_id: document.getElementById('z_id').value || "................",
        z_pass: document.getElementById('z_pass').value || "................",
        notify_date: document.getElementById('notify_date').value,
        doc_date: document.getElementById('doc_date').value || "................",
        type: document.getElementById('doc_type').value
    };

    document.getElementById('party_select_container').style.display = (d.type === 'prosklisi') ? 'block' : 'none';
    if(d.type === 'prosklisi') updatePartySelect();

    const zoomFrame = `<br>Ημερομηνία: ${fmtD(d.z_date)}<br>Ώρα: ${d.z_time}<br>Μέσο: Μέσω της πλατφόρμας τηλεδιάσκεψης Zoom (εντός της συνημμένης πρόσκλησης θα βρείτε την σύνδεσμο σύνδεσης).<br>`;
    
    const zoomFrameEntypo = `
<div style="border: 1.5pt solid #2563eb; padding: 15pt; margin: 20pt auto; background-color: #f0f7ff; width: 100%; box-sizing: border-box; text-align: center; border-radius: 8pt;">
    <div style="font-weight: bold; font-size: 13pt; margin-bottom: 10pt; text-decoration: underline;">ΥΠΟΧΡΕΩΤΙΚΗ ΑΡΧΙΚΗ ΣΥΝΕΔΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</div>
    <b>Ημερομηνία:</b> ${fmtD(d.z_date)} &nbsp;&nbsp;&nbsp; <b>Ώρα:</b> ${d.z_time}<br><br>
    <b>Σύνδεσμος/Link:</b> <a href="${d.z_link}" style="color: #2563eb;">${d.z_link}</a><br><br>
    <b>Meeting ID:</b> ${d.z_id}<br>
    <b>Passcode:</b> ${d.z_pass}
</div>`;

    const reqsEnarktiria = reqs.map(r => `τον/την ${getFullName(r.n, r.s)}, ο/η οποίος/α εκπροσωπείται από τον δικηγόρο του/της, ${getFullName(r.l_n, r.l_s) || "......."}`).join(' και ');
    const respsEnarktiria = resps.map(r => `τον/την ${getFullName(r.n, r.s)}, ο/η οποίος/α εκπροσωπείται από τον δικηγόρο του/της, ${getFullName(r.l_n, r.l_s) || "......."}`).join(' και ');

    const warningMsg = "<span style='color: red;'>[Καταχωρίστε ΑΜΔ διαμεσολαβητή]</span>";
    const mediatorFullName = m_data.n ? `${m_data.n} ${m_data.s}`.trim() : warningMsg;
    const m_iban = m_data.iban || warningMsg;
    const m_bank = m_data.bank || warningMsg;
    const m_f = m_data.f || warningMsg;
    const m_am = m_data.am || warningMsg;

    let praktikoReqHTML = '';
    reqs.forEach((r, i) => {
        let chkParty = r.p_party ? '[ ☒ ]' : '[ ☐ ]';
        let chkPartyNot = !r.p_party ? '[ ☒ ]' : '[ ☐ ]';
        let chkLaw = r.p_law ? '[ ☒ ]' : '[ ☐ ]';
        let chkLawNot = !r.p_law ? '[ ☒ ]' : '[ ☐ ]';
        
        praktikoReqHTML += `
<b>Α. ΕΠΙΣΠΕΥΔΟΝ ΜΕΡΟΣ ${reqs.length > 1 ? i+1 : ''}</b><br>
Ονοματεπώνυμο: ${getFullName(r.n, r.s)} του ${r.f || "......."}<br>
παραστάθηκε: ${chkParty}    δεν παραστάθηκε: ${chkPartyNot}<br>
Ημερομηνία: ${d.doc_date}<br>
<div style="text-align: right; padding-right: 50px;">Υπογραφή επισπεύδοντας<br>…………………………….</div>
Μέσο γνωστοποίησης:<br>
Συστημένη Επιστολή  [ ☒ ]<br>
Email	 [ ☐ ]<br>
Άλλο (προσδιορίστε) [ ☐ ] ........................<br><br>
Νομικός παραστάτης επισπεύδοντας<br>
Ονοματεπώνυμο: ${getFullName(r.l_n, r.l_s) || "......."}<br>
παραστάθηκε: ${chkLaw}    δεν παραστάθηκε: ${chkLawNot}<br>
Ημερομηνία: ${d.doc_date}<br>
<div style="text-align: right; padding-right: 50px;">Υπογραφή νομικού παραστάτη<br>……………..</div>
Μέσο γνωστοποίησης:<br>
Συστημένη Επιστολή  [ ☐ ]<br>
Email	 [ ☒ ]<br>
Άλλο (προσδιορίστε) [ ☐ ] ........................<br><br>`;
    });

    let praktikoRespHTML = '';
    resps.forEach((r, i) => {
        let chkParty = r.p_party ? '[ ☒ ]' : '[ ☐ ]';
        let chkPartyNot = !r.p_party ? '[ ☒ ]' : '[ ☐ ]';
        let chkLaw = r.p_law ? '[ ☒ ]' : '[ ☐ ]';
        let chkLawNot = !r.p_law ? '[ ☒ ]' : '[ ☐ ]';

        praktikoRespHTML += `
<b>Β. ΕΤΕΡΑ ΜΕΡΟΣ ${resps.length > 1 ? i+1 : ''}</b><br>
Ονοματεπώνυμο: ${getFullName(r.n, r.s)} του ${r.f || "......."}<br>
παραστάθηκε: ${chkParty}    δεν παραστάθηκε: ${chkPartyNot}<br>
Ημερομηνία: ${d.doc_date}<br>
<div style="text-align: right; padding-right: 50px;">Υπογραφή ετέρου μέρους<br>………………………….</div>
Μέσο γνωστοποίησης:<br>
Συστημένη Επιστολή [ ☐ ]<br>
Email [ ☒ ]<br><br>
Νομικός παραστάτης ετέρου μέρους<br>
Ονοματεπώνυμο: ${getFullName(r.l_n, r.l_s) || "......."}<br>
παραστάθηκε: ${chkLaw}    δεν παραστάθηκε: ${chkLawNot}<br>
Ημερομηνία: ${d.doc_date}<br>
<div style="text-align: right; padding-right: 50px;">Υπογραφή νομικού παραστάτη<br>………………………….</div><br>`;
    });

    let activeHtml = '';

    if (d.type === 'email') {
        activeHtml = `Αξιότιμες κυρίες, Αξιότιμοι κύριοι,<br><br>
Ονομάζομαι ${mediatorFullName} και είμαι Διαπιστευμένος Διαμεσολαβητής. Σε συνέχεια του διορισμού μου από την Κεντρική Επιτροπή Διαμεσολάβησης (ΚΕΔ), επικοινωνώ μαζί σας σχετικά με την ιδιωτική διαφορά που έχει ανακύψει μεταξύ σας, η οποία αποτελεί αντικείμενο της από ${d.court_d} αγωγής που κατατέθηκε στο ${d.court} με αριθμό κατάθεσης ${d.court_n}.<br><br>
Με την παρούσα επιστολή, σας προσκαλώ στην Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) Διαμεσολάβησης, η οποία θα διεξαχθεί:<br>
${zoomFrame}<br>
Η αμοιβή για τη διεξαγωγή της ΥΑΣ ανέρχεται στο ποσό των ${d.fee}. Το ποσό θα πρέπει να έχει κατατεθεί πριν την έναρξη της συνεδρίας στον λογαριασμό IBAN: ${m_iban}, Τράπεζα ${m_bank}.<br><br>
Θα ήθελα να αξιοποιήσω αυτή την ευκαιρία για να σας δώσω μια σαφέστερη εικόνα για τη διαδικασία που θα ακολουθήσουμε.<br><br>
<b>Τι είναι η Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ);</b><br>
Σκεφτείτε αυτή τη συνάντηση όχι ως δικαστήριο, αλλά ως μια πρώτη γνωριμία. Είναι μια σύντομη, υποχρεωτική συνάντηση όπου, μαζί με τους δικηγόρους σας, θα έχουμε την ευκαιρία:<br>
• Να γνωριστούμε.<br>
• Να σας εξηγήσω αναλυτικά και με απλά λόγια τι είναι η διαμεσολάβηση.<br>
• Να διερευνήσουμε από κοινού εάν επιθυμείτε να δώσετε μια ευκαιρία στην επίλυση της διαφοράς σας εξωδικαστικά, μέσω της πλήρους διαδικασίας της διαμεσολάβησης.<br><br>
<b>Ο Ρόλος μου ως Διαμεσολαβητής</b><br>
Είναι σημαντικό να γνωρίζετε ότι ο ρόλος μου δεν είναι αυτός του δικαστή. Δεν κρίνω, δεν επιβάλλω λύσεις και δεν αποφασίζω ποιος έχει δίκιο ή άδικο. Λειτουργώ ως ένας τρίτος, ουδέτερος και αμερόληπτος, με μοναδικό σκοπό να διευκολύνω την επικοινωνία μεταξύ σας, ώστε εσείς οι ίδιοι να βρείτε μια κοινά αποδεκτή λύση ΑΝ ΤΟ ΑΠΟΦΑΣΙΣΕΤΕ.<br><br>
<b>Τι είναι η Διαμεσολάβηση; Ένας Δρόμος που Εσείς Ελέγχετε</b><br>
Η διαμεσολάβηση είναι μια ευέλικτη και σύγχρονη διαδικασία επίλυσης διαφορών, όπου ο έλεγχος παραμένει στα χέρια σας. Τα βασικά της χαρακτηριστικά είναι:<br>
• Εμπιστευτικότητα: Οτιδήποτε συζητηθεί στη διαμεσολάβηση είναι απόρρητο. Δεν μπορεί να χρησιμοποιηθεί εναντίον σας στο δικαστήριο. Αυτό δημιουργεί ένα ασφαλές περιβάλλον για έναν ειλικρινή και εποικοδομητικό διάλογο.<br>
• Ευελιξία: Αντίθετα με την αυστηρή δικαστική απόφαση, στη διαμεσολάβηση μπορείτε να βρείτε δημιουργικές λύσεις που καλύπτουν τα πραγματικά σας συμφέροντα και ανάγκες.<br>
• Μη Δεσμευτική Φύση: Κανείς δεν σας υποχρεώνει να συμφωνήσετε. Μια λύση είναι δεσμευτική μόνο εάν και εφόσον καταλήξετε σε συμφωνία και την υπογράψετε. Μέχρι τότε, έχετε την απόλυτη ελευθερία να αποχωρήσετε.<br><br>
Στόχος μας είναι, μέσα από την καλόπιστη συνεργασία όλων, να διερευνήσουμε τη δυνατότητα μιας αμοιβαία επωφελούς συμφωνίας που θα σας εξοικονομήσει χρόνο, χρήμα και συναισθηματικό κόστος.<br><br>
Θα ακολουθήσει τηλεφωνική επικοινωνία τόσο με καθένα από εσάς αλλά και με τους δικηγόρους σας.<br>
Παραμένω στη διάθεσή σας για οποιαδήποτε διευκρίνιση.<br><br>
Με εκτίμηση,<br>
${mediatorFullName}`;

    } else if (d.type === 'enarktiri') {
        activeHtml = `<b>Εναρκτήρια δήλωση ΥΑΣ</b><br><br>
Καλησπέρα σας και καλώς ορίσατε στη σημερινή Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης. Ονομάζομαι ${mediatorFullName} και είμαι διαπιστευμένος διαμεσολαβητής. Ο ρόλος μου σήμερα είναι να σας παρουσιάσω τη δυνατότητα εξωδικαστικής επίλυσης της διαφοράς σας, με έναν τρόπο εποικοδομητικό και αμοιβαία αποδεκτό.<br><br>
Θα ήθελα να επιβεβαιώσουμε την παρουσία όλων των μερών. Από τη μία πλευρά, έχουμε την ενάγουσα πλευρά, ${reqsEnarktiria}. Από την άλλη πλευρά, έχουμε την εναγομένη πλευρά, ${respsEnarktiria}.<br><br>
Σκοπός αυτής της πρώτης, υποχρεωτικής συνεδρίας, όπως ορίζει ο νόμος 4640/2019, είναι να ενημερωθείτε για τον θεσμό της διαμεσολάβησης και να εξετάσετε από κοινού αν μπορεί να αποτελέσει ένα χρήσιμο εργαλείο για την επίλυση της δικής σας υπόθεσης.<br><br>
Ως διαμεσολαβητής, είμαι ένα ουδέτερο και αμερόληπτο τρίτο μέρος. Δεν είμαι δικαστής, δεν εκδίδω αποφάσεις και δεν πρόκειται να επιβάλω λύσεις. Ο ρόλος μου είναι να διευκολύνω την επικοινωνία μεταξύ σας, να διασφαλίσω ότι η συζήτηση θα είναι ισορροπημένη και παραγωγική και να σας βοηθήσω να αναζητήσετε πιθανές λύσεις που θα μπορούσαν να ικανοποιήσουν τα συμφέροντα και των δύο πλευρών.<br><br>
Ό,τι ειπωθεί στο πλαίσιο της διαμεσολάβησης καλύπτεται από απόρρητο. Αυτό σημαίνει ότι καμία πληροφορία που θα μοιραστείτε σήμερα ή σε τυχόν επόμενες συναντήσεις δεν μπορεί να χρησιμοποιηθεί σε μελλοντική δικαστική διαδικασία.<br><br>
Είναι σημαντικό να τονιστεί ότι μετά το πέρας αυτής της αρχικής συνεδρίας, η συνέχιση της διαδικασίας είναι απολύτως εθελοντική. Εάν οποιοδήποτε από τα μέρη δεν επιθυμεί να συνεχίσει, μπορεί να αποχωρήσει ελεύθερα, χωρίς καμία κύρωση ή αιτιολογία.<br><br>
Η διαμεσολάβηση αποτελεί μία άτυπη και διαρθρωμένη διαδικασία, με στόχο την ανεύρεση μια κοινά αποδεκτής συμφωνίας από πλευράς σας. Είναι εκούσια και μη δεσμευτική μέχρι την υπογραφή της επιθυμητής συμφωνίας. Εκούσια διότι εδώ προσέρχεστε με δική σας βούληση ενώ είστε ελεύθεροι να αποχωρήσετε ανά πάσα στιγμή.<br><br>
Εδώ δεν είναι δικαστήριο, αυτό σημαίνει ότι δεν ακολουθούμε αποδεικτική διαδικασία. Οι όποιες παραχωρήσεις, προσφορές & παραδοχές καθώς και το σύνολο αυτών που θα ειπωθούν στις κοινές μας συναντήσεις είτε στις κατ’ ιδίαν δεν μπορούν να χρησιμοποιηθούν στο δικαστήριο ή να κοινολογηθούν σε τρίτους -σε περίπτωση μη επίτευξης συμφωνίας, από κανέναν σας.<br><br>
Από την πλευρά μου επίσης, τίποτα από αυτά που θα ειπωθούν στις ιδιωτικές συνεδρίες μεταξύ μας δεν μπορεί να μεταφερθεί στην άλλη πλευρά δίχως την ρητή αίτησή σας. Η διαμεσολάβηση λοιπόν είναι μία εμπιστευτική διαδικασία.`;

    } else if (d.type === 'prosklisi') {
        const allParties = [...reqs, ...resps];
        const p = allParties[currentPartyIdx] || allParties[0];
        const pName = getFullName(p.n, p.s);
        const pAFM = p.afm || "........";

        activeHtml = `<div style="text-align:center;"><b>ΕΝΤΥΠΟ 3</b><br>
<b>ΓΝΩΣΤΟΠΟΙΗΣΗ/ΠΡΟΣΚΛΗΣΗ ΓΙΑ ΤΗΝ ΥΠΟΧΡΕΩΤΙΚΗ ΑΡΧΙΚΗ ΣΥΝΕΔΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</b><br>
(άρθρο 7 παρ. 2 του ν.4640/2019)<br>
<span style="font-size:10pt;">(Απευθύνεται προς όλα τα μέρη της διαφοράς, όπως αναφέρονται στο επισυναπτόμενο Φύλλο Βασικών Στοιχείων)</span></div><br><br>

Δια της παρούσης γνωστοποιώ προς <b>${pName}</b> με ΑΦΜ <b>${pAFM}</b> ότι η Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) διαμεσολάβησης, όπως ορίζεται στο άρθρο 7 του ν.4640/2019, θα λάβει χώρα την ${fmtD(d.z_date)}, ημέρα ${getDay(d.z_date)} και ώρα ${d.z_time} και σας καλώ να παραστείτε σε αυτή με το νομικό παραστάτη σας, όπου και όπως κατωτέρω αναφέρεται.<br><br>
Τόπος διεξαγωγής ΥΑΣ ΜΑΝΔΑΛΟ / Διεύθυνση: ΑΝΕΥ<br>
Η διαδικασία της ΥΑΣ θα λάβει χώρα μέσω τηλεδιάσκεψης με κωδικούς σύνδεσης:<br>

${zoomFrameEntypo}<br>

Επισυνάπτεται το Φύλλο Βασικών Στοιχείων, όπου περιλαμβάνονται αναλυτικά τα στοιχεία όλων των μερών της διαφοράς, σύντομη περιγραφή της υπόθεσης και τα στοιχεία μου ως διαμεσολαβητή.<br><br>
Σημειώνεται ότι:<br>
Σκοπός της Υποχρεωτικής Αρχικής Συνεδρίας είναι να εξετάσετε τη δυνατότητα εξωδικαστικής επίλυσης της διαφοράς σας με διαμεσολάβηση. Αν μετά την Υποχρεωτική Αρχική Συνεδρία δεν επιθυμείτε να συνεχίσετε τη διαδικασία της διαμεσολάβησης, μπορείτε να αποχωρήσετε χωρίς οποιαδήποτε αιτιολογία, κύρωση ή ποινή.<br>
Σύμφωνα με το άρθρο 7 παρ. 6 του ν.4640/2019, εάν δεν προσέλθετε στην ΥΑΣ δύναται να σας επιβληθεί από το δικαστήριο χρηματική ποινή, ποσού 100-500 ευρώ, εφόσον η υπόθεσή σας προχωρήσει σε δικαστική διαδικασία.<br>
Η αμοιβή του διαμεσολαβητή ορίζεται στα ${d.fee} για την ΥΑΣ, βαρύνει τα μέρη κατ’ ισομοιρία και θα πρέπει να καταβληθεί στον λογαριασμό ${m_iban} πριν από την έναρξη της διαδικασίας.<br><br>
Η παρούσα γνωστοποίηση αποστέλλεται σε σας σύμφωνα με το άρθρο 7 παρ. 2 ως εξής:<br>
[ ☒ ] Με email<br>
[ ☐ ] Με συστημένη επιστολή<br>
[ ☐ ] Άλλως: .........................<br><br>

Τόπος ΜΑΝΔΑΛΟ, την ${fmtD(d.notify_date)}<br><br>
<div style="text-align:right; padding-right: 50px;">
Ο διαμεσολαβητής<br>
(Υπογραφή)<br>
${mediatorFullName}
</div><br>

*ΠΑΡΕΛΗΦΘΗ την…………………….......<br>
Ο παραλαβών<br>
Όνομα ……………………………….<br>
Υπογραφή ………………………….<br>

<div style="font-size: 10pt; color: #777777; margin-top: 25pt;">
*(Ο διαμεσολαβητής δεν απαιτείται να ζητήσει επιβεβαίωση της παραλαβής της γνωστοποίησης, αν αυτή αποδεικνύεται μέσω ηλεκτρονικής αλληλογραφίας ή από αποδεικτικό αποστολής συστημένης επιστολής ή από άλλο νόμιμο τρόπο)<br><br>
<b>ΚΑΤΕΥΘΥΝΤΗΡΙΕΣ ΟΔΗΓΙΕΣ ΓΙΑ ΤΟ ΕΝΤΥΠΟ 3</b><br>
Στο παρόν έγγραφο επισυνάπτεται και το Φύλλο Βασικών Στοιχείων (Έντυπο 1), στο οποίο περιλαμβάνονται τα ονόματα και τα στοιχεία όλων των συμμετεχόντων, του διαμεσολαβητή, καθώς και μία σύντομη περιγραφή της διαφοράς.<br>
Η γνωστοποίηση - πρόσκληση απευθύνεται προς όλους τους συμμετέχοντες και αποστέλλεται από τον διαμεσολαβητή ξεχωριστά σε καθέναν από αυτούς τουλάχιστον πέντε (5) ημέρες πριν από την ημερομηνία της Υποχρεωτικής Αρχικής Συνεδρίας. Ο ελάχιστος αριθμός αποστελλόμενων προσκλήσεων από τον διαμεσολαβητή είναι δύο (μία για το επισπεύδον μέρος και μία για το έτερο μέρος της διαφοράς). Οι νομικοί παραστάτες των μερών δεν απαιτείται να λαμβάνουν ξεχωριστή έγγραφη γνωστοποίηση/πρόσκληση.
</div>`;

    } else if (d.type === 'praktiko') {
        activeHtml = `<div style="text-align:center;"><b>ΠΡΑΚΤΙΚΟ ΠΕΡΑΤΩΣΗΣ ΑΡΧΙΚΗΣ ΥΠΟΧΡΕΩΤΙΚΗΣ ΣΥΝΕΔΡΙΑΣ</b><br>
(άρθρο 7 παρ. 4 του ν.4640/2019)</div><br><br>
Ο διαμεσολαβητής ${mediatorFullName} του ${m_f} (ΑΜΔ ${m_am}) βεβαιώνω ότι περατώθηκε η Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) για τη διαφορά που περιγράφεται στο επισυναπτόμενο Φύλλο Βασικών Στοιχείων, κατά την οποία παραστάθηκαν τα μέρη, όπως παρακάτω αναφέρεται.<br><br>
Ημερομηνία ΥΑΣ : ${fmtD(d.z_date)}<br>
Τόπος (διεύθυνση) ΥΑΣ: ΣΚΥΔΡΑ, ΜΑΝΔΑΛΟ ΤΚ 58500 ΜΕΣΩ ΤΗΛΕΔΙΑΣΚΕΨΗΣ<br><br>
<b>ΣΥΜΜΕΤΕΧΟΝΤΕΣ ΣΤΗΝ ΥΑΣ:</b><br><br>
${praktikoReqHTML}
${praktikoRespHTML}

<b>Ο ΔΙΑΜΕΣΟΛΑΒΗΤΗΣ</b><br>
Ονοματεπώνυμο: ${mediatorFullName} Πατρώνυμο: ${m_f}<br>
Μάνδαλο, την ${d.doc_date}<br>
<div style="text-align:right; padding-right:50px;">Υπογραφή Διαμεσολαβητή<br>……………………</div><br>

<b>Παρατηρήσεις:</b><br>
- Στο παρόν πρακτικό περάτωσης της Υποχρεωτικής Αρχικής Συνεδρίας Διαμεσολάβησης επισυνάπτεται το Φύλλο Βασικών Στοιχείων (Έντυπο 1), καθώς και Γνωστοποίηση/Πρόσκληση για την Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης (Έντυπο 3), σύμφωνα με το άρθρο 7 παρ.2 του ν. 4640/2019 τα οποία αποτελούν αναπόσπαστο μέρος του παρόντος. Συντάσσεται από το διαμεσολαβητή μετά την περάτωση της Υποχρεωτικής Αρχικής Συνεδρίας, υπογράφεται από όλους τους παρισταμένους και το διαμεσολαβητή και καθένας λαμβάνει από ένα όμοιο πρωτότυπο.<br>
<b>- Η διαδικασία έλαβε χώρα δια τηλεδιασκέψεως</b><br>
- Σύμφωνα με το άρθρο 7 παρ. 2 του ν. 4640/2019, Ο διαμεσολαβητής γνωστοποίησε την ${fmtD(d.notify_date)}, εγγράφως με μήνυμα ηλεκτρονικού ταχυδρομείου, ήτοι πέντε (5) τουλάχιστον ημέρες πριν από την διεξαγωγή της Υποχρεωτικής Αρχικής Συνεδρίας, στα μέρη την ημερομηνία καθώς και τον τόπο διεξαγωγής της υποχρεωτικής αρχικής συνεδρίας διαμεσολάβησης (Έντυπο 3), αλλά και το φύλλο Βασικών Στοιχείων (Έντυπο 1), και έλαβε απόδειξη παραλαβής της γνωστοποίησης.<br>
- Σύμφωνα με το άρθρο 9 παρ. 1 του ν. 4640/2019, η έγγραφη αυτή γνωστοποίηση του διαμεσολαβητή προς τα μέρη για τη διεξαγωγή της υποχρεωτικής αρχικής συνεδρίας (Έντυπο 3), αναστέλλει την παραγραφή και την αποσβεστική προθεσμία άσκησης των αξιώσεων και των δικαιωμάτων, εφόσον αυτές έχουν αρχίσει σύμφωνα με τις διατάξεις του ουσιαστικού δικαίου, καθώς και τις δικονομικές προθεσμίες των άρθρων 237 και 238 ΚΠολΔ, για όσο χρόνο διαρκεί η διαδικασία διαμεσολάβησης.<br>
- Η Υποχρεωτική Αρχική Συνεδρία διαμεσολάβησης έχει εμπιστευτικό χαρακτήρα (άρθρο 7 παρ. 3 ν. 4640/2019). Πριν από την έναρξη της διαδικασίας όλοι οι συμμετέχοντες δεσμεύτηκαν να τηρήσουν το απόρρητο της διαδικασίας της Υποχρεωτικής Αρχικής Συνεδρίας διαμεσολάβησης.<br>
- Το παρόν Πρακτικό Περάτωσης Υποχρεωτικής Αρχικής Συνεδρίας διαμεσολάβησης, αφορά στη διαφορά των μερών που αναλυτικά περιγράφεται στην αγωγή που κατατέθηκε στο ${d.court} με Αριθμό Κατάθεσης αγωγής: ${d.court_n} και θα προσκομισθεί μαζί με τις προτάσεις.<br>

<div style="font-size: 10pt; color: #777777; margin-top: 25pt; border-top: 1pt dashed #ccc; padding-top: 15pt;"><b>ΚΑΤΕΥΘΥΝΤΗΡΙΕΣ ΟΔΗΓΙΕΣ:</b> Στο παρόν πρακτικό περάτωσης της Υποχρεωτικής Αρχικής Συνεδρίας επισυνάπτεται το Φύλλο Βασικών Στοιχείων (Έντυπο 1), το οποίο αποτελεί αναπόσπαστο μέρος του παρόντος. Συντάσσεται από το διαμεσολαβητή μετά την περάτωση της Υποχρεωτικής Αρχικής Συνεδρίας, υπογράφεται από όλους τους παρισταμένους και το διαμεσολαβητή και καθένας λαμβάνει από ένα όμοιο πρωτότυπο. Μπορείτε να προσθέσετε περισσότερα ονόματα ανάλογα με τους συμμετέχοντες.</div>`;
    }

    document.getElementById('preview').innerHTML = activeHtml;
}

function exportToWord() {
    const type = document.getElementById('doc_type').value;
    const html = document.getElementById("preview").innerHTML;
    const sel = document.getElementById('party_select');
    const filename = type==='prosklisi' ? `Prosklisi_${sel.options[sel.selectedIndex]?.text.replace(/\s+/g,'_')}.doc` : `${type.toUpperCase()}.doc`;

    const blobContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'>
        <style>
            @page { size: 21cm 29.7cm; margin: 2.54cm; }
            body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; text-align: justify; }
        </style>
        </head>
        <body>${html}</body></html>`;

    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(blobContent);
    link.download = filename;
    link.click();
}

function downloadMailTemplate() {
    const feeElem = document.getElementById('m_fee');
    const fee = feeElem.options[feeElem.selectedIndex].text;
    const z_date = document.getElementById('yas_date').value;
    const z_time = document.getElementById('yas_time').value;
    const z_link = document.getElementById('z_link').value;
    const z_id = document.getElementById('z_id').value;
    const z_pass = document.getElementById('z_pass').value;

    const html = `<!DOCTYPE html><html lang="el"><body style="background:#2c3e50; padding:40px; font-family:Arial;"><div style="max-width:600px; margin:auto; background:#34495e; padding:30px; border-radius:10px; color:white; line-height:1.6;">
    <p>Αξιότιμες Κυρίες & Κύριοι,</p><p>Σε συνέχεια της επικοινωνίας μας αποστέλλω: την πρόσκληση για την υποχρεωτική αρχική συνεδρία διαμεσολάβησης καθώς και τον ΤΡΟΠΟ, ΤΟΠΟ, και ΧΡΟΝΟ διεξαγωγής της Υποχρεωτικής Αρχικής Συνεδρίας, τα βασικά στοιχεία των μερών και τα δικά μου και σύντομη περιγραφή της διαφοράς σας, τα οποία αναλυτικά περιλαμβάνονται στα επισυναπτόμενα έγγραφα</p>
    <p>Υπενθυμίζω ότι για την διεξαγωγή της Υ.Α.Σ η αμοιβή μου ανέρχεται στο ποσό των ${fee} το οποίο θα πρέπει να έχει κατατεθεί πριν την εκκίνηση της διαδικασίας στον τραπεζικό λογαριασμό που αναγράφεται στην συνημμένη πρόσκληση.</p>
    <p>Η Υποχρεωτική Αρχική Συνεδρία (Υ.Α.Σ.) ως αναπόσπαστο μέρος της διαμεσολάβησης, αποτελεί έναν νεοσύστατο θεσμό στην χώρα μας που λειτουργεί ως υποχρεωτικό προστάδιο λίγο πριν την είσοδο της υπόθεσής σας στο δικαστήριο.</p>
    <p>Η Διαμεσολάβηση αποτελεί μια προσπάθεια εξωδικαστικής επίλυσης της διαφοράς με επίκεντρο εσάς και θεματοφύλακες του νόμου τους νομικούς παραστάτες σας. Πρόκειται για μια διαρθρωμένη διαδικασία με βασικά χαρακτηριστικά την εμπιστευτικότητα και την ιδιωτική αυτονομία.</p>
    <p>Ο διαμεσολαβητής, νοείται ένα τρίτο πρόσωπο σε σχέση με τα συμμετέχοντα μέρη και τη διαφορά, το οποίο αναλαμβάνει να διαμεσολαβήσει με κατάλληλο, αποτελεσματικό και αμερόληπτο τρόπο, διευκολύνοντας τα να βρουν μια κοινά αποδεκτή λύση για τη διαφορά τους.</p>
    <p>Η διαμεσολάβηση είναι μια διαδικασία:<br>
    - <strong><span style="color:rgb(255, 171, 1);">εκούσια</span></strong>, διότι προσέρχεστε και παραμένετε σε αυτήν εθελοντικά<br>
    - <strong><span style="color:rgb(255, 171, 1);">μη δεσμευτική</span></strong>, μέχρι τη στιγμή που θα υπογράψετε τη συμφωνία σας<br>
    - <strong><span style="color:rgb(255, 171, 1);">απόλυτα εμπιστευτική</span></strong> διότι οτιδήποτε ακουστεί, οποιεσδήποτε προσφορές, παραχωρήσεις και παραδοχές που τυχόν προκύψουν, σε περίπτωση που δεν καταλήξετε σε συμφωνία δεν μπορούν να χρησιμοποιηθούν στο Δικαστήριο. Οτιδήποτε ειπωθεί και προκύψει κατά τη διάρκεια της διαδικασίας δεν μπορεί να κοινοποιηθεί σε τρίτους ούτε και να αποτελέσει αποδεικτικό στοιχείο σε άλλες διαδικασίες, όπως διαιτησία ή Δικαστήριο.</p>
    <p><strong>Κανείς από εμάς δεν μπορεί να κληθεί στο Δικαστήριο ως μάρτυρας.</strong></p>
    <p><strong>Στόχος μας:</strong> μέσα από την καλόπιστη συμπεριφορά και την συναλλακτική ευθύτητα όλων είναι η κατάληξη σε μια κοινά αποδεκτή συμφωνία !!!</p>
    <div style="border:2px solid orange; padding:15px; text-align:center; background:rgba(0,0,0,0.2);">
    <h3 style="color:orange; margin-top: 0;">ΣΤΟΙΧΕΙΑ ΣΥΝΔΕΣΗΣ (ΔΙΑΔΙΚΤΥΑΚΑ)</h3><p>Ημερομηνία / Ώρα: ${fmtD(z_date)} στις ${z_time}</p><p>Link: <a href="${z_link}" style="color:orange;">${z_link}</a></p><p>Meeting ID: ${z_id} <br><br> Passcode: ${z_pass}</p></div></div></body></html>`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([html], {type:"text/html"}));
    link.download = "Mail_Template.html";
    link.click();
}

// ==========================================
// 3. SMART EVALUATOR LOGIC
// ==========================================
function calcSmart() {
    const s = parseInt(document.getElementById('smart_s').value);
    const m = parseInt(document.getElementById('smart_m').value);
    const a = parseInt(document.getElementById('smart_a').value);
    const r = parseInt(document.getElementById('smart_r').value);
    const t = parseInt(document.getElementById('smart_t').value);

    document.getElementById('val_s').innerText = s;
    document.getElementById('val_m').innerText = m;
    document.getElementById('val_a').innerText = a;
    document.getElementById('val_r').innerText = r;
    document.getElementById('val_t').innerText = t;

    const total = s + m + a + r + t;
    document.getElementById('smart_score').innerText = `${total}/25`;

    let title, desc, color;
    if (total <= 10) {
        title = "Αδύναμη Πρόταση";
        desc = "Η πρόταση πάσχει σε βασικά δομικά στοιχεία. Δεν είναι έτοιμη για διαπραγμάτευση. Πρέπει να ζητηθούν άμεσα διευκρινίσεις.";
        color = "var(--danger)";
    } else if (total <= 17) {
        title = "Μέτρια Πρόταση";
        desc = "Απαιτούνται διευκρινίσεις. Έχει βάση, αλλά πρέπει να εξειδικευτεί περαιτέρω (ειδικά στα κριτήρια που βαθμολογήθηκαν χαμηλά) πριν γίνει αποδεκτή.";
        color = "#f59e0b"; // Orange
    } else if (total <= 22) {
        title = "Καλή Πρόταση";
        desc = "Η πρόταση είναι ρεαλιστική και αξιολογήσιμη. Μικρές λεπτομέρειες πρέπει να ρυθμιστούν για την τελική συμφωνία.";
        color = "var(--accent)"; // Green
    } else {
        title = "Εξαιρετική / Ισχυρή Πρόταση";
        desc = "Η πρόταση είναι απόλυτα ξεκάθαρη, μετρήσιμη και ρεαλιστική. Αποτελεί ιδανική βάση για την υπογραφή του Ιδιωτικού Συμφωνητικού.";
        color = "#15803d"; // Dark Green
    }

    const resultBox = document.getElementById('smart_result_box');
    document.getElementById('smart_title').innerText = title;
    document.getElementById('smart_desc').innerText = desc;
    document.getElementById('smart_title').style.color = color;
    document.getElementById('smart_score').style.backgroundColor = color;
    resultBox.style.borderColor = color;
}

// ==========================================
// 4. THE THEORY / LIBRARY DATA 
// ==========================================
const theoryData = {
    // --- ΚΕΝΤΡΙΚΗ ΘΕΩΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ ---
    mediation_concept_methods: `<h3>1. Η Έννοια και οι Μέθοδοι της Διαμεσολάβησης</h3>
    <p>Η διαμεσολάβηση είναι μια εκούσια, εμπιστευτική και δομημένη διαδικασία επίλυσης διαφορών. Σε αυτήν, ένα τρίτο, ουδέτερο και αμερόληπτο μέρος (ο Διαμεσολαβητής) βοηθά τα μέρη να επικοινωνήσουν εποικοδομητικά, προκειμένου να καταλήξουν σε μια αμοιβαία αποδεκτή συμφωνία.</p>
    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4 style="margin-top:0; color: #0369a1;">Βασικές Μέθοδοι (Σχολές) Διαμεσολάβησης</h4>
        <ul>
            <li><b>Διευκολυντική (Facilitative):</b> Η κλασική μέθοδος. Ο διαμεσολαβητής διευκολύνει την επικοινωνία, δεν προτείνει λύσεις και δεν εκφέρει γνώμη για το ποιος έχει δίκιο. Εστιάζει στα "Συμφέροντα" (Interests) και όχι στις "Θέσεις".</li>
            <li><b>Αξιολογική (Evaluative):</b> Ο διαμεσολαβητής (συνήθως νομικός) αξιολογεί τη νομική βασιμότητα των ισχυρισμών, κάνει έλεγχο πραγματικότητας (Reality Testing) για το τι θα συμβεί στο δικαστήριο (BATNA/WATNA) και ενδέχεται να προτείνει επιλογές.</li>
            <li><b>Μετασχηματιστική (Transformative):</b> Εστιάζει στην ενδυνάμωση (empowerment) των μερών και στην αναγνώριση (recognition) της οπτικής του άλλου. Ο στόχος δεν είναι απλώς η επίλυση του προβλήματος, αλλά η αποκατάσταση της σχέσης (χρησιμοποιείται συχνά στην Οικογενειακή Διαμεσολάβηση).</li>
        </ul>
    </div>`,

    mediation_phases: `<h3>2. Οι Φάσεις της Διαμεσολάβησης</h3>
    <p>Μια τυπική διαδικασία διαμεσολάβησης ακολουθεί 5 διακριτά και κρίσιμα στάδια:</p>
    <ol>
        <li><b>Προετοιμασία:</b> Συλλογή πληροφοριών, έλεγχος σύγκρουσης συμφερόντων (conflict of interest), οργάνωση του χώρου, υπογραφή του Συμφωνητικού Υπαγωγής.</li>
        <li><b>Εναρκτήρια Κοινή Συνεδρία (Opening Statement):</b> Καλωσόρισμα, παρουσίαση των κανόνων (εμπιστευτικότητα, εθελοντικότητα, ουδετερότητα) και σύντομες εναρκτήριες τοποθετήσεις από τα μέρη.</li>
        <li><b>Διερεύνηση / Αποφόρτιση (Gathering Info):</b> Τα μέρη αφηγούνται την ιστορία τους (αδιαλείπτως). Ο διαμεσολαβητής ακούει ενεργητικά, "καθρεφτίζει" τα συναισθήματα και εντοπίζει τα κρυφά συμφέροντα (Interests) πίσω από τις θέσεις.</li>
        <li><b>Διαπραγμάτευση / Κατ' ιδίαν Συνεδρίες (Caucuses):</b> Ιδιωτικές συναντήσεις του διαμεσολαβητή με κάθε πλευρά. Εδώ γίνεται ο Έλεγχος Πραγματικότητας (Reality Testing), η αναζήτηση BATNA/WATNA, η παραγωγή επιλογών (Brainstorming) και η ανταλλαγή προτάσεων (shuttle diplomacy).</li>
        <li><b>Συμφωνία (Closure):</b> Αν βρεθεί κοινός τόπος (ZOPA), γίνεται η σύνταξη του Πρακτικού Επιτυχούς Διαμεσολάβησης. Αν δεν βρεθεί, γίνεται Πρακτικό Αποτυχίας. Και στις δύο περιπτώσεις η διαδικασία λήγει ομαλά και με σεβασμό.</li>
    </ol>`,

    harvard_model: `<h3>Το Μοντέλο του Harvard (Με Νευροβιολογία & BATNA/ZOPA)</h3>
    <p>Το μοντέλο διαπραγμάτευσης του Harvard αποκτά άλλη διάσταση όταν κατανοήσουμε πώς οι ερωτήσεις του Διαμεσολαβητή "καλωδιώνουν" τον εγκέφαλο. Ακολουθεί το πλήρες μοντέλο των 5 σταδίων, ενσωματώνοντας τη θεωρία των BATNA/ZOPA ως τον τελικό μηχανισμό λήψης απόφασης.</p>

    <div class="highlight-box" style="border-left-color: #be185d; background: #fff1f2;">
        <h4 style="margin-top:0; color: #be185d;">Βήμα 1: Διαχωρισμός Ανθρώπων από το Πρόβλημα</h4>
        <p><b>Ο Εγκέφαλος:</b> Ο στόχος είναι να βοηθήσουμε τον Κοιλιοέσω Προμετωπιαίο Φλοιό (vmPFC) να "κατευνάσει" την Αμυγδαλή (το κέντρο συναγερμού/θυμού). Η αμυντικότητα (fight-or-flight) πρέπει να πέσει.<br>
        <b>Εργαλειοθήκη Ερωτήσεων:</b></p>
        <ul>
            <li>Πώς σας έκανε να νιώσετε αυτή η κατάσταση όταν ξεκίνησε;</li>
            <li>Τι σας πλήγωσε ή σας εκνεύρισε περισσότερο σε όλη αυτή τη διαδικασία;</li>
            <li>Ποια πιστεύετε ότι ήταν η πραγματική πρόθεση της άλλης πλευράς;</li>
            <li>Πώς έχει επηρεάσει αυτή η σύγκρουση την καθημερινότητά σας;</li>
        </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #be185d; background: #fff1f2;">
        <h4 style="margin-top:0; color: #be185d;">Βήμα 2: Εστίαση στα Συμφέροντα (Interests), όχι στις Θέσεις</h4>
        <p><b>Ο Εγκέφαλος:</b> Μεταφέρουμε την ενέργεια από το συναισθηματικό σύστημα στον Ραχιοπλάγιο Προμετωπιαίο Φλοιό (dlPFC), τη "CPU" της λογικής ανάλυσης.<br>
        <b>Εργαλειοθήκη Ερωτήσεων:</b></p>
        <ul>
            <li>Πέρα από το ποσό που ζητάτε (Θέση), τι είναι αυτό που πραγματικά έχετε ανάγκη να πετύχετε (Συμφέρον);</li>
            <li>Για ποιο λόγο είναι τόσο σημαντικός αυτός ο συγκεκριμένος όρος για εσάς;</li>
            <li>Τι φοβάστε ότι θα συμβεί αν δεν ικανοποιηθεί αυτό το συγκεκριμένο αίτημα;</li>
            <li>Ποιες είναι οι βασικές σας προτεραιότητες για το μέλλον;</li>
        </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #be185d; background: #fff1f2;">
        <h4 style="margin-top:0; color: #be185d;">Βήμα 3: Παραγωγή Επιλογών (Brainstorming)</h4>
        <p><b>Ο Εγκέφαλος:</b> Ενεργοποιείται το Δίκτυο Προεπιλεγμένης Λειτουργίας (DMN), το οποίο επιτρέπει τη δημιουργική σκέψη (out-of-the-box).<br>
        <b>Εργαλειοθήκη Ερωτήσεων:</b></p>
        <ul>
            <li>Αν είχαμε ένα μαγικό ραβδί, ποιες άλλες εναλλακτικές λύσεις θα μπορούσαμε να σκεφτούμε;</li>
            <li>Τι θα προτείνατε εσείς αν ξέρατε ότι η άλλη πλευρά είναι διατεθειμένη να κάνει μια σημαντική υποχώρηση;</li>
            <li>Υπάρχει κάποιος δημιουργικός τρόπος να μοιραστεί το ρίσκο ή το κόστος;</li>
        </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #be185d; background: #fff1f2;">
        <h4 style="margin-top:0; color: #be185d;">Βήμα 4: Αντικειμενικά Κριτήρια</h4>
        <p><b>Ο Εγκέφαλος:</b> Ο Προμετωπιαίος Φλοιός κάνει αυστηρή λογική αξιολόγηση. Ο Πρόσθιος Φλοιός του Προσαγωγίου (ACC) αξιολογεί τη "Δικαιοσύνη".<br>
        <b>Εργαλειοθήκη Ερωτήσεων:</b></p>
        <ul>
            <li>Με βάση ποια αντικειμενικά δεδομένα προκύπτει αυτός ο αριθμός;</li>
            <li>Ποια είναι η συνήθης εμπορική πρακτική στον κλάδο σας;</li>
            <li>Με ποιο σκεπτικό θα μπορούσατε να δικαιολογήσετε αυτό το ποσό σε έναν ουδέτερο παρατηρητή;</li>
        </ul>
    </div>

    <div class="moore-circle">
        <div class="moore-node" style="border-left-color: #10b981; flex: 1 1 100%;">
            <h4 style="color: #047857; margin-top:0;">Βήμα 5α: BATNA (Best Alternative To a Negotiated Agreement)</h4>
            <p><b>Ορισμός:</b> Η Καλύτερη Εναλλακτική Λύση εκτός Συμφωνίας. Είναι το "δίχτυ ασφαλείας". Δεν δεχόμαστε ποτέ μια συμφωνία στη Διαμεσολάβηση που είναι χειρότερη από το BATNA μας.</p>
        </div>
        <div class="moore-node" style="border-left-color: #ef4444; flex: 1 1 100%;">
            <h4 style="color: #b91c1c; margin-top:0;">Βήμα 5β: WATNA (Worst Alternative To a Negotiated Agreement)</h4>
            <p><b>Ορισμός:</b> Το απόλυτο "Εφιαλτικό Σενάριο". Χρησιμοποιείται για Reality Testing.</p>
            <ul>
                <li>Ποιο είναι το χειρότερο σενάριο αν δεν βρούμε λύση σήμερα και καταλήξετε στο δικαστήριο;</li>
                <li>Αν το δικαστήριο απορρίψει την αγωγή σας (το WATNA σας), πώς θα επιβιώσει επιχειρηματικά η εταιρεία σας;</li>
            </ul>
        </div>
        <div class="moore-node" style="border-left-color: #3b82f6; flex: 1 1 100%;">
            <h4 style="color: #1d4ed8; margin-top:0;">Βήμα 5γ: ZOPA (Zone of Possible Agreement)</h4>
            <p><b>Ορισμός:</b> Η Ζώνη Πιθανής Συμφωνίας. Το "παράθυρο" στο οποίο οι ανοχές των δύο πλευρών επικαλύπτονται.</p>
        </div>
    </div>`,

    smart_theory: `<h3>Η Μεθοδολογία Αξιολόγησης SMART</h3>
    <p>Η SMART μεθοδολογία χρησιμοποιείται ευρέως για τον καθορισμό στόχων, αλλά στη Διαμεσολάβηση αποτελεί το απόλυτο "φίλτρο" για να ελέγξουμε αν μια πρόταση που φέρνει το ένα μέρος είναι βιώσιμη, ρεαλιστική και έτοιμη να ενταχθεί σε Ιδιωτικό Συμφωνητικό.</p>
    
    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4>S – Specific (Συγκεκριμένη)</h4>
        <p>Η πρόταση πρέπει να είναι σαφής, εστιασμένη και καλά ορισμένη. <b>Ερωτήματα:</b> Τι ακριβώς προτείνεται; Ποιοι είναι οι σαφείς στόχοι; <i>(Αντί για: "Θα βοηθήσω στην εταιρεία", πρέπει: "Θα παραδώσω τον έλεγχο των μετοχών")</i>.</p>
    </div>

    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4>M – Measurable (Μετρήσιμη)</h4>
        <p>Πρέπει να υπάρχουν συγκεκριμένα κριτήρια μέτρησης. <b>Ερωτήματα:</b> Υπάρχουν ποσοτικοί τρόποι επαλήθευσης; Μπορούμε να πούμε αντικειμενικά πότε ο στόχος επετεύχθη; <i>(π.χ. Αποπληρωμή 5.000€ σε 5 δόσεις των 1.000€)</i>.</p>
    </div>

    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4>A – Achievable (Εφικτή)</h4>
        <p>Η πρόταση πρέπει να είναι ρεαλιστική με βάση τους διαθέσιμους πόρους. <b>Ερωτήματα:</b> Είναι ο προϋπολογισμός εφικτός; Έχει το μέρος τα χρήματα; Υπάρχει νομικό κώλυμα;</p>
    </div>

    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4>R – Relevant (Σχετική)</h4>
        <p>Πρέπει να ευθυγραμμίζεται με τα πραγματικά "Συμφέροντα" (Interests). <b>Ερωτήματα:</b> Απαντά αυτή η πρόταση στο βαθύτερο πρόβλημα; Κλείνει την αντιδικία;</p>
    </div>

    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4>T – Time-bound (Χρονικά προσδιορισμένη)</h4>
        <p>Σαφές χρονοδιάγραμμα. <b>Ερωτήματα:</b> Πότε θα γίνει η μεταβίβαση; Υπάρχουν ενδιάμεσα ορόσημα; <i>(π.χ. Η 1η δόση έως 30/10/2026)</i>.</p>
    </div>
    <p><i>* Μπορείτε να χρησιμοποιήσετε το εργαλείο "ΑΞΙΟΛΟΓΗΣΗ ΠΡΟΤΑΣΗΣ (SMART)" στο κεντρικό μενού για αυτόματη βαθμονόμηση.</i></p>`,

    conflict_moore: `<h3>Ο Κύκλος των Συγκρούσεων (Christopher Moore)</h3>
    <p>Ο Christopher Moore, στο κλασικό του έργο <i>"The Mediation Process"</i>, ανέπτυξε το μοντέλο του "Κύκλου της Σύγκρουσης" (Circle of Conflict). Το μοντέλο αυτό ταξινομεί τις αιτίες των συγκρούσεων σε πέντε (5) βασικές κατηγορίες, βοηθώντας τον διαμεσολαβητή να εντοπίσει τη "ρίζα" του προβλήματος.</p>
    
    <div class="moore-circle">
        <div class="moore-node">
            <h4>1. Συγκρούσεις Σχέσεων (Relationship Conflicts)</h4>
            <p>Οφείλονται σε ισχυρά αρνητικά συναισθήματα, εσφαλμένες αντιλήψεις ή στερεότυπα, κακή ή ελλιπή επικοινωνία και επαναλαμβανόμενες αρνητικές συμπεριφορές. <i>Συχνά τα μέρη τσακώνονται όχι για την ουσία, αλλά για το "πώς" τους φέρθηκε ο άλλος.</i></p>
        </div>
        <div class="moore-node">
            <h4>2. Συγκρούσεις Δεδομένων (Data Conflicts)</h4>
            <p>Προκύπτουν από έλλειψη πληροφοριών, παραπληροφόρηση, διαφορετικές απόψεις για το τι είναι σχετικό, διαφορετική ερμηνεία των δεδομένων ή διαφορετικές διαδικασίες αξιολόγησης.</p>
        </div>
        <div class="moore-node">
            <h4>3. Συγκρούσεις Συμφερόντων (Interest Conflicts)</h4>
            <p>Προκαλούνται από ανταγωνισμό για αντιληπτές ή πραγματικές ασύμβατες ανάγκες. Αφορούν: α) Ουσιαστικά (χρήμα, περιουσία), β) Διαδικαστικά (τρόπος επίλυσης), γ) Ψυχολογικά συμφέροντα (σεβασμός, αναγνώριση).</p>
        </div>
        <div class="moore-node">
            <h4>4. Δομικές Συγκρούσεις (Structural Conflicts)</h4>
            <p>Προέρχονται από εξωτερικούς παράγοντες, όπως άνιση εξουσία ή έλεγχος, άνισος έλεγχος πόρων, γεωγραφικοί, φυσικοί ή περιβαλλοντικοί περιορισμοί, και χρονικές πιέσεις.</p>
        </div>
        <div class="moore-node">
            <h4>5. Συγκρούσεις Αξιών (Value Conflicts)</h4>
            <p>Οφείλονται σε διαφορετικά κριτήρια αξιολόγησης ιδεών ή συμπεριφορών, διαφορετικούς τρόπους ζωής, ιδεολογίες ή θρησκείες. <i>Είναι οι πιο δύσκολες προς επίλυση, καθώς οι άνθρωποι δεν διαπραγματεύονται εύκολα τις αξίες τους.</i></p>
        </div>
    </div>`,

    conflict_intro: `<h3>Φύση & Ορισμός της Σύγκρουσης</h3>
    <p>Η σύγκρουση (conflict) αποτελεί αναπόσπαστο μέρος της ανθρώπινης αλληλεπίδρασης. Προκύπτει όταν δύο ή περισσότερα μέρη αντιλαμβάνονται ότι οι στόχοι, οι αξίες ή οι ανάγκες τους είναι ασύμβατες.</p>
    <p>Στη διαμεσολάβηση, η σύγκρουση δεν αντιμετωπίζεται ως ένα "πρόβλημα" που πρέπει να κατασταλεί, αλλά ως μια ευκαιρία για αναδόμηση σχέσεων και εξεύρεση δημιουργικών λύσεων.</p>
    <h4>Βασικά Χαρακτηριστικά:</h4>
    <ul>
        <li><b>Υποκειμενικότητα:</b> Η σύγκρουση υπάρχει εφόσον την αντιλαμβάνονται τα μέρη.</li>
        <li><b>Αλληλεξάρτηση:</b> Τα μέρη χρειάζονται το ένα το άλλο για να ικανοποιήσουν τις ανάγκες τους.</li>
        <li><b>Συναισθηματική Φόρτιση:</b> Περιλαμβάνει θυμό, φόβο, δυσπιστία ή ματαίωση.</li>
    </ul>`,
    
    conflict_escalation: `<h3>Κλιμάκωση της Σύγκρουσης (Μοντέλο Friedrich Glasl)</h3>
    <p>Ο Friedrich Glasl ανέπτυξε ένα μοντέλο 9 σταδίων που περιγράφει πώς μια διαφωνία κλιμακώνεται σε καταστροφική σύγκρουση. Η γνώση αυτών των σταδίων βοηθά τον διαμεσολαβητή να επιλέξει την κατάλληλη παρέμβαση.</p>
    <h4>Επίπεδο 1: Win-Win (Λογική)</h4>
    <ol>
        <li><b>Ένταση & Σκλήρυνση:</b> Οι διαφορές γίνονται αντιληπτές. Μικρές εντάσεις.</li>
        <li><b>Συζήτηση & Πολεμική:</b> Εμφάνιση στρατοπέδων ("Εμείς" vs "Αυτοί"). Επικράτηση της λογικής, αλλά με έντονη επιχειρηματολογία.</li>
        <li><b>Πράξεις, όχι Λόγια:</b> Η επικοινωνία μειώνεται. Τα μέρη δρουν μονομερώς.</li>
    </ol>
    <h4>Επίπεδο 2: Win-Lose (Συναίσθημα)</h4>
    <ol start="4">
        <li><b>Συνασπισμοί & Εικόνα:</b> Προσπάθεια προσέλκυσης τρίτων. Στερεότυπα και φήμες.</li>
        <li><b>Απώλεια Προσώπου:</b> Προσωπικές επιθέσεις. Αμφισβήτηση της ηθικής του άλλου.</li>
        <li><b>Στρατηγικές Απειλές:</b> Τελεσίγραφα. Ο φόβος κυριαρχεί. <i>(Εδώ συνήθως καταλήγουν στη Διαμεσολάβηση)</i></li>
    </ol>
    <h4>Επίπεδο 3: Lose-Lose (Καταστροφή)</h4>
    <ol start="7">
        <li><b>Περιορισμένα Καταστροφικά Χτυπήματα:</b> Η ζημιά στον άλλο γίνεται αυτοσκοπός.</li>
        <li><b>Διάλυση του Εχθρού:</b> Προσπάθεια πλήρους καταστροφής της ύπαρξης / υπόστασης του άλλου.</li>
        <li><b>Μαζί στην Άβυσσο:</b> Η αυτοκαταστροφή είναι αποδεκτή αρκεί να καταστραφεί και ο άλλος.</li>
    </ol>`,
    
    conflict_resolution: `<h3>Στυλ Επίλυσης Συγκρούσεων (Thomas-Kilmann)</h3>
    <p>Το εργαλείο TKI αξιολογεί τη συμπεριφορά του ατόμου σε καταστάσεις σύγκρουσης σε δύο διαστάσεις: τη <b>Διεκδικητικότητα</b> (εστίαση στις δικές του ανάγκες) και τη <b>Συνεργατικότητα</b> (εστίαση στις ανάγκες του άλλου).</p>
    <p>Προκύπτουν 5 βασικά στυλ:</p>
    <ul>
        <li><b>Ανταγωνιστικό (Διεκδικητικό/Μη Συνεργατικό):</b> Επιβολή ισχύος. Στόχος το Win-Lose.</li>
        <li><b>Παραχωρητικό (Μη Διεκδικητικό/Συνεργατικό):</b> Υποχώρηση στις επιθυμίες του άλλου. Αυτοθυσία.</li>
        <li><b>Αποφευκτικό (Μη Διεκδικητικό/Μη Συνεργατικό):</b> Απόσυρση. Το πρόβλημα δεν αντιμετωπίζεται.</li>
        <li><b>Συμβιβαστικό (Μέτρια Διεκδίκηση & Συνεργασία):</b> Αμοιβαίες παραχωρήσεις. "Μοιράζουμε τη διαφορά".</li>
        <li><b>Συνεργατικό (Διεκδικητικό & Συνεργατικό):</b> Αναζήτηση λύσεων Win-Win. Εστίαση στα βαθύτερα συμφέροντα (Interests) και όχι στις αρχικές θέσεις (Positions). <i>(Ο κύριος στόχος της Διαμεσολάβησης)</i></li>
    </ul>`,

    // --- ΟΙΚΟΓΕΝΕΙΑΚΗ ΔΙΑΜΕΣΟΛΑΒΗΣΗ ---
    family_intro: `<h3>3. Τι είναι η Οικογενειακή Διαμεσολάβηση</h3>
    <p>Η Οικογενειακή Διαμεσολάβηση είναι μια ειδική μορφή εξωδικαστικής επίλυσης διαφορών, προσαρμοσμένη στις μοναδικές δυναμικές, τις έντονες συναισθηματικές φορτίσεις και τις μακροχρόνιες σχέσεις που διέπουν το οικογενειακό δίκαιο (διαζύγιο, διατροφή, επικοινωνία, επιμέλεια).</p>
    <div class="highlight-box" style="border-left-color: #be185d; background: #fff1f2;">
        <h4 style="margin-top:0; color: #be185d;">Βασικά Χαρακτηριστικά:</h4>
        <ul>
            <li><b>Εστίαση στο Μέλλον:</b> Σε αντίθεση με το δικαστήριο που ερευνά "ποιος φταίει για το παρελθόν", η διαμεσολάβηση σχεδιάζει το "πώς θα λειτουργούμε αύριο".</li>
            <li><b>Το Βέλτιστο Συμφέρον του Παιδιού:</b> Αποτελεί τον απόλυτο γνώμονα. Ο διαμεσολαβητής οφείλει να διασφαλίζει ότι οι συμφωνίες των γονέων προστατεύουν την ευημερία των τέκνων (child-focused mediation).</li>
            <li><b>Προστασία της Σχέσης (Co-parenting):</b> Το ζευγάρι χωρίζει ως σύζυγοι, αλλά παραμένει ζευγάρι ως "γονείς". Η διαμεσολάβηση προστατεύει αυτή την αναγκαία γονεϊκή συνεργασία από την τοξικότητα της αντιδικίας.</li>
        </ul>
    </div>`,

    divorce_psychology: `<h3>4. Η Ψυχολογία του Διαζυγίου</h3>
    <p>Το διαζύγιο δεν είναι απλώς μια νομική πράξη, αλλά μια βαθιά συναισθηματική κρίση που συχνά παρομοιάζεται με το <b>πένθος</b> (Μοντέλο της Kübler-Ross). Τα μέρη που προσέρχονται στη διαμεσολάβηση συχνά βρίσκονται σε διαφορετικά ψυχολογικά στάδια, γεγονός που προκαλεί ασυγχρονισμό και συγκρούσεις.</p>
    <div class="moore-circle">
        <div class="moore-node" style="border-left-color: #8b5cf6;">
            <h4 style="color: #4338ca;">Τα Στάδια του Συναισθηματικού Διαζυγίου:</h4>
            <ol>
                <li><b>Άρνηση:</b> Σοκ και απροθυμία αποδοχής του χωρισμού. (<i>"Δεν συμβαίνει αυτό σε εμάς, θα αλλάξει γνώμη"</i>). Εδώ η διαμεσολάβηση είναι σχεδόν αδύνατη.</li>
                <li><b>Θυμός:</b> Εκτόνωση ενέργειας, αναζήτηση ευθυνών, επιθυμία για εκδίκηση. Εδώ συχνά κατατίθενται οι πρώτες σκληρές αγωγές.</li>
                <li><b>Διαπραγμάτευση:</b> Προσπάθεια επανασύνδεσης ή εύρεσης μιας συμβιβαστικής λύσης "υπό όρους".</li>
                <li><b>Κατάθλιψη / Απόγνωση:</b> Επίγνωση της οριστικότητας του χωρισμού. Απώλεια ταυτότητας, θλίψη.</li>
                <li><b>Αποδοχή:</b> Ανάληψη ευθύνης για τη νέα πραγματικότητα και σχεδιασμός του μέλλοντος. <b>(Είναι το ιδανικό στάδιο για να πετύχει η Διαμεσολάβηση).</b></li>
            </ol>
        </div>
    </div>`,

    family_mediator_training: `<h3>7-8. Εκπαίδευση & Πρότυπα Οικογενειακού Διαμεσολαβητή</h3>
    <p>Λόγω της κρισιμότητας των οικογενειακών διαφορών, ο οικογενειακός διαμεσολαβητής δεν αρκεί να κατέχει μόνο τεχνικές διαπραγμάτευσης, αλλά απαιτείται <b>ειδική και διεπιστημονική εκπαίδευση</b>.</p>
    <ul>
        <li><b>Διεπιστημονικότητα (Interdisciplinary Knowledge):</b> Πρέπει να έχει βασικές γνώσεις <i>Οικογενειακού Δικαίου</i>, <i>Παιδοψυχολογίας</i> (για την κατανόηση των αναγκών των παιδιών ανά ηλικιακή φάση), και <i>Δυναμικής Οικογενειακών Συστημάτων</i>.</li>
        <li><b>Αμεροληψία (Impartiality):</b> Δεν παίρνει το μέρος κανενός, ούτε του πιο "αδύναμου" ψυχολογικά.</li>
        <li><b>Διαχείριση Εξουσίας (Power Imbalance):</b> Αναγνωρίζει ανισορροπίες (π.χ. οικονομική εξάρτηση, ψυχολογική βία) και εφαρμόζει τεχνικές ενδυνάμωσης (empowerment) ώστε τα μέρη να διαπραγματευτούν επί ίσοις όροις. Στις περιπτώσεις ενδοοικογενειακής βίας (Domestic Violence), η διαμεσολάβηση συνήθως <b>απαγορεύεται</b> (Screening for violence).</li>
    </ul>`,

    bafm_guidelines: `<h3>9. Οι Κατευθυντήριες Γραμμές της BAFM</h3>
    <p>Η <b>BAFM</b> (Bundes-Arbeitsgemeinschaft für Familien-Mediation - Ομοσπονδιακή Ένωση Οικογενειακής Διαμεσολάβησης της Γερμανίας) αποτελεί έναν από τους σημαντικότερους ευρωπαϊκούς φορείς που θέσπισε αυστηρά πρότυπα (Guidelines) για την άσκηση του επαγγέλματος.</p>
    <div class="highlight-box">
        <h4 style="margin-top:0;">Βασικές Αρχές BAFM:</h4>
        <ol>
            <li><b>Εστίαση στο Παιδί (Child-Focus):</b> Τα παιδιά δεν είναι απλώς "αντικείμενο" της διαφοράς. Οι ανάγκες τους πρέπει να ακούγονται, ακόμα και μέσα από τη συμμετοχή παιδοψυχολόγου (αν χρειαστεί), προστατεύοντάς τα πάντα από τη σύγκρουση νομιμοφροσύνης (loyalty conflict).</li>
            <li><b>Αυτοδιάθεση (Self-determination):</b> Ο διαμεσολαβητής δεν επιβάλλει "παιδαγωγικά" ή νομικά σωστές λύσεις. Οι ίδιοι οι γονείς παραμένουν οι "ειδικοί" για την οικογένειά τους.</li>
            <li><b>Συν-Διαμεσολάβηση (Co-Mediation):</b> Η BAFM ενθαρρύνει έντονα τη χρήση δύο διαμεσολαβητών διαφορετικού φύλου ή διαφορετικής επιστημονικής αφετηρίας (π.χ. ένας νομικός και ένας ψυχολόγος), ώστε να καλύπτονται όλες οι πτυχές της κρίσης.</li>
        </ol>
    </div>`,

    lawyer_role_family: `<h3>10. Ο Ρόλος του Δικηγόρου στην Οικογενειακή Διαμεσολάβηση</h3>
    <p>Στη διαμεσολάβηση, ο ρόλος του νομικού παραστάτη (άρθρο 7 Ν. 4640/2019) μεταβάλλεται ριζικά. Παύει να είναι ο "πολεμιστής" του ακροατηρίου και γίνεται <b>"νομικός σύμβουλος"</b> (Legal Counsel) στη διαδικασία ειρήνευσης.</p>
    <ul>
        <li><b>Προετοιμασία Πελάτη:</b> Βοηθά τον πελάτη να ξεκαθαρίσει τα BATNA/WATNA του και να εστιάσει στο βέλτιστο συμφέρον του παιδιού, συγκρατώντας τον από υπερβολικές διεκδικήσεις.</li>
        <li><b>Νομική Οριοθέτηση:</b> Κατά τη διάρκεια της συνεδρίας, διασφαλίζει ότι οι προτεινόμενες λύσεις είναι σύννομες (δεν αντίκεινται στην αναγκαστική νομοθεσία) και εφαρμόσιμες.</li>
        <li><b>Συντάκτης (Drafter):</b> Είναι ο αποκλειστικός υπεύθυνος για τη νομική διατύπωση και σύνταξη του τελικού Ιδιωτικού Συμφωνητικού / Πρακτικού, ώστε αυτό να μπορεί να κατατεθεί στο δικαστήριο και να αποκτήσει εκτελεστότητα.</li>
    </ul>`,

    law_4800: `<h3>11. Ο Νόμος 4800/2021 (Μεταρρυθμίσεις & Συνεπιμέλεια)</h3>
    <p>Ο Νόμος 4800/2021 επέφερε τομές στο Οικογενειακό Δίκαιο (άρθρα 1511 ΑΚ επ.), καθιστώντας την Οικογενειακή Διαμεσολάβηση πιο αναγκαία από ποτέ.</p>
    <div class="highlight-box" style="border-left-color: #0ea5e9;">
        <h4 style="color: #0369a1; margin-top:0;">Οι Βασικοί Πυλώνες:</h4>
        <ol>
            <li><b>Από Κοινού Άσκηση της Γονικής Μέριμνας (Συνεπιμέλεια):</b> Καθιερώνεται ως ο κανόνας μετά το διαζύγιο (άρθρο 1513 ΑΚ). Οι γονείς καλούνται να συναποφασίζουν. Αυτό απαιτεί συνεργασία και συνεννόηση — στοιχεία που μόνο η διαμεσολάβηση μπορεί να εξασφαλίσει, σε αντίθεση με τη στείρα δικαστική απόφαση.</li>
            <li><b>Τεκμήριο Επικοινωνίας (1/3):</b> Θεσπίζεται μαχητό τεκμήριο ότι ο χρόνος επικοινωνίας του τέκνου με τον γονέα με τον οποίο δεν διαμένει (εφόσον δεν υπάρχει συνεπιμέλεια), δεν μπορεί να είναι μικρότερος από το 1/3 του συνολικού χρόνου (άρθρο 1520 ΑΚ).</li>
            <li><b>Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ):</b> Για διαφορές που αφορούν επιμέλεια, διατροφή και επικοινωνία, η προσφυγή στην ΥΑΣ (βάσει του Ν. 4640/2019) είναι αυστηρά <b>υποχρεωτική</b> επί ποινή απαραδέκτου της συζήτησης της αγωγής στο δικαστήριο.</li>
            <li><b>Διαμεσολάβηση & Πρόγραμμα Επικοινωνίας:</b> Ο νόμος δίνει ρητά προτεραιότητα στην εξωδικαστική ρύθμιση του χρόνου επικοινωνίας και του τόπου κατοικίας μέσω έγγραφης συμφωνίας των γονέων.</li>
        </ol>
    </div>`,

    // --- ΝΟΜΟΘΕΣΙΑ ---
    law_4640: `<h3>Νόμος 4640/2019 - Διαμεσολάβηση</h3>
    <p><b>Άρθρο 6: Υπαγωγή στη διαδικασία της ΥΑΣ</b><br>
    1. Υπάγονται υποχρεωτικά στην αρχική συνεδρία (ΥΑΣ):<br>
    α) Οι οικογενειακές διαφορές, εκτός από αυτές των περιπτώσεων α', β' και γ' της παραγράφου 1, καθώς και εκείνες της παραγράφου 2 του άρθρου 592 Κ.Πολ.Δ.<br>
    β) Οι διαφορές που εκδικάζονται κατά την τακτική διαδικασία και υπάγονται στην καθ' ύλην αρμοδιότητα του Μονομελούς Πρωτοδικείου, αν η αξία του αντικειμένου της διαφοράς υπερβαίνει τις τριάντα χιλιάδες (30.000) ευρώ, και του Πολυμελούς Πρωτοδικείου.</p>
    <p><b>Άρθρο 7: Διαδικασία ΥΑΣ</b><br>
    Η συνεδρία πραγματοποιείται το αργότερο εντός είκοσι (20) ημερών από την επομένη της αποστολής στον διαμεσολαβητή του αιτήματος προσφυγής. Η προθεσμία αυτή παρατείνεται σε τριάντα (30) ημέρες αν κάποιο από τα μέρη διαμένει στο εξωτερικό.<br>
    Η παράσταση των μερών στην ΥΑΣ γίνεται <b>υποχρεωτικά με τον νομικό παραστάτη τους</b> (εκτός από καταναλωτικές διαφορές μικρής αξίας).</p>`,

    law_5197: `<h3>Ν. 5197/2025 (Τροποποιήσεις Δικαστών & Συμβολαιογράφων)</h3>
    <p>Ο Ν. 5197/2025 εισάγει παρεμβάσεις στο νομοθετικό πλαίσιο της Εθνικής Σχολής Δικαστικών Λειτουργών και τον Κώδικα Συμβολαιογράφων, επηρεάζοντας έμμεσα τον τρόπο που προσεγγίζονται οι εξωδικαστικοί συμβιβασμοί.</p>
    <p>Ο νόμος ενισχύει τον ρόλο των δικαστικών λειτουργών στην προώθηση εναλλακτικών μεθόδων επίλυσης διαφορών, καθιστώντας την εκπαίδευση στη διαμεσολάβηση πιο κεντρική στη σχολή δικαστών.</p>`,

    law_5221: `<h3>Ν. 5221/2025 (Παρεμβάσεις ΚΠολΔ)</h3>
    <p>Ο νόμος αυτός περιλαμβάνει τροποποιήσεις στον Κώδικα Πολιτικής Δικονομίας, με έμφαση στη δημοσίευση διαθηκών και το ρυθμιστικό πλαίσιο των ανακοπών κατά της αναγκαστικής εκτέλεσης.</p>
    <p>Σκοπός είναι η επιτάχυνση της εκδίκασης, η οποία καθιστά τη Διαμεσολάβηση ένα ακόμη πιο κρίσιμο εργαλείο αποσυμφόρησης των πινακίων, ειδικά σε υποθέσεις αναγκαστικής εκτέλεσης όπου πλέον ενθαρρύνεται η εξωδικαστική ρύθμιση (π.χ. ανακοπές 632 ΚΠολΔ).</p>`,

    law_5232: `<h3>Ν. 5232/2025 (Περιοριστικά Μέτρα Ε.Ε.)</h3>
    <p>Ο νόμος αυτός αφορά κυρίως τον καθορισμό αδικημάτων και κυρώσεων για παραβίαση των περιοριστικών μέτρων της Ευρωπαϊκής Ένωσης.</p>
    <p>Στη Διαμεσολάβηση, εφιστά την προσοχή του Διαμεσολαβητή (και των νομικών παραστατών) σε διαφορές εμπορικού δικαίου όπου εμπλέκονται οντότητες από τρίτες χώρες, ώστε η όποια συμφωνία να μην παραβιάζει ευρωπαϊκές κυρώσεις (π.χ. σε ζητήματα εμπορικών συμβάσεων και μεταφορών χρημάτων).</p>`,

    law_5282: `<h3>Ν. 5282/2026 (Ψηφιακό Μητρώο & Διαφθορά)</h3>
    <p>Εισάγει το Ενιαίο Ψηφιακό Μητρώο παρακολούθησης υποθέσεων διαφθοράς.</p>
    <p>Για τους Διαμεσολαβητές, ο νόμος αυτός ενισχύει το πλαίσιο ελέγχου και ψηφιοποίησης των νομικών διαδικασιών, επιβάλλοντας αυστηρότερους κανόνες διαφάνειας που πρέπει να λαμβάνονται υπόψη όταν διαμεσολαβούν σε υποθέσεις όπου εμπλέκονται δημόσια πρόσωπα ή φορείς.</p>`,

    manual_ktima: `<h3>Εγχειρίδιο Ενιαίων Κανόνων Νομικού Ελέγχου (Ελληνικό Κτηματολόγιο)</h3>
    <p>Σύμφωνα με την Έκδοση 5.0 (Δεκέμβριος 2025), ο έλεγχος των εγγραπτέων πράξεων στο Κτηματολόγιο ακολουθεί αυστηρούς κανόνες.</p>
    <p>Η Κτηματολογική Διαμεσολάβηση αποτελεί κρίσιμο εργαλείο. Σύμφωνα με το εγχειρίδιο, η κατάθεση Πρακτικού Επιτυχούς Διαμεσολάβησης αποτελεί τίτλο εγγραπτέο στο Κτηματολόγιο (π.χ. για διόρθωση χωρικών μεταβολών ή πρόδηλων σφαλμάτων), εφόσον πληροί τις προϋποθέσεις νομιμότητας και συνοδεύεται από τα απαραίτητα τοπογραφικά διαγράμματα.</p>`
};

function loadTheory(id, el) {
    document.querySelectorAll('.lib-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('theory_content').innerHTML = theoryData[id];
}

function setTab(t, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(t).classList.add('active');
    if (btn) btn.classList.add('active');
    
    // Initialize SMART if tab opened
    if (t === 'smart_tool') calcSmart();
}

window.onload = () => { 
    // Φορτώνει όλα τα αποθηκευμένα (τοπικά) από την προηγούμενη φορά
    loadLocalDB();

    const today = new Date();
    document.getElementById('doc_date').value = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    renderLists(); 
    draw(); 
    loadTheory('conflict_methodology', document.querySelector('.lib-item'));
};
