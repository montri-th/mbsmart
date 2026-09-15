/* The visible summary is authored in HTML. Keep the complete source register
   separate; its requirement statuses and decision history are not guide copy. */
(() => {
  'use strict';
  const host = document.getElementById('requirement-groups');
  if (!host) return;
  for (const article of host.querySelectorAll('[data-guide-id]')) {
    const title = article.querySelector('h3').textContent;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'ให้ความเห็นเรื่องนี้';
    button.setAttribute('aria-label', 'ให้ความเห็นเรื่อง ' + title);
    button.addEventListener('click', () => {
      const app = window.BC_EXPERIENCE;
      const { guideId, guideSection: section, guideView: view, guideArea: area } = article.dataset;
      const field = document.getElementById('comment-text');
      if (!app || !field || !app.activate({ section, view, referenceKind: 'model', referenceId: view })) return;
      const prefix = '[smart / Mercedes-Benz ' + guideId + ' — ' + title + ']\n';
      const next = (field.value ? field.value + '\n\n' : '') + prefix;
      if (!field.value.includes(prefix)) {
        if (field.maxLength > 0 && next.length > field.maxLength) {
          field.setCustomValidity('อ่านข้อความให้กระชับก่อนเพิ่มหัวข้อใหม่ หรือคัดลอกข้อความเดิมเก็บไว้');
          field.reportValidity();
          return;
        }
        field.setCustomValidity('');
        field.value = next;
      }
      field.dispatchEvent(new Event('input', { bubbles: true }));
      const selector = document.getElementById('comment-area');
      selector.value = [...selector.options].some(option => option.value === area && !option.disabled) ? area : 'general';
      selector.dispatchEvent(new Event('change', { bubbles: true }));
      field.scrollIntoView({ behavior: 'auto', block: 'center' });
      field.focus();
    });
    article.append(button);
  }
  window.BC_EXPERIENCE?.scope();
})();
