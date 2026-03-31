// =============================================
// QUE NO SE PUDRA — Script
// =============================================

// --- Recipe Data (se queda en JS) ---
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

// --- Supabase: categorías de ingredientes ---
const CATEGORY_LABELS = {
    proteinas: '🥩 Proteínas',
    verduras:  '🥦 Verduras',
    bases:     '🌾 Bases',
};
const CATEGORY_ORDER = ['proteinas', 'verduras', 'bases'];

// --- Cargar ingredientes desde Supabase ---
async function loadIngredients() {
    const grid    = document.getElementById('ingredient-grid');
    const loading = document.getElementById('ingredients-loading');

    const { data, error } = await db
        .from('ingredients')
        .select('*')
        .order('category')
        .order('name');

    loading.remove();

    if (error) {
        grid.innerHTML = '<p class="ingredients-error">⚠️ No se pudieron cargar los ingredientes. Revisá la conexión con Supabase.</p>';
        console.error('Supabase error:', error.message);
        return;
    }

    // Agrupar por categoría
    const byCategory = {};
    data.forEach(ing => {
        if (!byCategory[ing.category]) byCategory[ing.category] = [];
        byCategory[ing.category].push(ing);
    });

    // Renderizar en el orden definido
    CATEGORY_ORDER.forEach(cat => {
        if (!byCategory[cat]) return;
        const section = document.createElement('div');
        section.className = 'ingredient-category';
        section.innerHTML = `
            <h3 class="category-title">${CATEGORY_LABELS[cat] || cat}</h3>
            <div class="pills-row">
                ${byCategory[cat].map(ing =>
                    `<button class="pill" data-ingredient="${ing.name}">${ing.emoji} ${ing.name}</button>`
                ).join('')}
            </div>
        `;
        grid.appendChild(section);
    });

    // Agregar listeners a las pills generadas
    grid.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => pill.classList.toggle('active'));
    });
}

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

    const resultados      = document.getElementById('resultados');
    const seccionPosibles = document.getElementById('seccion-posibles');
    const seccionCasi     = document.getElementById('seccion-casi');
    const gridPosibles    = document.getElementById('recetas-posibles');
    const gridCasi        = document.getElementById('recetas-casi');
    const vacio           = document.getElementById('resultado-vacio');

    resultados.classList.remove('hidden');

    if (canMake.length === 0 && almostMake.length === 0) {
        seccionPosibles.classList.add('hidden');
        seccionCasi.classList.add('hidden');
        vacio.classList.remove('hidden');
        return;
    }

    vacio.classList.add('hidden');

    if (canMake.length > 0) {
        seccionPosibles.classList.remove('hidden');
        gridPosibles.innerHTML = canMake.map(({ recipe }) => renderRecipeCard(recipe, [])).join('');
    } else {
        seccionPosibles.classList.add('hidden');
    }

    if (almostMake.length > 0) {
        seccionCasi.classList.remove('hidden');
        gridCasi.innerHTML = almostMake.map(({ recipe, missing }) => renderRecipeCard(recipe, missing)).join('');
    } else {
        seccionCasi.classList.add('hidden');
    }

    resultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearSelection() {
    document.querySelectorAll('.pill.active').forEach(pill => pill.classList.remove('active'));
    document.getElementById('resultados').classList.add('hidden');
}

// --- Recipe Filter Logic (static grid) ---

function initFilters() {
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('#receta-grid-static .recipe-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            recipeCards.forEach(card => {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                    return;
                }

                const shouldShow = filter === 'fast'    ? card.dataset.time === 'fast'
                                 : filter === 'few'     ? card.dataset.ingredients === 'few'
                                 : filter === 'one-pan' ? card.dataset.pans === 'one-pan'
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
        header.classList.toggle('scrolled', window.scrollY > 60);
    });
}

// --- Auth ---

let authMode = 'login';

function openAuthModal() {
    document.getElementById('auth-modal').removeAttribute('aria-hidden');
    document.getElementById('auth-email').focus();
}

function closeAuthModal() {
    document.getElementById('auth-modal').setAttribute('aria-hidden', 'true');
    document.getElementById('auth-form').reset();
    const errorEl = document.getElementById('auth-error');
    errorEl.hidden = true;
}

