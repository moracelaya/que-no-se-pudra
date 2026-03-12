// =============================================
// QUE NO SE PUDRA — Script
// =============================================

// --- Recipe Data ---
const RECIPES = [
    {
        id: 1,
        name: 'Tortilla de papa',
        emoji: '🥚',
        ingredients: ['huevo', 'papa', 'cebolla'],
        time: 20,
        pans: 1,
        servings: 1,
    },
    {
        id: 2,
        name: 'Arroz salteado',
        emoji: '🍳',
        ingredients: ['arroz', 'huevo', 'cebolla'],
        time: 15,
        pans: 1,
        servings: 1,
    },
    {
        id: 3,
        name: 'Pasta con tomate',
        emoji: '🍝',
        ingredients: ['pasta', 'tomate', 'ajo'],
        time: 12,
        pans: 1,
        servings: 1,
    },
    {
        id: 4,
        name: 'Omelette de verduras',
        emoji: '🥕',
        ingredients: ['huevo', 'zanahoria', 'cebolla'],
        time: 10,
        pans: 1,
        servings: 1,
    },
    {
        id: 5,
        name: 'Shakshuka',
        emoji: '🍅',
        ingredients: ['huevo', 'tomate', 'cebolla', 'pimiento'],
        time: 20,
        pans: 1,
        servings: 1,
    },
    {
        id: 6,
        name: 'Arroz con pollo',
        emoji: '🍗',
        ingredients: ['arroz', 'pollo', 'cebolla', 'zanahoria'],
        time: 30,
        pans: 1,
        servings: 2,
    },
    {
        id: 7,
        name: 'Tostada con atún',
        emoji: '🐟',
        ingredients: ['pan', 'atún', 'tomate'],
        time: 5,
        pans: 0,
        servings: 1,
    },
    {
        id: 8,
        name: 'Pasta con atún',
        emoji: '🐟',
        ingredients: ['pasta', 'atún', 'tomate'],
        time: 15,
        pans: 1,
        servings: 1,
    },
    {
        id: 9,
        name: 'Huevos revueltos con queso',
        emoji: '🧀',
        ingredients: ['huevo', 'queso'],
        time: 5,
        pans: 1,
        servings: 1,
    },
    {
        id: 10,
        name: 'Wok de zanahoria',
        emoji: '🥕',
        ingredients: ['zanahoria', 'cebolla', 'arroz'],
        time: 15,
        pans: 1,
        servings: 1,
    },
];

// --- Ingredient Checklist Logic ---

function getSelectedIngredients() {
    const activePills = document.querySelectorAll('.pill.active');
    return Array.from(activePills).map(pill => pill.dataset.ingredient);
}

function matchRecipes(selected) {
    const canMake = [];
    const almostMake = [];

    if (selected.length === 0) return { canMake, almostMake };

    RECIPES.forEach(recipe => {
        const missing = recipe.ingredients.filter(ing => !selected.includes(ing));

        if (missing.length === 0) {
            canMake.push({ recipe, missing: [] });
        } else if (missing.length === 1) {
            almostMake.push({ recipe, missing });
        }
    });

    return { canMake, almostMake };
}

function renderRecipeCard(recipe, missing) {
    const isAlmost = missing && missing.length > 0;
    const cardClass = isAlmost ? 'result-card almost-make' : 'result-card can-make';
    const panLabel = recipe.pans === 0 ? 'sin cocción' : recipe.pans === 1 ? '1 sartén' : `${recipe.pans} sartenes`;
    const timeLabel = `${recipe.time} min`;
    const missingBadge = isAlmost
        ? `<span class="result-missing-badge">🛒 Te falta: ${missing[0]}</span>`
        : '';

    return `
        <div class="${cardClass}">
            <span class="result-card-emoji">${recipe.emoji}</span>
            <h4 class="result-card-name">${recipe.name}</h4>
            <p class="result-card-ingredients">${recipe.ingredients.join(' · ')}</p>
            ${missingBadge}
            <div class="result-card-meta">
                <span class="result-meta-item">⏱ ${timeLabel}</span>
                <span class="result-meta-item">🍳 ${panLabel}</span>
            </div>
        </div>
    `;
}

