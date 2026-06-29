
console.log("Bosses:", bosses);
console.log("Loot:", lootData);

const firebaseConfig = {
  apiKey: "AIzaSyA0WSRSXereaPtFKOdf9wJYkgq--1vUnr4",
  authDomain: "l9-boss-tracker-2.firebaseapp.com",
  databaseURL: "https://l9-boss-tracker-2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "l9-boss-tracker-2",
  storageBucket: "l9-boss-tracker-2.firebasestorage.app",
  messagingSenderId: "321005406944",
  appId: "1:321005406944:web:64bd052a4b4927bea3de85"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const DB_ROOT = "douglas";
const APP_VERSION = "1.0.1";

async function loadBossData(){

    const bossSnap = await db.ref(`${DB_ROOT}/bossTimers`).once("value");
    cloudData = bossSnap.val() || {};

    const guildSnap = await db.ref(`${DB_ROOT}/fixedBossGuilds`).once("value");
    fixedGuildData = guildSnap.val() || {};

    updateTimers();
    sortBosses();
}

loadBossData();

setInterval(loadBossData, 30000);

window.addEventListener("beforeunload", () => {
    firebase.database().goOffline();
});

// ===== ASSIST FLAGS (SEPARATE FROM bossTimers) =====
let assistFlags = {};

db.ref(`${DB_ROOT}/assistFlags`).once("value").then(snap => {
  assistFlags = snap.val() || {};
  updateBadgesUI();

  // if admin modal is open, refresh checkbox state too
  const layerOpen = document.getElementById("adminLayer")?.classList.contains("active");
  if(layerOpen && currentAdminBoss){
    const assistBox = document.getElementById("adminAssist");
    if(assistBox) assistBox.checked = !!assistFlags[currentAdminBoss] || !!assistFlags[currentAdminBoss.trim()];
  }
});

// ===== OUR LOOT FLAGS (SEPARATE) =====
let claimFlags = {};

db.ref(`${DB_ROOT}/claimFlags`).once("value").then(snap => {
  claimFlags = snap.val() || {};
  updateBadgesUI();
});

let cloudData = {};
let fixedGuildData = {};
let isTyping = false;
let isAdmin = false;
let expandedCard = null;

// Claim a "send slot" in Firebase so only ONE client can send per boss per spawnTime.

let currentAdminUser = null;
let todaySchedule = [];
let currentScheduleKey = "";
let currentScheduleRef = null;

const scheduleBtn = document.getElementById("scheduleBtn");
const schedulePopup = document.getElementById("schedulePopup");
const scheduleList = document.getElementById("scheduleList");
const scheduleTime = document.getElementById("scheduleTime");
const scheduleText = document.getElementById("scheduleText");
const addScheduleBtn = document.getElementById("addScheduleBtn");
const scheduleAdminBox = document.getElementById("scheduleAdminBox");


function resetCardState(card){
    if(!card) return;

    // Close dropdown i call this 12200 for easy to ctrl find 
    const dropdown = card.querySelector(".boss-dropdown");
    const menuBtn = card.querySelector(".boss-menu");
    const overlay = card.querySelector(".details-overlay");
    const title = card.querySelector(".details-box h3");

    if(dropdown) dropdown.classList.remove("active");
    if(menuBtn) menuBtn.classList.remove("active");
    if(overlay) overlay.classList.remove("menu-open");
    if(title) title.classList.remove("fade-out");
}

function getOptionPool(rarity, isArmor){

    if(rarity === "rare"){
        return isArmor ? rareArmorOptions : rareOptions;
    }

    if(rarity === "epic"){
        return isArmor ? epicArmorOptions : epicOptions;
    }

    if(rarity === "legendary"){
        return isArmor ? legendaryArmorOptions : legendaryOptions;
    }

    return [];
}

function openItemPopupFromSlot(slot){

    const rarity = (slot.dataset.rarity || "common").toLowerCase();
    const type = (slot.dataset.type || "").toLowerCase();

    // ===== TYPE DETECTION =====
    const isWeapon = [
        "sword","staff","knuckles","dagger",
        "shield","bow","crossbow"
    ].some(t => type.includes(t));

    const isArmor = [
    "helm","hood","hat","armor","vest","robe","gaiters","leather pants","cloth pants","gauntlets","wristbands","gloves","greaves","high boots","loafers"
].some(t => type.includes(t));


    // ===== BASIC INFO =====
    const nameEl = document.getElementById("itemName");
    const rarityEl = document.getElementById("itemRarity");

    nameEl.className = "";
    rarityEl.className = "";

    nameEl.classList.add("name-" + rarity);
    rarityEl.classList.add("rarity-" + rarity);

    nameEl.innerText = slot.dataset.name || "Unknown";
    rarityEl.innerText =
        "Rarity: " + rarity.charAt(0).toUpperCase() + rarity.slice(1);

    document.getElementById("itemType").innerText =
        slot.dataset.type || "Unknown";

const statsEl = document.getElementById("itemStats");

if (slot.dataset.stats && slot.dataset.stats.trim() !== "") {
    statsEl.innerHTML = slot.dataset.stats.replaceAll("|","<br>");
    statsEl.style.display = "block";
} else {
    statsEl.innerHTML = "";
    statsEl.style.display = "none";
}


const descEl = document.getElementById("itemDesc");

//  Hide description for weapons and armors check Peak
if (isWeapon || isArmor) {
    descEl.innerText = "";
    descEl.style.display = "none";
}
// Show description for mounts/materials only check peak fixed errors by me 
else if (slot.dataset.desc && slot.dataset.desc.trim() !== "") {
    descEl.innerText = slot.dataset.desc;
    descEl.style.display = "block";
}
else {
    descEl.innerText = "";
    descEl.style.display = "none";
}

const locationEl = document.getElementById("itemLocation");

if (slot.dataset.location && slot.dataset.location.trim() !== "") {
    locationEl.innerText = slot.dataset.location;
    locationEl.style.display = "block";
} else {
    locationEl.innerText = "";
    locationEl.style.display = "none";
}

    const img = slot.querySelector("img");
    if(img){
        document.getElementById("itemImage").src = img.src;
    }

    // ===== OPTION TABLE (WEAPON + ARMOR ONLY) Marked na =====
    const optionContainer = document.getElementById("itemOptions");
    optionContainer.innerHTML = "";

    if(isWeapon || isArmor){

        const pool = getOptionPool(rarity, isArmor);

        if(pool && pool.length > 0){

            optionContainer.innerHTML = `
                <div class="option-header">
                    <span>Option</span>
                    <span>Value</span>
                    <span>Success</span>
                </div>
            `;

            pool.forEach(opt => {

                const row = document.createElement("div");
                row.className = "option-row";

                row.innerHTML = `
                    <span>${opt.name}</span>
                    <span>${opt.value}</span>
                    <span>${opt.success}</span>
                `;

                optionContainer.appendChild(row);
            });
        }
    }

    document.getElementById("itemPopup").classList.add("active");
    document.body.style.overflow = "hidden";

}






document.addEventListener("DOMContentLoaded", function(){

    const mapContent = document.querySelector(".map-content");

    const mapInner = document.getElementById("mapInner");
    // ===== BOSS MARKERS PARA HINDI MALITO=====

    if(!mapContent || !mapInner){
        console.log("Map elements not found");
        return;
    }

    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

   function updateTransform(){

    const mapImage = mapInner.querySelector("img");

    if(!mapImage) return;

    const containerWidth = mapContent.clientWidth;
    const containerHeight = mapContent.clientHeight;

    const imageWidth = mapImage.naturalWidth * scale;
    const imageHeight = mapImage.naturalHeight * scale;

    const minX = Math.min(0, containerWidth - imageWidth);
    const minY = Math.min(0, containerHeight - imageHeight);
    const maxX = 0;
    const maxY = 0;

    posX = Math.max(minX, Math.min(posX, maxX));
    posY = Math.max(minY, Math.min(posY, maxY));

    mapInner.style.transform =
        `translate(${posX}px, ${posY}px) scale(${scale})`;
}


    mapContent.addEventListener("wheel", function(e){
        e.preventDefault();

        const zoomSpeed = 0.2;
        const rect = mapContent.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const prevScale = scale;

        scale += e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
        scale = Math.min(Math.max(1, scale), 4);

        const scaleChange = scale / prevScale;

        posX = mouseX - (mouseX - posX) * scaleChange;
        posY = mouseY - (mouseY - posY) * scaleChange;

        updateTransform();
    });

    mapContent.addEventListener("mousedown", function(e){
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        mapContent.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", function(e){
        if(!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener("mouseup", function(){
        isDragging = false;
        mapContent.style.cursor = "grab";
    });

    mapContent.addEventListener("click", function(e){

    if(isDragging) return; // prevent drag click for more focus on the goal ahaha

    const rect = mapContent.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mapX = (clickX - posX) / scale;
    const mapY = (clickY - posY) / scale;

    console.log("X:", Math.round(mapX), "Y:", Math.round(mapY));
});

});






/* ===== TIMEZONE LOCAL STORAGE UPGRADE FIREBASE ===== */
let selectedOffset = 8;
const timezoneSelect = document.getElementById("timezoneSelect");


const savedOffset = localStorage.getItem("timezoneOffset");
if(savedOffset){
    selectedOffset = parseInt(savedOffset);
    timezoneSelect.value = savedOffset;
}

// tngina nakaka pressure 
timezoneSelect.addEventListener("change", function(){
    selectedOffset = parseInt(this.value);
    localStorage.setItem("timezoneOffset", selectedOffset);
    updateTimers();
    sortBosses();
    renderTodaySchedule();
});
/* ========================================== */




/* ============================================================
   ADMIN AUTH — centered modal login + confirmed logout.
   Session persists in localStorage so a refresh keeps you
   logged in until you explicitly log out.
   ============================================================ */

const ADMIN_STORAGE_KEY = "douglasAdminUser";

/* Entry point from the Admin button.
   Logged in  -> ask before logging out (no accidental logout).
   Logged out -> open the login modal. */
function adminLogin(){
    if(isAdmin){
        openAdminLogout();
    } else {
        openAdminLogin();
    }
}

function openAdminLogin(){
    const popup = document.getElementById("adminLoginPopup");
    if(!popup) return;

    const u = document.getElementById("loginUsername");
    const p = document.getElementById("loginPassword");
    const err = document.getElementById("loginError");

    if(u) u.value = "";
    if(p) p.value = "";
    if(err){ err.textContent = ""; err.classList.remove("show"); }

    popup.classList.add("active");
    setTimeout(() => { if(u) u.focus(); }, 60);
}

function closeAdminLogin(){
    const popup = document.getElementById("adminLoginPopup");
    if(popup) popup.classList.remove("active");
}

function submitAdminLogin(){
    const u = document.getElementById("loginUsername");
    const p = document.getElementById("loginPassword");
    const err = document.getElementById("loginError");
    const submitBtn = document.getElementById("loginSubmitBtn");

    const username = (u ? u.value : "").trim();
    const password = p ? p.value : "";

    const showErr = (msg) => {
        if(err){ err.textContent = msg; err.classList.add("show"); }
    };
    const resetBtn = () => {
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = "Login"; }
    };

    if(!username || !password){
        showErr("Enter a username and password.");
        return;
    }

    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = "Verifying…"; }

    db.ref(`${DB_ROOT}/admins/` + username).once("value").then(snapshot => {

        if(!snapshot.exists()){
            resetBtn();
            showErr("Invalid username.");
            return;
        }

        const data = snapshot.val();

        if(data.password === password){
            isAdmin = true;
            currentAdminUser = username;
            localStorage.setItem(ADMIN_STORAGE_KEY, username); // stay logged in across refresh

            const btn = document.querySelector(".admin-btn");
            if(btn) btn.classList.add("active-admin");

            resetBtn();
            closeAdminLogin();
            applyAdminMode();
        } else {
            resetBtn();
            showErr("Wrong password.");
        }

    }).catch(() => {
        resetBtn();
        showErr("Connection error. Try again.");
    });
}

function openAdminLogout(){
    const popup = document.getElementById("adminLogoutPopup");
    if(popup) popup.classList.add("active");
}

function closeAdminLogout(){
    const popup = document.getElementById("adminLogoutPopup");
    if(popup) popup.classList.remove("active");
}

function confirmAdminLogout(){
    isAdmin = false;
    currentAdminUser = null;
    localStorage.removeItem(ADMIN_STORAGE_KEY);

    const btn = document.querySelector(".admin-btn");
    if(btn) btn.classList.remove("active-admin");

    closeAdminLogout();
    applyAdminMode();
}

/* Restore a saved admin session on page load (called before applyAdminMode). */
function restoreAdminSession(){
    const savedUser = localStorage.getItem(ADMIN_STORAGE_KEY);
    if(savedUser){
        isAdmin = true;
        currentAdminUser = savedUser;
        const btn = document.querySelector(".admin-btn");
        if(btn) btn.classList.add("active-admin");
    }
}


/* ============================================================
   TOP ATTENDANCE — reads the guild Google Sheets live and
   ranks members high -> low.
     • Main guild: 1-week period
     • 2nd guild:  2-week period
   Both reset Sunday 24:00 UTC+7 (= Monday 00:00 UTC+7).
   Sheets are read via the public gviz endpoint using a JSONP
   <script> tag, which sidesteps cross-origin (CORS) limits.
   ============================================================ */

const ATTENDANCE_SHEETS = {
    main: {
        id: "1SCYRJPIoxuNd2OfLIeMlrqaqyLECIP2ekLyigZ1BktI",
        gid: "467377759",   // Jun 29 week tab (resets weekly; update each new week)
        nameCol: 0,
        scoreCol: 2,      // "Score"
        label: "Main Guild",
        cadence: "weekly"
    },
    second: {
        id: "1JV3HBq2OX4OXYWDxRLxSwUPibQLPQywBjIK8dD4uN7U",
        gid: "692409644",
        nameCol: 0,
        scoreCol: 2,      // "Attendance"
        label: "2nd Guild",
        cadence: "biweekly"
    }
};

let attendanceTab = "main";
let attendanceCache = {};      // guild -> sorted rows (cleared each open)
let attendanceTimer = null;

function attEscape(s){
    return String(s).replace(/[&<>"']/g, c => (
        { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
    ));
}

/* Load a public sheet tab as gviz JSON via JSONP (no CORS issues). */
function gvizLoad(id, gid){
    return new Promise((resolve, reject) => {
        const cb = "gviz_" + Math.random().toString(36).slice(2);
        const script = document.createElement("script");
        let settled = false;

        const cleanup = () => {
            try { delete window[cb]; } catch(e){ window[cb] = undefined; }
            if(script.parentNode) script.parentNode.removeChild(script);
        };

        window[cb] = (resp) => {
            settled = true;
            cleanup();
            if(resp && resp.table) resolve(resp.table);
            else reject(new Error("Empty response"));
        };
        script.onerror = () => { if(!settled){ cleanup(); reject(new Error("Could not reach the sheet")); } };
        setTimeout(() => { if(!settled){ cleanup(); reject(new Error("Timed out")); } }, 12000);

        script.src = "https://docs.google.com/spreadsheets/d/" + id +
                     "/gviz/tq?gid=" + gid + "&headers=1&tqx=out:json;responseHandler:" + cb;
        document.head.appendChild(script);
    });
}

function parseAttendance(table, nameCol, scoreCol){
    const rows = (table && table.rows) || [];
    const out = [];

    rows.forEach(r => {
        const cells = r.c || [];
        const nameCell = cells[nameCol];
        const scoreCell = cells[scoreCol];

        const name = (nameCell && nameCell.v != null) ? String(nameCell.v).trim() : "";
        if(!name) return;
        if(/^(name|names|total|totals|guild boss)$/i.test(name)) return;  // skip header/aggregate rows

        let score = (scoreCell && scoreCell.v != null) ? Number(scoreCell.v) : 0;
        if(isNaN(score)) score = 0;

        out.push({ name, score });
    });

    out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return out;
}

/* Current period range + the next reset instant for a cadence.
   Anchored to Mon 2026-06-22 00:00 UTC+7 (a known period start). */
function attPeriodInfo(cadence){
    const MS = 86400000;
    const OFFSET = 7 * 3600000;                 // UTC+7
    const now = new Date();
    const now7 = now.getTime() + OFFSET;        // wall-clock ms in UTC+7 (expressed as UTC)
    const anchor7 = Date.UTC(2026, 5, 22, 0, 0, 0);
    const lenMs = (cadence === "biweekly" ? 14 : 7) * MS;

    const k = Math.floor((now7 - anchor7) / lenMs);
    const startMs = anchor7 + k * lenMs;        // period start (UTC+7 wall clock)
    const endMs = startMs + lenMs;              // reset moment (UTC+7 wall clock)
    const lastDayMs = endMs - MS;               // last day shown (the Sunday)

    const fmt = (ms) => new Date(ms).toLocaleDateString("en-US",
        { month: "short", day: "numeric", timeZone: "UTC" });

    return {
        label: fmt(startMs) + " – " + fmt(lastDayMs),
        resetMs: endMs - OFFSET                 // back to a real UTC instant
    };
}

function attResetCountdown(resetMs){
    let diff = Math.max(0, resetMs - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);   diff -= h * 3600000;
    const m = Math.floor(diff / 60000);
    if(d > 0) return d + "d " + h + "h";
    if(h > 0) return h + "h " + m + "m";
    return m + "m";
}

function openAttendance(){
    const popup = document.getElementById("attendancePopup");
    if(!popup) return;
    attendanceCache = {};                      // always pull fresh data on open
    popup.classList.add("active");
    document.body.style.overflow = "hidden";
    switchAttendance(attendanceTab || "main");

    clearInterval(attendanceTimer);
    attendanceTimer = setInterval(updateAttendanceMeta, 30000);
}

function closeAttendance(){
    const popup = document.getElementById("attendancePopup");
    if(popup) popup.classList.remove("active");
    document.body.style.overflow = "auto";
    clearInterval(attendanceTimer);
    attendanceTimer = null;
}

function switchAttendance(guild){
    attendanceTab = guild;

    document.querySelectorAll(".att-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.guild === guild);
    });

    updateAttendanceMeta();

    const listEl = document.getElementById("attendanceList");
    if(!listEl) return;

    if(attendanceCache[guild]){
        renderAttendance(attendanceCache[guild]);
        return;
    }

    listEl.innerHTML = '<div class="att-state"><div class="att-spin"></div><div>Loading sheet…</div></div>';

    const cfg = ATTENDANCE_SHEETS[guild];
    gvizLoad(cfg.id, cfg.gid)
        .then(table => {
            const data = parseAttendance(table, cfg.nameCol, cfg.scoreCol);
            attendanceCache[guild] = data;
            if(attendanceTab === guild) renderAttendance(data);
        })
        .catch(err => {
            if(attendanceTab !== guild) return;
            listEl.innerHTML =
                '<div class="att-state err">Couldn\'t load the sheet (' + attEscape(err.message) + ').<br>' +
                'Make sure it\'s shared as “Anyone with the link · Viewer”.</div>';
        });
}

function updateAttendanceMeta(){
    const cfg = ATTENDANCE_SHEETS[attendanceTab];
    if(!cfg) return;
    const info = attPeriodInfo(cfg.cadence);
    const cadenceLabel = cfg.cadence === "biweekly" ? "2-week" : "weekly";

    const periodEl = document.getElementById("attPeriod");
    const resetEl = document.getElementById("attReset");
    if(periodEl) periodEl.innerHTML = cadenceLabel + " · <b>" + info.label + "</b>";
    if(resetEl) resetEl.innerHTML = "resets in <b>" + attResetCountdown(info.resetMs) + "</b>";
}

function renderAttendance(data){
    const listEl = document.getElementById("attendanceList");
    if(!listEl) return;

    if(!data.length){
        listEl.innerHTML = '<div class="att-state">No attendance recorded yet for this period.</div>';
        return;
    }

    listEl.innerHTML = data.map((p, i) => {
        const rank = i + 1;
        const medal = rank === 1 ? "att-top att-gold"
                    : rank === 2 ? "att-top att-silver"
                    : rank === 3 ? "att-top att-bronze" : "";
        return '<div class="att-row ' + medal + '">' +
                   '<span class="att-rank">' + rank + '</span>' +
                   '<span class="att-name">' + attEscape(p.name) + '</span>' +
                   '<span class="att-score">' + p.score + '</span>' +
               '</div>';
    }).join("");
}




/* ===== FULL BOSS LIST ===== */

/* ===== END BOSS LIST ===== */



function getNextFixedSpawn(schedule){

    const now = new Date();
    let next = null;

    schedule.forEach(s => {

        const target = new Date();

        const [h, m] = s.time.split(":");

        // Convert server time (UTC+8) to UTC properly by building the UTC timestamp directly by teshi :V
        target.setUTCHours(
            parseInt(h) - 8,
            parseInt(m),
            0,
            0
        );

        const dayDiff = (s.day - target.getUTCDay() + 7) % 7;
        target.setUTCDate(target.getUTCDate() + dayDiff);

        if(target <= now){
            target.setUTCDate(target.getUTCDate() + 7);
        }

        if(!next || target < next){
            next = target;
        }
    });

    return next;
}


function formatTime(ms){
    const total = Math.max(0, Math.ceil(ms/1000));
    const h = Math.floor(total/3600);
    const m = Math.floor((total%3600)/60);
    const s = total%60;
    return `${h}h ${m}m ${s}s`;
}

function isSameDay(d1,d2){
    return d1.getFullYear()===d2.getFullYear() &&
           d1.getMonth()===d2.getMonth() &&
           d1.getDate()===d2.getDate();
}

function isTomorrow(spawn, now){
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate()+1);
    return isSameDay(spawn, tomorrow);
}

function getTodayScheduleKey(){
    const zone =
        selectedOffset === 9 ? "Asia/Seoul" :
        selectedOffset === 8 ? "Asia/Manila" :
        "Asia/Bangkok";

    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(now);

    const year = parts.find(p => p.type === "year").value;
    const month = parts.find(p => p.type === "month").value;
    const day = parts.find(p => p.type === "day").value;

    return `${year}-${month}-${day}`;
}

function formatScheduleTime(timestamp){
    if(!timestamp) return "No Time";

    const zone =
        selectedOffset === 9 ? "Asia/Seoul" :
        selectedOffset === 8 ? "Asia/Manila" :
        "Asia/Bangkok";

    return new Date(timestamp).toLocaleString("en-US", {
        timeZone: zone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function scheduleOffset(){
    // Schedule is ALWAYS shown in Philippines time (UTC+8). The sheet is
    // Thai (UTC+7), so this means +1h — regardless of the boss-timer
    // timezone dropdown.
    return 8;
}

/* 2nd-guild bosses: their live spawn times (set via "Set Timer" / "Dead")
   are auto-merged into the Today Schedule so the guild never has to edit the
   sheet. These come from the shared boss timers, so everyone sees them. */
const GUILD2_BOSSES = ["Venatus", "Viorent", "Ego", "Livera", "Araneo", "Undomiel"];

function getGuildBossEvents(){
    const out = [];
    GUILD2_BOSSES.forEach(name => {
        const saved = cloudData[name];
        let spawn = null;
        if(saved && typeof saved === "object") spawn = saved.spawn;
        else if(typeof saved === "number") spawn = saved;
        if(!spawn) return;
        // boss spawn is an absolute UTC timestamp → express it as PH wall clock
        out.push({ name: name, localMs: spawn + 8 * 3600000, isBoss: true });
    });
    return out;
}

function renderTodaySchedule(){
    if(!scheduleList) return;

    const sheetEvents = (scheduleEvents || []).map(e => ({ name: e.name, localMs: e.localMs, isBoss: false }));
    const bossEvents = getGuildBossEvents().filter(b =>
        !sheetEvents.some(s => s.name.toLowerCase().includes(b.name.toLowerCase()))   // skip if sheet already lists it
    );
    const all = sheetEvents.concat(bossEvents).sort((a, b) => a.localMs - b.localMs);

    if(all.length === 0){
        scheduleList.innerHTML = `<div class="schedule-empty">No schedule loaded for today or tomorrow.</div>`;
        return;
    }

    const off = scheduleOffset();
    const nowLocal = Date.now() + off * 3600000;          // local wall clock (UTC-expressed)
    const n = new Date(nowLocal);
    const todayMid = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    const tomorrowMid = todayMid + 86400000;
    const dayAfterMid = todayMid + 2 * 86400000;

    const fmtTime = (ms) => new Date(ms).toLocaleTimeString("en-US",
        { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" });

    const section = (title, from, to) => {
        const list = all.filter(e => e.localMs >= from && e.localMs < to);
        if(!list.length){
            return `<div class="sched-group">${title}</div><div class="schedule-empty">Nothing scheduled.</div>`;
        }
        const rows = list.map(e => {
            const past = e.localMs < nowLocal ? " sched-past" : "";
            const bossCls = e.isBoss ? " sched-boss" : "";
            const tag = e.isBoss ? `<span class="sched-tag">2nd Guild</span>` : "";
            return `<div class="schedule-entry${past}${bossCls}">
                        <div class="schedule-entry-left">
                            <span class="schedule-time">${fmtTime(e.localMs)}</span>
                            <span class="schedule-text">${attEscape(e.name).replace(/\n+/g, " · ")}${tag}</span>
                        </div>
                    </div>`;
        }).join("");
        return `<div class="sched-group">${title}</div>${rows}`;
    };

    scheduleList.innerHTML = section("Today", todayMid, tomorrowMid) +
                             section("Tomorrow", tomorrowMid, dayAfterMid);
}

/* ---- Today Schedule is now read from the public spawn sheet ----
   Sheet times are Thai (UTC+7); they are shifted to the selected
   timezone (Philippines = +1h). Shows Today + Tomorrow. ---- */
const SCHEDULE_SHEET = {
    id: "1ZhK_aO2nLzLcMgrb1jWw3DOctlkR1US_CciHd_E2GZI",
    gid: "921196904",
    nameCol: 1,   // "NAME-EN"
    timeCol: 3    // "Day Spawn"  e.g. "Tue, 23/06/2026 19:00"
};
let scheduleEvents = [];

function parseScheduleSheet(table){
    const rows = (table && table.rows) || [];
    const shift = (scheduleOffset() - 7) * 3600000;   // sheet is UTC+7 -> local
    const re = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/;
    const out = [];

    rows.forEach(r => {
        const c = r.c || [];
        const nameCell = c[SCHEDULE_SHEET.nameCol];
        const timeCell = c[SCHEDULE_SHEET.timeCol];
        const name = (nameCell && nameCell.v != null) ? String(nameCell.v).trim() : "";
        const raw  = (timeCell && timeCell.v != null) ? String(timeCell.v).trim() : "";
        if(!name || !raw) return;

        const m = raw.match(re);            // DD/MM/YYYY HH:MM
        if(!m) return;                      // skips "None" / blank rows

        const localMs = Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]) + shift;
        out.push({ name, localMs });
    });

    out.sort((a, b) => a.localMs - b.localMs);
    return out;
}

function loadSheetSchedule(){
    if(!scheduleList) return;
    scheduleList.innerHTML =
        '<div class="att-state"><div class="att-spin"></div><div>Loading schedule…</div></div>';

    gvizLoad(SCHEDULE_SHEET.id, SCHEDULE_SHEET.gid)
        .then(table => {
            scheduleEvents = parseScheduleSheet(table);
            renderTodaySchedule();
        })
        .catch(err => {
            scheduleList.innerHTML =
                '<div class="att-state err">Couldn\'t load the schedule sheet (' + attEscape(err.message) + ').<br>' +
                'Make sure it\'s shared as “Anyone with the link · Viewer”.</div>';
        });
}

/* Firebase daily schedule is no longer used to drive the popup. */
function listenTodaySchedule(){ /* sheet-driven now */ }
function openSchedulePopup(){
    if(schedulePopup){
        schedulePopup.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    // schedule is sheet-driven now — hide the manual add box
    if(scheduleAdminBox){
        scheduleAdminBox.style.display = "none";
    }

    loadSheetSchedule();
}

function closeSchedulePopup(){
    if(schedulePopup){
        schedulePopup.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

function addTodaySchedule(){
    if(!isAdmin){
        alert("Admin only.");
        return;
    }

    const timeValue = scheduleTime?.value?.trim() || "";
    const text = scheduleText?.value?.trim() || "";

    if(!text){
        alert("Please enter an event.");
        return;
    }

    if(!timeValue){
        alert("Please enter a time.");
        return;
    }

    const todayKey = getTodayScheduleKey(); // example: 2026-03-23
    const localDateTime = new Date(`${todayKey}T${timeValue}:00`);

    const updated = [...todaySchedule, {
        timestamp: localDateTime.getTime(),
        text
    }].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    db.ref(`${DB_ROOT}/dailySchedules/` + todayKey).set(updated);

    if(scheduleTime) scheduleTime.value = "";
    if(scheduleText) scheduleText.value = "";
}

function deleteScheduleItem(index){
    if(!isAdmin){
        alert("Admin only.");
        return;
    }

    const updated = [...todaySchedule];
    updated.splice(index, 1);

    const key = getTodayScheduleKey();
    db.ref(`${DB_ROOT}/dailySchedules/` + key).set(updated);
}






/* Hover-to-animate boss portraits (PC only — skipped on touch to avoid
   mobile lag). Add a boss here as: "<BossName>": "<path to .gif>".
   The GIF is heavy, so it lazy-loads on first hover and crossfades in
   (handled per-card in attachGifHover). */
const BOSS_GIFS = {
    "Venatus":         "Boss GIF/1Venatus.webp",
    "Viorent":         "Boss GIF/2Viorent.webp",
    "Ego":             "Boss GIF/3Ego.webp",
    "Clemantis":       "Boss GIF/4Clemantis.webp",
    "Livera":          "Boss GIF/5Livera.webp",
    "Araneo":          "Boss GIF/6Araneo.webp",
    "Undomiel":        "Boss GIF/7Undomiel.webp",
    "Saphirus":        "Boss GIF/8Saphirus.webp",
    "Lady Dalia":      "Boss GIF/9LadyDalia.webp",
    "General Aquleus": "Boss GIF/10GeneralAquleus.webp",
    "Thymele":         "Boss GIF/11Thymele.webp",
    "Neutro":          "Boss GIF/12Neutro.webp",
    "Amentis":         "Boss GIF/13Amentis.webp",
    "Baron Braudmore": "Boss GIF/14BaronBraudmore.webp",
    "Milavy":          "Boss GIF/15Milavy.webp",
    "Wannitas":        "Boss GIF/16Wannitas.webp",
    "Metus":           "Boss GIF/17Metus.webp",
    "Duplican":        "Boss GIF/18Duplican.webp",
    "Shuliar":         "Boss GIF/19Shuliar.webp",
    "Roderick":        "Boss GIF/20Roderick.webp",
    "Ringor":          "Boss GIF/21Ringor.webp",
    "Gareth":          "Boss GIF/22Gareth.webp",
    "Titore":          "Boss GIF/23Titore.webp",
    "Larba":           "Boss GIF/24Larba.webp",
    "Catena":          "Boss GIF/25Catena.webp",
    "Auraq":           "Boss GIF/26Auraq.webp",
    "Secreta":         "Boss GIF/27Secreta.webp",
    "Ordo":            "Boss GIF/28Ordo.webp",
    "Asta":            "Boss GIF/29Asta.webp",
    "Supore":          "Boss GIF/30Supore.webp",
    "Chaiflock":       "Boss GIF/31Chaiflock.webp",
    "Benji":           "Boss GIF/32Benji.webp",
    "Libitina":        "Boss GIF/33Libitina.webp",
    "Rakajeth":        "Boss GIF/34Rakajeth.webp",
    "Icaruthia":       "Boss GIF/35Icaruthia.webp",
    "Motti":           "Boss GIF/36Motti.webp",
    "Nevaeh":          "Boss GIF/37Navaeh.webp",
    "Tumier":          "Boss GIF/38Tumier.webp"
};

// true only on devices with a real mouse (desktop/laptop), false on phones/tablets
const CAN_HOVER_GIF = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);

/* Wire a card's hover crossfade: load the GIF on first hover, then dissolve
   PNG -> GIF. Only ever called on PC for bosses that have a GIF. */
function attachGifHover(card){
    const wrap = card.querySelector(".boss-img-wrap.has-gif");
    if(!wrap) return;
    const gif = wrap.querySelector(".boss-gif");
    if(!gif) return;

    const src = gif.dataset.gif;
    let hovering = false;
    let clearTimer = null;

    gif.addEventListener("load", () => {
        if(hovering) wrap.classList.add("gif-on");   // arrived while still hovering → fade in now
    });

    wrap.addEventListener("mouseenter", () => {
        hovering = true;
        if(clearTimer){ clearTimeout(clearTimer); clearTimer = null; }
        if(!gif.getAttribute("src")){
            gif.src = src;                           // (re)load — instant after the first time (cached)
        } else if(gif.complete){
            wrap.classList.add("gif-on");            // already loaded → fade in
        }
    });

    wrap.addEventListener("mouseleave", () => {
        hovering = false;
        wrap.classList.remove("gif-on");             // crossfade back to the static image
        // After it fades out, drop the src so the WebP stops decoding frames in the
        // background. Otherwise every boss you've hovered keeps animating = lag.
        clearTimer = setTimeout(() => {
            if(!hovering) gif.removeAttribute("src");
        }, 700);
    });
}

function createCard(boss){
    const card = document.createElement("div");
    card.className="card";
    card.dataset.name = boss.name;
    if (boss.category === "world") {
    card.dataset.category = "world";
}

    card.dataset.spawn = Infinity;

    const baseContent = boss.type === "interval" ? `
        <div class="badge-group">
    <div class="badge">Interval</div>
</div>
        <div class="name">${boss.name} (${boss.hours}h)</div>
        <div class="timer">Not Set</div>
        <div class="spawn"></div>
       <div class="admin-controls">
    <button class="open-admin"
            onclick="openAdminLayer('${boss.name}', ${boss.hours})">
        Set Timer
    </button>
    <button class="quick-dead-btn"
            onclick="armDead(event, this, '${boss.name}', ${boss.hours})"
            data-tip="set boss died right now">
        Dead
    </button>
</div>
</div>





    ` : boss.type === "fixed" && boss.disabled ? `
    <div class="badge-group">
    <div class="badge">Fixed</div>
    ${boss.continent === "Kransia" ? 
        '<div class="continent-badge">Kransia</div>' 
        : ''
    }
</div>

    <div class="name">${boss.name}</div>
    <div class="timer">Disabled</div>
    <div class="spawn">
        ${boss.schedule.map(s=>{
            const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            return days[s.day] + " " + s.time;
        }).join("<br>")}
    </div>
`
: `
    <div class="badge-group">
    <div class="badge">Fixed</div>
    ${boss.continent === "Kransia"
        ? '<div class="continent-badge">Kransia</div>'
        : ''
    }
</div>

    <div class="name">${boss.name}</div>
    <div class="timer">--</div>
    <div class="spawn"></div>
    <div class="fixed">Weekly Spawn</div>

    <div class="admin-controls">
    <button class="open-admin"
        onclick="openAdminLayer('${boss.name}', 0)">
        Set Guild
    </button>
</div>
`;


let lootHTML = "";

if(lootData[boss.name] && lootData[boss.name].length > 0){
    lootHTML = lootData[boss.name].slice(0,4).map(item => `
    <div class="loot-slot"
         data-name="${item.name}"
         data-desc="${item.desc || ''}"
         data-rarity="${item.rarity || ''}"
         data-type="${item.type || ''}"
         data-stats="${item.stats || ''}"
         data-location="${item.location || ''}">
        <img src="${item.img || 'Pictures/placeholder.png'}" alt="${item.name}" onerror="this.onerror=null;this.src='Pictures/placeholder.png'">
    </div>
`).join("");

} else {
    lootHTML = `
        <div style="
            grid-column: span 2;
            opacity:0.6;
            padding:20px;
            text-align:center;
        ">
            No loot info yet
        </div>
    `;
}





    const gifSrc = BOSS_GIFS[boss.name] || "";
    const showGif = gifSrc && CAN_HOVER_GIF;        // GIF layer only on PC
    const wrapClass = showGif ? "boss-img-wrap has-gif" : "boss-img-wrap";
    const bossImgTag = showGif
        ? `<img class="boss-img" src="${boss.image}">
       <img class="boss-gif" data-gif="${gifSrc}" alt="" aria-hidden="true">`
        : `<img class="boss-img" src="${boss.image}">`;

    card.innerHTML = `
      <div class="${wrapClass}">
  ${bossImgTag}
  <div class="assist-badge" title="Assist is ON">🤝 Assist</div>
  <div class="claim-badge" title="Our Loot">🎁 Our Loot</div>
</div>
  <div class="card-content">
    ${baseContent}
  </div>
    <div class="details-overlay">
        <div class="details-box">

            <!-- TOP GROUP -->
            <div class="details-topbar">
                <div class="boss-menu" onclick="toggleBossMenu(event, '${boss.name}')">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div class="boss-dropdown" id="menu-${boss.name}">
    <div class="boss-info-box">
        <p><strong>Boss Info:</strong> ${boss.info || "Unknown boss"}</p>
        <p><strong>Location:</strong> ${boss.location || "Unknown location"}</p>
        <p class="all-loots-btn"
           onclick="showAllLoot('${boss.name.trim()}')">
           <strong>All Loots:</strong> ${(allLootData[boss.name] || []).length}
        </p>

    </div>
</div>


            <!-- CENTER GROUP -->
            <div class="details-center">
                <h3>${boss.name} Loot</h3>
                <div class="loot-grid">
                    ${lootHTML}
                </div>
            </div>

        </div>
    </div>
`;


    if(showGif) attachGifHover(card);

    document.getElementById("soonGrid").appendChild(card);
}

function updateBadgesUI(){
  document.querySelectorAll(".card").forEach(card => {
    const raw = card.dataset.name || "";
    const key = raw.trim();

    const boss = bosses.find(b => (b.name || "").trim() === key);

    const isClaim  = !!claimFlags[raw]  || !!claimFlags[key];
    const isAssist = !!assistFlags[raw] || !!assistFlags[key];

    // reset
    card.classList.remove("assist-on", "claim-on");

    // interval badge rule: only show when timer exists
    const hasTimer = card.classList.contains("has-timer");
    const isInterval = boss?.type === "interval";
    const isFixed = boss?.type === "fixed";

    if(isInterval && !hasTimer) return; // keep your old rule for interval

    // fixed bosses can show anytime
    if(isFixed || hasTimer){
      // ONLY ONE BADGE (priority: Our Loot > Assist)
      if(isClaim){
        card.classList.add("claim-on");
      } else if(isAssist){
        card.classList.add("assist-on");
      }
    }
  });
}

function updateTimers(){
    const now = new Date();
    const nowUTC = new Date(now.getTime());

    const cards = Array.from(document.querySelectorAll(".card"));

    cards.forEach(card=>{
        const bossName = card.dataset.name;
        const boss = bosses.find(b => (b.name || "").trim() === (bossName || "").trim());

if(!boss){
    card.dataset.spawn = Infinity;
    return;
}

if(boss.disabled){
    const timerEl = card.querySelector(".timer");
    const spawnEl = card.querySelector(".spawn");

    timerEl.innerText = "Disabled";
    spawnEl.innerHTML = boss.schedule.map(s=>{
        const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return days[s.day] + " " + s.time;
    }).join("<br>");

    card.dataset.spawn = Infinity;
    return;
}



        const timerEl = card.querySelector(".timer");
        const spawnEl = card.querySelector(".spawn");

        let spawn;

        if(boss.type === "interval"){

    const saved = cloudData[boss.name];

if(!saved){
    card.classList.remove("has-timer"); // ✅ do not touch assist-on here anymore
    timerEl.classList.remove("ready","warning");
    timerEl.innerText = "Not Set";
    spawnEl.innerText = "";
    card.dataset.spawn = Infinity;
    
    return;
}

    let guild = "";

    if(typeof saved === "object"){
        guild = saved.guild || "";
        spawn = new Date(saved.spawn);
    } else {
        spawn = new Date(saved);
    }

    // ✅ show assist button only when timer exists
card.classList.add("has-timer");



    // ===== GUILD BADGE SYSTEM PRE =====
    let nameEl = card.querySelector(".name");
let existingGuildTag = nameEl.querySelector(".guild-tag");

// Fucking hustle to fix
if(existingGuildTag){
    existingGuildTag.remove();
}

if(guild){
    const guildTag = document.createElement("span");
    guildTag.className = "guild-tag";
    guildTag.innerHTML = `<span class="crown">👑</span>${guild}`;
    nameEl.appendChild(guildTag);
}

} else if (boss.type === "fixed") {
    spawn = getNextFixedSpawn(boss.schedule);
}

if(boss.type === "fixed"){

    const key = (boss.name || "").trim();
    let guild = fixedGuildData[key] || fixedGuildData[boss.name] || "";
    let nameEl = card.querySelector(".name");
    let existingGuildTag = nameEl.querySelector(".guild-tag");

    if(existingGuildTag){
        existingGuildTag.remove();
    }

    if(guild){
        const guildTag = document.createElement("span");
        guildTag.className = "guild-tag";
        guildTag.innerHTML = `<span class="crown">👑</span>${guild}`;
        nameEl.appendChild(guildTag);
    }
}
if(!spawn){
    // Only interval bosses should fall back to Infinity
    if(boss.type === "interval"){
        card.dataset.spawn = Infinity;
        return;
    }
}
        const remaining = spawn - now;
        card.dataset.spawn = spawn.getTime();

        if (remaining > 0) {

    timerEl.classList.remove("ready","warning");

    if (remaining <= 3600000) {
        timerEl.classList.add("warning");
    }

   // 🚫 Skip Discord alerts for world bosses

            timerEl.innerText = formatTime(remaining);

            // Converted stored UTC spawn to selected timezone shiet



const zone =
    selectedOffset === 9 ? "Asia/Seoul" :
    selectedOffset === 8 ? "Asia/Manila" :
    "Asia/Bangkok";

spawnEl.innerText = "Spawn: " + new Date(spawn).toLocaleString("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
});





        } else {
            timerEl.classList.remove("warning");
            timerEl.classList.add("ready");
            timerEl.innerText="🔥 READY";
        }
    });
}

function sortBosses(){
    if(isTyping) return;
    if(expandedCard) return;

    const now = new Date();

    const today = document.getElementById("todayGrid");
    const tomorrow = document.getElementById("tomorrowGrid");
    const soon = document.getElementById("soonGrid");

    const cards = Array.from(document.querySelectorAll(".card"));

    // Place cards into correct section
    cards.forEach(card=>{
        const spawnTime = Number(card.dataset.spawn);

        let targetSection;

        if(!spawnTime || spawnTime === Infinity){
            targetSection = soon;
        } else {
            const zone =
    selectedOffset === 9 ? "Asia/Seoul" :
    selectedOffset === 8 ? "Asia/Manila" :
    "Asia/Bangkok";

const spawnDate = new Date(
    new Date(spawnTime).toLocaleString("en-US", { timeZone: zone })
);

const nowInZone = new Date(
    new Date().toLocaleString("en-US", { timeZone: zone })
);


            if(isSameDay(spawnDate, nowInZone)){

                targetSection = today;
            }
            else if(isTomorrow(spawnDate, nowInZone)){

                targetSection = tomorrow;
            }
            else{
                targetSection = soon;
            }
        }

        if(card.parentElement !== targetSection){
            targetSection.appendChild(card);
        }
    });

    // Sort each section by lowest remaining time
    [today, tomorrow, soon].forEach(section=>{

        const sectionCards = Array.from(section.querySelectorAll(".card"));

        sectionCards.sort((a,b)=>{

            const spawnA = Number(a.dataset.spawn);
            const spawnB = Number(b.dataset.spawn);

            const hasA = spawnA && spawnA !== Infinity;
            const hasB = spawnB && spawnB !== Infinity;

            if(hasA && !hasB) return -1;
            if(!hasA && hasB) return 1;
            if(!hasA && !hasB) return 0;

            const remainingA = spawnA - now.getTime();
            const remainingB = spawnB - now.getTime();

            return remainingA - remainingB;
        });

        sectionCards.forEach((card,index)=>{
            if(section.children[index] !== card){
                section.insertBefore(card, section.children[index] || null);
            }
        });

    });
}


function setDeath(name,hours){
    const input = document.getElementById("input-"+name).value;
    if(!input) return;

    const [h,m] = input.split(":");
    const death = new Date();

    const now = new Date();
    death.setHours(h, m, now.getSeconds(), now.getMilliseconds());

    const spawn = death.getTime() + hours * 3600000;

    db.ref(`${DB_ROOT}/bossTimers/` + name).set({
  spawn: spawn,
  guild: "",
});

    triggerTimerAnimation(name);
}


function triggerTimerAnimation(bossName){
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const name = card.querySelector(".name").innerText;
        if(name.includes(bossName)){
            card.classList.add("timer-set");
            setTimeout(() => {
                card.classList.remove("timer-set");
            }, 600);
        }
    });
}

/* One-click "just died now": set an interval boss's timer from the current
   moment, keep its guild, log history, and refresh the card immediately. */
function quickSetDead(name, hours){
    if(!isAdmin){ alert("Admin only."); return; }
    if(!name || hours == null){ return; }

    const death = Date.now();
    const spawn = death + (hours * 3600000);

    // keep any existing guild on the boss
    const existing = cloudData[name];
    const guild = (existing && typeof existing === "object" && existing.guild) ? existing.guild : "";

    db.ref(`${DB_ROOT}/bossTimers/` + name).set({ spawn: spawn, guild: guild });

    db.ref(`${DB_ROOT}/bossHistory`).push({
        boss: name,
        deathTime: death,
        recordedAt: Date.now(),
        setBy: currentAdminUser || "Unknown"
    }).then(() => { limitBossHistory(); });

    // optimistic local update so the card updates instantly (don't wait for the 30s poll)
    cloudData[name] = { spawn: spawn, guild: guild };
    updateTimers();
    sortBosses();
    triggerTimerAnimation(name);
}

/* Two-step confirm for the Dead button (prevents accidental clicks):
   click 1 → button turns green and says "Yes"; click 2 within a few
   seconds → fires quickSetDead and reverts. Auto-cancels if not confirmed. */
function armDead(e, btn, name, hours){
    if(e){ e.stopPropagation(); }          // barrier: don't open the loot view
    if(!isAdmin){ alert("Admin only."); return; }
    if(!btn) return;

    const disarm = () => {
        clearTimeout(btn._armTimer);
        btn.classList.remove("armed");
        btn.textContent = "Dead";
        btn.setAttribute("data-tip", "set boss died right now");
    };

    // second click while armed → confirm + run
    if(btn.classList.contains("armed")){
        disarm();
        quickSetDead(name, hours);
        return;
    }

    // first click → arm (green "Yes")
    btn.classList.add("armed");
    btn.textContent = "Yes";
    btn.setAttribute("data-tip", "click again to confirm");

    clearTimeout(btn._armTimer);
    btn._armTimer = setTimeout(disarm, 3000);
}

let currentAdminBoss = null;
let currentAdminHours = null;

//errors fixed no more errors 1day fixed by teshi
function openAdminLayer(name, hours){

    currentAdminBoss = name;
    currentAdminHours = hours;

    const bossObj = bosses.find(b => b.name === name);
    const adminImg = document.getElementById("adminBossImage");

if(adminImg && bossObj?.image){
    adminImg.src = bossObj.image;
}

    //  Select actual rows using IDs inside them
    const quickTimeRow = document.getElementById("adminTime").closest(".admin-row");
    const customRow = document.getElementById("adminDate").closest(".admin-row");

    if(bossObj?.type === "fixed"){
        quickTimeRow.style.display = "none";
        customRow.style.display = "none";
    } else {
        quickTimeRow.style.display = "flex";
        customRow.style.display = "flex";
    }


    let saved = cloudData[name];
let spawnValue = null;

if(saved){
    if(typeof saved === "object"){
        spawnValue = saved.spawn;
    } else {
        spawnValue = saved;
    }
}
    if(spawnValue){
           const zone =
    selectedOffset === 9 ? "Asia/Seoul" :
    selectedOffset === 8 ? "Asia/Manila" :
    "Asia/Bangkok";

const converted = new Date(
    new Date(spawnValue).toLocaleString("en-US", { timeZone: zone })
);

    document.getElementById("adminCurrentTimer").innerText =
        "Current Spawn: " + converted.toLocaleString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    } else {
        document.getElementById("adminCurrentTimer").innerText =
            "No timer set";
    }

    document.getElementById("adminLayer").classList.add("active");
    document.body.style.overflow = "hidden";

    // ===== ASSIST + OUR LOOT TOGGLE LOAD =====
const assistBox = document.getElementById("adminAssist");
const assistRow = document.getElementById("adminAssistRow");

const claimBox = document.getElementById("adminClaim");
const claimRow = document.getElementById("adminClaimRow");

// show rows (you can decide rules)
if(assistRow) assistRow.style.display = "flex";
if(claimRow) claimRow.style.display = isAdmin ? "flex" : "none";

// checkbox states (trim-safe)
if(assistBox){
  assistBox.disabled = !isAdmin;
  assistBox.checked = !!assistFlags[name] || !!assistFlags[name.trim()];
}

if(claimBox){
  claimBox.disabled = !isAdmin;
  claimBox.checked = !!claimFlags[name] || !!claimFlags[name.trim()];
}
}


function closeAdminLayer(){
    document.getElementById("adminLayer").classList.remove("active");
    document.body.style.overflow = "auto";
}

const setBtn = document.getElementById("adminSetBtn");

if (setBtn) {
    setBtn.onclick = function(){
        const assistEnabled = document.getElementById("adminAssist")?.checked || false;
const claimEnabled  = document.getElementById("adminClaim")?.checked || false;

        if(!currentAdminBoss){
            alert("No boss selected.");
            return;
        }

        const k = currentAdminBoss.trim();

db.ref(`${DB_ROOT}/assistFlags/` + k).set(assistEnabled);
db.ref(`${DB_ROOT}/claimFlags/` + k).set(claimEnabled);

if(claimEnabled) db.ref(`${DB_ROOT}/assistFlags/` + k).set(false);
if(assistEnabled) db.ref(`${DB_ROOT}/claimFlags/` + k).set(false);

        const bossObj = bosses.find(b => b.name === currentAdminBoss);

        // FIXED BOSS → ONLY GUILD OKAY
        if(bossObj?.type === "fixed"){

            const guild = document.getElementById("adminGuild").value || "";
            const k = currentAdminBoss.trim();
            db.ref(`${DB_ROOT}/fixedBossGuilds/` + k).set(guild);

            closeAdminLayer();
            return;
        }

        //  INTERVAL BOSS LIKE FOR BOSSES TIME SET
        const input = document.getElementById("adminTime").value;
        const guild = document.getElementById("adminGuild").value || "";

        if(!input && !guild){
            alert("Please set time or guild.");
            return;
        }

        // If time is provided → update spawn
        if(input){

            const [h, m] = input.split(":");

            const death = new Date();
            const now = new Date();
            death.setHours(parseInt(h), parseInt(m), now.getSeconds(), 0);

            let spawn = death.getTime() + (currentAdminHours * 3600000);

            db.ref(`${DB_ROOT}/bossTimers/` + currentAdminBoss).set({
    spawn: spawn,
    guild: guild,
    
});



            db.ref(`${DB_ROOT}/bossHistory`).push({
                boss: currentAdminBoss,
                deathTime: death.getTime(),
                recordedAt: Date.now(),
                setBy: currentAdminUser || "Unknown"
            }).then(() => {
                limitBossHistory();
            });

        } 
        else {
            // Only update guild oke
            db.ref(`${DB_ROOT}/bossTimers/` + currentAdminBoss + "/guild").set(guild);
        }

        closeAdminLayer();
    };
}


const customBtn = document.getElementById("adminCustomBtn");

if (customBtn) {
    customBtn.onclick = function(){

        const assistEnabled = document.getElementById("adminAssist")?.checked || false;
const claimEnabled  = document.getElementById("adminClaim")?.checked || false;

        if(!currentAdminBoss || currentAdminHours == null){
            alert("No boss selected.");
            return;
        }
        const k = currentAdminBoss.trim();

db.ref(`${DB_ROOT}/assistFlags/` + k).set(assistEnabled);
db.ref(`${DB_ROOT}/claimFlags/` + k).set(claimEnabled);

if(claimEnabled) db.ref(`${DB_ROOT}/assistFlags/` + k).set(false);
if(assistEnabled) db.ref(`${DB_ROOT}/claimFlags/` + k).set(false);

        const dateValue = document.getElementById("adminDate").value;
        const timeValue = document.getElementById("adminCustomTime").value;

        if(!dateValue || !timeValue){
            alert("Please select both date and time.");
            return;
        }

        const death = new Date(dateValue + "T" + timeValue);

        let spawn = death.getTime() + (currentAdminHours * 3600000);

    

        const guild = document.getElementById("adminGuild").value || "";


db.ref(`${DB_ROOT}/bossTimers/` + currentAdminBoss).set({
  spawn: spawn,
  guild: guild || "",
});


        

        db.ref(`${DB_ROOT}/bossHistory`).push({
    boss: currentAdminBoss,
    deathTime: death.getTime(),
    recordedAt: Date.now(),
    setBy: currentAdminUser || "Unknown"
}).then(() => {
    limitBossHistory();
});



        triggerTimerAnimation(currentAdminBoss);
        closeAdminLayer();
    };
}


const resetBtn = document.getElementById("adminResetBtn");

if (resetBtn) {
    resetBtn.onclick = function(){

        if(!currentAdminBoss){
            alert("No boss selected.");
            return;
        }

        

        const k = currentAdminBoss.trim();
db.ref(`${DB_ROOT}/assistFlags/` + k).set(false);
db.ref(`${DB_ROOT}/claimFlags/` + k).set(false);
        if(!confirm("Reset this?")){
            return;
        }
        

        const bossObj = bosses.find(b => b.name === currentAdminBoss);

        if(bossObj?.type === "fixed"){
            db.ref(`${DB_ROOT}/fixedBossGuilds/` + currentAdminBoss.trim()).remove();
        } else {
            db.ref(`${DB_ROOT}/bossTimers/` + currentAdminBoss).remove();
        }

        triggerTimerAnimation(currentAdminBoss);
        closeAdminLayer();
    };

}


const removeGuildBtn = document.getElementById("adminRemoveGuildBtn");

if(removeGuildBtn){
    removeGuildBtn.onclick = function(){

        if(!currentAdminBoss){
            alert("No boss selected.");
            return;
        }

        const k = (currentAdminBoss || "").trim();
        const bossObj = bosses.find(b => (b.name || "").trim() === k);

        if(bossObj?.type === "fixed"){
            const k = currentAdminBoss.trim();
            db.ref(`${DB_ROOT}/fixedBossGuilds/` + k).remove();
        } else {
            db.ref(`${DB_ROOT}/bossTimers/` + currentAdminBoss + "/guild").remove();
        }

        // remove badge instantly
        const card = document.querySelector(`.card[data-name="${currentAdminBoss}"]`);
        if(card){
            const nameEl = card.querySelector(".name");
            const existingGuildTag = nameEl.querySelector(".guild-tag");
            if(existingGuildTag){
                existingGuildTag.remove();
            }
        }

        closeAdminLayer();
    };
}
console.log("Bosses:", bosses);
console.log("LootData:", lootData);

bosses.forEach(createCard);
updateBadgesUI();
listenTodaySchedule();



document.addEventListener("click", function(e){

    if(e.target.closest(".loot-slot")){
        return;
    }

    if(e.target.closest(".open-admin")){
    return;
}

    if(e.target.closest(".quick-dead-btn")){
    return;
    }

    const clickedCard = e.target.closest(".card");

    document.querySelectorAll(".card").forEach(card => {

        if(card !== clickedCard){
            card.classList.remove("show-details");
            resetCardState(card);   
        }

    });

    if(clickedCard && !e.target.closest(".open-admin") && !e.target.closest(".quick-dead-btn")){
    clickedCard.classList.toggle("show-details");
}
});

// HANDLE SMALL LOOT CLICK (CARD LOOT)
document.addEventListener("click", function(e){

    const slot = e.target.closest(".loot-slot");
    if(!slot) return;

    e.stopPropagation();

    openItemPopupFromSlot(slot);
});


restoreAdminSession();
applyAdminMode();

function applyAdminMode(){
  document.querySelectorAll(".admin-controls").forEach(control=>{
    control.style.display = isAdmin ? "block" : "none";
  });

  // show the logged-in admin name under the site title
  const nameTag = document.getElementById("adminNameTag");
  if(nameTag){
    if(isAdmin && currentAdminUser){
      nameTag.textContent = "◈ " + currentAdminUser;
      nameTag.style.display = "inline-flex";
    } else {
      nameTag.textContent = "";
      nameTag.style.display = "none";
    }
  }

  const historyBtn = document.getElementById("historyBtn");
  if(historyBtn) historyBtn.style.display = "inline-block";

  if(scheduleAdminBox){
    scheduleAdminBox.style.display = isAdmin ? "block" : "none";
  }

  renderTodaySchedule();
}




function startTimer(){

    updateTimers();
    listenTodaySchedule();

    // local UI timer only
    setInterval(() => {

        updateTimers();

        if (!isTyping) sortBosses();

    }, 1000);

    // Firebase schedule refresh
    setInterval(() => {

        listenTodaySchedule();
        renderTodaySchedule();

    }, 60000);

}
function toggleBossMenu(event, bossName){
    event.stopPropagation();

    const menu = document.getElementById("menu-" + bossName);
    const button = event.currentTarget;
    const card = button.closest(".card");
    const title = card.querySelector(".details-box h3");
    const overlay = card.querySelector(".details-overlay");

    const isActive = menu.classList.toggle("active");
    card.classList.toggle("menu-active", isActive);

    button.classList.toggle("active");

    if(isActive){
        title.classList.add("fade-out");
        overlay.classList.add("menu-open");
    } else {
        title.classList.remove("fade-out");
        overlay.classList.remove("menu-open");
    }
}

function showAllLoot(bossName){

    bossName = bossName.trim();
    
    console.log("Boss Name:", bossName);
    console.log("AllLootData Key Exists?:", allLootData[bossName]);

    const popup = document.getElementById("allLootPopup");
    const grid = document.getElementById("allLootGrid");
    const title = document.getElementById("allLootTitle");

    console.log("Boss Name:", bossName);
    console.log("Loot Data:", allLootData[bossName]);

    title.innerText = bossName + " - All Loots";
    grid.innerHTML = "";

    const lootList = allLootData[bossName] || [];

    lootList.forEach(item => {
const slot = document.createElement("div");
slot.className = "loot-slot";

slot.dataset.name = item.name || "";
slot.dataset.desc = item.desc || "";
slot.dataset.rarity = item.rarity || "";
slot.dataset.type = item.type || "";
slot.dataset.stats = item.stats || "";
slot.dataset.location = item.location || "";

slot.innerHTML = `<img src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='Pictures/placeholder.png'">`;

        slot.onclick = () => {
    openItemPopupFromSlot(slot);
};

        grid.appendChild(slot);
    });

    popup.classList.add("active");
}

function closeAllLoot(event){
    const popup = document.getElementById("allLootPopup");

    // Only close if clicking background
    if (!event || event.target === popup) {
        popup.classList.remove("active");
    }
}

// CLOSE ITEM POPUP WHEN CLICKING BACKGROUND
document.getElementById("itemPopup").addEventListener("click", function(e){
    if(e.target.id === "itemPopup"){
        this.classList.remove("active");
        document.body.style.overflow = "auto";
    }
});


document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){

        // Close Item Popup
        const itemPopup = document.getElementById("itemPopup");
        if(itemPopup.classList.contains("active")){
            itemPopup.classList.remove("active");
            document.body.style.overflow = "auto";
        }

        // Close All Loot Popup
        const allLootPopup = document.getElementById("allLootPopup");
        if(allLootPopup.classList.contains("active")){
            allLootPopup.classList.remove("active");
            document.body.style.overflow = "auto";
        }
                const schedulePopup = document.getElementById("schedulePopup");
        if(schedulePopup.classList.contains("active")){
            schedulePopup.classList.remove("active");
            document.body.style.overflow = "auto";
        }

        // Close Top Attendance
        const attPopup = document.getElementById("attendancePopup");
        if(attPopup && attPopup.classList.contains("active")){
            closeAttendance();
        }

        // Close admin auth modals
        closeAdminLogin();
        closeAdminLogout();
    }

    // Enter submits the admin login while it is open
    if(e.key === "Enter"){
        const loginPopup = document.getElementById("adminLoginPopup");
        if(loginPopup && loginPopup.classList.contains("active")){
            e.preventDefault();
            submitAdminLogin();
        }
    }
});


    

