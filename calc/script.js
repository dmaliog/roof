// calc/script.js
document.addEventListener('DOMContentLoaded', () => {

    const tabLinks = document.querySelectorAll('.tab-links a');
    const tabContents = document.querySelectorAll('.tab-content');
    const passwordModal = document.getElementById('password-modal');
    const closePassword = document.getElementById('close-password');
    const submitPassword = document.getElementById('submit-password');
    const passwordInput = document.getElementById('password-input');
    const calc19Link = document.querySelector('a[href="#calc19"]');
    let passwordValidated = false;
    const correctPasswordHash = 'aedfcc5b92c3bb3f2a633eda717651e31d863c01683b9d93226f92b034ad5508';

    // Функция для хеширования пароля
    async function hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Скрываем все вкладки
    function hideAllTabs() {
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        tabLinks.forEach(link => link.classList.remove('active'));
    }

    // Показываем выбранную вкладку
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
        // Логика для floating-menu-btn
        const floatingBtn = document.getElementById('floating-menu-btn');
        if (floatingBtn) {
            floatingBtn.style.display = targetId === 'calc19' ? 'block' : 'none';
        }
    }

    // Показываем первую вкладку по умолчанию
    showTab('calc2');

    // Обработка кликов по вкладкам
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            if (targetId === 'calc19' && !passwordValidated) {
                passwordModal.style.display = 'flex';
            } else {
                showTab(targetId);
            }
        });
    });

    // Логика для пароля
    if (passwordModal && closePassword && submitPassword && calc19Link) {
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
                window.location.href = 'https://natribu.org/'; // Перенаправление при неверном пароле
                passwordInput.value = '';
            }
        });

        passwordInput.addEventListener('keyup', async (e) => {
            if (e.key === 'Enter') {
                submitPassword.click();
            }
        });
    }

    // Расход крепежа (прижимная планка)
    window.calculate2 = function() {
        const area = parseFloat(document.getElementById('area2').value) || 0;
        const resultDiv = document.getElementById('result2');
        if (area <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число для площади.';
            resultDiv.classList.remove('active');
            return;
        }
        const railsPerSqM = 0.5; // м рейки на м²
        const railsLength = Math.ceil(area * railsPerSqM);
        const railsCount = Math.ceil(railsLength / 2); // 2 м/рейка
        const mastic = railsLength * 0.5; // 0.5 кг герметика на м
        const masticCartridges = Math.ceil(mastic / 0.31); // картридж 0.31 кг
        const dowels = railsLength * 4; // 4 дюбеля на м
        const tools = 'Инструмент: ножницы по металлу (1 шт), перфоратор (1 шт), молоток (1 шт), пистолет для герметика (1 шт).';
        resultDiv.innerText = `Для ${area} м² потребуется ${railsLength} м прижимной планки (алюминиевая рейка TechnoNICOL, 2 м, ${railsCount} шт). Мастичный герметик: ${mastic.toFixed(2)} кг (${masticCartridges} картриджей, 0.31 кг). Быстрый монтаж: ${dowels} дюбелей (8 мм). ${tools}`;
        resultDiv.classList.add('active');
    };

    // Уклон кровли
    window.calculate4 = function() {
        const length = parseFloat(document.getElementById('length4').value) || 0;
        const height = parseFloat(document.getElementById('height4').value) || 0;
        const resultDiv = document.getElementById('result4');
        if (length <= 0 || height < 0) {
            resultDiv.innerText = 'Введите корректные положительные числа.';
            resultDiv.classList.remove('active');
            return;
        }
        const slope = (height / length) * 100;
        const recommendation = slope >= 1.5 ? 'Подходит для наплавляемой кровли' : 'Уклон слишком мал (мин. 1.5%)';
        resultDiv.innerText = `Уклон кровли: ${slope.toFixed(2)} %. ${recommendation}.`;
        resultDiv.classList.add('active');
    };

    // Время выполнения работ
    window.calculate7 = function() {
        const area = parseFloat(document.getElementById('area7').value) || 0;
        const team = parseFloat(document.getElementById('team7').value) || 1;
        const resultDiv = document.getElementById('result7');
        if (area <= 0 || team <= 0) {
            resultDiv.innerText = 'Введите корректные положительные числа.';
            resultDiv.classList.remove('active');
            return;
        }
        const time = area / (50 * team);
        resultDiv.innerText = `Время: ${time.toFixed(2)} дней.`;
        resultDiv.classList.add('active');
    };

    // Логистика материалов
    window.calculate8 = function() {
        const distance = parseFloat(document.getElementById('distance8').value) || 0;
        const volume = parseFloat(document.getElementById('volume8').value) || 0;
        const resultDiv = document.getElementById('result8');
        if (distance < 0 || volume < 0) {
            resultDiv.innerText = 'Введите корректные положительные числа.';
            resultDiv.classList.remove('active');
            return;
        }
        const cost = distance * 30 + volume * 150;
        resultDiv.innerText = `Стоимость логистики: ${cost.toFixed(2)} руб.`;
        resultDiv.classList.add('active');
    };

    // Расход праймера
    window.calculate11 = function() {
        const primerType = document.getElementById('primerType11').value;
        const baseType = document.getElementById('baseType11').value;
        const calcType = document.getElementById('calcType11').value;
        const inputValue = parseFloat(document.getElementById('area11').value) || 0;
        const resultDiv = document.getElementById('result11');
        if (inputValue <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число.';
            resultDiv.classList.remove('active');
            return;
        }
        let rate, bucketSize;
        switch (primerType) {
            case 'primer01':
                rate = baseType === 'concrete' ? 0.25 : 0.3;
                bucketSize = 16; // кг/ведро (20 л)
                break;
            case 'primer03':
                rate = baseType === 'concrete' ? 0.3 : 0.35;
                bucketSize = 18; // кг/ведро (20 л)
                break;
            case 'primer04':
                rate = baseType === 'concrete' ? 0.3 : 0.35;
                bucketSize = 16; // кг/ведро (20 л)
                break;
            case 'primer08':
                rate = baseType === 'concrete' ? 0.35 : 0.4;
                bucketSize = 8; // кг/ведро (10 л)
                break;
        }
        let result = '';
        const rollers = Math.ceil(inputValue / 100); // 1 валик на 100 м²
        const tools = `Инструмент: валик (180–250 мм, ${rollers} шт), чехлы для валика (${rollers} шт), телескопическая ручка (1 шт). Альтернатива: кисть (1–2 шт) или распылитель (1 шт).`;
        if (calcType === 'areaToMaterial') {
            const requiredKg = inputValue * rate;
            const buckets = Math.ceil(requiredKg / bucketSize);
            result = `Для ${inputValue} м² потребуется около ${requiredKg.toFixed(2)} кг праймера, или ${buckets} ведро(а) (${bucketSize} кг). ${tools}`;
        } else {
            const area = inputValue / rate;
            const buckets = Math.floor(inputValue / bucketSize);
            result = `${inputValue} кг праймера покрывает около ${area.toFixed(2)} м². Это ${buckets} ведро(а) (${bucketSize} кг) с остатком ${inputValue % bucketSize} кг. ${tools}`;
        }
        resultDiv.innerText = result;
        resultDiv.classList.add('active');
    };

    // Расход газовых баллонов
    window.calculate12 = function() {
        const area = parseFloat(document.getElementById('area12').value) || 0;
        const layers = parseFloat(document.getElementById('layers12').value) || 1;
        const resultDiv = document.getElementById('result12');
        if (area <= 0 || layers <= 0) {
            resultDiv.innerText = 'Введите корректные положительные числа.';
            resultDiv.classList.remove('active');
            return;
        }
        const cylinders = Math.ceil((area * layers) / 120);
        const tools = 'Инструмент: газовая горелка (1 шт на бригаду), зажигалка (1 комплект).';
        resultDiv.innerText = `Количество газовых баллонов (12 л): ${cylinders} шт. ${tools}`;
        resultDiv.classList.add('active');
    };

    // Расход мастики
    window.calculate13 = function() {
        const masticType = document.getElementById('masticType13').value;
        const calcType = document.getElementById('calcType13').value;
        const inputValue = parseFloat(document.getElementById('area13').value) || 0;
        const resultDiv = document.getElementById('result13');
        if (inputValue <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число.';
            resultDiv.classList.remove('active');
            return;
        }
        const rate = masticType === 'bitum' ? 1.5 : 2.0;
        const bucketSize = masticType === 'bitum' ? 20 : 18;
        const tools = 'Инструмент: пистолет для герметика (1 шт), шпатель (100 мм, 1–2 шт).';
        let result = '';
        if (calcType === 'areaToMaterial') {
            const requiredKg = inputValue * rate;
            const buckets = Math.ceil(requiredKg / bucketSize);
            result = `Для ${inputValue} м² потребуется около ${requiredKg.toFixed(2)} кг мастики, или ${buckets} ведро(а) (${bucketSize} кг). ${tools}`;
        } else {
            const area = inputValue / rate;
            const buckets = Math.floor(inputValue / bucketSize);
            result = `${inputValue} кг мастики покрывает около ${area.toFixed(2)} м². Это ${buckets} ведро(а) (${bucketSize} кг) с остатком ${inputValue % bucketSize} кг. ${tools}`;
        }
        resultDiv.innerText = result;
        resultDiv.classList.add('active');
    };

    // Аэраторы
    window.calculate15 = function() {
        const calcType = document.getElementById('calcType15').value;
        const inputValue = parseFloat(document.getElementById('inputValue15').value) || 0;
        const resultDiv = document.getElementById('result15');
        if (inputValue <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число.';
            resultDiv.classList.remove('active');
            return;
        }
        const aeratorsPerArea = 100;
        const minAerators = 2;
        const maxDistance = 15;
        const sealantRate = 0.1; // 0.1 кг герметика на аэратор
        const sealantCartridge = 0.31; // картридж 0.31 кг
        const tools = 'Инструмент: нож для кровли (100 мм, 1 шт), пистолет для герметика (1 шт).';
        let result = '';
        if (calcType === 'areaToMaterial') {
            const aerators = Math.max(minAerators, Math.ceil(inputValue / aeratorsPerArea));
            const sideLength = Math.sqrt(inputValue);
            const interval = Math.min(maxDistance, sideLength / Math.ceil(Math.sqrt(aerators)));
            const sealant = aerators * sealantRate;
            const cartridges = Math.ceil(sealant / sealantCartridge);
            result = `Для ${inputValue} м² потребуется около ${aerators} аэраторов ТАТПОЛИМЕР ТП-01.100/6. Интервал: до ${interval.toFixed(2)} м. Герметик: ${sealant.toFixed(2)} кг (${cartridges} картриджей, 0.31 кг). ${tools}`;
        } else {
            const area = inputValue * aeratorsPerArea;
            const sealant = inputValue * sealantRate;
            const cartridges = Math.ceil(sealant / sealantCartridge);
            result = `${inputValue} аэраторов ТАТПОЛИМЕР ТП-01.100/6 покрывает около ${area.toFixed(2)} м². Герметик: ${sealant.toFixed(2)} кг (${cartridges} картриджей, 0.31 кг). ${tools}`;
        }
        resultDiv.innerText = result;
        resultDiv.classList.add('active');
    };

    // Минвата
    window.calculate16 = function() {
        const material = document.getElementById('material16').value;
        const calcType = document.getElementById('calcType16').value;
        const inputValue = parseFloat(document.getElementById('inputValue16').value) || 0;
        const resultDiv = document.getElementById('result16');
        if (inputValue <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число.';
            resultDiv.classList.remove('active');
            return;
        }
        let areaPerPack, materialName;
        switch (material) {
            case 'minwool_technoacoustic':
                areaPerPack = 5.76;
                materialName = 'Минвата Техноакустик, 50 мм';
                break;
            case 'minwool_technoroof':
                areaPerPack = 2.88;
                materialName = 'Минвата Техноруф В60, 50 мм';
                break;
            case 'minwool_ozm':
                areaPerPack = 4.32;
                materialName = 'Минвата Техно ОЗМ, 30 мм';
                break;
        }
        const glueRate = 0.5; // 0.5 кг клея на м²
        const glueBucket = 25; // ведро 25 кг
        const tools = 'Инструмент: нож для резки минваты (200 мм, 1 шт), зубчатый шпатель (6–8 мм, 1 шт).';
        let result = '';
        if (calcType === 'areaToMaterial') {
            const packs = Math.ceil(inputValue / areaPerPack);
            const glue = inputValue * glueRate;
            const buckets = Math.ceil(glue / glueBucket);
            result = `Для ${inputValue} м² потребуется около ${packs} упаковок (${materialName}, ${areaPerPack} м²/уп.). Клей: ${glue.toFixed(2)} кг (${buckets} ведер, 25 кг). ${tools}`;
        } else {
            const area = inputValue * areaPerPack;
            const glue = area * glueRate;
            const buckets = Math.ceil(glue / glueBucket);
            result = `${inputValue} упаковок (${materialName}, ${areaPerPack} м²/уп.) покрывает около ${area.toFixed(2)} м². Клей: ${glue.toFixed(2)} кг (${buckets} ведер, 25 кг). ${tools}`;
        }
        resultDiv.innerText = result;
        resultDiv.classList.add('active');
    };

    // PIR-плиты
    window.calculate17 = function() {
        const material = document.getElementById('material17').value;
        const calcType = document.getElementById('calcType17').value;
        const inputValue = parseFloat(document.getElementById('inputValue17').value) || 0;
        const resultDiv = document.getElementById('result17');
        if (inputValue <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число.';
            resultDiv.classList.remove('active');
            return;
        }
        let areaPerPlate, materialName;
        switch (material) {
            case 'pir_logicpir':
                areaPerPlate = 0.72;
                materialName = 'PIR-плиты LOGICPIR, 50 мм';
                break;
            case 'pir_logicpir_prof':
                areaPerPlate = 2.83;
                materialName = 'PIR-плиты LOGICPIR PROF, 90 мм';
                break;
        }
        const foamRate = 0.75; // 0.75 кг пены на м²
        const canSize = 0.75; // банка 0.75 кг
        const tools = 'Инструмент: пистолет для пены (1 шт), нож для резки PIR (200 мм, 1 шт).';
        let result = '';
        if (calcType === 'areaToMaterial') {
            const plates = Math.ceil(inputValue / areaPerPlate);
            const foamKg = inputValue * foamRate;
            const cans = Math.ceil(foamKg / canSize);
            result = `Для ${inputValue} м² потребуется около ${plates} плит (${materialName}, ${areaPerPlate} м²/плита). Пена: ${foamKg.toFixed(2)} кг (${cans} банок, 0.75 кг/банка). ${tools}`;
        } else {
            const area = inputValue * areaPerPlate;
            const foamKg = area * foamRate;
            const cans = Math.ceil(foamKg / canSize);
            result = `${inputValue} плит (${materialName}, ${areaPerPlate} м²/плита) покрывает около ${area.toFixed(2)} м². Пена: ${foamKg.toFixed(2)} кг (${cans} банок, 0.75 кг/банка). ${tools}`;
        }
        resultDiv.innerText = result;
        resultDiv.classList.add('active');
    };

    // PDF-рендеринг и расчет рулонов
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
            return +(length * width).toFixed(2);
        }
        throw new Error("Не удалось определить размеры рулона из PDF.");
    };

    window.calculate18 = async function() {
        const area = parseFloat(document.getElementById('area18').value) || 0;
        const pdfUrl = document.getElementById('material18').value;
        const resultDiv = document.getElementById('result18');
        if (area <= 0) {
            resultDiv.innerText = 'Введите корректное положительное число для площади.';
            resultDiv.classList.remove('active');
            return;
        }
        try {
            const text = await fetchPDFText(pdfUrl);
            const rollArea = await extractRollArea(text);
            const requiredArea = area * 1.15; // Запас 15%
            const rollsNeeded = Math.ceil(requiredArea / rollArea);
            const tools = 'Инструмент: газовая горелка (1 шт на бригаду), зажигалка (1 комплект), нож для кровли (100 мм, 1 шт).';
            resultDiv.innerText = `Для ${area} м² потребуется ${rollsNeeded} рулон(ов) (площадь с запасом 15%: ${requiredArea.toFixed(2)} м², площадь одного рулона: ${rollArea} м²). ${tools}`;
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

    // DOM элементы
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

    // Переменные состояния
    window.objects = []; // Глобальная переменная
    let workers = [];
    let editMode = false;
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

    // Инициализация автокомплита для расходов
    expenseNameSuggestions.id = 'expense-name-suggestions';
    expenseNameSuggestions.className = 'suggestions-list';
    if (!expenseNameInput.nextElementSibling) expenseNameInput.parentElement.appendChild(expenseNameSuggestions);

    // Установка текстов кнопок
    objectForm.querySelector('button[type="submit"]').textContent = 'Добавить объект';
    expenseForm.querySelector('button[type="submit"]').textContent = 'Добавить расход';
    manualPriceForm.querySelector('button[type="submit"]').textContent = 'Добавить объект';
    customServiceForm.querySelector('button[type="submit"]').textContent = 'Добавить услугу';

    // Функции для objectForm (выносим наружу, чтобы ссылки не менялись)
    function toggleServiceOptions() {
        optionsList.classList.toggle('show');
    }

    function selectServiceOption(e) {
        const selectedValueText = e.target.getAttribute('data-value');
        selectDisplay.innerHTML = `${e.target.textContent} <span class="dropdown-icon">▾</span>`;
        selectedValue.value = selectedValueText;
        optionsList.classList.remove('show');
    }

    // Функции для manualPriceForm (выносим наружу, чтобы ссылки не менялись)
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

    // Функция переключения форм
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
                    populateManualServiceSelect(prices, manualSelectDisplay, manualSelectedValue, manualOptionsList, manualPriceLabel); // Добавлено: перезаполнение списка на всякий случай
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

    // Сброс состояния полей формы
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
        // Сбрасываем галочку "Ростиковская методика"
        const rostikMethodCheckbox = form.querySelector('input[name="useRostikMethod"]');
        if (rostikMethodCheckbox) rostikMethodCheckbox.checked = false;
    }

    // Управление состоянием полей ввода
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

    // Переключение режима расчета бензина
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
        const receivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);

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
            const fuelConsumption = 6.7; // 6,7 литров на 100 км
            const fuelPrice = 61; // 61 рубль за литр

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
                    amountInput.value = distance > 0 ? calculatedAmount.toFixed(2) : '';
                });
                const distance = parseFloat(distanceValueInput.value) || 0;
                const liters = (distance * fuelConsumption) / 100;
                amountInput.value = distance > 0 ? -(liters * fuelPrice).toFixed(2) : '';
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
                    amountInput.value = distance > 0 ? calculatedAmount.toFixed(2) : '';
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

    // Обработчики событий для переключения выпадающих списков
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

        // Загрузка данных
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
            const retryDelay = 1000; // 1 секунда

            async function fetchWithRetry(url, retryCount = 0) {
                try {
                    const response = await fetch(url, fetchOptions);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error(`Ошибка загрузки ${url}:`, error);
                    if (retryCount < maxRetries) {
                        console.log(`Повторная попытка загрузки ${url} (${retryCount + 1}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return fetchWithRetry(url, retryCount + 1);
                    }
                    console.error(`Не удалось загрузить ${url} после ${maxRetries} попыток`);
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

                    // Проверяем успешность загрузки каждого файла
                    if (!objectsData) {
                        console.error('Не удалось загрузить save.json');
                        window.objects = [];
                    } else {
                        window.objects = objectsData;
                    }

                    if (!workersData) {
                        console.error('Не удалось загрузить workers.json');
                        workers = ['Артём', 'Коля', 'Слава', 'Женя'];
                    } else {
                        workers = workersData;
                    }

                    if (!pricesData) {
                        console.error('Не удалось загрузить prices.json');
                        prices = [];
                    } else {
                        prices = pricesData;
                    }

                    if (!customServicesData) {
                        console.error('Не удалось загрузить custom-services.json');
                        customServices = [];
                    } else {
                        customServices = customServicesData;
                    }

                    if (!expenseTypesData) {
                        console.error('Не удалось загрузить expense-types.json');
                        expenseTypes = [];
                    } else {
                        expenseTypes = expenseTypesData;
                    }

                    // Добавляем стандартные значения
                    expenseTypes.unshift({ name: "Своё название" });
                    expenseTypes.push({ name: "Еда" }, { name: "Займ" });
                    customServices.unshift({ name: "Своё название" });

                    customServiceNames = [...new Set(window.objects.filter(obj => obj.isCustomService).map(obj => obj.name))];

                    // Обновляем UI
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
                    console.error('Ошибка при загрузке данных:', error);
                    alert('Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу или попробуйте позже.');
                }
            }

            loadAllData();
        }

        loadData();

        // Обработчик отправки формы кастомной услуги
        customServiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isEditing = customServiceForm.dataset.isEditing === 'true';
            const serviceName = serviceNameInput.disabled || serviceNameInput.style.display === 'none'
            ? serviceSelect.value
            : serviceNameInput.value.trim();
            const servicePrice = parseFloat(customServiceForm.querySelector('input[name="servicePrice"]').value);
            const isPaid = customServiceForm.querySelector('input[name="isPaid"]').checked;
            const useRostikMethod = customServiceForm.querySelector('input[name="useRostikMethod"]').checked;
            const workersData = Array.from(serviceWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => {
                const ktuInput = customServiceForm.querySelector(`input[name="servicektu_${input.value}"]`);
                return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
            });
            // Собираем данные о выданных деньгах
            const issuedMoney = Array.from(customServiceForm.querySelectorAll('.issued-money-group input[type="checkbox"]:checked')).map(checkbox => {
                const workerName = checkbox.value;
                const amountInput = customServiceForm.querySelector(`input[name="issuedamount_${workerName}"]`);
                const amount = parseFloat(amountInput.value) || 0;
                return amount > 0 ? { name: workerName, amount: amount.toFixed(2) } : null;
            }).filter(item => item !== null);

            if (!serviceName || isNaN(servicePrice) || servicePrice <= 0 || workersData.length === 0 || workersData.some(w => w.ktu <= 0)) {
                alert('Заполните все поля корректно!');
                return;
            }

            const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);
            const object = {
                name: serviceName,
                service: serviceName,
                cost: servicePrice.toFixed(2),
                workers: useRostikMethod ? (() => {
                    const numWorkers = workersData.length;
                    let baseAmountPerWorker = servicePrice / numWorkers;
                    let initialWorkersWithCost = workersData.map(w => ({
                        name: w.name,
                        ktu: w.ktu,
                        cost: baseAmountPerWorker * w.ktu
                    }));

                    const distributedAmount = initialWorkersWithCost.reduce((sum, w) => sum + w.cost, 0);
                    const remainingAmount = servicePrice - distributedAmount;

                    const workersWithKtu1 = workersData.filter(w => w.ktu === 1).length;
                    if (workersWithKtu1 > 0 && remainingAmount > 0) {
                        const additionalPerKtu1Worker = remainingAmount / workersWithKtu1;
                        return initialWorkersWithCost.map(w => ({
                            name: w.name,
                            ktu: w.ktu,
                            cost: (w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost).toFixed(2)
                        }));
                    } else {
                        return initialWorkersWithCost.map(w => ({
                            name: w.name,
                            ktu: w.ktu,
                            cost: w.cost.toFixed(2)
                        }));
                    }
                })() : workersData.map(w => ({ name: w.name, ktu: w.ktu, cost: (servicePrice * w.ktu / totalKtu).toFixed(2) })),
                timestamp: new Date().toLocaleString(),
                isExpense: false,
                isCustomService: true,
                isPaid: isPaid,
                useRostikMethod: useRostikMethod,
                issuedMoney,
                editHistory: isEditing ? window.objects[customServiceForm.dataset.editIndex]?.editHistory || [] : []
            };

            if (isEditing) {
                const index = parseInt(customServiceForm.dataset.editIndex);
                const oldObj = window.objects[index];
                const changes = [];
                if (serviceName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${serviceName}"`);
                if (servicePrice !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${servicePrice}`);
                if (JSON.stringify(object.workers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${object.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
                if (isPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${isPaid ? 'Выплачено' : 'Не выплачено'}"`);
                if (useRostikMethod !== oldObj.useRostikMethod) changes.push(`Методика: "${oldObj.useRostikMethod ? 'Ростиковская' : 'Стандартная'}" → "${useRostikMethod ? 'Ростиковская' : 'Стандартная'}"`);
                // Проверяем изменения в "Выданные деньги"
                const oldIssuedMoneyStr = oldObj.issuedMoney ? oldObj.issuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                const newIssuedMoneyStr = issuedMoney.length > 0 ? issuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                if (oldIssuedMoneyStr !== newIssuedMoneyStr) {
                    changes.push(`Выданные деньги: "${oldIssuedMoneyStr}" → "${newIssuedMoneyStr}"`);
                }

                if (changes.length > 0) {
                    object.editedTimestamp = new Date().toLocaleString();
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

                    function populateWorkers() {
                        const createCheckbox = (name, group, prefix, withKtu = false, withAmount = false) => {
                            const label = document.createElement('label');
                            label.innerHTML = `
                            <input type="checkbox" name="${prefix}workers" value="${name}">
                            ${name}
                            ${withKtu ? `<input type="number" class="ktu-input" name="${prefix}ktu_${name}" step="0.1" min="0" placeholder="КТУ" disabled>` : ''}
                            ${withAmount ? `<input type="number" class="amount-input" name="${prefix}amount_${name}" step="0.01" min="0" placeholder="Сумма (₽)" disabled>` : ''}
                            `;
                            group.appendChild(label);
                            if (withKtu) {
                                const checkbox = label.querySelector('input[type="checkbox"]');
                                const ktuInput = label.querySelector('.ktu-input');
                                checkbox.addEventListener('change', () => {
                                    ktuInput.disabled = !checkbox.checked;
                                    if (!checkbox.checked) ktuInput.value = '';
                                });
                            }
                            if (withAmount) {
                                const checkbox = label.querySelector('input[type="checkbox"]');
                                const amountInput = label.querySelector('.amount-input');
                                checkbox.addEventListener('change', () => {
                                    amountInput.disabled = !checkbox.checked;
                                    if (!checkbox.checked) amountInput.value = '';
                                });
                            }
                        };

                        workersCheckboxGroup.innerHTML = '';
                        expenseWorkersCheckboxGroup.innerHTML = '';
                        expenseReceiversCheckboxGroup.innerHTML = '';
                        manualWorkersCheckboxGroup.innerHTML = '';
                        serviceWorkersCheckboxGroup.innerHTML = '';

                        workers.forEach(worker => {
                            createCheckbox(worker, workersCheckboxGroup, '', true);
                            createCheckbox(worker, expenseWorkersCheckboxGroup, 'expense', false);
                            createCheckbox(worker, expenseReceiversCheckboxGroup, 'expenseReceivers', false);
                            createCheckbox(worker, manualWorkersCheckboxGroup, 'manual', true);
                            createCheckbox(worker, serviceWorkersCheckboxGroup, 'service', true);
                            // Добавляем чекбоксы для "Выданные деньги" в .checkbox-group внутри .issued-money-group
                            createCheckbox(worker, objectForm.querySelector('.issued-money-group .checkbox-group') || document.createElement('div'), 'issued', false, true);
                            createCheckbox(worker, expenseForm.querySelector('.issued-money-group .checkbox-group') || document.createElement('div'), 'issued', false, true);
                            createCheckbox(worker, manualPriceForm.querySelector('.issued-money-group .checkbox-group') || document.createElement('div'), 'issued', false, true);
                            createCheckbox(worker, customServiceForm.querySelector('.issued-money-group .checkbox-group') || document.createElement('div'), 'issued', false, true);
                        });
                    }

                    function addObject(e, isExpense = false, isManual = false) {
                        e.preventDefault();
                        const formToUse = isExpense ? expenseForm : (isManual ? manualPriceForm : objectForm);
                        const isPaid = formToUse.querySelector('input[name="isPaid"]').checked;
                        // Собираем данные о выданных деньгах
                        const issuedMoney = Array.from(formToUse.querySelectorAll('.issued-money-group input[type="checkbox"]:checked')).map(checkbox => {
                            const workerName = checkbox.value;
                            const amountInput = formToUse.querySelector(`input[name="issuedamount_${workerName}"]`);
                            const amount = parseFloat(amountInput.value) || 0;
                            return amount > 0 ? { name: workerName, amount: amount.toFixed(2) } : null;
                        }).filter(item => item !== null);

                        let object;

                        if (isExpense) {
                            const expenseNameInput = formToUse.querySelector('input[name="expenseName"]');
                            const expenseName = expenseNameInput.disabled || expenseNameInput.style.display === 'none'
                            ? expenseTypeValue.value.trim()
                            : expenseNameInput.value.trim();
                            let expenseAmount;
                            const workers = Array.from(expenseWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);
                            const receivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);

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
                                    object = {
                                        name: expenseName,
                                        service: 'Расход',
                                        cost: expenseAmount.toFixed(2),
                          workers,
                          receivers,
                          timestamp: new Date().toLocaleString(),
                          isExpense: true,
                          isPaid: isPaid,
                          issuedMoney,
                          editHistory: []
                                    };
                                } else if (fuelMode === 'distance') {
                                    const distance = parseFloat(formToUse.querySelector('input[name="distance"]').value);
                                    if (isNaN(distance) || distance <= 0) {
                                        alert('Введите корректное расстояние!');
                                        return;
                                    }
                                    const liters = (distance * fuelConsumption) / 100;
                                    expenseAmount = -(liters * fuelPrice);
                                    object = {
                                        name: expenseName,
                                        service: 'Расход',
                                        cost: expenseAmount.toFixed(2),
                          workers,
                          receivers,
                          timestamp: new Date().toLocaleString(),
                          isExpense: true,
                          distance: distance.toFixed(2),
                          issuedMoney,
                          editHistory: []
                                    };
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
                                    object = {
                                        name: expenseName,
                                        service: 'Расход',
                                        cost: expenseAmount.toFixed(2),
                          workers,
                          receivers,
                          timestamp: new Date().toLocaleString(),
                          isExpense: true,
                          startMileage: startMileage.toFixed(2),
                          endMileage: endMileage.toFixed(2),
                          distance: distance.toFixed(2),
                          issuedMoney,
                          editHistory: []
                                    };
                                }
                            } else {
                                expenseAmount = parseFloat(formToUse.querySelector('input[name="expenseAmount"]').value);
                                if (isNaN(expenseAmount) || expenseAmount >= 0) {
                                    alert('Укажите корректную отрицательную сумму расхода!');
                                    return;
                                }
                                object = {
                                    name: expenseName,
                                    service: 'Расход',
                                    cost: expenseAmount.toFixed(2),
                          workers,
                          receivers,
                          timestamp: new Date().toLocaleString(),
                          isExpense: true,
                          isPaid: isPaid,
                          issuedMoney,
                          editHistory: []
                                };
                            }
                        } else {
                            const objectName = (isManual ? manualObjectNameInput : objectNameInput).value.trim();
                            const length = parseFloat(formToUse.querySelector('input[name="length"]').value) || 0;
                            const width = parseFloat(formToUse.querySelector('input[name="width"]').value) || 0;
                            const areaInput = parseFloat(formToUse.querySelector('input[name="area"]').value) || 0;
                            const selectedOption = isManual ? manualSelectedValue.value : selectedValue.value;
                            const workersData = Array.from((isManual ? manualWorkersCheckboxGroup : workersCheckboxGroup).querySelectorAll('input:checked')).map(input => {
                                const ktuInput = formToUse.querySelector(`input[name="${isManual ? 'manual' : ''}ktu_${input.value}"]`);
                                return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                            });

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
                                totalCost = (area * pricePerSquare).toFixed(2);

                                if (useRostikMethod) {
                                    const numWorkers = workersData.length;
                                    let baseAmountPerWorker = parseFloat(totalCost) / numWorkers;
                                    let initialWorkersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
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
                                            cost: (w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost).toFixed(2)
                                        }));
                                    } else {
                                        workersWithCost = initialWorkersWithCost.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            cost: w.cost.toFixed(2)
                                        }));
                                    }
                                } else {
                                    const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);
                                    const amountPerKtu = parseFloat(totalCost) / totalKtu;
                                    workersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
                                        cost: (amountPerKtu * w.ktu).toFixed(2)
                                    }));
                                }

                                object = {
                                    name: objectName,
                                    length: length > 0 ? length.toFixed(2) : null,
                          width: width > 0 ? width.toFixed(2) : null,
                          area: length > 0 && width > 0 ? `${length.toFixed(2)} x ${width.toFixed(2)} = ${area.toFixed(2)} м²` : `${area.toFixed(2)} м²`,
                          service: serviceName,
                          cost: totalCost,
                          workers: workersWithCost,
                          timestamp: new Date().toLocaleString(),
                          isExpense: false,
                          manualPrice: true,
                          isPaid: isPaid,
                          useRostikMethod: useRostikMethod,
                          issuedMoney,
                          editHistory: []
                                };
                            } else {
                                const [price, unit, serviceName] = selectedOption.split('|');
                                totalCost = (area * parseFloat(price)).toFixed(2);

                                if (useRostikMethod) {
                                    const numWorkers = workersData.length;
                                    let baseAmountPerWorker = parseFloat(totalCost) / numWorkers;
                                    let initialWorkersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
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
                                            cost: (w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost).toFixed(2)
                                        }));
                                    } else {
                                        workersWithCost = initialWorkersWithCost.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            cost: w.cost.toFixed(2)
                                        }));
                                    }
                                } else {
                                    const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);
                                    const amountPerKtu = parseFloat(totalCost) / totalKtu;
                                    workersWithCost = workersData.map(w => ({
                                        name: w.name,
                                        ktu: w.ktu,
                                        cost: (amountPerKtu * w.ktu).toFixed(2)
                                    }));
                                }

                                object = {
                                    name: objectName,
                                    length: length > 0 ? length.toFixed(2) : null,
                          width: width > 0 ? width.toFixed(2) : null,
                          area: length > 0 && width > 0 ? `${length.toFixed(2)} x ${width.toFixed(2)} = ${area.toFixed(2)} м²` : `${area.toFixed(2)} м²`,
                          service: serviceName,
                          cost: totalCost,
                          workers: workersWithCost,
                          timestamp: new Date().toLocaleString(),
                          isExpense: false,
                          isPaid: isPaid,
                          useRostikMethod: useRostikMethod,
                          issuedMoney,
                          editHistory: []
                                };
                            }
                        } // Добавлена закрывающая скобка для if (isExpense) { ... } else { ... }

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

                    function renderObjects() {
                        const filterText = filterInput.value.trim().toLowerCase();
                        resultsDiv.innerHTML = '';

                        let filteredObjects = !filterText ? [...window.objects] : window.objects.filter(obj => {
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
                                let costDetailsHtml = '';
                                if (obj.isExpense) {
                                    const writeOffPerWorker = parseFloat(obj.cost) / obj.workers.length;
                                    const accrualPerReceiver = obj.receivers.length > 0 ? Math.abs(parseFloat(obj.cost)) / obj.receivers.length : 0;

                                    const writeOffDetails = obj.workers.map(worker => {
                                        const workerName = typeof worker === 'string' ? worker : worker.name;
                                        return `${workerName}: ${writeOffPerWorker.toFixed(2)} ₽`;
                                    }).join(', ');

                                    const accrualDetails = obj.receivers.length > 0
                                    ? obj.receivers.map(receiver => `${receiver}: ${accrualPerReceiver.toFixed(2)} ₽`).join(', ')
                                    : '';

                                    costDetailsHtml = `
                                    <div class="info-line cost-per-worker"><span class="label">Списание:</span><span class="value write-off">${writeOffDetails}</span></div>
                                    ${accrualDetails ? `<div class="info-line cost-per-receiver"><span class="label">Начисление:</span><span class="value accrual">${accrualDetails}</span></div>` : ''}
                                    `;
                                } else {
                                    const costPerWorker = obj.workers.map(w => `${w.name}: ${w.cost} ₽ (КТУ ${w.ktu})`).join(', ');
                                    costDetailsHtml = `<div class="info-line cost-per-worker"><span class="label">Распределение:</span><span class="value">${costPerWorker}</span></div>`;
                                }

                                let issuedMoneyHtml = '';
                                if (obj.issuedMoney && obj.issuedMoney.length > 0) {
                                    const issuedMoneyDetails = obj.issuedMoney.map(im => `${im.name}: ${im.amount} ₽`).join(', ');
                                    issuedMoneyHtml = `<div class="info-line issued-money"><span class="label">Выданные деньги:</span><span class="value">${issuedMoneyDetails}</span></div>`;
                                }

                                let imageUrl = null;
                                if (obj.isExpense) {
                                    if (obj.name.toLowerCase() === 'бензин') {
                                        if (obj.receivers.length === 1 && obj.receivers.includes('Коля')) imageUrl = '/calc/img/nexia.png';
                                        else if (obj.receivers.length === 1 && obj.receivers.includes('Артём')) imageUrl = '/calc/img/ford.png';
                                        else imageUrl = '/calc/img/fuel.png';
                                    } else if (obj.name.toLowerCase() === 'съёмная квартира') {
                                        imageUrl = '/calc/img/house.png';
                                    } else if (obj.name.toLowerCase() === 'еда') {
                                        imageUrl = '/calc/img/eat.png';
                                    } else if (obj.name.toLowerCase() === 'займ') {
                                        imageUrl = '/calc/img/money.png';
                                    }
                                } else if (obj.isCustomService) {
                                    switch (obj.service) {
                                        case 'Электросварка перил и лестниц на кровле':
                                            imageUrl = '/calc/img/lestnica.png';
                                            break;
                                        case 'Погрузо-разгрузочные работы':
                                            imageUrl = '/calc/img/pogruzka.png';
                                            break;
                                        case 'Уборка территории':
                                            imageUrl = '/calc/img/cleaning.png';
                                            break;
                                    }
                                } else {
                                    const priceEntry = prices.find(p => p.name === obj.service);
                                    if (priceEntry && priceEntry.image) {
                                        imageUrl = priceEntry.image;
                                    }
                                }

                                console.log(`Object: ${obj.name}, Service: ${obj.service}, imageUrl: ${imageUrl}`);

                                let costFormula = `${obj.cost} ₽`;
                                if (obj.isExpense && obj.name.toLowerCase() === 'бензин' && obj.receivers.length > 0) {
                                    const fuelConsumption = 6.7;
                                    const fuelPrice = 61;
                                    if (obj.distance && !obj.startMileage) {
                                        const distance = parseFloat(obj.distance);
                                        const liters = (distance * fuelConsumption) / 100;
                                        costFormula = `${distance} км × ${fuelConsumption} л/100 км ÷ 100 × ${fuelPrice} ₽/л = ${liters.toFixed(2)} л × ${fuelPrice} ₽/л = ${obj.cost} ₽`;
                                    } else if (obj.startMileage && obj.endMileage) {
                                        const start = parseFloat(obj.startMileage);
                                        const end = parseFloat(obj.endMileage);
                                        const distance = parseFloat(obj.distance);
                                        const liters = (distance * fuelConsumption) / 100;
                                        costFormula = `(${end} км - ${start} км) × ${fuelConsumption} л/100 км ÷ 100 × ${fuelPrice} ₽/л = ${liters.toFixed(2)} л × ${fuelPrice} ₽/л = ${obj.cost} ₽`;
                                    }
                                }

                                const entry = document.createElement('div');
                                entry.className = `calculation ${obj.isExpense ? 'expense' : ''} ${obj.manualPrice ? 'manual-price' : ''} ${obj.isCustomService ? 'custom-service' : ''} ${editMode ? 'editable' : ''}`;
                                entry.dataset.timestamp = obj.timestamp; // Используем timestamp как уникальный идентификатор
                                const areaMatch = obj.area ? obj.area.match(/([\d.]+)\s*x\s*([\d.]+)\s*=\s*([\d.]+)\s*м²/) || obj.area.match(/([\d.]+)\s*м²/) : null;
                                const areaValue = areaMatch ? parseFloat(areaMatch[areaMatch.length === 4 ? 3 : 1]) : 0;
                                const pricePerSquare = obj.manualPrice && areaValue > 0 ? (parseFloat(obj.cost) / areaValue).toFixed(2) : null;

                                let editedTimestampHtml = '';
                                if (obj.editedTimestamp) {
                                    editedTimestampHtml = `Последнее редактирование: ${obj.editedTimestamp}`;
                                    if (obj.useRostikMethod) {
                                        editedTimestampHtml += ' <span style="color: #555;">(Ростиковская методика)</span>';
                                    }
                                }

                                entry.innerHTML = `
                                <div class="header-line">
                                <strong>•</strong>
                                <span class="timestamp">(${obj.timestamp})</span>
                                ${obj.editHistory.length > 0 ? `<button class="calendar-btn" data-timestamp="${obj.timestamp}">📅 <span class="edit-count">${obj.editHistory.length}</span></button>` : ''}
                                ${editMode ? `<span class="delete-cross" data-timestamp="${obj.timestamp}">✕</span>` : ''}
                                </div>
                                ${imageUrl ? `<div class="card-image" style="background-image: url('${imageUrl}');"></div>` : ''}
                                ${!obj.isExpense && !obj.isCustomService ? `<div class="info-line name"><span class="label">Название объекта:</span><span class="value">${obj.name}</span></div>` : ''}
                                ${obj.area ? `<div class="info-line area"><span class="label">Площадь:</span><span class="value">${obj.area}</span></div>` : ''}
                                <div class="info-line service"><span class="label">Услуга:</span><span class="value">${obj.isExpense ? obj.name : obj.service}</span></div>
                                <div class="info-line cost"><span class="label">Стоимость:</span><span class="value">${costFormula}</span></div>
                                ${obj.manualPrice && pricePerSquare ? `<div class="info-line price-per-square"><span class="label">Цена за м²:</span><span class="value">${pricePerSquare} ₽</span></div>` : ''}
                                ${obj.startMileage && obj.endMileage ? `
                                    <div class="info-line mileage"><span class="label">Километраж:</span><span class="value">${obj.startMileage} км → ${obj.endMileage} км = ${obj.distance} км</span></div>
                                    ` : ''}
                                    ${obj.distance && !obj.startMileage ? `
                                        <div class="info-line distance"><span class="label">Расстояние:</span><span class="value">${obj.distance} км</span></div>
                                        ` : ''}
                                        ${costDetailsHtml}
                                        ${issuedMoneyHtml}
                                        ${editedTimestampHtml ? `<div class="edit-history">${editedTimestampHtml}</div>` : ''}
                                        ${obj.useRostikMethod ? `<div class="edit-history"><span style="color: #555;">(Ростиковская методика)</span></div>` : ''}
                                        <button class="btn copy-btn" data-timestamp="${obj.timestamp}">Скопировать</button>
                                        <button class="btn paid-btn ${obj.isPaid ? 'paid' : ''}" data-timestamp="${obj.timestamp}">${obj.isPaid ? 'Выплачено' : 'Не выплачено'}</button>
                                        `;
                                        if (editMode) {
                                            entry.addEventListener('click', (e) => {
                                                if (!e.target.classList.contains('delete-cross') && !e.target.classList.contains('calendar-btn') && !e.target.classList.contains('copy-btn') && !e.target.classList.contains('paid-btn')) {
                                                    const objIndex = window.objects.findIndex(o => o.timestamp === obj.timestamp);
                                                    editObject(objIndex);
                                                }
                                            });
                                        }
                                        resultsDiv.appendChild(entry);
                            });

                            bindCopyButtons();
                            bindPaidButtons();
                            bindDeleteCrosses();
                            bindCalendarButtons();
                        }
                    }

                    function bindCopyButtons() {
                        document.querySelectorAll('.copy-btn').forEach(btn => {
                            btn.removeEventListener('click', handleCopy);
                            btn.addEventListener('click', handleCopy);
                        });
                    }

                    function handleCopy(e) {
                        e.stopPropagation();
                        const timestamp = e.target.getAttribute('data-timestamp'); // Используем data-timestamp вместо data-index
                        const card = resultsDiv.querySelector(`.calculation[data-timestamp="${timestamp}"]`); // Обновляем селектор

                        if (!card) {
                            console.error(`Карточка с timestamp ${timestamp} не найдена`);
                            return;
                        }

                        const textToCopy = Array.from(card.querySelectorAll('.info-line, .header-line'))
                        .map(line => {
                            const label = line.querySelector('.label')?.textContent || '';
                            const value = line.querySelector('.value')?.textContent || '';
                            const timestamp = line.querySelector('.timestamp')?.textContent || '';
                            return label ? `${label} ${value}` : timestamp;
                        })
                        .filter(Boolean)
                        .join('\n')
                        .trim();

                        if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(textToCopy)
                            .then(() => {
                                console.log('Текст успешно скопирован в буфер обмена');
                            })
                            .catch(err => {
                                console.error('Ошибка при копировании: ', err);
                                fallbackCopy(textToCopy);
                            });
                        } else {
                            fallbackCopy(textToCopy);
                        }
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

                    function bindPaidButtons() {
                        document.querySelectorAll('.paid-btn').forEach(btn => {
                            btn.removeEventListener('click', handlePaidToggle);
                            btn.addEventListener('click', handlePaidToggle);
                        });
                    }

                    function handlePaidToggle(e) {
                        e.stopPropagation();
                        const timestamp = e.target.getAttribute('data-timestamp');
                        const index = window.objects.findIndex(obj => obj.timestamp === timestamp);
                        if (index === -1) {
                            console.error(`Объект с timestamp "${timestamp}" не найден`);
                            return;
                        }
                        const obj = window.objects[index];
                        obj.isPaid = !obj.isPaid;
                        e.target.textContent = obj.isPaid ? 'Выплачено' : 'Не выплачено';
                        e.target.classList.toggle('paid', obj.isPaid);
                        renderWorkerStats();
                    }

                    function bindDeleteCrosses() {
                        document.querySelectorAll('.delete-cross').forEach(cross => {
                            cross.removeEventListener('click', handleDelete);
                            cross.addEventListener('click', handleDelete);
                        });
                    }

                    function handleDelete(e) {
                        e.stopPropagation(); // Предотвращаем всплытие события к карточке
                        const timestamp = e.target.getAttribute('data-timestamp');
                        const index = window.objects.findIndex(obj => obj.timestamp === timestamp);
                        if (index === -1) {
                            console.error(`Объект с timestamp "${timestamp}" не найден`);
                            return;
                        }
                        if (confirm(`Удалить "${window.objects[index].isExpense ? 'расход' : 'объект'} "${window.objects[index].name}"?`)) {
                            window.objects.splice(index, 1);
                            renderObjects();
                            renderWorkerStats();
                            populateSuggestions(objectForm);
                        }
                    }

                    function bindCalendarButtons() {
                        document.querySelectorAll('.calendar-btn').forEach(btn => {
                            btn.removeEventListener('click', showHistory);
                            btn.addEventListener('click', showHistory);
                        });
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
                            ? (parseFloat(tempObj.cost) / tempObj.workers.length).toFixed(2)
                            : tempObj.workers.map(w => `${w.name}: ${w.cost} ₽ (КТУ ${w.ktu})`).join(', ');
                        const costPerReceiver = tempObj.isExpense && tempObj.receivers.length > 0
                            ? (Math.abs(parseFloat(tempObj.cost)) / tempObj.receivers.length).toFixed(2)
                            : '0.00';

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
                        <div class="info-line workers"><span class="label">${tempObj.isExpense ? 'Участники (списание)' : 'Участники'}:</span><span class="value">${tempObj.isExpense ? tempObj.workers.join(', ') : tempObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}</span></div>
                        ${tempObj.isExpense && tempObj.receivers.length > 0 ? `<div class="info-line receivers"><span class="label">Участники (начисление):</span><span class="value">${tempObj.receivers.join(', ')}</span></div>` : ''}
                        <div class="info-line cost-per-worker"><span class="label">${tempObj.isExpense ? 'На одного (списание)' : 'Распределение'}:</span><span class="value">${costPerWorker}</span></div>
                        ${tempObj.isExpense && tempObj.receivers.length > 0 ? `<div class="info-line cost-per-receiver"><span class="label">На одного (начисление):</span><span class="value">${costPerReceiver} ₽</span></div>` : ''}
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

                        // Добавляем прокрутку к форме
                        const y = formToUse.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({ top: y - 15, behavior: 'smooth' });

                        const submitBtn = formToUse.querySelector('button[type="submit"]');
                        const cancelBtn = formToUse.querySelector('.cancel-btn');

                        submitBtn.textContent = 'Изменить ' + (isExpense ? 'расход' : (isCustomService ? 'услугу' : 'объект'));
                        cancelBtn.style.display = 'inline-block';
                        formToUse.dataset.isEditing = 'true';
                        formToUse.dataset.editIndex = index;

                        formToUse.querySelector('input[name="isPaid"]').checked = obj.isPaid || false;

                        // Заполняем поле "Выданные деньги"
                        workers.forEach(worker => {
                            const checkbox = formToUse.querySelector(`.issued-money-group input[value="${worker}"]`);
                            const amountInput = formToUse.querySelector(`input[name="issuedamount_${worker}"]`);
                            if (checkbox && amountInput) {
                                const issued = obj.issuedMoney && obj.issuedMoney.find(im => im.name === worker);
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
                                const checkbox = expenseWorkersCheckboxGroup.querySelector(`input[value="${worker}"]`);
                                if (checkbox) checkbox.checked = obj.workers.includes(worker);
                                const receiverCheckbox = expenseReceiversCheckboxGroup.querySelector(`input[value="${worker}"]`);
                                if (receiverCheckbox) receiverCheckbox.checked = obj.receivers.includes(worker);
                            });
                                if (obj.name.toLowerCase() === 'бензин' && obj.receivers.length === 1 && obj.receivers[0] === 'Артём') {
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
                                const checkbox = serviceWorkersCheckboxGroup.querySelector(`input[value="${worker}"]`);
                                if (checkbox) {
                                    checkbox.checked = obj.workers.some(w => w.name === worker);
                                    const ktuInput = checkbox.parentElement.querySelector(`input[name="servicektu_${worker}"]`);
                                    if (ktuInput) {
                                        ktuInput.value = obj.workers.find(w => w.name === worker)?.ktu || 1;
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

                            const areaMatch = obj.area.match(/([\d.]+)\s*x\s*([\d.]+)\s*=\s*([\d.]+)\s*м²/) || obj.area.match(/([\d.]+)\s*м²/);
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
                                const area = parseFloat(areaMatch[areaMatch.length === 4 ? 3 : 1]);
                                const pricePerSquare = parseFloat(obj.cost) / area;
                                manualPriceForm.querySelector('input[name="pricePerSquare"]').value = pricePerSquare.toFixed(2);
                            } else {
                                const area = parseFloat(areaMatch[areaMatch.length === 4 ? 3 : 1]);
                                const pricePerSquare = parseFloat(obj.cost) / area;
                                selectedValue.value = `${pricePerSquare}|м²|${obj.service}`;
                                selectDisplay.innerHTML = `${obj.service} — от ${pricePerSquare} ₽/м² <span class="dropdown-icon">▾</span>`;
                            }

                            workers.forEach(worker => {
                                const checkbox = (obj.manualPrice ? manualWorkersCheckboxGroup : workersCheckboxGroup).querySelector(`input[value="${worker}"]`);
                                if (checkbox) {
                                    checkbox.checked = obj.workers.some(w => w.name === worker);
                                    const ktuInput = checkbox.parentElement.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}ktu_${worker}"]`);
                                    if (ktuInput) {
                                        ktuInput.value = obj.workers.find(w => w.name === worker)?.ktu || 1;
                                        ktuInput.disabled = !checkbox.checked;
                                    }
                                }
                            });

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

                            // Собираем новые данные о выданных деньгах
                            const newIssuedMoney = Array.from(formToUse.querySelectorAll('.issued-money-group input[type="checkbox"]:checked')).map(checkbox => {
                                const workerName = checkbox.value;
                                const amountInput = formToUse.querySelector(`input[name="issuedamount_${workerName}"]`);
                                const amount = parseFloat(amountInput.value) || 0;
                                return amount > 0 ? { name: workerName, amount: amount.toFixed(2) } : null;
                            }).filter(item => item !== null);

                            // Проверяем изменения в "Выданные деньги"
                            const oldIssuedMoneyStr = oldObj.issuedMoney ? oldObj.issuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                            const newIssuedMoneyStr = newIssuedMoney.length > 0 ? newIssuedMoney.map(im => `${im.name}: ${im.amount}`).join(', ') : 'Нет';
                            if (oldIssuedMoneyStr !== newIssuedMoneyStr) {
                                changes.push(`Выданные деньги: "${oldIssuedMoneyStr}" → "${newIssuedMoneyStr}"`);
                            }

                            if (isExpense) {
                                const newName = expenseNameInput.disabled ? expenseTypeValue.value : expenseNameInput.value.trim();
                                let newAmount;
                                const newWorkers = Array.from(expenseWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);
                                const newReceivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);

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
                                oldObj.cost = newAmount.toFixed(2);
                                oldObj.workers = newWorkers;
                                oldObj.receivers = newReceivers;
                                oldObj.isPaid = newIsPaid;
                                oldObj.issuedMoney = newIssuedMoney;
                            } else if (isCustomService) {
                                const newName = serviceNameInput.disabled ? serviceSelect.value : serviceNameInput.value.trim();
                                const newCost = parseFloat(customServiceForm.querySelector('input[name="servicePrice"]').value);
                                const newWorkers = Array.from(serviceWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => {
                                    const ktuInput = customServiceForm.querySelector(`input[name="servicektu_${input.value}"]`);
                                    return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                                });

                                if (!newName || isNaN(newCost) || newCost <= 0 || newWorkers.length === 0 || newWorkers.some(w => w.ktu <= 0)) {
                                    alert('Заполните все поля корректно!');
                                    return;
                                }

                                const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                const workersWithCost = newWorkers.map(w => ({ name: w.name, ktu: w.ktu, cost: (newCost * w.ktu / totalKtu).toFixed(2) }));

                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newCost !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${newCost}`);
                                if (JSON.stringify(newWorkers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${newWorkers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);

                                oldObj.name = newName;
                                oldObj.service = newName;
                                oldObj.cost = newCost.toFixed(2);
                                oldObj.workers = workersWithCost;
                                oldObj.isPaid = newIsPaid;
                                oldObj.issuedMoney = newIssuedMoney;
                            } else {
                                const newName = (obj.manualPrice ? manualObjectNameInput : objectNameInput).value.trim();
                                const length = parseFloat(formToUse.querySelector('input[name="length"]').value) || 0;
                                const width = parseFloat(formToUse.querySelector('input[name="width"]').value) || 0;
                                const areaInput = parseFloat(formToUse.querySelector('input[name="area"]').value) || 0;
                                const newWorkers = Array.from((obj.manualPrice ? manualWorkersCheckboxGroup : workersCheckboxGroup).querySelectorAll('input:checked')).map(input => {
                                    const ktuInput = formToUse.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}ktu_${input.value}"]`);
                                    return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                                });

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

                                if (obj.manualPrice) {
                                    const pricePerSquare = parseFloat(formToUse.querySelector('input[name="pricePerSquare"]').value);
                                    if (isNaN(pricePerSquare) || pricePerSquare <= 0) {
                                        alert('Укажите корректную цену за м²!');
                                        return;
                                    }
                                    newCost = (newArea * pricePerSquare).toFixed(2);

                                    if (newUseRostikMethod) {
                                        const numWorkers = newWorkers.length;
                                        let baseAmountPerWorker = parseFloat(newCost) / numWorkers;
                                        let initialWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
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
                                                cost: (w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost).toFixed(2)
                                            }));
                                        } else {
                                            newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                cost: w.cost.toFixed(2)
                                            }));
                                        }
                                    } else {
                                        const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                        const amountPerKtu = parseFloat(newCost) / totalKtu;
                                        newWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            cost: (amountPerKtu * w.ktu).toFixed(2)
                                        }));
                                    }
                                } else {
                                    const [price, unit, serviceName] = selectedValue.value.split('|');
                                    newCost = (newArea * parseFloat(price)).toFixed(2);

                                    if (newUseRostikMethod) {
                                        const numWorkers = newWorkers.length;
                                        let baseAmountPerWorker = parseFloat(newCost) / numWorkers;
                                        let initialWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
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
                                                cost: (w.ktu === 1 ? w.cost + additionalPerKtu1Worker : w.cost).toFixed(2)
                                            }));
                                        } else {
                                            newWorkersWithCost = initialWorkersWithCost.map(w => ({
                                                name: w.name,
                                                ktu: w.ktu,
                                                cost: w.cost.toFixed(2)
                                            }));
                                        }
                                    } else {
                                        const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                        const amountPerKtu = parseFloat(newCost) / totalKtu;
                                        newWorkersWithCost = newWorkers.map(w => ({
                                            name: w.name,
                                            ktu: w.ktu,
                                            cost: (amountPerKtu * w.ktu).toFixed(2)
                                        }));
                                    }
                                }

                                const newAreaString = length > 0 && width > 0 ? `${length.toFixed(2)} x ${width.toFixed(2)} = ${newArea.toFixed(2)} м²` : `${newArea.toFixed(2)} м²`;

                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newAreaString !== oldObj.area) changes.push(`Площадь: "${oldObj.area}" → "${newAreaString}"`);
                                if (obj.manualPrice) {
                                    const newPricePerSquare = (parseFloat(newCost) / newArea).toFixed(2);
                                    const oldPricePerSquare = (parseFloat(oldObj.cost) / parseFloat(oldObj.area.match(/([\d.]+)\s*м²/)[1])).toFixed(2);
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
                                oldObj.length = length > 0 ? length.toFixed(2) : null;
                                oldObj.width = width > 0 ? width.toFixed(2) : null;
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
                                oldObj.editedTimestamp = new Date().toLocaleString();
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

                    // Отрисовка статистики работников
                    function renderWorkerStats() {
                        const statsGrid = document.getElementById('worker-stats');
                        if (!statsGrid) return;
                        statsGrid.innerHTML = '';

                        const getWorkerName = (w) => typeof w === 'string' ? w : (w && w.name ? w.name : '');

                        workers.forEach(worker => {
                            const workerObjects = window.objects.filter(obj =>
                            (!obj.isExpense || (obj.isExpense && !obj.isPaid)) &&
                            ((obj.workers && obj.workers.some(w => getWorkerName(w) === worker)) ||
                            (obj.receivers && obj.receivers.includes(worker)) ||
                            (obj.issuedMoney && obj.issuedMoney.some(im => im.name === worker)))
                            );

                            if (workerObjects.length === 0) return;

                            const regularObjects = workerObjects.filter(obj => !obj.isExpense && !obj.manualPrice && !obj.isCustomService).length;
                            const manualObjects = workerObjects.filter(obj => obj.manualPrice).length;
                            const services = workerObjects.filter(obj => obj.isCustomService).length;
                            const expenses = workerObjects.filter(obj => obj.isExpense).length;

                            const incomeObjects = workerObjects.filter(obj => !obj.isExpense);
                            const expenseObjects = workerObjects.filter(obj => obj.isExpense);

                            const incomeBreakdown = incomeObjects.map((obj) => {
                                const workerData = obj.workers.find(w => getWorkerName(w) === worker);
                                const contribution = workerData ? parseFloat(workerData.cost) : 0;
                                const className = obj.isCustomService ? 'service-earning' : 'regular-earning';
                                return { value: contribution.toFixed(2), timestamp: obj.timestamp, className, isPaid: obj.isPaid };
                            });
                            const paidIncome = incomeBreakdown.filter(e => e.isPaid);
                            const pendingIncome = incomeBreakdown.filter(e => !e.isPaid);
                            const totalPaidIncome = paidIncome.reduce((sum, val) => sum + parseFloat(val.value), 0);
                            const totalPendingIncome = pendingIncome.reduce((sum, val) => sum + parseFloat(val.value), 0);

                            const issuedMoneyBreakdown = workerObjects
                            .filter(obj => !obj.isPaid && obj.issuedMoney && obj.issuedMoney.some(im => im.name === worker))
                            .map((obj) => {
                                const issued = obj.issuedMoney.find(im => im.name === worker);
                                return issued ? { value: (-parseFloat(issued.amount)).toFixed(2), timestamp: obj.timestamp, className: 'issued-money-negative' } : null;
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

                                if (obj.workers.some(w => getWorkerName(w) === worker)) {
                                    if (obj.receivers.length > 0) {
                                        obj.receivers.forEach(receiver => {
                                            if (receiver !== worker) {
                                                if (!expenseBreakdownByReceiver[receiver]) expenseBreakdownByReceiver[receiver] = [];
                                                const isLoan = obj.name.toLowerCase() === 'займ';
                                                const safeReceiversCount = Array.isArray(obj.receivers) && obj.receivers.length > 0 ? obj.receivers.length : 1;
                                                const debtValue = (isLoan
                                                ? (-Math.abs(writeOffPerWorker) / safeReceiversCount)
                                                : (writeOffPerWorker / safeReceiversCount)).toFixed(2);

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
                                        const debtValue = writeOffPerWorker.toFixed(2);
                                        expenseBreakdownByReceiver[anonymousReceiver].push({
                                            value: debtValue,
                                            timestamp: obj.timestamp,
                                            className: 'expense-earning'
                                        });
                                    }
                                }

                                if (obj.receivers.includes(worker)) {
                                    if (obj.workers.length > 0) {
                                        obj.workers.forEach(debtor => {
                                            const debtorName = getWorkerName(debtor);
                                            if (debtorName !== worker) {
                                                if (!debtsOwedToWorker[debtorName]) debtsOwedToWorker[debtorName] = [];
                                                const isLoan = obj.name.toLowerCase() === 'займ';
                                                const safeReceiversCount = Array.isArray(obj.receivers) && obj.receivers.length > 0 ? obj.receivers.length : 1;
                                                const creditValue = (isLoan
                                                ? (Math.abs(writeOffPerWorker) / safeReceiversCount)
                                                : (Math.abs(writeOffPerWorker) / safeReceiversCount)).toFixed(2);
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
                                        const creditValue = accrualPerReceiver.toFixed(2);
                                        debtsOwedToWorker[anonymousDebtor].push({
                                            value: creditValue,
                                            timestamp: obj.timestamp,
                                            className: 'receiver-earning'
                                        });
                                    }
                                }
                            });

                            const allDebts = {};
                            Object.entries(debtsOwedToWorker).forEach(([debtor, debts]) => {
                                if (!allDebts[debtor]) allDebts[debtor] = [];
                                allDebts[debtor].push(...debts.map(debt => ({ ...debt, value: parseFloat(debt.value) })));
                            });

                            Object.entries(expenseBreakdownByReceiver).forEach(([receiver, debts]) => {
                                if (!allDebts[receiver]) allDebts[receiver] = [];
                                allDebts[receiver].push(...debts.map(debt => ({ ...debt, value: parseFloat(debt.value) })));
                            });

                            Object.keys(allDebts).forEach(person => {
                                allDebts[person].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                            });

                            const debtBalances = {};
                            Object.entries(allDebts).forEach(([person, debts]) => {
                                debtBalances[person] = debts.reduce((sum, debt) => sum + debt.value, 0).toFixed(2);
                            });

                            const totalDebtsOwedToWorker = Object.values(debtBalances)
                            .filter(balance => parseFloat(balance) > 0)
                            .reduce((sum, balance) => sum + parseFloat(balance), 0);
                            const totalExpenses = Object.values(debtBalances)
                            .filter(balance => parseFloat(balance) < 0)
                            .reduce((sum, balance) => sum + parseFloat(balance), 0);

                            const totalPendingWithIssued = totalPendingIncome + totalIssuedMoney;
                            const totalEarnings = totalPaidIncome + totalPendingWithIssued + totalDebtsOwedToWorker + totalExpenses;

                            const formatEarnings = (amount) => amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.00', '');

                            let earningsHtml = '';
                            if (totalPaidIncome !== 0) {
                                const paidIncomeHtml = paidIncome.length > 0
                                ? paidIncome.map(e => `<span class="earnings-item ${e.className}" data-timestamp="${e.timestamp}">+${e.value}</span>`).join(' ')
                                : '0 ₽';
                                earningsHtml += `<div class="earnings paid-earnings"><strong>Заработано:</strong> ${paidIncomeHtml} = ${formatEarnings(totalPaidIncome)} ₽</div>`;
                            }
                            if (totalPendingIncome !== 0 || totalIssuedMoney !== 0) {
                                const pendingIncomeHtml = pendingIncome.length > 0
                                ? pendingIncome.map(e => `<span class="earnings-item ${e.className}" data-timestamp="${e.timestamp}">+${e.value}</span>`).join(' ')
                                : '0 ₽';
                                const issuedMoneyHtml = issuedMoneyBreakdown.length > 0
                                ? issuedMoneyBreakdown.map(e => `<span class="earnings-item ${e.className}" data-timestamp="${e.timestamp}">${e.value}</span>`).join(' ')
                                : '';
                                earningsHtml += `<div class="earnings pending-earnings"><strong>В ожидании:</strong> ${pendingIncomeHtml}${issuedMoneyHtml ? ` ${issuedMoneyHtml}` : ''} = ${formatEarnings(totalPendingWithIssued)} ₽</div>`;
                            }

                            let debtHtml = '';
                            const positiveDebts = [];
                            const negativeDebts = [];

                            Object.entries(debtBalances).forEach(([person, balance]) => {
                                const debtItems = allDebts[person].map(debt => {
                                    const sign = debt.value > 0 ? '+' : '';
                                    return `<span class="earnings-item ${debt.className}" data-timestamp="${debt.timestamp}">${sign}${debt.value.toFixed(2)}</span>`;
                                }).join(' ');

                                const totalBalance = parseFloat(balance);
                                const formattedTotal = totalBalance >= 0 ? `+${formatEarnings(totalBalance)}` : formatEarnings(totalBalance);

                                if (totalBalance > 0) {
                                    positiveDebts.push(`<div class="positive-debt">${person}: ${debtItems} = ${formattedTotal} ₽</div>`);
                                } else if (totalBalance < 0) {
                                    negativeDebts.push(`<div class="negative-debt">${person}: ${debtItems} = ${formattedTotal} ₽</div>`);
                                }
                            });

                            if (positiveDebts.length > 0) {
                                debtHtml += '<div class="earnings receiver-earnings"><strong>Долги мне:</strong>';
                                debtHtml += positiveDebts.join('');
                                debtHtml += '</div>';
                            }

                            if (negativeDebts.length > 0) {
                                debtHtml += '<div class="earnings expense-earnings"><strong>Долги другим:</strong>';
                                debtHtml += negativeDebts.join('');
                                debtHtml += '</div>';
                            }

                            // Новый блок: Расчёт в ожидании с долгами
                            let pendingWithDebtsHtml = '';
                            if (Object.keys(debtBalances).length > 0) {
                                const pendingWithDebtsItems = [];
                                const pendingClassName = totalPendingWithIssued >= 0 ? 'pending-earning' : 'issued-money-negative';
                                let pendingTimestamp = '';
                                if (issuedMoneyBreakdown.length > 0) {
                                    pendingTimestamp = issuedMoneyBreakdown[0].timestamp;
                                } else if (pendingIncome.length > 0) {
                                    pendingTimestamp = pendingIncome[0].timestamp;
                                }
                                pendingWithDebtsItems.push(`<span class="earnings-item issued-money-negative">${formatEarnings(totalPendingWithIssued)}</span>`);

                                Object.entries(debtBalances).forEach(([person, balance]) => {
                                    const totalBalance = parseFloat(balance);
                                    const formattedBalance = totalBalance >= 0 ? `+${formatEarnings(totalBalance)}` : formatEarnings(totalBalance);
                                    const className = totalBalance >= 0 ? 'receiver-earning' : 'expense-earning';
                                    const timestamp = allDebts[person] && allDebts[person].length > 0 ? allDebts[person][0].timestamp : '';
                                    pendingWithDebtsItems.push(`<span class="earnings-item ${className}" ${timestamp ? `data-timestamp="${timestamp}"` : ''}>${formattedBalance}</span>`);
                                });

                                const pendingWithDebtsTotal = totalPendingWithIssued + Object.values(debtBalances)
                                .reduce((sum, balance) => sum + parseFloat(balance), 0);

                                pendingWithDebtsHtml = `<div class="earnings pending-with-debts"><strong>Расчёт в ожидании с долгами:</strong> ${pendingWithDebtsItems.join(' ')} = ${formatEarnings(pendingWithDebtsTotal)} ₽</div>`;
                            }

                            earningsHtml += debtHtml + pendingWithDebtsHtml;

                            const card = document.createElement('div');
                            card.className = 'worker-card';
                            card.innerHTML = `
                            <div class="worker-name">${worker}</div>
                            ${earningsHtml}
                            <div class="earnings total-earnings"><strong>Итого:</strong> ${formatEarnings(totalEarnings)} ₽</div>
                            <ul class="stats-list">
                            <li data-filter="regular">Обычные объекты: <span>${regularObjects}</span></li>
                            <li data-filter="manual">Ручная цена: <span>${manualObjects}</span></li>
                            <li data-filter="services">Услуги: <span>${services}</span></li>
                            <li data-filter="expenses">Расходы: <span>${expenses}</span></li>
                            </ul>
                            <div class="worker-chart" data-earnings="${totalEarnings}" data-worker="${worker}"></div>
                            `;

                            card.addEventListener('click', (e) => {
                                const isChart = e.target.closest('.worker-chart');
                                const isEarningItem = e.target.classList.contains('earnings-item');
                                const isStatsLi = e.target.closest('.stats-list li');
                                if (!isChart && !isEarningItem && !isStatsLi) filterByWorker(worker);
                            });

                                card.querySelectorAll('.stats-list li').forEach(li => {
                                    li.style.cursor = 'pointer';
                                    li.addEventListener('click', (e) => {
                                        e.stopPropagation();
                                        const filterType = li.dataset.filter;
                                        let filterValue = `${worker} `;
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
                    }

                    function scrollToObject(timestamp, scrollPosition = null) {
                        console.log(`Scrolling to timestamp: ${timestamp}`);

                        if (scrollPosition === null) {
                            scrollPosition = window.scrollY || document.documentElement.scrollTop;
                        }

                        const targetCard = document.querySelector(`.calculation[data-timestamp="${timestamp}"]`);
                        if (targetCard) {
                            console.log('Card found, adding highlight');
                            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetCard.classList.add('highlight');

                            addBackButton(scrollPosition);

                            setTimeout(() => {
                                console.log('Removing highlight');
                                targetCard.classList.remove('highlight');
                            }, 3000);
                        } else {
                            console.warn(`Card with timestamp "${timestamp}" not found.`);
                        }
                    }

                    function addBackButton(scrollPosition) {
                        const existingBackBtn = document.getElementById('back-to-stats-btn');
                        if (existingBackBtn) existingBackBtn.remove();

                        const backBtn = document.createElement('button');
                        backBtn.id = 'back-to-stats-btn';
                        backBtn.className = 'back-to-stats-btn floating-btn';
                        backBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-[2]">
                        <path d="M6 9L12 15L18 9" stroke="white" stroke-width="2" stroke-linecap="square"/>
                        </svg>
                        `;

                        backBtn.style.position = 'fixed';
                        backBtn.style.bottom = '70px'; // Над троеточием (20px + 40px кнопка + 10px отступ)
                        backBtn.style.right = '22px'; // Совпадает с floating-btn-container
                        backBtn.style.zIndex = '1002'; // Выше floatingMenuBtn (z-index: 1001)
                        backBtn.style.width = '36px'; // Чуть меньше, чем 40px
                        backBtn.style.height = '36px';
                        backBtn.style.backgroundColor = '#34495e'; // Как у троеточия
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
                            console.log(`Back button clicked, returning to scrollPosition: ${scrollPosition}`);
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

                        // Scroll listener to remove button when close to original scroll position
                        const checkScrollPosition = debounce(() => {
                            const currentScroll = window.scrollY || document.documentElement.scrollTop;
                            const isNearScrollPosition = typeof scrollPosition === 'number' && Math.abs(currentScroll - scrollPosition) < 300;

                            if (isNearScrollPosition) {
                                console.log('Near original scroll position, removing back button', { currentScroll, scrollPosition });
                                backBtn.remove();
                                window.removeEventListener('scroll', checkScrollPosition);
                            }
                        }, 100);

                        window.addEventListener('scroll', checkScrollPosition);

                        document.body.appendChild(backBtn);
                    }

                    // Debounce function to limit scroll event frequency
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

                            const canvas = document.createElement('canvas');
                            chartDiv.innerHTML = '';
                            chartDiv.appendChild(canvas);

                            new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: ['Обычные', 'Ручная', 'Услуги', 'Расходы', 'КТУ < 1'],
                                    datasets: [{
                                        label: 'Участие',
                                        data: [regularObjects, manualObjects, services, expenses, lowKtuCount],
                                        backgroundColor: [
                                            'rgba(52, 152, 219, 0.8)',
                                      'rgba(46, 204, 113, 0.8)',
                                      'rgba(149, 165, 166, 0.8)',
                                      'rgba(231, 76, 60, 0.8)',
                                      'rgba(52, 152, 219, 0.8)'
                                        ],
                                        borderColor: [
                                            '#3498db',
                                            '#2ecc71',
                                            '#95a5a6',
                                            '#e74c3c',
                                            '#3498db'
                                        ],
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    scales: { y: { beginAtZero: true, display: false }, x: { display: false } },
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const labels = ['Обычные объекты', 'Ручная цена', 'Услуги', 'Расходы', 'КТУ ниже нормы'];
                                                    const value = context.raw || 0;
                                                    return `${labels[context.dataIndex]}: ${value}`;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    }

                    function renderObjectDetails(obj) {
                        const costPerWorker = obj.isExpense
                        ? (parseFloat(obj.cost) / obj.workers.length).toFixed(2)
                        : obj.workers.map(w => `${w.name}: ${w.cost} ₽ (КТУ ${w.ktu})`).join(', ');
                        const costPerReceiver = obj.isExpense && obj.receivers.length > 0
                        ? (Math.abs(parseFloat(obj.cost)) / obj.receivers.length).toFixed(2)
                        : '0.00';

                        return `
                        ${obj.area ? `<div class="info-line"><span class="label">Площадь:</span><span class="value">${obj.area}</span></div>` : ''}
                        <div class="info-line"><span class="label">Услуга:</span><span class="value">${obj.service}</span></div>
                        <div class="info-line"><span class="label">Стоимость:</span><span class="value">${obj.cost} ₽</span></div>
                        <div class="info-line"><span class="label">${obj.isExpense ? 'Участники (списание)' : 'Участники'}:</span><span class="value">${obj.isExpense ? obj.workers.join(', ') : obj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}</span></div>
                        ${obj.isExpense && obj.receivers.length > 0 ? `<div class="info-line"><span class="label">Участники (начисление):</span><span class="value">${obj.receivers.join(', ')}</span></div>` : ''}
                        <div class="info-line"><span class="label">${obj.isExpense ? 'На одного (списание)' : 'Распределение'}:</span><span class="value">${costPerWorker}</span></div>
                        ${obj.isExpense && obj.receivers.length > 0 ? `<div class="info-line"><span class="label">На одного (начисление):</span><span class="value">${costPerReceiver} ₽</span></div>` : ''}
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
                                areaInput.value = (length * width).toFixed(2);
                                areaInput.disabled = true;
                            } else {
                                areaInput.value = '';
                                areaInput.disabled = false;
                            }
                        }

                        areaInput.addEventListener('input', () => {
                            if (areaInput.value && parseFloat(areaInput.value) > 0) {
                                lengthInput.disabled = true;
                                widthInput.disabled = true;
                                lengthInput.value = '';
                                widthInput.value = '';
                            } else {
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
                                floatingEditBtn.classList.remove('show');
                                floatingStatsBtn.classList.remove('show');
                                floatingRefreshBtn.classList.remove('show');
                                subButtons.forEach(btn => {
                                    document.getElementById(btn.id).classList.remove('show');
                                });
                            });
                        });
                        // Удаляем существующие плавающие кнопки, если они есть
                        const existingButtons = document.querySelectorAll('.floating-btn-container, .floating-btn, .sub-btn');
                        existingButtons.forEach(btn => btn.remove());

                        // Создаем контейнер для кнопок
                        const buttonContainer = document.createElement('div');
                        buttonContainer.id = 'floating-btn-container';
                        buttonContainer.className = 'floating-btn-container';

                        // Создаем кнопку меню (троеточие)
                        const floatingMenuBtn = document.createElement('button');
                        floatingMenuBtn.id = 'floating-menu-btn';
                        floatingMenuBtn.className = 'floating-btn menu-btn';
                        floatingMenuBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="5" r="2" fill="white"/>
                        <circle cx="12" cy="12" r="2" fill="white"/>
                        <circle cx="12" cy="19" r="2" fill="white"/>
                        </svg>
                        `;

                        // Создаем кнопку добавления (плюс)
                        const floatingAddBtn = document.createElement('button');
                        floatingAddBtn.id = 'floating-add-btn';
                        floatingAddBtn.className = 'floating-btn action-btn';
                        floatingAddBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        `;
                        floatingAddBtn.title = "Добавить объект";

                        // Создаем контейнер для подкнопок внутри кнопки добавления
                        const subButtonsContainer = document.createElement('div');
                        subButtonsContainer.id = 'sub-buttons-container';
                        subButtonsContainer.className = 'sub-buttons-container';

                        const subButtons = [
                            { id: 'sub-point', color: '#3498db', formId: 'add-point-form', title: 'Добавить объект' },
                            { id: 'add-line', color: '#e74c3c', formId: 'add-line-form', title: 'Добавить расход' },
                            { id: 'add-polygon', color: '#27ae60', formId: 'add-polygon-form', title: 'Добавить объект с ручной ценой' },
                            { id: 'add-collection', color: '#808E8F', formId: 'add-collection-form', title: 'Добавить услугу' }
                        ];

                        subButtons.forEach(btn => {
                            const subBtn = document.createElement('button');
                            subBtn.id = btn.id;
                            subBtn.className = 'floating-btn sub-btn';
                            subBtn.style.backgroundColor = btn.color;
                            subBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            `;
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
                                    console.log(`Scrolling to form: ${btn.formId}`);
                                    const y = targetForm.getBoundingClientRect().top + window.scrollY;
                                    window.scrollTo({ top: y - 15, behavior: 'smooth' });
                                } else {
                                    console.warn(`Form for ${btn.formId} not found or targetForm is null`);
                                }

                                // Скрываем все кнопки и субкнопки
                                floatingAddBtn.classList.remove('show');
                                floatingExportBtn.classList.remove('show');
                                floatingEditBtn.classList.remove('show');
                                floatingStatsBtn.classList.remove('show');
                                floatingRefreshBtn.classList.remove('show');
                                subButtons.forEach(sub => {
                                    document.getElementById(sub.id).classList.remove('show');
                                });
                            });

                            subButtonsContainer.appendChild(subBtn);
                        });

                        // Создаем кнопку экспорта (дискета)
                        const floatingExportBtn = document.createElement('button');
                        floatingExportBtn.id = 'floating-export-btn';
                        floatingExportBtn.className = 'floating-btn action-btn';
                        floatingExportBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7.41421C19 6.88378 18.7893 6.37507 18.4142 6L16 3.58579C15.6249 3.21071 15.1162 3 14.5858 3H7C5.89543 3 5 3.89543 5 5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 21V15C17 13.8954 16.1046 13 15 13H9C7.89543 13 7 13.8954 7 15V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 8H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        `;
                        floatingExportBtn.title = "Экспорт в JSON";

                        // Создаем кнопку редактирования (карандаш)
                        const floatingEditBtn = document.createElement('button');
                        floatingEditBtn.id = 'floating-edit-btn';
                        floatingEditBtn.className = 'floating-btn action-btn';
                        floatingEditBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        `;
                        floatingEditBtn.title = "Режим редактирования";

                        // Создаем кнопку статистики работников (человечек)
                        const floatingStatsBtn = document.createElement('button');
                        floatingStatsBtn.id = 'floating-stats-btn';
                        floatingStatsBtn.className = 'floating-btn action-btn';
                        floatingStatsBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="6" r="4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 10V18C12 20 10 22 8 22H16C18 22 20 20 20 18V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        `;
                        floatingStatsBtn.title = "Статистика работников";

                        // Создаем кнопку обновления страницы (стрелки вращения)
                        const floatingRefreshBtn = document.createElement('button');
                        floatingRefreshBtn.id = 'floating-refresh-btn';
                        floatingRefreshBtn.className = 'floating-btn action-btn';
                        floatingRefreshBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.07 10.88C3.62 6.44 7.41 3 12 3C14.28 3 16.4 3.85 18.01 5.25V4
                        C18.01 3.45 18.46 3 19.01 3C19.56 3 20.01 3.45 20.01 4V8C20.01 8.55 19.56 9 19.01 9H15
                        C14.45 9 14 8.55 14 8C14 7.45 14.45 7 15 7H16.96C15.68 5.76 13.91 5 12 5
                        C8.43 5 5.48 7.67 5.05 11.12C4.99 11.67 4.49 12.06 3.94 11.99
                        C3.39 11.92 3 11.42 3.07 10.88ZM20.06 12.01C20.61 12.08 21 12.58 20.93 13.12
                        C20.38 17.56 16.59 21 12 21C9.72 21 7.61 20.15 6 18.76V20
                        C6 20.55 5.55 21 5 21C4.45 21 4 20.55 4 20V16
                        C4 15.45 4.45 15 5 15H9
                        C9.55 15 10 15.45 10 16
                        C10 16.55 9.55 17 9 17H7.04
                        C8.32 18.24 10.09 19 12 19
                        C15.57 19 18.52 16.33 18.95 12.88
                        C19.01 12.33 19.51 11.94 20.06 12.01Z"
                        fill="white"/>
                        </svg>
                        `;

                        floatingRefreshBtn.title = "Обновить страницу";

                        // Добавляем стили через CSS
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

                        .floating-btn {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            border: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                            transition: all 0.3s ease;
                            position: relative;
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

                        .action-btn {
                            transform: scale(0);
                            opacity: 0;
                            transition: all 0.3s ease;
                        }

                        .action-btn.show {
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
                        `;
                        document.head.appendChild(style);

                        // Добавляем обработчики событий
                        floatingMenuBtn.addEventListener('click', () => {
                            floatingAddBtn.classList.toggle('show');
                            floatingExportBtn.classList.toggle('show');
                            floatingEditBtn.classList.toggle('show');
                            floatingStatsBtn.classList.toggle('show');
                            floatingRefreshBtn.classList.toggle('show');
                            // Скрываем подкнопки при нажатии на меню
                            subButtons.forEach(btn => {
                                document.getElementById(btn.id).classList.remove('show');
                            });
                        });

                        floatingAddBtn.addEventListener('click', () => {
                            subButtons.forEach(btn => {
                                document.getElementById(btn.id).classList.toggle('show');
                            });
                        });

                        floatingExportBtn.addEventListener('click', () => {
                            const json = JSON.stringify(window.objects, null, 2);
                            const blob = new Blob([json], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'save.json';
                            a.click();
                            URL.revokeObjectURL(url);

                            // Скрываем все кнопки и субкнопки
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                        });

                        floatingEditBtn.addEventListener('click', () => {
                            // Переключаем режим редактирования напрямую
                            editMode = !editMode;

                            // Обновляем внешний вид кнопки
                            floatingEditBtn.classList.toggle('active', editMode);

                            // Перерисовываем объекты с учетом нового режима
                            renderObjects();

                            // Скрываем все кнопки и субкнопки
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
                            floatingEditBtn.classList.remove('show');
                            floatingStatsBtn.classList.remove('show');
                            floatingRefreshBtn.classList.remove('show');
                            subButtons.forEach(sub => {
                                document.getElementById(sub.id).classList.remove('show');
                            });
                        });

                        floatingStatsBtn.addEventListener('click', () => {
                            const statsSection = document.getElementById('worker-stats');
                            if (statsSection) {
                                const y = statsSection.getBoundingClientRect().top + window.scrollY;
                                window.scrollTo({ top: y - 15, behavior: 'smooth' });
                            } else {
                                console.warn('Element with id "worker-stats" not found');
                            }

                            // Скрываем все кнопки и субкнопки
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
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
                                console.warn('Error in loadData:', e);
                            }
                            location.reload();

                            // Скрываем все кнопки и субкнопки
                            floatingAddBtn.classList.remove('show');
                            floatingExportBtn.classList.remove('show');
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

                        // Добавляем подкнопки в кнопку добавления
                        floatingAddBtn.appendChild(subButtonsContainer);

                        // Добавляем кнопки в контейнер
                        buttonContainer.appendChild(floatingMenuBtn);
                        buttonContainer.appendChild(floatingAddBtn);
                        buttonContainer.appendChild(floatingExportBtn);
                        buttonContainer.appendChild(floatingEditBtn);
                        buttonContainer.appendChild(floatingStatsBtn);
                        buttonContainer.appendChild(floatingRefreshBtn);

                        // Добавляем контейнер на страницу
                        document.body.appendChild(buttonContainer);

                        return { buttonContainer, floatingMenuBtn, floatingAddBtn, floatingExportBtn, floatingEditBtn, floatingStatsBtn, floatingRefreshBtn };
                    }

                    window.addEventListener('DOMContentLoaded', () => {
                        createFloatingButtons();
                    });
});
