/* ==========================================================================
   1. NAVIGATION & MOBILE-MENÜ
   Inhalt: Kapselt die Steuerung des Headers (`.site-header`), des Burger-
           Buttons (`.nav-toggle`) und des Navigationsmenüs (`#primary-nav`)
           in einer eigenen IIFE ohne globale Variablen.
   Besonderheiten & Funktion: Synchronisiert `aria-expanded`, `aria-label`
           und `.is-open`, schließt das Menü auf Mobilgeräten nach Link-Klick,
           bei Klick außerhalb oder per `Escape` (mit Fokus-Rückgabe) und
           setzt es beim Wechsel auf Desktop (`min-width: 56rem`) automatisch
           zurück.
   ========================================================================== */
(() => {
  const header = document.querySelector(".site-header");
  const toggleBtn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#primary-nav");

  if (!header || !toggleBtn || !nav) return;

  const desktopQuery = window.matchMedia("(min-width: 56rem)");
  const navLinks = nav.querySelectorAll("a");

  const isMenuOpen = () => toggleBtn.getAttribute("aria-expanded") === "true";

  function setMenuState(isOpen, returnFocus = false) {
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    nav.classList.toggle("is-open", isOpen);

    if (!isOpen && returnFocus) {
      toggleBtn.focus();
    }
  }

  toggleBtn.addEventListener("click", () => {
    setMenuState(!isMenuOpen());
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!desktopQuery.matches) {
        setMenuState(false);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      setMenuState(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (isMenuOpen() && !header.contains(event.target)) {
      setMenuState(false);
    }
  });

  desktopQuery.addEventListener("change", (event) => {
    if (event.matches && isMenuOpen()) {
      setMenuState(false);
    }
  });
})();

/* ==========================================================================
   2. LEISTUNGEN-FILTER
   Inhalt: Steuert die Filterbuttons (`.filter-btn`) und blendet die
           Leistungskarten (`#leistungen .card[data-category]`) anhand ihres
           `data-category`-Attributs ein oder aus.
   Besonderheiten & Funktion: Aktualisiert sowohl die optische Aktivklasse
           (`.is-active`) als auch `aria-pressed`, damit Screenreader den
           aktiven Filterzustand zuverlässig erfassen; `data-filter="all"`
           zeigt wieder alle Karten an.
   ========================================================================== */
(() => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll("#leistungen .card[data-category]");

  if (!filterButtons.length || !serviceCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.filter;

      filterButtons.forEach((button) => {
        const isCurrent = button === btn;
        button.classList.toggle("is-active", isCurrent);
        button.setAttribute("aria-pressed", String(isCurrent));
      });

      serviceCards.forEach((card) => {
        const matches = selected === "all" || card.dataset.category === selected;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });
})();

/* ==========================================================================
   3. KONTAKTFORMULAR-VALIDIERUNG & RÜCKMELDUNG
   Inhalt: Validiert Pflichtfelder (`#name`, `#email`, `#message`), erzeugt
           dynamische Fehlermeldungen (`.field-error`) und gibt eine
           Demo-Bestätigung in `#form-feedback` aus.
   Besonderheiten & Funktion: Ergänzt `aria-describedby` und `aria-invalid`
           für Barrierefreiheit, prüft Felder bei `blur`, korrigiert Fehler
           bei `input`, fokussiert beim Absenden das erste fehlerhafte Feld
           und setzt das Formular nach gültiger Eingabe zurück.
   ========================================================================== */
(() => {
  const form = document.querySelector("#contact-form");
  const feedback = document.querySelector("#form-feedback");

  if (!form || !feedback) return;

  const fields = {
    name: form.querySelector("#name"),
    email: form.querySelector("#email"),
    service: form.querySelector("#service"),
    message: form.querySelector("#message"),
  };

  if (!fields.name || !fields.email || !fields.message) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function getOrCreateErrorEl(input) {
    let errorEl = input.parentElement.querySelector(".field-error");
    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "field-error";
      errorEl.id = `${input.id}-error`;
      input.setAttribute("aria-describedby", errorEl.id);
      input.parentElement.appendChild(errorEl);
    }
    return errorEl;
  }

  function setFieldError(input, message) {
    const errorEl = getOrCreateErrorEl(input);
    const hasError = Boolean(message);
    input.setAttribute("aria-invalid", String(hasError));
    errorEl.textContent = message;
  }

  function validateField(input) {
    const value = input.value.trim();

    if (input === fields.name && value.length < 2) {
      setFieldError(input, "Bitte geben Sie Ihren Namen an (mind. 2 Zeichen).");
      return false;
    }

    if (input === fields.email && !emailPattern.test(value)) {
      setFieldError(input, "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return false;
    }

    if (input === fields.message && value.length < 10) {
      setFieldError(input, "Bitte beschreiben Sie Ihr Anliegen kurz (mind. 10 Zeichen).");
      return false;
    }

    setFieldError(input, "");
    return true;
  }

  const requiredFields = [fields.name, fields.email, fields.message];

  requiredFields.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") {
        validateField(input);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const allValid = requiredFields.map(validateField).every(Boolean);

    if (!allValid) {
      feedback.className = "form-feedback is-error";
      feedback.textContent = "Bitte prüfen Sie die markierten Felder.";
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const customerName = fields.name.value.trim();
    const selectedService = fields.service?.options[fields.service.selectedIndex]?.text || "";

    feedback.className = "form-feedback is-success";
    feedback.textContent = `Vielen Dank, ${customerName}! Ihre Anfrage zum Bereich „${selectedService}“ ist eingegangen (Demo-Modus – es werden keine Daten versendet).`;

    form.reset();
    requiredFields.forEach((input) => {
      input.removeAttribute("aria-invalid");
      const errorEl = input.parentElement.querySelector(".field-error");
      if (errorEl) errorEl.textContent = "";
    });
  });
})();

