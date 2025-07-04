import { Storage_7ree } from './storage_7ree.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form_7ree');
    const projectIdInput = document.getElementById('project-id_7ree');
    const projectNameInput = document.getElementById('project-name_7ree');
    const projectUrlInput = document.getElementById('project-url_7ree');
    const projectDescInput = document.getElementById('project-desc_7ree');
    const projectListDiv = document.getElementById('project-list_7ree');
    const logListDiv = document.getElementById('log-list_7ree');
    const formTitle = document.getElementById('form-title');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    const customConfirmDialog = document.getElementById('custom-confirm-dialog');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    // Set i18n for document title
    document.title = chrome.i18n.getMessage('configTitle');

    // Set i18n text content for various elements
    document.querySelector('h1').textContent = chrome.i18n.getMessage('manageProjects');
    document.querySelector('button[data-tab="add-project"]').textContent = chrome.i18n.getMessage('addProject');
    document.querySelector('button[data-tab="list-projects"]').textContent = chrome.i18n.getMessage('existingProjects');
    document.querySelector('button[data-tab="view-data"]').textContent = chrome.i18n.getMessage('punchData');
    document.getElementById('form-title').textContent = chrome.i18n.getMessage('addProject');
    document.querySelector('label[for="project-name_7ree"]').textContent = chrome.i18n.getMessage('projectName');
    document.querySelector('label[for="project-url_7ree"]').textContent = chrome.i18n.getMessage('projectURL');
    document.querySelector('label[for="project-desc_7ree"]').textContent = chrome.i18n.getMessage('projectDesc');
    document.querySelector('button[type="submit"]').textContent = chrome.i18n.getMessage('saveProject');
    document.querySelector('#list-projects-tab h2').textContent = chrome.i18n.getMessage('existingProjects');
    document.querySelector('#view-data-tab h2').textContent = chrome.i18n.getMessage('punchData');
    document.getElementById('confirm-yes').textContent = chrome.i18n.getMessage('confirm');
    document.getElementById('confirm-no').textContent = chrome.i18n.getMessage('cancel');

    let projects = Storage_7ree.getProjects_7ree();

    function showTab(tabId) {
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        document.getElementById(tabId).style.display = 'block';
        document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`).classList.add('active');

        if (tabId === 'list-projects-tab') {
            projects = Storage_7ree.getProjects_7ree(); // Re-fetch projects
            renderProjectList(); // Re-render the list
        } else if (tabId === 'view-data-tab') {
            renderLogList();
        }
    }

    function showConfirmDialog(message, onConfirm) {
        confirmMessage.textContent = message;
        customConfirmDialog.style.display = 'flex';

        const handleConfirm = () => {
            onConfirm(true);
            customConfirmDialog.style.display = 'none';
            confirmYesBtn.removeEventListener('click', handleConfirm);
            confirmNoBtn.removeEventListener('click', handleCancel);
        };

        const handleCancel = () => {
            onConfirm(false);
            customConfirmDialog.style.display = 'none';
            confirmYesBtn.removeEventListener('click', handleConfirm);
            confirmNoBtn.removeEventListener('click', handleCancel);
        };

        confirmYesBtn.addEventListener('click', handleConfirm);
        confirmNoBtn.addEventListener('click', handleCancel);
    }

    function renderProjectList() {
        projectListDiv.innerHTML = '';
        if (projects.length === 0) {
            projectListDiv.innerHTML = `<p>${chrome.i18n.getMessage('noProjects')}</p>`;
            return;
        }
        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-list-item';
            item.innerHTML = `
                <div>
                    <strong>${project.name}</strong><br>
                    <small>${project.url}</small><br>
                    <small class="project-summary">${project.desc}</small>
                </div>
                <div>
                    <button class="edit-btn" data-id="${project.id}">${chrome.i18n.getMessage('edit')}</button>
                    <button class="delete-btn" data-id="${project.id}">${chrome.i18n.getMessage('delete')}</button>
                </div>
            `;
            projectListDiv.appendChild(item);
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const id = projectIdInput.value;
        const projectData = {
            name: projectNameInput.value,
            url: projectUrlInput.value,
            desc: projectDescInput.value,
        };

        if (id) { // 编辑现有项目
            const index = projects.findIndex(p => p.id == id);
            projects[index] = { ...projects[index], ...projectData, id: projects[index].id };
        } else { // 添加新项目
            projectData.id = new Date().getTime(); // 简单的唯一ID
            projects.push(projectData);
        }

        Storage_7ree.saveProjects_7ree(projects);
        resetForm();
        renderProjectList();
        showTab('list-projects-tab'); // 保存后切换到现有项目列表
    }

    function handleListClick(e) {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            const projectToDelete = projects.find(p => p.id == id);
            if (projectToDelete) {
                showConfirmDialog(chrome.i18n.getMessage('confirmDeleteProject', [projectToDelete.name]), (confirmed) => {
                if (confirmed) {
                    projects = projects.filter(p => p.id != id);
                    Storage_7ree.saveProjects_7ree(projects);
                    renderProjectList();
                }
            });
            }
        } else if (target.classList.contains('edit-btn')) {
            const project = projects.find(p => p.id == id);
            projectIdInput.value = project.id;
            projectNameInput.value = project.name;
            projectUrlInput.value = project.url;
            projectDescInput.value = project.desc;
            formTitle.textContent = chrome.i18n.getMessage('editProject');
            document.querySelector('.tab-button[data-tab="add-project"]').textContent = chrome.i18n.getMessage('editProject');
            showTab('add-project-tab'); // 编辑时切换到添加项目Tab
            window.scrollTo(0, 0);
        }
    }

    function resetForm() {
        projectForm.reset();
        projectIdInput.value = '';
        formTitle.textContent = chrome.i18n.getMessage('addProject');
        document.querySelector('.tab-button[data-tab="add-project"]').textContent = chrome.i18n.getMessage('addProject');
    }

    function renderLogList() {
        logListDiv.innerHTML = '';
        const logs = Storage_7ree.getLogs_7ree();
        const projectsData = Storage_7ree.getProjects_7ree();

        let logItems = [];
        for (const date in logs) {
            for (const projectId in logs[date]) {
                const project = projectsData.find(p => p.id == projectId);
                const projectPunches = logs[date][projectId];

                if (Array.isArray(projectPunches)) {
                    projectPunches.forEach((time, index) => {
                        logItems.push({
                            date: date,
                            projectId: projectId,
                            time: time,
                            projectName: project ? project.name : chrome.i18n.getMessage('unknownProject'),
                            originalIndex: index // Store original index for deletion
                        });
                    });
                } else if (typeof projectPunches === 'number') { // Handle old format
                    for (let i = 0; i < projectPunches; i++) {
                        logItems.push({
                            date: date,
                            projectId: projectId,
                            time: chrome.i18n.getMessage('oldFormat'),
                            projectName: project ? project.name : chrome.i18n.getMessage('unknownProject'),
                            originalIndex: i // Store original index for deletion
                        });
                    }
                }
            }
        }

        if (logItems.length === 0) {
            logListDiv.innerHTML = `<p>${chrome.i18n.getMessage('noPunchData')}</p>`;
            return;
        }

        // Sort logs by date and time
        logItems.sort((a, b) => {
            const dateTimeA = `${a.date} ${a.time}`;
            const dateTimeB = `${b.date} ${b.time}`;
            return dateTimeA.localeCompare(dateTimeB);
        });

        logItems.forEach(log => {
            const item = document.createElement('div');
            item.className = 'log-list-item';
            item.innerHTML = `
                <span>${log.date} ${log.time} - ${log.projectName}</span>
                <button class="delete-log-btn" data-date="${log.date}" data-project-id="${log.projectId}" data-time="${log.time}" data-original-index="${log.originalIndex}">${chrome.i18n.getMessage('delete')}</button>
            `;
            logListDiv.appendChild(item);
        });
    }

    function handleDeleteLog(e) {
        const target = e.target;
        if (target.classList.contains('delete-log-btn')) {
            const projectsData = Storage_7ree.getProjects_7ree();
            const projectIdToDelete = target.dataset.projectId;
            const project = projectsData.find(p => p.id == projectIdToDelete);
            const projectName = project ? project.name : chrome.i18n.getMessage('unknownProject');

            const dateToDelete = target.dataset.date;
            const timeToDelete = target.dataset.time;
            const originalIndexToDelete = parseInt(target.dataset.originalIndex);

            const logInfo = `${dateToDelete} ${timeToDelete} - ${projectName}`;
            showConfirmDialog(chrome.i18n.getMessage('confirmDeleteLog', [logInfo]), (confirmed) => {
                if (confirmed) {
                    let logs = Storage_7ree.getLogs_7ree();

                    if (logs[dateToDelete] && logs[dateToDelete][projectIdToDelete]) {
                        if (Array.isArray(logs[dateToDelete][projectIdToDelete])) {
                            // New format: remove the last timestamp
                            logs[dateToDelete][projectIdToDelete].pop();
                            if (logs[dateToDelete][projectIdToDelete].length === 0) {
                                delete logs[dateToDelete][projectIdToDelete];
                            }
                        } else if (typeof logs[dateToDelete][projectIdToDelete] === 'number') {
                            // Old format: decrement count
                            logs[dateToDelete][projectIdToDelete]--;
                            if (logs[dateToDelete][projectIdToDelete] <= 0) {
                                delete logs[dateToDelete][projectIdToDelete];
                            }
                        }

                        if (Object.keys(logs[dateToDelete]).length === 0) {
                            delete logs[dateToDelete];
                        }
                        Storage_7ree.saveLogs_7ree(logs);
                        renderLogList(); // Re-render the log list
                    }
                }
            });
        }
    }

    // Add event listener for log list
    logListDiv.addEventListener('click', handleDeleteLog);

    // 初始渲染和事件监听器
    renderProjectList();
    projectForm.addEventListener('submit', handleFormSubmit);
    projectListDiv.addEventListener('click', handleListClick);

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(`${button.dataset.tab}-tab`);
        });
    });

    // 默认显示添加项目Tab
    showTab('add-project-tab');
});