function renderResults() {
    const selected = getSelectedIngredients();
    const { canMake, almostMake } = matchRecipes(selected);

    const resultados = document.getElementById('resultados');
    const seccionPosibles = document.getElementById('seccion-posibles');
    const seccionCasi = document.getElementById('seccion-casi');
    const gridPosibles = document.getElementById('recetas-posibles');
    const gridCasi = document.getElementById('recetas-casi');
    const vacio = document.getElementById('resultado-vacio');

    // Show container
    resultados.classList.remove('hidden');

    if (canMake.length === 0 && almostMake.length === 0) {
        seccionPosibles.classList.add('hidden');
        seccionCasi.classList.add('hidden');
        vacio.classList.remove('hidden');
        return;
    }

    vacio.classList.add('hidden');

    // "Podés hacer" section
    if (canMake.length > 0) {
        seccionPosibles.classList.remove('hidden');
        gridPosibles.innerHTML = canMake.map(({ recipe }) => renderRecipeCard(recipe, [])).join('');
    } else {
        seccionPosibles.classList.add('hidden');
    }

    // "Casi podés hacer" section
    if (almostMake.length > 0) {
        seccionCasi.classList.remove('hidden');
        gridCasi.innerHTML = almostMake.map(({ recipe, missing }) => renderRecipeCard(recipe, missing)).join('');
    } else {
        seccionCasi.classList.add('hidden');
    }

    // Scroll to results
    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearSelection() {
    document.querySelectorAll('.pill.active').forEach(pill => pill.classList.remove('active'));
    document.getElementById('resultados').classList.add('hidden');
}

// --- Recipe Filter Logic (static grid) ---

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('#receta-grid-static .recipe-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            recipeCards.forEach(card => {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                    return;
                }

                const matchesTime = filter === 'fast' ? card.dataset.time === 'fast' : true;
                const matchesIngredients = filter === 'few' ? card.dataset.ingredients === 'few' : true;
                const matchesPans = filter === 'one-pan' ? card.dataset.pans === 'one-pan' : true;

                const shouldShow = filter === 'fast' ? matchesTime
                    : filter === 'few' ? matchesIngredients
                    : filter === 'one-pan' ? matchesPans
                    : true;

                card.classList.toggle('hidden', !shouldShow);
            });
        });
    });
}

// --- Header Scroll ---

function initScroll() {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
    // Pill toggle
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('active');
        });
    });

    // Ver recetas button
    document.getElementById('btn-ver-recetas').addEventListener('click', renderResults);

    // Limpiar selección button
    document.getElementById('btn-limpiar').addEventListener('click', () => {
        clearSelection();
        // Also remove custom pills
        document.getElementById('pills-otros').innerHTML = '';
        document.getElementById('categoria-otros').style.display = 'none';
    });

    // Text input for ingredients
    const inputIngrediente = document.getElementById('input-ingrediente');
    const btnAgregar = document.getElementById('btn-agregar-ingrediente');

    function agregarIngrediente() {
        const valor = inputIngrediente.value.trim().toLowerCase();
        if (!valor) return;

        // Check if it matches a predefined pill
        const pillExistente = document.querySelector(`.pill[data-ingredient="${valor}"]`);
        if (pillExistente) {
            pillExistente.classList.add('active');
            pillExistente.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            // Check if a custom pill for this ingredient already exists
            const yaExiste = document.querySelector(`#pills-otros .pill[data-ingredient="${valor}"]`);
            if (!yaExiste) {
                const pillNueva = document.createElement('button');
                pillNueva.className = 'pill active';
                pillNueva.dataset.ingredient = valor;
                pillNueva.textContent = `✏️ ${valor}`;
                pillNueva.addEventListener('click', () => pillNueva.classList.toggle('active'));
                document.getElementById('pills-otros').appendChild(pillNueva);
                document.getElementById('categoria-otros').style.display = '';
            } else {
                yaExiste.classList.add('active');
            }
        }

        inputIngrediente.value = '';
        inputIngrediente.focus();
    }

    btnAgregar.addEventListener('click', agregarIngrediente);
    inputIngrediente.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregarIngrediente();
    });

    // Recipe filters
    initFilters();

    // Header scroll
    initScroll();
});
