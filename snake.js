;
/****************************************
//variables globales para los objetos SVG
*/
//tamaño del espacio del juego
var widthGame = 600,
    heightGame = 500;
//posición inicial de la serpiente
var xSnakePosition = 300,
    ySnakePosition = 250;
//cuenta actual y la mejor cuenta
var numberScore = 0;
var bestNumberScore = localStorage.getItem('bestNumberScore');
if (bestNumberScore <= 0) bestNumberScore = 0;
//el diámetro de la cabeza de la serpiente
var sizeHeadSnake = 20;
//el tamaño de la parte de la cola
var sizeTailSnake = 16;
//la pisición actual de la comida
var xFoodPosition, yFoodPosition;
//el tamaño de la comida
var sizeFood = 16;
/*********************************
//defenición del objetos dibujados
*/
var draw = SVG('snakegame');

//area del juego
var rect = draw.rect(widthGame, heightGame)
    .fill('#EAFFF3').stroke({ width: 3, color: '#BD6601' });

//información textual a la derecha
var textScore = draw.text('Score: ' + numberScore)
    .move(widthGame + 20, 10)
    .font({
        family: 'Helvetica',
        size: 18,
    });

var bestTextScore = textScore.clone()
    .move(widthGame + 20, 100)
    .text('Best Score: ' + bestNumberScore)
    .font({
        fill: '#0A9F27'
    });

var textControl = textScore.clone()
    .move(widthGame + 20, 200)
    .text(function(add) {
        add.tspan('Controls: ');
        add.tspan('- Arrow Left').newLine();
        add.tspan('- Arrow Up').newLine();
        add.tspan('- Arrow Right').newLine();
        add.tspan('- Arrow Down').newLine();
    });

//la cabeza de la serpiente
var headSnake = draw.circle(sizeHeadSnake)
    .center(xSnakePosition, ySnakePosition)
    .fill('#F8E640');

//gradient linear para la cola
var tailGradient = draw.gradient('linear', function(limits) {
    limits.at(0, '#C2FF27');
    limits.at(0.5, '#31EF0F');
    limits.at(1, '#00752C');
});

//parte de cola
var tailPart = draw.circle(sizeTailSnake)
    .fill(tailGradient).hide();

//pattern para crear la comida
var pattern = draw.pattern(10, 10, function(add) {
    add.rect(10, 10).fill('#f06');
    add.rect(5, 5).fill('#FFBB00');
    add.rect(5, 5).move(5, 5).fill('#0085C2');
});

//comida
var food = draw.defs().circle(sizeFood)
    .fill(pattern);

/*********************************
//variables globales para el juego
*/
var set = draw.set();
var pxMove = 10;
var speedAnimation = 150;

//la dirección al inicio del juego
var xAxis = false;
var yAxis = true;
var xDif = 0;
var yDif = -pxMove;

/********************
//la lógica del juego
*/
set.add(headSnake);

//la función para crear una comida en la posición aleatoria
function createRandomFood() {
    //aleatoriamente creamos una comida en el espacio
    xFoodPosition = Math.floor(Math.random() * (widthGame - sizeFood)) + sizeFood / 2;
    yFoodPosition = Math.floor(Math.random() * (heightGame - sizeFood)) + sizeFood / 2;
    draw.use(food.center(xFoodPosition, yFoodPosition));
    console.log('La comida había creada!');
}

//la función para reiniciar el juego cuando muere la serpiente
function dieSnake() {
    console.log('La serpiente murió!');
    reset();
}

//la función de añadir una parte más a la cola de la serpiente
function createTail() {
    console.log('colisión con la comida');

    //actializamos la cuenta actual y la mejor
    numberScore++;
    if (numberScore > bestNumberScore) {
        bestNumberScore = numberScore;
        localStorage.setItem('bestNumberScore', bestNumberScore);
        bestTextScore.text('Best Score: ' + bestNumberScore);
    }
    textScore.text('Score: ' + numberScore);

    //llamamos a función para crear una nueva comida
    createRandomFood();

    //en éste bloque añadimos la cola al final de la serpiente
    let xSizeDiff, ySizeDiff;

    xDif < 0 ? xSizeDiff = pxMove : xDif > 0 ? xSizeDiff = -pxMove : xSizeDiff = 0;
    yDif < 0 ? ySizeDiff = pxMove : yDif > 0 ? ySizeDiff = -pxMove : ySizeDiff = 0;

    var cola = tailPart.clone().show()
        .center(set.last().cx() + xSizeDiff, set.last().cy() + ySizeDiff);
    //aquí escribimos dentro del objeto parte de cola variables del objeto
    //anterior (cabeza u otro parte de la cola) del nuestro set, para que
    //luego ésta parte se mueva a su posición
    cola.attr({ 'cxPadre': set.last().cx(), 'cyPadre': set.last().cy() });
    set.add(cola);

    //subimos la velocidad del juego
		if (speedAnimation > 100) speedAnimation--;
}