startTimer();

function createWorldBossCard(name, level, image, location){

    const container = document.getElementById("worldBossContent");


    const card = document.createElement("div");
    card.className = "world-boss-card";

    card.innerHTML = `
        <img src="${image}" class="world-boss-img">
        
        <div class="world-boss-name">${name}</div>
        <div class="world-boss-time">
            Daily 11:00 – 12:00<br>
            Daily 20:00 – 21:00
        </div>
        <div class="world-boss-location">
            ${location}
        </div>
    `;

    container.appendChild(card);
}



const openMapBtn = document.getElementById("openMapBtn");
const mapOverlay = document.getElementById("mapOverlay");
const mapImage = document.getElementById("mapImage");

if(scheduleBtn){
    scheduleBtn.onclick = openSchedulePopup;
}

if(addScheduleBtn){
    addScheduleBtn.onclick = addTodaySchedule;
}

if(schedulePopup){
    schedulePopup.addEventListener("click", function(e){
        if(e.target === schedulePopup){
            closeSchedulePopup();
        }
    });
}

openMapBtn.onclick = () => {
    mapOverlay.classList.add("active");
    document.body.style.overflow = "hidden"; 
};


function closeMapOverlay(){
    mapOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}


// ===== RENDER BOSS MARKERS =====
function renderBossMarkers(imagePath){

    document.querySelectorAll(".boss-marker").forEach(m => m.remove());

    const bossList = mapBossData[imagePath];
    if(!bossList) return;

    bossList.forEach(boss => {

        const marker = document.createElement("div");
        marker.className = "boss-marker";
        marker.style.position = "absolute";
        marker.style.left = boss.x + "px";
        marker.style.top = boss.y + "px";
        marker.style.position = "absolute";
marker.style.left = boss.x + "px";
marker.style.top = boss.y + "px";
marker.style.width = "40px";
marker.style.height = "40px";
marker.style.transform = "translate(-50%, -50%)";
marker.style.cursor = "pointer";
marker.style.background = "transparent";
// HOVER TOOLTIP
marker.addEventListener("mouseenter", function(){

    const tooltip = document.createElement("div");
    tooltip.className = "map-hover-tooltip";
    tooltip.innerText = boss.name;

    document.body.appendChild(tooltip);

    const rect = marker.getBoundingClientRect();

    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top - 10 + "px";

    marker._tooltip = tooltip;
});

marker.addEventListener("mouseleave", function(){
    if(marker._tooltip){
        marker._tooltip.remove();
        marker._tooltip = null;
    }
});



 marker.onclick = () => {

    //  If world boss → open world boss panel immediately
if(boss.name === "Ratan" || boss.name === "Parto" || boss.name === "Nedra"){

    mapOverlay.classList.remove("active");
    document.body.style.overflow = "hidden";

    worldOverlay.classList.add("active");

    //  highlight selected world boss
    document.querySelectorAll(".world-boss-card").forEach(card => {
        card.classList.remove("selected");
    });

    const targetCard = Array.from(document.querySelectorAll(".world-boss-card"))
        .find(card => card.querySelector(".world-boss-name").innerText === boss.name);

    if(targetCard){
        targetCard.classList.add("selected");
    }

    return;
}



    const cards = document.querySelectorAll(".card");
    let found = false;

    cards.forEach(card => {

        const bossName = card.dataset.name;

        if(bossName === boss.name){

            found = true;

            // Close map
            mapOverlay.classList.remove("active");
            document.body.style.overflow = "auto";

            // Close other cards
            document.querySelectorAll(".card").forEach(c => {
                c.classList.remove("show-details");
            });

            card.scrollIntoView({ behavior: "smooth", block: "center" });

            setTimeout(() => {
                card.classList.add("show-details");
            }, 400);
        }
    });

    // If NOT a main boss → show simple popup set by me fixed errors
   if(!found){

    // If world boss → open world boss panel gets?
   

    // Normal popup for other stuff
    const infoBox = document.createElement("div");
    infoBox.className = "map-info-popup";

    infoBox.innerHTML = `
        <h3>${boss.name}</h3>
        ${boss.type ? `<p><strong>Type:</strong> ${boss.type}</p>` : ""}
        ${boss.level ? `<p><strong>Level:</strong> ${boss.level}</p>` : ""}
    `;

    document.body.appendChild(infoBox);

    setTimeout(() => {
        infoBox.classList.add("show");
    }, 10);

    setTimeout(() => {
        infoBox.classList.remove("show");
        setTimeout(() => infoBox.remove(), 300);
    }, 2500);
}

};



        mapInner.appendChild(marker);
    });
}


