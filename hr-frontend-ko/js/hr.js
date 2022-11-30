class Employee {
    constructor(employee) {
        this.identityNo = ko.observable(employee.identityNo || "11111111110");
        this.fullname = ko.observable(employee.fullname || "jack bauer");
        this.salary = ko.observable(employee.salary || 5000);
        this.iban = ko.observable(employee.iban || "TR817267106259257598689458");
        this.fulltime = ko.observable(employee.fulltime || true);
        this.department = ko.observable(employee.department || "SALES");
        this.birthYear = ko.observable(employee.birthYear || 2000);
        this.photo = ko.observable(employee.photo || AppConfig.NO_IMAGE);
    }

    update = (employee) => {
        for (let field in employee) {
            if (this.hasOwnProperty(field)) {
                this[field](employee[field]);
            }
        }
    }
}

class HrViewModel {
    constructor() {
        this.employee = new Employee({});
        this.employees = ko.observableArray([]);
        // observable
        this.fileData = ko.observable({
            dataUrl: ko.observable(AppConfig.NO_IMAGE)
        });
        this.socket = io("http://localhost:4001")
        this.socket.on('connect', () => {
            toastr.success("Connected to the websocket server!");
            this.socket.on('fire', (emp)=>{
                let filteredEmployees = this.employees().filter(e => e.identityNo != emp.identityNo);
                this.employees(filteredEmployees);
                toastr.success(`${emp.fullname} is fired!`);
            });
            this.socket.on('hire', (emp)=>{ // Observer Pattern: observes "hire" events
                this.employees.push(emp);
                toastr.success(`${emp.fullname} is hired!`);
            });

        })
    }

    insertFile(e, data) {
        e.preventDefault();
        var files = e.target.files || e.originalEvent.dataTransfer.files;
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (event) => {
            this.fileData().dataUrl(event.target.result);
        };
    };

    dragover(e) {
        e.preventDefault();
    };

    findEmployeeByIdentity = () => {
        fetch(`${AppConfig.REST_API_BASE_URL}/${this.employee.identityNo()}`)
            .then(res => res.json())
            .then(employee => {
                this.employee.update(employee);
                this.fileData().dataUrl(this.employee.photo());
            })
    }

    hireEmployee = () => {
        this.employee.photo(this.fileData().dataUrl());
        fetch(AppConfig.REST_API_BASE_URL, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(ko.toJS(this.employee))
        }).then(res => res.json()).then(res => console.log(res));
    }
    updateEmployee = () => {

    }
    fireEmployee = () => {

    }
    retrieveAllEmployees = () => {

    }

};