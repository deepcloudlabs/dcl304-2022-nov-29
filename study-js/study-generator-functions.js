numbers = [4, 8, 15, 16, 23, 42]
let is_even = n => {
    console.log(`is_even(${n})`)
    return n%2 == 0;
}
let to_cube = v => {
    console.log(`to_cube(${v})`)
    return v*v*v;
}
let add = (s,v)=>{
    console.log(`add(${s},${v})`)
    return s+v;
}
let result =
numbers.filter(is_even)
       .map(to_cube)
       .reduce(add, 0)

console.log(result)

function* filter(nums,predicate){
    for (let num of nums) {
        if (predicate(num)) {
            yield num;
        }
    }
}

function* map(nums,mapper){
    for (let num of nums) {
            yield mapper(num);
    }
}

function reduce(nums,reducer,init){
    let acc = init;
    for (let num of nums) {
        acc = reducer(acc,num);
    }
    return acc;
}

reduce(map(filter(numbers,is_even),to_cube),add,0)