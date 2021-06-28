
// GLOBALS
const page = document.querySelector('#page').innerHTML;
const csrf_token = document.querySelector('#csrf_token').innerHTML;
const user_team = document.querySelector('#user_team').innerHTML;
const user_name = document.querySelector('#user_name').innerHTML;
const user_id = document.querySelector('#user_id').innerHTML;
const is_user_logged = user_team !== "";
var view = null;
if (page == 'profile') {
    view = document.querySelector('#view').innerHTML;
}

// COMPONENTS
// ---------------------------------------------------------------

class App extends React.Component {

    constructor(props) {
        super(props);
        console.log(is_user_logged);
    }

    render() {
        return <div>
            <MainPage />
        </div>
    }
}

// ---------------------------------------------------------------

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warriors_red: [],
            warriors_blue: [],
            loaded_red: false,
            loaded_blue: false
        }
    }

    componentDidMount() {
        fetch('warriors/Red')
            .then(response => response.json())
            .then(warriors => {
                console.log("RED WARRIORS: ", warriors);
                this.setState({ warriors_red: warriors, loaded_red: true });
            })

        fetch('warriors/Blue')
            .then(response => response.json())
            .then(warriors => {
                console.log("BLUE WARRIORS: ", warriors);
                this.setState({ warriors_blue: warriors, loaded_blue: true });
            })
    }

    render() {
        const { warriors_red, warriors_blue, loaded_red, loaded_blue } = this.state;

        if (!loaded_red || !loaded_blue) {
            return null;
        }

        return (<div className={'col-container'}>
            <div className={'war-bg-left'}>
                BLUE TEAM<br />
                <BattleInfo team='Blue' />
                <div className={'warriors-info'}>
                    <b>Warriors:</b><br />
                    {warriors_blue.map(warrior => <WarriorListView warrior={warrior} key={warrior.id} />)}
                </div>
                {is_user_logged && <div>{user_team == 'Blue' &&
                    <CreateWarriorButton className='create-warrior-button-blue' />}</div>}
            </div>
            <div className={'war-bg-right'}>
                RED TEAM<br />
                <BattleInfo team='Red' />
                <div className={'warriors-info'}>
                    <b>Warriors:</b><br />
                    {warriors_red.map(warrior => <WarriorListView warrior={warrior} key={warrior.id} />)}
                </div>
                {is_user_logged && <div>{user_team == 'Red' &&
                    <CreateWarriorButton className='create-warrior-button-red' />}</div>}
            </div>
        </div>);
    }
}

// ---------------------------------------------------------------

class BattleInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wins: null,
            last_battle_won: null
        }
    }

    componentDidMount() {
        fetch(`/get_battles`)
            .then(response => response.json())
            .then(battles => {
                if (battles.length == 0) { return null; }
                var won_battles = battles.filter(battle => battle['winner'].name == this.props.team).length
                this.setState({
                    wins: won_battles,
                    last_battle_won: (battles[0].winner.name == this.props.team)
                })
            })
    }

    render() {
        return (<div>
            <div className={'battle-info'}>Wins: <b>
                {this.state.wins == undefined && 0}
                {this.state.wins}</b><br />
                Last battle: <b>
                    {this.state.wins == undefined && '---'}
                    {this.state.wins != undefined && <div>{this.state.last_battle_won ? "WIN" : "LOSE"}</div>}</b></div>
            {user_team == this.props.team &&
                <button className={this.props.team == 'Red' ? "create-warrior-button-red" : "create-warrior-button-blue"} onClick={() => this.simulateBattle()}>Battle</button>
                }
            </div>)
    }

    simulateBattle() {
        fetch(`/get_battles`, {
            method: 'POST',
            headers: {
                "X-CSRFToken": csrf_token,
            }
        })
        .then(response => {
            if (response.status != 404) {
                location.replace('/')
            } else {
                console.log('MUST BE LOGGED OR INSUFICIENT WARRIORS');
            }
        })
    }
}

// ---------------------------------------------------------------

class WarriorListView extends React.Component {
    render() {
        return <div className={'warrior-in-list'} onClick={ () => location.replace(`/warrior/${this.props.warrior.id}`) }>
            <span className={'warrior-name'}><b>Name:</b><br/> {this.props.warrior.name}</span>
            <span className={'warrior-stats'}>
                <b>Strength:</b> {this.props.warrior.strength} <div className={'empty-bar'}><div className={'str-bar'} style={{ width: this.props.warrior.strength + '%'}} /></div> <br />
                <b>HP:</b> {this.props.warrior.hp} <div className={'empty-bar'}><div className={'hp-bar'} style={{ width: this.props.warrior.hp + '%'}} /></div><br />
                <b>Age:</b> {this.props.warrior.age} <div className={'empty-bar'}><div className={'age-bar'} style={{ width: this.props.warrior.age + '%' }} /></div><br />
            </span>
        </div>
    }
}

