document.addEventListener('DOMContentLoaded', () => {
    const simuladorArea = document.getElementById('area-simulador');
    const seletorTernos = document.getElementById('ternos');
    const btnReiniciar = document.getElementById('reiniciar');

    let u = 35; // Tamanho base da unidade
    let elementoArrastado = null;
    let slotOrigem = null; // Vai guardar a "casa" original do quadradinho

    function desenharBrinquedo(a, b, c) {
        simuladorArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'container-teorema';
        
        // Ajusta escala baseada na tela
        u = Math.min((window.innerWidth * 0.7) / (a + b + c), (window.innerHeight * 0.6) / (a + b + c));
        if(u > 45) u = 45;
        
        // Calculo da angulação (Trigonometria)
        const anguloRad = Math.atan2(a, b);
        const angulo = anguloRad * (180 / Math.PI);

        // Desenhando o triângulo perfeitamente com SVG (Cor Azul Diferente: #64b5f6)
        const triangulo = document.createElement('div');
        triangulo.style.position = 'absolute';
        triangulo.style.width = `${b * u}px`;
        triangulo.style.height = `${a * u}px`;
        triangulo.style.left = '0px';
        triangulo.style.top = '0px';
        triangulo.innerHTML = `
            <svg width="100%" height="100%" style="display: block; overflow: visible;">
                <polygon points="0,0 0,${a*u} ${b*u},${a*u}" fill="#64b5f6" stroke="#333" stroke-width="2"/>
            </svg>
        `;

        // --- Nomes dos lados (Alinhados com a borda) ---
        const lblCatetoA = document.createElement('div');
        lblCatetoA.className = 'rotulo';
        lblCatetoA.innerText = 'Cateto';
        lblCatetoA.style.left = `20px`; // Levemente dentro do triângulo
        lblCatetoA.style.top = `${a*u/2}px`;
        lblCatetoA.style.transform = 'translate(-50%, -50%) rotate(-90deg)';

        const lblCatetoB = document.createElement('div');
        lblCatetoB.className = 'rotulo';
        lblCatetoB.innerText = 'Cateto';
        lblCatetoB.style.left = `${b*u/2}px`;
        lblCatetoB.style.top = `${a*u - 15}px`;
        lblCatetoB.style.transform = 'translate(-50%, -50%) rotate(0deg)';

        const lblHipo = document.createElement('div');
        lblHipo.className = 'rotulo';
        lblHipo.innerText = 'Hipotenusa';
        // Afasta um pouco o texto da borda perpendicularmente
        lblHipo.style.left = `${b*u/2 - 20 * Math.sin(anguloRad)}px`;
        lblHipo.style.top = `${a*u/2 - 20 * Math.cos(anguloRad)}px`;
        lblHipo.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;

        // --- Quadrados Menores ---
        const quadA = criarCaixaGrid(a, a, u, `-${a * u}px`, `0px`, 0);
        preencherGrid(quadA, a * a, 'vermelho');
        
        // Número do tamanho do Quadrado A (Fica à esquerda)
        const valA = document.createElement('div');
        valA.className = 'valor-lado';
        valA.innerText = a;
        valA.style.right = '100%';
        valA.style.top = '50%';
        valA.style.transform = 'translate(-15px, -50%)';
        quadA.appendChild(valA);

        const quadB = criarCaixaGrid(b, b, u, `0px`, `${a * u}px`, 0);
        preencherGrid(quadB, b * b, 'bege');

        // Número do tamanho do Quadrado B (Fica abaixo)
        const valB = document.createElement('div');
        valB.className = 'valor-lado';
        valB.innerText = b;
        valB.style.top = '100%';
        valB.style.left = '50%';
        valB.style.transform = 'translate(-50%, 10px)';
        quadB.appendChild(valB);

        // --- Quadrado Maior (Hipotenusa) ---
        const quadC = criarCaixaGrid(c, c, u, `0px`, `-${c * u}px`, angulo);
        quadC.style.transformOrigin = "bottom left";
        preencherSlotsVazios(quadC, c * c);

        // Número do tamanho do Quadrado C (Fica acima, acompanhando a rotação)
        const valC = document.createElement('div');
        valC.className = 'valor-lado';
        valC.innerText = c;
        valC.style.bottom = '100%';
        valC.style.left = '50%';
        valC.style.transform = 'translate(-50%, -10px)';
        quadC.appendChild(valC);

        container.appendChild(triangulo);
        container.appendChild(lblCatetoA);
        container.appendChild(lblCatetoB);
        container.appendChild(lblHipo);
        container.appendChild(quadA);
        container.appendChild(quadB);
        container.appendChild(quadC);
        
        // Centraliza a figura no meio da tela
        container.style.transform = `translate(${a*u/2}px, -${a*u/2}px)`;
        simuladorArea.appendChild(container);
    }

    function criarCaixaGrid(cols, rows, size, left, top, angle) {
        const caixa = document.createElement('div');
        caixa.className = 'caixa-quadrado';
        caixa.style.width = `${cols * size}px`;
        caixa.style.height = `${rows * size}px`;
        caixa.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        caixa.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        caixa.style.left = left;
        caixa.style.top = top;
        if (angle) caixa.style.transform = `rotate(${angle}deg)`;
        return caixa;
    }

    // Agora criamos um slot vazio e botamos o quadradinho dentro, para evitar bugs na devolução!
    function preencherGrid(caixa, quantidade, corClass) {
        for (let i = 0; i < quantidade; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot-vazio';
            
            const div = document.createElement('div');
            div.className = `quadradinho ${corClass}`;
            div.addEventListener('pointerdown', iniciarArraste);
            
            slot.appendChild(div);
            caixa.appendChild(slot);
        }
    }

    function preencherSlotsVazios(caixa, quantidade) {
        for (let i = 0; i < quantidade; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot-vazio';
            caixa.appendChild(slot);
        }
    }

    // --- Lógica de Arraste à Prova de Bugs ---
    function iniciarArraste(e) {
        if (!e.target.classList.contains('quadradinho')) return;
        e.preventDefault();

        elementoArrastado = e.target;
        slotOrigem = elementoArrastado.parentElement; // Guarda de onde ele saiu!
        
        // Trava o tamanho enquanto arrasta
        elementoArrastado.style.width = `${u}px`;
        elementoArrastado.style.height = `${u}px`;
        elementoArrastado.style.position = 'fixed';
        elementoArrastado.style.zIndex = '1000';
        
        document.body.appendChild(elementoArrastado);
        moverElemento(e);

        document.addEventListener('pointermove', moverElemento);
        document.addEventListener('pointerup', soltarElemento);
    }

    function moverElemento(e) {
        if (!elementoArrastado) return;
        elementoArrastado.style.left = `${e.clientX - u / 2}px`;
        elementoArrastado.style.top = `${e.clientY - u / 2}px`;
    }

    function soltarElemento(e) {
        document.removeEventListener('pointermove', moverElemento);
        document.removeEventListener('pointerup', soltarElemento);

        if (!elementoArrastado) return;

        elementoArrastado.style.display = 'none';
        const elementoAbaixo = document.elementFromPoint(e.clientX, e.clientY);
        elementoArrastado.style.display = 'block';

        // Reseta o estilo para ocupar 100% do novo slot
        elementoArrastado.style.position = 'relative';
        elementoArrastado.style.left = '0';
        elementoArrastado.style.top = '0';
        elementoArrastado.style.width = '100%';
        elementoArrastado.style.height = '100%';

        // Verifica se soltou exatamente dentro de um slot vazio válido
        if (elementoAbaixo && elementoAbaixo.classList.contains('slot-vazio') && elementoAbaixo.children.length === 0) {
            elementoAbaixo.appendChild(elementoArrastado);
        } else {
            // Se soltou fora ou num lugar inválido, DEVOLVE para a casinha original!
            if (slotOrigem) {
                slotOrigem.appendChild(elementoArrastado);
            }
        }

        elementoArrastado = null;
        slotOrigem = null;
    }

    function initSimulation() {
        const valores = seletorTernos.value.split(',').map(Number);
        desenharBrinquedo(valores[0], valores[1], valores[2]);
    }

    seletorTernos.addEventListener('change', initSimulation);
    btnReiniciar.addEventListener('click', initSimulation);
    window.addEventListener('resize', initSimulation);

    initSimulation();
});