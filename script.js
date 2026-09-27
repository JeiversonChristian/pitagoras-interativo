document.addEventListener('DOMContentLoaded', () => {
    const simuladorArea = document.getElementById('area-simulador');
    const seletorTernos = document.getElementById('ternos');
    const btnReiniciar = document.getElementById('reiniciar');

    let u = 35; 
    let elementoArrastado = null;
    let slotOrigem = null; 

    function desenharBrinquedo(a, b, c) {
        simuladorArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'container-teorema';
        
        // Verifica se é celular (telas menores que 768px de largura)
        const isMobile = window.innerWidth <= 768;
        
        let fontSizeRotulo, fontSizeValores;

        if (isMobile) {
            // LÓGICA EXCLUSIVA PARA CELULAR
            // Usa (a + b + c) inteiro como divisor para garantir que NUNCA encoste nas bordas
            u = (window.innerWidth * 0.85) / (a + b + c); 
            if(u > 35) u = 35; // Teto máximo para não exagerar no 3,4,5
            
            // Fontes proporcionais ao tamanho da figura no celular para não vazar do triângulo
            fontSizeRotulo = Math.max(9, u * 0.6); 
            fontSizeValores = Math.max(14, u * 0.8);
            
            // Centralização específica para o eixo do celular (empurra um pouco para baixo)
            container.style.width = `${b * u}px`;
            container.style.height = `${a * u}px`;
            container.style.transform = `translate(${a * u / 2}px, ${(c * u) / 4}px)`;

        } else {
            // LÓGICA EXCLUSIVA PARA COMPUTADOR/TV (Mantida exatamente como estava antes)
            u = Math.min((window.innerWidth * 0.7) / (a + b + c), (window.innerHeight * 0.6) / (a + b + c));
            if(u > 45) u = 45;
            
            fontSizeRotulo = 16; // Fixo no PC
            fontSizeValores = 24; // Fixo no PC
            
            // Centralização original do PC
            container.style.transform = `translate(${a*u/2}px, -${a*u/2}px)`;
        }
        
        // Calculo da angulação (Trigonometria)
        const anguloRad = Math.atan2(a, b);
        const angulo = anguloRad * (180 / Math.PI);

        // Desenhando o triângulo
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

        // Distâncias de margem interna dos nomes (dinâmica no celular, fixa no PC)
        const margemA = isMobile ? (u * 0.5) : 20;
        const margemB = isMobile ? (u * 0.5) : 15;
        const margemC = isMobile ? (u * 0.6) : 20;

        // --- Nomes dos lados ---
        const lblCatetoA = document.createElement('div');
        lblCatetoA.className = 'rotulo';
        lblCatetoA.innerText = 'Cateto';
        lblCatetoA.style.fontSize = `${fontSizeRotulo}px`;
        lblCatetoA.style.left = `${margemA}px`; 
        lblCatetoA.style.top = `${a*u/2}px`;
        lblCatetoA.style.transform = 'translate(-50%, -50%) rotate(-90deg)';

        const lblCatetoB = document.createElement('div');
        lblCatetoB.className = 'rotulo';
        lblCatetoB.innerText = 'Cateto';
        lblCatetoB.style.fontSize = `${fontSizeRotulo}px`;
        lblCatetoB.style.left = `${b*u/2}px`;
        lblCatetoB.style.top = `${a*u - margemB}px`;
        lblCatetoB.style.transform = 'translate(-50%, -50%) rotate(0deg)';

        const lblHipo = document.createElement('div');
        lblHipo.className = 'rotulo';
        lblHipo.innerText = 'Hipotenusa';
        lblHipo.style.fontSize = `${fontSizeRotulo}px`;
        lblHipo.style.left = `${b*u/2 - margemC * Math.sin(anguloRad)}px`;
        lblHipo.style.top = `${a*u/2 - margemC * Math.cos(anguloRad)}px`;
        lblHipo.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;

        // --- Quadrados Menores ---
        const quadA = criarCaixaGrid(a, a, u, `-${a * u}px`, `0px`, 0);
        preencherGrid(quadA, a * a, 'vermelho');
        
        const valA = document.createElement('div');
        valA.className = 'valor-lado';
        valA.innerText = a;
        valA.style.fontSize = `${fontSizeValores}px`;
        valA.style.right = '100%';
        valA.style.top = '50%';
        valA.style.transform = 'translate(-10px, -50%)';
        quadA.appendChild(valA);

        const quadB = criarCaixaGrid(b, b, u, `0px`, `${a * u}px`, 0);
        preencherGrid(quadB, b * b, 'bege');

        const valB = document.createElement('div');
        valB.className = 'valor-lado';
        valB.innerText = b;
        valB.style.fontSize = `${fontSizeValores}px`;
        valB.style.top = '100%';
        valB.style.left = '50%';
        valB.style.transform = 'translate(-50%, 10px)';
        quadB.appendChild(valB);

        // --- Quadrado Maior (Hipotenusa) ---
        const quadC = criarCaixaGrid(c, c, u, `0px`, `-${c * u}px`, angulo);
        quadC.style.transformOrigin = "bottom left";
        preencherSlotsVazios(quadC, c * c);

        const valC = document.createElement('div');
        valC.className = 'valor-lado';
        valC.innerText = c;
        valC.style.fontSize = `${fontSizeValores}px`;
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

    function iniciarArraste(e) {
        if (!e.target.classList.contains('quadradinho')) return;
        e.preventDefault();

        elementoArrastado = e.target;
        slotOrigem = elementoArrastado.parentElement; 
        
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

        elementoArrastado.style.position = 'relative';
        elementoArrastado.style.left = '0';
        elementoArrastado.style.top = '0';
        elementoArrastado.style.width = '100%';
        elementoArrastado.style.height = '100%';

        if (elementoAbaixo && elementoAbaixo.classList.contains('slot-vazio') && elementoAbaixo.children.length === 0) {
            elementoAbaixo.appendChild(elementoArrastado);
        } else {
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
    
    // Recalcula o tamanho se o usuário girar a tela do celular ou redimensionar o navegador
    window.addEventListener('resize', initSimulation);

    initSimulation();
});