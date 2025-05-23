document.addEventListener('DOMContentLoaded', function() {
    // Filtros
    const hairFilter = document.getElementById('hairFilter');
    const weightFilter = document.getElementById('weightFilter');
    const heightFilter = document.getElementById('heightFilter');
    const cards = document.querySelectorAll('.model-card');

    function filterModels() {
        const hair = hairFilter.value;
        const weight = weightFilter.value;
        const height = heightFilter.value;
        cards.forEach(card => {
            const matchHair = !hair || card.getAttribute('data-hair') === hair;
            const matchWeight = !weight || card.getAttribute('data-weight') === weight;
            const matchHeight = !height || card.getAttribute('data-height') === height;
            if (matchHair && matchWeight && matchHeight) {
                card.style.display = '';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    }

    [hairFilter, weightFilter, heightFilter].forEach(filter => {
        filter.addEventListener('change', filterModels);
    });

    // Modal
    const modal = document.getElementById('modelModal');
    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalBio = document.getElementById('modalBio');
    const closeBtn = document.querySelector('.modal .close');

    cards.forEach(card => {
        card.addEventListener('click', function() {
            modalImg.src = card.getAttribute('data-img');
            modalName.textContent = card.getAttribute('data-name');
            modalBio.textContent = card.getAttribute('data-bio');
            modal.style.display = 'flex';
            modal.classList.add('modal-fade-in');
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.remove('modal-fade-in');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('modal-fade-in');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    });
    // En tu main.js, al final del DOMContentLoaded:
document.querySelectorAll('.model-card').forEach(card => card.classList.add('fade-in'));
});