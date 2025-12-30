document.addEventListener("DOMContentLoaded", function () {
  const resumePage = document.getElementById("resume-page");
  const pageWrapper = document.querySelector(".page-wrapper");
  const downloadBtn = document.getElementById("download-pdf");

  const photo = document.getElementById("profile-photo");
  const photoInput = document.getElementById("photo-input");
  const uploadBtn = document.getElementById("upload-btn");

  /* Масштабирование превью резюме под ширину контейнера */
  function applyScale() {
    if (!resumePage || !pageWrapper) return;

    // сбрасываем масштаб, чтобы измерить фактическую ширину
    resumePage.style.transform = "";
    pageWrapper.style.minHeight = "";

    const wrapperWidth = pageWrapper.clientWidth;
    const pageWidth = resumePage.offsetWidth;

    if (pageWidth === 0 || wrapperWidth === 0) return;

    const scale = Math.min(1, (wrapperWidth - 16) / pageWidth);

    if (scale < 1) {
      resumePage.style.transform = `scale(${scale})`;
      pageWrapper.style.minHeight = `${resumePage.offsetHeight * scale}px`;
    }
  }

  applyScale();
  window.addEventListener("resize", applyScale);

  /* Загрузка фото */

  function triggerPhotoInput() {
    if (!photoInput) return;
    photoInput.value = "";
    photoInput.click();
  }

  if (photo && uploadBtn && photoInput) {
    photo.addEventListener("click", triggerPhotoInput);
    uploadBtn.addEventListener("click", triggerPhotoInput);

    photoInput.addEventListener("change", function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, выберите файл изображения.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        photo.src = e.target.result;
        uploadBtn.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  /* Двусторонняя привязка полей */

  function bindBidirectionalText(inputId, elementId) {
    const input = document.getElementById(inputId);
    const el = document.getElementById(elementId);
    if (!input || !el) return;

    const syncFromEl = () => {
      input.value = el.textContent.trim();
    };
    const syncFromInput = () => {
      el.textContent = input.value;
    };

    syncFromEl();
    input.addEventListener("input", syncFromInput);
    el.addEventListener("input", syncFromEl);
    el.addEventListener("blur", syncFromEl);
  }

  function bindBidirectionalMultiline(inputId, elementId) {
    const input = document.getElementById(inputId);
    const el = document.getElementById(elementId);
    if (!input || !el) return;

    const syncFromEl = () => {
      input.value = el.innerText.replace(/\u00a0/g, " ").trim();
    };

    const syncFromInput = () => {
      const lines = input.value.split(/\r?\n/);
      const html = lines
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join("<br />");
      el.innerHTML = html || "";
    };

    syncFromEl();
    input.addEventListener("input", syncFromInput);
    el.addEventListener("input", syncFromEl);
    el.addEventListener("blur", syncFromEl);
  }

  bindBidirectionalText("input-name", "name-text");
  bindBidirectionalText("input-city", "city-text");
  bindBidirectionalText("input-email", "email-text");
  bindBidirectionalText("input-phone", "phone-text");
  bindBidirectionalText("input-tg", "tg-text");
  bindBidirectionalMultiline("input-langs", "langs-text");

  /* Образование */

  function buildEduControls() {
    const educationList = document.getElementById("education-list");
    const controlsList = document.getElementById("edu-controls-list");
    if (!educationList || !controlsList) return;

    const eduItems = Array.from(
      educationList.querySelectorAll(".sidebar-education-item")
    );
    controlsList.innerHTML = "";

    eduItems.forEach((item, index) => {
      item.dataset.eduIndex = String(index);
      const yearEl = item.querySelector(".sidebar-year");
      const textEl = item.querySelector(".sidebar-text");

      const control = document.createElement("div");
      control.className = "edu-control-item";
      control.dataset.eduIndex = String(index);
      control.innerHTML = `
        <div class="field-group">
          <div class="field-label"><span>Годы ${index + 1}</span></div>
          <input type="text" class="field-input edu-year-input" />
        </div>
        <div class="field-group">
          <div class="field-label"><span>Блок ${index + 1}</span></div>
          <textarea class="field-textarea edu-text-input"></textarea>
        </div>
      `;

      const yearInput = control.querySelector(".edu-year-input");
      const textInput = control.querySelector(".edu-text-input");

      if (yearInput && yearEl) yearInput.value = yearEl.textContent.trim();
      if (textInput && textEl)
        textInput.value = textEl.innerText.replace(/\u00a0/g, " ").trim();

      if (yearInput && yearEl) {
        yearInput.addEventListener("input", () => {
          yearEl.textContent = yearInput.value;
        });
        yearEl.oninput = () => {
          yearInput.value = yearEl.textContent.trim();
        };
        yearEl.onblur = yearEl.oninput;
      }

      if (textInput && textEl) {
        const applyTextareaToPreview = () => {
          const lines = textInput.value
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l);
          textEl.innerHTML = lines.join("<br />");
        };
        textInput.addEventListener("input", applyTextareaToPreview);

        const syncFromPreview = () => {
          textInput.value = textEl.innerText.replace(/\u00a0/g, " ").trim();
        };
        textEl.oninput = syncFromPreview;
        textEl.onblur = syncFromPreview;
      }

      controlsList.appendChild(control);
    });

    applyScale();
  }

  const educationList = document.getElementById("education-list");
  const addEduBtn = document.querySelector(".edit-add-edu");
  const addEduControlBtn = document.querySelector(".add-edu-control");

  if (educationList && addEduBtn) {
    addEduBtn.addEventListener("click", () => {
      const template = educationList.querySelector(
        ".sidebar-education-item:last-of-type"
      );
      if (!template) return;

      const clone = template.cloneNode(true);

      const yearEl = clone.querySelector(".sidebar-year");
      const textEl = clone.querySelector(".sidebar-text");
      if (yearEl) yearEl.textContent = "Годы обучения";
      if (textEl) {
        textEl.innerHTML =
          "Название учебного заведения<br />Факультет / специальность";
      }

      educationList.appendChild(clone);
      buildEduControls();
    });

    if (addEduControlBtn) {
      addEduControlBtn.addEventListener("click", () => addEduBtn.click());
    }

    educationList.addEventListener("click", event => {
      const btn = event.target.closest(".edit-remove-edu");
      if (!btn) return;
      const item = btn.closest(".sidebar-education-item");
      if (!item) return;

      if (
        educationList.querySelectorAll(".sidebar-education-item").length <= 1
      )
        return;
      item.remove();
      buildEduControls();
    });
  }

  /* Опыт */

  function buildJobControls() {
    const jobsContainer = document.getElementById("jobs-container");
    const controlsList = document.getElementById("job-controls-list");
    if (!jobsContainer || !controlsList) return;

    const jobBlocks = Array.from(
      jobsContainer.querySelectorAll(".job-block")
    );
    controlsList.innerHTML = "";

    jobBlocks.forEach((block, index) => {
      block.dataset.jobIndex = String(index);
      const periodEl = block.querySelector(".job-period");
      const companyEl = block.querySelector(".job-company");
      const textEl = block.querySelector(".job-text");
      const listEl = block.querySelector(".job-list");

      const control = document.createElement("div");
      control.className = "job-control-item";
      control.dataset.jobIndex = String(index);
      control.innerHTML = `
        <div class="field-group">
          <div class="field-label"><span>Период ${index + 1}</span></div>
          <input type="text" class="field-input job-period-input" />
        </div>
        <div class="field-group">
          <div class="field-label"><span>Компания и роль ${index + 1}</span></div>
          <input type="text" class="field-input job-company-input" />
        </div>
        <div class="field-group">
          <div class="field-label"><span>Описание ${index + 1}</span></div>
          <textarea class="field-textarea job-text-input"></textarea>
        </div>
        <div class="field-group">
          <div class="field-label"><span>Обязанности ${index + 1}</span></div>
          <textarea class="field-textarea job-list-input"></textarea>
        </div>
      `;

      const periodInput = control.querySelector(".job-period-input");
      const companyInput = control.querySelector(".job-company-input");
      const textInput = control.querySelector(".job-text-input");
      const listInput = control.querySelector(".job-list-input");

      if (periodInput && periodEl)
        periodInput.value = periodEl.textContent.trim();
      if (companyInput && companyEl)
        companyInput.value = companyEl.textContent.trim();
      if (textInput) {
        if (textEl) {
          textInput.value = textEl.innerText.replace(/\u00a0/g, " ").trim();
        } else {
          textInput.value = "";
          const fg = textInput.closest(".field-group");
          if (fg) fg.style.display = "none";
        }
      }
      if (listInput && listEl) {
        const items = Array.from(listEl.querySelectorAll("li")).map(li =>
          li.textContent.trim()
        );
        listInput.value = items.join("\n");
      }

      if (periodInput && periodEl) {
        periodInput.addEventListener("input", () => {
          periodEl.textContent = periodInput.value;
        });
        periodEl.oninput = () => {
          periodInput.value = periodEl.textContent.trim();
        };
        periodEl.onblur = periodEl.oninput;
      }

      if (companyInput && companyEl) {
        companyInput.addEventListener("input", () => {
          companyEl.textContent = companyInput.value;
        });
        companyEl.oninput = () => {
          companyInput.value = companyEl.textContent.trim();
        };
        companyEl.onblur = companyEl.oninput;
      }

      if (textInput && textEl) {
        const applyTextInput = () => {
          const lines = textInput.value
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l);
          textEl.innerHTML = lines.join("<br />");
        };
        textInput.addEventListener("input", applyTextInput);
        const syncFromPreview = () => {
          textInput.value = textEl.innerText.replace(/\u00a0/g, " ").trim();
        };
        textEl.oninput = syncFromPreview;
        textEl.onblur = syncFromPreview;
      }

      if (listInput && listEl) {
        const applyListInput = () => {
          const lines = listInput.value
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l);
          listEl.innerHTML = "";
          lines.forEach(line => {
            const li = document.createElement("li");
            li.textContent = line;
            listEl.appendChild(li);
          });
        };
        listInput.addEventListener("input", applyListInput);

        const syncFromList = () => {
          const items = Array.from(listEl.querySelectorAll("li")).map(li =>
            li.textContent.trim()
          );
          listInput.value = items.join("\n");
        };
        listEl.oninput = syncFromList;
        listEl.onblur = syncFromList;
      }

      controlsList.appendChild(control);
    });

    applyScale();
  }

  const jobsContainer = document.getElementById("jobs-container");
  const addJobBtn = document.querySelector(".edit-add-job");
  const addJobControlBtn = document.querySelector(".add-job-control");

  if (jobsContainer && addJobBtn) {
    addJobBtn.addEventListener("click", () => {
      const template = jobsContainer.querySelector(".job-block:last-of-type");
      if (!template) return;

      const clone = template.cloneNode(true);

      const periodEl = clone.querySelector(".job-period");
      const companyEl = clone.querySelector(".job-company");
      const textEl = clone.querySelector(".job-text");
      const listEl = clone.querySelector(".job-list");

      if (periodEl) periodEl.textContent = "Период работы";
      if (companyEl) companyEl.textContent = "Компания, должность";
      if (textEl) textEl.textContent = "Краткое описание места работы.";
      if (listEl) {
        listEl.innerHTML = "<li>Основная обязанность</li>";
      }

      jobsContainer.appendChild(clone);
      buildJobControls();
    });

    if (addJobControlBtn) {
      addJobControlBtn.addEventListener("click", () => addJobBtn.click());
    }

    jobsContainer.addEventListener("click", event => {
      const btn = event.target.closest(".edit-remove-job");
      if (!btn) return;
      const block = btn.closest(".job-block");
      if (!block) return;
      if (jobsContainer.querySelectorAll(".job-block").length <= 1) return;
      block.remove();
      buildJobControls();
    });
  }

  buildEduControls();
  buildJobControls();

  /* Cookie notice + terms (RF) */
  const consentOverlays = document.querySelectorAll("#consent-banner");
  if (consentOverlays.length > 1) {
    consentOverlays.forEach((overlay, index) => {
      if (index > 0) overlay.remove();
    });
  }
  const consentOverlay = consentOverlays[0] || document.getElementById("consent-banner");
  const consentCard = consentOverlay?.querySelector(".consent-card") || document.querySelector(".consent-card");
  const consentShort = consentOverlay?.querySelector("#consent-short");
  const consentDetails = consentOverlay?.querySelector("#consent-details");
  const consentDetailsBtn = consentOverlay?.querySelector("#consent-details-btn");
  const consentCollapse = consentOverlay?.querySelector("#consent-collapse");
  const consentAcceptButtons = consentOverlay?.querySelectorAll("[data-consent-accept]") || [];
  const CONSENT_KEY = "pd_consent_ru";
  const CONSENT_AT_KEY = "pd_consent_ru_at";

  const toggleBannerState = state => {
    if (!consentCard) return;
    consentCard.dataset.state = state;
    const showDetails = state === "details";
    if (consentDetails) consentDetails.hidden = !showDetails;
    if (consentShort) consentShort.hidden = showDetails;
    if (consentDetailsBtn)
      consentDetailsBtn.setAttribute("aria-expanded", String(showDetails));
    if (consentCollapse) consentCollapse.hidden = !showDetails;
    if (consentDetailsBtn) consentDetailsBtn.hidden = showDetails;
  };

  const hideBanner = () => {
    if (consentOverlay) {
      consentOverlay.hidden = true;
      consentOverlay.setAttribute("aria-hidden", "true");
    }
  };

  const showBanner = () => {
    if (consentOverlay) {
      consentOverlay.hidden = false;
      consentOverlay.removeAttribute("aria-hidden");
    }
    toggleBannerState("short");
  };

  const acceptConsent = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
      localStorage.setItem(CONSENT_AT_KEY, new Date().toISOString());
    } catch (e) {
      console.warn("Consent storage unavailable", e);
    }
    hideBanner();
    toggleBannerState("short");
  };

  if (consentDetailsBtn) {
    consentDetailsBtn.addEventListener("click", () => toggleBannerState("details"));
  }

  if (consentCollapse) {
    consentCollapse.addEventListener("click", () => toggleBannerState("short"));
  }

  consentAcceptButtons.forEach(btn => btn.addEventListener("click", acceptConsent));

  let isAccepted = false;
  try {
    isAccepted = localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch (e) {
    console.warn("Consent storage unavailable", e);
  }

  if (isAccepted) {
    hideBanner();
  } else {
    showBanner();
  }

  if (downloadBtn && resumePage) {
    const ensureHtml2Pdf = () => {
      if (window.html2pdf) return Promise.resolve(window.html2pdf);
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.integrity =
          "sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==";
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.onload = () =>
          window.html2pdf ? resolve(window.html2pdf) : reject();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    downloadBtn.addEventListener("click", function () {
      const toHide = document.querySelectorAll(".edit-icon, .no-print");
      const prevDisplay = [];
      toHide.forEach((el, idx) => {
        prevDisplay[idx] = el.style.display;
        el.style.display = "none";
      });

      const prevTransformPage = resumePage.style.transform;
      const prevTransformOrigin = resumePage.style.transformOrigin;
      const prevMinHeight = pageWrapper ? pageWrapper.style.minHeight : "";
      const prevBoxShadow = resumePage.style.boxShadow;
      if (pageWrapper) pageWrapper.style.minHeight = "";
      resumePage.style.transform = "";
      resumePage.style.transformOrigin = "top left";
      resumePage.style.boxShadow = "none";

      ensureHtml2Pdf()
        .then(() => {
          const rect = resumePage.getBoundingClientRect();
          const pxToMm = px => (px * 25.4) / 96;
          const pageWidthMm = 210;
          const pageHeightMm = 297;
          const contentWidthMm = pxToMm(rect.width);
          const contentHeightMm = pxToMm(rect.height);
          const fitScale = Math.min(
            1,
            pageWidthMm / contentWidthMm,
            pageHeightMm / contentHeightMm
          );

          resumePage.style.transform = `scale(${fitScale})`;

          const opt = {
            margin: [0, 0, 0, 0],
            filename: "resume.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              scrollX: 0,
              scrollY: 0,
              backgroundColor: "#ffffff"
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all"] }
          };

          return window.html2pdf().set(opt).from(resumePage).save();
        })
        .catch(err => {
          console.error("PDF export failed", err);
          alert("Экспорт PDF временно недоступен. Попробуйте обновить страницу.");
        })
        .finally(() => {
          resumePage.style.transform = prevTransformPage;
          resumePage.style.transformOrigin = prevTransformOrigin;
          resumePage.style.boxShadow = prevBoxShadow;
          if (pageWrapper) pageWrapper.style.minHeight = prevMinHeight;
          toHide.forEach((el, idx) => {
            el.style.display = prevDisplay[idx] || "";
          });
          applyScale();
        });
    });
  }
});
