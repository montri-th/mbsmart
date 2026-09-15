/* Additional presentation stills. Original v11 comment references stay authoritative. */
(() => {
  'use strict';
  const host = document.getElementById('application-details');
  const shortcuts = document.getElementById('application-detail-jumps');
  if (!host || !shortcuts || !host.querySelector('figure')) return;

  function update() {
    const context = window.BC_EXPERIENCE?.inspect();
    if (!context) return;
    const visible = context.referenceKind !== 'model';
    for (const element of document.querySelectorAll('[data-detail-section]')) {
      element.hidden = element.dataset.detailSection !== context.section;
    }
    const group = host.querySelector(`[data-detail-section="${context.section}"]`);
    host.hidden = shortcuts.hidden = !visible || !group;
  }

  function followHash() {
    if (!location.hash.startsWith('#detail-')) return;
    const target = document.getElementById(location.hash.slice(1));
    const section = target?.closest('[data-detail-section]')?.dataset.detailSection;
    const experience = window.BC_EXPERIENCE;
    if (!section || !experience) return;
    const context = experience.inspect();
    if (context.section !== section || context.referenceKind === 'model') {
      const reference = experience.images.find(item => item.section === section);
      experience.activate({ section, view: reference.view, referenceKind: 'artist-impression', referenceId: reference.id });
    }
    update();
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }

  document.addEventListener('bc:contextchange', update);
  window.addEventListener('hashchange', followHash);
  for (const button of host.querySelectorAll('[data-detail-plan]')) {
    button.addEventListener('click', () => {
      const experience = window.BC_EXPERIENCE;
      const plan = experience?.plans.find(item => item.id === button.dataset.detailPlan);
      if (!plan) return;
      experience.activate({ section: plan.section, view: plan.view, referenceKind: 'plan', referenceId: plan.id });
      history.replaceState(null, '', location.pathname + location.search + '#' + plan.id);
      const target = document.getElementById(plan.id), image = target?.querySelector('img');
      const showPlan = () => requestAnimationFrame(() => requestAnimationFrame(() => target?.scrollIntoView({ block: 'start', behavior: 'instant' })));
      showPlan();
      if (image && !image.complete) image.addEventListener('load', showPlan, { once: true });
    });
  }
  for (const image of host.querySelectorAll('img')) {
    image.addEventListener('error', () => {
      image.hidden = true;
      const notice = image.closest('figure').querySelector('.application-detail-image-error');
      notice.hidden = false;
    }, { once: true });
  }
  update();
  followHash();
})();
