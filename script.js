(() => {
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll(".catalog-toolbar").forEach((toolbar) => {
    const grid = toolbar.nextElementSibling;
    if (!grid || !grid.classList.contains("listing-grid")) return;

    const cards = Array.from(grid.querySelectorAll(".listing-card"));
    if (!cards.length) return;

    const existingText = Array.from(toolbar.children)
      .map((child) => child.textContent.trim())
      .filter(Boolean)
      .join(" · ")
      .replace(/^Sort:\s*/i, "Default ranking: ");
    const categories = new Set();
    const statuses = new Set();

    cards.forEach((card, index) => {
      const category = card.dataset.category || card.querySelector(".pill")?.textContent.trim() || "Listing";
      const status = card.dataset.status || card.querySelector(".listing-card__status")?.textContent.trim() || "Available";
      const title = card.querySelector("h3")?.textContent.trim() || `Listing ${index + 1}`;

      card.dataset.category = category;
      card.dataset.status = status;
      card.dataset.title = title;
      card.dataset.searchText = card.textContent.toLowerCase();
      card.dataset.originalRank = String(index);
      card.dataset.installs = card.dataset.installs || String(cards.length - index);
      card.dataset.usage = card.dataset.usage || String(cards.length - index);
      card.dataset.newest = card.dataset.newest || String(index);

      categories.add(category);
      statuses.add(status);
    });

    toolbar.classList.add("catalog-toolbar--interactive");
    toolbar.innerHTML = `
      <div class="catalog-toolbar__summary">
        <strong>Search catalog</strong>
        <span>${escapeHtml(existingText)}</span>
      </div>
      <form class="catalog-controls" role="search" aria-label="Search and filter marketplace listings">
        <label class="catalog-search">
          <span>Search</span>
          <input type="search" placeholder="Search listings" autocomplete="off" />
        </label>
        <label>
          <span>Category</span>
          <select name="category">
            <option value="">All categories</option>
            ${Array.from(categories).sort().map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select name="status">
            <option value="">All statuses</option>
            ${Array.from(statuses).sort().map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select name="sort">
            <option value="installs">Most installed</option>
            <option value="usage">Most used</option>
            <option value="newest">Newest</option>
            <option value="title">A-Z</option>
          </select>
        </label>
      </form>
      <p class="catalog-results" aria-live="polite"></p>
    `;

    const controls = toolbar.querySelector(".catalog-controls");
    const resultText = toolbar.querySelector(".catalog-results");

    const applyCatalogState = () => {
      const search = controls.querySelector("input").value.trim().toLowerCase();
      const category = controls.elements.category.value;
      const status = controls.elements.status.value;
      const sort = controls.elements.sort.value;

      const sortedCards = [...cards].sort((a, b) => {
        if (sort === "title") return a.dataset.title.localeCompare(b.dataset.title);
        if (sort === "newest") return Number(b.dataset.newest) - Number(a.dataset.newest);
        return Number(b.dataset[sort]) - Number(a.dataset[sort]) || Number(a.dataset.originalRank) - Number(b.dataset.originalRank);
      });

      sortedCards.forEach((card) => grid.appendChild(card));

      let visibleCount = 0;
      cards.forEach((card) => {
        const matchesSearch = !search || card.dataset.searchText.includes(search);
        const matchesCategory = !category || card.dataset.category === category;
        const matchesStatus = !status || card.dataset.status === status;
        const isVisible = matchesSearch && matchesCategory && matchesStatus;

        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      resultText.textContent = `${visibleCount} of ${cards.length} listings shown`;
      grid.classList.toggle("listing-grid--empty", visibleCount === 0);
    };

    controls.addEventListener("input", applyCatalogState);
    controls.addEventListener("change", applyCatalogState);
    applyCatalogState();
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  }
})();
