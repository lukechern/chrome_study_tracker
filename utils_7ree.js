export function showTooltip(element, content) {
  // Remove any existing tooltips first
  hideTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = 'calendar-tooltip_7ree'; // Reusing calendar tooltip style
  tooltip.innerHTML = content;
  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect(); // Get tooltip dimensions after it's in DOM

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let left = rect.left + scrollX;
  let top = rect.bottom + scrollY + 5; // Default: 5px below the element

  // Check for horizontal overflow
  if (left + tooltipRect.width > viewportWidth - 10) { // 10px right padding
    left = viewportWidth - tooltipRect.width - 10;
    if (left < 10) { // If still overflows, align to left with 10px padding
      left = 10;
    }
  }

  // Check for vertical overflow (if it goes off the bottom)
  if (top + tooltipRect.height > viewportHeight - 10) { // 10px bottom padding
    // Try to position above the element
    top = rect.top + scrollY - tooltipRect.height - 5; // 5px above the element
    if (top < 10) { // If still overflows, align to top with 10px padding
      top = 10;
    }
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

export function hideTooltip() {
  const tooltip = document.querySelector('.calendar-tooltip_7ree');
  if (tooltip) {
    tooltip.remove();
  }
}