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

    // Слайдер с исправлением поведения точек на компьютере
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
        let currentOffset = 0;

        // Переменные для свайпов
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentX = 0;
        let isDragging = false;
        let isHorizontalSwipe = false;

        if (!prevBtn || !nextBtn || !dotsContainer || items.length === 0) {
            console.error(`Элементы слайдера не найдены для: ${sliderClass}`);
            return;
        }

        function updateSlider(animate = true) {
            const wrapperWidth = wrapper.offsetWidth;
            const totalWidth = track.scrollWidth;
            let itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
            let maxIndex = isGallery ? items.length - 1 : Math.max(0, Math.floor((totalWidth - wrapperWidth) / itemWidth));

            if (index > maxIndex) index = maxIndex;
            if (index < 0) index = 0;

            let offset;

            if (isGallery) {
                let currentItem = items[index];
                let currentWidth = currentItem.offsetWidth + parseInt(getComputedStyle(currentItem).marginRight || 0);
                offset = currentItem.offsetLeft - (wrapperWidth - currentWidth) / 2;

                if (index === maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }
            } else {
                let targetItem = items[index];
                offset = targetItem.offsetLeft;

                if (index === maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }
            }

            offset = Math.max(0, Math.min(offset, totalWidth - wrapperWidth));
            currentOffset = offset;

            if (animate) {
                track.style.transition = 'transform 0.5s ease';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = `translateX(-${offset}px)`;

            updateDots(maxIndex, isGallery);

            prevBtn.style.display = index === 0 ? 'none' : 'flex';
            nextBtn.style.display = index === maxIndex ? 'none' : 'flex';
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

            // Логика точек для услуг
            const totalDots = maxIndex + 1; // Общее количество точек
            if (totalDots <= 6) {
                // Если элементов 6 или меньше, показываем все точки
                for (let i = 0; i < totalDots; i++) {
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
                // Если больше 6, показываем 5 точек с учётом текущей позиции
                if (index <= 2) {
                    // Показываем первые 5 точек
                    for (let i = 0; i < 5; i++) {
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
                } else if (index >= maxIndex - 2) {
                    // Показываем последние 5 точек
                    for (let i = maxIndex - 4; i <= maxIndex; i++) {
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
                    // Показываем текущую точку в середине с двумя соседями
                    for (let i = index - 2; i <= index + 2; i++) {
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
                }
            }
        }

        // Обработка свайпов
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isDragging = true;
            isHorizontalSwipe = false;
            track.style.transition = 'none';
            currentOffset = parseFloat(track.style.transform.replace('translateX(-', '').replace('px)', '')) || 0;
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            const diffX = touchStartX - touchCurrentX;
            const diffY = touchStartY - touchCurrentY;

            if (!isHorizontalSwipe && (Math.abs(diffX) > Math.abs(diffY))) {
                isHorizontalSwipe = true;
            }

            if (isHorizontalSwipe) {
                e.preventDefault();
                let newOffset = currentOffset + diffX * 1.5;
                const wrapperWidth = wrapper.offsetWidth;
                const totalWidth = track.scrollWidth;
                newOffset = Math.max(0, Math.min(newOffset, totalWidth - wrapperWidth));
                track.style.transform = `translateX(-${newOffset}px)`;
            }
        });

        track.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.5s ease';

            const wrapperWidth = wrapper.offsetWidth;
            const totalWidth = track.scrollWidth;
            const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
            const maxIndex = isGallery ? items.length - 1 : Math.max(0, Math.floor((totalWidth - wrapperWidth) / itemWidth));

            const currentOffset = parseFloat(track.style.transform.replace('translateX(-', '').replace('px)', '')) || 0;
            index = Math.round(currentOffset / itemWidth);

            if (index < 0) index = 0;
            if (index > maxIndex) index = maxIndex;

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
            const wrapperWidth = wrapper.offsetWidth;
            const totalWidth = track.scrollWidth;
            const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
            const maxIndex = isGallery ? items.length - 1 : Math.max(0, Math.floor((totalWidth - wrapperWidth) / itemWidth));

            if (index < maxIndex) {
                index++;
                isDotClicked = false;
                updateSlider();
            }
        });

        window.addEventListener('resize', () => updateSlider(false));
        updateSlider(false);
    }

    // Запускаем слайдеры
    initSlider('.services .slider', false);
    initSlider('.gallery .slider', true);
});