//la función de conducíon de la serpiente
SVG.on(document, 'keydown', function(e) {
    e.preventDefault();
    if (yAxis) {
        switch (e.keyCode) {
            case 37:
                xDif = -pxMove;
                yDif = 0;
                yAxis = false;
                xAxis = true;
                break;
            case 39:
                xDif = pxMove;
                yDif = 0;
                yAxis = false;
                xAxis = true;
                break;
        }
    } else if (xAxis) {
        switch (e.keyCode) {
            case 38:
                xDif = 0
                yDif = -pxMove;
                yAxis = true;
                xAxis = false;
                break;
            case 40:
                xDif = 0;
                yDif = pxMove;
                yAxis = true;
                xAxis = false;
                break;
        }
    }
})

//reiniciar el turno
function reset() {
    xSnakePosition = 300;
    ySnakePosition = 250;
    numberScore = 0;
    xAxis = false;
    yAxis = true;
    xDif = 0;
    yDif = -pxMove;
    speedAnimation = 150;

    textScore.text('Score: ' + numberScore);
    headSnake.center(xSnakePosition, ySnakePosition);

    //ocultamos todas las partes de la serpiente que están en el set
    //excepto la primera (la cabeza) para no crearla de nuevo
    set.each(function(i) {
        if (i != 0) {
            this.hide();
        }
    })

    //limpiamos el set y luego añadimos de nuevo la cabeza
    set.clear();
    set.add(headSnake);

    //creamos una nueva comida
    createRandomFood();
}

//la funcion que actualiza los objetos - dibuja
//y hace comprobación de colisiones
function update() {
    //obtener la posición actual de la cabeza de la serpiente
    var cx = headSnake.cx(),
        cy = headSnake.cy();

    //comprobar que no hay colisiones con las paredas
    if ((cx <= sizeHeadSnake / 2) || (cx >= widthGame - sizeHeadSnake / 2) || (cy <= sizeHeadSnake / 2) || (cy >= heightGame - sizeHeadSnake / 2)) {
        console.log('colisión con una pared');
        dieSnake();
    }
    //comprobar que la serpiente coma la comida
    //usamos las reglas de "Triángulo rectángulo": c^2 = a^2 + b^2, c - la distancia entre los centres (serpiente y comida)
    if (Math.sqrt(Math.pow((cx - xFoodPosition), 2) + Math.pow((cy - yFoodPosition), 2)) <= (sizeHeadSnake + sizeFood) / 2) {
        createTail();
    }
    //comprobar que no hay colisiones con su cola

/*parece que todavía no funciona correcto*/
/*parece que todavía no funciona correcto*/
/*parece que todavía no funciona correcto*/

    let xDifference, yDifference;
    set.each(function(i) {
            if (i > 3) {
                xDifference = Math.abs(cx - this.cx());
                yDifference = Math.abs(cy - this.cy());
                if (xDifference >= 0 && xDifference < sizeTailSnake && yDifference >= 0 && yDifference < sizeTailSnake) {
                    console.log('colisión con su cola');
                    dieSnake();
                }

            }
        });

        //mover la serpiente
    headSnake.dmove(xDif, yDif);
    set.each(function(i) {
        if (i != 0) {
            this.center(this.attr('cxPadre'), this.attr('cyPadre'));
            this.attr({ 'cxPadre': set.get(i - 1).cx(), 'cyPadre': set.get(i - 1).cy() });
        }
    })
}

/*
//AQUÍ LANZAMOS EL JUEGO
*/
createRandomFood();
setInterval("update()", speedAnimation);
