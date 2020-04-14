function AppViewModel() {
    let self = this;
    self.darova = ko.observable("Darova");
}

ko.applyBindings(new AppViewModel());