const continentTabs = document.querySelectorAll(".continent-tab");
const sidebar = document.getElementById("mapSidebar" );

function loadContinent(continentKey){
    sidebar.innerHTML = "";

    const continentData = continents[continentKey];

    Object.keys(continentData).forEach(continentName => {

        // ===== MAIN TITLE (Dien, Lindris etc) =====
        const titleDiv = document.createElement("div");
        titleDiv.className = "main-region";
        titleDiv.innerText = continentName;

        // Container for zones
        const zoneContainer = document.createElement("div");
        zoneContainer.className = "zone-container";

        continentData[continentName].forEach(zone => {

    const zoneDiv = document.createElement("div");
    zoneDiv.className = "sub-region";
    zoneDiv.innerHTML = `
        <div>${zone.name}</div>
        <small style="color:#aaa">${zone.level}</small>
    `;

    zoneDiv.onclick = () => {

    document.querySelector(".sub-region.active")?.classList.remove("active");
    zoneDiv.classList.add("active");

    if(zone.img){

        // Start animation
        mapImage.classList.add("map-animate");

        setTimeout(() => {
            mapImage.src = zone.img;
            renderBossMarkers(zone.img);


            // Fade back in 
            mapImage.classList.remove("map-animate");
        }, 200);
    }
};


    zoneContainer.appendChild(zoneDiv);
});



        
        // Toggle open/close sumasara kapag clinick
titleDiv.onclick = () => {

    zoneContainer.classList.toggle("open");

    if(zoneContainer.classList.contains("open")){

        const zones = zoneContainer.querySelectorAll(".sub-region");

        zones.forEach((zone, index) => {
            zone.style.transitionDelay = (index * 0.08) + "s";
        });

    } else {

        // reset delay when closing okay?
        const zones = zoneContainer.querySelectorAll(".sub-region");
        zones.forEach(zone => {
            zone.style.transitionDelay = "0s";
        });

    }
};


        sidebar.appendChild(titleDiv);
        sidebar.appendChild(zoneContainer);
    });
    

}