/* ==========================================================================
   4. LEISTUNGS-MODAL MIT BEISPIELFOTO (<dialog>)
   Inhalt: Befüllt `#service-modal` beim Klick auf eine interaktive Karte
           (`.card--interactive`) mit Tag, Titel, Beispielfoto, Beschreibung,
           Stichpunktliste (`|`-getrennt) und Zielbereich für die Anfrage.
   Besonderheiten & Funktion: Nutzt `modal.showModal()`, blendet bei
           fehlenden Bilddateien automatisch einen Platzhalter-Hinweis ein,
           überträgt beim Klick auf „Passendes Angebot anfragen“ den gewählten
           Bereich in `#service` und gibt den Fokus beim Schließen an die
           auslösende Karte zurück.
   ========================================================================== */
(() => {
  const modal = document.querySelector("#service-modal");
  const cards = document.querySelectorAll(".card--interactive[data-title]");

  if (!modal || !cards.length || typeof modal.showModal !== "function") return;

  const els = {
    tag: modal.querySelector("#service-modal-tag"),
    title: modal.querySelector("#service-modal-title"),
    img: modal.querySelector("#service-modal-img"),
    placeholder: modal.querySelector("#service-modal-placeholder"),
    path: modal.querySelector("#service-modal-path"),
    desc: modal.querySelector("#service-modal-desc"),
    highlights: modal.querySelector("#service-modal-highlights"),
    cta: modal.querySelector("#service-modal-cta"),
    closeButtons: [
      modal.querySelector("#service-modal-close"),
      modal.querySelector("#service-modal-done"),
    ].filter(Boolean),
  };

  const serviceSelect = document.querySelector("#service");
  let lastTrigger = null;

  function setImageFallback(isMissing) {
    els.img?.classList.toggle("is-missing", isMissing);
    if (els.placeholder) els.placeholder.hidden = !isMissing;
  }

  els.img?.addEventListener("error", () => setImageFallback(true));
  els.img?.addEventListener("load", () => setImageFallback(false));

  function renderHighlights(rawHighlights = "") {
    if (!els.highlights) return;
    els.highlights.innerHTML = "";

    rawHighlights
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        els.highlights.appendChild(li);
      });
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      lastTrigger = card;

      const imgSrc = card.dataset.image || "";
      if (els.tag) els.tag.textContent = card.dataset.tag || "";
      if (els.title) els.title.textContent = card.dataset.title || "";
      if (els.desc) els.desc.textContent = card.dataset.description || "";
      if (els.path) els.path.textContent = imgSrc;

      setImageFallback(false);
      if (els.img) {
        els.img.alt = card.dataset.imageAlt || card.dataset.title || "Beispielfoto";
        els.img.src = imgSrc;
      }

      renderHighlights(card.dataset.highlights);

      if (els.cta && card.dataset.serviceValue) {
        els.cta.dataset.targetService = card.dataset.serviceValue;
      }

      modal.showModal();
    });
  });

  els.cta?.addEventListener("click", () => {
    const targetValue = els.cta.dataset.targetService;
    if (targetValue && serviceSelect) {
      const hasOption = Array.from(serviceSelect.options).some(
        (opt) => opt.value === targetValue
      );
      if (hasOption) {
        serviceSelect.value = targetValue;
      }
    }
    modal.close();
  });

  els.closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => modal.close());
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });

  modal.addEventListener("close", () => {
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  });
})();