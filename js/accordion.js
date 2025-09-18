// Utility function for debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Load accordion list content
async function loadAccordionList(containerId, jsonPath, showMoreLimit = 0, showMoreBtnId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    const response = await fetch(jsonPath, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${jsonPath}: ${response.statusText}`);
    const items = await response.json();

    container.innerHTML = '';

    items.forEach((item, index) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('accordion');
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-labelledby', `accordion-btn-${containerId}-${index}`);
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'translateY(10px)';
      if (showMoreLimit && index >= showMoreLimit) {
        wrapper.style.display = 'none';
      }

      const btn = document.createElement('button');
      btn.classList.add('accordion-btn');
      btn.id = `accordion-btn-${containerId}-${index}`;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', `accordion-content-${containerId}-${index}`);
      btn.setAttribute('aria-label', `${item.title} - ${container.dataset.label || 'Details'}`);
      btn.innerHTML = `
        <span class="accordion-title">${item.title}</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      `;

      const content = document.createElement('div');
      content.classList.add('accordion-content');
      content.id = `accordion-content-${containerId}-${index}`;
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', `accordion-btn-${containerId}-${index}`);
      content.setAttribute('hidden', '');

      if (item.duration) {
        const p = document.createElement('p');
        p.classList.add('duration');
        p.innerHTML = `<strong>Duration:</strong> ${item.duration}`;
        content.appendChild(p);
      }

      if (item.details && Array.isArray(item.details)) {
        const ul = document.createElement('ul');
        item.details.forEach(detail => {
          const li = document.createElement('li');
          li.textContent = detail;
          ul.appendChild(li);
        });
        content.appendChild(ul);
      }

      wrapper.appendChild(btn);
      wrapper.appendChild(content);
      container.appendChild(wrapper);

      setTimeout(() => {
        wrapper.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'translateY(0)';
      }, index * 50);
    });

    if (showMoreLimit && items.length > showMoreLimit && showMoreBtnId) {
      const showMoreBtn = document.getElementById(showMoreBtnId);
      showMoreBtn.removeAttribute('hidden');
      showMoreBtn.textContent = `Show More (${items.length - showMoreLimit} more)`;

      showMoreBtn.addEventListener('click', () => {
        const hiddenItems = container.querySelectorAll('.accordion[style*="display: none"]');
        const isShowingAll = hiddenItems.length === 0;

        container.querySelectorAll('.accordion').forEach((accordion, index) => {
          if (index >= showMoreLimit) {
            accordion.style.display = isShowingAll ? 'none' : '';
            if (!isShowingAll) {
              accordion.style.opacity = '0';
              accordion.style.transform = 'translateY(10px)';
              setTimeout(() => {
                accordion.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                accordion.style.opacity = '1';
                accordion.style.transform = 'translateY(0)';
              }, (index - showMoreLimit) * 50);
            }
          }
        });

        showMoreBtn.textContent = isShowingAll
          ? `Show More (${items.length - showMoreLimit} more)`
          : 'Show Less';
      });
    }

    container.addEventListener(
      'click',
      debounce(e => {
        const btn = e.target.closest('.accordion-btn');
        if (!btn) return;

        const wrapper = btn.parentElement;
        const content = btn.nextElementSibling;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', String(!isExpanded));
        btn.classList.toggle('active', !isExpanded);
        content.toggleAttribute('hidden', isExpanded);
        wrapper.classList.toggle('inactive', isExpanded);

        if (!isExpanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.transform = 'translateY(0)';
        } else {
          content.style.maxHeight = null;
          content.style.transform = 'translateY(-10px)';
        }
      }, 100)
    );
  } catch (err) {
    console.error('Accordion load failed:', err);
    container.innerHTML = '<p class="error">Failed to load content. Please try again later.</p>';
  }
}

// Initialize on DOM ready with IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  const containers = [
    { id: 'projects-container', path: '../data/stackstorm-projects.json', showMoreLimit: 5, showMoreBtnId: 'show-more-projects' },
    { id: 'packs-container', path: '../data/stackstorm-packs.json', showMoreLimit: 5, showMoreBtnId: 'show-more-packs' },
  ];

  if (!('IntersectionObserver' in window)) {
    containers.forEach(({ id, path, showMoreLimit, showMoreBtnId }) =>
      loadAccordionList(id, path, showMoreLimit, showMoreBtnId)
    );
    return;
  }

  containers.forEach(({ id, path, showMoreLimit, showMoreBtnId }) => {
    const container = document.getElementById(id);
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadAccordionList(id, path, showMoreLimit, showMoreBtnId);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );
    observer.observe(container);
  });
});