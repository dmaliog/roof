document.addEventListener('DOMContentLoaded', () => {
    const customServiceForm = document.getElementById('custom-service-form');
    const showCustomServiceFormBtn = document.getElementById('show-custom-service-form');
    const serviceWorkersCheckboxGroup = document.getElementById('service-workers-checkbox-group');
    const serviceNameInput = customServiceForm.querySelector('input[name="serviceName"]');
    const serviceNameSuggestions = document.getElementById('service-name-suggestions');
    const serviceSelect = customServiceForm.querySelector('#service-select-custom');
    const serviceOptions = customServiceForm.querySelector('#service-options-custom');
    let customServiceNames = [];
    let customServices = [];

    const expenseTypeSelect = document.getElementById('expense-type-select');
    const expenseTypeValue = document.getElementById('expense-type-value');
    const expenseTypeOptions = document.getElementById('expense-type-options');
    let expenseTypes = [];

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
    let objects = [];
    let workers = [];
    let editMode = false;
    let prices = [];

    expenseNameSuggestions.id = 'expense-name-suggestions';
    expenseNameSuggestions.className = 'suggestions-list';
    if (!expenseNameInput.nextElementSibling) expenseNameInput.parentElement.appendChild(expenseNameSuggestions);

    objectForm.querySelector('button[type="submit"]').textContent = 'Добавить объект';
    expenseForm.querySelector('button[type="submit"]').textContent = 'Добавить расход';
    manualPriceForm.querySelector('button[type="submit"]').textContent = 'Добавить объект';
    customServiceForm.querySelector('button[type="submit"]').textContent = 'Добавить услугу';

    function showForm(formToShow) {
        [objectForm, expenseForm, manualPriceForm, customServiceForm].forEach(f => {
            const cancelBtn = f.querySelector('.cancel-btn');
            const submitBtn = f.querySelector('button[type="submit"]');
            if (f === formToShow) {
                f.style.display = 'block';
                cancelBtn.onclick = () => {
                    f.reset();
                    f.dataset.isEditing = 'false';
                    f.dataset.editIndex = '';
                    submitBtn.textContent = f === expenseForm ? 'Добавить расход' :
                    (f === customServiceForm ? 'Добавить услугу' : 'Добавить объект');
                    if (f === expenseForm) {
                        expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                        expenseTypeValue.value = '';
                        toggleInputState(f, 'expenseName', expenseTypeValue);
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
            } else {
                f.style.display = 'none';
            }
        });
        if (formToShow) populateSuggestions(formToShow);
    }

    function toggleInputState(form, inputName, selectElement) {
        const input = form.querySelector(`input[name="${inputName}"]`);
        const selectedValue = selectElement.value || (selectElement.tagName === 'DIV' ? selectElement.textContent.trim().split(' ')[0] : '');

        if (selectedValue && selectedValue !== "Своё название" && selectedValue !== "Выберите") {
            input.disabled = true;
            input.value = '';
        } else {
            input.disabled = false;
        }
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
    }

    expenseTypeSelect.addEventListener('click', () => expenseTypeOptions.classList.toggle('show'));
    serviceSelect.addEventListener('click', () => serviceOptions.classList.toggle('show'));

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
                    if (!value.startsWith('-') || value === '-') expenseAmountInput.value = '-' + value.replace('-', '');
                    else if (parseFloat(value) >= 0 && value !== '-') expenseAmountInput.value = '-' + Math.abs(parseFloat(value)).toString();
                });

                    Promise.all([
                        fetch('../save.json').then(res => res.ok ? res.json() : []).catch(() => []),
                                fetch('../workers.json').then(res => res.ok ? res.json() : []).catch(() => ['Артём', 'Коля', 'Слава', 'Женя']),
                                fetch('../prices.json').then(res => res.ok ? res.json() : []).catch(() => []),
                                fetch('../custom-services.json').then(res => res.ok ? res.json() : []).catch(() => []),
                                fetch('../expense-types.json').then(res => res.ok ? res.json() : []).catch(() => [])
                    ]).then(([objectsData, workersData, pricesData, customServicesData, expenseTypesData]) => {
                        objects = objectsData;
                        workers = workersData;
                        prices = pricesData;
                        customServices = customServicesData;
                        expenseTypes = expenseTypesData;

                        expenseTypes.unshift({ name: "Своё название" });
                        customServices.unshift({ name: "Своё название" });

                        customServiceNames = [...new Set(objects.filter(obj => obj.isCustomService).map(obj => obj.name))];
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

        showObjectFormBtn.addEventListener('click', () => showForm(objectForm));
        showExpenseFormBtn.addEventListener('click', () => showForm(expenseForm));
        showManualPriceFormBtn.addEventListener('click', () => showForm(manualPriceForm));
        showCustomServiceFormBtn.addEventListener('click', () => showForm(customServiceForm));

        loadData();

        customServiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isEditing = customServiceForm.dataset.isEditing === 'true';
            const serviceName = serviceNameInput.disabled ? serviceSelect.value : serviceNameInput.value.trim();
            const servicePrice = parseFloat(customServiceForm.querySelector('input[name="servicePrice"]').value);
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
                                           editHistory: isEditing ? objects[customServiceForm.dataset.editIndex]?.editHistory || [] : []
            };

            if (isEditing) {
                const index = parseInt(customServiceForm.dataset.editIndex);
                const oldObj = objects[index];
                const changes = [];
                if (serviceName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${serviceName}"`);
                if (servicePrice !== parseFloat(oldObj.cost)) changes.push(`Стоимость: ${oldObj.cost} → ${servicePrice}`);
                if (JSON.stringify(object.workers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${object.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);
                if (changes.length > 0) {
                    object.editedTimestamp = new Date().toLocaleString();
                    object.editHistory.push({ timestamp: object.editedTimestamp, changes: changes.join(', ') });
                }
                objects[index] = object;
            } else {
                objects.unshift(object);
            }

            customServiceNames = [...new Set(objects.filter(obj => obj.isCustomService).map(obj => obj.name))];
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

                    function populateSuggestions(activeForm) {
                        const uniqueObjectNames = [...new Set(objects.filter(obj => !obj.isExpense && !obj.isCustomService).map(obj => obj.name))];
                        const uniqueExpenseNames = [...new Set(objects.filter(obj => obj.isExpense).map(obj => obj.name))];

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
                                });
                                suggestionsList.appendChild(li);
                            });

                            if (filteredNames.length > 0 && inputValue) suggestionsList.classList.add('show');
                            else suggestionsList.classList.remove('show');
                        };

                            if (activeForm === objectForm) renderSuggestions(objectNameInput, objectNameSuggestions, uniqueObjectNames);
                            else if (activeForm === expenseForm) renderSuggestions(expenseNameInput, expenseNameSuggestions, uniqueExpenseNames);
                            else if (activeForm === manualPriceForm) renderSuggestions(manualObjectNameInput, manualObjectNameSuggestions, uniqueObjectNames);
                            else if (activeForm === customServiceForm) renderSuggestions(serviceNameInput, serviceNameSuggestions, customServiceNames);

                            objectNameInput.addEventListener('input', () => renderSuggestions(objectNameInput, objectNameSuggestions, uniqueObjectNames));
                        expenseNameInput.addEventListener('input', () => renderSuggestions(expenseNameInput, expenseNameSuggestions, uniqueExpenseNames));
                        manualObjectNameInput.addEventListener('input', () => renderSuggestions(manualObjectNameInput, manualObjectNameSuggestions, uniqueObjectNames));
                        serviceNameInput.addEventListener('input', () => renderSuggestions(serviceNameInput, serviceNameSuggestions, customServiceNames));

                        document.addEventListener('click', (e) => {
                            if (!objectNameInput.contains(e.target) && !objectNameSuggestions.contains(e.target)) objectNameSuggestions.classList.remove('show');
                            if (!expenseNameInput.contains(e.target) && !expenseNameSuggestions.contains(e.target)) expenseNameSuggestions.classList.remove('show');
                            if (!manualObjectNameInput.contains(e.target) && !manualObjectNameSuggestions.contains(e.target)) manualObjectNameSuggestions.classList.remove('show');
                            if (!serviceNameInput.contains(e.target) && !serviceNameSuggestions.contains(e.target)) serviceNameSuggestions.classList.remove('show');
                        });
                    }

                    selectDisplay.addEventListener('click', () => optionsList.classList.toggle('show'));
                    manualSelectDisplay.addEventListener('click', () => manualOptionsList.classList.toggle('show'));

                    function addObject(e, isExpense = false, isManual = false) {
                        e.preventDefault();
                        const formToUse = isExpense ? expenseForm : (isManual ? manualPriceForm : objectForm);
                        const objectName = (isManual ? manualObjectNameInput : (isExpense ? expenseNameInput : objectNameInput)).value.trim();
                        let object;

                        if (isExpense) {
                            const expenseName = expenseNameInput.disabled ? expenseTypeValue.value : objectName;
                            const expenseAmount = parseFloat(expenseForm.querySelector('input[name="expenseAmount"]').value);
                            const workers = Array.from(expenseWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);
                            const receivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);

                            if (!expenseName || isNaN(expenseAmount) || expenseAmount >= 0 || workers.length === 0) {
                                alert('Заполните все поля корректно!');
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
                          editHistory: []
                            };
                        } else if (!isManual) {
                            const length = parseFloat(objectForm.querySelector('input[name="length"]').value);
                            const width = parseFloat(objectForm.querySelector('input[name="width"]').value);
                            const selectedOption = selectedValue.value;
                            const workersData = Array.from(workersCheckboxGroup.querySelectorAll('input:checked')).map(input => {
                                const ktuInput = objectForm.querySelector(`input[name="ktu_${input.value}"]`);
                                return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                            });

                            if (!objectName || !selectedOption || isNaN(length) || isNaN(width) || length <= 0 || width <= 0 || workersData.length === 0 || workersData.some(w => w.ktu <= 0)) {
                                alert('Заполните все поля корректно!');
                                return;
                            }

                            const [price, unit, serviceName] = selectedOption.split('|');
                            const totalCost = (length * width * parseFloat(price)).toFixed(2);
                            const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);

                            object = {
                                name: objectName,
                                area: `${length}x${width}=${(length * width).toFixed(2)} м²`,
                          service: serviceName,
                          cost: totalCost,
                          workers: workersData.map(w => ({ name: w.name, ktu: w.ktu, cost: (parseFloat(totalCost) * w.ktu / totalKtu).toFixed(2) })),
                          timestamp: new Date().toLocaleString(),
                          isExpense: false,
                          editHistory: []
                            };
                        } else {
                            const length = parseFloat(manualPriceForm.querySelector('input[name="length"]').value);
                            const width = parseFloat(manualPriceForm.querySelector('input[name="width"]').value);
                            const selectedOption = manualSelectedValue.value;
                            const pricePerSquare = parseFloat(manualPriceForm.querySelector('input[name="pricePerSquare"]').value);
                            const workersData = Array.from(manualWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => {
                                const ktuInput = manualPriceForm.querySelector(`input[name="manualktu_${input.value}"]`);
                                return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                            });

                            if (!objectName || !selectedOption || isNaN(length) || isNaN(width) || length <= 0 || width <= 0 || isNaN(pricePerSquare) || pricePerSquare <= 0 || workersData.length === 0 || workersData.some(w => w.ktu <= 0)) {
                                alert('Заполните все поля корректно!');
                                return;
                            }

                            const [serviceName, unit] = selectedOption.split('|');
                            const totalCost = (length * width * pricePerSquare).toFixed(2);
                            const totalKtu = workersData.reduce((sum, w) => sum + w.ktu, 0);

                            object = {
                                name: objectName,
                                area: `${length}x${width}=${(length * width).toFixed(2)} м²`,
                          service: serviceName,
                          cost: totalCost,
                          workers: workersData.map(w => ({ name: w.name, ktu: w.ktu, cost: (parseFloat(totalCost) * w.ktu / totalKtu).toFixed(2) })),
                          timestamp: new Date().toLocaleString(),
                          isExpense: false,
                          manualPrice: true,
                          editHistory: []
                            };
                        }

                        objects.unshift(object);
                        renderObjects();
                        renderWorkerStats();
                        populateSuggestions(formToUse);
                        formToUse.reset();
                        if (isManual) {
                            manualSelectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                            manualSelectedValue.value = '';
                        } else if (!isExpense) {
                            selectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
                            selectedValue.value = '';
                        } else {
                            expenseTypeSelect.innerHTML = 'Выберите тип расхода <span class="dropdown-icon">▾</span>';
                            expenseTypeValue.value = '';
                        }
                        showForm(null);
                        alert((isExpense ? 'Расход' : 'Объект') + ' добавлен.');
                    }

                    exportBtn.addEventListener('click', () => {
                        const json = JSON.stringify(objects, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'save.json';
                        a.click();
                        URL.revokeObjectURL(url);
                    });

                    clearCacheBtn.addEventListener('click', () => {
                        if (confirm('Обновить данные из JSON-файлов?')) {
                            caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
                            loadData();
                        }
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

                    function renderObjects() {
                        const filterText = filterInput.value.trim().toLowerCase();
                        resultsDiv.innerHTML = '';

                        let filteredObjects = !filterText ? [...objects] : objects.filter(obj => {
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
                                obj.workers.some(worker => (typeof worker === 'string' ? worker : eloader.name).toLowerCase().includes(filterText)) ||
                                (obj.receivers && obj.receivers.some(receiver => receiver.toLowerCase().includes(filterText))) ||
                                obj.timestamp.toLowerCase().includes(filterText)
                            );
                        });

                        if (filteredObjects.length === 0) {
                            resultsDiv.innerHTML = '<p>Объектов по этому фильтру не найдено.</p>';
                        } else {
                            filteredObjects.forEach((obj, index) => {
                                const costPerWorker = obj.isExpense
                                ? (parseFloat(obj.cost) / obj.workers.length).toFixed(2)
                                : obj.workers.map(w => `${w.name}: ${w.cost} ₽ (КТУ ${w.ktu})`).join(', ');
                                const costPerReceiver = obj.isExpense && obj.receivers.length > 0
                                ? (Math.abs(parseFloat(obj.cost)) / obj.receivers.length).toFixed(2)
                                : '0.00';

                                let imageUrl = null;
                                if (obj.isExpense && obj.name.toLowerCase() === 'бензин') {
                                    if (obj.receivers.length === 1 && obj.receivers.includes('Коля')) imageUrl = '/calc/img/nexia.png';
                                    else if (obj.receivers.length === 1 && obj.receivers.includes('Артём')) imageUrl = '/calc/img/ford.png';
                                    else imageUrl = '/calc/img/fuel.png';
                                } else if (obj.isExpense && obj.name.toLowerCase() === 'съёмная квартира') {
                                    imageUrl = '/calc/img/house.png';
                                } else if (!obj.isCustomService) {
                                    switch (obj.service) {
                                        case 'Монтаж наплавляемой кровли':
                                        case 'Монтаж примыканий':
                                        case 'Устранение разрушений кровельного ковра':
                                        case 'Монтаж наплавляемой кровли в 1 слой':
                                        case 'Монтаж пароизоляции':
                                            imageUrl = '/calc/img/gorelka.png';
                                            break;
                                        case 'Демонтаж полный «кровельного пирога»':
                                            imageUrl = '/calc/img/rezchik.png';
                                            break;
                                        case 'Грунтовка битумным праймером':
                                            imageUrl = '/calc/img/praymer.png';
                                            break;
                                        case 'Монтаж утеплителя каменная вата в 1 слой':
                                            imageUrl = '/calc/img/minvata.png';
                                            break;
                                        case 'Монтаж утеплителя пенопласт в 1 слой':
                                            imageUrl = '/calc/img/penoplast.png';
                                            break;
                                        case 'Монтаж утеплителя PIR в 1 слой':
                                            imageUrl = '/calc/img/pir.png';
                                            break;
                                        case 'Монтаж водоприемной воронки':
                                            imageUrl = '/calc/img/voronka.png';
                                            break;
                                        case 'Монтаж отливов из оцинкованной стали':
                                            imageUrl = '/calc/img/ocinkovka.png';
                                            break;
                                        case 'Монтаж прижимной планки с герметиком':
                                            imageUrl = '/calc/img/reyka.png';
                                            break;
                                        case 'Монтаж аэраторов':
                                            imageUrl = '/calc/img/aerator.png';
                                            break;
                                        case 'Монтаж из шифера в 1 слой':
                                            imageUrl = '/calc/img/shifer.png';
                                            break;
                                        case 'Монтаж из OSB листов в 1 слой':
                                            imageUrl = '/calc/img/osb.png';
                                            break;
                                    }
                                } else {
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
                                }

                                const entry = document.createElement('div');
                                entry.className = `calculation ${obj.isExpense ? 'expense' : ''} ${obj.manualPrice ? 'manual-price' : ''} ${obj.isCustomService ? 'custom-service' : ''} ${editMode ? 'editable' : ''}`;
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
                                <div class="info-line cost"><span class="label">Стоимость:</span><span class="value">${obj.cost} ₽</span></div>
                                <div class="info-line workers"><span class="label">${obj.isExpense ? 'Участники (списание)' : 'Участники'}:</span><span class="value">${obj.isExpense ? obj.workers.join(', ') : obj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}</span></div>
                                ${obj.isExpense && obj.receivers.length > 0 ? `<div class="info-line receivers"><span class="label">Участники (начисление):</span><span class="value">${obj.receivers.join(', ')}</span></div>` : ''}
                                <div class="info-line cost-per-worker"><span class="label">${obj.isExpense ? 'На одного (списание)' : 'Распределение'}:</span><span class="value">${costPerWorker}</span></div>
                                ${obj.isExpense && obj.receivers.length > 0 ? `<div class="info-line cost-per-receiver"><span class="label">На одного (начисление):</span><span class="value">${costPerReceiver} ₽</span></div>` : ''}
                                ${obj.editedTimestamp ? `<div class="edit-history">Последнее редактирование: ${obj.editedTimestamp}</div>` : ''}
                                `;
                                entry.dataset.index = index;
                                if (editMode) {
                                    entry.addEventListener('click', (e) => {
                                        if (!e.target.classList.contains('delete-cross') && !e.target.classList.contains('calendar-btn')) editObject(index);
                                    });
                                }
                                resultsDiv.appendChild(entry);
                            });
                        }

                        bindDeleteCrosses();
                        bindCalendarButtons();
                    }

                    function bindDeleteCrosses() {
                        document.querySelectorAll('.delete-cross').forEach(cross => {
                            cross.removeEventListener('click', handleDelete);
                            cross.addEventListener('click', handleDelete);
                        });
                    }

                    function handleDelete(e) {
                        const index = parseInt(e.target.getAttribute('data-index'));
                        if (confirm(`Удалить "${objects[index].isExpense ? 'расход' : 'объект'} "${objects[index].name}"?`)) {
                            objects.splice(index, 1);
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
                        const obj = objects[index];
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
                        const obj = objects[index];
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
                        const obj = objects[index];
                        const isExpense = obj.isExpense;
                        const isCustomService = obj.isCustomService;
                        const formToUse = isExpense ? expenseForm : (isCustomService ? customServiceForm : (obj.manualPrice ? manualPriceForm : objectForm));

                        showForm(formToUse);
                        const submitBtn = formToUse.querySelector('button[type="submit"]');
                        const cancelBtn = formToUse.querySelector('.cancel-btn');

                        submitBtn.textContent = 'Изменить ' + (isExpense ? 'расход' : ( byCustomService ? 'услугу' : 'объект'));
                        cancelBtn.style.display = 'inline-block';
                        formToUse.dataset.isEditing = 'true';
                        formToUse.dataset.editIndex = index;

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
                            const [length, width] = obj.area.split('=')[0].split('x').map(s => parseFloat(s));
                            formToUse.querySelector('input[name="length"]').value = length;
                            formToUse.querySelector('input[name="width"]').value = width;
                            if (obj.manualPrice) {
                                manualSelectedValue.value = `${obj.service}|м²`;
                                manualSelectDisplay.innerHTML = `${obj.service} (м²) <span class="dropdown-icon">▾</span>`;
                                const pricePerSquare = parseFloat(obj.cost) / (length * width);
                                manualPriceForm.querySelector('input[name="pricePerSquare"]').value = pricePerSquare.toFixed(2);
                            } else {
                                const pricePerSquare = parseFloat(obj.cost) / (length * width);
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
                            const oldObj = objects[index];
                            const changes = [];

                            if (isExpense) {
                                const newName = expenseNameInput.disabled ? expenseTypeValue.value : expenseNameInput.value.trim();
                                const newAmount = parseFloat(expenseForm.querySelector('input[name="expenseAmount"]').value);
                                const newWorkers = Array.from(expenseWorkersCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);
                                const newReceivers = Array.from(expenseReceiversCheckboxGroup.querySelectorAll('input:checked')).map(input => input.value);

                                if (!newName || isNaN(newAmount) || newAmount >= 0 || newWorkers.length === 0) {
                                    alert('Заполните все поля корректно!');
                                    return;
                                }

                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (newAmount !== parseFloat(oldObj.cost)) changes.push(`Сумма: ${oldObj.cost} → ${newAmount}`);
                                if (JSON.stringify(newWorkers) !== JSON.stringify(oldObj.workers)) changes.push(`Участники (списание): "${oldObj.workers.join(', ')}" → "${newWorkers.join(', ')}"`);
                                if (JSON.stringify(newReceivers) !== JSON.stringify(oldObj.receivers)) changes.push(`Участники (начисление): "${oldObj.receivers.join(', ')}" → "${newReceivers.join(', ')}"`);

                                oldObj.name = newName;
                                oldObj.cost = newAmount.toFixed(2);
                                oldObj.workers = newWorkers;
                                oldObj.receivers = newReceivers;
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
                            } else {
                                const newName = (obj.manualPrice ? manualObjectNameInput : objectNameInput).value.trim();
                                const selectedOption = obj.manualPrice ? manualSelectedValue.value : selectedValue.value;
                                if (!selectedOption) {
                                    alert('Выберите услугу!');
                                    return;
                                }

                                const [priceOrService, unit, serviceName] = selectedOption.split('|');
                                const newService = obj.manualPrice ? priceOrService : serviceName;
                                const newLength = parseFloat(formToUse.querySelector('input[name="length"]').value);
                                const newWidth = parseFloat(formToUse.querySelector('input[name="width"]').value);
                                const pricePerSquare = obj.manualPrice ? parseFloat(manualPriceForm.querySelector('input[name="pricePerSquare"]').value) : parseFloat(priceOrService);
                                const newWorkers = Array.from((obj.manualPrice ? manualWorkersCheckboxGroup : workersCheckboxGroup).querySelectorAll('input:checked')).map(input => {
                                    const ktuInput = formToUse.querySelector(`input[name="${obj.manualPrice ? 'manual' : ''}ktu_${input.value}"]`);
                                    return { name: input.value, ktu: ktuInput.value ? parseFloat(ktuInput.value) : 1 };
                                });
                                const totalKtu = newWorkers.reduce((sum, w) => sum + w.ktu, 0);
                                const newCost = (newLength * newWidth * pricePerSquare).toFixed(2);

                                if (!newName || isNaN(newLength) || isNaN(newWidth) || newLength <= 0 || newWidth <= 0 || isNaN(pricePerSquare) || pricePerSquare <= 0 || newWorkers.length === 0 || newWorkers.some(w => w.ktu <= 0)) {
                                    alert('Заполните все поля корректно!');
                                    return;
                                }

                                const newWorkersWithCost = newWorkers.map(w => ({ ...w, cost: (parseFloat(newCost) * w.ktu / totalKtu).toFixed(2) }));

                                if (newName !== oldObj.name) changes.push(`Название: "${oldObj.name}" → "${newName}"`);
                                if (`${newLength}x${newWidth}=${(newLength * newWidth).toFixed(2)} м²` !== oldObj.area) changes.push(`Площадь: ${oldObj.area} → ${newLength}x${newWidth}=${(newLength * newWidth).toFixed(2)} м²`);
                                if (newService !== oldObj.service) changes.push(`Услуга: "${oldObj.service}" → "${newService}"`);
                                if (newCost !== oldObj.cost) changes.push(`Стоимость: ${oldObj.cost} → ${newCost}`);
                                if (JSON.stringify(newWorkersWithCost) !== JSON.stringify(oldObj.workers)) changes.push(`Участники: "${oldObj.workers.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}" → "${newWorkersWithCost.map(w => `${w.name} (КТУ ${w.ktu})`).join(', ')}"`);

                                oldObj.name = newName;
                                oldObj.area = `${newLength}x${newWidth}=${(newLength * newWidth).toFixed(2)} м²`;
                                oldObj.service = newService;
                                oldObj.cost = newCost;
                                oldObj.workers = newWorkersWithCost;
                            }

                            if (changes.length > 0) {
                                oldObj.editedTimestamp = new Date().toLocaleString();
                                oldObj.editHistory.push({ timestamp: oldObj.editedTimestamp, changes: changes.join(', ') });
                            }

                            customServiceNames = [...new Set(objects.filter(obj => obj.isCustomService).map(obj => obj.name))];
                            renderObjects();
                            renderWorkerStats();
                            formToUse.reset();
                            formToUse.dataset.isEditing = 'false';
                            formToUse.dataset.editIndex = '';
                            submitBtn.textContent = isExpense ? 'Добавить расход' : (isCustomService ? 'Добавить услугу' : 'Добавить объект');
                            cancelBtn.style.display = 'none';
                            showForm(null);
                            alert((isExpense ? 'Расход' : (isCustomService ? 'Услуга' : 'Объект')) + ' изменён.');
                        };
                    }

                    function renderWorkerStats() {
                        const statsGrid = document.getElementById('worker-stats');
                        if (!statsGrid) {
                            console.error('worker-stats not found');
                            return;
                        }
                        statsGrid.innerHTML = '';

                        workers.forEach(worker => {
                            const workerObjects = objects.filter(obj =>
                            (obj.workers.some(w => (typeof w === 'string' ? w : w.name) === worker)) ||
                            (obj.receivers && obj.receivers.includes(worker))
                            );
                            if (workerObjects.length > 0) {
                                const regularObjects = workerObjects.filter(obj => !obj.isExpense && !obj.manualPrice && !obj.isCustomService).length;
                                const manualObjects = workerObjects.filter(obj => obj.manualPrice).length;
                                const services = workerObjects.filter(obj => obj.isCustomService).length;
                                const expenses = workerObjects.filter(obj => obj.isExpense).length;
                                const lowKtuCount = workerObjects
                                .filter(obj => !obj.isExpense && obj.workers.some(w => w.name === worker && w.ktu < 1))
                                .length;

                                const earningsBreakdown = workerObjects.map((obj, index) => {
                                    let workerContribution = 0;
                                    let className = '';
                                    if (obj.workers.some(w => (typeof w === 'string' ? w : w.name) === worker)) {
                                        const workerData = obj.isExpense ? null : obj.workers.find(w => w.name === worker);
                                        workerContribution += obj.isExpense
                                        ? parseFloat(obj.cost) / obj.workers.length
                                        : parseFloat(workerData.cost);
                                        className = obj.isExpense ? 'expense-earning' : (obj.isCustomService ? 'service-earning' : 'regular-earning');
                                    }
                                    if (obj.isExpense && obj.receivers && obj.receivers.includes(worker)) {
                                        workerContribution += Math.abs(parseFloat(obj.cost)) / obj.receivers.length;
                                        className = 'receiver-earning';
                                    }
                                    return { value: workerContribution.toFixed(2), index, className };
                                });

                                const totalEarnings = earningsBreakdown.reduce((sum, val) => sum + parseFloat(val.value), 0);
                                const formattedEarnings = totalEarnings.toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                                .replace('.00', '');

                                const earningsHtml = earningsBreakdown
                                .map(e => `<span class="earnings-item ${e.className}" data-index="${e.index}">${e.value >= 0 ? '+' : ''}${e.value}</span>`)
                                .join(' ') + ` = ${formattedEarnings} ₽`;

                                const card = document.createElement('div');
                                card.className = 'worker-card';
                                card.innerHTML = `
                                <div class="worker-name">${worker}</div>
                                <div class="earnings">${earningsHtml}</div>
                                <ul class="stats-list">
                                <li data-filter="regular">Обычные объекты: <span>${regularObjects}</span></li>
                                <li data-filter="manual">Ручная цена: <span>${manualObjects}</span></li>
                                <li data-filter="services">Услуги: <span>${services}</span></li>
                                <li data-filter="expenses">Расходы: <span>${expenses}</span></li>
                                ${lowKtuCount > 0 ? `<li data-filter="lowKtu">КТУ ниже нормы: <span>${lowKtuCount}</span></li>` : ''}
                                </ul>
                                <div class="worker-chart" data-earnings="${totalEarnings}" data-worker="${worker}"></div>
                                `;

                                card.addEventListener('click', (e) => {
                                    const isChart = e.target.closest('.worker-chart');
                                    const isEarningItem = e.target.classList.contains('earnings-item');
                                    const isStatsLi = e.target.closest('.stats-list li');

                                    if (!isChart && !isEarningItem && !isStatsLi) {
                                        filterByWorker(worker);
                                    }
                                });

                                card.querySelectorAll('.stats-list li').forEach(li => {
                                    li.style.cursor = 'pointer';
                                    li.addEventListener('click', (e) => {
                                        e.stopPropagation();
                                        const filterType = li.dataset.filter;
                                        let filterValue = `${worker} `;

                                        switch (filterType) {
                                            case 'regular':
                                                filterValue += 'обычных объектов';
                                                break;
                                            case 'manual':
                                                filterValue += 'объектов с ручной ценой';
                                                break;
                                            case 'services':
                                                filterValue += 'услуги';
                                                break;
                                            case 'expenses':
                                                filterValue += 'расходов';
                                                break;
                                            case 'lowKtu':
                                                filterValue += 'КТУ ниже нормы';
                                                break;
                                        }

                                        filterInput.value = filterValue;
                                        renderObjects();

                                        setTimeout(() => {
                                            const filteredCards = resultsDiv.querySelectorAll('.calculation');
                                            if (filteredCards.length > 0) {
                                                filteredCards.forEach(card => {
                                                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                });
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
                                            if (card) {
                                                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }, 100);
                                    });
                                });

                                statsGrid.appendChild(card);
                            }
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

                            const workerObjects = objects.filter(obj =>
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
});
