//=========
// Ads ke liye code 20s lock
//=========
let isAdLocked = false;
function loadAdsterraAd() {
    if (isAdLocked) return;
    isAdLocked = true;
    setTimeout(function() { isAdLocked = false; }, 20000);
    let box = document.getElementById("adsbox");
    if (!box) return;
    box.innerHTML = "";
    let iframe = document.createElement('iframe');
    iframe.width = "320"; iframe.height = "50"; iframe.frameBorder = "0"; iframe.scrolling = "no";
    iframe.style.margin = "0"; iframe.style.padding = "0"; iframe.style.border = "none"; iframe.style.display = "block";
    box.appendChild(iframe);
    let originalAdCode = `<!DOCTYPE html><html><head><style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; }</style></head><body><script>atOptions={'key':'bf3a800b761cc4feb4247c006b3deb13','format':'iframe','height':50,'width':320,'params':{}};<\/script><script src="https://www.highperformanceformat.com/bf3a800b761cc4feb4247c006b3deb13/invoke.js"><\/script></body></html>`;
    iframe.contentWindow.document.open(); iframe.contentWindow.document.write(originalAdCode); iframe.contentWindow.document.close();
}
window.addEventListener("load", function() { loadAdsterraAd(); });
document.addEventListener("click", function() { loadAdsterraAd(); });

// =====================================================================
// 1. MASTER SHEET CONFIG (यहाँ अपनी मेन शीट की लिंक डालें)
// =====================================================================
const MASTER_SHEET_URL = "https://cdn.jsdelivr.net/gh/Angad50/Date@main/Links_data.csv"

let masterData = { courses: [], tests: [] };
let currentAppData = null; 
let currentCategoryName100 = ""; // कोर्स या टेस्ट का नाम जो क्लिक हुआ है
let targetMasterItem100 = null; // पासवर्ड वेरिफिकेशन के लिए टेम्पररी

let userProfile100 = { firstName: "", lastName: "", fatherName: "", profilePic: "" };
let activeTabId100 = "navCourses"; 

let currentTopic100 = "", currentSubject100 = "", currentChapter100 = "", currentChapterObj100 = null; 
let quizQuestions100 = [], userAnswers100 = [], timeElapsed100 = 0, timerInterval100;
let isPreviewMode100 = false, isSavedPracticeMode100 = false, isQuizQuitAuthorized100 = false; 
let activeScreenId100 = 'loadingScreen100'; 

// =====================================================================
// 2. इनिशियलाइजेशन
// =====================================================================
window.addEventListener('DOMContentLoaded', () => {
    history.replaceState({ screen: 'masterCoursesScreen100', tab: activeTabId100 }, ""); 
    checkUserProfileSetup100();
    attachGlobalEvents100();
});

function checkUserProfileSetup100() {
    let savedProfile = localStorage.getItem('angad_exam_profile');
    if (savedProfile) {
        userProfile100 = JSON.parse(savedProfile);
        updateProfileUI100();
        fetchMasterSheet100(); // मास्टर शीट फेच करें
    } else {
        document.getElementById('overlay100').style.display = "block";
        document.getElementById('onboardingPopup100').style.display = "flex";
    }
}

function updateProfileUI100() {
    document.getElementById('profileNameDisplay').innerText = userProfile100.firstName + " " + userProfile100.lastName;
    document.getElementById('profileFatherDisplay').innerText = "Father: " + (userProfile100.fatherName !== "" ? userProfile100.fatherName : "-");
    if (userProfile100.profilePic !== "") {
        document.getElementById('profileSmallImg100').src = userProfile100.profilePic;
        document.getElementById('profileLargeImg100').src = userProfile100.profilePic;
    }
}

/*function saveProfileSetup100() {
    let fName = document.getElementById('setupFirstName').value.trim();
    let lName = document.getElementById('setupLastName').value.trim();
    let father = document.getElementById('setupFatherName').value.trim();
    
    if (fName === "" || lName === "") { showCustomAlert100("कृपया अपना First Name और Last Name जरूर डालें!"); return; }
    
    userProfile100.firstName = fName; userProfile100.lastName = lName; userProfile100.fatherName = father;
    localStorage.setItem('angad_exam_profile', JSON.stringify(userProfile100));
    updateProfileUI100();
    
    document.getElementById('onboardingPopup100').style.display = "none";
    document.getElementById('overlay100').style.display = "none";
    fetchMasterSheet100();
}*/
function saveProfileSetup100() {
    let fName = document.getElementById('setupFirstName').value.trim();
    let lName = document.getElementById('setupLastName').value.trim();
    let father = document.getElementById('setupFatherName').value.trim();
    
    if (fName === "" || lName === "") { showCustomAlert100("कृपया अपना First Name और Last Name जरूर डालें!"); return; }
    
    userProfile100.firstName = fName; userProfile100.lastName = lName; userProfile100.fatherName = father;
    localStorage.setItem('angad_exam_profile', JSON.stringify(userProfile100));
    updateProfileUI100();
    
    document.getElementById('onboardingPopup100').style.display = "none";
    document.getElementById('overlay100').style.display = "none";
    
    // नया लॉजिक: मास्टर शीट केवल तभी फेच करें जब ऐप में कोई डेटा लोड न हुआ हो
    if (masterData.courses.length === 0 && masterData.tests.length === 0) {
        fetchMasterSheet100();
    }
}










// =====================================================================
// 3. MASTER SHEET FETCHING & PARSING
// =====================================================================
function fetchMasterSheet100() {
    if (MASTER_SHEET_URL.includes("YOUR_MASTER")) {
        showCustomAlert100("कृपया script.js में MASTER_SHEET_URL सेट करें।");
        showScreen100('masterCoursesScreen100', "Courses", false);
        return;
    }
    showScreen100('loadingScreen100', "Loading Data...", false);
    
    Papa.parse(MASTER_SHEET_URL, {
        download: true, skipEmptyLines: true,
        complete: function(results) { 
            try { 
                parseMasterCSVLogic100(results.data); 
                extractAndShowHomeMessage100(results.data);
                renderMasterScreens100(); 
                if(activeTabId100 === "navCourses") showScreen100('masterCoursesScreen100', "Courses", false);
            } catch (err) { showRetryPopup100("master"); } 
        },
        error: function(err) { showRetryPopup100("master"); }
    });
}

function parseMasterCSVLogic100(rows) {
    masterData = { courses: [], tests: [] };
    // लूप 1 से शुरू करें (हेडर Row 1 छोड़ दें)
    for (let i = 1; i < rows.length; i++) {
        let cols = rows[i];
        // Col A, B, C (Courses)
        if (cols[0] && String(cols[0]).trim() !== "") {
            masterData.courses.push({
                name: String(cols[0]).trim(),
                link: cols[1] ? String(cols[1]).trim() : "",
                pwd: cols[2] ? String(cols[2]).trim() : ""
            });
        }
        // Col D, E, F (Tests)
        if (cols[3] && String(cols[3]).trim() !== "") {
            masterData.tests.push({
                name: String(cols[3]).trim(),
                link: cols[4] ? String(cols[4]).trim() : "",
                pwd: cols[5] ? String(cols[5]).trim() : ""
            });
        }
    }
}

