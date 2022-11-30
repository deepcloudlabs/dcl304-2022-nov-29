function fun(x = 1, y = 2, z = 3) {
    if (arguments.length !== 3)
        throw "You must provide three integers!";
    return x * y + z;
}

fun()
fun(3)
fun(3, 2)
fun(3, 2, 1)
fun(3, 2, 1, 4, 5, 6, 7, 8, 9)

// 1. async function
function generate(max, size) {
    let numbers = [];
    while (numbers.length < size) {
        let candidate = Math.floor(max * Math.random()) + 1;
        if (numbers.includes(candidate)) continue;
        numbers.push(candidate)

    }
    numbers.sort((x, y) => x - y);
    return numbers;
}

lotteryNumbers = generate(60, 6)
console.log(lotteryNumbers)

function asyncGenerate(max, size) {
    return new Promise((resolve, reject) => {
        let numbers = [];
        while (numbers.length < size) {
            let candidate = Math.floor(max * Math.random()) + 1;
            if (numbers.includes(candidate)) continue;
            numbers.push(candidate)
        }
        numbers.sort((x, y) => x - y);
        setTimeout(()=>{
            resolve(numbers);
        }, 5000)
    });
}

asyncGenerate(60,6).then( nums => console.log(nums));

async function asyncGenerate2(max, size) {
    let numbers = [];
    while (numbers.length < size) {
        let candidate = Math.floor(max * Math.random()) + 1;
        if (numbers.includes(candidate)) continue;
        numbers.push(candidate)
    }
    numbers.sort((x, y) => x - y);
    return numbers;
}
asyncGenerate2(60,6).then( nums => console.log(nums));

async function gun(){
    let   lotteryNums = await asyncGenerate(60,6);

}
// 2. generator function