// ---------------------------------------------------------------

class CreateWarriorButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<button className={this.props.className} onClick={() => { this.goToCreateWarriorPage() }}>
            Create Warrior
        </button>);
    }

    goToCreateWarriorPage = () => {
        window.location.replace('create_warrior_page');
    }
}

// ---------------------------------------------------------------

class CreateWarriorPage extends React.Component {
    render() {
        return (<button className={this.props.className}>
            Create Warrior
        </button>);
    }
}

// ---------------------------------------------------------------

class UserWarriorsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            user_warriors: []
        }
    }

    componentDidMount() {
        fetch(`/user_warriors/${user_id}`)
            .then(response => response.json())
            .then(warriors => {
                this.setState({ user_warriors: warriors, loaded: true });
            })
    }

    render() {
        const { loaded, user_warriors } = this.state;
        if (!loaded) { return null; }

        const contrib_page = `/user/${user_id}/contributions`;
        return (<div className={user_team == "Red" ? "create-warrior-red" : "create-warrior-blue"}>
            <button className={user_team == "Red" ? "create-warrior-button-red" : "create-warrior-button-blue"} onClick={() => location.replace(contrib_page)}>
                SEE CONTRIBUTIONS</button><br />
            <b>{user_name}'s Warriors:</b><br />
            {user_warriors.length > 0 && user_warriors.map(warrior => <WarriorListView warrior={warrior} key={warrior.id} />)}
        </div>)
    }
}

class UserContributionsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contributions: [],
            loaded: false
        }
    }

    componentDidMount() {
        fetch(`/get_contributions/user/${user_id}`)
            .then(response => response.json())
            .then(contributions => {
                const array_action = this.groupBy(contributions, 'action');
                var grouped_array = [];
                array_action.map((action_array) => {
                    var obj = this.groupBy(action_array, 'warrior_id')
                    grouped_array.push(obj);

                })
                console.log(grouped_array);
                var contrib_array = [];
                grouped_array.map(action => {
                    action.map(user_action => {
                        contrib_array.push({ length: user_action.length, warrior_name: user_action[0].warrior.name, action: user_action[0].action, warrior_id: user_action[0].warrior.id })
                    })
                })
                console.log(contrib_array);
                this.setState({
                    contributions: contrib_array,
                    loaded: true
                })
            })
    }

    groupBy(arr, prop) {
        const map = new Map(Array.from(arr, obj => [obj[prop], []]));
        arr.forEach(obj => map.get(obj[prop]).push(obj));
        return Array.from(map.values());
    }

    render() {
        const { contributions, loaded } = this.state;
        if (!loaded) { return null; }

        const warriors_page = `/user_profile/${user_id}`;
        console.log(contributions);
        return (<div className={user_team == "Red" ? "create-warrior-red" : "create-warrior-blue"}>
            <button className={user_team == "Red" ? "create-warrior-button-red" : "create-warrior-button-blue"} onClick={() => location.replace(warriors_page)}>
                SEE WARRIOR STATS</button><br />
            <b>{user_name}'s Contributions:</b><br />
            <div style={{ fontSize: "2vmax" }}><br />
                {contributions.map((contribution, idx) => {
                    return (<span key={idx}>{contribution.action === "STR" &&
                        <span><b>+{contribution.length} strength</b> added to
                        {contribution.warrior_id == undefined && <em><b> Dead warrior</b></em>}
                        <a href={'/warrior/'.concat(contribution.warrior_id)} style={{ color: "#121e8a" }}><b> {contribution.warrior_name}</b></a>
                        </span>}
                        {contribution.action === "HEAL" &&
                            <span><b>+{contribution.length} HP</b> restored by <a href={'/warrior/'.concat(contribution.warrior_id)} style={{ color: "#121e8a" }}><b>{contribution.warrior_name}</b></a>
                            </span>}<br />
                    </span>)
                })
                }

            </div>
        </div>)
    }
}



if (page == 'profile') {
    if (view == 'warrior') {
        ReactDOM.render(<UserWarriorsPage />, document.getElementById('userWarriors'))
    }
    else {
        ReactDOM.render(<UserContributionsPage />, document.getElementById('userWarriors'))
    }
} else {
    ReactDOM.render(<App />, document.getElementById('app'))
}