function renderMasterScreens100() {
    const courseDiv = document.getElementById('masterCoursesList100'); courseDiv.innerHTML = "";
    masterData.courses.forEach(item => {
        let btn = document.createElement('button'); 
        btn.innerHTML = `<i class="fa-solid fa-book" style="margin-right:8px;"></i> ${item.name}`;
        if(item.pwd !== "") btn.innerHTML += ` <i class="fa-solid fa-lock" style="float:right; color:#ef4444; margin-top:4px;"></i>`;
        btn.addEventListener('click', () => handleMasterItemClick100(item)); 
        courseDiv.appendChild(btn); 
    });

    const testDiv = document.getElementById('masterTestsList100'); testDiv.innerHTML = "";
    masterData.tests.forEach(item => {
        let btn = document.createElement('button'); 
        btn.innerHTML = `<i class="fa-solid fa-file-pen" style="margin-right:8px;"></i> ${item.name}`;
        if(item.pwd !== "") btn.innerHTML += ` <i class="fa-solid fa-lock" style="float:right; color:#ef4444; margin-top:4px;"></i>`;
        btn.addEventListener('click', () => handleMasterItemClick100(item)); 
        testDiv.appendChild(btn); 
    });
}

function handleMasterItemClick100(item) {
    if (!item.link || item.link === "") { showCustomAlert100("इसकी कोई लिंक नहीं दी गई है!"); return; }
    targetMasterItem100 = item;
    
    if (item.pwd !== "") {
        document.getElementById('masterPwdInput100').value = "";
        document.getElementById('overlay100').style.display = "block";
        document.getElementById('masterPwdPopup100').style.display = "flex";
    } else {
        fetchSubCSV100(item);
    }
}

function checkMasterPassword100() {
    let entered = document.getElementById('masterPwdInput100').value.trim();
    if (entered === targetMasterItem100.pwd) {
        closePopups100();
        fetchSubCSV100(targetMasterItem100);
    } else {
        showCustomAlert100("गलत पासवर्ड!");
    }
}

// =====================================================================
// 4. SUB-CSV FETCHING (Lazy Loading) - पुराना लॉजिक
// =====================================================================
function fetchSubCSV100(item) {
    currentCategoryName100 = item.name;
    showScreen100('loadingScreen100', "Loading...", true);
    Papa.parse(item.link, {
        download: true, skipEmptyLines: true,
        complete: function(results) { 
            try { 
                currentAppData = parseCSVLogic100(results.data); 
                renderTopics100(true); 
            } catch (err) { showRetryPopup100("sub"); } 
        },
        error: function(err) { showRetryPopup100("sub"); }
    });
}

