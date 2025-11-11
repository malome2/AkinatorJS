const preguntas = [
    { key: "queso", text: "¿Tu producto tiene queso?" },
    { key: "postre", text: "¿Tu producto es un postre?" },
    { key: "helado", text: "¿Tu producto es un helado?" },
    { key: "cuchara", text: "¿Tu producto se sirve con cuchara?" },
    { key: "toping", text: "¿Tu producto tiene topping?" },
    { key: "pistacho", text: "¿Tu producto contiene pistacho?" },
    { key: "oreo", text: "¿Tu producto contiene Oreo?" },
    { key: "chocolateBlanco", text: "¿Tu producto contiene chocolate blanco?" },
    { key: "caramelo", text: "¿Tu producto contiene caramelo?" },
    { key: "kitKat", text: "¿Tu producto contiene KitKat?" },
    { key: "manzana", text: "¿Tu producto contiene manzana?" },
    { key: "caliente", text: "¿Tu producto se sirve caliente?" },
    { key: "niños", text: "¿Tu producto es del menú infantil?" },
    { key: "desayuno", text: "¿Tu producto es un desayuno?" },
    { key: "chocolate", text: "¿Tu producto contiene chocolate?" },
    { key: "galleta", text: "¿Tu producto es una galleta?" },
    { key: "hamburgesa", text: "¿Tu producto es una hamburguesa?" },
    { key: "bacon", text: "¿Tu producto contiene bacon?" },
    { key: "burrito", text: "¿Tu producto es un burrito?" },
    { key: "barbacoa", text: "¿Tu producto contiene salsa barbacoa?" },
    { key: "tomate", text: "¿Tu producto contiene tomate?" },
    { key: "lechuga", text: "¿Tu producto contiene lechuga?" },
    { key: "vaca", text: "¿Tu producto contiene carne de vaca?" },
    { key: "doble", text: "¿Tu producto tiene doble de carne?" },
    { key: "cebolla", text: "¿Tu producto contiene cebolla?" },
    { key: "pescado", text: "¿Tu producto contiene pescado?" },
    { key: "complemento", text: "¿Tu producto es un complemento?" },
    { key: "patata", text: "¿Tu producto contiene patata?" },
    { key: "corteFino", text: "¿Tu producto tiene corte fino?" },
    { key: "picante", text: "¿Tu producto es picante?" },
    { key: "hueso", text: "¿Tu producto contiene hueso?" },
    { key: "rebozado", text: "¿Tu producto está rebozado?" },
    { key: "alcohol", text: "¿Tu producto contiene alcohol?" },
    { key: "agua", text: "¿Tu producto es agua?" },
    { key: "gas", text: "¿Tu producto es con gas?" },
    { key: "zumo", text: "¿Tu producto es un zumo?" },
    { key: "naranja", text: "¿Tu producto contiene naranja?" },
    { key: "citrico", text: "¿Tu producto es cítrico?" },
    { key: "fanta", text: "¿Tu producto es Fanta?" }
];

let productos = [];
let preguntaActual = null;
let ronda = 0;
const RONDAS_MINIMAS = 4;
let productoPendiente = null; // guarda el producto que el juego ya sabe
const PROB_PREGUNTA_MALA = 0.15; // 15% de preguntas “sin sentido”

async function cargarProductos() {
    const response = await fetch("./docs/productos.json");
    productos = await response.json();
    console.log("Productos cargados:", productos);
}

window.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
    cambiarPregunta();
});

function obtenerPregunta(preguntas, productos) {
    // 🔹 Si ya sabemos el producto, solo hacemos preguntas aleatorias “de relleno”
    if (productoPendiente) {
        // Reiniciar si todas fueron usadas
        if (preguntas.every(p => p.usada)) {
            preguntas.forEach(p => p.usada = false);
        }

        const preguntasRestantes = preguntas.filter(p => !p.usada);
        const randomIndex = Math.floor(Math.random() * preguntasRestantes.length);
        const p = preguntasRestantes[randomIndex];
        p.usada = true;
        return p;
    }

    // 🔹 En cualquier otro caso:
    const preguntasRestantes = preguntas.filter(p => !p.usada);

    // Con probabilidad, pregunta “mala”
    if (Math.random() < PROB_PREGUNTA_MALA) {
        const randomIndex = Math.floor(Math.random() * preguntasRestantes.length);
        const p = preguntasRestantes[randomIndex];
        p.usada = true;
        return p;
    }

    // 🔹 Buscar preguntas que aún diferencien productos
    const preguntasValidas = preguntasRestantes.filter(p => {
        const valores = productos.map(prod => prod[p.key]);
        return new Set(valores).size > 1;
    });

    // Si no hay preguntas válidas, lanzar alguna aleatoria “de relleno”
    if (preguntasValidas.length === 0) {
        if (preguntasRestantes.length === 0) {
            preguntas.forEach(p => p.usada = false);
        }
        const restantes = preguntas.filter(p => !p.usada);
        const p = restantes[Math.floor(Math.random() * restantes.length)];
        p.usada = true;
        return p;
    }

    const indice = Math.floor(Math.random() * preguntasValidas.length);
    preguntasValidas[indice].usada = true;
    return preguntasValidas[indice];
}


function cambiarPregunta() {
    const contenedor = document.getElementById("pregunta");

    const nueva = obtenerPregunta(preguntas, productos);
    preguntaActual = nueva;
    contenedor.innerHTML = nueva.text;
}

function responder(valor) {
    if (!preguntaActual) return;
    ronda++;

    const contenedor = document.getElementById("pregunta");

    // Si ya tiene un producto pendiente, simplemente sigue preguntando hasta cumplir rondas
    if (productoPendiente) {
        if (ronda >= RONDAS_MINIMAS) {
            setTimeout(() => {
                contenedor.innerHTML = `¡Creo que estás pensando en <b>${productoPendiente.nombre}</b> 🍗!`;
            }, 800);
        } else {
            setTimeout(cambiarPregunta, 700);
        }
        return;
    }

    // Filtrar productos normalmente
    productos = productos.filter(p => p[preguntaActual.key] === valor);
    console.log(`Ronda ${ronda}:`, productos);

    // Si queda solo un producto, lo guardamos, pero seguimos preguntando
    if (productos.length === 1) {
        productoPendiente = productos[0];
        
        setTimeout(cambiarPregunta, 1000);
        return;
    }

    // Si no queda ninguno
    if (productos.length === 0) {
        contenedor.innerHTML = "😅 No encuentro ningún producto que coincida...";
        return;
    }

    // Si quedan varios, seguir preguntando
    setTimeout(cambiarPregunta, 700);
}


function abrirJuego(){
    window.location.href = "juego.html"
}