import { Handler } from 'pagedjs';

export class ReportPaginationHandler extends Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterPageLayout(pageElement, page, breakToken, chunker) {
    // 1. Inject Backgrounds
    // Find the section this page belongs to by looking at the first element inside the page
    const content = pageElement.querySelector('.pagedjs_page_content');
    if (content) {
      // Find the closest data-section-id within the content
      const sectionEl = content.querySelector('[data-section-id]');
      if (sectionEl) {
        const sectionId = sectionEl.getAttribute('data-section-id');
        const bgSource = document.querySelector(`#bg-${sectionId}`);
        if (bgSource) {
          const bgClone = bgSource.cloneNode(true);
          bgClone.style.display = 'block';
          bgClone.classList.remove('hidden');
          bgClone.style.position = 'absolute';
          bgClone.style.top = '0';
          bgClone.style.left = '0';
          bgClone.style.width = '100%';
          bgClone.style.height = '100%';
          bgClone.style.zIndex = '0';
          
          // Make sure content sits above background
          const wrapper = document.createElement('div');
          wrapper.style.position = 'relative';
          wrapper.style.zIndex = '10';
          
          // Move all children of content into wrapper
          while (content.firstChild) {
            wrapper.appendChild(content.firstChild);
          }
          
          content.appendChild(bgClone);
          content.appendChild(wrapper);
        }
      }
    }
  }
}
