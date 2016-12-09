class MainList extends React.Component {
    constructor() {
        super();
        this.data = {
            faculty: [
                {
                    'text': 'WEEIA',
                    'id': 'weeia',
                    'places':[
                        {
                            "name": "I...I...S...",
                            "short": "IIS",
                            "longitude": 51.747791,
                            "latitude": 19.451922   ,
                        }
                    ]
                }
            ],
            lang: [
                {
                    'id': 'pl',
                    'name': 'Polski'
                }, {
                    'id': 'en',
                    'name': 'English'
                }
            ]
        };

        this.state = {
            lang: 'pl'
        };

        this.update = this
            .update
            .bind(this);

        this.languageUpdate = this
            .languageUpdate
            .bind(this);

    }

    update(e) {
        this.setState({id: e.target.id});
        console.log("Ustawiam nowy marker " + e.target.id)
    }

    languageUpdate(e) {
        this.setState({lang: e.target.id});
    }

    render() {
        return (
            <div>
                <Language update={this.languageUpdate} data={this.data.lang}/>
                <GroupsList lang={this.state.lang} update={this.update} data={this.data.faculty}/>
            </div>
        );
    }
}

class Language extends React.Component {

    renderLanguages() {
        return this
            .props
            .data
            .map((e) => {
                return (
                    <button id={e.id} key={e.id} onClick={this.props.update}>
                        {e.name}
                    </button>
                );
            })
    }
    render() {
        return (
            <div>
                <p>
                    Język / Language:
                </p>

                {this.renderLanguages()}
            </div>
        );
    }
}

class GroupsList extends React.Component {
    renderNavElements() {
        return this
            .props
            .data
            .map((e) => {
                return (<GroupElement data={e} key={e.id} lang={this.props.lang} update={this.props.update}/>);
            });
    }

    render() {
        return (
            <nav>
                <ul>
                    {this.renderNavElements()}
                </ul>
            </nav>
        );
    }
}


class GroupElement extends React.Component {
    render() {
        return (
            <li>
                <button onClick={this.props.update} id={this.props.data.id}>
                    {(this.props.lang==='pl') ? this.props.data.text : this.props.data.id}
                </button>
                <PlacesList data={this.props.data.places} key={this.props.data.id} lang={this.props.lang} update={this.props.update}/>
            </li>
        )
    }
}



class PlacesList extends React.Component {
    update(e) {
        this.setState({id: e.target.id});
        console.log("Ustawiam nowy marker " + e.target.id)
    }
    renderNavElements() {
         return this.props.data
             .map((e) => {
                 return (<PlaceElement data={e} key={e.id} lang={this.props.lang} update={this.props.update}/>);
             });
    }

    render() {
        return (
            <nav>
                <ul>
                    {this.renderNavElements()}
                </ul>
            </nav>
        );
    }
}


class PlaceElement extends React.Component {
    constructor(){
        super();
        this.update = this
            .updateBtn
            .bind(this);

    }
    updateBtn(e) {
        this.setState({id: e.target.id});
        var a = e.target.value.split(" ");
        console.log(e.target.value.split(" "));
        console.log(a[0] + " " + a[1]);
        updateMarker(parseFloat(a[0]),parseFloat(a[1]));
    }

    render() {
        return (
            <li>
                <button onClick={this.update} key={this.props.data.id} id={this.props.data.id} name={this.props.data.name}
                        value={this.props.data.longitude + " " + this.props.data.latitude}>
                    {(this.props.lang==='pl') ? this.props.data.name : this.props.data.id}
                </button>
            </li>
        );
    }
}


class Map extends React.Component {
    render() {
        return (
            <p>Map</p>
        );
    }
}


ReactDOM.render((
    <div>
        <MainList/>
        <Map/>
    </div>
), document.getElementById('app'));
