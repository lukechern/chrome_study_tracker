import { Storage_7ree } from './storage_7ree.js';
import { renderCalendar_7ree } from './calendar_7ree.js';
import { showTooltip, hideTooltip } from './utils_7ree.js';

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl_7ree = document.getElementById('calendar_7ree');
    const projectsEl_7ree = document.getElementById('projects_7ree');
    const themeToggleBtn = document.getElementById('theme_toggle_7ree');

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
    themeToggleBtn.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, '切换主题'));
    themeToggleBtn.addEventListener('mouseout', hideTooltip);

    // Event listener for open_config_7ree button
    document.getElementById('open_config_7ree').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('config_7ree.html') });
    });
    document.getElementById('open_config_7ree').addEventListener('mouseover', (e) => showTooltip(e.currentTarget, '设置'));
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
            projectsEl_7ree.innerHTML = `<p class="empty-state_7ree">暂无学习项目。点击⚙️图标添加一个！</p>`;
            return;
        }

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Sort projects: unpunched first, then punched
        projects.sort((a, b) => {
            const isAPunched = logs[today] && logs[today][a.id];
            const isBPunched = logs[today] && logs[today][b.id];
            if (isAPunched && !isBPunched) return 1; // A is punched, B is not, A goes after B
            if (!isAPunched && isBPunched) return -1; // A is not punched, B is, A goes before B
            return 0; // Maintain original order if both are same status
        });

        projects.forEach((p) => {
            const logsForProject = logs[today] || {};
            const isPunched = logsForProject[p.id]; // Check if punched today
            const totalDays = Object.keys(logs).filter(date => logs[date][p.id]).length;

            const card = document.createElement('div');
            card.className = 'project-card_7ree' + (isPunched ? ' punched-in_7ree' : '');

            card.innerHTML = `
                <div class="project-info_7ree">
                    <h3 data-desc="${p.desc}">${p.name}</h3>
                    <p class="study-days_7ree">已打卡 ${totalDays} 天</p>
                </div>
                <button class="punch-btn_7ree ${isPunched ? 'punched-in_7ree' : ''}" data-id="${p.id}" data-url="${p.url}" ${isPunched ? 'disabled' : ''}>
                    ${isPunched ? '已打卡' : '打卡'}
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
        renderCalendar_7ree(calendarEl_7ree, new Date().getFullYear(), new Date().getMonth());
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
