Mapa PL

Class structure:


class Group{
    constructor(name,short){
        this.name = name;
        this.name = short;
        this.places = [];
    }
}

class Place{
    constructor(name, short, longitude, latitude){
        this.name = name;
        this.short = short;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}
