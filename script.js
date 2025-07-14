document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

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
        const tokenFile = this.token.files[0];

        const reader = new FileReader();
        reader.onload = function (e) {
            const imgSrc = tokenFile ? e.target.result : 'assets/token.jpeg';

            const character = document.createElement('div');
            character.className = 'character';
            character.innerHTML = `
                <div class="character-top">
                    <img src="${imgSrc}" alt="Token do personagem">
                    <div class="name-and-pv">
                        <h2>${name}</h2>
                        <span class="pv">${pvMax}</span>
                        <button class="btn-pvtemp">${pvTemp}</button>
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
            reader.onload({ target: { result: 'assets/token.jpeg' } });
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
        }
        closeFormPvMax();
    });

    // DAMAGE
    document.querySelector('#damageForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const dmg = parseInt(this.damage.value);
        if (selectedCharacter) {
            const pv = selectedCharacter.querySelector('.pv');
            pv.textContent = Math.max(0, parseInt(pv.textContent) - dmg);
        }
        closeFormDamage();
    });

    // HEAL
    document.querySelector('#healForm form').addEventListener('submit', function (e) {
        e.preventDefault();
        const heal = parseInt(this.heal.value);
        if (selectedCharacter) {
            const pv = selectedCharacter.querySelector('.pv');
            pv.textContent = parseInt(pv.textContent) + heal;
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
