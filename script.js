document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    new Sortable(document.querySelector('.content-container'), {
        animation: 150,
        ghostClass: 'sortable-ghost',
    });

    const charactersContainer = document.querySelector('.content-container');
    let selectedCharacter = null;

    const fileInput = document.getElementById('token');
    const fileNameDisplay = document.getElementById('file-name');

    fileInput.addEventListener('change', function () {
        fileNameDisplay.textContent = this.files.length > 0 ? this.files[0].name : "Nenhum arquivo escolhido";
    });

    // Função para verificar sobrecarga com regras de cor
    function checkLoadStatus(character) {
        const loadButton = character.querySelector('.btn-load');
        if (!loadButton) return;

        const currentLoad = parseFloat(loadButton.textContent.replace(" Kg", ""));
        const maxLoad = parseFloat(character.getAttribute('data-loadmax'));

        if (!isNaN(currentLoad) && !isNaN(maxLoad)) {
            const limiteAmarelo = maxLoad + (maxLoad / 2);
            const limiteLaranja = maxLoad * 2;

            if (currentLoad > limiteLaranja) {
                loadButton.style.color = "red";
            } else if (currentLoad > limiteAmarelo) {
                loadButton.style.color = "orange";
            } else if (currentLoad > maxLoad) {
                loadButton.style.color = "gold";
            } else {
                loadButton.style.color = ""; // cor padrão
            }
        }
    }

    // Adicionar personagem
    document.querySelector('#createForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = this.name.value;
        const pvMax = parseInt(this['pv-max'].value);
        const pvTemp = parseInt(this['pv-temp'].value);
        const load = parseFloat(this['load'].value);
        const loadMax = parseFloat(this['load-max'].value);
        const tokenFile = this.token.files[0];

        const reader = new FileReader();
        reader.onload = function (e) {
            const imgSrc = tokenFile ? e.target.result : 'assets/token.jpeg';

            const character = document.createElement('div');
            character.className = 'character';
            character.setAttribute('data-pvmax', pvMax);

            // Armazena a carga máxima no personagem
            if (!isNaN(loadMax)) {
                character.setAttribute('data-loadmax', loadMax);
            }

            // Verifica se os valores de carga foram informados
            const loadButtonHTML = (!isNaN(load) && !isNaN(loadMax))
                ? `<button class="btn-load">${load} Kg</button>`
                : "";

            character.innerHTML = `
                <div class="character-top">
                    <img src="${imgSrc}" alt="Token do personagem">
                    <div class="name-and-pv">
                        <h2>${name}</h2>
                        <span class="pv">${pvMax}</span>
                        <button class="btn-pvtemp">${pvTemp}</button>
                        ${loadButtonHTML}
                    </div>
                </div>
                <div class="character-buttons">
                    <button class="character-button" data-action="damage"><i data-lucide="sword" class="icon"></i></button>
                    <button class="character-button" data-action="heal"><i data-lucide="heart-plus" class="icon"></i></button>
                    <button class="character-checkbox"><i data-lucide="eye-closed" class="icon"></i></button>
                    <button class="character-checkbox"><i data-lucide="skull" class="icon"></i></button>
                    <button class="character-checkbox"><i data-lucide="sparkles" class="icon"></i></button>
                </div>
            `;

            charactersContainer.appendChild(character);
            lucide.createIcons();

            // Verifica sobrecarga logo após criar
            checkLoadStatus(character);

            closeForm();
            attachHandlers(character);
        };

        if (tokenFile) {
            reader.readAsDataURL(tokenFile);
        } else {
            reader.onload({ target: { result: 'assets/token.png' } });
        }

        this.reset();
    });

    // Remoção de personagem
    document.querySelector('.delete-button').addEventListener('click', () => {
        charactersContainer.classList.toggle('select-to-delete');
        charactersContainer.querySelectorAll('.character').forEach(character => {
            character.classList.toggle('click-to-delete');
            character.onclick = () => {
                if (charactersContainer.classList.contains('select-to-delete')) {
                    character.remove();
                }
            };
        });
    });

    // Funções auxiliares
    function attachHandlers(character) {
        character.querySelector('[data-action="damage"]').addEventListener('click', () => {
            selectedCharacter = character;
            openFormDamage();
        });
        character.querySelector('[data-action="heal"]').addEventListener('click', () => {
            selectedCharacter = character;
            openFormHeal();
        });
        character.querySelector('.btn-pvtemp').addEventListener('click', () => {
            selectedCharacter = character;
            openFormPvTemp();
        });

        character.querySelector('.pv').addEventListener('click', () => {
            selectedCharacter = character;
            openFormPvMax();
        });

        const loadButton = character.querySelector('.btn-load');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                selectedCharacter = character;
                openFormLoad();
            });
        }

        character.querySelectorAll('.character-checkbox').forEach(btn => {
            btn.addEventListener('click', function () {
                this.classList.toggle('active');
            });
        });
    }

    // PV TEMP
    document.querySelector('#pvtempForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const newPVTemp = parseInt(this.pvtemp.value);
        if (selectedCharacter) {
            selectedCharacter.querySelector('.btn-pvtemp').textContent = newPVTemp;
        }
        closeFormPvTemp();
    });

    // EDITAR PV MÁXIMO
    document.querySelector('#pvmaxForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const newPVMax = parseInt(this.pvmax.value);
        if (selectedCharacter) {
            selectedCharacter.querySelector('.pv').textContent = newPVMax;
            selectedCharacter.setAttribute('data-pvmax', newPVMax);
        }
        closeFormPvMax();
    });

    // EDITAR CARGA ATUAL
    document.querySelector('#loadForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const loadValue = parseFloat(this.load.value);
        const action = this.loadAction.value; // "add" ou "remove"

        if (selectedCharacter) {
            const loadButton = selectedCharacter.querySelector('.btn-load');
            let currentLoad = parseFloat(loadButton.textContent.replace(" Kg", ""));

            if (action === "add") {
                currentLoad += loadValue;
            } else {
                currentLoad = Math.max(0, currentLoad - loadValue);
            }

            loadButton.textContent = `${currentLoad} Kg`;
            checkLoadStatus(selectedCharacter); // Verifica sobrecarga após alterar
        }
        closeFormLoad();
    });

    // DAMAGE (PV Temporários primeiro)
    document.querySelector('#damageForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        let dmg = parseInt(this.damage.value);
        const isResistant = document.getElementById('resistanceCheckbox').checked;
        if (isResistant) {
            dmg = Math.floor(dmg / 2);
        }

        if (selectedCharacter) {
            const pvElement = selectedCharacter.querySelector('.pv');
            const pvTempElement = selectedCharacter.querySelector('.btn-pvtemp');

            let pv = parseInt(pvElement.textContent);
            let pvTemp = parseInt(pvTempElement.textContent);

            // Primeiro desconta dos PV temporários
            if (pvTemp > 0) {
                const usedTemp = Math.min(dmg, pvTemp);
                pvTemp -= usedTemp;
                dmg -= usedTemp;
            }

            // Depois, se ainda houver dano, desconta dos PV normais
            if (dmg > 0) {
                pv = Math.max(0, pv - dmg);
            }

            // Atualiza os valores na tela
            pvElement.textContent = pv;
            pvTempElement.textContent = pvTemp;
        }
        closeFormDamage();
    });

    // HEAL (Apenas PV normal, limitado ao PV máximo)
    document.querySelector('#healForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const heal = parseInt(this.heal.value);
        if (selectedCharacter) {
            const pvElement = selectedCharacter.querySelector('.pv');
            let pv = parseInt(pvElement.textContent);

            // Definir o PV máximo do personagem (armazenado no atributo data-pvmax)
            let pvMax = parseInt(selectedCharacter.getAttribute('data-pvmax'));

            if (isNaN(pvMax)) {
                pvMax = pv;
                selectedCharacter.setAttribute('data-pvmax', pvMax);
            }

            pv = Math.min(pv + heal, pvMax);
            pvElement.textContent = pv;
        }
        closeFormHeal();
    });

    const personagensPadrao = document.querySelectorAll('.character');

    // Definindo valores individuais
    if (personagensPadrao[0]) personagensPadrao[0].setAttribute('data-loadmax', 112.5);  // Elezara
    if (personagensPadrao[1]) personagensPadrao[1].setAttribute('data-loadmax', 90);     // Powder
    if (personagensPadrao[2]) personagensPadrao[2].setAttribute('data-loadmax', 105);    // Bellarosh

    // **Novo trecho para ajustar o PV inicial**
    personagensPadrao.forEach(character => {
        const pvMax = parseInt(character.getAttribute('data-pvmax'));
        const pvElement = character.querySelector('.pv');
        if (!isNaN(pvMax)) {
            pvElement.textContent = pvMax;
        }
    });

    // Continua com os handlers e checagem de carga
    personagensPadrao.forEach(character => {
        checkLoadStatus(character);
        attachHandlers(character);
    });
});

// Funções de abrir/fechar formulários
function openForm() { document.getElementById("createForm").style.display = "block"; }
function closeForm() { document.getElementById("createForm").style.display = "none"; }
function openFormPvTemp() { document.getElementById("pvtempForm").style.display = "block"; }
function closeFormPvTemp() { document.getElementById("pvtempForm").style.display = "none"; }
function openFormPvMax() { document.getElementById("pvmaxForm").style.display = "block"; }
function closeFormPvMax() { document.getElementById("pvmaxForm").style.display = "none"; }
function openFormLoad() { document.getElementById("loadForm").style.display = "block"; }
function closeFormLoad() { document.getElementById("loadForm").style.display = "none"; }
function openFormDamage() { document.getElementById("damageForm").style.display = "block"; }
function closeFormDamage() { document.getElementById("damageForm").style.display = "none"; }
function openFormHeal() { document.getElementById("healForm").style.display = "block"; }
function closeFormHeal() { document.getElementById("healForm").style.display = "none"; }