function parseTimeStringToSeconds100(timeStr) {
    if (!timeStr || String(timeStr).trim() === "") return 0;
    let parts = String(timeStr).trim().split(":"); let totalSeconds = 0;
    if (parts.length === 3) totalSeconds = (parseInt(parts[0]) || 0) * 3600 + (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
    else if (parts.length === 2) totalSeconds = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
    else if (parts.length === 1) totalSeconds = (parseInt(parts[0]) || 0) * 60; return totalSeconds;
}

function parseCSVLogic100(parsedRows) {
    let localData = {}; let tempTopic = "", tempSubject = "", tempChapter = "";
    for (let i = 1; i < parsedRows.length; i++) { 
        let cols = parsedRows[i]; if(!cols || cols.length === 0) continue;
        let colA = cols[0] ? String(cols[0]).trim() : "", colB = cols[1] ? String(cols[1]).trim() : "", colC = cols[2] ? String(cols[2]).trim() : "";
        if (colA !== "" && colB === "" && colC === "") { tempTopic = colA; if (!localData[tempTopic]) localData[tempTopic] = {}; } 
        else if (colA === "" && colB !== "" && colC === "") { tempSubject = colB; if (!localData[tempTopic]) localData[tempTopic] = {}; if (!localData[tempTopic][tempSubject]) localData[tempTopic][tempSubject] = {}; } 
        else if (colA === "" && colB === "" && colC !== "") {
            tempChapter = colC; if (!localData[tempTopic]) localData[tempTopic] = {}; if (!localData[tempTopic][tempSubject]) localData[tempTopic][tempSubject] = {}; 
            localData[tempTopic][tempSubject][tempChapter] = { questions100: [], entryPwd100: cols[3]?String(cols[3]).trim():"", exitPwd100: cols[4]?String(cols[4]).trim():"", time100: parseTimeStringToSeconds100(cols[5]?String(cols[5]).trim():""), marks100: parseInt(cols[6]?String(cols[6]).trim():"") || 1 };
        } 
        else if (colA !== "" && colB !== "") {
            let ansIndex = cols[5] ? parseInt(String(cols[5]).trim()) - 1 : 0; if (isNaN(ansIndex)) ansIndex = 0;
            if(localData[tempTopic] && localData[tempTopic][tempSubject] && localData[tempTopic][tempSubject][tempChapter]) {
                localData[tempTopic][tempSubject][tempChapter].questions100.push({ qText100: colA, options100: [cols[1]?String(cols[1]).trim():"", cols[2]?String(cols[2]).trim():"", cols[3]?String(cols[3]).trim():"", cols[4]?String(cols[4]).trim():""], answerIndex100: ansIndex, fact100: cols[6]?String(cols[6]).trim():"", origTopic100: tempTopic, origSub100: tempSubject, origChap100: tempChapter, category100: currentCategoryName100 });
            }
        }
    }
    return localData; 
}

// =====================================================================
// 5. लिस्ट रेंडरिंग (Topics, Subjects, Chapters)
// =====================================================================
function renderTopics100(isDeepNav = true) {
    if(!currentAppData) return;
    const listDiv = document.getElementById('topicList100'); listDiv.innerHTML = "";
    for (let topic in currentAppData) { 
        let btn = document.createElement('button'); btn.innerText = topic; 
        btn.addEventListener('click', () => { currentTopic100 = topic; renderSubjects100(); }); 
        listDiv.appendChild(btn); 
    }
    showScreen100('topicScreen100', currentCategoryName100, isDeepNav);
}
function renderSubjects100() {
    const listDiv = document.getElementById('subjectList100'); listDiv.innerHTML = "";
    for (let subject in currentAppData[currentTopic100]) { let btn = document.createElement('button'); btn.innerText = subject; btn.addEventListener('click', () => { currentSubject100 = subject; renderChapters100(); }); listDiv.appendChild(btn); }
    showScreen100('subjectScreen100'); 
}
function renderChapters100() {
    const listDiv = document.getElementById('chapterList100'); listDiv.innerHTML = "";
    for (let chapter in currentAppData[currentTopic100][currentSubject100]) { 
        let btn = document.createElement('button'); 
        btn.innerHTML = `${chapter}`;
        if(currentAppData[currentTopic100][currentSubject100][chapter].entryPwd100 !== "") {
            btn.innerHTML += ` <i class="fa-solid fa-lock" style="float:right; color:#ef4444; margin-top:4px;"></i>`;
        }
        btn.addEventListener('click', () => prepareQuiz100(chapter, currentAppData)); 
        listDiv.appendChild(btn); 
    }
    showScreen100('chapterScreen100'); 
}

// =====================================================================
// 6. इवेंट्स और नेविगेशन
// =====================================================================
function attachGlobalEvents100() {
    document.getElementById('saveProfileSetupBtn').addEventListener('click', saveProfileSetup100);
    document.getElementById('editProfileDetailsBtn').addEventListener('click', () => {
        document.getElementById('setupFirstName').value = userProfile100.firstName;
        document.getElementById('setupLastName').value = userProfile100.lastName;
        document.getElementById('setupFatherName').value = userProfile100.fatherName;
        document.getElementById('overlay100').style.display = "block"; document.getElementById('onboardingPopup100').style.display = "flex";
    });

    document.getElementById('profileSmallImg100').addEventListener('click', () => {
        document.getElementById('overlay100').style.display = "block"; document.getElementById('imageViewPopup100').style.display = "flex";
    });
    document.getElementById('closeImageViewerBtn').addEventListener('click', closePopups100);
    document.getElementById('uploadNewPhotoBtn').addEventListener('click', () => document.getElementById('imageUploader100').click());
    document.getElementById('imageUploader100').addEventListener('change', compressAndSaveImage);

    // मास्टर पासवर्ड
    document.getElementById('verifyMasterPwdBtn100').addEventListener('click', checkMasterPassword100);
    document.getElementById('cancelMasterPwdBtn100').addEventListener('click', closePopups100);

    // टॉप बैक बटन
    document.getElementById('dynamicTopBtn100').addEventListener('click', handleDynamicTopBtnClick100);

    // अन्य पॉपअप्स
    document.getElementById('closeAlertBtn100').addEventListener('click', closeCustomAlert100);
    document.getElementById('cancelEntryBtn100').addEventListener('click', closePopups100);
    document.getElementById('cancelExitBtn100').addEventListener('click', closePopups100); 
    document.getElementById('cancelQuitBtn100').addEventListener('click', closePopups100);
    document.getElementById('verifyEntryBtn100').addEventListener('click', checkEntryPassword100);
    document.getElementById('verifyQuitBtn100').addEventListener('click', verifyQuitAuth100);
    document.getElementById('verifyExitBtn100').addEventListener('click', checkExitPassword100);
    //document.getElementById('submitQuizBtn100').addEventListener('click', () => forceSubmitQuiz100(false));
    document.getElementById('quitQuizBtn100').addEventListener('click', attemptToQuitQuiz100);
    document.getElementById('homeFromResultBtn100').addEventListener('click', () => { closePopups100(); history.back(); });
    document.getElementById('previewBtn100').addEventListener('click', startPreviewMode100);
    document.getElementById('clearHistoryBtn100').addEventListener('click', clearAllHistory100);
    
    document.getElementById('retryFetchBtn100').addEventListener('click', () => {
        closePopups100();
        // अगर मास्टर में फेल हुआ तो मास्टर दुबारा लोड करो
        if (document.getElementById('retryFetchBtn100').getAttribute('data-type') === "master") fetchMasterSheet100();
        else fetchSubCSV100(targetMasterItem100);
    });

    // 5 बॉटम टैब्स
    ['navCourses', 'navTests', 'navSaved', 'navHistory', 'navProfile'].forEach(tabId => {
        document.getElementById(tabId).addEventListener('click', () => handleBottomNavClick100(tabId));
    });
}

function handleBottomNavClick100(clickedTabId) {
    if (activeScreenId100 === 'quizScreen100' && !isPreviewMode100 && !isSavedPracticeMode100) {
        showCustomAlert100("परीक्षा के बीच में टैब नहीं बदल सकते।"); return;
    }
    
    activeTabId100 = clickedTabId;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById(clickedTabId).classList.add('active-tab');

    if (clickedTabId === 'navCourses') showScreen100('masterCoursesScreen100', "Courses", false);
    else if (clickedTabId === 'navTests') showScreen100('masterTestsScreen100', "Tests", false);
    else if (clickedTabId === 'navSaved') { openSavedQuestionsScreen100(); showScreen100('savedScreen100', "Saved Questions", false); }
    else if (clickedTabId === 'navHistory') { openHistory100(); showScreen100('historyScreen100', "Your History", false); }
    else if (clickedTabId === 'navProfile') showScreen100('profileScreen100', "My Profile", false);
}

function showScreen100(screenId, forceHeaderTitle = null, isDeepNav = true) {
    let stateData = { screen: screenId, tab: activeTabId100 };
    if (isDeepNav) history.pushState(stateData, "");
    else history.replaceState(stateData, "");
    showScreenUIOnly100(screenId, forceHeaderTitle);
}

function showScreenUIOnly100(screenId, forceHeaderTitle = null) {
    activeScreenId100 = screenId;
    document.querySelectorAll('.screen100').forEach(s => s.classList.remove('active-screen100'));
    document.getElementById(screenId).classList.add('active-screen100');

    let headerElement = document.getElementById('mainHeader100');
    if (forceHeaderTitle) headerElement.innerText = forceHeaderTitle;
    else {
        if (screenId === 'masterCoursesScreen100') headerElement.innerText = "Courses";
        else if (screenId === 'masterTestsScreen100') headerElement.innerText = "Tests";
        else if (screenId === 'topicScreen100') headerElement.innerText = currentCategoryName100;
        else if (screenId === 'subjectScreen100') headerElement.innerText = currentTopic100;
        else if (screenId === 'chapterScreen100') headerElement.innerText = currentSubject100;
        else if (screenId === 'savedScreen100') headerElement.innerText = "Saved Questions";
        else if (screenId === 'historyScreen100') headerElement.innerText = "Your History";
    }
    updateDynamicTopBtn100(screenId);
}

function updateDynamicTopBtn100(screenId) {
    let topBtn = document.getElementById('dynamicTopBtn100');
    // रुट स्क्रीन्स (मेन टैब स्क्रीन्स) पर बैक बटन नहीं दिखेगा
    let rootScreens = ['masterCoursesScreen100', 'masterTestsScreen100', 'savedScreen100', 'historyScreen100', 'profileScreen100', 'loadingScreen100'];
    
    if (rootScreens.includes(screenId)) {
        topBtn.style.display = "none";
    } else {
        topBtn.style.display = "block";
    }
}

function handleDynamicTopBtnClick100() {
    history.back();
}

window.addEventListener('popstate', (event) => {
    let anyOpen = false; document.querySelectorAll('.popup-box100').forEach(p => { if(p.style.display === "flex") anyOpen = true; });
    if (anyOpen) { closePopups100(); history.pushState(event.state || { screen: activeScreenId100, tab: activeTabId100 }, ""); return; }
    
    if (activeScreenId100 === 'quizScreen100' && !isPreviewMode100 && !isSavedPracticeMode100 && !isQuizQuitAuthorized100) {
        if (currentChapterObj100 && currentChapterObj100.entryPwd100 !== "") { 
            history.pushState(event.state || { screen: 'quizScreen100', tab: activeTabId100 }, ""); 
            attemptToQuitQuiz100(); return; 
        }
    }
    
    let state = event.state;
    if (state && state.screen) {
        if (state.tab && state.tab !== activeTabId100) {
            activeTabId100 = state.tab;
            document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active-tab'));
            document.getElementById(activeTabId100).classList.add('active-tab');
        }
        showScreenUIOnly100(state.screen);
    } else {
        showScreenUIOnly100('masterCoursesScreen100');
    }
});

// =====================================================================
// 7. इमेज कंप्रेशन (पुराना)
// =====================================================================
function compressAndSaveImage(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = function(e) {
        const img = new Image(); img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500; const MAX_HEIGHT = 500;
            let width = img.width; let height = img.height;
            if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
            else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
            canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            userProfile100.profilePic = compressedBase64;
            localStorage.setItem('angad_exam_profile', JSON.stringify(userProfile100)); updateProfileUI100();
        };
    };
}

