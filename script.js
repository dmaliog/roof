document.addEventListener('DOMContentLoaded', () => {
    // Обработчик формы для редиректа на mailto
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contactForm.querySelector('input[name="name"]').value;
        const phone = contactForm.querySelector('input[name="phone"]').value;
        const message = contactForm.querySelector('textarea[name="message"]').value;
        const subject = encodeURIComponent('Заявка с сайта: Монтаж плоских кровель');
        const body = encodeURIComponent(`Имя: ${name}\nТелефон: ${phone}\nСообщение: ${message}`);
        const email = 'dmali@mail.ru';
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });

    // Калькулятор (без изменений)
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

    // Слайдер с поддержкой свайпов
    function initSlider(sliderClass, isGallery = false) {
        const slider = document.querySelector(sliderClass);
        if (!slider) return;

        const wrapper = slider.querySelector('.slider-wrapper');
        const track = slider.querySelector('.slider-track');
        const items = track.children;
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');
        const dotsContainer = slider.querySelector('.slider-dots');
        let index = 0;
        let isDotClicked = false;

        // Переменные для свайпов
        let touchStartX = 0;
        let touchCurrentX = 0;
        let isDragging = false;

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
                let currentItem = items[index];
                let currentWidth = currentItem.offsetWidth + parseInt(getComputedStyle(currentItem).marginRight || 0);
                offset = currentItem.offsetLeft - (wrapperWidth - currentWidth) / 2;

                if (index >= maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }

                offset = Math.round(offset);
            } else {
                if (index > maxIndex) index = maxIndex;
                if (index < 0) index = 0;

                let targetItem = items[index];
                offset = targetItem.offsetLeft;

                if (index === maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }
            }

            offset = Math.max(0, Math.min(offset, totalWidth - wrapperWidth));
            track.style.transform = `translateX(-${offset}px)`;

            updateDots(maxIndex, isGallery);

            prevBtn.style.display = index === 0 ? 'none' : 'flex';
            nextBtn.style.display = index >= maxIndex ? 'none' : 'flex';
        }

        function updateDots(maxIndex, isGallery = false) {
            dotsContainer.innerHTML = '';

            if (maxIndex <= 0) {
                dotsContainer.style.display = 'none';
                return;
            } else {
                dotsContainer.style.display = 'flex';
            }

            if (isGallery) {
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

            if (maxIndex <= 5 || index < 5) {
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
            } else if (index >= maxIndex - 5 && (!isDotClicked || (isDotClicked && index > maxIndex - 5))) {
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
                    index = index;
                    isDotClicked六 = true;
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

        // Обработка свайпов
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none'; // Убираем анимацию при свайпе
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            touchCurrentX = e.touches[0].clientX;
            const diff = touchStartX - touchCurrentX;
            const currentTransform = parseFloat(track.style.transform.replace('translateX(-', '').replace('px)', '')) || 0;
            track.style.transform = `translateX(-${currentTransform + diff}px)`;
        });

        track.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.5s ease'; // Возвращаем анимацию

            const diff = touchStartX - touchCurrentX;
            const threshold = 50; // Минимальное расстояние для свайпа

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Свайп влево
                    let maxIndex = Math.max(0, Math.ceil((track.scrollWidth - wrapper.offsetWidth) / (items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0))));
                    if (index < maxIndex) index++;
                } else {
                    // Свайп вправо
                    if (index > 0) index--;
                }
            }
            isDotClicked = false;
            updateSlider();
        });

        // Обработка кликов по кнопкам
        prevBtn.addEventListener('click', () => {
            if (index > 0) {
                index--;
                isDotClicked = false;
                updateSlider();
            }
        });

        nextBtn.addEventListener('click', () => {
            let wrapperWidth = wrapper.offsetWidth;
            let itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
            let maxIndex = Math.max(0, Math.ceil((track.scrollWidth - wrapperWidth) / itemWidth));

            if (index < maxIndex) {
                index++;
                isDotClicked = false;
                updateSlider();
            }
        });

        window.addEventListener('resize', updateSlider);
        updateSlider();
    }

    // Запускаем слайдеры
    initSlider('.services .slider', false);
    initSlider('.gallery .slider', true);
});
