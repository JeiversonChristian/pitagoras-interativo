document.addEventListener('DOMContentLoaded', () => {
    const simuladorArea = document.getElementById('area-simulador');
    const seletorTernos = document.getElementById('ternos');
    const btnReiniciar = document.getElementById('reiniciar');
    const btnVoltar = document.querySelector('.btn-voltar');

    let u = 35; 
    let elementoArrastado = null;
    let slotOrigem = null; 
    let metaVitoria = 0; // Guardará o número de peças para ganhar

    // --- MÁGICA DOS SONS (Web Audio API) ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function initAudio() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function tocarSom(frequencia, tipo = 'sine', duracao = 0.1, volume = 0.1) {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = tipo;
        osc.frequency.setValueAtTime(frequencia, audioCtx.currentTime);
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracao);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duracao);
    }

    function tocarSomClique() { tocarSom(600, 'sine', 0.1); }
    function tocarSomPegar() { tocarSom(400, 'triangle', 0.1); }
    function tocarSomSoltar() { tocarSom(800, 'sine', 0.15); }
    function tocarSomSucesso() {
        // Toca uma musiquinha de vitória rápida (Arpejo)
        setTimeout(() => tocarSom(523.25, 'triangle', 0.2, 0.2), 0);
        setTimeout(() => tocarSom(659.25, 'triangle', 0.2, 0.2), 150);
        setTimeout(() => tocarSom(783.99, 'triangle', 0.2, 0.2), 300);
        setTimeout(() => tocarSom(1046.50, 'triangle', 0.4, 0.2), 450);
    }
    // ---------------------------------------

    function desenharBrinquedo(a, b, c) {
        simuladorArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'container-teorema';
        
        metaVitoria = c * c; // Define quantas peças a hipotenusa precisa

        const isMobile = window.innerWidth <= 768;
        let fontSizeRotulo, fontSizeValores;

        if (isMobile) {
            u = (window.innerWidth * 0.85) / (a + b + c); 
            if(u > 35) u = 35; 
            
            fontSizeRotulo = Math.max(9, u * 0.6); 
            fontSizeValores = Math.max(14, u * 0.8);
            
            container.style.width = `${b * u}px`;
            container.style.height = `${a * u}px`;
            container.style.transform = `translate(${a * u / 2}px, ${(c * u) / 4}px)`;
        } else {
            u = Math.min((window.innerWidth * 0.7) / (a + b + c), (window.innerHeight * 0.6) / (a + b + c));
            if(u > 45) u = 45;
            
            fontSizeRotulo = 16; 
            fontSizeValores = 24; 
            
            container.style.transform = `translate(${a*u/2}px, -${a*u/2}px)`;
        }
        
        const anguloRad = Math.atan2(a, b);
        const angulo = anguloRad * (180 / Math.PI);

        const triangulo = document.createElement('div');
        triangulo.style.position = 'absolute';
        triangulo.style.width = `${b * u}px`;
        triangulo.style.height = `${a * u}px`;
        triangulo.style.left = '0px';
        triangulo.style.top = '0px';
        triangulo.innerHTML = `<svg width="100%" height="100%" style="display: block; overflow: visible;"><polygon points="0,0 0,${a*u} ${b*u},${a*u}" fill="#64b5f6" stroke="#333" stroke-width="2"/></svg>`;

        const margemA = isMobile ? (u * 0.5) : 20;
        const margemB = isMobile ? (u * 0.5) : 15;
        const margemC = isMobile ? (u * 0.6) : 20;

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

        const quadC = criarCaixaGrid(c, c, u, `0px`, `-${c * u}px`, angulo);
        quadC.style.transformOrigin = "bottom left";
        quadC.id = "quadrado-hipotenusa"; // Identificador para checar a vitória
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

        tocarSomPegar(); // Toca som ao pegar

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
            tocarSomSoltar(); // Toca som ao encaixar certo
            
            // Verifica se o usuário ganhou
            setTimeout(() => {
                const pecasNaHipotenusa = document.querySelectorAll('#quadrado-hipotenusa .quadradinho').length;
                if (pecasNaHipotenusa === metaVitoria) {
                    tocarSomSucesso();
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 }
                    });
                }
            }, 50);

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

    // Eventos dos botões com sons
    seletorTernos.addEventListener('change', () => {
        tocarSomClique();
        initSimulation();
    });

    btnReiniciar.addEventListener('click', () => {
        tocarSomClique();
        initSimulation();
    });

    btnVoltar.addEventListener('click', function(e) {
        e.preventDefault();
        tocarSomClique();
        setTimeout(() => window.location.href = this.href, 150);
    });
    
    window.addEventListener('resize', initSimulation);

    initSimulation();
});