// =====================================================================
// 8. ग्लोबल SAVED QUESTIONS
// =====================================================================
function getSavedQs100() { return JSON.parse(localStorage.getItem('gk_saved_qs_global100') || '[]'); }

function toggleSaveQ100(qObjStr, heartId) {
    if (isPreviewMode100) return; 
    let qObj = JSON.parse(decodeURIComponent(qObjStr)); let savedQs = getSavedQs100(); let heartIcon = document.getElementById(heartId);
    let existingIndex = savedQs.findIndex(q => q.qText100 === qObj.qText100 && q.origTopic100 === qObj.origTopic100);
    if (existingIndex > -1) { savedQs.splice(existingIndex, 1); heartIcon.classList.remove('fa-solid', 'saved100'); heartIcon.classList.add('fa-solid'); } 
    else { savedQs.push(qObj); heartIcon.classList.remove('fa-solid'); heartIcon.classList.add('fa-solid', 'saved100'); }
    localStorage.setItem('gk_saved_qs_global100', JSON.stringify(savedQs));
}
function isQuestionSaved100(qText, topic) { return getSavedQs100().some(q => q.qText100 === qText && q.origTopic100 === topic); }

function openSavedQuestionsScreen100() {
    let savedQs = getSavedQs100();
    const listDiv = document.getElementById('savedListContainer100'); listDiv.innerHTML = "";
    if(savedQs.length === 0) { listDiv.innerHTML = "<p style='text-align:center; color:#94a3b8;'>कोई सवाल सेव नहीं है।</p>"; return; }
    
    let grouped = {}; savedQs.forEach(q => { let path = `[${q.category100 || 'Global'}] ${q.origTopic100} ➡ ${q.origSub100} ➡ ${q.origChap100}`; if(!grouped[path]) grouped[path] = []; grouped[path].push(q); });
    for(let path in grouped) {
        let btn = document.createElement('button'); btn.className = "saved-cat-btn100";
        btn.innerHTML = `<div class="saved-path100">${path}</div><div class="saved-count100">❤️ ${grouped[path].length} Question</div>`;
        btn.onclick = () => startSavedPracticeQuiz100(path, grouped[path]); listDiv.appendChild(btn);
    }
}

/*function startSavedPracticeQuiz100(pathName, questionsArray) {
    isSavedPracticeMode100 = true; isPreviewMode100 = false; quizQuestions100 = questionsArray; userAnswers100 = new Array(quizQuestions100.length).fill(null);
    document.getElementById('marksDisplay100').innerText = "Mode: Saved Practice"; currentChapterObj100 = { time100: 0, marks100: 0, entryPwd100: "", exitPwd100: "" };
    let subBtn = document.getElementById('submitQuizBtn100'); subBtn.innerText = "Submit"; subBtn.style.display = "none"; subBtn.onclick = null; subBtn.style.backgroundColor = ""; 
    buildQuizUI100(); startTimerLogic100(); showScreen100('quizScreen100', "Practice");
}*/
function startSavedPracticeQuiz100(pathName, questionsArray) {
    isSavedPracticeMode100 = true; isPreviewMode100 = false; quizQuestions100 = questionsArray; userAnswers100 = new Array(quizQuestions100.length).fill(null);
    document.getElementById('marksDisplay100').innerText = "Mode: Saved Practice"; currentChapterObj100 = { time100: 0, marks100: 0, entryPwd100: "", exitPwd100: "" };
    
    // बटन को रिसेट करने का नया लॉजिक
    let subBtn = document.getElementById('submitQuizBtn100'); 
    subBtn.innerText = "Submit"; 
    subBtn.style.display = "none"; 
    subBtn.style.backgroundColor = "#10b981"; // वापस हरा रंग सेट करें
    subBtn.onclick = () => forceSubmitQuiz100(false); // onclick का इस्तेमाल
    
    buildQuizUI100(); startTimerLogic100(); showScreen100('quizScreen100', "Practice");
}











// =====================================================================
// 9. क्विज सिस्टम (Chapter level pwd included)
// =====================================================================
function prepareQuiz100(chapter, activeData) {
    currentChapter100 = chapter; currentChapterObj100 = activeData[currentTopic100][currentSubject100][chapter];
    if (currentChapterObj100.entryPwd100 !== "") { document.getElementById('entryPwdInput100').value = ""; document.getElementById('overlay100').style.display = "block"; document.getElementById('entryPwdPopup100').style.display = "flex"; } else startLiveQuiz100();
}
function checkEntryPassword100() { if (document.getElementById('entryPwdInput100').value.trim() === currentChapterObj100.entryPwd100) { closePopups100(); startLiveQuiz100(); } else showCustomAlert100("गलत Password!"); }

/*function startLiveQuiz100() {
    isPreviewMode100 = false; isSavedPracticeMode100 = false; isQuizQuitAuthorized100 = false; 
    quizQuestions100 = currentChapterObj100.questions100; userAnswers100 = new Array(quizQuestions100.length).fill(null); 
    document.getElementById('marksDisplay100').innerText = `प्रति प्रश्न: ${currentChapterObj100.marks100} | पूर्णांक: ${quizQuestions100.length * currentChapterObj100.marks100}`;
    let subBtn = document.getElementById('submitQuizBtn100'); subBtn.innerText = "Submit"; subBtn.style.display = "none"; 
    buildQuizUI100(); startTimerLogic100(); showScreen100('quizScreen100', currentChapter100);
}*/
function startLiveQuiz100() {
    isPreviewMode100 = false; isSavedPracticeMode100 = false; isQuizQuitAuthorized100 = false; 
    quizQuestions100 = currentChapterObj100.questions100; userAnswers100 = new Array(quizQuestions100.length).fill(null); 
    document.getElementById('marksDisplay100').innerText = `प्रति प्रश्न: ${currentChapterObj100.marks100} | पूर्णांक: ${quizQuestions100.length * currentChapterObj100.marks100}`;
    
    // बटन को रिसेट करने का नया लॉजिक
    let subBtn = document.getElementById('submitQuizBtn100'); 
    subBtn.innerText = "Submit"; 
    subBtn.style.display = "none"; 
    subBtn.style.backgroundColor = "#10b981"; // वापस हरा रंग सेट करें
    subBtn.onclick = () => forceSubmitQuiz100(false); // परमानेंट इवेंट की जगह onclick का इस्तेमाल
    
    buildQuizUI100(); startTimerLogic100(); showScreen100('quizScreen100', currentChapter100);
}









