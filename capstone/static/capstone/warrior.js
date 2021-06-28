

const csrf_token = document.querySelector('#csrf_token').innerHTML;
var warrior_id = document.querySelector('#warrior_id').innerHTML;
const user_team = document.querySelector('#user_team').innerHTML;
const view = document.querySelector('#view').innerHTML;
const is_user_logged = user_team !== "";

// ---------------------------------------------------------------

class WarriorPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            warrior: null,
            view: view
        }
        console.log("Warrior View");
    }

    componentDidMount() {
        this.getWarriorInfo();
    }

    getWarriorInfo() {
        fetch(`/get_warrior/${warrior_id}`)
            .then(response => response.json())
            .then(warrior => {
                this.setState({ warrior: warrior, loaded: true });
            })
    }

    render() {
        const { loaded, warrior, view } = this.state;

        if (!loaded) { return null; }
        
        return (<div className={warrior.team.name == "Red" ? "create-warrior-red" : "create-warrior-blue"}>
            {view == 'warrior' && <WarriorView warrior={warrior} updatePage={this.updatePage}/>}
            {view == 'contributions' && <ContributionsView warrior={warrior} />}
            {view == 'STR' && <Operations warrior={warrior} updatePage={this.updatePage} action='STR'/>}
            {view == 'HEAL' && <Operations warrior={warrior} updatePage={this.updatePage} action='HEAL'/>}
        </div>)
    }

    updatePage = (view) => {
        this.getWarriorInfo();
        this.setState({
            view: view
        })
    }
}

// ---------------------------------------------------------------

class WarriorView extends React.Component {

    render() {

        const warrior = this.props.warrior;
        const user_page = `/user_profile/${warrior.creator.id}`;
        const warrior_contributions_page = `/warrior/${warrior.id}/contributions`;

        return (<div><b>{warrior.name}</b><span style={{ fontSize: "1.5vmax" }}><br />Created by <a href={user_page}>
            <b style={{ color: "#121e8a" }}>{warrior.creator.username}</b></a></span><br />
            <div style={{ fontSize: "2vmax" }}>
            <b>Strength:</b> {warrior.strength} <div className={'empty-bar'}><div className={'str-bar'} style={{ width: warrior.strength + '%' }} /></div>
            {
                is_user_logged && <span>{user_team === warrior.team.name &&
                    <span className={'upgrade'} onClick={() => this.props.updatePage('STR')}>{'\xa0 \xa0'}<img src="/static/capstone/images/upgrade_arrow.png" alt="Upgrade strength" className={'upgrade-image'} /> <b>UPGRADE</b></span>}</span>
            }
            <br/>
            <b>HP:</b> { warrior.hp } <div className={'empty-bar'}><div className={'hp-bar'} style={{ width: warrior.hp + '%' }} /></div>
            {
            warrior.hp < 100 &&
                <span>{is_user_logged && <span>{user_team === warrior.team.name &&
                    <span className={'upgrade'} onClick={() => this.props.updatePage('HEAL')}>{'\xa0 \xa0'}<img src="/static/capstone/images/heal.png" alt="Heal" className={'upgrade-image'} /> <b>HEAL</b> </span>}</span>}</span>
            } <br />
            <b>Age:</b> { warrior.age } <div className={'empty-bar'}><div className={'age-bar'} style={{ width: warrior.age + '%' }} /></div><br /><br />
                </div>
                <button onClick={() => location.replace(warrior_contributions_page)} className={warrior.team.name == "Red" ? "create-warrior-button-red" : "create-warrior-button-blue"}>SEE CONTRIBUTIONS</button>
            </div>)
    }
}

// ---------------------------------------------------------------

