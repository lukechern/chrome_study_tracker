import { Storage_7ree } from './storage_7ree.js';
import { showTooltip, hideTooltip } from './utils_7ree.js';

export function renderCalendar_7ree(container, displayYear = new Date().getFullYear(), displayMonth = new Date().getMonth()) {
  const logs = Storage_7ree.getLogs_7ree();
  const today = new Date();

  // Month and Year Header
  const header = document.createElement('div');
  header.className = 'calendar-header_7ree';

  const prevYearBtn = document.createElement('button');
  prevYearBtn.textContent = '<<';
  prevYearBtn.className = 'calendar-nav-btn_7ree';
  prevYearBtn.addEventListener('click', () => renderCalendar_7ree(container, displayYear - 1, displayMonth));
  prevYearBtn.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, '上一年'));
  prevYearBtn.addEventListener('mouseout', hideTooltip);
  header.appendChild(prevYearBtn);

  const prevMonthBtn = document.createElement('button');
  prevMonthBtn.textContent = '<';
  prevMonthBtn.className = 'calendar-nav-btn_7ree';
  prevMonthBtn.addEventListener('click', () => {
    let newMonth = displayMonth - 1;
    let newYear = displayYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    renderCalendar_7ree(container, newYear, newMonth);
  });
  prevMonthBtn.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, '上一月'));
  prevMonthBtn.addEventListener('mouseout', hideTooltip);
  header.appendChild(prevMonthBtn);

  const monthYearSpan = document.createElement('span');
  monthYearSpan.textContent = `${displayYear}年${new Date(displayYear, displayMonth).getMonth() + 1}月`;
  monthYearSpan.style.cursor = 'pointer';
  monthYearSpan.addEventListener('click', () => {
    renderCalendar_7ree(container, new Date().getFullYear(), new Date().getMonth());
  });
  header.appendChild(monthYearSpan);

  const nextMonthBtn = document.createElement('button');
  nextMonthBtn.textContent = '>';
  nextMonthBtn.className = 'calendar-nav-btn_7ree';
  nextMonthBtn.addEventListener('click', () => {
    let newMonth = displayMonth + 1;
    let newYear = displayYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    renderCalendar_7ree(container, newYear, newMonth);
  });
  nextMonthBtn.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, '下一月'));
  nextMonthBtn.addEventListener('mouseout', hideTooltip);
  header.appendChild(nextMonthBtn);

  const nextYearBtn = document.createElement('button');
  nextYearBtn.textContent = '>>';
  nextYearBtn.className = 'calendar-nav-btn_7ree';
  nextYearBtn.addEventListener('click', () => renderCalendar_7ree(container, displayYear + 1, displayMonth));
  nextYearBtn.addEventListener('mouseover', (e) => showTooltip(e.currentTarget, '下一年'));
  nextYearBtn.addEventListener('mouseout', hideTooltip);
  header.appendChild(nextYearBtn);

  container.innerHTML = ''; // 清除之前的内容
  container.appendChild(header);

  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar-grid-body_7ree';

  // 星期几的标题
  const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-weekday_7ree';
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });


  let firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  // Adjust firstDayOfMonth to be 0 for Monday, 6 for Sunday
  firstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  // 为月初之前的日期添加空单元格
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyCell = document.createElement('div');
    calendarGrid.appendChild(emptyCell);
  }

  // 为月份中的每一天添加单元格
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const logCount = Object.values(logs[dateStr] || {}).reduce((total, projectPunches) => {
        if (Array.isArray(projectPunches)) {
            return total + projectPunches.length;
        }
        // Handle old format where projectPunches might be a number
        return total + (typeof projectPunches === 'number' ? projectPunches : 0);
    }, 0);

    const cell = document.createElement('div');
    cell.className = 'calendar-day_7ree';
    cell.dataset.date = dateStr; // Add data-date attribute

    if (day === today.getDate() && displayMonth === today.getMonth() && displayYear === today.getFullYear()) {
        cell.classList.add('today_7ree');
    }

    const dayNumber = document.createElement('span');
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    if (logCount > 0) {
      cell.classList.add('punched-day_7ree');
      cell.addEventListener('mouseover', (event) => {
        const targetCell = event.currentTarget; // Use currentTarget to ensure it's the cell itself
        const projects = Storage_7ree.getProjects_7ree();
        const date = targetCell.dataset.date;
        const dailyLogs = logs[date];
        if (dailyLogs) {
          let tooltipContent = `当日打卡项目：<br>`;
          let count = 1;
          for (const projectId in dailyLogs) {
            const project = projects.find(p => p.id == projectId);
            const projectPunches = dailyLogs[projectId];

            if (project && Array.isArray(projectPunches)) { // Check if it's an array (new format)
              projectPunches.forEach(time => {
                tooltipContent += `${count++}. ${project.name} [${time}]<br>`;
              });
            } else if (project && typeof projectPunches === 'number') { // Handle old format (number)
              tooltipContent += `(${count++}) ${project.name} (打卡${projectPunches}次)<br>`;
            }
          }
          if (tooltipContent) {
            showTooltip(targetCell, tooltipContent); // Call the helper function
          }
        }
      });

      cell.addEventListener('mouseout', hideTooltip);
    }
    calendarGrid.appendChild(cell);
  }
  container.appendChild(calendarGrid);
}
