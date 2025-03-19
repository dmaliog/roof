document.addEventListener('DOMContentLoaded', () => {
    // Калькулятор
    const selectDisplay = document.getElementById('service-select');
    const selectedValue = document.getElementById('selected-value');
    const optionsList = document.getElementById('service-options');
    const quantityInput = document.getElementById('quantity');
    const unitLabel = document.getElementById('unit-label');
    const addButton = document.getElementById('add-service');
    const serviceList = document.getElementById('service-list');
    const totalCostElement = document.getElementById('total-cost');
    const clearAllButton = document.getElementById('clear-all');

    let services = [];
    let totalCost = 0;

    selectDisplay.addEventListener('click', () => {
        optionsList.classList.toggle('show');
    });

    optionsList.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            selectDisplay.innerHTML = `${option.textContent} <span class="dropdown-icon">▾</span>`;
            selectedValue.value = value;
            const [, unit] = value.split('|');
            unitLabel.textContent = unit;
            optionsList.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (!selectDisplay.contains(e.target) && !optionsList.contains(e.target)) {
            optionsList.classList.remove('show');
        }
    });

    addButton.addEventListener('click', () => {
        const selectedOption = selectedValue.value;
        const quantity = parseFloat(quantityInput.value);

        if (!selectedOption || !quantity || quantity <= 0) {
            alert('Пожалуйста, выберите услугу и укажите количество.');
            return;
        }

        const [price, unit, name] = selectedOption.split('|');
        const cost = parseFloat(price) * quantity;

        const service = { name, unit, quantity, cost };
        services.push(service);
        totalCost += cost;

        renderServiceList();

        selectDisplay.innerHTML = 'Выберите услугу <span class="dropdown-icon">▾</span>';
        selectedValue.value = '';
        quantityInput.value = '';
        unitLabel.textContent = 'кв.м.';
    });

    clearAllButton.addEventListener('click', () => {
        services = [];
        totalCost = 0;
        renderServiceList();
    });

    function renderServiceList() {
        serviceList.innerHTML = '';
        services.forEach((service, index) => {
            const li = document.createElement('li');
            const textSpan = document.createElement('span');
            textSpan.textContent = `${service.name} — ${service.quantity} ${service.unit} — ${service.cost.toFixed(2)} ₽`;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✕';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', () => {
                totalCost -= service.cost;
                services.splice(index, 1);
                renderServiceList();
            });
            li.appendChild(textSpan);
            li.appendChild(removeBtn);
            serviceList.appendChild(li);
        });
        totalCostElement.textContent = `${totalCost.toFixed(2)} ₽`;
    }

    // Слайдер
    function initSlider(sliderClass, isGallery = false) {
        const slider = document.querySelector(sliderClass);
        if (!slider) return;

        const wrapper = slider.querySelector('.slider-wrapper');
        const track = slider.querySelector('.slider-track');
        const items = track.children;
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');
        const dotsContainer = slider.querySelector('.slider-dots'); // Изменено на поиск внутри слайдера
        let index = 0;
        let isDotClicked = false; // Флаг для отслеживания клика по точке

        if (!prevBtn || !nextBtn || !dotsContainer || items.length === 0) {
            console.error(`Элементы слайдера не найдены для: ${sliderClass}`);
            return;
        }

        function updateSlider() {
            const wrapperWidth = wrapper.offsetWidth;
            const totalWidth = track.scrollWidth;
            let itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
            let visibleItems = Math.floor(wrapperWidth / itemWidth);
            let maxIndex = Math.max(0, Math.ceil((totalWidth - wrapperWidth) / itemWidth));

            let offset;

            if (isGallery) {
                // Галерея: центрируем текущий слайд
                let currentItem = items[index];
                let currentWidth = currentItem.offsetWidth + parseInt(getComputedStyle(currentItem).marginRight || 0);
                offset = currentItem.offsetLeft - (wrapperWidth - currentWidth) / 2;

                // Если последний слайд, прижимаем его вправо
                if (index >= maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }

                // Для галереи округляем offset
                offset = Math.round(offset);
            } else {
                // Основной слайдер: используем `offsetLeft`, чтобы убрать обрезание
                if (index > maxIndex) index = maxIndex;
                if (index < 0) index = 0;

                let targetItem = items[index];
                offset = targetItem.offsetLeft;

                if (index === maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }
            }

            // Гарантируем, что не выйдем за границы
            offset = Math.max(0, Math.min(offset, totalWidth - wrapperWidth));

            // Применяем трансформацию
            track.style.transform = `translateX(-${offset}px)`;

            // Обновляем точки
            updateDots(maxIndex, isGallery);

            // Управляем кнопками
            prevBtn.style.display = index === 0 ? 'none' : 'flex';
            nextBtn.style.display = index >= maxIndex ? 'none' : 'flex';
        }

        function updateDots(maxIndex, isGallery = false) {
            dotsContainer.innerHTML = '';

            // Если слайдер не нуждается в точках — убираем их
            if (maxIndex <= 0) {
                dotsContainer.style.display = 'none';
                return;
            } else {
                dotsContainer.style.display = 'flex';
            }

            if (isGallery) {
                // Галерея: показываем все точки
                for (let i = 0; i <= maxIndex; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('slider-dot');
                    if (i === index) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        index = i;
                        isDotClicked = true;
                        updateSlider();
                    });
                    dotsContainer.appendChild(dot);
                }
                return;
            }

            // Основной слайдер: динамическое отображение точек
            if (maxIndex <= 5 || index < 5) { // Первые 6 точек до index 4 всегда
                for (let i = 0; i <= Math.min(5, maxIndex); i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('slider-dot');
                    if (i === index) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        index = i;
                        isDotClicked = true;
                        updateSlider();
                    });
                    dotsContainer.appendChild(dot);
                }
            } else if (index >= maxIndex - 5 && (!isDotClicked || (isDotClicked && index > maxIndex - 5))) { // Последние 6 точек, если не клик или клик не на первую из последних
                for (let i = maxIndex - 5; i <= maxIndex; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('slider-dot');
                    if (i === index) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        index = i;
                        isDotClicked = true;
                        updateSlider();
                    });
                    dotsContainer.appendChild(dot);
                }
            } else {
                // Показываем 3 точки (первая, текущая, последняя) при index >= 5 или клике на первую из последних
                const firstDot = document.createElement('div');
                firstDot.classList.add('slider-dot');
                firstDot.addEventListener('click', () => {
                    index = 0;
                    isDotClicked = true;
                    updateSlider();
                });
                dotsContainer.appendChild(firstDot);

                const activeDot = document.createElement('div');
                activeDot.classList.add('slider-dot', 'active');
                activeDot.addEventListener('click', () => {
                    index = index; // Оставляем текущий индекс
                    isDotClicked = true;
                    updateSlider();
                });
                dotsContainer.appendChild(activeDot);

                const lastDot = document.createElement('div');
                lastDot.classList.add('slider-dot');
                lastDot.addEventListener('click', () => {
                    index = maxIndex;
                    isDotClicked = true;
                    updateSlider();
                });
                dotsContainer.appendChild(lastDot);
            }
        }

        updateSlider();

        prevBtn.addEventListener('click', () => {
            if (index > 0) {
                index--;
                isDotClicked = false; // Сбрасываем флаг при использовании кнопок
                updateSlider();
            }
        });

        nextBtn.addEventListener('click', () => {
            let wrapperWidth = wrapper.offsetWidth;
            let itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
            let visibleItems = Math.floor(wrapperWidth / itemWidth);
            let maxIndex = Math.max(0, Math.ceil((track.scrollWidth - wrapperWidth) / itemWidth));

            if (index < maxIndex) {
                index++;
                isDotClicked = false; // Сбрасываем флаг при использовании кнопок
                updateSlider();
            }
        });

        window.addEventListener('resize', updateSlider);
    }

    // Запускаем слайдеры с разными параметрами
    initSlider('.services .slider', false); // Услуги — без центрирования
    initSlider('.gallery .slider', true);   // Галерея — с центрированием
});