function buildQuizUI100() {
    const navBar = document.getElementById('topNavScroll100'); const qContainer = document.getElementById('allQuestionsContainer100');
    navBar.innerHTML = ""; qContainer.innerHTML = "";
    quizQuestions100.forEach((qObj, qIndex) => {
        let navBtn = document.createElement('div'); navBtn.className = "nav-num-btn100"; navBtn.id = `navNum100_${qIndex}`; navBtn.innerText = (qIndex + 1);
        navBtn.addEventListener('click', () => document.getElementById(`qBlock100_${qIndex}`).scrollIntoView({behavior: 'smooth', block: 'center'}));
        navBar.appendChild(navBtn);
        let blockDiv = document.createElement('div'); blockDiv.className = "q-block100"; blockDiv.id = `qBlock100_${qIndex}`;
        let qHeaderRow = document.createElement('div'); qHeaderRow.className = "q-header-row100";
        let qTextElement = document.createElement('div'); qTextElement.className = "q-text100"; qTextElement.innerText = `प्र. ${qIndex + 1}: ${qObj.qText100}`;
        let heartIcon = document.createElement('i'); let heartId = `heart100_${qIndex}`; heartIcon.id = heartId;
        heartIcon.className = isQuestionSaved100(qObj.qText100, qObj.origTopic100) ? "fa-solid fa-heart heart-btn100 saved100" : "fa-solid fa-heart heart-btn100";
        heartIcon.onclick = () => toggleSaveQ100(encodeURIComponent(JSON.stringify(qObj)), heartId);
        qHeaderRow.appendChild(qTextElement); qHeaderRow.appendChild(heartIcon); blockDiv.appendChild(qHeaderRow);
        /*qObj.options100.forEach((optText, optIndex) => {
            let optRow = document.createElement('div'); optRow.className = "opt-row100"; optRow.id = `optRow100_${qIndex}_${optIndex}`;
            optRow.innerHTML = `<div class="opt-circle100" id="circle100_${qIndex}_${optIndex}"><i class="fa-solid fa-check"></i></div><span>${optText}</span>`;
            optRow.addEventListener('click', () => handleOptionClick100(qIndex, optIndex)); blockDiv.appendChild(optRow);
        });*/
        qObj.options100.forEach((optText, optIndex) => {
    let optRow = document.createElement('div'); optRow.className = "opt-row100"; optRow.id = `optRow100_${qIndex}_${optIndex}`;
    
    // नया लॉजिक: optIndex (0, 1, 2, 3) को (A, B, C, D) में बदलने के लिए
    let letter = String.fromCharCode(65 + optIndex); 
    
    optRow.innerHTML = `<div class="opt-circle100" id="circle100_${qIndex}_${optIndex}">${letter}</div><span>${optText}</span>`;
    
    optRow.addEventListener('click', () => handleOptionClick100(qIndex, optIndex)); blockDiv.appendChild(optRow);
});

        
        
        
        
        
        
        
        
        if (qObj.fact100 !== "") { let factDiv = document.createElement('div'); factDiv.className = "fact-box100"; factDiv.id = `factBox100_${qIndex}`; factDiv.innerText = "💡 Fact: " + qObj.fact100; blockDiv.appendChild(factDiv); }
        qContainer.appendChild(blockDiv);
    });
}

function handleOptionClick100(qIndex, optIndex) {
    if (isPreviewMode100) return; 
    for (let i = 0; i < 4; i++) { let row = document.getElementById(`optRow100_${qIndex}_${i}`); if(row) row.classList.remove('selected100'); }
    document.getElementById(`optRow100_${qIndex}_${optIndex}`).classList.add('selected100'); userAnswers100[qIndex] = optIndex;
    document.getElementById(`navNum100_${qIndex}`).classList.add('attempted100');
    if (userAnswers100.every(ans => ans !== null)) document.getElementById('submitQuizBtn100').style.display = "block";
}

