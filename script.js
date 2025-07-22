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
            character.innerHTML = `
                <div class="character-top">
                    <img src="${imgSrc}" alt="Token do personagem">
                    <div class="name-and-pv">
                        <h2>${name}</h2>
                        <span class="pv">${pvMax}</span>
                        <button class="btn-pvtemp">${pvTemp}</button>
                        <button class="btn-load">${load}</button>
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

        character.querySelector('.btn-load').addEventListener('click', () => {
            selectedCharacter = character;
            openFormLoad();
        });

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
        const newLoad = parseFloat(this.load.value);
        if (selectedCharacter) {
            selectedCharacter.querySelector('.btn-load').textContent = newLoad;
        }
        closeFormLoad();
    })

    // DAMAGE (PV Temporários primeiro)
    document.querySelector('#damageForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        let dmg = parseInt(this.damage.value);
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

            // Caso o atributo ainda não exista, define o valor atual como PV máximo inicial
            if (isNaN(pvMax)) {
                pvMax = pv;
                selectedCharacter.setAttribute('data-pvmax', pvMax);
            }

            // Aumenta os PVs sem ultrapassar o máximo
            pv = Math.min(pv + heal, pvMax);
            pvElement.textContent = pv;
        }
        closeFormHeal();
    });

    // Aplica os handlers nos personagens padrão já renderizados
    document.querySelectorAll('.character').forEach(character => {
        attachHandlers(character);
    });
});

function openForm() {
    document.getElementById("createForm").style.display = "block";
}

function closeForm() {
    document.getElementById("createForm").style.display = "none";
}

function openFormPvTemp() {
    document.getElementById("pvtempForm").style.display = "block";
}

function closeFormPvTemp() {
    document.getElementById("pvtempForm").style.display = "none";
}

function openFormPvMax() {
    document.getElementById("pvmaxForm").style.display = "block";
}

function closeFormPvMax() {
    document.getElementById("pvmaxForm").style.display = "none";
}

function openFormLoad () {
    document.getElementById("loadForm").style.display = "block";
}

function closeFormLoad () {
    document.getElementById("loadForm").style.display = "none";
}

function openFormDamage() {
    document.getElementById("damageForm").style.display = "block";
}

function closeFormDamage() {
    document.getElementById("damageForm").style.display = "none";
}

function openFormHeal() {
    document.getElementById("healForm").style.display = "block";
}

function closeFormHeal() {
    document.getElementById("healForm").style.display = "none";
}
