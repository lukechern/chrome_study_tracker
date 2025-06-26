export function showTooltip(element, content) {
  // Remove any existing tooltips first
  hideTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = 'calendar-tooltip_7ree'; // Reusing calendar tooltip style
  tooltip.innerHTML = content;
  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
}

export function hideTooltip() {
  const tooltip = document.querySelector('.calendar-tooltip_7ree');
  if (tooltip) {
    tooltip.remove();
  }
}