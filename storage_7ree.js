export const Storage_7ree = {
  getProjects_7ree() {
    // 为首次使用的用户提供默认示例项目。
    const projects = localStorage.getItem('projects_7ree');
    if (!projects) {
      const defaultProjects = [
        { id: 1, name: '学习JavaScript', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', desc: 'MDN JavaScript 指南' },
        { id: 2, name: 'React教程', url: 'https://react.dev/learn', desc: 'React官方文档' }
      ];
      this.saveProjects_7ree(defaultProjects);
      return defaultProjects;
    }
    return JSON.parse(projects);
  },
  saveProjects_7ree(projects) {
    localStorage.setItem('projects_7ree', JSON.stringify(projects));
  },
  saveLogs_7ree(logs) {
    localStorage.setItem('study_logs_7ree', JSON.stringify(logs));
  },
  logStudy_7ree(projectId) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; // YYYY-MM-DD (Local Time)
    const time = now.toTimeString().slice(0, 5); // HH:MM

    let logs = this.getLogs_7ree();
    logs[today] = logs[today] || {};
    logs[today][projectId] = logs[today][projectId] || [];
    logs[today][projectId].push(time); // Store timestamp
    localStorage.setItem('study_logs_7ree', JSON.stringify(logs));
  },
  getLogs_7ree() {
    return JSON.parse(localStorage.getItem('study_logs_7ree') || '{}');
  }
};
