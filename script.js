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
        const dotsContainer = slider.querySelector('.slider-dots');
        let index = 0;
        let currentOffset = 0;

        if (!prevBtn || !nextBtn || !dotsContainer || items.length === 0) {
            console.error(`Элементы слайдера не найдены для: ${sliderClass}`);
            return;
        }

        function updateSlider(animate = true) {
            const wrapperWidth = wrapper.getBoundingClientRect().width;
            const totalWidth = track.scrollWidth;
            const itemWidth = items[0].getBoundingClientRect().width + parseInt(getComputedStyle(items[0]).marginRight || 0);
            let visibleItems, maxIndex, offset;

            if (isGallery) {
                // Логика для галереи
                visibleItems = Math.max(1, Math.round(wrapperWidth / itemWidth));
                maxIndex = Math.max(0, items.length - visibleItems);
                offset = index * itemWidth;
            } else {
                // Логика для услуг (старая)
                visibleItems = Math.floor(wrapperWidth / itemWidth);
                maxIndex = Math.max(0, Math.floor((totalWidth - wrapperWidth) / itemWidth));
                offset = items[index].offsetLeft;
                if (index === maxIndex) {
                    offset = totalWidth - wrapperWidth;
                }
            }

            if (index > maxIndex) index = maxIndex;
            if (index < 0) index = 0;

            currentOffset = Math.max(0, Math.min(offset, totalWidth - wrapperWidth));

            if (animate) {
                track.style.transition = 'transform 0.5s ease';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = `translateX(-${currentOffset}px)`;

            updateDots(maxIndex, isGallery);

            prevBtn.style.display = index === 0 ? 'none' : 'flex';
            nextBtn.style.display = index === maxIndex ? 'none' : 'flex';

            // Отладка
            console.log(`${sliderClass} - Wrapper Width: ${wrapperWidth}, Item Width: ${itemWidth}, Items: ${items.length}, Visible: ${visibleItems}, Max Index: ${maxIndex}, Dots: ${isGallery ? maxIndex + 1 : 'variable'}`);
        }

        function updateDots(maxIndex, isGallery = false) {
            dotsContainer.innerHTML = '';

            if (maxIndex <= 0) {
                dotsContainer.style.display = 'none';
                return;
            }
            dotsContainer.style.display = 'flex';

            if (isGallery) {
                // Простая логика для галереи
                for (let i = 0; i <= maxIndex; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('slider-dot');
                    if (i === index) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        index = i;
                        updateSlider();
                    });
                    dotsContainer.appendChild(dot);
                }
            } else {
                // Старая логика для услуг
                const totalDots = maxIndex + 1;
                if (totalDots <= 6) {
                    for (let i = 0; i < totalDots; i++) {
                        const dot = document.createElement('div');
                        dot.classList.add('slider-dot');
                        if (i === index) dot.classList.add('active');
                        dot.addEventListener('click', () => {
                            index = i;
                            updateSlider();
                        });
                        dotsContainer.appendChild(dot);
                    }
                } else {
                    if (index <= 2) {
                        for (let i = 0; i < 5; i++) {
                            const dot = document.createElement('div');
                            dot.classList.add('slider-dot');
                            if (i === index) dot.classList.add('active');
                            dot.addEventListener('click', () => {
                                index = i;
                                updateSlider();
                            });
                            dotsContainer.appendChild(dot);
                        }
                    } else if (index >= maxIndex - 2) {
                        for (let i = maxIndex - 4; i <= maxIndex; i++) {
                            const dot = document.createElement('div');
                            dot.classList.add('slider-dot');
                            if (i === index) dot.classList.add('active');
                            dot.addEventListener('click', () => {
                                index = i;
                                updateSlider();
                            });
                            dotsContainer.appendChild(dot);
                        }
                    } else {
                        for (let i = index - 2; i <= index + 2; i++) {
                            const dot = document.createElement('div');
                            dot.classList.add('slider-dot');
                            if (i === index) dot.classList.add('active');
                            dot.addEventListener('click', () => {
                                index = i;
                                updateSlider();
                            });
                            dotsContainer.appendChild(dot);
                        }
                    }
                }
            }
        }

        // Обработка кликов по кнопкам
        prevBtn.addEventListener('click', () => {
            if (index > 0) {
                index--;
                updateSlider();
            }
        });

        nextBtn.addEventListener('click', () => {
            const wrapperWidth = wrapper.getBoundingClientRect().width;
            const itemWidth = items[0].getBoundingClientRect().width + parseInt(getComputedStyle(items[0]).marginRight || 0);
            const visibleItems = isGallery ? Math.max(1, Math.round(wrapperWidth / itemWidth)) : Math.floor(wrapperWidth / itemWidth);
            const maxIndex = isGallery ? Math.max(0, items.length - visibleItems) : Math.floor((track.scrollWidth - wrapperWidth) / itemWidth);

            if (index < maxIndex) {
                index++;
                updateSlider();
            }
        });

        // Обработка свайпов
        let touchStartX = 0;
        let touchCurrentX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
            currentOffset = parseFloat(track.style.transform.replace('translateX(-', '').replace('px)', '')) || 0;
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            touchCurrentX = e.touches[0].clientX;
            const diffX = touchStartX - touchCurrentX;
            let newOffset = currentOffset + diffX;
            const wrapperWidth = wrapper.getBoundingClientRect().width;
            const totalWidth = track.scrollWidth;
            newOffset = Math.max(0, Math.min(newOffset, totalWidth - wrapperWidth));
            track.style.transform = `translateX(-${newOffset}px)`;
        });

        track.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.5s ease';

            const wrapperWidth = wrapper.getBoundingClientRect().width;
            const itemWidth = items[0].getBoundingClientRect().width + parseInt(getComputedStyle(items[0]).marginRight || 0);
            const visibleItems = isGallery ? Math.max(1, Math.round(wrapperWidth / itemWidth)) : Math.floor(wrapperWidth / itemWidth);
            const maxIndex = isGallery ? Math.max(0, items.length - visibleItems) : Math.floor((track.scrollWidth - wrapperWidth) / itemWidth);

            const currentOffset = parseFloat(track.style.transform.replace('translateX(-', '').replace('px)', '')) || 0;
            index = Math.round(currentOffset / itemWidth);

            if (index < 0) index = 0;
            if (index > maxIndex) index = maxIndex;

            updateSlider();
        });

        window.addEventListener('resize', () => updateSlider(false));
        updateSlider(false);
    }

    // Запускаем слайдеры
    initSlider('.services .slider', false);
    initSlider('.gallery .slider', true);
});