continentTabs.forEach(tab => {
    tab.onclick = () => {
        document.querySelector(".continent-tab.active")?.classList.remove("active");
        tab.classList.add("active");
        loadContinent(tab.dataset.continent);
    };
});

// Load default continent
loadContinent("elsera");


const worldBossBtn = document.getElementById("worldBossBtn");
const worldOverlay = document.getElementById("worldBossOverlay");


worldBossBtn.onclick = () => {

    // Close Map if open
    mapOverlay.classList.remove("active");

    // Open World Boss code 14444 easy to ctrl F
    worldOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
};



worldOverlay.onclick = (e) => {
    if(e.target === worldOverlay){
        worldOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }
    document.querySelectorAll(".world-boss-card").forEach(card => {
    card.classList.remove("selected");
});

};

document.getElementById("historyPopup").addEventListener("click", function(e){
    if(e.target.id === "historyPopup"){
        this.classList.remove("active");
        document.body.style.overflow = "auto";
    }
});


document.getElementById("historyBtn").onclick = function(){

    const popup = document.getElementById("historyPopup");
    const list = document.getElementById("historyList");

    const deathTab = document.getElementById("tabDeath");
    const recordedTab = document.getElementById("tabRecorded");


    list.innerHTML = "Loading...";

    db.ref(`${DB_ROOT}/bossHistory`)
.limitToLast(25)
.once("value", snap => {

        const data = snap.val();
        list.innerHTML = "";

        if(!data){
            list.innerHTML = "<p>No history yet.</p>";
            return;
        }

        let allEntries = Object.values(data).filter(entry =>
            entry &&
            entry.boss &&
            entry.deathTime &&
            entry.recordedAt
        );

        function renderList(sortType){

            list.innerHTML = "";

            if(sortType === "death"){
                allEntries.sort((a,b)=> b.deathTime - a.deathTime);
            } else {
                allEntries.sort((a,b)=> b.recordedAt - a.recordedAt);
            }

            allEntries.forEach(entry => {

                const div = document.createElement("div");
                div.className = "history-entry";

                const zone =
    selectedOffset === 9 ? "Asia/Seoul" :
    selectedOffset === 8 ? "Asia/Manila" :
    "Asia/Bangkok";

const timeValue = sortType === "death"
    ? entry.deathTime
    : entry.recordedAt;

div.innerHTML = `
    <div class="history-boss">
    ${entry.boss}
    ${entry.setBy ? `<span style="color:#f5c542; font-size:12px;"> • ${entry.setBy}</span>` : ""}
</div>
    <div class="history-time">
        ${new Date(timeValue).toLocaleString("en-US", {
            timeZone: zone,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        })}
    </div>
`;



                list.appendChild(div);
            });
        }

        
        renderList("death");

        deathTab.onclick = function(){
            deathTab.classList.add("active");
            recordedTab.classList.remove("active");
            renderList("death");
        };

        recordedTab.onclick = function(){
            recordedTab.classList.add("active");
            deathTab.classList.remove("active");
            renderList("recorded");
        };

    });

    popup.classList.add("active");
    document.body.style.overflow = "hidden";

};


function limitBossHistory(){

    db.ref(`${DB_ROOT}/bossHistory`).once("value", snap => {

        const data = snap.val();
        if(!data) return;

        const entries = Object.entries(data);

        if(entries.length <= 25) return;

        
        entries.sort((a,b) => 
            a[1].recordedAt - b[1].recordedAt
        );

        const removeCount = entries.length - 25;

        for(let i = 0; i < removeCount; i++){
            const keyToRemove = entries[i][0];
            db.ref(`${DB_ROOT}/bossHistory/` + keyToRemove).remove();
        }

    });
}




// ===== CREATE WORLD BOSSES =====

createWorldBossCard("Ratan", 60, "Pictures/World boss/Ratan.png", "Tomb of Time");
createWorldBossCard("Parto", 85, "Pictures/World boss/Parto.png", "Magic Puppet's Yearning");
createWorldBossCard("Nedra", 105, "Pictures/World boss/Nedra.png", "Bloodsoaked Plateau");

