numbers = [4, 8, 15, 16, 23, 42]
numbers = new Array(4, 8, 15, 16, 23, 42)
let numericOrderAsc = (x, y) => x - y
let numericOrderDesc = (x, y) => y - x
numbers.sort(numericOrderAsc)
numbers.sort(numericOrderDesc)
customers = [
    {"id": "1", "fullname": "jack", "birthYear": 1956},
    {"id": "2", "fullname": "kate", "birthYear": 1986},
    {"id": "3", "fullname": "james", "birthYear": 1982},
    {"id": "4", "fullname": "ben", "birthYear": 1954},
]
customers.push({"id": "5", "fullname": "sun", "birthYear": 1988})
customers.sort((c1,c2) => c2.birthYear-c1.birthYear)
customers.sort((c1,c2) => c1.fullname.localeCompare(c2.fullname))
let numOfCust =
customers.filter(c => c.birthYear >= 1980)
         .map(c => 1)
         .reduce((s,v)=>s+v, 0)
console.log(numOfCust)