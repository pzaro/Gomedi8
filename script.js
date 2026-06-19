// ==========================================
// 1. GOOGLE SHEETS & DATA SETUP
// ==========================================

const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyAZ0Inog6pOzlNLx5qh8viyfn0ifPvmKpHkNbGg5MT6fTEqfAcxKEO1IE7CGVFZsP8/exec"; 

let m_data = {
    n: "Παναγιώτης", s: "Ζαρογουλίδης", f: "Αριστοτέλης", am: "2341", iban: "GR89 0172 252 000 5252 01616 0277", bank: "ΤΡΑΠΕΖΑ ΠΕΙΡΑΙΩΣ", addr: "", email: ""
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
    const mediatorFullName = `${m_data.n} ${m_data.s}`;

    if (d.type === 'email') {
        activeHtml = `Αξιότιμες κυρίες, Αξιότιμοι κύριοι,<br><br>
Ονομάζομαι ${mediatorFullName} και είμαι Διαπιστευμένος Διαμεσολαβητής. Σε συνέχεια του διορισμού μου από την Κεντρική Επιτροπή Διαμεσολάβησης (ΚΕΔ), επικοινωνώ μαζί σας σχετικά με την ιδιωτική διαφορά που έχει ανακύψει μεταξύ σας, η οποία αποτελεί αντικείμενο της από ${d.court_d} αγωγής που κατατέθηκε στο ${d.court} με αριθμό κατάθεσης ${d.court_n}.<br><br>
Με την παρούσα επιστολή, σας προσκαλώ στην Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) Διαμεσολάβησης, η οποία θα διεξαχθεί:<br>
${zoomFrame}<br>
Η αμοιβή για τη διεξαγωγή της ΥΑΣ ανέρχεται στο ποσό των ${d.fee}. Το ποσό θα πρέπει να έχει κατατεθεί πριν την έναρξη της συνεδρίας στον λογαριασμό IBAN: ${m_data.iban}, Τράπεζα ${m_data.bank}.<br><br>
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
Η αμοιβή του διαμεσολαβητή ορίζεται στα ${d.fee} για την ΥΑΣ, βαρύνει τα μέρη κατ’ ισομοιρία και θα πρέπει να καταβληθεί στον λογαριασμό ${m_data.iban} πριν από την έναρξη της διαδικασίας.<br><br>
Η παρούσα γνωστοποίηση αποστέλλεται σε σας σύμφωνα με το άρθρο 7 παρ. 2 ως εξής:<br>
[ ☒ ] Με email<br>
[ ☐ ] Με συστημένη επιστολή<br>
[ ☐ ] Άλλως: .........................<br><br>

Τόπος ΜΑΝΔΑΛΟ, την ${d.doc_date}<br><br>
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
Ο διαμεσολαβητής ${mediatorFullName} του ${m_data.f} (ΑΜΔ ${m_data.am}) βεβαιώνω ότι περατώθηκε η Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) για τη διαφορά που περιγράφεται στο επισυναπτόμενο Φύλλο Βασικών Στοιχείων, κατά την οποία παραστάθηκαν τα μέρη, όπως παρακάτω αναφέρεται.<br><br>
Ημερομηνία ΥΑΣ : ${fmtD(d.z_date)}<br>
Τόπος (διεύθυνση) ΥΑΣ: ΣΚΥΔΡΑ, ΜΑΝΔΑΛΟ ΤΚ 58500 ΜΕΣΩ ΤΗΛΕΔΙΑΣΚΕΨΗΣ<br><br>
<b>ΣΥΜΜΕΤΕΧΟΝΤΕΣ ΣΤΗΝ ΥΑΣ:</b><br><br>
${praktikoReqHTML}
${praktikoRespHTML}

<b>Ο ΔΙΑΜΕΣΟΛΑΒΗΤΗΣ</b><br>
Ονοματεπώνυμο: ${mediatorFullName} Πατρώνυμο: ${m_data.f}<br>
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
    conflict_methodology: `<h3>Μεθοδολογία Εφαρμογής Διαμεσολάβησης (Ψυχολογία & Θεωρία Διαπραγματεύσεων)</h3>
    <p>Η σύγχρονη διαμεσολάβηση δεν είναι απλώς μια τυπική νομική διαδικασία, αλλά μια πολυδιάστατη παρέμβαση που αντλεί εργαλεία από τη γνωστική ψυχολογία, τη νευροβιολογία των συναισθημάτων και τη θεωρία των διαπραγματεύσεων (όπως το <i>Harvard Negotiation Project</i>).</p>
    
    <div class="highlight-box">
        <h4 style="margin-top:0;">Στάδιο 1: Προετοιμασία & Εγκαθίδρυση Ψυχολογικής Ασφάλειας (Psychological Safety)</h4>
        <p>Η σύγκρουση ενεργοποιεί την <b>αμυγδαλή</b> του εγκεφάλου (απόκριση "fight or flight"). Ο πρωταρχικός στόχος του διαμεσολαβητή είναι να δημιουργήσει ένα περιβάλλον ασφάλειας (Amy Edmondson), όπου τα μέρη νιώθουν ότι μπορούν να μιλήσουν χωρίς να κριθούν ή να τιμωρηθούν, μειώνοντας την αμυντικότητά τους.</p>
    </div>

    <div class="highlight-box">
        <h4 style="margin-top:0;">Στάδιο 2: Αποφόρτιση & Ενεργητική Ακρόαση (Active Listening)</h4>
        <p>Βασισμένο στην προσωποκεντρική προσέγγιση του <b>Carl Rogers</b>. Τα μέρη πρέπει να "αδειάσουν" το συναισθηματικό τους φορτίο. Ο διαμεσολαβητής χρησιμοποιεί τεχνικές "καθρεφτίσματος" (mirroring) και ενσυναίσθησης (empathy) για να επικυρώσει τα συναισθήματα χωρίς απαραίτητα να συμφωνεί με τα γεγονότα.</p>
    </div>

    <div class="highlight-box">
        <h4 style="margin-top:0;">Στάδιο 3: Αναπλαισίωση (Reframing) & Η Μετάβαση στα "Συμφέροντα"</h4>
        <p>Εφαρμογή των αρχών του <b>Fisher & Ury ("Getting to Yes")</b>: <i>"Διαχωρίστε τους ανθρώπους από το πρόβλημα"</i>. Ο διαμεσολαβητής βοηθά τα μέρη να μετακινηθούν από τις άκαμπτες <b>Θέσεις</b> (Positions - π.χ. "θέλω 10.000 ευρώ") στα βαθύτερα <b>Συμφέροντα</b> (Interests - π.χ. "θέλω οικονομική ασφάλεια" ή "θέλω αναγνώριση").</p>
    </div>

    <div class="highlight-box">
        <h4 style="margin-top:0;">Στάδιο 4: Έλεγχος Πραγματικότητας (Reality Testing) & Γνωστικές Προκαταλήψεις</h4>
        <p>Ο διαμεσολαβητής αντιμετωπίζει συχνές <b>Γνωστικές Προκαταλήψεις (Cognitive Biases)</b>, όπως:
        <ul>
            <li><b>Αντιδραστική Υποτίμηση (Reactive Devaluation):</b> Η τάση να απορρίπτεται μια πρόταση απλά επειδή προέρχεται από την "άλλη πλευρά". Ο διαμεσολαβητής αναλαμβάνει συχνά την "πατρότητα" της ιδέας για να την κάνει αποδεκτή.</li>
            <li><b>Αγκίστρωση (Anchoring):</b> Η εμμονή στο αρχικό ποσό της αγωγής.</li>
        </ul>
        Γίνεται εκτενής χρήση του <b>BATNA</b> (Best Alternative to a Negotiated Agreement) και <b>WATNA</b> (Worst Alternative) για να κατανοήσουν τα μέρη το πραγματικό ρίσκο του δικαστηρίου.</p>
    </div>

    <div class="highlight-box">
        <h4 style="margin-top:0;">Στάδιο 5: Παραγωγή Λύσεων (Brainstorming) & Σύνθεση Συμφωνίας</h4>
        <p>Χρήση αποκλίνουσας σκέψης (divergent thinking) για τη δημιουργία επιλογών αμοιβαίου οφέλους (Win-Win). Στόχος είναι η "μεγέθυνση της πίτας" πριν τον τελικό διαμοιρασμό της.</p>
    </div>`,

    harvard_model: `<h3>Η Μεθοδολογία του Harvard (Με Νευροβιολογία & BATNA/ZOPA)</h3>
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

    // ===== ΚΤΗΜΑΤΟΛΟΓΙΚΗ ΔΙΑΜΕΣΟΛΑΒΗΣΗ =====
    ktima_2664: `<h3>🏠 Ν. 2664/1998 — Εθνικό Κτηματολόγιο (Λειτουργούν)</h3>
    <p>Ο Ν. 2664/1998 (ΦΕΚ Α' 275/3.12.1998) ρυθμίζει τη <b>λειτουργία</b> του Εθνικού Κτηματολογίου μετά την ολοκλήρωση των πρώτων εγγραφών από τον Ν. 2308/1995. Αποτελεί τον βασικό νόμο για τις μεταγενέστερες κτηματολογικές εγγραφές, τις διορθώσεις και τη δημοσιότητα. Έχει τροποποιηθεί εκτεταμένα (Ν. 3127/03, Ν. 3481/06, Ν. 4164/13, Ν. 4512/18, Ν. 4821/21, Ν. 4934/22, Ν. 5142/24, Ν. 5232/25).</p>

    <h4>Άρθρο 1-2: Ορισμός & Αρχές</h4>
    <p>Το Κτηματολόγιο είναι σύστημα <b>κτηματοκεντρικής</b> οργάνωσης νομικών και τεχνικών πληροφοριών για τα ακίνητα. Διέπεται από 6 αρχές: κτηματοκεντρική οργάνωση, υποχρεωτική εγγραφή, τάξη κτηματολογικών εγγραφών, προστασία καλόπιστου τρίτου, αξιοπιστία εγγραφών, δημοσιότητα.</p>

    <h4>Άρθρο 3: Κτηματολογικά Γραφεία & Στοιχεία</h4>
    <p>Τα τηρούμενα στοιχεία είναι: α) κτηματολογικά διαγράμματα, β) κτηματολογικοί πίνακες, γ) κτηματολογικό βιβλίο, δ) ημερολόγιο, ε) αλφαβητικό ευρετήριο δικαιούχων, στ) αρχείο τίτλων.</p>

    <h4>Άρθρο 6: Πρώτες Εγγραφές & Προθεσμία Αμφισβήτησης</h4>
    <div class="highlight-box">
        <b>⚠️ Κρίσιμο για Διαμεσολαβητή — Άρθρο 6 παρ. 2δ (Ν. 5232/2025):</b><br>
        Πριν από τη συζήτηση αγωγής αμφισβήτησης ανακριβούς πρώτης εγγραφής (αγωγή άρθρου 6§2α), τα μέρη <b>υποχρεούνται</b> να προσφύγουν σε διαμεσολαβητή από ειδικό κτηματολογικό μητρώο. Σε περίπτωση επιτυχίας, το πρακτικό καταχωρίζεται αμέσως στο κτηματολόγιο. Η διάταξη ισχύει από 16.9.2025 για αγωγές που κατατίθενται από τότε.
    </div>
    <ul>
        <li><b>Αγωγή ανακριβούς πρώτης εγγραφής (§2α):</b> Αποκλειστική προθεσμία έως 31.12.2027 (με τροποποιήσεις). Ασκείται από όποιον έχει έννομο συμφέρον.</li>
        <li><b>Εγγραφή «αγνώστου ιδιοκτήτη» (§3):</b> Αίτηση ενώπιον Κτηματολογικού Δικαστή. Εφόσον γίνει δεκτή → διόρθωση εγγραφής.</li>
        <li><b>Αντικειμενική ευθύνη Δημοσίου (§8):</b> Δικαστική αμφισβήτηση εγγραφής γίνεται ενώπιον Κτηματολογικού Δικαστή (Μονομελές Πρωτοδικείο).</li>
    </ul>

    <h4>Άρθρο 6 §4 — Μεταφορά Παρωχημένων Πράξεων από Υποθ/κείο</h4>
    <p>Η παράγραφος 4 αφορά <b>δύο κατηγορίες</b>: α) αρχικές εγγραφές και β) οποιοδήποτε εγγραπτέο δικαίωμα με ειδικές ρυθμίσεις για βάρη.</p>
    <p><b>Βασική αρχή:</b> Όταν το καταχωρισθέν στις αρχικές εγγραφές δικαίωμα είχε <b>μεταβιβαστεί, αλλοιωθεί, επιβαρυνθεί ή καταργηθεί</b> δυνάμει δικαιοπραξίας, δικαστικής απόφασης ή άλλης διαδικαστικής πράξης — η οποία είχε εγγραφεί στα βιβλία του Υποθηκοφυλακείου <i>πριν</i> από την ημερομηνία καταχώρισης των αρχικών εγγραφών — η εν λόγω πράξη μεταφέρεται στο κτηματολογικό βιβλίο <b>από τα βιβλία του Υποθ/κείου.</b></p>
    <div class="highlight-box" style="border-left-color: #dc2626;">
        <b>🔑 Κεντρική διάκριση (αρθ. 6 §4γ in fine):</b><br>
        Η εγγραφή δεν είναι τόσο <b>εσφαλμένη</b> όσο <b>παρωχημένη</b>. Στόχος είναι η <b>αποκατάσταση της τάξης</b> και η διατήρηση της αρχής της <b>χρονικής προτεραιότητας κατά το ουσιαστικό δίκαιο.</b>
    </div>
    <ul>
        <li><b>Διενεργείται εντός της προθεσμίας του άρθρου 6§2</b> (όχι αυτεπαγγέλτως)</li>
        <li><b>Αιτών:</b> ο παραλειφθείς δικαιούχος ή τρίτος που δικαιολογεί έννομο συμφέρον (άρθρα 14-16 Ν. 2664/1998)</li>
        <li><b>Δεν διορθώνεται</b> με αυτή τη διαδικασία ακίνητο φερόμενο ως «αγνώστου ιδιοκτήτη» (ΜΠρΘεσ 11125/2008 — <i>contra</i> αλλά όχι πειστικά: ΜΠρΘεσ 8590/2006)</li>
        <li>Η αίτηση <b>δεν επιβαρύνεται</b> με τέλη και δικαιώματα (πάγια ή αναλογικά)</li>
    </ul>

    <h4 style="color:#dc2626;">⛔ Κρίσιμη Προϋπόθεση: Απουσία Ενδιαμέσως Ασύμβιβαστης Εγγραφής</h4>
    <p>Απαραίτητη προϋπόθεση για την εφαρμογή του άρθρου 6§4 είναι η <b>ανυπαρξία ενδιαμέσως καταχωρισθείσας άλλης εγγραφής ασύμβιβαστης κατά περιεχόμενο</b> με την αιτούμενη — δηλαδή εγγραφής της οποίας το ουσιαστικό περιεχόμενο <b>αναιρεί</b> την αιτούμενη καταχώριση ή <b>αντιφάσκει</b> προς αυτήν.</p>

    <div class="highlight-box" style="background:#fef2f2; border-left-color:#dc2626;">
        <b>📖 Πρακτικό Παράδειγμα:</b><br><br>
        Ο <b>Α</b> πωλεί το ακίνητο στον <b>Β</b> στις 2.1.2020 και μεταγράφει αυθημερόν, αλλά παραλείπει να το δηλώσει στην κτηματογράφηση. Ο <b>Α</b> φέρεται ως κύριος στις αρχικές εγγραφές του Κ.Γ. που άνοιξε στις 1.1.2022.<br><br>
        Στις <b>10.1.2022</b> ο Α δωρίζει το ακίνητο στον <b>Γ</b> και καταχωρεί αυθημερόν.<br><br>
        → Ο <b>Β</b> <span style="color:#dc2626;"><b>δεν μπορεί πλέον</b></span> να εγγράψει με §4 την πώλησή του — η εγγραφή της δωρεάς στον Γ είναι ενδιαμέσως ασύμβιβαστη κατά περιεχόμενο.<br><br>
        → Ο <b>Δ</b> όμως, στον οποίο ο Α είχε μισθώσει το ακίνητο για 20 έτη το 2018 και είχε τότε μεταγράψει το μισθωτήριο, <span style="color:#059669;"><b>μπορεί να αιτηθεί</b></span> την εγγραφή της μίσθωσης με τη διάταξη αυτή — η μίσθωση δεν αντιφάσκει με τη δωρεά, απλώς τη βαρύνει.
    </div>
    <h4>Άρθρο 6 §4 — Διαδικασία Υποβολής & Έλεγχος</h4>
    <p><b>Τι υποβάλλεται:</b></p>
    <ul>
        <li>Αίτηση καταχώρισης</li>
        <li>Η καταχωριστέα πράξη</li>
        <li>Περίληψη & ΑΚΔ</li>
        <li>Νομιμοποιητικά έγγραφα</li>
        <li>Φάκελος χωρικής μεταβολής (αν απαιτείται)</li>
        <li>Όλα τα προσκομιζόμενα έγγραφα <b>σε επικυρωμένα αντίγραφα</b></li>
    </ul>
    <ul>
        <li>Η υποβολή γίνεται <b>ηλεκτρονικά</b></li>
        <li>Απαιτείται <b>συμβολαιογραφικό πληρεξούσιο</b> αν υποβάλλει μη αρμόδιος επαγγελματίας πληρεξούσιος του δικαιούχου</li>
        <li>Επί αποθανόντων δικαιούχων → υποβάλλει ο <b>κληρονόμος</b></li>
        <li>Επί διαδοχικών δικαιούχων → υποβάλλει ο <b>τρέχων</b></li>
        <li>Η αίτηση υποβάλλεται <b>ατελώς</b>. Τα αντίγραφα συνυποβαλλομένων χορηγούνται από το ΚΓ με πληρωμή</li>
    </ul>

    <div class="highlight-box" style="border-left-color: #2563eb;">
        <b>⚖️ Έλεγχος Νομιμότητας & Αναδρομικότητα:</b><br><br>
        <b>→ Ο ΠρΚΓ ασκεί έλεγχο νομιμότητας κατά τα άρθρα 14 και 16 Ν. 2664/1998</b><br>
        Προθεσμία ελέγχου: <b>5 εργάσιμες ημέρες</b><br><br>
        <b>→ Αναδρομικότητα (άρθρο 15 §2 in fine):</b> Η εγγραφή ισχύει από την <b>ημερομηνία υποβολής της αίτησης</b> για καταχώριση — ενόψει της ανυπαρξίας αντιφατικής εγγραφής (υποστηρίξιμη θέση).<br><br>
        <b>→ Αντιρρήσεις (άρθρο 16§5 Ν. 2664/1998):</b> Εκούσια δικαιοδοσία ενώπιον Κτηματολογικού Δικαστή. Ο Εισαγγελέας και ο ΠρΚΓ ως διάδικοι. Εκτέλεση τελεσίδικης απόφασης. Τριτανακοπή και παρέμβαση επιτρεπτές.
    </div>
    <p style="font-size:0.9rem; color:#64748b; margin-top:12px;"><i>Πρακτική σημασία για διαμεσολαβητή:</i> Σε υποθέσεις §4, ο διαμεσολαβητής πρέπει να ελέγχει αν υπάρχει ενδιαμέσως ασύμβιβαστη εγγραφή πριν εισάγει τη λύση της αδικαστικής μεταφοράς. Αν υπάρχει, η μόνη οδός είναι η αγωγή του άρθρου 6§2 — με υποχρεωτική ΥΑΣ.</p>

    <h4>Άρθρο 7: Οριστικοποίηση & Αμάχητο Τεκμήριο</h4>
    <p>Πρώτες εγγραφές που δεν αμφισβητήθηκαν εντός της προθεσμίας καθίστανται <b>αμάχητο τεκμήριο</b>. Ο εκτοπισθείς δικαιούχος δικαιούται μόνο αποζημίωση από αδικοπραξία ή απόδοση πλουτισμού — όχι αυτούσιο ακίνητο, εκτός αν δεν έχουν μεταβιβαστεί δικαιώματα.</p>

    <h4>Άρθρα 10-13: Κτηματολογικό Βιβλίο & Μαχητό Τεκμήριο</h4>
    <p>Οι μεταγενέστερες (μετά τις πρώτες) εγγραφές τεκμαίρονται <b>μαχητά</b> ακριβείς (άρθρο 13). Η ανατροπή γίνεται με αμετάκλητη δικαστική απόφαση. Τρίτος που απέκτησε δικαίωμα στηριζόμενος καλόπιστα στις εγγραφές προστατεύεται.</p>

    <h4>Άρθρο 12: Εγγραπτέες Πράξεις</h4>
    <p>Στα κτηματολογικά φύλλα καταχωρίζονται: συμβολαιογραφικές πράξεις μεταβίβασης, υποθήκες/προσημειώσεις, κατασχέσεις, μακροχρόνιες μισθώσεις (άρθρο 618 ΑΚ), διαχωρισμοί/συνενώσεις, αγωγές (άρθρο 220 ΚΠολΔ), και <b>πρακτικά διαμεσολάβησης</b> (άρθρο 6§2δ).</p>

    <h4>Άρθρα 14-16: Διαδικασία Εγγραφής & Έλεγχος Νομιμότητας</h4>
    <p>Ο Προϊστάμενος Κτηματολογικού Γραφείου ελέγχει <b>περιοριστικά</b>: τοπική αρμοδιότητα, εγγραπτέο χαρακτήρα πράξης, τυπικές προϋποθέσεις, νομιμοποίηση αιτούντος. <b>Δεν</b> ελέγχει ουσιαστική νομιμότητα τίτλου.</p>

    <h4>Άρθρο 18: Πρόδηλα Σφάλματα</h4>
    <p>Διόρθωση πρόδηλου σφάλματος γίνεται από τον Προϊστάμενο ΚΓ ατελώς. Θεωρείται πρόδηλο σφάλμα (μεταξύ άλλων) όταν η ανακρίβεια: αα) προκύπτει από δημόσιο έγγραφο καταχωρισθέν στα υποθηκοφυλακεία, ββ) προκύπτει από τη συσχέτιση εγγραφής με στοιχεία ανάρτησης, γγ) προκύπτει από διοικητική πράξη ή απόφαση Επιτροπής Ενστάσεων, δδ) αφορά σε ελλιπή ή ανακριβή στοιχεία οριζόντιων/κάθετων ιδιοκτησιών. <b>Απόφαση υποχρεωτικά εντός 30 εργασίμων ημερών.</b></p>

    <h4>Άρθρο 22: Δημοσιότητα & Πιστοποιητικά</h4>
    <p>Τα Κτηματολογικά Γραφεία χορηγούν πιστοποιητικά, αντίγραφα και αποσπάσματα σε κάθε ενδιαφερόμενο που καταβάλλει τα τέλη. Κρίσιμα για τον διαμεσολαβητή: <b>κτηματολογικό φύλλο</b> (πλήρης εικόνα ακινήτου), <b>απόσπασμα διαγράμματος</b> (γεωμετρικά στοιχεία), <b>πιστοποιητικό εγγραπτέων βαρών</b> (υποθήκες, κατασχέσεις).</p>

    <div class="highlight-box">
        <b>📋 Πρακτικό Σημείωμα για τη Διαμεσολάβηση:</b><br>
        Βάσει του Ν. 2664/1998 άρθρο 6§2δ (ως τροποποιήθηκε από Ν. 5232/2025), η κτηματολογική διαμεσολάβηση για ανακριβείς πρώτες εγγραφές είναι πλέον <b>υποχρεωτική προδικασία</b>. Ο διαμεσολαβητής πρέπει να ανήκει στο ειδικό κτηματολογικό μητρώο. Επιτυχές πρακτικό καταχωρίζεται αμέσως στο κτηματολόγιο με απεικόνιση γεωμετρικής μεταβολής.
    </div>`,

    ktima_intro: `<h3>🏠 Ν. 2308/1995 — Κτηματογράφηση & Εθνικό Κτηματολόγιο</h3>
    <p>Ο Ν. 2308/1995 (ΦΕΚ Α' 114/15.6.1995) αποτελεί τον θεμελιώδη νόμο κτηματογράφησης για τη δημιουργία του Εθνικού Κτηματολογίου. Ρυθμίζει τη διαδικασία από τη συλλογή δηλώσεων έως τις πρώτες εγγραφές στα κτηματολογικά βιβλία. Έχει τροποποιηθεί πολλές φορές (Ν. 3127/03, Ν. 3481/06, Ν. 4164/13, Ν. 4512/18, Ν. 4821/21, Ν. 5142/24, Ν. 5172/25).</p>
    <h4>Φορέας — «Ελληνικό Κτηματολόγιο» ΝΠΔΔ</h4>
    <p>Από τον Ν. 4512/2018 η ΕΚΧΑ ΑΕ καταργήθηκε και συστάθηκε ΝΠΔΔ με την επωνυμία «Ελληνικό Κτηματολόγιο», το οποίο είναι πλέον ο αρμόδιος φορέας για τη διενέργεια κτηματογράφησης και τη λειτουργία του Κτηματολογίου.</p>
    <h4>Βασικά Άρθρα</h4>
    <ul>
        <li><b>Άρθρο 1:</b> Κήρυξη περιοχής υπό κτηματογράφηση με απόφαση Υπουργού — δημοσίευση σε εφημερίδες και κοινοποίηση σε Υπουργεία, ΟΤΑ, ΤΕΕ, Δικηγορικούς & Συμβολαιογραφικούς Συλλόγους.</li>
        <li><b>Άρθρο 2:</b> Δηλώσεις εγγραπτέων δικαιωμάτων — υποβολή σε 3 μήνες (6 για αλλοδαπούς & Δημόσιο). Πρόστιμο 300–2.000€ για εκπρόθεσμη δήλωση.</li>
        <li><b>Άρθρο 3/3Α:</b> Σύνταξη προσωρινών διαγραμμάτων & νομικός έλεγχος τίτλων.</li>
        <li><b>Άρθρο 4:</b> Ανάρτηση στοιχείων επί 2 μήνες — ανακοίνωση σε εφημερίδες και δημοτικό κατάστημα.</li>
        <li><b>Άρθρο 5:</b> Από την ανάρτηση απαγορεύεται με ποινή ακυρότητας η σύνταξη συμβολαίων χωρίς «Πιστοποιητικό κτηματογραφούμενου ακινήτου».</li>
        <li><b>Άρθρο 6/6Α:</b> Αιτήσεις διόρθωσης εντός 2 μηνών. Πρόδηλα σφάλματα: ατελώς, χωρίς προθεσμία.</li>
        <li><b>Άρθρο 7/7Α:</b> Ενστάσεις & Επιτροπές Εξέτασης (τριμελείς: νομικός-μηχανικός-νομικός).</li>
        <li><b>Άρθρα 11/12:</b> Περαίωση κτηματογράφησης & πρώτες εγγραφές στα κτηματολογικά βιβλία.</li>
    </ul>
    <div class="highlight-box">
        <b>⚠️ Για τον Διαμεσολαβητή:</b> Η ιδιωτική διαφορά (π.χ. αμφισβήτηση ορίων, συνιδιοκτησία) μπορεί να επιλυθεί μέσω διαμεσολάβησης. Το Πρακτικό Επιτυχούς Διαμεσολάβησης αποτελεί εγγραπτέο τίτλο στο Κτηματολόγιο (Εγχειρίδιο 5.0/2025), εφόσον συνοδεύεται από εγκεκριμένα τοπογραφικά.
    </div>`,

    ktima_types: `<h3>🏠 Τύποι Κτηματολογικών Διαφορών</h3>
    <p>Οι κτηματολογικές διαφορές που είναι κατάλληλες για διαμεσολάβηση κατηγοριοποιούνται ως εξής:</p>
    <h4>1. Διαφορές Συνιδιοκτησίας</h4>
    <p>Συγκύριοι αδυνατούν να συμφωνήσουν για τη χρήση, διαχείριση ή διανομή κοινής ακίνητης περιουσίας. Συνηθισμένο σε κληρονομικές υποθέσεις, εξ αδιαιρέτου ακίνητα.</p>
    <h4>2. Αμφισβήτηση Ορίων (Εμπράγματη Αγωγή)</h4>
    <p>Γειτονικές ιδιοκτησίες αμφισβητούν τα κοινά τους όρια. Συνήθως απαιτεί τοπογραφικό έλεγχο και συντονισμό με μηχανικό. Η συμφωνία κατοχυρώνεται στο Κτηματολόγιο μέσω του πρακτικού.</p>
    <h4>3. Διαφορές από Μεταβιβάσεις Ακινήτων</h4>
    <p>Διαφορές από συμβόλαια αγοραπωλησίας, δωρεάς, ανταλλαγής — συχνά σχετίζονται με ελαττώματα ακινήτου, μη συμφωνημένα τετραγωνικά ή βάρη που δεν είχαν γνωστοποιηθεί.</p>
    <h4>4. Αγωγές Διανομής (κοινωνία δικαιώματος)</h4>
    <p>Αντί δικαστικής διανομής, τα μέρη μπορούν μέσω διαμεσολάβησης να συμφωνήσουν τρόπο αυτούσιας ή χρηματικής κατανομής.</p>
    <h4>5. Πρόδηλα Σφάλματα & Ανακρίβειες</h4>
    <p>Περιπτώσεις λανθασμένων εγγραφών (εμβαδόν, ΓΑΚ, ΚΑΕΚ) που μπορεί να επιλυθούν εξωδικαστικά μεταξύ των ενδιαφερομένων, με υποβολή αιτήματος διόρθωσης που συνοδεύει το πρακτικό.</p>`,

    ktima_process: `<h3>🏠 Διαδικασία & Πρακτικό ως Εγγραπτέος Τίτλος</h3>
    <p>Η κτηματολογική διαμεσολάβηση ακολουθεί τη γενική διαδικασία του Ν. 4640/2019, με κρίσιμες ιδιαιτερότητες:</p>
    <h4>Βήματα Διαδικασίας</h4>
    <ol>
        <li><b>Προ-Διαμεσολάβηση:</b> Συλλογή κτηματολογικών στοιχείων (αποσπάσματα κτηματολογικού χάρτη, φύλλο ιδιοκτησίας), τοπογραφικών διαγραμμάτων και συμβολαίων.</li>
        <li><b>ΥΑΣ:</b> Ενημέρωση μερών για τη διαδικασία. Διαπίστωση βούλησης για συνέχιση.</li>
        <li><b>Συνεδρίες Διαμεσολάβησης:</b> Με παρουσία νομικών παραστατών. Συνήθως απαιτείται και η συμμετοχή πολιτικού μηχανικού/τοπογράφου για τεχνικά ζητήματα.</li>
        <li><b>Σύνταξη Πρακτικού:</b> Το Πρακτικό Επιτυχούς Διαμεσολάβησης καταρτίζεται κατά τους τύπους του Ν. 4640/2019.</li>
        <li><b>Κατάθεση στο Δικαστήριο:</b> Κατόπιν αιτήσεως, το πρακτικό κηρύσσεται εκτελεστό.</li>
        <li><b>Εγγραφή στο Κτηματολόγιο:</b> Το εκτελεστό πρακτικό κατατίθεται στο Κτηματολογικό Γραφείο ως εγγραπτέα πράξη, μαζί με τα απαιτούμενα τοπογραφικά.</li>
    </ol>
    <div class="highlight-box">
        <b>📋 Έκδοση 5.0 Εγχειριδίου (2025):</b> Ρητά αναγνωρίζει το Πρακτικό Επιτυχούς Διαμεσολάβησης ως τίτλο εγγραπτέο για: (α) χωρικές μεταβολές, (β) διόρθωση πρόδηλων σφαλμάτων, (γ) δικαιώματα επί ακινήτου που απορρέουν από συμφωνία — εφόσον συνοδεύεται από διάγραμμα εγκεκριμένο από αρμόδιο μηχανικό.
    </div>`,

    ktima_errors: `<h3>🏠 Πρόδηλα Σφάλματα & Διόρθωση μέσω Διαμεσολάβησης</h3>
    <p>Τα πρόδηλα σφάλματα αποτελούν έναν από τους συνηθέστερους λόγους προσφυγής σε κτηματολογική διαμεσολάβηση, καθώς η εξωδικαστική επίλυση είναι ταχύτερη και οικονομικότερη από τη δικαστική.</p>
    <h4>Τι είναι Πρόδηλο Σφάλμα;</h4>
    <p>Σύμφωνα με τον Ν. 2664/1998 (άρθρο 6), πρόδηλο σφάλμα είναι κάθε ανακρίβεια που προκύπτει από λάθος κατά την αρχική κτηματογράφηση ή κατά τη μεταγενέστερη εγγραφή, και η οποία είναι εμφανής από τα ίδια τα κτηματολογικά στοιχεία.</p>
    <h4>Συνηθισμένα Παραδείγματα</h4>
    <ul>
        <li>Εσφαλμένο εμβαδόν ακινήτου (αναγραφή π.χ. 85τμ αντί 185τμ)</li>
        <li>Λανθασμένη εγγραφή συνόρων (ΒΑ αντί ΝΑ)</li>
        <li>Λάθος ονόματος ιδιοκτήτη λόγω ομωνυμίας</li>
        <li>Διπλοεγγραφή τμήματος ακινήτου σε δύο ΚΑΕΚ</li>
    </ul>
    <h4>Ρόλος Διαμεσολάβησης</h4>
    <p>Εάν το σφάλμα αφορά διαφορά μεταξύ δύο ή περισσότερων ιδιωτών (π.χ. γείτονες που διεκδικούν τμήμα που εσφαλμένα εγγράφηκε στον έτερο), η διαμεσολάβηση επιτρέπει στα μέρη να συμφωνήσουν την ορθή κατάσταση, να συντάξουν κοινό τοπογραφικό και να υποβάλουν από κοινού αίτηση διόρθωσης, αποφεύγοντας τη δικαστική αγωγή κτηματολογικής διόρθωσης.</p>`,

    // ===== ΟΙΚΟΓΕΝΕΙΑΚΗ ΔΙΑΜΕΣΟΛΑΒΗΣΗ =====
    family_intro: `<h3>👨‍👩‍👧 Οικογενειακή Διαμεσολάβηση — Εισαγωγή & Ορισμός</h3>
    <p>Η Οικογενειακή Διαμεσολάβηση είναι μια εξειδικευμένη μορφή διαμεσολάβησης που αφορά διαφορές μεταξύ μελών της ίδιας οικογένειας, κυρίως σε περιπτώσεις διαζυγίου, διακοπής συμβίωσης ή αναθεώρησης οικογενειακών ρυθμίσεων.</p>
    <h4>Τι Καλύπτει;</h4>
    <ul>
        <li>Επιμέλεια, διατροφή και επικοινωνία τέκνων</li>
        <li>Διανομή οικογενειακής περιουσίας και κατοικίας</li>
        <li>Σύνταξη γονικών συμφωνιών (Parenting Plans)</li>
        <li>Διαφορές μεταξύ συγγενών (γονείς-ενήλικα τέκνα, αδέρφια)</li>
        <li>Αναθεώρηση υφιστάμενων δικαστικών αποφάσεων</li>
    </ul>
    <h4>Ιδιαιτερότητες ως Προς τη Γενική Διαμεσολάβηση</h4>
    <p>Ο οικογενειακός διαμεσολαβητής χρειάζεται πρόσθετες δεξιότητες ψυχολογίας, ενσυναίσθησης και γνώσης του αναπτυξιακού σταδίου των παιδιών. Η συναισθηματική φόρτιση των μερών είναι πολύ υψηλότερη απ' ό,τι σε εμπορικές διαφορές, και ο στόχος δεν είναι μόνο η νομική επίλυση αλλά η διατήρηση λειτουργικών σχέσεων για χάρη των παιδιών.
    </p>
    <div class="highlight-box"><b>Νομική Βάση:</b> Ν. 4640/2019, άρθρο 6 παρ. 1α — Οικογενειακές διαφορές (πλην εκείνων που αφορούν προσωπική κατάσταση) υπάγονται <b>υποχρεωτικά</b> στην ΥΑΣ πριν την κατάθεση αγωγής στο δικαστήριο.</div>`,

    family_phases: `<h3>👨‍👩‍👧 Οι Φάσεις της Οικογενειακής Διαμεσολάβησης</h3>
    <p>Η οικογενειακή διαμεσολάβηση ακολουθεί τη γενική δομή, αλλά με έμφαση στη συναισθηματική αποκλιμάκωση και τις ανάγκες των παιδιών.</p>
    <h4>Φάση 1: Προπαρασκευαστική / Αξιολόγηση Καταλληλότητας</h4>
    <p>Ο διαμεσολαβητής διεξάγει ατομικές προσυνεδρίες (pre-mediation) με κάθε μέρος ξεχωριστά. Αξιολογεί αν υπάρχει ισορροπία δυνάμεων ή αν η κατάσταση δεν είναι κατάλληλη για διαμεσολάβηση (π.χ. ενδοοικογενειακή βία, εξάρτηση).</p>
    <h4>Φάση 2: Κοινή Πρώτη Συνεδρία</h4>
    <p>Εισαγωγή κανόνων, αμοιβαίος σεβασμός, καθορισμός θεμάτων προς συζήτηση (agenda). Εδώ εμφανίζεται συχνά η πιο έντονη συναισθηματική αντιπαράθεση.</p>
    <h4>Φάση 3: Εξερεύνηση Συμφερόντων & Αναγκών</h4>
    <p>Ο διαμεσολαβητής βοηθά κάθε μέρος να εκφράσει τα πραγματικά του συμφέροντα πέρα από τις αρχικές του θέσεις. Κεντρικό ερώτημα: «Τι χρειάζονται τα παιδιά από τον καθένα σας;»</p>
    <h4>Φάση 4: Δημιουργία Επιλογών</h4>
    <p>Brainstorming λύσεων για επιμέλεια, επικοινωνία, διατροφή, περιουσία. Χρήση εργαλείων όπως το Parenting Plan (Σχέδιο Γονεϊκής Ευθύνης).</p>
    <h4>Φάση 5: Αξιολόγηση & Συμφωνία</h4>
    <p>Αξιολόγηση κάθε επιλογής με τη μέθοδο SMART. Σύνταξη του Πρακτικού Επιτυχούς Διαμεσολάβησης, το οποίο κατατίθεται στο Μονομελές Πρωτοδικείο για να αποκτήσει ισχύ δικαστικής απόφασης.</p>`,

    family_divorce_psych: `<h3>👨‍👩‍👧 Ψυχολογία του Διαζυγίου</h3>
    <p>Η κατανόηση της ψυχολογίας του διαζυγίου είναι θεμελιώδης για τον οικογενειακό διαμεσολαβητή, καθώς καθορίζει σε μεγάλο βαθμό τη δυναμική των συνεδριών.</p>
    <h4>Στάδια Θλίψης (Kübler-Ross) στο Διαζύγιο</h4>
    <p>Τα μέρη δεν βρίσκονται πάντα στο ίδιο στάδιο επεξεργασίας της απώλειας:</p>
    <ul>
        <li><b>Άρνηση:</b> «Αυτό δεν συμβαίνει πραγματικά.» – Δυσκολία αποδοχής χωρισμού.</li>
        <li><b>Θυμός:</b> «Γιατί μου το έκανε αυτό;» – Συχνά ο τόνος που κυριαρχεί στις πρώτες συνεδρίες.</li>
        <li><b>Διαπραγμάτευση:</b> «Αν αλλάξεις αυτό, ίσως...» – Δείγμα πιθανής ετοιμότητας για συμφωνία.</li>
        <li><b>Κατάθλιψη:</b> Απόσυρση, αδιαφορία, δυσκολία λήψης αποφάσεων.</li>
        <li><b>Αποδοχή:</b> Η φάση όπου η διαμεσολάβηση είναι πιο αποτελεσματική.</li>
    </ul>
    <h4>Σύνδρομο Αποξένωσης Γονέα (PAS)</h4>
    <p>Ένα φαινόμενο που ο διαμεσολαβητής πρέπει να αναγνωρίζει: ένας γονέας συστηματικά υπονομεύει τη σχέση του παιδιού με τον άλλο γονέα. Δεν αποτελεί αντικείμενο κλινικής εκτίμησης από τον διαμεσολαβητή, αλλά πρέπει να παραπέμπεται σε ψυχολόγο.</p>
    <h4>Ο Ρόλος της Αβεβαιότητας</h4>
    <p>Η αβεβαιότητα για το οικονομικό μέλλον, τη στέγη και την επαφή με τα παιδιά τροφοδοτεί την εχθρότητα. Ο διαμεσολαβητής πρέπει να χτίσει ένα πλαίσιο ασφάλειας: «Εδώ μπορείτε να εκφραστείτε ελεύθερα, και θα εργαστούμε για να βρούμε ένα δρόμο μπροστά.»</p>`,

    family_children: `<h3>👨‍👩‍👧 Επιμέλεια & Συμφέροντα Τέκνων</h3>
    <p>Το <b>«συμφέρον του τέκνου»</b> (best interest of the child) είναι η βασική αρχή που διέπει κάθε απόφαση στην οικογενειακή διαμεσολάβηση. Ο διαμεσολαβητής δεν αντιπροσωπεύει τα παιδιά, αλλά οφείλει να τα θέτει στο κέντρο κάθε συζήτησης.</p>
    <h4>Μοντέλα Επιμέλειας</h4>
    <ul>
        <li><b>Αποκλειστική Επιμέλεια:</b> Ένας γονέας έχει την αποφασιστική εξουσία για ζητήματα εκπαίδευσης, υγείας, διαμονής. Ο άλλος έχει δικαίωμα επικοινωνίας.</li>
        <li><b>Κοινή Επιμέλεια (Ν. 4800/2021):</b> Και οι δύο γονείς ασκούν από κοινού τη γονική μέριμνα. Απαιτεί επικοινωνία και συνεργασία.</li>
        <li><b>Εναλλασσόμενη Κατοικία:</b> Το παιδί κατοικεί εναλλάξ και με τους δύο γονείς. Λειτουργεί εφόσον υπάρχει γεωγραφική εγγύτητα και συνεργασία.</li>
    </ul>
    <h4>Το Parenting Plan (Σχέδιο Γονεϊκής Ευθύνης)</h4>
    <p>Αναλυτικό έγγραφο που καταρτίζεται κατά τη διαμεσολάβηση και ρυθμίζει:</p>
    <ul>
        <li>Τόπο κύριας κατοικίας τέκνου</li>
        <li>Πρόγραμμα επικοινωνίας (καθημερινές, σαββατοκύριακα, αργίες)</li>
        <li>Διαδικασία λήψης σημαντικών αποφάσεων</li>
        <li>Διαχείριση παιδικών εξόδων (ιατρικά, εκπαίδευση, δραστηριότητες)</li>
        <li>Μηχανισμός επίλυσης μελλοντικών διαφωνιών</li>
    </ul>`,

    family_law_4800: `<h3>👨‍👩‍👧 Νόμος 4800/2021 — Μεταρρύθμιση Οικογενειακού Δικαίου</h3>
    <p>Ο Ν. 4800/2021 αποτελεί τη σημαντικότερη μεταρρύθμιση του ελληνικού οικογενειακού δικαίου της τελευταίας δεκαετίας και έχει άμεσες συνέπειες στην οικογενειακή διαμεσολάβηση.</p>
    <h4>Κύριες Αλλαγές</h4>
    <ul>
        <li><b>Τεκμήριο Κοινής Επιμέλειας (άρθρο 1513 ΑΚ):</b> Μετά τον χωρισμό, αμφότεροι οι γονείς ασκούν από κοινού τη γονική μέριμνα, εκτός εάν αποδειχθεί ότι αυτό αντιβαίνει στο συμφέρον του τέκνου.</li>
        <li><b>Ελάχιστο Χρόνο Επικοινωνίας (άρθρο 1520 ΑΚ):</b> Τεκμαίρεται ελάχιστος χρόνος επικοινωνίας με τον γονέα που δεν έχει την επιμέλεια: τουλάχιστον το 1/3 του συνολικού χρόνου.</li>
        <li><b>Μεταφορά Κατοικίας Τέκνου (άρθρο 1519 ΑΚ):</b> Γονέας που επιθυμεί να μεταφερθεί σε άλλη πόλη/χώρα υποχρεούται να ειδοποιήσει έγκαιρα τον άλλον γονέα.</li>
        <li><b>Ενίσχυση Ρόλου Διαμεσολάβησης:</b> Ο νόμος ρητά ενθαρρύνει τη χρήση οικογενειακής διαμεσολάβησης πριν την προσφυγή στο δικαστήριο.</li>
    </ul>
    <div class="highlight-box"><b>Πρακτική Σημασία για τον Διαμεσολαβητή:</b> Το νέο πλαίσιο δημιουργεί κίνητρο για διαμεσολάβηση, καθώς τα μέρη μπορούν να συμφωνήσουν λεπτομερέστερες ρυθμίσεις απ' ό,τι θα έκρινε το δικαστήριο, προσαρμοσμένες στις πραγματικές τους ανάγκες.</div>`,

    family_mediator_role: `<h3>👨‍👩‍👧 Ρόλος Διαμεσολαβητή & Δικηγόρου στην Οικογενειακή Διαμεσολάβηση</h3>
    <h4>Ο Ρόλος του Οικογενειακού Διαμεσολαβητή</h4>
    <p>Ο οικογενειακός διαμεσολαβητής λειτουργεί με βάση τις αρχές της <b>αμεροληψίας</b>, της <b>ουδετερότητας</b> και της <b>εμπιστευτικότητας</b>. Επιπλέον, σε υποθέσεις με παιδιά, υιοθετεί μια «οπτική εστιασμένη στο παιδί» (child-focused approach).</p>
    <p>Δεν αποφασίζει, δεν συμβουλεύει νομικά, δεν ψυχοθεραπεύει. Διευκολύνει την επικοινωνία, βοηθά στον εντοπισμό συμφερόντων και στη δημιουργία επιλογών.</p>
    <h4>Ο Ρόλος του Δικηγόρου</h4>
    <p>Σύμφωνα με τον Ν. 4640/2019, η παρουσία νομικού παραστάτη στην ΥΑΣ είναι υποχρεωτική. Ο δικηγόρος στην οικογενειακή διαμεσολάβηση:</p>
    <ul>
        <li>Ενημερώνει τον εντολέα του για τα νομικά δικαιώματα και τον BATNA (Best Alternative to Negotiated Agreement)</li>
        <li>Αξιολογεί τις προτεινόμενες λύσεις ως προς τη νομική τους βιωσιμότητα</li>
        <li>Δεν «πολεμά» τη διαμεσολάβηση, αλλά στηρίζει τον εντολέα να λάβει τεκμηριωμένες αποφάσεις</li>
        <li>Βοηθά στη διατύπωση της τελικής συμφωνίας νομικά ορθά</li>
    </ul>
    <div class="highlight-box"><b>Κρίσιμη Διάκριση:</b> Ο δικηγόρος συμβουλεύει· ο διαμεσολαβητής διευκολύνει. Η σύγχυση αυτών των ρόλων αποτελεί από τις πιο συνηθισμένες δυσλειτουργίες στην πράξη.</div>`,

    family_bafm: `<h3>👨‍👩‍👧 Κατευθυντήριες Γραμμές BAFM</h3>
    <p>Η <b>BAFM</b> (British Association for Family Mediation / Βρετανική Ένωση Οικογενειακής Διαμεσολάβησης) αποτελεί διεθνή σημείο αναφοράς για τα πρότυπα της οικογενειακής διαμεσολάβησης, τα οποία υιοθετούν και ευρωπαϊκοί φορείς, συμπεριλαμβανομένων ελληνικών οργανισμών κατάρτισης.</p>
    <h4>Βασικές Αρχές BAFM</h4>
    <ul>
        <li><b>Εθελοντική Συμμετοχή:</b> Κανένα μέρος δεν αναγκάζεται να παραμείνει.</li>
        <li><b>Ουδετερότητα Διαμεσολαβητή:</b> Δεν εκπροσωπεί κανέναν και δεν έχει συμφέρον στο αποτέλεσμα.</li>
        <li><b>Εμπιστευτικότητα:</b> Προστατεύεται νομικά. Εξαιρείται μόνο αν υπάρχει κίνδυνος για παιδιά.</li>
        <li><b>Child-Inclusive Mediation:</b> Σε ορισμένες περιπτώσεις, η φωνή του παιδιού (άνω των 10 ετών) ενσωματώνεται έμμεσα στη διαδικασία, μέσω εξειδικευμένου συνεργάτη.</li>
        <li><b>Screening:</b> Υποχρεωτικός έλεγχος πριν για ενδοοικογενειακή βία, εξαναγκασμό, σοβαρές ανισορροπίες ισχύος.</li>
    </ul>`,

    family_standards: `<h3>👨‍👩‍👧 Πρότυπα Οικογενειακού Διαμεσολαβητή</h3>
    <p>Ο οικογενειακός διαμεσολαβητής, πέρα από τη γενική πιστοποίηση του Ν. 4640/2019, οφείλει να πληροί πρόσθετες απαιτήσεις εκπαίδευσης και ηθικής.</p>
    <h4>Εκπαίδευση & Κατάρτιση</h4>
    <p>Σύμφωνα με τις οδηγίες του ΕΝ ΔΙΚΑΙΩ και αντίστοιχων φορέων, το πρόγραμμα οικογενειακής διαμεσολάβησης περιλαμβάνει:</p>
    <ul>
        <li>Θεωρία διαμεσολάβησης & τεχνικές (βασική εκπαίδευση)</li>
        <li>Οικογενειακό δίκαιο (Ν. 4800/2021, ΑΚ 1385-1542)</li>
        <li>Ψυχολογία διαζυγίου & αναπτυξιακή ψυχολογία παιδιών</li>
        <li>Τεχνικές child-focused mediation</li>
        <li>Διαχείριση ενδοοικογενειακής βίας & screening</li>
        <li>Πρακτική εξάσκηση (role-plays)</li>
    </ul>
    <h4>Δεοντολογικές Υποχρεώσεις</h4>
    <ul>
        <li>Αναφορά στις αρχές εάν διαπιστωθεί κίνδυνος για παιδί</li>
        <li>Αποχή εάν υπάρχει σύγκρουση συμφερόντων</li>
        <li>Διαρκής επαγγελματική ανάπτυξη (CPD)</li>
        <li>Εποπτεία από έμπειρο διαμεσολαβητή (supervision)</li>
    </ul>`,

    // ===== ΕΜΠΟΡΙΚΕΣ ΥΠΟΘΕΣΕΙΣ =====
    commercial_intro: `<h3>💼 Εμπορικές Υποθέσεις — Εισαγωγή & Πεδίο Εφαρμογής</h3>
    <p>Η εμπορική διαμεσολάβηση αφορά διαφορές που προκύπτουν από εμπορικές συναλλαγές μεταξύ επιχειρήσεων (B2B), μεταξύ επιχειρήσεων και καταναλωτών (B2C), ή στο πλαίσιο εταιρικών σχέσεων.</p>
    <h4>Πεδίο Εφαρμογής (Ν. 4640/2019, άρθρο 6 παρ. 1β)</h4>
    <p>Υπάγονται υποχρεωτικά στην ΥΑΣ διαφορές που:</p>
    <ul>
        <li>Εκδικάζονται κατά την τακτική διαδικασία</li>
        <li>Υπάγονται στο Μονομελές Πρωτοδικείο με αντικείμενο <b>άνω των 30.000€</b></li>
        <li>Υπάγονται στο Πολυμελές Πρωτοδικείο (ανεξαρτήτως ποσού)</li>
    </ul>
    <h4>Κατηγορίες Εμπορικών Διαφορών</h4>
    <ul>
        <li>Αθέτηση εμπορικών συμβάσεων (προμήθειας, έργου, υπηρεσιών)</li>
        <li>Διαφορές από τραπεζικά δάνεια και εγγυήσεις</li>
        <li>Εταιρικές διαφορές (μεταξύ εταίρων, με διοίκηση)</li>
        <li>Διαφορές από franchise & αντιπροσωπεία</li>
        <li>Αθέτηση ασφαλιστηρίων συμβολαίων</li>
        <li>Εργατικές διαφορές ανώτατων στελεχών</li>
    </ul>`,

    commercial_types: `<h3>💼 Τύποι Εμπορικών Διαφορών — Ανάλυση</h3>
    <h4>1. Συμβατικές Διαφορές</h4>
    <p>Η πιο συνηθισμένη κατηγορία. Περιλαμβάνει: μη εκπλήρωση παράδοσης, ελαττωματικά προϊόντα/υπηρεσίες, αθέτηση πληρωμής, ερμηνεία ρητρών σύμβασης. Τα μέρη συνήθως επιθυμούν να διατηρήσουν τη συνεργασία τους, οπότε η διαμεσολάβηση είναι ιδιαίτερα αποτελεσματική.</p>
    <h4>2. Εταιρικές Διαφορές</h4>
    <p>Συγκρούσεις μεταξύ εταίρων ή μετόχων για στρατηγική, διανομή κερδών, διαχείριση. Η διαμεσολάβηση είναι προτιμότερη γιατί αποφεύγει τη δημοσιοποίηση εμπορικών μυστικών και επιτρέπει δημιουργικές λύσεις (buyout, αναδιάρθρωση).</p>
    <h4>3. Τραπεζικές & Χρηματοδοτικές Διαφορές</h4>
    <p>Ρύθμιση δανείων, αμφισβήτηση επιτοκίων, εγγυητικές επιστολές, leasing. Συχνά εμπλέκεται ο Συνήγορος του Καταναλωτή ή ο Χρηματοοικονομικός Διαμεσολαβητής ως εναλλακτικοί μηχανισμοί.</p>
    <h4>4. Διαφορές Κατασκευαστικού Τομέα</h4>
    <p>Συμβάσεις έργου, υπερβάσεις κόστους, καθυστερήσεις παράδοσης, ελαττώματα κατασκευής. Απαιτείται συχνά τεχνική πραγματογνωμοσύνη παράλληλα με τη διαμεσολάβηση.</p>
    <h4>5. Franchise & Αντιπροσωπεία</h4>
    <p>Διαφορές για αποζημίωση κατά λήξη σύμβασης, παραβίαση εδαφικής αποκλειστικότητας, αθέτηση royalty.</p>`,

    commercial_advantages: `<h3>💼 Πλεονεκτήματα Εμπορικής Διαμεσολάβησης έναντι Δικαστηρίου</h3>
    <div class="moore-circle">
        <div class="moore-node">
            <h4>⚡ Ταχύτητα</h4>
            <p>Μια εμπορική διαφορά στο Πολυμελές Πρωτοδικείο μπορεί να διαρκέσει 3-7 χρόνια. Η διαμεσολάβηση επιλύεται σε εβδομάδες ή λίγους μήνες.</p>
        </div>
        <div class="moore-node">
            <h4>💰 Κόστος</h4>
            <p>Δικαστικό κόστος (δικηγορικές αμοιβές, δικαστικά τέλη, πραγματογνώμονες) πολλαπλάσιο της αμοιβής διαμεσολαβητή. Ιδιαίτερα κρίσιμο για ΜΜΕ.</p>
        </div>
        <div class="moore-node">
            <h4>🔒 Εμπιστευτικότητα</h4>
            <p>Εμπορικά μυστικά, οικονομικά στοιχεία και εταιρικές στρατηγικές παραμένουν εκτός δημόσιου αρχείου. Κρίσιμο για επιχειρήσεις.</p>
        </div>
        <div class="moore-node">
            <h4>🤝 Διατήρηση Σχέσης</h4>
            <p>Μακροχρόνιες εμπορικές σχέσεις μπορούν να συνεχιστούν μετά τη διαμεσολάβηση. Το δικαστήριο δημιουργεί «νικητή» και «ηττημένο».</p>
        </div>
        <div class="moore-node">
            <h4>🎯 Εξειδίκευση</h4>
            <p>Ο διαμεσολαβητής μπορεί να επιλεγεί με βάση την εξειδίκευσή του (εμπορικό δίκαιο, ναυτιλία, τεχνολογία), σε αντίθεση με τον δικαστή γενικής αρμοδιότητας.</p>
        </div>
        <div class="moore-node">
            <h4>🌐 Εκτελεστότητα</h4>
            <p>Το Πρακτικό Επιτυχούς Διαμεσολάβησης, αφού κηρυχθεί εκτελεστό από ελληνικό δικαστήριο, εκτελείται και σε άλλα κράτη ΕΕ βάσει Κανονισμού (ΕΕ) 1215/2012.</p>
        </div>
    </div>`,

    commercial_icc: `<h3>💼 Διεθνής Εμπορική Διαμεσολάβηση (ICC & UNCITRAL)</h3>
    <p>Στις διεθνείς εμπορικές διαφορές, η διαμεσολάβηση διέπεται από διεθνή κανονιστικά πλαίσια που ο Έλληνας διαμεσολαβητής πρέπει να γνωρίζει.</p>
    <h4>ICC Mediation Rules (2021)</h4>
    <p>Το Διεθνές Εμπορικό Επιμελητήριο (ICC) εκδίδει κανόνες διαμεσολάβησης που χρησιμοποιούνται ευρέως σε διεθνή συμβόλαια. Βασικά χαρακτηριστικά: πλήρης εμπιστευτικότητα, ελεύθερη επιλογή διαμεσολαβητή, δυνατότητα διεξαγωγής online.</p>
    <h4>Σύμβαση της Σιγκαπούρης (UNCITRAL, 2019)</h4>
    <p>Η «Σύμβαση των Ηνωμένων Εθνών για Διεθνείς Διακανονισμούς που Προκύπτουν από Διαμεσολάβηση» επιτρέπει την άμεση εκτέλεση συμφωνιών διαμεσολάβησης σε κράτη που την έχουν κυρώσει, χωρίς την ανάγκη δικαστικής αναγνώρισης. Η Ελλάδα δεν την έχει ακόμη κυρώσει, αλλά αποτελεί σημαντικό εξελισσόμενο πλαίσιο.</p>
    <h4>Ευρωπαϊκό Πλαίσιο</h4>
    <p>Οδηγία 2008/52/ΕΚ (ενσωματωμένη στον Ν. 4640/2019) διέπει τη διασυνοριακή διαμεσολάβηση εντός ΕΕ. Εξασφαλίζει αμοιβαία εκτελεστότητα πρακτικών μεταξύ κρατών-μελών.</p>
    <div class="highlight-box"><b>Πρακτικό Σημείο:</b> Σε συμβόλαια με διεθνή αντισυμβαλλόμενο, ο Έλληνας δικηγόρος πρέπει να εισηγείται ρήτρα διαμεσολάβησης ICC ή UNCITRAL πριν την υπογραφή, αποφεύγοντας κοστοβόρες διεθνείς διαιτησίες.</div>`,

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