class ContributionsView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            contributions: [],
            loaded: false
        }
    }

    componentDidMount() {
        fetch(`/get_contributions/warrior/${this.props.warrior.id}`)
            .then(response => response.json())
            .then(contributions => {
                const array_action = this.groupBy(contributions, 'action');
                var grouped_array = [];
                array_action.map((action_array) => {
                    var obj = this.groupBy(action_array, 'contributor_id')
                    grouped_array.push(obj);
                    
                })
                var contrib_array = [];
                grouped_array.map(action => {
                    action.map(user_action => {
                        contrib_array.push({ length: user_action.length, user_name: user_action[0].contributor.username, action: user_action[0].action, user_id: user_action[0].contributor.id })
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

        console.log(contributions);
        const warrior = this.props.warrior;
        const warrior_page = `/warrior/${warrior.id}`;
        const user_page = `/user_profile/${warrior.creator.id}`;

        return (<div>
            <a href={warrior_page} style={{ color: "#121e8a" }}><b>{warrior.name}</b></a>: Contributions <br />
            <div style={{ fontSize: "2vmax" }}>
                <b>Created</b> by
                        {warrior.creator == undefined && <em><b> Removed user</b></em>}
                <a href={user_page}><b style={{ color: "#121e8a" }}> {warrior.creator.username}</b></a><br /><br />
                {contributions.map((contribution, idx) => {
                    return (<span key={idx}>{contribution.action === "STR" &&
                        <span><b>+{contribution.length} strength</b> added by
                        {contribution.user_id == undefined && <em><b> Removed user</b></em>}
                        <a href={'/user_profile/'.concat(contribution.user_id)} style={{ color: "#121e8a" }}><b> {contribution.user_name}</b></a>
                        </span>}
                        {contribution.action === "HEAL" &&
                            <span><b>+{contribution.length} HP</b> restored by
                            {contribution.user_id == undefined && <em><b> Removed user</b></em>}
                            <a href={'/user_profile/'.concat(contribution.user_id)} style={{ color: "#121e8a" }}><b> {contribution.user_name}</b></a>
                            </span>}<br />
                    </span>)
                    })
                }

            </div>
        </div>)
    }
}

// ---------------------------------------------------------------

class Operations extends React.Component {
    constructor(props) {
        super(props);
        const rnd1 = Math.ceil(Math.random() * 10);
        const rnd2 = Math.ceil(Math.random() * 10);
        this.state = {
            num1: rnd1,
            num2: rnd2,
            result: rnd1 + rnd2,
            passed: false,
            errors: false,
            aux_counter: 0
        }
    }

    render() {
        const warrior = this.props.warrior;
        const warrior_str = warrior.strength + this.state.aux_counter;
        const warrior_hp = warrior.hp + this.state.aux_counter;
        const warrior_page = `/warrior/${warrior.id}`;
        return (<div>
            <div style={{ fontSize: "2vmax" }}>
            {this.props.action == 'STR' && <div><b>Strengthen the warrior!</b><br /><br />
                <b>Strength:</b> {warrior_str} <div className={'empty-bar'}><div className={'str-bar'} style={{ width: warrior_str + '%' }} /></div><br /><br /></div>}
            {this.props.action == 'HEAL' && <div><b>Heal the warrior!</b><br /><br />
                <b>HP:</b> {warrior_hp} <div className={'empty-bar'}><div className={'hp-bar'} style={{ width: warrior_hp + '%' }} /></div><br /><br /></div>}
            <div className={"operations"}><b>{this.state.num1 + " + " + this.state.num2 + " = "}</b>
                <input className={"result-field"} type="number" id="sum" name="sum" min="1" max="20" onChange={evt => this.updateResultPass(evt)} onKeyDown={this.handleKeyDown}/><br /><br /></div>
            <button onClick={() => this.checkAndAdvance()} className={warrior.team.name == 'Red' ? "create-warrior-button-red" : "create-warrior-button-blue"} style={{ lineHeight: "4vw" }}>
                {this.props.action == 'STR' && <span>Strengthen!</span>}
                {this.props.action == 'HEAL' && <span>Heal!</span>}
            </button><br /><br />
            {this.state.errors && <div className={"errors"}>Wrong result! Try again!</div>}
            <button onClick={() => this.props.updatePage('warrior')} className={warrior.team.name == 'Red' ? "create-warrior-button-red" : "create-warrior-button-blue"} style={{ lineHeight: "4vw" }}>Back to Warrior page</button><br /><br />
                </div>
            </div>)
    }

    updateResultPass(evt) {
        this.state.passed = evt.target.value == this.state.result;
    }

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.checkAndAdvance()
        }
    }

    checkAndAdvance() {
        document.querySelector('#sum').value = '';
        if (this.state.passed == false) {
            this.setState({ errors: true })
        } else {
            fetch(`/add_contribution`, {
                method: 'POST',
                body: JSON.stringify({
                    warrior_id: this.props.warrior.id,
                    action: this.props.action
                }),
                headers: {
                    "X-CSRFToken": csrf_token,
                }
            })
            .then(response => {

                const rnd1 = Math.ceil(Math.random() * 10);
                const rnd2 = Math.ceil(Math.random() * 10);
                this.setState({
                    num1: rnd1,
                    num2: rnd2,
                    result: rnd1 + rnd2,
                    passed: false,
                    errors: false,
                    aux_counter: this.state.aux_counter + 1
                })
            })
        }
    }
}

ReactDOM.render(<WarriorPage />, document.getElementById('warrior'))