function startTimerLogic100() {
    clearInterval(timerInterval100); timeElapsed100 = 0;
    if (currentChapterObj100.time100 > 0) {
        let timeLeft = currentChapterObj100.time100; updateTimerDisplay100(timeLeft, currentChapterObj100.time100);
        timerInterval100 = setInterval(() => {
            timeLeft--; updateTimerDisplay100(timeLeft, currentChapterObj100.time100);
            if (timeLeft <= 0) { clearInterval(timerInterval100); document.getElementById('cancelExitBtn100').style.display = "none"; forceSubmitQuiz100(true); }
        }, 1000);
    } else { updateTimerDisplay100(0, 0); timerInterval100 = setInterval(() => { timeElapsed100++; updateTimerDisplay100(timeElapsed100, 0); }, 1000); }
}
function updateTimerDisplay100(c, t) {
    let f = s => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`.replace(/^00:/, '');
    document.getElementById('timerDisplay100').innerText = t > 0 ? `समय: ${f(c)} / ${f(t)}` : `समय: ${f(c)}`;
}

function attemptToQuitQuiz100() {
    if (isPreviewMode100 || isSavedPracticeMode100) { forceQuitQuiz100(); return; }
    if (currentChapterObj100.entryPwd100 !== "") { document.getElementById('quitAuthInput100').value = ""; document.getElementById('overlay100').style.display = "block"; document.getElementById('quitAuthPopup100').style.display = "flex"; } else forceQuitQuiz100();
}
function verifyQuitAuth100() {
    let typed = document.getElementById('quitAuthInput100').value.replace(/\s+/g, ''); let actualExitPwd = (currentChapterObj100.exitPwd100 !== "") ? currentChapterObj100.exitPwd100.replace(/\s+/g, '') : currentChapterObj100.entryPwd100.replace(/\s+/g, '');
    if (typed === actualExitPwd) { closePopups100(); forceQuitQuiz100(); } else showCustomAlert100("गलत कोड!");
}
function forceQuitQuiz100() { clearInterval(timerInterval100); isQuizQuitAuthorized100 = true; history.back(); }

function forceSubmitQuiz100(isTimeUp = false) {
    if (isSavedPracticeMode100) { clearInterval(timerInterval100); startPreviewMode100(); return; }
    if (!isTimeUp) document.getElementById('cancelExitBtn100').style.display = "block";
    if (currentChapterObj100.exitPwd100 !== "") { document.getElementById('exitPwdInput100').value = ""; document.getElementById('overlay100').style.display = "block"; document.getElementById('exitPwdPopup100').style.display = "flex"; } else { clearInterval(timerInterval100); processResult100(); }
}
function checkExitPassword100() { if (document.getElementById('exitPwdInput100').value.trim() === currentChapterObj100.exitPwd100) { closePopups100(); clearInterval(timerInterval100); processResult100(); } else showCustomAlert100("गलत रिजल्ट कोड!"); }

function processResult100() {
    let attempted = 0, correct = 0, totalQ = quizQuestions100.length;
    quizQuestions100.forEach((qObj, index) => { 
        if (userAnswers100[index] !== null) { 
            attempted++; 
            if (userAnswers100[index] === qObj.answerIndex100) correct++; 
        } 
    });
    let resultObj = {
        id100: Date.now(), date100: new Date().toLocaleString('hi-IN'),
        user100: userProfile100.firstName + " " + userProfile100.lastName, father100: userProfile100.fatherName || "-",
        topic100: currentTopic100, subject100: currentSubject100, chapter100: currentChapter100,
        total100: totalQ, att100: attempted, unatt100: totalQ - attempted, right100: correct, wrong100: attempted - correct,
        max100: totalQ * currentChapterObj100.marks100, obt100: correct * currentChapterObj100.marks100,
        qData100: JSON.parse(JSON.stringify(quizQuestions100)), uAns100: JSON.parse(JSON.stringify(userAnswers100)), marksPerQ100: currentChapterObj100.marks100,
        timeLimitSec100: currentChapterObj100.time100, timeUsed100: timeElapsed100, timeSet100: currentChapterObj100.time100 > 0 ? "Set" : "No Limit", 
        appPassword: "Angad_Secret_91250", category100: currentCategoryName100
    };
    saveToHistory100(resultObj); showResultPopup100(resultObj); document.getElementById('downloadBtn100').onclick = () => generateCanvasCard100(resultObj);
}

// =====================================================================
// 10. ग्लोबल हिस्ट्री
// =====================================================================
function saveToHistory100(rObj) { let hist = JSON.parse(localStorage.getItem('examHistory_global100') || "[]"); hist.push(rObj); localStorage.setItem('examHistory_global100', JSON.stringify(hist)); }

function showResultPopup100(r) { 
    let timeStr = "";
    if (r.timeUsed100 !== undefined) {
        let totalSec = r.timeUsed100; let hrs = Math.floor(totalSec / 3600); let mins = Math.floor((totalSec % 3600) / 60); let secs = totalSec % 60;
        let parts = []; if (hrs > 0) parts.push(`${hrs} Hr`); if (mins > 0 || hrs > 0) parts.push(`${mins} Min`); parts.push(`${secs} Sec`); timeStr = parts.join(' ');
    } else { timeStr = "N/A"; }

    document.getElementById('resultStats100').innerHTML = `
        <div style="text-align: left; padding: 0 5px;">
            <p><b>👤 नाम:</b> ${r.user100}</p>
            <p><b>🏢 Category:</b> ${r.category100 || 'Global'}</p>
            <hr style="border-color:#334155; margin: 8px 0;">
            <p style="color:#0ea5e9;"><b>🎯 Class:</b> ${r.topic100}</p>
            <p style="color:#38bdf8;"><b>📚 Subject:</b> ${r.subject100}</p>
            <p style="color:#7dd3fc;"><b>📖 Chapter:</b> ${r.chapter100}</p>
            <hr style="border-color:#334155; margin: 8px 0;">
            <p><b>⏱️ Use Time:</b> ${timeStr}</p>
            <p><b>📝 कुल प्रश्न:</b> ${r.total100}</p>
            <p><b>✅ सही जवाब:</b> <span style="color:#10b981; font-weight:bold;">${r.right100}</span></p>
            <p><b>❌ गलत जवाब:</b> <span style="color:#ef4444; font-weight:bold;">${r.wrong100}</span></p>
            <p><b>⚠️ छोड़े गए:</b> ${r.unatt100}</p>
            <hr style="border-color:#334155; margin: 10px 0;">
            <p style="font-size: 1.4rem; text-align:center; color:#f59e0b; margin-top:5px;"><b>🏆 स्कोर: ${r.obt100} / ${r.max100}</b></p>
        </div>`; 
    document.getElementById('overlay100').style.display = "block"; document.getElementById('resultPopup100').style.display = "flex";
}

function startPreviewMode100() {
    closePopups100(); isPreviewMode100 = true; let btn = document.getElementById('submitQuizBtn100'); btn.innerText = "Close"; btn.style.display = "none"; btn.style.backgroundColor = "#475569"; btn.onclick = () => history.back(); 
    quizQuestions100.forEach((qObj, qIndex) => {
        for (let i = 0; i < 4; i++) {
            let row = document.getElementById(`optRow100_${qIndex}_${i}`); if(!row) continue; row.classList.remove('selected100');
            if (i === qObj.answerIndex100) row.classList.add('correct-preview100'); else if (i === userAnswers100[qIndex]) row.classList.add('wrong-preview100');
        }
        let fBox = document.getElementById(`factBox100_${qIndex}`); if(fBox && qObj.fact100 !== "") fBox.style.display = "block";
    });
}










function openHistory100() {
    let hist = JSON.parse(localStorage.getItem('examHistory_global100') || "[]");
    let container = document.getElementById('historyList100'); container.innerHTML = "";
    if (hist.length === 0) container.innerHTML = `<p style='text-align:center; color:#94a3b8;'>कोई हिस्ट्री नहीं है।</p>`;
    else {
        hist.slice().reverse().forEach((r) => {
            let card = document.createElement('div'); card.className = "history-card100";
            card.innerHTML = `<p style="color:#94a3b8; font-size:0.8rem;">[${r.category100 || 'Global'}]</p><p style="color:#38bdf8; font-weight:bold;">${r.subject100} - ${r.chapter100}</p><p>${r.date100}</p><p style="color:#f59e0b;">स्कोर: ${r.obt100} / ${r.max100}</p>
            <div class="history-btn-row100">
                <button class="hist-small-btn100 hist-prev-btn100" onclick="previewFromHistory100(${r.id100})"><i class="fa-solid fa-eye"></i> View</button>
                <button class="hist-small-btn100 hist-down-btn100" onclick="downloadFromHistory100(${r.id100})"><i class="fa-solid fa-download"></i> Card</button>
                <button class="hist-small-btn100 hist-del-btn100" onclick="deleteSingleHistory100(${r.id100})"><i class="fa-solid fa-trash"></i> Del</button>
            </div>`;
            container.appendChild(card);
        });
    }
}

function deleteSingleHistory100(id) { let hist = JSON.parse(localStorage.getItem('examHistory_global100') || "[]").filter(r => r.id100 !== id); localStorage.setItem('examHistory_global100', JSON.stringify(hist)); openHistory100(); }
function clearAllHistory100() { localStorage.removeItem('examHistory_global100'); openHistory100(); showCustomAlert100("पूरी हिस्ट्री डिलीट कर दी गई है।"); }

function previewFromHistory100(id) {
    let r = JSON.parse(localStorage.getItem('examHistory_global100') || "[]").find(i => i.id100 === id); if(!r) return;
    isPreviewMode100 = true; isSavedPracticeMode100 = false; quizQuestions100 = r.qData100; userAnswers100 = r.uAns100;
    buildQuizUI100(); showScreen100('quizScreen100', r.chapter100 + " (History)"); document.getElementById('marksDisplay100').innerText = `प्राप्तांक: ${r.obt100} / ${r.max100}`;
    let btn = document.getElementById('submitQuizBtn100'); btn.innerText = "History"; btn.style.display = "block"; btn.style.backgroundColor = "#475569"; btn.onclick = () => history.back(); 
    startPreviewMode100();
}
function downloadFromHistory100(id) { let r = JSON.parse(localStorage.getItem('examHistory_global100') || "[]").find(i => i.id100 === id); if(r) generateCanvasCard100(r); }

// =====================================================================
// 11. रिजल्ट कार्ड डाउनलोड (पुराना)
// =====================================================================
/*function generateCanvasCard100(r) {
    showCustomAlert100("आपका रिजल्ट कार्ड तैयार हो रहा है...");
    function formatTimeSec(s) { if (!s || s <= 0) return "0 Sec"; let hrs = Math.floor(s / 3600); let m = Math.floor((s % 3600) / 60); let sec = s % 60; let parts = []; if (hrs > 0) parts.push(`${hrs} Hr`); if (m > 0 || hrs > 0) parts.push(`${m} Min`); parts.push(`${sec} Sec`); return parts.join(' '); }
    let totalTimeTxt = (r.timeLimitSec100 && r.timeLimitSec100 > 0) ? formatTimeSec(r.timeLimitSec100) : "No Limit"; let usedTimeTxt = (r.timeUsed100 !== undefined) ? formatTimeSec(r.timeUsed100) : "N/A";
    let cvs = document.createElement('canvas'); cvs.width = 1240; cvs.height = 1754; let ctx = cvs.getContext('2d');
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cvs.width, cvs.height); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 15; ctx.strokeRect(30, 30, cvs.width - 60, cvs.height - 60); ctx.fillStyle = "#1e293b"; ctx.fillRect(30, 30, cvs.width - 60, 340);
    ctx.fillStyle = "#f59e0b"; ctx.textAlign = "center"; ctx.font = "bold 80px sans-serif"; ctx.fillText("ANGAD LEARNING", cvs.width/2, 140); ctx.font = "bold 60px sans-serif"; ctx.fillText("& EDUCATION CENTER", cvs.width/2, 225); ctx.fillStyle = "#ffffff"; ctx.font = "bold 45px sans-serif"; ctx.fillText("EXAM RESULT", cvs.width/2, 340);
    ctx.fillStyle = "#0f172a"; ctx.textAlign = "left"; let startY = 440; let lg = 70; ctx.font = "bold 45px sans-serif";
    ctx.fillText(`Date: ${r.date100}`, 80, startY); startY+=lg; ctx.fillText(`Name: ${r.user100}`, 80, startY); startY+=lg; ctx.fillText(`Father: ${r.father100}`, 80, startY); startY+=lg; startY+=40;
    ctx.fillStyle = "#0ea5e9"; ctx.fillText(`Class: ${r.topic100}`, 80, startY); startY+=lg; ctx.fillText(`Subject: ${r.subject100}`, 80, startY); startY+=lg; ctx.fillText(`Chapter: ${r.chapter100}`, 80, startY); startY+=lg; startY+=20;
    ctx.fillStyle = "#d97706"; ctx.fillText(`Total Time: ${totalTimeTxt}`, 80, startY); startY+=lg; ctx.fillText(`Time Used: ${usedTimeTxt}`, 80, startY); startY+=lg; startY+=40;
    ctx.fillStyle = "#0f172a"; ctx.fillText(`Total Qs: ${r.total100}  |  Attempted: ${r.att100}`, 80, startY); startY+=lg; ctx.fillStyle = "#10b981"; ctx.fillText(`Correct: ${r.right100}`, 80, startY); startY+=lg; ctx.fillStyle = "#ef4444"; ctx.fillText(`Wrong: ${r.wrong100}`, 80, startY); startY+=lg+60;
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(80, startY, cvs.width-160, 200); ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 5; ctx.strokeRect(80, startY, cvs.width-160, 200); ctx.fillStyle = "#1e293b"; ctx.textAlign = "center"; ctx.font = "bold 70px sans-serif"; ctx.fillText(`SCORE: ${r.obt100} / ${r.max100}`, cvs.width/2, startY+130);
    ctx.fillStyle = "rgba(15, 23, 42, 0.2)"; ctx.font = "bold 50px sans-serif"; ctx.fillText("Powered by: Angad Labs", cvs.width/2, 1700); 
    let sigImg = new Image(); sigImg.src = "signature.png"; sigImg.onload = function() { ctx.drawImage(sigImg, 850, 1100, 250, 250); triggerDownload(); };
    setTimeout(() => { triggerDownload(); }, 1500); 
    let downloaded = false; function triggerDownload() { if(downloaded) return; downloaded = true; let link = document.createElement('a'); link.download = `${r.user100}_Result.jpg`; link.href = cvs.toDataURL("image/jpeg", 1.0); link.click(); closeCustomAlert100(); }
}*/
// =====================================================================
// 11. रिजल्ट कार्ड डाउनलोड (प्रीमियम प्रेजेंटेशन, फुल स्पेलिंग और परफेक्ट स्पेसिंग के साथ)
// =====================================================================
function generateCanvasCard100(r) {
    showCustomAlert100("आपका रिजल्ट कार्ड तैयार हो रहा है...");
    
    function formatTimeSec(s) { if (!s || s <= 0) return "0 Sec"; let hrs = Math.floor(s / 3600); let m = Math.floor((s % 3600) / 60); let sec = s % 60; let parts = []; if (hrs > 0) parts.push(`${hrs} Hr`); if (m > 0 || hrs > 0) parts.push(`${m} Min`); parts.push(`${sec} Sec`); return parts.join(' '); }
    
    let totalTimeTxt = (r.timeLimitSec100 && r.timeLimitSec100 > 0) ? formatTimeSec(r.timeLimitSec100) : "No Limit"; 
    let usedTimeTxt = (r.timeUsed100 !== undefined) ? formatTimeSec(r.timeUsed100) : "N/A";
    
    let cvs = document.createElement('canvas'); cvs.width = 1240; cvs.height = 1754; let ctx = cvs.getContext('2d');
    
    // बैकग्राउंड और शानदार आउटर बॉर्डर
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cvs.width, cvs.height); 
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 18; ctx.strokeRect(30, 30, cvs.width - 60, cvs.height - 60); 
    
    // प्रेजेंटेशन लुक के लिए एक पतला इनर (Inner) बॉर्डर
    ctx.strokeStyle = "#0ea5e9"; ctx.lineWidth = 4; ctx.strokeRect(44, 44, cvs.width - 88, cvs.height - 88);
    
    ctx.fillStyle = "#1e293b"; ctx.fillRect(30, 30, cvs.width - 60, 340);
    
    // हेडर
    ctx.fillStyle = "#f59e0b"; ctx.textAlign = "center"; ctx.font = "bold 80px sans-serif"; ctx.fillText("ANGAD LEARNING", cvs.width/2, 140); 
    ctx.font = "bold 60px sans-serif"; ctx.fillText("& EDUCATION CENTER", cvs.width/2, 225); 
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 45px sans-serif"; ctx.fillText("EXAM RESULT", cvs.width/2, 340);
    
    // छात्र की जानकारी (स्पेसिंग/गैप बढ़ाकर 70 किया गया है)
    ctx.fillStyle = "#0f172a"; ctx.textAlign = "left"; 
    let startY = 420; let lg = 70; // lg (Line Gap) बढ़ाकर 70 कर दिया गया है
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(`Date: ${r.date100}`, 80, startY); startY+=lg; 
    ctx.fillText(`Name: ${r.user100}`, 80, startY); startY+=lg; 
    ctx.fillText(`Father: ${r.father100}`, 80, startY); startY+=lg + 20; // सेक्शन के बाद एक्स्ट्रा गैप
    
    // विषय की जानकारी 
    ctx.fillStyle = "#0ea5e9"; 
    ctx.fillText(`Category: ${r.category100 || 'Global'}`, 80, startY); startY+=lg; 
    ctx.fillText(`Class: ${r.topic100}`, 80, startY); startY+=lg; 
    ctx.fillText(`Subject: ${r.subject100}`, 80, startY); startY+=lg; 
    ctx.fillText(`Chapter: ${r.chapter100}`, 80, startY); startY+=lg + 20; 
    
    // समय की जानकारी
    ctx.fillStyle = "#d97706"; 
    ctx.fillText(`Total Time: ${totalTimeTxt}`, 80, startY); startY+=lg; 
    ctx.fillText(`Time Used: ${usedTimeTxt}`, 80, startY); startY+=lg + 20; 
    
    // रिजल्ट स्कोर डेटा (Total Questions और Attempted अब अलग-अलग लाइनों में हैं)
    ctx.fillStyle = "#0f172a"; 
    ctx.fillText(`Total Questions: ${r.total100}`, 80, startY); startY+=lg; // पूरा नाम लिखा गया है
    ctx.fillText(`Attempted: ${r.att100}`, 80, startY); startY+=lg; // नई लाइन में किया गया है
    
    ctx.fillStyle = "#10b981"; ctx.fillText(`Correct: ${r.right100}`, 80, startY); startY+=lg; 
    ctx.fillStyle = "#ef4444"; ctx.fillText(`Wrong: ${r.wrong100}`, 80, startY); startY+=lg + 10;
    
    // स्कोर बॉक्स
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(80, startY, cvs.width-160, 200); 
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 6; ctx.strokeRect(80, startY, cvs.width-160, 200); 
    ctx.fillStyle = "#1e293b"; ctx.textAlign = "center"; ctx.font = "bold 75px sans-serif"; 
    ctx.fillText(`SCORE: ${r.obt100} / ${r.max100}`, cvs.width/2, startY+135);
    
    // वाटरमार्क
    ctx.fillStyle = "rgba(15, 23, 42, 0.2)"; ctx.font = "bold 50px sans-serif"; ctx.fillText("Powered by: Angad Labs", cvs.width/2, 1680); 
    
    // मुहर (Signature) - लाइन्स बढ़ने के कारण Y पोजीशन को 1350 पर सेट किया गया है
    let sigImg = new Image(); 
    sigImg.src = "https://cdn.jsdelivr.net/gh/Angadlabs/ExamSathiR@main/signature.png"; 
    sigImg.onload = function() { 
        ctx.drawImage(sigImg, 850, 1150, 250, 250); 
        triggerDownload(); 
    };
    
    setTimeout(() => { triggerDownload(); }, 1500); 
    
    let downloaded = false; 
    function triggerDownload() { 
        if(downloaded) return; downloaded = true; 
        let link = document.createElement('a'); 
        link.download = `${r.user100}_Result.jpg`; 
        link.href = cvs.toDataURL("image/jpeg", 1.0); 
        link.click(); 
        closeCustomAlert100(); 
    }
}














// =====================================================================
// 12. पॉपअप क्लोज लॉजिक
// =====================================================================
function closePopups100() { document.getElementById('overlay100').style.display = "none"; document.querySelectorAll('.popup-box100').forEach(p => { if (p.id !== 'onboardingPopup100') p.style.display = "none"; }); }
function showCustomAlert100(msg) { document.getElementById('customAlertMessage100').innerText = msg; document.getElementById('overlay100').style.display = "block"; document.getElementById('customAlertPopup100').style.display = "flex"; }
function showRetryPopup100(type="master") { document.getElementById('retryFetchBtn100').setAttribute('data-type', type); document.getElementById('overlay100').style.display = "block"; document.getElementById('retryPopup100').style.display = "flex"; }
function closeCustomAlert100() { document.getElementById('customAlertPopup100').style.display = "none"; if(!document.querySelector('.popup-box100[style*="flex"]:not(#customAlertPopup100)')) document.getElementById('overlay100').style.display = "none"; }

// =====================================================================
// 13. HOME PAGE NOTICE (पुराना)
// =====================================================================
function extractAndShowHomeMessage100(parsedRows) {
    if (parsedRows.length > 1 && parsedRows[1].length > 7) {
        let noticeMessage = parsedRows[1][7] ? String(parsedRows[1][7]).trim() : "";
        if (noticeMessage !== "") showHomeMessagePopup100(noticeMessage);
    }
}
function showHomeMessagePopup100(rawMessage) {
    let formattedMessage = rawMessage.replace(/\[\[(.*?)\]\]/g, '<a href="$1" target="_blank">$1</a>').replace(/\n/g, '<br>');
    document.getElementById('homeMessageContent100').innerHTML = formattedMessage;
    document.getElementById('overlay100').style.display = "block"; document.getElementById('homeMessagePopup100').style.display = "flex";
}
window.addEventListener('DOMContentLoaded', () => {
    let closeMsgBtn = document.getElementById('closeHomeMsgBtn100');
    if (closeMsgBtn) closeMsgBtn.addEventListener('click', () => { document.getElementById('homeMessagePopup100').style.display = "none"; let anyOtherPopupOpen = document.querySelector('.popup-box100[style*="flex"]:not(#homeMessagePopup100)'); if (!anyOtherPopupOpen) document.getElementById('overlay100').style.display = "none"; });
});

// =====================================================================
// 14. CLICK SOUND & LIGHT MODE (पुराना)
// =====================================================================
let audioCtx100; let currentOsc100 = null; let isSoundEnabled100 = false;
function playClickSound100() {
    if (!isSoundEnabled100) return;
    if (!audioCtx100) audioCtx100 = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx100.state === 'suspended') audioCtx100.resume();
    if (currentOsc100) try { currentOsc100.stop(); } catch(e) {}
    let osc = audioCtx100.createOscillator(); let gainNode = audioCtx100.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx100.currentTime); osc.frequency.exponentialRampToValueAtTime(100, audioCtx100.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.3, audioCtx100.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx100.currentTime + 0.05);
    osc.connect(gainNode); gainNode.connect(audioCtx100.destination); osc.start(); osc.stop(audioCtx100.currentTime + 0.05); currentOsc100 = osc; 
}
document.addEventListener('click', (e) => { playClickSound100(); });
window.addEventListener('DOMContentLoaded', () => {
    let soundToggle = document.getElementById('soundToggle100'); let lightToggle = document.getElementById('lightModeToggle100');
    let savedSound = localStorage.getItem('angad_sound_pref') === 'true'; let savedLight = localStorage.getItem('angad_light_pref') === 'true';
    isSoundEnabled100 = savedSound; if (soundToggle) soundToggle.checked = savedSound;
    if (savedLight) { document.body.classList.add('light-mode100'); if (lightToggle) lightToggle.checked = true; }
    if (soundToggle) soundToggle.addEventListener('change', (e) => { isSoundEnabled100 = e.target.checked; localStorage.setItem('angad_sound_pref', isSoundEnabled100); if(isSoundEnabled100) playClickSound100(); });
    if (lightToggle) lightToggle.addEventListener('change', (e) => { if (e.target.checked) { document.body.classList.add('light-mode100'); localStorage.setItem('angad_light_pref', 'true'); } else { document.body.classList.remove('light-mode100'); localStorage.setItem('angad_light_pref', 'false'); } });
});
