// calc/script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const customServiceForm = document.getElementById('custom-service-form');
    const showCustomServiceFormBtn = document.getElementById('show-custom-service-form');
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
    const showObjectFormBtn = document.getElementById('show-object-form');
    const showExpenseFormBtn = document.getElementById('show-expense-form');
    const showManualPriceFormBtn = document.getElementById('show-manual-price-form');
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
    const exportBtn = document.getElementById('export');
    const clearCacheBtn = document.getElementById('clear-cache');
    const toggleEditModeBtn = document.getElementById('toggle-edit-mode');
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

                    function toggleServiceOptions() {
                        optionsList.classList.toggle('show');
                    }

                    optionsList.querySelectorAll('li').forEach(li => {
                        li.removeEventListener('click', selectServiceOption);
                        li.addEventListener('click', selectServiceOption);
                    });

                    function selectServiceOption(e) {
                        const selectedValueText = e.target.getAttribute('data-value');
                        selectDisplay.innerHTML = `${e.target.textContent} <span class="dropdown-icon">▾</span>`;
                        selectedValue.value = selectedValueText;
                        optionsList.classList.remove('show');
                    }
                }

                if (f === manualPriceForm) {
                    manualSelectDisplay.removeEventListener('click', toggleManualServiceOptions);
                    manualSelectDisplay.addEventListener('click', toggleManualServiceOptions);

                    function toggleManualServiceOptions() {
                        manualOptionsList.classList.toggle('show');
                    }

                    manualOptionsList.querySelectorAll('li').forEach(li => {
                        li.removeEventListener('click', selectManualServiceOption);
                        li.addEventListener('click', selectManualServiceOption);
                    });

                    function selectManualServiceOption(e) {
                        const selectedValueText = e.target.getAttribute('data-value');
                        const [name, unit] = selectedValueText.split('|');
                        manualSelectDisplay.innerHTML = `${name} (${unit}) <span class="dropdown-icon">▾</span>`;
                        manualSelectedValue.value = selectedValueText;
                        manualPriceLabel.textContent = `Цена за ${unit} (₽):`;
                        manualOptionsList.classList.remove('show');
                    }
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

                Promise.all([
                    fetch('../upload/save.json', fetchOptions).then(res => res.ok ? res.json() : []).catch(() => []),
                            fetch('../workers.json', fetchOptions).then(res => res.ok ? res.json() : []).catch(() => ['Артём', 'Коля', 'Слава', 'Женя']),
                            fetch('../prices.json', fetchOptions).then(res => res.ok ? res.json() : []).catch(() => []),
                            fetch('../custom-services.json', fetchOptions).then(res => res.ok ? res.json() : []).catch(() => []),
                            fetch('../expense-types.json', fetchOptions).then(res => res.ok ? res.json() : []).catch(() => [])
                ]).then(([objectsData, workersData, pricesData, customServicesData, expenseTypesData]) => {
                    window.objects = objectsData; // Присваиваем данные глобальной переменной
                    workers = workersData;
                    prices = pricesData;
                    customServices = customServicesData;
                    expenseTypes = expenseTypesData;

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
                });
        }

        clearCacheBtn.addEventListener('click', () => {
            loadData();
            alert('Данные обновлены из JSON-файлов.');
        });

        showObjectFormBtn.addEventListener('click', () => showForm(objectForm));
        showExpenseFormBtn.addEventListener('click', () => showForm(expenseForm));
        showManualPriceFormBtn.addEventListener('click', () => showForm(manualPriceForm));
        showCustomServiceFormBtn.addEventListener('click', () => showForm(customServiceForm));

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
            const workersData = Array.from(serviceWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => {
                const ktuInput = customServiceForm.querySelector(`input[name="servicektu_${input.value}"]`);
                return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
            });

            if (!serviceName || isNaN(servicePrice) || servicePrice <= 0 || workersData.length === 0 || workersData.some(w => w.ktu <= 0)) {
                alert('Заполните все поля корректно!');
                return;
            }

            const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);
            const object = {
                name: serviceName,
                service: serviceName,
                cost: servicePrice.toFixed(2),
                                           workers: workersData.map(w => ({ name: w.name, ktu: w.ktu, cost: (servicePrice * w.ktu / totalKtu).toFixed(2) })),
                                           timestamp: new Date().toLocaleString(),
                                           isExpense: false,
                                           isCustomService: true,
                                           isPaid: isPaid,
                                           editHistory: isEditing ? window.objects[customServiceForm.dataset.editIndex]?.editHistory || [] : []
            };

            if (isEditing) {
                const index = parseInt(customServiceForm.dataset.editIndex);
                const oldObj = window.objects[index];
                const changes = [];
                if (serviceName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${serviceName}"`);
                if (servicePrice !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${servicePrice}`);
                if (JSON.stringify(object.workers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${object.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
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
                        const createCheckbox = (name, group, prefix, withKtu = false) => {
                            const label = document.createElement('label');
                            label.innerHTML = `
                            <input type="checkbox" name="${prefix}workers" value="${name}">
                            ${name}
                            ${withKtu ? `<input type="number" class="ktu-input" name="${prefix}ktu_${name}" step="0.1" min="0" placeholder="КТУ" disabled>` : ''}
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
                        });
                    }

                    function addObject(e, isExpense = false, isManual = false) {
                        e.preventDefault();
                        const formToUse = isExpense ? expenseForm : (isManual ? manualPriceForm : objectForm);
                        const isPaid = formToUse.querySelector('input[name="isPaid"]').checked;
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
                            const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);

                            if (isManual) {
                                const pricePerSquare = parseFloat(manualPriceForm.querySelector('input[name="pricePerSquare"]').value);
                                if (isNaN(pricePerSquare) || pricePerSquare <= 0) {
                                    alert('Укажите корректную цену за м²!');
                                    return;
                                }
                                const [serviceName, unit] = selectedOption.split('|');
                                totalCost = (area * pricePerSquare).toFixed(2);
                                object = {
                                    name: objectName,
                                    length: length > 0 ? length.toFixed(2) : null,
                          width: width > 0 ? width.toFixed(2) : null,
                          area: length > 0 && width > 0 ? `${length.toFixed(2)} x ${width.toFixed(2)} = ${area.toFixed(2)} м²` : `${area.toFixed(2)} м²`,
                          service: serviceName,
                          cost: totalCost,
                          workers: workersData.map(w => ({ name: w.name, ktu: w.ktu, cost: (parseFloat(totalCost) * w.ktu / totalKtu).toFixed(2) })),
                          timestamp: new Date().toLocaleString(),
                          isExpense: false,
                          manualPrice: true,
                          isPaid: isPaid,
                          editHistory: []
                                };
                            } else {
                                const [price, unit, serviceName] = selectedOption.split('|');
                                totalCost = (area * parseFloat(price)).toFixed(2);
                                object = {
                                    name: objectName,
                                    length: length > 0 ? length.toFixed(2) : null,
                          width: width > 0 ? width.toFixed(2) : null,
                          area: length > 0 && width > 0 ? `${length.toFixed(2)} x ${width.toFixed(2)} = ${area.toFixed(2)} м²` : `${area.toFixed(2)} м²`,
                          service: serviceName,
                          cost: totalCost,
                          workers: workersData.map(w => ({ name: w.name, ktu: w.ktu, cost: (parseFloat(totalCost) * w.ktu / totalKtu).toFixed(2) })),
                          timestamp: new Date().toLocaleString(),
                          isExpense: false,
                          isPaid: isPaid,
                          editHistory: []
                                };
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

                    exportBtn.addEventListener('click', () => {
                        const json = JSON.stringify(window.objects, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'save.json';
                        a.click();
                        URL.revokeObjectURL(url);
                    });

                    clearCacheBtn.addEventListener('click', () => {
                        caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
                        loadData();
                    });

                    toggleEditModeBtn.addEventListener('click', () => {
                        editMode = !editMode;
                        toggleEditModeBtn.textContent = `Режим редактирования: ${editMode ? 'вкл' : 'выкл'}`;
                        toggleEditModeBtn.classList.toggle('active', editMode);
                        renderObjects();
                    });

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
                            (obj.receivers && obj.receivers.some(r => r.toLowerCase() === workerMatch));

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
                                const areaMatch = obj.area ? obj.area.match(/([\d.]+)\s*x\s*([\d.]+)\s*=\s*([\d.]+)\s*м²/) || obj.area.match(/([\d.]+)\s*м²/) : null;
                                const areaValue = areaMatch ? parseFloat(areaMatch[areaMatch.length === 4 ? 3 : 1]) : 0;
                                const pricePerSquare = obj.manualPrice ? (parseFloat(obj.cost) / areaValue).toFixed(2) : null;

                                entry.innerHTML = `
                                <div class="header-line">
                                <strong>•</strong>
                                <span class="timestamp">(${obj.timestamp})</span>
                                ${obj.editHistory.length > 0 ? `<button class="calendar-btn" data-index="${index}">📅 <span class="edit-count">${obj.editHistory.length}</span></button>` : ''}
                                ${editMode ? `<span class="delete-cross" data-index="${index}">✕</span>` : ''}
                                </div>
                                ${imageUrl ? `<div class="card-image" style="background-image: url('${imageUrl}');"></div>` : ''}
                                ${!obj.isExpense && !obj.isCustomService ? `<div class="info-line name"><span class="label">Название объекта:</span><span class="value">${obj.name}</span></div>` : ''}
                                ${obj.area ? `<div class="info-line area"><span class="label">Площадь:</span><span class="value">${obj.area}</span></div>` : ''}
                                <div class="info-line service"><span class="label">Услуга:</span><span class="value">${obj.isExpense ? obj.name : obj.service}</span></div>
                                <div class="info-line cost"><span class="label">Стоимость:</span><span class="value">${costFormula}</span></div>
                                ${obj.manualPrice ? `<div class="info-line price-per-square"><span class="label">Цена за м²:</span><span class="value">${pricePerSquare} ₽</span></div>` : ''}
                                ${obj.startMileage && obj.endMileage ? `
                                    <div class="info-line mileage"><span class="label">Километраж:</span><span class="value">${obj.startMileage} км → ${obj.endMileage} км = ${obj.distance} км</span></div>
                                    ` : ''}
                                    ${obj.distance && !obj.startMileage ? `
                                        <div class="info-line distance"><span class="label">Расстояние:</span><span class="value">${obj.distance} км</span></div>
                                        ` : ''}
                                        ${costDetailsHtml}
                                        ${obj.editedTimestamp ? `<div class="edit-history">Последнее редактирование: ${obj.editedTimestamp}</div>` : ''}
                                        <button class="btn copy-btn" data-index="${index}">Скопировать</button>
                                        <button class="btn paid-btn ${obj.isPaid ? 'paid' : ''}" data-index="${index}">${obj.isPaid ? 'Выплачено' : 'Не выплачено'}</button>
                                        `;
                                        entry.dataset.index = index;
                                        if (editMode) {
                                            entry.addEventListener('click', (e) => {
                                                if (!e.target.classList.contains('delete-cross') && !e.target.classList.contains('calendar-btn') && !e.target.classList.contains('copy-btn') && !e.target.classList.contains('paid-btn')) editObject(index);
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
                        const index = parseInt(e.target.getAttribute('data-index'));
                        const card = resultsDiv.querySelector(`.calculation[data-index="${index}"]`);

                        if (!card) {
                            console.error(`Карточка с индексом ${index} не найдена`);
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
                            .then(() => {})
                            .catch(err => {
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
                        const index = parseInt(e.target.getAttribute('data-index'));
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
                        const index = parseInt(e.target.getAttribute('data-index'));
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
                        const index = parseInt(e.target.getAttribute('data-index'));
                        const obj = window.objects[index];
                        historyList.innerHTML = '';

                        const originalEntry = document.createElement('div');
                        originalEntry.className = 'history-entry';
                        originalEntry.innerHTML = `
                        <strong>Исходная версия</strong> (${obj.timestamp})<br>
                        ${renderObjectDetails(getOriginalObject(obj))}
                        `;
                        originalEntry.addEventListener('click', () => {
                            renderTemporaryObject(index, null);
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
                                renderTemporaryObject(index, hIndex);
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

                    function renderTemporaryObject(index, hIndex) {
                        const obj = window.objects[index];
                        const tempObj = hIndex === null ? obj : getObjectAtHistory(obj, hIndex);
                        const entry = resultsDiv.querySelector(`[data-index="${index}"]`);
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
                        ${tempObj.editHistory.length > 0 ? `<button class="calendar-btn" data-index="${index}">📅 <span class="edit-count">${tempObj.editHistory.length}</span></button>` : ''}
                        ${editMode ? `<span class="delete-cross" data-index="${index}">✕</span>` : ''}
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
                        const submitBtn = formToUse.querySelector('button[type="submit"]');
                        const cancelBtn = formToUse.querySelector('.cancel-btn');

                        submitBtn.textContent = 'Изменить ' + (isExpense ? 'расход' : (isCustomService ? 'услугу' : 'объект'));
                        cancelBtn.style.display = 'inline-block';
                        formToUse.dataset.isEditing = 'true';
                        formToUse.dataset.editIndex = index;

                        formToUse.querySelector('input[name="isPaid"]').checked = obj.isPaid || false;

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

                                oldObj.name = newName;
                                oldObj.cost = newAmount.toFixed(2);
                                oldObj.workers = newWorkers;
                                oldObj.receivers = newReceivers;
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);
                                oldObj.isPaid = newIsPaid;
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
                                const newWorkersWithCost = newWorkers.map(w => ({ ...w, cost: (newCost * w.ktu / totalKtu).toFixed(2) }));

                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newCost !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${newCost}`);
                                if (JSON.stringify(newWorkersWithCost) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${newWorkersWithCost.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);

                                oldObj.name = newName;
                                oldObj.service = newName;
                                oldObj.cost = newCost.toFixed(2);
                                oldObj.workers = newWorkersWithCost;
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);
                                oldObj.isPaid = newIsPaid;
                            } else {
                                const newName = (obj.manualPrice ? manualObjectNameInput : objectNameInput).value.trim();
                                const selectedOption = obj.manualPrice ? manualSelectedValue.value : selectedValue.value;
                                if (!selectedOption) {
                                    alert('Выберите услугу!');
                                    return;
                                }

                                const length = parseFloat(formToUse.querySelector('input[name="length"]').value) || 0;
                                const width = parseFloat(formToUse.querySelector('input[name="width"]').value) || 0;
                                const areaInput = parseFloat(formToUse.querySelector('input[name="area"]').value) || 0;

                                let newArea;
                                if (areaInput > 0) {
                                    newArea = areaInput;
                                } else if (length > 0 && width > 0) {
                                    newArea = length * width;
                                } else {
                                    alert('Укажите площадь напрямую или оба значения: длину и ширину!');
                                    return;
                                }

                                const [priceOrService, unit, serviceName] = selectedOption.split('|');
                                const newService = obj.manualPrice ? priceOrService : serviceName;
                                const pricePerSquare = obj.manualPrice ? parseFloat(manualPriceForm.querySelector('input[name="pricePerSquare"]').value) : parseFloat(priceOrService);
                                const newWorkers = Array.from((obj.manualPrice ? manualWorkersCheckboxGroup : workersCheckboxGroup).querySelectorAll('input:checked')).map(input => {
                                    const ktuInput = formToUse.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}ktu_${input.value}"]`);
                                    return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                                });
                                const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                const newCost = (newArea * pricePerSquare).toFixed(2);

                                if (!newName || isNaN(newArea) || newArea <= 0 || isNaN(pricePerSquare) || pricePerSquare <= 0 || newWorkers.length === 0 || newWorkers.some(w => w.ktu <= 0)) {
                                    alert('Заполните все поля корректно!');
                                    return;
                                }

                                const newWorkersWithCost = newWorkers.map(w => ({ ...w, cost: (parseFloat(newCost) * w.ktu / totalKtu).toFixed(2) }));
                                const newAreaStr = length > 0 && width > 0 ? `${length.toFixed(2)} x ${width.toFixed(2)} = ${newArea.toFixed(2)} м²` : `${newArea.toFixed(2)} м²`;

                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newAreaStr !== oldObj.area) changes.push(`Площадь: ${oldObj.area} → ${newAreaStr}`);
                                if (newService !== oldObj.service) changes.push(`Услуга: "${oldObj.service}" → "${newService}"`);
                                if (newCost !== oldObj.cost) changes.push(`Стоимость: ${oldObj.cost} → ${newCost}`);
                                if (JSON.stringify(newWorkersWithCost) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${newWorkersWithCost.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);

                                oldObj.name = newName;
                                oldObj.length = length > 0 ? length.toFixed(2) : null;
                                oldObj.width = width > 0 ? width.toFixed(2) : null;
                                oldObj.area = newAreaStr;
                                oldObj.service = newService;
                                oldObj.cost = newCost;
                                oldObj.workers = newWorkersWithCost;
                                if (newIsPaid !== oldObj.isPaid) changes.push(`Статус выплаты: "${oldObj.isPaid ? 'Выплачено' : 'Не выплачено'}" → "${newIsPaid ? 'Выплачено' : 'Не выплачено'}"`);
                                oldObj.isPaid = newIsPaid;
                            }

                            if (changes.length > 0) {
                                oldObj.editedTimestamp = new Date().toLocaleString();
                                oldObj.editHistory.push({ timestamp: oldObj.editedTimestamp, changes: changes.join(', ') });
                            }

                            customServiceNames = [...new Set(window.objects.filter(obj => obj.isCustomService).map(obj => obj.name))];
                            renderObjects();
                            renderWorkerStats();
                            formToUse.reset();
                            resetFormFields(formToUse);
                            formToUse.dataset.isEditing = 'false';
                            formToUse.dataset.editIndex = '';
                            submitBtn.textContent = isExpense ? 'Добавить расход' : (isCustomService ? 'Добавить услугу' : 'Добавить объект');
                            cancelBtn.style.display = 'none';
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
                            (obj.receivers && obj.receivers.includes(worker)))
                            );

                            if (workerObjects.length === 0) return;

                            const regularObjects = workerObjects.filter(obj => !obj.isExpense && !obj.manualPrice && !obj.isCustomService).length;
                            const manualObjects = workerObjects.filter(obj => obj.manualPrice).length;
                            const services = workerObjects.filter(obj => obj.isCustomService).length;
                            const expenses = workerObjects.filter(obj => obj.isExpense).length;

                            const incomeObjects = workerObjects.filter(obj => !obj.isExpense);
                            const expenseObjects = workerObjects.filter(obj => obj.isExpense);

                            const incomeBreakdown = incomeObjects.map((obj, index) => {
                                const workerData = obj.workers.find(w => getWorkerName(w) === worker);
                                const contribution = workerData ? parseFloat(workerData.cost) : 0;
                                const className = obj.isCustomService ? 'service-earning' : 'regular-earning';
                                return { value: contribution.toFixed(2), index, className, isPaid: obj.isPaid };
                            });
                            const paidIncome = incomeBreakdown.filter(e => e.isPaid);
                            const pendingIncome = incomeBreakdown.filter(e => !e.isPaid);
                            const totalPaidIncome = paidIncome.reduce((sum, val) => sum + parseFloat(val.value), 0);
                            const totalPendingIncome = pendingIncome.reduce((sum, val) => sum + parseFloat(val.value), 0);

                            const expenseBreakdownByReceiver = {};
                            const debtsOwedToWorker = {};

                            expenseObjects.forEach((obj, index) => {
                                const totalCost = parseFloat(obj.cost);
                                const workersCount = obj.workers.length;
                                const writeOffPerWorker = totalCost / workersCount;

                                if (obj.workers.some(w => getWorkerName(w) === worker)) {
                                    obj.receivers.forEach(receiver => {
                                        if (receiver !== worker) {
                                            if (!expenseBreakdownByReceiver[receiver]) expenseBreakdownByReceiver[receiver] = [];
                                            expenseBreakdownByReceiver[receiver].push({
                                                value: writeOffPerWorker.toFixed(2),
                                                                                      index,
                                                                                      className: 'expense-earning'
                                            });
                                        }
                                    });
                                }

                                if (obj.receivers.includes(worker)) {
                                    obj.workers.forEach(debtor => {
                                        const debtorName = getWorkerName(debtor);
                                        if (debtorName !== worker) {
                                            if (!debtsOwedToWorker[debtorName]) debtsOwedToWorker[debtorName] = [];
                                            debtsOwedToWorker[debtorName].push({
                                                value: Math.abs(writeOffPerWorker).toFixed(2),
                                                                               index,
                                                                               className: 'receiver-earning'
                                            });
                                        }
                                    });
                                }
                            });

                            const totalExpenses = Object.values(expenseBreakdownByReceiver).flat().reduce((sum, val) => sum + parseFloat(val.value), 0);
                            const totalDebtsOwedToWorker = Object.values(debtsOwedToWorker).flat().reduce((sum, val) => sum + parseFloat(val.value), 0);

                            const totalEarnings = totalPaidIncome + totalPendingIncome + totalDebtsOwedToWorker + totalExpenses;

                            const formatEarnings = (amount) => amount.toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                            .replace('.00', '');

                            let earningsHtml = '';
                            if (totalPaidIncome !== 0) {
                                const paidIncomeHtml = paidIncome.length > 0
                                ? paidIncome.map(e => `<span class="earnings-item ${e.className}" data-index="${e.index}">+${e.value}</span>`).join(' ')
                                : '0 ₽';
                                earningsHtml += `<div class="earnings paid-earnings"><strong>Заработано:</strong> ${paidIncomeHtml} = ${formatEarnings(totalPaidIncome)} ₽</div>`;
                            }
                            if (totalPendingIncome !== 0) {
                                const pendingIncomeHtml = pendingIncome.length > 0
                                ? pendingIncome.map(e => `<span class="earnings-item ${e.className}" data-index="${e.index}">+${e.value}</span>`).join(' ')
                                : '0 ₽';
                                earningsHtml += `<div class="earnings pending-earnings"><strong>В ожидании:</strong> ${pendingIncomeHtml} = ${formatEarnings(totalPendingIncome)} ₽</div>`;
                            }
                            if (Object.keys(debtsOwedToWorker).length > 0) {
                                earningsHtml += '<div class="earnings receiver-earnings"><strong>Долги мне:</strong>';
                                Object.entries(debtsOwedToWorker).forEach(([debtor, debts]) => {
                                    const debtItems = debts.map(debt => `<span class="earnings-item ${debt.className}" data-index="${debt.index}">+${debt.value}</span>`).join(' + ');
                                    const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.value), 0);
                                    earningsHtml += `<div>${debtor} → ${worker}: ${debtItems} = ${formatEarnings(totalDebt)} ₽</div>`;
                                });
                                earningsHtml += '</div>';
                            }
                            if (Object.keys(expenseBreakdownByReceiver).length > 0) {
                                earningsHtml += '<div class="earnings expense-earnings"><strong>Долги другим:</strong>';
                                Object.entries(expenseBreakdownByReceiver).forEach(([receiver, debts]) => {
                                    const debtItems = debts.map(debt => `<span class="earnings-item ${debt.className}" data-index="${debt.index}">${debt.value}</span>`).join(' + ');
                                    const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.value), 0);
                                    earningsHtml += `<div>${worker} → ${receiver}: ${debtItems} = ${formatEarnings(totalDebt)} ₽</div>`;
                                });
                                earningsHtml += '</div>';
                            }

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
                                        const index = parseInt(item.dataset.index);
                                        filterInput.value = '';
                                        renderObjects();
                                        setTimeout(() => {
                                            const card = resultsDiv.querySelector(`.calculation[data-index="${index}"]`);
                                            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }, 100);
                                    });
                                });

                                statsGrid.appendChild(card);
                        });

                        renderWorkerCharts();
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
});
