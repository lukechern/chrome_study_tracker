import { Storage_7ree } from './storage_7ree.js';
import { renderCalendar_7ree } from './calendar_7ree.js';
import { showTooltip, hideTooltip } from './utils_7ree.js';

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl_7ree = document.getElementById('calendar_7ree');
    const projectsEl_7ree = document.getElementById('projects_7ree');
    const currentDateEl_7ree = document.getElementById('current_date_7ree');
    
    const themeToggleBtn = document.getElementById('theme_toggle_7ree');

    // Set i18n for document title
    document.title = chrome.i18n.getMessage('learningCalendar');

    // Set the title of the sidebar
    document.querySelector('.header_7ree h2').textContent = chrome.i18n.getMessage('learningCalendar');

    // Function to apply theme
    function applyTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${theme}-mode`);
        themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙';
    }

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme_7ree') || 'light';
    applyTheme(savedTheme);

    // Theme toggle event listener
    themeToggleBtn.addEventListener('click', () => {
        let currentTheme = localStorage.getItem('theme_7ree') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme_7ree', newTheme);
        applyTheme(newTheme);
    });
    themeToggleBtn.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, chrome.i18n.getMessage('toggleTheme')));
    themeToggleBtn.addEventListener('mouseout', hideTooltip);

    // Event listener for open_config_7ree button
    document.getElementById('open_config_7ree').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('config_7ree.html') });
    });
    document.getElementById('open_config_7ree').addEventListener('mouseover', (e) => showTooltip(e.currentTarget, chrome.i18n.getMessage('settings')));
    document.getElementById('open_config_7ree').addEventListener('mouseout', hideTooltip);

    function handlePunchIn(e) {
        if (e.target && e.target.classList.contains('punch-btn_7ree')) {
            const button = e.target;
            const url = button.dataset.url;
            const projectId = button.dataset.id;

            if (url) {
                chrome.tabs.create({ url: url });
            }
            Storage_7ree.logStudy_7ree(projectId);

            // 重新渲染以反映更新
            renderAll();
        }
    }

    function renderProjects_7ree() {
        const projects = Storage_7ree.getProjects_7ree();
        const logs = Storage_7ree.getLogs_7ree();
        projectsEl_7ree.innerHTML = '';

        if (projects.length === 0) {
            projectsEl_7ree.innerHTML = `<p class="empty-state_7ree">${chrome.i18n.getMessage('noLearningProjects')}</p>`;
            return;
        }

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // YYYY-MM-DD (Local Time)

        // Sort projects: unpunched first, then punched
        projects.sort((a, b) => {
            const logA = logs[today] ? (Array.isArray(logs[today][a.id]) ? logs[today][a.id].length > 0 : logs[today][a.id] > 0) : false;
            const logB = logs[today] ? (Array.isArray(logs[today][b.id]) ? logs[today][b.id].length > 0 : logs[today][b.id] > 0) : false;

            if (logA && !logB) return 1; // A is punched, B is not, A goes after B
            if (!logA && logB) return -1; // A is not punched, B is, A goes before B
            return 0; // Maintain original order if both are same status
        });

        projects.forEach((p) => {
            const logsForProject = logs[today] || {};
            let isPunched = false;
            if (Array.isArray(logsForProject[p.id])) {
                isPunched = logsForProject[p.id].length > 0;
            } else if (typeof logsForProject[p.id] === 'number') {
                isPunched = logsForProject[p.id] > 0;
            }

            let totalDays = 0;
            for (const date in logs) {
                const dailyLog = logs[date][p.id];
                if (Array.isArray(dailyLog)) {
                    if (dailyLog.length > 0) {
                        totalDays++;
                    }
                } else if (typeof dailyLog === 'number') {
                    if (dailyLog > 0) {
                        totalDays++;
                    }
                }
            }

            const card = document.createElement('div');
            card.className = 'project-card_7ree' + (isPunched ? ' punched-in_7ree' : '');

            card.innerHTML = `
                <div class="project-info_7ree">
                    <h3 data-desc="${p.desc}">${p.name}</h3>
                    <p class="study-days_7ree">${chrome.i18n.getMessage('totalPunchedIn', [totalDays])}</p>
                </div>
                <button class="punch-btn_7ree ${isPunched ? 'punched-in_7ree' : ''}" data-id="${p.id}" data-url="${p.url}" ${isPunched ? 'disabled' : ''}>
                    ${isPunched ? chrome.i18n.getMessage('punchedInToday') : chrome.i18n.getMessage('punchIn')}
                </button>
            `;
            projectsEl_7ree.appendChild(card);

            // Add tooltip to project title
            const projectTitle = card.querySelector('h3');
            if (projectTitle) {
                projectTitle.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, e.currentTarget.dataset.desc));
                projectTitle.addEventListener('mouseout', hideTooltip);
                projectTitle.style.cursor = 'pointer'; // Add pointer cursor to indicate clickability
                projectTitle.addEventListener('click', () => {
                    const projectUrl = p.url;
                    const projectId = p.id;
                    const currentLogs = Storage_7ree.getLogs_7ree();
                    const today = new Date().toISOString().slice(0, 10);
                    const isPunchedToday = currentLogs[today] && currentLogs[today][projectId];

                    if (!isPunchedToday) {
                        Storage_7ree.logStudy_7ree(projectId);
                        renderAll(); // Re-render to update UI and sort order
                    }

                    if (projectUrl) {
                        chrome.tabs.create({ url: projectUrl });
                    }
                });
            }
        });
    }

    function renderAll() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        currentDateEl_7ree.textContent = `${year}-${month}-${day}`;

        renderCalendar_7ree(calendarEl_7ree, now.getFullYear(), now.getMonth());
        renderProjects_7ree();
    }

    // 初始渲染
    renderAll();

    projectsEl_7ree.addEventListener('click', handlePunchIn);

    // 监听存储变化以自动更新UI
    window.addEventListener('storage', (e) => {
        if (e.key === 'projects_7ree' || e.key === 'study_logs_7ree') {
            renderAll();
        }
    });
});
