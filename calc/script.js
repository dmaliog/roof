document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/calc/sw.js').catch(() => {});
    }
    const tabLinks = document.querySelectorAll('.tab-links a');
    const tabContents = document.querySelectorAll('.tab-content');
    const passwordModal = document.getElementById('password-modal');
    const closePassword = document.getElementById('close-password');
    const submitPassword = document.getElementById('submit-password');
    const passwordInput = document.getElementById('password-input');
    const calc19Link = document.querySelector('a[href="#calc19"]');
    const isLocalEnvironment = window.location.protocol === 'http:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    function detectStandaloneApp() {
        try {
            const mm = (q) => window.matchMedia && window.matchMedia(q).matches;
            const byDisplayMode = mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || mm('(display-mode: minimal-ui)');
            const byIOS = typeof window.navigator !== 'undefined' && window.navigator.standalone === true;
            const byReferrer = document.referrer && document.referrer.startsWith('android-app://');
            const byUserAgent = typeof navigator !== 'undefined' && navigator.userAgent && (
                navigator.userAgent.includes('wv') || 
                navigator.userAgent.includes('AndroidApp') ||
                (navigator.standalone !== undefined && navigator.standalone === true)
            );
            return !!(byDisplayMode || byIOS || byReferrer || byUserAgent);
        } catch (_) {
            return false;
        }
    }
    let passwordValidated = isLocalEnvironment || detectStandaloneApp();
    if (passwordModal && passwordValidated) {
        passwordModal.style.display = 'none';
        passwordModal.style.visibility = 'hidden';
    }
    try {
        const dm = window.matchMedia && window.matchMedia('(display-mode: standalone)');
        if (dm && typeof dm.addEventListener === 'function') {
            dm.addEventListener('change', (e) => { 
                if (e.matches) {
                    passwordValidated = true;
                    if (passwordModal) {
                        passwordModal.style.display = 'none';
                        passwordModal.style.visibility = 'hidden';
                    }
                }
            });
        }
        const dmFs = window.matchMedia && window.matchMedia('(display-mode: fullscreen)');
        if (dmFs && typeof dmFs.addEventListener === 'function') {
            dmFs.addEventListener('change', (e) => { 
                if (e.matches) {
                    passwordValidated = true;
                    if (passwordModal) {
                        passwordModal.style.display = 'none';
                        passwordModal.style.visibility = 'hidden';
                    }
                }
            });
        }
    } catch (_e) {}
    const correctPasswordHash = 'aedfcc5b92c3bb3f2a633eda717651e31d863c01683b9d93226f92b034ad5508';
    function parseDateSafe(timestamp) {
        if (!timestamp) return new Date();
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) return parsed;
        return new Date();
    }
    async function hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
    window.$ = (id) => document.getElementById(id);
    window.$q = (selector) => document.querySelector(selector);
    window.$qa = (selector) => document.querySelectorAll(selector);
    window.parseNum = (value, defaultValue = 0) => parseFloat(value) || defaultValue;
    window.formatNum = (num, decimals = 2) => {
        if (num == null || isNaN(num)) return '0.00';
        return num.toFixed(decimals);
    };
    const $ = window.$, $q = window.$q, $qa = window.$qa, parseNum = window.parseNum, formatNum = window.formatNum;
    function hideAllTabs() {
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        tabLinks.forEach(link => link.classList.remove('active'));
    }
    function showTab(targetId) {
        hideAllTabs();
        const targetContent = document.getElementById(targetId);
        const targetLink = document.querySelector(`a[href="#${targetId}"]`);
        if (targetContent && targetLink) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
            targetLink.classList.add('active');
            targetContent.scrollIntoView({ behavior: 'smooth' });
        }
        const floatingBtn = document.getElementById('floating-menu-btn');
        if (floatingBtn) floatingBtn.style.display = (passwordValidated && targetId === 'calc19') ? 'block' : 'none';
        if (targetId === 'calc-analysis') {
            setTimeout(() => {
                if (typeof window.renderWorkerStats === 'function') {
                    window.renderWorkerStats();
                }
                if (typeof window.renderForecast === 'function') {
                    window.renderForecast();
                }
            }, 100);
        }
    }
    showTab('calc2');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            if (!passwordValidated && detectStandaloneApp()) passwordValidated = true;
            if (targetId === 'calc19' && !passwordValidated) {
                passwordModal.style.display = 'flex';
            } else {
                showTab(targetId);
            }
        });
    });
    if (passwordModal && closePassword && submitPassword && calc19Link) {
        if (passwordValidated) passwordModal.style.display = 'none';
        closePassword.addEventListener('click', () => {
            passwordModal.style.display = 'none';
            if (document.getElementById('calc19').classList.contains('active')) {
                showTab('calc2');
            }
        });
        submitPassword.addEventListener('click', async () => {
            const inputPassword = passwordInput.value;
            const inputHash = await hashPassword(inputPassword);
            if (inputHash === correctPasswordHash) {
                passwordValidated = true;
                passwordModal.style.display = 'none';
                showTab('calc19'); 
            } else {
                window.location.href = 'https:
                passwordInput.value = '';
            }
        });
        passwordInput.addEventListener('keyup', async (e) => {
            if (e.key === 'Enter') {
                submitPassword.click();
            }
        });
    }
    const calc = (ids, fn, err = 'Введите корректные положительные числа.') => {
        const els = ids.map(id => $(id));
        const res = $(ids.pop().replace(/\d+/, 'result'));
        if (!els.every(e => e) || !res) return;
        const vals = els.map(e => parseNum(e.value));
        if (vals.some(v => v <= 0)) { res.innerText = err; res.classList.remove('active'); return; }
        res.innerText = fn(...vals); res.classList.add('active');
    };
    window.calculate2 = () => calc(['area2', 'result2'], (a) => {
        const rl = Math.ceil(a * 0.5), rc = Math.ceil(rl / 2), m = rl * 0.5, mc = Math.ceil(m / 0.31), d = rl * 4;
        return `Для ${a} м² потребуется ${rl} м прижимной планки (алюминиевая рейка TechnoNICOL, 2 м, ${rc} шт). Мастичный герметик: ${formatNum(m)} кг (${mc} картриджей, 0.31 кг). Быстрый монтаж: ${d} дюбелей (8 мм). Инструмент: ножницы по металлу (1 шт), перфоратор (1 шт), молоток (1 шт), пистолет для герметика (1 шт).`;
    }, 'Введите корректное положительное число для площади.');
    window.calculate4 = () => calc(['length4', 'height4', 'result4'], (l, h) => {
        const s = (h / l) * 100;
        return `Уклон кровли: ${formatNum(s)} %. ${s >= 1.5 ? 'Подходит для наплавляемой кровли' : 'Уклон слишком мал (мин. 1.5%)'}.`;
    });
    window.calculate7 = () => calc(['area7', 'team7', 'result7'], (a, t) => `Время: ${formatNum(a / (50 * t))} дней.`);
    window.calculate8 = () => calc(['distance8', 'volume8', 'result8'], (d, v) => `Стоимость логистики: ${formatNum(d * 30 + v * 150)} руб.`);
    const calcWithSelect = (ids, selects, fn, err = 'Введите корректное положительное число.') => {
        const els = ids.map(id => $(id));
        const selEls = selects.map(id => $(id));
        const res = $(ids.pop().replace(/\d+/, 'result'));
        if (!els.every(e => e) || !selEls.every(e => e) || !res) return;
        const vals = els.map(e => parseNum(e.value));
        const selVals = selEls.map(e => e.value);
        if (vals.some(v => v <= 0)) { res.innerText = err; res.classList.remove('active'); return; }
        res.innerText = fn(...vals, ...selVals); res.classList.add('active');
    };
    window.calculate11 = () => calcWithSelect(['area11', 'result11'], ['primerType11', 'baseType11', 'calcType11'], (iv, pt, bt, ct) => {
        const rates = {primer01: bt === 'concrete' ? 0.25 : 0.3, primer03: bt === 'concrete' ? 0.3 : 0.35, primer04: bt === 'concrete' ? 0.3 : 0.35, primer08: bt === 'concrete' ? 0.35 : 0.4};
        const sizes = {primer01: 16, primer03: 18, primer04: 16, primer08: 8};
        const r = rates[pt], bs = sizes[pt], ro = Math.ceil(iv / 100);
        const tools = `Инструмент: валик (180–250 мм, ${ro} шт), чехлы для валика (${ro} шт), телескопическая ручка (1 шт). Альтернатива: кисть (1–2 шт) или распылитель (1 шт).`;
        return ct === 'areaToMaterial' ? `Для ${iv} м² потребуется около ${formatNum(iv * r)} кг праймера, или ${Math.ceil(iv * r / bs)} ведро(а) (${bs} кг). ${tools}` : `${iv} кг праймера покрывает около ${formatNum(iv / r)} м². Это ${Math.floor(iv / bs)} ведро(а) (${bs} кг) с остатком ${iv % bs} кг. ${tools}`;
    });
    window.calculate12 = () => calc(['area12', 'layers12', 'result12'], (a, l) => `Количество газовых баллонов (12 л): ${Math.ceil(a * l / 120)} шт. Инструмент: газовая горелка (1 шт на бригаду), зажигалка (1 комплект).`);
    window.calculate13 = () => calcWithSelect(['area13', 'result13'], ['masticType13', 'calcType13'], (iv, mt, ct) => {
        const r = mt === 'bitum' ? 1.5 : 2.0, bs = mt === 'bitum' ? 20 : 18;
        const tools = 'Инструмент: пистолет для герметика (1 шт), шпатель (100 мм, 1–2 шт).';
        return ct === 'areaToMaterial' ? `Для ${iv} м² потребуется около ${formatNum(iv * r)} кг мастики, или ${Math.ceil(iv * r / bs)} ведро(а) (${bs} кг). ${tools}` : `${iv} кг мастики покрывает около ${formatNum(iv / r)} м². Это ${Math.floor(iv / bs)} ведро(а) (${bs} кг) с остатком ${iv % bs} кг. ${tools}`;
    });
    window.calculate15 = () => calcWithSelect(['inputValue15', 'result15'], ['calcType15'], (iv, ct) => {
        const tools = 'Инструмент: нож для кровли (100 мм, 1 шт), пистолет для герметика (1 шт).';
        if (ct === 'areaToMaterial') {
            const a = Math.max(2, Math.ceil(iv / 100)), i = Math.min(15, Math.sqrt(iv) / Math.ceil(Math.sqrt(a))), s = a * 0.1;
            return `Для ${iv} м² потребуется около ${a} аэраторов ТАТПОЛИМЕР ТП-01.100/6. Интервал: до ${formatNum(i)} м. Герметик: ${formatNum(s)} кг (${Math.ceil(s / 0.31)} картриджей, 0.31 кг). ${tools}`;
        }
        return `${iv} аэраторов ТАТПОЛИМЕР ТП-01.100/6 покрывает около ${formatNum(iv * 100)} м². Герметик: ${formatNum(iv * 0.1)} кг (${Math.ceil(iv * 0.1 / 0.31)} картриджей, 0.31 кг). ${tools}`;
    });
    window.calculate16 = () => calcWithSelect(['inputValue16', 'result16'], ['material16', 'calcType16'], (iv, m, ct) => {
        const mats = {minwool_technoacoustic: [5.76, 'Минвата Техноакустик, 50 мм'], minwool_technoroof: [2.88, 'Минвата Техноруф В60, 50 мм'], minwool_ozm: [4.32, 'Минвата Техно ОЗМ, 30 мм']};
        const [app, mn] = mats[m] || [0, ''], tools = 'Инструмент: нож для резки минваты (200 мм, 1 шт), зубчатый шпатель (6–8 мм, 1 шт).';
        if (ct === 'areaToMaterial') {
            const p = Math.ceil(iv / app), g = iv * 0.5;
            return `Для ${iv} м² потребуется около ${p} упаковок (${mn}, ${app} м²/уп.). Клей: ${formatNum(g)} кг (${Math.ceil(g / 25)} ведер, 25 кг). ${tools}`;
        }
        const a = iv * app, g = a * 0.5;
        return `${iv} упаковок (${mn}, ${app} м²/уп.) покрывает около ${formatNum(a)} м². Клей: ${formatNum(g)} кг (${Math.ceil(g / 25)} ведер, 25 кг). ${tools}`;
    });
    window.calculate17 = () => calcWithSelect(['inputValue17', 'result17'], ['material17', 'calcType17'], (iv, m, ct) => {
        const mats = {pir_logicpir: [0.72, 'PIR-плиты LOGICPIR, 50 мм'], pir_logicpir_prof: [2.83, 'PIR-плиты LOGICPIR PROF, 90 мм']};
        const [app, mn] = mats[m] || [0, ''], tools = 'Инструмент: пистолет для пены (1 шт), нож для резки PIR (200 мм, 1 шт).';
        if (ct === 'areaToMaterial') {
            const pl = Math.ceil(iv / app), f = iv * 0.75;
            return `Для ${iv} м² потребуется около ${pl} плит (${mn}, ${app} м²/плита). Пена: ${formatNum(f)} кг (${Math.ceil(f / 0.75)} банок, 0.75 кг/банка). ${tools}`;
        }
        const a = iv * app, f = a * 0.75;
        return `${iv} плит (${mn}, ${app} м²/плита) покрывает около ${formatNum(a)} м². Пена: ${formatNum(f)} кг (${Math.ceil(f / 0.75)} банок, 0.75 кг/банка). ${tools}`;
    });
    let pdfDoc18 = null;
    let currentPage18 = 1;
    let totalPages18 = 0;
    window.fetchPDFText = async function(url) {
        const pdf = await pdfjsLib.getDocument(url).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            content.items.forEach(item => fullText += item.str + ' ');
        }
        return fullText;
    };
    window.extractRollArea = function(text) {
        const simplified = text.replace(/\s+/g, ' ').toLowerCase();
        const lengthMatch = simplified.match(/длина[^0-9]*?±?\d*%{0,1}\s*(\d+[,.]?\s*\d*)/i);
        const widthMatch = simplified.match(/ширина[^0-9]*?±?\d*%{0,1}\s*(\d+[,.]?\s*\d*)/i);
        if (lengthMatch && widthMatch) {
            const normalize = str => str.replace(/\s+/g, '').replace(',', '.');
            const length = parseFloat(normalize(lengthMatch[1]));
            const width = parseFloat(normalize(widthMatch[1]));
            if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
                throw new Error("Некорректные размеры рулона.");
            }
            return +formatNum(length * width);
        }
        throw new Error("Не удалось определить размеры рулона из PDF.");
    };
    window.calculate18 = async function() {
        const area18Input = document.getElementById('area18');
        const material18El = document.getElementById('material18');
        const resultDiv = document.getElementById('result18');
        if (!area18Input || !material18El || !resultDiv) return;
        const area = parseNum(area18Input.value);
        const pdfUrl = material18El.value;
        if (area <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число для площади.';
            resultDiv.classList.remove('active');
            return;
        }
        try {
            const text = await fetchPDFText(pdfUrl);
            const rollArea = await extractRollArea(text);
            const requiredArea = area * 1.15; 
            const rollsNeeded = Math.ceil(requiredArea / rollArea);
            const tools = 'Инструмент: газовая горелка (1 шт на бригаду), зажигалка (1 комплект), нож для кровли (100 мм, 1 шт).';
            resultDiv.innerText = `Для ${area} м² потребуется ${rollsNeeded} рулон(ов) (площадь с запасом 15%: ${formatNum(requiredArea)} м², площадь одного рулона: ${rollArea} м²). ${tools}`;
            resultDiv.classList.add('active');
        } catch (err) {
            resultDiv.innerText = `Ошибка: ${err.message}`;
            resultDiv.classList.add('active');
        }
    };
    window.renderPDF18 = async function() {
        const url = document.getElementById('material18').value;
        const canvas = document.getElementById('pdf-canvas18');
        const context = canvas.getContext('2d');
        try {
            pdfDoc18 = await pdfjsLib.getDocument(url).promise;
            totalPages18 = pdfDoc18.numPages;
            currentPage18 = 1;
            document.getElementById('page-count18').textContent = totalPages18;
            document.getElementById('pdf-controls18').classList.add('active');
            canvas.classList.add('active');
            await renderPage18(currentPage18);
        } catch (err) {
            alert("Ошибка загрузки PDF: " + err.message);
        }
    };
    window.renderPage18 = async function(pageNum) {
        const canvas = document.getElementById('pdf-canvas18');
        const context = canvas.getContext('2d');
        const page = await pdfDoc18.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.3 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({
            canvasContext: context,
            viewport
        }).promise;
        document.getElementById('page-num18').textContent = pageNum;
    };
    window.prevPage18 = function() {
        if (currentPage18 <= 1) return;
        currentPage18--;
        renderPage18(currentPage18);
    };
    window.nextPage18 = function() {
        if (currentPage18 >= totalPages18) return;
        currentPage18++;
        renderPage18(currentPage18);
    };
    const customServiceForm = document.getElementById('custom-service-form');
    const serviceWorkersCheckboxGroup = document.getElementById('service-workers-checkbox-group');
    const serviceNameInput = customServiceForm.querySelector('input[name="serviceName"]');
    const serviceNameSuggestions = document.getElementById('service-name-suggestions');
    const serviceSelect = customServiceForm.querySelector('#service-select-custom');
    const serviceOptions = customServiceForm.querySelector('#service-options-custom');
    const expenseTypeSelect = document.getElementById('expense-type-select');
    const expenseTypeValue = document.getElementById('expense-type-value');
    const expenseTypeOptions = document.getElementById('expense-type-options');
    const objectForm = document.getElementById('object-form');
    const expenseForm = document.getElementById('expense-form');
    const manualPriceForm = document.getElementById('manual-price-form');
    const selectDisplay = document.getElementById('service-select');
    const selectedValue = document.getElementById('selected-value');
    const optionsList = document.getElementById('service-options');
    const manualSelectDisplay = document.getElementById('manual-service-select');
    const manualSelectedValue = document.getElementById('manual-selected-value');
    const manualOptionsList = document.getElementById('manual-service-options');
    const manualPriceLabel = document.getElementById('manual-price-label');
    const workersCheckboxGroup = document.getElementById('workers-checkbox-group');
    const expenseWorkersCheckboxGroup = document.getElementById('expense-workers-checkbox-group');
    const expenseReceiversCheckboxGroup = document.getElementById('expense-receivers-checkbox-group');
    const manualWorkersCheckboxGroup = document.getElementById('manual-workers-checkbox-group');
    const objectNameInput = objectForm.querySelector('input[name="objectName"]');
    const expenseNameInput = expenseForm.querySelector('input[name="expenseName"]');
    const manualObjectNameInput = manualPriceForm.querySelector('input[name="objectName"]');
    const objectNameSuggestions = document.getElementById('object-name-suggestions');
    const expenseNameSuggestions = document.getElementById('expense-name-suggestions') || document.createElement('ul');
    const manualObjectNameSuggestions = document.getElementById('manual-object-name-suggestions');
    const resultsDiv = document.getElementById('results');
    const workerStatsDiv = document.getElementById('worker-stats');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyList = document.getElementById('history-list');
    const filterInput = document.getElementById('object-filter');
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const filtersContent = document.querySelector('.filters-content');
    const filterPeriod = document.getElementById('filter-period');
    const customDates = document.querySelectorAll('.custom-dates');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const searchName = document.getElementById('search-name');
    const filterStatus = document.getElementById('filter-status');
    const filterType = document.getElementById('filter-type');
    const filterWorker = document.getElementById('filter-worker');
    const filterSumFrom = document.getElementById('filter-sum-from');
    const filterSumTo = document.getElementById('filter-sum-to');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const advancedFilters = {
        period: 'all',
        dateFrom: null,
        dateTo: null,
        search: '',
        status: 'all',
        type: 'all',
        worker: 'all',
        sumFrom: null,
        sumTo: null
    };
    function updateToggleFiltersLabel() {
        if (!toggleFiltersBtn || !filtersContent) return;
        const expanded = (getComputedStyle(filtersContent).display !== 'none');
        const isMobile = window.innerWidth <= 768;
        toggleFiltersBtn.textContent = isMobile
            ? (expanded ? '▲' : '▼')
            : (expanded ? 'Свернуть ▲' : 'Развернуть ▼');
    }
    if (toggleFiltersBtn) {
        updateToggleFiltersLabel();
        window.addEventListener('resize', updateToggleFiltersLabel);
        toggleFiltersBtn.addEventListener('click', () => {
            if (getComputedStyle(filtersContent).display === 'none') {
                filtersContent.style.display = 'block';
            } else {
                filtersContent.style.display = 'none';
            }
            updateToggleFiltersLabel();
        });
    }
    document.querySelectorAll('.toggle-section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            const textSpan = btn.querySelector('.text');
            if (targetElement) {
                if (targetElement.style.display === 'none') {
                    targetElement.style.display = targetElement.classList.contains('top-stats-grid') || 
                                                   targetElement.classList.contains('forecast-grid') ? 'grid' : 'block';
                    if (textSpan) textSpan.textContent = 'Свернуть ';
                    btn.innerHTML = `${textSpan ? textSpan.outerHTML : '<span class="text">Свернуть </span>'}▲`;
                    if (targetId === 'earnings-charts-container') {
                        setTimeout(() => {
                            if (window.timelineChart) window.timelineChart.resize();
                            if (window.pieChart) window.pieChart.resize();
                        }, 100);
                    }
                } else {
                    targetElement.style.display = 'none';
                    if (textSpan) textSpan.textContent = 'Развернуть ';
                    btn.innerHTML = `${textSpan ? textSpan.outerHTML : '<span class="text">Развернуть </span>'}▼`;
                }
            }
        });
    });
    if (filterPeriod) {
        filterPeriod.addEventListener('change', () => {
            const isCustom = filterPeriod.value === 'custom';
            customDates.forEach(el => {
                el.style.display = isCustom ? 'flex' : 'none';
            });
        });
    }
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            advancedFilters.period = filterPeriod.value;
            advancedFilters.dateFrom = dateFrom.value;
            advancedFilters.dateTo = dateTo.value;
            advancedFilters.search = searchName.value.trim().toLowerCase();
            advancedFilters.status = filterStatus.value;
            advancedFilters.type = filterType.value;
            advancedFilters.worker = filterWorker.value;
            advancedFilters.sumFrom = filterSumFrom.value ? parseFloat(filterSumFrom.value) : null;
            advancedFilters.sumTo = filterSumTo.value ? parseFloat(filterSumTo.value) : null;
            renderObjects();
            renderWorkerStats();
        });
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            filterPeriod.value = 'all';
            dateFrom.value = '';
            dateTo.value = '';
            searchName.value = '';
            filterStatus.value = 'all';
            filterType.value = 'all';
            filterWorker.value = 'all';
            filterSumFrom.value = '';
            filterSumTo.value = '';
            customDates.forEach(el => el.style.display = 'none');
            Object.keys(advancedFilters).forEach(key => {
                advancedFilters[key] = key === 'period' || key === 'status' || key === 'type' || key === 'worker' ? 'all' : null;
                if (key === 'search') advancedFilters[key] = '';
            });
            renderObjects();
            renderWorkerStats();
        });
    }
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const backupBtn = document.getElementById('backup-btn');
    const restoreBtn = document.getElementById('restore-btn');
    const restoreFileInput = document.getElementById('restore-file-input');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            const csv = generateCSV();
            downloadFile(csv, `Отчет_${new Date().toLocaleDateString('ru-RU')}.csv`, 'text/csv;charset=utf-8;');
        });
    }
    function generateCSV() {
        const headers = ['Дата', 'Название', 'Услуга', 'Площадь', 'Стоимость', 'Работники', 'Статус', 'Тип'];
        const rows = window.objects.map(obj => [
            parseDateSafe(obj.timestamp).toLocaleDateString('ru-RU'),
            obj.name || '-',
            obj.service || '-',
            obj.area || '-',
            obj.cost || '-',
            obj.workers.map(w => typeof w === 'string' ? w : w.name).join('; '),
            obj.isPaid ? 'Оплачено' : 'Не оплачено',
            obj.isExpense ? 'Расход' : (obj.manualPrice ? 'Ручная цена' : (obj.isCustomService ? 'Услуга' : 'Обычный'))
        ]);
        const csvContent = [
            '\uFEFF' + headers.join(','), 
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        return csvContent;
    }
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                objects: window.objects,
                workers: workers
            };
            const json = JSON.stringify(backup, null, 2);
            downloadFile(json, `Backup_${new Date().toLocaleDateString('ru-RU')}.json`, 'application/json');
            saveBackupToHistory(backup);
        });
    }
    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            restoreFileInput.click();
        });
    }
    if (restoreFileInput) {
        restoreFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    if (!event.target || !event.target.result) {
                        throw new Error('Не удалось прочитать файл');
                    }
                    const raw = JSON.parse(event.target.result);
                    const normalized = normalizeBackup(raw);
                    const restoredObjects = normalized.objects || [];
                    const restoredWorkers = normalized.workers || [];
                    if (confirm('Восстановить данные из резервной копии? Текущие данные будут перезаписаны.')) {
                        window.objects = Array.isArray(restoredObjects) ? restoredObjects : [];
                        workers = Array.isArray(restoredWorkers) && restoredWorkers.length > 0 ? restoredWorkers : (Array.isArray(workers) ? workers : []);
                        saveData();
                        populateWorkers();
                        renderObjects();
                        if (typeof renderWorkerStats === 'function') {
                            renderWorkerStats();
                        }
                        alert('Данные успешно восстановлены!');
                    }
                } catch (error) {
                    
                    alert('Ошибка при восстановлении: ' + (error.message || 'Неизвестная ошибка'));
                }
            };
            reader.readAsText(file);
            restoreFileInput.value = ''; 
        });
    }
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    function saveBackupToHistory(backup) {
        const backups = JSON.parse(localStorage.getItem('backups') || '[]');
        backups.push({
            timestamp: backup.timestamp,
            size: JSON.stringify(backup).length
        });
        if (backups.length > 10) {
            backups.shift();
        }
        localStorage.setItem('backups', JSON.stringify(backups));
        localStorage.setItem(`backup_${backup.timestamp}`, JSON.stringify(backup));
    }
    function saveData() {
        try {
            localStorage.setItem('objects', JSON.stringify(window.objects || []));
            localStorage.setItem('workersData', JSON.stringify(workers || []));
        } catch (e) {
            
        }
    }
    function normalizeBackup(input) {
        try {
            if (Array.isArray(input)) {
                return { objects: input.filter(obj => obj && typeof obj === 'object'), workers: Array.isArray(workers) ? workers : [] };
            }
            if (input && typeof input === 'object' && !Array.isArray(input)) {
                const normalized = { objects: [], workers: [] };
                if (Array.isArray(input.objects)) {
                    normalized.objects = input.objects.filter(obj => obj && typeof obj === 'object');
                } else if (Array.isArray(input.data)) {
                    normalized.objects = input.data.filter(obj => obj && typeof obj === 'object');
                }
                if (Array.isArray(input.workers)) {
                    normalized.workers = input.workers.map(w => {
                        if (typeof w === 'string') return { name: w, role: 'worker' };
                        if (w && typeof w === 'object' && w.name) return { name: w.name, role: w.role || 'worker', percentage: w.percentage || 0 };
                        return null;
                    }).filter(w => w !== null);
                } else if (Array.isArray(workers)) {
                    normalized.workers = workers;
                }
                if (!normalized.workers.length && Array.isArray(workers)) normalized.workers = workers;
                return normalized;
            }
            return { objects: [], workers: Array.isArray(workers) ? workers : [] };
        } catch (error) {
            
            return { objects: [], workers: Array.isArray(workers) ? workers : [] };
        }
    }
    function renderForecast() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const currentMonthObjects = window.objects.filter(obj => {
            if (obj.isExpense) return false;
            const objDate = new Date(obj.timestamp);
            return objDate.getMonth() === currentMonth && objDate.getFullYear() === currentYear;
        });
        const lastMonthObjects = window.objects.filter(obj => {
            if (obj.isExpense) return false;
            const objDate = new Date(obj.timestamp);
            return objDate.getMonth() === lastMonth && objDate.getFullYear() === lastMonthYear;
        });
        const lastThreeMonthsIncome = [];
        for (let i = 0; i < 3; i++) {
            const targetMonth = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
            const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            const monthIncome = window.objects
                .filter(obj => {
                    if (obj.isExpense) return false;
                    const objDate = new Date(obj.timestamp);
                    return objDate.getMonth() === targetMonth && objDate.getFullYear() === targetYear;
                })
                .reduce((sum, obj) => sum + parseFloat(obj.cost || 0), 0);
            lastThreeMonthsIncome.push(monthIncome);
        }
        const avgIncome = lastThreeMonthsIncome.reduce((a, b) => a + b, 0) / 3;
        const avgObjects = window.objects.filter(obj => !obj.isExpense).length / Math.max(1, Math.ceil((now - new Date(window.objects[0]?.timestamp || now)) / (30 * 24 * 60 * 60 * 1000)));
        const currentIncome = currentMonthObjects.reduce((sum, obj) => sum + parseFloat(obj.cost || 0), 0);
        const lastIncome = lastMonthObjects.reduce((sum, obj) => sum + parseFloat(obj.cost || 0), 0);
        const trend = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100) : 0;
        document.getElementById('forecast-income').textContent = `${formatNum(avgIncome, 0)} ₽`;
        document.getElementById('forecast-objects').textContent = Math.round(avgObjects);
        document.getElementById('forecast-trend').textContent = `${trend > 0 ? '+' : ''}${formatNum(trend, 1)}%`;
        document.getElementById('forecast-trend').style.color = trend > 0 ? '#27ae60' : trend < 0 ? '#e74c3c' : '#95a5a6';
    }
    window.renderForecast = renderForecast;
    window.objects = [];
    let workers = [], editMode = false;
    const getWorkerRole = (n) => { const w = workers.find(x => (typeof x === 'object' ? x.name : x) === n); return w && typeof w === 'object' ? (w.role || 'worker') : 'worker'; };
    const getWorkerName = (w) => typeof w === 'object' ? w.name : w;
    const isForeman = (n) => getWorkerRole(n) === 'foreman';
    const getWorkerIcon = (n) => isForeman(n) ? '<span class="foreman-icon">👷</span>' : '<span class="worker-icon">👨‍🔧</span>';
    const getWorkerPercentage = (n) => { const w = workers.find(x => (typeof x === 'object' ? x.name : x) === n); return w && typeof w === 'object' ? (w.percentage || 0) : 0; };
    function populateWorkers() {
        if (!Array.isArray(workers) || !workers.length) {
            [workersCheckboxGroup, expenseWorkersCheckboxGroup, expenseReceiversCheckboxGroup, manualWorkersCheckboxGroup, serviceWorkersCheckboxGroup].forEach(g => {
                if (g) g.innerHTML = '<div class="no-data">Нет работников</div>';
            });
            return;
        }
        const createCB = (name, group, prefix, ktu, area, amount) => {
            if (!name || !group) return;
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="${prefix}workers" value="${name}"><span class="worker-label">${name}</span>${ktu ? `<input type="text" inputmode="decimal" class="ktu-input" name="${prefix}ktu_${name}" placeholder="КТУ" disabled>` : ''}${area ? `<input type="text" inputmode="decimal" class="area-input" name="${prefix}area_${name}" placeholder="Площадь (м²)" disabled>` : ''}${amount ? `<input type="text" inputmode="decimal" class="amount-input" name="${prefix}amount_${name}" placeholder="Сумма (₽)" disabled>` : ''}`;
            if (group.appendChild) group.appendChild(label);
            const cb = label.querySelector('input[type="checkbox"]');
            if (ktu) {
                const ktuIn = label.querySelector('.ktu-input');
                cb.addEventListener('change', () => { ktuIn.disabled = !cb.checked; if (!cb.checked) ktuIn.value = ''; });
            }
            if (area) {
                const areaIn = label.querySelector('.area-input');
                cb.addEventListener('change', () => { areaIn.disabled = !cb.checked; if (!cb.checked) areaIn.value = ''; updateAreaDistribution(prefix); });
                areaIn.addEventListener('input', () => updateAreaDistribution(prefix));
            }
            if (amount) {
                const amtIn = label.querySelector('.amount-input');
                cb.addEventListener('change', () => { amtIn.disabled = !cb.checked; if (!cb.checked) amtIn.value = ''; });
            }
        };
        [workersCheckboxGroup, expenseWorkersCheckboxGroup, expenseReceiversCheckboxGroup, manualWorkersCheckboxGroup, serviceWorkersCheckboxGroup].forEach(g => { if (g) g.innerHTML = ''; });
        workers.forEach(w => {
            if (!w) return;
            const name = getWorkerName(w);
            if (!name) return;
            if (workersCheckboxGroup) createCB(name, workersCheckboxGroup, '', true, true, false);
            if (expenseWorkersCheckboxGroup) createCB(name, expenseWorkersCheckboxGroup, 'expense', false, false, false);
            if (expenseReceiversCheckboxGroup) createCB(name, expenseReceiversCheckboxGroup, 'expenseReceivers', false, false, false);
            if (manualWorkersCheckboxGroup) createCB(name, manualWorkersCheckboxGroup, 'manual', true, true, false);
            if (serviceWorkersCheckboxGroup) createCB(name, serviceWorkersCheckboxGroup, 'service', true, false, false);
            [objectForm, expenseForm, manualPriceForm, customServiceForm].forEach(f => {
                const g = f ? f.querySelector('.issued-money-group .checkbox-group') : null;
                if (g) createCB(name, g, 'issued', false, false, true);
            });
        });
        if (filterWorker) {
            filterWorker.innerHTML = '<option value="all">Все работники</option>';
            workers.forEach(w => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = getWorkerName(w);
                filterWorker.appendChild(opt);
            });
        }
    }
    let prices = [];
    let customServiceNames = [];
    let customServices = [];
    let expenseTypes = [];
    serviceSelect.addEventListener('click', () => {
        serviceOptions.classList.toggle('show');
    });
    serviceOptions.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const selectedValue = e.target.getAttribute('data-value');
            serviceSelect.innerHTML = `${selectedValue} <span class="dropdown-icon">▾</span>`;
            serviceSelect.value = selectedValue;
            toggleInputState(customServiceForm, 'serviceName', serviceSelect);
            serviceOptions.classList.remove('show');
        }
    });
    expenseNameSuggestions.id = 'expense-name-suggestions';
    expenseNameSuggestions.className = 'suggestions-list';
    if (!expenseNameInput.nextElementSibling) expenseNameInput.parentElement.appendChild(expenseNameSuggestions);
    objectForm.querySelector('button[type="submit"]').textContent = 'Добавить объект';
    expenseForm.querySelector('button[type="submit"]').textContent = 'Добавить расход';
    manualPriceForm.querySelector('button[type="submit"]').textContent = 'Добавить объект';
    customServiceForm.querySelector('button[type="submit"]').textContent = 'Добавить услугу';
    function toggleServiceOptions() {
        optionsList.classList.toggle('show');
    }
    function selectServiceOption(e) {
        const selectedValueText = e.target.getAttribute('data-value');
        selectDisplay.innerHTML = `${e.target.textContent} <span class="dropdown-icon">▾</span>`;
        selectedValue.value = selectedValueText;
        optionsList.classList.remove('show');
    }
    function toggleManualServiceOptions() {
        manualOptionsList.classList.toggle('show');
    }
    function selectManualServiceOption(e) {
        const selectedValueText = e.target.getAttribute('data-value');
        const [name, unit] = selectedValueText.split('|');
        manualSelectDisplay.innerHTML = `${name} (${unit}) <span class="dropdown-icon">▾</span>`;
        manualSelectedValue.value = selectedValueText;
        manualPriceLabel.textContent = `Цена за ${unit} (₽):`;
        manualOptionsList.classList.remove('show');
    }
    function showForm(formToShow) {
        [objectForm, expenseForm, manualPriceForm, customServiceForm].forEach(f => {
            const cancelBtn = f.querySelector('.cancel-btn');
            const submitBtn = f.querySelector('button[type="submit"]');
            if (f === formToShow) {
                f.style.display = 'block';
                resetFormFields(f);
                if (f === expenseForm) toggleFuelCalcMode();
                cancelBtn.onclick = () => {
                    f.reset();
                    resetFormFields(f);
                    f.dataset.isEditing = 'false';
                    f.dataset.editIndex = '';
                    submitBtn.textContent = f === expenseForm ? 'Добавить расход' :
                    (f === customServiceForm ? 'Добавить услугу' : 'Добавить объект');
                    if (f === expenseForm) {
                        expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                        expenseTypeValue.value = '';
                        toggleInputState(f, 'expenseName', expenseTypeValue);
                        f.querySelector('.fuel-calc-mode').style.display = 'none';
                    } else if (f === customServiceForm) {
                        serviceSelect.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                        serviceSelect.value = '';
                        toggleInputState(f, 'serviceName', serviceSelect);
                    } else if (f === manualPriceForm) {
                        manualSelectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                        manualSelectedValue.value = '';
                    } else {
                        selectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                        selectedValue.value = '';
                    }
                    f.onsubmit = f === expenseForm ?
                    (e) => addObject(e, true) :
                    (f === customServiceForm ?
                    customServiceForm.onsubmit :
                    (f === manualPriceForm ? (e) => addObject(e, false, true) : (e) => addObject(e)));
                    showForm(null);
                };
                if (f === objectForm) {
                    selectDisplay.removeEventListener('click', toggleServiceOptions);
                    selectDisplay.addEventListener('click', toggleServiceOptions);
                    optionsList.querySelectorAll('li').forEach(li => {
                        li.removeEventListener('click', selectServiceOption);
                        li.addEventListener('click', selectServiceOption);
                    });
                }
                if (f === manualPriceForm) {
                    populateManualServiceSelect(prices, manualSelectDisplay, manualSelectedValue, manualOptionsList, manualPriceLabel); 
                    manualSelectDisplay.removeEventListener('click', toggleManualServiceOptions);
                    manualSelectDisplay.addEventListener('click', toggleManualServiceOptions);
                    manualOptionsList.querySelectorAll('li').forEach(li => {
                        li.removeEventListener('click', selectManualServiceOption);
                        li.addEventListener('click', selectManualServiceOption);
                    });
                }
            } else {
                f.style.display = 'none';
            }
        });
        if (formToShow) populateSuggestions(formToShow);
    }
    function resetFormFields(form) {
        const lengthInput = form.querySelector('input[name="length"]');
        const widthInput = form.querySelector('input[name="width"]');
        const areaInput = form.querySelector('input[name="area"]');
        if (lengthInput && widthInput && areaInput) {
            lengthInput.disabled = false;
            widthInput.disabled = false;
            areaInput.disabled = false;
        }
        if (form === expenseForm) {
            const fuelModeRadios = form.querySelectorAll('input[name="fuelMode"]');
            const amountInput = form.querySelector('input[name="expenseAmount"]');
            const distanceInput = form.querySelector('.distance-input');
            fuelModeRadios.forEach(radio => radio.checked = radio.value === 'amount');
            amountInput.style.display = 'block';
            distanceInput.style.display = 'none';
        }
        const rostikMethodCheckbox = form.querySelector('input[name="useRostikMethod"]');
        if (rostikMethodCheckbox) rostikMethodCheckbox.checked = false;
    }
    function toggleInputState(form, inputName, selectElement) {
        const inputWrapper = form.querySelector(`.form-group:has(input[name="${inputName}"])`);
        const input = inputWrapper.querySelector(`input[name="${inputName}"]`);
        const selectedValue = selectElement.value || (selectElement.tagName === 'DIV' ? selectElement.textContent.trim().split(' ')[0] : '');
        if (form === customServiceForm) {
            if (selectedValue && selectedValue !== "Своё название" && selectedValue !== "Выберите") {
                inputWrapper.style.display = 'none';
                input.disabled = true;
                input.value = '';
            } else {
                inputWrapper.style.display = 'block';
                input.disabled = false;
                input.focus();
            }
        } else if (form === expenseForm) {
            if (selectedValue === "Своё название") {
                inputWrapper.style.display = 'block';
                input.disabled = false;
                input.focus();
            } else if (selectedValue && selectedValue !== "Выберите") {
                inputWrapper.style.display = 'none';
                input.disabled = true;
                input.value = '';
            } else {
                inputWrapper.style.display = 'none';
                input.disabled = true;
                input.value = '';
            }
            toggleFuelCalcMode();
        } else {
            if (selectedValue && selectedValue !== "Своё название" && selectedValue !== "Выберите") {
                input.disabled = true;
                input.value = '';
            } else {
                input.disabled = false;
            }
        }
    }
    function toggleFuelCalcMode() {
        const expenseNameInput = expenseForm.querySelector('input[name="expenseName"]');
        const expenseName = expenseNameInput.disabled || expenseNameInput.style.display === 'none'
        ? expenseTypeValue.value.trim()
        : expenseNameInput.value.trim();
        const fuelCalcMode = expenseForm.querySelector('.fuel-calc-mode');
        const amountInput = expenseForm.querySelector('input[name="expenseAmount"]');
        const distanceInput = expenseForm.querySelector('.distance-input');
        const mileageInput = expenseForm.querySelector('.mileage-input');
        const distanceValueInput = distanceInput.querySelector('input[name="distance"]');
        const startMileageInput = mileageInput.querySelector('input[name="startMileage"]');
        const endMileageInput = mileageInput.querySelector('input[name="endMileage"]');
        const radioButtons = expenseForm.querySelectorAll('input[name="fuelMode"]');
        const receivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked'))
            .map(input => input && input.value ? input.value : null)
            .filter(r => r !== null);
        if (expenseName.toLowerCase() === 'бензин' && receivers.length > 0) {
            fuelCalcMode.style.display = 'block';
            radioButtons.forEach(radio => {
                radio.removeEventListener('change', updateFuelModeDisplay);
                radio.addEventListener('change', updateFuelModeDisplay);
            });
            updateFuelModeDisplay();
        } else {
            fuelCalcMode.style.display = 'none';
            amountInput.style.display = 'block';
            distanceInput.style.display = 'none';
            mileageInput.style.display = 'none';
            amountInput.removeAttribute('readonly');
            amountInput.setAttribute('required', 'required');
            distanceValueInput.removeAttribute('required');
            startMileageInput.removeAttribute('required');
            endMileageInput.removeAttribute('required');
            distanceValueInput.value = '';
            startMileageInput.value = '';
            endMileageInput.value = '';
        }
        function updateFuelModeDisplay() {
            const selectedMode = expenseForm.querySelector('input[name="fuelMode"]:checked').value;
            const fuelConsumption = 6.7; 
            const fuelPrice = 61; 
            if (selectedMode === 'amount') {
                amountInput.style.display = 'block';
                distanceInput.style.display = 'none';
                mileageInput.style.display = 'none';
                amountInput.removeAttribute('readonly');
                amountInput.setAttribute('required', 'required');
                distanceValueInput.removeAttribute('required');
                startMileageInput.removeAttribute('required');
                endMileageInput.removeAttribute('required');
                distanceValueInput.value = '';
                startMileageInput.value = '';
                endMileageInput.value = '';
            } else if (selectedMode === 'distance') {
                amountInput.style.display = 'block';
                distanceInput.style.display = 'block';
                mileageInput.style.display = 'none';
                amountInput.setAttribute('readonly', 'true');
                amountInput.removeAttribute('required');
                distanceValueInput.setAttribute('required', 'required');
                startMileageInput.removeAttribute('required');
                endMileageInput.removeAttribute('required');
                startMileageInput.value = '';
                endMileageInput.value = '';
                distanceValueInput.addEventListener('input', () => {
                    const distance = parseFloat(distanceValueInput.value) || 0;
                    const liters = (distance * fuelConsumption) / 100;
                    const calculatedAmount = -(liters * fuelPrice);
                    amountInput.value = distance > 0 ? formatNum(calculatedAmount) : '';
                });
                const distance = parseFloat(distanceValueInput.value) || 0;
                const liters = (distance * fuelConsumption) / 100;
                amountInput.value = distance > 0 ? formatNum(-(liters * fuelPrice)) : '';
            } else if (selectedMode === 'mileage') {
                amountInput.style.display = 'block';
                distanceInput.style.display = 'none';
                mileageInput.style.display = 'block';
                amountInput.setAttribute('readonly', 'true');
                amountInput.removeAttribute('required');
                distanceValueInput.removeAttribute('required');
                startMileageInput.setAttribute('required', 'required');
                endMileageInput.setAttribute('required', 'required');
                distanceValueInput.value = '';
                function updateMileageCalculation() {
                    const start = parseFloat(startMileageInput.value) || 0;
                    const end = parseFloat(endMileageInput.value) || 0;
                    const distance = end > start ? end - start : 0;
                    const liters = (distance * fuelConsumption) / 100;
                    const calculatedAmount = -(liters * fuelPrice);
                    amountInput.value = distance > 0 ? formatNum(calculatedAmount) : '';
                }
                startMileageInput.addEventListener('input', updateMileageCalculation);
                endMileageInput.addEventListener('input', updateMileageCalculation);
                updateMileageCalculation();
            }
        }
    }
    function populateSuggestions(activeForm) {
        const uniqueObjectNames = [...new Set(window.objects.filter(obj => !obj.isExpense && !obj.isCustomService).map(obj => obj.name))];
        const uniqueExpenseNames = [...new Set(window.objects.filter(obj => obj.isExpense).map(obj => obj.name))];
        const renderSuggestions = (input, suggestionsList, names) => {
            suggestionsList.innerHTML = '';
            const inputValue = input.value.trim().toLowerCase();
            const filteredNames = names.filter(name => name.toLowerCase().includes(inputValue));
            filteredNames.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                li.addEventListener('click', () => {
                    input.value = name;
                    suggestionsList.classList.remove('show');
                    if (activeForm === expenseForm) toggleFuelCalcMode();
                });
                    suggestionsList.appendChild(li);
            });
            if (filteredNames.length > 0 && inputValue && !input.disabled) suggestionsList.classList.add('show');
            else suggestionsList.classList.remove('show');
        };
            if (activeForm === expenseForm && !expenseNameInput.disabled) {
                renderSuggestions(expenseNameInput, expenseNameSuggestions, uniqueExpenseNames);
            } else if (activeForm === objectForm) {
                renderSuggestions(objectNameInput, objectNameSuggestions, uniqueObjectNames);
            } else if (activeForm === manualPriceForm) {
                renderSuggestions(manualObjectNameInput, manualObjectNameSuggestions, uniqueObjectNames);
            } else if (activeForm === customServiceForm) {
                renderSuggestions(serviceNameInput, serviceNameSuggestions, customServiceNames);
            }
    }
    expenseTypeSelect.addEventListener('click', () => expenseTypeOptions.classList.toggle('show'));
    expenseTypeOptions.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const selectedValue = e.target.getAttribute('data-value');
            expenseTypeSelect.innerHTML = `${selectedValue} <span class="dropdown-icon">▾</span>`;
            expenseTypeValue.value = selectedValue;
            toggleInputState(expenseForm, 'expenseName', expenseTypeValue);
            expenseTypeOptions.classList.remove('show');
        }
    });
    expenseNameInput.addEventListener('input', () => {
        toggleFuelCalcMode();
        populateSuggestions(expenseForm);
    });
    expenseReceiversCheckboxGroup.addEventListener('change', toggleFuelCalcMode);
    document.addEventListener('click', (e) => {
        if (!selectDisplay.contains(e.target) && !optionsList.contains(e.target)) optionsList.classList.remove('show');
        if (!manualSelectDisplay.contains(e.target) && !manualOptionsList.contains(e.target)) manualOptionsList.classList.remove('show');
        if (!serviceSelect.contains(e.target) && !serviceOptions.contains(e.target)) serviceOptions.classList.remove('show');
        if (!expenseTypeSelect.contains(e.target) && !expenseTypeOptions.contains(e.target)) expenseTypeOptions.classList.remove('show');
    });
        function loadData() {
            const expenseAmountInput = expenseForm.querySelector('input[name="expenseAmount"]');
            expenseAmountInput.addEventListener('focus', () => {
                if (!expenseAmountInput.value.startsWith('-')) expenseAmountInput.value = '-';
            });
            expenseAmountInput.addEventListener('input', () => {
                const value = expenseAmountInput.value;
                if (value === '-' || value === '') return;
                if (!value.startsWith('-')) {
                    expenseAmountInput.value = '-' + value.replace('-', '');
                } else if (parseFloat(value) >= 0 && value !== '-') {
                    expenseAmountInput.value = '-' + Math.abs(parseFloat(value)).toString();
                }
            });
            const fetchOptions = {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-store'
                }
            };
            const maxRetries = 3;
            const retryDelay = 1000; 
            async function fetchWithRetry(url, retryCount = 0) {
                try {
                    const response = await fetch(url, fetchOptions);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    
                    if (retryCount < maxRetries) {
                        
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return fetchWithRetry(url, retryCount + 1);
                    }
                    
                    return null;
                }
            }
            async function loadAllData() {
                try {
                    const [objectsData, workersData, pricesData, customServicesData, expenseTypesData] = await Promise.all([
                        fetchWithRetry('../upload/save.json'),
                        fetchWithRetry('../workers.json'),
                        fetchWithRetry('../prices.json'),
                        fetchWithRetry('../custom-services.json'),
                        fetchWithRetry('../expense-types.json')
                    ]);
                    if (!objectsData) {
                        
                        window.objects = [];
                    } else {
                        window.objects = objectsData;
                    }
                    if (!workersData) {
                        
                        workers = [
                            { name: 'Артём', role: 'foreman' },
                            { name: 'Коля', role: 'foreman' },
                            { name: 'Слава', role: 'worker' },
                            { name: 'Женя', role: 'worker' }
                        ];
                    } else {
                        workers = workersData;
                    }
                    if (!pricesData) {
                        
                        prices = [];
                    } else {
                        prices = pricesData;
                    }
                    if (!customServicesData) {
                        
                        customServices = [];
                    } else {
                        customServices = customServicesData;
                    }
                    if (!expenseTypesData) {
                        
                        expenseTypes = [];
                    } else {
                        expenseTypes = expenseTypesData;
                    }
                    expenseTypes.unshift({ name: "Своё название" });
                    expenseTypes.push({ name: "Еда" }, { name: "Займ" });
                    customServices.unshift({ name: "Своё название" });
                    customServiceNames = [...new Set(window.objects.filter(obj => obj.isCustomService).map(obj => obj.name))];
                    renderObjects();
                    renderWorkerStats();
                    populateWorkers();
                    populateServiceSelect(prices, selectDisplay, selectedValue, optionsList);
                    populateManualServiceSelect(prices, manualSelectDisplay, manualSelectedValue, manualOptionsList, manualPriceLabel);
                    populateCustomServiceSelect(customServices);
                    populateExpenseTypeSelect(expenseTypes);
                    populateSuggestions(objectForm);
                    toggleInputState(expenseForm, 'expenseName', expenseTypeValue);
                    toggleInputState(customServiceForm, 'serviceName', serviceSelect);
                } catch (error) {
                    
                    alert('Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу или попробуйте позже.');
                }
            }
            loadAllData();
        }
        loadData();
        customServiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isEditing = customServiceForm.dataset.isEditing === 'true';
            const serviceName = (serviceNameInput.disabled || serviceNameInput.style.display === 'none') ? serviceSelect.value : serviceNameInput.value.trim();
            const servicePrice = parseFloat(customServiceForm.querySelector('input[name="servicePrice"]').value);
            const isPaid = customServiceForm.querySelector('input[name="isPaid"]').checked;
            const useRostikMethod = customServiceForm.querySelector('input[name="useRostikMethod"]').checked;
            const workersData = Array.from(serviceWorkersCheckboxGroup.querySelectorAll('input:checked'))
                .map(input => {
                    if (!input || !input.value) return null;
                    const ktuInput = customServiceForm.querySelector(`input[name="servicektu_${input.value}"]`);
                    return { 
                        name: input.value, 
                        ktu: (ktuInput && ktuInput.value) ? parseFloat(ktuInput.value) : 1 
                    };
                })
                .filter(w => w !== null);
            const issuedMoney = Array.from(customServiceForm.querySelectorAll('.issued-money-group input[type="checkbox"]:checked')).map(cb => {
                const amt = parseFloat(customServiceForm.querySelector(`input[name="issuedamount_${cb.value}"]`)?.value || 0);
                return amt > 0 ? {name: cb.value, amount: formatNum(amt)} : null;
            }).filter(Boolean);
            if (!serviceName || isNaN(servicePrice) || servicePrice <= 0 || workersData.length === 0 || workersData.some(w => w.ktu <= 0)) {
                alert('Заполните все поля корректно!');
                return;
            }
            const calcRostikService = () => {
                const nw = workersData.length, bapw = servicePrice / nw;
                let iwc = workersData.map(w => ({name: w.name, ktu: w.ktu, cost: bapw * w.ktu}));
                const rem = servicePrice - iwc.reduce((s, w) => s + w.cost, 0), w1 = workersData.filter(w => w.ktu === 1).length;
                return iwc.map(w => ({name: w.name, ktu: w.ktu, cost: formatNum(w.ktu === 1 && w1 > 0 && rem > 0 ? w.cost + rem / w1 : w.cost)}));
            };
            const totalKtu = workersData.reduce((s, w) => s + w.ktu, 0);
            const object = {name: serviceName, service: serviceName, cost: formatNum(servicePrice), workers: useRostikMethod ? calcRostikService() : workersData.map(w => ({name: w.name, ktu: w.ktu, cost: formatNum(servicePrice * w.ktu / totalKtu)})), timestamp: new Date().toISOString(), isExpense: false, isCustomService: true, isPaid: isPaid, useRostikMethod: useRostikMethod, issuedMoney, editHistory: isEditing ? window.objects[customServiceForm.dataset.editIndex]?.editHistory || [] : []};
            if (isEditing) {
                const index = parseInt(customServiceForm.dataset.editIndex);
                const oldObj = window.objects[index];
                const changes = [];
                if (serviceName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${serviceName}"`);
                if (servicePrice !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${servicePrice}`);
                if (JSON.stringify(object.workers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${object.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
                if (isPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${isPaid ? 'Выплачено' : 'Не выплачено'}"`);
                if (useRostikMethod !== oldObj.useRostikMethod) changes.push(`Методика: "${oldObj.useRostikMethod ? 'Ростиковская' : 'Стандартная'}" → "${useRostikMethod ? 'Ростиковская' : 'Стандартная'}"`);
                const oldIssuedMoneyStr = oldObj.issuedMoney ? oldObj.issuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                const newIssuedMoneyStr = issuedMoney.length > 0 ? issuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                if (oldIssuedMoneyStr !== newIssuedMoneyStr) {
                    changes.push(`Выданные деньги: "${oldIssuedMoneyStr}" → "${newIssuedMoneyStr}"`);
                }
                if (changes.length > 0) {
                    object.editedTimestamp = new Date().toISOString();
                    object.editHistory.push({ timestamp: object.editedTimestamp, changes: changes.join(', ') });
                }
                object.isPaid = isPaid;
                window.objects[index] = object;
            } else {
                window.objects.unshift(object);
            }
            customServiceNames = [...new Set(window.objects.filter(obj => obj.isCustomService).map(obj => obj.name))];
            renderObjects();
            renderWorkerStats();
            populateSuggestions(customServiceForm);
            customServiceForm.reset();
            customServiceForm.dataset.isEditing = 'false';
            customServiceForm.dataset.editIndex = '';
            showForm(null);
            alert(isEditing ? 'Услуга изменена.' : 'Услуга добавлена.');
        });
        objectForm.addEventListener('submit', (e) => {
            if (objectForm.dataset.isEditing !== 'true') addObject(e);
        });
            expenseForm.addEventListener('submit', (e) => {
                if (expenseForm.dataset.isEditing !== 'true') addObject(e, true);
            });
                manualPriceForm.addEventListener('submit', (e) => {
                    if (manualPriceForm.dataset.isEditing !== 'true') addObject(e, false, true);
                });
                    window.updateAreaDistribution = function(prefix) {
                        const formToUse = prefix === 'manual' ? manualPriceForm : objectForm;
                        const checkboxGroup = prefix === 'manual' ? manualWorkersCheckboxGroup : workersCheckboxGroup;
                        const warningDiv = document.getElementById(prefix === 'manual' ? 'manual-area-warning' : 'area-warning');
                        const totalAreaInput = formToUse.querySelector('input[name="area"]');
                        if (!totalAreaInput || !totalAreaInput.value) {
                            if (warningDiv) warningDiv.style.display = 'none';
                            return;
                        }
                        const totalArea = parseFloat(totalAreaInput.value) || 0;
                        if (totalArea === 0) {
                            if (warningDiv) warningDiv.style.display = 'none';
                            return;
                        }
                        const checkedWorkers = Array.from(checkboxGroup.querySelectorAll('input[type="checkbox"]:checked'));
                        let distributedArea = 0;
                        checkedWorkers.forEach(checkbox => {
                            const workerName = checkbox.value;
                            const areaInput = formToUse.querySelector(`input[name="${prefix}area_${workerName}"]`);
                            if (areaInput && areaInput.value) {
                                distributedArea += parseFloat(areaInput.value) || 0;
                            }
                        });
                        const remainingArea = totalArea - distributedArea;
                        if (warningDiv) {
                            if (Math.abs(remainingArea) < 0.01) {
                                warningDiv.className = 'area-warning success';
                                warningDiv.textContent = '✓ Вся площадь распределена';
                                warningDiv.style.display = 'block';
                            } else if (remainingArea > 0) {
                                warningDiv.className = 'area-warning info';
                                warningDiv.textContent = `⚠ Осталось распределить: ${formatNum(remainingArea)} м²`;
                                warningDiv.style.display = 'block';
                            } else {
                                warningDiv.className = 'area-warning error';
                                warningDiv.textContent = `⚠ Превышение площади на: ${formatNum(Math.abs(remainingArea))} м²`;
                                warningDiv.style.display = 'block';
                            }
                        }
                    };
                    window.distributeAreaEqually = function(prefix) {
                        const formToUse = prefix === 'manual' ? manualPriceForm : objectForm;
                        const checkboxGroup = prefix === 'manual' ? manualWorkersCheckboxGroup : workersCheckboxGroup;
                        const distributeInput = document.getElementById(prefix === 'manual' ? 'manual-distribute-area-amount' : 'distribute-area-amount');
                        if (!distributeInput || !distributeInput.value) {
                            alert('Введите площадь для распределения!');
                            return;
                        }
                        const areaToDistribute = parseFloat(distributeInput.value);
                        if (areaToDistribute <= 0) {
                            alert('Площадь должна быть больше нуля!');
                            return;
                        }
                        const checkedWorkers = Array.from(checkboxGroup.querySelectorAll('input[type="checkbox"]:checked'));
                        if (checkedWorkers.length === 0) {
                            alert('Выберите участников для распределения площади!');
                            return;
                        }
                        const areaPerWorker = areaToDistribute / checkedWorkers.length;
                        checkedWorkers.forEach(checkbox => {
                            const workerName = checkbox.value;
                            const areaInput = formToUse.querySelector(`input[name="${prefix}area_${workerName}"]`);
                            if (areaInput) {
                                const currentArea = parseFloat(areaInput.value) || 0;
                                areaInput.value = formatNum(currentArea + areaPerWorker);
                            }
                        });
                        distributeInput.value = '';
                        updateAreaDistribution(prefix);
                    };
                    function addObject(e, isExpense = false, isManual = false) {
                        e.preventDefault();
                        const formToUse = isExpense ? expenseForm : (isManual ? manualPriceForm : objectForm);
                        const isPaid = formToUse.querySelector('input[name="isPaid"]').checked;
                        const issuedMoney = Array.from(formToUse.querySelectorAll('.issued-money-group input[type="checkbox"]:checked')).map(cb => {
                            const amt = parseFloat(formToUse.querySelector(`input[name="issuedamount_${cb.value}"]`)?.value || 0);
                            return amt > 0 ? {name: cb.value, amount: formatNum(amt)} : null;
                        }).filter(Boolean);
                        let object;
                        if (isExpense) {
                            const expenseName = (formToUse.querySelector('input[name="expenseName"]')?.disabled || formToUse.querySelector('input[name="expenseName"]')?.style.display === 'none') ? expenseTypeValue.value.trim() : formToUse.querySelector('input[name="expenseName"]').value.trim();
                            let expenseAmount;
                            const workers = Array.from(expenseWorkersCheckboxGroup.querySelectorAll('input:checked')).map(i => i?.value).filter(Boolean);
                            const receivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked')).map(i => i?.value).filter(Boolean);
                            if (!expenseName || workers.length === 0) {
                                alert('Заполните все обязательные поля: выберите тип расхода или введите название и укажите участников!');
                                return;
                            }
                            if (expenseName.toLowerCase() === 'бензин' && receivers.length > 0) {
                                const fuelMode = formToUse.querySelector('input[name="fuelMode"]:checked').value;
                                const fuelConsumption = 6.7;
                                const fuelPrice = 61;
                                if (fuelMode === 'amount') {
                                    expenseAmount = parseFloat(formToUse.querySelector('input[name="expenseAmount"]').value);
                                    if (isNaN(expenseAmount) || expenseAmount >= 0) {
                                        alert('Укажите корректную отрицательную сумму расхода!');
                                        return;
                                    }
                                    object = {name: expenseName, service: 'Расход', cost: formatNum(expenseAmount), workers, receivers, timestamp: new Date().toISOString(), isExpense: true, isPaid: isPaid, issuedMoney, editHistory: []};
                                } else if (fuelMode === 'distance') {
                                    const distance = parseFloat(formToUse.querySelector('input[name="distance"]').value);
                                    if (isNaN(distance) || distance <= 0) {
                                        alert('Введите корректное расстояние!');
                                        return;
                                    }
                                    const liters = (distance * fuelConsumption) / 100;
                                    expenseAmount = -(liters * fuelPrice);
                                    object = {name: expenseName, service: 'Расход', cost: formatNum(expenseAmount), workers, receivers, timestamp: new Date().toISOString(), isExpense: true, distance: formatNum(distance), issuedMoney, editHistory: []};
                                } else if (fuelMode === 'mileage') {
                                    const startMileage = parseFloat(formToUse.querySelector('input[name="startMileage"]').value);
                                    const endMileage = parseFloat(formToUse.querySelector('input[name="endMileage"]').value);
                                    if (isNaN(startMileage) || isNaN(endMileage) || startMileage < 0 || endMileage < 0 || endMileage <= startMileage) {
                                        alert('Введите корректные значения начального и конечного километража (конечный должен быть больше начального)!');
                                        return;
                                    }
                                    const distance = endMileage - startMileage;
                                    const liters = (distance * fuelConsumption) / 100;
                                    expenseAmount = -(liters * fuelPrice);
                                    object = {name: expenseName, service: 'Расход', cost: formatNum(expenseAmount), workers, receivers, timestamp: new Date().toISOString(), isExpense: true, startMileage: formatNum(startMileage), endMileage: formatNum(endMileage), distance: formatNum(distance), issuedMoney, editHistory: []};
                                }
                            } else {
                                expenseAmount = parseFloat(formToUse.querySelector('input[name="expenseAmount"]').value);
                                if (isNaN(expenseAmount) || expenseAmount >= 0) {
                                    alert('Укажите корректную отрицательную сумму расхода!');
                                    return;
                                }
                                    object = {name: expenseName, service: 'Расход', cost: formatNum(expenseAmount), workers, receivers, timestamp: new Date().toISOString(), isExpense: true, isPaid: isPaid, issuedMoney, editHistory: []};
                            }
                        } else {
                            const objectName = (isManual ? manualObjectNameInput : objectNameInput).value.trim();
                            const length = parseFloat(formToUse.querySelector('input[name="length"]').value) || 0;
                            const width = parseFloat(formToUse.querySelector('input[name="width"]').value) || 0;
                            const areaInput = parseFloat(formToUse.querySelector('input[name="area"]').value) || 0;
                            const selectedOption = isManual ? manualSelectedValue.value : selectedValue.value;
                            const checkboxGroup = isManual ? manualWorkersCheckboxGroup : workersCheckboxGroup;
                            if (!checkboxGroup) {
                                alert('Ошибка: группа работников не найдена');
                                return;
                            }
                            const workersData = Array.from(checkboxGroup.querySelectorAll('input:checked')).map(input => {
                                if (!input?.value) return null;
                                const ktuIn = formToUse.querySelector(`input[name="${isManual ? 'manual' : ''}ktu_${input.value}"]`);
                                const areaIn = formToUse.querySelector(`input[name="${isManual ? 'manual' : ''}area_${input.value}"]`);
                                return {name: input.value, ktu: ktuIn?.value ? parseFloat(ktuIn.value) : 1, area: areaIn?.value ? parseFloat(areaIn.value) : null};
                            }).filter(w => w);
                            let area;
                            if (areaInput > 0) {
                                area = areaInput;
                            } else if (length > 0 && width > 0) {
                                area = length * width;
                            } else {
                                alert('Укажите площадь напрямую или оба значения: длину и ширину!');
                                return;
                            }
                            if (!objectName || !selectedOption || workersData.length === 0 || workersData.some(w => w.ktu <= 0)) {
                                alert('Заполните все обязательные поля: название, услугу и участников!');
                                return;
                            }
                            let totalCost;
                            let workersWithCost;
                            const useRostikMethod = formToUse.querySelector('input[name="useRostikMethod"]').checked;
                            if (isManual) {
                                const pricePerSquare = parseFloat(manualPriceForm.querySelector('input[name="pricePerSquare"]').value);
                                if (isNaN(pricePerSquare) || pricePerSquare <= 0) {
                                    alert('Укажите корректную цену за м²!');
                                    return;
                                }
                                const [serviceName, unit] = selectedOption.split('|');
                                totalCost = formatNum(area * pricePerSquare);
                                const hasIndividualAreas = workersData.some(w => w.area && w.area > 0);
                                if (hasIndividualAreas) {
                                    const totalEffectiveArea = workersData.reduce((sum, w) => {
                                        const workerArea = w.area || 0;
                                        return sum + (workerArea * w.ktu);
                                    }, 0);
                                    if (totalEffectiveArea === 0) {
                                        alert('Ошибка: общая эффективная площадь не может быть нулевой!');
                                        return;
                                    }
                                    if (useRostikMethod) {
                                        const numWorkers = workersData.length;
                                        let baseAmountPerWorker = parseFloat(totalCost) / numWorkers;
                                        let initialWorkersWithCost = workersData.map(w => {
                                            const workerArea = w.area || 0;
                                            const effectiveArea = workerArea * w.ktu;
                                            const workerShare = effectiveArea / totalEffectiveArea;
                                            return {
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: baseAmountPerWorker * w.ktu * workerShare * numWorkers
                                            };
                                        });
                                        const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                        const remainingAmount = parseFloat(totalCost) - distributedAmount;
                                        const workersWithKtu1 = workersData.filter(w => w.ktu === 1).length;
                                        if (workersWithKtu1 > 0 && Math.abs(remainingAmount) > 0.01) {
                                            const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                            workersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                            }));
                                        } else {
                                            workersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.cost)
                                            }));
                                        }
                                    } else {
                                        workersWithCost = workersData.map(w => {
                                            const workerArea = w.area || 0;
                                            const effectiveArea = workerArea * w.ktu;
                                            const workerShare = effectiveArea / totalEffectiveArea;
                                            return {
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(parseFloat(totalCost) * workerShare)
                                            };
                                        });
                                    }
                                } else if (useRostikMethod) {
                                    const numWorkers = workersData.length;
                                    let baseAmountPerWorker = parseFloat(totalCost) / numWorkers;
                                    let initialWorkersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
                                        area: w.area,
                                        cost: baseAmountPerWorker * w.ktu
                                    }));
                                    const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                    const remainingAmount = parseFloat(totalCost) - distributedAmount;
                                    const workersWithKtu1 = workersData.filter(w => w.ktu === 1).length;
                                    if (workersWithKtu1 > 0 && remainingAmount > 0) {
                                        const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                        workersWithCost = initialWorkersWithCost.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                        }));
                                    } else {
                                        workersWithCost = initialWorkersWithCost.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: formatNum(w.cost)
                                        }));
                                    }
                                } else {
                                    const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);
                                    const amountPerKtu = parseFloat(totalCost) / totalKtu;
                                    workersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
                                        area: w.area,
                                        cost: formatNum(amountPerKtu * w.ktu)
                                    }));
                                }
                                object = {name: objectName, length: length > 0 ? formatNum(length) : null, width: width > 0 ? formatNum(width) : null, area: length > 0 && width > 0 ? `${formatNum(length)} x ${formatNum(width)} = ${formatNum(area)} м²` : `${formatNum(area)} м²`, service: serviceName, cost: totalCost, workers: workersWithCost, timestamp: new Date().toISOString(), isExpense: false, manualPrice: true, isPaid: isPaid, useRostikMethod: useRostikMethod, issuedMoney, editHistory: []};
                            } else {
                                const [price, , serviceName] = selectedOption.split('|');
                                totalCost = formatNum(area * parseFloat(price));
                                const hasIndividualAreas = workersData.some(w => w.area && w.area > 0);
                                if (hasIndividualAreas) {
                                    const totalEffectiveArea = workersData.reduce((sum, w) => {
                                        const workerArea = w.area || 0;
                                        return sum + (workerArea * w.ktu);
                                    }, 0);
                                    if (totalEffectiveArea === 0) {
                                        alert('Ошибка: общая эффективная площадь не может быть нулевой!');
                                        return;
                                    }
                                    if (useRostikMethod) {
                                        const numWorkers = workersData.length;
                                        let baseAmountPerWorker = parseFloat(totalCost) / numWorkers;
                                        let initialWorkersWithCost = workersData.map(w => {
                                            const workerArea = w.area || 0;
                                            const effectiveArea = workerArea * w.ktu;
                                            const workerShare = effectiveArea / totalEffectiveArea;
                                            return {
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: baseAmountPerWorker * w.ktu * workerShare * numWorkers
                                            };
                                        });
                                        const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                        const remainingAmount = parseFloat(totalCost) - distributedAmount;
                                        const workersWithKtu1 = workersData.filter(w => w.ktu === 1).length;
                                        if (workersWithKtu1 > 0 && Math.abs(remainingAmount) > 0.01) {
                                            const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                            workersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                            }));
                                        } else {
                                            workersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.cost)
                                            }));
                                        }
                                    } else {
                                        workersWithCost = workersData.map(w => {
                                            const workerArea = w.area || 0;
                                            const effectiveArea = workerArea * w.ktu;
                                            const workerShare = effectiveArea / totalEffectiveArea;
                                            return {
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(parseFloat(totalCost) * workerShare)
                                            };
                                        });
                                    }
                                } else if (useRostikMethod) {
                                    const numWorkers = workersData.length;
                                    let baseAmountPerWorker = parseFloat(totalCost) / numWorkers;
                                    let initialWorkersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
                                        area: w.area,
                                        cost: baseAmountPerWorker * w.ktu
                                    }));
                                    const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                    const remainingAmount = parseFloat(totalCost) - distributedAmount;
                                    const workersWithKtu1 = workersData.filter(w => w.ktu === 1).length;
                                    if (workersWithKtu1 > 0 && remainingAmount > 0) {
                                        const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                        workersWithCost = initialWorkersWithCost.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                        }));
                                    } else {
                                        workersWithCost = initialWorkersWithCost.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: formatNum(w.cost)
                                        }));
                                    }
                                } else {
                                    const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);
                                    const amountPerKtu = parseFloat(totalCost) / totalKtu;
                                    workersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
                                        area: w.area,
                                        cost: formatNum(amountPerKtu * w.ktu)
                                    }));
                                }
                                object = {name: objectName, length: length > 0 ? formatNum(length) : null, width: width > 0 ? formatNum(width) : null, area: length > 0 && width > 0 ? `${formatNum(length)} x ${formatNum(width)} = ${formatNum(area)} м²` : `${formatNum(area)} м²`, service: serviceName, cost: totalCost, workers: workersWithCost, timestamp: new Date().toISOString(), isExpense: false, isPaid: isPaid, useRostikMethod: useRostikMethod, issuedMoney, editHistory: []};
                            }
                        } 
                        window.objects.unshift(object);
                        renderObjects();
                        renderWorkerStats();
                        populateSuggestions(formToUse);
                        formToUse.reset();
                        resetFormFields(formToUse);
                        if (isExpense) {
                            expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                            expenseTypeValue.value = '';
                            toggleInputState(expenseForm, 'expenseName', expenseTypeValue);
                        } else if (isManual) {
                            manualSelectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                            manualSelectedValue.value = '';
                        } else {
                            selectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                            selectedValue.value = '';
                        }
                        showForm(null);
                        alert((isExpense ? 'Расход' : 'Объект') + ' добавлен.');
                    }
                    closeHistoryBtn.addEventListener('click', () => {
                        historyModal.style.display = 'none';
                    });
                    const closeCommentsBtn = document.getElementById('close-comments');
                    const commentsModal = document.getElementById('comments-modal');
                    closeCommentsBtn.addEventListener('click', () => {
                        commentsModal.style.display = 'none';
                    });
                    window.addEventListener('click', (e) => {
                        if (e.target === commentsModal) {
                            commentsModal.style.display = 'none';
                        }
                    });
                    filterInput.addEventListener('input', () => {
                        renderObjects();
                    });
                    function populateServiceSelect(prices, display, hiddenInput, list) {
                        list.innerHTML = '';
                        prices.forEach(price => {
                            const li = document.createElement('li');
                            const value = `${price.cost}|${price.unit}|${price.name}`;
                            li.setAttribute('data-value', value);
                            li.textContent = `${price.name} — от ${price.cost} ₽/${price.unit}`;
                            li.addEventListener('click', () => {
                                display.innerHTML = `${li.textContent} <span class="dropdown-icon">▾</span>`;
                                hiddenInput.value = li.getAttribute('data-value');
                                list.classList.remove('show');
                            });
                            list.appendChild(li);
                        });
                    }
                    function populateManualServiceSelect(prices, display, hiddenInput, list, priceLabel) {
                        list.innerHTML = '';
                        prices.forEach(price => {
                            const li = document.createElement('li');
                            li.setAttribute('data-value', `${price.name}|${price.unit}`);
                            li.textContent = `${price.name} (${price.unit})`;
                            li.addEventListener('click', () => {
                                const [name, unit] = li.getAttribute('data-value').split('|');
                                display.innerHTML = `${name} (${unit}) <span class="dropdown-icon">▾</span>`;
                                hiddenInput.value = li.getAttribute('data-value');
                                priceLabel.textContent = `Цена за ${unit} (₽):`;
                                list.classList.remove('show');
                            });
                            list.appendChild(li);
                        });
                    }
                    function populateCustomServiceSelect(services) {
                        serviceOptions.innerHTML = '';
                        services.forEach(service => {
                            const li = document.createElement('li');
                            li.setAttribute('data-value', service.name);
                            li.textContent = service.name;
                            li.addEventListener('click', () => {
                                serviceSelect.innerHTML = `${li.textContent} <span class="dropdown-icon">▾</span>`;
                                serviceSelect.value = li.getAttribute('data-value');
                                toggleInputState(customServiceForm, 'serviceName', serviceSelect);
                                serviceOptions.classList.remove('show');
                            });
                            serviceOptions.appendChild(li);
                        });
                        serviceSelect.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                        serviceSelect.value = '';
                        toggleInputState(customServiceForm, 'serviceName', serviceSelect);
                    }
                    function populateExpenseTypeSelect(types) {
                        expenseTypeOptions.innerHTML = '';
                        types.forEach(type => {
                            const li = document.createElement('li');
                            li.setAttribute('data-value', type.name);
                            li.textContent = type.name;
                            li.addEventListener('click', () => {
                                expenseTypeSelect.innerHTML = `${li.textContent} <span class="dropdown-icon">▾</span>`;
                                expenseTypeValue.value = li.getAttribute('data-value');
                                toggleInputState(expenseForm, 'expenseName', expenseTypeValue);
                                expenseTypeOptions.classList.remove('show');
                            });
                            expenseTypeOptions.appendChild(li);
                        });
                        expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                        expenseTypeValue.value = '';
                        toggleInputState(expenseForm, 'expenseName', expenseTypeValue);
                    }
                    function applyAdvancedFilters(objects) {
                        return objects.filter(obj => {
                            if (advancedFilters.search && !obj.name.toLowerCase().includes(advancedFilters.search) && !obj.service.toLowerCase().includes(advancedFilters.search)) return false;
                            if (advancedFilters.period !== 'all') {
                                const d = new Date(obj.timestamp), now = new Date();
                                if (advancedFilters.period === 'custom') {
                                    if (advancedFilters.dateFrom && d < new Date(advancedFilters.dateFrom)) return false;
                                    if (advancedFilters.dateTo) { const ed = new Date(advancedFilters.dateTo); ed.setHours(23,59,59); if (d > ed) return false; }
                                } else {
                                    const ms = {today: 0, week: 7, month: 30, quarter: 90, year: 365}[advancedFilters.period] || 0;
                                    if (ms === 0 && advancedFilters.period === 'today') { const sd = new Date(now.setHours(0,0,0,0)); if (d < sd) return false; }
                                    else if (ms > 0 && d < new Date(now - ms * 24 * 60 * 60 * 1000)) return false;
                                }
                            }
                            if (advancedFilters.status !== 'all' && ((advancedFilters.status === 'paid' && !obj.isPaid) || (advancedFilters.status === 'unpaid' && obj.isPaid))) return false;
                            if (advancedFilters.type !== 'all') {
                                const types = {regular: !obj.isExpense && !obj.manualPrice && !obj.isCustomService, manual: obj.manualPrice, service: obj.isCustomService, expense: obj.isExpense};
                                if (!types[advancedFilters.type]) return false;
                            }
                            if (advancedFilters.worker !== 'all' && !obj.workers.some(w => (typeof w === 'string' ? w : w.name) === advancedFilters.worker) && !(obj.receivers && obj.receivers.includes(advancedFilters.worker))) return false;
                            const cost = Math.abs(parseFloat(obj.cost));
                            if (advancedFilters.sumFrom !== null && cost < advancedFilters.sumFrom) return false;
                            if (advancedFilters.sumTo !== null && cost > advancedFilters.sumTo) return false;
                            return true;
                        });
                    }
                    function renderObjects() {
                        const filterText = filterInput.value.trim().toLowerCase();
                        resultsDiv.innerHTML = '';
                        let filteredObjects = applyAdvancedFilters(window.objects);
                        filteredObjects = !filterText ? filteredObjects : filteredObjects.filter(obj => {
                            const workerMatch = filterText.split(' ')[0];
                            const typeMatch = filterText.replace(workerMatch, '').trim();
                            const hasWorker = obj.workers.some(w => (typeof w === 'string' ? w : w.name).toLowerCase() === workerMatch) ||
                            (obj.receivers && obj.receivers.some(r => r.toLowerCase() === workerMatch)) ||
                            (obj.issuedMoney && obj.issuedMoney.some(im => im.name.toLowerCase() === workerMatch));
                            if (!hasWorker) return false;
                            if (!typeMatch) return true;
                            if (typeMatch.includes('обычных объектов')) return !obj.isExpense && !obj.manualPrice && !obj.isCustomService;
                            if (typeMatch.includes('объектов с ручной ценой')) return obj.manualPrice;
                            if (typeMatch.includes('услуги')) return obj.isCustomService;
                            if (typeMatch.includes('расходов')) return obj.isExpense;
                            if (typeMatch.includes('кту ниже нормы')) return !obj.isExpense && obj.workers.some(w => w.name.toLowerCase() === workerMatch && w.ktu < 1);
                            return (
                                obj.name.toLowerCase().includes(filterText) ||
                                (obj.area && obj.area.toLowerCase().includes(filterText)) ||
                                obj.service.toLowerCase().includes(filterText) ||
                                obj.cost.toLowerCase().includes(filterText) ||
                                obj.workers.some(worker => (typeof worker === 'string' ? worker : worker.name).toLowerCase().includes(filterText)) ||
                                (obj.receivers && obj.receivers.some(receiver => receiver.toLowerCase().includes(filterText))) ||
                                (obj.issuedMoney && obj.issuedMoney.some(im => im.name.toLowerCase().includes(filterText))) ||
                                obj.timestamp.toLowerCase().includes(filterText)
                            );
                        });
                        if (filteredObjects.length === 0) {
                            resultsDiv.innerHTML = '<p>Объектов по этому фильтру не найдено.</p>';
                        } else {
                            filteredObjects.forEach((obj, index) => {
                                const woff = obj.isExpense ? parseFloat(obj.cost) / obj.workers.length : 0;
                                const accr = obj.isExpense && obj.receivers?.length > 0 ? Math.abs(parseFloat(obj.cost)) / obj.receivers.length : 0;
                                const wd = obj.isExpense ? obj.workers.map(w => `<span class="worker-item">${getWorkerIcon(typeof w === 'string' ? w : w.name)}${typeof w === 'string' ? w : w.name}: ${formatNum(woff)} ₽</span>`).join('') : obj.workers.map(w => `<span class="worker-item">${getWorkerIcon(w.name)}${w.name}: ${w.cost} ₽ (КТУ ${w.ktu}${w.area ? `, ${w.area} м²` : ''})</span>`).join('');
                                const ad = obj.isExpense && obj.receivers?.length > 0 ? obj.receivers.map(r => `<span class="worker-item">${getWorkerIcon(r)}${r}: ${formatNum(accr)} ₽</span>`).join('') : '';
                                const imd = obj.issuedMoney?.length > 0 ? obj.issuedMoney.map(im => `<span class="worker-item">${getWorkerIcon(im.name)}${im.name}: ${im.amount} ₽</span>`).join('') : '';
                                const costDetailsHtml = obj.isExpense ? `<div class="info-line cost-per-worker"><span class="label">Списание:</span><span class="value write-off">${wd}</span></div>${ad ? `<div class="info-line cost-per-receiver"><span class="label">Начисление:</span><span class="value accrual">${ad}</span></div>` : ''}` : `<div class="info-line cost-per-worker"><span class="label">Распределение:</span><span class="value">${wd}</span></div>`;
                                const issuedMoneyHtml = imd ? `<div class="info-line issued-money"><span class="label">Выданные деньги:</span><span class="value">${imd}</span></div>` : '';
                                const imgMap = {бензин: obj.receivers?.length === 1 ? (obj.receivers.includes('Коля') ? '/calc/img/nexia.png' : obj.receivers.includes('Артём') ? '/calc/img/ford.png' : '/calc/img/fuel.png') : '/calc/img/fuel.png', 'съёмная квартира': '/calc/img/house.png', 'еда': '/calc/img/eat.png', 'займ': '/calc/img/money.png', 'Электросварка перил и лестниц на кровле': '/calc/img/lestnica.png', 'Погрузо-разгрузочные работы': '/calc/img/pogruzka.png', 'Уборка территории': '/calc/img/cleaning.png'};
                                const imageUrl = obj.isExpense ? imgMap[obj.name.toLowerCase()] : (obj.isCustomService ? imgMap[obj.service] : prices.find(p => p.name === obj.service)?.image) || null;
                                const costFormula = obj.isExpense && obj.name.toLowerCase() === 'бензин' && obj.receivers?.length > 0 ? (() => {
                                    const fc = 6.7, fp = 61;
                                    if (obj.distance && !obj.startMileage) {
                                        const d = parseFloat(obj.distance), l = d * fc / 100;
                                        return `${d} км × ${fc} л/100 км ÷ 100 × ${fp} ₽/л = ${formatNum(l)} л × ${fp} ₽/л = ${obj.cost} ₽`;
                                    } else if (obj.startMileage && obj.endMileage) {
                                        const l = parseFloat(obj.distance) * fc / 100;
                                        return `(${obj.endMileage} км - ${obj.startMileage} км) × ${fc} л/100 км ÷ 100 × ${fp} ₽/л = ${formatNum(l)} л × ${fp} ₽/л = ${obj.cost} ₽`;
                                    }
                                    return `${obj.cost} ₽`;
                                })() : `${obj.cost} ₽`;
                                const entry = document.createElement('div');
                                entry.className = `calculation ${obj.isExpense ? 'expense' : ''} ${obj.manualPrice ? 'manual-price' : ''} ${obj.isCustomService ? 'custom-service' : ''} ${editMode ? 'editable' : ''}`;
                                entry.dataset.timestamp = obj.timestamp;
                                const am = obj.area ? obj.area.match(/([\d.]+)\s*x\s*([\d.]+)\s*=\s*([\d.]+)\s*м²/) || obj.area.match(/([\d.]+)\s*м²/) : null;
                                const av = am ? parseFloat(am[am.length === 4 ? 3 : 1]) : 0;
                                const pps = av > 0 ? formatNum(parseFloat(obj.cost) / av) : null;
                                const eth = obj.editedTimestamp ? `Последнее редактирование: ${obj.editedTimestamp}${obj.useRostikMethod ? ' <span style="color: #555;">(Ростиковская методика)</span>' : ''}` : (obj.useRostikMethod ? '(Ростиковская методика)' : '');
                                const svgPaid = `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block"><circle cx="12" cy="12" r="9" style="fill:none;stroke:white;stroke-width:2"/><path d="M8 12.5l2.5 2.5L16 9" style="fill:none;stroke:white;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"/></svg>`;
                                const svgUnpaid = `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block"><circle cx="12" cy="12" r="9" style="fill:none;stroke:white;stroke-width:2"/><path d="M8 8l8 8M16 8l-8 8" style="fill:none;stroke:white;stroke-width:2;stroke-linecap:round"/></svg>`;
                                const fw = (w) => `<div class="feature"><div class="featureIcon">${getWorkerIcon(typeof w === 'string' ? w : w.name)}</div><div class="featureText"><p><strong>${typeof w === 'string' ? w : w.name}</strong></p><p>${obj.isExpense ? `Списание: ${formatNum(woff)} ₽` : `${w.cost} ₽ (КТУ ${w.ktu}${w.area ? `, ${w.area} м²` : ''})`}</p></div></div>`;
                                const fr = (r) => `<div class="feature"><div class="featureIcon">${getWorkerIcon(r)}</div><div class="featureText"><p><strong>${r}</strong></p><p>+${formatNum(accr)} ₽</p></div></div>`;
                                const fim = (im) => `<div class="feature"><div class="featureIcon">${getWorkerIcon(im.name)}</div><div class="featureText"><p><strong>${im.name}</strong></p><p>${im.amount} ₽</p></div></div>`;
                                entry.innerHTML = `<div class="overviewInfo"><div class="actions">${obj.editHistory.length > 0 ? `<button class="action-button neurobutton calendar-btn" data-timestamp="${obj.timestamp}">📅 <span class="edit-count">${obj.editHistory.length}</span></button>` : ''}<button class="action-button neurobutton copy-btn" data-timestamp="${obj.timestamp}">📋</button><button class="action-button neurobutton btn-comments" data-timestamp="${obj.timestamp}">💬 ${obj.comments?.length > 0 ? `<span class="comments-badge">${obj.comments.length}</span>` : ''}</button><button class="action-button neurobutton paid-btn ${obj.isPaid ? 'paid' : ''}" data-timestamp="${obj.timestamp}">${obj.isPaid ? svgPaid : svgUnpaid}</button>${editMode ? `<span class="action-button neurobutton delete-cross" data-timestamp="${obj.timestamp}">✕</span>` : ''}</div><div class="productinfo"><div class="grouptext"><h3>${obj.area ? 'ПЛОЩАДЬ' : (obj.distance ? 'РАССТОЯНИЕ' : 'ДАТА')}</h3><p>${obj.area ? formatNum(av) + ' м²' : (obj.distance ? obj.distance + ' км' : parseDateSafe(obj.timestamp).toLocaleDateString('ru-RU'))}</p></div><div class="grouptext"><h3>СТАТУС</h3><p>${obj.isPaid ? 'Оплачено' : 'Ожидание'}</p></div><div class="grouptext"><h3>${pps ? 'Цена Кв.м.' : 'СУММА'}</h3><p>${pps ? pps + ' ₽/м²' : formatNum(parseFloat(obj.cost), 0) + ' ₽'}</p></div>${imageUrl ? `<div class="productImage"><img src="${imageUrl}" alt="${obj.service}"></div>` : ''}</div></div><div class="productSpecifications">${!obj.isExpense && !obj.manualPrice && !obj.isCustomService && obj.name ? `<div class="object-name-label">${obj.name}</div>` : ''}<h1>${obj.isExpense ? obj.name : obj.service}</h1><div class="productFeatures">${obj.workers.map(fw).join('')}</div>${obj.receivers?.length > 0 ? `<div class="productFeatures" style="margin-top: 16px;"><h3 style="grid-column: 1/-1; color: #30cfd0; font-size: 14px; margin-bottom: 8px;">НАЧИСЛЕНИЕ</h3>${obj.receivers.map(fr).join('')}</div>` : ''}${obj.issuedMoney?.length > 0 ? `<div class="productFeatures" style="margin-top: 16px;"><h3 style="grid-column: 1/-1; color: #fa709a; font-size: 14px; margin-bottom: 8px;">ВЫДАННЫЕ ДЕНЬГИ</h3>${obj.issuedMoney.map(fim).join('')}</div>` : ''}<div class="checkoutButton"><div class="priceTag">${formatNum(parseFloat(obj.cost))} ₽</div></div>${eth ? `<p style="font-size: 11px; opacity: 0.5; margin-top: 12px;">${eth}</p>` : ''}</div>`;
                                        if (editMode) {
                                            entry.addEventListener('click', (e) => {
                                                if (!['delete-cross', 'calendar-btn', 'copy-btn', 'paid-btn', 'btn-comments', 'comments-badge', 'action-button'].some(c => e.target.classList.contains(c) || e.target.closest(`.${c}`)) && !e.target.closest('.checkoutButton')) {
                                                    editObject(window.objects.findIndex(o => o.timestamp === obj.timestamp));
                                                }
                                            });
                                        }
                                        resultsDiv.appendChild(entry);
                            });
                            bindHandlers();
                        }
                    }
                    const bindHandlers = () => {
                        resultsDiv.removeEventListener('click', handleResultsClick);
                        resultsDiv.addEventListener('click', handleResultsClick);
                        $qa('.paid-btn').forEach(b => { b.removeEventListener('click', handlePaidToggle); b.addEventListener('click', handlePaidToggle); });
                        $qa('.delete-cross').forEach(b => { b.removeEventListener('click', handleDelete); b.addEventListener('click', handleDelete); });
                        $qa('.calendar-btn').forEach(b => { b.removeEventListener('click', showHistory); b.addEventListener('click', showHistory); });
                        $qa('.btn-comments').forEach(b => { b.removeEventListener('click', showComments); b.addEventListener('click', showComments); });
                    };
                    const handleResultsClick = (e) => {
                        if (e.target.closest('.copy-btn')) handleCopy(e);
                    };
                    function handleCopy(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        const btn = e.target.closest('.copy-btn');
                        if (!btn) return;
                        const timestamp = btn.getAttribute('data-timestamp');
                        if (!timestamp) return;
                        const card = resultsDiv.querySelector(`.calculation[data-timestamp="${timestamp}"]`);
                        if (!card) return;
                        const lines = [];
                        const title = card.querySelector('.productSpecifications h1')?.textContent || '';
                        if (title) lines.push(title);
                        $qa('.productinfo .grouptext', card).forEach(gt => {
                            const l = gt.querySelector('h3')?.textContent, v = gt.querySelector('p')?.textContent;
                            if (l && v) lines.push(`${l}: ${v}`);
                        });
                        $qa('.productFeatures', card).forEach(s => {
                            const st = s.querySelector('h3')?.textContent || 'Участники';
                            $qa('.feature', s).forEach(f => {
                                const n = f.querySelector('.featureText p strong')?.textContent;
                                const d = Array.from(f.querySelectorAll('.featureText p')).find(p => !p.querySelector('strong'))?.textContent;
                                if (n && d) { if (!lines.includes(st)) lines.push(st); lines.push(`  ${n}: ${d}`); }
                            });
                        });
                        const pt = card.querySelector('.priceTag')?.textContent;
                        if (pt) lines.push(`Сумма: ${pt}`);
                        const et = card.querySelector('.productSpecifications p')?.textContent;
                        if (et && et.includes('редактирование')) lines.push(et);
                        const textToCopy = lines.join('\n').trim();
                        if (!textToCopy) return;
                        if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(textToCopy).then(() => {
                                btn.style.opacity = '0.5';
                                setTimeout(() => { btn.style.opacity = '1'; }, 200);
                            }).catch(() => fallbackCopy(textToCopy));
                        } else fallbackCopy(textToCopy);
                    }
                    function fallbackCopy(text) {
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                            document.execCommand('copy');
                        } finally {
                            document.body.removeChild(textArea);
                        }
                    }
                    function handlePaidToggle(e) {
                        e.stopPropagation();
                        const timestamp = e.currentTarget.getAttribute('data-timestamp');
                        const idx = window.objects.findIndex(o => o.timestamp === timestamp);
                        if (idx === -1) return;
                        const obj = window.objects[idx];
                        obj.isPaid = !obj.isPaid;
                        e.currentTarget.innerHTML = obj.isPaid ? `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http:
                        e.currentTarget.classList.toggle('paid', obj.isPaid);
                        const card = $q(`.calculation[data-timestamp="${timestamp}"]`);
                        if (card) {
                            $qa('.productinfo .grouptext', card).forEach(b => {
                                const h = b.querySelector('h3'), p = b.querySelector('p');
                                if (h && p && h.textContent.trim() === 'СТАТУС') p.textContent = obj.isPaid ? 'Оплачено' : 'Ожидание';
                            });
                        }
                        renderWorkerStats();
                    }
                    function handleDelete(e) {
                        e.stopPropagation();
                        const timestamp = e.target.getAttribute('data-timestamp');
                        const idx = window.objects.findIndex(o => o.timestamp === timestamp);
                        if (idx === -1) return;
                        if (confirm(`Удалить "${window.objects[idx].isExpense ? 'расход' : 'объект'} "${window.objects[idx].name}"?`)) {
                            window.objects.splice(idx, 1);
                            renderObjects();
                            renderWorkerStats();
                            populateSuggestions(objectForm);
                        }
                    }
                    function showComments(e) {
                        e.stopPropagation();
                        const timestamp = e.target.closest('.btn-comments').getAttribute('data-timestamp');
                        const obj = window.objects.find(o => o.timestamp === timestamp);
                        if (!obj) return;
                        if (!obj.comments) obj.comments = [];
                        const commentsModal = document.getElementById('comments-modal');
                        const commentsList = document.getElementById('comments-list');
                        const newCommentText = document.getElementById('new-comment-text');
                        const addCommentBtn = document.getElementById('add-comment-btn');
                        commentsList.innerHTML = '';
                        if (obj.comments.length === 0) {
                            commentsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Комментариев пока нет</p>';
                        } else {
                            obj.comments.forEach((comment, index) => {
                                const commentDiv = document.createElement('div');
                                commentDiv.className = 'comment-item';
                                commentDiv.innerHTML = `
                                    <div class="comment-header">
                                        <span class="comment-author">Пользователь</span>
                                        <span class="comment-date">${comment.timestamp}</span>
                                        ${editMode ? `<button class="delete-comment-btn" data-index="${index}">✕</button>` : ''}
                                    </div>
                                    <div class="comment-text">${comment.text}</div>
                                `;
                                commentsList.appendChild(commentDiv);
                            });
                            if (editMode) {
                                commentsList.querySelectorAll('.delete-comment-btn').forEach(btn => {
                                    btn.addEventListener('click', function() {
                                        const index = parseInt(this.getAttribute('data-index'));
                                        if (confirm('Удалить комментарий?')) {
                                            obj.comments.splice(index, 1);
                                            saveData();
                                            showComments({ target: e.target, stopPropagation: () => {} });
                                            renderObjects();
                                        }
                                    });
                                });
                            }
                        }
                        const updateCommentsList = () => {
                            commentsList.innerHTML = '';
                            if (obj.comments.length === 0) {
                                commentsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Комментариев пока нет</p>';
                            } else {
                                obj.comments.forEach((comment, index) => {
                                    const commentDiv = document.createElement('div');
                                    commentDiv.className = 'comment-item';
                                    commentDiv.innerHTML = `
                                        <div class="comment-header">
                                            <span class="comment-author">Пользователь</span>
                                            <span class="comment-date">${comment.timestamp}</span>
                                            ${editMode ? `<button class="delete-comment-btn" data-index="${index}">✕</button>` : ''}
                                        </div>
                                        <div class="comment-text">${comment.text}</div>
                                    `;
                                    commentsList.appendChild(commentDiv);
                                });
                                if (editMode) {
                                    commentsList.querySelectorAll('.delete-comment-btn').forEach(btn => {
                                        btn.addEventListener('click', function() {
                                            const idx = parseInt(this.getAttribute('data-index'));
                                            if (confirm('Удалить комментарий?')) {
                                                obj.comments.splice(idx, 1);
                                                saveData();
                                                updateCommentsList();
                                                renderObjects();
                                            }
                                        });
                                    });
                                }
                            }
                        };
                        addCommentBtn.onclick = () => {
                            const text = newCommentText.value.trim();
                            if (!text) return;
                            obj.comments.push({
                                text: text,
                                timestamp: new Date().toISOString()
                            });
                            saveData();
                            newCommentText.value = '';
                            updateCommentsList();
                            renderObjects();
                        };
                        updateCommentsList();
                        commentsModal.style.display = 'flex';
                    }
                    function showHistory(e) {
                        e.stopPropagation();
                        const timestamp = e.target.closest('.calendar-btn').getAttribute('data-timestamp');
                        const obj = window.objects.find(o => o.timestamp === timestamp);
                        if (!obj) return;
                        historyList.innerHTML = '';
                        const originalEntry = document.createElement('div');
                        originalEntry.className = 'history-entry';
                        originalEntry.innerHTML = `
                        <strong>Исходная версия</strong> (${obj.timestamp})<br>
                        ${renderObjectDetails(getOriginalObject(obj))}
                        `;
                        originalEntry.addEventListener('click', () => {
                            renderTemporaryObject(timestamp, null);
                            historyModal.style.display = 'none';
                        });
                        historyList.appendChild(originalEntry);
                        obj.editHistory.forEach((history, hIndex) => {
                            const entry = document.createElement('div');
                            entry.className = 'history-entry';
                            entry.innerHTML = `
                            <strong>${history.timestamp}</strong><br>
                            <div class="info-line"><span class="label">Изменения:</span><span class="value">${history.changes}</span></div>
                            `;
                            entry.addEventListener('click', () => {
                                renderTemporaryObject(timestamp, hIndex);
                                historyModal.style.display = 'none';
                            });
                            historyList.appendChild(entry);
                        });
                        historyModal.style.display = 'flex';
                    }
                    function getOriginalObject(obj) {
                        return { ...obj, editHistory: [], editedTimestamp: null };
                    }
                    function getObjectAtHistory(obj, hIndex) {
                        let result = getOriginalObject(obj);
                        for (let i = 0; i <= hIndex; i++) {
                            const changes = obj.editHistory[i].changes.split(', ');
                            changes.forEach(change => {
                                const [field, oldValue, newValue] = change.match(/(.+?): "(.+?)" → "(.+?)"/) || [];
                                if (field) {
                                    if (field === 'Название') result.name = newValue;
                                    if (field === 'Площадь') result.area = newValue;
                                    if (field === 'Услуга') result.service = newValue;
                                    if (field === 'Стоимость') result.cost = newValue;
                                    if (field === 'Участники') {
                                        const workers = newValue.split(', ').map(w => {
                                            const [name, ktuCost] = w.split(' (КТУ ');
                                            const ktu = parseFloat(ktuCost?.replace(')', ''));
                                            const cost = result.workers.find(w => w.name === name)?.cost || '0.00';
                                            return { name, ktu: ktu || 1, cost };
                                        });
                                        result.workers = workers;
                                    }
                                    if (field === 'Участники (списание)') result.workers = newValue.split(', ');
                                    if (field === 'Участники (начисление)') result.receivers = newValue.split(', ');
                                }
                            });
                            result.editedTimestamp = obj.editHistory[i].timestamp;
                        }
                        return result;
                    }
                    function renderTemporaryObject(timestamp, hIndex) {
                        const obj = window.objects.find(o => o.timestamp === timestamp);
                        if (!obj) return;
                        const tempObj = hIndex === null ? obj : getObjectAtHistory(obj, hIndex);
                        const entry = resultsDiv.querySelector(`[data-timestamp="${timestamp}"]`);
                        if (!entry) return;
                        const costPerWorker = tempObj.isExpense
                            ? tempObj.workers.map(worker => {
                                const workerName = typeof worker === 'string' ? worker : worker.name;
                                const perWorkerAmount = formatNum(parseFloat(tempObj.cost) / tempObj.workers.length);
                                return `<span class="worker-item">${getWorkerIcon(workerName)}${workerName}: ${perWorkerAmount} ₽</span>`;
                            }).join('')
                            : tempObj.workers.map(w => `<span class="worker-item">${getWorkerIcon(w.name)}${w.name}: ${w.cost} ₽ (КТУ ${w.ktu}${w.area ? `, ${w.area} м²` : ''})</span>`).join('');
                        const costPerReceiver = tempObj.isExpense && tempObj.receivers.length > 0
                            ? tempObj.receivers.map(receiver => {
                                const perReceiverAmount = formatNum(Math.abs(parseFloat(tempObj.cost)) / tempObj.receivers.length);
                                return `<span class="worker-item">${getWorkerIcon(receiver)}${receiver}: ${perReceiverAmount} ₽</span>`;
                            }).join('')
                            : '';
                        const workersDisplayList = tempObj.isExpense 
                            ? tempObj.workers.map(worker => {
                                const workerName = typeof worker === 'string' ? worker : worker.name;
                                return `<span class="worker-item">${getWorkerIcon(workerName)}${workerName}</span>`;
                            }).join('')
                            : tempObj.workers.map(w => `<span class="worker-item">${getWorkerIcon(w.name)}${w.name} (КТУ ${w.ktu}${w.area ? `, ${w.area} м²` : ''})</span>`).join('');
                        const receiversDisplayList = tempObj.isExpense && tempObj.receivers.length > 0
                            ? tempObj.receivers.map(receiver => `<span class="worker-item">${getWorkerIcon(receiver)}${receiver}</span>`).join('')
                            : '';
                        entry.innerHTML = `
                        <div class="header-line">
                            <strong>•</strong>
                            <span class="timestamp">(${tempObj.timestamp})</span>
                            ${tempObj.editHistory.length > 0 ? `<button class="calendar-btn" data-timestamp="${tempObj.timestamp}">📅 <span class="edit-count">${tempObj.editHistory.length}</span></button>` : ''}
                            ${editMode ? `<span class="delete-cross" data-timestamp="${tempObj.timestamp}">✕</span>` : ''}
                        </div>
                        ${tempObj.area ? `<div class="info-line area"><span class="label">Площадь:</span><span class="value">${tempObj.area}</span></div>` : ''}
                        <div class="info-line service"><span class="label">Услуга:</span><span class="value">${tempObj.service}</span></div>
                        <div class="info-line cost"><span class="label">Стоимость:</span><span class="value">${tempObj.cost} ₽</span></div>
                        <div class="info-line workers"><span class="label">${tempObj.isExpense ? 'Участники (списание)' : 'Участники'}:</span><span class="value">${workersDisplayList}</span></div>
                        ${receiversDisplayList ? `<div class="info-line receivers"><span class="label">Участники (начисление):</span><span class="value">${receiversDisplayList}</span></div>` : ''}
                        <div class="info-line cost-per-worker"><span class="label">${tempObj.isExpense ? 'На одного (списание)' : 'Распределение'}:</span><span class="value">${costPerWorker}</span></div>
                        ${costPerReceiver ? `<div class="info-line cost-per-receiver"><span class="label">На одного (начисление):</span><span class="value">${costPerReceiver}</span></div>` : ''}
                        ${tempObj.editedTimestamp ? `<div class="edit-history">Последнее редактирование: ${tempObj.editedTimestamp}</div>` : ''}
                        `;
                        bindCalendarButtons();
                    }
                    function editObject(index) {
                        const obj = window.objects[index];
                        const isExpense = obj.isExpense;
                        const isCustomService = obj.isCustomService;
                        const formToUse = isExpense ? expenseForm : (isCustomService ? customServiceForm : (obj.manualPrice ? manualPriceForm : objectForm));
                        showForm(formToUse);
                        const y = formToUse.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({ top: y - 15, behavior: 'smooth' });
                        const submitBtn = formToUse.querySelector('button[type="submit"]');
                        const cancelBtn = formToUse.querySelector('.cancel-btn');
                        submitBtn.textContent = 'Изменить ' + (isExpense ? 'расход' : (isCustomService ? 'услугу' : 'объект'));
                        cancelBtn.style.display = 'inline-block';
                        formToUse.dataset.isEditing = 'true';
                        formToUse.dataset.editIndex = index;
                        formToUse.querySelector('input[name="isPaid"]').checked = obj.isPaid || false;
                        const objWorkerNames = Array.isArray(obj.workers) ? obj.workers.map(w => (typeof w === 'string' ? w : w.name)) : [];
                        const objReceiverNames = Array.isArray(obj.receivers) ? obj.receivers.map(r => (typeof r === 'string' ? r : r.name)) : [];
                        workers.forEach(worker => {
                            const workerName = getWorkerName(worker);
                            const checkbox = formToUse.querySelector(`.issued-money-group input[value="${workerName}"]`);
                            const amountInput = formToUse.querySelector(`input[name="issuedamount_${workerName}"]`);
                            if (checkbox && amountInput) {
                                const issued = obj.issuedMoney && obj.issuedMoney.find(im => im.name === workerName);
                                checkbox.checked = !!issued;
                                amountInput.disabled = !issued;
                                amountInput.value = issued ? issued.amount : '';
                            }
                        });
                        if (isExpense) {
                            expenseNameInput.value = obj.name;
                            expenseForm.querySelector('input[name="expenseAmount"]').value = obj.cost;
                            expenseTypeSelect.innerHTML = `${obj.name} <span class="dropdown-icon">▾</span>`;
                            expenseTypeValue.value = obj.name;
                            toggleInputState(expenseForm, 'expenseName', expenseTypeValue);
                            workers.forEach(worker => {
                                const workerName = getWorkerName(worker);
                                const checkbox = expenseWorkersCheckboxGroup.querySelector(`input[value="${workerName}"]`);
                                if (checkbox) checkbox.checked = objWorkerNames.includes(workerName);
                                const receiverCheckbox = expenseReceiversCheckboxGroup.querySelector(`input[value="${workerName}"]`);
                                if (receiverCheckbox) receiverCheckbox.checked = objReceiverNames.includes(workerName);
                            });
                                if (obj.name.toLowerCase() === 'бензин' && objReceiverNames.length === 1 && objReceiverNames[0] === 'Артём') {
                                    formToUse.querySelector('input[name="fuelMode"][value="amount"]').checked = true;
                                    formToUse.querySelector('input[name="distance"]').value = '';
                                }
                        } else if (isCustomService) {
                            serviceNameInput.value = obj.name;
                            customServiceForm.querySelector('input[name="servicePrice"]').value = obj.cost;
                            serviceSelect.innerHTML = `${obj.name} <span class="dropdown-icon">▾</span>`;
                            serviceSelect.value = obj.name;
                            toggleInputState(customServiceForm, 'serviceName', serviceSelect);
                            workers.forEach(worker => {
                                const workerName = getWorkerName(worker);
                                const checkbox = serviceWorkersCheckboxGroup.querySelector(`input[value="${workerName}"]`);
                                if (checkbox) {
                                    checkbox.checked = objWorkerNames.includes(workerName);
                                    const ktuInput = checkbox.parentElement.querySelector(`input[name="servicektu_${workerName}"]`);
                                    if (ktuInput) {
                                        const wObj = Array.isArray(obj.workers) && obj.workers.find(w => (typeof w === 'string' ? w === workerName : w.name === workerName));
                                        ktuInput.value = (wObj && typeof wObj === 'object' && wObj.ktu) ? parseFloat(wObj.ktu) : 1;
                                        ktuInput.disabled = !checkbox.checked;
                                    }
                                }
                            });
                            const rostikMethodCheckbox = customServiceForm.querySelector('input[name="useRostikMethod"]');
                            if (rostikMethodCheckbox) {
                                rostikMethodCheckbox.checked = obj.useRostikMethod || false;
                            }
                        } else {
                            const input = obj.manualPrice ? manualObjectNameInput : objectNameInput;
                            input.value = obj.name;
                            const areaMatch = obj.area && (obj.area.match(/([\d.]+)\s*x\s*([\d.]+)\s*=\s*([\d.]+)\s*м²/) || obj.area.match(/([\d.]+)\s*м²/));
                            if (areaMatch) {
                                if (areaMatch.length === 4) {
                                    formToUse.querySelector('input[name="length"]').value = parseFloat(areaMatch[1]);
                                    formToUse.querySelector('input[name="width"]').value = parseFloat(areaMatch[2]);
                                    formToUse.querySelector('input[name="area"]').value = '';
                                    formToUse.querySelector('input[name="area"]').disabled = true;
                                } else {
                                    formToUse.querySelector('input[name="area"]').value = parseFloat(areaMatch[1]);
                                    formToUse.querySelector('input[name="length"]').value = '';
                                    formToUse.querySelector('input[name="width"]').value = '';
                                    formToUse.querySelector('input[name="length"]').disabled = true;
                                    formToUse.querySelector('input[name="width"]').disabled = true;
                                }
                            }
                            if (obj.manualPrice) {
                                manualSelectedValue.value = `${obj.service}|м²`;
                                manualSelectDisplay.innerHTML = `${obj.service} (м²) <span class="dropdown-icon">▾</span>`;
                                const area = areaMatch ? parseFloat(areaMatch[areaMatch.length === 4 ? 3 : 1]) : 0;
                                const pricePerSquare = area > 0 ? (parseFloat(obj.cost) / area) : 0;
                                const pps = isFinite(pricePerSquare) ? formatNum(pricePerSquare) : '';
                                manualPriceForm.querySelector('input[name="pricePerSquare"]').value = pps;
                            } else {
                                const area = areaMatch ? parseFloat(areaMatch[areaMatch.length === 4 ? 3 : 1]) : 0;
                                const pricePerSquare = area > 0 ? (parseFloat(obj.cost) / area) : 0;
                                const pps = isFinite(pricePerSquare) ? formatNum(pricePerSquare) : '';
                                selectedValue.value = pps ? `${pps}|м²|${obj.service}` : '';
                                selectDisplay.innerHTML = `${obj.service}${pps ? ` — от ${pps} ₽/м²` : ''} <span class="dropdown-icon">▾</span>`;
                            }
                            workers.forEach(worker => {
                                const workerName = getWorkerName(worker);
                                const checkbox = (obj.manualPrice ? manualWorkersCheckboxGroup : workersCheckboxGroup).querySelector(`input[value="${workerName}"]`);
                                if (checkbox) {
                                    checkbox.checked = objWorkerNames.includes(workerName);
                                    const ktuInput = checkbox.parentElement.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}ktu_${workerName}"]`);
                                    if (ktuInput) {
                                        const wObj = Array.isArray(obj.workers) && obj.workers.find(w => (typeof w === 'string' ? w === workerName : w.name === workerName));
                                        ktuInput.value = (wObj && typeof wObj === 'object' && wObj.ktu) ? parseFloat(wObj.ktu) : 1;
                                        ktuInput.disabled = !checkbox.checked;
                                    }
                                    const areaInput = checkbox.parentElement.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}area_${workerName}"]`);
                                    if (areaInput) {
                                        const wObj = Array.isArray(obj.workers) && obj.workers.find(w => (typeof w === 'string' ? w === workerName : w.name === workerName));
                                        areaInput.value = (wObj && typeof wObj === 'object' && wObj.area) ? wObj.area : '';
                                        areaInput.disabled = !checkbox.checked;
                                    }
                                }
                            });
                            updateAreaDistribution(obj.manualPrice ? 'manual' : '');
                            const rostikMethodCheckbox = formToUse.querySelector('input[name="useRostikMethod"]');
                            if (rostikMethodCheckbox) {
                                rostikMethodCheckbox.checked = obj.useRostikMethod || false;
                            }
                        }
                        cancelBtn.onclick = () => {
                            formToUse.reset();
                            resetFormFields(formToUse);
                            formToUse.dataset.isEditing = 'false';
                            formToUse.dataset.editIndex = '';
                            submitBtn.textContent = isExpense ? 'Добавить расход' : (isCustomService ? 'Добавить услугу' : 'Добавить объект');
                            cancelBtn.style.display = 'none';
                            if (isExpense) {
                                expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                                expenseTypeValue.value = '';
                                toggleInputState(formToUse, 'expenseName', expenseTypeValue);
                            } else if (isCustomService) {
                                serviceSelect.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                                serviceSelect.value = '';
                                toggleInputState(formToUse, 'serviceName', serviceSelect);
                            } else if (obj.manualPrice) {
                                manualSelectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                                manualSelectedValue.value = '';
                            } else {
                                selectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                                selectedValue.value = '';
                            }
                            formToUse.onsubmit = isExpense ?
                                (e) => addObject(e, true) :
                                (isCustomService ?
                                customServiceForm.onsubmit :
                                (obj.manualPrice ? (e) => addObject(e, false, true) : (e) => addObject(e)));
                            showForm(null);
                        };
                        formToUse.onsubmit = (e) => {
                            e.preventDefault();
                            const index = parseInt(formToUse.dataset.editIndex);
                            const oldObj = window.objects[index];
                            const changes = [];
                            const newIsPaid = formToUse.querySelector('input[name="isPaid"]').checked;
                            const newIssuedMoney = Array.from(formToUse.querySelectorAll('.issued-money-group input[type="checkbox"]:checked')).map(checkbox => {
                                const workerName = checkbox.value;
                                const amountInput = formToUse.querySelector(`input[name="issuedamount_${workerName}"]`);
                                const amount = parseFloat(amountInput.value) || 0;
                                return amount > 0 ? { name: workerName, amount: formatNum(amount) } : null;
                            }).filter(item => item !== null);
                            const oldIssuedMoneyStr = oldObj.issuedMoney ? oldObj.issuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                            const newIssuedMoneyStr = newIssuedMoney.length > 0 ? newIssuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                            if (oldIssuedMoneyStr !== newIssuedMoneyStr) {
                                changes.push(`Выданные деньги: "${oldIssuedMoneyStr}" → "${newIssuedMoneyStr}"`);
                            }
                            if (isExpense) {
                                const newName = expenseNameInput.disabled ? expenseTypeValue.value : expenseNameInput.value.trim();
                                let newAmount;
                                const newWorkers = Array.from(expenseWorkersCheckboxGroup.querySelectorAll('input:checked'))
                                    .map(input => input && input.value ? input.value : null)
                                    .filter(w => w !== null);
                                const newReceivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked'))
                                    .map(input => input && input.value ? input.value : null)
                                    .filter(r => r !== null);
                                if (!newName || newWorkers.length === 0) {
                                    alert('Заполните все обязательные поля: название и участников!');
                                    return;
                                }
                                if (newName.toLowerCase() === 'бензин' && newReceivers.length === 1 && newReceivers[0] === 'Артём') {
                                    const fuelMode = formToUse.querySelector('input[name="fuelMode"]:checked').value;
                                    if (fuelMode === 'amount') {
                                        newAmount = parseFloat(formToUse.querySelector('input[name="expenseAmount"]').value);
                                        if (isNaN(newAmount) || newAmount >= 0) {
                                            alert('Укажите корректную отрицательную сумму расхода!');
                                            return;
                                        }
                                    } else {
                                        const distance = parseFloat(formToUse.querySelector('input[name="distance"]').value);
                                        if (isNaN(distance) || distance <= 0) {
                                            alert('Введите корректное расстояние!');
                                            return;
                                        }
                                        const fuelConsumption = 6.7;
                                        const fuelPrice = 61;
                                        const liters = (distance * fuelConsumption) / 100;
                                        newAmount = -(liters * fuelPrice);
                                    }
                                } else {
                                    newAmount = parseFloat(formToUse.querySelector('input[name="expenseAmount"]').value);
                                    if (isNaN(newAmount) || newAmount >= 0) {
                                        alert('Укажите корректную отрицательную сумму расхода!');
                                        return;
                                    }
                                }
                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newAmount !== parseFloat(oldObj.cost)) changes.push(`Сумма: ${oldObj.cost} → ${newAmount}`);
                                if (JSON.stringify(newWorkers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники (списание): "${oldObj.workers.join(', ')}" → "${newWorkers.join(', ')}"`);
                                if (JSON.stringify(newReceivers) !== JSON.stringify(oldObj.receivers)) changes.push(`Участники (начисление): "${oldObj.receivers.join(', ')}" → "${newReceivers.join(', ')}"`);
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);
                                oldObj.name = newName;
                                oldObj.cost = formatNum(newAmount);
                                oldObj.workers = newWorkers;
                                oldObj.receivers = newReceivers;
                                oldObj.isPaid = newIsPaid;
                                oldObj.issuedMoney = newIssuedMoney;
                            } else if (isCustomService) {
                                const newName = serviceNameInput.disabled ? serviceSelect.value : serviceNameInput.value.trim();
                                const newCost = parseFloat(customServiceForm.querySelector('input[name="servicePrice"]').value);
                                const newWorkers = Array.from(serviceWorkersCheckboxGroup.querySelectorAll('input:checked'))
                                    .map(input => {
                                        if (!input || !input.value) return null;
                                        const ktuInput = customServiceForm.querySelector(`input[name="servicektu_${input.value}"]`);
                                        return { 
                                            name: input.value, 
                                            ktu: (ktuInput && ktuInput.value) ? parseFloat(ktuInput.value) : 1 
                                        };
                                    })
                                    .filter(w => w !== null);
                                if (!newName || isNaN(newCost) || newCost <= 0 || newWorkers.length === 0 || newWorkers.some(w => w.ktu <= 0)) {
                                    alert('Заполните все поля корректно!');
                                    return;
                                }
                                const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                const workersWithCost = newWorkers.map(w => ({ name: w.name, ktu: w.ktu, cost: formatNum(newCost * w.ktu / totalKtu) }));
                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newCost !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${newCost}`);
                                if (JSON.stringify(newWorkers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${newWorkers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);
                                oldObj.name = newName;
                                oldObj.service = newName;
                                oldObj.cost = formatNum(newCost);
                                oldObj.workers = workersWithCost;
                                oldObj.isPaid = newIsPaid;
                                oldObj.issuedMoney = newIssuedMoney;
                            } else {
                                const newName = (obj.manualPrice ? manualObjectNameInput : objectNameInput).value.trim();
                                const length = parseFloat(formToUse.querySelector('input[name="length"]').value) || 0;
                                const width = parseFloat(formToUse.querySelector('input[name="width"]').value) || 0;
                                const areaInput = parseFloat(formToUse.querySelector('input[name="area"]').value) || 0;
                                const checkboxGroup = obj.manualPrice ? manualWorkersCheckboxGroup : workersCheckboxGroup;
                                if (!checkboxGroup) {
                                    alert('Ошибка: группа работников не найдена');
                                    return;
                                }
                                const newWorkers = Array.from(checkboxGroup.querySelectorAll('input:checked'))
                                    .map(input => {
                                        if (!input || !input.value) return null;
                                        const ktuInput = formToUse.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}ktu_${input.value}"]`);
                                        const workerAreaInput = formToUse.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}area_${input.value}"]`);
                                        return { 
                                            name: input.value, 
                                            ktu: (ktuInput && ktuInput.value) ? parseFloat(ktuInput.value) : 1,
                                            area: (workerAreaInput && workerAreaInput.value) ? parseFloat(workerAreaInput.value) : null
                                        };
                                    })
                                    .filter(w => w !== null);
                                let newArea;
                                if (areaInput > 0) {
                                    newArea = areaInput;
                                } else if (length > 0 && width > 0) {
                                    newArea = length * width;
                                } else {
                                    alert('Укажите площадь напрямую или оба значения: длину и ширину!');
                                    return;
                                }
                                if (!newName || newWorkers.length === 0 || newWorkers.some(w => w.ktu <= 0)) {
                                    alert('Заполните все обязательные поля: название, услугу и участников!');
                                    return;
                                }
                                let newCost;
                                let newWorkersWithCost;
                                const newUseRostikMethod = formToUse.querySelector('input[name="useRostikMethod"]').checked;
                                const hasIndividualAreas = newWorkers.some(w => w.area && w.area > 0);
                                if (obj.manualPrice) {
                                    const pricePerSquare = parseFloat(formToUse.querySelector('input[name="pricePerSquare"]').value);
                                    if (isNaN(pricePerSquare) || pricePerSquare <= 0) {
                                        alert('Укажите корректную цену за м²!');
                                        return;
                                    }
                                    newCost = formatNum(newArea * pricePerSquare);
                                    if (hasIndividualAreas) {
                                        const totalEffectiveArea = newWorkers.reduce((sum, w) => {
                                            const workerArea = w.area || 0;
                                            return sum + (workerArea * w.ktu);
                                        }, 0);
                                        if (totalEffectiveArea === 0) {
                                            alert('Ошибка: общая эффективная площадь не может быть нулевой!');
                                            return;
                                        }
                                        if (newUseRostikMethod) {
                                            const numWorkers = newWorkers.length;
                                            let baseAmountPerWorker = parseFloat(newCost) / numWorkers;
                                            let initialWorkersWithCost = newWorkers.map(w => {
                                                const workerArea = w.area || 0;
                                                const effectiveArea = workerArea * w.ktu;
                                                const workerShare = effectiveArea / totalEffectiveArea;
                                                return {
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: baseAmountPerWorker * w.ktu * workerShare * numWorkers
                                                };
                                            });
                                            const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                            const remainingAmount = parseFloat(newCost) - distributedAmount;
                                            const workersWithKtu1 = newWorkers.filter(w => w.ktu === 1).length;
                                            if (workersWithKtu1 > 0 && Math.abs(remainingAmount) > 0.01) {
                                                const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                                newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                                }));
                                            } else {
                                                newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: formatNum(w.cost)
                                                }));
                                            }
                                        } else {
                                            newWorkersWithCost = newWorkers.map(w => {
                                                const workerArea = w.area || 0;
                                                const effectiveArea = workerArea * w.ktu;
                                                const workerShare = effectiveArea / totalEffectiveArea;
                                                return {
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: formatNum(parseFloat(newCost) * workerShare)
                                                };
                                            });
                                        }
                                    } else if (newUseRostikMethod) {
                                        const numWorkers = newWorkers.length;
                                        let baseAmountPerWorker = parseFloat(newCost) / numWorkers;
                                        let initialWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: baseAmountPerWorker * w.ktu
                                        }));
                                        const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                        const remainingAmount = parseFloat(newCost) - distributedAmount;
                                        const workersWithKtu1 = newWorkers.filter(w => w.ktu === 1).length;
                                        if (workersWithKtu1 > 0 && remainingAmount > 0) {
                                            const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                            newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                            }));
                                        } else {
                                            newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.cost)
                                            }));
                                        }
                                    } else {
                                        const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                        const amountPerKtu = parseFloat(newCost) / totalKtu;
                                        newWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: formatNum(amountPerKtu * w.ktu)
                                        }));
                                    }
                                } else {
                                    const [price, unit, serviceName] = selectedValue.value.split('|');
                                    newCost = formatNum(newArea * parseFloat(price));
                                    if (hasIndividualAreas) {
                                        const totalEffectiveArea = newWorkers.reduce((sum, w) => {
                                            const workerArea = w.area || 0;
                                            return sum + (workerArea * w.ktu);
                                        }, 0);
                                        if (totalEffectiveArea === 0) {
                                            alert('Ошибка: общая эффективная площадь не может быть нулевой!');
                                            return;
                                        }
                                        if (newUseRostikMethod) {
                                            const numWorkers = newWorkers.length;
                                            let baseAmountPerWorker = parseFloat(newCost) / numWorkers;
                                            let initialWorkersWithCost = newWorkers.map(w => {
                                                const workerArea = w.area || 0;
                                                const effectiveArea = workerArea * w.ktu;
                                                const workerShare = effectiveArea / totalEffectiveArea;
                                                return {
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: baseAmountPerWorker * w.ktu * workerShare * numWorkers
                                                };
                                            });
                                            const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                            const remainingAmount = parseFloat(newCost) - distributedAmount;
                                            const workersWithKtu1 = newWorkers.filter(w => w.ktu === 1).length;
                                            if (workersWithKtu1 > 0 && Math.abs(remainingAmount) > 0.01) {
                                                const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                                newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                                }));
                                            } else {
                                                newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: formatNum(w.cost)
                                                }));
                                            }
                                        } else {
                                            newWorkersWithCost = newWorkers.map(w => {
                                                const workerArea = w.area || 0;
                                                const effectiveArea = workerArea * w.ktu;
                                                const workerShare = effectiveArea / totalEffectiveArea;
                                                return {
                                                    name: w.name,
                                                    ktu: w.ktu,
                                                    area: w.area,
                                                    cost: formatNum(parseFloat(newCost) * workerShare)
                                                };
                                            });
                                        }
                                    } else if (newUseRostikMethod) {
                                        const numWorkers = newWorkers.length;
                                        let baseAmountPerWorker = parseFloat(newCost) / numWorkers;
                                        let initialWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: baseAmountPerWorker * w.ktu
                                        }));
                                        const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                                        const remainingAmount = parseFloat(newCost) - distributedAmount;
                                        const workersWithKtu1 = newWorkers.filter(w => w.ktu === 1).length;
                                        if (workersWithKtu1 > 0 && remainingAmount > 0) {
                                            const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                                            newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost)
                                            }));
                                        } else {
                                            newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                area: w.area,
                                                cost: formatNum(w.cost)
                                            }));
                                        }
                                    } else {
                                        const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                        const amountPerKtu = parseFloat(newCost) / totalKtu;
                                        newWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            area: w.area,
                                            cost: formatNum(amountPerKtu * w.ktu)
                                        }));
                                    }
                                }
                                const newAreaString = length > 0 && width > 0 ? `${formatNum(length)} x ${formatNum(width)} = ${formatNum(newArea)} м²` : `${formatNum(newArea)} м²`;
                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newAreaString !== oldObj.area) changes.push(`Площадь: "${oldObj.area}" → "${newAreaString}"`);
                                if (obj.manualPrice) {
                                    const newPricePerSquare = formatNum(parseFloat(newCost) / newArea);
                                    const oldPricePerSquare = formatNum(parseFloat(oldObj.cost) / parseFloat(oldObj.area.match(/([\d.]+)\s*м²/)[1]));
                                    if (newPricePerSquare !== oldPricePerSquare) changes.push(`Цена за м²: ${oldPricePerSquare} → ${newPricePerSquare}`);
                                } else {
                                    if (selectedValue.value !== oldObj.service) changes.push(`Услуга: "${oldObj.service}" → "${selectedValue.value.split('|')[2]}"`);
                                }
                                if (JSON.stringify(newWorkers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${newWorkers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
                                if (newCost !== oldObj.cost) changes.push(`Стоимость: ${oldObj.cost} → ${newCost}`);
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);
                                if (newUseRostikMethod !== oldObj.useRostikMethod) changes.push(`Методика: "${oldObj.useRostikMethod ? 'Ростиковская' : 'Стандартная'}" → "${newUseRostikMethod ? 'Ростиковская' : 'Стандартная'}"`);
                                oldObj.name = newName;
                                oldObj.area = newAreaString;
                                oldObj.length = length > 0 ? formatNum(length) : null;
                                oldObj.width = width > 0 ? formatNum(width) : null;
                                oldObj.cost = newCost;
                                oldObj.workers = newWorkersWithCost;
                                oldObj.isPaid = newIsPaid;
                                if (!obj.manualPrice) {
                                    oldObj.service = selectedValue.value.split('|')[2];
                                }
                                oldObj.useRostikMethod = newUseRostikMethod;
                                oldObj.issuedMoney = newIssuedMoney;
                            }
                            if (changes.length > 0) {
                                oldObj.editedTimestamp = new Date().toISOString();
                                oldObj.editHistory.push({ timestamp: oldObj.editedTimestamp, changes: changes.join(', ') });
                            }
                            renderObjects();
                            renderWorkerStats();
                            populateSuggestions(formToUse);
                            formToUse.reset();
                            resetFormFields(formToUse);
                            formToUse.dataset.isEditing = 'false';
                            formToUse.dataset.editIndex = '';
                            submitBtn.textContent = isExpense ? 'Добавить расход' : (isCustomService ? 'Добавить услугу' : 'Добавить объект');
                            cancelBtn.style.display = 'none';
                            if (isExpense) {
                                expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                                expenseTypeValue.value = '';
                                toggleInputState(formToUse, 'expenseName', expenseTypeValue);
                            } else if (isCustomService) {
                                serviceSelect.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                                serviceSelect.value = '';
                                toggleInputState(formToUse, 'serviceName', serviceSelect);
                            } else if (obj.manualPrice) {
                                manualSelectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                                manualSelectedValue.value = '';
                            } else {
                                selectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                                selectedValue.value = '';
                            }
                            showForm(null);
                            alert((isExpense ? 'Расход' : (isCustomService ? 'Услуга' : 'Объект')) + ' изменён.');
                        };
                    }
                    function renderWorkerStats() {
                        const statsGrid = document.getElementById('worker-stats');
                        if (!statsGrid) return;
                        statsGrid.innerHTML = '';
                        if (!Array.isArray(workers) || workers.length === 0) {
                            statsGrid.innerHTML = '<div class="no-data">Нет работников для отображения</div>';
                            return;
                        }
                        const getWorkerName = (w) => {
                            if (typeof w === 'string') return w;
                            if (w && typeof w === 'object' && w.name) return w.name;
                            return '';
                        };
                        workers.forEach(worker => {
                            const workerName = getWorkerName(worker);
                            const workerObjects = window.objects.filter(obj =>
                            (!obj.isExpense || (obj.isExpense && !obj.isPaid)) &&
                            ((obj.workers && obj.workers.some(w => getWorkerName(w) === workerName)) ||
                            (obj.receivers && obj.receivers.includes(workerName)) ||
                            (obj.issuedMoney && obj.issuedMoney.some(im => im.name === workerName)))
                            );
                            const hasPendingObjects = window.objects.some(obj => !obj.isExpense && !obj.isPaid);
                            const isForemanWithPercentage = isForeman(workerName) && getWorkerPercentage(workerName) > 0 && hasPendingObjects;
                            if (workerObjects.length === 0 && !isForemanWithPercentage) return;
                            const regularObjects = workerObjects.filter(obj => !obj.isExpense && !obj.manualPrice && !obj.isCustomService).length;
                            const manualObjects = workerObjects.filter(obj => obj.manualPrice).length;
                            const services = workerObjects.filter(obj => obj.isCustomService).length;
                            const expenses = workerObjects.filter(obj => obj.isExpense).length;
                            const incomeObjects = workerObjects.filter(obj => !obj.isExpense);
                            const expenseObjects = workerObjects.filter(obj => obj.isExpense);
                            const incomeBreakdown = incomeObjects.map((obj) => {
                                if (!obj || !Array.isArray(obj.workers)) return null;
                                const workerData = obj.workers.find(w => getWorkerName(w) === workerName);
                                const contribution = (workerData && workerData.cost) ? parseFloat(workerData.cost) : 0;
                                const className = obj.isCustomService ? 'service-earning' : 'regular-earning';
                                return { 
                                    value: formatNum(contribution), 
                                    timestamp: obj.timestamp || new Date().toISOString(), 
                                    className, 
                                    isPaid: obj.isPaid || false 
                                };
                            }).filter(item => item !== null);
                            const paidIncome = incomeBreakdown.filter(e => e.isPaid);
                            const pendingIncome = incomeBreakdown.filter(e => !e.isPaid);
                            const totalPaidIncome = paidIncome.reduce((sum, val) => sum + parseFloat(val.value), 0);
                            const totalPendingIncome = pendingIncome.reduce((sum, val) => sum + parseFloat(val.value), 0);
                            const issuedMoneyBreakdown = workerObjects
                            .filter(obj => !obj.isPaid && obj.issuedMoney && obj.issuedMoney.some(im => im.name === workerName))
                            .map((obj) => {
                                const issued = obj.issuedMoney.find(im => im.name === workerName);
                                return issued ? { value: formatNum(-parseFloat(issued.amount)), timestamp: obj.timestamp, className: 'issued-money-negative' } : null;
                            })
                            .filter(item => item !== null);
                            const totalIssuedMoney = issuedMoneyBreakdown.reduce((sum, val) => sum + parseFloat(val.value), 0);
                            const expenseBreakdownByReceiver = {};
                            const debtsOwedToWorker = {};
                            expenseObjects.forEach((obj) => {
                                const totalCost = parseFloat(obj.cost) || 0;
                                if (isNaN(totalCost)) return;
                                const workersCount = obj.workers.length || 1;
                                const writeOffPerWorker = totalCost / workersCount;
                                const receiversCount = obj.receivers.length || 1;
                                const accrualPerReceiver = receiversCount > 0 ? Math.abs(totalCost) / receiversCount : 0;
                                if (obj.workers.some(w => getWorkerName(w) === workerName)) {
                                    if (obj.receivers.length > 0) {
                                        obj.receivers.forEach(receiver => {
                                            if (receiver !== workerName) {
                                                if (!expenseBreakdownByReceiver[receiver]) expenseBreakdownByReceiver[receiver] = [];
                                                const isLoan = obj.name.toLowerCase() === 'займ';
                                                const safeReceiversCount = Array.isArray(obj.receivers) && obj.receivers.length > 0 ? obj.receivers.length : 1;
                                                const debtValue = formatNum(isLoan
                                                ? (-Math.abs(writeOffPerWorker) / safeReceiversCount)
                                                : (writeOffPerWorker / safeReceiversCount));
                                                expenseBreakdownByReceiver[receiver].push({
                                                    value: debtValue,
                                                    timestamp: obj.timestamp,
                                                    className: 'expense-earning'
                                                });
                                            }
                                        });
                                    } else {
                                        const anonymousReceiver = 'БОСС';
                                        if (!expenseBreakdownByReceiver[anonymousReceiver]) expenseBreakdownByReceiver[anonymousReceiver] = [];
                                        const debtValue = formatNum(writeOffPerWorker);
                                        expenseBreakdownByReceiver[anonymousReceiver].push({
                                            value: debtValue,
                                            timestamp: obj.timestamp,
                                            className: 'expense-earning'
                                        });
                                    }
                                }
                                if (obj.receivers.includes(workerName)) {
                                    if (obj.workers.length > 0) {
                                        obj.workers.forEach(debtor => {
                                            const debtorName = getWorkerName(debtor);
                                            if (debtorName !== workerName) {
                                                if (!debtsOwedToWorker[debtorName]) debtsOwedToWorker[debtorName] = [];
                                                const isLoan = obj.name.toLowerCase() === 'займ';
                                                const safeReceiversCount = Array.isArray(obj.receivers) && obj.receivers.length > 0 ? obj.receivers.length : 1;
                                                const creditValue = formatNum(Math.abs(writeOffPerWorker) / safeReceiversCount);
                                                debtsOwedToWorker[debtorName].push({
                                                    value: creditValue,
                                                    timestamp: obj.timestamp,
                                                    className: 'receiver-earning'
                                                });
                                            }
                                        });
                                    } else {
                                        const anonymousDebtor = 'БОСС';
                                        if (!debtsOwedToWorker[anonymousDebtor]) debtsOwedToWorker[anonymousDebtor] = [];
                                        const creditValue = formatNum(accrualPerReceiver);
                                        debtsOwedToWorker[anonymousDebtor].push({
                                            value: creditValue,
                                            timestamp: obj.timestamp,
                                            className: 'receiver-earning'
                                        });
                                    }
                                }
                            });
                            const ad = {};
                            [...Object.entries(dow), ...Object.entries(ebr)].forEach(([k, ds]) => {
                                if (!ad[k]) ad[k] = [];
                                ad[k].push(...ds.map(d => ({...d, value: parseFloat(d.value)})));
                            });
                            Object.keys(ad).forEach(p => ad[p].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
                            const db = {};
                            Object.entries(ad).forEach(([p, ds]) => db[p] = formatNum(ds.reduce((s, d) => s + d.value, 0)));
                            const tdow = Object.values(db).filter(b => parseFloat(b) > 0).reduce((s, b) => s + parseFloat(b), 0);
                            const te = Object.values(db).filter(b => parseFloat(b) < 0).reduce((s, b) => s + parseFloat(b), 0);
                            const totalPendingWithIssued = totalPendingIncome + totalIssuedMoney, totalDebtsOwedToWorker = tdow, totalExpenses = te, debtBalances = db, allDebts = ad;
                            let pDed = 0, pEarn = 0;
                            if (!isForeman(workerName)) {
                                incomeObjects.filter(o => !o.isPaid).forEach(o => {
                                    const wd = o.workers.find(w => getWorkerName(w) === workerName);
                                    if (wd) {
                                        const we = parseFloat(wd.cost);
                                        o.workers.filter(w => isForeman(w.name)).forEach(f => {
                                            const fp = getWorkerPercentage(f.name);
                                            if (fp > 0) pDed += we * fp / 100;
                                        });
                                    }
                                });
                            }
                            if (isForeman(workerName)) {
                                const fp = getWorkerPercentage(workerName);
                                if (fp > 0) {
                                    window.objects.filter(o => !o.isExpense && !o.isPaid).forEach(o => {
                                        o.workers.forEach(w => {
                                            if (!isForeman(w.name)) pEarn += parseFloat(w.cost) * fp / 100;
                                        });
                                    });
                                }
                            }
                            const totalEarnings = totalPaidIncome + totalPendingWithIssued + totalDebtsOwedToWorker + totalExpenses - pDed + pEarn;
                            const formatEarnings = (a) => formatNum(a).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.00', '');
                            let eh = '';
                            if (totalPaidIncome !== 0) {
                                const pih = paidIncome.length > 0 ? paidIncome.map(e => `<span class="earnings-item ${e.className}" data-timestamp="${e.timestamp}">+${e.value}</span>`).join(' ') : '0 ₽';
                                eh += `<div class="earnings paid-earnings"><strong>Заработано:</strong> ${pih} = ${formatEarnings(totalPaidIncome)} ₽</div>`;
                            }
                            if (totalPendingIncome !== 0 || totalIssuedMoney !== 0) {
                                const pih = pendingIncome.length > 0 ? pendingIncome.map(e => `<span class="earnings-item ${e.className}" data-timestamp="${e.timestamp}">+${e.value}</span>`).join(' ') : '0 ₽';
                                const imh = issuedMoneyBreakdown.length > 0 ? issuedMoneyBreakdown.map(e => `<span class="earnings-item ${e.className}" data-timestamp="${e.timestamp}">${e.value}</span>`).join(' ') : '';
                                eh += `<div class="earnings pending-earnings"><strong>В ожидании:</strong> ${pih}${imh ? ` ${imh}` : ''} = ${formatEarnings(totalPendingWithIssued)} ₽</div>`;
                            }
                            let debtHtml = '', pd = [], nd = [];
                            Object.entries(debtBalances).forEach(([p, b]) => {
                                const items = allDebts[p].map(d => `<span class="earnings-item ${d.className}" data-timestamp="${d.timestamp}">${d.value > 0 ? '+' : ''}${formatNum(d.value)}</span>`).join(' ');
                                const tb = parseFloat(b);
                                const ft = tb >= 0 ? `+${formatEarnings(tb)}` : formatEarnings(tb);
                                if (tb > 0) pd.push(`<div class="positive-debt">${p}: ${items} = ${ft} ₽</div>`);
                                else if (tb < 0) nd.push(`<div class="negative-debt">${p}: ${items} = ${ft} ₽</div>`);
                            });
                            if (pd.length > 0) debtHtml += `<div class="earnings receiver-earnings"><strong>Долги мне:</strong>${pd.join('')}</div>`;
                            if (nd.length > 0) debtHtml += `<div class="earnings expense-earnings"><strong>Долги другим:</strong>${nd.join('')}</div>`;
                            let pwdb = '';
                            if (Object.keys(debtBalances).length > 0) {
                                const items = [`<span class="earnings-item issued-money-negative">${formatEarnings(totalPendingWithIssued)}</span>`];
                                Object.entries(debtBalances).forEach(([p, b]) => {
                                    const tb = parseFloat(b);
                                    items.push(`<span class="earnings-item ${tb >= 0 ? 'receiver-earning' : 'expense-earning'}" ${allDebts[p]?.[0]?.timestamp ? `data-timestamp="${allDebts[p][0].timestamp}"` : ''}>${tb >= 0 ? '+' : ''}${formatEarnings(tb)}</span>`);
                                });
                                const total = totalPendingWithIssued + Object.values(debtBalances).reduce((s, b) => s + parseFloat(b), 0);
                                pwdb = `<div class="earnings pending-with-debts"><strong>Расчёт в ожидании с долгами:</strong> ${items.join(' ')} = ${formatEarnings(total)} ₽</div>`;
                            }
                            let pwp = '';
                            if (pDed > 0 || pEarn > 0) {
                                const ba = totalPendingWithIssued + Object.values(debtBalances).reduce((s, b) => s + parseFloat(b), 0);
                                const items = [];
                                if (ba !== 0) items.push(`<span class="earnings-item issued-money-negative">${formatEarnings(ba)}</span>`);
                                if (pDed > 0) items.push(`<span class="earnings-item expense-earning">-${formatEarnings(pDed)}</span>`);
                                if (pEarn > 0) items.push(`<span class="earnings-item receiver-earning">+${formatEarnings(pEarn)}</span>`);
                                pwp = `<div class="earnings pending-with-percentages"><strong>В ожидании с процентами:</strong> ${items.join(' ')} = ${formatEarnings(ba - pDed + pEarn)} ₽</div>`;
                            }
                            eh += debtHtml + pwdb + pwp;
                            const card = document.createElement('div');
                            card.className = 'worker-card';
                            const unpaid = totalEarnings - totalPaidIncome - totalExpenses;
                            card.classList.add(unpaid > 10000 ? 'status-debt' : (totalPendingWithIssued > 0 || unpaid > 0 ? 'status-pending' : 'status-paid'));
                            card.innerHTML = `<div class="worker-name">${getWorkerIcon(workerName)}${workerName}</div>${eh}<div class="earnings total-earnings"><strong>Итого:</strong> ${formatEarnings(totalEarnings)} ₽</div><ul class="stats-list"><li data-filter="regular">Обычные объекты: <span>${regularObjects}</span></li><li data-filter="manual">Ручная цена: <span>${manualObjects}</span></li><li data-filter="services">Услуги: <span>${services}</span></li><li data-filter="expenses">Расходы: <span>${expenses}</span></li></ul><div class="worker-chart" data-earnings="${totalEarnings}" data-worker="${workerName}"></div>`;
                            card.addEventListener('click', (e) => {
                                const isChart = e.target.closest('.worker-chart');
                                const isEarningItem = e.target.classList.contains('earnings-item');
                                const isStatsLi = e.target.closest('.stats-list li');
                                if (!isChart && !isEarningItem && !isStatsLi) filterByWorker(workerName);
                            });
                                card.querySelectorAll('.stats-list li').forEach(li => {
                                    li.style.cursor = 'pointer';
                                    li.addEventListener('click', (e) => {
                                        e.stopPropagation();
                                        const filterType = li.dataset.filter;
                                        let filterValue = `${workerName} `;
                                        switch (filterType) {
                                            case 'regular': filterValue += 'обычных объектов'; break;
                                            case 'manual': filterValue += 'объектов с ручной ценой'; break;
                                            case 'services': filterValue += 'услуги'; break;
                                            case 'expenses': filterValue += 'расходов'; break;
                                        }
                                        filterInput.value = filterValue;
                                        renderObjects();
                                        setTimeout(() => {
                                            const filteredCards = resultsDiv.querySelectorAll('.calculation');
                                            if (filteredCards.length > 0) {
                                                filteredCards.forEach(card => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
                                            }
                                            const filterGroup = document.querySelector('.filter-group');
                                            if (!filterGroup.querySelector('.filter-reset')) {
                                                const resetFilter = document.createElement('span');
                                                resetFilter.className = 'filter-reset';
                                                resetFilter.innerHTML = '✕';
                                                resetFilter.title = 'Сбросить фильтр';
                                                resetFilter.addEventListener('click', () => {
                                                    filterInput.value = '';
                                                    renderObjects();
                                                    resetFilter.remove();
                                                });
                                                filterGroup.appendChild(resetFilter);
                                            }
                                        }, 100);
                                    });
                                });
                                card.querySelectorAll('.earnings-item').forEach(item => {
                                    item.addEventListener('click', (e) => {
                                        e.stopPropagation();
                                        const timestamp = item.dataset.timestamp;
                                        scrollToObject(timestamp);
                                    });
                                });
                                statsGrid.appendChild(card);
                        });
                        renderWorkerCharts();
                        renderAlerts();
                        renderTopStats();
                        renderEarningsCharts();
                        renderForecast();
                    }
                    window.renderWorkerStats = renderWorkerStats;
                    function renderAlerts() {
                        const alertsContainer = document.getElementById('alerts-container');
                        if (!alertsContainer) return;
                        alertsContainer.innerHTML = '';
                        const alerts = [];
                        workers.forEach(worker => {
                            const workerName = getWorkerName(worker);
                            const workerObjects = window.objects.filter(obj => 
                                !obj.isExpense && 
                                obj.workers.some(w => (typeof w === 'string' ? w : w.name) === workerName)
                            );
                            const totalPending = workerObjects
                                .filter(obj => !obj.isPaid)
                                .reduce((sum, obj) => {
                                    const workerData = obj.workers.find(w => (typeof w === 'string' ? w : w.name) === workerName);
                                    return sum + (workerData ? parseFloat(workerData.cost || 0) : 0);
                                }, 0);
                            if (totalPending > 150000) {
                                alerts.push({
                                    type: 'danger',
                                    icon: '🚨',
                                    title: 'Большой долг',
                                    message: `${workerName}: ${formatNum(totalPending)} ₽ не выплачено`
                                });
                            }
                        });
                        const lowKtuObjects = window.objects.filter(obj => 
                            !obj.isExpense && 
                            !obj.isPaid &&
                            obj.workers.some(w => w.ktu && w.ktu < 0.8)
                        );
                        if (lowKtuObjects.length > 0) {
                            const affectedWorkers = new Set();
                            lowKtuObjects.forEach(obj => {
                                obj.workers.forEach(w => {
                                    if (w.ktu && w.ktu < 0.8) {
                                        affectedWorkers.add(w.name);
                                    }
                                });
                            });
                            alerts.push({
                                type: 'warning',
                                icon: '⚠️',
                                title: 'Низкий КТУ',
                                message: `${lowKtuObjects.length} объектов с КТУ < 0.8 (${Array.from(affectedWorkers).join(', ')})`
                            });
                        }
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        const oldUnpaid = window.objects.filter(obj => 
                            !obj.isExpense && 
                            !obj.isPaid && 
                            new Date(obj.timestamp) < weekAgo
                        );
                        if (oldUnpaid.length > 0) {
                            alerts.push({
                                type: 'info',
                                icon: '📅',
                                title: 'Старые объекты',
                                message: `${oldUnpaid.length} объектов не оплачено больше недели`
                            });
                        }
                        alerts.forEach(alert => {
                            const alertEl = document.createElement('div');
                            alertEl.className = `alert alert-${alert.type}`;
                            alertEl.innerHTML = `
                                <div class="alert-icon">${alert.icon}</div>
                                <div class="alert-content">
                                    <div class="alert-title">${alert.title}</div>
                                    <div class="alert-message">${alert.message}</div>
                                </div>
                            `;
                            alertsContainer.appendChild(alertEl);
                        });
                    }
                    function renderTopStats() {
                        const workerEarnings = {};
                        workers.forEach(worker => {
                            const workerName = getWorkerName(worker);
                            const workerObjects = window.objects.filter(obj => 
                                !obj.isExpense && 
                                obj.workers.some(w => (typeof w === 'string' ? w : w.name) === workerName)
                            );
                            workerEarnings[workerName] = workerObjects.reduce((sum, obj) => {
                                const workerData = obj.workers.find(w => (typeof w === 'string' ? w : w.name) === workerName);
                                return sum + (workerData ? parseFloat(workerData.cost || 0) : 0);
                            }, 0);
                        });
                        const topWorkerName = Object.keys(workerEarnings).reduce((a, b) => 
                            workerEarnings[a] > workerEarnings[b] ? a : b, ''
                        );
                        if (topWorkerName) {
                            document.getElementById('top-worker').textContent = topWorkerName;
                            document.getElementById('top-worker-detail').textContent = 
                                `${formatNum(workerEarnings[topWorkerName])} ₽`;
                        }
                        const topObject = window.objects
                            .filter(obj => !obj.isExpense)
                            .reduce((max, obj) => {
                                const objCost = Math.abs(parseFloat(obj.cost));
                                const maxCost = max ? Math.abs(parseFloat(max.cost)) : 0;
                                return objCost > maxCost ? obj : max;
                            }, null);
                        if (topObject) {
                            document.getElementById('top-object').textContent = topObject.name;
                            document.getElementById('top-object-detail').textContent = 
                                `${formatNum(Math.abs(parseFloat(topObject.cost)))} ₽`;
                        }
                        const incomeObjects = window.objects.filter(obj => !obj.isExpense);
                        const totalIncome = incomeObjects.reduce((sum, obj) => sum + Math.abs(parseFloat(obj.cost)), 0);
                        const avgIncome = incomeObjects.length > 0 ? totalIncome / incomeObjects.length : 0;
                        document.getElementById('avg-earnings').textContent = `${formatNum(avgIncome)} ₽`;
                        document.getElementById('avg-earnings-detail').textContent = 
                            `На ${incomeObjects.length} объектов`;
                        const totalObjects = window.objects.length;
                        const paidObjects = window.objects.filter(obj => obj.isPaid).length;
                        document.getElementById('total-objects').textContent = totalObjects;
                        document.getElementById('total-objects-detail').textContent = 
                            `Оплачено: ${paidObjects} (${formatNum((paidObjects/totalObjects)*100, 0)}%)`;
                    }
                    let timelineChart = null;
                    let pieChart = null;
                    function renderEarningsCharts() {
                        const timelineCanvas = document.getElementById('earnings-timeline-chart');
                        const pieCanvas = document.getElementById('earnings-pie-chart');
                        if (!timelineCanvas || !pieCanvas) return;
                        if (timelineChart) {
                            timelineChart.destroy();
                        }
                        if (pieChart) {
                            pieChart.destroy();
                        }
                        const earningsByDate = {};
                        window.objects
                            .filter(obj => !obj.isExpense)
                            .forEach(obj => {
                                const date = parseDateSafe(obj.timestamp).toLocaleDateString('ru-RU');
                                if (!earningsByDate[date]) {
                                    earningsByDate[date] = 0;
                                }
                                earningsByDate[date] += Math.abs(parseFloat(obj.cost));
                            });
                        const sortedDates = Object.keys(earningsByDate).sort((a, b) => {
                            const dateA = a.split('.').reverse().join('-');
                            const dateB = b.split('.').reverse().join('-');
                            return new Date(dateA) - new Date(dateB);
                        });
                        const last30Dates = sortedDates.slice(-30);
                        const earningsData = last30Dates.map(date => earningsByDate[date]);
                        const gridColor = 'rgba(255, 255, 255, 0.1)';
                        const textColor = '#F9FAFB';
                        timelineChart = new Chart(timelineCanvas, {
                            type: 'line',
                            data: {
                                labels: last30Dates,
                                datasets: [{
                                    label: 'Заработок',
                                    data: earningsData,
                                    borderColor: 'rgb(52, 152, 219)',
                                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                                    borderWidth: 3,
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 4,
                                    pointBackgroundColor: 'rgb(52, 152, 219)',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                    pointHoverRadius: 6
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        padding: 12,
                                        displayColors: false,
                                        callbacks: {
                                            label: function(context) {
                                                return context.parsed.formatNum(y) + ' ₽';
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: textColor,
                                            callback: function(value) {
                                                return value.toLocaleString() + ' ₽';
                                            }
                                        },
                                        grid: {
                                            color: gridColor
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            color: textColor,
                                            maxRotation: 45,
                                            minRotation: 45,
                                            padding: 5
                                        },
                                        grid: {
                                            color: gridColor
                                        }
                                    }
                                }
                            }
                        });
                        const workerEarnings = {};
                        workers.forEach(worker => {
                            const workerName = getWorkerName(worker);
                            workerEarnings[workerName] = 0;
                        });
                        window.objects
                            .filter(obj => !obj.isExpense)
                            .forEach(obj => {
                                obj.workers.forEach(w => {
                                    const workerName = typeof w === 'string' ? w : w.name;
                                    if (workerEarnings[workerName] !== undefined) {
                                        workerEarnings[workerName] += parseFloat(w.cost || 0);
                                    }
                                });
                            });
                        const workerNames = Object.keys(workerEarnings).filter(name => workerEarnings[name] > 0);
                        const workerData = workerNames.map(name => workerEarnings[name]);
                        const colors = [
                            'rgba(52, 152, 219, 0.8)',
                            'rgba(46, 204, 113, 0.8)',
                            'rgba(155, 89, 182, 0.8)',
                            'rgba(230, 126, 34, 0.8)',
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(241, 196, 15, 0.8)',
                            'rgba(26, 188, 156, 0.8)',
                            'rgba(52, 73, 94, 0.8)',
                            'rgba(149, 165, 166, 0.8)'
                        ];
                        pieChart = new Chart(pieCanvas, {
                            type: 'doughnut',
                            data: {
                                labels: workerNames,
                                datasets: [{
                                    data: workerData,
                                    backgroundColor: colors.slice(0, workerNames.length),
                                    borderColor: '#1F2937',
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: textColor,
                                            padding: 15,
                                            font: {
                                                size: 12
                                            }
                                        }
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        padding: 12,
                                        callbacks: {
                                            label: function(context) {
                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                const percentage = formatNum((context.parsed / total) * 100, 1);
                                                return `${context.label}: ${formatNum(context.parsed)} ₽ (${percentage}%)`;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                    function scrollToObject(timestamp, scrollPosition = null) {
                        
                        if (scrollPosition === null) {
                            scrollPosition = window.scrollY || document.documentElement.scrollTop;
                        }
                        const targetCard = document.querySelector(`.calculation[data-timestamp="${timestamp}"]`);
                        if (targetCard) {
                            
                            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetCard.classList.add('highlight');
                            addBackButton(scrollPosition);
                            setTimeout(() => {
                                
                                targetCard.classList.remove('highlight');
                            }, 3000);
                        } else {
                            
                        }
                    }
                    function addBackButton(scrollPosition) {
                        const existingBackBtn = document.getElementById('back-to-stats-btn');
                        if (existingBackBtn) existingBackBtn.remove();
                        const backBtn = document.createElement('button');
                        backBtn.id = 'back-to-stats-btn';
                        backBtn.className = 'back-to-stats-btn floating-btn';
                        backBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http:
                        backBtn.style.position = 'fixed';
                        backBtn.style.bottom = '70px'; 
                        backBtn.style.right = '22px'; 
                        backBtn.style.zIndex = '1002'; 
                        backBtn.style.width = '36px'; 
                        backBtn.style.height = '36px';
                        backBtn.style.backgroundColor = '#34495e'; 
                        backBtn.style.border = 'none';
                        backBtn.style.borderRadius = '50%';
                        backBtn.style.cursor = 'pointer';
                        backBtn.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
                        backBtn.style.display = 'flex';
                        backBtn.style.alignItems = 'center';
                        backBtn.style.justifyContent = 'center';
                        backBtn.style.transition = 'all 0.3s ease';
                        backBtn.onmouseover = function() {
                            this.style.backgroundColor = '#2c3e50';
                            this.style.transform = 'translateY(-3px)';
                            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                        };
                        backBtn.onmouseout = function() {
                            this.style.backgroundColor = '#34495e';
                            this.style.transform = 'translateY(0)';
                            this.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
                        };
                        backBtn.addEventListener('click', () => {
                            
                            if (typeof scrollPosition === 'number') {
                                window.scrollTo({
                                    top: scrollPosition,
                                    behavior: 'smooth'
                                });
                            } else {
                                document.getElementById('worker-stats').scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                            backBtn.remove();
                        });
                        const checkScrollPosition = debounce(() => {
                            const currentScroll = window.scrollY || document.documentElement.scrollTop;
                            const isNearScrollPosition = typeof scrollPosition === 'number' && Math.abs(currentScroll - scrollPosition) < 300;
                            if (isNearScrollPosition) {
                                
                                backBtn.remove();
                                window.removeEventListener('scroll', checkScrollPosition);
                            }
                        }, 100);
                        window.addEventListener('scroll', checkScrollPosition);
                        document.body.appendChild(backBtn);
                    }
                    function debounce(func, wait) {
                        let timeout;
                        return function executedFunction(...args) {
                            const later = () => {
                                clearTimeout(timeout);
                                func(...args);
                            };
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                        };
                    }
                    function filterByWorker(worker) {
                        filterInput.value = worker;
                        renderObjects();
                        const resetFilter = document.createElement('span');
                        resetFilter.className = 'filter-reset';
                        resetFilter.innerHTML = '✕';
                        resetFilter.title = 'Сбросить фильтр';
                        resetFilter.addEventListener('click', () => {
                            filterInput.value = '';
                            renderObjects();
                            resetFilter.remove();
                        });
                        const filterGroup = document.querySelector('.filter-group');
                        if (!filterGroup.querySelector('.filter-reset')) filterGroup.appendChild(resetFilter);
                    }
                    function renderWorkerCharts() {
                        document.querySelectorAll('.worker-chart').forEach(chartDiv => {
                            const worker = chartDiv.dataset.worker;
                            const earnings = parseFloat(chartDiv.dataset.earnings);
                            const workerObjects = window.objects.filter(obj =>
                            (obj.workers.some(w => (typeof w === 'string' ? w : w.name) === worker)) ||
                            (obj.receivers && obj.receivers.includes(worker))
                            );
                            const regularObjects = workerObjects.filter(obj => !obj.isExpense && !obj.manualPrice && !obj.isCustomService).length;
                            const manualObjects = workerObjects.filter(obj => obj.manualPrice).length;
                            const services = workerObjects.filter(obj => obj.isCustomService).length;
                            const expenses = workerObjects.filter(obj => obj.isExpense).length;
                            const lowKtuCount = workerObjects
                            .filter(obj => !obj.isExpense && obj.workers.some(w => w.name === worker && w.ktu < 1))
                            .length;
                            const chartData = [regularObjects, manualObjects, services, expenses, lowKtuCount];
                            const hasData = chartData.some(val => val > 0);
                            const actualMax = Math.max(regularObjects, manualObjects, services, expenses, lowKtuCount);
                            const maxValue = actualMax > 0 ? Math.max(actualMax, 3) : 3;
                            const canvas = document.createElement('canvas');
                            chartDiv.innerHTML = '';
                            chartDiv.appendChild(canvas);
                            setTimeout(() => {
                                const chart = new Chart(canvas, {
                                    type: 'radar',
                                    data: {
                                        labels: ['Обычные', 'Ручная', 'Услуги', 'Расходы', 'КТУ < 1'],
                                        datasets: [{
                                            label: worker,
                                            data: chartData,
                                            fill: true,
                                            backgroundColor: 'rgba(255, 99, 132, 0.4)',
                                            borderColor: 'rgb(255, 99, 132)',
                                            borderWidth: 4,
                                            pointBackgroundColor: 'rgb(255, 99, 132)',
                                            pointBorderColor: '#fff',
                                            pointHoverBackgroundColor: '#fff',
                                            pointHoverBorderColor: 'rgb(255, 99, 132)',
                                            pointRadius: 6,
                                            pointHoverRadius: 8,
                                            pointBorderWidth: 3,
                                            pointHoverBorderWidth: 3
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: true,
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            titleColor: '#fff',
                                            bodyColor: '#fff',
                                            borderColor: 'rgba(52, 152, 219, 0.5)',
                                            borderWidth: 1,
                                            padding: 12,
                                            displayColors: false,
                                            callbacks: {
                                                title: function(context) {
                                                    return context[0].label;
                                                },
                                                label: function(context) {
                                                    return 'Участие: ' + context.parsed.r;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        r: {
                                            beginAtZero: true,
                                            max: maxValue,
                                            min: 0,
                                            ticks: {
                                                stepSize: Math.ceil(maxValue / 3),
                                                count: 3,
                                                color: '#95a5a6',
                                                backdropColor: 'transparent',
                                                font: {
                                                    size: 12,
                                                    weight: '500'
                                                },
                                                showLabelBackdrop: false,
                                                z: 1
                                            },
                                            grid: {
                                                color: 'rgba(149, 165, 166, 0.3)',
                                                circular: false,
                                                lineWidth: 2
                                            },
                                            angleLines: {
                                                color: 'rgba(149, 165, 166, 0.4)',
                                                lineWidth: 2
                                            },
                                            pointLabels: {
                                                color: '#2c3e50',
                                                font: {
                                                    size: 11,
                                                    weight: '700'
                                                },
                                                padding: 3
                                            }
                                        }
                                    }
                                }
                            });
                            }, 0);
                        });
                    }
                    function renderObjectDetails(obj) {
                        const costPerWorker = obj.isExpense
                        ? formatNum(parseFloat(obj.cost) / obj.workers.length)
                        : obj.workers.map(w => {
                            return `<span class="worker-item">${getWorkerIcon(w.name)}${w.name}: ${w.cost} ₽ (КТУ ${w.ktu}${w.area ? `, ${w.area} м²` : ''})</span>`;
                        }).join('');
                        const costPerReceiver = obj.isExpense && obj.receivers.length > 0
                        ? formatNum(Math.abs(parseFloat(obj.cost)) / obj.receivers.length)
                        : '0.00';
                        const workersDisplay = obj.isExpense 
                        ? obj.workers.map(worker => {
                            const workerName = typeof worker === 'string' ? worker : worker.name;
                            return `<span class="worker-item">${getWorkerIcon(workerName)}${workerName}</span>`;
                        }).join('')
                        : obj.workers.map(w => {
                            return `<span class="worker-item">${getWorkerIcon(w.name)}${w.name} (КТУ ${w.ktu}${w.area ? `, ${w.area} м²` : ''})</span>`;
                        }).join('');
                        const receiversDisplay = obj.receivers && obj.receivers.length > 0
                        ? obj.receivers.map(receiver => {
                            return `<span class="worker-item">${getWorkerIcon(receiver)}${receiver}</span>`;
                        }).join('')
                        : '';
                        return `
                        ${obj.area ? `<div class="info-line"><span class="label">Площадь:</span><span class="value">${obj.area}</span></div>` : ''}
                        <div class="info-line"><span class="label">Услуга:</span><span class="value">${obj.service}</span></div>
                        <div class="info-line"><span class="label">Стоимость:</span><span class="value">${obj.cost} ₽</span></div>
                        <div class="info-line"><span class="label">${obj.isExpense ? 'Участники (списание)' : 'Участники'}:</span><span class="value">${workersDisplay}</span></div>
                        ${obj.isExpense && receiversDisplay ? `<div class="info-line"><span class="label">Участники (начисление):</span><span class="value">${receiversDisplay}</span></div>` : ''}
                        <div class="info-line"><span class="label">${obj.isExpense ? 'На одного (списание)' : 'Распределение'}:</span><span class="value">${costPerWorker}</span></div>
                        ${obj.isExpense && obj.receivers && obj.receivers.length > 0 ? `<div class="info-line"><span class="label">На одного (начисление):</span><span class="value">${costPerReceiver} ₽</span></div>` : ''}
                        `;
                    }
                    function toggleDimensionFields(formPrefix) {
                        const lengthInput = document.getElementById(`${formPrefix}-length`);
                        const widthInput = document.getElementById(`${formPrefix}-width`);
                        const areaInput = document.getElementById(`${formPrefix}-area`);
                        function updateArea() {
                            const length = parseFloat(lengthInput.value) || 0;
                            const width = parseFloat(widthInput.value) || 0;
                            if (length > 0 && width > 0) {
                                areaInput.value = formatNum(length * width);
                                areaInput.disabled = true;
                            } else {
                                areaInput.value = '';
                                areaInput.disabled = false;
                            }
                        }
                        areaInput.addEventListener('input', () => {
                            const value = areaInput.value.trim();
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue) && numValue > 0) {
                                lengthInput.disabled = true;
                                widthInput.disabled = true;
                                lengthInput.value = '';
                                widthInput.value = '';
                            } else if (!value || value === '0' || numValue === 0) {
                                lengthInput.disabled = false;
                                widthInput.disabled = false;
                                updateArea();
                            }
                        });
                        lengthInput.addEventListener('input', updateArea);
                        widthInput.addEventListener('input', updateArea);
                    }
                    toggleDimensionFields('object');
                    toggleDimensionFields('manual');
                    function createFloatingButtons() {
                        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                            anchor.addEventListener('click', () => {
                                floatingAddBtn.classList.remove('show');
                                floatingExportBtn.classList.remove('show');
                                floatingExcelBtn.classList.remove('show');
                                floatingRestoreBtn.classList.remove('show');
                                if (typeof floatingCloudBtn !== 'undefined') floatingCloudBtn.classList.remove('show');
                                if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                                floatingEditBtn.classList.remove('show');
                                floatingStatsBtn.classList.remove('show');
                                floatingRefreshBtn.classList.remove('show');
                                subButtons.forEach(btn => {
                                    document.getElementById(btn.id).classList.remove('show');
                                });
                                if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                            });
                        });
                        const existingButtons = document.querySelectorAll('.floating-btn-container, .floating-btn, .sub-btn');
                        existingButtons.forEach(btn => btn.remove());
                        const buttonContainer = document.createElement('div');
                        buttonContainer.id = 'floating-btn-container';
                        buttonContainer.className = 'floating-btn-container';
                        const floatingMenuBtn = document.createElement('button');
                        floatingMenuBtn.id = 'floating-menu-btn';
                        floatingMenuBtn.className = 'floating-btn menu-btn';
                        floatingMenuBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        const floatingAddBtn = document.createElement('button');
                        floatingAddBtn.id = 'floating-add-btn';
                        floatingAddBtn.className = 'floating-btn fab-btn';
                        floatingAddBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingAddBtn.title = "Добавить объект";
                        const subButtonsContainer = document.createElement('div');
                        subButtonsContainer.id = 'sub-buttons-container';
                        subButtonsContainer.className = 'sub-buttons-container';
                        const subButtons = [
                            { id: 'sub-point', color: '#4A90E2', formId: 'add-point-form', title: 'Добавить объект' },
                            { id: 'add-line', color: '#E94B8B', formId: 'add-line-form', title: 'Добавить расход' },
                            { id: 'add-polygon', color: '#F7971E', formId: 'add-polygon-form', title: 'Добавить объект с ручной ценой' },
                            { id: 'add-collection', color: '#667eea', formId: 'add-collection-form', title: 'Добавить услугу' }
                        ];
                        subButtons.forEach(btn => {
                            const subBtn = document.createElement('button');
                            subBtn.id = btn.id;
                            subBtn.className = 'floating-btn sub-btn';
                            subBtn.style.backgroundColor = btn.color; 
                            subBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http:
                            subBtn.title = btn.title;
                            subBtn.addEventListener('click', () => {
                                let targetForm = null;
                                if (btn.formId === 'add-point-form') {
                                    targetForm = objectForm;
                                    showForm(objectForm);
                                } else if (btn.formId === 'add-line-form') {
                                    targetForm = expenseForm;
                                    showForm(expenseForm);
                                } else if (btn.formId === 'add-polygon-form') {
                                    targetForm = manualPriceForm;
                                    showForm(manualPriceForm);
                                } else if (btn.formId === 'add-collection-form') {
                                    targetForm = customServiceForm;
                                    showForm(customServiceForm);
                                }
                                if (targetForm) {
                                    
                                    const y = targetForm.getBoundingClientRect().top + window.scrollY;
                                    window.scrollTo({ top: y - 15, behavior: 'smooth' });
                                } else {
                                    
                                }
                                floatingAddBtn.classList.remove('show');
                                floatingExportBtn.classList.remove('show');
                                floatingExcelBtn.classList.remove('show');
                                floatingRestoreBtn.classList.remove('show');
                                if (typeof floatingCloudBtn !== 'undefined') floatingCloudBtn.classList.remove('show');
                                floatingEditBtn.classList.remove('show');
                                floatingStatsBtn.classList.remove('show');
                                floatingRefreshBtn.classList.remove('show');
                                subButtons.forEach(sub => {
                                    document.getElementById(sub.id).classList.remove('show');
                                });
                                if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                            });
                            subButtonsContainer.appendChild(subBtn);
                        });
                        const cloudWrapper = document.createElement('div');
                        cloudWrapper.className = 'cloud-wrapper';
                        const floatingCloudBtn = document.createElement('button');
                        floatingCloudBtn.id = 'floating-cloud-btn';
                        floatingCloudBtn.className = 'floating-btn fab-btn';
                        floatingCloudBtn.title = 'Данные';
                        floatingCloudBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        const floatingExportBtn = document.createElement('button');
                        floatingExportBtn.id = 'floating-export-btn';
                        floatingExportBtn.className = 'floating-btn sub-btn cloud-sub';
                        floatingExportBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingExportBtn.title = "Экспорт в JSON";
                        const floatingExcelBtn = document.createElement('button');
                        floatingExcelBtn.id = 'floating-excel-btn';
                        floatingExcelBtn.className = 'floating-btn sub-btn cloud-sub';
                        floatingExcelBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingExcelBtn.title = "Экспорт в Excel";
                        const floatingRestoreBtn = document.createElement('button');
                        floatingRestoreBtn.id = 'floating-restore-btn';
                        floatingRestoreBtn.className = 'floating-btn sub-btn cloud-sub';
                        floatingRestoreBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingRestoreBtn.title = "Восстановить из JSON";
                        const cloudSubContainer = document.createElement('div');
                        cloudSubContainer.id = 'cloud-sub-buttons-container';
                        cloudSubContainer.className = 'cloud-sub-buttons';
                        cloudWrapper.appendChild(cloudSubContainer);
                        [floatingExportBtn, floatingExcelBtn, floatingRestoreBtn].forEach(btn => {
                            cloudSubContainer.appendChild(btn);
                        });
                        const cloudSubButtons = [floatingExportBtn, floatingExcelBtn, floatingRestoreBtn];
                        const toggleCloudSub = (open) => {
                            const shouldOpen = open !== undefined ? open : cloudSubButtons.some(b => !b.classList.contains('show'));
                            cloudSubContainer.style.position = 'absolute';
                            cloudSubContainer.style.left = '50%';
                            cloudSubContainer.style.right = 'auto';
                            cloudSubContainer.style.bottom = '50px';
                            cloudSubContainer.style.transform = 'translateX(-50%)';
                            cloudSubButtons.forEach(b => {
                                if (shouldOpen) b.classList.add('show'); else b.classList.remove('show');
                            });
                        };
                        floatingCloudBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleCloudSub();
                        });
                        toggleCloudSub(false);
                        const floatingEditBtn = document.createElement('button');
                        floatingEditBtn.id = 'floating-edit-btn';
                        floatingEditBtn.className = 'floating-btn fab-btn';
                        floatingEditBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingEditBtn.title = "Режим редактирования";
                        const floatingStatsBtn = document.createElement('button');
                        floatingStatsBtn.id = 'floating-stats-btn';
                        floatingStatsBtn.className = 'floating-btn fab-btn';
                        floatingStatsBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingStatsBtn.title = "Статистика работников";
                        const floatingRefreshBtn = document.createElement('button');
                        floatingRefreshBtn.id = 'floating-refresh-btn';
                        floatingRefreshBtn.className = 'floating-btn fab-btn';
                        floatingRefreshBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http:
                        floatingRefreshBtn.title = "Обновить страницу";
                        const style = document.createElement('style');
                        style.textContent = `
                        .floating-btn-container {
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            z-index: 1000;
                            display: flex;
                            flex-direction: row-reverse;
                            align-items: center;
                            gap: 10px;
                        }
                        .sub-buttons-container {
                            position: absolute;
                            bottom: 50px;
                            left: 50%;
                            transform: translateX(-50%);
                            display: flex;
                            flex-direction: column-reverse;
                            align-items: center;
                            gap: 10px;
                            z-index: 999;
                        }
                        #cloud-sub-buttons-container {
                            position: absolute;
                            bottom: 50px;
                            right: 0;
                            left: auto;
                            transform: none;
                            display: flex;
                            flex-direction: column-reverse;
                            align-items: center;
                            gap: 10px;
                            z-index: 999;
                        }
                        .floating-btn {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            border: none;
                            cursor: pointer;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                            transition: all 0.3s ease;
                            position: relative;
                            padding: 10px;
                        }
                        .floating-btn svg {
                            pointer-events: none;
                            display: block;
                            width: 100%;
                            height: 100%;
                        }
                        .sub-btn {
                            width: 32px;
                            height: 32px;
                            transform: scale(0);
                            opacity: 0;
                            transition: all 0.3s ease;
                        }
                        .sub-btn.show {
                            transform: scale(1);
                            opacity: 1;
                        }
                        .menu-btn {
                            background-color: #34495e;
                            z-index: 1001;
                        }
                        .menu-btn:hover {
                            background-color: #2c3e50;
                            transform: rotate(90deg);
                        }
                        .fab-btn {
                            transform: scale(0);
                            opacity: 0;
                            transition: all 0.3s ease;
                        }
                        .fab-btn.show {
                            transform: scale(1);
                            opacity: 1;
                        }
                        #floating-add-btn {
                        background-color: #27ae60;
                        }
                        #floating-add-btn:hover {
                        background-color: #219653;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-export-btn {
                        background-color: #3498db;
                        }
                        #floating-export-btn:hover {
                        background-color: #2980b9;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-edit-btn {
                        background-color: #3498db;
                        }
                        #floating-edit-btn:hover {
                        background-color: #2980b9;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-edit-btn.active {
                        background-color: #e74c3c;
                        }
                        #floating-edit-btn.active:hover {
                        background-color: #c0392b;
                        }
                        #floating-stats-btn {
                        background-color: #3498db;
                        }
                        #floating-stats-btn:hover {
                        background-color: #2980b9;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-refresh-btn {
                        background-color: #3498db;
                        }
                        #floating-refresh-btn:hover {
                        background-color: #2980b9;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-excel-btn {
                        background-color: #1abc9c;
                        }
                        #floating-excel-btn:hover {
                        background-color: #16a085;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-restore-btn {
                        background-color: #f39c12;
                        }
                        #floating-cloud-btn {
                        background-color: #3498db;
                        }
                        .cloud-wrapper { position: relative; }
                        #cloud-sub-buttons-container {
                            bottom: 50px !important;
                            left: 50% !important;
                            right: auto !important;
                            transform: translateX(-50%) !important;
                        }
                        #floating-cloud-btn:hover {
                        background-color: #2980b9;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        #floating-restore-btn:hover {
                        background-color: #d68910;
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        }
                        `;
                        document.head.appendChild(style);
                        floatingMenuBtn.addEventListener('click', () => {
                            floatingAddBtn.classList.toggle('show');
                            if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                            floatingCloudBtn.classList.toggle('show');
                            floatingEditBtn.classList.toggle('show');
                            floatingStatsBtn.classList.toggle('show');
                            floatingRefreshBtn.classList.toggle('show');
                            subButtons.forEach(btn => {
                                document.getElementById(btn.id).classList.remove('show');
                            });
                        });
                        floatingAddBtn.addEventListener('click', () => {
                            subButtons.forEach(btn => {
                                document.getElementById(btn.id).classList.toggle('show');
                            });
                        });
                        floatingExportBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const json = JSON.stringify(window.objects, null, 2);
                            const blob = new Blob([json], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'save.json';
                            a.click();
                            URL.revokeObjectURL(url);
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingExcelBtn.classList.remove('show');
                            floatingRestoreBtn.classList.remove('show');
                            if (typeof floatingCloudBtn !== 'undefined') floatingCloudBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                            if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                        });
                        floatingExcelBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const csv = generateCSV();
                            downloadFile(csv, `Отчет_${new Date().toLocaleDateString('ru-RU')}.csv`, 'text/csv;charset=utf-8;');
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingExcelBtn.classList.remove('show');
                            floatingRestoreBtn.classList.remove('show');
                            if (typeof floatingCloudBtn !== 'undefined') floatingCloudBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                            if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                        });
                        floatingRestoreBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const tempInput = document.createElement('input');
                            tempInput.type = 'file';
                            tempInput.accept = '.json,application/json';
                            tempInput.style.display = 'none';
                            document.body.appendChild(tempInput);
                            tempInput.addEventListener('change', (e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) {
                                    document.body.removeChild(tempInput);
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    try {
                                        if (!event.target || !event.target.result) {
                                            throw new Error('Не удалось прочитать файл');
                                        }
                                        const raw = JSON.parse(event.target.result);
                                        const normalized = normalizeBackup(raw);
                                        const restoredObjects = normalized.objects || [];
                                        const restoredWorkers = normalized.workers || [];
                                        if (confirm('Восстановить данные из JSON? Текущие данные будут перезаписаны.')) {
                                            window.objects = Array.isArray(restoredObjects) ? restoredObjects : [];
                                            workers = Array.isArray(restoredWorkers) && restoredWorkers.length > 0 ? restoredWorkers : (Array.isArray(workers) ? workers : []);
                                            saveData();
                                            populateWorkers();
                                            renderObjects();
                                            if (typeof renderWorkerStats === 'function') {
                                                renderWorkerStats();
                                            }
                                            alert('Данные успешно восстановлены!');
                                        }
                                    } catch (err) {
                                        
                                        alert('Ошибка при восстановлении: ' + (err.message || 'Неизвестная ошибка'));
                                    } finally {
                                        if (tempInput && tempInput.parentNode) {
                                            document.body.removeChild(tempInput);
                                        }
                                    }
                                };
                                reader.readAsText(file);
                            }, { once: true });
                            tempInput.click();
                            if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                            if (typeof floatingCloudBtn !== 'undefined') floatingCloudBtn.classList.remove('show');
                             floatingAddBtn.classList.remove('show');
                             floatingExportBtn.classList.remove('show');
                             floatingExcelBtn.classList.remove('show');
                             floatingRestoreBtn.classList.remove('show');
                             floatingEditBtn.classList.remove('show');
                             floatingStatsBtn.classList.remove('show');
                             floatingRefreshBtn.classList.remove('show');
                             subButtons.forEach(sub => {
                                 document.getElementById(sub.id).classList.remove('show');
                             });
                         });
                        floatingEditBtn.addEventListener('click', () => {
                            editMode = !editMode;
                            floatingEditBtn.classList.toggle('active', editMode);
                            renderObjects();
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingExcelBtn.classList.remove('show');
                            floatingRestoreBtn.classList.remove('show');
                            if (typeof floatingCloudBtn !== 'undefined') floatingCloudBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                            if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                        });
                        floatingStatsBtn.addEventListener('click', () => {
                            const statsSection = document.getElementById('worker-stats');
                            if (statsSection) {
                                const y = statsSection.getBoundingClientRect().top + window.scrollY;
                                window.scrollTo({ top: y - 15, behavior: 'smooth' });
                            } else {
                                
                            }
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingExcelBtn.classList.remove('show');
                            floatingRestoreBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                        });
                        floatingRefreshBtn.addEventListener('click', () => {
                            try {
                                caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
                                loadData();
                            } catch (e) {
                                
                            }
                            location.reload();
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingExcelBtn.classList.remove('show');
                            floatingRestoreBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                        });
                        if (editMode) {
                            floatingEditBtn.classList.add('active');
                        }
                        floatingAddBtn.appendChild(subButtonsContainer);
                        buttonContainer.appendChild(floatingMenuBtn);
                        buttonContainer.appendChild(floatingAddBtn);
                        cloudWrapper.appendChild(floatingCloudBtn);
                        buttonContainer.appendChild(cloudWrapper);
                        buttonContainer.appendChild(floatingEditBtn);
                        buttonContainer.appendChild(floatingStatsBtn);
                        buttonContainer.appendChild(floatingRefreshBtn);
                        document.body.appendChild(buttonContainer);
                        const activeTab = document.querySelector('.tab-content.active');
                        const shouldShow = passwordValidated && activeTab && activeTab.id === 'calc19';
                        floatingMenuBtn.style.display = shouldShow ? 'block' : 'none';
                        return { buttonContainer, floatingMenuBtn, floatingAddBtn, floatingExportBtn, floatingExcelBtn, floatingRestoreBtn, floatingEditBtn, floatingStatsBtn, floatingRefreshBtn };
                    }
                    setTimeout(() => {
                        createFloatingButtons();
                        const floatingBtn = document.getElementById('floating-menu-btn');
                        if (floatingBtn) {
                            const activeTab = document.querySelector('.tab-content.active');
                            const shouldShow = passwordValidated && activeTab && activeTab.id === 'calc19';
                            floatingBtn.style.display = shouldShow ? 'block' : 'none';
                        }
                    }, 100);
                    document.addEventListener('click', (ev) => {
                        const within = ev.target.closest && ev.target.closest('#floating-btn-container');
                        if (!within) {
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingExcelBtn.classList.remove('show');
                            floatingRestoreBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(btn => {
                                const el = document.getElementById(btn.id);
                                if (el) el.classList.remove('show');
                            });
                            if (typeof toggleCloudSub === 'function') toggleCloudSub(false);
                        }
                    });
                    [floatingAddBtn, floatingExportBtn, floatingExcelBtn, floatingRestoreBtn, floatingEditBtn, floatingStatsBtn, floatingRefreshBtn].forEach(b => b.classList.remove('show'));
});
