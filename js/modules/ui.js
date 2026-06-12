// ============================================================
// UI primitives — toast notifications & custom select dropdown
// ============================================================
'use strict';

  // ===== TOAST =====
  function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type || 'success'}`;
    const iconName = type === 'error' ? 'alert-circle' : 'check-circle';
    toast.innerHTML = `<i data-lucide="${iconName}"></i><span>${escHtml(message)}</span>`;
    document.body.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });

    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ===== CUSTOM SELECT COMPONENT =====
  let activeDropdown = null;

  function createCustomSelect(options, currentValue, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mp-select-wrapper';

    const selectedOption = options.find(o => o.value === currentValue) || options[0];

    const trigger = document.createElement('button');
    trigger.className = 'mp-select-trigger';
    trigger.type = 'button';
    trigger.innerHTML = `
      <span class="trigger-text">${escHtml(selectedOption ? selectedOption.label : '')}</span>
      <svg class="trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'mp-select-dropdown';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'mp-select-option' + (opt.value === currentValue ? ' selected' : '');
      item.dataset.value = opt.value;
      item.innerHTML = `
        <svg class="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span>${escHtml(opt.label)}</span>
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        trigger.querySelector('.trigger-text').textContent = opt.label;
        dropdown.querySelectorAll('.mp-select-option').forEach(o => o.classList.remove('selected'));
        item.classList.add('selected');
        closeDropdown();
        onChange(opt.value);
      });
      dropdown.appendChild(item);
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('visible')) {
        closeDropdown();
      } else {
        if (activeDropdown) closeDropdown();
        dropdown.classList.add('visible');
        trigger.classList.add('open');
        activeDropdown = { dropdown, trigger };
      }
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);
    return wrapper;
  }

  function closeDropdown() {
    if (activeDropdown) {
      activeDropdown.dropdown.classList.remove('visible');
      activeDropdown.trigger.classList.remove('open');
      activeDropdown = null;
    }
  }

  document.addEventListener('click', () => closeDropdown());