function setAuthMode(mode) {
    authMode = mode;
    const title    = document.getElementById('auth-modal-title');
    const submit   = document.getElementById('auth-submit');
    const toggleP  = document.querySelector('.auth-toggle');
    if (mode === 'login') {
        title.textContent  = 'Entrar';
        submit.textContent = 'Entrar';
        toggleP.innerHTML  = '¿No tenés cuenta? <button type="button" id="auth-toggle-btn">Registrate</button>';
    } else {
        title.textContent  = 'Crear cuenta';
        submit.textContent = 'Registrarme';
        toggleP.innerHTML  = '¿Ya tenés cuenta? <button type="button" id="auth-toggle-btn">Entrar</button>';
    }
    document.getElementById('auth-toggle-btn').addEventListener('click', () => {
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
    });
}

function updateAuthUI(user) {
    const btnAuth  = document.getElementById('btn-auth');
    const userBadge = document.getElementById('user-badge');
    const userEmail = document.getElementById('user-email');
    if (user) {
        btnAuth.hidden     = true;
        userBadge.hidden   = false;
        userEmail.textContent = user.email;
    } else {
        btnAuth.hidden     = false;
        userBadge.hidden   = true;
    }
}

function translateAuthError(msg) {
    if (msg.includes('Invalid login credentials'))   return 'Correo o contraseña incorrectos.';
    if (msg.includes('Email not confirmed'))          return 'Confirmá tu correo antes de entrar.';
    if (msg.includes('User already registered'))      return 'Este correo ya está registrado.';
    if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
    return 'Ocurrió un error. Intentá de nuevo.';
}

function initAuth() {
    db.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session?.user ?? null);
    });

    db.auth.onAuthStateChange((_event, session) => {
        updateAuthUI(session?.user ?? null);
        if (session) closeAuthModal();
    });

    document.getElementById('btn-auth').addEventListener('click', openAuthModal);
    document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);
    document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAuthModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAuthModal();
    });

    document.getElementById('auth-toggle-btn').addEventListener('click', () => {
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
    });

    document.getElementById('btn-logout').addEventListener('click', async () => {
        await db.auth.signOut();
    });

    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const submit   = document.getElementById('auth-submit');
        const errorEl  = document.getElementById('auth-error');

        submit.disabled    = true;
        submit.textContent = authMode === 'login' ? 'Entrando...' : 'Registrando...';
        errorEl.hidden     = true;

        const result = authMode === 'login'
            ? await db.auth.signInWithPassword({ email, password })
            : await db.auth.signUp({ email, password });

        submit.disabled    = false;
        submit.textContent = authMode === 'login' ? 'Entrar' : 'Registrarme';

        if (result.error) {
            errorEl.textContent = translateAuthError(result.error.message);
            errorEl.hidden      = false;
        }
    });
}

// --- Init ---

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargar ingredientes desde Supabase (esperar antes de continuar)
    await loadIngredients();

    // 2. Botón "Ver recetas"
    document.getElementById('btn-ver-recetas').addEventListener('click', renderResults);

    // 3. Botón "Limpiar selección"
    document.getElementById('btn-limpiar').addEventListener('click', () => {
        clearSelection();
        document.getElementById('pills-otros').innerHTML = '';
        document.getElementById('categoria-otros').style.display = 'none';
    });

    // 4. Input de texto para agregar ingredientes
    const inputIngrediente = document.getElementById('input-ingrediente');
    const btnAgregar       = document.getElementById('btn-agregar-ingrediente');

    function agregarIngrediente() {
        const valor = inputIngrediente.value.trim().toLowerCase();
        if (!valor) return;

        const pillExistente = document.querySelector(`.pill[data-ingredient="${valor}"]`);
        if (pillExistente) {
            pillExistente.classList.add('active');
            pillExistente.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
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
    inputIngrediente.addEventListener('keydown', e => {
        if (e.key === 'Enter') agregarIngrediente();
    });

    // 5. Filtros de recetas y scroll del header
    initFilters();
    initScroll();

    // 6. Auth
    initAuth();
});
