Mapa PL



Class structure:

class Group{
    constructor(name){
        this.name = name;
        this.places = [];
    }
}

class Place{
    constructor(name, short,longitude, latitude){
        this.name = name;
        this.short = short;
        this.longitude = longitude;
        this.latitude= latitude;
    }
}

//dev local files use:

python -m http.server