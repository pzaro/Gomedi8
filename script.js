// ==========================================
// 1. GOOGLE SHEETS & DATA SETUP
// ==========================================

const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxx9im3z-DoKc7zlY-aPIRz1SPP7mcZuC2DuYT7zgteQXska1tyZ6cr6xbCERYtNc4IYg/exec";

let m_data = {
    n: "Παναγιώτης", s: "Ζαρογουλίδης", f: "Αριστοτέλης", am: "2341", iban: "GR89 0172 252 000 5252 01616 0277", bank: "ΤΡΑΠΕΖΑ ΠΕΙΡΑΙΩΣ", addr: "", email: ""
};

const emptyPerson = () => ({
    n: '', s: '', f: '', addr: '', afm: '', tel: '', mob: '', email: '',
    is_legal: false, company: '', rep: '',
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

async function savePartyToSheet(idx, isResp) {
    const arr = isResp ? resps : reqs;
    const r = arr[idx];
    if (!r) return;

    if (!r.afm && !r.mob) {
        showToast('⚠️ Συμπληρώστε ΑΦΜ ή Κινητό για αποθήκευση', '#f59e0b');
        return;
    }
    if (!r.is_legal && (!r.n || !r.s)) {
        showToast('⚠️ Συμπληρώστε Όνομα και Επώνυμο', '#f59e0b');
        return;
    }
    if (r.is_legal && !r.company) {
        showToast('⚠️ Συμπληρώστε Επωνυμία', '#f59e0b');
        return;
    }

    showToast('⏳ Αποθήκευση μέρους...', '#3b82f6');

    const params = new URLSearchParams({
        action: 'writeParty',
        afm:   r.afm   || '',
        mob:   r.mob   || '',
        tel:   r.tel   || '',
        n:     r.n     || '',
        s:     r.s     || '',
        f:     r.f     || '',
        addr:  r.addr  || '',
        email: r.email || ''
    });

    try {
        await fetch(`${GOOGLE_APP_SCRIPT_URL}?${params}`, { mode: 'no-cors' });
        showToast('✅ Το μέρος αποθηκεύτηκε στο Google Sheet!', '#10b981');
    } catch (e) {
        showToast('❌ Αδυναμία σύνδεσης με Google Sheet', '#ef4444');
    }
}

async function saveLawyerToSheet(idx, isResp) {
    const arr = isResp ? resps : reqs;
    const r = arr[idx];
    if (!r) return;

    if (!r.l_afm && !r.l_mob) {
        showToast('⚠️ Συμπληρώστε ΑΦΜ ή Κινητό δικηγόρου', '#f59e0b');
        return;
    }
    if (!r.l_n || !r.l_s) {
        showToast('⚠️ Συμπληρώστε Όνομα και Επώνυμο δικηγόρου', '#f59e0b');
        return;
    }

    showToast('⏳ Αποθήκευση δικηγόρου...', '#3b82f6');

    const params = new URLSearchParams({
        action: 'writeLawyer',
        afm:   r.l_afm  || '',
        mob:   r.l_mob  || '',
        tel:   r.l_tel  || '',
        n:     r.l_n    || '',
        s:     r.l_s    || '',
        f:     r.l_f    || '',
        am:    r.l_am   || '',
        ds:    r.l_ds   || '',
        addr:  r.l_addr || '',
        email: r.l_email|| ''
    });

    try {
        await fetch(`${GOOGLE_APP_SCRIPT_URL}?${params}`, { mode: 'no-cors' });
        showToast('✅ Ο δικηγόρος αποθηκεύτηκε στο Google Sheet!', '#10b981');
    } catch (e) {
        showToast('❌ Αδυναμία σύνδεσης με Google Sheet', '#ef4444');
    }
}

async function saveCaseToSheet() {
    const subj    = document.getElementById('p_subj')?.value?.trim();
    const court   = document.getElementById('p_court')?.value?.trim()   || '';
    const court_n = document.getElementById('p_court_n')?.value?.trim() || '';
    const court_d = document.getElementById('p_court_d')?.value?.trim() || '';
    const basis_art         = document.getElementById('basis_art')?.value         || '';
    const proposal_deadline = document.getElementById('proposal_deadline')?.value?.trim() || '';
    const doc_date = new Date().toLocaleDateString('el-GR');

    if (!subj) {
        showToast('⚠️ Συμπληρώστε το αντικείμενο της διαφοράς', '#f59e0b');
        return;
    }

    const req_afm  = reqs.map(r => r.afm).filter(Boolean).join(', ')  || '';
    const resp_afm = resps.map(r => r.afm).filter(Boolean).join(', ') || '';

    showToast('⏳ Αποθήκευση υπόθεσης...', '#3b82f6');

    const params = new URLSearchParams({
        action: 'writeCase',
        doc_date, subj, court, court_n, court_d,
        basis_art, proposal_deadline, req_afm, resp_afm,
        med_am: m_data.am || ''
    });

    try {
        await fetch(GOOGLE_APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });
        showToast('✅ Η υπόθεση αποθηκεύτηκε στο Google Sheet!', '#10b981');
    } catch (e) {
        showToast('❌ Αδυναμία σύνδεσης με Google Sheet', '#ef4444');
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


async function autoFillParty(val, idx, isResp) {
    if(!val.trim()) return;
    let arr = isResp ? resps : reqs;
    arr[idx].afm = "Φόρτωση...";
    renderLists();
    const url = `${GOOGLE_APP_SCRIPT_URL}?action=readParty&afm=${encodeURIComponent(val.trim())}`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.status === "success") {
            arr[idx].afm   = data.data.afm   || val.trim();
            arr[idx].n     = data.data.n     || arr[idx].n;
            arr[idx].s     = data.data.s     || arr[idx].s;
            arr[idx].f     = data.data.f     || arr[idx].f;
            arr[idx].addr  = data.data.addr  || arr[idx].addr;
            arr[idx].tel   = data.data.tel   || arr[idx].tel;
            arr[idx].mob   = data.data.mob   || arr[idx].mob;
            arr[idx].email = data.data.email || arr[idx].email;
            renderLists();
            draw();
        } else {
            alert("❌ Δεν βρέθηκε μέρος με ΑΦΜ: " + val.trim() + "\nΣυμπληρώστε τα στοιχεία χειροκίνητα.");
            arr[idx].afm = val.trim();
            renderLists();
        }
    } catch(e) {
        arr[idx].afm = val.trim();
        renderLists();
    }
}

// ==========================================
// ΑΠΟΘΗΚΕΥΣΗ / ΦΟΡΤΩΣΗ — localStorage + JSON backup
// ==========================================

function getFormState() {
    return {
        version: 1,
        saved_at: new Date().toISOString(),
        m_data,
        reqs,
        resps,
        fields: {
            mediator_amd: document.getElementById('mediator_amd_input')?.value || '',
            m_fee:        document.getElementById('m_fee')?.value || '',
            p_court:      document.getElementById('p_court')?.value || '',
            p_court_d:    document.getElementById('p_court_d')?.value || '',
            p_court_n:    document.getElementById('p_court_n')?.value || '',
            yas_date:     document.getElementById('yas_date')?.value || '',
            yas_time:     document.getElementById('yas_time')?.value || '',
            z_link:       document.getElementById('z_link')?.value || '',
            z_id:         document.getElementById('z_id')?.value || '',
            z_pass:       document.getElementById('z_pass')?.value || '',
            notify_date:  document.getElementById('notify_date')?.value || '',
            doc_date:     document.getElementById('doc_date')?.value || '',
            doc_type:     document.getElementById('doc_type')?.value || 'email'
        }
    };
}

function applyFormState(state) {
    if (!state || !state.fields) return;
    if (state.m_data) Object.assign(m_data, state.m_data);
    if (state.reqs)   reqs  = state.reqs;
    if (state.resps)  resps = state.resps;
    const f = state.fields;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    set('mediator_amd_input', f.mediator_amd);
    set('m_fee',       f.m_fee);
    set('p_court',     f.p_court);
    set('p_court_d',   f.p_court_d);
    set('p_court_n',   f.p_court_n);
    set('yas_date',    f.yas_date);
    set('yas_time',    f.yas_time);
    set('z_link',      f.z_link);
    set('z_id',        f.z_id);
    set('z_pass',      f.z_pass);
    set('notify_date', f.notify_date);
    set('doc_date',    f.doc_date);
    set('doc_type',    f.doc_type);
    if (f.yas_date) showYasDay(f.yas_date);
    renderLists();
    draw();
}

function autoSave() {
    try {
        localStorage.setItem('mediationPortal_state', JSON.stringify(getFormState()));
        showSaveIndicator();
    } catch(e) { console.warn('AutoSave failed:', e); }
}

function loadLocalDB() {
    try {
        const raw = localStorage.getItem('mediationPortal_state');
        if (!raw) return;
        const state = JSON.parse(raw);
        applyFormState(state);
        const d = new Date(state.saved_at);
        const label = d.toLocaleDateString('el-GR') + ' ' + d.toLocaleTimeString('el-GR', {hour:'2-digit', minute:'2-digit'});
        showToast('✅ Φορτώθηκαν δεδομένα (' + label + ')', '#059669');
    } catch(e) { console.warn('loadLocalDB failed:', e); }
}

function exportJSON() {
    const state = getFormState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `diameso_backup_${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Εξαγωγή backup ολοκληρώθηκε', '#2563eb');
}

function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const state = JSON.parse(ev.target.result);
                if (!state.version || !state.fields) throw new Error('Μη έγκυρο αρχείο');
                applyFormState(state);
                autoSave();
                showToast('✅ Τα δεδομένα φορτώθηκαν επιτυχώς!', '#059669');
            } catch(err) {
                showToast('❌ Σφάλμα: Μη έγκυρο αρχείο backup', '#dc2626');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAll() {
    if (!confirm('Να διαγραφούν όλα τα δεδομένα της φόρμας;')) return;
    reqs  = [emptyPerson()];
    resps = [emptyPerson()];
    Object.assign(m_data, { n:'', s:'', f:'', am:'', iban:'', bank:'', addr:'', email:'' });
    ['mediator_amd_input','m_fee','p_court','p_court_d','p_court_n',
     'yas_date','yas_time','z_link','z_id','z_pass','notify_date','doc_date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const dt = document.getElementById('doc_type');
    if (dt) dt.value = 'email';
    const yd = document.getElementById('yas_day_label');
    if (yd) yd.textContent = '';
    localStorage.removeItem('mediationPortal_state');
    renderLists();
    draw();
    showToast('🗑️ Η φόρμα καθαρίστηκε', '#6b7280');
}

function showToast(msg, color = '#1d4ed8') {
    let t = document.getElementById('save_toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'save_toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;color:#fff;font-size:14px;font-weight:500;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = color;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function showSaveIndicator() {
    const el = document.getElementById('save_indicator');
    if (!el) return;
    el.textContent = '💾 ' + new Date().toLocaleTimeString('el-GR', {hour:'2-digit', minute:'2-digit'});
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0.4'; }, 3000);
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
        
        const isLegal = !!r.is_legal;
        return `
        <div class="party-block">
            <div class="party-title">${title}</div>
            ${idx > 0 ? `<button class="btn-rm" onclick="${isResp?'rmResp':'rmReq'}(${idx})">Διαγραφή</button>` : ''}
            <div style="margin-bottom:8px;">
                <label class="chk-label"><input type="checkbox" ${isLegal?'checked':''} onchange="${arrName}[${idx}].is_legal=this.checked; renderLists(); draw()"> ⚖️ Νομικό Πρόσωπο</label>
            </div>
            ${isLegal ? `
            <div class="form-group"><label>Επωνυμία</label><input value="${r.company}" oninput="${arrName}[${idx}].company=this.value; draw()"></div>
            <div class="form-group"><label>ΑΦΜ 🔍</label><input value="${r.afm}" placeholder="ΑΦΜ & Enter..." oninput="${arrName}[${idx}].afm=this.value; draw()" onchange="autoFillParty(this.value, ${idx}, ${isResp})"></div>
            <div class="row-2">
                <div class="form-group"><label>Διεύθυνση</label><input value="${r.addr}" oninput="${arrName}[${idx}].addr=this.value; draw()"></div>
                <div class="form-group"><label>Email</label><input value="${r.email}" oninput="${arrName}[${idx}].email=this.value; draw()"></div>
            </div>
            ` : `
            <div class="row-3">
                <div class="form-group"><label>Όνομα</label><input value="${r.n}" oninput="${arrName}[${idx}].n=this.value; draw()"></div>
                <div class="form-group"><label>Επώνυμο</label><input value="${r.s}" oninput="${arrName}[${idx}].s=this.value; draw()"></div>
                <div class="form-group"><label>Πατρώνυμο</label><input value="${r.f}" oninput="${arrName}[${idx}].f=this.value; draw()"></div>
            </div>
            <div class="row-2">
                <div class="form-group"><label>Διεύθυνση</label><input value="${r.addr}" oninput="${arrName}[${idx}].addr=this.value; draw()"></div>
                <div class="form-group"><label>ΑΦΜ 🔍</label><input value="${r.afm}" placeholder="ΑΦΜ & Enter..." oninput="${arrName}[${idx}].afm=this.value; draw()" onchange="autoFillParty(this.value, ${idx}, ${isResp})"></div>
            </div>
            <div class="row-3">
                <div class="form-group"><label>Κινητό</label><input value="${r.mob}" oninput="${arrName}[${idx}].mob=this.value; draw()"></div>
                <div class="form-group"><label>Email</label><input value="${r.email}" oninput="${arrName}[${idx}].email=this.value; draw()"></div>
            </div>
            `}
            <div style="display:flex; align-items:center; gap:12px; margin-top:6px;">
                <label class="chk-label"><input type="checkbox" ${r.p_party?'checked':''} onchange="${arrName}[${idx}].p_party=this.checked; draw()"> ΠΑΡΩΝ/ΟΥΣΑ ΣΤΗΝ ΕΣΔ</label>
                <button onclick="savePartyToSheet(${idx}, ${isResp})" style="margin-left:auto; padding:5px 14px; background:#10b981; color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">💾 Αποθήκευση Μέρους</button>
            </div>

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
            <div style="display:flex; align-items:center; gap:12px; margin-top:6px;">
                <label class="chk-label"><input type="checkbox" ${r.p_law?'checked':''} onchange="${arrName}[${idx}].p_law=this.checked; draw()"> ΔΙΚΗΓΟΡΟΣ ΠΑΡΩΝ/ΟΥΣΑ</label>
                <button onclick="saveLawyerToSheet(${idx}, ${isResp})" style="margin-left:auto; padding:5px 14px; background:#3b82f6; color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">💾 Αποθήκευση Δικηγόρου</button>
            </div>
        </div>`;
    };
    document.getElementById('req_container').innerHTML = reqs.map((_, i) => buildForm(reqs, 'Req', i, false)).join('');
    document.getElementById('resp_container').innerHTML = resps.map((_, i) => buildForm(resps, 'Resp', i, true)).join('');
}

const fmtD = (d) => d ? d.split('-').reverse().join('/') : "................";
const getDay = (d) => d ? ["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"][new Date(d).getDay()] : "................";

function showYasDay(val) {
    const el = document.getElementById('yas_day_label');
    if (!el) return;
    el.textContent = val ? '📅 ' + getDay(val) : '';
}

// Επιστρέφει πλήρη πληροφορία αμοιβής (ανά πλευρά × 2 πλευρές πάντα)
function getFeeInfo() {
    const el = document.getElementById('m_fee');
    const feeValue = el ? el.value : '';            // π.χ. "75 ευρώ πλέον ΦΠΑ 24% (σύνολο €93,00) ανά μέρος"
    const feeText  = el ? el.options[el.selectedIndex].text : ''; // π.χ. "75 ευρώ + ΦΠΑ (Σύνολο: 93,00€)"

    // Πάντα 2 πλευρές (Επισπεύδον + Έτερο μέρος) — ανεξάρτητα από τον αριθμό ατόμων
    const totalParties = 2;

    // Εξαγωγή αριθμητικής τιμής ανά πλευρά από το value
    const matchNet   = feeValue.match(/^(\d+)\s*ευρώ/);
    const matchTotal = feeValue.match(/σύνολο[^\d€]*[€]?\s*([\d.,]+)/i);
    const netPerParty   = matchNet   ? parseFloat(matchNet[1])   : null;
    const grossPerParty = matchTotal ? parseFloat(matchTotal[1].replace(',','.')) : null;
    const totalGross    = grossPerParty ? (grossPerParty * totalParties).toFixed(2) : null;

    return {
        perPartyText:  feeText,                          // "75 ευρώ + ΦΠΑ (Σύνολο: 93,00€)"
        perPartyValue: feeValue,                         // για έγγραφα
        totalParties,
        netPerParty,
        grossPerParty,
        totalGross,
        // Πλήρης πρόταση για email/έγγραφα
        fullSentence: grossPerParty
            ? `${feeText} ανά μέρος (${totalParties} μέρη × ${grossPerParty}€ = <strong>${totalGross}€ συνολικά</strong>)`
            : feeText
    };
}
const getFullName = (n, s) => [n, s].filter(Boolean).join(' ') || "................";

function updatePartySelect() {
    const sel = document.getElementById('party_select');
    const all = [...reqs, ...resps];
    if (currentPartyIdx >= all.length) currentPartyIdx = 0;
    sel.innerHTML = all.map((p, i) => `<option value="${i}" ${i==currentPartyIdx?'selected':''}>${getFullName(p.n, p.s)} ${i<reqs.length?'(Επισπεύδων)':'(Έτερο Μέρος)'}</option>`).join('');
}

function changeParty() { currentPartyIdx = parseInt(document.getElementById('party_select').value); draw(); }

function draw() {
    autoSave();
    const d = {
        fee: document.getElementById('m_fee').value,
        feeInfo: getFeeInfo(),
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
        proposal_deadline: document.getElementById('proposal_deadline')?.value || "................",
        basis_art: document.getElementById('basis_art')?.value || 'b',
        type: document.getElementById('doc_type').value
    };

    document.getElementById('party_select_container').style.display = (d.type === 'prosklisi') ? 'block' : 'none';
    if(d.type === 'prosklisi') updatePartySelect();

    // Για Διαφάνεια ΕΣΔ: κρύβουμε τα buttons εξαγωγής (έχει δικό του button μέσα στην προεπισκόπηση)
    const actionsDiv = document.querySelector('.actions');
    if (actionsDiv) actionsDiv.style.display = (d.type === 'slides_yas') ? 'none' : '';

    const zoomFrame = `<br>Ημερομηνία: ${fmtD(d.z_date)}<br>Ώρα: ${d.z_time}<br>Μέσο: Μέσω της πλατφόρμας τηλεδιάσκεψης Zoom (εντός της συνημμένης πρόσκλησης θα βρείτε την σύνδεσμο σύνδεσης).<br>`;
    
    const zoomFrameEntypo = `
<div class="doc-zoom-box">
    <span class="zoom-title">ΥΠΟΧΡΕΩΤΙΚΗ ΑΡΧΙΚΗ ΣΥΝΕΔΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</span>
    <b>Ημερομηνία:</b> ${fmtD(d.z_date)} &nbsp;&nbsp;&nbsp; <b>Ώρα:</b> ${d.z_time}<br><br>
    <b>Σύνδεσμος/Link:</b> <a href="${d.z_link}" style="color: #2563eb;">${d.z_link}</a><br><br>
    <b>Meeting ID:</b> ${d.z_id} &nbsp;&nbsp;&nbsp; <b>Passcode:</b> ${d.z_pass}
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
<div class="doc-party-block">
    <div class="party-label">Α. ΕΠΙΣΠΕΥΔΟΝ ΜΕΡΟΣ${reqs.length > 1 ? ' ' + (i+1) : ''}</div>
    <div>Ονοματεπώνυμο: <b>${getFullName(r.n, r.s)}</b> του ${r.f || "......."}</div>
    <div style="margin-top:6pt;">Παραστάθηκε: ${chkParty} &nbsp;&nbsp; δεν παραστάθηκε: ${chkPartyNot}</div>
    <div style="font-size:9.5pt;color:#555;margin-top:4pt;">Μέσο γνωστοποίησης: &nbsp; Συστημένη Επιστολή [&nbsp;☐&nbsp;] &nbsp; Email [&nbsp;☒&nbsp;] &nbsp; Άλλο [&nbsp;☐&nbsp;] ...............</div>
    <div class="doc-party-row">
        <div style="font-size:10pt;">Ημερομηνία: ${d.doc_date}</div>
        <div class="sig-block">Υπογραφή επισπεύδοντας<br>…………………………….</div>
    </div>
    <hr class="doc-divider" style="margin:10pt 0;">
    <div>Νομικός παραστάτης: <b>${getFullName(r.l_n, r.l_s) || "......."}</b></div>
    <div style="margin-top:6pt;">Παραστάθηκε: ${chkLaw} &nbsp;&nbsp; δεν παραστάθηκε: ${chkLawNot}</div>
    <div style="font-size:9.5pt;color:#555;margin-top:4pt;">Μέσο γνωστοποίησης: &nbsp; Συστημένη Επιστολή [&nbsp;☐&nbsp;] &nbsp; Email [&nbsp;☒&nbsp;] &nbsp; Άλλο [&nbsp;☐&nbsp;] ...............</div>
    <div class="doc-party-row">
        <div style="font-size:10pt;">Ημερομηνία: ${d.doc_date}</div>
        <div class="sig-block">Υπογραφή νομικού παραστάτη<br>…………………………….</div>
    </div>
</div>`;
    });

    let praktikoRespHTML = '';
    resps.forEach((r, i) => {
        let chkParty = r.p_party ? '[ ☒ ]' : '[ ☐ ]';
        let chkPartyNot = !r.p_party ? '[ ☒ ]' : '[ ☐ ]';
        let chkLaw = r.p_law ? '[ ☒ ]' : '[ ☐ ]';
        let chkLawNot = !r.p_law ? '[ ☒ ]' : '[ ☐ ]';

        praktikoRespHTML += `
<div class="doc-party-block">
    <div class="party-label">Β. ΕΤΕΡΟ ΜΕΡΟΣ${resps.length > 1 ? ' ' + (i+1) : ''}</div>
    <div>Ονοματεπώνυμο: <b>${getFullName(r.n, r.s)}</b> του ${r.f || "......."}</div>
    <div style="margin-top:6pt;">Παραστάθηκε: ${chkParty} &nbsp;&nbsp; δεν παραστάθηκε: ${chkPartyNot}</div>
    <div style="font-size:9.5pt;color:#555;margin-top:4pt;">Μέσο γνωστοποίησης: &nbsp; Συστημένη Επιστολή [&nbsp;☐&nbsp;] &nbsp; Email [&nbsp;☒&nbsp;] &nbsp; Άλλο [&nbsp;☐&nbsp;] ...............</div>
    <div class="doc-party-row">
        <div style="font-size:10pt;">Ημερομηνία: ${d.doc_date}</div>
        <div class="sig-block">Υπογραφή ετέρου μέρους<br>…………………………….</div>
    </div>
    <hr class="doc-divider" style="margin:10pt 0;">
    <div>Νομικός παραστάτης: <b>${getFullName(r.l_n, r.l_s) || "......."}</b></div>
    <div style="margin-top:6pt;">Παραστάθηκε: ${chkLaw} &nbsp;&nbsp; δεν παραστάθηκε: ${chkLawNot}</div>
    <div style="font-size:9.5pt;color:#555;margin-top:4pt;">Μέσο γνωστοποίησης: &nbsp; Συστημένη Επιστολή [&nbsp;☐&nbsp;] &nbsp; Email [&nbsp;☒&nbsp;] &nbsp; Άλλο [&nbsp;☐&nbsp;] ...............</div>
    <div class="doc-party-row">
        <div style="font-size:10pt;">Ημερομηνία: ${d.doc_date}</div>
        <div class="sig-block">Υπογραφή νομικού παραστάτη<br>…………………………….</div>
    </div>
</div>`;
    });

    let activeHtml = '';
    const mediatorFullName = `${m_data.n} ${m_data.s}`;

    // (κεφαλίδα αφαιρέθηκε — ο χρήστης τοποθετεί επικεφαλίδα/σφραγίδα χειροκίνητα)

    if (d.type === 'fyllo') {
        const allParties = [...reqs, ...resps];
        let reqRows = reqs.map((r,i) => `
<tr><td style="font-weight:bold;padding:4pt 8pt;background:#f0f4fa;border:0.5pt solid #c8d6ea;">${reqs.length>1?'Επισπεύδων '+(i+1):'Επισπεύδων'}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${getFullName(r.n,r.s)}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.f||''}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.afm||''}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.mob||r.tel||''}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.email||''}</td></tr>
<tr><td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;color:#555;">Νομ. Παρ.</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;" colspan="2">${getFullName(r.l_n,r.l_s)||'—'}</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;">${r.l_afm||''}</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;">${r.l_mob||r.l_tel||''}</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;">${r.l_email||''}</td></tr>`).join('');
        let respRows = resps.map((r,i) => `
<tr><td style="font-weight:bold;padding:4pt 8pt;background:#f0f4fa;border:0.5pt solid #c8d6ea;">${resps.length>1?'Έτερο μέρος '+(i+1):'Έτερο μέρος'}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${getFullName(r.n,r.s)}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.f||''}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.afm||''}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.mob||r.tel||''}</td>
<td style="padding:4pt 8pt;border:0.5pt solid #c8d6ea;">${r.email||''}</td></tr>
<tr><td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;color:#555;">Νομ. Παρ.</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;" colspan="2">${getFullName(r.l_n,r.l_s)||'—'}</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;">${r.l_afm||''}</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;">${r.l_mob||r.l_tel||''}</td>
<td style="padding:3pt 8pt;background:#fafbfd;border:0.5pt solid #c8d6ea;font-size:9.5pt;">${r.l_email||''}</td></tr>`).join('');

        // βάση υπαγωγής checkboxes — το επιλεγμένο ☒, τα υπόλοιπα ☐
        const basisOptions = [
            {v:'a', text:'άρθρου 76 παρ. 1α του ν. 5344/2026 (οικογενειακή διαφορά)'},
            {v:'b', text:'άρθρου 76 παρ. 1β του ν. 5344/2026 (τακτική Μον/λούς άνω 30.000 ευρώ)'},
            {v:'c', text:'άρθρου 76 παρ. 1β του ν. 5344/2026 (τακτική Πολυμελούς)'},
            {v:'d', text:'άρθρου 76 παρ. 1γ του ν. 5344/2026 (ρήτρα διαμεσολάβησης)'},
            {v:'e', text:'άρθρου 76 παρ. 1δ του ν. 5344/2026 (κτηματολογική διαφορά)'},
        ];
        const basisHtml = basisOptions.map(o =>
            `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:4pt 0;">
                <span>· &nbsp;${o.text}</span>
                <span style="margin-left:12pt;">${o.v === d.basis_art ? '☒' : '☐'}</span>
            </div>`
        ).join('');

        // μέρη — αυτόματη συμπλήρωση από τα στοιχεία της φόρμας
        const f = v => v || '..............................';
        const partyBlock = (r, label) => r.is_legal ? `
<div style="line-height:2.1;margin-left:4pt;">
<b>Επωνυμία:</b> ${f(r.company)}, όπως νομίμως εκπροσωπείται<br>
<b>Διεύθυνση:</b> ${f(r.addr)}<br>
<b>Αριθμός Φορολογικού Μητρώου (ΑΦΜ):</b> ${f(r.afm)}<br>
<b>Email:</b> ${f(r.email)}
</div>` : `
<div style="line-height:2.1;margin-left:4pt;">
<b>Όνομα:</b> ${f(r.n)} &nbsp; <b>Επίθετο:</b> ${f(r.s)} &nbsp; <b>Πατρώνυμο:</b> ${f(r.f)}<br>
<b>Διεύθυνση:</b> ${f(r.addr)}<br>
<b>Αριθμός Φορολογικού Μητρώου (ΑΦΜ):</b> ${f(r.afm)}<br>
<b>Αριθμός τηλεφώνου:</b> ${f(r.mob||r.tel)}<br>
<b>Email:</b> ${f(r.email)}
</div>`;

        const reqsHtml = reqs.map((r,i) => {
            return `<p style="margin-bottom:4pt;"><b>Α${reqs.length>1?' '+(i+1):''}. Επισπεύδον μέρος${reqs.length>1?' '+(i+1):''}:</b></p>
${partyBlock(r, 'Α')}
<p style="margin:10pt 0 4pt;"><b>Νομικός Παραστάτης:</b></p>
<div style="line-height:2.1;margin-left:4pt;">
<b>Όνομα:</b> ${f(r.l_n)} &nbsp; <b>Επίθετο:</b> ${f(r.l_s)} &nbsp; <b>Πατρώνυμο:</b> ${f(r.l_f)}<br>
<b>Διεύθυνση:</b> ${f(r.l_addr)}<br>
<b>Αρ Μητρ./Δικηγορικός Σύλλογος (ΑΜ/ΔΣ):</b> ${f(r.l_am)} / ${f(r.l_ds)}<br>
<b>Αριθμός τηλεφώνου:</b> ${f(r.l_mob||r.l_tel)}<br>
<b>Email:</b> ${f(r.l_email)}
</div>`;
        }).join('<div style="margin:16pt 0;border-top:0.5pt dashed #ccc;"></div>');

        const respsHtml = resps.map((r,i) => {
            return `<p style="margin-bottom:4pt;"><b>Β${resps.length>1?' '+(i+1):''}. Έτερο μέρος${resps.length>1?' '+(i+1):''}:</b></p>
${partyBlock(r, 'Β')}
<p style="margin:10pt 0 4pt;"><b>Νομικός Παραστάτης:</b></p>
<div style="line-height:2.1;margin-left:4pt;">
<b>Όνομα:</b> ${f(r.l_n)} &nbsp; <b>Επίθετο:</b> ${f(r.l_s)} &nbsp; <b>Πατρώνυμο:</b> ${f(r.l_f)}<br>
<b>Διεύθυνση:</b> ${f(r.l_addr)}<br>
<b>Αρ Μητρ./Δικηγορικός Σύλλογος (ΑΜ/ΔΣ):</b> ${f(r.l_am)} / ${f(r.l_ds)}<br>
<b>Αριθμός τηλεφώνου:</b> ${f(r.l_mob||r.l_tel)}<br>
<b>Email:</b> ${f(r.l_email)}
</div>`;
        }).join('<div style="margin:16pt 0;border-top:0.5pt dashed #ccc;"></div>');

        activeHtml = `
<div class="doc-form-badge">ΕΝΤΥΠΟ 1</div>
<div class="doc-title-block">
    <span class="doc-main-title">ΦΥΛΛΟ ΒΑΣΙΚΩΝ ΣΤΟΙΧΕΙΩΝ</span>
</div>

<p style="margin-top:14pt;line-height:1.7;">Το παρόν έντυπο περιέχει τα βασικά στοιχεία της παρακάτω συνοπτικώς περιγραφόμενης διαφοράς, η οποία υπάγεται σε Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) διαμεσολάβησης βάσει εφαρμογής του:</p>

<div style="margin:10pt 0 18pt 10pt;">
${basisHtml}
</div>

<div style="font-weight:bold;font-size:10.5pt;text-transform:uppercase;border-bottom:0.5pt solid #c8d6ea;padding-bottom:4pt;margin:16pt 0 12pt;">ΣΥΜΜΕΤΕΧΟΝΤΑ ΜΕΡΗ</div>

${reqsHtml}

<div style="margin:16pt 0;border-top:0.5pt solid #c8d6ea;"></div>

${respsHtml}

<div style="font-weight:bold;font-size:10.5pt;text-transform:uppercase;border-bottom:0.5pt solid #c8d6ea;padding-bottom:4pt;margin:18pt 0 12pt;">ΔΙΑΜΕΣΟΛΑΒΗΤΗΣ</div>
<div style="line-height:2.1;margin-left:4pt;">
<b>Όνομα:</b> ${f(m_data.n)} &nbsp; <b>Επίθετο:</b> ${f(m_data.s)} &nbsp; <b>Πατρώνυμο:</b> ${f(m_data.f)}<br>
<b>Διεύθυνση:</b> ${f(m_data.addr)}<br>
<b>Αριθμός Μητρώου Διαμεσολαβητή (ΑΜΔ):</b> ${f(m_data.am)}<br>
<b>Email:</b> ${f(m_data.email)}
</div>

<div style="font-weight:bold;margin:20pt 0 8pt;">Σύντομη περιγραφή του αντικειμένου της διαφοράς</div>
<p style="line-height:1.9;font-style:italic;">${d.subj || '..............................................................................................................................................................'}</p>

<div style="margin-top:50pt;display:flex;justify-content:flex-end;">
    <div style="width:200pt;text-align:center;">
        <div style="font-size:9.5pt;margin-bottom:30pt;">Ο Διαμεσολαβητής</div>
        <div style="font-size:9pt;color:#555;">Σφραγίδα &amp; Υπογραφή</div>
    </div>
</div>

<div class="doc-footnote" style="margin-top:28pt;">
<b>ΚΑΤΕΥΘΥΝΤΗΡΙΕΣ ΟΔΗΓΙΕΣ ΓΙΑ ΤΗ ΧΡΗΣΗ ΤΟΥ ΕΝΤΥΠΟΥ 1</b><br>
Το Φύλλο Βασικών Στοιχείων (Έντυπο 1) περιλαμβάνει τα στοιχεία όλων όσων αφορά η Υποχρεωτική Αρχική Συνεδρία (ΥΑΣ) και την περιγραφή του αντικειμένου της διαφοράς. Επισυνάπτεται υποχρεωτικά στη Γνωστοποίηση/Πρόσκληση (Έντυπο 3) και στο Πρακτικό Περάτωσης ΕΣΔ. Συντάσσεται κατ' άρθρο 77 παρ. 1 του ν. 5344/2026 (Κώδικας Εναλλακτικής Επίλυσης Διαφορών, Φύλλο Εφημερίδας της Κυβερνήσεως Α΄ 168/16-10-2026).
</div>`;

    } else if (d.type === 'email') {
        activeHtml = `Αξιότιμες κυρίες, Αξιότιμοι κύριοι,<br><br>
Ονομάζομαι ${mediatorFullName} και είμαι Διαπιστευμένος Διαμεσολαβητής. Σε συνέχεια του διορισμού μου από την Κεντρική Επιτροπή Διαμεσολάβησης (ΚΕΔ), επικοινωνώ μαζί σας σχετικά με την ιδιωτική διαφορά που έχει ανακύψει μεταξύ σας, η οποία αποτελεί αντικείμενο της από ${d.court_d} αγωγής που κατατέθηκε στο ${d.court} με αριθμό κατάθεσης ${d.court_n}.<br><br>
Με την παρούσα επιστολή, σας προσκαλώ στην Εισαγωγική Συνεδρία Διαμεσολάβησης (ΕΣΔ), η οποία θα διεξαχθεί <b>μέσω τηλεδιάσκεψης</b>:<br>
${zoomFrame}<br>
Η αμοιβή για τη διεξαγωγή της Εισαγωγικής Συνεδρίας Διαμεσολάβησης (ΕΣΔ) ανέρχεται στο ποσό των ${d.feeInfo.perPartyText} <b>ανά μέρος</b> (${d.feeInfo.totalParties} μέρη × ${d.feeInfo.grossPerParty}€ = <b>${d.feeInfo.totalGross}€ συνολικά</b>). Το ποσό θα πρέπει να έχει κατατεθεί πριν την έναρξη της συνεδρίας στον λογαριασμό IBAN: ${m_data.iban}, Τράπεζα ${m_data.bank}.<br><br>
Θα ήθελα να αξιοποιήσω αυτή την ευκαιρία για να σας δώσω μια σαφέστερη εικόνα για τη διαδικασία που θα ακολουθήσουμε.<br><br>
<b>Τι είναι η Εισαγωγική Συνεδρία Διαμεσολάβησης (ΕΣΔ);</b><br>
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
        activeHtml = `<b>Εναρκτήρια Δήλωση Εισαγωγικής Συνεδρίας Διαμεσολάβησης (ΕΣΔ)</b><br><br>
Καλησπέρα σας και καλώς ορίσατε στη σημερινή Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης, η οποία διεξάγεται μέσω τηλεδιάσκεψης. Ονομάζομαι ${mediatorFullName} και είμαι διαπιστευμένος διαμεσολαβητής. Ο ρόλος μου σήμερα είναι να σας παρουσιάσω τη δυνατότητα εξωδικαστικής επίλυσης της διαφοράς σας, με έναν τρόπο εποικοδομητικό και αμοιβαία αποδεκτό.<br><br>
Θα ήθελα να επιβεβαιώσουμε την παρουσία όλων των μερών. Από τη μία πλευρά, έχουμε την ενάγουσα πλευρά, ${reqsEnarktiria}. Από την άλλη πλευρά, έχουμε την εναγομένη πλευρά, ${respsEnarktiria}.<br><br>
Σκοπός αυτής της πρώτης, υποχρεωτικής συνεδρίας, όπως ορίζει ο Νόμος 5344/2026 (Κώδικας Εναλλακτικής Επίλυσης Διαφορών, Φύλλο Εφημερίδας της Κυβερνήσεως Α΄ 168/16-10-2026), είναι να ενημερωθείτε για τον θεσμό της διαμεσολάβησης και να εξετάσετε από κοινού αν μπορεί να αποτελέσει ένα χρήσιμο εργαλείο για την επίλυση της δικής σας υπόθεσης.<br><br>
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

        activeHtml = `
<div class="doc-form-badge">ΕΝΤΥΠΟ 3</div>
<div class="doc-title-block">
    <span class="doc-main-title">ΓΝΩΣΤΟΠΟΙΗΣΗ / ΠΡΟΣΚΛΗΣΗ ΓΙΑ ΤΗΝ ΥΠΟΧΡΕΩΤΙΚΗ ΑΡΧΙΚΗ ΣΥΝΕΔΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</span>
    <div class="doc-subtitle">(άρθρο 78 παρ. 2 του ν. 5344/2026)<br>Απευθύνεται προς όλα τα μέρη της διαφοράς, όπως αναφέρονται στο επισυναπτόμενο Φύλλο Βασικών Στοιχείων</div>
</div>

<p>Δια της παρούσης γνωστοποιώ προς <b>${pName}</b> με ΑΦΜ <b>${pAFM}</b> ότι η Εισαγωγική Συνεδρία Διαμεσολάβησης, όπως ορίζεται στο άρθρο 78 του ν. 5344/2026 (Κώδικας Εναλλακτικής Επίλυσης Διαφορών), θα λάβει χώρα την <b>${fmtD(d.z_date)}</b>, ημέρα <b>${getDay(d.z_date)}</b> και ώρα <b>${d.z_time}</b>, και σας καλώ να παραστείτε σε αυτή με το νομικό παραστάτη σας.</p>

<p><b>Τόπος διεξαγωγής ΕΣΔ:</b> ΠΕΝΤΑΠΛΑΤΑΝΟΣ ΓΙΑΝΝΙΤΣΩΝ — μέσω τηλεδιάσκεψης με κωδικούς σύνδεσης:</p>

${zoomFrameEntypo}

<p>Επισυνάπτεται το Φύλλο Βασικών Στοιχείων (Έντυπο 1), όπου περιλαμβάνονται αναλυτικά τα στοιχεία όλων των μερών της διαφοράς, σύντομη περιγραφή της υπόθεσης και τα στοιχεία του διαμεσολαβητή.</p>

<div class="doc-notes-block">
<b>Σημειώνεται ότι:</b><br>
Σκοπός της Υποχρεωτικής Αρχικής Συνεδρίας είναι να εξετάσετε τη δυνατότητα εξωδικαστικής επίλυσης της διαφοράς σας με διαμεσολάβηση. Αν μετά την Υποχρεωτική Αρχική Συνεδρία δεν επιθυμείτε να συνεχίσετε τη διαδικασία, μπορείτε να αποχωρήσετε χωρίς οποιαδήποτε αιτιολογία, κύρωση ή ποινή.<br><br>
Σύμφωνα με το άρθρο 18 του ν. 5344/2026, εάν δεν προσέλθετε στην Εισαγωγική Συνεδρία δύναται να σας επιβληθεί από το δικαστήριο χρηματική κύρωση, εφόσον η υπόθεσή σας προχωρήσει σε δικαστική διαδικασία.<br><br>
Η αμοιβή του διαμεσολαβητή ορίζεται στα <b>${d.feeInfo.perPartyText}</b> ανά μέρος (${d.feeInfo.totalParties} μέρη × ${d.feeInfo.grossPerParty}€ = <b>${d.feeInfo.totalGross}€ συνολικά</b>), βαρύνει τα μέρη κατ' ισομοιρία και καταβάλλεται στον λογαριασμό <b>${m_data.iban}</b>, Τράπεζα ${m_data.bank}, πριν από την έναρξη της διαδικασίας.
</div>

<p>Η παρούσα γνωστοποίηση αποστέλλεται σύμφωνα με το άρθρο 7 παρ. 2:<br>
[&nbsp;☒&nbsp;] Με email &nbsp;&nbsp; [&nbsp;☐&nbsp;] Με συστημένη επιστολή &nbsp;&nbsp; [&nbsp;☐&nbsp;] Άλλως: .........................</p>

<p>Πενταπλάτανος Γιαννιτσών, την ${d.doc_date}</p>

<div class="doc-sig-mediator">
    <div class="sig-inner">
        <div>Πενταπλάτανος Γιαννιτσών, ${d.doc_date}</div>
        <div class="sig-line"></div>
        <div class="sig-name">Ο Διαμεσολαβητής</div>
    </div>
</div>

<div class="doc-footnote">
*(Ο διαμεσολαβητής δεν απαιτείται να ζητήσει επιβεβαίωση της παραλαβής, αν αυτή αποδεικνύεται μέσω ηλεκτρονικής αλληλογραφίας ή από αποδεικτικό αποστολής συστημένης επιστολής ή από άλλο νόμιμο τρόπο.)<br><br>
<b>ΚΑΤΕΥΘΥΝΤΗΡΙΕΣ ΟΔΗΓΙΕΣ ΓΙΑ ΤΟ ΕΝΤΥΠΟ 3:</b> Στο παρόν έγγραφο επισυνάπτεται και το Φύλλο Βασικών Στοιχείων (Έντυπο 1), στο οποίο περιλαμβάνονται τα ονόματα και τα στοιχεία όλων των συμμετεχόντων, του διαμεσολαβητή, καθώς και μία σύντομη περιγραφή της διαφοράς. Η γνωστοποίηση/πρόσκληση αποστέλλεται ξεχωριστά σε καθέναν από αυτούς τουλάχιστον πέντε (5) ημέρες πριν από την ΕΣΔ. Οι νομικοί παραστάτες των μερών δεν απαιτείται να λαμβάνουν ξεχωριστή έγγραφη γνωστοποίηση/πρόσκληση.
</div>`;

    } else if (d.type === 'praktiko') {
        activeHtml = `
<div class="doc-title-block">
    <span class="doc-main-title">ΠΡΑΚΤΙΚΟ ΠΕΡΑΤΩΣΗΣ ΑΡΧΙΚΗΣ ΥΠΟΧΡΕΩΤΙΚΗΣ ΣΥΝΕΔΡΙΑΣ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</span>
    <div class="doc-subtitle">(άρθρο 79 παρ. 4 του ν. 5344/2026)</div>
</div>

<p>Ο διαμεσολαβητής <b>${mediatorFullName}</b> του ${m_data.f} (ΑΜΔ ${m_data.am}) βεβαιώνω ότι περατώθηκε η Εισαγωγική Συνεδρία Διαμεσολάβησης (ΕΣΔ) για τη διαφορά που περιγράφεται στο επισυναπτόμενο Φύλλο Βασικών Στοιχείων (Έντυπο 1), κατά την οποία παραστάθηκαν τα μέρη όπως παρακάτω αναφέρεται.</p>

<table style="width:100%;font-size:10.5pt;border-collapse:collapse;margin-bottom:16pt;">
<tr><td style="width:36%;padding:3pt 0;font-weight:bold;">Ημερομηνία ΕΣΔ:</td><td>${fmtD(d.z_date)}</td></tr>
<tr><td style="padding:3pt 0;font-weight:bold;">Τόπος ΕΣΔ:</td><td>ΠΕΝΤΑΠΛΑΤΑΝΟΣ ΓΙΑΝΝΙΤΣΩΝ — μέσω τηλεδιάσκεψης</td></tr>
</table>

<div style="font-weight:bold;font-size:10pt;text-transform:uppercase;color:#1e3a6e;margin-bottom:12pt;letter-spacing:0.3pt;">ΣΥΜΜΕΤΕΧΟΝΤΕΣ ΣΤΗΝ ΕΣΔ:</div>

${praktikoReqHTML}
${praktikoRespHTML}

<hr class="doc-divider">

<div class="doc-party-block">
    <div class="party-label">Ο ΔΙΑΜΕΣΟΛΑΒΗΤΗΣ</div>
    <div>Ονοματεπώνυμο: <b>${mediatorFullName}</b> &nbsp;|&nbsp; Πατρώνυμο: ${m_data.f} &nbsp;|&nbsp; ΑΜΔ: ${m_data.am}</div>
    <div class="doc-party-row">
        <div>Πενταπλάτανος Γιαννιτσών, την ${d.doc_date}</div>
        <div class="sig-block" style="min-width:160pt;border-top:1pt solid #333;padding-top:4pt;margin-top:28pt;">Ο Διαμεσολαβητής</div>
    </div>
</div>

<div class="doc-notes-block" style="margin-top:16pt;">
<b>Παρατηρήσεις:</b><br>
— Στο παρόν πρακτικό επισυνάπτεται το Φύλλο Βασικών Στοιχείων (Έντυπο 1) και η Γνωστοποίηση/Πρόσκληση (Έντυπο 3) κατ' άρθρο 78 παρ. 2 ν. 5344/2026, τα οποία αποτελούν αναπόσπαστο μέρος του παρόντος. Συντάσσεται από τον διαμεσολαβητή, υπογράφεται από όλους τους παρισταμένους και καθένας λαμβάνει από ένα όμοιο πρωτότυπο.<br>
— <b>Η διαδικασία έλαβε χώρα μέσω τηλεδιάσκεψης.</b><br>
— Σύμφωνα με το άρθρο 78 παρ. 2 ν. 5344/2026, ο διαμεσολαβητής γνωστοποίησε στα μέρη εγγράφως, την ${fmtD(d.notify_date)}, με μήνυμα ηλεκτρονικού ταχυδρομείου, την ημερομηνία και τον τόπο διεξαγωγής της ΕΣΔ (Έντυπο 3), καθώς και το Φύλλο Βασικών Στοιχείων (Έντυπο 1), και έλαβε απόδειξη παραλαβής.<br>
— Σύμφωνα με το άρθρο 84 ν. 5344/2026, η έγγραφη γνωστοποίηση αναστέλλει την παραγραφή και την αποσβεστική προθεσμία άσκησης αξιώσεων, εφόσον αυτές έχουν αρχίσει κατά τις διατάξεις του ουσιαστικού δικαίου, καθώς και τις δικονομικές προθεσμίες των άρθρων 237 και 238 Κώδικα Πολιτικής Δικονομίας, για όσο χρόνο διαρκεί η διαδικασία διαμεσολάβησης.<br>
— Η ΕΣΔ έχει εμπιστευτικό χαρακτήρα (άρθρο 79 παρ. 3 ν. 5344/2026). Πριν από την έναρξη, όλοι οι συμμετέχοντες δεσμεύτηκαν να τηρήσουν το απόρρητο της διαδικασίας.<br>
— Το παρόν αφορά τη διαφορά που περιγράφεται στην αγωγή που κατατέθηκε στο ${d.court} με Αριθμό Κατάθεσης: ${d.court_n} και θα προσκομισθεί μαζί με τις προτάσεις.
</div>

<div class="doc-footnote">
<b>ΚΑΤΕΥΘΥΝΤΗΡΙΕΣ ΟΔΗΓΙΕΣ:</b> Στο παρόν πρακτικό περάτωσης της Υποχρεωτικής Αρχικής Συνεδρίας επισυνάπτεται το Φύλλο Βασικών Στοιχείων (Έντυπο 1), το οποίο αποτελεί αναπόσπαστο μέρος του παρόντος. Συντάσσεται από τον διαμεσολαβητή μετά την περάτωση της Υποχρεωτικής Αρχικής Συνεδρίας, υπογράφεται από όλους τους παρισταμένους και ο καθένας λαμβάνει από ένα όμοιο πρωτότυπο. Μπορείτε να προσθέσετε περισσότερα ονόματα ανάλογα με τους συμμετέχοντες.
</div>`;
    } else if (d.type === 'slides_yas') {
        const slidesData = [
            {
                num: '01',
                color: '#2563eb',
                title: '🔒 Εμπιστευτικότητα &amp; Ουδέτερος Τρίτος',
                subtitle: 'Άρθρο 79 παρ. 3 &amp; άρθρο 80 ν. 5344/2026',
                points: [
                    'Ο διαμεσολαβητής είναι <b>ουδέτερος τρίτος</b> — δεν εκπροσωπεί κανένα μέρος και δεν αποφασίζει για λογαριασμό τους.',
                    'Όλα όσα λέγονται στη διαδικασία είναι <b>απόλυτα εμπιστευτικά</b> και δεν μπορούν να χρησιμοποιηθούν ως αποδεικτικό μέσο σε δίκη.',
                    'Κανείς συμμετέχων δεν μπορεί να καλέσει τον διαμεσολαβητή ως <b>μάρτυρα</b> σε δικαστικές διαδικασίες.',
                    'Η δέσμευση εχεμύθειας ισχύει <b>για όλους</b>: μέρη, δικηγόρους και διαμεσολαβητή.'
                ]
            },
            {
                num: '02',
                color: '#059669',
                title: '🤝 Ελεύθερη Βούληση &amp; Σκοπός',
                subtitle: 'Άρθρα 76 &amp; 78 ν. 5344/2026',
                points: [
                    'Η συμμετοχή στην Εισαγωγική Συνεδρία Διαμεσολάβησης (ΕΣΔ) είναι υποχρεωτική, η <b>εξακολούθηση όμως της διαμεσολάβησης είναι εντελώς εθελοντική</b>.',
                    'Κάθε μέρος μπορεί να αποχωρήσει <b>ελεύθερα</b> ανά πάσα στιγμή από τη συνεδρία.',
                    'Σκοπός της Υποχρεωτικής Αρχικής Συνεδρίας είναι η <b>ενημέρωση</b> για τα οφέλη της διαμεσολάβησης και η εξέταση δυνατότητας συμφωνίας.',
                    'Η διαμεσολάβηση επιδιώκει <b>αμοιβαία αποδεκτή λύση</b> που ικανοποιεί και τα δύο μέρη.'
                ]
            },
            {
                num: '03',
                color: '#d97706',
                title: '⏸️ Αναστολή Παραγραφής &amp; Δικονομικών Προθεσμιών',
                subtitle: 'Άρθρο 84 ν. 5344/2026',
                points: [
                    'Η έγγραφη γνωστοποίηση για τη διεξαγωγή της Υποχρεωτικής Αρχικής Συνεδρίας <b>αναστέλλει την παραγραφή</b> των αξιώσεων.',
                    'Αναστέλλονται επίσης οι <b>δικονομικές προθεσμίες</b> των άρθρων 237 και 238 του Κώδικα Πολιτικής Δικονομίας.',
                    'Η αναστολή ισχύει για όσο χρόνο <b>διαρκεί η διαδικασία</b> της διαμεσολάβησης.',
                    'Αυτό σημαίνει ότι τα μέρη έχουν <b>χρόνο να διαπραγματευτούν</b> χωρίς να χάνουν δικαιώματά τους.'
                ]
            },
            {
                num: '04',
                color: '#7c3aed',
                title: '📋 Αποτέλεσμα &amp; Επόμενα Βήματα',
                subtitle: 'Άρθρο 79 παρ. 4 &amp; άρθρο 81 παρ. 3 ν. 5344/2026',
                points: [
                    'Αν τα μέρη <b>συμφωνήσουν</b>, συντάσσεται Πρακτικό Επιτυχούς Διαμεσολάβησης που αποτελεί <b>εκτελεστό τίτλο</b> μετά από κατάθεση στο Πρωτοδικείο.',
                    'Αν τα μέρη <b>δεν συμφωνήσουν ή αποχωρήσουν</b>, συντάσσεται Πρακτικό Περάτωσης — η δίκη συνεχίζεται κανονικά.',
                    'Το Πρακτικό Περάτωσης <b>προσκομίζεται υποχρεωτικά</b> μαζί με τις προτάσεις στο δικαστήριο.',
                    'Η επιτυχής διαμεσολάβηση εξοικονομεί <b>χρόνο, χρήμα και ψυχολογικό κόστος</b> για όλους.'
                ]
            },
            {
                num: '05',
                color: '#dc2626',
                title: '🌟 Συναλλακτική Ευθύτητα &amp; Επικοινωνιακός Πολιτισμός',
                subtitle: 'Αρχές Διαμεσολάβησης — Κώδικας Δεοντολογίας',
                points: [
                    'Η διαμεσολάβηση βασίζεται στην <b>καλή πίστη</b> και την εντιμότητα όλων των συμμετεχόντων.',
                    'Τα μέρη ενθαρρύνονται να <b>εκφράσουν τα πραγματικά τους συμφέροντα</b>, όχι μόνο τις νομικές τους θέσεις.',
                    'Ο διαμεσολαβητής διευκολύνει τον <b>εποικοδομητικό διάλογο</b> και βοηθά στη διατύπωση δημιουργικών λύσεων.',
                    'Η διαμεσολάβηση <b>διατηρεί και επαναφέρει</b> επαγγελματικές και προσωπικές σχέσεις που θα καταστρέφονταν από τη δίκη.'
                ]
            }
        ];

        const slideColors = ['#2563eb','#059669','#d97706','#7c3aed','#dc2626'];
        activeHtml = `
<div style="padding: 8px 0;">
  <div style="text-align:center; font-weight:900; font-size:1.1rem; color:#1e293b; margin-bottom:4px;">ΒΑΣΙΚΑ ΣΗΜΕΙΑ ΥΠΟΧΡΕΩΤΙΚΗΣ ΑΡΧΙΚΗΣ ΣΥΝΕΔΡΙΑΣ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</div>
  <div style="text-align:center; font-size:0.8rem; color:#64748b; margin-bottom:18px;">Ν. 5344/2026 — Ενημερωτικό Φυλλάδιο Διαμεσολαβητή</div>
  ${slidesData.map((s, i) => `
  <div class="yas-slide">
    <div class="yas-slide-num" style="background:${s.color};">${s.num}</div>
    <div class="yas-slide-body" style="border-left-color:${s.color};">
      <div class="yas-slide-title">${s.title}</div>
      <div class="yas-slide-subtitle">${s.subtitle}</div>
      <div class="yas-points">
        ${s.points.map(p => `<div class="yas-point"><span class="yas-dot" style="background:${s.color};"></span><span>${p}</span></div>`).join('')}
      </div>
    </div>
  </div>`).join('')}
  <div style="text-align:center; margin-top:12px;">
    <button class="btn" style="background:#1e293b; color:#fff; padding:10px 24px; font-size:13px;" onclick="exportSlidesToWord()">📘 ΕΞΑΓΩΓΗ ΔΙΑΦΑΝΕΙΩΝ ΣΕ WORD (.doc)</button>
  </div>
</div>`;
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
            @page {
                size: 21cm 29.7cm;
                margin: 2.54cm 3.17cm 2.54cm 3.17cm;
                mso-page-orientation: portrait;
            }
            body {
                font-family: "Times New Roman", serif;
                font-size: 12pt;
                line-height: 1.15;
                text-align: justify;
                text-align-last: left;
                text-justify: inter-word;
                word-spacing: normal;
                letter-spacing: normal;
                hyphens: auto;
                -webkit-hyphens: auto;
                margin: 0;
                padding: 0;
                color: #000000;
            }
            p, div {
                line-height: 1.15;
                text-align: justify;
                text-align-last: left;
                text-justify: inter-word;
                word-spacing: normal;
                letter-spacing: normal;
                margin-bottom: 6pt;
                margin-top: 0pt;
            }
            b, strong {
                font-weight: bold;
            }
            h1, h2, h3 {
                text-align: center;
                font-family: "Times New Roman", serif;
                font-size: 14pt;
                font-weight: bold;
                line-height: 1.15;
                margin-bottom: 12pt;
                margin-top: 0pt;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                font-size: 12pt;
                line-height: 1.15;
            }
            td, th {
                border: 1pt solid #000;
                padding: 4pt 6pt;
                vertical-align: top;
            }
            .printable {
                font-family: "Times New Roman", serif;
                font-size: 12pt;
                line-height: 1.15;
                text-align: justify;
            }
            a { color: #000; text-decoration: underline; }
        </style>
        </head>
        <body>${html}</body></html>`;

    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(blobContent);
    link.download = filename;
    link.click();
}

function downloadMailTemplate() {
    const feeInfo = getFeeInfo();
    const feeText = `${feeInfo.perPartyValue} (2 πλευρές × ${feeInfo.grossPerParty}€ = <strong>${feeInfo.totalGross}€ συνολικά</strong>)`;
    const feeTxtPlain = `${feeInfo.perPartyValue} (2 πλευρές × ${feeInfo.grossPerParty}€ = ${feeInfo.totalGross}€ συνολικά)`;
    const z_date = document.getElementById('yas_date').value;
    const z_time = document.getElementById('yas_time').value || '--:--';
    const z_link = document.getElementById('z_link').value || '';
    const z_id   = document.getElementById('z_id').value || '';
    const z_pass = document.getElementById('z_pass').value || '';

    // Ημερολόγιο
    const MONTHS_GR = ['ΙΑΝΟΥΑΡΙΟΥ','ΦΕΒΡΟΥΑΡΙΟΥ','ΜΑΡΤΙΟΥ','ΑΠΡΙΛΙΟΥ','ΜΑΪΟΥ','ΙΟΥΝΙΟΥ',
                       'ΙΟΥΛΙΟΥ','ΑΥΓΟΥΣΤΟΥ','ΣΕΠΤΕΜΒΡΙΟΥ','ΟΚΤΩΒΡΙΟΥ','ΝΟΕΜΒΡΙΟΥ','ΔΕΚΕΜΒΡΙΟΥ'];
    const DAYS_GR   = ['Κυριακή','Δευτέρα','Τρίτη','Τετάρτη','Πέμπτη','Παρασκευή','Σάββατο'];
    let calDay = '??', calMonth = '???', calYear = '????', calDayName = '?????';
    let dateLabel = '................';
    if (z_date) {
        const dt = new Date(z_date + 'T12:00:00');
        calDay     = dt.getDate();
        calMonth   = MONTHS_GR[dt.getMonth()];
        calYear    = dt.getFullYear();
        calDayName = DAYS_GR[dt.getDay()];
        dateLabel  = `${calDay} ${calMonth} ${calYear}, ${calDayName}`;
    }

    // ── 1. HTML (για Gmail: ανοίγεις στον browser, Ctrl+A, Ctrl+C, Paste στο Gmail) ──
    const htmlBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="el">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Πρόσκληση ΕΣΔ Διαμεσολάβησης</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; font-family:Arial,Helvetica,sans-serif; }
    .gmail-note { background:#fff3cd; border:1px solid #ffc107; padding:12px 20px; font-size:13px;
                  color:#856404; text-align:center; font-family:Arial,sans-serif; }
    .gmail-note strong { display:block; font-size:15px; margin-bottom:4px; }
    @media print { .gmail-note { display:none; } }
  </style>
</head>
<body>

<!-- ΕΝΑΡΞΗ ΠΕΡΙΕΧΟΜΕΝΟΥ EMAIL — αυτό αντιγράφεται -->
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4; padding:20px 0;">
  <tr>
    <td align="center">
      <table border="0" cellpadding="0" cellspacing="0" width="620" style="background-color:#34495e; border-radius:8px; overflow:hidden; font-family:Arial,Helvetica,sans-serif;">

        <!-- HEADER -->
        <tr>
          <td colspan="2" align="center" style="background-color:#1a252f; padding:18px 30px; border-bottom:3px solid #e67e22;">
            <p style="margin:0; color:#e67e22; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">ΔΙΑΠΙΣΤΕΥΜΕΝΟΣ ΔΙΑΜΕΣΟΛΑΒΗΤΗΣ</p>
            <p style="margin:6px 0 0 0; color:#ffffff; font-size:16px; font-weight:bold;">ΥΠΟΧΡΕΩΤΙΚΗ ΑΡΧΙΚΗ ΣΥΝΕΔΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</p>
          </td>
        </tr>

        <!-- INTRO + ΗΜΕΡΟΛΟΓΙΟ -->
        <tr>
          <!-- Κείμενο αριστερά -->
          <td valign="top" style="padding:26px 16px 20px 30px; color:#ecf0f1; font-size:14px; line-height:1.75;">
            <p style="margin:0 0 12px 0; font-size:15px;">Αξιότιμες Κυρίες &amp; Αξιότιμοι Κύριοι,</p>
            <p style="margin:0 0 12px 0;">Σε συνέχεια της επικοινωνίας μας αποστέλλω την πρόσκληση για την <strong>Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης</strong> (Υ.Α.Σ.), καθώς και τον <strong>ΤΡΟΠΟ, ΤΟΠΟ και ΧΡΟΝΟ</strong> διεξαγωγής της, τα οποία αναλυτικά περιλαμβάνονται στα επισυναπτόμενα έγγραφα.</p>
            <p style="margin:0;">Υπενθυμίζω ότι η αμοιβή για τη διεξαγωγή της Υ.Α.Σ. ανέρχεται στο ποσό των <strong style="color:#f39c12;">${feeText}</strong> και θα πρέπει να έχει κατατεθεί πριν την εκκίνηση της διαδικασίας στον τραπεζικό λογαριασμό που αναγράφεται στη συνημμένη πρόσκληση.</p>
          </td>

          <!-- Ημερολόγιο δεξιά -->
          <td valign="top" align="center" style="padding:20px 24px 20px 0; width:155px;">
            <table border="0" cellpadding="0" cellspacing="0" width="145" style="border-radius:8px; overflow:hidden;">
              <tr>
                <td align="center" style="background-color:#e67e22; padding:10px 6px 6px;">
                  <p style="margin:0; color:#fff; font-size:10px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">${calMonth}</p>
                  <p style="margin:2px 0 0; color:rgba(255,255,255,0.8); font-size:10px;">${calYear}</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color:#ffffff; padding:8px 6px 4px;">
                  <p style="margin:0; color:#2c3e50; font-size:54px; font-weight:900; line-height:1;">${calDay}</p>
                  <p style="margin:2px 0 6px; color:#e67e22; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">${calDayName}</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color:#2c3e50; border-top:2px solid #e67e22; padding:8px 6px;">
                  <p style="margin:0; color:#f39c12; font-size:9px; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase;">ΩΡΑ ΕΝΑΡΞΗΣ</p>
                  <p style="margin:4px 0 0; color:#ffffff; font-size:24px; font-weight:900; letter-spacing:2px;">${z_time}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ZOOM -->
        <tr>
          <td colspan="2" style="padding:0 30px 24px;">
            <table border="0" cellpadding="12" cellspacing="0" width="100%" style="background-color:rgba(0,0,0,0.2); border:2px solid #e67e22; border-radius:8px;">
              <tr>
                <td align="center">
                  <p style="margin:0 0 8px; color:#e67e22; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">&#128279; ΣΤΟΙΧΕΙΑ ΤΗΛΕΔΙΑΣΚΕΨΗΣ (ZOOM)</p>
                  <p style="margin:4px 0; color:#ecf0f1; font-size:13px;">Σύνδεσμος: <a href="${z_link}" style="color:#f39c12; text-decoration:underline; word-break:break-all;">${z_link}</a></p>
                  <p style="margin:4px 0; color:#ecf0f1; font-size:13px;">Meeting ID: <strong style="color:#fff;">${z_id}</strong> &nbsp;&nbsp; Passcode: <strong style="color:#fff;">${z_pass}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ΔΙΑΧΩΡΙΣΤΗΣ -->
        <tr><td colspan="2" style="padding:0 30px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid rgba(255,255,255,0.15); height:1px; font-size:0;">&nbsp;</td></tr></table></td></tr>

        <!-- ΚΥΡΙΟ ΚΕΙΜΕΝΟ -->
        <tr>
          <td colspan="2" style="padding:22px 30px 28px; color:#ecf0f1; font-size:14px; line-height:1.8;">
            <p style="margin:0 0 12px;">Η Υποχρεωτική Αρχική Συνεδρία (Υ.Α.Σ.) αποτελεί αναπόσπαστο μέρος της διαμεσολάβησης και λειτουργεί ως υποχρεωτικό προστάδιο πριν την είσοδο της υπόθεσής σας στο δικαστήριο.</p>
            <p style="margin:0 0 12px;">Ο διαμεσολαβητής, ως τρίτο ουδέτερο και αμερόληπτο πρόσωπο, διευκολύνει τα μέρη να βρουν μια κοινά αποδεκτή λύση — χωρίς να αποφασίζει ο ίδιος.</p>
            <p style="margin:0 0 8px;">Η διαμεσολάβηση είναι:</p>
            <table border="0" cellpadding="3" cellspacing="0" width="100%">
              <tr><td width="16" valign="top" style="color:#f39c12;">–</td><td style="color:#ecf0f1; font-size:14px; line-height:1.7;"><strong style="color:#f1c40f;">εκούσια</strong> — προσέρχεστε και παραμένετε εθελοντικά</td></tr>
              <tr><td width="16" valign="top" style="color:#f39c12;">–</td><td style="color:#ecf0f1; font-size:14px; line-height:1.7;"><strong style="color:#f1c40f;">μη δεσμευτική</strong> — μέχρι την υπογραφή της συμφωνίας</td></tr>
              <tr><td width="16" valign="top" style="color:#f39c12;">–</td><td style="color:#ecf0f1; font-size:14px; line-height:1.7;"><strong style="color:#f1c40f;">απόλυτα εμπιστευτική</strong> — οτιδήποτε ειπωθεί δεν μπορεί να χρησιμοποιηθεί στο Δικαστήριο ούτε να κοινοποιηθεί σε τρίτους</td></tr>
            </table>
            <p style="margin:14px 0 12px;"><strong>Κανείς από εμάς δεν μπορεί να κληθεί στο Δικαστήριο ως μάρτυρας.</strong></p>
            <p style="margin:0 0 20px;"><strong>Στόχος μας:</strong> η κατάληξη σε μια κοινά αποδεκτή συμφωνία μέσα από την καλόπιστη συνεργασία όλων.</p>
            <p style="margin:0; font-size:13px; color:rgba(236,240,241,0.6);">Θα ακολουθήσει τηλεφωνική επικοινωνία τόσο με εσάς όσο και με τους δικηγόρους σας.<br />Παραμένω στη διάθεσή σας για οποιαδήποτε διευκρίνιση.</p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td colspan="2" align="center" style="background-color:#1a252f; padding:14px 30px; border-top:2px solid #e67e22;">
            <p style="margin:0; color:rgba(236,240,241,0.5); font-size:11px;">Το παρόν αποστέλλεται σύμφωνα με το άρθρο 78 παρ. 2 του ν. 5344/2026</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
<!-- ΤΕΛΟΣ ΠΕΡΙΕΧΟΜΕΝΟΥ EMAIL -->

</body>
</html>`;

    // ── 2. TXT (για Notepad — plain text με ευανάγνωστη μορφή) ──
    const txtBody =
`════════════════════════════════════════════════
   ΥΠΟΧΡΕΩΤΙΚΗ ΑΡΧΙΚΗ ΣΥΝΕΔΡΙΑ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ
   ΔΙΑΠΙΣΤΕΥΜΕΝΟΣ ΔΙΑΜΕΣΟΛΑΒΗΤΗΣ
════════════════════════════════════════════════

Αξιότιμες Κυρίες & Αξιότιμοι Κύριοι,

Σε συνέχεια της επικοινωνίας μας αποστέλλω την
πρόσκληση για την Υποχρεωτική Αρχική Συνεδρία
Διαμεσολάβησης (Υ.Α.Σ.), καθώς και τον ΤΡΟΠΟ,
ΤΟΠΟ και ΧΡΟΝΟ διεξαγωγής της, τα οποία
αναλυτικά περιλαμβάνονται στα επισυναπτόμενα
έγγραφα.

Υπενθυμίζω ότι η αμοιβή για τη διεξαγωγή της
Υ.Α.Σ. ανέρχεται στο ποσό των ${feeTxtPlain}
και θα πρέπει να έχει κατατεθεί πριν την
εκκίνηση της διαδικασίας στον τραπεζικό
λογαριασμό που αναγράφεται στη συνημμένη
πρόσκληση.

────────────────────────────────────────────────
📅  ΗΜΕΡΟΜΗΝΙΑ ΚΑΙ ΩΡΑ Υ.Α.Σ.

    ${dateLabel}
    Ώρα έναρξης: ${z_time}

🔗  ΣΤΟΙΧΕΙΑ ΤΗΛΕΔΙΑΣΚΕΨΗΣ (ZOOM)

    Σύνδεσμος : ${z_link}
    Meeting ID: ${z_id}
    Passcode  : ${z_pass}
────────────────────────────────────────────────

Η Υποχρεωτική Αρχική Συνεδρία αποτελεί
αναπόσπαστο μέρος της διαμεσολάβησης και
λειτουργεί ως υποχρεωτικό προστάδιο πριν την
είσοδο της υπόθεσής σας στο δικαστήριο.

Η διαμεσολάβηση είναι:
  – ΕΚΟΥΣΙΑ: προσέρχεστε και παραμένετε
    εθελοντικά
  – ΜΗ ΔΕΣΜΕΥΤΙΚΗ: μέχρι την υπογραφή της
    συμφωνίας
  – ΑΠΟΛΥΤΑ ΕΜΠΙΣΤΕΥΤΙΚΗ: οτιδήποτε ειπωθεί
    δεν μπορεί να χρησιμοποιηθεί στο Δικαστήριο
    ούτε να κοινοποιηθεί σε τρίτους

Κανείς από εμάς δεν μπορεί να κληθεί στο
Δικαστήριο ως μάρτυρας.

Στόχος μας: η κατάληξη σε μια κοινά αποδεκτή
συμφωνία μέσα από την καλόπιστη συνεργασία όλων.

Θα ακολουθήσει τηλεφωνική επικοινωνία τόσο με
εσάς όσο και με τους δικηγόρους σας.
Παραμένω στη διάθεσή σας για οποιαδήποτε
διευκρίνιση.

════════════════════════════════════════════════
Αποστέλλεται σύμφωνα με το άρθρο 7 παρ. 2
του ν. 5344/2026
════════════════════════════════════════════════`;

    // ── Κατέβασμα HTML ──
    const aHtml = document.createElement('a');
    aHtml.href = URL.createObjectURL(new Blob([htmlBody], {type:'text/html;charset=utf-8'}));
    aHtml.download = 'Mail_Template_Gmail.html';
    aHtml.click();

    // ── Κατέβασμα TXT ──
    setTimeout(() => {
        const aTxt = document.createElement('a');
        aTxt.href = URL.createObjectURL(new Blob([txtBody], {type:'text/plain;charset=utf-8'}));
        aTxt.download = 'Mail_Template_Notepad.txt';
        aTxt.click();
    }, 400);

    // ── Κατέβασμα .ICS (iCalendar) ──
    setTimeout(() => {
        const icsContent = generateICS(z_date, z_time, z_link, z_id, z_pass);
        if (icsContent) {
            const aIcs = document.createElement('a');
            aIcs.href = URL.createObjectURL(new Blob([icsContent], {type:'text/calendar;charset=utf-8'}));
            aIcs.download = 'YAS_Diameso.ics';
            aIcs.click();
        }
    }, 800);

    showToast('📧 Κατεβάστηκαν: .html + .txt + .ics (ημερολόγιο)', '#059669');
}

// ── Δημιουργία ICS αρχείου ──
function generateICS(z_date, z_time, z_link, z_id, z_pass) {
    if (!z_date || !z_time) {
        showToast('⚠️ Συμπληρώστε ημερομηνία και ώρα ΕΣΔ για το .ics', '#f59e0b');
        return null;
    }

    // Υπολογισμός start/end σε UTC format
    const [hour, min] = z_time.split(':').map(Number);
    const dtStart = new Date(`${z_date}T${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`);
    const dtEnd   = new Date(dtStart.getTime() + 60 * 60 * 1000); // +1 ώρα

    const fmt = (d) => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';

    // Συλλογή emails εμπλεκομένων
    const attendees = [];
    [...reqs, ...resps].forEach(p => {
        if (p.email) attendees.push(`ATTENDEE;CN="${p.n} ${p.s}";RSVP=TRUE:mailto:${p.email}`);
        if (p.l_email) attendees.push(`ATTENDEE;CN="${p.l_n} ${p.l_s}";RSVP=TRUE:mailto:${p.l_email}`);
    });
    if (m_data.email) attendees.push(`ATTENDEE;CN="${m_data.n} ${m_data.s}";RSVP=TRUE:mailto:${m_data.email}`);

    const mediatorName = [m_data.n, m_data.s].filter(Boolean).join(' ') || 'Διαμεσολαβητής';

    const description = [
        'Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης (Υ.Α.Σ.)',
        '',
        z_link  ? `Zoom Link: ${z_link}` : '',
        z_id    ? `Meeting ID: ${z_id}`  : '',
        z_pass  ? `Passcode: ${z_pass}`  : '',
        '',
        `Διαμεσολαβητής: ${mediatorName}`,
        'Σύμφωνα με τον Ν. 4640/2019',
    ].filter(l => l !== null).join('\\n');

    const location = z_link || 'Τηλεδιάσκεψη μέσω Zoom';

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mediation Portal//YAS//GR',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:yas-${Date.now()}@mediationportal.gr`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(dtStart)}`,
        `DTEND:${fmt(dtEnd)}`,
        `SUMMARY:ΕΣΔ Διαμεσολάβησης — ${mediatorName}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `ORGANIZER;CN="${mediatorName}":mailto:${m_data.email || 'noreply@mediationportal.gr'}`,
        ...attendees,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Υπενθύμιση ΕΣΔ Διαμεσολάβησης (24 ώρες πριν)',
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Υπενθύμιση ΕΣΔ Διαμεσολάβησης (1 ώρα πριν)',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

// ── Google Calendar Invite μέσω Apps Script ──
async function createCalendarInvite() {
    if (!GOOGLE_APP_SCRIPT_URL) {
        showToast('❌ Δεν έχει οριστεί Google Apps Script URL', '#dc2626');
        return;
    }

    const z_date = document.getElementById('yas_date').value;
    const z_time = document.getElementById('yas_time').value;
    const z_link = document.getElementById('z_link').value || '';
    const z_id   = document.getElementById('z_id').value || '';
    const z_pass = document.getElementById('z_pass').value || '';

    if (!z_date || !z_time) {
        showToast('⚠️ Συμπληρώστε ημερομηνία και ώρα ΕΣΔ', '#f59e0b');
        return;
    }

    // Συλλογή emails
    const emails = [];
    [...reqs, ...resps].forEach(p => {
        if (p.email)   emails.push(p.email);
        if (p.l_email) emails.push(p.l_email);
    });
    if (m_data.email) emails.push(m_data.email);
    const uniqueEmails = [...new Set(emails.filter(Boolean))];

    if (uniqueEmails.length === 0) {
        showToast('⚠️ Δεν υπάρχουν emails εμπλεκομένων', '#f59e0b');
        return;
    }

    const mediatorName = [m_data.n, m_data.s].filter(Boolean).join(' ') || 'Διαμεσολαβητής';
    const description  = [
        'Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης (Υ.Α.Σ.)',
        z_link ? `Zoom: ${z_link}` : '',
        z_id   ? `Meeting ID: ${z_id}` : '',
        z_pass ? `Passcode: ${z_pass}` : '',
        `Διαμεσολαβητής: ${mediatorName}`,
    ].filter(Boolean).join('\n');

    showToast('⏳ Δημιουργία Calendar event...', '#2563eb');

    try {
        const params = new URLSearchParams({
            action:      'createCalendarEvent',
            date:        z_date,
            time:        z_time,
            title:       `ΕΣΔ Διαμεσολάβησης — ${mediatorName}`,
            description: description,
            location:    z_link || 'Τηλεδιάσκεψη μέσω Zoom',
            emails:      uniqueEmails.join(','),
        });

        const res  = await fetch(`${GOOGLE_APP_SCRIPT_URL}?${params}`);
        const data = await res.json();

        if (data.status === 'success') {
            showToast(`✅ Calendar invite στάλθηκε σε ${uniqueEmails.length} εμπλεκόμενους!`, '#059669');
        } else {
            showToast('❌ Σφάλμα: ' + (data.message || 'Άγνωστο σφάλμα'), '#dc2626');
        }
    } catch(e) {
        showToast('❌ Αδυναμία επικοινωνίας με Apps Script', '#dc2626');
    }
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

    law_5344: `<h3>Νόμος 5344/2026 — Κώδικας Εναλλακτικής Επίλυσης Διαφορών (ΦΕΚ Α΄ 168/16-10-2026)</h3>
<div id="law-article-nav" style="margin-bottom:12pt;">
<a href="#art-1" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 1</a>
<a href="#art-2" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 2</a>
<a href="#art-3" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 3</a>
<a href="#art-4" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 4</a>
<a href="#art-5" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 5</a>
<a href="#art-6" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 6</a>
<a href="#art-7" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 7</a>
<a href="#art-8" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 8</a>
<a href="#art-9" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 9</a>
<a href="#art-10" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 10</a>
<a href="#art-11" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 11</a>
<a href="#art-12" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 12</a>
<a href="#art-13" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 13</a>
<a href="#art-14" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 14</a>
<a href="#art-15" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 15</a>
<a href="#art-16" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 16</a>
<a href="#art-17" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 17</a>
<a href="#art-18" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 18</a>
<a href="#art-19" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 19</a>
<a href="#art-20" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 20</a>
<a href="#art-21" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 21</a>
<a href="#art-22" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 22</a>
<a href="#art-23" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 23</a>
<a href="#art-24" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 24</a>
<a href="#art-25" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 25</a>
<a href="#art-26" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 26</a>
<a href="#art-27" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 27</a>
<a href="#art-28" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 28</a>
<a href="#art-29" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 29</a>
<a href="#art-30" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 30</a>
<a href="#art-31" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 31</a>
<a href="#art-32" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 32</a>
<a href="#art-33" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 33</a>
<a href="#art-34" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 34</a>
<a href="#art-35" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 35</a>
<a href="#art-36" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 36</a>
<a href="#art-37" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 37</a>
<a href="#art-38" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 38</a>
<a href="#art-39" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 39</a>
<a href="#art-40" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 40</a>
<a href="#art-41" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 41</a>
<a href="#art-42" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 42</a>
<a href="#art-43" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 43</a>
<a href="#art-44" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 44</a>
<a href="#art-45" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 45</a>
<a href="#art-46" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 46</a>
<a href="#art-47" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 47</a>
<a href="#art-48" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 48</a>
<a href="#art-49" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 49</a>
<a href="#art-50" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 50</a>
<a href="#art-51" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 51</a>
<a href="#art-52" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 52</a>
<a href="#art-53" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 53</a>
<a href="#art-54" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 54</a>
<a href="#art-55" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 55</a>
<a href="#art-56" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 56</a>
<a href="#art-57" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 57</a>
<a href="#art-58" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 58</a>
<a href="#art-59" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 59</a>
<a href="#art-60" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 60</a>
<a href="#art-61" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 61</a>
<a href="#art-62" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 62</a>
<a href="#art-63" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 63</a>
<a href="#art-64" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 64</a>
<a href="#art-65" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 65</a>
<a href="#art-66" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 66</a>
<a href="#art-67" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 67</a>
<a href="#art-68" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 68</a>
<a href="#art-69" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 69</a>
<a href="#art-70" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 70</a>
<a href="#art-71" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 71</a>
<a href="#art-72" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 72</a>
<a href="#art-73" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 73</a>
<a href="#art-74" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 74</a>
<a href="#art-75" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 75</a>
<a href="#art-76" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 76</a>
<a href="#art-77" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 77</a>
<a href="#art-78" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 78</a>
<a href="#art-79" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 79</a>
<a href="#art-80" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 80</a>
<a href="#art-81" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 81</a>
<a href="#art-82" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 82</a>
<a href="#art-83" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 83</a>
<a href="#art-84" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 84</a>
<a href="#art-85" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 85</a>
<a href="#art-86" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 86</a>
<a href="#art-87" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 87</a>
<a href="#art-88" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 88</a>
<a href="#art-89" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 89</a>
<a href="#art-90" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 90</a>
<a href="#art-91" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 91</a>
<a href="#art-92" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 92</a>
<a href="#art-93" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 93</a>
<a href="#art-94" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 94</a>
<a href="#art-95" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 95</a>
<a href="#art-96" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 96</a>
<a href="#art-97" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 97</a>
<a href="#art-98" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 98</a>
<a href="#art-99" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 99</a>
<a href="#art-100" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 100</a>
<a href="#art-101" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 101</a>
<a href="#art-102" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 102</a>
<a href="#art-103" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 103</a>
<a href="#art-104" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 104</a>
<a href="#art-105" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 105</a>
<a href="#art-106" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 106</a>
<a href="#art-107" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 107</a>
<a href="#art-108" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 108</a>
<a href="#art-109" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 109</a>
<a href="#art-110" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 110</a>
<a href="#art-111" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 111</a>
<a href="#art-112" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 112</a>
<a href="#art-113" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 113</a>
<a href="#art-114" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 114</a>
<a href="#art-115" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 115</a>
<a href="#art-116" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 116</a>
<a href="#art-117" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 117</a>
<a href="#art-118" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 118</a>
<a href="#art-119" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 119</a>
<a href="#art-120" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 120</a>
<a href="#art-121" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 121</a>
<a href="#art-122" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 122</a>
<a href="#art-123" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 123</a>
<a href="#art-124" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 124</a>
<a href="#art-125" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 125</a>
<a href="#art-126" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 126</a>
<a href="#art-127" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 127</a>
<a href="#art-128" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 128</a>
<a href="#art-129" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 129</a>
<a href="#art-130" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 130</a>
<a href="#art-131" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 131</a>
<a href="#art-132" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 132</a>
<a href="#art-133" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 133</a>
<a href="#art-134" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 134</a>
<a href="#art-135" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 135</a>
<a href="#art-136" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 136</a>
<a href="#art-137" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 137</a>
<a href="#art-138" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 138</a>
<a href="#art-139" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 139</a>
<a href="#art-140" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 140</a>
<a href="#art-141" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 141</a>
<a href="#art-142" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 142</a>
<a href="#art-143" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 143</a>
<a href="#art-144" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 144</a>
<a href="#art-145" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 145</a>
<a href="#art-146" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 146</a>
<a href="#art-147" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 147</a>
<a href="#art-148" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 148</a>
<a href="#art-149" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 149</a>
<a href="#art-150" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 150</a>
<a href="#art-151" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 151</a>
<a href="#art-152" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 152</a>
<a href="#art-153" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 153</a>
<a href="#art-154" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 154</a>
<a href="#art-155" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 155</a>
<a href="#art-156" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 156</a>
<a href="#art-157" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 157</a>
<a href="#art-158" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 158</a>
<a href="#art-159" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 159</a>
<a href="#art-160" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 160</a>
<a href="#art-161" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 161</a>
<a href="#art-162" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 162</a>
<a href="#art-163" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 163</a>
<a href="#art-164" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 164</a>
<a href="#art-165" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 165</a>
<a href="#art-166" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 166</a>
<a href="#art-167" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 167</a>
<a href="#art-168" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 168</a>
<a href="#art-169" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 169</a>
<a href="#art-170" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 170</a>
<a href="#art-171" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 171</a>
<a href="#art-172" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 172</a>
<a href="#art-173" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 173</a>
<a href="#art-174" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 174</a>
<a href="#art-175" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 175</a>
<a href="#art-176" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 176</a>
<a href="#art-177" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 177</a>
<a href="#art-178" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 178</a>
<a href="#art-179" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 179</a>
<a href="#art-180" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 180</a>
<a href="#art-181" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 181</a>
<a href="#art-182" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 182</a>
<a href="#art-183" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 183</a>
<a href="#art-184" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 184</a>
<a href="#art-185" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 185</a>
<a href="#art-186" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 186</a>
<a href="#art-187" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 187</a>
<a href="#art-188" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 188</a>
<a href="#art-189" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 189</a>
<a href="#art-190" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 190</a>
<a href="#art-191" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 191</a>
<a href="#art-192" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 192</a>
<a href="#art-193" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 193</a>
<a href="#art-194" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 194</a>
<a href="#art-195" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 195</a>
<a href="#art-196" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 196</a>
<a href="#art-197" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 197</a>
<a href="#art-198" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 198</a>
<a href="#art-199" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 199</a>
<a href="#art-200" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 200</a>
<a href="#art-201" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 201</a>
<a href="#art-202" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 202</a>
<a href="#art-203" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 203</a>
<a href="#art-204" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 204</a>
<a href="#art-205" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 205</a>
<a href="#art-206" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 206</a>
<a href="#art-207" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 207</a>
<a href="#art-208" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 208</a>
<a href="#art-209" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 209</a>
<a href="#art-210" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 210</a>
<a href="#art-211" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 211</a>
<a href="#art-212" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 212</a>
<a href="#art-213" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 213</a>
<a href="#art-214" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 214</a>
<a href="#art-215" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 215</a>
<a href="#art-216" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 216</a>
<a href="#art-217" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 217</a>
</div>
<div id="art-1" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 1 — Σκοπός</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-2" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 2 — Αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-3" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 3 — Ορισμοί</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Β’<br>ΓΕΝΙΚΕΣ ΑΡΧΕΣ ΕΝΑΛΛΑΚΤΙΚΗΣ ΕΠΙΛΥΣΗΣ ΔΙΑΦΟΡΩΝ</p>
</div>
<div id="art-4" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 4 — Εφαρμογή και επικουρικότητα των γενικών αρχών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-5" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 5 — Αρχή της αυτονομίας και της καλής πίστης στην εναλλακτική επίλυση διαφορών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-6" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 6 — Αρχή της εμπιστευτικότητας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-7" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 7 — Αμεροληψία, ανεξαρτησία και ουδετερότητα</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-8" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 8 — Ίση μεταχείριση και προσαρμογή της διαδικασίας στις ιδιαιτερότητες της διαφοράς</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-9" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 9 — Εύλογη διάρκεια, αρχή της καταλληλότητας και οικονομία της διαδικασίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-10" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 10 — Ποιότητα και επαγγελματική επάρκεια</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-11" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 11 — Τεχνικοί σύμβουλοι και πραγματογνώμονες</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Γ’<br>ΑΡΧΕΣ ΣΥΣΧΕΤΙΣΗΣ ΜΕΘΟΔΩΝ ΕΝΑΛΛΑΚΤΙΚΗΣ ΕΠΙΛΥΣΗΣ ΔΙΑΦΟΡΩΝ</p>
</div>
<div id="art-12" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 12 — Γενικό πλαίσιο επιλογής μεθόδου εναλλακτικής επίλυσης διαφοράς</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-13" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 13 — Εξαιρέσεις λόγω φύσης της διαφοράς</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-14" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 14 — Συνδυασμός μεθόδων εναλλακτικής επίλυσης διαφορών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Δ’<br>ΥΠΟΧΡΕΩΤΙΚΗ ΠΡΟΔΙΚΑΣΤΙΚΗ ΠΡΟΣΦΥΓΗ ΣΕ ΕΝΑΛΛΑΚΤΙΚΗ ΕΠΙΛΥΣΗ ΔΙΑΦΟΡΩΝ</p>
</div>
<div id="art-15" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 15 — Υπαγόμενες διαφορές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-16" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 16 — Επιλογή μεθόδου εναλλακτικής επίλυσης διαφορών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-17" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 17 — Προδικαστική προσφυγή σε διαμεσολάβηση ή δικαστική μεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-18" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 18 — Χρηματική κύρωση για αποχή από εισαγωγική συνεδρία</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ε’<br>ΕΞΟΥΣΙΟΔΟΤΙΚΕΣ ΔΙΑΤΑΞΕΙΣ ΜΕΡΟΥΣ Α’</p>
</div>
<div id="art-19" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 19 — Εξουσιοδοτική διάταξη Μέρους Α’</h4>
<p style="font-size:0.9rem; line-height:1.6;">8074</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>Τεύχος A’ 168/16.10.2026</p><p>ΜΕΡΟΣ Β’<br>ΔΙΑΙΤΗΣΙΑ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΓΕΝΙΚΕΣ ΔΙΑΤΑΞΕΙΣ</p>
</div>
<div id="art-20" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 20 — Σκοπός</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-21" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 21 — Αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-22" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 22 — Πεδίο εφαρμογής (άρθρο 1 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-23" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 23 — Γενικές αρχές και ερμηνευτικοί κανόνες (άρθρα 2 και 2Α του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-24" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 24 — Γνωστοποιήσεις (άρθρο 3 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-25" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 25 — Παραίτηση από την προβολή αντιρρήσεων (άρθρο 4 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-26" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 26 — Έκταση εξουσίας δικαστηρίου (άρθρο 5 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διαιτησία)</p>
</div>
<div id="art-27" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 27 — Αρμοδιότητα των δικαστηρίων σε διαδικασίες αρωγής και εποπτείας της διαιτησίας (άρθρο 6</h4>
<p style="font-size:0.9rem; line-height:1.6;">του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)<br>ΚΕΦΑΛΑΙΟ Β’<br>ΣΥΜΦΩΝΙΑ ΔΙΑΙΤΗΣΙΑΣ</p>
</div>
<div id="art-28" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 28 — Τύπος της συμφωνίας διαιτησίας (άρθρο 7 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-29" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 29 — Ουσιαστικό κύρος της συμφωνίας διαιτησίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-30" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 30 — Συμφωνία διαιτησίας και άσκηση αγωγής (άρθρο 8 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-31" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 31 — Συμφωνία διαιτησίας και ασφαλιστικά μέτρα (άρθρο 9 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)<br>ΚΕΦΑΛΑΙΟ Γ’<br>ΣΥΓΚΡΟΤΗΣΗ ΔΙΑΙΤΗΤΙΚΟΥ ΔΙΚΑΣΤΗΡΙΟΥ ΚΑΙ ΕΥΘΥΝΗ ΔΙΑΙΤΗΤΩΝ</p>
</div>
<div id="art-32" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 32 — Αριθμός διαιτητών (άρθρο 10 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-33" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 33 — Ορισμός διαιτητών (άρθρο 11 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-34" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 34 — Πολυμερείς διαιτησίες</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-35" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 35 — Ορισμός διαιτητών από το δικαστήριο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-36" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 36 — Λόγοι εξαίρεσης (άρθρο 12 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-37" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 37 — Διαδικασία εξαίρεσης (άρθρο 13 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-38" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 38 — Παράλειψη ή αδυναμία εκπλήρωσης καθηκόντων διαιτητή (άρθρο 14 του Προτύπου Νόμου</h4>
<p style="font-size:0.9rem; line-height:1.6;">UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-39" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 39 — Ορισμός αντικαταστάτη διαιτητή (άρθρο 15 του Προτύπου Νόμου UNCITRAL για τη Διεθνή</h4>
<p style="font-size:0.9rem; line-height:1.6;">Εμπορική Διαιτησία)</p>
</div>
<div id="art-40" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 40 — Ευθύνη διαιτητών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Δ’<br>ΔΙΚΑΙΟΔΟΣΙΑ ΔΙΑΙΤΗΤΙΚΟΥ ΔΙΚΑΣΤΗΡΙΟΥ</p>
</div>
<div id="art-41" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 41 — Εξουσία του διαιτητικού δικαστηρίου να αποφαίνεται για τη δικαιοδοσία του (άρθρο 16 του</h4>
<p style="font-size:0.9rem; line-height:1.6;">Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-42" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 42 — Πρόσθετοι διάδικοι και συνένωση διαιτησιών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-43" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 43 — Εξουσία διαιτητικού δικαστηρίου να διατάξει ασφαλιστικά μέτρα (άρθρα 17, 17A, 17B, 17C, 17D,</h4>
<p style="font-size:0.9rem; line-height:1.6;">17E, 17G, 17H, 17I του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)<br>ΚΕΦΑΛΑΙΟ Ε’<br>ΔΙΕΞΑΓΩΓΗ ΤΗΣ ΔΙΑΙΤΗΤΙΚΗΣ ΔΙΑΔΙΚΑΣΙΑΣ</p>
</div>
<div id="art-44" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 44 — Ίση μεταχείριση και δικαίωμα ακρόασης (άρθρο 18 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-45" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 45 — Καθορισμός των διαδικαστικών κανόνων (άρθρο 19 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-46" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 46 — Τόπος της διαιτησίας (άρθρο 20 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;">Τεύχος A’ 168/16.10.2026</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>8075</p>
</div>
<div id="art-47" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 47 — Έναρξη της διαιτησίας (άρθρο 21 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-48" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 48 — Γλώσσα (άρθρο 22 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-49" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 49 — Δικόγραφο αγωγής και δικόγραφο απάντησης στην αγωγή (άρθρο 23 του Προτύπου Νόμου</h4>
<p style="font-size:0.9rem; line-height:1.6;">UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-50" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 50 — Ακροαματική και γραπτή διαδικασία (άρθρο 24 του Προτύπου Νόμου UNCITRAL για τη Διεθνή</h4>
<p style="font-size:0.9rem; line-height:1.6;">Εμπορική Διαιτησία)</p>
</div>
<div id="art-51" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 51 — Ερημοδικία (άρθρο 25 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ ΣΤ’<br>ΑΠΟΔΕΙΞΕΙΣ</p>
</div>
<div id="art-52" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 52 — Διορισμός πραγματογνώμονα από το διαιτητικό δικαστήριο (άρθρο 26 του Προτύπου Νόμου</h4>
<p style="font-size:0.9rem; line-height:1.6;">UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-53" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 53 — Επίδειξη εγγράφων και προσκομιδή αποδείξεων</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-54" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 54 — Δικαστική συνδρομή κατά τη διεξαγωγή των αποδείξεων (άρθρο 27 του Προτύπου Νόμου</h4>
<p style="font-size:0.9rem; line-height:1.6;">UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-55" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 55 — Προδικαστικό ερώτημα για την ερμηνεία διατάξεων του ενωσιακού δικαίου</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ζ’<br>ΔΙΑΙΤΗΤΙΚΗ ΑΠΟΦΑΣΗ ΚΑΙ ΠΕΡΑΤΩΣΗ ΤΗΣ ΔΙΑΙΤΗΣΙΑΣ</p>
</div>
<div id="art-56" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 56 — Εφαρμοστέο δίκαιο στην ουσία της διαφοράς (άρθρο 28 του Προτύπου Νόμου UNCITRAL για</h4>
<p style="font-size:0.9rem; line-height:1.6;">τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-57" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 57 — Απόφαση από περισσότερους διαιτητές (άρθρο 29 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-58" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 58 — Συμβιβασμός (άρθρο 30 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-59" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 59 — Μορφή και περιεχόμενο της διαιτητικής απόφασης (άρθρο 31 του Προτύπου Νόμου UNCITRAL</h4>
<p style="font-size:0.9rem; line-height:1.6;">για τη Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-60" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 60 — Περάτωση της διαιτησίας, αμοιβή και έξοδα (άρθρο 32 του Προτύπου Νόμου UNCITRAL για τη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Διεθνή Εμπορική Διαιτησία)</p>
</div>
<div id="art-61" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 61 — Διόρθωση, ερμηνεία της διαιτητικής απόφασης και έκδοση συμπληρωματικής διαιτητικής απόφασης (άρθρο 33 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Η’<br>ΑΚΥΡΩΤΙΚΟΣ ΕΛΕΓΧΟΣ, ΑΝΑΓΝΩΡΙΣΗ ΚΑΙ ΕΚΤΕΛΕΣΗ ΔΙΑΙΤΗΤΙΚΩΝ ΑΠΟΦΑΣΕΩΝ</p>
</div>
<div id="art-62" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 62 — Αγωγή ακύρωσης (άρθρο 34 του Προτύπου Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-63" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 63 — Δεδικασμένο και εκτελεστότητα</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-64" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 64 — Αναγνώριση και εκτέλεση αλλοδαπών διαιτητικών αποφάσεων (άρθρα 35 και 36 του Προτύπου</h4>
<p style="font-size:0.9rem; line-height:1.6;">Νόμου UNCITRAL για τη Διεθνή Εμπορική Διαιτησία)<br>ΚΕΦΑΛΑΙΟ Θ’<br>ΘΕΣΜΙΚΗ ΔΙΑΙΤΗΣΙΑ</p>
</div>
<div id="art-65" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 65 — Λειτουργία οργανισμών θεσμικής διαιτησίας</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ι’<br>ΧΡΗΜΑΤΟΔΟΤΗΣΗ ΑΠΟ ΤΡΙΤΟ</p>
</div>
<div id="art-66" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 66 — Πεδίο εφαρμογής - Αρχές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-67" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 67 — Υποχρέωση γνωστοποίησης συμφωνίας χρηματοδότησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-68" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 68 — Συγκρούσεις συμφερόντων - Υποχρεώσεις διαιτητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-69" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 69 — Επίδειξη στοιχείων της συμφωνίας χρηματοδότησης - Προστασία εμπιστευτικότητας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-70" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 70 — Εγγυοδοσία για τη δαπάνη της διαιτησίας</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ ΙΑ’<br>ΕΞΟΥΣΙΟΔΟΤΙΚΕΣ ΚΑΙ ΜΕΤΑΒΑΤΙΚΕΣ ΔΙΑΤΑΞΕΙΣ ΜΕΡΟΥΣ Β’</p>
</div>
<div id="art-71" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 71 — Εξουσιοδοτικές διατάξεις Μέρους Β’</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-72" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 72 — Μεταβατικές διατάξεις Μέρους Β’</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Γ’<br>ΔΙΑΜΕΣΟΛΑΒΗΣΗ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΓΕΝΙΚΕΣ ΔΙΑΤΑΞΕΙΣ</p>
</div>
<div id="art-73" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 73 — Σκοπός</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-74" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 74 — Αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-75" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 75 — Πεδίο εφαρμογής - Υπαγόμενες διαφορές</h4>
<p style="font-size:0.9rem; line-height:1.6;">8076</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>Τεύχος A’ 168/16.10.2026</p><p>ΚΕΦΑΛΑΙΟ Β’<br>ΕΝΑΛΛΑΚΤΙΚΗ ΕΠΙΛΥΣΗ ΔΙΑΦΟΡΑΣ ΜΕ ΔΙΑΜΕΣΟΛΑΒΗΣΗ</p>
</div>
<div id="art-76" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 76 — Προσφυγή στη διαμεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-77" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 77 — Διαδικασία διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-78" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 78 — Εισαγωγική συνεδρία διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-79" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 79 — Διαδικασία της εισαγωγικής συνεδρίας διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-80" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 80 — Πρόταση επίλυσης διαμεσολαβητή</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-81" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 81 — Σύνταξη και περιεχόμενο πρακτικού διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-82" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 82 — Έννομες συνέπειες και εκτελεστότητα των συμφωνιών που προκύπτουν από τη διαμεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-83" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 83 — Ανάρτηση του πρακτικού διαμεσολάβησης μέσω της Ενιαίας Ψηφιακής Πύλης Διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-84" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 84 — Αποτελέσματα της διαμεσολάβησης στην παραγραφή, την αποσβεστική προθεσμία και τις</h4>
<p style="font-size:0.9rem; line-height:1.6;">δικονομικές προθεσμίες</p>
</div>
<div id="art-85" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 85 — Ρήτρα διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-86" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 86 — Υπεύθυνος διαχείρισης διαδικασίας διαμεσολάβησης νομικού προσώπου</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-87" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 87 — Σύγκρουση συμφερόντων</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Γ’<br>ΜΕΤΡΑ ΓΙΑ ΤΗΝ ΠΡΟΩΘΗΣΗ ΤΗΣ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</p>
</div>
<div id="art-88" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 88 — Επιμερισμός εξόδων σε περίπτωση απόρριψης πρότασης εναλλακτικής επίλυσης της διαφοράς</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-89" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 89 — Φορολογικές απαλλαγές και οικονομικά κίνητρα διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Δ’<br>ΕΙΔΙΚΕΣ ΜΟΡΦΕΣ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</p>
</div>
<div id="art-90" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 90 — Ισχύς γενικών αρχών και διατάξεων</h4>
<p style="font-size:0.9rem; line-height:1.6;">Υποκεφάλαιο Α’<br>Οικογενειακή διαμεσολάβηση</p>
</div>
<div id="art-91" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 91 — Υπαγόμενες διαφορές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-92" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 92 — Ειδικές αρχές οικογενειακής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-93" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 93 — Διεξαγωγή της διαδικασίας οικογενειακής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-94" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 94 — Αυτοτελής κατ’ ιδίαν συνεδρία με ανήλικο τέκνο («Φωνή του Παιδιού»)</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-95" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 95 — Συνέπειες παράβασης του πρακτικού διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;">Υποκεφάλαιο Β’<br>Κτηματολογική διαμεσολάβηση</p>
</div>
<div id="art-96" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 96 — Υπαγόμενες διαφορές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-97" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 97 — Ειδικές αρχές κτηματολογικής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-98" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 98 — Διεξαγωγή της διαδικασίας κτηματολογικής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-99" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 99 — Ειδικές ρυθμίσεις για τη συμμετοχή του Δημοσίου, των Οργανισμών Τοπικής Αυτοδιοίκησης και</h4>
<p style="font-size:0.9rem; line-height:1.6;">των νομικών προσώπων δημοσίου δικαίου</p>
</div>
<div id="art-100" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 100 — Πρακτικό διαμεσολάβησης και καταχώριση στο κτηματολογικό φύλλο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-101" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 101 — Αναγνώριση κυριότητας λόγω έκτακτης χρησικτησίας επί ακινήτων αγνώστου ιδιοκτήτη</h4>
<p style="font-size:0.9rem; line-height:1.6;">Υποκεφάλαιο Γ’<br>Σχολική διαμεσολάβηση</p>
</div>
<div id="art-102" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 102 — Σκοπός και αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-103" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 103 — Ομάδα μαθητών - διαμεσολαβητών και Συντονιστής</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-104" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 104 — Αρμοδιότητες Συντονιστή</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-105" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 105 — Βασικές αρχές σχολικής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-106" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 106 — Έναρξη της διαδικασίας και καταλληλότητα</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-107" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 107 — Διεξαγωγή της διαδικασίας σχολικής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-108" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 108 — Έγγραφο συμφωνίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-109" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 109 — Εκπαίδευση στη σχολική διαμεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-110" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 110 — Υποχρεώσεις σχολικής μονάδας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-111" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 111 — Ενημέρωση γονέων και τοπικής κοινότητας</h4>
<p style="font-size:0.9rem; line-height:1.6;">Υποκεφάλαιο Δ’<br>Πανεπιστημιακή διαμεσολάβηση</p>
</div>
<div id="art-112" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 112 — Σκοπός και αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-113" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 113 — Υπαγόμενες διαφορές</h4>
<p style="font-size:0.9rem; line-height:1.6;">Τεύχος A’ 168/16.10.2026</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>8077</p>
</div>
<div id="art-114" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 114 — Αρχές της διαδικασίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-115" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 115 — Εκπαίδευση φοιτητών - διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-116" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 116 — Συντονιστής</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-117" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 117 — Διεξαγωγή της διαδικασίας πανεπιστημιακής διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-118" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 118 — Έγγραφο συμφωνίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-119" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 119 — Θεσμική οργάνωση</h4>
<p style="font-size:0.9rem; line-height:1.6;">Υποκεφάλαιο Ε’<br>Εμπορική διαμεσολάβηση</p>
</div>
<div id="art-120" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 120 — Σκοπός και αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-121" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 121 — Θεσμική εμπορική διαμεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-122" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 122 — Επιλογή διαμεσολαβητή</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ε’<br>ΑΝΑΛΗΨΗ ΥΠΟΘΕΣΕΩΝ ΑΠΟ ΔΙΑΜΕΣΟΛΑΒΗΤΕΣ - ΑΜΟΙΒΕΣ ΔΙΑΜΕΣΟΛΑΒΗΤΩΝ ΚΑΙ ΝΟΜΙΚΩΝ ΠΑΡΑΣΤΑΤΩΝ</p>
</div>
<div id="art-123" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 123 — Ανάθεση υποθέσεων διαμεσολάβησης - Διαβάθμιση διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-124" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 124 — Αποβολή διαμεσολαβητή από τη σειρά διορισμού λόγω αδράνειας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-125" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 125 — Αμοιβή διαμεσολαβητή</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-126" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 126 — Αμοιβή νομικών παραστατών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ ΣΤ’<br>ΚΕΝΤΡΙΚΗ ΕΠΙΤΡΟΠΗ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ - ΜΗΤΡΩΑ ΔΙΑΜΕΣΟΛΑΒΗΤΩΝ</p>
</div>
<div id="art-127" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 127 — Κεντρική Επιτροπή Διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-128" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 128 — Αρμοδιότητες Κεντρικής Επιτροπής Διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-129" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 129 — Ειδικές Επιτροπές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-130" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 130 — Μητρώα Διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-131" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 131 — Μητρώο Εκπαιδευτών Διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ζ’<br>ΕΚΠΑΙΔΕΥΣΗ ΚΑΙ ΔΙΟΡΙΣΜΟΣ ΔΙΑΜΕΣΟΛΑΒΗΤΩΝ - ΠΕΙΘΑΡΧΙΚΕΣ ΚΑΙ ΕΙΔΙΚΕΣ ΡΥΘΜΙΣΕΙΣ ΓΙΑ ΤΗΝ ΑΣΚΗΣΗ<br>ΤΟΥ ΛΕΙΤΟΥΡΓΗΜΑΤΟΣ ΤΟΥ ΔΙΑΜΕΣΟΛΑΒΗΤΗ</p>
</div>
<div id="art-132" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 132 — Προσόντα διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-133" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 133 — Διαβάθμιση και επαγγελματική εξέλιξη διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-134" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 134 — Γενικές αρχές πειθαρχικού δικαίου διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-135" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 135 — Πειθαρχικά όργανα</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-136" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 136 — Πειθαρχικά παραπτώματα</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-137" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 137 — Παραγραφή</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-138" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 138 — Πειθαρχικές ποινές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-139" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 139 — Συνέπειες ανάκλησης διαπίστευσης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-140" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 140 — Διαφάνεια και πρόληψη</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-141" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 141 — Παραίτηση - Αναστολή άσκησης καθηκόντων διαμεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-142" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 142 — Έκθεση πεπραγμένων διαμεσολαβητή</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-143" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 143 — Ενώσεις προσώπων διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Η’<br>ΚΑΤΑΡΤΙΣΗ ΚΑΙ ΣΥΝΕΧΗΣ ΕΠΙΜΟΡΦΩΣΗ ΔΙΑΜΕΣΟΛΑΒΗΤΩΝ</p>
</div>
<div id="art-144" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 144 — Υποψήφιοι διαμεσολαβητές</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-145" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 145 — Φορείς Κατάρτισης Διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-146" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 146 — Εκπαιδευτές διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-147" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 147 — Αδειοδότηση Φορέων Κατάρτισης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-148" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 148 — Αδειοδότηση φυσικών προσώπων</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-149" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 149 — Αδειοδότηση νομικών προσώπων</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-150" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 150 — Πρόγραμμα σπουδών - Πρόγραμμα βασικής εκπαίδευσης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-151" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 151 — Μετεκπαίδευση διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-152" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 152 — Προγράμματα καθοδήγησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-153" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 153 — Διαπίστευση διαμεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Θ’<br>ΕΞΟΥΣΙΟΔΟΤΙΚΕΣ, ΜΕΤΑΒΑΤΙΚΕΣ ΚΑΙ ΤΕΛΙΚΕΣ ΔΙΑΤΑΞΕΙΣ ΜΕΡΟΥΣ Γ’</p><p>8078</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>Τεύχος A’ 168/16.10.2026</p>
</div>
<div id="art-154" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 154 — Εξουσιοδοτικές διατάξεις Μέρους Γ’</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-155" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 155 — Μεταβατικές διατάξεις Μέρους Γ’</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-156" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 156 — Τελικές διατάξεις Μέρους Γ’</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Δ’<br>ΔΙΚΑΣΤΙΚΗ ΜΕΣΟΛΑΒΗΣΗ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΓΕΝΙΚΕΣ ΔΙΑΤΑΞΕΙΣ</p>
</div>
<div id="art-157" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 157 — Σκοπός</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-158" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 158 — Αντικείμενο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-159" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 159 — Υπαγόμενες διαφορές και τρόποι υπαγωγής στη δικαστική μεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-160" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 160 — Ρήτρα δικαστικής μεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Β’<br>ΔΙΑΔΙΚΑΣΙΑ ΔΙΚΑΣΤΙΚΗΣ ΜΕΣΟΛΑΒΗΣΗΣ</p>
</div>
<div id="art-161" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 161 — Αίτηση εισαγωγής σε δικαστική μεσολάβηση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-162" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 162 — Εισαγωγική συνεδρία δικαστικής μεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-163" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 163 — Διεξαγωγή της διαδικασίας δικαστικής μεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-164" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 164 — Πρόταση επίλυσης δικαστή - μεσολαβητή</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-165" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 165 — Αποτελέσματα της δικαστικής μεσολάβησης στην παραγραφή και τις αποσβεστικές προθεσμίες</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-166" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 166 — Εμπιστευτικότητα της διαδικασίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-167" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 167 — Συμμετοχή τρίτων</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-168" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 168 — Εξαίρεση και αποκλεισμός δικαστών - μεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Γ’<br>ΠΡΑΚΤΙΚΟ ΔΙΚΑΣΤΙΚΗΣ ΜΕΣΟΛΑΒΗΣΗΣ ΚΑΙ ΕΝΝΟΜΕΣ ΣΥΝΕΠΕΙΕΣ</p>
</div>
<div id="art-169" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 169 — Πρακτικό δικαστικής μεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-170" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 170 — Ισχύς και εκτελεστότητα πρακτικού δικαστικής μεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Δ’<br>ΟΡΓΑΝΩΤΙΚΕΣ ΔΙΑΤΑΞΕΙΣ</p>
</div>
<div id="art-171" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 171 — Ορισμός δικαστών - μεσολαβητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-172" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 172 — Γραφεία Δικαστικής Μεσολάβησης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-173" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 173 — Αμοιβές νομικών παραστατών</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ε’<br>ΕΞΟΥΣΙΟΔΟΤΙΚΕΣ ΚΑΙ ΜΕΤΑΒΑΤΙΚΕΣ ΔΙΑΤΑΞΕΙΣ ΜΕΡΟΥΣ Δ’</p>
</div>
<div id="art-174" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 174 — Εξουσιοδοτικές διατάξεις Μέρους Δ’</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-175" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 175 — Μεταβατικές διατάξεις Μέρους Δ’</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Ε’<br>ΤΡΟΠΟΠΟΙΗΣΕΙΣ ΣΕ ΕΙΔΙΚΑ ΝΟΜΟΘΕΤΗΜΑΤΑ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΤΡΟΠΟΠΟΙΗΣΕΙΣ ΔΙΑΤΑΞΕΩΝ ΤΟΥ ΑΣΤΙΚΟΥ ΚΩΔΙΚΑ</p>
</div>
<div id="art-176" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 176 — Παραπομπή σε διαμεσολάβηση ή δικαστική μεσολάβηση σε υποθέσεις παρέκκλισης από την</h4>
<p style="font-size:0.9rem; line-height:1.6;">από κοινού άσκηση της γονικής μέριμνας - Τροποποίηση άρθρου 1514 Αστικού Κώδικα<br>ΚΕΦΑΛΑΙΟ Β’<br>ΠΑΡΑΒΙΑΣΗ ΟΡΩΝ ΠΡΑΚΤΙΚΩΝ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</p>
</div>
<div id="art-177" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 177 — Παραβίαση όρων πρακτικών διαμεσολάβησης - Τροποποίηση άρθρου 169Α Ποινικού Κώδικα</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Γ’<br>ΔΙΚΟΝΟΜΙΚΕΣ ΡΥΘΜΙΣΕΙΣ ΓΙΑ ΤΗ ΔΙΑΜΕΣΟΛΑΒΗΣΗ</p>
</div>
<div id="art-178" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 178 — Δυνατότητα προσφυγής σε διαμεσολάβηση ή δικαστική μεσολάβηση - Τροποποίηση παρ. 2</h4>
<p style="font-size:0.9rem; line-height:1.6;">άρθρου 215 Κώδικα Πολιτικής Δικονομίας</p>
</div>
<div id="art-179" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 179 — Τυπικές παραλείψεις κατά την εισαγωγή της αγωγής για συζήτηση - Τροποποίηση παρ. 1 άρθρου</h4>
<p style="font-size:0.9rem; line-height:1.6;">227 Κώδικα Πολιτικής Δικονομίας</p>
</div>
<div id="art-180" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 180 — Παραπομπή με διάταξη σε διαμεσολάβηση και δικαστική μεσολάβηση και απόσυρση - Τροποποίηση άρθρου 237 Κώδικα Πολιτικής Δικονομίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-181" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 181 — Αναψηλάφηση λόγω μη προσήκουσας διερεύνησης απαγορευμένης κρατικής ενίσχυσης Τροποποίηση περ. 12) άρθρου 544 Κώδικα Πολιτικής Δικονομίας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-182" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 182 — Παραπομπή των διαδίκων σε διαμεσολάβηση ή δικαστική μεσολάβηση με προδικαστική απόφαση - Προσθήκη παρ. 4Α στο άρθρο 591 του Κώδικα Πολιτικής Δικονομίας</h4>
<p style="font-size:0.9rem; line-height:1.6;">Τεύχος A’ 168/16.10.2026</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>8079</p>
</div>
<div id="art-183" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 183 — Ορισμός των πρακτικών διαμεσολάβησης και δικαστικής μεσολάβησης ως εκτελεστών τίτλων Τροποποίηση περ. γ) παρ. 2 άρθρου 904 Κώδικα Πολιτικής Δικονομίας</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Δ’<br>ΑΡΜΟΔΙΟΤΗΤΕΣ ΤΟΥ ΝΟΜΙΚΟΥ ΣΥΜΒΟΥΛΙΟΥ ΤΟΥ ΚΡΑΤΟΥΣ ΣΕ ΘΕΜΑΤΑ ΔΙΑΙΤΗΣΙΑΣ</p>
</div>
<div id="art-184" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 184 — Καθορισμός αρμοδιοτήτων σχετικά με διαιτησίες που συμμετέχει το Νομικό Συμβούλιο του</h4>
<p style="font-size:0.9rem; line-height:1.6;">Κράτους - Τροποποίηση άρθρου 7 ν. 4831/2021</p>
</div>
<div id="art-185" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 185 — Πρόβλεψη για ρήτρα εθνικής θεσμικής διαιτησίας - Τροποποίηση άρθρου 16 ν. 4831/2021</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Ε’<br>ΕΙΔΙΚΕΣ ΡΥΘΜΙΣΕΙΣ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ ΚΑΙ ΔΙΑΙΤΗΣΙΑΣ</p>
</div>
<div id="art-186" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 186 — Κτηματολογική διαμεσολάβηση - Τροποποίηση περ. δ) και δα) παρ. 2 άρθρου 6 ν. 2664/1998</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-187" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 187 — Νομική βοήθεια σε διαμεσολάβηση - Προσθήκη παρ. 2Α στο άρθρο 1 του ν. 3226/2004</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-188" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 188 — Διαιτητική επίλυση διαφορών από δημόσιες συμβάσεις - Τροποποίηση άρθρου 176 ν. 4412/2016</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ ΣΤ’<br>ΚΕΝΤΡΑ ΕΝΑΛΛΑΚΤΙΚΗΣ ΕΠΙΛΥΣΗΣ ΔΙΑΦΟΡΩΝ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΙΔΡΥΣΗ ΚΑΙ ΛΕΙΤΟΥΡΓΙΑ ΚΕΝΤΡΟΥ ΕΝΑΛΛΑΚΤΙΚΗΣ ΕΠΙΛΥΣΗΣ ΔΙΑΦΟΡΩΝ ΟΡΕΣΤΙΑΔΑΣ</p>
</div>
<div id="art-189" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 189 — Σύσταση - Επωνυμία - Νομική Φύση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-190" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 190 — Αποστολή - Σκοπός</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-191" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 191 — Αρμοδιότητες - Δράσεις</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-192" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 192 — Σχέση με το Δημοκρίτειο Πανεπιστήμιο Θράκης</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-193" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 193 — Σχέση με τον Δικηγορικό Σύλλογο Ορεστιάδας</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-194" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 194 — Όργανα διοίκησης - Διοικητικό Συμβούλιο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-195" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 195 — Γενικός Διευθυντής - Επιστημονικό Συμβούλιο</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-196" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 196 — Προσωπικό - συνεργάτες - συμμετοχή επιστημόνων και φοιτητών</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-197" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 197 — Συνεργασίες - Δικτύωση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-198" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 198 — Πόροι - Οικονομική διαχείριση</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-199" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 199 — Εσωτερικός Κανονισμός</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Β’<br>ΕΞΟΥΣΙΟΔΟΤΙΚΕΣ, ΜΕΤΑΒΑΤΙΚΕΣ ΚΑΙ ΤΕΛΙΚΕΣ ΔΙΑΤΑΞΕΙΣ ΜΕΡΟΥΣ ΣΤ’</p>
</div>
<div id="art-200" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 200 — Εξουσιοδοτικές διατάξεις Μέρους ΣΤ’</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-201" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 201 — Μεταβατικές διατάξεις</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-202" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 202 — Τελική διάταξη</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Ζ’<br>ΛΟΙΠΕΣ ΡΥΘΜΙΣΕΙΣ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΣΤΕΛΕΧΩΣΗ ΥΠΗΡΕΣΙΩΝ ΚΑΙ ΦΟΡΕΩΝ ΤΟΥ ΥΠΟΥΡΓΕΙΟΥ ΔΙΚΑΙΟΣΥΝΗΣ</p>
</div>
<div id="art-203" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 203 — Αύξηση οργανικών θέσεων Υπουργείου Δικαιοσύνης και Εταιρειών Προστασίας Ανηλίκων</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-204" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 204 — Διαδικασία πλήρωσης θέσεων προσωπικού αυτοτελών γραφείων Προστασίας Ανηλίκων Θυμάτων «Σπίτι του Παιδιού», Υπηρεσιών Επιμελητών Ανηλίκων και Κοινωνικής Αρωγής Υπουργείου Δικαιοσύνης</h4>
<p style="font-size:0.9rem; line-height:1.6;">και Εταιρειών Προστασίας Ανηλίκων</p>
</div>
<div id="art-205" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 205 — Διαδικασία πλήρωσης θέσεων προσωπικού των Ιατροδικαστικών Υπηρεσιών του Υπουργείου</h4>
<p style="font-size:0.9rem; line-height:1.6;">Δικαιοσύνης - Προσθήκη άρθρου 4Β στον ν. 3772/2009<br>ΚΕΦΑΛΑΙΟ Β’<br>ΜΙΣΘΟΛΟΓΙΚΕΣ ΡΥΘΜΙΣΕΙΣ ΔΙΚΑΣΤΙΚΩΝ ΥΠΑΛΛΗΛΩΝ</p>
</div>
<div id="art-206" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 206 — Επίδομα ειδικών συνθηκών άσκησης δικαστικού έργου</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΚΕΦΑΛΑΙΟ Γ’<br>ΡΥΘΜΙΣΕΙΣ ΓΙΑ ΤΙΣ ΔΙΑΚΕΚΡΙΜΕΝΕΣ ΜΟΡΦΕΣ ΑΠΑΤΗΣ ΚΑΙ ΤΗΝ ΑΥΤΟΦΩΡΗ ΔΙΑΔΙΚΑΣΙΑ</p>
</div>
<div id="art-207" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 207 — Κακουργηματικές μορφές απάτης και απάτης με υπολογιστή - Τροποποίηση παρ. 1 άρθρου</h4>
<p style="font-size:0.9rem; line-height:1.6;">386 και παρ. 1 άρθρου 386Α Ποινικού Κώδικα</p>
</div>
<div id="art-208" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 208 — Παρέκκλιση από την αυτόφωρη διαδικασία επί εγκλημάτων εμπρησμού - Προσθήκη παρ. 5</h4>
<p style="font-size:0.9rem; line-height:1.6;">στο άρθρο 92Α του ν. 4662/2020</p>
</div>
<div id="art-209" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 209 — Παρέκκλιση από την αυτόφωρη διαδικασία κατά διδακτικού προσωπικού της πρωτοβάθμιας</h4>
<p style="font-size:0.9rem; line-height:1.6;">και δευτεροβάθμιας εκπαίδευσης - Προσθήκη άρθρου 14Α στον ν. 1566/1985<br>ΚΕΦΑΛΑΙΟ Δ’<br>ΛΟΙΠΕΣ ΔΙΑΤΑΞΕΙΣ</p><p>E</p><p>ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ</p><p>8080</p><p>Τεύχος A’ 168/16.10.2026</p>
</div>
<div id="art-210" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 210 — Σύντμηση του χρόνου πρακτικής άσκησης για τους σπουδαστές της κατεύθυνσης των πολιτικών και ποινικών δικαστικών λειτουργών της Εθνικής Σχολής Δικαστικών Λειτουργών της 32ης εκπαιδευτικής</h4>
<p style="font-size:0.9rem; line-height:1.6;">σειράς και του χρόνου πραγματικής υπηρεσίας δόκιμου δικαστικού λειτουργού</p>
</div>
<div id="art-211" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 211 — Διεύρυνση δυνατότητας ορισμού Προέδρου Εταιρείας Προστασίας Ανηλίκων - Τροποποίηση</h4>
<p style="font-size:0.9rem; line-height:1.6;">περ. α) παρ. 3 άρθρου 18 ν. 2298/1995</p>
</div>
<div id="art-212" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 212 — Αντιμετώπιση έκτακτων μεταναστευτικών ροών στον Δήμο Ηρακλείου Κρήτης και επιτάχυνση</h4>
<p style="font-size:0.9rem; line-height:1.6;">διαδικασιών εγκατάστασης και λειτουργίας της δομής της παρ. 4 άρθρου 8 ν. 4375/2016</p>
</div>
<div id="art-213" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 213 — Επιδότηση αμόλυβδης βενζίνης - Εξουσιοδοτική διάταξη - Τροποποίηση άρθρου δεύτερου και</h4>
<p style="font-size:0.9rem; line-height:1.6;">πέμπτου της από 25.3.2026 Πράξης Νομοθετικού Περιεχομένου<br>ΚΕΦΑΛΑΙΟ Ε’<br>ΕΞΟΥΣΙΟΔΟΤΙΚΕΣ ΚΑΙ ΜΕΤΑΒΑΤΙΚΕΣ ΔΙΑΤΑΞΕΙΣ</p>
</div>
<div id="art-214" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 214 — Εξουσιοδοτικές διατάξεις</h4>
<p style="font-size:0.9rem; line-height:1.6;"></p>
</div>
<div id="art-215" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 215 — Μεταβατικές διατάξεις</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Η’<br>ΚΑΤΑΡΓΟΥΜΕΝΕΣ ΔΙΑΤΑΞΕΙΣ</p>
</div>
<div id="art-216" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 216 — Καταργούμενες διατάξεις</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Θ’<br>ΕΝΑΡΞΗ ΙΣΧΥΟΣ</p>
</div>
<div id="art-217" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 217 — Έναρξη ισχύος</h4>
<p style="font-size:0.9rem; line-height:1.6;">ΜΕΡΟΣ Α’<br>ΓΕΝΙΚΕΣ ΔΙΑΤΑΞΕΙΣ<br>ΚΕΦΑΛΑΙΟ Α’<br>ΣΚΟΠΟΣ, ΑΝΤΙΚΕΙΜΕΝΟ ΚΑΙ ΟΡΙΣΜΟΙ</p>
</div>`,

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

    law_5142: `<h3>🏠 Ν. 5142/2024 — Ολοκλήρωση Κτηματογράφησης & Τεχνητή Νοημοσύνη</h3>
    <p>Ο Ν. 5142/2024 (ΦΕΚ Α' 158/4.10.2024) εισάγει σημαντικές καινοτομίες στο κτηματολογικό σύστημα με τίτλο «Ολοκλήρωση της κτηματογράφησης, απλοποίηση διαδικασιών, χρήση τεχνητής νοημοσύνης και διατάξεις για τη λειτουργία του ΝΠΔΔ «Ελληνικό Κτηματολόγιο».</p>

    <h4>Α. Ολοκλήρωση Κτηματογράφησης έως το 2025</h4>
    <ul>
        <li>Στόχος: μετάβαση <b>του συνόλου της χώρας</b> σε καθεστώς λειτουργούντος Κτηματολογίου εντός του 2025</li>
        <li><b>Άρθρο 3:</b> Προσθήκη άρθρου 11Α στον ν. 2308/1995 — ολοκλήρωση ένταξης Επικράτειας σε λειτουργούν Κτηματολόγιο χωρίς υποχρεωτική ολοκλήρωση όλης της διαδικασίας ανάρτησης</li>
        <li><b>Άρθρο 4:</b> Προσθήκη άρθρου 12Α — διεκπεραίωση εκκρεμών κτηματογραφήσεων εντός ήδη λειτουργούντος Κτηματολογίου</li>
        <li>Διευκόλυνση ΟΤΑ στην υποβολή δηλώσεων κτηματογράφησης</li>
    </ul>

    <h4>Β. Τεχνητή Νοημοσύνη στον Νομικό Έλεγχο (Άρθρο 11)</h4>
    <div class="highlight-box" style="background:#eff6ff; border-left-color:#2563eb;">
        <b>🤖 Άρθρο 11 — Εισήγηση νομικού ελέγχου με ΤΝ</b><br><br>
        Καθιερώνεται η χρήση συστήματος Τεχνητής Νοημοσύνης για:<br>
        → Τον <b>νομικό έλεγχο εγγραπτέων πράξεων</b> (έλεγχος συνδρομής προϋποθέσεων καταχώρισης)<br>
        → Την <b>κατάρτιση εισηγήσεων</b> προς τα αρμόδια όργανα του Κτηματολογίου<br><br>
        <i>Σημασία:</i> Η ΤΝ δεν αποφασίζει — εισηγείται. Η τελική απόφαση παραμένει στον ΠρΚΓ. Μειώνει τον χρόνο ελέγχου και τυπικά λάθη.
    </div>

    <h4>Γ. 24ωρη Ψηφιακή Υποβολή Πράξεων (Άρθρο 12)</h4>
    <p>Τροποποίηση παρ. 1 άρθρου 14 ν. 2664/1998: Καθιερώνεται <b>δυνατότητα 24ωρης ψηφιακής υποβολής</b> πράξεων στο ΝΠΔΔ «Ελληνικό Κτηματολόγιο» — εκτός ωραρίου γραφείου.</p>

    <h4>Δ. Διόρθωση Πρόδηλων Σφαλμάτων — Τροποποίηση άρθρου 18 (Άρθρο 13)</h4>
    <p>Τροποποίηση υποπερ. αα) περ. β) παρ. 1 άρθρου 18 ν. 2664/1998: Επέκταση των περιπτώσεων πρόδηλου σφάλματος αρχικής εγγραφής που μπορεί να διορθωθεί εξωδικαστικά.</p>

    <h4>Ε. Δασικά Ακίνητα — Εξωδικαστική Λύση (Άρθρο 15)</h4>
    <div class="highlight-box" style="background:#f0fdf4; border-left-color:#059669;">
        <b>🌲 Άρθρο 15 — Διόρθωση εγγραφής Δημοσίου λόγω δασικού χάρτη</b><br><br>
        Προσθήκη παρ. 5 στο άρθρο 19 ν. 2664/1998:<br>
        Για ακίνητα που εγγράφηκαν ως «Ελληνικό Δημόσιο» αποκλειστικά λόγω δασικού τεκμηρίου, αλλά <b>έχει γίνει δεκτή αντίρρηση κατά του δασικού χάρτη</b> (ΕπΕξ.Αντ.) ή βρίσκονται σε εξαιρούμενες περιοχές ή υφίσταται παραχωρητήριο → ο ΠρΚΓ διορθώνει <b>αυτεπαγγέλτως</b> χωρίς δίκη.<br><br>
        <i>Αυτό είναι η «εξωδικαστική λύση για αποχαρακτηρισμένα δασικά» που αναφέρεται στον τίτλο του νόμου.</i>
    </div>

    <h4>ΣΤ. Μονομερής Τροποποίηση Σύστασης Οριζόντιας/Κάθετης Ιδιοκτησίας</h4>
    <p>Δυνατότητα <b>μονομερούς τροποποίησης</b> σύστασης οριζόντιας ή κάθετης ιδιοκτησίας υπό προϋποθέσεις — για διόρθωση τετραγωνικών και άλλων στοιχείων χωρίς συναίνεση όλων των συνιδιοκτητών.</p>

    <h4>Ζ. Λοιπές Σημαντικές Ρυθμίσεις</h4>
    <ul>
        <li><b>Άρθρο 14:</b> Παράδοση αρχείων Υποθηκοφυλακείων σε Δήμους — δυνατότητα έκδοσης ακριβούς αντιγράφου από Δήμους</li>
        <li><b>Διόρθωση «αγνώστου ιδιοκτήτη»</b> υπέρ πραγματικού ιδιοκτήτη — επέκταση εξωδικαστικής οδού</li>
        <li><b>Δυνατότητα τίτλου ιδιοκτησίας βάσει προσυμφώνου</b> — υπό προϋποθέσεις</li>
        <li><b>Άμεση επιστροφή τελών</b> Υποθηκοφυλακείων που αχρεωστήτως καταβλήθηκαν</li>
        <li><b>Άρθρο 21:</b> Πρόσληψη έκτακτου προσωπικού — ιδιαίτερα για παραμεθόριες και νησιωτικές περιοχές</li>
        <li><b>Άρθρο 32:</b> Καθορισμός νέας προθεσμίας υποβολής εκπρόθεσμων δηλώσεων κτηματογράφησης</li>
        <li><b>Άρθρο 33:</b> Κατάργηση εκτεταμένης προθεσμίας αμφισβήτησης αρχικών εγγραφών για ορισμένες κατηγορίες περιοχών</li>
    </ul>

    <div class="highlight-box" style="background:#fef3c7; border-left-color:#f59e0b;">
        <b>📋 Σημασία για τον Κτηματολογικό Διαμεσολαβητή:</b><br>
        → Η επέκταση εξωδικαστικής διόρθωσης (δασικά, αγνώστου ιδιοκτήτη) <b>μειώνει τον αριθμό υποθέσεων που φθάνουν σε Εισαγωγική Συνεδρία Διαμεσολάβησης (ΕΣΔ)</b> — αλλά αυξάνει τις περιπτώσεις που χρειάζεται παρακολούθηση της ΠρΚΓ διαδικασίας.<br>
        → Η ΤΝ στον νομικό έλεγχο ενδέχεται να επιταχύνει την εντοπισμό αμφισβητούμενων εγγραφών, φέρνοντας νωρίτερα στη διαμεσολάβηση υποθέσεις που αλλιώς θα εκκρεμούσαν.
    </div>`,

    ktima_art18: `<h3>🏠 Άρθρο 18 Ν. 2664/1998 — Πρόδηλα Σφάλματα (Αναλυτικά)</h3>

    <h4>Γενικά — Έννοια & Πεδίο</h4>
    <div class="highlight-box" style="background:#eff6ff; border-left-color:#2563eb;">
        <b>«Πρόδηλο» σφάλμα = αόριστη νομική έννοια.</b> Χρήζει εξειδίκευσης <b>in concreto</b> κατά τρόπο αντικειμενικό και ελέγξιμο. Η απαρίθμηση στο νόμο είναι <b>ενδεικτική</b>.
    </div>
    <ul>
        <li><b>Δεν</b> αποτελούν προδικασία για άσκηση αγωγής ή αίτησης δικαστικής διόρθωσης (άρθρο 16§1 περ. ζ ν. 2664/1998)</li>
        <li>Αν αφορά αρχική εγγραφή, <b>δεν επιτρέπεται διόρθωση</b> εάν έχει προηγηθεί μεταγενέστερη εγγραφή <u>οπωσδήποτε ασύμβιβαστη</u> προς την αιτούμενη — εκτός αν ο εκ της μεταγενέστερης εγγραφής δικαιούχος <b>συναινεί</b> συνυπογράφοντας και η συναίνεση δεν υποκρύπτει άτυπη μεταβίβαση (άρθρο 18§1 περ. δ)</li>
        <li>Ηλεκτρονική υποβολή — με εξαιρέσεις</li>
    </ul>

    <h4>18§1 περ. α — Ο «στενός πυρήνας»</h4>
    <p>Αφορά το <b>σύνολο των κτηματολογικών εγγραφών</b> (αρχικές, οριστικές ή μη, και μεταγενέστερες). <b>Άρα δεν έχει χρονικό περιορισμό.</b></p>
    <ul>
        <li>Διενεργούνται αυτεπάγγελτα ή κατόπιν αιτήσεως όποιου έχει έννομο συμφέρον</li>
        <li>Η παραγωγή αμάχητου τεκμηρίου: <b>αδιάφορη!</b></li>
        <li>Αφορούν τον δικαιούχο, τον νόμιμο τίτλο, το δικαίωμα ή το ιδιοκτησιακό αντικείμενο</li>
        <li>Αποδεικνύονται αναμφισβήτητα από την καταχωρισθείσα πράξη και τα συνοδευτικά της έγγραφα ή (ως προς ταυτότητα δικαιούχου) από πρόσφορα δημόσια έγγραφα</li>
        <li><b>Χρησικτησία</b> δεν αναγνωρίζεται από την κτηματολογική αρχή, αλλά από τα δικαστήρια</li>
    </ul>

    <h4>18§1 περ. β — Αποκλειστικά για Αρχικές Εγγραφές</h4>
    <ul>
        <li><b>Περιορισμός χρόνου:</b> Η προθεσμία του άρθρου 6§2</li>
        <li><b>Περιορισμός αντικειμένου:</b> ΟΧΙ (εξαίρεση: χρησικτησία)</li>
    </ul>
    <p><b>Υποπερίπτωση αα:</b> Ανακρίβεια που προκύπτει από δημόσιο έγγραφο καταχωρισθέν στα βιβλία του οικείου Υποθ/κείου.<br>
    <i>Πρόσθετος χρονικός περιορισμός:</i> η καταχώριση του κρίσιμου εγγράφου στα βιβλία του Υποθ/κείου πριν από την ανάρτηση ή μετά, αν βασίζεται σε πράξη που καταχωρίστηκε πριν την ανάρτηση και εφόσον δεν εκτοπίζεται δικαίωμα τρίτου — εκτός αν αυτός συναινεί εγγράφως.</p>

    <div class="highlight-box" style="background:#fef2f2; border-left-color:#dc2626;">
        <b>📖 Παράδειγμα εκτοπισμού τρίτου:</b><br>
        Η οριζόντια ιδιοκτησία Α1 ανήκει κατά πλήρη κυριότητα στον Α, βάσει πλήρους σειράς νόμιμων τίτλων, αλλά εκ παραδρομής στις αρχικές εγγραφές καταχωρίστηκε ως κύριος ο Β. Ο Α πρέπει ή να στραφεί κατ' άρθρο 6§2 ν. 2664/1998 κατά του Β, ή να υποβάλει αίτηση διόρθωσης του πρόδηλου σφάλματος με <b>συναίνεση του Β</b> και συνηγορούντων των στοιχείων του Υποθ/κείου — ώστε να διασκεδαστεί η υποψία άτυπης μεταβίβασης.<br><br>
        <b>Παράδειγμα με χρησικτησία:</b> Ο Α υπέβαλε δήλωση για ακίνητο κατά 100% — 1/3 δυνάμει μεταγραφείσας γονικής παροχής από τον Π, και 2/3 δυνάμει μεταγραφείσας απόφασης έκτακτης χρησικτησίας. Οι Β, Γ και Δ δηλώνουν το ακίνητο κατά 1/3 εξ αδιαιρέτου έκαστος δυνάμει κληρονομικής διαδοχής από τον Π. Στις αρχικές εγγραφές προκρίθηκαν οι Β, Γ και Δ. Αν ο Α αιτηθεί τη διόρθωση, θα πρέπει να συναινέσουν οι Β, Γ και Δ. Κι αν το κάνουν, πάλι δεν θα μπορέσει ο ΠρΚΓ να προβεί στη διόρθωση, αφού υποκρύπτεται μεταβίβαση 1/9 ή συνολικά 3/9 από χρησικτησία που δεν αναγνωρίζεται εξωδικαστικά.
    </div>

    <h4>Ακίνητο «Αγνώστου Ιδιοκτήτη» — Ο Κανόνας</h4>
    <ul>
        <li>Η αίτηση επιδίδεται υποχρεωτικά εντός <b>10 ημερών</b> από την κατάθεσή της στο Ελληνικό Δημόσιο</li>
        <li>Το Ελληνικό Δημόσιο <b>τεκμαίρεται ότι συναινεί</b> εάν δεν αποσταλεί αρνητική απάντηση εντός <b>60 ημερών</b> από την επίδοση</li>
        <li>Σε περίπτωση αρνητικής απάντησης (ακόμη και χωρίς ειδική αιτιολογία) ο ΠρΚΓ <b>οφείλει να απορρίψει</b> την αίτηση</li>
        <li>«οφείλει»: Συστηματική/συσταλτική ερμηνεία = οφείλει, <b>εφόσον συντρέχουν οι νόμιμες προϋποθέσεις</b></li>
    </ul>

    <h4>Ακίνητο «Αγνώστου Ιδιοκτήτη» — Η Εξαίρεση (Χωρίς Επίδοση στο Δημόσιο)</h4>
    <ul>
        <li>Εάν πρόκειται για <b>δημόσιο έγγραφο</b> με βάση το οποίο έχουν καταχωρισθεί στο κτηματολόγιο δικαιώματα συνδικαιούχων</li>
        <li>Εάν το δημόσιο έγγραφο αποτελεί τίτλο εγγραπτέου δικαιώματος επί <b>άλλου κτηματογραφηθέντος ακινήτου</b> της ίδιας περιοχής, που δηλώθηκε και καταχωρίστηκε</li>
        <li>Εάν ο τίτλος του αιτούντος ή των δικαιοπαρόχων του είναι <b>παραχωρητήριο Ελληνικού Δημοσίου ή ΝΠΔΔ</b></li>
        <li>Εάν το ακίνητο «αγνώστου ιδιοκτήτη» είναι <b>οριζόντια ή κάθετη ιδιοκτησία</b> και από τον συσχετισμό του τίτλου κτήσης εξαντλείται το σύνολο των εξ αδιαιρέτου ποσοστών</li>
    </ul>

    <h4>18§1 περ. β-ββ & γγ</h4>
    <ul>
        <li><b>ββ:</b> Ανακρίβεια που προκύπτει από τη συσχέτιση της αρχικής εγγραφής προς τα στοιχεία της <b>ανάρτησης</b> και τη διαπίστωση απόκλισης χωρίς νόμιμο λόγο</li>
        <li><b>γγ:</b> Ανακρίβεια που προκύπτει από τη συσχέτιση της αρχικής εγγραφής προς στοιχεία <b>διοικητικής πράξης ή δικαστικής απόφασης</b> που συνιστούν πρωτότυπο τρόπο κτήσης δικαιώματος. <b>Προσοχή: να μην υπάρχει αντίθετη απόφαση της ΕπΕνστ.</b></li>
    </ul>`,

    ktima_art19: `<h3>🏠 Άρθρο 19§2 — Διόρθωση Γεωμετρικών Στοιχείων</h3>

    <h4>Σκοπός & Νομική Βάση</h4>
    <p>Η κτηματοκεντρική οργάνωση του Κτηματολογίου αποσκοπεί στον ακριβέστερο δυνατό καθορισμό των ορίων των ακινήτων, στη δημοσιότητα και στην προστασία του καλόπιστου συναλλασσόμενου. Η διόρθωση γεωμετρικών στοιχείων ολοκληρώνει τις απαιτήσεις ορθότητας και αφορά τόσο αρχικές όσο και μεταγενέστερες εγγραφές (ΑΠ 1632/2011).</p>
    <p><b>Γεωμετρικά στοιχεία:</b> εμβαδόν, θέση, πλευρικές διαστάσεις, σχήμα, όρια, συντεταγμένες ή εξαρτήσεις κορυφών, σημεία τομής περιμέτρου με πλευρές ομόρων κ.λπ.</p>
    <div class="highlight-box" style="background:#fef3c7; border-left-color:#f59e0b;">
        <b>⚠️ Κρίσιμη διάκριση:</b> Σύγχυση με <b>γεωμετρική μεταβολή συνεπεία πράξεως</b> (π.χ. κατάτμηση, συνένωση) — αυτή δεν είναι διόρθωση αλλά εγγραπτέα πράξη.
    </div>

    <h4>Χαρακτηριστικά Διαδικασίας (άρθρο 19§2)</h4>
    <ul>
        <li><b>Δεν υπόκειται σε προθεσμία</b></li>
        <li>Διενεργείται κατόπιν αιτήσεως οποιουδήποτε έχει έννομο συμφέρον</li>
        <li>Σωρεύεται με αίτηση του άρθρου 18 ν. 2664/1998, εάν απαιτείται</li>
        <li>Βασίζεται σε τίτλους ιδιοκτησίας μεταγραφέντες/καταχωρισθέντες, τα συνοδεύοντα τοπογραφικά, νόμιμα δημοσιευθείσες διοικητικές πράξεις ή καταχωρισθείσες δικαστικές αποφάσεις</li>
        <li><b>Υποβάλλεται ατελώς</b> — ατέλεια έχουν και τα εξαγόμενα από το αρχείο Υποθ/κείου ή ΚΓ συνοδευτικά έγγραφα</li>
        <li>Καταχωρίζεται <b>με ποινή απαραδέκτου</b> στα κτηματολογικά φύλλα των εμπλεκομένων ακινήτων</li>
        <li>Κοινοποιείται με δικαστικό επιμελητή και επιμέλεια αιτούντος στους δικαιούχους επηρεαζομένων ακινήτων</li>
    </ul>

    <h4>Φάκελος Αίτησης — Τι Περιλαμβάνει</h4>
    <ul>
        <li>Αντίγραφα τίτλων κτήσεως και τυχόν συνημμένων διαγραμμάτων</li>
        <li>Κτηματογραφικό διάγραμμα του ακινήτου που αφορά η διόρθωση</li>
        <li><b>Διάγραμμα γεωμετρικών μεταβολών</b> που προκύπτουν από την αίτηση</li>
        <li>Εισήγηση αρμόδιου τεχνικού τμήματος του Φορέα</li>
        <li>Το διάγραμμα γεωμ. μεταβολών πρέπει να έχει <b>αναρτηθεί στη σχετική εφαρμογή του Φορέα</b> και να προσκομιστεί το οικείο ΚΗΔ</li>
    </ul>

    <h4>Κοινοποίηση — Εξαιρέσεις</h4>
    <p>Κοινοποίηση στους επηρεαζόμενους <b>δεν απαιτείται</b> αν αυτοί αποδεχτούν την αιτούμενη διόρθωση συνυπογράφοντας ή δηλώσουν τη συναίνεσή τους συμβολαιογραφικώς ή με υπεύθυνη δήλωση. Επί ακινήτων αγνώστου ιδιοκτήτη ή ιδιοκτησίας Δημοσίου → αρμοδιότητα <b>Υπουργού Οικονομικών</b>. Η συναίνεση δεν μπορεί να υποκρύπτει άτυπη μεταβίβαση.</p>

    <h4>Διαδικασία ΠρΚΓ & Αποτέλεσμα</h4>
    <p>Με την υποβολή της αίτησης ο ΠρΚΓ: α) εξετάζει αν συντρέχουν νόμιμες προϋποθέσεις (ιδίως ότι δεν υποκρύπτεται άτυπη μεταβίβαση), β) αποστέλλει αντίγραφο στην τεχνική υπηρεσία του Φορέα για εισήγηση (θετική/αρνητική/αναβλητική), γ) ετοιμάζει αντίγραφο για επίδοση στους επηρεαζόμενους ομόρους.</p>
    <p>Η τυχόν <b>θετική απόφαση καταχωρείται προσωρινά</b>. Εντός 15 ημερών ο αιτών λαμβάνει αντίγραφο και κοινοποιεί στους επηρεαζόμενους, οι οποίοι έχουν δικαίωμα <b>προσφυγής στον Κτηματολογικό Δικαστή εντός 15 ημερών</b>. Αν η προθεσμία παρέλθει άπρακτη → η απόφαση <b>οριστικοποιείται</b>. Αν ασκηθεί προσφυγή και γίνει δεκτή, ή αν δεν διενεργηθούν εμπρόθεσμα οι επιδόσεις → η απόφαση ΠρΚΓ <b>παύει αυτοδικαίως</b> και η εγγραφή εξαλείφεται.</p>

    <h4>Ένδικη Προστασία</h4>
    <ul>
        <li>Κατά απόφασης ή σιωπής ΠρΚΓ: <b>προσφυγή στον ΚτημΔικ εντός 15 ημερών</b></li>
        <li>Εκδικάζεται κατά <b>εκούσια δικαιοδοσία</b></li>
        <li>Προβλήματα: κόστος, κακή νομοτεχνική οργάνωση (η προσφυγή μπορεί να μη γίνει γνωστή στους επηρεαζόμενους)</li>
        <li>Διαπιστευμένοι μηχανικοί και διόρθωση γεωμετρικών στοιχείων</li>
    </ul>

    <h4>Άλλες Μορφές Διόρθωσης</h4>
    <ul>
        <li><b>Άρθρο 19§3:</b> Εγγραφή απόφασης για κύρωση αναδασμού</li>
        <li><b>Άρθρο 19§4:</b> Διόρθωση σφαλμάτων σε περιοχές για τις οποίες δεν υφίσταται κυρωμένος δασικός χάρτης</li>
        <li><b>Άρθρο 36§1 Ν. 4512/2018:</b> Μια θνησιγενής ρύθμιση</li>
    </ul>`,

    ktima_mediation: `<h3>🏠 Κτηματολόγιο & Διαμεσολάβηση — Συνθετική Ανάλυση</h3>

    <h4>Α. Η «Κοινή» Διαμεσολάβηση του Ν. 4640/2019 στο Κτηματολόγιο</h4>
    <p>Εκτός της ειδικής κτηματολογικής διαμεσολάβησης (άρθρο 6§2δ), η «κοινή» διαμεσολάβηση του Ν. 4640/2019 μπορεί να εφαρμοστεί σε:</p>
    <ul>
        <li>(Μη κτηματολογικές) εμπράγματες αγωγές — ειδικά <b>υποθήκη/προσημείωση, ΑΚ 1274</b>, μετά τον Ν. 5095/2024</li>
        <li>Η <b>αγωγή αποζημίωσης</b> του άρθρου 7 παρ. 2 ν. 2664/1998</li>
        <li>Οι <b>αγωγές διόρθωσης μεταγενέστερων εγγραφών</b> — άρθρο 13 ν. 2664/1998</li>
    </ul>
    <div class="highlight-box" style="background:#f0fdf4; border-left-color:#059669;">
        <b>De lege ferenda — Προτάσεις για το μέλλον:</b><br>
        → Κτηματολογικός διαμεσολαβητής (εξειδικευμένος)<br>
        → Η έλλειψη μεταγραψιμότητας<br>
        → Η κατάθεση στο δικαστήριο<br>
        → Η αντιδικία με το Δημόσιο – ΟΤΑ – ΝΠΔΔ. Η περίπτωση ΕΤΑΔ<br>
        → Οι διασυνοριακές διαφορές
    </div>

    <h4>Β. Η Ειδική Κτηματολογική Διαμεσολάβηση (άρθρο 6§2δ Ν. 2664/1998)</h4>
    <p>Βάσει άρθρου 6 παρ. 2 εδ. Δ ν. 2664/1998, <b>όπως ισχύει μετά τους ν. 5199/2025 & 5232/2025</b>:</p>
    <ul>
        <li>→ Κάταρξη δίκης (αγωγή άρθρου 6§2α)</li>
        <li>→ Αίτημα διόρθωσης της αρχικής εγγραφής</li>
        <li>→ <b>Εξουσία διάθεσης</b> (υποκειμενική: ΟΤΑ, Δημόσιο / αντικειμενική: δεκτικό διάθεσης — μη υποκείμενο σε κανόνες δημόσιας τάξης)</li>
        <li>→ <b>Όχι άτυπη μεταβίβαση</b></li>
        <li>→ <b>ΕΣΔ από ειδικευμένο διαμεσολαβητή</b> (και η ίδια η διαμεσολάβηση)</li>
    </ul>
    <div class="highlight-box" style="background:#fef2f2; border-left-color:#dc2626;">
        <b>🔴 Εάν στο αυτό δικόγραφο σωρεύονται αιτήματα §6§2 και §13§2:</b><br>
        Ακολουθείται η (αυστηρότερη) διαδικασία της <b>κτηματολογικής διαμεσολάβησης</b> του άρθρου 6§2.
    </div>

    <h4>Γ. Καταχώριση Πρακτικού & Μορφολογικές Απαιτήσεις</h4>
    <p><b>Καταχωρίζεται και ως μεταβολή δικαιώματος;</b></p>
    <p>Στις περιπτώσεις κοινών εμπράγματων αγωγών ή άρθρου 13§2, που υπάγονται στον Ν. 4640/2019, σύμφωνα και με το άρθρο 8§4: εάν το αντικείμενο της συμφωνίας περιλαμβάνει διατάξεις που αφορούν δικαιοπραξίες υποκείμενες στο ουσιαστικό δίκαιο σε <b>συμβολαιογραφικό τύπο</b>, αυτές πρέπει να περιβληθούν τον τύπο αυτό, και το πρακτικό <b>τελεί υπό αναβλητική αίρεση</b> της συντάξεώς του.</p>
    <p>Λόγω του ειδικότερου χαρακτήρα της κτηματολογικής διόρθωσης αρχικών εγγραφών, ο αποκλεισμός του συμβολαιογραφικού τύπου δικαιολογείται <b>μόνο στο βαθμό και στην έκταση που διενεργείται διόρθωση της κτηματολογικής εγγραφής</b>, χωρίς δι' αυτής να επέρχεται μετάθεση, αλλοίωση ή κατάργηση εμπράγματου δικαιώματος. Στην τελευταία περίπτωση επανακάμπτει η ρύθμιση του άρθρου 8§4 Ν. 4640/2019 και <b>συμπληρώνεται το πρακτικό με το οικείο συμβολαιογραφικό έγγραφο</b>.</p>`,

    ktima_2664: `<h3>Νόμος 2664/1998 — Εθνικό Κτηματολόγιο (κωδικοποιημένος) (ΦΕΚ Α΄ 275/3-12-1998)</h3>
<div id="law-article-nav" style="margin-bottom:12pt;">
<a href="#art-1" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 1</a>
<a href="#art-2" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 2</a>
<a href="#art-3" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 3</a>
<a href="#art-3Α" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 3Α</a>
<a href="#art-4" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 4</a>
<a href="#art-5" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 5</a>
<a href="#art-6" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 6</a>
<a href="#art-7" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 7</a>
<a href="#art-7α" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 7α</a>
<a href="#art-7β" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 7β</a>
<a href="#art-8" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 8</a>
<a href="#art-9" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 9</a>
<a href="#art-10" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 10</a>
<a href="#art-11" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 11</a>
<a href="#art-12" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 12</a>
<a href="#art-13" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 13</a>
<a href="#art-13α" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 13α</a>
<a href="#art-14" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 14</a>
<a href="#art-15" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 15</a>
<a href="#art-16" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 16</a>
<a href="#art-17" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 17</a>
<a href="#art-18" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 18</a>
<a href="#art-19" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 19</a>
<a href="#art-19α" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 19α</a>
<a href="#art-20" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 20</a>
<a href="#art-20α" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 20α</a>
<a href="#art-20Β" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 20Β</a>
<a href="#art-21" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 21</a>
<a href="#art-22" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 22</a>
<a href="#art-23" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 23</a>
<a href="#art-24" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 24</a>
<a href="#art-34" style="margin-right:8pt; font-size:0.85rem;">Άρθρο 34</a>
</div>
<div id="art-1" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 1 — Ορισμός, φορέας τήρησης, σκοπός και έκταση εφαρμογής του Εθνικού</h4>
<p style="font-size:0.9rem; line-height:1.6;">Κτηματολογίου<br>1. Το Εθνικό Κτηματολόγιο αποτελεί σύστημα οργανωμένων σε κτηματοκεντρική<br>βάση νομικών, τεχνικών και άλλων πρόσθετων πληροφοριών για όλα τα ακίνητα της<br>επικράτειας, το οποίο διέπεται από τις αναγραφόμενες στο άρθρο 2 αρχές. Ο<br>Οργανισμός Κτηματολογίου και Χαρτογραφήσεων Ελλάδος συντάσσει και τηρεί το<br>Εθνικό Κτηματολόγιο. "Με απόφαση του Υπουργού Περιβάλλοντος, Χωροταξίας και<br>Δημόσιων \`Έργων, ύστερα από πρόταση του Οργανισμού Kτηματoλoγίoυ και<br>Χαρτογραφήσεων Ελλάδος, μπορεί να ανατίθενται αρμοδιότητες σύνταξης και<br>τήρησης, εν όλω ή εν μέρει, του Εθνικού Κτηματολογίου στην εταιρεία<br>"ΚΤΗΜΑΤΟΛΟΓΙΟ Α.Ε" Στην απόφαση αυτή προσδιορίζεται επακριβώς το<br>ανατιθέμενο έργο και ό,τι αφορά στην εκτέλεσή του.<br>2. Στο Κτηματολόγιο καταχωρίζονται νομικές και τεχνικές πληροφορίες που<br>αποσκοπούν στον ακριβή καθορισμό των ορίων των ακινήτων και στη δημοσιότητα<br>των εγγραπτέων στα κτηματολογικά βιβλία δικαιωμάτων και βαρών, με τρόπο που<br>διασφαλίζει τη δημόσια πίστη, προστατεύοντας κάθε καλόπιστο συναλλασσόμενο που<br>στηρίζεται στις κτηματολογικές εγγραφές. Καταχωρίζονται επίσης πρόσθετες<br>πληροφορίες, κατά τα οριζόμενα στο εδάφιο γ\` της παραγράφου 4 του άρθρου 11, που<br>αποτελούν μέσο για την επιδίωξη ιδίως σκοπών ορθολογικής οργάνωσης και<br>ανάπτυξης της Χώρας. Για το σκοπό αυτόν οι αρμόδιες διοικητικές και δικαστικές<br>αρχές κοινοποιούν αμελλητί στο οικείο Κτηματολογικό Γραφείο κάθε κανονιστική ή<br>ατομική διοικητική πράξη, καθώς και κάθε δικαστική απόφαση που ορίζει ή επιφέρει<br>μεταβολή ιδίως στις χρήσεις γης και στους όρους και περιορισμούς δόμησης των<br>ακινήτων, ανεξαρτήτως άλλης μορφής δημοσιότητας που προβλέπουν οι εκάστοτε<br>ισχύουσες διατάξεις. Η μη κοινοποίησή τους στο οικείο Κτηματολογικό Γραφείο δεν<br>παρακωλύει την επέλευση των έννομων αποτελεσμάτων τους.<br>3. Από την έναρξη ισχύος του Κτηματολογίου σε καθεμία από τις κατά το ν. 2308/1995<br>κτηματογραφούμενες περιοχές αντικαθίσταται το υφιστάμενο έως τότε στις περιοχές<br>αυτές σύστημα μεταγραφών και υποθηκών. Η ημερομηνία έναρξης ισχύος του ορίζεται<br>για καθεμία από τις κτηματογραφούμενες περιοχές με απόφαση του Οργανισμού<br>Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, αμέσως μετά την ολοκλήρωση των<br>πρώτων εγγραφών στα κτηματολογικά βιβλία και την τήρηση των προβλεπόμενων στη<br>διάταξη αυτή διατυπώσεων. Η απόφαση αυτή του Οργανισμού Κτηματολογίου και<br>Χαρτογραφήσεων Ελλάδος, στην οποία ορίζονται και τα όρια της υπαγόμενης στο<br>Κτηματολόγιο περιοχής, δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως και<br>κοινοποιείται στο Δημόσιο, κατά τις κείμενες διατάξεις για τις προς αυτό</p><p>κοινοποιήσεις, στους οργανισμούς τοπικής αυτοδιοίκησης α\` και β\` βαθμού, στον<br>Υποθηκοφύλακα της περιοχής, στο Συμβολαιογραφικό Σύλλογο της περιοχής και στο<br>Συμβολαιογραφικό Σύλλογο Εφετείων Αθηνών, Πειραιώς, Αιγαίου και Δωδεκανήσου.</p>
</div>
<div id="art-2" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 2 — Το Κτηματολόγιο διέπεται από τις ακόλουθες αρχές :</h4>
<p style="font-size:0.9rem; line-height:1.6;">1) την αρχή της κτηματοκεντρικής οργάνωσης των κτηματολογικών πληροφοριών, η<br>οποία απαιτεί τη σύνταξη, τήρηση και διαρκή ενημέρωση κτηματολογικών<br>διαγραμμάτων,<br>2) την αρχή του ελέγχου της νομιμότητας των τίτλων και λοιπών αναγκαίων στοιχείων<br>για την αποδοχή της αίτησης εγγραφής στα κτηματολογικά βιβλία,<br>3) την αρχή της διασφάλισης της τάξης των κτηματολογικών εγγραφών, ανάλογα με το<br>χρόνο υποβολής της σχετικής αίτησης (αρχή της χρονικής προτεραιότητας),<br>4) την αρχή της δημοσιότητας των κτηματολογικών βιβλίων,<br>5) την αρχή της διασφάλισης της δημόσιας πίστης, ώστε να προστατεύεται κάθε<br>καλόπιστος συναλλασσόμενος που στηρίζεται στις κτηματολογικές εγγραφές και<br>6) την αρχή της καταλληλότητας του Κτηματολογίου ως συστήματος δεκτικού<br>καταχώρισης και πρόσθετων κατηγοριών πληροφοριών σε οποιονδήποτε χρόνο στο<br>μέλλον (αρχή του ανοικτού Κτηματολογίου).</p>
</div>
<div id="art-3" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 3 — Κτηματολογικά Γραφεία-Κτηματολογικά στοιχεία</h4>
<p style="font-size:0.9rem; line-height:1.6;">1.α) Η τήρηση των κτηματολογικών στοιχείων γίνεται από τα Κτηματολογικά Γραφεία,<br>που ανήκουν στο Υπουργείο Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής. Με<br>την επιφύλαξη των μεταβατικών διατάξεων του άρθρου 23, των Κτηματολογικών<br>Γραφείων προΐσταται πτυχιούχος κατηγορίας ΠΕ συναφών με το αντικείμενο<br>Ανωτάτου Εκπαιδευτικού Ιδρύματος, με πενταετή τουλάχιστον επαγγελματική<br>εμπειρία, που διορίζεται ύστερα από προκήρυξη της θέσης με κοινή απόφαση των<br>Υπουργών Δικαιοσύνης, Διαφάνειας και Ανθρωπίνων Δικαιωμάτων και<br>Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής, ύστερα από πρόταση της<br>εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ Α.Ε.», όπως αυτή<br>μετονομάζεται. Με προεδρικό διάταγμα, που εκδίδεται ύστερα από εισήγηση της<br>εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ» όπως αυτή μετονομάζεται<br>και πρόταση των Υπουργών Δικαιοσύνης, Διαφάνειας και Ανθρωπίνων Δικαιωμάτων<br>και Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής, ορίζονται τα ειδικότερα<br>προσόντα, οι προϋποθέσεις και η διαδικασία διορισμού των Προϊσταμένων των<br>Κτηματολογικών Γραφείων. Οι Προϊστάμενοι των Κτηματολογικών Γραφείων είναι<br>δημόσιοι λειτουργοί. Για τον Προϊστάμενο του Κτηματολογικού Γραφείου και για το<br>λοιπό προσωπικό, το οποίο, υπό τις προϋποθέσεις του εδαφίου α\` της παραγράφου 3<br>του άρθρου 103 του Συντάγματος, μπορεί να προσλαμβάνεται και με σχέση ιδιωτικού<br>δικαίου, εφαρμόζονται αναλόγως οι διατάξεις των άρθρων16, 21 έως 30 και 35 έως 38<br>του κανονιστικού διατάγματος της 19/23.7.1941 «Περί Οργανισμού των<br>Υποθηκοφυλακείων του Κράτους». Με προεδρικό διάταγμα, που εκδίδεται ύστερα από<br>εισήγηση της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ» όπως αυτή<br>μετονομάζεται, και πρόταση των Υπουργών Εσωτερικών, Διοικητικής Μεταρρύθμισης</p><p>και Ηλεκτρονικής Διακυβέρνησης, Οικονομικών, Δικαιοσύνης, Διαφάνειας και<br>Ανθρωπίνων Δικαιωμάτων και Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής,<br>συνιστώνται οι αναγκαίες θέσεις προσωπικού, καθορίζονται τα προσόντα για την<br>πρόσληψη στις θέσεις αυτές και ρυθμίζεται κάθε άλλο ζήτημα που αφορά στη<br>λειτουργία, στην οργάνωση και στη στελέχωση των Κτηματολογικών Γραφείων, τα<br>οποία πρέπει να διαθέτουν κατ\` ελάχιστον νομική και τεχνική υπηρεσία.<br>Στην εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή<br>μετονομάζεται, ανατίθεται η οργάνωση, διάρθρωση και η υλικοτεχνική υποστήριξη της<br>λειτουργίας των Κτηματολογικών Γραφείων. Για την εν γένει κάλυψη λειτουργικών<br>αναγκών των Κτηματολογικών Γραφείων και την ενίσχυση του έργου τους, η εταιρεία<br>«ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται, δύναται να<br>διαθέτει πρόσθετο προσωπικό κάθε ειδικότητας, που αμείβεται από αυτήν και να<br>παρέχει κεντρική υποστήριξη. Με απόφαση του Υπουργού Περιβάλλοντος, Ενέργειας<br>και Κλιματικής Αλλαγής ρυθμίζονται ζητήματα τεχνικού και λεπτομερειακού<br>χαρακτήρα που αφορούν στον τρόπο διάθεσης του εν λόγω προσωπικού από την<br>εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται.<br>Για τη ρύθμιση θεμάτων ομοιόμορφης εφαρμογής του εν γένει ισχύοντος θεσμικού<br>πλαισίου από όλα τα Κτηματολογικά Γραφεία της Επικράτειας, ο Υπουργός<br>Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής, μετά από πρόταση της εταιρείας<br>«ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται, εκδίδει και<br>αποστέλλει εγκυκλίους οδηγίες, που εφαρμόζονται υποχρεωτικά.<br>Με απόφαση του Υπουργού Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής,<br>εκδίδεται Κανονισμός Λειτουργίας των Κτηματολογικών Γραφείων, στον οποίο<br>καθορίζεται ιδίως ο τρόπος εξυπηρέτησης του κοινού, οι εσωτερικές διαδικασίες<br>λειτουργίας των Γραφείων και η οργανωτική και λειτουργική εποπτεία τους.<br>β) Με προεδρικά διατάγματα, ύστερα από εισήγηση του Οργανισμού Κτηματολογίου<br>και Χαρτογραφήσεων Ελλάδος και πρόταση των Υπουργών Εσωτερικών, Δημόσιας<br>Διοίκησης και Αποκέντρωσης, Δικαιοσύνης και Περιβάλλοντος, Χωροταξίας και<br>Δημόσιων Έργων, μπορεί να ανατίθενται σε πρωτοβάθμιους οργανισμούς τοπικής<br>αυτοδιοίκησης οι κατά την παράγραφο 1 περίπτωση ιγ\`, του άρθρου 41 του ν.<br>2218/1994 αρμοδιότητες τήρησης κτηματολογικών στοιχείων. Οι προϋποθέσεις και οι<br>όροι της ανάθεσης ορίζονται με κανονιστικού περιεχομένου προεδρικό διάταγμα,<br>ύστερα από εισήγηση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος<br>και πρόταση των ίδιων παραπάνω Υπουργών.<br>2. Τα τηρούμενα από τα Κτηματολογικά Γραφεία στοιχεία είναι τα ακόλουθα :<br>α) Τα κτηματολογικά διαγράμματα για όλη την κτηματογραφημένη περιοχή που<br>εμπίπτει στην αρμοδιότητα του οικείου Γραφείου Κτηματολογίου.<br>β) Οι κτηματολογικοί πίνακες για τα ακίνητα που περιλαμβάνονται στα κτηματολογικά<br>διαγράμματα. Το περιεχόμενο των κτηματολογικών πινάκων αποτελεί περιεχόμενο και<br>των πρώτων εγγραφών στα φύλλα του κτηματολογικού βιβλίου, που τηρείται στο<br>οικείο Γραφείο Κτηματολογίου.<br>γ) Το Κτηματολογικό βιβλίο, στο οποίο αφορούν οι ρυθμίσεις του τρίτου κεφαλαίου<br>αυτού του νόμου.</p><p>δ) Το ημερολόγιο, στο οποίο καταχωρίζονται, κατά τη σειρά της υποβολής τους, όλες<br>οι αιτήσεις εγγραφής στο Κτηματολογικό βιβλίο, ώστε να διασφαλίζεται η κατά την<br>παράγραφο 1 περίπτωση γ\` του άρθρου 2, αρχή της χρονικής προτεραιότητας.<br>ε) Το αλφαβητικό ευρετήριο των δικαιούχων των δικαιωμάτων που έχουν εγγραφεί στο<br>Κτηματολογικό βιβλίο.<br>στ) Το αρχείο τίτλων, διαγραμμάτων και λοιπών δικαιολογητικών που υποβάλλονται<br>με τις αιτήσεις εγγραφής στο Κτηματολογικό βιβλίο. Τα θέματα της συγκρότησης και<br>τήρησης του αρχείου αυτού ρυθμίζονται με απόφαση του Οργανισμού Κτηματολογίου<br>και Χαρτογραφήσεων Ελλάδος, που δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως.<br>3. Εκτός από τα αναφερόμενα στην προηγούμενη παράγραφο στοιχεία, το οικείο<br>Γραφείο Κτηματολογίου φυλάσσει όλα τα στοιχεία που συγκεντρώθηκαν κατά το<br>στάδιο της κτηματογράφησης, καθώς και ο,τιδήποτε άλλο οριστεί ότι θα τηρείται με<br>τη μορφή αρχείων, όπως του αρχείου κτισμάτων, ή κατ\` άλλον τρόπο, ύστερα από<br>απόφαση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, που<br>δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως.<br>Σχετικό: παρ. 8 του άρθρου 1 του ν. 4164/2013,που αντικαταστάθηκε με το άρθρο 9<br>παρ.2 Ν.4198/2013,ΦΕΚ Α 215/11.10.2013</p>
</div>
<div id="art-3Α" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 3Α — Ηλεκτρονικό Σύστημα Διασύνδεσης Ληξιαρχείων και Ελληνικού Κτηματολογίου</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Θεσπίζεται ηλεκτρονικό σύστημα αυτοματοποιημένης διασύνδεσης των<br>ληξιαρχείων και ληξιάρχων του ν. 344/1976 (Α΄143) και του Ν.Π.Δ.Δ. με την επωνυμία<br>«Ελληνικό Κτηματολόγιο» για την πρόσβαση των κτηματολογικών γραφείων και<br>λοιπών υπηρεσιακών μονάδων του Ν.Π.Δ.Δ. «Ελληνικό Κτηματολόγιο» στις<br>διαδικτυακές υπηρεσίες και στα δεδομένα του Πληροφοριακού Συστήματος «Μητρώο<br>Πολιτών» του άρθρου 115 του ν. 4483/2017 (Α΄ 107) του Υπουργείου Εσωτερικών,<br>που έχει διατεθεί στη Γενική Γραμματεία Πληροφοριακών Συστημάτων Δημόσιας<br>Διοίκησης του Υπουργείου Ψηφιακής Διακυβέρνησης (εφεξής Σύστημα). Σκοπός του<br>Συστήματος είναι η αυτόματη ηλεκτρονική ενημέρωση των αλφαβητικών ευρετηρίων<br>και των κτηματολογικών βιβλίων που τηρούνται στο Εθνικό Κτηματολόγιο, με την<br>ημερομηνία θανάτου, τον αριθμό και την εκδούσα αρχή των ληξιαρχικών πράξεων<br>θανάτου των φερόμενων ως δικαιούχων δικαιωμάτων που έχουν εγγραφεί στα<br>κτηματολογικά βιβλία, καθώς και των προσώπων των οποίων η αίτηση διόρθωσης του<br>άρθρου 6Α του ν. 2308/1995 (Α΄114) έχει σημειωθεί ως εκκρεμής, σύμφωνα με το<br>άρθρο 7Α του ίδιου νόμου. Το Σύστημα τίθεται αρχικά σε δοκιμαστική λειτουργία<br>δεκαπέντε (15) ημέρες μετά την έναρξη ισχύος του παρόντος και για χρονικό διάστημα<br>δεκαπέντε (15) ημερών. Η λήξη της δοκιμαστικής λειτουργίας του Συστήματος<br>διαπιστώνεται με απόφαση του Υπουργού Ψηφιακής Διακυβέρνησης. Δεκαπέντε (15)<br>ημέρες μετά τη λήξη της δοκιμαστικής λειτουργίας, αρχίζει η παραγωγική λειτουργία<br>του Συστήματος. Η έναρξη της παραγωγικής λειτουργίας του Συστήματος<br>διαπιστώνεται με απόφαση του Υπουργού Ψηφιακής Διακυβέρνησης. Από την έναρξη<br>της παραγωγικής λειτουργίας του Συστήματος, τα αλφαβητικά ευρετήρια και τα<br>κτηματολογικά βιβλία του Εθνικού Κτηματολογίου ενημερώνονται αυτόματα,<br>ηλεκτρονικά, με την ημερομηνία θανάτου, τον αριθμό και την εκδούσα αρχή των</p><p>ληξιαρχικών πράξεων που καταχωρίζονται από την έναρξη ισχύος της παραγωγικής<br>λειτουργίας του Συστήματος, στο Μητρώο Πολιτών. Η αυτόματη ενημέρωση του<br>προηγούμενου εδαφίου αφορά και στις ληξιαρχικές πράξεις που έχουν καταχωριστεί<br>στο Μητρώο Πολιτών πριν από την έναρξη της παραγωγικής λειτουργίας του<br>Συστήματος.<br>2. Σε περίπτωση θανάτου προσώπου που έχει καταχωριστεί στις κτηματολογικές<br>εγγραφές ως δικαιούχος εγγραπτέου δικαιώματος, οι διάδοχοί του υποχρεούνται, μέσα<br>σε έναν (1) μήνα από την παρέλευση της προθεσμίας του άρθρου 1847 ΑΚ, να<br>γνωστοποιήσουν τη διαδοχή τους επί του καταχωρισθέντος δικαιώματος, με την<br>υποβολή αίτησης στο αρμόδιο Κτηματολογικό Γραφείο. Η ανωτέρω υποχρέωση<br>γνωστοποίησης βαρύνει και τους διαδόχους αποβιώσαντος προσώπου που έχει<br>υποβάλλει την αίτηση διόρθωσης του άρθρου 6Α του ν. 2308/1995, η εξέταση της<br>οποίας έχει σημειωθεί ως εκκρεμής σύμφωνα με το άρθρο 7 Α του ίδιου νόμου στο<br>κτηματολογικό φύλλο του ακινήτου, σχετικά με το δικαίωμα που αμφισβητείται με την<br>αίτηση διόρθωσης. Εφόσον κατά την έναρξη ισχύος του παρόντος έχει λήξει η<br>προθεσμία γνωστοποίησης ή απομένει διάστημα μικρότερο των δύο (2) μηνών για τη<br>λήξη της, η σχετική γνωστοποίηση γίνεται μέσα σε προθεσμία δύο (2) μηνών από την<br>έναρξη ισχύος του παρόντος.<br>3.Με την αίτηση, για την οποία εφαρμόζονται αναλογικά τα άρθρα 15 και 16 του<br>παρόντος, συνυποβάλλονται τα σχετικά έγγραφα της παρ. 4.2.1. του Κεφαλαίου 4 της<br>υπ’ αρ. 556/09/2012 απόφασης του Διοικητικού Συμβουλίου του Οργανισμού<br>Κτηματολογίου και Χαρτογραφήσεων Ελλάδας (Β΄3370). Με την επιφύλαξη των παρ.<br>1 και 2 του άρθρου 15, τα στοιχεία των διαδόχων του αποβιώσαντος και οι πληροφορίες<br>για το δικαίωμά τους καταχωρίζονται ως «σημείωση» στο πεδίο «Παρατηρήσεις» του<br>κτηματολογικού φύλλου του ακινήτου αμελλητί και πάντως το αργότερο μέσα σε<br>προθεσμία δέκα (10) ημερών από την υποβολή της αίτησης. Για τους όρους και τα<br>δικαιούμενα πρόσωπα για την άσκηση του δικαιώματος πρόσβασης και έρευνας στα<br>στοιχεία της παρούσας και της παρ. 1 εφαρμόζεται η υπό στοιχεία 11206ΕΞ2021 κοινή<br>απόφαση των Υπουργών Δικαιοσύνης και Επικρατείας και του Υφυπουργού Ψηφιακής<br>Διακυβέρνησης (Β΄ 1539), όπως εκάστοτε ισχύει. Η υποχρέωση του πρώτου εδαφίου<br>αίρεται, αν οι διάδοχοι του εμφανιζόμενου στα κτηματολογικά φύλλα ως δικαιούχου,<br>εντός της παραπάνω προθεσμίας, ζητήσουν με αίτησή τους την καταχώριση πράξης της<br>περ. ζ΄ της παρ. 1 του άρθρου 12. Σε κάθε περίπτωση, τα πρόσωπα που έχουν σημειωθεί<br>ως κληρονόμοι στο κτηματολογικό φύλλο του ακινήτου δεν μπορούν να επιχειρήσουν<br>εγκύρως καμία πράξη διάθεσης του εγγραπτέου δικαιώματος πριν από την πλήρωση<br>των προϋποθέσεων των άρθρων 1193, 1195, 1198 και 1199 ΑΚ.</p>
</div>
<div id="art-4" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 4 — Αντικείμενο των κτηματολογικών εγγραφών - Δαπάνη εγγραφής</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Αντικείμενο των κτηματολογικών εγγραφών είναι τα εγγραπτέα δικαιώματα που<br>αφορούν ακίνητα κατά την έννοια του άρθρου 948 του Αστικού Κώδικα και κάθε άλλο<br>αυτοτελές, συνδεόμενο με το έδαφος, ιδιοκτησιακό αντικείμενο. Κάθε ακίνητο<br>απεικονίζεται στα κτηματολογικά διαγράμματα και εμφαίνεται με τον αποκλειστικό γι\`<br>αυτό Κωδικό Αριθμό Εθνικού Κτηματολογίου, ως τμήμα εδάφους, μαζί με τα</p><p>συστατικά του μέρη, ανεξαρτήτως του χαρακτήρα αυτού ως δασικού, αγροτικού ή<br>αστικού, οικοδομημένου ή μη, με ή χωρίς εφαρμογή του συστήματος οριζόντιων ή<br>κάθετων αυτοτελών ιδιοκτησιών, δημόσιου ή ιδιωτικού, ανεξαρτήτως της<br>εξυπηρέτησης με αυτό της ιδιωτικής ή της κοινής χρήσης ή της κοινής ωφέλειας.<br>2. α) Με κοινή απόφαση των Υπουργών Οικονομίας και Οικονομικών, Περιβάλλοντος,<br>Χωροταξίας και Δημόσιων \`Έργων και Δικαιοσύνης, ύστερα από πρόταση του<br>Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, καθορίζονται τα πάγια<br>ανταποδοτικό, υπέρ του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος,<br>τέλη και τα λοιπό υπέρ του Δημοσίου και τρίτων δικαιώματα για τις κτηματολογικές<br>εγγραφές σε ύψος και με τρόπο αντίστοιχο προς αυτόν που προβλέπει η εκάστοτε<br>κείμενη νομοθεσία για τις αντίστοιχες εγγραφές στα βιβλία που τηρούνται στα<br>υποθηκοφυλακεία. Με την ίδια απόφαση ορίζεται και ο τρόπος απόδοσης των<br>δικαιωμάτων αυτών.<br>β) Τα αναλογικό δικαιώματα που εισπράττονται από τα υποθηκοφυλακεία σύμφωνα με<br>τα άρθρα 3, 5 και 12 του ν. 325/1976 (ΦΕΚ 125 Α \`/28.5.1976), όπως ο νόμος αυτός<br>έχει τροποποιηθεί και ισχύει, κατά τη μεταβατική περίοδο λειτουργίας τους ως<br>Κτηματολογικών Γραφείων, εισπράττονται αυξημένα κατά ποσοστό ένα επί τοις<br>χιλίοις (1‰), το οποίο και αποδίδεται στον \`Ο.Κ.Χ.Ε.. Λεπτομέρειες για την είσπραξη<br>και απόδοση από τον Προϊστάμενο του Κτηματολογικού Γραφείου των αναλογικών<br>αυτών δικαιωμάτων στον Ο.Κ.Χ.Ε. καθορίζονται με απόφαση του Υπουργού<br>Περιβάλλοντος, Χωροταξίας και Δημόσιων \`Έργων, ύστερα από πρόταση του<br>Ο.Κ.Χ.Ε..<br>γ) Τα έσοδα από την είσπραξη των υπέρ του Ο.Κ.Χ.Ε. τελών και δικαιωμάτων που<br>αναφέρονται στις περιπτώσεις α\` και β\` της παραγράφου αυτής, τα οποία δεν<br>υπόκεινται σε τέλος χαρτοσήμου ή Φ.Π.Α., εγγράφονται στον προϋπολογισμό του<br>Ο.Κ.Χ.Ε. και μπορούν να εισφέρονται στην εταιρεία "ΚΤΗΜΑΤΟΛΟΓΙΟ Α.Ε.", κατά<br>τους όρους της προβλεπόμενης στο όρθρο 14 παρ. 1 του ν. 2308/1995 απόφασης του<br>Υπουργού Περιβάλλοντος, Χωροταξίας και Δημόσιων \`Έργων περί μεταφοράς πόρων<br>του Ο.Κ.Χ.Ε. στην εν λόγω εταιρεία και να διατίθενται για τη λειτουργία του<br>Κτηματολογίου. Για την εισφορά στην εταιρεία "ΚΤΗΜΑΤΟΛΟΓΙΟ Α.Ε."<br>εφαρμόζεται ο ν. 2859/2000 (Κώδικας Φ.Π.Α.), όπως ισχύει κάθε φορά.<br>δ) Εξαιρούνται από τη ρύθμιση του παρόντος άρθρου και γίνονται ατελώς οι<br>κτηματολογικές εγγραφές για εγγραπτέα δικαιώματα του Ελληνικού Δημοσίου.</p>
</div>
<div id="art-5" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 5 — Τοπική αρμοδιότητα των Κτηματολογικών Γραφείων</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Κάθε Κτηματολογικό Γραφείο είναι τοπικά αρμόδιο για τις κτηματολογικές<br>εγγραφές που αφορούν σε ακίνητα της περιοχής του.<br>2. Αν ορισμένο ακίνητο υπάγεται στην τοπική αρμοδιότητα περισσοτέρων του ενός<br>Κτηματολογικών Γραφείων, οι σχετικές με αυτό κτηματολογικές εγγραφές γίνονται σε<br>όλα τα Κτηματολογικά Γραφεία, με τη σημείωση ότι τμήμα του ακινήτου εμπίπτει στην<br>τοπική αρμοδιότητα και άλλου Κτηματολογικού Γραφείου. Το μέγεθος και ο τρόπος<br>καταβολής της δαπάνης εγγραφής σε αυτήν την κατηγορία περιπτώσεων ρυθμίζονται<br>με την απόφαση της παραγράφου 4 του άρθρου 4.</p><p>Με απόφαση του Ο.Κ.Χ.Ε., την έκδοση της οποίας μπορεί να ζητήσει και ο<br>προϊστάμενος καθενός από τα συναρμόδια κτηματολογικά γραφεία ή και όποιος έχει<br>έννομο συμφέρον, μπορεί να υπαχθεί το σύνολο του ακινήτου στην αρμοδιότητα του<br>ενός από τα περισσότερα συναρμόδια κτηματολογικά γραφεία. Με όμοια απόφαση<br>ρυθμίζεται κάθε σχετική λεπτομέρεια τεχνικού και λεπτομερειακού χαρακτήρα.<br>ΚΕΦΑΛΑΙΟ ΔΕΥΤΕΡΟ<br>Οι πρώτες εγγραφές στα κτηματολογικά βιβλία</p>
</div>
<div id="art-6" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 6 — Πρώτες εγγραφές - Προθεσμία αμφισβήτησης</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Πρώτες εγγραφές είναι εκείνες που καταχωρίζονται ως αρχικές εγγραφές στο<br>Κτηματολογικό βιβλίο, κατά μεταφορά από τους κτηματολογικούς πίνακες, σύμφωνα<br>με την παράγραφο 2περίπτωση β\` του άρθρου 3. Οι πρώτες εγγραφές, επί των οποίων<br>στηρίζεται κάθε μεταγενέστερη εγγραφή, υπόκεινται στις ρυθμίσεις του παρόντος<br>κεφαλαίου.<br>2. α) Σε περίπτωση ανακριβούς πρώτης εγγραφής, μπορεί να ζητηθεί, με αγωγή<br>ενώπιον του αρμόδιου καθ’ ύλην και κατά τόπον Πρωτοδικείου, η αναγνώριση του<br>δικαιώματος που προσβάλλεται με την ανακριβή εγγραφή και η διόρθωση, ολικά ή<br>μερικά, της πρώτης εγγραφής. Η αγωγή, αναγνωριστική ή διεκδικητική, ασκείται από<br>όποιον έχει έννομο συμφέρον μέσα σε αποκλειστική προθεσμία που λήγει την 31η<br>Δεκεμβρίου του έτους, εντός του οποίου συμπληρώνονται οκτώ (8) έτη από την έναρξη<br>της προθεσμίας, σύμφωνα με την περ. γ’ της παρούσας.<br>β) Έχει καταργηθεί και αντικαταστάθηκε από την παρ. 2 του άρθρου 102 του Ν.<br>4623/2019 η οποία στη συνέχεια αντικαταστάθηκε με το άρθρο 36 του Ν. 5160/2024<br>(ΦΕΚ Α΄195/27.11.2024) και διαμορφώθηκε ως εξής:<br>«Για τις περιοχές που κηρύχθηκαν υπό κτηματογράφηση πριν από την έναρξη ισχύος<br>του ν. 3481/2006 (Α’ 162), η αποκλειστική προθεσμία της περ. α’ της παρ. 2 του άρθρου<br>6 του ν. 2664/1998, εάν δεν είχε λήξει η ίδια ή οι παρατάσεις της μέχρι τις 30.11.2018,<br>λήγει μετά την πάροδο ενός (1) έτους από τη δημοσίευση πράξης του Διοικητικού<br>Συμβουλίου του Ν.Π.Δ.Δ. «Ελληνικό Κτηματολόγιο» με την οποία διαπιστώνεται η<br>εφαρμογή του συστήματος του Κτηματολογίου σε αντικατάσταση του συστήματος<br>μεταγραφών και υποθηκών στο σύνολο της επικράτειας της χώρας. Η ανωτέρω<br>καταληκτική ημερομηνία ισχύει και για τις περιοχές στις οποίες οι πρώτες εγγραφές<br>καταχωρίσθηκαν από την 1η.1.2013 έως και την 31η.12.2017. Κατ’ εξαίρεση, για τις<br>περιοχές που κηρύχθηκαν υπό κτηματογράφηση πριν από την έναρξη ισχύος του ν.<br>3481/2006 (Α’ 162), κατά την έναρξη ισχύος του ν. 4623/2019 (Α’ 134)<br>εξακολουθούσαν να τελούν υπό κτηματογράφηση και δεν είχαν εκδοθεί η διαπιστωτική<br>πράξη περαίωσης της κτηματογράφησης και η απόφαση έναρξης ισχύος του<br>Κτηματολογίου, η αποκλειστική προθεσμία της περ. α’ της παρ. 2 του άρθρου 6 του ν.<br>2664/1998 λήγει την 31η Δεκεμβρίου του έτους εντός του οποίου συμπληρώνονται<br>οκτώ (8) έτη από την ημερομηνία έναρξης ισχύος του Κτηματολογίου.»<br>«2Α. Για τις περιοχές στις οποίες η αποκλειστική προθεσμία της περ. α’ της παρ. 2 του<br>άρθρου 6 του ν. 2664/1998, περί διόρθωσης πρώτων εγγραφών, είχε λήξει μέχρι τις<br>30.11.2018, η δυνατότητα αμφισβήτησης και διόρθωσης ανακριβούς εγγραφής, σε</p><p>ακίνητα με την ένδειξη «αγνώστου ιδιοκτήτη», είτε εξωδικαστικά, όταν συντρέχουν οι<br>προϋποθέσεις των υποπερ. αα), αβ), αγ) και αδ) της περ. β) της παρ. 1 του άρθρου 18<br>του ν. 2664/1998, είτε κατόπιν άσκησης αγωγής σύμφωνα με την παρ. 2 του άρθρου 6<br>του ίδιου νόμου, είναι δυνατή μέχρι την πάροδο ενός (1) έτους από τη δημοσίευση<br>πράξης του Διοικητικού Συμβουλίου του Ν.Π.Δ.Δ. «Ελληνικό Κτηματολόγιο» με την<br>οποία διαπιστώνεται η εφαρμογή του συστήματος του Κτηματολογίου σε<br>αντικατάσταση του συστήματος μεταγραφών και υποθηκών στο σύνολο της<br>επικράτειας της χώρας, μόνο αν, κατόπιν της λήξης της αποκλειστικής προθεσμίας για<br>κάθε περιοχή, δεν έχουν εγγραφεί μεταγενέστερες πράξεις επί του κτηματολογικού<br>φύλλου του ακινήτου. Εγγραφή της αγωγής της παρ. 2 του άρθρου 7 του ν. 2664/1998<br>δεν λαμβάνεται υπόψη ως μεταγενέστερη πράξη. Σε κάθε περίπτωση, ο ενάγων δύναται<br>να παραιτηθεί από την αγωγή του προηγούμενου εδαφίου και να ακολουθήσει τις<br>λοιπές διαδικασίες διόρθωσης ή να εμμείνει στην ασκηθείσα αγωγή του. Για τις<br>περιοχές του πρώτου εδαφίου της παρούσας επιτρέπεται, μέχρι την πάροδο ενός (1)<br>έτους από τη δημοσίευση πράξης του Διοικητικού Συμβουλίου του Ν.Π.Δ.Δ.<br>«Ελληνικό Κτηματολόγιο», με την οποία διαπιστώνεται η εφαρμογή του συστήματος<br>του Κτηματολογίου σε αντικατάσταση του συστήματος μεταγραφών και υποθηκών στο<br>σύνολο της επικράτειας της χώρας: α) η διόρθωση ανακριβούς εγγραφής με την ένδειξη<br>«Ελληνικό Δημόσιο», σύμφωνα με τη διαδικασία της παρ. 4 του άρθρου 6 του ν.<br>2664/1998, όταν ο τίτλος του αιτούντος τη διόρθωση ή των δικαιοπαρόχων του<br>(άμεσων ή απώτερων) είναι παραχωρητήριο του Ελληνικού Δημοσίου και β) η<br>διόρθωση της ανακριβούς εγγραφής με τη διαδικασία της παρ. 4 του άρθρου 6 όταν<br>στα οικεία κτηματολογικά φύλλα κατά την οριστικοποίηση των αρχικών εγγραφών<br>αναγνωρίστηκε ως δικαιούχος του δικαιώματος ο δικαιοπάροχος του αιτούντος τη<br>διόρθωση, ενώ ο τίτλος κτήσης του σχετικού δικαιώματος από τον αιτούντα τη<br>διόρθωσή του είναι μεταγεγραμμένος στα βιβλία μεταγραφών του αντίστοιχου<br>Υποθηκοφυλακείου ή Κτηματολογικού Γραφείου και υπό την προϋπόθεση ότι δεν έχει<br>στο μεταξύ μεσολαβήσει άλλη, ασυμβίβαστη κατά περιεχόμενο, εγγραφή στο<br>κτηματολογικό φύλλο.»<br>γ) Η αποκλειστική προθεσμία για την άσκηση της αγωγής της περ. α΄ αρχίζει από τη<br>δημοσίευση στην Εφημερίδα της Κυβερνήσεως της απόφασης του Δ.Σ. του Φορέα,<br>σύμφωνα με την παρ. 3 του άρθρου 1. Η αγωγή απευθύνεται κατά του<br>αναγραφόμενου ως δικαιούχου του δικαιώματος στο οποίο αφορά η πρώτη εγγραφή ή<br>κατά των καθολικών του διαδόχων. Σε περίπτωση ειδικής διαδοχής στο δικαίωμα στο<br>οποίο αφορά η πρώτη εγγραφή, η αγωγή πρέπει να στραφεί τόσο κατά του φερόμενου<br>με την πρώτη εγγραφή ως δικαιούχου ή των καθολικών του διαδόχων όσο και κατά<br>των ειδικών διαδόχων αυτού. Εάν στην πρώτη εγγραφή έχει σημειωθεί ότι εκκρεμεί η<br>εξέταση αίτησης διόρθωσης από τις Επιτροπές Εξέτασης Υποθέσεων<br>Κτηματογράφησης του άρθρου 7Α του ν. 2308/1995 (Α΄ 114), η αγωγή στρέφεται<br>υποχρεωτικά κατά του εμφανιζόμενου ως δικαιούχου στην πρώτη εγγραφή των τυχόν<br>ειδικών ή καθολικών του διαδόχων και του αιτούντος τη διόρθωση κατά το άρθρο 6Α<br>του ν. 2308/1995. Η άσκηση αγωγής, σύμφωνα με τα ανωτέρω, συνεπάγεται την<br>αυτοδίκαιη λήξη της διαδικασίας ενώπιον των Επιτροπών Εξέτασης Υποθέσεων<br>Κτηματογράφησης του άρθρου 7Α του ν. 2308/1995. Εφόσον η αγωγή δεν</p><p>απευθύνεται ή δεν επιδόθηκε νόμιμα σε κάποιον από τους νομιμοποιούμενους<br>παθητικά κατά τα προηγούμενα εδάφια, διατάσσεται υποχρεωτικά και αυτεπάγγελτα<br>από το Δικαστήριο η προσεπίκληση των απολιπομένων διαδίκων και κατά τα λοιπά<br>εφαρμόζεται το άρθρο 90 ΚΠολΔ. Κατά παρέκκλιση κάθε άλλης διάταξης, η αγωγή<br>της περ. α) θεωρείται ότι ασκήθηκε νόμιμα, ως προς όλες τις συνέπειές της, με μόνη<br>την κατάθεση και καταχώρισή της στο κτηματολογικό φύλλο κατά τα οριζόμενα στην<br>περ. ιβ) της παρ. 1 και στην παρ. 5 του άρθρου 12, μέσα στην προθεσμία της περ. α),<br>ακόμη και αν διαπιστωθεί ότι ο εναγόμενος έχει ήδη αποβιώσει πριν από την<br>κατάθεση ή την επίδοσή της εντός της προθεσμίας της παρ. 2 του άρθρου 215<br>ΚΠολΔ. Στην περίπτωση αυτή, ορίζεται δικάσιμος κατά το άρθρο 237 ΚΠολΔ, κατά<br>την οποία η δίκη διακόπτεται με μόνη τη δήλωση του λόγου της διακοπής από τον<br>ενάγοντα προς το δικαστήριο, η οποία καταχωρίζεται στα πρακτικά. Για την<br>επανάληψη της δίκης εφαρμόζονται ανάλογα τα άρθρα 289 έως 292 ΚΠολΔ. Αν<br>έχουν σημειωθεί στο κτηματολογικό φύλλο, σύμφωνα με τα οριζόμενα στην παρ. 2<br>του άρθρου 3Α του παρόντος, οι διάδοχοι του νομιμοποιούμενου, παθητικά η αγωγή<br>νόμιμα ασκείται κατ’ αυτών. Όταν η αγωγή στρέφεται κατά του Ελληνικού Δημοσίου,<br>που αναγράφεται ως δικαιούχος δικαιώματος στις αρχικές εγγραφές, δεν εφαρμόζεται<br>το άρθρο 8 του α.ν. 1539/1938 (Α΄ 488).<br>δ) Πριν από τη συζήτηση της αγωγής της περ.α) και επί ποινή απαραδέκτου της<br>συζήτησης ο ενάγων οφείλει να προσκαλέσει, με την αγωγή ή με ιδιαίτερο δικόγραφο,<br>όλους τους εναγόμενους, εκτός των προσώπων αγνώστου διαμονής, σε υποχρεωτική<br>αρχική συνεδρία διαμεσολάβησης ενώπιον κτηματολογικού διαμεσολαβητή που<br>επιλέγεται από ειδικό μητρώο, το οποίο καταρτίζεται και τηρείται σε ηλεκτρονική<br>μορφή από την Κεντρική Επιτροπή Διαμεσολάβησης του άρθρου 10 του ν.4640/2019<br>(Α’190). Σε περίπτωση αδικαιολόγητης μη εμφάνισης των εναγόμενων στην<br>υποχρεωτική αρχική συνεδρία επιβάλλεται αυξημένη δικαστική δαπάνη. Σε περίπτωση<br>επίτευξης συμφωνίας, το πρακτικό του διαμεσολαβητή καταχωρίζεται στο<br>κτηματολογικό φύλλο και διορθώνεται η ανακριβής κτηματολογική εγγραφή. Εάν με<br>την αγωγή ζητούνται και γεωμετρικές μεταβολές στα κτηματολογικά διαγράμματα,<br>επισυνάπτονται στο πρακτικό διαμεσολάβησης, επί ποινή ακυρότητας, το τοπογραφικό<br>διάγραμμα γεωμετρικών μεταβολών και το αποδεικτικό ηλεκτρονικής υποβολής του<br>στην ηλεκτρονική βάση του Φορέα, κατά τα οριζόμενα στην περ.ζ) της παρ.3. Ως προς<br>τα ζητήματα σχετικά με τη διαδικασία της υποχρεωτικής αρχικής συνεδρίας<br>διαμεσολάβησης, το περιεχόμενο και την ισχύ του πρακτικού διαμεσολάβησης<br>εφαρμόζονται αναλόγως τα οριζόμενα στην παρ. 3 του άρθρου 6, στο άρθρο 7 με την<br>επιφύλαξη του πρώτου εδαφίου της παρούσας, και στις παρ. 1 και 2 του άρθρου 8 του<br>ν.4640/2019 (Α’ 190), αντίστοιχα. Αν μεταξύ των διαδίκων εναγόμενο είναι το<br>Δημόσιο, Οργανισμοί Τοπικής Αυτοδιοίκησης ή νομικά πρόσωπα δημοσίου δικαίου,<br>κατά παρέκκλιση της παρ. 2 του άρθρου 6 του ν. 4640/2019 και κάθε άλλης αντίθετης<br>διάταξης, αυτοί συμμετέχουν στην Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης,<br>στην οποία εκπροσωπούνται από τον αρμόδιο λειτουργό του Νομικού Συμβουλίου του<br>Κράτους και από τους υπηρετούντες νομικούς συμβούλους ή δικηγόρους με έμμισθη<br>εντολή ή από δικηγόρους με ειδική προς τούτο πληρεξουσιότητα, αντιστοίχως. Οι<br>εκπρόσωποι των προσώπων του έκτου εδαφίου λαμβάνουν μέρος στην Υποχρεωτική</p><p>Αρχική Συνεδρία και υπογράφουν τα πρακτικά περάτωσης της Υποχρεωτικής Αρχικής<br>Συνεδρίας, της υπαγωγής σε διαδικασία διαμεσολάβησης και της επίτευξης ή μη<br>επίτευξης συμφωνίας. Για τα πρακτικά επίτευξης ή μη επίτευξης συμφωνίας<br>εφαρμόζεται η παρ.2 του άρθρου 8 του ν.4640/2019.<br>Ειδικότερα οι αρμόδιοι λειτουργοί του Νομικού Συμβουλίου του Κράτους<br>συμμετέχουν στην Υποχρεωτική Αρχική Συνεδρία, μέσω τηλεδιάσκεψης, εκτός εάν<br>εγγράφως δηλώσουν στον Διαμεσολαβητή ότι επιθυμούν τη συμμετοχή τους με φυσική<br>παρουσία. Στην περίπτωση του προηγούμενου εδαφίου και σε κάθε περίπτωση, που<br>εναγόμενο είναι το Δημόσιο, οι διάδικοι ενημερώνονται από τον διαμεσολαβητή<br>εγγράφως τριάντα (30) τουλάχιστον ημέρες πριν από τη διενέργεια της Υποχρεωτικής<br>Αρχικής Συνεδρίας και έως τη διενέργειά της παρέχεται στους αρμόδιους λειτουργούς<br>έγγραφο των αρμόδιων Υπηρεσιών σχετικά με την προβολή ή μη δικαιωμάτων του<br>Δημοσίου επί του δικαιώματος που προσβάλλεται με την ανακριβή πρώτη εγγραφή. Σε<br>περίπτωση μη παροχής του ανωτέρω εγγράφου παράγεται τεκμήριο περί μη προβολής<br>δικαιωμάτων του Δημοσίου. Η μη αποστολή του ανωτέρω εγγράφου, καθώς και η μη<br>έγκαιρη αποστολή του από τον υπάλληλο της αρμόδιας Υπηρεσίας συνιστά ειδικό<br>πειθαρχικό παράπτωμα, για το οποίο επιβάλλονται οι πειθαρχικές ποινές των περ. α)<br>έως ε) του άρθρου 109 του Κώδικα Κατάστασης Δημοσίων Πολιτικών Διοικητικών<br>Υπαλλήλων και Υπαλλήλων Ν.Π.Δ.Δ. (ν. 3528/2007, Α’ 26). Για τις προθεσμίες της<br>διαμεσολάβησης με εναγόμενο το Δημόσιο εφαρμόζεται το άρθρο 11 του κ.δ. της<br>26.6/10.7.1944 (Α’ 139), περί δικαστικών διακοπών και αναστολής προθεσμιών. Με<br>κοινή απόφαση των Υπουργών Εθνικής Οικονομίας και Οικονομικών και Δικαιοσύνης,<br>ορίζονται οι αμοιβές των διαμεσολαβητών και ρυθμίζονται όλες οι σχετικές<br>λεπτομέρειες για τον τρόπο καταβολής της αμοιβής.<br>ε) Η επίλυση της διαφοράς σύμφωνα με την περ. δ’ απαγορεύεται να υποκρύπτει άτυπη<br>μεταβίβαση του ακινήτου και υπόκειται σε διάρρηξη κατά τους όρους του άρθρου 939<br>του Αστικού Κώδικα.<br>στ) Σε περίπτωση επανάληψης της δίκης, σύμφωνα με τα οριζόμενα στην περ. γ), η<br>Γραμματεία του οικείου Μονομελούς ή Πολυμελούς Δικαστηρίου υποχρεούται να<br>διαβιβάσει αμελλητί και ηλεκτρονικά τα έγγραφα που υποβλήθηκαν στο δικαστήριο<br>για την απόδειξη του κληρονομικού δικαιώματος των διαδόχων στο αρμόδιο<br>Κτηματολογικό Γραφείο, το οποίο ακολουθεί αναλόγως τη διαδικασία που<br>προβλέπεται στην παρ. 2 του άρθρου 3Α, εφόσον δεν υπάρχει ήδη στο κτηματολογικό<br>φύλλο η σχετική σημείωση.<br>3.α ) Στην περίπτωση των αρχικών εγγραφών με την ένδειξη «αγνώστου ιδιοκτήτη»<br>κατά την έννοια της παραγράφου 1 του άρθρου 9, όταν ζητείται η διόρθωση αντί της<br>προβλεπόμενης στην παράγραφο 2 αγωγής, η διόρθωση μπορεί να ζητηθεί με αίτηση<br>εκείνου που ισχυρίζεται ότι έχει εγγραπτέο στο Κτηματολόγιο δικαίωμα, η οποία<br>υποβάλλεται ενώπιον του Κτηματολογικού Δικαστή της τοποθεσίας του ακινήτου και,<br>μέχρις ότου ορισθεί αυτός, στο Μονομελές Πρωτοδικείο της τοποθεσίας του ακινήτου<br>που δικάζει κατά τη διαδικασία της εκούσιας δικαιοδοσίας.<br>Εντός προθεσμίας είκοσι (20) ημερών από την κατάθεση της αιτήσεως του πρώτου<br>εδαφίου και επί ποινή απαραδέκτου, η αίτηση αυτή κοινοποιείται από τον αιτούντα στο</p><p>Ελληνικό Δημόσιο και εγγράφεται στο κτηματολογικό φύλλο του ακινήτου. Τα<br>ανωτέρω ισχύουν και στην περίπτωση της κύριας παρέμβασης. Εάν στο κτηματολογικό<br>φύλλο του ακινήτου έχουν ήδη καταχωρισθεί και άλλες αιτήσεις ή κύριες παρεμβάσεις<br>με αντίστοιχο περιεχόμενο, η μεταγενέστερη αίτηση κοινοποιείται από τον αιτούντα<br>επί ποινή απαραδέκτου και εντός της ως άνω προθεσμίας στους προηγούμενους<br>αιτούντες ή κυρίως παρεμβαίνοντες. Η κοινοποίηση της αιτήσεως στις ανωτέρω<br>περιπτώσεις γίνεται με επίδοση επικυρωμένου αντιγράφου της. Εφόσον η αίτηση γίνει<br>τελεσιδίκως δεκτή, διορθώνεται η εγγραφή. Εάν η αίτηση απορριφθεί ως νομικά ή<br>ουσιαστικά αβάσιμη, ο αιτών μπορεί να ασκήσει αγωγή κατά του Ελληνικού Δημοσίου<br>υπό τις προϋποθέσεις της παραγράφου 2.Η κατάθεση και κοινοποίηση, σύμφωνα με τα<br>παραπάνω, της αίτησης για τη διόρθωση της εγγραφής διακόπτει την προθεσμία για<br>την έγερση της αγωγής της παραγράφου 2. Η προθεσμία που διακόπηκε θεωρείται σαν<br>να μη διακόπηκε, αν ο αιτών παραιτηθεί από την αίτηση ή αν αυτή απορριφθεί<br>τελεσιδίκως για οποιονδήποτε λόγο. Αν ο δικαιούχος ασκήσει κατά του Ελληνικού<br>Δημοσίου την αγωγή της παραγράφου 2 μέσα σε έξι (6) μήνες από την παραίτηση από<br>την αίτηση ή από την τελεσίδικη απόρριψη της, θεωρείται ότι η προθεσμία διακόπηκε<br>με την κατάθεση και κοινοποίηση της αίτησης αυτής.<br>αα) Όταν η διόρθωση αφορά σε ανακριβή αρχική εγγραφή δικαιώματος που έχει<br>καταχωριστεί μερικά με την ένδειξη «αγνώστου ιδιοκτήτη» και μερικά υπέρ τρίτου<br>προσώπου που αναγράφεται ως δικαιούχος, τότε ασκείται η αγωγή της παραγράφου 2,<br>που απευθύνεται κατά του Ελληνικού Δημοσίου και κατά του αναγραφόμενου ως<br>δικαιούχου του δικαιώματος στο οποίο αφορά η εγγραφή κατά τα ειδικότερα οριζόμενα<br>στην παράγραφο αυτή. Το ίδιο ισχύει και για τη διόρθωση αρχικών εγγραφών επί<br>ακινήτου, που τμήματα του έχουν καταχωριστεί με την ένδειξη «αγνώστου ιδιοκτήτη»<br>και υπέρ τρίτου προσώπου που αναγράφεται ως δικαιούχος.<br>ββ) Κατ’ εξαίρεση όσων ορίζονται στην περ. α΄, όταν πρόκειται για διόρθωση αρχικής<br>εγγραφής επί γεωτεμαχίου με την ένδειξη «αγνώστου ιδιοκτήτη» κατά την έννοια της<br>παρ. 1 του άρθρου 9 και ο δικαιούχος επικαλείται ως τίτλο κτήσης την έκτακτη<br>χρησικτησία, ασκείται η αγωγή της παρ. 2 που απευθύνεται κατά του Ελληνικού<br>Δημοσίου. Όταν η διόρθωση αφορά σε οριζόντια ή κάθετη ιδιοκτησία, με την ένδειξη<br>«άγνωστου ιδιοκτήτη», αντί της αγωγής της παρ. 2 του άρθρου 6, ασκείται η αίτηση<br>της περ. α΄ της παρούσας παραγράφου, ακόμη και εάν ο αιτών επικαλείται ως τίτλο<br>κτήσης την έκτακτη χρησικτησία.<br>β) Με την αίτηση της περίπτωσης α\` μπορεί να ζητηθεί η διόρθωση της εγγραφής και<br>στην περίπτωση που ο αιτών επικαλείται ως τίτλο κτήσης πράξη μεταγραπτέα κατά την<br>κείμενη νομοθεσία, η οποία δεν έχει μεταγραφεί στο υποθηκοφυλακείο. Στην<br>περίπτωση αυτή, με την αίτηση ζητείται η διόρθωση της πρώτης εγγραφής και η<br>καταχώριση του δικαιώματος στο φερόμενο στο μη μεταγεγραμμένο τίτλο ως<br>αποκτώντα, εφόσον συντρέχουν όλες, οι κατά το ουσιαστικό δίκαιο, προϋποθέσεις για<br>την κτήση του δικαιώματος.»<br>γ) Για τη διόρθωση εγγραφής που διατάσσεται με απόφαση του Κτηματολογικού<br>Δικαστή, σύμφωνα με τις διατάξεις της παραγράφου αυτής, υποβάλλεται στο<br>Κτηματολογικό Γραφείο αίτηση από όποιον έχει έννομο συμφέρον. Με την αίτηση<br>συνυποβάλλονται η απόφαση και τα έγγραφα, από τα οποία προκύπτει ότι η απόφαση</p><p>έχει καταστεί τελεσίδικη. Στην περίπτωση β\` της παρούσας παραγράφου<br>καταβάλλονται ταυτόχρονα τα τέλη και δικαιώματα της παραγράφου 2 του άρθρου4.<br>Κατά τα λοιπά, εφαρμόζεται αναλόγως η παράγραφος 3 του όρθρου 17.<br>δ) Εφόσον η αίτηση ενώπιον του Κτηματολογικού Δικαστή γίνει τελεσιδίκως δεκτή<br>κατά τα ανωτέρω και εφόσον διορθωθεί η εγγραφή, κάθε τρίτος, που αμφισβητεί την<br>ακρίβεια της διορθωμένης εγγραφής, μπορεί να ζητήσει τη διόρθωση της εγγραφής<br>αυτής με αγωγή κατά του υπέρ ου η διόρθωση, υπό τις προϋποθέσεις και εντός της<br>προθεσμίας της παραγράφου 2 του άρθρου αυτού. Κατά τα λοιπά, εφαρμόζονται<br>αναλόγως οι διατάξεις των άρθρων 7 και 7α του νόμου αυτού."<br>ε) Για τη συζήτηση ενώπιον δικαστηρίου αγωγών και αιτήσεων, σύμφωνα με τα<br>οριζόμενα στην παράγραφο 2 και στην παρούσα παράγραφο, προσκομίζεται, με ποινή<br>απαραδέκτου, αντίγραφο κτηματολογικού φύλλου και απόσπασμα κτηματολογικού<br>διαγράμματος του ακινήτου στο οποίο αφορά η διόρθωση. Σε περίπτωση που το αίτημα<br>της αγωγής ή της αίτησης διόρθωσης αφορά σε αλλαγές και στα κτηματολογικά<br>διαγράμματα, κατά τη συζήτηση της αγωγής ή της αίτησης και με ποινή απαραδέκτου,<br>αντί του αποσπάσματος του κτηματολογικού διαγράμματος προσκομίζεται<br>τοπογραφικό διάγραμμα γεωμετρικών μεταβολών, στο οποίο αποτυπώνεται η όποια<br>γεωμετρική μεταβολή επέρχεται με την αιτούμενη διόρθωση. Στην τελευταία<br>περίπτωση προσκομίζεται, με ποινή απαραδέκτου, και η εισήγηση του<br>Κτηματολογικού Γραφείου ή, εάν αυτό δεν έχει συσταθεί και το υφιστάμενο<br>Υποθηκοφυλακείο εξακολουθεί να λειτουργεί μεταβατικά ως Κτηματολογικό Γραφείο,<br>της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή<br>μετονομάζεται, για τη συνδρομή των τεχνικών προϋποθέσεων της απεικόνισης της<br>γεωμετρικής μεταβολής που επέρχεται με την αιτούμενη διόρθωση στα κτηματολογικά<br>διαγράμματα. Οι ίδιες προϋποθέσεις ισχύουν και για τη συζήτηση ενώπιον δικαστηρίου<br>αιτήσεων και προσφυγών που ασκούνται κατά τα άρθρα 18 παράγραφος 2 και 19<br>παράγραφος 2 για τη διόρθωση πρόδηλων σφαλμάτων και σφαλμάτων που αφορούν<br>σε γεωμετρικά στοιχεία των πρώτων κτηματολογικών εγγραφών.<br>στ) Όταν ο τίτλος κτήσης του δικαιώματος που προσβάλλεται με την ανακριβή<br>εγγραφή και για το οποίο ζητείται η διόρθωση είναι χρησικτησία, η συμπλήρωση της<br>νομής υπολογίζεται κατά το χρόνο άσκησης της αγωγής της παραγράφου 2 ή της<br>αίτησης της περίπτωσης α\` της παρούσας παραγράφου, υπό την επιφύλαξη των<br>οριζομένων στην υποπερίπτωση ββ\` της ίδιας περίπτωσης της παρούσας παραγράφου<br>και εντός της προθεσμίας που ορίζεται στις περιπτώσεις α\` και β\` της παραγράφου 2<br>του παρόντος άρθρου. Η διάταξη του προηγούμενου εδαφίου εφαρμόζεται και στις<br>αγωγές και αιτήσεις που ασκήθηκαν πριν από την έναρξη ισχύος του παρόντος νόμου<br>υπό την προϋπόθεση ότι δεν έχουν ακόμη συζητηθεί σε πρώτο ή δεύτερο βαθμό. Οι<br>διατάξεις των προηγούμενων δύο εδαφίων δεν θίγουν τις σχετικές διατάξεις που<br>ισχύουν για το Δημόσιο και ιδίως εκείνες των περιπτώσεων α\` και β\` της παραγράφου<br>1 του άρθρου 4 του ν. 3127/2003.<br>ζ) Αντί της προσκόμισης του τοπογραφικού διαγράμματος γεωμετρικών μεταβολών και<br>της εισήγησης για τη συνδρομή των τεχνικών προϋποθέσεων της απεικόνισης της<br>γεωμετρικής μεταβολής της περίπτωσης ε΄, προσαρτάται, με ποινή απαραδέκτου, στο<br>δικόγραφο της αγωγής, της αίτησης ή της προσφυγής που ασκείται και κατατίθεται</p><p>ενώπιον δικαστηρίου, σύμφωνα με τα οριζόμενα στις παραγράφους 2, 3 και 8 του<br>άρθρου 6, στην παράγραφο 2 του άρθρου 18 και στην παράγραφο 2 του άρθρου 19,<br>τοπογραφικό διάγραμμα γεωμετρικών μεταβολών, όπου αποτυπώνεται η επερχόμενη<br>με την αιτούμενη διόρθωση γεωμετρική μεταβολή και ο συντάκτης μηχανικός<br>υποχρεούται να δηλώνει, εάν η απεικόνιση στο ίδιο διάγραμμα της γεωμετρικής<br>μεταβολής, είναι τεχνικά εφαρμόσιμη και δεκτική εισαγωγής στην τηρούμενη<br>κτηματολογική βάση. Για το τοπογραφικό διάγραμμα γεωμετρικών μεταβολών του<br>προηγούμενου εδαφίου διενεργείται, υποχρεωτικά, ηλεκτρονική υποβολή από τον<br>συντάκτη μηχανικό στον ψηφιακό υποδοχέα που λειτουργεί στη βάση δεδομένων του<br>Φορέα "Ελληνικό Κτηματολόγιο", σύμφωνα με τις διατάξεις του άρθρου 40 του ν.<br>4409/2016 (Α΄136) και των κανονιστικών πράξεων που έχουν εκδοθεί κατ’<br>εξουσιοδότηση αυτού. Το εκδιδόμενο από την ηλεκτρονική εφαρμογή αποδεικτικό<br>υποβολής του ιδίου άρθρου προσαρτάται με ποινή απαραδέκτου στο οικείο δικόγραφο.<br>η) Με απόφαση του Υπουργού Περιβάλλοντος και Ενέργειας καθορίζεται η μορφή και<br>το περιεχόμενο του τοπογραφικού διαγράμματος γεωμετρικών μεταβολών της<br>περίπτωσης ζ΄ της παραγράφου 3 του άρθρου 6 και της παραγράφου 5α του άρθρου 13,<br>το περιεχόμενο της δήλωσης του συντάκτη μηχανικού και κάθε άλλο θέμα τεχνικού και<br>λεπτομερειακού χαρακτήρα. Με την ίδια απόφαση ορίζεται η έναρξη ισχύος της<br>υποχρέωσης και των συνεπειών των άνω διατάξεων, από την οποία καταργείται η<br>υποχρέωση για την προσκόμιση του τοπογραφικού διαγράμματος γεωμετρικών<br>μεταβολών και της εισήγησης για τη συνδρομή των τεχνικών προϋποθέσεων της<br>απεικόνισης της γεωμετρικής μεταβολής για την παραδεκτή συζήτηση ενώπιον<br>δικαστηρίου αγωγών και αιτήσεων των παραγράφων 2, 3 και 8 του άρθρου 6, της<br>παραγράφου 2 του άρθρου 13, καθώς και αιτήσεων και προσφυγών της παραγράφου 2<br>του άρθρου 18 και της παραγράφου 2 του άρθρου 19.<br>θ). Οι δασικές υπηρεσίες της παρ. 10 του άρθρου 28 εξαιρούνται από τις περ. ζ’ και η’<br>της παρούσας, καθώς και από την παρ. 5α του άρθρου 13 και υποχρεούνται, επί ποινή<br>απαραδέκτου, σύμφωνα με τις παρ. 2, 3 και 8 του άρθρου 6, την παρ. 2 του άρθρου 18<br>και την παρ. 2 του άρθρου 19, να προσαρτούν στο δικόγραφο της αγωγής, της αίτησης<br>ή της προσφυγής: α) αντίγραφο διαγράμματος που έχει παραχθεί από τον δασικό χάρτη<br>και β) διάγραμμα γεωμετρικών μεταβολών, που εκδίδεται από τη βάση δεδομένων του<br>φορέα «Ελληνικό Κτηματολόγιο», όπου αποτυπώνεται η επερχόμενη με την αιτούμενη<br>διόρθωση γεωμετρική μεταβολή. Με κοινή απόφαση των Υπουργών Περιβάλλοντος<br>και Ενέργειας και Ψηφιακής Διακυβέρνησης καθορίζονται η διαδικασία έκδοσης, η<br>μορφή και το περιεχόμενο του ανωτέρω διαγράμματος γεωμετρικών μεταβολών και<br>κάθε άλλο θέμα τεχνικού και λεπτομερειακού χαρακτήρα.<br>4. α) Κατ\` εξαίρεση των οριζομένων στις παραγράφους 2 και 3, αν το δικαίωμα που<br>καταχωρίστηκε στην αρχική εγγραφή είχε μεταβιβαστεί, αλλοιωθεί, επιβαρυνθεί ή<br>καταργηθεί δυνάμει δικαιοπραξίας, διοικητικής πράξης, δικαστικής απόφασης ή άλλης<br>διαδικαστικής πράξης, που καταχωρίσθηκε στα βιβλία του υποθηκοφυλακείου πριν<br>από την ημερομηνία καταχώρισης των πρώτων εγγραφών, η διόρθωση της αρχικής<br>εγγραφής δεν απαιτείται να γίνει με αμετάκλητη δικαστική απόφαση. Στην περίπτωση<br>αυτή, η επαγόμενη τη μεταβίβαση, αλλοίωση, επιβάρυνση ή κατάργηση του<br>εγγραπτέου δικαιώματος πράξη καταχωρίζεται κατά μεταφορά από τα οικεία βιβλία</p><p>του υποθηκοφυλακείου στο κτηματολογικό φύλλο του ακινήτου με αίτηση του<br>δικαιούχου ή και κάθε τρίτου, που έχει έννομο συμφέρον, σύμφωνα με τα άρθρα 14<br>έως και 16, υπό την προϋπόθεση ότι δεν έχει στο μεταξύ μεσολαβήσει άλλη,<br>ασυμβίβαστη κατά περιεχόμενο, εγγραφή στο κτηματολογικό φύλλο. Στην περίπτωση<br>των πάσης φύσεως βαρών, τα οποία νομίμως έχουν συσταθεί και βαρύνουν την<br>κυριότητα ή άλλο εγγραπτέο δικαίωμα, η παρούσα διάταξη εφαρμόζεται ανεξαρτήτως<br>του εάν η καταχώριση της συστατικής του βάρους πράξης στα βιβλία του<br>υποθηκοφυλακείου είναι προγενέστερη της κτήσεως του καταχωρισθέντος στο<br>Κτηματολόγιο δικαιώματος. Η εξάλειψη των βαρών αυτών, που δεν έχουν<br>καταχωρισθεί στο Κτηματολόγιο, μπορεί σε κάθε περίπτωση να διενεργηθεί και επί<br>των βιβλίων του υποθηκοφυλακείου, χωρίς να γίνει η μεταφορά τους στο<br>κτηματολογικό φύλλο του ακινήτου προς το σκοπό της εξαλείψεως.<br>β) Η αίτηση της περίπτωσης α\` που δεν επιβαρύνεται με τέλη και δικαιώματα,<br>αναλογικά ή πάγια, υποβάλλεται εντός της προθεσμίας που ισχύει για την αγωγή της<br>παραγράφου 2, μετά την άπρακτη πάροδο της οποίας ισχύουν τα οριζόμενα στα άρθρα<br>7 και 7α. Με την αίτηση συνυποβάλλονται επικυρωμένα αντίγραφα των δημοσίων<br>εγγράφων και πιστοποιητικά εγγραφής τους στα βιβλία του οικείου<br>υποθηκοφυλακείου, από τα οποία προκύπτει η νόμιμη μεταβίβαση, αλλοίωση,<br>επιβάρυνση ή κατάργηση του καταχωρισθέντος στις αρχικές κτηματολογικές εγγραφές<br>εγγραπτέου δικαιώματος. Η αποδοχή ή η απόρριψη της αίτησης γίνεται χωρίς υπαίτια<br>καθυστέρηση και πάντως σε χρόνο όχι μεγαλύτερο των πέντε (5) εργάσιμων ημερών<br>από την ημερομηνία υποβολής της. Η καταχώριση στα κτηματολογικά φύλλα της<br>πράξης για την οποία έχει υποβληθεί αίτηση γίνεται κατόπιν απόφασης του<br>Προϊσταμένου του Κτηματολογικού Γραφείου, εφόσον συντρέχουν όλες οι<br>απαιτούμενες προς τούτο προϋποθέσεις. Χρόνος καταχώρισης στα κτηματολογικά<br>φύλλα θεωρείται η ημερομηνία υποβολής της αίτησης για την καταχώριση. Κατά τα<br>λοιπά ισχύουν τα οριζόμενα στις παραγράφους 2, 3, 4 και 4α του άρθρου 16.<br>γ) Κατά της απόφασης του Προϊσταμένου, θετικής ή αρνητικής, ο αιτών, ο αρχικός<br>εγγεγραμμένος και κάθε τρίτος που έχει έννομο συμφέρον μπορούν να υποβάλουν<br>αντιρρήσεις ενώπιον του Κτηματολογικού Δικαστή κατά τα οριζόμενα στην<br>παράγραφο 5 του άρθρου 16 του νόμου αυτού. Για τη διορθωμένη εγγραφή, που<br>καταχωρίστηκε στο κτηματολογικό βιβλίο σύμφωνα με τις διατάξεις της παρούσας<br>παραγράφου, ισχύουν αναλόγως τα οριζόμενα στο άρθρο 8. Η κατά το ουσιαστικό<br>δίκαιο αρχή της χρονικής προτεραιότητας των πάσης φύσεως δικαιωμάτων και βαρών<br>δεν επηρεάζεται από τη χρονολογική σειρά διόρθωσης των πρώτων εγγραφών,<br>σύμφωνα με τις διατάξεις της παραγράφου αυτής.<br>4α. Για τις πράξεις που καταχωρίζονται στα βιβλία του υποθηκοφυλακείου τις<br>τελευταίες τριάντα (30) εργάσιμες ημέρες πριν από την έναρξη ισχύος του<br>Κτηματολογίου, σύμφωνα με την παρ. 3 του άρθρου 1 του ν. 2664/1998, την αίτηση<br>της προηγούμενης παραγράφου αναπληροί η απευθυνόμενη προς τον υποθηκοφύλακα<br>αίτηση για καταχώριση της πράξης στα βιβλία του υποθηκοφυλακείου. Στις<br>περιπτώσεις αυτές και εφόσον συντρέχουν οι αναφερόμενες στην προηγούμενη<br>παράγραφο ουσιαστικές προϋποθέσεις για την καταχώριση της πράξης στο<br>κτηματολογικό φύλλο του ακινήτου, ο Προϊστάμενος του Κτηματολογικού Γραφείου</p><p>καταχωρίζει την πράξη αυτεπαγγέλτως, χωρίς να απαιτείται ειδοποίηση του θιγομένου<br>από την καταχώριση, ακόμη και αν επέρχεται χωρική μεταβολή, η οποία διενεργείται<br>οίκοθεν με βάση το συνημμένο στην πράξη διάγραμμα, αντίγραφο του οποίου<br>προσκομίζει κατά τη μεταγραφή ο ενδιαφερόμενος. Εφόσον το υποθηκοφυλακείο, στα<br>βιβλία του οποίου καταχωρίζονται οι πράξεις αυτές, δεν θα είναι αρμόδιο για την<br>τήρηση των στοιχείων του Κτηματολογίου, ο υποθηκοφύλακας που προΐσταται αυτού<br>διαβιβάζει αυτεπαγγέλτως προς το αρμόδιο Κτηματολογικό Γραφείο περιλήψεις των<br>πράξεων που καταχωρίσθηκαν στα βιβλία του εντός της ως άνω προθεσμίας, αφού<br>προηγουμένως ενημερωθεί από τον Ο.Κ.Χ.Ε. για την επικείμενη λειτουργία του<br>συστήματος του Κτηματολογίου.<br>Λεπτομέρειες για το έντυπο και τη διαδικασία διαβίβασης των στοιχείων αυτών<br>καθορίζονται με απόφαση του Ο.Κ.Χ.Ε.. Κατά τα λοιπά, εφαρμόζονται οι διατάξεις της<br>προηγούμενης παραγράφου.<br>4β. Αν, μετά την έναρξη ισχύος του Κτηματολογίου σύμφωνα με την παράγραφο 3 του<br>άρθρου 1 του παρόντος, ανασταλεί η τήρηση των κτηματολογικών βιβλίων σε<br>συμμόρφωση προς δικαστική απόφαση λόγω προσβολής της απόφασης για την<br>περαίωση της διαδικασίας κτηματογράφησης και την έναρξη ισχύος του<br>Κτηματολογίου, σύμφωνα με τις διατάξεις του άρθρου 11 του ν. 2308/1995 και του<br>άρθρου 3 του παρόντος, μετά την άρση της αναστολής, ο Προϊστάμενος του<br>Κτηματολογικού Γραφείου καταχωρίζει αυτεπάγγελτα στα κτηματολογικά βιβλία κατά<br>μεταφορά από τα βιβλία του Υποθηκοφυλακείου τις πράξεις που καταχωρίστηκαν σ’<br>αυτά το διάστημα ισχύος της αναστολής. Κατά τα λοιπά εφαρμόζεται αναλόγως η<br>παράγραφος 4α του παρόντος.<br>4γ. Σε περίπτωση υποβολής σε αρμόδιο Κτηματολογικό Γραφείο ή Υποκατάστημα<br>αίτησης προς εγγραφή δικαστικής απόφασης, διαταγής πληρωμής, πρακτικού<br>διαμεσολάβησης ή άλλης πράξης ή διαταγής που αναγνωρίζεται από τον νόμο ως<br>τίτλος για εξάλειψη εμπράγματου βάρους, το οποίο δεν εμφαίνεται στις αρχικές<br>κτηματολογικές εγγραφές, η αίτηση αυτή λογίζεται ότι περιλαμβάνει και αίτηση της<br>παρ. 4 για την εγγραφή του βάρους στο κτηματολογικό φύλλο του ακινήτου κατά<br>μεταφορά από τα βιβλία του υποθηκοφυλακείου.<br>Στην περίπτωση αυτή το αρμόδιο Κτηματολογικό Γραφείο ή το Υποκατάστημα, κατ’<br>εξαίρεση του τετάρτου εδαφίου της περ. α) της παρ. 4, καταχωρίζει στα κτηματολογικά<br>βιβλία το εμπράγματο βάρος, σύμφωνα με τα στοιχεία της εγγραφής, όπως<br>αναγράφονται στην προς καταχώριση εγγραπτέα πράξη εξάλειψης, και την εξάλειψη<br>του βάρους αυτού, αμέσως μετά από την καταχώρισή του.<br>Με ποινή απαραδέκτου της συζήτησης της αίτησης ενώπιον του αρμόδιου δικαστηρίου<br>για την έκδοση της δικαστικής απόφασης ή της διαταγής πληρωμής ή της πράξης<br>δικηγόρου για την εξάλειψη εμπράγματου βάρους, καθώς και με ποινή ακυρότητας του<br>πρακτικού διαμεσολάβησης ή της πράξης ή διαταγής που αναγνωρίζεται από τον νόμο<br>ως τίτλος για την εξάλειψη εμπράγματου βάρους, στις ίδιες αιτήσεις και πράξεις<br>αναγράφονται τα πλήρη στοιχεία του προς εξάλειψη εμπράγματου βάρους, και<br>ειδικότερα:<br>α) Τα στοιχεία του αρχικού τίτλου εγγραφής του βάρους, δηλαδή: αα) είδος, αβ)<br>αριθμός, αγ) ημερομηνία και αδ) εκδούσα αρχή ή δικαστήριο.</p><p>β) Τα στοιχεία του καθ’ ου και του υπέρ ου η εγγραφή του βάρους.<br>γ) Το ποσό της εγγραφής του βάρους.<br>δ) Τα στοιχεία της εγγραφής του βάρους, δηλαδή: δα) το αρμόδιο υποθηκοφυλακείο,<br>δβ) τόμος, δγ) αριθμός και δδ) ημερομηνία εγγραφής.<br>5. Με κοινή απόφαση των Υπουργών Περιβάλλοντος, Χωροταξίας και Δημόσιων<br>\`Εργων και Δικαιοσύνης, που εκδίδεται ύστερα από εισήγηση του Ο.Κ.Χ.Ε., μπορούν<br>να ρυθμίζονται θέματα που αφορούν στον τρόπο ενημέρωσης των κτηματολογικών<br>βιβλίων, κατ\` εξαίρεση όσων ορίζονται στις παραγράφους 2 και3 του παρόντος άρθρου,<br>για τυχόν μεταβoλές που έχουν συντελεσθεί στα κτηματογραφηθέντα ακίνητα πριν από<br>την ημερομηνία καταχώρισης των πρώτων εγγραφών συνεπεία διοικητικών πράξεων<br>από εκείνες που αναφέρονται στο άρθρο12 παρ 2 του νόμoυ αυτού και οι οποίες για<br>οποιονδήποτε λόγο δεν αποτυπώθηκαν εν όλω ή εν μέρει κατά τις πρώτες εγγραφές<br>στα κτηματολογικά βιβλία.<br>6. Με κοινή απόφαση των Υπουργών Περιβάλλοντος, Χωροταξίας και Δημόσιων<br>Έργων, Δικαιοσύνης και Γεωργίας, που εκδίδεται ύστερα από εισήγηση του ΟΚ.Χ.Ε,<br>μπορούν να ρυθμίζονται, κατ\` εξαίρεση όσων ορίζονται στις παραγράφους 2 και 3 του<br>παρόντος άρθρου, οι μεταβολές που συνεπάγεται για τις πρώτες εγγραφές η εντός της<br>προθεσμίας της παραγράφου 2 του παρόντος άρθρου κύρωση δασικού χάρτη<br>7. Με κοινή απόφαση των υπουργών Περιβάλλοντος, Χωροταξίας και Δημόσιων<br>‘Έργων και Οικονομίας και Οικονομικών, που εκδίδεται ύστερα από εισήγηση του<br>Ο.Κ.Χ.Ε., μπορούν να ρυθμίζονται, κατ\` εξαίρεση όσων ορίζονται στις παραγράφους<br>2 και 3 του παρόντος άρθρου, οι μεταβολές που συνεπάγεται για τις πρώτες εγγραφές<br>ο εντός της προθεσμίας της παραγράφου 2 του παρόντος άρθρου καθορισμός της<br>οριογραμμής του αιγιαλού, της παραλίας και του παλαιού αιγιαλού ή της όχθης, της<br>παρόχθιας ζώνης, της παλαιάς όχθης ή ο επανακαθορισμός τους κατ\` εφαρμογή της<br>παρ, 9 του άρθρου 5 του Ν. 2971/2001,καθώς και η αποδοχή αιτήσεως θεραπείας κατ\`<br>εφαρμογή των άρθρων 8 και 9 του Α.Ν. 1539/1938.<br>8. α) Με την επιφύλαξη όσων ορίζονται στο άρθρο 20, εκείνος που καταχωρίσθηκε στις<br>πρώτες εγγραφές ως δικαιούχος εγγραπτέου δικαιώματος, καθώς και οι καθολικοί ή<br>ειδικοί του διάδοχοι, μπορούν, εντός της προθεσμίας της παρ. 2 του άρθρου 6, να<br>ζητήσουν με αίτησή τους, η οποία υποβάλλεται ενώπιον του Κτηματολογικού Δικαστή<br>και μέχρι τον ορισμό του τελευταίου ενώπιον του Μονομελούς Πρωτοδικείου της<br>περιφέρειας του Κτηματολογικού Γραφείου, τη διόρθωση στοιχείων της πρώτης<br>εγγραφής, περιγραφικών, γεωμετρικών ή άλλων, τα οποία δεν εμπίπτουν στο πεδίο<br>εφαρμογής του άρθρου 20α. Με την αίτηση αυτή δεν επιτρέπεται, επί ποινή<br>απαραδέκτου, να τίθενται υπό αμφισβήτηση τα δικαιώματα συνδικαιούχων, τα όρια<br>όμορων ακινήτων ή τα δικαιώματα τρίτων προσώπων επ’ αυτών. Εντός προθεσμίας<br>τριάντα (30) ημερών από την κατάθεσή της και επί ποινή απαραδέκτου, η αίτηση<br>καταχωρίζεται στο κτηματολογικό φύλλο του ακινήτου.<br>β) Ο Κτηματολογικός Δικαστής δικάζει κατά τη διαδικασία της εκούσιας δικαιοδοσίας.<br>Για τη συζήτηση της αίτησης προσκομίζεται, με ποινή απαραδέκτου, αντίγραφο<br>κτηματολογικού φύλλου και απόσπασμα κτηματολογικού διαγράμματος του ακινήτου<br>στο οποίο αφορά η διόρθωση. Σε περίπτωση που το αίτημα της αίτησης αφορά σε<br>αλλαγές και στα κτηματολογικά διαγράμματα, κατά τη συζήτηση της αίτησης και με</p><p>ποινή απαραδέκτου, αντί του αποσπάσματος του κτηματολογικού διαγράμματος,<br>προσκομίζεται τοπογραφικό διάγραμμα γεωμετρικών μεταβολών, στο οποίο<br>αποτυπώνεται η όποια γεωμετρική μεταβολή επέρχεται με την αιτούμενη διόρθωση.<br>Στην τελευταία περίπτωση προσκομίζεται, με ποινή απαραδέκτου, και η εισήγηση του<br>Κτηματολογικού Γραφείου ή, εάν αυτό δεν έχει συσταθεί και το υφιστάμενο<br>Υποθηκοφυλακείο εξακολουθεί να λειτουργεί μεταβατικά ως Κτηματολογικό Γραφείο,<br>της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή<br>μετονομάζεται, για τη συνδρομή των τεχνικών προϋποθέσεων της απεικόνισης της<br>γεωμετρικής μεταβολής που επέρχεται με την αιτούμενη διόρθωση στα κτηματολογικά<br>διαγράμματα. Εφόσον η αίτηση γίνει τελεσιδίκως δεκτή, διορθώνεται η εγγραφή.<br>γ) Για τη διόρθωση εγγραφής που διατάσσεται με απόφαση του Κτηματολογικού<br>Δικαστή, σύμφωνα με τις διατάξεις της παραγράφου αυτής, υποβάλλεται στο<br>Κτηματολογικό Γραφείο αίτηση από όποιον έχει έννομο συμφέρον. Με την αίτηση<br>συνυποβάλλονται η απόφαση και τα έγγραφα, από τα οποία προκύπτει ότι η απόφαση<br>έχει καταστεί τελεσίδικη. Κατά τα λοιπά, εφαρμόζεται αναλόγως η παρ. 3 του άρθρου<br>17.</p>
</div>
<div id="art-7" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 7 — Οριστικοποίηση των πρώτων εγγραφών και έννομα αποτελέσματα αυτής</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Οι πρώτες εγγραφές, των οποίων δεν αμφισβητήθηκε η ακρίβεια ενώπιον των<br>δικαστηρίων μέσα στην προθεσμία της παραγράφου 2 του άρθρου 6, καθίστανται<br>οριστικές και παράγουν αμάχητο τεκμήριο υπέρ των φερόμενων με τις πρώτες αυτές<br>εγγραφές ως δικαιούχων για τα δικαιώματα στα οποία αυτές αφορούν.<br>2. Από τη δημιουργία του κατά την προηγούμενη παράγραφο αμάχητου τεκμηρίου<br>αποκλείεται οποιαδήποτε μεταβολή του περιεχομένου των πρώτων εγγραφών. Σε<br>περίπτωση ανακριβούς πρώτης εγγραφής ο πραγματικός δικαιούχος έχει ενοχική μόνον<br>αξίωση κατά του αναφερόμενου ανακριβώς ως δικαιούχου για την απόδοση του<br>πλουτισμού από τη δημιουργία του αμάχητου τεκμηρίου. Αντικείμενο της αξίωσης<br>αυτής είναι η κατά τον χρόνο της δημιουργίας του αμάχητου τεκμηρίου χρηματική αξία<br>του ακινήτου στο οποίο αφορά (ολικά ή μερικά) η ανακριβής εγγραφή. Δεν αποκλείεται<br>επίσης αξίωση αποζημίωσης, αν συντρέχουν οι προϋποθέσεις της ευθύνης από<br>αδικοπραξία. Απόδοση αυτουσίως είτε του όλου είτε μέρους του ακινήτου στο οποίο<br>αφορά η ανακριβής πρώτη εγγραφή, κατά τις διατάξεις του αδικαιολόγητου<br>πλουτισμού, καθώς επίσης αποκατάσταση της προηγούμενης κατάστασης κατά το<br>άρθρο 297 του Αστικού Κώδικα σε περίπτωση αξίωσης αποζημίωσης είναι δυνατή,<br>ύστερα από σχετικό αίτημα του δικαιούχου, μόνον όταν για το ακίνητο στο οποίο<br>αφορά η ανακριβής εγγραφή δεν έχει ήδη χωρίσει ειδική διαδοχή από επαχθή αιτία και<br>εγγραφή αυτής στο Κτηματολογικό βιβλίο. Όταν με την αγωγή ζητείται η αυτούσια<br>απόδοση του πλουτισμού ή αποκατάσταση της προηγούμενης κατάστασης, το<br>δικόγραφο καταχωρίζεται στο κτηματολογικό φύλλο του ακινήτου εντός τριάντα (30)<br>ημερών από την κατάθεσή του, αλλιώς απορρίπτεται και αυτεπαγγέλτως ως<br>απαράδεκτο. Σε κάθε περίπτωση, η διαφορά, αν αυτή δεν υπάγεται στο Πολυμελές<br>Πρωτοδικείο, εκδικάζεται από τον κτηματολογικό δικαστή, που επιλαμβάνεται της<br>υποθέσεως ως Μονομελές Πρωτοδικείο κατά τις διατάξεις της αμφισβητούμενης</p><p>δικαιοδοσίας. Όταν η διαφορά υπάγεται στην αρμοδιότητα του Πολυμελούς<br>Πρωτοδικείου, στη σύνθεσή του μετέχει και ο κτηματολογικός δικαστής. Η έφεση κατά<br>της παραπάνω απόφασης δικάζεται από τον κτηματολογικό εφέτη. Όταν η έφεση<br>εκδικάζεται από το Τριμελές Εφετείο, στη σύνθεσή του μετέχει και ο κτηματολογικός<br>εφέτης. Η εκπλήρωση τυχόν υποχρέωσης αυτούσιας απόδοσης γίνεται με σύμβαση<br>μεταξύ υποχρέου και δικαιούχου και εγγραφή αυτής στο Κτηματολογικό βιβλίο, που<br>δεν συνιστά διόρθωση της αρχικής εγγραφής αλλά επιγενόμενη εγγραφή, κατά την<br>έννοια των άρθρων 12 και 13 του παρόντος νόμου. Η σύμβαση αυτή και η εγγραφή της<br>στο Κτηματολογικό βιβλίο δεν υπόκειται σε οποιονδήποτε φόρο ή τέλος. Η δαπάνη για<br>τα δικαιώματα του συμβολαιογράφου βαρύνει τον υπόχρεο σε απόδοση.<br>3. Οι πρώτες εγγραφές των οποίων αμφισβητήθηκε με αγωγή η ακρίβεια μέσα στην<br>κατά το άρθρο 6 παρ. 2 προθεσμία, οριστικοποιούνται μόλις καταστεί αμετάκλητη η<br>δικαστική απόφαση που απορρίπτει την αγωγή. Αν, αντίθετα, η απόφαση που κατέστη<br>αμετάκλητη δέχεται ολικά ή μερικά την αγωγή, διορθώνεται η αρχική εγγραφή<br>σύμφωνα με το διατακτικό της αμετάκλητης απόφασης. Η διορθωμένη αυτή εγγραφή<br>είναι οριστική, κατά την έννοια της παραγράφου 1 αυτού του άρθρου, και παράγει το<br>προβλεπόμενο στην παράγραφο αυτή αμάχητο τεκμήριο. Οι διατάξεις των άρθρων 255<br>έως 263 και 270 του Αστικού Κώδικα εφαρμόζονται αναλόγως και για την προθεσμία<br>της παραγράφου 2 του άρθρου 6 αυτού του νόμου.<br>4. Όποιος με πρόθεση προκαλεί με οποιονδήποτε τρόπο ανακριβή εγγραφή στα<br>κτηματολογικά βιβλία τιμωρείται με φυλάκιση τουλάχιστον τριών μηνών.</p>
</div>
<div id="art-7α" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 7α — 1. Σε περίπτωση ανακριβούς πρώτης εγγραφής, για τη διόρθωση της οποίας ισχύουν</h4>
<p style="font-size:0.9rem; line-height:1.6;">όσα ορίζονται στα άρθρα 6 και 7, μέχρι την οριστικοποίησή της ισχύουν τα ακόλουθα<br>α) Τα μη καταχωρισθέντα στις πρώτες εγγραφές δικαιώματα μεταβιβάζονται και<br>επιβαρύνονται σύμφωνα με τις οικείες γι\` αυτά διατάξεις, χωρίς να απαιτείται και η<br>τήρηση της τυχόν προβλεπόμενης στις διατάξεις αυτές προϋπόθεσης της εγγραφής της<br>σχετικής πράξης στο κτηματολόγιο. Σε περίπτωση μεταβίβασης της κυριότητας,<br>εφόσον ο μεταβιβάζων δεν έχει ασκήσει και καταχωρίσει στο κτηματολογικό φύλλο<br>του ακινήτου την αγωγή που προβλέπεται στην παράγραφο 2του άρθρου 6, την<br>εγγραφή αναπληρώνει η εκ μέρους του αποκτώντος άσκηση και η με επιμέλειά του<br>καταχώριση της αγωγής αυτής στο κτηματολογικό φύλλο του ακινήτου. Σε περίπτωση<br>σύστασης περιορισμένου εμπράγματου δικαιώματος ή εγγραπτέου ενοχικού<br>δικαιώματος, η αγωγή αυτή μπορεί να ασκηθεί είτε από τον μη εγγεγραμμένο στο<br>Kτηματoλόγιο κύριο είτε από τον αποκτώντα το περιορισμένο εμπράγματο ή<br>εγγραπτέο ενοχικό, αντίστοιχα, δικαίωμα είτε και από τους δύο από κοινού Η αγωγή<br>καταχωρίζεται με επιμέλεια του ενάγοντος στο Kτηματoλoγικό φύλλο του ακινήτου<br>και αναπληρώνει την εγγραφή της πράξης στο κτηματολόγιο. Τα παραπάνω ισχύουν<br>αναλόγως και για κάθε μεταγενέστερη μεταβίβαση ή επιβάρυνση του δικαιώματος, για<br>την οποία καταχωρίζεται σχετική σημείωση στο κτηματολογικό φύλλο του ακινήτου.<br>Σε όλες τις παραπάνω περιπτώσεις διόρθωση της ανακριβούς πρώτης εγγραφής γίνεται<br>μόνο υπό τις προϋποθέσεις του άρθρου 7 παρ 3 του παρόντος νόμου. Οι διατάξεις της</p><p>παρούσας παραγράφου εφαρμόζονται και στην κτήση δικαιώματος με αναγκαστική<br>εκτέλεση.<br>β) Για την εκ μέρους του δανειστή εγγραφή υποθήκης, προσημείωσης υποθήκης,<br>κατάσχεσης, μεσεγγύησης ή άλλης δέσμευσης της εξουσίας διάθεσης σε δικαίωμα που<br>δεν έχει καταχωρισθεί στις πρώτες εγγραφές και δεν έχει στο μεταξύ μεταβιβασθεί ή<br>επιβαρυνθεί σύμφωνα με τα προβλεπόμενα στην παράγραφο 1 του παρόντος άρθρου,<br>απαιτείται, πέραν των όσων προβλέπουν οι ισχύουσες για τη σύσταση των εν λόγω<br>βαρών διατάξεις, να ασκηθεί από τον δανειστή και να καταχωρισθεί με επιμέλειά του<br>στο κτηματολογικό φύλλο του ακινήτου και η αγωγή του άρθρου 6 παρ. 2 του παρόντος<br>νόμου. Τα παραπάνω εφαρμόζονται και στην περίπτωση των κατά το άρθρο 992 παρ.<br>1 εδ. β\` του Κώδικα Πολιτικής Δικονομίας τελεσίδικων δικαστικών αποφάσεων<br>διάρρηξης καταδολιευτικών εκποιήσεων σύμφωνα με τα άρθρα 939 και επόμενα του<br>Αστικού Κώδικα. Στη συζήτηση της αγωγής προσεπικαλείται υποχρεωτικά, με<br>επιμέλεια του ενάγοντος δανειστή, ο φερόμενος ως δικαιούχος του μη<br>καταχωρισθέντος δικαιώματος οφειλέτης. Στην περίπτωση καταδολιευτικών πράξεων<br>που διαρρήχθηκαν, στη συζήτηση προσεπικαλούνται οι συμβαλλόμενοι σε αυτή. Εάν<br>η προσεπίκληση παραλειφθεί, το δικαστήριο, με αίτηση οποιουδήποτε από τους<br>διαδίκους ή αυτεπαγγέλτως, αναβάλλει τη συζήτηση και ορίζει προθεσμία για την<br>προσεπίκληση. Εφόσον η προθεσμία αυτή περάσει άπρακτη, η αγωγή απορρίπτεται ως<br>απαράδεκτη. Ο προϊστάμενος του Kτηματoλoγικού γραφείου, κατά τον έλεγχο<br>νομιμότητας που διενεργεί για τη σχετική εγγραφή, περιορίζεται στη διακρίβωση της<br>συνδρομής των παραπάνω προϋποθέσεων, μη εφαρμοζόμενης εν προκειμένω της<br>διάταξης του άρθρου 16 παρ 1 περ. Ε. Τα βάρη και οι δεσμεύσεις της εξουσίας διάθεσης<br>που καταχωρίζονται σύμφωνα με τα παραπάνω οριζόμενα, καθώς επίσης κάθε<br>παράγωγο από αυτά δικαίωμα και κάθε πράξη που στηρίζεται σε αυτά, τελούν υπό την<br>αναβλητική αίρεση της έκδοσης αμετάκλητης απόφασης επί της αγωγής του δανειστή,<br>με την οποία ο οφειλέτης θα αναγνωρίζεται ως δικαιούχος του μη καταχωρισθέντος<br>αρχικά δικαιώματος. Στην περίπτωση που το μη καταχωρισθέν στις πρώτες εγγραφές<br>δικαίωμα μεταβιβάσθηκε επιβαρύνθηκε σύμφωνα με τα προβλεπόμενα στην<br>περίπτωση α. της παρούσας παραγράφου, το κτηθέν δικαίωμα μπορεί να επιβαρυνθεί<br>με υποθήκη, προσημείωση υποθήκης, κατάσχεση ή άλλη δέσμευση της εξουσίας<br>διάθεσης χωρίς να απαιτείται η άσκηση νέας αγωγής εκ μέρους του δανειστή. Στην<br>τελευταία περίπτωση τα βάρη και οι δεσμεύσεις της εξουσίας διάθεσης, καθώς επίσης<br>κάθε παράγωγο από αυτά δικαίωμα και κάθε πράξη που στηρίζεται σε αυτά, τελούν<br>υπό την αναβλητική αίρεση της έκδοσης αμετάκλητης απόφασης επί της αγωγής που<br>προβλέπεται στην περίπτωση α\` της παρούσας παραγράφου<br>γ) Σε περίπτωση που καταχωρισμένο στο κτηματολόγιο δικαίωμα έχει νομίμως<br>επιβαρυνθεί πριν από τις πρώτες εγγραφές με υποθήκη, προσημείωση υποθήκης,<br>κατάσχεση, μεσεγγύηση ή άλλη δέσμευση της εξουσίας διάθεσης, που δεν εμφαίνεται<br>στις πρώτες εγγραφές, κάθε εξουσία που πηγάζει από τις οικείες για τα βάρη αυτά δια<br>τάξεις μπορεί να ασκηθεί και κάθε επόμενη πράξη, που στηρίζεται σε αυτά, μπορεί να<br>διενεργηθεί, υπό την προϋπόθεση ότι ο δικαιούχος ή και κάθε τρίτος που έχει έννομο<br>συμφέρον θα ασκήσει την αγωγή του άρθρου 6 παρ.2, με την οποία θα ζητεί την<br>αναγνώριση του μη καταχωρισθέντος στις πρώτες εγγραφές βάρους ή της μη</p><p>καταχωρισθείσας δέσμευσης της εξουσίας διάθεσης, αντίστοιχα, και θα επιμεληθεί την<br>εγγραφή της στο κτηματολογικό φύλλο του ακινήτου. Στην περίπτωση που την αγωγή<br>αυτή ασκεί τρίτος, στη σχετική δίκη προσεπικαλεί υποχρεωτικά και τον φερόμενο ως<br>δικαιούχο του βάρους ή ως υπέρ ου η δέσμευση της εξουσίας διάθεσης, αντίστοιχα. Σε<br>περίπτωση που η προσεπίκληση παραλειφθεί, το δικαστήριο, με αίτηση οποιουδήποτε<br>από τους διαδίκους ή αυτεπαγγέλτως, αναβάλλει τη συζήτηση και ορίζει προθεσμία για<br>την προσεπίκληση. Εφόσον η προθεσμία αυτή περάσει άπρακτη, η αγωγή απορρίπτεται<br>ως απαράδεκτη. Ο προϊστάμενος του κτηματολογικού γραφείου, κατά τον έλεγχο<br>νομιμότητας που διενεργεί για τη σχετική εγγραφή, περιορίζεται στη διακρίβωση της<br>συνδρομής των παραπάνω προϋποθέσεων, μη εφαρμοζομένης εν προκειμένω της<br>διάταξης του άρθρου 16 παρ.1 περίπτωση ε\`. Το κύρος των πράξεων που διενεργούνται<br>σύμφωνα με τα παραπάνω οριζόμενα και των δικαιωμάτων που στηρίζονται σε αυτές<br>τελεί υπό την αναβλητική αίρεση της έκδοσης αμετάκλητης απόφασης, με την οποία<br>θα γίνεται δεκτή η ως άνω αγωγή.<br>2. Σε περίπτωση επιβολής κατάσχεσης στο ακίνητο μετά τις πρώτες εγγραφές, η<br>προβλεπόμενη στο άρθρο 999 παρ. 3 εδάφιο ο\` του Κώδικα Πολιτικής Δικονομίας<br>υποχρέωση επίδοσης της περίληψης της κατασχετήριας έκθεσης προς τους<br>ενυπόθηκους και τους προσημειούχους δανειστές, καθώς επίσης η προβλεπόμενη στις<br>παραγράφους 1 και 3 εδάφιο β\` του ίδιου άρθρου υποχρέωση μνείας του αριθμού των<br>υποθηκών και προσημειώσεων στο δημοσιευόμενο απόσπασμα της κατασχετήριας<br>έκθεσης αφορούν τόσο στις εγγεγραμμένες στο κτηματολογικό φύλλο του ακινήτου<br>υποθήκες και προσημειώσεις υποθηκών όσο και στις υποθήκες και προσημειώσεις<br>υποθηκών που βαρύνουν το ακίνητο, σύμφωνα με τις εγγραφές του βιβλίου υποθηκών<br>που τηρούσε το αρμόδιο υποθηκοφυλακείο μέχρι την έναρξη λειτουργίας του<br>Κτηματολογικού Γραφείου. Σε περίπτωση που στο κτηματολογικό φύλλο του ακινήτου<br>έχει εγγραφεί αγωγή, με την οποία ζητείται η καταχώριση στο κτηματολογικό φύλλο<br>του ακινήτου υποθήκης ή προσημείωσης υποθήκης, που δεν εμφαίνεται στις πρώτες<br>εγγραφές, μολονότι είχε νομίμως συσταθεί πριν από αυτές, η προβλεπόμενη στο<br>προηγούμενο εδάφιο επίδοση γίνεται και προς τον φερόμενο με την αγωγή αυτή ως<br>ενυπόθηκο δανειστή. Οι διατάξεις της παρούσας παραγράφου εφαρμόζονται αναλογικά<br>και σε περίπτωση εκτέλεσης που επισπεύδεται κατά τις διατάξεις του Κώδικα περί<br>Εισπράξεως Δημοσίων Εσόδων.</p>
</div>
<div id="art-7β" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 7β — Τύχη δικαιωμάτων και βαρών ακινήτου σε περίπτωση εκκρεμούς αίτησης</h4>
<p style="font-size:0.9rem; line-height:1.6;">διόρθωσης<br>1. Σε περίπτωση που έχει σημειωθεί στην πρώτη εγγραφή η εκκρεμότητα εξέτασης<br>αίτησης διόρθωσης του άρθρου 6Α του ν. 2308/1995 (Α’ 114) ενώπιον της Επιτροπής<br>Εξέτασης του άρθρου 7Α του ίδιου νόμου, τα δικαιώματα επί του ακινήτου, τα οποία<br>αμφισβητούνται ή ασκούνται με την αίτηση διόρθωσης, μεταβιβάζονται και<br>επιβαρύνονται σύμφωνα με τις οικείες για αυτά διατάξεις. Τα παραπάνω ισχύουν<br>αναλόγως και για κάθε μεταγενέστερη μεταβίβαση ή επιβάρυνση του δικαιώματος, για<br>την οποία καταχωρίζεται σχετική σημείωση στο κτηματολογικό φύλλο του ακινήτου.<br>Το κύρος των πράξεων που διενεργούνται σύμφωνα με τα ανωτέρω και των</p><p>δικαιωμάτων που στηρίζονται σε αυτές τελεί υπό την αναβλητική αίρεση της<br>καταχώρισης του μεταβιβάζοντος ή του βεβαρημένου ως κυρίου στην πρώτη εγγραφή<br>μετά την έκδοση της απόφασης της Επιτροπής του πρώτου εδαφίου. Τα ανωτέρω<br>εφαρμόζονται και στην κτήση δικαιώματος με αναγκαστική εκτέλεση.<br>2. Σε περίπτωση που δικαίωμα καταχωρισμένο στο κτηματολόγιο έχει νομίμως<br>επιβαρυνθεί πριν από τις πρώτες εγγραφές με υποθήκη, προσημείωση υποθήκης,<br>κατάσχεση, μεσεγγύηση ή άλλη δέσμευση της εξουσίας διάθεσης, που δεν εμφαίνεται<br>στις πρώτες εγγραφές, η άσκηση των εξουσιών που πηγάζουν από τα ανωτέρω βάρη<br>και η διενέργεια των πράξεων που στηρίζονται σε αυτά τελούν υπό την αναβλητική<br>αίρεση της καταχώρισης του βεβαρημένου οφειλέτη ως κυρίου στην πρώτη εγγραφή<br>μετά την έκδοση της απόφασης της Επιτροπής της παρ. 1.<br>3. Ο προϊστάμενος του κτηματoλoγικού γραφείου, κατά τον έλεγχο νομιμότητας που<br>διενεργεί για τη σχετική εγγραφή, σύμφωνα με το παρόν, περιορίζεται στη διακρίβωση<br>της ύπαρξης της σχετικής σημείωσης στο κτηματολογικό φύλλο, χωρίς να<br>εφαρμόζεται, εν προκειμένω, η περ. ε’ της παρ. 1 του άρθρου 16.»</p>
</div>
<div id="art-8" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 8 — Μεταγενέστερες εγγραφές έως την οριστικοποίηση της πρώτης εγγραφής</h4>
<p style="font-size:0.9rem; line-height:1.6;">Μεταγενέστερες εγγραφές, που καταχωρίζονται στο Κτηματολογικό βιβλίο έως την<br>κατά το προηγούμενο άρθρο οριστικοποίηση της πρώτης εγγραφής, δημιουργούν το<br>μαχητό τεκμήριο του άρθρου 13. Το μαχητό αυτό τεκμήριο δεν αντιτάσσεται κατ΄<br>εκείνου που αμφισβήτησε την ακρίβεια της πρώτης εγγραφής ενώπιον των<br>δικαστηρίων μέσα στην προβλεπόμενη στην παράγραφο 2 του άρθρου 6 προθεσμία και<br>πέτυχε την έκδοση υπέρ αυτού αμετάκλητης δικαστικής απόφασης ούτε κατ\` εκείνων<br>που έλκουν δικαιώματα από αυτόν σύμφωνα με τα οριζόμενα στο άρθρο 7α του<br>παρόντος, εκτός αν πρόκειται για εγγραφή που αφορά σε πρωτότυπη κτήση,<br>αντιτασσόμενη κατά τις ισχύουσες γι\` αυτήν διατάξεις και έναντι αυτού.</p>
</div>
<div id="art-9" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 9 — Περιεχόμενα στο Δημόσιο ακίνητα με την οριστικοποίηση των πρώτων εγγραφών</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Ακίνητα που δεν έχουν εγγραφεί ως ανήκοντα σε ορισμένο πρόσωπο και φέρονται<br>στα κτηματολογικά βιβλία και στα λοιπά στοιχεία του Κτηματολογίου ως ακίνητα<br>"άγνωστου ιδιοκτήτη" θεωρείται ότι ανήκουν στην κυριότητα του Ελληνικού Δημοσίου<br>μόλις καταστεί οριστική η πρώτη εγγραφή. Στην περίπτωση αυτή δημιουργείται υπέρ<br>του Δημοσίου το κατά την παράγραφο 1 του άρθρου 7 αμάχητο τεκμήριο και ισχύουν<br>όσα ορίζονται στην παράγραφο 2 του ίδιου άρθρου.<br>2. Τα αρμόδια Κτηματολογικά Γραφεία μεριμνούν για τη σημείωση στα<br>κτηματολογικά βιβλία της προβλεπόμενης στην προηγούμενη παράγραφο έννομης<br>συνέπειας.<br>ΚΕΦΑΛΑΙΟ ΤΡΙΤΟ<br>Περιεχόμενο του κτηματολογικού βιβλίου και έννομα αποτελέσματα των<br>κτηματολογικών εγγραφών</p>
</div>
<div id="art-10" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 10 — Κτηματολογικό βιβλίο</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Το Κτηματολογικό βιβλίο συντίθεται από τα Κτηματολογικά φύλλα, στα οποία<br>καταχωρίζονται ηλεκτρονικώς ή και εντύπως οι κτηματολογικές εγγραφές που<br>προβλέπουν τα άρθρα 11 και 12.<br>2. Με απόφαση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, που<br>δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως, ρυθμίζονται ζητήματα τεχνικού και<br>λεπτομερειακού χαρακτήρα, που αφορούν στη διαμόρφωση και τήρηση του<br>κτηματολογικού βιβλίου. Η διαμόρφωση και τήρηση αυτή, στην ηλεκτρονική της<br>μορφή, περιλαμβάνει τη συγκρότηση, οργάνωση και ασφαλή λειτουργία των<br>απαιτούμενων βάσεων δεδομένων και των αναγκαίων δικτύων επικοινωνίας.</p>
</div>
<div id="art-11" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 11 — Κτηματολογικά φύλλα</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Σε κάθε ακίνητο και κάθε άλλο αυτοτελές ιδιοκτησιακό αντικείμενο αντιστοιχεί ένα<br>κτηματολογικό φύλλο. Στο κτηματολογικό φύλλο, το οποίο φέρει σε εμφανές σημείο<br>το Κτηματολογικό Γραφείο στο οποίο τηρείται το φύλλο, καταχωρίζονται όλες οι<br>κτηματολογικές εγγραφές που αφορούν το ιδιοκτησιακό αντικείμενο. Στο<br>κτηματολογικό φύλλο που αντιστοιχεί σε κοινό ακίνητο αναγράφεται και το ιδανικό<br>μερίδιο κάθε κοινωνού.<br>2. Αν δεν επαρκεί το φύλλο για την καταχώρηση νέων εγγραφών, αυτές καταχωρίζονται<br>σε άλλο φύλλο, ύστερα από σημείωση της σχετικής μεταφοράς τόσο στο αρχικό όσο<br>και στο νέο φύλλο.<br>3. Αν μεταβληθεί το ακίνητο, είτε λόγω συνενώσεως περισσότερων ακινήτων είτε λόγω<br>διανομής είτε λόγω κατατμήσεως από οποιαδήποτε άλλη αιτία, ιδίως από αναγκαστική<br>απαλλοτρίωση μέρους αυτού, το νέο ή τα νέα, κατά περίπτωση, ακίνητα που<br>δημιουργούνται απεικονίζονται στα κτηματολογικά διαγράμματα, κατά τροποποίηση<br>των αρχικών διαγραμμάτων και καταχωρίζονται σε νέα Κτηματολογικά φύλλα με νέο<br>Κωδικό Αριθμό Εθνικού Κτηματολογίου, ύστερα από σχετική σημείωση τόσο στο<br>αρχικό όσο και στο νέο φύλλο. Το ίδιο ισχύει και σε περίπτωση σύστασης ή<br>τροποποίησης οριζόντιων ή κάθετων ιδιοκτησιών, οπότε καθεμία από τις<br>δημιουργούμενες οριζόντιες ή κάθετες ιδιοκτησίες αναγράφεται σε χωριστό<br>κτηματολογικό φύλλο.<br>4. Τα ελάχιστα στοιχεία που πρέπει να καταχωρίζονται στα Κτηματολογικά φύλλα είναι<br>τα ακόλουθα :<br>α) Τα στοιχεία που προσδιορίζουν το ακίνητο και οποιοδήποτε άλλο ιδιοκτησιακό<br>αντικείμενο. Για τον προσδιορισμό της ταυτότητας του ακινήτου πρέπει να προκύπτει<br>από το φύλλο ο συσχετισμός του ακινήτου με την απεικόνισή του στα κτηματολογικά<br>διαγράμματα, η θέση του ακινήτου και το εμβαδόν του. Σε περίπτωση συγκυριότητας<br>αναγράφεται και το ιδανικό μερίδιο καθενός από τους συγκυρίους. Σε περίπτωση<br>οριζόντιας ή κάθετης ιδιοκτησίας, αναγράφεται στο φύλλο, στο οποίο εμφαίνεται<br>καθεμία οριζόντια ή κάθετη ιδιοκτησία, το ποσοστό αναγκαστικής συγκυριότητας επί<br>του εδάφους και των λοιπών κοινόκτητων και κοινόχρηστων χώρων που αντιστοιχεί σε<br>αυτήν. Περιγράφεται η ειδικότερη θέση της οριζόντιας ή κάθετης ιδιοκτησίας μέσα στο<br>οικοδομημένο ακίνητο (όροφος, αριθμός, θέση κάθετης ιδιοκτησίας) και αναγράφεται<br>το εμβαδόν της.</p><p>β) Τα στοιχεία που καθορίζουν τη νομική κατάσταση του ακινήτου και ειδικότερα : αα)<br>αυτά που αφορούν στην κυριότητα του ακινήτου και ββ) αυτά που αφορούν στα λοιπά<br>πλην της κυριότητας εγγραπτέα δικαιώματα. Τα στοιχεία καθεμίας από τις εν λόγω<br>κατηγορίες αναγράφονται σε χωριστά τμήματα του κτηματολογικού φύλλου. Σε κάθε<br>τμήμα πρέπει να αναγράφονται όλα τα δηλωτικά της ταυτότητας του δικαιούχου<br>στοιχεία (όνομα, επώνυμο, όνομα και επώνυμο γονέων, τόπος και χρονολογία<br>γέννησης, αριθμός δελτίου ταυτότητας, διεύθυνση κατοικίας), ο τίτλος κτήσεως και η<br>ημερομηνία εγγραφής.<br>γ) Οι κατά την έννοια της παραγράφου 2 του άρθρου 1 πρόσθετες πληροφορίες. Με<br>απόφαση του Υπουργού Περιβάλλοντος, Χωροταξίας και Δημόσιων Έργων, που<br>εκδίδεται ύστερα από πρόταση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων<br>Ελλάδος και δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως, ρυθμίζονται όλα τα<br>ειδικότερα ζητήματα που αφορούν στο είδος των πρόσθετων πληροφοριών, στον τρόπο<br>συλλογής και καταχώρισής τους στα Κτηματολογικά φύλλα, στο χρόνο έναρξης της<br>καταχώρισης, στην ενημέρωση των σχετικών εγγραφών και σε κάθε άλλο συναφές<br>ζήτημα.<br>5. Με απόφαση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, που<br>δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως, ρυθμίζονται ζητήματα τεχνικού και<br>λεπτομερειακού χαρακτήρα, ιδίως ως προς το περιεχόμενο του κτηματολογικού<br>φύλλου, τη διάρθρωσή του και την ηλεκτρονική μορφή και διαχείρισή του.</p>
</div>
<div id="art-12" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 12 — Καταχωριζόμενες στα Κτηματολογικά φύλλα πράξεις</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Στα Κτηματολογικά φύλλα καταχωρίζονται :<br>α) Οι αναφερόμενες στην παράγραφο 1 και υπό τον αριθμό 1 του άρθρου 1192 του<br>Αστικού Κώδικα δικαιοπραξίες, με τις οποίες συνιστάται, μετατίθεται ή καταργείται<br>εμπράγματο δικαίωμα σε ακίνητο (εμπράγματες δικαιοπραξίες), στις οποίες<br>συμπεριλαμβάνονται και η αιτία θανάτου δωρεές και οι δικαιοπραξίες με τις οποίες<br>συνιστάται, μετατίθεται ή καταργείται το κατά το άρθρο 65 του ν.δ. 210/1973 (ΦΕΚ<br>277 Α\`) δικαίωμα μεταλλειοκτησίας.<br>β) Οι αναφερόμενες στην παράγραφο 1 και υπό τον αριθμό 2 του άρθρου 1192 του<br>Αστικού Κώδικα : αα) επιδικάσεις, ββ) προσκυρώσεις, όπως ιδίως οι συντελεσμένες<br>αναγκαστικές απαλλοτριώσεις, οι κυρωμένοι αναδασμοί, οι πράξεις εφαρμογής<br>ρυθμιστικών και πολεοδομικών σχεδίων και μελετών ή μεταφοράς συντελεστή<br>δόμησης, καθώς και οι τυχόν ανακλητικές αυτών διοικητικές πράξεις και γγ)<br>περιλήψεις κατακυρωτικών εκθέσεων των συμβολαιογράφων, που έχουν ως<br>αντικείμενο την κυριότητα ή άλλο εμπράγματο δικαίωμα σε ακίνητο.<br>γ) Οι κάθε είδους παραχωρήσεις του Δημοσίου, με τις οποίες μεταβιβάζεται κυριότητα<br>ή συνιστάται περιορισμένο εμπράγματο δικαίωμα σε ακίνητο, καθώς επίσης η πράξη<br>παραχώρησης από την αρμόδια αρχή της νομής ακινήτων σε δικαιούχους από<br>αναδασμό μετά την περάτωση των εργασιών του αναδασμού και πριν από την κύρωσή<br>του.<br>δ) Οι αναφερόμενες στην παράγραφο 1 και υπό τον αριθμό 3 του άρθρου 1192 του<br>Αστικού Κώδικα εκθέσεις δικαστικής διανομής ακινήτου.</p><p>ε) Οι αναφερόμενες στην παράγραφο 1 και υπό τον αριθμό 4 του άρθρου 1192 του<br>Αστικού Κώδικα τελεσίδικες δικαστικές αποφάσεις που περιέχουν καταδίκη σε<br>δήλωση βουλήσεως για εμπράγματη δικαιοπραξία σε ακίνητο.<br>στ) Οι αναφερόμενες στην παράγραφο 1 και υπό τον αριθμό 5 του άρθρου 1192 του<br>Αστικού Κώδικα τελεσίδικες δικαστικές αποφάσεις με τις οποίες αναγνωρίζεται<br>κυριότητα ή άλλο εμπράγματο δικαίωμα σε ακίνητο, που έχει αποκτηθεί με έκτακτη<br>χρησικτησία, εφόσον η σχετική αγωγή έχει ασκηθεί από το χρησιδεσπόσαντα και<br>στρέφεται κατά του φερόμενου στα Κτηματολογικά φύλλα ως δικαιούχου.<br>ζ) Η κατά το άρθρο 1193 του Αστικού Κώδικα αποδοχή κληρονομίας ή κληροδοσίας,<br>εφόσον με αυτήν περιέχεται στον κληρονόμο ή τον κληροδόχο η κυριότητα ή άλλο<br>εμπράγματο δικαίωμα σε ακίνητο της κληρονομίας ή εμπράγματο δικαίωμα σε ξένο<br>ακίνητο, καθώς επίσης το αναφερόμενο στο άρθρο 1195 του Αστικού Κώδικα<br>κληρονομητήριο.<br>η) Οι δικαιοπραξίες, καθώς και κάθε άλλου είδους τίτλοι που παρέχουν δικαίωμα<br>εγγραφής υποθήκης και προσημείωσης υποθήκης.<br>θ) Οι κατά το άρθρο 1312 του Αστικού Κώδικα εκχωρήσεις και ενεχυριάσεις της<br>ασφαλισμένης με υποθήκη ή προσημείωση υποθήκης απαίτησης.<br>ι) Οι κατά το άρθρο 992 του Κώδικα Πολιτικής Δικονομίας, όπως τροποποιήθηκε με<br>την παράγραφο 19 του άρθρου 4 του ν. 2298/1995 (ΦΕΚ 62 Α\`), τελεσίδικες δικαστικές<br>αποφάσεις διάρρηξης καταδολιευτικών εκποιήσεων ακινήτων, σύμφωνα με τα άρθρα<br>939 και επόμενα του Αστικού Κώδικα.<br>ια) Οι κατασχέσεις (αναγκαστικές και συντηρητικές), και κάθε άλλη δέσμευση της<br>εξουσίας διάθεσης του κυρίου ακινήτου, την οποία ο νόμος υποβάλλει σε δημοσιότητα<br>στα βιβλία μεταγραφών και υποθηκών.<br>ιβ) Οι κατά το άρθρο 220 του Κώδικα Πολιτικής Δικονομίας αγωγές και ανακοπές, οι<br>αγωγές της παρ. 2 του άρθρου 6 και των παρ. 2 και 3 του άρθρου 13 του παρόντος και<br>οι αγωγές της παρ. 2 του άρθρου 7 του παρόντος, όταν με αυτές ζητείται η αυτούσια<br>απόδοση του πλουτισμού ή η αποκατάσταση της προηγούμενης κατάστασης, καθώς<br>επίσης οι αμετάκλητες αποφάσεις που εκδίδονται επ’ αυτών των αγωγών και<br>ανακοπών.<br>ιγ) Οι κατά τα άρθρα 618 και 1208 του Αστικού Κώδικα μακροχρόνιες μισθώσεις<br>ακινήτων.<br>ιδ) Οι χρονομεριστικές μισθώσεις του άρθρου 1 του ν. 1652/1986.<br>ιε) Οι κατά το ν. 1665/1986 (ΦΕΚ 194 Α\`), όπως συμπληρώθηκε με το ν. 2367/1995<br>(ΦΕΚ 261 Α\`), χρηματοδοτικές μισθώσεις ακινήτων και<br>ιστ) Όλες οι δικαιοπραξίες, δικαστικές αποφάσεις και διοικητικές πράξεις, οι οποίες<br>εγγράφονται, με βάση την κείμενη εκάστοτε νομοθεσία, στα βιβλία που τηρούνται στα<br>Υποθηκοφυλακεία.<br>2. Στο τμήμα του κτηματολογικού φύλλου που αφορά στα βάρη και στις δεσμεύσεις<br>της κυριότητας ή της εξουσίας διάθεσης του κυρίου εγγράφεται και η κήρυξη της<br>αναγκαστικής απαλλοτρίωσης και η απόφαση διενέργειας αναδασμού. Η εγγραφή αυτή<br>εμπεριέχει την πράξη με την οποία κηρύχθηκε η αναγκαστική απαλλοτρίωση ή<br>αποφασίστηκε η διενέργεια αναδασμού και την επίπτωσή τους σε όλο ή σε μέρος του<br>ακινήτου στο οποίο αφορά το κτηματολογικό φύλλο. Αν αρθεί ή ανακληθεί η</p><p>απαλλοτρίωση ή ο αναδασμός, καταχωρίζεται στα Κτηματολογικά φύλλα η διοικητική<br>πράξη με την οποία βεβαιώνεται η αυτοδίκαιη άρση ή ανακαλείται η αναγκαστική<br>απαλλοτρίωση ή ο αναδασμός. Το ίδιο ισχύει και για τα ρυθμιστικά ή πολεοδομικά<br>σχέδια και μελέτες πριν από την εφαρμογή τους, καθώς και για κάθε άλλη διοικητική<br>πράξη ή διαδικασία που έχει επίπτωση σε εμπράγματα δικαιώματα επί ακινήτων ή<br>επάγεται δέσμευση της εξουσίας διάθεσης αυτών.<br>3. Χωρίς εγγραφή στα Κτηματολογικά φύλλα στις περιπτώσεις α\`, β\`, γ\`, δ\`, ε\`, ζ\`, η\`<br>(εκτός από τις περιπτώσεις των εκχωρήσεων και ενεχυριάσεων της ασφαλισμένης με<br>υποθήκη ή προσημείωση υποθήκης απαίτησης, για τις οποίες ισχύει η παράγραφος 5<br>αυτού του άρθρου), ια\` και ιε\` της παραγράφου 1 αυτού του άρθρου δεν επέρχεται το<br>επιδιωκόμενο με την εγγραπτέα πράξη αποτέλεσμα.<br>4. Το επιδιωκόμενο με την εγγραφή έννομο αποτέλεσμα επέρχεται στην περίπτωση ζ\`<br>της παραγράφου 1 αναδρομικά από τον προβλεπόμενο στο άρθρο 1199 του Αστικού<br>Κώδικα χρόνο και στην περίπτωση β\` της ίδιας παραγράφου από το χρόνο συντέλεσης<br>της αναγκαστικής απαλλοτρίωσης με την καταβολή ή δημόσια κατάθεση της νόμιμης<br>αποζημίωσης υπέρ του καθ\` ου η απαλλοτρίωση.<br>5. Η παράλειψη της εγγραφής στα Κτηματολογικά φύλλα στις περιπτώσεις ι\`, ιβ\`, ιγ\`<br>και ιδ\` της παραγράφου 1, καθώς επίσης στις εμπίπτουσες στην περίπτωση η\` της<br>παραγράφου 1 αυτού του άρθρου εκχωρήσεις και ενεχυριάσεις της ασφαλισμένης με<br>υποθήκη ή προσημείωση υποθήκης απαίτησης, επάγεται τις έννομες συνέπειες που<br>προβλέπουν οι αντίστοιχες διατάξεις του ουσιαστικού ή του δικονομικού δικαίου.</p>
</div>
<div id="art-13" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 13 — Μαχητό τεκμήριο ακρίβειας των κτηματολογικών εγγραφών και δημόσια πίστη</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Οι εγγραφές στα Κτηματολογικά φύλλα για τις πράξεις του άρθρου 12 τεκμαίρονται<br>ακριβείς.<br>2. Η ανατροπή του κατά την προηγούμενη παράγραφο μαχητού τεκμηρίου γίνεται με<br>αμετάκλητη δικαστική απόφαση, ύστερα από αγωγή η οποία ασκείται από όποιον έχει<br>έννομο συμφέρον και στρέφεται κατ\` εκείνου που φέρεται ανακριβώς στα<br>Κτηματολογικά φύλλα ως δικαιούχος ή των καθολικών διαδόχων του. Σε περίπτωση<br>ειδικών διαδόχων, έναντι των οποίων η απόφαση είναι αντιτάξιμη, σύμφωνα με την<br>παράγραφο 3 εδάφιο β\` αυτού του άρθρου, η αγωγή πρέπει να στρέφεται, με ποινή<br>απαραδέκτου, και κατ\` αυτών. Έννομο συμφέρον για την άσκηση αγωγής έχει και<br>όποιος απέκτησε κυριότητα ή άλλο εμπράγματο δικαίωμα με χρησικτησία. Η αγωγή<br>καταχωρίζεται στο οικείο κτηματολογικό φύλλο μέσα σε προθεσμία, κατ\` ανώτατο<br>όριο, τριάντα (30) ημερών από την κατάθεσή της, αλλιώς είναι απαράδεκτη η συζήτησή<br>της. Η αγωγή αυτή περιέχει αίτημα αναγνώρισης του προσβαλλόμενου με την<br>ανακριβή εγγραφή δικαιώματος του ενάγοντος και διόρθωσης της ανακριβούς<br>εγγραφής. Το ελάττωμα της εγγραφής, η οποία θεωρείται τίτλος κατά την έννοια των<br>άρθρων 1041 και 1043 του Αστικού Κώδικα, θεραπεύεται μόλις συντρέξουν στο<br>πρόσωπο του ανακριβώς αναγραφόμενου δικαιούχου και των διαδόχων του και οι<br>λοιπές τυχόν προϋποθέσεις τακτικής χρησικτησίας.<br>2.α. Μετά την άσκηση και καταχώριση της αγωγής της παραγράφου 2 επιτρέπεται η<br>μεταβίβαση και η επιβάρυνση του δικαιώματος για το οποίο ζητείται η αναγνώριση και</p><p>η διόρθωση της ανακριβούς εγγραφής αναλόγως με τα προβλεπόμενα στις διατάξεις<br>της παραγράφου 1, περίπτωση α\` και β\` του άρθρου 7α.<br>3. Η κατά την προηγούμενη παράγραφο αμετάκλητη δικαστική απόφαση αντιτάσσεται<br>τόσο εναντίον των καθολικών διαδόχων του ανακριβώς αναγραφόμενου δικαιούχου<br>όσο και εναντίον εκείνων που έγιναν ειδικοί διάδοχοι μετά την εγγραφή της αγωγής<br>στο κτηματολογικό φύλλο. Πριν από την ως άνω εγγραφή της αγωγής τρίτος αποκτά<br>εγκύρως δικαίωμα από τον ανακριβώς αναγραφόμενο δικαιούχο ή τους καθολικούς<br>τους διαδόχους, εκτός αν στηρίζει την κτήση του σε χαριστική αιτία ή τη στηρίζει με<br>σε επαχθή αιτία, είναι κακόπιστος, επειδή γνωρίζει ή από βαρειά του αμέλεια αγνοεί<br>την ανακρίβεια της εγγραφής επί της οποίας στηρίχθηκε. Το βάρος της απόδειξης της<br>κακής πίστης του τρίτου, που απέκτησε από τον ανακριβώς αναγραφόμενο δικαιούχο<br>ή τους καθολικούς του διαδόχους, φέρει εκείνος που αμφισβητεί την ακρίβεια της<br>εγγραφής και το κύρος της κτήσης από τον τρίτο.<br>4. Σε περίπτωση έγκυρης, σύμφωνα με την προηγούμενη παράγραφο, κτήσης<br>δικαιώματος από καλόπιστο τρίτο, ο αληθινός δικαιούχος έχει κατ\` εκείνου που<br>αναγραφόταν ανακριβώς στα Κτηματολογικά φύλλα ως δικαιούχος μόνο αξίωση<br>απόδοσης του πλουτισμού. Αξίωση αποζημίωσης κατά τις διατάξεις των αδικοπραξιών<br>δεν αποκλείεται.<br>5. Για τη συζήτηση ενώπιον δικαστηρίου αγωγών, σύμφωνα με τα οριζόμενα στην<br>παράγραφο 2,προσκομίζεται, με ποινή απαραδέκτου, αντίγραφο κτηματολογικού<br>φύλλου και απόσπασμα κτηματολογικού διαγράμματος του ακινήτου στο οποίο αφορά<br>η διόρθωση. Σε περίπτωση που το αίτημα της αγωγής αφορά σε αλλαγές και στα<br>κτηματολογικά διαγράμματα, κατά τη συζήτηση της αγωγής και με ποινή<br>απαραδέκτου, αντί του αποσπάσματος του κτηματολογικού διαγράμματος<br>προσκομίζεται τοπογραφικό διάγραμμα γεωμετρικών μεταβολών, στο οποίο<br>αποτυπώνεται η όποια γεωμετρική μεταβολή επέρχεται με την αιτούμενη διόρθωση.<br>Στην τελευταία περίπτωση προσκομίζεται, με ποινή απαραδέκτου, και η εισήγηση του<br>Κτηματολογικού Γραφείου ή, εάν αυτό δεν έχει συσταθεί και το υφιστάμενο<br>Υποθηκοφυλακείο εξακολουθεί να λειτουργεί μεταβατικά ως Κτηματολογικό Γραφείο,<br>της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή<br>μετονομάζεται, για τη συνδρομή των τεχνικών προϋποθέσεων της απεικόνισης της<br>γεωμετρικής μεταβολής που επέρχεται με την αιτούμενη διόρθωση στα κτηματολογικά<br>διαγράμματα. Οι ίδιες προϋποθέσεις ισχύουν και για τη συζήτηση ενώπιον δικαστηρίου<br>αιτήσεων και προσφυγών που ασκούνται κατά τα άρθρα 18 παράγραφος 2 και 19<br>παράγραφος 2 για τη διόρθωση πρόδηλων σφαλμάτων και σφαλμάτων που αφορούν<br>σε γεωμετρικά στοιχεία των μεταγενέστερων κτηματολογικών εγγραφών.<br>5α. Αντί της προσκόμισης του τοπογραφικού διαγράμματος γεωμετρικών μεταβολών<br>και της εισήγησης για τη συνδρομή των τεχνικών προϋποθέσεων της απεικόνισης της<br>γεωμετρικής μεταβολής της παραγράφου 5, προσαρτάται, με ποινή απαραδέκτου, στο<br>δικόγραφο της αγωγής, της αίτησης ή της προσφυγής που ασκείται και κατατίθεται<br>ενώπιον δικαστηρίου, σύμφωνα με τα οριζόμενα στην παράγραφο 2 του άρθρου 13,<br>στην παράγραφο 2 του άρθρου 18 και στην παράγραφο 2 του άρθρου 19, τοπογραφικό<br>διάγραμμα γεωμετρικών μεταβολών, όπου αποτυπώνεται η επερχόμενη με την<br>αιτούμενη διόρθωση γεωμετρική μεταβολή και ο συντάκτης μηχανικός υποχρεούται να</p><p>βεβαιώνει, εάν η απεικόνιση στο ίδιο διάγραμμα της γεωμετρικής μεταβολής, είναι<br>τεχνικά εφαρμόσιμη και δεκτική εισαγωγής στην τηρούμενη κτηματολογική βάση. Για<br>το τοπογραφικό διάγραμμα γεωμετρικών μεταβολών του προηγούμενου εδαφίου<br>διενεργείται υποχρεωτικά, ηλεκτρονική υποβολή από τον συντάκτη μηχανικό στον<br>ψηφιακό υποδοχέα που λειτουργεί στη βάση δεδομένων του Φορέα "Ελληνικό<br>Κτηματολόγιο", σύμφωνα με τις διατάξεις του άρθρου 40 του ν. 4409/2016 (Α΄136)<br>και των κανονιστικών πράξεων που έχουν εκδοθεί κατ’ εξουσιοδότηση αυτού. Το<br>εκδιδόμενο από την ηλεκτρονική εφαρμογή αποδεικτικό υποβολής του ίδιου άρθρου,<br>προσαρτάται με ποινή απαραδέκτου, στο οικείο δικόγραφο. Κατά τα λοιπά ισχύουν τα<br>οριζόμενα στην περίπτωση η΄ της παραγράφου 3 του άρθρου 6.</p>
</div>
<div id="art-13α" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 13α — 1. Το καταχωρισθέν στο Κτηματολόγιο εμβαδόν του ακινήτου και μόνο δεν αποτελεί</h4>
<p style="font-size:0.9rem; line-height:1.6;">προσδιοριστικό στοιχείο της ταυτότητας του ακινήτου. Με απόφαση του Ο.Κ.Χ.Ε.,<br>καθορίζεται ο τρόπος υπολογισμού, επί το μείζον ή έλασσον, της" αποδεκτής<br>αποκλίσεως" της τιμής του καταχωρισθέντος στο κτηματολογικό φύλλο του ακινήτου<br>εμβαδού, σε σχέση προς την τιμή που Προκύπτει από την εμβαδομέτρηση με μέθοδο<br>ακριβέστερη από την προβλεπόμενη στις τεχνικές προδιαγραφές σύνταξης του Εθνικού<br>Κτηματολογίου. Η "αποδεκτή απόκλιση «αποτελεί στοιχείο του αποσπάσματος<br>κτηματολογικού διαγράμματος και του κτηματογραφικού διαγράμματος του ακινήτου<br>που προβλέπονται στο άρθρο 14 παρ.4 του νόμου αυτού. Εντός του ως άνω πλαισίου<br>της "αποδεκτής αποκλίσεως", η καταχωρισθείσα στο Κτηματολόγιο τιμή του εμβαδού<br>και η προκύπτουσα από ακριβέστερη εμβαδομέτρηση τιμή αυτού θεωρούνται<br>συμβατές.<br>Με όμοια απόφαση, στην οποία λαμβάνονται υπόψη οι τεχνικές προδιαγραφές<br>σύνταξης του Εθνικού Κτηματολογίου, προβλέπεται ο τρόπος αποτύπωσης στο<br>κτηματογραφικό διάγραμμα "ζώνης κανονισμού ορίων" περιμετρικά εκάστου<br>γεωτεμαχίου σε σχέση προς τα όμορα γεωτεμάχια, εντός της οποίας μπορεί να<br>καθορίζεται με έγγραφη συμφωνία των κυρίων των όμορων γεωτεμαχίων ή με<br>κανονισμό από το δικαστήριο, κατά το άρθρο 1020 ΑΚ, η ακριβής θέση του κοινού<br>ορίου των γεωτεμαχίων, η οποία και αποτυπώνεται, σε αμφότερες τις περιπτώσεις, στο<br>κτηματογραφικό διάγραμμα του άρθρου 14 παρ. 4 και καταχωρίζεται στο<br>Κτηματολόγιο με αίτηση όποιου έχει έννομο συμφέρον, σύμφωνα με τα οριζόμενα στο<br>εν λόγω άρθρο. Εντός της ως άνω "ζώνης κανονισμού ορίων", το κτηματογραφικό<br>διάγραμμα του γεωτεμαχίου θεωρείται συμβατό, ως προς το σχήμα και τα όρια του<br>γεωτεμαχίου, προς τα συντασσόμενα με ακριβέστερες μεθόδους τοπογραφικά<br>διαγράμματα. Ως προς τη σύνθεση του δικαστηρίου, όταν συζητείται υπόθεση<br>κανονισμού ορίων κατά το άρθρο 1020 ΑΚ, εφαρμόζεται αναλόγως η διάταξη του<br>άρθρου 17 παρ. 4 του νόμου αυτού.<br>2. Εφόσον η τιμή του εμβαδού που αναγράφεται στην προς καταχώριση πράξη και το<br>τοπογραφικό διάγραμμα που επισυνάπτεται σε αυτήν είναι συμβατά, κατά την<br>ανωτέρω έννοια, προς τις αντίστοιχες καταχωρίσεις στο Κτηματολόγιο, ο<br>Προϊστάμενος του Κτηματολογικού Γραφείου καταχωρίζει την πράξη. Σε περίπτωση<br>μη συμβατής, κατά την ανωτέρω έννοια, τιμής του εμβαδού που αναγράφεται στην</p><p>προς καταχώριση πράξη, καθώς επίσης σε περίπτωση μη συμβατού, κατά την ανωτέρω<br>έννοια, τοπογραφικού διαγράμματος που επισυνάπτεται στην προς καταχώριση πράξη,<br>ο Προϊστάμενος του Κτηματολογικοί Γραφείου αποφασίζει, στο πλαίσιο του<br>διενεργούμενου ελέγχου νομιμότητας, αν μπορεί να καταχωρίσει απευθείας την πράξη,<br>χωρίς την προηγούμενη διόρθωση, εν όλω ή εν μέρει, της εγγραφής στο Κτηματολόγιο<br>σύμφωνα με τις διατάξεις του νόμου αυτού, υπό την προϋπόθεση ότι έχει υποβληθεί<br>αίτηση διόρθωσης των γεωμετρικών στοιχείων σύμφωνα με τα οριζόμενα στο άρθρο<br>19 παρ. 2 του νόμου αυτού.<br>ΚΕΦΑΛΑΙΟ ΤΕΤΑΡΤΟ<br>Διαδικασία κτηματολογικών εγγραφών</p>
</div>
<div id="art-14" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 14 — Αίτηση εγγραφής και συνυποβαλλόμενα δικαιολογητικά</h4>
<p style="font-size:0.9rem; line-height:1.6;">Σχετικό: άρθρο 13 παρ.1 εδάφιο τρίτο Ν.4164/2013,ΦΕΚ Α 156/9.7.2013.<br>1. Για την καταχώριση στα κτηματολογικά φύλλα των πράξεων του άρθρου 12<br>απαιτείται, πλην των περιπτώσεων που ορίζονται διαφορετικά στον νόμο, υποβολή<br>αιτήσεως και ταυτόχρονη καταβολή των τελών και δικαιωμάτων της παραγράφου 2<br>του άρθρου 4.<br>Η αίτηση που απευθύνεται στο Κτηματολογικό Γραφείο και τα συνυποβαλλόμενα σε<br>αυτήν έγγραφα, όπως αυτά ορίζονται στις επόμενες παραγράφους και στην κείμενη<br>νομοθεσία, επιτρέπεται να υποβάλλονται και να διακινούνται με ηλεκτρονικά μέσα.<br>Με όμοιο τρόπο είναι δυνατόν να καταβάλλονται τα τέλη και δικαιώματα της παρ. 2<br>του άρθρου 4.<br>Με απόφαση του Δ.Σ. του Ν.Π.Δ.Δ. «Ελληνικό Κτηματολόγιο» καθορίζεται η<br>ημερομηνία από την οποία η υποβολή των εγγραπτέων πράξεων του πρώτου εδαφίου<br>στα Κτηματολογικά Γραφεία και Υποκαταστήματα του Ν.Π.Δ.Δ. «Ελληνικό<br>Κτηματολόγιο» διενεργείται υποχρεωτικά μόνο ηλεκτρονικά. Με όμοια απόφαση<br>καθορίζεται η ημερομηνία κατά την οποία οι εγγραπτέες πράξεις, που υποβάλλονται<br>υποχρεωτικά ηλεκτρονικά, δύνανται να υποβάλλονται επί εικοσιτετράωρης βάσης,<br>σύμφωνα με την αρχή της χρονικής προτεραιότητας κατά την επεξεργασία αυτών.<br>2. α) Την αίτηση της παραγράφου 1 υποβάλλει κάθε πρόσωπο (φυσικό ή νομικό) που<br>έχει έννομο συμφέρον. Η αίτηση μπορεί να υποβληθεί και από τον πληρεξούσιο<br>δικηγόρο του αιτούντος ή άλλον πληρεξούσιο δυνάμει πληρεξουσιότητας που του έχει<br>παρασχεθεί συμβολαιογραφικά. Την αίτηση έχει δικαίωμα επίσης να υποβάλει, όταν<br>πρόκειται για εγγραπτέο δικαίωμα που στηρίζεται σε συμβολαιογραφική πράξη, ο<br>συμβολαιογράφος που τη συνέταξε ή ο νόμιμος αναπληρωτής του ή ο αρχειοφύλακας<br>ή εξουσιοδοτημένος συνεργάτης του με γραπτή εξουσιοδότηση.<br>β) Όταν πρόκειται για το Δημόσιο ή για νομικά πρόσωπα δημοσίου δικαίου, την αίτηση<br>της παραγράφου 1 υποβάλλει ο Προϊστάμενος της αρμόδιας υπηρεσίας ή<br>εξουσιοδοτημένος από αυτόν υπάλληλος.<br>3. Στην αίτηση αναγράφονται τα ακόλουθα στοιχεία του προσώπου για το οποίο<br>ζητείται η καταχώριση : σε περίπτωση φυσικού προσώπου το όνομα, το επώνυμο, το<br>όνομα και επώνυμο των γονέων, η χρονολογία γέννησης, ο αριθμός του δελτίου<br>ταυτότητας, ο αριθμός φορολογικού μητρώου και η διεύθυνση, σε περίπτωση νομικού</p><p>προσώπου η επωνυμία, η έδρα, η διεύθυνση, η συστατική του πράξη, η νόμιμη<br>δημοσίευση αυτής και ο αριθμός φορολογικού μητρώου. Στην αίτηση μνημονεύονται<br>επίσης η πράξη, η νόμιμη δημοσίευση αυτής και ο αριθμός φορολογικού μητρώου.<br>Στην αίτηση μνημονεύονται επίσης η πράξη της οποίας ζητείται η καταχώριση και τα<br>συνυποβαλλόμενα έγγραφα, το ακίνητο στο οποίο αφορά η ζητούμενη καταχώριση, με<br>τον κωδικό του αριθμό, το κτηματολογικό φύλλο στο οποίο έχουν καταχωριστεί<br>προηγούμενες κτηματολογικές εγγραφές για το ακίνητο. Με απόφαση του Οργανισμού<br>Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, η οποία δημοσιεύεται στην<br>Εφημερίδα της Κυβερνήσεως, μπορεί να ορίζονται και άλλα στοιχεία που πρέπει να<br>περιέχει η αίτηση.<br>4. Με την αίτηση της παραγράφου 1 συνυποβάλλονται τα έγγραφα στα οποία<br>περιέχεται η πράξη της οποίας ζητείται η καταχώριση στα κτηματολογικά φύλλα,<br>αντίγραφο του τοπογραφικού διαγράμματος που έχει συνταχθεί και έχει προσαρτηθεί<br>στην προς καταχώριση εγγραπτέα πράξη, περίληψη της εγγραπτέας πράξης, το<br>περιεχόμενο και ο τύπος της οποίας καθορίζονται με απόφαση του Υπουργού<br>Ψηφιακής Διακυβέρνησης, που δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως και<br>κυρωμένο απόσπασμα του κτηματολογικού διαγράμματος για το ακίνητο στο οποίο<br>αφορά η εγγραπτέα πράξη. Αν η εγγραπτέα πράξη αφορά σε δύο ή περισσότερες<br>διηρημένες ιδιοκτησίες κείμενες εντός του ιδίου γεωτεμαχίου, συνυποβάλλεται ένα<br>κυρωμένο απόσπασμα του κτηματολογικού διαγράμματος του γεωτεμαχίου. Περίληψη<br>εγγραπτέας πράξης δεν συνυποβάλλεται, όταν η πράξη της οποίας ζητείται η<br>καταχώριση στα κτηματολογικά φύλλα αφορά σε εξάλειψη, κατάργηση, διαγραφή ή<br>άρση εγγραπτέου δικαιώματος. Όταν η πράξη της οποίας ζητείται η καταχώριση<br>επιφέρει γεωμετρική μεταβολή στα κτηματολογικά διαγράμματα, αντί του<br>αποσπάσματος του κτηματολογικού διαγράμματος συνυποβάλλεται κτηματογραφικό<br>διάγραμμα και τοπογραφικό διάγραμμα γεωμετρικών μεταβολών για την αποτύπωση<br>της όποιας μεταβολής επέρχεται με την εγγραπτέα πράξη, με την επιφύλαξη των<br>οριζομένων στην παράγραφο 5, εάν πρόκειται για εμπράγματη δικαιοπραξία. Το<br>περιεχόμενο του κτηματογραφικού διαγράμματος και το ύψος του υπέρ του Ν.Π.Δ.Δ.<br>«Ελληνικό Κτηματολόγιο», όπως αυτή μετονομάζεται, ανταποδοτικού τέλους για τη<br>χορήγηση του, καθορίζονται με απόφαση των Υπουργών Εθνικής Οικονομίας και<br>Οικονομικών και Ψηφιακής Διακυβέρνησης. Αν η αίτηση υποβληθεί από πληρεξούσιο,<br>νόμιμο αντιπρόσωπο ή όργανο νομικού προσώπου, συνυποβάλλονται επίσης και τα<br>έγγραφα από τα οποία αποδεικνύεται η νομιμοποίηση του προσώπου που υπογράφει<br>την αίτηση. Τα έγγραφα αυτά τηρούνται στο αρχείο τίτλων και δικαιολογητικών.<br>5. Εάν η πράξη της οποίας ζητείται η καταχώριση στο κτηματολογικό φύλλο είναι<br>εμπράγματη δικαιοπραξία, επισυνάπτεται σε αυτήν, υποχρεωτικώς και επί ποινή<br>ακυρότητάς της, το προβλεπόμενο στην προηγούμενη παράγραφο κυρωμένο<br>απόσπασμα του κτηματολογικού διαγράμματος, απλό αντίγραφο του οποίου<br>συνυποβάλλεται με την αίτηση της παραγράφου 1. Αν η εγγραπτέα πράξη αφορά σε<br>δύο ή περισσότερες διηρημένες ιδιοκτησίες κείμενες εντός του ιδίου γεωτεμαχίου,<br>επισυνάπτεται ένα κυρωμένο απόσπασμα του κτηματολογικού διαγράμματος του<br>γεωτεμαχίου.</p><p>6. Η καταχώριση στο Κτηματολόγιο των αναφερόμενων στην παράγραφο 2 του άρθρου<br>12 του νόμου αυτού διοικητικών πράξεων γίνεται με αίτηση της αρμόδιας για την<br>έκδοση ή κύρωσή τους, αντίστοιχα, αρχής, η οποία ενεργεί είτε αυτεπαγγέλτως είτε<br>κατόπιν αιτήματος προς αυτήν όποιου έχει έννομο συμφέρον. Με μέριμνα της αρχής<br>αυτής, αποτυπώνονται στα κτηματογραφικά διαγράμματα με ψηφιακή μορφή οι<br>μεταβολές που τυχόν επιφέρουν οι εν λόγω πράξεις στα γεωτεμάχια. Λεπτομέρειες για<br>τη διαδικασία καταχώρισης, στην περίπτωση αυτή, ορίζονται με απόφαση του<br>Ο.Κ.Χ.Ε.. Την αίτηση για την καταχώριση των ως άνω πράξεων για μεμονωμένα<br>ακίνητα μπορεί να υποβάλει και όποιος έχει έννομο συμφέρον.<br>Την αίτηση για την καταχώριση των ως άνω διοικητικών πράξεων για μεμονωμένα<br>ακίνητα μπορεί να υποβάλει και όποιος έχει έννομο συμφέρον. Εφόσον η προς<br>καταχώριση πράξη επιφέρει χωρική μεταβολή στα ακίνητα αυτά, με την αίτηση<br>συνυποβάλλεται κτηματογραφικό διάγραμμα επί του οποίου αποτυπώνεται η<br>μεταβολή, με ευθύνη του συντάκτη ιδιώτη μηχανικού και σύμφωνα με δική του<br>υπεύθυνη δήλωση όπου βεβαιώνει την ορθή εφαρμογή των διαγραμμάτων που<br>συνοδεύουν την οικεία διοικητική πράξη στο συνυποβαλλόμενο κτηματογραφικό<br>διάγραμμα.<br>7. Από την ημερομηνία που καθορίζεται στην απόφαση του τέταρτου εδαφίου της παρ.<br>1, οι εγγραπτέες συμβολαιογραφικές πράξεις, για τις οποίες υποβάλλεται αίτηση<br>καταχώρισης σύμφωνα με το παρόν άρθρο, υποβάλλονται σε ψηφιακό αντίγραφο, το<br>οποίο συνοδεύεται από ψηφιακή περίληψη της εγγραπτέας συμβολαιογραφικής<br>πράξης. Τα ψηφιακά έγγραφα του πρώτου εδαφίου υποβάλλονται σε αναγνώσιμη<br>μορφή φορητού εγγράφου (.pdf ), και όχι ως σαρωμένα αρχεία, και φέρουν την<br>ψηφιακή υπογραφή του συμβολαιογράφου, χωρίς χειρόγραφες παραπομπές.<br>8. Από την ημερομηνία που καθορίζεται στην απόφαση του τέταρτου εδαφίου της παρ.<br>1, καταργείται η υποχρέωση της προσάρτησης αποσπάσματος κτηματολογικού<br>διαγράμματος από τον αιτούντα την καταχώριση εγγραπτέας πράξης. Στην περίπτωση<br>αυτή, το απόσπασμα κτηματολογικού διαγράμματος προσαρτάται από την αρμόδια<br>υπηρεσία του Φορέα, μετά από την καταβολή του σχετικού τέλους από τον αιτούντα<br>την καταχώριση, κατά την υποβολή της αίτησης καταχώρισης. Από την ίδια<br>ημερομηνία, καταργείται η υποχρέωση συνυποβολής απλού αντιγράφου α) κυρωμένου<br>αποσπάσματος κτηματολογικού διαγράμματος της παρ. 5 του άρθρου 14 του παρόντος<br>και β) ηλεκτρονικού διαγράμματος της παρ. 1 του άρθρου 40 του ν. 4409/2016 (Α’<br>136).</p>
</div>
<div id="art-15" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 15 — Εγγραφή της αίτησης στο ημερολόγιο- Χρονική προτεραιότητα</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Οι αιτήσεις εγγράφονται αυθημερόν στο ημερολόγιο. Η εγγραφή γίνεται κατά τη<br>χρονική σειρά υποβολής των αιτήσεων στο Κτηματολογικό Γραφείο. Κάθε αίτηση<br>αριθμείται κατά τη σειρά της υποβολής της και φέρει τον ακριβή χρόνο (ημερομηνία<br>και ώρα) παραλαβής της από το αρμόδιο Γραφείο Κτηματολογίου. Με απόφαση του<br>Υπουργού Περιβάλλοντος, Ενέργειας και Κλιματικής Αλλαγής, η οποία δημοσιεύεται<br>στην Εφημερίδα της Κυβερνήσεως ρυθμίζονται οι λεπτομέρειες που αφορούν στην<br>εγγραφή στο ημερολόγιο των αιτήσεων που υποβάλλονται επί τόπου στο</p><p>Κτηματολογικό Γραφείο, καθώς και εκείνων που υποβάλλονται και διακινούνται με<br>ηλεκτρονικά μέσα κατά τα οριζόμενα στην παράγραφο 1 του άρθρου 14 και κάθε άλλο<br>θέμα σχετικό με την εφαρμογή αυτής της παραγράφου.<br>2. Η κατά το άρθρο 11 καταχώριση στα Κτηματολογικά φύλλα των πράξεων για τις<br>οποίες έχει υποβληθεί αίτηση γίνεται κατόπιν αποφάσεως του Προϊσταμένου του<br>Κτηματολογικού Γραφείου, αφού γίνει ο κατά το άρθρο 16 έλεγχος. Η αποδοχή ή η<br>απόρριψη της αίτησης γίνεται χωρίς υπαίτια καθυστέρηση και πάντως σε χρόνο όχι<br>μεγαλύτερο από πέντε (5) εργάσιμες ημέρες από την ημέρα υποβολής της .Χρόνος<br>καταχώρισης στα Κτηματολογικά φύλλα θεωρείται η ημερομηνία υποβολής της<br>αίτησης για την καταχώρηση.<br>Σημ.: όπως τροποποιήθηκε με την παρ.7άρθρ.2 Ν.3127/2003,ΦΕΚ Α 67/19.3.2003.<br>3. Αν υποβάλλονται για καταχώριση περισσότερες πράξεις που αφορούν σε δικαιώματα<br>πάνω στο ίδιο ακίνητο, επικρατεί εκείνη που υποβλήθηκε σε χρόνο προγενέστερο<br>(αρχή της χρονικής προτεραιότητας). Για κτηματολογικές εγγραφές της ίδιας ημέρας<br>ισχύουν, ανάλογα με το είδος του δικαιώματος στο οποίο αυτές αφορούν, οι κανόνες<br>των άρθρων 1206, 1207, 1272 παράγραφος 2 και 1301 του Αστικού Κώδικα.</p>
</div>
<div id="art-16" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 16 — Έλεγχος των αιτήσεων και των συνυποβαλλόμενων δικαιολογητικών- Άρνηση</h4>
<p style="font-size:0.9rem; line-height:1.6;">καταχώρισης-Διαδικασία επίλυσης διαφορών<br>1. Ο διενεργούμενος στο Κτηματολογικό Γραφείο έλεγχος κάθε αίτησης και των<br>συνυποβαλλόμενων δικαιολογητικών είναι έλεγχος νομιμότητας.<br>Κατ’ αυτόν ελέγχεται περιοριστικώς:<br>α) αν το Κτηματολογικό Γραφείο είναι αρμόδιο κατά τόπον,<br>β) αν το δικαίωμα στο οποίο αφορά η αίτηση και η πράξη της οποίας ζητείται η<br>καταχώριση στα Κτηματολογικά φύλλα περιλαμβάνονται μεταξύ εκείνων των οποίων<br>ο νόμος επιτάσσει την καταχώριση,<br>γ) αν για την πράξη της οποίας ζητείται η καταχώριση, συντρέχουν όλες οι<br>απαιτούμενες από τον νόμο προϋποθέσεις για την επέλευση των έννομων<br>αποτελεσμάτων της. Ο έλεγχος αφορά αποκλειστικώς και μόνο στη νομιμότητα της<br>πράξεως, της οποίας ζητείται η καταχώριση, χωρίς να δύναται να επεκταθεί σε άλλες<br>πράξεις, σε προγενέστερο τίτλο κτήσης, σε εξέταση και συσχετισμό μεταγεγραμμένων<br>τίτλων ή στον έλεγχο της ορθότητας της πρώτης εγγραφής και περιορίζεται στο αν από<br>το περιεχόμενο της πράξης προκύπτει ότι έχουν τηρηθεί εκείνες οι διατυπώσεις, που<br>αν δεν τηρηθούν, ο νόμος ρητώς απαγορεύει την καταχώριση επί ποινή απολύτου<br>ακυρότητας,<br>δ) αν για την πράξη της οποίας ζητείται η καταχώριση, συνυποβάλλονται με την<br>αίτηση, με πληρότητα και ακρίβεια, τα αναφερόμενα στο άρθρο 14 δικαιολογητικά,<br>ε) αν το πρόσωπο, το οποίο προβαίνει σε εκποίηση ή του οποίου δικαίωμα επιδιώκεται<br>να επιβαρυνθεί ή δεσμευτεί, αναγράφεται στο Κτηματολογικό βιβλίο ως δικαιούχος,<br>στ) αν ο εμφανιζόμενος κατά την υποβολή της αιτήσεως ως πληρεξούσιος, νόμιμος<br>αντιπρόσωπος ή εκπρόσωπος νομικού προσώπου, νομιμοποιείται να προβεί στη<br>ζητούμενη καταχώριση.</p><p>2. Αν ο Προϊστάμενος του Κτηματολογικού Γραφείου αρνηθεί τη ζητούμενη<br>καταχώριση, σημειώνει την άρνησή του και εκθέτει συνοπτικά τους λόγους της επί της<br>αιτήσεως ή σε επισυναπτόμενο στην αίτηση πρόσθετο φύλλο και γνωστοποιεί αμελλητί<br>την απόφασή του αυτή στον αιτούντα.<br>3. Αν στα συνυποβαλλόμενα με την αίτηση δικαιολογητικά υπάρχει τυπική έλλειψη,<br>που είναι δυνατόν να διορθωθεί ή να συμπληρωθεί, ο Προϊστάμενος του<br>Κτηματολογικού Γραφείου μπορεί να τάξει σύντομη προθεσμία, όχι μεγαλύτερη των<br>πέντε εργάσιμων ημερών, μέσα στην οποία ο αιτών πρέπει να προσκομίσει τα<br>ελλείποντα στοιχεία. Στην περίπτωση αυτή η καταχώριση στα Κτηματολογικά φύλλα<br>γίνεται υπό την επιφύλαξη της εμπρόθεσμης προσκόμισης των στοιχείων που λείπουν<br>(προσωρινή-υπό επιφύλαξη-καταχώριση). Αν η έλλειψη συμπληρωθεί εμπρόθεσμα, ο<br>Προϊστάμενος του Κτηματολογικού Γραφείου τρέπει την προσωρινή καταχώριση σε<br>οριστική, σημειώνοντας την τροπή στην οικεία θέση του κτηματολογικού φύλλου.<br>Στην περίπτωση αυτή ημερομηνία της οριστικής καταχώρισης θεωρείται η ημερομηνία<br>της προσωρινής καταχώρισης.<br>4. Αν παρέλθει η κατά την προηγούμενη παράγραφο προθεσμία, χωρίς να<br>προσκομισθούν τα ελλείποντα στοιχεία, θεωρείται ότι δεν έγινε η καταχώριση και<br>εξαλείφεται αυτεπαγγέλτως η προσωρινή καταχώριση.<br>«4α. Στην περίπτωση προσωρινής καταχώρισης της παραγράφου 3 του παρόντος<br>άρθρου, ο Προϊστάμενος του Κτηματολογικού Γραφείου δεν επιτρέπεται να προβεί σε<br>καταχώριση μεταγενέστερης εγγραφής, προτού οριστικοποιηθεί ή εξαλειφθεί από το<br>κτηματολογικό φύλλο του ακινήτου η προσωρινή καταχώριση.»<br>5.Κατά της αρνητικής απόφασης του Προϊσταμένου του Κτηματολογικού Γραφείου,<br>καθώς και της εξάλειψης καταχώρισης, ο αιτών δικαιούται να προβάλει αντιρρήσεις.<br>Κατά της απόφασης του Προϊσταμένου, θετικής ή αρνητικής, μπορεί και κάθε τρίτος,<br>που έχει έννομο συμφέρον, να προβάλει αντιρρήσεις.<br>Οι αντιρρήσεις υποβάλλονται με αίτηση ενώπιον του Κτηματολογικού Δικαστή και<br>εγγράφονται στο κτηματολογικό φύλλο του ακινήτου. Ο Κτηματολογικός Δικαστής,<br>που δικάζει κατά τη διαδικασία της εκούσιας δικαιοδοσίας, ελέγχει αν η αντίρρηση έχει<br>εγγραφεί στο κτηματολογικό φύλλο του ακινήτου και σε αρνητική περίπτωση την<br>απορρίπτει ως απαράδεκτη.<br>Κατά τα λοιπά εφαρμόζονται αναλόγως οι διατάξεις των παραγράφων 2, 4 και 5 του<br>άρθρου 791του Κώδικα Πολιτικής Δικονομίας.<br>Έως ότου ορισθεί Κτηματολογικός Δικαστής οι αντιρρήσεις υποβάλλονται στο<br>Μονομελές Πρωτοδικείο της περιφέρειας του Κτηματολογικού Γραφείου, το οποίο<br>δικάζει κατά τη διαδικασία της εκούσιας δικαιοδοσίας, εφαρμόζοντας και τις ειδικές<br>διατάξεις των παραγράφων 2 έως 5 του άρθρου 791 του Κώδικα Πολιτικής Δικονομίας.<br>6. Με απόφαση του δικαστή ή του τριμελούς συμβουλίου που διευθύνει το δικαστήριο<br>ορίζεται σε κάθε Πρωτοδικείο, στην περιφέρεια του οποίου λειτουργεί Κτηματολογικό<br>Γραφείο, ένας πρωτοδίκης ως κτηματολογικός δικαστής, κατά προτίμηση μεταξύ των<br>αρχαιοτέρων, καθώς και ο αναπληρωτής του. Με τη νίδια απόφαση ορίζεται η θητεία<br>του τακτικού και του αναπληρωματικού κτηματολογικού δικαστή, η οποία δεν μπορεί<br>να υπερβεί συνολικά τα πέντε (5)έτη. Αντικατάσταση αυτού γίνεται με όμοια απόφαση,<br>εάν συντρέχει σπουδαίος λόγος. Με απόφαση του Υπουργού Δικαιοσύνης μπορεί να</p><p>αυξάνεται ο αριθμός των κτηματολογικών δικαστών με τους αναπληρωτές τους, που<br>ορίζονται σε κάθε Πρωτοδικείο.<br>ΚΕΦΑΛΑΙΟ ΠΕΜΠΤΟ<br>Διόρθωση κτηματολογικών στοιχείων</p>
</div>
<div id="art-17" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 17 — Διόρθωση ύστερα από δικαστική αμφισβήτηση των αναγραφόμενων στα</h4>
<p style="font-size:0.9rem; line-height:1.6;">Κτηματολογικά φύλλα δικαιωμάτων<br>1. Επιτρέπεται η διόρθωση των κτηματολογικών εγγραφών αν αμφισβητηθεί δικαίωμα<br>που αναγράφεται στα Κτηματολογικά φύλλα. Για τη διόρθωση αυτή απαιτείται<br>αμετάκλητη δικαστική απόφαση ύστερα από άσκηση της κατά την παράγραφο 2 του<br>άρθρου 6 ή της κατά την παράγραφο 2 του άρθρου 13 αγωγής.<br>2. Για τη διόρθωση υποβάλλεται στο Κτηματολογικό Γραφείο αίτηση από το διάδικο<br>που νίκησε ή τους διαδόχους τους εκείνους υπέρ των οποίων ισχύει το δεδικασμένο<br>από την απόφαση. Με την αίτηση συνυποβάλλονται η απόφαση και τα έγγραφα από τα<br>οποία προκύπτει το αμετάκλητο αυτής.<br>3. Αν ο Προϊστάμενος του Κτηματολογικού Γραφείου αρνηθεί να επιφέρει τη<br>διόρθωση, εφαρμόζονται οι διατάξεις των παραγράφων 2 έως 5 του άρθρου 16.<br>4. Αν αμφισβητηθεί η ακρίβεια κτηματολογικής εγγραφής, η διαφορά, αν αυτή δεν<br>υπάγεται στο Πολυμελές Πρωτοδικείο, εκδικάζεται από τον κτηματολογικό δικαστή,<br>που επιλαμβάνεται της υποθέσεως ως Μονομελές Πρωτοδικείο κατά τις διατάξεις της<br>αμφισβητούμενης δικαιοδοσίας. Όταν η διαφορά υπάγεται στην αρμοδιότητα του<br>Πολυμελούς Πρωτοδικείου, στη σύνθεσή του μετέχει και ο κτηματολογικός δικαστής.<br>Η έφεση κατά της παραπάνω απόφασης δικάζεται από τον κτηματολογικό εφέτη. Όταν<br>η έφεση εκδικάζεται από το Τριμελές Εφετείο, στη σύνθεσή του μετέχει και ο<br>κτηματολογικός εφέτης.</p>
</div>
<div id="art-18" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 18 — Διόρθωση πρόδηλων σφαλμάτων</h4>
<p style="font-size:0.9rem; line-height:1.6;">1.α) Ο Προϊστάμενος του Κτηματολογικού Γραφείου μπορεί, ύστερα από αίτηση<br>όποιου έχει έννομο συμφέρον ή και αυτεπαγγέλτως, να προβαίνει στη διόρθωση<br>πρόδηλων σφαλμάτων των κτηματολογικών εγγραφών, ιδίως σε περίπτωση<br>λανθασμένης αναγραφής στα κτηματολογικά φύλλα στοιχείων του δικαιούχου, τα<br>οποία προκύπτουν από την αστυνομική ταυτότητα ή άλλα δημόσια έγγραφα με<br>αποδεικτική ως προς τα στοιχεία αυτά ισχύ, καθώς επίσης στοιχείων σχετικών με το<br>καταχωρισθέν δικαίωμα, τον τίτλο αυτού και το ιδιοκτησιακό αντικείμενο, εφόσον το<br>σφάλμα στην καταχώριση προκύπτει κατά τρόπον αναμφισβήτητο από την<br>καταχωρισθείσα πράξη και τα συνοδευτικά αυτής έγγραφα. Η αίτηση για τη διόρθωση<br>καταχωρίζεται στο κτηματολογικό φύλλο του ακινήτου.<br>Η αίτηση δεν επιβαρύνεται με τέλη και δικαιώματα, πάγια ή αναλογικά.<br>Πιστοποιητικά, αντίγραφα και αποσπάσματα που εκδίδονται από τα βιβλία των<br>Υποθηκοφυλακείων και των Κτηματολογικών Γραφείων, ύστερα από αίτηση όποιου<br>έχει έννομο συμφέρον και προορίζονται για να συνυποβληθούν με την αίτηση<br>διόρθωσης πρόδηλου σφάλματος, καθώς και οι αιτήσεις που υποβάλλονται για την<br>έκδοσή τους, απαλλάσσονται από κάθε τέλος και δικαίωμα, πάγιο ή αναλογικό. Σχετική</p><p>αιτιολογία αναγράφεται στο έντυπο της αίτησης προς έκδοση με ευθύνη και επιμέλεια<br>του αιτούντα και επισημείωση ανάλογου περιεχομένου τίθεται από το αρμόδιο<br>Υποθηκοφυλακείο ή Κτηματολογικό Γραφείο στα εκδιδόμενα στοιχεία για τη νόμιμη<br>χρήση τους. Η προηγούμενη λήψη και συνυποβολή πιστοποιητικών, αντιγράφων και<br>αποσπασμάτων από τα βιβλία των Υποθηκοφυλακείων και των Κτηματολογικών<br>Γραφείων δεν απαιτείται, όταν η υποβολή της αίτησης διόρθωσης πρόδηλου<br>σφάλματος απευθύνεται προς Κτηματολογικό Γραφείο ή Υποκατάστημα του νομικού<br>προσώπου δημοσίου δικαίου με την επωνυμία «Ελληνικό Κτηματολόγιο» που έχει<br>συσταθεί και λειτουργεί σύμφωνα με τον ν. 4512/2018 (Α’ 5) και διαθέτει τα σχετικά<br>έγγραφα στα τηρούμενα αρχεία του, από τα οποία τα αναζητά αυτεπάγγελτα. Απλά<br>αντίγραφα, τα οποία ο αιτών συνυποβάλλει με την αίτηση διόρθωσης, γίνονται δεκτά<br>και λαμβάνονται υπόψη.<br>β) Στην περίπτωση των αρχικών εγγραφών, το πρόδηλο σφάλμα μπορεί να αφορά σε<br>οποιοδήποτε στοιχείο της εγγραφής και ιδίως στον δικαιούχο, στο δικαίωμα, στον τίτλο<br>κτήσης και στο ιδιοκτησιακό αντικείμενο. Η αίτηση για τη διόρθωση καταχωρίζεται<br>στο κτηματολογικό φύλλο του ακινήτου. Σε εξαιρετικές περιπτώσεις, όταν η διόρθωση<br>αφορά στα στοιχεία μεταγραφής, άλλως εγγραφής, του τίτλου κτήσης που αφορά στο<br>καταχωρισθέν στις αρχικές εγγραφές εγγραπτέο δικαίωμα, επειδή αυτά ελλείπουν, ή<br>αναγράφονται λανθασμένα, η συμπλήρωση ή η ορθή αναγραφή τους, κατά περίπτωση,<br>διενεργείται υποχρεωτικά και αυτεπάγγελτα από τον Προϊστάμενο του<br>Κτηματολογικού Γραφείου. Ενδεικτικά, πρόδηλο είναι το σφάλμα όταν η ανακρίβεια<br>στα στοιχεία της εγγραφής:<br>αα) Προκύπτει από δημόσιο έγγραφο που καταχωρίσθηκε στα βιβλία του<br>Υποθηκοφυλακείου πριν από την ανάρτηση των στοιχείων της κτηματογράφησης, η<br>οποία προηγείται της έκδοσης της διαπιστωτικής πράξης του άρθρου 11 του ν.<br>2308/1995, ή και μετά από αυτήν, εφόσον στηρίζεται σε προηγούμενη πράξη<br>καταχωρισθείσα στα βιβλία του Υποθηκοφυλακείου πριν από την εν λόγω ανάρτηση,<br>υπό την προϋπόθεση ότι μέσω της διορθώσεως δεν αντικαθίσταται (εκτοπίζεται)<br>δικαίωμα τρίτου, εκτός αν ο τρίτος συναινεί στη διόρθωση, συνυπογράφοντας την<br>αίτηση, η συναίνεση δε αυτή δεν υποκρύπτει άτυπη μεταβίβαση ή μεταβολή τίτλου του<br>ακινήτου. Σε κάθε περίπτωση, ο έλεγχος επί της αίτησης περιορίζεται στην ύπαρξη του<br>δημόσιου εγγράφου ως καταχωρισθέντος στα βιβλία αυτού υπό τις περιγραφόμενες στο<br>παρόν προϋποθέσεις και δεν εκτείνεται στην αξιολόγηση της περιγραφόμενης σε αυτό<br>διαδοχής δικαιοπαρόχων ή των αναφερόμενων σε αυτό τίτλων κτήσης.<br>Εκτοπισμός δεν υφίσταται και δεν απαιτείται συναίνεση, εάν ο τρίτος συμπεριλήφθηκε<br>ως δικαιούχος, ο οποίος αναγράφεται στις κτηματολογικές εγγραφές, λόγω σφάλματος<br>που εμφιλοχώρησε κατά την επεξεργασία της δήλωσης και των δημοσίων εγγράφων<br>που συνυπέβαλε κατά τη διαδικασία κτηματογράφησης του ν. 2308/1995 (Α’ 114) και<br>τούτο προκύπτει από το αρχείο κτηματογράφησης και τα δημόσια βιβλία του<br>Υποθηκοφυλακείου.<br>Στην περίπτωση ακινήτου με την ένδειξη «άγνωστου ιδιοκτήτη», η αίτηση επιδίδεται<br>υποχρεωτικά εντός δέκα (10) ημερών από την κατάθεσή της στο Ελληνικό Δημόσιο.<br>Το Ελληνικό Δημόσιο τεκμαίρεται ότι συναινεί στην αίτηση και ο προϊστάμενος<br>οφείλει να προβεί στην αιτούμενη διόρθωση, εάν δεν αποσταλεί από την αρμόδια</p><p>υπηρεσία αρνητική απάντηση που απευθύνεται στον προϊστάμενο του αρμόδιου<br>κτηματολογικού γραφείου εντός εξήντα (60) ημερών από την επίδοση της αίτησης στο<br>Ελληνικό Δημόσιο. Σε περίπτωση αρνητικής απάντησης, ακόμη και χωρίς ειδική<br>αιτιολογία, ο προϊστάμενος οφείλει να απορρίψει την αίτηση. Η παραπάνω επίδοση δεν<br>απαιτείται εάν πρόκειται για δημόσιο έγγραφο, με βάση το οποίο έχουν καταχωρισθεί<br>στο κτηματολογικό φύλλο του ακινήτου δικαιώματα συνδικαιούχων.<br>Επίδοση στο Ελληνικό Δημόσιο δεν απαιτείται και στην περίπτωση που το δημόσιο<br>έγγραφο, με βάση το οποίο ζητείται η διόρθωση της εγγραφής, αποτελεί τίτλο<br>εγγραπτέου δικαιώματος επί άλλου κτηματογραφηθέντος ακινήτου της ίδιας<br>κτηματογραφηθείσας περιοχής, το οποίο δηλώθηκε και καταχωρίσθηκε στο<br>κτηματολόγιο, καθώς και όταν ο τίτλος του αιτούντος τη διόρθωση ή των<br>δικαιοπαρόχων του (άμεσων ή απώτερων) είναι παραχωρητήριο του Ελληνικού<br>Δημοσίου ή Ν.Π.Δ.Δ.. Το ίδιο ισχύει επίσης όταν το ακίνητο με την ένδειξη «άγνωστου<br>ιδιοκτήτη», για το οποίο ζητείται η διόρθωση, είναι οριζόντια ή κάθετη ιδιοκτησία ή το<br>ακίνητο βρίσκεται εντός εγκεκριμένου σχεδίου πόλεως ή οικισμού.<br>Το προηγούμενο εδάφιο εφαρμόζεται και στην περίπτωση που στην οριζόντια ή κάθετη<br>ιδιοκτησία δεν αντιστοιχεί αυτοτελές κτηματολογικό φύλλο, αλλά το αντιστοιχούν σε<br>αυτήν ποσοστό συγκυριότητας επί του γεωτεμαχίου εμφανίζεται με την ένδειξη<br>«άγνωστου ιδιοκτήτη». Στην περίπτωση αυτή, εφόσον συντρέχουν οι προϋποθέσεις της<br>διορθώσεως της αρχικής εγγραφής με τη διαδικασία του πρόδηλου σφάλματος,<br>δημιουργείται αυτοτελές κτηματολογικό φύλλο για την οριζόντια ή κάθετη, αντίστοιχα,<br>ιδιοκτησία,<br>ββ) προκύπτει από τη συσχέτιση της αρχικής εγγραφής προς τα στοιχεία της<br>ανάρτησης, που προηγείται της έκδοσης της διαπιστωτικής πράξης του άρθρου 11 του<br>ν. 2308/1995, ή του τελικού αναμορφωμένου πίνακα της κτηματογράφησης, από τα<br>οποία αποκλίνει άνευ νόμιμου λόγου,<br>γγ) προκύπτει από τη συσχέτιση της αρχικής εγγραφής προς τα στοιχεία διοικητικής<br>πράξης ή δικαστικής απόφασης που συνιστούν πρωτότυπο τρόπο κτήσης δικαιώματος,<br>ο οποίος κατισχύει, οπωσδήποτε, του καταχωρισθέντος στην αρχική εγγραφή<br>δικαιώματος, εφόσον η διόρθωση στην περίπτωση αυτή δεν έρχεται σε αντίθεση με<br>απόφαση επιτροπής ενστάσεων που εκδόθηκε κατά τη διαδικασία της<br>κτηματογράφησης,<br>δδ) αφορά στην ολική ή μερική έλλειψη ή στην ανακρίβεια στοιχείων οριζόντιων ή<br>κάθετων ιδιοκτησιών, η οποία μπορεί να θεραπευθεί με αναδρομή στην πράξη<br>σύστασης, στον κανονισμό της οριζόντιας ιδιοκτησίας και στα συνοδευτικά αυτών ή<br>επ’ αυτών ερειδόμενα δημόσια έγγραφα που συνυποβάλλονται με την αίτηση. Υπό τις<br>ανωτέρω προϋποθέσεις μπορεί, μέσω της διορθώσεως, να δημιουργηθεί και να<br>συμπληρωθεί με τα στοιχεία του δικαιούχου κτηματολογικό φύλλο οριζόντιας ή<br>κάθετης ιδιοκτησίας, ήδη υλοποιηθείσας ή μέλλουσας, η οποία δεν εμφαίνεται στις<br>πρώτες εγγραφές ως αυτοτελές ιδιοκτησιακό αντικείμενο.<br>Στις υποπερ. αα), ββ), γγ) και δδ), η διόρθωση γίνεται υποχρεωτικά, επιτρεπομένης<br>μόνο της αιτιολογημένης άρνησης για λόγους μη συνδρομής των προϋποθέσεων που<br>αναφέρονται στις οικείες περιπτώσεις. Ο Προϊστάμενος του Κτηματολογικού<br>Γραφείου οφείλει να προβεί είτε στη σχετική διόρθωση είτε στην αιτιολογημένη</p><p>άρνηση εντός τριάντα (30) εργάσιμων ημερών από την υποβολή της αίτησης. Η<br>παρέλευση άπρακτου του ανωτέρω χρονικού διαστήματος δεν συνιστά σιωπηρή<br>άρνηση.<br>γ) Εφόσον το πρόδηλο σφάλμα της αρχικής εγγραφής αφορά σε γεωμετρικά στοιχεία<br>του γεωτεμαχίου, υποβάλλεται αίτηση διόρθωσης των γεωμετρικών στοιχείων υπό<br>τους όρους της παρ. 2 του άρθρου 19 του νόμου αυτού.<br>δ) Διόρθωση πρόδηλου σφάλματος αρχικής εγγραφής δεν επιτρέπεται, εφόσον<br>προηγουμένως έχει λάβει χώρα μεταγενέστερη εγγραφή, οπωσδήποτε ασυμβίβαστη με<br>τη διωκόμενη διόρθωση, εκτός αν ο δικαιούχος από τη μεταγενέστερη αυτή εγγραφή<br>συναινεί στη διόρθωση, συνυπογράφοντας την αίτηση, η συναίνεση δε αυτή δεν<br>υποκρύπτει άτυπη μεταβίβαση ή μεταβολή τίτλου του ακινήτου.<br>ε) Διόρθωση αρχικής εγγραφής με τη διαδικασία του πρόδηλου σφάλματος μπορεί να<br>διενεργηθεί και μετά από απόφαση του νομικού προσώπου δημοσίου δικαίου με την<br>επωνυμία «Ελληνικό Κτηματολόγιο» (Φορέας) που ενεργεί κατόπιν αίτησης όποιου<br>έχει έννομο συμφέρον, όποτε συντρέχουν οι προϋποθέσεις για την εκ μέρους του<br>ανάκληση της διαπιστωτικής πράξης περαίωσης της κτηματογράφησης, για το<br>συγκεκριμένο και μόνο κτηματογραφημένο ακίνητο ή ομάδα κτηματογραφημένων<br>ακινήτων που αφορά η διόρθωση, κατά περίπτωση, σύμφωνα με τα γενικώς ισχύοντα<br>για την ανάκληση των διοικητικών πράξεων. Η εν λόγω δυνατότητα υφίσταται ιδίως<br>όταν, με την ανάκληση της αρχικής εγγραφής, επιδιώκεται η ορθή αποτύπωση στις<br>αρχικές εγγραφές διοικητικής πράξεως με διαπλαστικό για τα εμπράγματα δικαιώματα<br>χαρακτήρα και ισχύουσας έναντι πάντων.<br>στ) Διόρθωση πρόδηλου σφάλματος των αρχικών εγγραφών, σύμφωνα με τα ανωτέρω,<br>επιτρέπεται μόνο μέχρι την οριστικοποίησή τους. Μετά την οριστικοποίηση των<br>αρχικών εγγραφών, διόρθωση επιτρέπεται υπό τις προϋποθέσεις της παραγράφου 1<br>περ. α’ του παρόντος άρθρου. Αγωγή του άρθρου 6 του νόμου αυτού για τη διόρθωση<br>αρχικής εγγραφής, η οποία ασκείται μετά τη διόρθωση της εγγραφής με τη διαδικασία<br>του άρθρου αυτού, απευθύνεται και κατά του τυχόν, μέσω της διορθώσεως αυτής,<br>καταχωρισθέντος στο κτηματολογικό φύλλο του ακινήτου ως δικαιούχου.<br>ζ) Η υποβολή αίτησης διόρθωσης προδήλου σφάλματος δεν συνιστά αναγκαία<br>προδικασία για την υποβολή και συζήτηση ενώπιον του δικαστηρίου αγωγών και<br>αιτήσεων διόρθωσης των κτηματολογικών εγγραφών, αρχικών και μεταγενέστερων,<br>κατά τις διατάξεις του νόμου αυτού.<br>2. Αν ο Προϊστάμενος του Κτηματολογικού Γραφείου δεν αποφανθεί μέσα σε τριάντα<br>(30) εργάσιμες ημέρες από την υποβολή της αίτησης ή αν απορρίψει την αίτηση,<br>εξαιρουμένων των υποπερ. αα), ββ), γγ) και δδ) της περ. β) της παρ. 1 για τις οποίες η<br>διόρθωση γίνεται υποχρεωτικά, επιτρεπομένης μόνο της αιτιολογημένης άρνησης, ο<br>αιτών δικαιούται να προσφύγει στον Κτηματολογικό Δικαστή μέσα σε προθεσμία<br>τριάντα (30) εργάσιμων ημερών από τη λήξη της προθεσμίας αυτής ή αφότου έλαβε<br>γνώση της απόρριψης της αίτησης. Η ανωτέρω προθεσμία απάντησης του<br>Προϊσταμένου του Κτηματολογικού Γραφείου αναστέλλεται για όσο χρονικό διάστημα<br>διαρκεί η προθεσμία απάντησης του Ελληνικού Δημοσίου, σύμφωνα με την υποπερ.<br>αα’ της περ. β’ της παρ. 1, εκτός εάν, εν τω μεταξύ, περιέλθει σε γνώση του<br>Προϊσταμένου ρητή απάντηση της αρμόδιας υπηρεσίας του Ελληνικού Δημοσίου. Η</p><p>αίτηση προς τον Κτηματολογικό Δικαστή καταχωρίζεται στα Κτηματολογικά φύλλα<br>στη θέση που καταχωρίζεται και η κατά την παρ. 2 του άρθρου 13 αγωγή. Κατά τα<br>λοιπά εφαρμόζονται όσα ορίζονται στην παρ. 5 του άρθρου 16.<br>3. Όπου στο παρόν άρθρο γίνεται αναφορά σε Προϊστάμενο Κτηματολογικού<br>Γραφείου, ως τέτοιος νοείται και όποιος υπάλληλος του Φορέα έχει κατά τον νόμο<br>αποφασιστική αρμοδιότητα καταχώρισης εγγραπτέων πράξεων.<br>4. Με απόφαση του νομικού προσώπου δημοσίου δικαίου με την επωνυμία «Ελληνικό<br>Κτηματολόγιο» δύνανται να καθορίζονται και να ρυθμίζονται περιπτώσεις πρόδηλων<br>σφαλμάτων, η διόρθωση των οποίων καθίσταται υποχρεωτική υπό τους όρους του<br>παρόντος, από τον Προϊστάμενο του Κτηματολογικού Γραφείου ή οποιονδήποτε<br>υπάλληλο έχει κατά τον νόμο αποφασιστική αρμοδιότητα καταχώρισης εγγραπτέων<br>πράξεων.</p>
</div>
<div id="art-19" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 19 — Διόρθωση κτηματολογικών εγγραφών σε άλλες περιπτώσεις</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Ο Προϊστάμενος του Κτηματολογικού Γραφείου, ύστερα από αίτηση όποιου έχει<br>έννομο συμφέρον, προβαίνει σε διόρθωση ληξιαρχικών στοιχείων που αναγράφονται<br>στα κτηματολογικά βιβλία, όταν η διόρθωση αυτή συνιστά συμμόρφωση σε<br>αμετάκλητη δικαστική απόφαση, που έχει εκδοθεί κατά τη διαδικασία της εκούσιας<br>δικαιοδοσίας σύμφωνα με το άρθρο 782 του Κώδικα Πολιτικής Δικονομίας.<br>2. α) Αν υπάρχουν σφάλματα που αφορούν σε γεωμετρικά στοιχεία των<br>κτηματολογικών εγγραφών, ο Προϊστάμενος του Κτηματολογικού Γραφείου προβαίνει<br>σε διόρθωση, ύστερα από αίτηση όποιου έχει έννομο συμφέρον. Η αίτηση συνοδεύεται<br>από τοπογραφικό διάγραμμα γεωμετρικών μεταβολών, στο οποίο αποτυπώνεται η<br>γεωμετρική μεταβολή που επέρχεται με την αιτούμενη διόρθωση. Η αίτηση δεν<br>επιβαρύνεται με τέλη και δικαιώματα, πάγια ή αναλογικά, και καταχωρίζεται, με ποινή<br>απαραδέκτου, στο κτηματολογικό φύλλο του ακινήτου του αιτούντος και των ακινήτων<br>των δικαιούχων που τυχόν επηρεάζονται από την αποδοχή της, στη θέση που<br>καταχωρίζεται και η κατά την παράγραφο 2 του άρθρου 13 αγωγή.<br>Πιστοποιητικά, αντίγραφα και αποσπάσματα που εκδίδονται από τα βιβλία των<br>Υποθηκοφυλακείων και των Κτηματολογικών Γραφείων, ύστερα από αίτηση όποιου<br>έχει έννομο συμφέρον και προορίζονται για να συνυποβληθούν με την αίτηση<br>διόρθωσης της παρούσας παραγράφου και της παραγράφου 4, καθώς και οι αιτήσεις<br>που υποβάλλονται για την έκδοσή τους, απαλλάσσονται από κάθε τέλος και δικαίωμα,<br>πάγιο ή αναλογικό. Σχετική αιτιολογία αναγράφεται στο έντυπο της αίτησης προς<br>έκδοση με ευθύνη και επιμέλεια του αιτούντα και επισημείωση ανάλογου περιεχομένου<br>τίθεται από το αρμόδιο Υποθηκοφυλακείο ή Κτηματολογικό Γραφείο στα εκδιδόμενα<br>στοιχεία για τη νόμιμη χρήση τους.<br>β) Αν η αποδοχή της αίτησης επηρεάζει δικαιώματα δικαιούχων όμορων ακινήτων,<br>αντίγραφο της, συνοδευόμενο από αντίγραφο του συνυποβαλλόμενου τοπογραφικού<br>διαγράμματος γεωμετρικών μεταβολών, καθώς και από αντίγραφο της εισήγησης του<br>Κτηματολογικού Γραφείου, ή, εάν αυτό δεν έχει συσταθεί και το υφιστάμενο<br>Υποθηκοφυλακείο εξακολουθεί να λειτουργεί μεταβατικά ως Κτηματολογικό Γραφείο,<br>της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή</p><p>μετονομάζεται, για τη συνδρομή των τεχνικών προϋποθέσεων της απεικόνισης της<br>γεωμετρικής μεταβολής που επέρχεται με την αιτούμενη διόρθωση στα κτηματολογικά<br>διαγράμματα, κοινοποιείται με επιμέλεια του αιτούντος, επί ποινή απαραδέκτου, σε<br>αυτούς. Κοινοποίηση της αίτησης στους δικαιούχους όμορων ακινήτων των οποίων τα<br>δικαιώματα επηρεάζονται από την αποδοχή της, δεν απαιτείται, εφόσον αυτοί<br>συγκατατίθενται εγγράφως, είτε συνυπογράφοντας την αίτηση και το<br>συνυποβαλλόμενο διάγραμμα γεωμετρικών μεταβολών, είτε με σχετική δήλωση<br>τους ενώπιον συμβολαιογράφου, είτε με υπεύθυνη δήλωση τους, επί της οποίας<br>βεβαιώνεται αρμοδίως το γνήσιο της υπογραφής τους, η συναίνεση δε αυτή δεν<br>υποκρύπτει άτυπη μεταβίβαση ή μεταβολή τίτλου του ακινήτου. Στις τελευταίες<br>περιπτώσεις η δήλωση τους περιλαμβάνει ρητά την αποδοχή της αιτούμενης<br>γεωμετρικής διόρθωσης, όπως αυτή αποτυπώνεται στο συνυποβαλλόμενο με την<br>αίτηση τοπογραφικό διάγραμμα γεωμετρικών μεταβολών. Στην περίπτωση όμορων<br>ακινήτων με την ένδειξη «αγνώστου ιδιοκτήτη», η αίτηση κοινοποιείται στο Ελληνικό<br>Δημόσιο, εκτός εάν αυτό συγκατατίθεται σύμφωνα με τα ανωτέρω. Ο Προϊστάμενος<br>του Κτηματολογικού Γραφείου ορίζει εύλογη προθεσμία, εντός της οποίας οι<br>δικαιούχοι όμορων ακινήτων έχουν δικαίωμα να υποβάλουν τις απόψεις τους<br>εγγράφως.<br>γ) Σε περίπτωση απόρριψης της αίτησης από τον Προϊστάμενο του Κτηματολογικού<br>Γραφείου, διενεργείται αμελλητί η καταχώρισή της στα κτηματολογικά φύλλα των<br>επηρεαζόμενων ακινήτων, όπου έχει καταχωριστεί η αίτηση επί της οποίας αυτή<br>εξεδόθη. Σε περίπτωση αποδοχής της αίτησης από τον Προϊστάμενο του<br>Κτηματολογικού Γραφείου, διενεργείται προσωρινή καταχώριση της απόφασής του<br>στα κτηματολογικά φύλλα των επηρεαζόμενων ακινήτων, όπου έχει καταχωριστεί η<br>αίτηση επί της οποίας αυτή εξεδόθη και ο αϊτών υποχρεούται, με επιμέλειά του, εντός<br>προθεσμίας δεκαπέντε ημερών από την έκδοση της απόφασης να λάβει γνώση αυτής<br>δια λήψης αντιγράφου από το Κτηματολογικά Γραφείο με σχετική επισημείωση στο<br>πρωτότυπο. Η απόφαση του Προϊσταμένου του Κτηματολογικού Γραφείου<br>κοινοποιείται με επιμέλεια του αιτούντος εντός της ίδιας προθεσμίας και στους<br>όμορους δικαιούχους, εκτός αν αυτοί έλαβαν γνώση της απόφασης δια λήψης<br>αντιγράφου από το Κτηματολογικό Γραφείο με σχετική επισημείωση στο πρωτότυπό<br>της. Στην περίπτωση όμορων ακινήτων με την ένδειξη αγνώστου ιδιοκτήτη, η απόφαση<br>κοινοποιείται στο Ελληνικό Δημόσιο. Εάν παρέλθει άπρακτη η κατά το δεύτερο και<br>τρίτο εδάφιο προθεσμία, παύει αυτοδικαίως η ισχύς της απόφασης, θεωρείται ότι δεν<br>έγινε η καταχώριση και εξαλείφεται αυτεπαγγέλτως η προσωρινή διενεργηθείσα.<br>δ) Ο αιτών δικαιούται να προσφύγει στον Κτηματολογικό Δικαστή μέσα σε προθεσμία<br>δεκαπέντε(15) ημερών, αφότου έλαβε γνώση της απόφασης. Το ίδιο ισχύει και για τον<br>δικαιούχο όμορου ακινήτου που βλάπτεται από την απόφαση του Προϊσταμένου του<br>Κτηματολογικού Γραφείου. Στην περίπτωση αυτή η δεκαπενθήμερη προθεσμία αρχίζει<br>από την κοινοποίηση σε αυτόν της απόφασης με επιμέλεια του αιτούντος, ή αφότου<br>έλαβε γνώση διά λήψης αντιγράφου από το Κτηματολογικό Γραφείο με σχετική<br>επισημείωση στο πρωτότυπο της. Δικαίωμα προσφυγής στον Κτηματολογικό Δικαστή<br>έχει επίσης ο αιτών και στην περίπτωση που ο Προϊστάμενος του Κτηματολογικού<br>Γραφείου δεν αποφανθεί επί της αιτήσεως του μέσα σε προθεσμία δύο (2) μηνών από</p><p>την υποβολή της ή από τη λήξη της εύλογης προθεσμίας που τυχόν ετάχθη για την<br>υποβολή των απόψεων των δικαιούχων όμορων ακινήτων. Η δεκαπενθήμερη<br>προθεσμία προσφυγής στον Κτηματολογικό Δικαστή είναι στην περίπτωση αυτή<br>δεκαπέντε (15) ημερών από τη λήξη του κατά το προηγούμενο εδάφιο διμήνου. Κατά<br>τα λοιπά εφαρμόζονται όσα ορίζονται στην παράγραφο 5 του άρθρου 16.<br>Εντός προθεσμίας δεκαπέντε (15) ημερών από την κατάθεση της και επί ποινή<br>απαραδέκτου, η προσφυγή καταχωρίζεται στα κτηματολογικά φύλλα των ακινήτων<br>όπου έχει καταχωριστεί η αίτηση επί της οποίας εξεδόθη η προσβαλλόμενη απόφαση,<br>στη θέση που καταχωρίζεται η κατά την παράγραφο 2 του άρθρου 13 αγωγή και<br>αναστέλλεται η διόρθωση των κτηματολογικών εγγραφών έως την έκδοση οριστικής<br>απόφασης από τον Κτηματολογικό Δικαστή. Η προθεσμία καιη άσκηση των ένδικων<br>μέσων κατά της απόφασης του Κτηματολογικού Δικαστή δεν έχει ανασταλτικό<br>αποτέλεσμα.<br>ε) Μετά την άπρακτη παρέλευση της προθεσμίας άσκησης προσφυγής,<br>οριστικοποιείται η καταχώριση της απόφασης του Προϊσταμένου του Κτηματολογικού<br>Γραφείου και διενεργείται η διόρθωση στα κτηματολογικά διαγράμματα. Σε περίπτωση<br>άσκησης προσφυγής, η εγγραφή της απόφασης γίνεται οριστική στα κτηματολογικά<br>φύλλα και αναστέλλεται η διόρθωση των κτηματολογικών εγγραφών κατά τα<br>οριζόμενα στα προηγούμενα εδάφια της παρούσας. Ο Προϊστάμενος στις<br>προαναφερόμενες περιπτώσεις τρέπει την προσωρινή καταχώριση της απόφασης του<br>σε οριστική, σημειώνοντας την τροπή στην οικεία θέση του κτηματολογικού φύλλου<br>και ημερομηνία της οριστικής καταχώρισης θεωρείται η ημερομηνία της προσωρινής<br>καταχώρισης. Μετά την προσωρινή καταχώριση της απόφασης του Προϊσταμένου του<br>Κτηματολογικού Γραφείου, αυτός δεν επιτρέπεται να προβεί σε καταχώριση<br>μεταγενέστερης εγγραφής, προτού οριστικοποιηθεί στο κτηματολογικό φύλλο του<br>ακινήτου η προσωρινή καταχώριση. Η υποβολή αίτησης διόρθωσης γεωμετρικών<br>στοιχείων δεν συνιστά αναγκαία προδικασία για την υποβολή και συζήτηση ενώπιον<br>του δικαστηρίου αγωγών και αιτήσεων διόρθωσης των κτηματολογικών εγγραφών,<br>αρχικών και μεταγενέστερων, κατά τις διατάξεις του νόμου αυτού.<br>3. Αν υφίσταται εγγραφή στα Κτηματολογικά φύλλα κατά το άρθρο 12 παράγραφος 1<br>περίπτωση γ\`, λόγω παράδοσης της νομής ακινήτων σε δικαιούχους από αναδασμό και<br>εκδοθεί στη συνέχεια η δημοσιευόμενη στην Εφημερίδα της Κυβερνήσεως απόφαση<br>κύρωσης του αναδασμού, η οποία πρέπει να διαβιβαστεί αμέσως και στο αρμόδιο<br>Κτηματολογικό Γραφείο, ο Προϊστάμενος αυτού προβαίνει στην εγγραφή είτε<br>αυτεπαγγέλτως, αμέσως μετά τη διαβίβαση σε αυτόν της απόφασης κύρωσης του<br>αναδασμού είτε ύστερα από αίτηση όποιου έχει έννομο συμφέρον, ο οποίος<br>συνυποβάλλει με την αίτηση και το Φύλλο της Εφημερίδας της Κυβερνήσεως στο<br>οποίο δημοσιεύεται η απόφαση κύρωσης του αναδασμού. Κατά τα λοιπά εφαρμόζονται<br>αναλόγως οι διατάξεις της παραγράφου 2 αυτού του άρθρου.<br>4. Αν, σε περιπτώσεις ακινήτων που κείνται σε περιοχές για τις οποίες δεν υφίσταται<br>κυρωμένος δασικός χάρτης, έχει εκδοθεί απόφαση των επιτροπών του άρθρου 10<br>παράγραφος 3 του ν. 998/1979 επί ενστάσεων και προσφυγών που υποβλήθηκαν κατά<br>το άρθρο 14 παράγραφος 3 του ίδιου νόμου και έχει περατωθεί η διοικητική διαδικασία,<br>ο Προϊστάμενος του Κτηματολογικού Γραφείου προβαίνει σε διόρθωση της σχετικής</p><p>κτηματολογικής εγγραφής, ύστερα από αίτηση όποιου έχει έννομο συμφέρον. Κατά τα<br>λοιπά εφαρμόζονται αναλόγως οι διατάξεις της παραγράφου 2 αυτού του άρθρου.<br>5. Αν για το ακίνητο, σωρευτικά:<br>α) υφίσταται στα κτηματολογικά βιβλία εγγραφή με εμφαινόμενο ως ιδιοκτήτη το<br>Ελληνικό Δημόσιο ή τη Διεύθυνση Δασών του Υπουργείου Περιβάλλοντος και<br>Ενέργειας,<br>β) υφίσταται απόφαση Επιτροπής Εξέτασης Αντιρρήσεων με την οποία έγινε δεκτή<br>προβληθείσα αντίρρηση κατά του δασικού χάρτη, σύμφωνα με το άρθρο 15 του ν.<br>3889/2010 (Α’ 182), και έχει παρέλθει χρονικό διάστημα δύο (2) μηνών από την έκδοση<br>αυτής, ή το ακίνητο βρίσκεται εκτός των περιοχών κυρωμένου δασικού χάρτη, ή<br>υφίσταται βεβαίωση της παρ. 41 του άρθρου 7 του ν. 1160/1981 (Α’ 147), περί<br>συνδρομής των προϋποθέσεων του άρθρου 19 του ν. 719/1977 (Α’ 301),<br>γ) προκύπτει εμπράγματο δικαίωμα φυσικού ή νομικού προσώπου ή δικαιοπαρόχου<br>αυτών, από δημόσιο έγγραφο που καταχωρίσθηκε στα βιβλία του οικείου<br>υποθηκοφυλακείου πριν από την περαίωση της κτηματογράφησης ή και μετά από αυτή,<br>εφόσον στηρίζεται σε προηγούμενη πράξη, καταχωρισθείσα στα βιβλία του<br>υποθηκοφυλακείου πριν από την περαίωση, και<br>δ) η κτηματολογική εγγραφή ερείδεται αποκλειστικά στο τεκμήριο κυριότητας του<br>δημοσίου επί δασικών εκτάσεων ή των εκτάσεων που περιγράφονται στην υπ’ αρ.<br>1151/1872 απόφαση του Εφετείου Αθηνών, στις υπ’ αρ. 116/1868 και 698/1876<br>αποφάσεις του Εφετείου Ναυπλίου και στην υπ’ αρ. 110/1878 απόφαση του Αρείου<br>Πάγου, το φυσικό ή νομικό πρόσωπο ή ο δικαιοπάροχος αυτών, των οποίων το<br>εμπράγματο δικαίωμα προκύπτει από δημόσιο έγγραφο σύμφωνα με την περ. γ),<br>δύναται να αιτηθεί τη διόρθωση της κτηματολογικής εγγραφής υπέρ του ιδίου. Το<br>αρμόδιο όργανο του Ν.Π.Δ.Δ. «Ελληνικό Κτηματολόγιο» προβαίνει στην καταχώριση<br>της σχετικής μεταβολής στα οικεία κτηματολογικά βιβλία, κατόπιν ελέγχου των<br>προϋποθέσεων των περ. α) έως δ) του πρώτου εδαφίου, επιτρεπόμενης μόνο της<br>αιτιολογημένης απόρριψης της αίτησης λόγω μη συνδρομής των προϋποθέσεων αυτών.<br>Επίδοση της αίτησης στο Ελληνικό Δημόσιο δεν απαιτείται. Κατά τα λοιπά<br>εφαρμόζεται αναλόγως η παρ. 2.</p>
</div>
<div id="art-19α" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 19α — Προσαρμογή των κτηματολογικών διαγραμμάτων λόγω επαναπροσδιορισμού της</h4>
<p style="font-size:0.9rem; line-height:1.6;">θέσης και των ορίων των γεωτεμαχίων<br>1. Με απόφαση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων<br>Ελλάδος(Ο.Κ.Χ.Ε.), που δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως κηρύσσεται<br>ο επαναπροσδιορισμός της θέσης και των ορίων των γεωτεμαχίων της οριοθετούμενης<br>με την απόφαση αυτή κτηματογραφημένης περιοχής, όταν διαπιστώνεται ανάγκη<br>εκτεταμένης προσαρμογής της αποτύπωσης των ακινήτων στα κτηματολογικά<br>διαγράμματα με εφαρμογή νεότερων και ακριβέστερων μεθόδων μέτρησης και<br>απεικόνισης, η οποία δεν εμπίπτει στο πεδίο εφαρμογής της παρ. 2 άρθρου 19.<br>Η απόφαση αυτή και το απόσπασμα χάρτη της οριοθετούμενης περιοχής, που τη<br>συνοδεύει, δημοσιεύονται σε μία ημερήσια εφημερίδα πανελλαδικής κυκλοφορίας και</p><p>σε δύο της περιφέρειας, στην οποία υπάγεται η κτηματογραφημένη περιοχή, εφόσον<br>υπάρχουν. Οι σχετικές εργασίες εκτελούνται από την ΚΤΗΜΑΤΟΛΟΓΙΟ Α.Ε. ή<br>ανατίθενται από αυτήν σε τρίτους δυνάμει σχετικών συμβάσεων σύμφωνα με την<br>κείμενη νομοθεσία.<br>2. Η απόφαση διαβιβάζεται αμέσως στο αρμόδιο Κτηματολογικό Γραφείο και ο<br>Προϊστάμενος προβαίνει αυτεπαγγέλτως, χωρίς υπαίτια καθυστέρηση, στην εγγραφή<br>της στα κτηματολογικά φύλλα των ακινήτων που περιλαμβάνονται στο απόσπασμα του<br>χάρτη της παραγράφου 1. Η απόφαση καταχωρίζεται στη θέση που καταχωρίζεται και<br>η αγωγή της παραγράφου 2 του άρθρου13. Η έναρξη εργασιών επαναπροσδιορισμού<br>της θέσης και των ορίων των γεωτεμαχίων στην οικεία κτηματογραφημένη περιοχή<br>ανακοινώνεται με απόφαση της «Εθνικό Κτηματολόγιο και Χαρτογράφηση Α.Ε.»<br>(ΕΚΧΑ ΑΕ) που δημοσιεύεται σε μία ημερήσια εφημερίδα πανελλαδικής κυκλοφορίας<br>και σε δύο της περιφέρειας, εφόσον υπάρχουν. Οι έννομες συνέπειες των παραγράφων<br>8 και 9 του παρόντος άρθρου επέρχονται από την χρονικά πρώτη από τις δημοσιεύσεις<br>αυτές. Σχετική έγγραφη ειδοποίηση αποστέλλει η ΕΚΧΑ ΑΕ και στο οικείο<br>Κτηματολογικό Γραφείο.<br>3.Για τη σύνταξη των σχετικών κτηματολογικών διαγραμμάτων και πινάκων για τον<br>επαναπροσδιορισμό της θέσης και των ορίων των γεωτεμαχίων λαμβάνονται υπόψη,<br>ενδεικτικά, τα στοιχεία που τηρούνται στο κατά τόπον αρμόδιο Κτηματολογικό<br>Γραφείο και περιέχονται στο αρχείο τίτλων και διαγραμμάτων και στο αρχείο<br>κτηματογράφησης, πρόσθετα στοιχεία και πληροφορίες που συλλέγονται από τον<br>Φορέα «Ελληνικό Κτηματολόγιο» από άλλες υπηρεσίες και από τους οριοδείκτες ή με<br>επιτόπια έρευνα και αυτοψίες ή με οποιονδήποτε άλλον τρόπο. Αν διενεργήθηκε<br>αυτοψία με υπόδειξη του ιδιοκτήτη και κατά την επεξεργασία των στοιχείων<br>διαπιστώνεται ότι επηρεάζονται δικαιώματα όμορων ιδιοκτητών, που δεν συμμετείχαν<br>στη διαδικασία της αυτοψίας ή δεν αποδέχτηκαν την απεικόνιση του ακινήτου με τη<br>συνυπογραφή τους στο διάγραμμα που συντάχθηκε από την αυτοψία, ο ιδιοκτήτης<br>ειδοποιείται να παραλάβει και να κοινοποιήσει, με μέριμνά του, διά δικαστικού<br>επιμελητή και εντός προθεσμίας που τάσσει ο προϊστάμενος του οικείου<br>Κτηματολογικού Γραφείου, η οποία δεν μπορεί να είναι μικρότερη από δέκα (10)<br>εργάσιμες ημέρες, αντίγραφο του διαγράμματος με την απεικόνιση του ακινήτου στα<br>κτηματολογικά διαγράμματα στον εμφανιζόμενο κύριο κάθε επηρεαζόμενου ακινήτου,<br>κατά τα προαναφερόμενα. Σε περίπτωση επηρεαζόμενου ακινήτου με την ένδειξη<br>«άγνωστος ιδιοκτήτης», το αντίγραφο του διαγράμματος του προηγούμενου εδαφίου<br>κοινοποιείται στο Ελληνικό Δημόσιο. Αν δεν αποδειχθεί η εμπρόθεσμη κοινοποίηση<br>του αντιγράφου του διαγράμματος της αυτοψίας, το αποτέλεσμά της δεν λαμβάνεται<br>υπόψη. Ο προϊστάμενος του Κτηματολογικού Γραφείου ορίζει εύλογη προθεσμία, η<br>οποία δεν μπορεί να είναι μικρότερη από τριάντα (30) ημέρες, εντός της οποίας οι<br>επηρεαζόμενοι ιδιοκτήτες, στους οποίους κοινοποιείται το διάγραμμα του δεύτερου<br>εδαφίου, καλούνται να διατυπώσουν και να υποβάλλουν εγγράφως τις αντιρρήσεις<br>τους επί της γεωμετρικής απεικόνισης του ακινήτου τους, που υποδείχθηκε από την<br>αυτοψία, με υπεύθυνη δήλωση, επί της οποίας βεβαιώνεται το γνήσιο της υπογραφής<br>τους. Σε περίπτωση άπρακτης παρέλευσης της προθεσμίας του προηγούμενου εδαφίου,<br>θεωρείται ότι ο επηρεαζόμενος ιδιοκτήτης συναινεί και το αποτέλεσμα της αυτοψίας</p><p>συμπεριλαμβάνεται στους προς ανάρτηση πίνακες και τα διαγράμματα της παρ. 4,<br>διατηρουμένου του δικαιώματός του να υποβάλει αντιρρήσεις σύμφωνα με την παρ. 5.<br>Σε περίπτωση ρητής άρνησης των επηρεαζόμενων ιδιοκτητών και μη παροχής<br>συγκατάθεσης, το αποτέλεσμα της αυτοψίας συμπεριλαμβάνεται στους προς ανάρτηση<br>πίνακες και διαγράμματα, εξαιρουμένου του τμήματος ή των τμημάτων των ακινήτων<br>των επηρεαζόμενων ιδιοκτητών που δεν παρείχαν τη συναίνεσή τους σύμφωνα με το<br>προηγούμενο εδάφιο. Η κοινοποίηση του δεύτερου εδαφίου δεν απαιτείται, εάν ο<br>επηρεαζόμενος ιδιοκτήτης παράσχει εγγράφως ενώπιον του Κτηματολογικού<br>Γραφείου τη συναίνεση επί της γεωμετρικής απεικόνισης του ακινήτου του ως<br>επηρεαζόμενου, με υπεύθυνη δήλωση, επί της οποίας βεβαιώνεται το γνήσιο της<br>υπογραφής του. Η δήλωση περιλαμβάνει ρητά την αποδοχή της γεωμετρικής<br>απεικόνισης του ακινήτου του δηλούντος ιδιοκτήτη ως επηρεαζόμενου, όπως<br>αποτυπώνεται στο διάγραμμα της αυτοψίας.<br>4. Τα κτηματολογικά διαγράμματα και οι πίνακες της προηγούμενης παραγράφου<br>αναρτώνται στο οικείο Κτηματολογικό Γραφείο και στο Δημοτικό Κατάστημα<br>καικοινοποιούνται υποχρεωτικά με επιμέλεια του Ο.Κ.Χ.Ε. πριν από την ανάρτηση,<br>στο Ελληνικό Δημόσιο. Ανακοίνωση του Ο.Κ.Χ.Ε. για την ανάρτηση, με αναφορά στον<br>τόπο και το χρόνο της ανάρτησης και μνεία του δικαιώματος υποβολής αντιρρήσεων<br>σύμφωνα με όσα ορίζονται στην παράγραφο 5 και της έναρξης του υπολογισμού της<br>σχετικής προθεσμίας δημοσιεύεται σε δύο εφημερίδες της περιφέρειας, εφόσον<br>υπάρχουν, καθώς και σε μία τουλάχιστον ημερήσια εφημερίδα πανελλαδικής<br>κυκλοφορίας, αναρτάται δε στο Κτηματολογικό Γραφείο και στο Δημοτικό<br>Κατάστημα. Τα διαγράμματα και οι πίνακες παραμένουν αναρτημένα επί δύο (2) μήνες<br>από την ημερομηνία έναρξης της προθεσμίας της παραγράφου 5.<br>5. Όποιος έχει έννομο συμφέρον μπορεί να υποβάλει αντιρρήσεις κατά των<br>διαγραμμάτων και πινάκων της παραγράφου 4. Μαζί με τις αντιρρήσεις<br>συνυποβάλλονται όλα τα έγγραφα που τις θεμελιώνουν. Οι αντιρρήσεις υποβάλλονται<br>στο αρμόδιο Κτηματολογικό Γραφείο μέσα σε προθεσμία ενός (1)μήνα, η οποία αρχίζει<br>από την τελευταία χρονικά ανάρτηση ή δημοσίευση της παραγράφου 4. Για τους<br>κατοίκους της αλλοδαπής η προθεσμία υποβολής αντιρρήσεων είναι δύο (2) μήνες.<br>Επί των αντιρρήσεων αποφαίνεται το Δ.Σ. του Ο.Κ.Χ.Ε.. Όταν με τις αντιρρήσεις<br>τίθενται υπό αμφισβήτηση τα όρια όμορων ακινήτων ή τα δικαιώματα τρίτων<br>προσώπων, αποφασίζει το Δ.Σ. του Ο.Κ.Χ.Ε. μετά από εισήγηση Επιτροπής, που<br>συγκροτείται με απόφαση του Ο.Κ.Χ.Ε. και αποτελείται από: α) έναν από τους<br>ακολούθως κατονομαζόμενους νομικούς ως πρόεδρο - με τη σειρά που αυτοί<br>αναγράφονται στο κείμενο της παρούσας διάταξης - δηλαδή είτε από έναν δικηγόρο<br>παρ\` εφέταις με πενταετή τουλάχιστον υπηρεσία, υποδεικνυόμενο από τον οικείο<br>δικηγορικό σύλλογο είτε, από έναν συμβολαιογράφο με πενταετή τουλάχιστον<br>υπηρεσία, υποδεικνυόμενο από τον οικείο συμβολαιογραφικό σύλλογο ,β) έναν<br>αγρονόμο - τοπογράφο μηχανικό υποδεικνυόμενο από τον οικείο περιφερειάρχη, γ)<br>έναν από τους ακολούθως κατονομαζόμενους νομικούς, δηλαδή έναν δικηγόρο παρ\`<br>εφέταις, με τριετή τουλάχιστον υπηρεσία, υποδεικνυόμενο από τον οικείο δικηγορικό<br>σύλλογο, είτε έναν συμβολαιογράφο με τριετή τουλάχιστον υπηρεσία, υποδεικνυόμενο<br>από τον οικείο συμβολαιογραφικό σύλλογο .Προϋπόθεση του παραδεκτού των</p><p>αντιρρήσεων, όταν με αυτές ζητείται η αντικατάσταση (ο εκτοπισμός) από τους<br>κτηματολογικούς πίνακες, εν όλω ή εν μέρει, καταχωρισθέντος δικαιώματος άλλου<br>προσώπου, αποτελεί η κοινοποίηση των αντιρρήσεων από αυτόν που τις ασκεί στον<br>θιγόμενο. Στην περίπτωση ακινήτων με την ένδειξη «αγνώστου ιδιοκτήτη» οι<br>αντιρρήσεις κοινοποιούνται, με ποινή απαραδέκτου, στο Ελληνικό Δημόσιο.<br>6. Για καθένα από τα τακτικά μέλη της Επιτροπής της παραγράφου 5 ορίζεται,<br>σύμφωνα με την ίδια διαδικασία, νόμιμος αναπληρωτής του. Ο ορισμός των τακτικών<br>και των αναπληρωματικών μελών της Επιτροπής πραγματοποιείται μέσα σε δεκαπέντε<br>(15) ημέρες από την υποβολή σχετικού αιτήματος εκ μέρους του Ο.Κ.Χ.Ε.. Αν η<br>παραπάνω προθεσμία παρέλθει άπρακτη, ο Ο.Κ.Χ.Ε. έχει δικαίωμα να ορίσει αυτός το<br>μη υποδεικνυόμενο εμπροθέσμως μέλος, το οποίο για μεν τη θέση του προέδρου πρέπει<br>να είναι είτε δικηγόρος τουλάχιστον παρ\` εφέταις με πενταετή υπηρεσία είτε<br>συμβολαιογράφος με πενταετή υπηρεσία στο εν λόγω λειτούργημα, για δε τη θέση των<br>υπολοίπων μελών πρέπει να είναι ένας αγρονόμος - τοπογράφος μηχανικός με πενταετή<br>υπηρεσία και ένας ακόμη από τους αμέσως προηγουμένως αναφερόμενους νομικούς,<br>με τριετή υπηρεσία, με τη σειρά που αυτοί αναγράφονται στο κείμενο της παρούσας<br>διάταξης. Αν για οποιονδήποτε λόγο δεν καταστεί δυνατή η συγκρότηση της Επιτροπής<br>στην κτηματογραφημένη περιοχή που έχει οριστεί με την απόφαση της παραγράφου 1,<br>ο Ο.Κ.Χ.Ε. μπορεί με αιτιολογημένη απόφαση του να συγκροτήσει την Επιτροπή και<br>οπουδήποτε αλλού εκτός από την κτηματογραφημένη περιοχή, ζητώντας εκ νέου την<br>υπόδειξη όλων των μελών της από αντίστοιχους φορείς της περιοχής όπου πρόκειται<br>να λειτουργήσει και, σε κάθε περίπτωση, από αντίστοιχους φορείς της Αθήνας. Με<br>απόφαση του Ο.Κ.Χ.Ε. ρυθμίζονται η κατά τόπον αρμοδιότητα της Επιτροπής και ο<br>τρόπος λειτουργίας της, η γραμματειακή της υποστήριξη, η αμοιβή των μελών και του<br>γραμματέα της, η οποία καθορίζεται κατά τις κείμενες διατάξεις, καθώς και κάθε άλλη<br>λεπτομέρεια. Η Επιτροπή εισηγείται επί των αντιρρήσεων, αξιολογώντας όλα τα<br>στοιχεία που προσκομίζουν οι ενδιαφερόμενοι, κάθε στοιχείο που συλλέχθηκε κατά τη<br>διαδικασία σύνταξης των κτηματολογικών πινάκων και διαγραμμάτων της<br>παραγράφου 3, όπως και κάθε αναγκαία πληροφορία που θα ζητηθεί από το οικείο<br>Κτηματολογικό Γραφείο ή τους ενδιαφερόμενους. Η Επιτροπή εισηγείται<br>αιτιολογημένα για την αποδοχή ή την απόρριψη των αντιρρήσεων εντός προθεσμίας<br>δύο (2) μηνών από την παράδοση σε αυτήν από τον Ο.Κ.Χ.Ε. των φακέλων των<br>αντιρρήσεων. Η προθεσμία αυτή μπορεί να παρατείνεται για δύο (2) ακόμη μήνες με<br>απόφαση του Ο.Κ.Χ.Ε.. θέματα σχετικά με τη διαδικασία υποβολής και εξέτασης των<br>αντιρρήσεων, καθώς και κάθε σχετικό ζήτημα τεχνικού και λεπτομερειακού χαρακτήρα<br>ρυθμίζονται με απόφαση του Ο.Κ.Χ.Ε. που δημοσιεύεται στην Εφημερίδα της<br>Κυβερνήσεως.<br>7. Μετά την ολοκλήρωση των διαδικασιών, όπως αυτές προβλέπονται στις<br>προηγούμενες παραγράφους, εκδίδεται απόφαση του Ο.Κ.Χ.Ε. για την αποδοχή ή την<br>απόρριψη των αντιρρήσεων και την έγκριση του περιεχομένου των κτηματολογικών<br>διαγραμμάτων και πινάκων της παραγράφου 3 λόγω του επαναπροσδιορισμού της<br>θέσης και των ορίων των γεωτεμαχίων σύμφωνα με αυτήν .Ο Προϊστάμενος του<br>οικείου Κτηματολογικού Γραφείου προβαίνει χωρίς υπαίτια καθυστέρηση στις<br>σχετικές εγγραφές αμέσως μετά τη διαβίβαση της απόφασης σε αυτόν.</p><p>8. Μετά την εγγραφή της απόφασης της παραγράφου 1 στα κτηματολογικά βιβλία<br>σύμφωνα με τα οριζόμενα στην παράγραφο 2, εάν η εγγραπτέα πράξη της οποίας<br>ζητείται η καταχώριση στο κτηματολογικό φύλλο είναι εμπράγματη δικαιοπραξία<br>,επισυνάπτεται σε αυτήν υποχρεωτικά και με ποινή ακυρότητας της, αντί του<br>προβλεπόμενου στο άρθρο 14 παράγραφος 5 του νόμου αυτού αποσπάσματος<br>κτηματολογικού διαγράμματος, διάγραμμα με καρτεσιανές συντεταγμένες του<br>συστήματος ΕΓΣΑ\`87, στο οποίο αποτυπώνεται η ακριβής θέση και τα όρια του<br>ακινήτου στο οποίο αφορά η εγγραπτέα πράξη και περιέχεται πίνακας των<br>επηρεαζόμενων ακινήτων, όπως αυτά αποτυπώνονται με τον Κωδικό Αριθμό Εθνικού<br>Κτηματολογίου στα κτηματολογικά διαγράμματα και προκύπτουν από το συσχετισμό<br>του προαναφερόμενου διαγράμματος με τη χωρική βάση του Εθνικού Κτηματολογίου<br>,απλό δε αντίγραφο αυτού συνυποβάλλεται με την αίτηση της παρ. 1 του άρθρου 14του<br>νόμου αυτού. Εάν στην εγγραπτέα πράξη έχει επισυναφθεί, σύμφωνα με την ισχύουσα<br>νομοθεσία, τοπογραφικό διάγραμμα, απλό αντίγραφο του συνυποβάλλεται επίσης με<br>την αίτηση της παρ. 1 του άρθρου 14 του νόμου αυτού. Για κάθε άλλη εγγραπτέα πράξη<br>το διάγραμμα του πρώτου εδαφίου συνυποβάλλεται με την αίτηση καταχώρισης της<br>παρ. 1 του άρθρου 14. Στην περίπτωση αυτή δεν συνυποβάλλεται το προβλεπόμενο<br>στην παρ. 4 του άρθρου 14 του νόμου αυτού απόσπασμα κτηματολογικού<br>διαγράμματος. Διάγραμμα δεν συνυποβάλλεται, όταν η πράξη της οποίας ζητείται η<br>καταχώριση στα Κτηματολογικά φύλλα αφορά σε εξάλειψη, κατάργηση, διαγραφή ή<br>άρση εγγραπτέου δικαιώματος. Κατά τα λοιπά ισχύουν τα οριζόμενα στο άρθρο 14<br>παράγραφοι 4 και 5.<br>9. Στην αίτηση για την καταχώριση της εγγραπτέας πράξης σύμφωνα με την παρ.3 του<br>άρθρου 14 του νόμου αυτού αναγράφονται υποχρεωτικά, εκτός των αναφερομένων στη<br>διάταξη αυτή, το ακίνητο στο οποίο αφορά η ζητούμενη καταχώριση και τα<br>προσδιοριζόμενα ως επηρεαζόμενα ακίνητα στον πίνακα του διαγράμματος της<br>παραγράφου 8 του παρόντος άρθρου. Τα εγγραπτέα δικαιώματα που καταχωρίζονται<br>σύμφωνα με τα παραπάνω οριζόμενα, καθώς και κάθε παράγωγο από αυτά δικαίωμα<br>και κάθε πράξη που στηρίζεται σε αυτά, τελούν υπό την αναβλητική αίρεση της<br>έκδοσης της προβλεπόμενης στην παράγραφο 7 του παρόντος άρθρου απόφασης του<br>Δ.Σ. του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, με την οποία θα<br>αποκαθίσταται το ακίνητο που αυτά αφορούν.<br>10. Το περιεχόμενο των κτηματολογικών διαγραμμάτων και πινάκων της παραγράφου<br>4 και οι τεχνικές προδιαγραφές του επαναπροσδιορισμού της θέσης και των ορίων των<br>γεωτεμαχίων κατά τα οριζόμενα στις διατάξεις του παρόντος άρθρου καθορίζονται με<br>αποφάσεις του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, οι οποίες<br>δημοσιεύονται στην Εφημερίδα της Κυβερνήσεως. Με όμοιες αποφάσεις,<br>δημοσιευόμενες στην Εφημερίδα της Κυβερνήσεως, μπορούν να γίνονται και κατά τη<br>διάρκεια εκτέλεσης της μελέτης επαναπροσδιορισμού μικρής κλίμακας αλλαγές των<br>καθορισθεισών τεχνικών προδιαγραφών, εφόσον αυτές εξυπηρετούν το σκοπό της<br>κτηματογράφησης και δεν βλάπτονται τα συμβατικά δικαιώματα του αναδόχου.<br>11. Μετά τη δημοσίευση της απόφασης της παραγράφου 1 για την κήρυξη του<br>επαναπροσδιορισμού της θέσης και των ορίων των γεωτεμαχίων της οριοθετούμενης<br>με την απόφαση αυτή κτηματογραφημένης περιοχής και μέχρι την έκδοση της</p><p>απόφασης της παραγράφου 6, αναστέλλεται η εφαρμογή της διάταξης του άρθρου 13Α<br>του παρόντος νόμου στην περιοχή αυτή. Κατά το ίδιο διάστημα αναστέλλεται η<br>προθεσμία της παρ. 2 του άρθρου 6 περιπτώσεις α΄ και β΄ του ν. 2664/ 1998 για τη<br>διόρθωση των αρχικών κτηματολογικών εγγραφών στο σύνολο της<br>κτηματογραφημένης περιοχής για την οποία έχει διαπιστωθεί η περαίωση της<br>κτηματογράφησης, έχει οριστεί η έναρξη ισχύος του Κτηματολογίου και εντός της<br>οποίας ευρίσκεται η περιοχή που οριοθετείται σύμφωνα με την απόφαση της<br>παραγράφου 1 για την κήρυξη του επαναπροσδιορισμού της θέσης και των ορίων των<br>γεωτεμαχίων.</p>
</div>
<div id="art-20" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 20 — Προσαρμογή συνεπεία εφαρμογής νέων τεχνικών προδιαγραφών για τη σύνταξη</h4>
<p style="font-size:0.9rem; line-height:1.6;">των κτηματολογικών διαγραμμάτων<br>1. Δικαίωμα προσαρμογής των γεωμετρικών στοιχείων των κτηματολογικών εγγραφών<br>έχει ο Προϊστάμενος του Κτηματολογικού Γραφείου σε περίπτωση εφαρμογής ενιαίως<br>νέων τεχνικών προδιαγραφών. Στην περίπτωση αυτή εφαρμόζονται αναλόγως οι<br>ρυθμίσεις της παραγράφου 2 του άρθρου 19.<br>2. Με απόφαση του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, που<br>δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως, ρυθμίζονται ζητήματα τεχνικού και<br>λεπτομερειακού χαρακτήρα για την εφαρμογή όσων ορίζονται στην προηγούμενη<br>παράγραφο.</p>
</div>
<div id="art-20α" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 20α — Οι διατάξεις των άρθρων 18 και 19 εφαρμόζονται και για τη διόρθωση των πρώτων</h4>
<p style="font-size:0.9rem; line-height:1.6;">εγγραφών.</p>
</div>
<div id="art-20Β" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 20Β — Ηλεκτρονική υποβολή αιτήσεων διόρθωσης κτηματολογικών εγγραφών</h4>
<p style="font-size:0.9rem; line-height:1.6;">Αιτήσεις που υποβάλλονται κατά τις διατάξεις του παρόντος νόμου για την<br>εξωδικαστική διόρθωση των κτηματολογικών εγγραφών, επιτρέπεται να υποβάλλονται<br>και να διακινούνται με ηλεκτρονικά μέσα στα κτηματολογικά γραφεία και<br>υποκαταστήματα του φορέα «ΕΛΛΗΝΙΚΟ ΚΤΗΜΑΤΟΛΟΓΙΟ». Με απόφαση του<br>Διοικητικού Συμβουλίου του φορέα «ΕΛΛΗΝΙΚΟ ΚΤΗΜΑΤΟΛΟΓΙΟ» καθορίζονται<br>ο τρόπος υποβολής των αιτήσεων, το ειδικότερο περιεχόμενο και τα πεδία που<br>συμπληρώνονται υποχρεωτικά κατά την ψηφιακή υποβολή των αιτήσεων στα<br>τηρούμενα βιβλία και κάθε θέμα τεχνικού και λεπτομερειακού χαρακτήρα σχετικά με<br>τα ανωτέρω ζητήματα. Με όμοια απόφαση καθορίζεται η ημερομηνία από την οποία η<br>υποβολή των αιτήσεων του πρώτου εδαφίου στα κτηματολογικά γραφεία και<br>υποκαταστήματα του φορέα «ΕΛΛΗΝΙΚΟ ΚΤΗΜΑΤΟΛΟΓΙΟ» διενεργείται<br>υποχρεωτικά μόνο ηλεκτρονικά.<br>ΚΕΦΑΛΑΙΟ ΕΚΤΟ<br>Δημοσιότητα των κτηματολογικών στοιχείων</p>
</div>
<div id="art-21" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 21 — Δικαίωμα πρόσβασης στα κτηματολογικά στοιχεία</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Η πρόσβαση στα κτηματολογικά στοιχεία τελεί υπό τους περιορισμούς του ν.<br>2472/1997 "Προστασία του ατόμου από την επεξεργασία δεδομένων προσωπικού<br>χαρακτήρα" (ΦΕΚ 50 Α\`).<br>2. Με κοινή απόφαση των Υπουργών Δικαιοσύνης, Περιβάλλοντος, Χωροταξίας και<br>Δημόσιων Έργων, που δημοσιεύεται στην Εφημερίδα της Κυβερνήσεως, ορίζονται ο<br>τρόπος και οι όροι άσκησης του κατά την προηγούμενη παράγραφο δικαιώματος<br>πρόσβασης στα κτηματολογικά στοιχεία, καθώς και τα πρόσωπα που έχουν δικαίωμα<br>να προβαίνουν στην επί τόπου έρευνα των κτηματολογικών στοιχείων στα<br>Κτηματολογικά Γραφεία και στην έναντι χρηματικού ανταλλάγματος ηλεκτρονική<br>σύνδεση. Με την ίδια απόφαση ρυθμίζονται θέματα που αφορούν στη δημοσιότητα<br>των κτηματολογικών στοιχείων και σε κάθε άλλο θέμα τεχνικού και λεπτομερειακού<br>χαρακτήρα.</p>
</div>
<div id="art-22" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 22 — Χορήγηση πιστοποιητικών, αντιγράφων και αποσπασμάτων</h4>
<p style="font-size:0.9rem; line-height:1.6;">1. Τα Κτηματολογικά Γραφεία οφείλουν να χορηγούν πιστοποιητικά, αντίγραφα και<br>αποσπάσματα από τα κτηματολογικά φύλλα, από τα διαγράμματα και γενικώς από<br>κάθε τηρούμενο κτηματολογικό στοιχείο σε όποιον έχει έννομο συμφέρον και<br>υποβάλλει σχετική αίτηση είτε αυτοπροσώπως είτε με αντιπρόσωπο του,<br>καταβάλλοντος τα τέλη και δικαιώματα της παραγράφου 2. Η αίτηση που απευθύνεται<br>στο Κτηματολογικό Γραφείο, καθώς και τα εκδιδόμενα πιστοποιητικά, αντίγραφα και<br>αποσπάσματα από τα κτηματολογικά φύλλα, από τα διαγράμματα και γενικώς από<br>κάθε τηρούμενο κτηματολογικό στοιχείο επιτρέπεται να υποβάλλονται και να<br>διακινούνται με ηλεκτρονικά μέσα. Με όμοιο τρόπο είναι δυνατόν να καταβάλλονται<br>τα τέλη και δικαιώματα της παραγράφου 2. Με απόφαση του Διοικητικού Συμβουλίου<br>του φορέα «ΕΛΛΗΝΙΚΟ ΚΤΗΜΑΤΟΛΟΓΙΟ» καθορίζεται η ημερομηνία από την<br>οποία η υποβολή των αιτήσεων του πρώτου εδαφίου για την έκδοση πιστοποιητικών,<br>αντιγράφων και αποσπασμάτων από τα κτηματολογικά φύλλα, από τα διαγράμματα<br>και γενικώς από κάθε τηρούμενο κτηματολογικό στοιχείο στα κτηματολογικά γραφεία<br>και υποκαταστήματα του φορέα «ΕΛΛΗΝΙΚΟ ΚΤΗΜΑΤΟΛΟΓΙΟ» διενεργείται<br>υποχρεωτικά μόνο ηλεκτρονικά.<br>2. Με κοινή απόφαση των Υπουργών Οικονομικών, Δικαιοσύνης και Περιβάλλοντος,<br>Χωροταξίας και Δημόσιων Έργων, μετά από πρόταση του Οργανισμού Κτηματολογίου<br>και Χαρτογραφήσεων Ελλάδος, καθορίζονται τα υπέρ του Οργανισμού Κτηματολογίου<br>και Χαρτογραφήσεων Ελλάδος ανταποδοτικά τέλη και τα λοιπά υπέρ του Δημοσίου<br>και τρίτων δικαιώματα για τη χορήγηση των πιστοποιητικών, αντιγράφων και<br>αποσπασμάτων της παραγράφου 1 σε ύψος και με τρόπο αντίστοιχο προς αυτόν που<br>προβλέπει η εκάστοτε κείμενη νομοθεσία για τη χορήγηση αντίστοιχων<br>πιστοποιητικών, αντιγράφων και αποσπασμάτων από τους φύλακες μεταγραφών και<br>υποθηκών, πλην των αποσπασμάτων από τα κτηματολογικά διαγράμματα, για τη<br>χορήγηση των οποίων τα υπέρ του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων<br>Ελλάδος ανταποδοτικά τέλη καθορίζονται με την ίδια κοινή υπουργική απόφαση σε<br>ύψος που δεν υπερβαίνει τις δέκα χιλιάδες (10.000) δραχμές για κάθε εμφαινόμενο στο<br>απόσπασμα ιδιοκτησιακό αντικείμενο. Με την ίδια απόφαση ορίζεται και ο τρόπος</p><p>απόδοσης των παραπάνω δικαιωμάτων. Εξαιρούνται από τη ρύθμιση αυτή και<br>χορηγούνται ατελώς πιστοποιητικά, αντίγραφα και αποσπάσματα για εγγραπτέα<br>δικαιώματα του Ελληνικού Δημοσίου.<br>ΚΕΦΑΛΑΙΟ ΕΒΔΟΜΟ<br>Τελικές και μεταβατικές διατάξεις</p>
</div>
<div id="art-23" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 23 — Μετάβαση από το σύστημα μεταγραφών και υποθηκών στο σύστημα</h4>
<p style="font-size:0.9rem; line-height:1.6;">Κτηματολογίου<br>1. Από την έναρξη ισχύος του Κτηματολογίου τα έμμισθα ή άμισθα Υποθηκοφυλακεία,<br>στων οποίων την τοπική αρμοδιότητα εμπίπτουν οι κτηματογραφημένες περιοχές,<br>λειτουργούν ως Κτηματολογικά Γραφεία.<br>2. Από την έναρξη ισχύος του Κτηματολογίου οι εγγραφές που αφορούν ακίνητα των<br>κτηματογραφημένων περιοχών γίνονται μόνο στα κτηματολογικά βιβλία και λοιπά<br>τηρούμενα στοιχεία. Τα βιβλία που τηρούσε έως την έναρξη ισχύος του Κτηματολογίου<br>το αρμόδιο Υποθηκοφυλακείο επέχουν θέση αρχείου. Το αρχείο αυτό εξακολουθεί να<br>φυλάσσεται από το Υποθηκοφυλακείο, το οποίο εκδίδει και τα σχετικά αντίγραφα και<br>πιστοποιητικά.<br>3. Αν κτηματογραφηθεί τμήμα μόνο της περιοχής που υπάγεται στην τοπική<br>αρμοδιότητα Υποθηκοφυλακείου, η ρύθμιση της προηγούμενης παραγράφου ισχύει για<br>τα ακίνητα που εμπίπτουν στο κτηματογραφημένο τμήμα της.<br>3α. Εάν η περιοχή που έχει κτηματογραφηθεί εμπίπτει στην τοπική αρμοδιότητα<br>περισσότερων του ενός Υποθηκοφυλακείων, με κοινή απόφαση των Υπουργών<br>Ψηφιακής Διακυβέρνησης και Δικαιοσύνης, η οποία εκδίδεται μετά από πρόταση του<br>νομικού προσώπου δημοσίου δικαίου με την επωνυμία «Ελληνικό Κτηματολόγιο»,<br>μπορεί να υπαχθεί το σύνολο της περιοχής αυτής στην αρμοδιότητα ενός μόνο<br>Υποθηκοφυλακείου, το οποίο θα λειτουργεί κατά το μεταβατικό στάδιο ως<br>Κτηματολογικό Γραφείο. Με όμοια απόφαση, η οποία εκδίδεται μετά από πρόταση του<br>νομικού προσώπου δημοσίου δικαίου με την επωνυμία «Ελληνικό Κτηματολόγιο»,<br>όταν συντρέχει συναρμοδιότητα Υποθηκοφυλακείου και Κτηματολογικού Γραφείου ή<br>Υποκαταστήματος του ν. 4512/2018 (Α’ 5) σε περιοχή που έχει κτηματογραφηθεί,<br>μπορεί να υπαχθεί το σύνολο της ίδιας κτηματογραφημένης περιοχής στην<br>αποκλειστική αρμοδιότητα του Υποθηκοφυλακείου, του Κτηματολογικού Γραφείου ή<br>του Υποκαταστήματος, κατά περίπτωση.<br>4. Κατά τη μεταβατική περίοδο λειτουργίας έμμισθων Υποθηκοφυλακείων ως<br>Κτηματολογικών Γραφείων παραμένει αμετάβλητη η υπηρεσιακή και μισθολογική<br>κατάσταση του προσωπικού τους και η σχέση τους με οργανισμούς κοινωνικής<br>ασφάλισης. Με κοινή απόφαση των Υπουργών Δικαιοσύνης και Περιβάλλοντος,<br>Χωροταξίας και Δημόσιων Έργων, η οποία εκδίδεται ύστερα από πρόταση του<br>Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, ορίζεται ο αριθμός και<br>τα ειδικότερα προσόντα για την πρόσληψη πρόσθετου προσωπικού κατά τη μεταβατική<br>περίοδο για την κάλυψη των αναγκών λειτουργίας έμμισθων Υποθηκοφυλακείων ως<br>Κτηματολογικών Γραφείων. Έως την πρόσληψη του προσωπικού αυτού, η κάλυψη των<br>λειτουργικών αναγκών τους γίνεται με προσωπικό που διαθέτει στα Υποθηκοφυλακεία</p><p>η Α.Ε. "Κτηματολόγιο Ανώνυμη Εταιρεία", η οποία και αμείβει το προσωπικό αυτό.<br>Με όμοια προς την προβλεπόμενη σε αυτή την παράγραφο παραπάνω κοινή υπουργική<br>απόφαση ρυθμίζονται τεχνικού ή λεπτομερειακού χαρακτήρα ζητήματα που αφορούν<br>στον τρόπο διάθεσης του εν λόγω προσωπικού από την Α.Ε. "Κτηματολόγιο Ανώνυμη<br>Εταιρεία". Με την ίδια αυτή απόφαση ή με όμοια κοινή υπουργική απόφαση μπορεί<br>επίσης να ορίζεται πρόσθετη αμοιβή για το προσωπικό που υπηρετεί κατά την έκδοσή<br>της. Η καταβολή της πρόσθετης αυτής αμοιβής βαρύνει την Α.Ε. "Κτηματολόγιο<br>Ανώνυμη Εταιρεία".<br>Με όμοια απόφαση μπορεί επίσης να προβλέπεται η παροχή υλικοτεχνικής<br>υποστήριξης από την εταιρεία "ΚΤΗΜΑΤΟΛΟΓΙΟ Α.Ε." προς τα έμμισθα<br>υποθηκοφυλακεία κατά τη μεταβατική περίοδο λειτουργίας τους ως Kτηματoλoγικών<br>Γραφείων<br>5. Κατά τη μεταβατική περίοδο λειτουργίας άμισθων Υποθηκοφυλακείων ως<br>Κτηματολογικών Γραφείων ισχύουν τα ακόλουθα :<br>α) Ο υποθηκοφύλακας παραμένει άμισθος δημόσιος λειτουργός και εξακολουθεί να<br>προΐσταται του Υποθηκοφυλακείου και μετά την έναρξη λειτουργίας του ως<br>Κτηματολογικού Γραφείου. Το προσωπικό που υπηρετεί στο Υποθηκοφυλακείο κατά<br>την ημερομηνία κήρυξης της περιοχής υπό κτηματογράφηση διατηρείται με την ίδια<br>σχέση που το συνδέει με τον άμισθο υποθηκοφύλακα και διεκπεραιώνει τις εργασίες<br>για τη λειτουργία του Υποθηκοφυλακείου και ως Κτηματολογικού Γραφείου. Οι<br>Δαπάνες για τη μισθοδοσία και τις ασφαλιστικές εισφορές του προσωπικού αυτού,<br>καθώς επίσης του τυχόν νέου προσωπικού, κατά τα οριζόμενα στο επόμενο εδάφιο,<br>βαρύνουν τον άμισθο υποθηκοφύλακα.<br>β) Για την πρόσληψη νέου προσωπικού, κατά τη μεταβατική περίοδο λειτουργίας<br>άμισθου Υποθηκοφυλακείου ως Κτηματολογικού Γραφείου, εφαρμόζεται το<br>αριθμητικό κριτήριο που θα ισχύει κατά την έναρξη της μεταβατικής αυτής περιόδου,<br>το οποίο σήμερα είναι ένας (1) υπάλληλος ανά χίλιες (1.000) αιτήσεις. Η πρόσληψη<br>γίνεται από τον υποθηκοφύλακα, ο οποίος, μέσα στο πλαίσιο του συνολικού αριθμού<br>υπαλλήλων που προσδιορίζεται με βάση το προαναφερόμενο μέτρο, λαμβάνει υπόψη<br>του και την ανάγκη ηλεκτρονικής καταγραφής και επεξεργασίας των πληροφοριών για<br>την ακώλυτη, με σύγχρονες μεθόδους, διεκπεραίωση των εργασιών τόσο του<br>Κτηματολογικού Γραφείου όσο και του Υποθηκοφυλακείου που υπάγεται στην τοπική<br>του αρμοδιότητα. Πρόσληψη έως δύο (2) πρόσθετων υπαλλήλων, πέραν του αριθμού<br>που προσδιορίζεται με βάση το προαναφερόμενο μέτρο, απόκειται στην κρίση του<br>υποθηκοφύλακα, όταν με αυτήν επιδιώκεται η ικανοποίηση αναγκών ηλεκτρονικής<br>καταχώρισης και επεξεργασίας πληροφοριών, για την οποία απαιτείται εξειδικευμένο<br>πρόσθετο προσωπικό. Το νέο αυτό προσωπικό μισθοδοτείται με βάση τις εκάστοτε<br>ισχύουσες συλλογικές συμβάσεις της Ένωσης Αμίσθων Υποθηκοφυλάκων Ελλάδος<br>και του Συλλόγου των Υπαλλήλων των Αμίσθων Υποθηκοφυλάκων και υπάγεται<br>ασφαλιστικά στους ίδιους ασφαλιστικούς οργανισμούς στους οποίους υπάγονται οι ήδη<br>υπηρετούντες στα άμισθα Υποθηκοφυλακεία υπάλληλοι.<br>γ) Εκτός από τους υπαλλήλους που αναφέρονται στο προηγούμενο εδάφιο, με την<br>έναρξη της μεταβατικής περιόδου τίθενται υπό τη διεύθυνση του υποθηκοφύλακα, που<br>προΐσταται του Υποθηκοφυλακείου και ως Κτηματολογικού Γραφείου, υπάλληλοι με</p><p>πτυχίο ανώτατου εκπαιδευτικού ιδρύματος ή τεχνολογικού εκπαιδευτικού ιδρύματος,<br>που διαθέτουν ειδικές τεχνικές γνώσεις, ανταποκρινόμενες στις ανάγκες λειτουργίας<br>του Υποθηκοφυλακείου ως Κτηματολογικού Γραφείου, για τη σύνταξη και τήρηση των<br>κτηματολογικών στοιχείων. Ο καθορισμός του συνολικού αριθμού των υπαλλήλων<br>αυτών και η ένταξή τους στο προσωπικό των Κτηματολογικών Γραφείων κατά τη<br>μεταβατική περίοδο γίνεται με κοινή απόφαση των Υπουργών Δικαιοσύνης και<br>Περιβάλλοντος, Χωροταξίας και Δημόσιων Έργων, ύστερα από πρόταση του<br>Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος. Τα έξοδα μισθοδοσίας<br>και των εν γένει αποδοχών, αποζημιώσεων, εισφορών κοινωνικής ασφάλισης και κάθε<br>γενικώς δαπάνης για το προσωπικό αυτό, σύμφωνα με τις κείμενες διατάξεις, βαρύνει<br>κατά τη μεταβατική περίοδο αποκλειστικά την Α.Ε. "Κτηματολόγιο Ανώνυμη<br>Εταιρεία". "Αντί της ένταξης υπαλλήλων της κατηγορίας αυτής στο προσωπικό<br>καθενός Κτηματολογικού Γραφείου χωριστά, μπορεί με την ως άνω κοινή υπουργική<br>απόφαση να προβλέπεται η κεντρική υποστήριξη των Κτηματολογικών Γραφείων από<br>προσωπικό του Ο.Κ.Χ.Ε. ή της εταιρείας "ΚΤΗΜΑΤΟΛΟΓΙΟ Α.Ε.".<br>δ) Για την εγγραφή οποιασδήποτε πράξεως στα κτηματολογικά στοιχεία που τηρούνται<br>από τον άμισθο υποθηκοφύλακα κατά τη μεταβατική περίοδο καταβάλλονται τα<br>δικαιώματα υπέρ του άμισθου υποθηκοφύλακα και τρίτων (Ελληνικού Δημοσίου και<br>Ταμείων), που προβλέπονται για τη μεταγραφή ή αντίστοιχα την εγγραφή της ίδιας<br>πράξεως στο Υποθηκοφυλακείο. Το ίδιο ισχύει και για την έκδοση πιστοποιητικών και<br>αντιγράφων, πλην των πιστοποιητικών, αντιγράφων και αποσπασμάτων από τα<br>κτηματολογικά διαγράμματα, για τη χορήγηση των οποίων ισχύει και κατά τη<br>μεταβατική περίοδο η υπέρ του Οργανισμού Κτηματολογίου και Χαρτογραφήσεων<br>Ελλάδος ρύθμιση της παραγράφου 2 του άρθρου 22 του παρόντος νόμου. Από τα<br>εισπραττόμενα από τον υποθηκοφύλακα, σύμφωνα με τη ρύθμιση του παρόντος<br>εδαφίου, ποσά προβαίνει αυτός στις παρακρατήσεις εδαφίου, ποσά προβαίνει αυτός<br>στις παρακρατήσεις και αποδόσεις στις οποίες προέβαινε και πριν από την έναρξη της<br>μεταβατικής περιόδου.<br>6.α) Έξι (6) μήνες πριν από την έναρξη λειτουργίας του Κτηματολογικού Γραφείου η<br>εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται,<br>ειδοποιεί εγγράφως τον αρμόδιο κατά την παράγραφο 1 υποθηκοφύλακα (έμμισθο ή<br>άμισθο), προκειμένου αυτός να προβεί στις απαραίτητες ενέργειες για τη στέγαση και<br>λειτουργία του Κτηματολογικού Γραφείου στο Υποθηκοφυλακείο και για την<br>εκπαίδευση του προσωπικού του.<br>β) Αν το Υποθηκοφυλακείο είναι έμμισθο, η δαπάνη για τις ενέργειες που προβλέπει<br>το προηγούμενο εδάφιο βαρύνει αποκλειστικά την εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟ<br>ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται.<br>γ) Αν το Υποθηκοφυλακείο είναι άμισθο, ο υποθηκοφύλακας με δικές του δαπάνες<br>παρέχει και διαμορφώνει τους χώρους για τη στέγαση και λειτουργία του<br>Κτηματολογικού Γραφείου, εκπαιδεύει το προσωπικό, προμηθεύεται τον κατάλληλο<br>εξοπλισμό και προβαίνει σε κάθε ενέργεια για την προσαρμογή στη λειτουργία αυτή<br>σύμφωνα με την έγγραφη ειδοποίηση της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ<br>ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται. Ως αντιστάθμισμα για τις δαπάνες αυτές ο<br>άμισθος υποθηκοφύλακας δικαιούται, όταν ειδοποιηθεί για την κτηματογράφηση</p><p>τμήματος ή όλης της περιοχής που εμπίπτει στην τοπική του αρμοδιότητα και για την<br>επικείμενη ένταξη της στο Εθνικό Κτηματολόγιο, να παρακρατεί όλα τα υπέρ αυτού<br>δικαιώματα τριών (3)τριμήνων από κάθε καταχώριση για ακίνητα του<br>κτηματογραφημένου τμήματος της περιοχής του, χωρίς να είναι υποχρεωμένος κατά<br>τα τρία (3) αυτά τρίμηνα να προβεί στην προβλεπόμενη από τις κείμενες διατάξεις<br>παρακατάθεση των εν λόγω υπέρ αυτού εισπραττομένων δικαιωμάτων στην αρμόδια<br>οικονομική υπηρεσία. Σε υποθηκοφυλακεία στα οποία ο συνολικός αριθμός<br>καταχωρίσεων κατά το προηγούμενο έτος, για τις οποίες εισπράττονται αναλογικά<br>δικαιώματα, δεν υπερβαίνει τις χίλιες πεντακόσιες (1.500) πράξεις, το κατά τα ανωτέρω<br>δικαίωμα παρακράτησης εκτείνεται σε δέκα (10) τρίμηνα και αφορά στο σύνολο των<br>εισπραττομένων υπέρ του υποθηκοφύλακα δικαιωμάτων από καταχωρίσεις για<br>ακίνητα τόσο της κτηματογραφημένης όσο και της μη κτηματογραφημένης περιοχής.<br>Το ποσό που απομένει μετά την καταβολή των δαπανών για την εκτέλεση των<br>ενεργειών που αναφέρονται στην έγγραφη ειδοποίηση της εταιρείας<br>«ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται σύμφωνα<br>με τα προηγούμενα εδάφια αυτής της παραγράφου, αποδίδεται από τον άμισθο<br>υποθηκοφύλακα στην εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως<br>αυτή μετονομάζεται. Με κοινή απόφαση των Υπουργών Οικονομικών, Περιβάλλοντος,<br>Ενέργειας και Κλιματικής Αλλαγής και Δικαιοσύνης, Διαφάνειας και Ανθρωπίνων<br>Δικαιωμάτων, ύστερα από πρόταση της εταιρείας «ΚΤΗΜΑΤΟΛΟΓΙΟΑΝΩΝΥΜΗ<br>ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται, καθορίζονται η διαδικασία απόδοσης από τον<br>υποθηκοφύλακα των ανωτέρω ποσών αυτών στην εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟ<br>ΑΝΩΝΥΜΗΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται και κάθε άλλο σχετικό θέμα. Με<br>ίδια απόφαση μπορεί να προβλεφθεί η παρακράτηση δικαιωμάτων και για χρόνο<br>μεγαλύτερο, προκειμένου να παρασχεθούν επιπλέον υπηρεσίες που θα ζητήσει η<br>εταιρεία «ΚΤΗΜΑΤΟΛΟΓΙΟ ΑΝΩΝΥΜΗ ΕΤΑΙΡΕΙΑ», όπως αυτή μετονομάζεται.<br>6α. Με την επιφύλαξη όσων ορίζονται στο άρθρο αυτό για την υπηρεσιακή και<br>μισθολογική κατάσταση του υπηρετούντος στα υποθηκοφυλακεία προσωπικού κατά<br>τη μεταβατική περίοδο λειτουργίας τους ως κτηματολογικών γραφείων, με κοινή<br>απόφαση των Υπουργών Περιβάλλοντος, Χωροταξίας και Δημόσιων \`Έργων και<br>Δικαιοσύνης, ύστερα από πρόταση του Ο.Κ.Χ.Ε., εκδίδεται Κανονισμός Λειτουργίας<br>των μεταβατικών κτηματολογικών γραφείων, στον οποίο καθορίζεται ιδίως ο τρόπος<br>εξυπηρέτησης του κοινού, οι εσωτερικές διαδικασίες λειτουργίας των γραφείων και η<br>οργανωτική εποπτεία τους.<br>7. Η κατά τις προηγούμενες παραγράφους μεταβατική λειτουργία των<br>Υποθηκοφυλακείων ως Κτηματολογικών Γραφείων λήγει με τη σύσταση<br>Κτηματολογικού Γραφείου, σύμφωνα με την παράγραφο 1 του άρθρου 5. Για τη<br>σύσταση αυτή, τη στελέχωση και τη διάρθρωση του Κτηματολογικού Γραφείου<br>ισχύουν τα ακόλουθα :<br>α) Αν η κτηματογραφημένη περιοχή εμπίπτει στην τοπική αρμοδιότητα ενός<br>Υποθηκοφυλακείου (έμμισθου ή άμισθου), προϊστάμενος του Κτηματολογικού<br>Γραφείου τοποθετείται ο υποθηκοφύλακας του μόνου αυτού Υποθηκοφυλακείου.<br>β) Αν η κτηματογραφημένη περιοχή εμπίπτει στην τοπική αρμοδιότητα περισσοτέρων<br>του ενός Υποθηκοφυλακείων (έμμισθων ή άμισθων), προϊστάμενος του</p><p>Κτηματολογικού Γραφείου τοποθετείται ο υποθηκοφύλακας που ορίζεται με κοινή<br>απόφαση των Υπουργών Δικαιοσύνης και Περιβάλλοντος, Χωροταξίας και Δημόσιων<br>Έργων, ύστερα από συνεκτίμηση του αριθμού των πράξεων κάθε Υποθηκοφυλακείου<br>κατά τα πέντε (5) τελευταία έτη, του χρόνου σύστασης καθενός από τα<br>Υποθηκοφυλακεία αυτά, της αρχαιότητας καθενός υποθηκοφύλακα και της έκτασης<br>του τμήματος εδάφους κάθε Υποθηκοφυλακείου στην κτηματογραφημένη περιοχή. "Οι<br>υποθηκοφύλακες που δεν διορίζονται Προϊστάμενοι του Κτηματολογικού Γραφείου<br>τοποθετούνται με την ίδια απόφαση στη θέση του Αναπληρωτή Προϊσταμένου του<br>Κτηματολογικού Γραφείου, εφόσον με την αίτηση που προβλέπεται στην περίπτωση<br>γ\` της παραγράφου αυτής δηλώσουν ότι επιθυμούν την τοποθέτηση αυτή.<br>γ) Με κοινή απόφαση των Υπουργών Δικαιοσύνης και Περιβάλλοντος, Χωροταξίας<br>και Δημόσιων Έργων οι υποθηκοφύλακες (έμμισθοι ή άμισθοι), που δεν επιθυμούν να<br>τοποθετηθούν σε θέση Προϊσταμένου Κτηματολογικού Γραφείου, μπορούν, ύστερα<br>από αίτησή τους, που θα πρέπει να υποβληθεί μέσα σε ένα δίμηνο από την κοινοποίηση<br>σε αυτούς σχετικής πρόσκλησης του Οργανισμού Κτηματολογίου και<br>Χαρτογραφήσεων Ελλάδος, να παραμείνουν στο Κτηματολογικό Γραφείο ως<br>υπάλληλοι ή να επαναδιορισθούν δικηγόροι συμβολαιογράφοι ανεξαρτήτως ηλικίας,<br>εφόσον έχουν τα προσόντα που προβλέπουν τα άρθρα 18 και 19 του ν. 670/1977 (ΦΕΚ<br>232 Α\`), σε κενή θέση στην έδρα του ειρηνοδικείου της περιφέρειας του εφετείου όπου<br>υπηρετούσαν. Επίσης, μπορούν να μεταταγούν σε δικαστικές υπηρεσίες ή άλλες<br>υπηρεσίες αρμοδιότητας του Υπουργείου Δικαιοσύνης, του ίδιου ή άλλου νομού, σε<br>προσωρινές προσωποπαγείς θέσεις της ίδιας κατηγορίας, βαθμού ή μισθολογικού<br>κλιμακίου.<br>Ο χρόνος υπηρεσίας των μετατασσόμενων υποθηκοφυλάκων από τη δημοσίευση της<br>απόφασης για τη μετάταξη έως την ανάληψη υπηρεσίας στη νέα τους θέση θεωρείται<br>πραγματική δημόσια υπηρεσία στη νέα τους θέση θεωρείται πραγματική δημόσια<br>υπηρεσία στην υπηρεσία στην οποία μετατάσσονται. Οι κάθε φύσεως αποδοχές τους<br>βαρύνουν από τη μετάταξή τους την υπηρεσία στην οποία μετατάσσονται.<br>δ) Η ρύθμιση του προηγούμενου γ\` εδαφίου ισχύει και για τους υποθηκοφύλακες<br>(έμμισθους ή άμισθους) που εμπίπτουν στη ρύθμιση του εδαφίου β\` αυτής της<br>παραγράφου και δεν τοποθετούνται, σύμφωνα με τη διάταξη αυτή, στη θέση του<br>Προϊσταμένου του Κτηματολογικού Γραφείου. Στην περίπτωση αυτή η δίμηνη<br>προθεσμία για την υποβολή της προβλεπόμενης στο εδάφιο γ\` αιτήσεως αρχίζει από τη<br>γνωστοποίηση σε αυτούς από τον Οργανισμό Κτηματολογίου και Χαρτογραφήσεων<br>Ελλάδος της κοινής υπουργικής απόφασης του εδαφίου β\` αυτής της παραγράφου.<br>ε) Τα μέλη του μόνιμου προσωπικού, καθώς και του προσωπικού με σχέση εργασίας<br>ιδιωτικού δικαίου που υπηρετεί στα Υποθηκοφυλακεία (έμμισθα ή άμισθα) εκτός από<br>εκείνους που, κατά την έναρξη λειτουργίας των Κτηματολογικών Γραφείων, πληρούν<br>τις προϋποθέσεις πρόωρης συνταξιοδότησης που ορίζονται στην παρ. 5 του άρθρου 13<br>του ν. 2367/1995 (ΦΕΚ 261 Α\`), η οποία εφαρμόζεται αναλόγως και στην προκειμένη<br>περίπτωση για το προσωπικό τόσο των άμισθων όσο και των έμμισθων<br>Υποθηκοφυλακείων, ανεξαρτήτως του είδους της εργασιακής σχέσεως, μετατάσσονται<br>ή μεταφέρονται σε ομοιόβαθμες αντίστοιχες με τα τυπικά τους προσόντα κενές<br>οργανικές θέσεις ή σε συνιστώμενες με την απόφαση για τη μετάταξη προσωρινές</p><p>προσωποπαγείς θέσεις των Κτηματολογικών Γραφείων. Τυχόν πλεονάζον προσωπικό<br>μπορεί να μεταταχθεί και χωρίς αίτησή του σε υπηρεσίες των φορέων του τελευταίου<br>εδαφίου της παρ. 7 του άρθρου 2 του ν. 2469/1997 (ΦΕΚ 38 Α\`), σε κλάδο συναφών<br>τυπικών προσόντων της ίδιας εκπαιδευτικής βαθμίδας, σε κενές θέσεις σε υφιστάμενο<br>συναφή ή και σε προσωρινό κλάδο. Οι θέσεις αυτές συνιστώνται με την απόφαση της<br>μετάταξης και καταργούνται αυτοδίκαια με την με οποιονδήποτε τρόπο αποχώρηση<br>του μετατασσομένου. Οι μετατάξεις ή μεταφορές διενεργούνται χωρίς προηγούμενη<br>γνωμοδότηση υπηρεσιακών συμβουλίων με απόφαση των Υπουργών Δικαιοσύνης,<br>Περιβάλλοντος, Χωροταξίας και Δημόσιων Έργων και του εποπτεύοντος την οικεία<br>υπηρεσία, επιχείρηση, οργανισμό ή νομικό πρόσωπο Υπουργού σε κλάδο ή ειδικότητα<br>της εκπαιδευτικής βαθμίδας που ανήκει ο μετατασσόμενος ή μεταφερόμενος. Οι<br>μετατασσόμενοι ή μεταφερόμενοι κατατάσσονται σε βαθμό ανάλογο με τα προσόντα<br>τους και το χρόνο προϋπηρεσίας, σύμφωνα με τα τυπικά προσόντα του κλάδου στον<br>οποίο μετατάσσονται ή μεταφέρονται και σε μισθολογικά κλιμάκια της οικείας<br>κατηγορίας. Η μισθολογική κατάταξη γίνεται σύμφωνα με την παρ. 3 του άρθρου 20<br>του ν. 2515/1997 (ΦΕΚ 154 Α\`). Εφόσον, από την εφαρμογή διάταξης προκύπτουν<br>συνολικές μηνιαίες αποδοχές μικρότερες από αυτές που έπαιρναν οι μετατασσόμενοι<br>ή μεταφερόμενοι τον προηγούμενο μήνα της μετάταξης ή μεταφοράς τους,<br>εφαρμόζεται αναλογικά το άρθρο 29 του ν. 2470/1997 (ΦΕΚ 40 Α\`). Οι<br>μετατασσόμενοι ή μεταφερόμενοι συνεχίζουν να υπάγονται ως προς την κύρια και<br>επικουρική ασφάλιση στους φορείς στους οποίους υπήγοντο και πριν από τη μετάταξη<br>ή μεταφοράς τους. Σε περίπτωση αλλαγής φορέα επικουρικής ασφάλισης, τα θέματα<br>μεταφοράς ασφαλιστικών εισφορών και προσμέτρησης του χρόνου ασφάλισης, εφόσον<br>δεν καλύπτονται από τις κείμενες διατάξεις, ρυθμίζονται με απόφαση του Υπουργού<br>Εργασίας και Κοινωνικών Ασφαλίσεων. Για τη μετάταξη ή μεταφορά απαιτείται<br>αίτηση του ενδιαφερομένου, συνοδευόμενη από πλήρη βιογραφικά του στοιχεία, που<br>θα πρέπει να υποβληθεί μέσα σε ένα δίμηνο από την ημερομηνία της τελευταίας<br>κοινοποίησης σχετικής ειδοποίησης του Οργανισμού Κτηματολογίου και<br>Χαρτογραφήσεων Ελλάδος στον αρμόδιο υποθηκοφύλακα και στον Πανελλήνιο<br>Σύνδεσμο Υπαλλήλων Αμίσθων Υποθηκοφυλακείων. Ο χρόνος υπηρεσίας των<br>μετατασσόμενων από τη δημοσίευση της απόφασης για τη μετάταξη έως την ανάληψη<br>υπηρεσίας στη νέα τους θέση θεωρείται πραγματική δημόσια υπηρεσία στην υπηρεσία<br>στην οποία μετατάσσονται. Οι κάθε φύσεως αποδοχές τους βαρύνουν από τη μετάταξή<br>τους την υπηρεσία στην οποία μετατάσσονται. Οι μετατάξεις και μεταφορές<br>προσωπικού ολοκληρώνονται έως την έναρξη λειτουργίας των Κτηματολογικών<br>Γραφείων.</p>
</div>
<div id="art-24" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 24 — Νομοθετικές εξουσιοδοτήσεις</h4>
<p style="font-size:0.9rem; line-height:1.6;">Πλην των θεμάτων για τα οποία προβλέπονται με τις προηγούμενες διατάξεις αυτού<br>του νόμου ειδικές εξουσιοδοτήσεις, κάθε άλλο τεχνικού ή λεπτομερειακού χαρακτήρα<br>ζήτημα, αναγόμενο στην εφαρμογή του παρόντος νόμου, ρυθμίζεται με αποφάσεις του<br>Οργανισμού Κτηματολογίου και Χαρτογραφήσεων Ελλάδος, που δημοσιεύονται στην<br>Εφημερίδα της Κυβερνήσεως.</p><p>Τα Άρθρα 25-33 δεν αφορούν το κτηματολόγιο</p>
</div>
<div id="art-34" style="border-top:1px solid #e2e8f0; padding:10pt 0;">
<h4 style="color:#1e40af; margin:6pt 0 4pt;">Άρθρο 34 — Έναρξη ισχύος</h4>
<p style="font-size:0.9rem; line-height:1.6;">Ο παρών νόμος αρχίζει να ισχύει από τη δημοσίευσή του στην Εφημερίδα της<br>Κυβερνήσεως.<br>Παραγγέλλομε τη δημοσίευση του παρόντος στην Εφημερίδα της Κυβερνήσεως και<br>την εκτέλεσή του ως νόμου του Κράτους.<br>Αθήνα, 27 Νοεμβρίου 1998<br>Ο ΠΡΟΕΔΡΟΣ ΤΗΣ ΔΗΜΟΚΡΑΤΙΑΣ<br>ΚΩΝΣΤΑΝΤΙΝΟΣ ΣΤΕΦΑΝΟΠΟΥΛΟΣ</p>
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
        <li><b>ΕΣΔ:</b> Ενημέρωση μερών για τη διαδικασία. Διαπίστωση βούλησης για συνέχιση.</li>
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
    <p>Υπάγονται υποχρεωτικά στην Εισαγωγική Συνεδρία Διαμεσολάβησης (ΕΣΔ) διαφορές που:</p>
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
    <p>Η Κτηματολογική Διαμεσολάβηση αποτελεί κρίσιμο εργαλείο. Σύμφωνα με το εγχειρίδιο, η κατάθεση Πρακτικού Επιτυχούς Διαμεσολάβησης αποτελεί τίτλο εγγραπτέο στο Κτηματολόγιο (π.χ. για διόρθωση χωρικών μεταβολών ή πρόδηλων σφαλμάτων), εφόσον πληροί τις προϋποθέσεις νομιμότητας και συνοδεύεται από τα απαραίτητα τοπογραφικά διαγράμματα.</p>`,

    // ─── Κώδικας Εναλλακτικής Επίλυσης Διαφορών (Σχέδιο Νόμου) ───────────────

    eed_art76: `<h3>📋 Άρθρο 76 — Προσφυγή στη Διαμεσολάβηση</h3>
    <p><em>Κώδικας Εναλλακτικής Επίλυσης Διαφορών — Μέρος Γ΄ Κεφάλαιο Β΄</em></p>
    <h4>Τρόποι προσφυγής (παρ. 1)</h4>
    <p>Διαμεσολάβηση για τις υπαγόμενες διαφορές μπορεί να διεξαχθεί αν:</p>
    <ul>
        <li><b>α)</b> Τα μέρη <b>συμφωνούν</b> να προσφύγουν στη διαδικασία, αφότου ανέκυψε η διαφορά.</li>
        <li><b>β)</b> Τα μέρη <b>κληθούν</b> να προσφύγουν στη διαμεσολάβηση και <b>συναινούν</b> σε αυτή (σύμφωνα με παρ. 3).</li>
        <li><b>γ)</b> Η προσφυγή <b>επιβάλλεται από τον νόμο</b> (υποχρεωτική διαμεσολάβηση).</li>
        <li><b>δ)</b> Σε έγγραφη συμφωνία μεταξύ των μερών υπάρχει <b>ρήτρα διαμεσολάβησης</b> κατά το άρθρο 85.</li>
    </ul>
    <h4>Συμφωνία μερών (παρ. 2)</h4>
    <p>Η συμφωνία των μερών για προσφυγή στη διαδικασία διαμεσολάβησης διέπεται από τις διατάξεις του ουσιαστικού δικαίου για τις συμβάσεις και περιγράφει το αντικείμενό της.</p>
    <h4>Παραπομπή από Δικαστήριο (παρ. 3)</h4>
    <p>Δικαστήριο ενώπιον του οποίου εκκρεμεί διαφορά δυνάμενη να υπαχθεί στη διαμεσολάβηση μπορεί <b>σε κάθε στάση της δίκης και σε κάθε βαθμό</b> να καλέσει τα διάδικα μέρη να προσφύγουν σε διαμεσολάβηση.</p>
    <p>Εφόσον τα μέρη δηλώσουν αποδοχή:</p>
    <ul>
        <li>Αν η διαφορά εκδικάζεται κατά <b>τακτική διαδικασία</b> (άρθρο 237 ΚΠολΔ): η συζήτηση δεν αναβάλλεται — ακολουθεί διαδικασία παρ. 3 και 4 του άρθρου 84.</li>
        <li>Αν η διαφορά εκδικάζεται <b>κατά τις ειδικές διαδικασίες</b> (άρθρα 591-622Β ΚΠολΔ): η συζήτηση αναβάλλεται υποχρεωτικά σε ρητή δικάσιμο για χρονικό διάστημα που δεν υπερβαίνει <b>3 μήνες</b>.</li>
    </ul>
    <p>Αν τα διάδικα μέρη ή ένα εξ αυτών παρίστανται δια πληρεξουσίου δικηγόρου, η πληρεξουσιότητα θεωρείται ότι καλύπτει και τη <b>συμφωνία υπαγωγής</b> της διαφοράς στη διαμεσολάβηση.</p>
    <h4>Υποχρεωτική προδικαστική προσφυγή (παρ. 4)</h4>
    <p>Όταν η διαμεσολάβηση διεξάγεται ως υποχρεωτική προδικαστική προσφυγή κατά το Κεφάλαιο Δ΄ του Μέρους Α΄, η διαδικασία διεξάγεται σύμφωνα με τα οριζόμενα στο παρόν Μέρος, με την επιφύλαξη των ειδικότερων ρυθμίσεων του Κεφαλαίου Δ΄.</p>
    <div class="highlight-box"><b>Πρακτικό Σημείο:</b> Το άρθρο 76 αποτελεί τον «κόμβο» προσφυγής στη διαμεσολάβηση — καλύπτει όλους τους δρόμους: εθελοντική συμφωνία, ρήτρα, δικαστική παραπομπή και υποχρεωτική. Ο δικηγόρος πρέπει να γνωρίζει σε ποια κατηγορία εμπίπτει η υπόθεσή του για να επιλέξει τη σωστή διαδρομή.</div>`,

    eed_art96: `<h3>🏠 Άρθρο 96 — Κτηματολογική Διαμεσολάβηση: Υπαγόμενες Διαφορές</h3>
    <p><em>Κώδικας Εναλλακτικής Επίλυσης Διαφορών — Ειδικές Διατάξεις Κτηματολογίου</em></p>
    <h4>Πεδίο εφαρμογής</h4>
    <p>Στην κτηματολογική διαμεσολάβηση υπάγονται οι <b>διαφορές της παρ. 2 του άρθρου 6 του ν. 2664/1998</b>, δηλαδή διαφορές σχετικά με εγγραφές στο Κτηματολόγιο.</p>
    <h4>Εξαιρέσεις</h4>
    <p>Εξαιρούνται από την κτηματολογική διαμεσολάβηση τα <b>δημόσια και κοινόχρηστα πράγματα</b>.</p>
    <h4>Σύνδεση με ν. 2664/1998</h4>
    <p>Ο ν. 2664/1998 ρυθμίζει τις διορθώσεις εγγραφών στο Κτηματολόγιο — ανακριβείς πρώτες εγγραφές, διορθώσεις, χωρικές μεταβολές. Η κτηματολογική διαμεσολάβηση δίνει εναλλακτικό δρόμο αντί της δικαστικής οδού για αυτές τις διαφορές.</p>
    <div class="highlight-box"><b>Πρακτικό Σημείο:</b> Ο δικηγόρος που χειρίζεται κτηματολογική υπόθεση πρέπει να εξετάζει αν εμπίπτει στο άρθρο 6 παρ. 2 ν. 2664/1998. Αν ναι, η κτηματολογική διαμεσολάβηση είναι διαθέσιμη — με τα ειδικά χαρακτηριστικά των άρθρων 97-101.</div>`,

    eed_art97_98: `<h3>📐 Άρθρα 97-98 — Ειδικές Αρχές & Διεξαγωγή Κτηματολογικής Διαμεσολάβησης</h3>
    <p><em>Κώδικας Εναλλακτικής Επίλυσης Διαφορών</em></p>
    <h4>Άρθρο 97 — Ειδικές Αρχές</h4>
    <p>Δύο σημαντικές παρεκκλίσεις από τις γενικές αρχές διαμεσολάβησης:</p>
    <ul>
        <li><b>α) Εμπιστευτικότητα:</b> Η αρχή εμπιστευτικότητας <b>δεν καταλαμβάνει</b> τα γεωμετρικά και τοπογραφικά στοιχεία που απαιτούνται για <b>καταχώριση στο κτηματολογικό φύλλο</b>. Αυτά μπορούν να γνωστοποιηθούν στο Κτηματολόγιο.</li>
        <li><b>β) Ουδετερότητα:</b> Η αρχή ουδετερότητας <b>δεν θίγεται</b> από την τυχόν γνώση τεχνικών δεδομένων (π.χ. τοπογραφικά, ΚΑΕΚ) εκ μέρους του διαμεσολαβητή.</li>
    </ul>
    <h4>Άρθρο 98 — Διεξαγωγή</h4>
    <p>Η κτηματολογική διαμεσολάβηση διεξάγεται <b>αποκλειστικά από διαμεσολαβητή με ειδική σήμανση κτηματολογικής</b> (σύμφωνα με παρ. 7 άρθρου 130 — Μητρώο Διαμεσολαβητών).</p>
    <p>Μαζί με το <b>φύλλο βασικών στοιχείων</b> υποβάλλονται υποχρεωτικά:</p>
    <ul>
        <li>🗂️ Κτηματολογικό φύλλο + αντίγραφο κτηματολογικού διαγράμματος</li>
        <li>📄 Αγωγή και τίτλοι κτήσης</li>
        <li>📏 Τυχόν τοπογραφικά διαγράμματα</li>
        <li>📋 Κάθε άλλο σχετικό έγγραφο</li>
    </ul>
    <div class="highlight-box"><b>Πρακτικό Σημείο:</b> Χρειάζεται διαμεσολαβητής με <em>ειδική κτηματολογική σήμανση</em> — δεν αρκεί οποιοσδήποτε εγγεγραμμένος διαμεσολαβητής. Επίσης, η υποβολή κτηματολογικού φύλλου και διαγράμματος είναι υποχρεωτική.</div>`,

    eed_art99_101: `<h3>🏛️ Άρθρα 99-101 — Δημόσιο, Πρακτικό & Αναγνώριση Χρησικτησίας</h3>
    <p><em>Κώδικας Εναλλακτικής Επίλυσης Διαφορών</em></p>
    <h4>Άρθρο 99 — Συμμετοχή Δημοσίου / ΟΤΑ / ΝΠΔΔ</h4>
    <ul>
        <li>Το Δημόσιο εκπροσωπείται από <b>νομικό σύμβουλο ή δικηγόρο</b> (ΝΣΚ — Νομικό Συμβούλιο του Κράτους).</li>
        <li>Δυνατότητα συμμετοχής <b>μέσω τηλεδιάσκεψης</b>.</li>
        <li>Απαιτείται <b>ενημέρωση 30 ημέρες πριν</b> από την εισαγωγική συνεδρία.</li>
        <li>Εφαρμόζονται οι διατάξεις για τις <b>δικαστικές διακοπές</b>.</li>
    </ul>
    <h4>Άρθρο 100 — Πρακτικό και Καταχώριση στο Κτηματολόγιο</h4>
    <p>Σε περίπτωση επιτυχούς συμφωνίας:</p>
    <ul>
        <li>Το πρακτικό <b>καταχωρίζεται στο οικείο κτηματολογικό φύλλο</b> → επιφέρει διόρθωση ανακριβούς πρώτης εγγραφής (άρθρα 81, 82 ν. 2664/1998).</li>
        <li>Για γεωμετρικές μεταβολές: απαιτείται <b>τοπογραφικό διάγραμμα με ΚΑΕΚ</b> + ηλεκτρονική υποβολή στο «Ελληνικό Κτηματολόγιο».</li>
        <li>Πριν την καταχώριση: <b>δήλωση φόρου χρησικτησίας</b> (αν εφαρμόζεται).</li>
    </ul>
    <h4>Άρθρο 101 — Αναγνώριση Κυριότητας λόγω Έκτακτης Χρησικτησίας</h4>
    <p>Ειδική διαδικασία για αναγνώριση κυριότητας με χρησικτησία:</p>
    <ul>
        <li>Αποκλειστικά από διαμεσολαβητή <b>κάτοχο πτυχίου νομικής</b> με ειδική κτηματολογική σήμανση.</li>
        <li>Ο επισπεύδων καταχωρίζει <b>φύλλο βασικών στοιχείων</b> → πρόσκληση τουλάχιστον <b>30 ημέρες μετά</b>.</li>
        <li>Ελληνικό Δημόσιο: εφαρμόζεται άρθρο 100, εφόσον δεν προβάλλει δικαιώματα → δυνατότητα κατάρτισης πρακτικού (άρθρο 81).</li>
    </ul>
    <p><b>Αποδεικτικά μέσα που απαιτούνται (τουλάχιστον 2):</b></p>
    <ul>
        <li>Λογαριασμοί ΔΕΗ / ύδρευσης / τηλεφωνίας</li>
        <li>Μισθωτήρια συμβόλαια</li>
        <li>Φορολογικές δηλώσεις</li>
        <li>Οικοδομικές άδειες</li>
        <li>Τοπογραφικά διαγράμματα</li>
        <li>Ιδιωτικό συμφωνητικό <b>≥ 20 ετών</b></li>
    </ul>
    <p><b>Επιπλέον απαιτούνται:</b></p>
    <ul>
        <li>≥ 2 <b>ένορκες βεβαιώσεις</b> 20ετούς νομής</li>
        <li><b>Δήλωση Στοιχείων Ακινήτων (Ε9)</b> για την επίμαχη ιδιοκτησία ≥ 10 ετών</li>
    </ul>
    <div class="highlight-box"><b>Πρακτικό Σημείο:</b> Η αναγνώριση κυριότητας λόγω χρησικτησίας μέσω διαμεσολάβησης (άρθρο 101) είναι μια νέα, ισχυρή δυνατότητα. Απαιτεί νομικό-διαμεσολαβητή με ειδική σήμανση, τουλάχιστον 2 αποδεικτικά ≥20ετούς νομής, 2 ένορκες βεβαιώσεις, και Ε9 ≥10 ετών. Προσοχή: το Ελληνικό Δημόσιο έχει δικαίωμα παρέμβασης.</div>`
};

function loadTheory(id, el) {
    document.querySelectorAll('.lib-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('theory_content').innerHTML = theoryData[id];
}

function exportSlidesToWord() {
    const slides = [
        {
            num: '01',
            title: '🔒 Εμπιστευτικότητα &amp; Ουδέτερος Τρίτος',
            subtitle: 'Άρθρο 7 παρ. 3 &amp; άρθρο 8 ν. 4640/2019',
            color: '#2563eb',
            points: [
                'Η Υποχρεωτική Αρχική Συνεδρία Διαμεσολάβησης διέπεται από <b>απόλυτη εμπιστευτικότητα</b>. Οτιδήποτε λεχθεί ή αποκαλυφθεί κατά τη διαδικασία δεν δύναται να χρησιμοποιηθεί ως αποδεικτικό στοιχείο σε μελλοντική δικαστική ή διαιτητική διαδικασία.',
                'Ο διαμεσολαβητής ενεργεί ως <b>ουδέτερος και αμερόληπτος τρίτος</b>. Δεν εκπροσωπεί κανένα μέρος, δεν εκδίδει απόφαση και δεν επιβάλλει λύση. Ο ρόλος του είναι αποκλειστικά διευκολυντικός και επικοινωνιακός.',
                'Πριν από την έναρξη της Υποχρεωτικής Αρχικής Συνεδρίας, <b>όλοι οι συμμετέχοντες</b> — μέρη, νομικοί παραστάτες και διαμεσολαβητής — δεσμεύονται εγγράφως να τηρήσουν το απόρρητο της διαδικασίας.'
            ]
        },
        {
            num: '02',
            title: '🤝 Ελεύθερη Βούληση &amp; Σκοπός',
            subtitle: 'Άρθρα 4 &amp; 7 ν. 4640/2019',
            color: '#059669',
            points: [
                'Η συμμετοχή στη διαμεσολάβηση διέπεται από την αρχή της <b>ελεύθερης βούλησης</b>. Κανένα μέρος δεν υποχρεούται να αποδεχθεί οποιαδήποτε πρόταση ή να καταλήξει σε συμφωνία.',
                '<b>Σκοπός</b> της Υποχρεωτικής Αρχικής Συνεδρίας είναι η εξερεύνηση της δυνατότητας εξωδικαστικής επίλυσης της διαφοράς με αμοιβαία αποδεκτή λύση, εξοικονομώντας χρόνο, κόστος και ενέργεια.',
                'Ακόμη και αν δεν επιτευχθεί συμφωνία, η Υποχρεωτική Αρχική Συνεδρία παρέχει στα μέρη <b>πλήρη ενημέρωση</b> για τις επιλογές τους και ανοίγει διαύλους διαλόγου που συχνά οδηγούν σε μεταγενέστερη επίλυση.'
            ]
        },
        {
            num: '03',
            title: 'Αναστολή Παραγραφής &amp; Δικονομικών Προθεσμιών',
            subtitle: 'Άρθρο 9 ν. 4640/2019',
            color: '#d97706',
            points: [
                'Η έγγραφη γνωστοποίηση του διαμεσολαβητή προς τα μέρη <b>αναστέλλει αυτοδικαίως</b> την παραγραφή και την αποσβεστική προθεσμία άσκησης των αξιώσεων, εφόσον αυτές έχουν αρχίσει να τρέχουν βάσει των διατάξεων του ουσιαστικού δικαίου.',
                'Αναστέλλονται επίσης οι δικονομικές προθεσμίες των <b>άρθρων 237 και 238 Κώδικα Πολιτικής Δικονομίας</b> (κατάθεση προτάσεων) για όσο χρόνο διαρκεί η διαδικασία διαμεσολάβησης.',
                'Η αναστολή ισχύει <b>από την ημερομηνία κοινοποίησης</b> της γνωστοποίησης/πρόσκλησης (Έντυπο 3) και λήγει με την περάτωση της διαδικασίας διαμεσολάβησης.'
            ]
        },
        {
            num: '04',
            title: 'Αποτέλεσμα &amp; Επόμενα Βήματα',
            subtitle: 'Άρθρο 7 παρ. 4 &amp; άρθρο 8 παρ. 3 ν. 4640/2019',
            color: '#7c3aed',
            points: [
                '<b>Αν επιτευχθεί συμφωνία:</b> Συντάσσεται Πρακτικό Επίτευξης Συμφωνίας το οποίο υπογράφεται από τα μέρη και τον διαμεσολαβητή. Η συμφωνία αποτελεί εκτελεστό τίτλο μετά από κατάθεση στη Γραμματεία του αρμόδιου Πρωτοδικείου.',
                '<b>Αν δεν επιτευχθεί συμφωνία:</b> Ο διαμεσολαβητής συντάσσει Πρακτικό Περάτωσης Υποχρεωτικής Αρχικής Συνεδρίας Διαμεσολάβησης, το οποίο προσκομίζεται υποχρεωτικά μαζί με τις προτάσεις στο δικαστήριο.',
                'Σε κάθε περίπτωση, τα μέρη <b>ολοκλήρωσαν τη νόμιμη υποχρέωσή τους</b> βάσει του ν. 4640/2019 και μπορούν πλέον να προχωρήσουν ανεμπόδιστα στη δικαστική διαδικασία, εφόσον το επιθυμούν.'
            ]
        },
        {
            num: '05',
            title: 'Συναλλακτική Ευθύτητα &amp; Επικοινωνιακός Πολιτισμός',
            subtitle: 'Αρχές Διαμεσολάβησης — Κώδικας Δεοντολογίας',
            color: '#dc2626',
            points: [
                'Η διαμεσολάβηση λειτουργεί στο πλαίσιο <b>καλής πίστης και συναλλακτικής ευθύτητας</b>. Τα μέρη αναμένεται να συμμετέχουν με ειλικρίνεια, σεβόμενα τόσο τη διαδικασία όσο και το ένα το άλλο.',
                'Ο <b>επικοινωνιακός πολιτισμός</b> αποτελεί θεμέλιο της διαδικασίας. Ο διαμεσολαβητής διασφαλίζει ότι κάθε μέρος μπορεί να εκφραστεί ελεύθερα, να ακουστεί και να γίνει κατανοητό, εντός ενός κλίματος αμοιβαίου σεβασμού.',
                'Η επίτευξη συμφωνίας, πέρα από νομικό αποτέλεσμα, αντιπροσωπεύει <b>υψηλό επίπεδο πολιτισμικής ωριμότητας</b> των εμπλεκόμενων μερών και συμβάλλει στην αποσυμφόρηση του δικαστικού συστήματος.'
            ]
        }
    ];

    let slidesHtml = slides.map(s => `
<div style="page-break-after:always; padding:2cm; font-family:'Times New Roman',serif; font-size:11pt; color:#000; border-left:6pt solid ${s.color}; margin-bottom:0;">
  <div style="font-size:9pt; color:#64748b; font-weight:bold; text-transform:uppercase; letter-spacing:1px; margin-bottom:4pt;">ΘΕΜΑ ${s.num}</div>
  <div style="font-size:15pt; font-weight:bold; color:#1e293b; margin-bottom:3pt; line-height:1.2;">${s.title.replace(/&amp;/g,'&')}</div>
  <div style="font-size:8pt; color:#64748b; margin-bottom:14pt; font-style:italic;">${s.subtitle.replace(/&amp;/g,'&')}</div>
  ${s.points.map((p,i) => `<div style="display:flex; margin-bottom:10pt; line-height:1.5;">
    <span style="font-weight:bold; color:${s.color}; min-width:20pt;">${i+1}.</span>
    <span>${p}</span>
  </div>`).join('')}
</div>`).join('\n');

    const wordHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@page { size: 21cm 29.7cm; margin: 2.54cm 3.17cm; }
body { font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.15; color: #000; margin:0; padding:0; }
b, strong { font-weight: bold; }
</style></head><body>
<div style="text-align:center; margin-bottom:20pt; padding-bottom:12pt; border-bottom:2pt solid #1e293b;">
  <div style="font-size:16pt; font-weight:bold; color:#1e293b;">ΒΑΣΙΚΑ ΣΗΜΕΙΑ ΥΠΟΧΡΕΩΤΙΚΗΣ ΑΡΧΙΚΗΣ ΣΥΝΕΔΡΙΑΣ ΔΙΑΜΕΣΟΛΑΒΗΣΗΣ</div>
  <div style="font-size:10pt; color:#475569; margin-top:4pt;">Ν. 4640/2019 — Κώδικας Εναλλακτικής Επίλυσης Διαφορών</div>
  <div style="font-size:9pt; color:#94a3b8; margin-top:3pt;">Παναγιώτης Ζαρογουλίδης — Διαπιστευμένος Διαμεσολαβητής (Αριθμός Μητρώου Διαμεσολαβητών 2341)</div>
</div>
${slidesHtml}
</body></html>`;

    const blob = new Blob([wordHtml], {type: 'application/msword; charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Διαφάνεια_ΕΣΔ_Βασικά_Σημεία.doc';
    a.click();
    URL.revokeObjectURL(url);
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
